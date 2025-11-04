"""
Repository for warranty data access.
Handles all database operations for warranties using raw SQL.
"""
import psycopg2
from datetime import datetime, date
from .base_repository import BaseRepository


class WarrantyRepository(BaseRepository):
    """Repository for warranty-related database operations."""
    
    @staticmethod
    def lookup_warranty_by_contact_and_service_type(email=None, phone=None, service_type=None):
        """
        Look up warranties by customer contact info and service type.
        
        Args:
            email (str, optional): Customer email
            phone (str, optional): Customer phone number
            service_type (str, optional): Service type name
            
        Returns:
            list[dict]: List of warranty records with full details
        """
        if not email and not phone:
            return []
        
        with BaseRepository.get_cursor() as cur:
            # Build query with joins to get all warranty details based on actual schema
            query = """
                SELECT 
                    w.warranty_id,
                    w.start_date,
                    w.end_date,
                    w.description as warranty_description,
                    w.price as warranty_price,
                    w.status as warranty_status,
                    c.customerid,
                    c.firstname,
                    c.lastname,
                    c.phone,
                    c.email,
                    sr.requestid,
                    sr.preferred_datetime,
                    sr.description as service_description,
                    sr.status as service_request_status,
                    s.job_name,
                    s.job_desc,
                    s.service_price,
                    s.duration_hours,
                    st.service_type_name
                FROM warranties w
                INNER JOIN servicerequests sr ON w.request_id = sr.requestid
                INNER JOIN customer c ON sr.customerid = c.customerid
                INNER JOIN services s ON sr.service_id = s.service_id
                INNER JOIN service_types st ON s.service_type_id = st.service_type_id
                WHERE 
                    (c.email = %s OR %s = '') AND
                    (c.phone = %s OR %s = '') AND
                    (st.service_type_name = %s OR %s = '')
                ORDER BY w.start_date DESC;
            """
            
            email_param = email or ''
            phone_param = phone or ''
            service_type_param = service_type or ''
            
            cur.execute(query, (
                email_param, email_param, 
                phone_param, phone_param,
                service_type_param, service_type_param
            ))
            rows = cur.fetchall()
            
            # Format warranty data
            warranties = []
            for row in rows:
                warranty_data = {
                    'warranty_id': row[0],
                    'start_date': row[1].isoformat() if row[1] else None,
                    'end_date': row[2].isoformat() if row[2] else None,
                    'warranty_description': row[3],
                    'warranty_price': float(row[4]) if row[4] else 0.0,
                    'warranty_status': row[5],
                    'customer': {
                        'customer_id': row[6],
                        'first_name': row[7],
                        'last_name': row[8],
                        'phone': row[9],
                        'email': row[10]
                    },
                    'service_request': {
                        'request_id': row[11],
                        'preferred_datetime': row[12].isoformat() if row[12] else None,
                        'description': row[13],
                        'status': row[14]
                    },
                    'service': {
                        'job_name': row[15],
                        'job_description': row[16],
                        'service_price': float(row[17]) if row[17] else 0.0,
                        'duration_hours': float(row[18]) if row[18] else 0.0,
                        'service_type': row[19]
                    }
                }
                warranties.append(warranty_data)
            
            return warranties
    
    @staticmethod
    def get_warranty_by_id(warranty_id):
        """
        Get a warranty by ID with complete details.
        
        Args:
            warranty_id (int): The warranty ID
            
        Returns:
            dict or None: Warranty data or None if not found
        """
        with BaseRepository.get_cursor() as cur:
            query = """
                SELECT 
                    w.warranty_id,
                    w.start_date,
                    w.end_date,
                    w.description,
                    w.price,
                    w.status,
                    w.request_id
                FROM warranties w
                WHERE w.warranty_id = %s;
            """
            cur.execute(query, (warranty_id,))
            row = cur.fetchone()
            
            if row:
                return {
                    'warranty_id': row[0],
                    'start_date': row[1].isoformat() if row[1] else None,
                    'end_date': row[2].isoformat() if row[2] else None,
                    'description': row[3],
                    'price': float(row[4]) if row[4] else 0.0,
                    'status': row[5],
                    'request_id': row[6]
                }
            return None
    

    
    @staticmethod
    def get_all_warranties():
        """
        Get all warranties with customer, service, and service request details for admin view.
        
        Returns:
            list: List of warranty dictionaries with related data
        """
        try:
            with BaseRepository.get_cursor() as cursor:
                    query = """
                        SELECT 
                            w.warranty_id,
                            w.start_date,
                            w.end_date,
                            w.description as warranty_description,
                            w.price as warranty_price,
                            w.status as warranty_status,
                            sr.requestid as service_request_id,
                            sr.status as service_request_status,
                            sr.description as service_request_description,
                            c.customerid,
                            c.firstname,
                            c.lastname,
                            c.phone,
                            c.email,
                            s.service_id,
                            s.job_name,
                            s.job_desc,
                            s.service_price,
                            s.duration_hours,
                            st.service_type_name as service_type
                        FROM warranties w
                        LEFT JOIN servicerequests sr ON w.request_id = sr.requestid
                        LEFT JOIN customer c ON sr.customerid = c.customerid
                        LEFT JOIN services s ON sr.service_id = s.service_id
                        LEFT JOIN service_types st ON s.service_type_id = st.service_type_id
                        ORDER BY w.warranty_id DESC;
                    """
                    
                    cursor.execute(query)
                    results = cursor.fetchall()
                    
                    warranties = []
                    for row in results:
                        warranty = {
                            'warranty_id': row[0],
                            'start_date': row[1].isoformat() if row[1] else None,
                            'end_date': row[2].isoformat() if row[2] else None,
                            'warranty_description': row[3],
                            'warranty_price': float(row[4]) if row[4] else 0.0,
                            'warranty_status': row[5],
                            'service_request': {
                                'request_id': row[6],
                                'status': row[7],
                                'description': row[8]
                            },
                            'customer': {
                                'customerid': row[9],
                                'first_name': row[10],
                                'last_name': row[11],
                                'phone': row[12],
                                'email': row[13]
                            },
                            'service': {
                                'service_id': row[14],
                                'job_name': row[15],
                                'job_description': row[16],
                                'service_price': float(row[17]) if row[17] else 0.0,
                                'duration_hours': row[18],
                                'service_type': row[19]
                            }
                        }
                        warranties.append(warranty)
                    
                    return warranties
                    
        except Exception as e:
            print(f"Error in get_all_warranties: {e}")
            return []
    
    @staticmethod
    def update_warranty_status(warranty_id, new_status):
        """
        Update warranty status.
        
        Args:
            warranty_id (int): Warranty ID
            new_status (str): New status ('Active', 'Pending', 'Inactive')
            
        Returns:
            bool: True if updated successfully
        """
        try:
            with BaseRepository.get_cursor() as cursor:
                query = """
                    UPDATE warranties 
                    SET status = %s 
                    WHERE warranty_id = %s;
                """
                
                cursor.execute(query, (new_status, warranty_id))
                
                if cursor.rowcount > 0:
                    return True
                else:
                    return False
                        
        except Exception as e:
            print(f"Error updating warranty status: {e}")
            return False
    
    @staticmethod
    def delete_warranty(warranty_id):
        """
        Delete a warranty by ID.
        
        Args:
            warranty_id (int): Warranty ID to delete
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            with BaseRepository.get_cursor() as cursor:
                query = "DELETE FROM warranties WHERE warranty_id = %s;"
                
                cursor.execute(query, (warranty_id,))
                
                if cursor.rowcount > 0:
                    return True
                else:
                    return False
                        
        except Exception as e:
            print(f"Error deleting warranty: {e}")
            return False
    
    @staticmethod
    def update_expired_warranties():
        """
        Update warranties that have passed their end date to 'Inactive' status.
        
        Returns:
            int: Number of warranties updated
        """
        try:
            with BaseRepository.get_cursor() as cursor:
                query = """
                    UPDATE warranties 
                    SET status = 'Inactive' 
                    WHERE end_date < CURRENT_DATE 
                    AND status != 'Inactive';
                """
                
                cursor.execute(query)
                return cursor.rowcount
                        
        except Exception as e:
            print(f"Error updating expired warranties: {e}")
            return 0
