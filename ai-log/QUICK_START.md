# Quick Start Guide - Vargas Home Service App

## 🚀 Run the Application

```powershell
# Navigate to server folder
cd server

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run the app
python main.py
```

## 🌐 Access Points

### Frontend Pages
- **Home**: http://localhost:5000/
- **Login**: http://localhost:5000/login
- **Owner**: http://localhost:5000/owner

### Admin Pages
- http://localhost:5000/admin/employee
- http://localhost:5000/admin/financial
- http://localhost:5000/admin/service
- http://localhost:5000/admin/timesheet
- http://localhost:5000/admin/warranty

### Employee Pages
- http://localhost:5000/employee/availability
- http://localhost:5000/employee/profile
- http://localhost:5000/employee/view

### Customer Pages
- http://localhost:5000/appointment
- http://localhost:5000/warranty
- http://localhost:5000/workorder

### API Endpoints
- **Health Check**: GET http://localhost:5000/db-check
- **List Workorders**: GET http://localhost:5000/workorders
- **Create Workorder**: POST http://localhost:5000/workorders
- **Warranty Lookup**: POST http://localhost:5000/api/warranty/lookup

## 📁 Project Structure

```
server/
├── repositories/      # Database access (raw SQL)
├── services/          # Business logic
├── routes/            # HTTP endpoints
├── templates/         # HTML files
├── static/           # CSS & JS files
├── config.py         # Configuration
├── __init__.py       # App factory
└── main.py           # Entry point
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=1
```

## 📚 Documentation

- **BACKEND_ARCHITECTURE.md** - Detailed backend documentation
- **REFACTORING_COMPLETE.md** - Complete refactoring overview
- **ARCHITECTURE_DIAGRAM.md** - Visual architecture diagram
- **CHECKLIST.md** - Completion checklist
- **QUICK_START.md** - This file

## 🧪 Test API with curl

### Create Workorder
```powershell
curl -X POST http://localhost:5000/workorders `
  -H "Content-Type: application/json" `
  -d '{
    "workorderId": 1,
    "requestId": 101,
    "customerId": 2001,
    "scheduledDate": "2025-10-20",
    "isCompleted": false
  }'
```

### List Workorders
```powershell
curl http://localhost:5000/workorders
```

### Warranty Lookup
```powershell
curl -X POST http://localhost:5000/api/warranty/lookup `
  -H "Content-Type: application/json" `
  -d '{
    "email": "customer@example.com",
    "phone": "123-456-7890"
  }'
```

## 🛠️ Development

### Install Dependencies
```powershell
pip install -r requirements.txt
```

### Dependencies
- Flask (web framework)
- psycopg2-binary (PostgreSQL adapter)
- python-dotenv (environment variables)

## 📝 Common Commands

```powershell
# Activate venv
.\venv\Scripts\Activate.ps1

# Deactivate venv
deactivate

# Run app
python main.py

# Install new package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

## 🎯 Architecture Layers

1. **Routes** → Handle HTTP requests/responses
2. **Services** → Validate & process business logic
3. **Repositories** → Execute SQL queries

**Request Flow**: Client → Route → Service → Repository → Database

## ✅ Everything is Ready!

Just run `python main.py` and start developing! 🚀
