# Vargas Home Service App

A Flask backend API for scheduling handyman appointments.

## Setup Instructions

### Prerequisites
- Python 3.8+
- VS Code

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HuyGHuynh/vargas-home-service-app.git
   cd vargas-home-service-app
   ```

2. **Navigate to server directory**
   ```bash
   cd server
   ```

3. **Create virtual environment**
   ```bash
   py -m venv venv
   venv\Scripts\activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   - Create `.env` file in the `server` directory
   - Add your database URL:
     ```
     DATABASE_URL=your_neon_postgresql_url_here
     ```

6. **Run the application**
   ```bash
   py main.py
   ```

The API will be available at `http://127.0.0.1:5000`

## API Endpoints

- `POST /order` - Create new appointment order
- Required fields: `LastName`, `FirstName`, `Address`, `phoneNumber`, `workType`
