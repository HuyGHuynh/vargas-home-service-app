"""
Routes for workorder endpoints.
Handles HTTP requests and delegates to service layer.
"""
from flask import Blueprint, request, jsonify
from services.workorder_service import WorkorderService

workorder_bp = Blueprint('workorder', __name__, url_prefix='/workorders')


@workorder_bp.post("")
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
    response, status_code = WorkorderService.create_workorder(data)
    return response, status_code


@workorder_bp.get("")
def list_workorders():
    """List recent work orders."""
    response, status_code = WorkorderService.list_workorders()
    return response, status_code


@workorder_bp.get("/<int:workorder_id>")
def get_workorder(workorder_id):
    """Get a specific workorder by ID."""
    response, status_code = WorkorderService.get_workorder(workorder_id)
    return response, status_code


@workorder_bp.post("/expanded")
def create_workorder_with_expanded_data():
    """
    Create a service request with all related data (customer, address, service request).
    Handles existing customers by email lookup and creates comprehensive service request.

    Required JSON:
    {
      // Customer info
      "firstName": "John",           # required (string)
      "lastName": "Doe",             # required (string)
      "phone": "555-1234",           # required (string)
      "email": "john@example.com",   # required (string)
      
      // Address info
      "address": "123 Main St",      # required (string)
      "city": "Anytown",             # required (string)
      "state": "CA",                 # required (string)
      "zipCode": "12345",            # required (string)
      
      // Service info
      "serviceId": 5,                # required (integer, references existing service)
      "description": "Job details",  # optional (string, job description)
      
      // Scheduling info
      "requestDate": "2025-10-21",   # required (YYYY-MM-DD)
      "scheduledDate": "2025-10-22", # required (YYYY-MM-DD)
      "scheduledTime": "2:30 PM",    # required (string, time format)
      "isCompleted": false           # required (boolean)
    }
    
    Returns service request ID and related IDs for confirmation.
    """
    data = request.get_json(silent=True) or {}
    response, status_code = WorkorderService.create_workorder_with_expanded_data(data)
    return response, status_code
