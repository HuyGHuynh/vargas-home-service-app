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