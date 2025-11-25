"""
Utility API routes (health check, database check, etc.).
"""
from flask import Blueprint, request, jsonify, session, render_template, url_for
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

@api_bp.post("/forgot-password")
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email", "").strip() if data else ""

        if not email:
            return {"success": False, "message": "Email is required"}, 400

        # check employee exists
        employee = EmployeeRepository.get_employee_by_email(email)
        if not employee:
            return {"success": False, "message": "Email not found"}, 404

        # create token
        import uuid
        from datetime import datetime, timedelta

        token = str(uuid.uuid4())
        expires = datetime.utcnow() + timedelta(hours=1)

        # save token (create table if it doesn't exist)
        with BaseRepository.get_cursor() as cur:
            # Delete any existing tokens for this employee
            cur.execute("DELETE FROM password_reset_tokens WHERE employeeid = %s", (employee["employeeid"],))
            
            # Insert new token
            cur.execute("""
                INSERT INTO password_reset_tokens (employeeid, token, expires_at)
                VALUES (%s, %s, %s)
            """, (employee["employeeid"], token, expires))

        reset_link = f"http://127.0.0.1:5000/reset-password/{token}"

        # SEND EMAIL USING EMAILSERVICE
        from services.email_service import EmailService  # Fixed import path
        email_service = EmailService()
        if email_service.send_password_reset_email(email, reset_link):
            return {"success": True, "message": "Password reset email sent successfully"}, 200
        else:
            return {"success": False, "message": "Failed to send email"}, 500

    except Exception as e:
        print("Forgot password error:", e)
        return {"success": False, "message": "Server error"}, 500

@api_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    try:
        data = request.get_json()
        new_password = data.get("new_password", "").strip() if data else ""

        if not new_password:
            return {"success": False, "message": "Password is required"}, 400

        from datetime import datetime

        # get token record
        with BaseRepository.get_cursor() as cur:
            cur.execute("""
                SELECT employeeid, expires_at
                FROM password_reset_tokens
                WHERE token = %s
            """, (token,))
            record = cur.fetchone()

        if not record:
            return {"success": False, "message": "Invalid or expired token"}, 400

        employee_id, expires_at = record
        if expires_at < datetime.utcnow():
            return {"success": False, "message": "Token has expired"}, 400

        # update employee password
        success = EmployeeRepository.update_employee_password(employee_id, new_password)
        if not success:
            return {"success": False, "message": "Failed to update password"}, 500

        # delete token after use
        with BaseRepository.get_cursor() as cur:
            cur.execute("DELETE FROM password_reset_tokens WHERE token = %s", (token,))

        return {"success": True, "message": "Password has been reset successfully"}, 200

    except Exception as e:
        print("Reset password error:", e)
        return {"success": False, "message": "Server error"}, 500
        
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


@api_bp.get("/admin/qualified-employees/<service_type_name>")
def get_qualified_employees_for_admin(service_type_name):
    """Get all qualified employees for admin - ignores availability checks."""
    try:
        employees = EmployeeRepository.get_employees_by_service_type(service_type_name)
        
        # Format for admin use with additional fields for compatibility
        formatted_employees = []
        for emp in employees:
            formatted_employees.append({
                'employee_id': emp['employeeid'],
                'employeeid': emp['employeeid'],  # Keep both for compatibility
                'first_name': emp['firstname'],
                'last_name': emp['lastname'],
                'full_name': emp['full_name'],
                'email': emp['email'],
                'phone': emp['phone'],
                'specialties': emp.get('specialties', []),
                'status': emp['status'],
                'available_override': True  # Admin can assign regardless of availability
            })
        
        return {"success": True, "data": formatted_employees}, 200
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
def admin_update_warranty_status(warranty_id):
    """Update warranty status (admin function)."""
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


# Service Request Management Routes

@api_bp.get("/service-requests")
def get_all_service_requests():
    """Get all service requests with full details for calendar view."""
    try:
        from repositories.servicerequest_repository import ServiceRequestRepository
        service_requests = ServiceRequestRepository.get_all_service_requests()
        return {"success": True, "data": service_requests}, 200
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.get("/service-requests/<int:request_id>")
def get_service_request(request_id):
    """Get a specific service request by ID."""
    try:
        from repositories.servicerequest_repository import ServiceRequestRepository
        service_request = ServiceRequestRepository.get_service_request_by_id(request_id)
        
        if service_request:
            return {"success": True, "data": service_request}, 200
        else:
            return {"success": False, "error": "Service request not found"}, 404
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.put("/service-requests/<int:request_id>/status")
def update_service_request_status(request_id):
    """Update service request status."""
    try:
        from repositories.servicerequest_repository import ServiceRequestRepository
        
        data = request.get_json()
        new_status = data.get('status')
        
        valid_statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled']
        if new_status not in valid_statuses:
            return {"success": False, "error": f"Invalid status. Must be one of {valid_statuses}"}, 400
        
        success = ServiceRequestRepository.update_service_request_status(request_id, new_status)
        
        if success:
            return {"success": True, "message": f"Service request {request_id} status updated to {new_status}"}, 200
        else:
            return {"success": False, "error": "Service request not found or update failed"}, 404
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.post("/service-requests/<int:request_id>/assign")
def assign_employee_to_request(request_id):
    """Assign an employee to a service request."""
    try:
        data = request.get_json()
        employee_id = data.get('employee_id')
        
        if not employee_id:
            return {"success": False, "error": "Employee ID is required"}, 400
        
        with BaseRepository.get_cursor() as cursor:
            # Check if assignment already exists
            cursor.execute("SELECT assignment_id FROM work_assignments WHERE requestid = %s", (request_id,))
            existing = cursor.fetchone()
            
            if existing:
                # Update existing assignment
                cursor.execute("""
                    UPDATE work_assignments 
                    SET employeeid = %s 
                    WHERE requestid = %s
                """, (employee_id, request_id))
                message = f"Service request {request_id} reassigned to employee {employee_id}"
            else:
                # Create new assignment
                cursor.execute("""
                    INSERT INTO work_assignments (requestid, employeeid) 
                    VALUES (%s, %s)
                """, (request_id, employee_id))
                message = f"Service request {request_id} assigned to employee {employee_id}"
            
            return {"success": True, "message": message}, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.delete("/service-requests/<int:request_id>/assign")
def unassign_employee_from_request(request_id):
    """Remove employee assignment from a service request."""
    try:
        with BaseRepository.get_cursor() as cursor:
            cursor.execute("DELETE FROM work_assignments WHERE requestid = %s", (request_id,))
            
            if cursor.rowcount > 0:
                return {"success": True, "message": f"Employee unassigned from service request {request_id}"}, 200
            else:
                return {"success": False, "error": "No assignment found for this service request"}, 404
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.put("/service-requests/<int:request_id>/set-final-price")
def set_final_price(request_id):
    """Set final price for a service request without changing status."""
    try:
        data = request.get_json()
        final_price = data.get('final_price')
        
        if not final_price or final_price <= 0:
            return {"success": False, "error": "Valid final price is required"}, 400
        
        with BaseRepository.get_cursor() as cursor:
            # Check if request exists
            cursor.execute("SELECT status FROM servicerequests WHERE requestid = %s", (request_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"success": False, "error": "Service request not found"}, 404
            
            # Check if final price already exists
            cursor.execute("SELECT finalprice_id FROM finalpricedetails WHERE request_id = %s", (request_id,))
            existing_price = cursor.fetchone()
            
            if existing_price:
                # Update existing final price
                cursor.execute("""
                    UPDATE finalpricedetails 
                    SET pricetotal = %s 
                    WHERE request_id = %s
                """, (final_price, request_id))
                message = f"Final price updated to ${final_price:.2f} for service request {request_id}"
            else:
                # Insert new final price record
                cursor.execute("""
                    INSERT INTO finalpricedetails (pricetotal, request_id) 
                    VALUES (%s, %s)
                """, (final_price, request_id))
                message = f"Final price set to ${final_price:.2f} for service request {request_id}"
            
            return {"success": True, "message": message}, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.post("/service-requests/<int:request_id>/accept")
def accept_service_request(request_id):
    """Accept a pending service request, set final price and change status to In Progress."""
    try:
        data = request.get_json()
        final_price = data.get('final_price')
        
        if not final_price or final_price <= 0:
            return {"success": False, "error": "Valid final price is required"}, 400
        
        with BaseRepository.get_cursor() as cursor:
            # Check if request exists and is pending
            cursor.execute("SELECT status FROM servicerequests WHERE requestid = %s", (request_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"success": False, "error": "Service request not found"}, 404
            
            if row[0] != 'Pending':
                return {"success": False, "error": "Only pending requests can be accepted"}, 400
            
            # Update request status to In Progress
            cursor.execute("""
                UPDATE servicerequests 
                SET status = 'In Progress' 
                WHERE requestid = %s
            """, (request_id,))
            
            # Check if final price already exists
            cursor.execute("SELECT finalprice_id FROM finalpricedetails WHERE request_id = %s", (request_id,))
            existing_price = cursor.fetchone()
            
            if existing_price:
                # Update existing final price
                cursor.execute("""
                    UPDATE finalpricedetails 
                    SET pricetotal = %s 
                    WHERE request_id = %s
                """, (final_price, request_id))
            else:
                # Insert new final price record
                cursor.execute("""
                    INSERT INTO finalpricedetails (pricetotal, request_id) 
                    VALUES (%s, %s)
                """, (final_price, request_id))
        
        # After successful database update, send appointment confirmation emails
        try:
            from repositories.servicerequest_repository import ServiceRequestRepository
            from services.email_service import EmailService
            
            # Get full service request details with customer and employee info
            service_request = ServiceRequestRepository.get_service_request_by_id(request_id)
            
            if service_request:
                # Update the final price in the service request data for email
                service_request['final_price'] = final_price
                
                # Send appointment confirmation emails
                email_service = EmailService()
                email_results = email_service.send_appointment_confirmation_email(service_request)
                
                success_message = f"Service request {request_id} accepted and moved to In Progress"
                
                # Add email status to response message
                if email_results['customer_email_sent'] and email_results['employee_email_sent']:
                    success_message += ". Confirmation emails sent to customer and employee."
                elif email_results['customer_email_sent']:
                    success_message += ". Confirmation email sent to customer."
                elif email_results['employee_email_sent']:
                    success_message += ". Notification email sent to employee."
                else:
                    success_message += ". Note: Email notifications could not be sent."
                
                return {"success": True, "message": success_message}, 200
            else:
                return {"success": True, "message": f"Service request {request_id} accepted and moved to In Progress"}, 200
                
        except Exception as email_error:
            # Don't fail the entire request if email fails - just log it
            print(f"Email notification error: {email_error}")
            return {"success": True, "message": f"Service request {request_id} accepted and moved to In Progress. Note: Email notifications could not be sent."}, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.post("/service-requests/<int:request_id>/send-final-price-email")
def send_final_price_email(request_id):
    """Send final price notification email to customer."""
    try:
        from repositories.servicerequest_repository import ServiceRequestRepository
        from services.email_service import EmailService
        
        # Get service request details
        service_request = ServiceRequestRepository.get_service_request_by_id(request_id)
        if not service_request:
            return {"success": False, "error": "Service request not found"}, 404
        
        # Check if request has a final price set
        if not service_request.get('final_price'):
            return {"success": False, "error": "No final price set for this request"}, 400
        
        # Check if request is still pending (only send notifications for pending requests)
        if service_request.get('request_status') != 'Pending':
            return {"success": False, "error": "Final price notifications can only be sent for pending requests"}, 400
        
        customer = service_request.get('customer', {})
        customer_email = customer.get('email')
        
        if not customer_email:
            return {"success": False, "error": "Customer email not found"}, 400
        
        # Send the final price notification email
        email_service = EmailService()
        success = email_service.send_final_price_notification_email(
            customer_email=customer_email,
            service_request=service_request
        )
        
        if success:
            return {"success": True, "message": f"Final price notification sent to {customer_email}"}, 200
        else:
            return {"success": False, "error": "Failed to send email notification"}, 500
            
    except Exception as e:
        print(f"Error sending final price email: {e}")
        return {"success": False, "error": str(e)}, 500


@api_bp.delete("/service-requests/<int:request_id>")
def delete_service_request(request_id):
    """Delete a service request and all related data."""
    try:
        with BaseRepository.get_cursor() as cursor:
            # Delete related records first (due to foreign key constraints)
            cursor.execute("DELETE FROM finalpricedetails WHERE request_id = %s", (request_id,))
            cursor.execute("DELETE FROM work_assignments WHERE requestid = %s", (request_id,))
            cursor.execute("DELETE FROM warranties WHERE request_id = %s", (request_id,))
            
            # Delete the main service request
            cursor.execute("DELETE FROM servicerequests WHERE requestid = %s", (request_id,))
            
            if cursor.rowcount > 0:
                return {"success": True, "message": f"Service request {request_id} deleted successfully"}, 200
            else:
                return {"success": False, "error": "Service request not found"}, 404
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.post("/service-requests/<int:request_id>/complete")
def complete_service_request(request_id):
    """Complete a service request and optionally attach a warranty."""
    try:
        data = request.get_json()
        warranty_data = data.get('warranty')
        
        with BaseRepository.get_cursor() as cursor:
            # Check if request exists and is in progress
            cursor.execute("SELECT status FROM servicerequests WHERE requestid = %s", (request_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"success": False, "error": "Service request not found"}, 404
            
            if row[0] != 'In Progress':
                return {"success": False, "error": "Only in progress requests can be completed"}, 400
            
            # Update request status to Completed
            cursor.execute("""
                UPDATE servicerequests 
                SET status = 'Completed' 
                WHERE requestid = %s
            """, (request_id,))
            
            # Get customer details for email notifications
            cursor.execute("""
                SELECT c.email, c.firstname, c.lastname, c.customerid
                FROM servicerequests sr
                JOIN customer c ON sr.customerid = c.customerid
                WHERE sr.requestid = %s
            """, (request_id,))
            
            customer_row = cursor.fetchone()
            customer_email = customer_row[0] if customer_row else None
            customer_name = f"{customer_row[1]} {customer_row[2]}" if customer_row else None
            customer_id = customer_row[3] if customer_row else None
            
            warranty_message = ""
            review_message = ""
            
            # Send review request email (always send when service is completed)
            if customer_email and customer_name:
                from services.email_service import EmailService
                
                try:
                    EmailService.send_service_completion_email(
                        customer_email=customer_email,
                        customer_name=customer_name,
                        request_id=request_id,
                        customer_id=customer_id
                    )
                    review_message = " and review request sent to customer"
                except Exception as email_error:
                    print(f"Failed to send review email: {email_error}")
                    review_message = " (review email sending failed)"
            
            # If warranty data is provided, create warranty record and send customer email
            if warranty_data and warranty_data.get('start_date'):
                # Create warranty with 'Pending' status (customer hasn't decided yet)
                cursor.execute("""
                    INSERT INTO warranties (start_date, end_date, description, price, status, request_id) 
                    VALUES (%s, %s, %s, %s, 'Pending', %s)
                    RETURNING warranty_id
                """, (
                    warranty_data['start_date'],
                    warranty_data['end_date'],
                    warranty_data['description'],
                    warranty_data['price'],
                    request_id
                ))
                
                warranty_id = cursor.fetchone()[0]
                
                # Use already-fetched customer data for warranty email
                if customer_email and customer_name:
                    
                    # Import and use email service to send warranty selection email
                    from services.email_service import EmailService
                    
                    try:
                        EmailService.send_warranty_selection_email(
                            customer_email=customer_email,
                            customer_name=customer_name,
                            request_id=request_id,
                            warranty_id=warranty_id,
                            warranty_description=warranty_data['description'],
                            warranty_price=warranty_data['price'],
                            warranty_start_date=warranty_data['start_date'],
                            warranty_end_date=warranty_data['end_date']
                        )
                        warranty_message = " with warranty offer sent to customer"
                    except Exception as email_error:
                        print(f"Failed to send warranty email: {email_error}")
                        warranty_message = " with warranty created (email sending failed)"
                else:
                    warranty_message = " with warranty created (customer not found)"
            else:
                warranty_message = ""
            
            return {"success": True, "message": f"Service request {request_id} completed{warranty_message}{review_message}"}, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.post("/service-requests/<int:request_id>/cancel")
def cancel_service_request(request_id):
    """Cancel a service request (In Progress -> Cancelled)."""
    try:
        with BaseRepository.get_cursor() as cursor:
            # Check if request exists and is in progress
            cursor.execute("SELECT status FROM servicerequests WHERE requestid = %s", (request_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"success": False, "error": "Service request not found"}, 404
            
            if row[0] != 'In Progress':
                return {"success": False, "error": "Only in progress requests can be cancelled"}, 400
            
            # Update request status to Cancelled
            cursor.execute("""
                UPDATE servicerequests 
                SET status = 'Cancelled' 
                WHERE requestid = %s
            """, (request_id,))
            
            return {"success": True, "message": f"Service request {request_id} cancelled"}, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.get("/warranties/<int:request_id>")
def get_warranty_by_request_id(request_id):
    """Get warranty details by service request ID."""
    try:
        with BaseRepository.get_cursor() as cursor:
            cursor.execute("""
                SELECT w.warranty_id, w.start_date, w.end_date, w.description, w.price, w.status,
                       sr.requestid, c.firstname, c.lastname, c.email,
                       s.job_name, st.service_type_name
                FROM warranties w
                JOIN servicerequests sr ON w.request_id = sr.requestid
                JOIN customer c ON sr.customerid = c.customerid
                JOIN services s ON sr.service_id = s.service_id
                JOIN service_types st ON s.service_type_id = st.service_type_id
                WHERE w.request_id = %s
            """, (request_id,))
            
            row = cursor.fetchone()
            if not row:
                return {"success": False, "error": "Warranty not found for this request"}, 404
            
            warranty_data = {
                "warranty_id": row[0],
                "start_date": row[1].strftime('%Y-%m-%d') if row[1] else None,
                "end_date": row[2].strftime('%Y-%m-%d') if row[2] else None,
                "description": row[3],
                "price": float(row[4]) if row[4] else 0.0,
                "status": row[5],
                "request_id": row[6],
                "customer": {
                    "first_name": row[7],
                    "last_name": row[8],
                    "email": row[9]
                },
                "service": {
                    "job_name": row[10],
                    "service_type": row[11]
                }
            }
            
            return {"success": True, "data": warranty_data}, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.put("/warranties/<int:warranty_id>/status")
def update_warranty_status(warranty_id):
    """Update warranty status (accept/decline)."""
    try:
        data = request.get_json()
        new_status = data.get('status')
        action = data.get('action')  # 'accept' or 'decline'
        
        # Validate status
        valid_statuses = ['Pending', 'Active', 'Inactive']
        if new_status not in valid_statuses:
            return {"success": False, "error": "Invalid status"}, 400
        
        with BaseRepository.get_cursor() as cursor:
            # Check if warranty exists and is in Pending status
            cursor.execute("SELECT status, request_id FROM warranties WHERE warranty_id = %s", (warranty_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"success": False, "error": "Warranty not found"}, 404
            
            if row[0] != 'Pending':
                return {"success": False, "error": "Warranty status can only be updated from Pending"}, 400
            
            request_id = row[1]
            
            if action == 'accept' or new_status == 'Active':
                # Customer accepted - status becomes 'Active'
                cursor.execute("""
                    UPDATE warranties 
                    SET status = 'Active'
                    WHERE warranty_id = %s
                """, (warranty_id,))
                
                message = "Warranty accepted successfully. Your warranty is now active."
                
            elif action == 'decline' or new_status == 'Inactive':
                # Customer declined - status becomes 'Inactive' and will be deleted after 24 hours
                cursor.execute("""
                    UPDATE warranties 
                    SET status = 'Inactive'
                    WHERE warranty_id = %s
                """, (warranty_id,))
                
                message = "Warranty declined successfully. This offer will be removed within 24 hours."
                
            else:
                return {"success": False, "error": "Invalid action"}, 400
            
            return {"success": True, "message": message, "request_id": request_id}, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


@api_bp.delete("/warranties/cleanup")
def cleanup_inactive_warranties():
    """Delete inactive warranties older than 24 hours."""
    try:
        with BaseRepository.get_cursor() as cursor:
            # Delete warranties that are Inactive and older than 24 hours
            cursor.execute("""
                DELETE FROM warranties 
                WHERE status = 'Inactive' 
                AND updated_at < NOW() - INTERVAL '24 hours'
            """)
            
            deleted_count = cursor.rowcount
            
            return {"success": True, "message": f"Cleaned up {deleted_count} inactive warranties", "deleted_count": deleted_count}, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


# Review Management Routes

@api_bp.get("/reviews/<int:request_id>/details")
def get_review_details(request_id):
    """Get service request details for review form."""
    try:
        # Use the existing ServiceRequestRepository method
        from repositories.servicerequest_repository import ServiceRequestRepository
        
        work_order_data = ServiceRequestRepository.get_service_request_by_id(request_id)
        
        if not work_order_data:
            return {"success": False, "error": "Work order not found"}, 404
        
        # Check if the work order is completed
        if work_order_data['request_status'] != 'Completed':
            return {"success": False, "error": "Work order is not completed yet"}, 400
        
        # Check if review already exists
        with BaseRepository.get_cursor() as cursor:
            cursor.execute("""
                SELECT review_id FROM reviews 
                WHERE request_id = %s AND customer_id = %s
            """, (request_id, work_order_data['customer_id']))
            
            existing_review = cursor.fetchone()
            if existing_review:
                return {"success": False, "error": "Review already submitted for this service request"}, 400
        
        # Return the work order data in the expected format
        print(f"DEBUG: Returning work order data: {work_order_data}")
        return {"success": True, "work_order": work_order_data}, 200
            
    except Exception as e:
        print(f"Error getting review details for request_id {request_id}: {e}")
        print(f"Exception type: {type(e).__name__}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return {"success": False, "error": f"Database error: {str(e)}"}, 500


@api_bp.get("/reviews/<int:request_id>/get")
def get_review(request_id):
    """Get review for a specific request."""
    try:
        with BaseRepository.get_cursor() as cursor:
            cursor.execute("""
                SELECT r.review_id, r.customer_id, r.comments, r.request_id,
                       r.rating_quality, r.rating_professionalism, r.rating_timeliness, 
                       r.rating_communication, r.rating_overall, r.avg_rating
                FROM reviews r
                WHERE r.request_id = %s
            """, (request_id,))
            
            review_row = cursor.fetchone()
            
            if not review_row:
                return {"success": False, "error": "Review not found"}, 404
            
            review_data = {
                'review_id': review_row[0],
                'customer_id': review_row[1],
                'comments': review_row[2],
                'request_id': review_row[3],
                'rating_quality': review_row[4],
                'rating_professionalism': review_row[5],
                'rating_timeliness': review_row[6],
                'rating_communication': review_row[7],
                'rating_overall': review_row[8],
                'avg_rating': float(review_row[9]) if review_row[9] else 0.0
            }
            
            return {"success": True, "review": review_data}, 200
            
    except Exception as e:
        print(f"Error getting review for request_id {request_id}: {e}")
        return {"success": False, "error": str(e)}, 500


@api_bp.post("/reviews/<int:request_id>")
def submit_review(request_id):
    """Submit a customer review for a specific request."""
    try:
        data = request.get_json()
        print(f"DEBUG: Received review submission for request_id: {request_id}")
        print(f"DEBUG: Data received: {data}")
        
        if not data:
            return {"success": False, "error": "No data provided"}, 400
        
        # Validate required fields (request_id comes from URL, customer_id will be looked up)
        required_fields = ['rating_quality', 'rating_professionalism', 
                          'rating_timeliness', 'rating_communication', 'rating_overall']
        for field in required_fields:
            if field not in data:
                return {"success": False, "error": f"Missing required field: {field}"}, 400
        
        # Validate rating ranges (1-5)
        rating_fields = ['rating_quality', 'rating_professionalism', 'rating_timeliness', 
                        'rating_communication', 'rating_overall']
        for field in rating_fields:
            rating = data.get(field)
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                return {"success": False, "error": f"Invalid {field}: must be between 1 and 5"}, 400
        
        with BaseRepository.get_cursor() as cursor:
            # First, get the customer_id from the service request
            print(f"DEBUG: Looking up customer_id for request_id={request_id}")
            cursor.execute("""
                SELECT customerid, status FROM servicerequests 
                WHERE requestid = %s
            """, (request_id,))
            
            service_row = cursor.fetchone()
            print(f"DEBUG: Service request found: {service_row}")
            
            if not service_row:
                return {"success": False, "error": "Service request not found"}, 404
            
            customer_id = service_row[0]
            service_status = service_row[1]
            
            if service_status != 'Completed':
                return {"success": False, "error": "Can only review completed service requests"}, 400
            
            # Check if review already exists
            print(f"DEBUG: Checking for existing review with request_id={request_id}, customer_id={customer_id}")
            cursor.execute("""
                SELECT review_id FROM reviews 
                WHERE request_id = %s AND customer_id = %s
            """, (request_id, customer_id))
            
            existing_review = cursor.fetchone()
            print(f"DEBUG: Existing review found: {existing_review}")
            
            if existing_review:
                return {"success": False, "error": "Review already submitted for this service request"}, 400
            
            # Insert review
            insert_values = (
                customer_id,  # Now we get this from the service request lookup
                request_id,
                data['rating_quality'],
                data['rating_professionalism'],
                data['rating_timeliness'],
                data['rating_communication'],
                data['rating_overall'],
                data.get('comments', '')
            )
            print(f"DEBUG: Inserting review with values: {insert_values}")
            
            cursor.execute("""
                INSERT INTO reviews (
                    customer_id, request_id, rating_quality, rating_professionalism,
                    rating_timeliness, rating_communication, rating_overall, comments
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING review_id
            """, insert_values)
            
            review_id = cursor.fetchone()[0]
            print(f"DEBUG: Review inserted successfully with ID: {review_id}")
            
            return {"success": True, "message": "Review submitted successfully", "review_id": review_id}, 201
            
    except Exception as e:
        print(f"Error submitting review for request_id {request_id}: {e}")
        print(f"Exception type: {type(e).__name__}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return {"success": False, "error": f"Database error: {str(e)}"}, 500


@api_bp.get("/reviews/<int:request_id>")
def get_review_by_request(request_id):
    """Get review for a specific service request."""
    try:
        with BaseRepository.get_cursor() as cursor:
            cursor.execute("""
                SELECT r.review_id, r.customer_id, r.request_id, r.rating_quality,
                       r.rating_professionalism, r.rating_timeliness, r.rating_communication,
                       r.rating_overall, r.avg_rating, r.comments,
                       c.firstname, c.lastname, c.email
                FROM reviews r
                JOIN customer c ON r.customer_id = c.customerid
                WHERE r.request_id = %s
            """, (request_id,))
            
            row = cursor.fetchone()
            if not row:
                return {"success": False, "error": "Review not found"}, 404
            
            review_data = {
                "review_id": row[0],
                "customer_id": row[1],
                "request_id": row[2],
                "ratings": {
                    "quality": row[3],
                    "professionalism": row[4],
                    "timeliness": row[5],
                    "communication": row[6],
                    "overall": row[7],
                    "average": float(row[8]) if row[8] else 0.0
                },
                "comments": row[9],
                "customer": {
                    "first_name": row[10],
                    "last_name": row[11],
                    "email": row[12]
                }
            }
            
            return {"success": True, "data": review_data}, 200
            
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


# ==================== Admin Financial API Routes ====================

@api_bp.route("/admin/financial/data", methods=["GET"])
def get_financial_data():
    """Get financial data for admin dashboard."""
    try:
        from services.finance_service import FinanceService
        
        # Get query parameters
        category_filter = request.args.get('category', 'all')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Get financial data
        data = FinanceService.get_financial_data(
            category_filter=category_filter if category_filter != 'all' else None,
            start_date=start_date,
            end_date=end_date
        )
        
        return {
            "success": True,
            "data": data
        }, 200
        
    except Exception as e:
        print(f"Error fetching financial data: {e}")
        return {
            "success": False,
            "message": "Failed to fetch financial data"
        }, 500


@api_bp.route("/admin/financial/charts", methods=["GET"])
def get_financial_charts():
    """Get chart data for admin financial dashboard."""
    try:
        from services.finance_service import FinanceService
        
        # Get query parameters
        category_filter = request.args.get('category', 'all')
        
        # Get chart data
        data = FinanceService.get_chart_data(
            category_filter=category_filter if category_filter != 'all' else None
        )
        
        return {
            "success": True,
            "data": data
        }, 200
        
    except Exception as e:
        print(f"Error fetching chart data: {e}")
        return {
            "success": False,
            "message": "Failed to fetch chart data"
        }, 500


@api_bp.route("/admin/financial/export", methods=["GET"])
def export_financial_data():
    """Export financial data as CSV."""
    try:
        from flask import make_response
        from services.finance_service import FinanceService
        
        # Get query parameters
        category_filter = request.args.get('category', 'all')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Generate CSV content
        csv_content = FinanceService.export_transactions_csv(
            category_filter=category_filter if category_filter != 'all' else None,
            start_date=start_date,
            end_date=end_date
        )
        
        # Create response with CSV content
        response = make_response(csv_content)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=financial_report_{category_filter or "all"}.csv'
        
        return response
        
    except Exception as e:
        print(f"Error exporting financial data: {e}")
        return {
            "success": False,
            "message": "Failed to export data"
        }, 500


@api_bp.route("/admin/financial/transaction", methods=["POST"])
def create_financial_transaction():
    """Create a new financial transaction."""
    try:
        from services.finance_service import FinanceService
        
        # Get request data
        data = request.get_json()
        if not data:
            return {
                "success": False,
                "message": "No data provided"
            }, 400
        
        # Create transaction
        result = FinanceService.create_transaction(data)
        
        if result['success']:
            return result, 201
        else:
            return result, 400
        
    except Exception as e:
        print(f"Error creating transaction: {e}")
        return {
            "success": False,
            "message": "Failed to create transaction"
        }, 500
