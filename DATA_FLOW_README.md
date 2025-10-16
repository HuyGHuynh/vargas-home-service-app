# Employee Availability Data Flow

## Overview
This document explains how employee availability data flows from the employee submission page to the admin timesheet.

## Data Flow Architecture

```
Employee Availability Page (employeeAvailability.html)
           ↓
    [Employee Submits Form]
           ↓
   JavaScript (employeeAvailability.js)
           ↓
    saveAvailabilityToStorage()
           ↓
   localStorage (Browser Storage)
   Key: 'employeeAvailability'
           ↓
Admin Timesheet Page (adminTimesheet.html)
           ↓
   JavaScript (adminTimesheet.js)
           ↓
   loadAvailabilityData()
           ↓
   [Displayed on Calendar]
```

## Data Structure

### Employee Submission
When an employee submits availability, the following data is saved:

```javascript
{
  employeeId: 1,
  employeeName: "Michael Thompson",
  employeeRole: "Senior Technician",
  selectedDates: ["2025-10-20", "2025-10-21"],
  startDate: "2025-10-20",
  endDate: "2025-10-21",
  startTime: "09:00",
  endTime: "17:00",
  notes: "Optional notes",
  status: "available",
  submittedDate: "2025-10-16T..."
}
```

### localStorage Storage
Data is stored as an array of individual date records:

```javascript
[
  {
    id: 1634567890.123,
    employeeId: 1,
    employeeName: "Michael Thompson",
    employeeRole: "Senior Technician",
    date: "2025-10-20",
    startTime: "09:00",
    endTime: "17:00",
    notes: "",
    status: "available",
    submittedDate: "2025-10-16T10:30:00.000Z"
  },
  {
    id: 1634567890.456,
    employeeId: 1,
    employeeName: "Michael Thompson",
    employeeRole: "Senior Technician",
    date: "2025-10-21",
    startTime: "09:00",
    endTime: "17:00",
    notes: "",
    status: "available",
    submittedDate: "2025-10-16T10:30:00.000Z"
  }
]
```

### Admin Timesheet Display
On the admin timesheet, data is transformed to:

```javascript
{
  id: 1,
  technicianId: 1,
  technicianName: "Michael Thompson",
  date: "2025-10-20",
  startTime: "09:00",
  endTime: "17:00",
  status: "available",
  notes: ""
}
```

## Key Functions

### Employee Side (employeeAvailability.js)

#### `saveAvailabilityToStorage(availabilityData)`
- Saves employee availability to localStorage
- Creates individual records for each selected date
- Updates existing records if employee already submitted for that date
- Prevents duplicate entries

### Admin Side (adminTimesheet.js)

#### `loadAvailabilityData()`
- Called on page load (DOMContentLoaded)
- Loads sample data first
- Retrieves employee submissions from localStorage
- Merges employee data with sample data
- Employee submissions override sample data for the same date/employee

## Usage

### For Employees:
1. Navigate to "Submit Availability" page
2. Select dates on the calendar
3. Set time range (e.g., 09:00 - 17:00)
4. Add optional notes
5. Click "Submit Availability"
6. Data is saved to localStorage
7. Redirect to dashboard

### For Admins:
1. Navigate to "Timesheet" page
2. Page automatically loads data from localStorage
3. Employee-submitted availability appears on calendar
4. Green events = available hours
5. Blue events = assigned jobs
6. Red events = unavailable

## Color Coding

- 🟢 **Green (available)**: Employee is available to work
- 🔵 **Blue (assigned)**: Employee is assigned to a job
- 🔴 **Red (unavailable)**: Employee is unavailable/time-off

## Testing

### Test the Data Flow:

1. **Submit Availability (as Employee)**
   - Open: `employeeAvailability.html`
   - Select future dates
   - Set time: 09:00 - 17:00
   - Click Submit
   - Check browser console: "Saved to localStorage: [...]"

2. **View Availability (as Admin)**
   - Open: `adminTimesheet.html`
   - Check browser console: "Employee availability from localStorage: [...]"
   - Check calendar: Green events should appear for submitted dates

3. **Check localStorage**
   - Open browser DevTools (F12)
   - Go to Application/Storage → Local Storage
   - Find key: `employeeAvailability`
   - Verify JSON data

### Clear Data (for testing)
```javascript
// In browser console:
localStorage.removeItem('employeeAvailability');
```

## Future Backend Integration

When integrating with a real backend:

### Employee Submission
```javascript
fetch('/api/employee-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

### Admin Retrieval
```javascript
fetch('/api/employee-availability?period=2025-10-20')
  .then(response => response.json())
  .then(data => displayOnCalendar(data))
```

## Notes

- Data persists in browser localStorage until cleared
- Each employee can update their own availability
- Later submissions override earlier ones for the same date
- No approval workflow - submissions go directly to timesheet
- Real-time updates require page refresh (or implement polling/websockets)

## Troubleshooting

### Data not appearing on timesheet?
1. Check browser console for errors
2. Verify localStorage has data: `localStorage.getItem('employeeAvailability')`
3. Ensure employee ID matches between pages
4. Check date range matches current period on timesheet

### Old data persisting?
- Clear localStorage: `localStorage.clear()`
- Or remove specific key: `localStorage.removeItem('employeeAvailability')`
