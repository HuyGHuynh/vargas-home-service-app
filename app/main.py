"""
Main entry point for the Flask application.
Imports and runs the Flask app created by the application factory.
"""
from __init__ import create_app

#Reg blueprint (email)
from routes.appointment_routes import appointment_bp


# Create the Flask application using the factory
app = create_app()

#Register blueprint (email)
app.register_blueprint(appointment_bp, url_prefix="/api")

# --- Main ---
if __name__ == '__main__':
    app.run(debug=True)

