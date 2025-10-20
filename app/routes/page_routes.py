"""
Routes for serving HTML pages (frontend views).
These routes render templates for the user interface.
"""
from flask import Blueprint, render_template

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
