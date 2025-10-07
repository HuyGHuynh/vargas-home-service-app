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

# --- Main ---
if __name__ == "__main__":
    app.run(debug=True)
