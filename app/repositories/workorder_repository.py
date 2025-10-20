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
