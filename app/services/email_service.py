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
        
        # If no valid credentials, try to refresh or raise error
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    # Save refreshed credentials
                    with open(self.token_file, 'w') as token:
                        token.write(creds.to_json())
                except Exception as e:
                    raise Exception(f"Token refresh failed: {e}. Please regenerate token.json locally.")
            else:
                raise Exception(f"No valid credentials found. Please ensure token.json exists and contains a valid refresh token.")
        
        service = build('gmail', 'v1', credentials=creds)
        return service

    def send_password_reset_email(self, recipient_email: str, reset_link: str) -> bool:
        try:
            if not self.service:
                self.service = self.authenticate_gmail()

            message = MIMEMultipart('alternative')
            message['To'] = recipient_email
            message['From'] = f"{self.sender_name} <{self.sender_email}>"
            message['Subject'] = "Password Reset Request"

            html_content = self._create_password_reset_html(reset_link)
            text_content = self._create_password_reset_text(reset_link)

            message.attach(MIMEText(text_content, 'plain'))
            message.attach(MIMEText(html_content, 'html'))

            raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw}

            self.service.users().messages().send(
              userId='me',
             body=send_message
            ).execute()

            print(f"✅ Password reset email sent to {recipient_email}")
            return True

        except Exception as e:
            print(f"❌ Failed to send password reset email: {e}")
            return False
            
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
    
    @staticmethod
    def send_warranty_selection_email(customer_email: str, customer_name: str, request_id: int, 
                                    warranty_id: int, warranty_description: str, warranty_price: float,
                                    warranty_start_date: str, warranty_end_date: str) -> bool:
        """
        Send warranty selection email to customer with accept/decline links.
        
        Args:
            customer_email: Customer's email address
            customer_name: Customer's full name
            request_id: Service request ID
            warranty_id: Warranty ID
            warranty_description: Warranty description
            warranty_price: Warranty price
            warranty_start_date: Warranty start date
            warranty_end_date: Warranty end date
            
        Returns:
            bool: True if sent successfully
        """
        try:
            email_service = EmailService()
            
            # Get Gmail service
            if not email_service.service:
                email_service.service = email_service.authenticate_gmail()
            
            # Create email
            message = MIMEMultipart('alternative')
            message['To'] = customer_email
            message['From'] = f"{email_service.sender_name} <{email_service.sender_email}>"
            message['Subject'] = f"Extended Warranty Available - Work Order #{request_id}"
            
            # Create email content
            base_url = os.getenv('BASE_URL', 'http://localhost:5000')
            warranty_url = f"{base_url}/warranty-selection?request_id={request_id}&warranty_id={warranty_id}"
            
            html_content = email_service._create_warranty_selection_html(
                customer_name, request_id, warranty_description, warranty_price,
                warranty_start_date, warranty_end_date, warranty_url
            )
            text_content = email_service._create_warranty_selection_text(
                customer_name, request_id, warranty_description, warranty_price,
                warranty_start_date, warranty_end_date, warranty_url
            )
            
            # Attach content
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw_message}
            
            result = email_service.service.users().messages().send(userId='me', body=send_message).execute()
            print(f"✅ Warranty selection email sent to {customer_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send warranty selection email: {e}")
            return False
    
    def _create_warranty_selection_html(self, customer_name: str, request_id: int, 
                                      warranty_description: str, warranty_price: float,
                                      warranty_start_date: str, warranty_end_date: str,
                                      warranty_url: str) -> str:
        """Create HTML email content for warranty selection."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f7fafc; padding: 30px; }}
                .warranty-card {{ background-color: white; margin: 20px 0; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .warranty-header {{ font-size: 1.4em; font-weight: bold; color: #2c5282; margin-bottom: 20px; text-align: center; }}
                .detail {{ margin: 12px 0; }}
                .label {{ font-weight: bold; color: #4a5568; }}
                .value {{ color: #2d3748; }}
                .price {{ font-size: 1.3em; font-weight: bold; color: #38a169; }}
                .benefits {{ background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
                .benefits ul {{ margin: 10px 0; padding-left: 20px; }}
                .benefits li {{ margin: 5px 0; }}
                .button-container {{ text-align: center; margin: 30px 0; }}
                .btn {{ display: inline-block; padding: 15px 30px; margin: 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }}
                .btn-accept {{ background-color: #38a169; color: white; }}
                .btn-decline {{ background-color: #e53e3e; color: white; }}
                .btn:hover {{ opacity: 0.9; }}
                .important {{ background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }}
                .footer {{ background-color: #2c5282; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🛡️ Vargas' Home Services</h1>
                <h2>Extended Warranty Available</h2>
            </div>
            <div class="content">
                <p>Dear {customer_name},</p>
                <p>Great news! Your recent service has been completed successfully. We're pleased to offer you an extended warranty for your peace of mind.</p>
                
                <div class="warranty-card">
                    <div class="warranty-header">Extended Warranty Offer</div>
                    <div class="detail"><span class="label">Work Order:</span> <span class="value">#{request_id}</span></div>
                    <div class="detail"><span class="label">Coverage Period:</span> <span class="value">{warranty_start_date} to {warranty_end_date}</span></div>
                    <div class="detail"><span class="label">Description:</span> <span class="value">{warranty_description}</span></div>
                    <div class="detail"><span class="label">Warranty Price:</span> <span class="value price">${warranty_price:.2f}</span></div>
                </div>
                
                <div class="benefits">
                    <strong>🌟 Warranty Benefits:</strong>
                    <ul>
                        <li>✅ Coverage for defects in workmanship</li>
                        <li>✅ Priority scheduling for warranty repairs</li>
                        <li>✅ No additional diagnostic fees</li>
                        <li>✅ Peace of mind protection</li>
                        <li>✅ Professional service guarantee</li>
                    </ul>
                </div>
                
                <div class="button-container">
                    <a href="{warranty_url}" class="btn btn-accept">📋 View Warranty Details & Make Decision</a>
                </div>
                
                <div class="important">
                    <strong>⏰ Limited Time Offer:</strong><br>
                    This warranty offer is available for the next 24 hours. After that, this opportunity will expire.
                </div>
                
                <p>Click the button above to review the complete warranty details and decide whether to accept or decline this protection plan.</p>
                <p>If you have any questions about this warranty offer, please don't hesitate to contact us at support@vargashome.com</p>
                <p>Thank you for choosing Vargas' Home Services!</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Vargas' Home Services - Your Trusted Service Partner</p>
            </div>
        </body>
        </html>
        """
        return html
    
    def _create_warranty_selection_text(self, customer_name: str, request_id: int,
                                      warranty_description: str, warranty_price: float,
                                      warranty_start_date: str, warranty_end_date: str,
                                      warranty_url: str) -> str:
        """Create plain text email content for warranty selection."""
        text = f"""
VARGAS' HOME SERVICES
🛡️ EXTENDED WARRANTY AVAILABLE

Dear {customer_name},

Great news! Your recent service has been completed successfully. We're pleased to offer you an extended warranty for your peace of mind.

EXTENDED WARRANTY OFFER:
=======================
Work Order: #{request_id}
Coverage Period: {warranty_start_date} to {warranty_end_date}
Description: {warranty_description}
Warranty Price: ${warranty_price:.2f}

WARRANTY BENEFITS:
==================
✅ Coverage for defects in workmanship
✅ Priority scheduling for warranty repairs
✅ No additional diagnostic fees
✅ Peace of mind protection
✅ Professional service guarantee

MAKE YOUR DECISION:
==================
To view complete warranty details and make your decision, visit:
{warranty_url}

⏰ LIMITED TIME OFFER:
This warranty offer is available for the next 24 hours. After that, this opportunity will expire.

Click the link above to review the complete warranty details and decide whether to accept or decline this protection plan.

If you have any questions about this warranty offer, please don't hesitate to contact us at support@vargashome.com

Thank you for choosing Vargas' Home Services!

Vargas' Home Services - Your Trusted Service Partner
{datetime.now().strftime('%B %d, %Y')}
"""
        return text

    def send_final_price_notification_email(self, customer_email: str, service_request: Dict[Any, Any]) -> bool:
        """
        Send final price notification email to customer for pending service request.
        
        Args:
            customer_email: Customer's email address
            service_request: Service request details from database
            
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
            message['Subject'] = f"Final Price Set - Work Order #{service_request['request_id']}"
            
            # Create email content
            html_content = self._create_final_price_notification_html(service_request)
            text_content = self._create_final_price_notification_text(service_request)
            
            # Attach content
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw_message}
            
            result = self.service.users().messages().send(userId='me', body=send_message).execute()
            print(f"✅ Final price notification sent to {customer_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send final price notification: {e}")
            return False
    
    def _create_final_price_notification_html(self, service_request: Dict[Any, Any]) -> str:
        """Create HTML email content for final price notification."""
        customer = service_request['customer']
        service = service_request['service']
        address = service_request['address']
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f7fafc; padding: 20px; }}
                .price-card {{ background-color: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .price-header {{ font-size: 1.3em; font-weight: bold; color: #2c5282; margin-bottom: 15px; text-align: center; }}
                .detail {{ margin: 10px 0; }}
                .label {{ font-weight: bold; color: #4a5568; }}
                .value {{ color: #2d3748; }}
                .final-price {{ font-size: 1.4em; font-weight: bold; color: #38a169; text-align: center; background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; }}
                .status {{ padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #fef3c7; color: #92400e; }}
                .next-steps {{ background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }}
                .footer {{ background-color: #2c5282; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>💰 Vargas' Home Services</h1>
                <h2>Final Price Set for Your Service Request</h2>
            </div>
            <div class="content">
                <p>Dear {customer.get('first_name', '')} {customer.get('last_name', '')},</p>
                <p>We've reviewed your service request and have set the final price for your upcoming appointment.</p>
                
                <div class="price-card">
                    <div class="price-header">Work Order #{service_request['request_id']}</div>
                    <div class="detail"><span class="label">Service:</span> <span class="value">{service['job_name']}</span></div>
                    <div class="detail"><span class="label">Service Type:</span> <span class="value">{service['service_type']}</span></div>
                    <div class="detail"><span class="label">Status:</span> <span class="status">Pending</span></div>
                    <div class="detail"><span class="label">Scheduled Date:</span> <span class="value">{service_request['preferred_datetime']}</span></div>
                    <div class="detail"><span class="label">Service Address:</span> <span class="value">{address['street']}, {address['city']}, {address['state']} {address['zip_code']}</span></div>
                    <div class="detail"><span class="label">Description:</span> <span class="value">{service_request['request_description']}</span></div>
                    
                    <div class="final-price">
                        <div>Final Price</div>
                        <div>${service_request.get('final_price', 0):.2f}</div>
                    </div>
                </div>
                
                <div class="next-steps">
                    <strong>📋 What's Next:</strong><br>
                    • Your service request is now priced and pending acceptance<br>
                    • Our team will contact you to confirm the appointment<br>
                    • Payment will be collected upon completion of service<br>
                    • You'll receive a confirmation email once the appointment is scheduled
                </div>
                
                <p>If you have any questions about this pricing or need to discuss the service details, please don't hesitate to contact us at support@vargashome.com</p>
                <p>Thank you for choosing Vargas' Home Services!</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Vargas' Home Services - Transparent. Professional. Reliable.</p>
            </div>
        </body>
        </html>
        """
        return html
    
    def _create_final_price_notification_text(self, service_request: Dict[Any, Any]) -> str:
        """Create plain text email content for final price notification."""
        customer = service_request['customer']
        service = service_request['service']
        address = service_request['address']
        
        text = f"""
VARGAS' HOME SERVICES
💰 FINAL PRICE SET FOR YOUR SERVICE REQUEST

Dear {customer.get('first_name', '')} {customer.get('last_name', '')},

We've reviewed your service request and have set the final price for your upcoming appointment.

SERVICE DETAILS:
================
Work Order #: {service_request['request_id']}
Service: {service['job_name']}
Service Type: {service['service_type']}
Status: PENDING
Scheduled Date: {service_request['preferred_datetime']}
Service Address: {address['street']}, {address['city']}, {address['state']} {address['zip_code']}
Description: {service_request['request_description']}

FINAL PRICE: ${service_request.get('final_price', 0):.2f}

WHAT'S NEXT:
============
• Your service request is now priced and pending acceptance
• Our team will contact you to confirm the appointment
• Payment will be collected upon completion of service  
• You'll receive a confirmation email once the appointment is scheduled

If you have any questions about this pricing or need to discuss the service details, please don't hesitate to contact us at support@vargashome.com

Thank you for choosing Vargas' Home Services!

Vargas' Home Services - Transparent. Professional. Reliable.
{datetime.now().strftime('%B %d, %Y')}
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

    @staticmethod
    def send_service_completion_email(customer_email: str, customer_name: str, request_id: int, customer_id: int = None) -> bool:
        """
        Send service completion email with review link to customer.
        
        Args:
            customer_email: Customer's email address
            customer_name: Customer's full name
            request_id: Service request ID
            
        Returns:
            bool: True if sent successfully
        """
        try:
            email_service = EmailService()
            
            # Get Gmail service
            if not email_service.service:
                email_service.service = email_service.authenticate_gmail()
            
            # Create email
            message = MIMEMultipart('alternative')
            message['To'] = customer_email
            message['From'] = f"{email_service.sender_name} <{email_service.sender_email}>"
            message['Subject'] = f"Service Completed - We'd Love Your Feedback! - Work Order #{request_id}"
            
            # Create email content
            base_url = os.getenv('BASE_URL', 'http://localhost:5000')
            
            # Include customer_id in URL if provided
            if customer_id:
                review_url = f"{base_url}/review.html?request_id={request_id}&customer_id={customer_id}"
            else:
                review_url = f"{base_url}/review.html?request_id={request_id}"
            
            html_content = email_service._create_service_completion_html(
                customer_name, request_id, review_url
            )
            text_content = email_service._create_service_completion_text(
                customer_name, request_id, review_url
            )
            
            # Attach content
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw_message}
            
            result = email_service.service.users().messages().send(userId='me', body=send_message).execute()
            print(f"✅ Service completion email sent to {customer_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send service completion email: {e}")
            return False
    
    def _create_service_completion_html(self, customer_name: str, request_id: int, review_url: str) -> str:
        """Create HTML email content for service completion with review link."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f7fafc; padding: 30px; }}
                .completion-card {{ background-color: white; margin: 20px 0; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }}
                .completion-header {{ font-size: 1.4em; font-weight: bold; color: #38a169; margin-bottom: 20px; }}
                .review-section {{ background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
                .button-container {{ text-align: center; margin: 30px 0; }}
                .btn {{ display: inline-block; padding: 18px 35px; margin: 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; }}
                .btn-review {{ background-color: #3182ce; color: white; }}
                .btn:hover {{ opacity: 0.9; }}
                .stars {{ font-size: 24px; color: #ffd700; margin: 10px 0; }}
                .thank-you {{ background-color: #fff5f5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #e53e3e; }}
                .footer {{ background-color: #2c5282; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏠 Vargas' Home Services</h1>
                <h2>Service Completed Successfully!</h2>
            </div>
            <div class="content">
                <p>Dear {customer_name},</p>
                <p>We're pleased to let you know that your service has been completed successfully!</p>
                
                <div class="completion-card">
                    <div class="completion-header">✅ Work Order #{request_id} - COMPLETED</div>
                    <p>Our team has finished your service and everything is ready for you to enjoy.</p>
                </div>
                
                <div class="review-section">
                    <strong>🌟 How did we do?</strong>
                    <div class="stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
                    <p>Your feedback is incredibly valuable to us! It helps us maintain our high standards and improve our services for all customers.</p>
                    <p><strong>Please take just 2 minutes to share your experience:</strong></p>
                    
                    <div class="button-container">
                        <a href="{review_url}" class="btn btn-review">📝 Leave Your Review</a>
                    </div>
                    
                    <p><em>Your review will help other customers and allows us to recognize our outstanding team members.</em></p>
                </div>
                
                <div class="thank-you">
                    <strong>❤️ Thank You!</strong><br>
                    Thank you for choosing Vargas' Home Services. We appreciate your trust in our team and hope we exceeded your expectations.
                </div>
                
                <p>If you have any questions about the completed service or need future assistance, please don't hesitate to contact us at support@vargashome.com</p>
                <p>We look forward to serving you again!</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Vargas' Home Services - Excellence in Every Service</p>
            </div>
        </body>
        </html>
        """
        return html
    
    def _create_service_completion_text(self, customer_name: str, request_id: int, review_url: str) -> str:
        """Create plain text email content for service completion with review link."""
        text = f"""
VARGAS' HOME SERVICES
🏠 SERVICE COMPLETED SUCCESSFULLY!

Dear {customer_name},

We're pleased to let you know that your service has been completed successfully!

✅ WORK ORDER #{request_id} - COMPLETED
=========================================
Our team has finished your service and everything is ready for you to enjoy.

🌟 HOW DID WE DO?
================
⭐ ⭐ ⭐ ⭐ ⭐

Your feedback is incredibly valuable to us! It helps us maintain our high standards and improve our services for all customers.

Please take just 2 minutes to share your experience:
{review_url}

Your review will help other customers and allows us to recognize our outstanding team members.

❤️ THANK YOU!
=============
Thank you for choosing Vargas' Home Services. We appreciate your trust in our team and hope we exceeded your expectations.

If you have any questions about the completed service or need future assistance, please don't hesitate to contact us at support@vargashome.com

We look forward to serving you again!

Vargas' Home Services - Excellence in Every Service
{datetime.now().strftime('%B %d, %Y')}
"""
        return text

    def _create_password_reset_html(self, reset_link: str) -> str:
        """Create HTML content for password reset email."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #8FABD4 0%, #4A70A9 100%); color: white; padding: 30px; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 30px; }}
                .button {{ display: inline-block; background: #4A70A9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔒 Password Reset Request</h1>
                </div>
                <div class="content">
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset your password for your Vargas' Home Services account.</p>
                    <p>Click the button below to reset your password:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </p>
                    <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #4A70A9;">{reset_link}</p>
                </div>
                <div class="footer">
                    <p>© {datetime.now().year} Vargas' Home Services - Professional Home Services</p>
                    <p>If you have any questions, contact us at support@vargashome.com</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html

    def _create_password_reset_text(self, reset_link: str) -> str:
        """Create plain text content for password reset email."""
        text = f"""
🔒 PASSWORD RESET REQUEST
=========================

Hello,

We received a request to reset your password for your Vargas' Home Services account.

RESET YOUR PASSWORD
===================
Click this link to reset your password: {reset_link}

⏰ IMPORTANT: This link will expire in 1 hour for security reasons.

DIDN'T REQUEST THIS?
====================
If you didn't request this password reset, please ignore this email. 
Your password will remain unchanged and secure.

NEED HELP?
==========
If you have any questions or need assistance, please contact us at:
Email: support@vargashome.com

© {datetime.now().year} Vargas' Home Services - Professional Home Services
"""
        return text
