"""
Routes for serving HTML pages (frontend views).
These routes render templates for the user interface.
"""
from flask import Blueprint, render_template, request, session

page_bp = Blueprint('pages', __name__)


# ==================== Root Pages ====================

@page_bp.get("/")
@page_bp.get("/home")
def home():
    """Home page."""
    return render_template("home.html")


@page_bp.get("/login")
def login():
    """Login page."""
    return render_template("login.html")


@page_bp.get("/owner")
def owner_view():
    """Owner view page."""
    return render_template("ownerView.html")


# ==================== Admin Pages ====================

@page_bp.get("/admin/employee")
def admin_employee():
    """Admin employee management page."""
    return render_template("admin/adminEmployee.html")


@page_bp.get("/admin/financial")
def admin_financial():
    """Admin financial page."""
    return render_template("admin/adminFinancial.html")


@page_bp.get("/admin/service")
def admin_service():
    """Admin service page."""
    return render_template("admin/adminService.html")


@page_bp.get("/admin/timesheet")
def admin_timesheet():
    """Admin timesheet page."""
    return render_template("admin/adminTimesheet.html")


@page_bp.get("/admin/warranty")
def admin_warranty():
    """Admin warranty page."""
    return render_template("admin/adminWarranty.html")


# ==================== Employee Pages ====================

@page_bp.get("/employee/availability")
def employee_availability():
    """Employee availability page."""
    return render_template("employee/employeeAvailability.html")


@page_bp.get("/employee/profile")
def employee_profile():
    """Employee profile page."""
    return render_template("employee/employeeProfile.html")


@page_bp.get("/employee/view")
def employee_view():
    """Employee view page."""
    return render_template("employee/employeeView.html")


# ==================== Customer Pages ====================

@page_bp.get("/appointment")
def appointment():
    """Appointment form page."""
    return render_template("customer/appointmentForm.html")


@page_bp.route("/confirmation", methods=["GET", "POST"])
def confirmation():
    """Appointment confirmation page."""
    if request.method == "POST":
        # Get data from POST request (from form submission)
        data = request.get_json()
        
        # Store data in session for potential refresh
        session['confirmation_data'] = data
        
        # Return redirect response
        return {"redirect": "/confirmation"}, 200
    else:
        # GET request - render the page with data from session
        data = session.get('confirmation_data', {})
        
        # Clear session data after use
        session.pop('confirmation_data', None)
        
        # Prepare template variables with defaults
        template_vars = {
            'customer_name': f"{data.get('firstName', '')} {data.get('lastName', '')}".strip() or "N/A",
            'customer_phone': data.get('phone', 'N/A'),
            'customer_email': data.get('email', 'N/A'),
            'customer_address': f"{data.get('address', '')}, {data.get('city', '')}, {data.get('state', '')} {data.get('zipCode', '')}".strip(', '),
            'customer_zip': data.get('zipCode', 'N/A'),
            'service_type': data.get('service_type', 'N/A'),
            'job_type': data.get('job_type', 'N/A'),
            'scheduled_date': data.get('scheduled_date', 'N/A'),
            'scheduled_time': data.get('scheduled_time', 'N/A'),
            'job_description': data.get('description', ''),
            'work_order_id': 'Pending Assignment',
            'request_id': data.get('request_id', 'N/A'),
            'work_order_status': 'Service Request Created',
        }
        
        # Handle technician information if available
        technician_data = data.get('technician')
        if technician_data and technician_data.get('employee_id'):
            template_vars.update({
                'technician_name': f"{technician_data.get('firstname', '')} {technician_data.get('lastname', '')}".strip(),
                'technician_role': 'Service Technician',  # Default role
                'technician_phone': technician_data.get('phone'),
                'technician_specialization': 'General Service'  # Default specialization
            })
        else:
            template_vars.update({
                'technician_name': None,
                'technician_role': None,
                'technician_phone': None,
                'technician_specialization': None
            })
        
        return render_template("customer/confirmation.html", **template_vars)


@page_bp.get("/warranty")
def warranty():
    """Warranty page."""
    return render_template("customer/warranty.html")


@page_bp.get("/workorder")
def workorder():
    """Work order page."""
    return render_template("customer/workOrder.html")
