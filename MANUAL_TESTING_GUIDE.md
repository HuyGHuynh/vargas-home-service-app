# 🧪 Manual Testing Guide for Warranty System

## Prerequisites
- Flask app running on http://localhost:5000
- Database with service_requests table containing at least one "In Progress" request
- Admin access to complete service orders

## Test Scenarios

### 📋 **Scenario 1: Admin Creates Warranty (Happy Path)**

1. **Login as Admin**
   - Go to `http://localhost:5000/login`
   - Login with admin credentials

2. **Navigate to Admin Dashboard**
   - Go to `http://localhost:5000/owner-view`
   - Look for "In Progress" service requests

3. **Complete Order with Warranty**
   - Click on an "In Progress" request
   - Fill out completion details
   - **IMPORTANT**: Fill out the warranty section:
     - Description: "90-day comprehensive HVAC warranty"
     - Start Date: Today's date
     - End Date: 90 days from today
     - Price: $199.99
   - Click "Complete Order"

4. **Expected Results**
   - ✅ Order status changes to "Completed"
   - ✅ Success message appears
   - ✅ Warranty record created in database
   - ✅ Email sent to customer (if email configured)

### 📧 **Scenario 2: Customer Email Testing**

1. **Check Email Delivery**
   - If Gmail API is configured, check customer's email
   - Email should contain:
     - Professional warranty offer
     - Accept and Decline buttons/links
     - Warranty details (price, coverage period)
     - Contact information

2. **Email Link Format**
   ```
   Accept: http://localhost:5000/warranty-selection?request_id=1&warranty_id=1&action=accept
   Decline: http://localhost:5000/warranty-selection?request_id=1&warranty_id=1&action=decline
   View: http://localhost:5000/warranty-selection?request_id=1&warranty_id=1
   ```

### 🌐 **Scenario 3: Customer Warranty Page Testing**

#### Test 3A: Direct Accept
1. **Click Accept Link from Email**
   - URL should include `&action=accept`
   - Page should immediately process acceptance
   - Show success confirmation with warranty details

#### Test 3B: Direct Decline  
1. **Click Decline Link from Email**
   - URL should include `&action=decline`
   - Page should immediately process decline
   - Show decline confirmation with standard coverage info

#### Test 3C: Manual Selection
1. **Visit warranty page without action parameter**
   - Go to: `http://localhost:5000/warranty-selection?request_id=1&warranty_id=1`
   - Page should display warranty details
   - Should show Accept/Decline buttons
   - Click either button to test functionality

### 🔌 **Scenario 4: API Endpoint Testing**

Open PowerShell/Command Prompt and test APIs:

#### Test Complete Service Request
```powershell
# Test completing a service request with warranty
curl -X PUT http://localhost:5000/api/service-requests/1/complete `
  -H "Content-Type: application/json" `
  -d '{
    "warranty": {
      "description": "90-day comprehensive service warranty",
      "start_date": "2024-11-06",
      "end_date": "2025-02-04",
      "price": 199.99
    }
  }'
```

#### Test Get Warranty
```powershell
# Get warranty details
curl http://localhost:5000/api/warranties/1
```

#### Test Accept Warranty
```powershell
# Accept warranty
curl -X PUT http://localhost:5000/api/warranties/1/status `
  -H "Content-Type: application/json" `
  -d '{"status": "Active"}'
```

#### Test Decline Warranty
```powershell
# Decline warranty
curl -X PUT http://localhost:5000/api/warranties/1/status `
  -H "Content-Type: application/json" `
  -d '{"status": "Declined"}'
```

#### Test Cleanup
```powershell
# Run cleanup
curl -X DELETE http://localhost:5000/api/warranties/cleanup
```

### 🗄️ **Scenario 5: Database Verification**

1. **Check Warranty Records**
   - Open your SQLite database
   - Query: `SELECT * FROM warranties;`
   - Verify warranty data is saved correctly

2. **Check Status Updates**
   - After customer accepts/declines
   - Query: `SELECT warranty_id, status, updated_at FROM warranties;`
   - Verify status changes are recorded

### 🧹 **Scenario 6: Background Cleanup Testing**

1. **Create Declined Warranty**
   - Complete an order with warranty
   - Have customer decline it
   - Wait (or manually set the timestamp to 25+ hours ago)

2. **Run Cleanup Script**
   ```powershell
   python app\cleanup_warranties.py
   ```

3. **Verify Cleanup**
   - Check database for deleted warranties
   - Check cleanup logs

## 🔍 **Error Testing Scenarios**

### Test Invalid URLs
- `http://localhost:5000/warranty-selection?request_id=999` (non-existent request)
- `http://localhost:5000/warranty-selection?warranty_id=999` (missing request_id)
- `http://localhost:5000/warranty-selection` (no parameters)

### Test Invalid API Calls
- PUT warranty status with invalid status
- GET warranty for non-existent request
- Complete order without proper data

## 📊 **Success Criteria**

✅ **Admin can successfully complete orders with optional warranty**
✅ **Customer receives professional warranty email**  
✅ **Customer can accept/decline warranty via email links**
✅ **Warranty selection page loads dynamically**
✅ **Database records warranty status changes**
✅ **Background cleanup removes old declined warranties**
✅ **All API endpoints respond correctly**
✅ **Error handling works for invalid requests**

## 🐛 **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| Email not sending | Check Gmail API credentials in config.py |
| Warranty page blank | Check browser console for JavaScript errors |
| API 500 errors | Check Flask console for Python errors |
| Database errors | Verify warranties table exists and has correct schema |
| Links not working | Check URL parameter format and case sensitivity |

## 📝 **Testing Checklist**

- [ ] Admin can complete orders with warranty
- [ ] Warranty email is sent to customer
- [ ] Customer can access warranty page via email link
- [ ] Accept functionality works correctly
- [ ] Decline functionality works correctly
- [ ] Database stores warranty data correctly
- [ ] API endpoints respond properly
- [ ] Cleanup script removes old warranties
- [ ] Error handling works for edge cases
- [ ] Email contains correct warranty details and links