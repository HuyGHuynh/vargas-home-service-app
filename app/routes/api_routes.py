"""
Utility API routes (health check, database check, etc.).
"""
from flask import Blueprint
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
