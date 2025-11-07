# Warranty System Implementation

## Overview

This document describes the comprehensive warranty system implementation for the Vargas Home Service application. The system allows administrators to optionally attach warranties when completing service orders, then automatically sends customers emails with links to accept or decline the warranty offer.

## System Architecture

### Database Schema

The `warranties` table has been designed with the following structure:

```sql
CREATE TABLE warranties (
    warranty_id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(request_id),
    CHECK (status IN ('Pending', 'Active', 'Declined', 'Inactive')),
    CHECK (price >= 0),
    CHECK (end_date > start_date)
);
```

### Warranty Status Flow

1. **Pending**: Warranty created by admin, waiting for customer decision
2. **Active**: Customer accepted the warranty
3. **Declined**: Customer declined the warranty
4. **Inactive**: System-set status for declined warranties older than 24 hours (ready for cleanup)

## Implementation Components

### 1. Backend API Endpoints

#### Complete Service Request with Warranty
- **Endpoint**: `PUT /api/service-requests/<request_id>/complete`
- **Purpose**: Mark order as complete and optionally create warranty
- **Enhanced**: Now accepts warranty details and sends customer email

#### Get Warranty by Request ID
- **Endpoint**: `GET /api/warranties/<request_id>`
- **Purpose**: Fetch warranty details for customer display
- **Returns**: Complete warranty information including service and customer details

#### Update Warranty Status
- **Endpoint**: `PUT /api/warranties/<warranty_id>/status`
- **Purpose**: Handle customer accept/decline decisions
- **Body**: `{"status": "Active|Declined"}`

#### Cleanup Inactive Warranties
- **Endpoint**: `DELETE /api/warranties/cleanup`
- **Purpose**: Remove declined warranties older than 24 hours
- **Returns**: Count of deleted warranties

### 2. Email Service Enhancement

The `EmailService` class has been enhanced with warranty-specific functionality:

#### New Methods:
- `send_warranty_selection_email(customer_email, customer_name, warranty_data)`
- `_generate_warranty_html_content(customer_name, warranty_data)`
- `_generate_warranty_text_content(customer_name, warranty_data)`

#### Email Features:
- Professional HTML and plain text templates
- Direct action links for accept/decline
- Warranty details and pricing information
- Contact information for support

### 3. Frontend Updates

#### warrantySelection.html Enhancements:
- Dynamic loading of warranty data from URL parameters
- API integration for accept/decline actions
- Real-time status updates and confirmations
- Error handling and user feedback
- Professional confirmation screens

#### URL Parameter Handling:
- `request_id`: Service request identifier
- `warranty_id`: Warranty identifier
- `action`: Optional direct action (accept/decline)

### 4. Background Cleanup System

#### app/cleanup_warranties.py Script:
- Located in the app folder for proper organization
- Standalone Python script for warranty maintenance
- Designed to run via cron job or scheduled task
- Comprehensive logging with automatic log directory creation
- Configurable API endpoint URL via environment variable
- Enhanced error handling and timeout management

#### Recommended Schedule:
```bash
# Run every hour to check for expired declined warranties
0 * * * * /usr/bin/python3 /path/to/app/cleanup_warranties.py
```

#### Windows Task Scheduler:
```powershell
# Run from project root directory
cd "C:\path\to\vargas-home-service-app"
python app\cleanup_warranties.py
```

## Usage Workflow

### Admin Workflow:
1. Admin completes a service order in the system
2. Admin optionally fills out warranty details (description, start/end dates, price)
3. System creates warranty record with "Pending" status
4. System sends email to customer with warranty offer

### Customer Workflow:
1. Customer receives email with warranty offer details
2. Customer clicks "Accept" or "Decline" link
3. Customer is redirected to warrantySelection.html page
4. Page loads warranty details and processes customer decision
5. Customer sees confirmation screen with next steps

### System Workflow:
1. Customer decisions update warranty status in database
2. Declined warranties are marked for cleanup after 24 hours
3. Background script removes old declined warranties
4. Active warranties remain in system for claims processing

## Testing the System

### 1. Test Warranty Creation:
```bash
# Complete an order with warranty
curl -X PUT http://localhost:5000/api/service-requests/123/complete \
  -H "Content-Type: application/json" \
  -d '{
    "warranty": {
      "description": "90-day comprehensive HVAC warranty",
      "start_date": "2024-11-15",
      "end_date": "2025-02-13",
      "price": 199.99
    }
  }'
```

### 2. Test Customer Decision:
```bash
# Accept warranty
curl -X PUT http://localhost:5000/api/warranties/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Active"}'

# Decline warranty
curl -X PUT http://localhost:5000/api/warranties/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Declined"}'
```

### 3. Test Cleanup:
```bash
# Run cleanup manually from project root
python app/cleanup_warranties.py

# Or via API directly
curl -X DELETE http://localhost:5000/api/warranties/cleanup
```

## Configuration

### Email Configuration:
Ensure Gmail API credentials are properly configured in `config.py`:
```python
GMAIL_CREDENTIALS_FILE = 'path/to/credentials.json'
GMAIL_TOKEN_FILE = 'path/to/token.json'
```

### Base URL Configuration:
Update the base URL in email templates as needed:
```python
base_url = "http://your-domain.com"  # Update for production
```

### Cleanup Script Configuration:
Update the API URL in `cleanup_warranties.py`:
```python
response = requests.delete('http://your-domain.com/api/warranties/cleanup')
```

## Security Considerations

1. **URL Parameter Validation**: All warranty URLs include specific IDs that are validated against the database
2. **Status Validation**: Only valid status transitions are allowed (Pending → Active/Declined)
3. **Time-based Cleanup**: Prevents database bloat from declined warranties
4. **Email Authentication**: Uses Gmail API with proper OAuth2 authentication

## Monitoring and Maintenance

### Log Files:
- `warranty_cleanup.log`: Background cleanup task logs
- Application logs: Warranty-related API operations

### Database Monitoring:
- Monitor warranty table growth
- Track warranty acceptance rates
- Monitor cleanup task effectiveness

### Email Delivery:
- Monitor Gmail API quotas and limits
- Track email delivery success rates
- Handle bounce-backs and delivery failures

## Future Enhancements

1. **Warranty Claims System**: Add ability to file and track warranty claims
2. **Automated Reminders**: Send follow-up emails for pending warranties
3. **Warranty Templates**: Pre-defined warranty templates for common services
4. **Analytics Dashboard**: Track warranty metrics and customer behavior
5. **Mobile Optimization**: Ensure warranty selection page works well on mobile devices

## Troubleshooting

### Common Issues:

1. **Email Not Sending**: Check Gmail API credentials and permissions
2. **Warranty Links Not Working**: Verify URL parameter format and database IDs
3. **Cleanup Not Running**: Check cron job configuration and script permissions
4. **Database Errors**: Verify foreign key constraints and status values

### Debug Mode:
Enable Flask debug mode to see detailed error messages during development.

### Logging:
All warranty operations are logged for troubleshooting and audit purposes.