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
        Create a new workorder record with all related data.
        Creates customer, address, service, service request, and workorder in sequence.
        
        Args:
            customer_data (dict): Customer info with keys: firstname, lastname, phone, email
            address_data (dict): Address info with keys: address, city, state, zip_code
            service_data (dict): Service info with keys: service_id (references existing service)
            request_data (dict): Service request info with keys: requestdate
            workorder_data (dict): Workorder info with keys: scheduleddate, iscompleted
            
        Returns:
            dict: Dictionary with created IDs {customer_id, address_id, service_id, request_id, workorder_id}
            
        Raises:
            psycopg2.Error: For any database errors during the transaction
        """
        conn = BaseRepository.get_db_connection()
        try:
            with conn:
                with conn.cursor() as cur:
                    # 1. Create customer (customerid auto-increments)
                    cur.execute("""
                        INSERT INTO public.customer(firstname, lastname, phone, email)
                        VALUES (%s, %s, %s, %s)
                        RETURNING customerid;
                    """, (customer_data['firstname'], customer_data['lastname'], 
                          customer_data['phone'], customer_data['email']))
                    customer_id = cur.fetchone()[0]
                    
                    # 2. Create address (address_id auto-increments)
                    cur.execute("""
                        INSERT INTO public.addressbook(customer_id, address, city, state, zip_code)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING address_id;
                    """, (customer_id, address_data['address'], address_data['city'],
                          address_data['state'], address_data['zip_code']))
                    address_id = cur.fetchone()[0]
                    
                    # 3. Use existing service (service_id from preset data)
                    service_id = service_data['service_id']
                    
                    # 4. Create service request (requestid auto-increments)
                    cur.execute("""
                        INSERT INTO public.servicerequests(customerid, addressid, requestdate, service_id)
                        VALUES (%s, %s, %s, %s)
                        RETURNING requestid;
                    """, (customer_id, address_id, request_data['requestdate'], service_id))
                    request_id = cur.fetchone()[0]
                    
                    # 5. Create workorder (using auto-increment or provided ID)
                    if 'workorderid' in workorder_data and workorder_data['workorderid']:
                        cur.execute("""
                            INSERT INTO workorders (workorderid, requestid, customerid, scheduleddate, iscompleted)
                            VALUES (%s, %s, %s, %s, %s)
                            RETURNING workorderid;
                        """, (workorder_data['workorderid'], request_id, customer_id,
                              workorder_data['scheduleddate'], workorder_data['iscompleted']))
                        workorder_id = cur.fetchone()[0]
                    else:
                        cur.execute("""
                            INSERT INTO workorders (requestid, customerid, scheduleddate, iscompleted)
                            VALUES (%s, %s, %s, %s)
                            RETURNING workorderid;
                        """, (request_id, customer_id, workorder_data['scheduleddate'],
                              workorder_data['iscompleted']))
                        workorder_id = cur.fetchone()[0]
                    
                    return {
                        'customer_id': customer_id,
                        'address_id': address_id,
                        'service_id': service_id,
                        'request_id': request_id,
                        'workorder_id': workorder_id
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
