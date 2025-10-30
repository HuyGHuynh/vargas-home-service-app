# Unable to test

# In Powershell Type (For API KEY)
# " setx SENDGRID_API_KEY "YOUR_KEY_HERE" ""

#In Mac/ Linux Type (for API KEY)
#" export SENDGRID_API_KEY="YOUR_KEY_HERE" "

#In VS (install SendGrid phython library) Type 
#" pip install sendgrid "

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

def send_email(to_email, subject, html_content):
    message = Mail(
        from_email="appointments@yourdomain.com",
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code
    except Exception as e:
        print("Email error:", e)
        return None
