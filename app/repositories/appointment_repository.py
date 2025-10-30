from app import db
from app.models import Appointment

class AppointmentRepository:
    @staticmethod
    def create(data):
        appointment = Appointment(
            name=data.get("name"),
            email=data.get("email"),
            phone=data.get("phone"),
            date=data.get("date"),
            message=data.get("message")
        )

        db.session.add(appointment)
        db.session.commit()

        return appointment
