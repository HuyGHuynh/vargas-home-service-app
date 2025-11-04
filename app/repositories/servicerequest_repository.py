"""
Repository for service request data access.
Handles all database operations for service requests using raw SQL.
"""
import psycopg2
from datetime import datetime, date
from .base_repository import BaseRepository


class ServiceRequestRepository(BaseRepository):
    """Repository for service request-related database operations."""
    
    @staticmethod
    def get_all_service_requests():
        """
        Get all service requests with full customer, address, and service details.
        
        Returns:
            list[dict]: List of service request records with related data
        """
        try:
            with BaseRepository.get_cursor() as cursor:
                query = """
                    SELECT 
                        sr.requestid,
                        sr.customerid,
                        sr.addressid,
                        sr.preferred_datetime,
                        sr.service_id,
                        sr.description as request_description,
                        sr.status as request_status,
                        sr.imageurl,
                        c.firstname,
                        c.lastname,
                        c.phone as customer_phone,
                        c.email as customer_email,
                        ab.address,
                        ab.city,
                        ab.state,
                        ab.zip_code,
                        s.job_name,
                        s.job_desc,
                        s.service_price,
                        s.duration_hours,
                        st.service_type_name,
                        fpd.pricetotal as final_price,
                        e.employeeid,
                        e.firstname as employee_firstname,
                        e.lastname as employee_lastname,
                        e.phone as employee_phone,
                        e.email as employee_email,
                        e.status as employee_status,
                        wa.assignment_id
                    FROM servicerequests sr
                    LEFT JOIN customer c ON sr.customerid = c.customerid
                    LEFT JOIN addressbook ab ON sr.addressid = ab.address_id
                    LEFT JOIN services s ON sr.service_id = s.service_id
                    LEFT JOIN service_types st ON s.service_type_id = st.service_type_id
                    LEFT JOIN finalpricedetails fpd ON sr.requestid = fpd.request_id
                    LEFT JOIN work_assignments wa ON sr.requestid = wa.requestid
                    LEFT JOIN employee e ON wa.employeeid = e.employeeid
                    ORDER BY sr.preferred_datetime DESC;
                """
                
                cursor.execute(query)
                results = cursor.fetchall()
                
                service_requests = []
                for row in results:
                    service_request = {
                        'request_id': row[0],
                        'customer_id': row[1],
                        'address_id': row[2],
                        'preferred_datetime': row[3].isoformat() if row[3] else None,
                        'service_id': row[4],
                        'request_description': row[5],
                        'request_status': row[6],
                        'image_url': row[7],
                        'customer': {
                            'first_name': row[8],
                            'last_name': row[9],
                            'phone': row[10],
                            'email': row[11]
                        },
                        'address': {
                            'street': row[12],
                            'city': row[13],
                            'state': row[14],
                            'zip_code': row[15]
                        },
                        'service': {
                            'job_name': row[16],
                            'job_description': row[17],
                            'service_price': float(row[18]) if row[18] else 0.0,
                            'duration_hours': float(row[19]) if row[19] else 0.0,
                            'service_type': row[20]
                        },
                        'final_price': float(row[21]) if row[21] else None,
                        'assigned_employee': {
                            'employee_id': row[22],
                            'first_name': row[23],
                            'last_name': row[24],
                            'phone': row[25],
                            'email': row[26],
                            'status': row[27],
                            'assignment_id': row[28]
                        } if row[22] else None  # Only include if employee is assigned
                    }
                    service_requests.append(service_request)
                
                return service_requests
                
        except Exception as e:
            print(f"Error in get_all_service_requests: {e}")
            return []
    
    @staticmethod
    def get_service_request_by_id(request_id):
        """
        Get a service request by ID with full details.
        
        Args:
            request_id (int): The service request ID
            
        Returns:
            dict or None: Service request data or None if not found
        """
        try:
            with BaseRepository.get_cursor() as cursor:
                query = """
                    SELECT 
                        sr.requestid,
                        sr.customerid,
                        sr.addressid,
                        sr.preferred_datetime,
                        sr.service_id,
                        sr.description as request_description,
                        sr.status as request_status,
                        sr.imageurl,
                        c.firstname,
                        c.lastname,
                        c.phone as customer_phone,
                        c.email as customer_email,
                        ab.address,
                        ab.city,
                        ab.state,
                        ab.zip_code,
                        s.job_name,
                        s.job_desc,
                        s.service_price,
                        s.duration_hours,
                        st.service_type_name,
                        fpd.pricetotal as final_price,
                        e.employeeid,
                        e.firstname as employee_firstname,
                        e.lastname as employee_lastname,
                        e.phone as employee_phone,
                        e.email as employee_email,
                        e.status as employee_status,
                        wa.assignment_id
                    FROM servicerequests sr
                    LEFT JOIN customer c ON sr.customerid = c.customerid
                    LEFT JOIN addressbook ab ON sr.addressid = ab.address_id
                    LEFT JOIN services s ON sr.service_id = s.service_id
                    LEFT JOIN service_types st ON s.service_type_id = st.service_type_id
                    LEFT JOIN finalpricedetails fpd ON sr.requestid = fpd.request_id
                    LEFT JOIN work_assignments wa ON sr.requestid = wa.requestid
                    LEFT JOIN employee e ON wa.employeeid = e.employeeid
                    WHERE sr.requestid = %s;
                """
                
                cursor.execute(query, (request_id,))
                row = cursor.fetchone()
                
                if row:
                    return {
                        'request_id': row[0],
                        'customer_id': row[1],
                        'address_id': row[2],
                        'preferred_datetime': row[3].isoformat() if row[3] else None,
                        'service_id': row[4],
                        'request_description': row[5],
                        'request_status': row[6],
                        'image_url': row[7],
                        'customer': {
                            'first_name': row[8],
                            'last_name': row[9],
                            'phone': row[10],
                            'email': row[11]
                        },
                        'address': {
                            'street': row[12],
                            'city': row[13],
                            'state': row[14],
                            'zip_code': row[15]
                        },
                        'service': {
                            'job_name': row[16],
                            'job_description': row[17],
                            'service_price': float(row[18]) if row[18] else 0.0,
                            'duration_hours': float(row[19]) if row[19] else 0.0,
                            'service_type': row[20]
                        },
                        'final_price': float(row[21]) if row[21] else None,
                        'assigned_employee': {
                            'employee_id': row[22],
                            'first_name': row[23],
                            'last_name': row[24],
                            'phone': row[25],
                            'email': row[26],
                            'status': row[27],
                            'assignment_id': row[28]
                        } if row[22] else None  # Only include if employee is assigned
                    }
                return None
                
        except Exception as e:
            print(f"Error in get_service_request_by_id: {e}")
            return None
    
    @staticmethod
    def update_service_request_status(request_id, new_status):
        """
        Update service request status.
        
        Args:
            request_id (int): Service request ID
            new_status (str): New status ('Pending', 'In Progress', 'Completed', 'Cancelled')
            
        Returns:
            bool: True if updated successfully
        """
        try:
            valid_statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled']
            if new_status not in valid_statuses:
                print(f"Invalid status: {new_status}. Must be one of {valid_statuses}")
                return False
                
            with BaseRepository.get_cursor() as cursor:
                query = """
                    UPDATE servicerequests 
                    SET status = %s 
                    WHERE requestid = %s;
                """
                
                cursor.execute(query, (new_status, request_id))
                
                if cursor.rowcount > 0:
                    return True
                else:
                    return False
                        
        except Exception as e:
            print(f"Error updating service request status: {e}")
            return False