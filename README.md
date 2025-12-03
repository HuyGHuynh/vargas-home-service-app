# Vargas Home Service App

A comprehensive Flask web application for managing home service appointments, employee scheduling, warranty management, and customer communications.

## Features

- **Customer Management**: Service request creation, appointment scheduling, warranty tracking
- **Employee Portal**: Availability submission, work assignment tracking, profile management
- **Admin Dashboard**: Service request management, employee oversight, financial tracking
- **Email Integration**: Automated notifications via Gmail API
- **File Storage**: Image uploads via Google Cloud Storage
- **Review System**: Customer feedback and rating system

## Prerequisites

- Python 3.8+
- PostgreSQL database (Neon.tech recommended)
- Google Cloud Platform account
- Gmail account for email services

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/HuyGHuynh/vargas-home-service-app.git
cd vargas-home-service-app
```

### 2. Create Virtual Environment
```bash
# Windows
py -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the project root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Base URL Configuration (adjust for your deployment)
BASE_URL=http://localhost:5000

# Gmail API Configuration
SENDER_EMAIL=your-email@gmail.com
SENDER_NAME=Vargas' Home Services

# Google Cloud Storage Configuration
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=credentials/gcs-service-account.json

# Optional: Email Configuration (if using SMTP instead of Gmail API)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## Google Services Setup

### Gmail API Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Note your project ID

2. **Enable Gmail API**
   - Navigate to APIs & Services → Library
   - Search for "Gmail API"
   - Click Enable

3. **Create OAuth Credentials**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Desktop application"
   - Download the credentials JSON file
   - Rename it to `credentials.json` and place in project root

4. **Configure OAuth Consent Screen**
   - Go to APIs & Services → OAuth consent screen
   - Add your email to test users
   - Add authorized domains if needed

5. **First-time Authentication**
   ```bash
   # Run this script to authenticate and generate token.json
   py refresh_oauth.py
   ```

### Google Cloud Storage Setup

1. **Create Storage Bucket**
   - Go to Cloud Storage → Browser
   - Click "Create Bucket"
   - Choose a globally unique name
   - Select appropriate region
   - Set access control to "Fine-grained"

2. **Create Service Account**
   - Go to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Give it a name and description
   - Grant "Storage Object Admin" role
   - Create and download JSON key

3. **Configure Service Account**
   - Create `credentials/` folder in project root
   - Place the service account JSON file as `credentials/gcs-service-account.json`
   - Update `GOOGLE_APPLICATION_CREDENTIALS` in `.env`

## Database Setup

### Using Neon.tech (Recommended)

1. **Create Neon Account**
   - Go to [Neon.tech](https://neon.tech/)
   - Create a free account
   - Create a new project

2. **Get Connection String**
   - Copy the connection string from dashboard
   - Add to `.env` as `DATABASE_URL`

3. **Database Schema**
   The application expects specific database tables. Import the schema from `database/schema.sql` (if available) or run the application to auto-create tables.

## Running the Application

### Development Mode
```bash
# Make sure virtual environment is activated
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Navigate to app directory and run
cd app
py main.py
```

The application will be available at `http://localhost:5000`

### Production Deployment

For production deployment on platforms like PythonAnywhere:

1. **Update Base URL**
   ```env
   BASE_URL=https://yourdomain.pythonanywhere.com
   ```

2. **OAuth Redirect URLs**
   - Add production domain to Google Cloud OAuth settings
   - Include: `https://yourdomain.pythonanywhere.com/oauth2callback`

## Application Structure

```
vargas-home-service-app/
├── app/
│   ├── __init__.py              # Application factory
│   ├── main.py                  # Application entry point
│   ├── config.py                # Configuration settings
│   ├── repositories/            # Database access layer
│   ├── routes/                  # API and page routes
│   ├── services/                # Business logic services
│   ├── static/                  # CSS, JS, images
│   └── templates/               # HTML templates
├── credentials/                 # Service account files
├── credentials.json             # OAuth credentials
├── token.json                   # OAuth token (auto-generated)
├── .env                        # Environment variables
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Key Features Usage

### Customer Portal
- **Appointment Booking**: `/appointment`
- **Service Tracking**: Automated email notifications
- **Warranty Management**: `/warranty-selection`
- **Review Submission**: Customer feedback system

### Employee Portal
- **Dashboard**: `/employee/{id}/view`
- **Profile Management**: `/employee/{id}/profile`
- **Availability**: `/employee/{id}/availability`

### Admin Dashboard
- **Service Management**: `/owner`
- **Employee Management**: `/admin/employee`
- **Financial Tracking**: `/admin/financial`
- **Warranty Oversight**: `/admin/warranty`

## Troubleshooting

### Common Issues

1. **"app is not defined" Error**
   - Ensure Flask-Mail is properly configured in `__init__.py`, not in route files

2. **Gmail API Authentication**
   - Run `python refresh_oauth.py` to refresh expired tokens
   - Check OAuth credentials are correctly placed

3. **Database Connection**
   - Verify `DATABASE_URL` format in `.env`
   - Ensure database exists and is accessible

4. **File Upload Issues**
   - Check GCS bucket permissions
   - Verify service account has Storage Object Admin role

### Development Tips

- Use `git stash` to temporarily save changes before pulling updates
- Keep sensitive files (`.env`, `credentials.json`, `token.json`) in `.gitignore`
- Test email functionality with `EmailService.test_connection()`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: contact@vargashome.com
