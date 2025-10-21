"""
Repository for workorder data access.
Handles all database operations for workorders using raw SQL.
"""
import psycopg2
from datetime import datetime, date
from .base_repository import BaseRepository


class WorkorderRepository(BaseRepository):
    """Repository for workorder-related database operations."""
    
    @staticmethod
    def create(workorder_id, request_id, customer_id, scheduled_date, is_completed):
        """
        Create a new workorder record.
        
        Args:
            workorder_id (int): Unique workorder ID
            request_id (int): Foreign key to service request
            customer_id (int): Foreign key to customer
            scheduled_date (date): Scheduled date for the workorder
            is_completed (bool): Completion status
            
        Returns:
            int: The created workorder ID
            
        Raises:
            psycopg2.errors.UniqueViolation: If workorder_id already exists
            psycopg2.errors.ForeignKeyViolation: If request_id or customer_id is invalid
        """
        with BaseRepository.get_cursor() as cur:
            cur.execute("""
                INSERT INTO workorders (workorderid, requestid, customerid, scheduleddate, iscompleted)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING workorderid;
            """, (workorder_id, request_id, customer_id, scheduled_date, is_completed))
            new_id = cur.fetchone()[0]
            return new_id
    
    @staticmethod
    def create_with_expanded_data(customer_data, address_data, service_data, request_data, workorder_data):
        """
        Create a new service request with all related data and auto-assign technician.
        Uses existing customer if email exists, otherwise creates new customer.
        Creates address, service request and automatically assigns technician if available.
        
        Args:
            customer_data (dict): Customer info with keys: firstname, lastname, phone, email
            address_data (dict): Address info with keys: address, city, state, zip_code
            service_data (dict): Service info with keys: service_id (references existing service)
            request_data (dict): Service request info with keys: description, preferred_datetime
            workorder_data (dict): Not used in this implementation (for future workorder creation)
            
        Returns:
            dict: Dictionary with created IDs and technician info {request_id, customer_id, address_id, service_id, technician}
            
        Raises:
            psycopg2.Error: For any database errors during the transaction
        """
        conn = BaseRepository.get_db_connection()
        try:
            with conn:
                with conn.cursor() as cur:
                    # Execute the enhanced query with technician auto-assignment and fallback logic
                    cur.execute("""
                        WITH existing_c AS (
                          SELECT c.customerid
                          FROM public.customer c
                          WHERE c.email = %s
                          LIMIT 1
                        ),
                        ins_c AS (
                          INSERT INTO public.customer (firstname, lastname, phone, email)
                          SELECT %s, %s, %s, %s
                          WHERE NOT EXISTS (SELECT 1 FROM existing_c)
                          RETURNING customerid
                        ),
                        cust AS (
                          SELECT customerid FROM ins_c
                          UNION ALL
                          SELECT customerid FROM existing_c
                          LIMIT 1
                        ),
                        addr AS (
                          INSERT INTO public.addressbook (customer_id, address, city, state, zip_code)
                          SELECT customerid, %s, %s, %s, %s
                          FROM cust
                          RETURNING address_id
                        ),
                        req AS (
                          INSERT INTO public.servicerequests
                            (customerid, addressid, service_id, description, preferred_datetime)
                          SELECT c.customerid,
                                 a.address_id,
                                 %s,   -- service_id
                                 %s,   -- description
                                 %s    -- preferred_datetime
                          FROM cust c
                          CROSS JOIN addr a
                          RETURNING requestid, customerid, addressid, service_id, preferred_datetime
                        ),
                        -- lấy assignment mới nhất (nếu đã có) cho request vừa tạo
                        latest_assign AS (
                          SELECT DISTINCT ON (wa.requestid)
                                 wa.requestid, wa.employeeid
                          FROM work_assignments wa
                          JOIN req r ON r.requestid = wa.requestid
                          ORDER BY wa.requestid, wa.assignment_id DESC
                        ),
                        
                        -- Fallback chọn 1 nhân viên nếu chưa được assign
                        -- Đếm số job của mỗi nhân viên trong CÙNG NGÀY với preferred_datetime của request mới
                        fallback_candidates AS (
                          SELECT
                            e.employeeid, e.firstname, e.lastname, e.phone, e.email,
                            r.requestid, r.preferred_datetime,
                            COALESCE(
                              COUNT(*) FILTER (
                                WHERE date_trunc('day', sr.preferred_datetime) = date_trunc('day', r.preferred_datetime)
                              ), 0
                            ) AS same_day_jobs
                          FROM employee e
                          -- tham chiếu toàn bộ assignment hiện có để đếm việc theo ngày
                          LEFT JOIN work_assignments wa ON wa.employeeid = e.employeeid
                          LEFT JOIN servicerequests sr ON sr.requestid = wa.requestid
                          -- CROSS JOIN req để biết ngày của request mới
                          CROSS JOIN req r
                          GROUP BY e.employeeid, e.firstname, e.lastname, e.phone, e.email, r.requestid, r.preferred_datetime
                        ),
                        -- Chọn 1 người "ít việc nhất trong ngày", nếu hòa thì employeeid nhỏ hơn
                        fallback_pick AS (
                          SELECT fc.requestid, fc.employeeid, fc.firstname, fc.lastname, fc.phone, fc.email
                          FROM fallback_candidates fc
                          ORDER BY fc.same_day_jobs ASC, fc.employeeid ASC
                          LIMIT 1
                        ),
                        -- Hợp nhất: nếu đã có assignment thì dùng nó; nếu chưa thì dùng fallback
                        chosen_emp AS (
                          -- case ĐÃ có assignment
                          SELECT la.requestid, e.employeeid, e.firstname, e.lastname, e.phone, e.email
                          FROM latest_assign la
                          JOIN employee e ON e.employeeid = la.employeeid

                          UNION ALL

                          -- case CHƯA có assignment => dùng fallback_pick
                          SELECT r.requestid, fp.employeeid, fp.firstname, fp.lastname, fp.phone, fp.email
                          FROM req r
                          LEFT JOIN latest_assign la ON la.requestid = r.requestid
                          JOIN fallback_pick fp ON la.requestid IS NULL
                        )
                        
                        SELECT
                          r.requestid,
                          r.customerid,
                          r.addressid,
                          r.service_id,
                          ce.employeeid,
                          ce.firstname,
                          ce.lastname,
                          ce.phone,
                          ce.email
                        FROM req r
                        JOIN chosen_emp ce
                          ON ce.requestid = r.requestid;
                    """, (
                        customer_data['email'],           # %s - email for lookup
                        customer_data['firstname'],       # %s - first_name
                        customer_data['lastname'],        # %s - last_name
                        customer_data['phone'],           # %s - phone
                        customer_data['email'],           # %s - email for insert
                        address_data['address'],          # %s - address
                        address_data['city'],             # %s - city
                        address_data['state'],            # %s - state
                        address_data['zip_code'],         # %s - zip_code
                        service_data['service_id'],       # %s - service_id
                        request_data['description'],      # %s - description
                        request_data['preferred_datetime'], # %s - preferred_datetime
                    ))
                    
                    result = cur.fetchone()
                    if not result:
                        raise ValueError("Failed to create service request")
                    
                    # Debug output for technician assignment
                    if result[4]:  # employeeid exists
                        print(f"DEBUG: Technician auto-assigned - {result[5]} {result[6]} (ID: {result[4]})")
                    else:
                        print("DEBUG: No technician assigned")
                    
                    # Build response with technician info
                    response = {
                        'request_id': result[0],
                        'customer_id': result[1],
                        'address_id': result[2],
                        'service_id': result[3]
                    }
                    
                    # Include technician data if assigned
                    if result[4]:  # employeeid exists
                        response['technician'] = {
                            'employee_id': result[4],
                            'firstname': result[5],
                            'lastname': result[6],
                            'phone': result[7],
                            'email': result[8]
                        }
                    else:
                        response['technician'] = None
                    
                    return response
        finally:
            conn.close()
    
    @staticmethod
    def list_all(limit=100):
        """
        List all workorders ordered by ID descending.
        
        Args:
            limit (int): Maximum number of records to return
            
        Returns:
            list[dict]: List of workorder dictionaries
        """
        with BaseRepository.get_dict_cursor() as cur:
            cur.execute("""
                SELECT workorderid, requestid, customerid, scheduleddate, iscompleted
                FROM workorders
                ORDER BY workorderid DESC
                LIMIT %s;
            """, (limit,))
            rows = cur.fetchall()
            
            # Convert date objects to ISO format strings
            for row in rows:
                if row.get("scheduleddate"):
                    val = row["scheduleddate"]
                    if isinstance(val, (datetime, date)):
                        row["scheduleddate"] = val.isoformat()
            
            return rows
    
    @staticmethod
    def get_by_id(workorder_id):
        """
        Get a workorder by ID.
        
        Args:
            workorder_id (int): The workorder ID
            
        Returns:
            dict or None: Workorder data or None if not found
        """
        with BaseRepository.get_dict_cursor() as cur:
            cur.execute("""
                SELECT workorderid, requestid, customerid, scheduleddate, iscompleted
                FROM workorders
                WHERE workorderid = %s;
            """, (workorder_id,))
            row = cur.fetchone()
            
            if row and row.get("scheduleddate"):
                val = row["scheduleddate"]
                if isinstance(val, (datetime, date)):
                    row["scheduleddate"] = val.isoformat()
            
            return row
    
    @staticmethod
    def update(workorder_id, **kwargs):
        """
        Update a workorder record.
        
        Args:
            workorder_id (int): The workorder ID to update
            **kwargs: Fields to update (requestid, customerid, scheduleddate, iscompleted)
            
        Returns:
            bool: True if updated, False if not found
        """
        allowed_fields = {'requestid', 'customerid', 'scheduleddate', 'iscompleted'}
        updates = {k: v for k, v in kwargs.items() if k in allowed_fields}
        
        if not updates:
            return False
        
        set_clause = ', '.join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values()) + [workorder_id]
        
        with BaseRepository.get_cursor() as cur:
            cur.execute(f"""
                UPDATE workorders
                SET {set_clause}
                WHERE workorderid = %s;
            """, values)
            return cur.rowcount > 0
    
    @staticmethod
    def delete(workorder_id):
        """
        Delete a workorder by ID.
        
        Args:
            workorder_id (int): The workorder ID to delete
            
        Returns:
            bool: True if deleted, False if not found
        """
        with BaseRepository.get_cursor() as cur:
            cur.execute("""
                DELETE FROM workorders
                WHERE workorderid = %s;
            """, (workorder_id,))
            return cur.rowcount > 0
