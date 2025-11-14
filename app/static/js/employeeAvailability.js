// Current Employee Data - will be loaded from session/localStorage
let currentEmployee = null;

// Biweekly calendar state
let availabilityPeriodStart = new Date();
availabilityPeriodStart.setDate(availabilityPeriodStart.getDate() - availabilityPeriodStart.getDay()); // Start from Sunday
availabilityPeriodStart.setHours(0, 0, 0, 0);

let selectedDate = null; // Changed to single date selection

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  // Load current employee data from localStorage
  loadCurrentEmployee();

  // Update employee name in header if data is available
  if (currentEmployee) {
    document.getElementById('employeeName').textContent = currentEmployee.name;
    document.getElementById('employeeRole').textContent = currentEmployee.isadmin ? 'Administrator' : 'Employee';
  }

  // Initialize calendar
  renderAvailabilityCalendar();
  updatePeriodDisplay();

  // Setup form submission
  setupFormSubmission();
});

// Load current employee data from localStorage
function loadCurrentEmployee() {
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    try {
      currentEmployee = JSON.parse(userData);
    } catch (e) {
      console.error('Error parsing user data:', e);
      // Redirect to login if user data is invalid
      window.location.href = '/login';
    }
  } else {
    // No user data found, redirect to login
    window.location.href = '/login';
  }
}

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
    const isSelected = selectedDate === dateStr; // Changed to single date

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

// Toggle date selection - changed to single date selection
function toggleDateSelection(dateStr) {
  if (selectedDate === dateStr) {
    // Deselect if clicking the same date
    selectedDate = null;
  } else {
    // Select the new date
    selectedDate = dateStr;
  }

  renderAvailabilityCalendar();
}

// Update selected date summary
function updateSelectedDatesSummary() {
  const count1 = document.getElementById('selectedDatesCount');

  let summaryText = 'None';

  if (selectedDate) {
    summaryText = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  if (count1) count1.textContent = summaryText;
}

// Setup form submission
function setupFormSubmission() {
  const availabilityForm = document.getElementById('availabilityForm');

  if (availabilityForm) {
    availabilityForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validate that a date is selected
      if (!selectedDate) {
        alert('Please select a date on the calendar.');
        return;
      }

      // Get availability details
      const availableStartTime = document.getElementById('availableStartTime').value;
      const availableEndTime = document.getElementById('availableEndTime').value;

      if (!availableStartTime || !availableEndTime) {
        alert('Please specify your available time range.');
        return;
      }

      if (availableStartTime >= availableEndTime) {
        alert('End time must be after start time.');
        return;
      }

      // Prepare submission data
      const submissionData = {
        date: selectedDate,
        startTime: availableStartTime,
        endTime: availableEndTime
      };

      try {
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        // Send to backend API
        const response = await fetch('/api/employee/availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionData)
        });

        const result = await response.json();

        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        if (result.success) {
          // Success notification
          alert(`Success! Your availability has been submitted.\n\nDate: ${selectedDate}\nTime: ${availableStartTime} - ${availableEndTime}\n\nYour availability will now appear on the admin timesheet.`);

          // Redirect to dashboard
          if (currentEmployee && currentEmployee.employeeid) {
            window.location.href = `/employee/${currentEmployee.employeeid}/view`;
          } else {
            window.location.href = '/employee/view';
          }
        } else {
          alert(`Failed to submit availability: ${result.message}`);
        }

      } catch (error) {
        console.error('Error submitting availability:', error);
        alert('Failed to submit availability. Please check your connection and try again.');

        // Reset button
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = 'Submit Availability';
        submitBtn.disabled = false;
      }
    });
  }
}


