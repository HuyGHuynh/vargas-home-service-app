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
    def lookup_by_email_or_phone(email=None, phone=None):
        """
        Look up warranties by customer email or phone number.
        
        Args:
            email (str, optional): Customer email
            phone (str, optional): Customer phone number
            
        Returns:
            list[dict]: List of warranty records with details
        """
        if not email and not phone:
            return []
        
        with BaseRepository.get_cursor() as cur:
            query = """
                SELECT 
                    w.id,
                    w.service_name,
                    w.service_type,
                    w.work_order_id,
                    w.start_date,
                    w.end_date,
                    w.coverage,
                    w.notes
                FROM warranties w
                INNER JOIN "user" u ON w.user_id = u.id
                WHERE 
                    (u.email = %s OR %s = '') AND
                    (u.phoneNumber = %s OR %s = '')
                ORDER BY w.start_date DESC;
            """
            
            email_param = email or ''
            phone_param = phone or ''
            
            cur.execute(query, (email_param, email_param, phone_param, phone_param))
            rows = cur.fetchall()
            
            # Format warranty data
            warranties = []
            for row in rows:
                warranties.append({
                    'id': row[0],
                    'serviceName': row[1],
                    'serviceType': row[2],
                    'workOrderId': row[3],
                    'startDate': row[4].isoformat() if row[4] else None,
                    'endDate': row[5].isoformat() if row[5] else None,
                    'coverage': row[6],
                    'notes': row[7]
                })
            
            return warranties
    
    @staticmethod
    def get_by_id(warranty_id):
        """
        Get a warranty by ID.
        
        Args:
            warranty_id (int): The warranty ID
            
        Returns:
            dict or None: Warranty data or None if not found
        """
        with BaseRepository.get_cursor() as cur:
            cur.execute("""
                SELECT 
                    id,
                    service_name,
                    service_type,
                    work_order_id,
                    start_date,
                    end_date,
                    coverage,
                    notes,
                    user_id
                FROM warranties
                WHERE id = %s;
            """, (warranty_id,))
            row = cur.fetchone()
            
            if row:
                return {
                    'id': row[0],
                    'serviceName': row[1],
                    'serviceType': row[2],
                    'workOrderId': row[3],
                    'startDate': row[4].isoformat() if row[4] else None,
                    'endDate': row[5].isoformat() if row[5] else None,
                    'coverage': row[6],
                    'notes': row[7],
                    'userId': row[8]
                }
            return None
    
    @staticmethod
    def create_service_request(warranty_id, work_order_id, customer_email, customer_phone,
                               issue_type, urgency, problem_description, status='pending'):
        """
        Create a service request for a warranty.
        
        Args:
            warranty_id (int): The warranty ID
            work_order_id (int): The work order ID
            customer_email (str): Customer email
            customer_phone (str): Customer phone
            issue_type (str): Type of issue
            urgency (str): Urgency level
            problem_description (str): Description of the problem
            status (str): Request status (default: 'pending')
            
        Returns:
            int: The created service request ID
            
        Raises:
            psycopg2.Error: If database operation fails
        """
        with BaseRepository.get_cursor() as cur:
            insert_query = """
                INSERT INTO service_requests 
                (warranty_id, work_order_id, customer_email, customer_phone, 
                 issue_type, urgency, problem_description, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id;
            """
            cur.execute(insert_query, (
                warranty_id, work_order_id, customer_email, customer_phone,
                issue_type, urgency, problem_description, status
            ))
            request_id = cur.fetchone()[0]
            return request_id
