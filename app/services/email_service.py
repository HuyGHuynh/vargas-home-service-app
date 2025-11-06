"""
Gmail API email service for sending warranty details.
Simple and reliable email delivery using Google's Gmail API.
"""
import os
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import List, Dict, Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Gmail API scope - we only need send permission
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


class EmailService:
    """Service for sending emails via Gmail API."""
    
    def __init__(self):
        """Initialize Gmail API email service."""
        self.sender_email = os.getenv('SENDER_EMAIL', 'your-email@gmail.com')
        self.sender_name = os.getenv('SENDER_NAME', "Vargas' Home Services")
        
        # Get project root directory (parent of app directory)
        current_dir = os.path.dirname(os.path.abspath(__file__))  # services directory
        app_dir = os.path.dirname(current_dir)  # app directory
        project_root = os.path.dirname(app_dir)  # project root
        
        self.credentials_file = os.path.join(project_root, 'credentials.json')
        self.token_file = os.path.join(project_root, 'token.json')
        self.service = None
    
    def authenticate_gmail(self):
        """Authenticate with Gmail API."""
        creds = None
        
        # Load existing tokens
        if os.path.exists(self.token_file):
            creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)
        
        # If no valid credentials, get new ones
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_file):
                    raise Exception(f"Credentials file not found: {self.credentials_file}")
                
                flow = InstalledAppFlow.from_client_secrets_file(self.credentials_file, SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save credentials for next run
            with open(self.token_file, 'w') as token:
                token.write(creds.to_json())
        
        service = build('gmail', 'v1', credentials=creds)
        return service
    
    def send_warranty_email(self, customer_email: str, warranties: List[Dict[Any, Any]]) -> bool:
        """
        Send warranty details to customer.
        
        Args:
            customer_email: Customer's email address
            warranties: List of warranty details from database
            
        Returns:
            bool: True if sent successfully
        """
        try:
            # Get Gmail service
            if not self.service:
                self.service = self.authenticate_gmail()
            
            # Create email
            message = MIMEMultipart('alternative')
            message['To'] = customer_email
            message['From'] = f"{self.sender_name} <{self.sender_email}>"
            message['Subject'] = "Your Warranty Information - Vargas' Home Services"
            
            # Create email content
            html_content = self._create_warranty_html(warranties)
            text_content = self._create_warranty_text(warranties)
            
            # Attach content
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw_message}
            
            result = self.service.users().messages().send(userId='me', body=send_message).execute()
            
            print(f"✅ Warranty email sent to {customer_email}")
            print(f"Message ID: {result.get('id')}")
            return True
            
        except HttpError as error:
            print(f"❌ Gmail API error: {error}")
            return False
        except Exception as e:
            print(f"❌ Email error: {e}")
            return False
    
    def _create_warranty_html(self, warranties: List[Dict[Any, Any]]) -> str:
        """Create HTML email content."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f7fafc; padding: 20px; }}
                .warranty-card {{ background-color: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .warranty-header {{ font-size: 1.2em; font-weight: bold; color: #2c5282; margin-bottom: 15px; }}
                .detail {{ margin: 8px 0; }}
                .label {{ font-weight: bold; color: #4a5568; }}
                .value {{ color: #2d3748; }}
                .price {{ font-size: 1.1em; font-weight: bold; color: #38a169; }}
                .footer {{ background-color: #2c5282; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Vargas' Home Services</h1>
                <h2>Your Warranty Details</h2>
            </div>
            <div class="content">
                <p>Dear Valued Customer,</p>
                <p>Below are your warranty details:</p>
        """
        
        for warranty in warranties:
            customer = warranty['customer']
            service = warranty['service']
            
            html += f"""
                <div class="warranty-card">
                    <div class="warranty-header">Warranty #{warranty['warranty_id']} - {service['job_name']}</div>
                    <div class="detail"><span class="label">Service Type:</span> <span class="value">{service['service_type']}</span></div>
                    <div class="detail"><span class="label">Status:</span> <span class="value">{warranty['warranty_status']}</span></div>
                    <div class="detail"><span class="label">Start Date:</span> <span class="value">{warranty['start_date']}</span></div>
                    <div class="detail"><span class="label">End Date:</span> <span class="value">{warranty['end_date']}</span></div>
                    <div class="detail"><span class="label">Service Price:</span> <span class="value price">${service['service_price']:.2f}</span></div>
                    <div class="detail"><span class="label">Warranty Price:</span> <span class="value price">${warranty['warranty_price']:.2f}</span></div>
                    <div class="detail"><span class="label">Description:</span> <span class="value">{warranty['warranty_description']}</span></div>
                </div>
            """
        
        html += f"""
                <p>If you have questions, contact us at support@vargashome.com</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Vargas' Home Services</p>
            </div>
        </body>
        </html>
        """
        return html
    
    def _create_warranty_text(self, warranties: List[Dict[Any, Any]]) -> str:
        """Create plain text email content."""
        text = f"""
VARGAS' HOME SERVICES
Your Warranty Details

Dear Valued Customer,

Below are your warranty details:

"""
        for warranty in warranties:
            customer = warranty['customer']
            service = warranty['service']
            
            text += f"""
Warranty #{warranty['warranty_id']} - {service['job_name']}
Service Type: {service['service_type']}
Status: {warranty['warranty_status']}
Start Date: {warranty['start_date']}
End Date: {warranty['end_date']}
Service Price: ${service['service_price']:.2f}
Warranty Price: ${warranty['warranty_price']:.2f}
Description: {warranty['warranty_description']}

"""
        
        text += f"""
If you have questions, contact us at support@vargashome.com

Vargas' Home Services
{datetime.now().strftime('%B %d, %Y')}
"""
        return text
    
    def test_connection(self) -> bool:
        """Test Gmail API connection by sending a test email."""
        try:
            service = self.authenticate_gmail()
            
            # Create a simple test email to yourself
            message = MIMEText("Gmail API test successful! Your warranty email service is ready.")
            message['To'] = self.sender_email
            message['From'] = f"{self.sender_name} <{self.sender_email}>"
            message['Subject'] = "Gmail API Test - Vargas Home Services"
            
            # Send the test email
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw_message}
            
            result = service.users().messages().send(userId='me', body=send_message).execute()
            
            print(f"✅ Gmail API test successful!")
            print(f"✅ Test email sent to: {self.sender_email}")
            print(f"Message ID: {result.get('id')}")
            return True
            
        except Exception as e:
            print(f"❌ Connection test failed: {e}")
            return False
    
    def send_workorder_email(self, customer_email: str, work_orders: List[Dict[Any, Any]]) -> bool:
        """
        Send work order details to customer.
        
        Args:
            customer_email: Customer's email address
            work_orders: List of work order details from database
            
        Returns:
            bool: True if sent successfully
        """
        try:
            # Get Gmail service
            if not self.service:
                self.service = self.authenticate_gmail()
            
            # Create email
            message = MIMEMultipart('alternative')
            message['To'] = customer_email
            message['From'] = f"{self.sender_name} <{self.sender_email}>"
            message['Subject'] = "Your Work Order Information - Vargas' Home Services"
            
            # Create email content
            html_content = self._create_workorder_html(work_orders)
            text_content = self._create_workorder_text(work_orders)
            
            # Attach content
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw_message}
            
            result = self.service.users().messages().send(userId='me', body=send_message).execute()
            print(f"✅ Work order email sent to {customer_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send work order email: {e}")
            return False
    
    def _create_workorder_html(self, work_orders: List[Dict[Any, Any]]) -> str:
        """Create HTML email content for work orders."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f7fafc; padding: 20px; }}
                .workorder-card {{ background-color: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .workorder-header {{ font-size: 1.2em; font-weight: bold; color: #2c5282; margin-bottom: 15px; }}
                .detail {{ margin: 8px 0; }}
                .label {{ font-weight: bold; color: #4a5568; }}
                .value {{ color: #2d3748; }}
                .price {{ font-size: 1.1em; font-weight: bold; color: #38a169; }}
                .status {{ padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }}
                .status-pending {{ background: #fef3c7; color: #92400e; }}
                .status-in-progress {{ background: #dbeafe; color: #1e40af; }}
                .status-completed {{ background: #d1fae5; color: #166534; }}
                .status-cancelled {{ background: #fee2e2; color: #dc2626; }}
                .footer {{ background-color: #2c5282; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Vargas' Home Services</h1>
                <h2>Your Work Order Details</h2>
            </div>
            <div class="content">
                <p>Dear Valued Customer,</p>
                <p>Below are your work order details:</p>
        """
        
        for order in work_orders:
            customer = order['customer']
            service = order['service']
            status_class = f"status-{order['request_status'].lower().replace(' ', '-')}"
            
            html += f"""
                <div class="workorder-card">
                    <div class="workorder-header">Work Order #{order['request_id']} - {service['job_name']}</div>
                    <div class="detail"><span class="label">Service Type:</span> <span class="value">{service['service_type']}</span></div>
                    <div class="detail"><span class="label">Status:</span> <span class="status {status_class}">{order['request_status']}</span></div>
                    <div class="detail"><span class="label">Scheduled Date:</span> <span class="value">{order['preferred_datetime']}</span></div>
                    <div class="detail"><span class="label">Service Price:</span> <span class="value price">${service['service_price']:.2f}</span></div>
                    {f'<div class="detail"><span class="label">Final Price:</span> <span class="value price">${order["final_price"]:.2f}</span></div>' if order.get('final_price') else ''}
                    <div class="detail"><span class="label">Description:</span> <span class="value">{order['request_description']}</span></div>
                    {f'<div class="detail"><span class="label">Assigned Employee:</span> <span class="value">{order["assigned_employee"]["first_name"]} {order["assigned_employee"]["last_name"]}</span></div>' if order.get('assigned_employee') else ''}
                    <div class="detail"><span class="label">Address:</span> <span class="value">{order['address']['street']}, {order['address']['city']}, {order['address']['state']} {order['address']['zip_code']}</span></div>
                </div>
            """
        
        html += f"""
                <p>If you have questions, contact us at support@vargashome.com</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Vargas' Home Services</p>
            </div>
        </body>
        </html>
        """
        return html
    
    def _create_workorder_text(self, work_orders: List[Dict[Any, Any]]) -> str:
        """Create plain text email content for work orders."""
        text = f"""
VARGAS' HOME SERVICES
Your Work Order Details

Dear Valued Customer,

Below are your work order details:

"""
        for order in work_orders:
            customer = order['customer']
            service = order['service']
            
            text += f"""
Work Order #{order['request_id']} - {service['job_name']}
Service Type: {service['service_type']}
Status: {order['request_status']}
Scheduled Date: {order['preferred_datetime']}
Service Price: ${service['service_price']:.2f}
"""
            if order.get('final_price'):
                text += f"Final Price: ${order['final_price']:.2f}\n"
            
            text += f"Description: {order['request_description']}\n"
            
            if order.get('assigned_employee'):
                text += f"Assigned Employee: {order['assigned_employee']['first_name']} {order['assigned_employee']['last_name']}\n"
            
            text += f"Address: {order['address']['street']}, {order['address']['city']}, {order['address']['state']} {order['address']['zip_code']}\n\n"
        
        text += f"""
If you have questions, contact us at support@vargashome.com

Vargas' Home Services - Built with love for our community
"""
        return text
    
    def send_appointment_confirmation_email(self, service_request: Dict[Any, Any]) -> Dict[str, bool]:
        """
        Send appointment confirmation emails to both customer and assigned employee.
        
        Args:
            service_request: Service request details from database
            
        Returns:
            dict: Success status for customer and employee emails
        """
        results = {
            'customer_email_sent': False,
            'employee_email_sent': False
        }
        
        try:
            # Get Gmail service
            if not self.service:
                self.service = self.authenticate_gmail()
            
            # Send customer email
            customer_email = service_request['customer']['email']
            if customer_email:
                results['customer_email_sent'] = self._send_customer_appointment_email(customer_email, service_request)
            
            # Send employee email
            assigned_employee = service_request.get('assigned_employee')
            if assigned_employee and assigned_employee.get('email'):
                employee_email = assigned_employee['email']
                results['employee_email_sent'] = self._send_employee_appointment_email(employee_email, service_request)
            
            return results
            
        except Exception as e:
            print(f"❌ Error sending appointment confirmation emails: {e}")
            return results
    
    def _send_customer_appointment_email(self, customer_email: str, service_request: Dict[Any, Any]) -> bool:
        """Send appointment confirmation email to customer."""
        try:
            # Create email
            message = MIMEMultipart('alternative')
            message['To'] = customer_email
            message['From'] = f"{self.sender_name} <{self.sender_email}>"
            message['Subject'] = f"Appointment Confirmed - Work Order #{service_request['request_id']}"
            
            # Create email content
            html_content = self._create_customer_appointment_html(service_request)
            text_content = self._create_customer_appointment_text(service_request)
            
            # Attach content
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw_message}
            
            result = self.service.users().messages().send(userId='me', body=send_message).execute()
            print(f"✅ Customer appointment confirmation sent to {customer_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send customer appointment email: {e}")
            return False
    
    def _send_employee_appointment_email(self, employee_email: str, service_request: Dict[Any, Any]) -> bool:
        """Send appointment notification email to assigned employee."""
        try:
            # Create email
            message = MIMEMultipart('alternative')
            message['To'] = employee_email
            message['From'] = f"{self.sender_name} <{self.sender_email}>"
            message['Subject'] = f"New Assignment - Work Order #{service_request['request_id']}"
            
            # Create email content
            html_content = self._create_employee_appointment_html(service_request)
            text_content = self._create_employee_appointment_text(service_request)
            
            # Attach content
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw_message}
            
            result = self.service.users().messages().send(userId='me', body=send_message).execute()
            print(f"✅ Employee appointment notification sent to {employee_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send employee appointment email: {e}")
            return False
    
    def _create_customer_appointment_html(self, service_request: Dict[Any, Any]) -> str:
        """Create HTML email content for customer appointment confirmation."""
        customer = service_request['customer']
        service = service_request['service']
        address = service_request['address']
        assigned_employee = service_request.get('assigned_employee', {})
        
        employee_info = ""
        if assigned_employee:
            employee_info = f"""
                <div class="detail"><span class="label">Assigned Technician:</span> <span class="value">{assigned_employee.get('first_name', '')} {assigned_employee.get('last_name', '')}</span></div>
                <div class="detail"><span class="label">Technician Phone:</span> <span class="value">{assigned_employee.get('phone', 'Will be provided')}</span></div>
            """
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f7fafc; padding: 20px; }}
                .appointment-card {{ background-color: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .appointment-header {{ font-size: 1.3em; font-weight: bold; color: #2c5282; margin-bottom: 15px; text-align: center; }}
                .detail {{ margin: 10px 0; }}
                .label {{ font-weight: bold; color: #4a5568; }}
                .value {{ color: #2d3748; }}
                .price {{ font-size: 1.1em; font-weight: bold; color: #38a169; }}
                .status {{ padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #dbeafe; color: #1e40af; }}
                .important {{ background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }}
                .footer {{ background-color: #2c5282; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏠 Vargas' Home Services</h1>
                <h2>✅ Appointment Confirmed!</h2>
            </div>
            <div class="content">
                <p>Dear {customer.get('first_name', '')} {customer.get('last_name', '')},</p>
                <p>Great news! Your service request has been accepted and is now scheduled. Here are your appointment details:</p>
                
                <div class="appointment-card">
                    <div class="appointment-header">Work Order #{service_request['request_id']}</div>
                    <div class="detail"><span class="label">Service:</span> <span class="value">{service['job_name']}</span></div>
                    <div class="detail"><span class="label">Service Type:</span> <span class="value">{service['service_type']}</span></div>
                    <div class="detail"><span class="label">Status:</span> <span class="status">In Progress</span></div>
                    <div class="detail"><span class="label">Scheduled Date:</span> <span class="value">{service_request['preferred_datetime']}</span></div>
                    <div class="detail"><span class="label">Final Price:</span> <span class="value price">${service_request.get('final_price', 0):.2f}</span></div>
                    {employee_info}
                    <div class="detail"><span class="label">Service Address:</span> <span class="value">{address['street']}, {address['city']}, {address['state']} {address['zip_code']}</span></div>
                    <div class="detail"><span class="label">Description:</span> <span class="value">{service_request['request_description']}</span></div>
                </div>
                
                <div class="important">
                    <strong>📋 What to expect:</strong><br>
                    • Our technician will arrive at the scheduled time<br>
                    • Please ensure someone is available to provide access<br>
                    • We'll contact you if there are any changes to the schedule<br>
                    • Payment is due upon completion of service
                </div>
                
                <p>If you have any questions or need to reschedule, please contact us at support@vargashome.com or call our office.</p>
                <p>Thank you for choosing Vargas' Home Services!</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Vargas' Home Services - Professional. Reliable. Trusted.</p>
            </div>
        </body>
        </html>
        """
        return html
    
    def _create_customer_appointment_text(self, service_request: Dict[Any, Any]) -> str:
        """Create plain text email content for customer appointment confirmation."""
        customer = service_request['customer']
        service = service_request['service']
        address = service_request['address']
        assigned_employee = service_request.get('assigned_employee', {})
        
        employee_info = ""
        if assigned_employee:
            employee_info = f"""
Assigned Technician: {assigned_employee.get('first_name', '')} {assigned_employee.get('last_name', '')}
Technician Phone: {assigned_employee.get('phone', 'Will be provided')}
"""
        
        text = f"""
VARGAS' HOME SERVICES
✅ APPOINTMENT CONFIRMED!

Dear {customer.get('first_name', '')} {customer.get('last_name', '')},

Great news! Your service request has been accepted and is now scheduled.

APPOINTMENT DETAILS:
==================
Work Order #: {service_request['request_id']}
Service: {service['job_name']}
Service Type: {service['service_type']}
Status: IN PROGRESS
Scheduled Date: {service_request['preferred_datetime']}
Final Price: ${service_request.get('final_price', 0):.2f}
{employee_info}
Service Address: {address['street']}, {address['city']}, {address['state']} {address['zip_code']}
Description: {service_request['request_description']}

WHAT TO EXPECT:
==============
• Our technician will arrive at the scheduled time
• Please ensure someone is available to provide access
• We'll contact you if there are any changes to the schedule
• Payment is due upon completion of service

If you have any questions or need to reschedule, please contact us at support@vargashome.com or call our office.

Thank you for choosing Vargas' Home Services!

Vargas' Home Services - Professional. Reliable. Trusted.
{datetime.now().strftime('%B %d, %Y')}
"""
        return text
    
    def _create_employee_appointment_html(self, service_request: Dict[Any, Any]) -> str:
        """Create HTML email content for employee appointment notification."""
        customer = service_request['customer']
        service = service_request['service']
        address = service_request['address']
        assigned_employee = service_request.get('assigned_employee', {})
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f7fafc; padding: 20px; }}
                .assignment-card {{ background-color: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .assignment-header {{ font-size: 1.3em; font-weight: bold; color: #2c5282; margin-bottom: 15px; text-align: center; }}
                .detail {{ margin: 10px 0; }}
                .label {{ font-weight: bold; color: #4a5568; }}
                .value {{ color: #2d3748; }}
                .price {{ font-size: 1.1em; font-weight: bold; color: #38a169; }}
                .status {{ padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #dbeafe; color: #1e40af; }}
                .important {{ background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }}
                .footer {{ background-color: #2c5282; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔧 Vargas' Home Services</h1>
                <h2>📋 New Service Assignment</h2>
            </div>
            <div class="content">
                <p>Dear {assigned_employee.get('first_name', 'Team Member')},</p>
                <p>You have been assigned a new service appointment. Please review the details below:</p>
                
                <div class="assignment-card">
                    <div class="assignment-header">Work Order #{service_request['request_id']}</div>
                    <div class="detail"><span class="label">Service:</span> <span class="value">{service['job_name']}</span></div>
                    <div class="detail"><span class="label">Service Type:</span> <span class="value">{service['service_type']}</span></div>
                    <div class="detail"><span class="label">Status:</span> <span class="status">In Progress</span></div>
                    <div class="detail"><span class="label">Scheduled Date:</span> <span class="value">{service_request['preferred_datetime']}</span></div>
                    <div class="detail"><span class="label">Final Price:</span> <span class="value price">${service_request.get('final_price', 0):.2f}</span></div>
                    <div class="detail"><span class="label">Customer:</span> <span class="value">{customer.get('first_name', '')} {customer.get('last_name', '')}</span></div>
                    <div class="detail"><span class="label">Customer Phone:</span> <span class="value">{customer.get('phone', 'Not provided')}</span></div>
                    <div class="detail"><span class="label">Customer Email:</span> <span class="value">{customer.get('email', 'Not provided')}</span></div>
                    <div class="detail"><span class="label">Service Address:</span> <span class="value">{address['street']}, {address['city']}, {address['state']} {address['zip_code']}</span></div>
                    <div class="detail"><span class="label">Service Description:</span> <span class="value">{service_request['request_description']}</span></div>
                </div>
                
                <div class="important">
                    <strong>📋 Assignment Instructions:</strong><br>
                    • Contact the customer to confirm the appointment time<br>
                    • Arrive punctually at the scheduled time<br>
                    • Bring all necessary tools and equipment<br>
                    • Provide professional and courteous service<br>
                    • Update the work order status upon completion
                </div>
                
                <p>If you have any questions about this assignment, please contact management immediately.</p>
                <p>Thank you for your dedication to excellent service!</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Vargas' Home Services - Excellence in Every Job</p>
            </div>
        </body>
        </html>
        """
        return html
    
    def _create_employee_appointment_text(self, service_request: Dict[Any, Any]) -> str:
        """Create plain text email content for employee appointment notification."""
        customer = service_request['customer']
        service = service_request['service']
        address = service_request['address']
        assigned_employee = service_request.get('assigned_employee', {})
        
        text = f"""
VARGAS' HOME SERVICES
📋 NEW SERVICE ASSIGNMENT

Dear {assigned_employee.get('first_name', 'Team Member')},

You have been assigned a new service appointment. Please review the details below:

ASSIGNMENT DETAILS:
==================
Work Order #: {service_request['request_id']}
Service: {service['job_name']}
Service Type: {service['service_type']}
Status: IN PROGRESS
Scheduled Date: {service_request['preferred_datetime']}
Final Price: ${service_request.get('final_price', 0):.2f}

CUSTOMER INFORMATION:
====================
Customer: {customer.get('first_name', '')} {customer.get('last_name', '')}
Phone: {customer.get('phone', 'Not provided')}
Email: {customer.get('email', 'Not provided')}
Service Address: {address['street']}, {address['city']}, {address['state']} {address['zip_code']}

SERVICE DESCRIPTION:
===================
{service_request['request_description']}

ASSIGNMENT INSTRUCTIONS:
=======================
• Contact the customer to confirm the appointment time
• Arrive punctually at the scheduled time
• Bring all necessary tools and equipment
• Provide professional and courteous service
• Update the work order status upon completion

If you have any questions about this assignment, please contact management immediately.

Thank you for your dedication to excellent service!

Vargas' Home Services - Excellence in Every Job
{datetime.now().strftime('%B %d, %Y')}
"""
        return text
