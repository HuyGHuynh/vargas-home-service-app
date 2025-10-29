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