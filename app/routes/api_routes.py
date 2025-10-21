"""
Utility API routes (health check, database check, etc.).
"""
from flask import Blueprint, request, jsonify
from repositories.base_repository import BaseRepository

api_bp = Blueprint('api', __name__)


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
