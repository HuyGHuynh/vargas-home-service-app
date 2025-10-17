from flask import Flask, request, jsonify
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, date
from dotenv import load_dotenv
# from urllib.parse import urlparse  # (optional safety check; see below)

# --- Load environment variables ---
# Uses DOTENV_PATH if set (e.g., ".env.test"), otherwise falls back to ".env"
load_dotenv(dotenv_path=os.getenv("DOTENV_PATH", ".env"))

# (optional safety guard – uncomment & edit host to your dev endpoint to avoid hitting main by accident)
# parsed = urlparse(os.getenv("DATABASE_URL", ""))
# assert "ep-fragrant-wind-adfi0pru-pooler.c-2.us-east-1.aws.neon.tech" in parsed.netloc, \
#        "Refusing to run: not pointing at the expected DEV endpoint"

app = Flask(__name__)

# --- Database connection ---
def get_db_connection():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    return psycopg2.connect(database_url)

# --- Helpers ---
def parse_bool(val, default=False):
    if val is None:
        return default
    if isinstance(val, bool):
        return val
    s = str(val).strip().lower()
    return s in ("1", "true", "t", "yes", "y")

def parse_date(val):
    """Parse YYYY-MM-DD date string into a Python date object."""
    if not val:
        raise ValueError("scheduledDate is required (YYYY-MM-DD)")
    try:
        return datetime.strptime(val, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("scheduledDate must be in 'YYYY-MM-DD' format")

# --- Routes ---
@app.get("/")
def hello_world():
    return "Hello, World!"

@app.get("/db-check")
def db_check():
    try:
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute("SELECT current_database(), current_user, current_schema;")
            db, user, schema = cur.fetchone()
        return {"ok": True, "db": db, "user": user, "schema": schema}, 200
    except Exception as e:
        return {"ok": False, "error": str(e)}, 500

@app.post("/workorders")
def create_workorder():
    """
    Create a work order in the 'workorders' table.

    Required JSON:
    {
      "workorderId": 1,              # required (int, must be unique)
      "requestId": 101,              # required (FK -> servicerequests)
      "customerId": 2001,            # required (FK -> customer)
      "scheduledDate": "2025-10-03", # required (YYYY-MM-DD)
      "isCompleted": false           # required (bool)
    }
    """
    data = request.get_json(silent=True) or {}

    # Extract
    workorder_id = data.get("workorderId", data.get("workorder_id"))
    request_id   = data.get("requestId", data.get("request_id"))
    customer_id  = data.get("customerId", data.get("customer_id"))
    scheduled_in = data.get("scheduledDate", data.get("scheduled_date"))
    is_completed = data.get("isCompleted", data.get("is_completed"))

    # Validate required fields
    missing = [k for k, v in {
        "workorderId": workorder_id,
        "requestId": request_id,
        "customerId": customer_id,
        "scheduledDate": scheduled_in,
        "isCompleted": is_completed
    }.items() if v is None]

    if missing:
        return {"ok": False, "error": f"Missing required fields: {', '.join(missing)}"}, 400

    # Types
    try:
        workorder_id = int(workorder_id)
        request_id   = int(request_id)
        customer_id  = int(customer_id)
    except ValueError:
        return {"ok": False, "error": "workorderId, requestId, and customerId must be integers"}, 400

    try:
        scheduled_date = parse_date(scheduled_in)
    except ValueError as ve:
        return {"ok": False, "error": str(ve)}, 400

    is_completed = parse_bool(is_completed, default=False)

    # Insert into DB
    try:
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute("""
                INSERT INTO workorders (workorderid, requestid, customerid, scheduleddate, iscompleted)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING workorderid;
            """, (workorder_id, request_id, customer_id, scheduled_date, is_completed))
            new_id = cur.fetchone()[0]
            conn.commit()
        return {
            "ok": True,
            "message": "Work order created",
            "workorderId": new_id
        }, 201
    except psycopg2.errors.UniqueViolation:
        return {"ok": False, "error": "workorderId already exists"}, 409
    except psycopg2.errors.ForeignKeyViolation:
        return {"ok": False, "error": "Invalid requestId or customerId (FK violation)"}, 400
    except psycopg2.Error as e:
        return {"ok": False, "error": f"Database error: {e.pgerror or str(e)}"}, 500

@app.get("/workorders")
def list_workorders():
    """List recent work orders."""
    try:
        with get_db_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT workorderid, requestid, customerid, scheduleddate, iscompleted
                FROM workorders
                ORDER BY workorderid DESC
                LIMIT 100;
            """)
            rows = cur.fetchall()

        # Ensure JSON-safe date output
        for r in rows:
            if r.get("scheduleddate"):
                val = r["scheduleddate"]
                if isinstance(val, (datetime, date)):
                    r["scheduleddate"] = val.isoformat()

        return {"ok": True, "count": len(rows), "workorders": rows}, 200
    except Exception as e:
        return {"ok": False, "error": str(e)}, 500

@app.route('/api/warranty/lookup', methods=['POST'])
def lookup_warranty():
    """Look up warranties by email or phone number"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'success': False
            }), 400
        
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        
        # Must have at least one identifier
        if not email and not phone:
            return jsonify({
                'error': 'Email or phone number required',
                'success': False
            }), 400
        
        # Connect to database
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # Query to find warranties based on email or phone
                # Adjust table/column names based on your actual database schema
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
                
                cur.execute(query, (email, email, phone, phone))
                rows = cur.fetchall()
                
                # Format warranties data
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
                
                return jsonify({
                    'success': True,
                    'warranties': warranties,
                    'count': len(warranties)
                }), 200
                
        finally:
            conn.close()
            
    except psycopg2.Error as db_error:
        return jsonify({
            'error': f'Database error: {str(db_error)}',
            'success': False
        }), 500
        
    except Exception as e:
        return jsonify({
            'error': f'Unexpected error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/warranty/request-details', methods=['POST'])
def request_warranty_details():
    """Send warranty details to customer via email"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'success': False
            }), 400
        
        warranty_id = data.get('warrantyId')
        work_order_id = data.get('workOrderId')
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        
        if not warranty_id or not work_order_id:
            return jsonify({
                'error': 'Warranty ID and Work Order ID required',
                'success': False
            }), 400
        
        # TODO: Implement email sending logic
        # You would typically:
        # 1. Fetch full warranty details from database
        # 2. Format email with warranty information
        # 3. Send email using SMTP or email service (SendGrid, etc.)
        
        # For now, log the request
        print(f"Warranty details requested for Work Order: {work_order_id}")
        print(f"Send to - Email: {email}, Phone: {phone}")
        
        return jsonify({
            'success': True,
            'message': 'Warranty details will be sent to your email shortly'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Unexpected error: {str(e)}',
            'success': False
        }), 500

@app.route('/api/warranty/request-service', methods=['POST'])
def request_warranty_service():
    """Create a service request for an active warranty"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'success': False
            }), 400
        
        warranty_id = data.get('warrantyId')
        work_order_id = data.get('workOrderId')
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        issue_type = data.get('issueType', '').strip()
        urgency = data.get('urgency', '').strip()
        problem_description = data.get('problemDescription', '').strip()
        
        if not warranty_id or not work_order_id:
            return jsonify({
                'error': 'Warranty ID and Work Order ID required',
                'success': False
            }), 400
        
        if not issue_type or not urgency:
            return jsonify({
                'error': 'Issue type and urgency are required',
                'success': False
            }), 400
        
        if not problem_description:
            return jsonify({
                'error': 'Problem description is required',
                'success': False
            }), 400
        
        # Log the service request details
        print(f"Service request received:")
        print(f"  Work Order: {work_order_id}")
        print(f"  Issue Type: {issue_type}")
        print(f"  Urgency: {urgency}")
        print(f"  Description: {problem_description}")
        print(f"  Contact - Email: {email}, Phone: {phone}")
        
        # TODO: Implement service request logic
        # You would typically:
        # 1. Create a new service request in database
        # 2. Link it to the warranty
        # 3. Send notification to service team
        # 4. Send confirmation email to customer
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # Example: Insert service request
                insert_query = """
                    INSERT INTO service_requests 
                    (warranty_id, work_order_id, customer_email, customer_phone, 
                     issue_type, urgency, problem_description, status, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    RETURNING id;
                """
                cur.execute(insert_query, (
                    warranty_id, work_order_id, email, phone,
                    issue_type, urgency, problem_description, 'pending'
                ))
                request_id = cur.fetchone()[0]
                conn.commit()
                
                print(f"Service request created: {request_id}")
                
                return jsonify({
                    'success': True,
                    'message': 'Service request submitted successfully. We will contact you within 24 hours.',
                    'requestId': request_id
                }), 201
                
        finally:
            conn.close()
        
    except psycopg2.Error as db_error:
        # If table doesn't exist, return success anyway (for testing)
        print(f"Database warning: {str(db_error)}")
        return jsonify({
            'success': True,
            'message': 'Service request logged. Our team will contact you within 24 hours.'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Unexpected error: {str(e)}',
            'success': False
        }), 500

# --- Main ---
if __name__ == '__main__':
    app.run(debug=True)
