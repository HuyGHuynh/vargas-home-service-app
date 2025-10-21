"""
Routes for serving HTML pages (frontend views).
These routes render templates for the user interface.
"""
from flask import Blueprint, render_template, request, redirect, url_for
import random
from datetime import datetime

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


@page_bp.get("/warranty")
def warranty():
    """Warranty page."""
    return render_template("customer/warranty.html")


@page_bp.get("/workorder")
def workorder():
    """Work order page."""
    return render_template("customer/workOrder.html")


@page_bp.post("/appointment/confirmation")
def appointment_confirmation():
    """Appointment confirmation page - displays submitted appointment details."""
    # Get form data from request
    data = request.get_json() if request.is_json else request.form
    
    # Extract customer information
    customer_name = data.get('name', 'N/A')
    customer_phone = data.get('phone', 'N/A')
    customer_email = data.get('email', 'N/A')
    customer_address = data.get('address', 'N/A')
    customer_zip = data.get('zip', 'N/A')
    
    # Extract appointment details
    service_type = data.get('service', 'N/A')
    job_type = data.get('job', 'N/A')
    job_description = data.get('description', '')
    scheduled_date = data.get('selectedDate', 'N/A')
    scheduled_time = data.get('selectedTime', 'N/A')
    
    # Generate mock work order information
    # In a real application, this would create a work order in the database
    work_order_id = f"WO-{random.randint(10000, 99999)}"
    request_id = f"SR-{random.randint(10000, 99999)}"
    work_order_status = "Pending Assignment"
    
    # Mock technician assignment (randomly assign or leave as pending)
    # In production, this would be determined by availability and scheduling logic
    technicians = [
        {
            "name": "Michael Thompson",
            "role": "Senior HVAC Technician",
            "phone": "(555) 123-4567",
            "specialization": "HVAC Systems, Heating & Cooling"
        },
        {
            "name": "Sarah Martinez",
            "role": "Licensed Electrician",
            "phone": "(555) 234-5678",
            "specialization": "Electrical Systems, Wiring"
        },
        {
            "name": "Jessica Williams",
            "role": "Plumbing Specialist",
            "phone": "(555) 345-6789",
            "specialization": "Plumbing, Water Systems"
        },
        {
            "name": "Robert Johnson",
            "role": "Senior Technician",
            "phone": "(555) 456-7890",
            "specialization": "General Repairs, Maintenance"
        }
    ]
    
    # Assign technician based on service type or randomly (50% chance of immediate assignment)
    technician_info = {}
    if random.choice([True, False]):
        if service_type.lower() == 'plumbing':
            technician_info = technicians[2]  # Jessica Williams
        elif service_type.lower() == 'electrician':
            technician_info = technicians[1]  # Sarah Martinez
        else:
            technician_info = random.choice(technicians)
    
    return render_template(
        "customer/confirmation.html",
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_email=customer_email,
        customer_address=customer_address,
        customer_zip=customer_zip,
        service_type=service_type,
        job_type=job_type,
        job_description=job_description,
        scheduled_date=scheduled_date,
        scheduled_time=scheduled_time,
        work_order_id=work_order_id,
        request_id=request_id,
        work_order_status=work_order_status,
        technician_name=technician_info.get('name'),
        technician_role=technician_info.get('role'),
        technician_phone=technician_info.get('phone'),
        technician_specialization=technician_info.get('specialization')
    )

