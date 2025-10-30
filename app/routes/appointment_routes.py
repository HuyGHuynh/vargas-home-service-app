from flask import Blueprint, request, jsonify
from app.repositories.appointment_repository import AppointmentRepository

appointment_bp = Blueprint("appointment", __name__)

@appointment_bp.post("/appointment")
def create_appointment():
    data = request.get_json()

    try:
        appointment = AppointmentRepository.create(data)
        return jsonify({"success": True, "id": appointment.id}), 201
    except Exception as e:
        print("Error:", e)
        return jsonify({"success": False, "error": str(e)}), 500


'''
from flask import Blueprint, request, jsonify
from models import Appointment, db
from services.email_service import send_email

appointment_bp = Blueprint("appointment", __name__)

@appointment_bp.post("/appointment")
def submit_appointment():
    data = request.json

    new_appointment = Appointment(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
        date=data.get("date"),
        message=data.get("message"),
    )

    db.session.add(new_appointment)
    db.session.commit()

    # Email to admin
    admin_html = f"""
        <h2>New Appointment Request</h2>
        <p>Name: {data.get('name')}</p>
        <p>Email: {data.get('email')}</p>
        <p>Phone: {data.get('phone')}</p>
        <p>Date: {data.get('date')}</p>
        <p>Message: {data.get('message')}</p>
    """
    send_email("admin@yourdomain.com", "New Appointment", admin_html)

    # Email to customer
    customer_html = f"""
        <p>Hi {data.get('name')}, thanks for requesting an appointment!</p>
        <p>We will contact you shortly.</p>
    """
    send_email(data.get("email"), "Appointment Confirmation", customer_html)

    return jsonify({"success": True})
'''