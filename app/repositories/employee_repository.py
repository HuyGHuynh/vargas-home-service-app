"""
Employee repository for managing employee data and authentication.
"""
from .base_repository import BaseRepository


class EmployeeRepository:
    """Repository class for employee operations."""

    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticate a user by email and password.
        
        This method checks if the provided email and password match
        an employee record in the database.
        
        Args:
            email (str): Employee's email address
            password (str): Employee's password (plain text for now)
            
        Returns:
            dict or None: Employee data if authentication successful, None otherwise
            Employee dict contains: employeeid, firstname, lastname, email, isadmin
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # SQL Query to find employee by email and password
                # This is a simple query that students can easily understand
                query = """
                    SELECT employeeid, firstname, lastname, email, isadmin
                    FROM employee 
                    WHERE email = %s AND password = %s
                """
                
                # Execute the query with the provided email and password
                cur.execute(query, (email, password))
                
                # Fetch one result (should be unique due to email uniqueness)
                result = cur.fetchone()
                
                if result:
                    # Convert the result to a dictionary for easier use
                    employee_data = {
                        'employeeid': result[0],
                        'firstname': result[1], 
                        'lastname': result[2],
                        'email': result[3],
                        'isadmin': result[4]
                    }
                    return employee_data
                
                return None
                
        except Exception as e:
            print(f"Error during authentication: {e}")
            return None

    @staticmethod
    def get_employee_by_id(employee_id):
        """
        Get employee information by their ID.
        
        Args:
            employee_id (int): The employee's ID
            
        Returns:
            dict or None: Employee data if found, None otherwise
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Simple SQL query to get employee by ID
                query = """
                    SELECT employeeid, firstname, lastname, phone, email, isadmin
                    FROM employee 
                    WHERE employeeid = %s
                """
                
                cur.execute(query, (employee_id,))
                result = cur.fetchone()
                
                if result:
                    employee_data = {
                        'employeeid': result[0],
                        'firstname': result[1],
                        'lastname': result[2], 
                        'phone': result[3],
                        'email': result[4],
                        'isadmin': result[5]
                    }
                    return employee_data
                
                return None
                
        except Exception as e:
            print(f"Error getting employee by ID: {e}")
            return None

    @staticmethod
    def get_all_employees():
        """
        Get all employees from the database.
        
        Returns:
            list: List of employee dictionaries
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Get all employees (useful for admin pages)
                query = """
                    SELECT employeeid, firstname, lastname, phone, email, isadmin
                    FROM employee 
                    ORDER BY lastname, firstname
                """
                
                cur.execute(query)
                results = cur.fetchall()
                
                employees = []
                for result in results:
                    employee_data = {
                        'employeeid': result[0],
                        'firstname': result[1],
                        'lastname': result[2],
                        'phone': result[3], 
                        'email': result[4],
                        'isadmin': result[5]
                    }
                    employees.append(employee_data)
                
                return employees
                
        except Exception as e:
            print(f"Error getting all employees: {e}")
            return []

    @staticmethod
    def update_employee_password(employee_id, new_password):
        """
        Update an employee's password.
        
        Args:
            employee_id (int): The employee's ID
            new_password (str): The new password
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Simple update query
                query = """
                    UPDATE employee 
                    SET password = %s 
                    WHERE employeeid = %s
                """
                
                cur.execute(query, (new_password, employee_id))
                
                # Check if any rows were affected
                return cur.rowcount > 0
                
        except Exception as e:
            print(f"Error updating password: {e}")
            return False

    @staticmethod
    def create_availability(employee_id, avail_date, start_time, end_time):
        """
        Create a new availability record for an employee.
        
        Args:
            employee_id (int): The employee's ID
            avail_date (str): Date in YYYY-MM-DD format
            start_time (str): Start time in HH:MM format
            end_time (str): End time in HH:MM format
            
        Returns:
            int or None: availability_id if successful, None otherwise
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Check if employee exists first
                employee_check_query = """
                    SELECT employeeid FROM employee WHERE employeeid = %s
                """
                cur.execute(employee_check_query, (employee_id,))
                if not cur.fetchone():
                    print(f"Employee with ID {employee_id} not found")
                    return None
                
                # Insert availability record
                insert_query = """
                    INSERT INTO empavailability (employee_id, availdate, starttime, endtime)
                    VALUES (%s, %s, %s, %s)
                    RETURNING availability_id
                """
                
                cur.execute(insert_query, (employee_id, avail_date, start_time, end_time))
                result = cur.fetchone()
                
                if result:
                    availability_id = result[0]
                    print(f"Created availability record with ID: {availability_id}")
                    return availability_id
                
                return None
                
        except Exception as e:
            print(f"Error creating availability: {e}")
            return None

    @staticmethod
    def get_employee_availability(employee_id, start_date=None, end_date=None):
        """
        Get availability records for an employee.
        
        Args:
            employee_id (int): The employee's ID
            start_date (str, optional): Start date filter in YYYY-MM-DD format
            end_date (str, optional): End date filter in YYYY-MM-DD format
            
        Returns:
            list: List of availability records
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Build query with optional date filters
                base_query = """
                    SELECT ea.availability_id, ea.employee_id, ea.availdate, 
                           ea.starttime, ea.endtime,
                           e.firstname, e.lastname, e.email
                    FROM empavailability ea
                    JOIN employee e ON ea.employee_id = e.employeeid
                    WHERE ea.employee_id = %s
                """
                
                params = [employee_id]
                
                if start_date:
                    base_query += " AND ea.availdate >= %s"
                    params.append(start_date)
                
                if end_date:
                    base_query += " AND ea.availdate <= %s"
                    params.append(end_date)
                    
                base_query += " ORDER BY ea.availdate, ea.starttime"
                
                cur.execute(base_query, params)
                results = cur.fetchall()
                
                availability_records = []
                for result in results:
                    record = {
                        'availability_id': result[0],
                        'employee_id': result[1],
                        'availdate': result[2].strftime('%Y-%m-%d') if result[2] else None,
                        'starttime': str(result[3]) if result[3] else None,
                        'endtime': str(result[4]) if result[4] else None,
                        'employee_name': f"{result[5]} {result[6]}",
                        'employee_email': result[7]
                    }
                    availability_records.append(record)
                
                return availability_records
                
        except Exception as e:
            print(f"Error getting employee availability: {e}")
            return []

    @staticmethod
    def update_availability(availability_id, avail_date=None, start_time=None, end_time=None):
        """
        Update an existing availability record.
        
        Args:
            availability_id (int): The availability record ID
            avail_date (str, optional): New date in YYYY-MM-DD format
            start_time (str, optional): New start time in HH:MM format
            end_time (str, optional): New end time in HH:MM format
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Build dynamic update query
                update_fields = []
                params = []
                
                if avail_date is not None:
                    update_fields.append("availdate = %s")
                    params.append(avail_date)
                
                if start_time is not None:
                    update_fields.append("starttime = %s")
                    params.append(start_time)
                
                if end_time is not None:
                    update_fields.append("endtime = %s")
                    params.append(end_time)
                
                if not update_fields:
                    return False
                
                query = f"""
                    UPDATE empavailability 
                    SET {', '.join(update_fields)}
                    WHERE availability_id = %s
                """
                params.append(availability_id)
                
                cur.execute(query, params)
                return cur.rowcount > 0
                
        except Exception as e:
            print(f"Error updating availability: {e}")
            return False

    @staticmethod
    def delete_availability(availability_id):
        """
        Delete an availability record.
        
        Args:
            availability_id (int): The availability record ID
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with BaseRepository.get_cursor() as cur:
                query = """
                    DELETE FROM empavailability 
                    WHERE availability_id = %s
                """
                
                cur.execute(query, (availability_id,))
                return cur.rowcount > 0
                
        except Exception as e:
            print(f"Error deleting availability: {e}")
            return False

    @staticmethod
    def get_available_employees_for_datetime(date_str, time_str):
        """
        Get all employees available for a specific date and time.
        
        Args:
            date_str (str): Date in YYYY-MM-DD format
            time_str (str): Time in HH:MM format
            
        Returns:
            list: List of available employees with their details
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Find employees who have availability for the specified date and time
                query = """
                    SELECT DISTINCT
                        e.employeeid,
                        e.firstname,
                        e.lastname,
                        e.email,
                        e.phone,
                        ea.availability_id,
                        ea.starttime,
                        ea.endtime
                    FROM employee e
                    JOIN empavailability ea ON e.employeeid = ea.employee_id
                    WHERE ea.availdate = %s
                      AND ea.starttime <= %s
                      AND ea.endtime > %s
                      AND e.isadmin = FALSE
                    ORDER BY e.lastname, e.firstname;
                """
                
                cur.execute(query, (date_str, time_str, time_str))
                results = cur.fetchall()
                
                available_employees = []
                for result in results:
                    employee_data = {
                        'employeeid': result[0],
                        'firstname': result[1],
                        'lastname': result[2],
                        'email': result[3],
                        'phone': result[4],
                        'availability_id': result[5],
                        'starttime': str(result[6]) if result[6] else None,
                        'endtime': str(result[7]) if result[7] else None,
                        'full_name': f"{result[1]} {result[2]}"
                    }
                    available_employees.append(employee_data)
                
                return available_employees
                
        except Exception as e:
            print(f"Error getting available employees: {e}")
            return []

    @staticmethod
    def get_booked_time_ranges_for_date(date_str):
        """
        Utility function to get all booked time ranges for a specific date.
        Returns time ranges that should be crossed out/unavailable for new bookings.
        
        Args:
            date_str (str): Date in YYYY-MM-DD format
            
        Returns:
            dict: Dictionary with employee_id as keys and list of booked time ranges as values
                  Format: {employee_id: [{'start_time': 'HH:MM', 'end_time': 'HH:MM', 'service_name': '...'}]}
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Debug: Let's first check what records exist
                debug_query = """
                    SELECT 
                        sr.requestid,
                        sr.preferred_datetime,
                        DATE(sr.preferred_datetime) as date_part,
                        sr.service_id,
                        s.duration_hours
                    FROM servicerequests sr
                    LEFT JOIN services s ON sr.service_id = s.service_id
                    WHERE DATE(sr.preferred_datetime) = %s
                    ORDER BY sr.preferred_datetime;
                """
                
                cur.execute(debug_query, (date_str,))
                debug_results = cur.fetchall()
                print(f"DEBUG: Found {len(debug_results)} service requests for {date_str}:")
                for debug_result in debug_results:
                    print(f"  - Request {debug_result[0]}: {debug_result[1]}, service_id={debug_result[2]}, duration={debug_result[4]}h")
                
                # Main query with better timezone handling
                query = """
                    SELECT 
                        wa.employeeid,
                        EXTRACT(HOUR FROM sr.preferred_datetime)::text || ':' || 
                        LPAD(EXTRACT(MINUTE FROM sr.preferred_datetime)::text, 2, '0') as start_time,
                        EXTRACT(HOUR FROM (sr.preferred_datetime + INTERVAL '1 hour' * COALESCE(s.duration_hours, 1)))::text || ':' || 
                        LPAD(EXTRACT(MINUTE FROM (sr.preferred_datetime + INTERVAL '1 hour' * COALESCE(s.duration_hours, 1)))::text, 2, '0') as end_time,
                        COALESCE(s.duration_hours, 1) as duration_hours,
                        s.job_name as service_name,
                        sr.requestid,
                        CONCAT(e.firstname, ' ', e.lastname) as employee_name
                    FROM work_assignments wa
                    JOIN servicerequests sr ON wa.requestid = sr.requestid
                    JOIN employee e ON wa.employeeid = e.employeeid
                    LEFT JOIN services s ON sr.service_id = s.service_id
                    WHERE DATE(sr.preferred_datetime) = %s
                    ORDER BY wa.employeeid, sr.preferred_datetime;
                """
                
                cur.execute(query, (date_str,))
                results = cur.fetchall()
                
                booked_ranges = {}
                for result in results:
                    employee_id = result[0]
                    if employee_id not in booked_ranges:
                        booked_ranges[employee_id] = []
                    
                    booked_ranges[employee_id].append({
                        'start_time': str(result[1]),
                        'end_time': str(result[2]),
                        'duration_hours': float(result[3]),
                        'service_name': result[4] or 'Unknown Service',
                        'request_id': result[5],
                        'employee_name': result[6]
                    })
                
                return booked_ranges
                
        except Exception as e:
            print(f"Error getting booked time ranges: {e}")
            return {}

    @staticmethod
    def get_availability_time_slots_for_date(date_str):
        """
        Get all available time slots for a specific date from employee availability.
        
        Args:
            date_str (str): Date in YYYY-MM-DD format
            
        Returns:
            list: List of time slots with employee information
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Get all availability slots for the date with employee info
                query = """
                    SELECT 
                        ea.availability_id,
                        ea.employee_id,
                        ea.starttime,
                        ea.endtime,
                        e.firstname,
                        e.lastname
                    FROM empavailability ea
                    JOIN employee e ON ea.employee_id = e.employeeid
                    WHERE ea.availdate = %s
                      AND e.isadmin = FALSE
                    ORDER BY ea.starttime, e.lastname, e.firstname;
                """
                
                cur.execute(query, (date_str,))
                results = cur.fetchall()
                
                # Get booked time ranges for this date using our utility function
                booked_ranges = EmployeeRepository.get_booked_time_ranges_for_date(date_str)
                time_slots = []
                for result in results:
                    employee_id = result[1]
                    employee_booked_ranges = booked_ranges.get(employee_id, [])
                    
                    slot_data = {
                        'availability_id': result[0],
                        'employee_id': employee_id,
                        'starttime': str(result[2]) if result[2] else None,
                        'endtime': str(result[3]) if result[3] else None,
                        'employee_name': f"{result[4]} {result[5]}",
                        'employee_firstname': result[4],
                        'employee_lastname': result[5],
                        'booked_ranges': employee_booked_ranges  # Include booked ranges for this employee
                    }
                    time_slots.append(slot_data)
                
                return time_slots
                
        except Exception as e:
            print(f"Error getting time slots for date: {e}")
            return []

    @staticmethod
    def create_work_assignment(request_id, employee_id):
        """
        Create a work assignment for a service request.
        
        Args:
            request_id (int): The service request ID
            employee_id (int): The employee ID to assign
            
        Returns:
            int or None: assignment_id if successful, None otherwise
        """
        try:
            with BaseRepository.get_cursor() as cur:
                # Insert work assignment
                query = """
                    INSERT INTO work_assignments (requestid, employeeid)
                    VALUES (%s, %s)
                    RETURNING assignment_id;
                """
                
                cur.execute(query, (request_id, employee_id))
                result = cur.fetchone()
                
                if result:
                    assignment_id = result[0]
                    print(f"Created work assignment with ID: {assignment_id}")
                    return assignment_id
                
                return None
                
        except Exception as e:
            print(f"Error creating work assignment: {e}")
            return None

    @staticmethod
    def get_work_assignments_by_employee(employee_id):
        """
        Get all work assignments for a specific employee.
        
        Args:
            employee_id (int): The employee ID
            
        Returns:
            list: List of work assignments with request details
        """
        try:
            with BaseRepository.get_cursor() as cur:
                query = """
                    SELECT 
                        wa.assignment_id,
                        wa.requestid,
                        wa.employeeid,
                        sr.preferred_datetime,
                        sr.description,
                        s.job_name,
                        st.service_type_name
                    FROM work_assignments wa
                    JOIN servicerequests sr ON wa.requestid = sr.requestid
                    LEFT JOIN services s ON sr.service_id = s.service_id
                    LEFT JOIN service_types st ON s.service_type_id = st.service_type_id
                    WHERE wa.employeeid = %s
                    ORDER BY sr.preferred_datetime;
                """
                
                cur.execute(query, (employee_id,))
                results = cur.fetchall()
                
                assignments = []
                for result in results:
                    assignment_data = {
                        'assignment_id': result[0],
                        'requestid': result[1],
                        'employeeid': result[2],
                        'preferred_datetime': result[3],
                        'description': result[4],
                        'job_name': result[5],
                        'service_type': result[6]
                    }
                    assignments.append(assignment_data)
                
                return assignments
                
        except Exception as e:
            print(f"Error getting work assignments: {e}")
            return []