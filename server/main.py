from flask import Flask, request, jsonify
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Database connection function
def get_db_connection():
    """Establish database connection using Neon PostgreSQL"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    return psycopg2.connect(database_url)

def validate_order_data(data):
    """Validate required fields for order submission"""
    required_fields = ['LastName', 'FirstName', 'Address', 'phoneNumber', 'workType']
    missing_fields = []
    
    for field in required_fields:
        if not data.get(field) or str(data.get(field)).strip() == '':
            missing_fields.append(field)
    
    return missing_fields

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/order', methods=['POST'])
def create_order():
    """Handle form submission to schedule appointment"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'success': False
            }), 400
        
        # Validate required fields
        missing_fields = validate_order_data(data)
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}',
                'success': False
            }), 400
        
        # Extract validated data
        last_name = data['LastName'].strip()
        first_name = data['FirstName'].strip()
        address = data['Address'].strip()
        phone_number = data['phoneNumber'].strip()
        work_type = data['workType'].strip()
        
        # Connect to database and insert order
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # Insert order into user table
                insert_query = """
                    INSERT INTO "user" (LastName, FirstName, Address, phoneNumber, workType)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id;
                """
                cur.execute(insert_query, (last_name, first_name, address, phone_number, work_type))
                order_id = cur.fetchone()[0]
                conn.commit()
                
                return jsonify({
                    'message': 'Order created successfully',
                    'success': True,
                    'order_id': order_id,
                    'data': {
                        'LastName': last_name,
                        'FirstName': first_name,
                        'Address': address,
                        'phoneNumber': phone_number,
                        'workType': work_type
                    }
                }), 201
                
        finally:
            conn.close()
            
    except psycopg2.Error as db_error:
        return jsonify({
            'error': f'Database error: {str(db_error)}',
            'success': False
        }), 500
        
    except ValueError as val_error:
        return jsonify({
            'error': str(val_error),
            'success': False
        }), 500
        
    except Exception as e:
        return jsonify({
            'error': f'Unexpected error: {str(e)}',
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(debug=True)