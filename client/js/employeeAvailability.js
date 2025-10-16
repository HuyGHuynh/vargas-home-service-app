// Current Employee Data
const currentEmployee = {
  id: 1,
  firstName: 'Michael',
  lastName: 'Thompson',
  role: 'Senior Technician',
  email: 'm.thompson@vargas.com'
};

// Biweekly calendar state
let availabilityPeriodStart = new Date();
availabilityPeriodStart.setDate(availabilityPeriodStart.getDate() - availabilityPeriodStart.getDay()); // Start from Sunday
availabilityPeriodStart.setHours(0, 0, 0, 0);

let selectedDates = [];

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  // Update employee name in header
  document.getElementById('employeeName').textContent = `${currentEmployee.firstName} ${currentEmployee.lastName}`;
  document.getElementById('employeeRole').textContent = currentEmployee.role;
  
  // Initialize calendar
  renderAvailabilityCalendar();
  updatePeriodDisplay();
  
  // Setup form submission
  setupFormSubmission();
});

// Change period (previous/next)
function changeAvailabilityPeriod(direction) {
  availabilityPeriodStart.setDate(availabilityPeriodStart.getDate() + (direction * 14));
  renderAvailabilityCalendar();
  updatePeriodDisplay();
}

// Update period display
function updatePeriodDisplay() {
  const periodEnd = new Date(availabilityPeriodStart);
  periodEnd.setDate(periodEnd.getDate() + 13);
  
  const startStr = availabilityPeriodStart.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
  const endStr = periodEnd.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  const displayText = `${startStr} - ${endStr}`;
  document.getElementById('availabilityPeriodDisplay').textContent = displayText;
  
  const display2 = document.getElementById('availabilityPeriodDisplay2');
  if (display2) {
    display2.textContent = displayText;
  }
}

// Render biweekly calendar
function renderAvailabilityCalendar() {
  const calendar1 = document.getElementById('availabilityCalendar');
  
  const calendarHTML = generateCalendarHTML();
  
  if (calendar1) calendar1.innerHTML = calendarHTML;
  
  updateSelectedDatesSummary();
}

// Generate calendar HTML
function generateCalendarHTML() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let html = '';
  
  // Generate 14 days
  for (let i = 0; i < 14; i++) {
    const currentDate = new Date(availabilityPeriodStart);
    currentDate.setDate(currentDate.getDate() + i);
    
    const dateStr = currentDate.toISOString().split('T')[0];
    const isPast = currentDate < today;
    const isToday = currentDate.getTime() === today.getTime();
    const isSelected = selectedDates.includes(dateStr);
    
    let classNames = ['calendar-day'];
    if (isPast) classNames.push('disabled');
    if (isToday) classNames.push('today');
    if (isSelected) classNames.push('selected');
    
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = currentDate.getDate();
    
    html += `
      <div class="${classNames.join(' ')}" 
           data-date="${dateStr}" 
           onclick="${isPast ? '' : 'toggleDateSelection(\'' + dateStr + '\')'}">
        <div class="day-name">${dayName}</div>
        <div class="day-number">${dayNumber}</div>
      </div>
    `;
  }
  
  return html;
}

// Toggle date selection
function toggleDateSelection(dateStr) {
  const index = selectedDates.indexOf(dateStr);
  
  if (index > -1) {
    selectedDates.splice(index, 1);
  } else {
    selectedDates.push(dateStr);
  }
  
  // Sort dates
  selectedDates.sort();
  
  renderAvailabilityCalendar();
}

// Update selected dates summary
function updateSelectedDatesSummary() {
  const count1 = document.getElementById('selectedDatesCount');
  
  let summaryText = 'None';
  
  if (selectedDates.length > 0) {
    if (selectedDates.length === 1) {
      summaryText = new Date(selectedDates[0] + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } else {
      summaryText = `${selectedDates.length} dates selected`;
    }
  }
  
  if (count1) count1.textContent = summaryText;
}

// Setup form submission
function setupFormSubmission() {
  const availabilityForm = document.getElementById('availabilityForm');
  
  if (availabilityForm) {
    availabilityForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate that dates are selected
      if (selectedDates.length === 0) {
        alert('Please select at least one date on the calendar.');
        return;
      }
      
      // Get availability details
      const availableStartTime = document.getElementById('availableStartTime').value;
      const availableEndTime = document.getElementById('availableEndTime').value;
      const notes = document.getElementById('availableNotes').value;
      
      if (!availableStartTime || !availableEndTime) {
        alert('Please specify your available time range.');
        return;
      }
      
      if (availableStartTime >= availableEndTime) {
        alert('End time must be after start time.');
        return;
      }
      
      // Build availability data
      const formData = {
        employeeId: currentEmployee.id,
        employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
        employeeRole: currentEmployee.role,
        selectedDates: selectedDates,
        startDate: selectedDates[0],
        endDate: selectedDates[selectedDates.length - 1],
        startTime: availableStartTime,
        endTime: availableEndTime,
        notes: notes || '',
        status: 'available',
        submittedDate: new Date().toISOString()
      };
      
      console.log('Availability Submitted:', formData);
      
      // Save availability data to localStorage
      saveAvailabilityToStorage(formData);
      
      // TODO: Send to backend API in production
      // fetch('/api/employee-availability', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(formData)
      // })
      // .then(response => response.json())
      // .then(data => {
      //     alert('Success! Your availability has been submitted and will appear on the admin timesheet.');
      //     window.location.href = 'employeeView.html';
      // })
      // .catch(error => {
      //     alert('Failed to submit availability. Please try again.');
      // });
      
      // Success notification
      alert(`Success! Your availability has been submitted.\n\n${selectedDates.length} date(s) selected\nTime: ${availableStartTime} - ${availableEndTime}\n\nYour availability will now appear on the admin timesheet.`);
      
      // Redirect to dashboard
      window.location.href = 'employeeView.html';
    });
  }
}

// Save availability to localStorage for admin timesheet
function saveAvailabilityToStorage(availabilityData) {
  // Get existing availability records from localStorage
  let availabilityRecords = JSON.parse(localStorage.getItem('employeeAvailability')) || [];
  
  // Create individual records for each selected date
  availabilityData.selectedDates.forEach(date => {
    // Check if this employee already has availability for this date
    const existingIndex = availabilityRecords.findIndex(
      record => record.employeeId === availabilityData.employeeId && record.date === date
    );
    
    const record = {
      id: existingIndex >= 0 ? availabilityRecords[existingIndex].id : Date.now() + Math.random(),
      employeeId: availabilityData.employeeId,
      employeeName: availabilityData.employeeName,
      employeeRole: availabilityData.employeeRole,
      date: date,
      startTime: availabilityData.startTime,
      endTime: availabilityData.endTime,
      notes: availabilityData.notes,
      status: 'available',
      submittedDate: availabilityData.submittedDate
    };
    
    if (existingIndex >= 0) {
      // Update existing record
      availabilityRecords[existingIndex] = record;
    } else {
      // Add new record
      availabilityRecords.push(record);
    }
  });
  
  // Save back to localStorage
  localStorage.setItem('employeeAvailability', JSON.stringify(availabilityRecords));
  
  console.log('Saved to localStorage:', availabilityRecords);
}
