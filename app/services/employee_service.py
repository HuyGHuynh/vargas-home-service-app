"""
Employee service for handling employee-related business logic.
"""
from repositories.employee_repository import EmployeeRepository
from datetime import datetime, date


class EmployeeService:
    """Service class for employee operations."""

    @staticmethod
    def submit_availability(employee_id, avail_date, start_time, end_time):
        """
        Submit employee availability with validation.
        
        Args:
            employee_id (int): The employee's ID
            avail_date (str): Date in YYYY-MM-DD format
            start_time (str): Start time in HH:MM format
            end_time (str): End time in HH:MM format
            
        Returns:
            dict: Result with success status and message
        """
        try:
            # Validate employee exists
            employee = EmployeeRepository.get_employee_by_id(employee_id)
            if not employee:
                return {
                    "success": False,
                    "message": "Employee not found"
                }
            
            # Validate date format and that it's not in the past
            try:
                availability_date = datetime.strptime(avail_date, '%Y-%m-%d').date()
                today = date.today()
                
                if availability_date < today:
                    return {
                        "success": False,
                        "message": "Cannot submit availability for past dates"
                    }
                    
            except ValueError:
                return {
                    "success": False,
                    "message": "Invalid date format. Please use YYYY-MM-DD"
                }
            
            # Validate time format and that end time is after start time
            try:
                start_time_obj = datetime.strptime(start_time, '%H:%M').time()
                end_time_obj = datetime.strptime(end_time, '%H:%M').time()
                
                if end_time_obj <= start_time_obj:
                    return {
                        "success": False,
                        "message": "End time must be after start time"
                    }
                    
            except ValueError:
                return {
                    "success": False,
                    "message": "Invalid time format. Please use HH:MM"
                }
            
            # Check if employee already has availability for this date
            existing_availability = EmployeeRepository.get_employee_availability(
                employee_id, avail_date, avail_date
            )
            
            if existing_availability:
                return {
                    "success": False,
                    "message": f"You already have availability submitted for {avail_date}. Please update or delete the existing record first."
                }
            
            # Create the availability record
            availability_id = EmployeeRepository.create_availability(
                employee_id, avail_date, start_time, end_time
            )
            
            if availability_id:
                return {
                    "success": True,
                    "message": f"Availability submitted successfully for {avail_date}",
                    "availability_id": availability_id,
                    "employee_name": f"{employee['firstname']} {employee['lastname']}"
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to save availability to database"
                }
                
        except Exception as e:
            print(f"Error in submit_availability: {e}")
            return {
                "success": False,
                "message": "An error occurred while submitting availability"
            }

    @staticmethod
    def get_employee_availability_summary(employee_id, days_ahead=30):
        """
        Get employee availability summary for upcoming days.
        
        Args:
            employee_id (int): The employee's ID
            days_ahead (int): Number of days ahead to look
            
        Returns:
            dict: Result with availability data
        """
        try:
            # Calculate date range
            today = date.today()
            end_date = today.replace(day=today.day + days_ahead) if today.day + days_ahead <= 31 else today.replace(month=today.month + 1, day=days_ahead - (31 - today.day))
            
            # Get availability records
            availability_records = EmployeeRepository.get_employee_availability(
                employee_id, 
                today.strftime('%Y-%m-%d'),
                end_date.strftime('%Y-%m-%d')
            )
            
            # Get employee info
            employee = EmployeeRepository.get_employee_by_id(employee_id)
            
            return {
                "success": True,
                "employee": employee,
                "availability_records": availability_records,
                "date_range": {
                    "start": today.strftime('%Y-%m-%d'),
                    "end": end_date.strftime('%Y-%m-%d')
                }
            }
            
        except Exception as e:
            print(f"Error getting availability summary: {e}")
            return {
                "success": False,
                "message": "Error retrieving availability data"
            }

    @staticmethod
    def update_employee_availability(availability_id, employee_id, avail_date=None, start_time=None, end_time=None):
        """
        Update employee availability with validation.
        
        Args:
            availability_id (int): The availability record ID
            employee_id (int): The employee's ID (for authorization)
            avail_date (str, optional): New date in YYYY-MM-DD format
            start_time (str, optional): New start time in HH:MM format
            end_time (str, optional): New end time in HH:MM format
            
        Returns:
            dict: Result with success status and message
        """
        try:
            # Get existing availability record to verify ownership
            existing_records = EmployeeRepository.get_employee_availability(employee_id)
            availability_record = next((r for r in existing_records if r['availability_id'] == availability_id), None)
            
            if not availability_record:
                return {
                    "success": False,
                    "message": "Availability record not found or you don't have permission to modify it"
                }
            
            # Validate new date if provided
            if avail_date:
                try:
                    availability_date = datetime.strptime(avail_date, '%Y-%m-%d').date()
                    if availability_date < date.today():
                        return {
                            "success": False,
                            "message": "Cannot set availability for past dates"
                        }
                except ValueError:
                    return {
                        "success": False,
                        "message": "Invalid date format. Please use YYYY-MM-DD"
                    }
            
            # Validate time format if provided
            if start_time or end_time:
                try:
                    if start_time:
                        datetime.strptime(start_time, '%H:%M')
                    if end_time:
                        datetime.strptime(end_time, '%H:%M')
                        
                    # Check if both times are provided or use existing ones
                    check_start = start_time if start_time else availability_record['starttime']
                    check_end = end_time if end_time else availability_record['endtime']
                    
                    if datetime.strptime(check_end, '%H:%M').time() <= datetime.strptime(check_start, '%H:%M').time():
                        return {
                            "success": False,
                            "message": "End time must be after start time"
                        }
                        
                except ValueError:
                    return {
                        "success": False,
                        "message": "Invalid time format. Please use HH:MM"
                    }
            
            # Update the record
            success = EmployeeRepository.update_availability(
                availability_id, avail_date, start_time, end_time
            )
            
            if success:
                return {
                    "success": True,
                    "message": "Availability updated successfully"
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to update availability"
                }
                
        except Exception as e:
            print(f"Error updating availability: {e}")
            return {
                "success": False,
                "message": "An error occurred while updating availability"
            }

    @staticmethod
    def delete_employee_availability(availability_id, employee_id):
        """
        Delete employee availability with authorization check.
        
        Args:
            availability_id (int): The availability record ID
            employee_id (int): The employee's ID (for authorization)
            
        Returns:
            dict: Result with success status and message
        """
        try:
            # Verify the availability record belongs to this employee
            existing_records = EmployeeRepository.get_employee_availability(employee_id)
            availability_record = next((r for r in existing_records if r['availability_id'] == availability_id), None)
            
            if not availability_record:
                return {
                    "success": False,
                    "message": "Availability record not found or you don't have permission to delete it"
                }
            
            # Delete the record
            success = EmployeeRepository.delete_availability(availability_id)
            
            if success:
                return {
                    "success": True,
                    "message": "Availability deleted successfully"
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to delete availability"
                }
                
        except Exception as e:
            print(f"Error deleting availability: {e}")
            return {
                "success": False,
                "message": "An error occurred while deleting availability"
            }

    @staticmethod
    def auto_assign_employee_to_request(request_id, preferred_date, preferred_time):
        """
        Automatically assign an available employee to a service request.
        
        Args:
            request_id (int): The service request ID
            preferred_date (str): Date in YYYY-MM-DD format
            preferred_time (str): Time in HH:MM format
            
        Returns:
            dict: Result with assignment details
        """
        try:
            # Find available employees for the requested date/time
            available_employees = EmployeeRepository.get_available_employees_for_datetime(
                preferred_date, preferred_time
            )
            
            if not available_employees:
                return {
                    "success": False,
                    "message": f"No employees available for {preferred_date} at {preferred_time}"
                }
            
            # Select the first available employee (you could implement more sophisticated logic here)
            selected_employee = available_employees[0]
            
            # Create work assignment
            assignment_id = EmployeeRepository.create_work_assignment(
                request_id, selected_employee['employeeid']
            )
            
            if assignment_id:
                return {
                    "success": True,
                    "message": "Employee assigned successfully",
                    "assignment_id": assignment_id,
                    "assigned_employee": {
                        "employeeid": selected_employee['employeeid'],
                        "name": selected_employee['full_name'],
                        "email": selected_employee['email'],
                        "phone": selected_employee['phone']
                    }
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to create work assignment"
                }
                
        except Exception as e:
            print(f"Error in auto_assign_employee_to_request: {e}")
            return {
                "success": False,
                "message": "An error occurred while assigning employee"
            }

    @staticmethod
    def get_employee_assignments(employee_id):
        """
        Get all work assignments for an employee.
        
        Args:
            employee_id (int): The employee ID
            
        Returns:
            dict: Result with assignments list
        """
        try:
            assignments = EmployeeRepository.get_work_assignments_by_employee(employee_id)
            
            return {
                "success": True,
                "assignments": assignments
            }
            
        except Exception as e:
            print(f"Error getting employee assignments: {e}")
            return {
                "success": False,
                "message": "Error retrieving assignments"
            }