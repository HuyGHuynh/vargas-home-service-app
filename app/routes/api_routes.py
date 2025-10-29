"""
Utility API routes (health check, database check, etc.).
"""
from flask import Blueprint, request, jsonify, session
from repositories.base_repository import BaseRepository
from repositories.service_repository import ServiceRepository
from repositories.employee_repository import EmployeeRepository

api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.get("/")
def hello_world():
    """Root endpoint."""
    return "Hello, World!"


@api_bp.get("/db-check")
def db_check():
    """Check database connection and return basic info."""
    try:
        with BaseRepository.get_cursor() as cur:
            cur.execute("SELECT current_database(), current_user, current_schema;")
            db, user, schema = cur.fetchone()
        return {"ok": True, "db": db, "user": user, "schema": schema}, 200
    except Exception as e:
        return {"ok": False, "error": str(e)}, 500


@api_bp.post("/login")
def login():
    """Database-integrated login endpoint for authentication."""
    try:
        # Get the JSON data from the request
        data = request.get_json()
        if not data:
            return {"success": False, "message": "No data provided"}, 400
        
        # Extract email and password from the request
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validate that both email and password are provided
        if not email or not password:
            return {"success": False, "message": "Email and password are required"}, 400
        
        # Try to authenticate the user using the database
        employee = EmployeeRepository.authenticate_user(email, password)
        
        if employee:
            # Authentication successful - store user info in session
            session['user_id'] = employee['employeeid']
            session['user_email'] = employee['email']
            session['user_name'] = f"{employee['firstname']} {employee['lastname']}"
            session['is_admin'] = employee['isadmin']
            
            # Determine redirect URL based on admin status
            if employee['isadmin']:
                redirect_url = "/owner"
            else:
                # Route to specific employee view with their ID
                redirect_url = f"/employee/{employee['employeeid']}/view"
            
            return {
                "success": True,
                "message": "Login successful",
                "user": {
                    "employeeid": employee['employeeid'],
                    "name": f"{employee['firstname']} {employee['lastname']}",
                    "email": employee['email'],
                    "isadmin": employee['isadmin']
                },
                "redirect_url": redirect_url
            }, 200
        else:
            # Authentication failed - invalid credentials
            return {
                "success": False,
                "message": "Invalid email or password"
            }, 401
        
    except Exception as e:
        # Handle any server errors
        print(f"Login error: {e}")
        return {"success": False, "message": "Server error occurred"}, 500


@api_bp.post("/logout")
def logout():
    """Logout endpoint - clears user session."""
    try:
        # Clear all session data
        session.clear()
        
        return {
            "success": True,
            "message": "Logged out successfully"
        }, 200
        
    except Exception as e:
        print(f"Logout error: {e}")
        return {"success": False, "message": "Server error occurred"}, 500


# ==================== Employee Availability API Routes ====================

@api_bp.post("/employee/availability")
def submit_employee_availability():
    """Submit employee availability."""
    try:
        # Check if user is logged in
        if 'user_id' not in session:
            return {"success": False, "message": "Authentication required"}, 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return {"success": False, "message": "No data provided"}, 400
        
        # Extract required fields
        employee_id = session.get('user_id')  # Use logged-in user's ID
        avail_date = data.get('date')
        start_time = data.get('startTime')
        end_time = data.get('endTime')
        
        # Validate required fields
        if not all([avail_date, start_time, end_time]):
            return {"success": False, "message": "Date, start time, and end time are required"}, 400
        
        # Use employee service to handle the submission
        from services.employee_service import EmployeeService
        result = EmployeeService.submit_availability(employee_id, avail_date, start_time, end_time)
        
        if result["success"]:
            return result, 201
        else:
            return result, 400
            
    except Exception as e:
        print(f"Error submitting availability: {e}")
        return {"success": False, "message": "Server error occurred"}, 500


@api_bp.get("/employee/<int:employee_id>/availability")
def get_employee_availability(employee_id):
    """Get employee availability records."""
    try:
        # Check if user is logged in and authorized
        if 'user_id' not in session:
            return {"success": False, "message": "Authentication required"}, 401
        
        # Only allow access to own data unless admin
        if not session.get('is_admin') and session.get('user_id') != employee_id:
            return {"success": False, "message": "Access denied"}, 403
        
        # Get date range from query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Get availability records
        availability_records = EmployeeRepository.get_employee_availability(
            employee_id, start_date, end_date
        )
        
        return {
            "success": True,
            "data": availability_records
        }, 200
        
    except Exception as e:
        print(f"Error getting availability: {e}")
        return {"success": False, "message": "Server error occurred"}, 500


@api_bp.put("/employee/availability/<int:availability_id>")
def update_employee_availability(availability_id):
    """Update employee availability record."""
    try:
        # Check if user is logged in
        if 'user_id' not in session:
            return {"success": False, "message": "Authentication required"}, 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return {"success": False, "message": "No data provided"}, 400
        
        employee_id = session.get('user_id')
        avail_date = data.get('date')
        start_time = data.get('startTime')
        end_time = data.get('endTime')
        
        # Use employee service to handle the update
        from services.employee_service import EmployeeService
        result = EmployeeService.update_employee_availability(
            availability_id, employee_id, avail_date, start_time, end_time
        )
        
        if result["success"]:
            return result, 200
        else:
            return result, 400
            
    except Exception as e:
        print(f"Error updating availability: {e}")
        return {"success": False, "message": "Server error occurred"}, 500


@api_bp.delete("/employee/availability/<int:availability_id>")
def delete_employee_availability(availability_id):
    """Delete employee availability record."""
    try:
        # Check if user is logged in
        if 'user_id' not in session:
            return {"success": False, "message": "Authentication required"}, 401
        
        employee_id = session.get('user_id')
        
        # Use employee service to handle the deletion
        from services.employee_service import EmployeeService
        result = EmployeeService.delete_employee_availability(availability_id, employee_id)
        
        if result["success"]:
            return result, 200
        else:
            return result, 400
            
    except Exception as e:
        print(f"Error deleting availability: {e}")
        return {"success": False, "message": "Server error occurred"}, 500


# ==================== Service API Routes ====================

@api_bp.get("/services")
def get_services():
    """Get all services with their categories."""
    try:
        services = ServiceRepository.get_all_services()
        return {"success": True, "data": services}, 200
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.get("/services/<int:service_id>")
def get_service(service_id):
    """Get a specific service by ID."""
    try:
        service = ServiceRepository.get_service_by_id(service_id)
        if service:
            return {"success": True, "data": service}, 200
        else:
            return {"success": False, "error": "Service not found"}, 404
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.post("/services")
def create_service():
    """Create a new service."""
    try:
        data = request.get_json()
        if not data:
            return {"success": False, "error": "No data provided"}, 400
        
        # Validate required fields
        required_fields = ['name', 'category', 'price']
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Missing required field: {field}"}, 400
        
        # Create service
        service_id = ServiceRepository.create_service(
            job_name=data['name'],
            service_type_name=data['category'],
            service_price=float(data['price']),
            duration_hours=float(data['duration']) if data.get('duration') else None,
            job_desc=data.get('description')
        )
        
        # Return the created service
        service = ServiceRepository.get_service_by_id(service_id)
        return {"success": True, "data": service, "message": "Service created successfully"}, 201
        
    except ValueError as e:
        return {"success": False, "error": str(e)}, 400
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.put("/services/<int:service_id>")
def update_service(service_id):
    """Update an existing service."""
    try:
        data = request.get_json()
        if not data:
            return {"success": False, "error": "No data provided"}, 400
        
        # Check if service exists
        existing_service = ServiceRepository.get_service_by_id(service_id)
        if not existing_service:
            return {"success": False, "error": "Service not found"}, 404
        
        # Validate required fields
        required_fields = ['name', 'category', 'price']
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Missing required field: {field}"}, 400
        
        # Update service
        success = ServiceRepository.update_service(
            service_id=service_id,
            job_name=data['name'],
            service_type_name=data['category'],
            service_price=float(data['price']),
            duration_hours=float(data['duration']) if data.get('duration') else None,
            job_desc=data.get('description')
        )
        
        if success:
            # Return updated service
            service = ServiceRepository.get_service_by_id(service_id)
            return {"success": True, "data": service, "message": "Service updated successfully"}, 200
        else:
            return {"success": False, "error": "Failed to update service"}, 500
            
    except ValueError as e:
        return {"success": False, "error": str(e)}, 400
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.delete("/services/<int:service_id>")
def delete_service(service_id):
    """Delete a service."""
    try:
        # Check if service exists
        existing_service = ServiceRepository.get_service_by_id(service_id)
        if not existing_service:
            return {"success": False, "error": "Service not found"}, 404
        
        # Delete service
        success = ServiceRepository.delete_service(service_id)
        if success:
            return {"success": True, "message": "Service deleted successfully"}, 200
        else:
            return {"success": False, "error": "Failed to delete service"}, 500
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.get("/service-types")
def get_service_types():
    """Get all service types for dropdown options."""
    try:
        service_types = ServiceRepository.get_service_types()
        return {"success": True, "data": service_types}, 200
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.get("/services/by-type/<service_type_name>")
def get_services_by_type(service_type_name):
    """Get all services for a specific service type."""
    try:
        services = ServiceRepository.get_services_by_type(service_type_name)
        return {"success": True, "data": services}, 200
    except Exception as e:
        return {"success": False, "error": str(e)}, 500
