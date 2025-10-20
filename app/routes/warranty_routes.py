"""
Routes for warranty endpoints.
Handles HTTP requests and delegates to service layer.
"""
from flask import Blueprint, request, jsonify
from services.warranty_service import WarrantyService

warranty_bp = Blueprint('warranty', __name__, url_prefix='/api/warranty')


@warranty_bp.post('/lookup')
def lookup_warranty():
    """
    Look up warranties by email or phone number.
    
    Required JSON:
    {
      "email": "customer@example.com",  # optional
      "phone": "123-456-7890"            # optional (at least one required)
    }
    """
    data = request.get_json()
    response, status_code = WarrantyService.lookup_warranty(data)
    return jsonify(response), status_code


@warranty_bp.post('/request-details')
def request_warranty_details():
    """
    Send warranty details to customer via email.
    
    Required JSON:
    {
      "warrantyId": 1,
      "workOrderId": 101,
      "email": "customer@example.com",
      "phone": "123-456-7890"
    }
    """
    data = request.get_json()
    response, status_code = WarrantyService.request_warranty_details(data)
    return jsonify(response), status_code


@warranty_bp.post('/request-service')
def request_warranty_service():
    """
    Create a service request for an active warranty.
    
    Required JSON:
    {
      "warrantyId": 1,
      "workOrderId": 101,
      "email": "customer@example.com",
      "phone": "123-456-7890",
      "issueType": "repair",
      "urgency": "high",
      "problemDescription": "Description of the issue"
    }
    """
    data = request.get_json()
    response, status_code = WarrantyService.request_warranty_service(data)
    return jsonify(response), status_code
