"""
Service layer for workorder business logic.
Handles validation and orchestrates repository calls.
"""
from datetime import datetime
from repositories.workorder_repository import WorkorderRepository
import psycopg2


class WorkorderService:
    """Service for workorder business logic."""
    
    @staticmethod
    def parse_bool(val, default=False):
        """Parse a value to boolean."""
        if val is None:
            return default
        if isinstance(val, bool):
            return val
        s = str(val).strip().lower()
        return s in ("1", "true", "t", "yes", "y")
    
    @staticmethod
    def parse_date(val):
        """
        Parse YYYY-MM-DD date string into a Python date object.
        
        Args:
            val (str): Date string in YYYY-MM-DD format
            
        Returns:
            date: Parsed date object
            
        Raises:
            ValueError: If date format is invalid
        """
        if not val:
            raise ValueError("scheduledDate is required (YYYY-MM-DD)")
        try:
            return datetime.strptime(val, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("scheduledDate must be in 'YYYY-MM-DD' format")
    
    @staticmethod
    def create_workorder(data):
        """
        Create a new workorder with validation.
        
        Args:
            data (dict): Workorder data containing:
                - workorderId (int): Unique ID
                - requestId (int): Service request FK
                - customerId (int): Customer FK
                - scheduledDate (str): Date in YYYY-MM-DD format
                - isCompleted (bool): Completion status
                
        Returns:
            tuple: (success_dict, status_code) or (error_dict, status_code)
        """
        # Extract fields (support both camelCase and snake_case)
        workorder_id = data.get("workorderId", data.get("workorder_id"))
        request_id   = data.get("requestId", data.get("request_id"))
        customer_id  = data.get("customerId", data.get("customer_id"))
        scheduled_in = data.get("scheduledDate", data.get("scheduled_date"))
        is_completed = data.get("isCompleted", data.get("is_completed"))
        
        # Validate required fields
        missing = [k for k, v in {
            "workorderId": workorder_id,
            "requestId": request_id,
            "customerId": customer_id,
            "scheduledDate": scheduled_in,
            "isCompleted": is_completed
        }.items() if v is None]
        
        if missing:
            return {
                "ok": False,
                "error": f"Missing required fields: {', '.join(missing)}"
            }, 400
        
        # Validate types
        try:
            workorder_id = int(workorder_id)
            request_id   = int(request_id)
            customer_id  = int(customer_id)
        except ValueError:
            return {
                "ok": False,
                "error": "workorderId, requestId, and customerId must be integers"
            }, 400
        
        # Parse date
        try:
            scheduled_date = WorkorderService.parse_date(scheduled_in)
        except ValueError as ve:
            return {"ok": False, "error": str(ve)}, 400
        
        # Parse boolean
        is_completed = WorkorderService.parse_bool(is_completed, default=False)
        
        # Create in database
        try:
            new_id = WorkorderRepository.create(
                workorder_id, request_id, customer_id, scheduled_date, is_completed
            )
            return {
                "ok": True,
                "message": "Work order created",
                "workorderId": new_id
            }, 201
        except psycopg2.errors.UniqueViolation:
            return {"ok": False, "error": "workorderId already exists"}, 409
        except psycopg2.errors.ForeignKeyViolation:
            return {"ok": False, "error": "Invalid requestId or customerId (FK violation)"}, 400
        except psycopg2.Error as e:
            return {"ok": False, "error": f"Database error: {e.pgerror or str(e)}"}, 500
    
    @staticmethod
    def list_workorders(limit=100):
        """
        List all workorders.
        
        Args:
            limit (int): Maximum number of records to return
            
        Returns:
            tuple: (response_dict, status_code)
        """
        try:
            rows = WorkorderRepository.list_all(limit=limit)
            return {
                "ok": True,
                "count": len(rows),
                "workorders": rows
            }, 200
        except Exception as e:
            return {"ok": False, "error": str(e)}, 500
    
    @staticmethod
    def get_workorder(workorder_id):
        """
        Get a single workorder by ID.
        
        Args:
            workorder_id (int): The workorder ID
            
        Returns:
            tuple: (response_dict, status_code)
        """
        try:
            workorder = WorkorderRepository.get_by_id(workorder_id)
            if workorder:
                return {"ok": True, "workorder": workorder}, 200
            else:
                return {"ok": False, "error": "Workorder not found"}, 404
        except Exception as e:
            return {"ok": False, "error": str(e)}, 500
