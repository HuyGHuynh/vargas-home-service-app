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
        Create a new service request with all related data.
        Uses existing customer if email exists, otherwise creates new customer.
        Creates address, service request with optimized single query.
        
        Args:
            customer_data (dict): Customer info with keys: firstname, lastname, phone, email
            address_data (dict): Address info with keys: address, city, state, zip_code
            service_data (dict): Service info with keys: service_id (references existing service)
            request_data (dict): Service request info with keys: description, preferred_datetime
            workorder_data (dict): Not used in this implementation (for future workorder creation)
            
        Returns:
            dict: Dictionary with created IDs {request_id, customer_id, address_id, service_id}
            
        Raises:
            psycopg2.Error: For any database errors during the transaction
        """
        conn = BaseRepository.get_db_connection()
        try:
            with conn:
                with conn.cursor() as cur:
                    # Execute the optimized query that handles existing customers
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
                                 %s,              -- service_id from services table
                                 %s,              -- job description from form
                                 %s::timestamptz -- preferred date+time picked by user
                          FROM cust c
                          CROSS JOIN addr a
                          RETURNING requestid
                        )
                        SELECT requestid FROM req;
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
                    
                    request_id = cur.fetchone()[0]
                    # Get the customer_id and address_id for the response
                    # We'll need to fetch these since the query only returns request_id
                    cur.execute("""
                        SELECT sr.customerid, sr.addressid, sr.service_id
                        FROM public.servicerequests sr
                        WHERE sr.requestid = %s
                    """, (request_id,))
                    
                    result = cur.fetchone()
                    customer_id, address_id, service_id = result
                    
                    return {
                        'request_id': request_id,
                        'customer_id': customer_id,
                        'address_id': address_id,
                        'service_id': service_id
                    }
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
