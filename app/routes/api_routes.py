"""
Utility API routes (health check, database check, etc.).
"""
from flask import Blueprint, request, jsonify
from repositories.base_repository import BaseRepository
from repositories.service_repository import ServiceRepository

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
    """Basic login endpoint for authentication."""
    try:
        data = request.get_json()
        if not data:
            return {"success": False, "message": "No data provided"}, 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return {"success": False, "message": "Email and password are required"}, 400
        
        # For now, return a basic response since we don't have user authentication in DB
        # This can be expanded later with actual database user verification
        return {
            "success": False, 
            "message": "Database authentication not implemented yet. Please use sample accounts."
        }, 401
        
    except Exception as e:
        return {"success": False, "message": f"Server error: {str(e)}"}, 500


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


@api_bp.get("/service-types")
def get_service_types():
    """Get all service types for dropdown options."""
    try:
        service_types = ServiceRepository.get_service_types()
        return {"success": True, "data": service_types}, 200
    except Exception as e:
        return {"success": False, "error": str(e)}, 500
