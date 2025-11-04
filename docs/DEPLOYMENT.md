# PythonAnywhere Deployment Guide

This guide covers deploying the Vargas Home Service App to PythonAnywhere with Gmail API integration.

## Pre-Deployment Checklist

### 📁 Files to Upload
- ✅ All `app/` directory contents
- ✅ `requirements.txt`
- ✅ `.env.example` (as reference)
- ❌ **DO NOT upload**: `credentials.json`, `token.json`, `.env`, `venv/`

### 🔐 Gmail API Setup on Server
1. **Upload credentials manually**:
   - Upload your `credentials.json` to PythonAnywhere project root
   - First app run will create `token.json` automatically

2. **Environment variables**:
   - Set in PythonAnywhere dashboard or create `.env` file
   - Required: `SENDER_EMAIL`, `SENDER_NAME`, `DATABASE_URL`

## Deployment Steps

### 1. Upload Files
```bash
# Local: Create deployment package (exclude sensitive files)
# Upload via PythonAnywhere files interface or git
```

### 2. Install Dependencies
```bash
# In PythonAnywhere console
pip3.10 install --user -r requirements.txt
```

### 3. Configure Environment
Create `.env` file on server:
```env
DATABASE_URL=your_production_database_url
SENDER_EMAIL=vargashomeservice3@gmail.com
SENDER_NAME=Vargas' Home Services
FLASK_ENV=production
SECRET_KEY=your_strong_production_secret_key
```

### 4. Gmail API Setup
1. Upload `credentials.json` to project root
2. Test Gmail connection:
   ```bash
   cd /home/yourusername/vargas-home-service-app
   python3.10 tests/test_gmail.py
   ```
3. Complete OAuth flow (will create `token.json`)

### 5. Configure WSGI
Create `/var/www/yourusername_pythonanywhere_com_wsgi.py`:
```python
import sys
import os

# Add your project directory
project_home = '/home/yourusername/vargas-home-service-app'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set up environment
os.chdir(project_home)
from dotenv import load_dotenv
load_dotenv()

# Import Flask app
from app.main import app as application

if __name__ == "__main__":
    application.run()
```

### 6. Set Up Static Files
In PythonAnywhere web interface:
- **Static files URL**: `/static/`
- **Static files directory**: `/home/yourusername/vargas-home-service-app/app/static/`

## Important Notes

### 🔐 Security
- **Never commit** `credentials.json` or `token.json`
- Use strong `SECRET_KEY` in production
- Use production database URL
- Enable HTTPS in production

### 📧 Gmail API Considerations
- First deployment requires manual OAuth completion
- `token.json` will be auto-generated on server
- Ensure `vargashomeservice3@gmail.com` is added as test user
- Gmail API has daily sending limits

### 🐛 Troubleshooting

**Gmail API Issues:**
```bash
# Check credentials file exists
ls -la credentials.json

# Test Gmail connection
python3.10 tests/test_gmail.py

# Check environment variables
python3.10 -c "import os; print(os.getenv('SENDER_EMAIL'))"
```

**Path Issues:**
- Ensure all imports use relative paths within app
- Check WSGI file paths are correct
- Verify static files configuration

### 📊 Monitoring
- Check error logs in PythonAnywhere dashboard
- Monitor Gmail API quota usage
- Test warranty email functionality after deployment

## Production Differences

| Local | Production |
|-------|------------|
| `credentials.json` in root | Upload manually to server |
| `python main.py` | WSGI configuration |
| SQLite/Local DB | Production PostgreSQL |
| `FLASK_ENV=development` | `FLASK_ENV=production` |
| Console OAuth | Manual OAuth setup |

## Final Testing
1. ✅ Web application loads
2. ✅ Database connections work
3. ✅ Warranty lookup functions
4. ✅ Gmail API sends emails
5. ✅ All static files load correctly