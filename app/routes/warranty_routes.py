"""
Routes for warranty endpoints.
Handles HTTP requests and delegates to service layer.
"""
from flask import Blueprint, request, jsonify
from services.warranty_service import WarrantyService
from repositories.warranty_repository import WarrantyRepository
from services.email_service import EmailService

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


@warranty_bp.post('/lookup-details')
def lookup_warranty_details():
    """
    Look up warranty details by customer contact and service type.
    Returns detailed warranty information that will be emailed to customer.
    
    Required JSON:
    {
      "email": "customer@example.com",     # optional (at least one of email/phone required)
      "phone": "123-456-7890",            # optional (at least one of email/phone required)  
      "service_type": "HVAC"              # required
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({
            'success': False,
            'error': 'No data provided'
        }), 400
    
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    service_type = data.get('service_type', '').strip()
    
    # Validation
    if not email and not phone:
        return jsonify({
            'success': False,
            'error': 'Email or phone number required'
        }), 400
    
    if not service_type:
        return jsonify({
            'success': False,
            'error': 'Service type is required'
        }), 400
    
    try:
        # Get warranty details from repository
        warranties = WarrantyRepository.lookup_warranty_by_contact_and_service_type(
            email=email, 
            phone=phone, 
            service_type=service_type
        )
        
        if not warranties:
            return jsonify({
                'success': False,
                'message': f'No warranties found for the provided information and {service_type} service type'
            }), 404
        
        # Send warranty details via email
        customer_email = email or warranties[0]['customer']['email']
        
        if not customer_email:
            return jsonify({
                'success': False,
                'error': 'Customer email not found for sending warranty details'
            }), 400
        
        # Initialize email service and send warranty details
        email_service = EmailService()
        email_sent = email_service.send_warranty_email(customer_email, warranties)
        
        if email_sent:
            print(f"✅ Warranty details emailed to {customer_email}")
            return jsonify({
                'success': True,
                'message': f'Warranty details sent to {customer_email}. {len(warranties)} warranty(s) processed.',
                'warranties_count': len(warranties)
            }), 200
        else:
            # Fallback: print to console if email fails
            print("\n" + "="*80)
            print(f"EMAIL FAILED - SHOWING WARRANTY DETAILS IN CONSOLE")
            print("="*80)
            print(f"Customer Contact: {email or phone}")
            print(f"Service Type: {service_type}")
            print(f"Number of Warranties Found: {len(warranties)}")
            
            for i, warranty in enumerate(warranties, 1):
                print(f"\nWARRANTY #{i} - ID: {warranty['warranty_id']}")
                print(f"Customer: {warranty['customer']['first_name']} {warranty['customer']['last_name']}")
                print(f"Service: {warranty['service']['job_name']} (${warranty['service']['service_price']:.2f})")
                print(f"Warranty Price: ${warranty['warranty_price']:.2f}")
                print(f"Status: {warranty['warranty_status']} | {warranty['start_date']} to {warranty['end_date']}")
            
            print("="*80 + "\n")
            
            return jsonify({
                'success': False,
                'error': 'Email delivery failed, but warranty details found',
                'warranties_count': len(warranties)
            }), 500
        
        return jsonify({
            'success': True,
            'message': f'Warranty details found and sent to your email. {len(warranties)} warranty(s) processed.',
            'warranties_count': len(warranties)
        }), 200
        
    except Exception as e:
        print(f"Error looking up warranty details: {e}")
        return jsonify({
            'success': False,
            'error': f'Database error: {str(e)}'
        }), 500
