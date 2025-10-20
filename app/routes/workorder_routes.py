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
