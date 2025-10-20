"""
Flask application factory.
Creates and configures the Flask application with all blueprints.
"""
from flask import Flask
from config import get_config


def create_app(config_name=None):
    """
    Create and configure the Flask application.
    
    Args:
        config_name (str, optional): Configuration name ('development', 'production', 'test')
        
    Returns:
        Flask: Configured Flask application
    """
    app = Flask(__name__,
                template_folder='templates',
                static_folder='static')
    
    # Load configuration
    if config_name:
        from config import config
        app.config.from_object(config[config_name])
    else:
        app.config.from_object(get_config())
    
    # Validate DATABASE_URL is set
    if not app.config.get('DATABASE_URL'):
        raise ValueError("DATABASE_URL environment variable is not set")
    
    # Register blueprints
    from routes import api_bp, workorder_bp, warranty_bp, page_bp
    
    app.register_blueprint(page_bp)      # Frontend pages (must be first for / route)
    app.register_blueprint(api_bp)
    app.register_blueprint(workorder_bp)
    app.register_blueprint(warranty_bp)
    
    return app
