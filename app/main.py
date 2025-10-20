"""
Main entry point for the Flask application.
Imports and runs the Flask app created by the application factory.
"""
from __init__ import create_app

# Create the Flask application using the factory
app = create_app()

# --- Main ---
if __name__ == '__main__':
    app.run(debug=True)
