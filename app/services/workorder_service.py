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
    
    @staticmethod
    def create_workorder_with_expanded_data(data):
        """
        Create a new workorder with all related data (customer, address, service, request).
        
        Args:
            data (dict): Complete workorder data containing:
                Customer info:
                - firstName, lastName, phone, email
                Address info:
                - address, city, state, zipCode
                Service info:
                - serviceId (int): ID of existing service in services table
                Request info:
                - requestDate (str): Date in YYYY-MM-DD format
                Workorder info:
                - scheduledDate (str): Date in YYYY-MM-DD format
                - isCompleted (bool): Completion status
                - workorderId (int, optional): Specific workorder ID
                
        Returns:
            tuple: (success_dict, status_code) or (error_dict, status_code)
        """
        # Validate required customer fields
        customer_fields = ['firstName', 'lastName', 'phone', 'email']
        missing_customer = [f for f in customer_fields if not data.get(f)]
        
        # Validate required address fields  
        address_fields = ['address', 'city', 'state', 'zipCode']
        missing_address = [f for f in address_fields if not data.get(f)]
        
        # Validate required service fields
        service_fields = ['serviceId']
        missing_service = [f for f in service_fields if not data.get(f)]
        
        # Validate required request/workorder fields
        other_fields = ['requestDate', 'scheduledDate', 'isCompleted']
        missing_other = [f for f in other_fields if data.get(f) is None]
        
        missing_all = missing_customer + missing_address + missing_service + missing_other
        if missing_all:
            return {
                "ok": False,
                "error": f"Missing required fields: {', '.join(missing_all)}"
            }, 400
        
        # Parse and validate dates
        try:
            request_date = WorkorderService.parse_date(data['requestDate'])
            scheduled_date = WorkorderService.parse_date(data['scheduledDate'])
        except ValueError as ve:
            return {"ok": False, "error": str(ve)}, 400
        
        # Parse boolean
        is_completed = WorkorderService.parse_bool(data['isCompleted'], default=False)
        
        # Validate serviceId is numeric
        try:
            service_id = int(data['serviceId'])
        except (ValueError, TypeError):
            return {"ok": False, "error": "serviceId must be a valid integer"}, 400
        
        # Prepare data for repository
        customer_data = {
            'firstname': data['firstName'],
            'lastname': data['lastName'],
            'phone': data['phone'],
            'email': data['email']
        }
        
        address_data = {
            'address': data['address'],
            'city': data['city'],
            'state': data['state'],
            'zip_code': data['zipCode']
        }
        
        service_data = {
            'service_id': service_id
        }
        
        request_data = {
            'requestdate': request_date
        }
        
        workorder_data = {
            'scheduleddate': scheduled_date,
            'iscompleted': is_completed
        }
        
        # Add workorderId if provided
        if data.get('workorderId'):
            try:
                workorder_data['workorderid'] = int(data['workorderId'])
            except ValueError:
                return {"ok": False, "error": "workorderId must be an integer"}, 400
        
        # Create all records in database transaction
        try:
            result = WorkorderRepository.create_with_expanded_data(
                customer_data, address_data, service_data, request_data, workorder_data
            )
            return {
                "ok": True,
                "message": "Work order and related data created successfully",
                "result": result
            }, 201
        except psycopg2.errors.UniqueViolation as e:
            return {"ok": False, "error": f"Duplicate entry: {e.pgerror}"}, 409
        except psycopg2.errors.ForeignKeyViolation as e:
            return {"ok": False, "error": f"Foreign key violation: {e.pgerror}"}, 400
        except psycopg2.Error as e:
            return {"ok": False, "error": f"Database error: {e.pgerror or str(e)}"}, 500
        except Exception as e:
            return {"ok": False, "error": f"Unexpected error: {str(e)}"}, 500
