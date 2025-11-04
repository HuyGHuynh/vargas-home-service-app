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


@api_bp.get("/availability/date/<date_str>")
def get_availability_for_date(date_str):
    """Get all available time slots for a specific date."""
    try:
        # Validate date format
        from datetime import datetime
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return {"success": False, "message": "Invalid date format. Use YYYY-MM-DD"}, 400
        
        # Get availability time slots from employee repository
        time_slots = EmployeeRepository.get_availability_time_slots_for_date(date_str)
        
        return {
            "success": True,
            "date": date_str,
            "time_slots": time_slots
        }, 200
        
    except Exception as e:
        print(f"Error getting availability for date: {e}")
        return {"success": False, "message": "Server error occurred"}, 500


@api_bp.get("/availability/employees")
def get_available_employees():
    """Get available employees for a specific date and time."""
    try:
        # Get query parameters
        date_str = request.args.get('date')
        time_str = request.args.get('time')
        
        if not date_str or not time_str:
            return {"success": False, "message": "Date and time parameters are required"}, 400
        
        # Validate formats
        from datetime import datetime
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
            datetime.strptime(time_str, '%H:%M')
        except ValueError:
            return {"success": False, "message": "Invalid date or time format"}, 400
        
        # Get available employees
        available_employees = EmployeeRepository.get_available_employees_for_datetime(date_str, time_str)
        
        return {
            "success": True,
            "date": date_str,
            "time": time_str,
            "available_employees": available_employees
        }, 200
        
    except Exception as e:
        print(f"Error getting available employees: {e}")
        return {"success": False, "message": "Server error occurred"}, 500


@api_bp.get("/availability/month/<int:year>/<int:month>")
def get_availability_for_month(year, month):
    """Get all dates in a month that have employee availability."""
    try:
        # Validate month and year
        if month < 1 or month > 12:
            return {"success": False, "message": "Month must be between 1 and 12"}, 400
        
        if year < 2020 or year > 2030:
            return {"success": False, "message": "Year must be between 2020 and 2030"}, 400
        
        # Get all availability for the month
        from datetime import date, timedelta
        import calendar
        
        # Get first and last day of month, but not earlier than today
        first_day = max(date(year, month, 1), date.today())
        last_day_num = calendar.monthrange(year, month)[1]
        last_day = date(year, month, last_day_num)
        
        # Optionally filter by service_type (frontend can pass ?service_type=HVAC etc.)
        service_type = request.args.get('service_type')

        # If a service_type filter is provided, get qualifying employees and restrict dates
        employee_filter_ids = None
        if service_type:
            try:
                qualified = EmployeeRepository.get_employees_by_service_type(service_type)
                employee_filter_ids = [e['employeeid'] for e in qualified]
            except Exception as e:
                print(f"Error retrieving employees for service_type filter: {e}")
                employee_filter_ids = []

        # Get all dates with availability in this month (future dates only), optionally filtered
        with BaseRepository.get_cursor() as cur:
            if employee_filter_ids is not None:
                # If no qualified employees, return empty list early
                if len(employee_filter_ids) == 0:
                    return {
                        "success": True,
                        "year": year,
                        "month": month,
                        "available_dates": []
                    }, 200

                query = """
                    SELECT DISTINCT availdate
                    FROM empavailability ea
                    JOIN employee e ON ea.employee_id = e.employeeid
                    WHERE availdate >= %s 
                      AND availdate <= %s
                      AND availdate >= CURRENT_DATE
                      AND e.isadmin = FALSE
                      AND e.employeeid = ANY(%s)
                    ORDER BY availdate;
                """
                cur.execute(query, (first_day, last_day, employee_filter_ids))
            else:
                query = """
                    SELECT DISTINCT availdate
                    FROM empavailability ea
                    JOIN employee e ON ea.employee_id = e.employeeid
                    WHERE availdate >= %s 
                      AND availdate <= %s
                      AND availdate >= CURRENT_DATE
                      AND e.isadmin = FALSE
                    ORDER BY availdate;
                """
                cur.execute(query, (first_day, last_day))

            results = cur.fetchall()

            # Convert to list of date strings
            available_dates = [result[0].strftime('%Y-%m-%d') for result in results]
        
        return {
            "success": True,
            "year": year,
            "month": month,
            "available_dates": available_dates
        }, 200
        
    except Exception as e:
        print(f"Error getting month availability: {e}")
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


# ==================== Employee Management API Routes ====================

@api_bp.get("/employees")
def get_all_employees():
    """Get all employees with their specialties."""
    try:
        # Check if user is admin
        if not session.get('is_admin'):
            return {"success": False, "message": "Admin access required"}, 403
        
        employees = EmployeeRepository.get_all_employees_with_specialties()
        return {"success": True, "data": employees}, 200
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.get("/employees/<int:employee_id>")
def get_employee(employee_id):
    """Get a specific employee by ID with specialties."""
    try:
        # Check authorization - admin or own profile
        if not session.get('is_admin') and session.get('user_id') != employee_id:
            return {"success": False, "message": "Access denied"}, 403
        
        employee = EmployeeRepository.get_employee_with_specialties(employee_id)
        if employee:
            return {"success": True, "data": employee}, 200
        else:
            return {"success": False, "error": "Employee not found"}, 404
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.post("/employees")
def create_employee():
    """Create a new employee."""
    try:
        # Check if user is admin
        if not session.get('is_admin'):
            return {"success": False, "message": "Admin access required"}, 403
        
        data = request.get_json()
        if not data:
            return {"success": False, "error": "No data provided"}, 400
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'role']
        for field in required_fields:
            if field not in data or not data[field]:
                return {"success": False, "error": f"Missing required field: {field}"}, 400
        
        # Create employee
        employee_id = EmployeeRepository.create_employee(
            firstname=data['firstName'],
            lastname=data['lastName'],
            phone=data['phone'],
            email=data['email'],
            password=data['password'],
            isadmin=(data['role'] == 'admin'),
            hiredate=data.get('hireDate'),
            status=data.get('status', 'Active')
        )
        
        if employee_id:
            # Add specialties if provided
            specialties = data.get('specialties', [])
            if specialties:
                EmployeeRepository.update_employee_specialties(employee_id, specialties)
            
            # Return the created employee
            employee = EmployeeRepository.get_employee_with_specialties(employee_id)
            return {"success": True, "data": employee, "message": "Employee created successfully"}, 201
        else:
            return {"success": False, "error": "Failed to create employee"}, 500
        
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.put("/employees/<int:employee_id>")
def update_employee(employee_id):
    """Update an existing employee."""
    try:
        # Check if user is admin
        if not session.get('is_admin'):
            return {"success": False, "message": "Admin access required"}, 403
        
        data = request.get_json()
        if not data:
            return {"success": False, "error": "No data provided"}, 400
        
        # Check if employee exists
        existing_employee = EmployeeRepository.get_employee_by_id(employee_id)
        if not existing_employee:
            return {"success": False, "error": "Employee not found"}, 404
        
        # Update employee
        success = EmployeeRepository.update_employee(
            employee_id=employee_id,
            firstname=data.get('firstName'),
            lastname=data.get('lastName'),
            phone=data.get('phone'),
            email=data.get('email'),
            password=data.get('password'),
            isadmin=(data.get('role') == 'admin'),
            hiredate=data.get('hireDate'),
            status=data.get('status')
        )
        
        if success:
            # Update specialties if provided
            specialties = data.get('specialties', [])
            EmployeeRepository.update_employee_specialties(employee_id, specialties)
            
            # Return updated employee
            employee = EmployeeRepository.get_employee_with_specialties(employee_id)
            return {"success": True, "data": employee, "message": "Employee updated successfully"}, 200
        else:
            return {"success": False, "error": "Failed to update employee"}, 500
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.delete("/employees/<int:employee_id>")
def delete_employee(employee_id):
    """Delete an employee."""
    try:
        # Check if user is admin
        if not session.get('is_admin'):
            return {"success": False, "message": "Admin access required"}, 403
        
        # Check if employee exists
        existing_employee = EmployeeRepository.get_employee_by_id(employee_id)
        if not existing_employee:
            return {"success": False, "error": "Employee not found"}, 404
        
        # Delete employee
        success = EmployeeRepository.delete_employee(employee_id)
        if success:
            return {"success": True, "message": "Employee deleted successfully"}, 200
        else:
            return {"success": False, "error": "Failed to delete employee"}, 500
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.get("/specialties")
def get_specialties():
    """Get all available specialties."""
    try:
        specialties = EmployeeRepository.get_all_specialties()
        return {"success": True, "data": specialties}, 200
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


@api_bp.get("/services/<int:service_id>/cost")
def get_service_cost(service_id):
    """Get service cost calculation for a specific service."""
    try:
        cost_details = ServiceRepository.get_service_cost_calculation(service_id)
        if cost_details:
            return {"success": True, "data": cost_details}, 200
        else:
            return {"success": False, "error": "Service not found"}, 404
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.get("/employees/by-specialty/<specialty_name>")
def get_employees_by_specialty(specialty_name):
    """Get all employees who have a specific specialty."""
    try:
        employees = EmployeeRepository.get_employees_by_specialty(specialty_name)
        return {"success": True, "data": employees}, 200
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.get("/employees/by-service-type/<service_type_name>")
def get_employees_by_service_type(service_type_name):
    """Get all employees who can perform a specific service type."""
    try:
        employees = EmployeeRepository.get_employees_by_service_type(service_type_name)
        return {"success": True, "data": employees}, 200
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


# Admin Warranty Management Routes

@api_bp.get("/admin/warranties")
def get_all_warranties():
    """Get all warranties for admin management."""
    try:
        from repositories.warranty_repository import WarrantyRepository
        warranties = WarrantyRepository.get_all_warranties()
        return {"success": True, "data": warranties}, 200
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.put("/admin/warranties/<int:warranty_id>/status")
def update_warranty_status(warranty_id):
    """Update warranty status."""
    try:
        from repositories.warranty_repository import WarrantyRepository
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['Active', 'Pending', 'Inactive']:
            return {"success": False, "error": "Invalid status. Must be Active, Pending, or Inactive"}, 400
        
        success = WarrantyRepository.update_warranty_status(warranty_id, new_status)
        
        if success:
            return {"success": True, "message": f"Warranty {warranty_id} status updated to {new_status}"}, 200
        else:
            return {"success": False, "error": "Warranty not found or update failed"}, 404
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.delete("/admin/warranties/<int:warranty_id>")
def delete_warranty(warranty_id):
    """Delete a warranty."""
    try:
        from repositories.warranty_repository import WarrantyRepository
        
        success = WarrantyRepository.delete_warranty(warranty_id)
        
        if success:
            return {"success": True, "message": f"Warranty {warranty_id} deleted successfully"}, 200
        else:
            return {"success": False, "error": "Warranty not found or delete failed"}, 404
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.post("/admin/warranties/update-expired")
def update_expired_warranties():
    """Update warranties that have passed their end date to 'Inactive' status."""
    try:
        from repositories.warranty_repository import WarrantyRepository
        
        updated_count = WarrantyRepository.update_expired_warranties()
        
        return {
            "success": True, 
            "message": f"Updated {updated_count} expired warranties to Inactive status",
            "updated_count": updated_count
        }, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500
