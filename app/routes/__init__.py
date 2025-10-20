"""
Make routes package importable.
"""
from .workorder_routes import workorder_bp
from .warranty_routes import warranty_bp
from .api_routes import api_bp
from .page_routes import page_bp

__all__ = ['workorder_bp', 'warranty_bp', 'api_bp', 'page_bp']
