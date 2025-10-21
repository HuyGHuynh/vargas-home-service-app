"""
Repository for services data access.
Handles all database operations for services using raw SQL.
"""
import psycopg2
from datetime import datetime, date
from .base_repository import BaseRepository


class ServiceRepository(BaseRepository):
    """Repository for services-related database operations."""
    
    @staticmethod
    def get_all_services():
        """
        Get all services with their category information.
        Returns services ordered by category and job name.
        """
        query = """
        SELECT 
            s.service_id,
            st.service_type_name AS category,
            s.job_name,
            s.job_desc,
            s.service_price,
            s.duration_hours
        FROM services s
        JOIN service_types st 
            ON s.service_type_id = st.service_type_id
        ORDER BY st.service_type_name, s.job_name;
        """
        
        with BaseRepository.get_dict_cursor() as cur:
            cur.execute(query)
            return cur.fetchall()
    
    @staticmethod
    def get_service_types():
        """Get all service types for dropdown options."""
        query = """
        SELECT service_type_id, service_type_name 
        FROM service_types 
        ORDER BY service_type_name;
        """
        
        with BaseRepository.get_dict_cursor() as cur:
            cur.execute(query)
            return cur.fetchall()
    
    @staticmethod
    def get_services_by_type(service_type_name):
        """Get all services for a specific service type."""
        query = """
        SELECT 
            s.service_id,
            s.job_name,
            s.service_price,
            s.duration_hours,
            st.service_type_name AS category
        FROM services s
        JOIN service_types st 
            ON s.service_type_id = st.service_type_id
        WHERE st.service_type_name = %s
        ORDER BY s.job_name;
        """
        
        with BaseRepository.get_dict_cursor() as cur:
            cur.execute(query, (service_type_name,))
            return cur.fetchall()
    
    @staticmethod
    def get_service_by_id(service_id):
        """Get a specific service by ID with its category."""
        query = """
        SELECT 
            s.service_id,
            st.service_type_name AS category,
            s.job_name,
            s.job_desc,
            s.service_price,
            s.duration_hours,
            s.service_type_id
        FROM services s
        JOIN service_types st 
            ON s.service_type_id = st.service_type_id
        WHERE s.service_id = %s;
        """
        
        with BaseRepository.get_dict_cursor() as cur:
            cur.execute(query, (service_id,))
            return cur.fetchone()
    
    @staticmethod
    def get_service_type_id_by_name(service_type_name):
        """Get service type ID by name."""
        query = """
        SELECT service_type_id 
        FROM service_types 
        WHERE service_type_name = %s;
        """
        
        with BaseRepository.get_cursor() as cur:
            cur.execute(query, (service_type_name,))
            result = cur.fetchone()
            return result[0] if result else None
    
    @staticmethod
    def create_service(job_name, service_type_name, service_price, duration_hours=None, job_desc=None):
        """Create a new service."""
        # First, get the service_type_id from the service_type_name
        service_type_id = ServiceRepository.get_service_type_id_by_name(service_type_name)
        
        if not service_type_id:
            raise ValueError(f"Service type '{service_type_name}' not found")
        
        query = """
        INSERT INTO services (service_type_id, job_name, job_desc, service_price, duration_hours)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING service_id;
        """
        
        with BaseRepository.get_cursor() as cur:
            cur.execute(query, (service_type_id, job_name, job_desc, service_price, duration_hours))
            return cur.fetchone()[0]
    
    @staticmethod
    def update_service(service_id, job_name, service_type_name, service_price, duration_hours=None, job_desc=None):
        """Update an existing service."""
        # Get the service_type_id from the service_type_name
        service_type_id = ServiceRepository.get_service_type_id_by_name(service_type_name)
        
        if not service_type_id:
            raise ValueError(f"Service type '{service_type_name}' not found")
        
        query = """
        UPDATE services 
        SET service_type_id = %s, 
            job_name = %s, 
            job_desc = %s, 
            service_price = %s, 
            duration_hours = %s
        WHERE service_id = %s;
        """
        
        with BaseRepository.get_cursor() as cur:
            cur.execute(query, (service_type_id, job_name, job_desc, service_price, duration_hours, service_id))
            return cur.rowcount > 0
    
    @staticmethod
    def delete_service(service_id):
        """Delete a service."""
        query = "DELETE FROM services WHERE service_id = %s;"
        
        with BaseRepository.get_cursor() as cur:
            cur.execute(query, (service_id,))
            return cur.rowcount > 0
    
    @staticmethod
    def list_all():
        """Legacy method - use get_all_services instead."""
        return ServiceRepository.get_all_services()
