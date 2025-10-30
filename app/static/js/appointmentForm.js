// Calendar generation
const monthYear = document.getElementById('monthYear');
const calendarBody = document.getElementById('calendarBody');
let currentDate = new Date();

async function generateCalendar(date) {
  calendarBody.innerHTML = '';
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();

  // Get today's date (without time) for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  monthYear.textContent = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  // Show loading state
  let loadingRow = document.createElement('tr');
  let loadingCell = document.createElement('td');
  loadingCell.colSpan = 7;
  loadingCell.style.textAlign = 'center';
  loadingCell.style.padding = '20px';
  loadingCell.style.color = '#6c757d';
  loadingCell.textContent = 'Loading available dates...';
  loadingRow.appendChild(loadingCell);
  calendarBody.appendChild(loadingRow);

  try {
    // Fetch availability for the entire month
    const datesWithAvailability = await fetchAvailabilityForMonth(year, month);

    // Clear loading state
    calendarBody.innerHTML = '';

    let row = document.createElement('tr');
    for (let i = 0; i < startDay; i++) {
      row.appendChild(document.createElement('td'));
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const cell = document.createElement('td');
      cell.textContent = d;

      // Create date object for this day
      const cellDate = new Date(year, month, d);
      cellDate.setHours(0, 0, 0, 0);
      const dateStr = cellDate.toISOString().split('T')[0];

      // Check if date is in the past
      const isPast = cellDate < today;
      const hasAvailability = datesWithAvailability.includes(dateStr);

      if (isPast) {
        // Past dates - grayed out
        cell.classList.add('past-date');
        cell.style.cursor = 'not-allowed';
        cell.style.opacity = '0.4';
        cell.style.textDecoration = 'line-through';
      } else if (!hasAvailability) {
        // Future dates with no availability - muted but visible
        cell.classList.add('no-availability');
        cell.style.cursor = 'not-allowed';
        cell.style.opacity = '0.6';
        cell.style.color = '#adb5bd';
        cell.title = 'No employees available on this date';
      } else {
        // Future dates with availability - clickable
        cell.classList.add('available-date');
        cell.style.cursor = 'pointer';
        cell.style.fontWeight = 'bold';
        cell.style.color = '#007bff';
        cell.title = 'Click to see available times';
        cell.onclick = () => selectDate(new Date(year, month, d), cell);
      }

      row.appendChild(cell);
      if ((startDay + d) % 7 === 0) {
        calendarBody.appendChild(row);
        row = document.createElement('tr');
      }
    }
    calendarBody.appendChild(row);

  } catch (error) {
    console.error('Error loading calendar availability:', error);
    // Clear loading state and show error
    calendarBody.innerHTML = '';
    let errorRow = document.createElement('tr');
    let errorCell = document.createElement('td');
    errorCell.colSpan = 7;
    errorCell.style.textAlign = 'center';
    errorCell.style.padding = '20px';
    errorCell.style.color = '#dc3545';
    errorCell.textContent = 'Error loading available dates. Please refresh the page.';
    errorRow.appendChild(errorCell);
    calendarBody.appendChild(errorRow);
  }
}

document.getElementById('prevMonth').onclick = async () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  await generateCalendar(currentDate);
};

document.getElementById('nextMonth').onclick = async () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  await generateCalendar(currentDate);
};

let selectedDate = null;
let selectedTime = null;
let selectedTime24 = null; // Store time in 24-hour format for backend
const confirmText = document.getElementById('confirmText');

function selectDate(date, cell) {
  document.querySelectorAll('.calendar td').forEach(td => td.classList.remove('selected'));
  cell.classList.add('selected');
  selectedDate = date.toDateString();

  // Reset selected time when changing dates
  selectedTime = null;
  selectedTime24 = null;

  // Regenerate time slots based on employee availability for this date
  generateTimeSlots(date);

  updateConfirm();
} function updateConfirm() {
  if (selectedDate && selectedTime) {
    confirmText.textContent = `Selected: ${selectedDate} at ${selectedTime}`;
  } else if (selectedDate) {
    confirmText.textContent = `Selected date: ${selectedDate}`;
  } else if (selectedTime) {
    confirmText.textContent = `Selected time: ${selectedTime}`;
  } else {
    confirmText.textContent = "No date/time selected yet";
  }
}

// Time slots generation - Grouped grid layout
const morningSlots = document.getElementById("morningSlots");
const afternoonSlots = document.getElementById("afternoonSlots");
const startHour = 9;
const endHour = 18; // 6:00 PM
const slotIncrement = 30; // minutes

function formatTime(hour, minute) {
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

async function generateTimeSlots(selectedDate) {
  // Clear existing slots
  morningSlots.innerHTML = '';
  afternoonSlots.innerHTML = '';

  // Show loading message
  morningSlots.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #6c757d;">Loading available times...</div>';

  // Get current time for comparison
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if selected date is today
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);
  const isToday = selected.getTime() === today.getTime();

  try {
    // Format date for API call
    const dateStr = selected.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Fetch actual employee availability for this date
    const response = await fetch(`/api/availability/date/${dateStr}`);
    const result = await response.json();

    // Clear loading message
    morningSlots.innerHTML = '';
    afternoonSlots.innerHTML = '';

    if (result.success && result.time_slots && result.time_slots.length > 0) {
      // Group and generate time slots based on actual employee availability
      const processedSlots = new Set(); // Avoid duplicate time slots

      result.time_slots.forEach(slot => {
        // Parse start time
        const startTime = slot.starttime;
        const endTime = slot.endtime;

        // Generate 30-minute slots within each employee's availability window
        generateSlotsInRange(startTime, endTime, slot.employee_name, isToday, now, processedSlots);
      });

      // If no slots were generated, show message
      if (morningSlots.children.length === 0 && afternoonSlots.children.length === 0) {
        morningSlots.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #dc3545; padding: 10px;">No available times for this date</div>';
      }

      // Hide empty sections to reduce spacing
      const morningGroup = morningSlots.parentElement;
      const afternoonGroup = afternoonSlots.parentElement;

      morningGroup.style.display = morningSlots.children.length > 0 ? 'block' : 'none';
      afternoonGroup.style.display = afternoonSlots.children.length > 0 ? 'block' : 'none';

    } else {
      // No availability found
      morningSlots.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #dc3545;">No employees available for this date</div>';
    }

  } catch (error) {
    console.error('Error fetching availability:', error);
    morningSlots.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #dc3545;">Error loading available times</div>';
  }
}

function generateSlotsInRange(startTime, endTime, employeeName, isToday, now, processedSlots) {
  // Parse times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Convert to minutes for easier calculation
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // Generate 30-minute slots
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    // Create time string for this slot
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Skip if we already processed this time slot
    if (processedSlots.has(timeStr)) {
      continue;
    }
    processedSlots.add(timeStr);

    // Check if this time slot has passed (only for today)
    let isPastTime = false;
    if (isToday) {
      const slotTime = new Date();
      slotTime.setHours(hour, minute, 0, 0);
      isPastTime = slotTime < now;
    }

    const timeLabel = formatTime(hour, minute);
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("time-slot");
    button.textContent = timeLabel;
    button.title = `Available with ${employeeName}`;

    // Store the time in 24-hour format for backend
    button.dataset.time24 = timeStr;

    // Disable past time slots for today
    if (isPastTime) {
      button.classList.add("past-time");
      button.disabled = true;
      button.style.cursor = "not-allowed";
      button.style.opacity = "0.4";
      button.style.textDecoration = "line-through";
    } else {
      button.onclick = () => {
        document.querySelectorAll(".time-slot").forEach(s => s.classList.remove("selected"));
        button.classList.add("selected");
        selectedTime = timeLabel;
        // Store the 24-hour format for backend submission
        selectedTime24 = timeStr;
        updateConfirm();
      };
    }

    // Determine if morning or afternoon
    if (hour < 12) {
      morningSlots.appendChild(button);
    } else {
      afternoonSlots.appendChild(button);
    }
  }
}

// Function to fetch availability for entire month - optimized batch request
async function fetchAvailabilityForMonth(year, month) {
  try {
    // JavaScript months are 0-based, but our API expects 1-based
    const apiMonth = month + 1;

    const response = await fetch(`/api/availability/month/${year}/${apiMonth}`);
    const result = await response.json();

    if (result.success) {
      return result.available_dates || [];
    } else {
      console.error('Error fetching month availability:', result.message);
      return [];
    }

  } catch (error) {
    console.error('Error fetching month availability:', error);
    return [];
  }
}

// Initial state - show message when no date selected
morningSlots.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #6c757d; padding: 20px;">Please select a date from the calendar above</div>';
afternoonSlots.innerHTML = '';

// Hide afternoon section initially
const afternoonGroup = afternoonSlots.parentElement;
afternoonGroup.style.display = 'none';

// Initial generation
generateCalendar(currentDate);

// Preload all service data for instant dropdown population
let serviceTypes = [];
let allServices = [];
let servicesByType = {}; // Cached services organized by type

// Preload all data once when page loads
async function preloadAllData() {
  try {
    const serviceSelect = document.getElementById('service');
    const jobSelect = document.getElementById('job');

    // Show loading state
    serviceSelect.disabled = true;
    jobSelect.disabled = true;
    serviceSelect.innerHTML = '<option value="">Loading...</option>';

    // Fetch both service types and all services in parallel - ONLY ONCE!
    const [typesResponse, servicesResponse] = await Promise.all([
      fetch('/api/service-types'),
      fetch('/api/services')
    ]);

    const typesResult = await typesResponse.json();
    const servicesResult = await servicesResponse.json();

    if (typesResult.success && servicesResult.success) {
      serviceTypes = typesResult.data;
      allServices = servicesResult.data;

      // Organize services by type in memory for INSTANT lookup
      servicesByType = {};
      allServices.forEach(service => {
        const typeName = service.category;
        if (!servicesByType[typeName]) {
          servicesByType[typeName] = [];
        }
        servicesByType[typeName].push(service);
      });

      // Populate service type dropdown
      serviceSelect.innerHTML = '<option value="">--Select Service Type--</option>';
      serviceTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.service_type_name;
        option.textContent = type.service_type_name;
        serviceSelect.appendChild(option);
      });

      serviceSelect.disabled = false;
    } else {
      throw new Error('Failed to load service data');
    }
  } catch (error) {
    console.error('Error preloading data:', error);
    const serviceSelect = document.getElementById('service');
    serviceSelect.innerHTML = '<option value="">Error loading services</option>';
  }
}

// INSTANT job loading from cached data - NO API CALL!
document.getElementById('service').addEventListener('change', function () {
  const serviceTypeName = this.value;
  const jobSelect = document.getElementById('job');
  const serviceIdInput = document.getElementById('serviceId');

  // Reset job dropdown
  jobSelect.innerHTML = '<option value="">--Select Job Type--</option>';
  jobSelect.disabled = true;
  serviceIdInput.value = '';

  if (!serviceTypeName) {
    return;
  }

  // Get services from CACHED DATA - INSTANT, no network delay!
  const services = servicesByType[serviceTypeName] || [];

  if (services.length > 0) {
    services.forEach(service => {
      const option = document.createElement('option');
      option.value = service.service_id;
      option.textContent = service.job_name;
      jobSelect.appendChild(option);
    });
    jobSelect.disabled = false;
  } else {
    jobSelect.innerHTML = '<option value="">No jobs available for this service type</option>';
  }
});

// Update serviceId when job is selected and fetch cost
document.getElementById('job').addEventListener('change', function () {
  const serviceIdInput = document.getElementById('serviceId');
  const serviceId = this.value;
  serviceIdInput.value = serviceId;

  // Fetch and display cost estimate
  if (serviceId) {
    fetchAndDisplayCost(serviceId);
  } else {
    hideCostEstimate();
  }
});

// Preload all data when page loads
preloadAllData();

// Cost estimation functions
async function fetchAndDisplayCost(serviceId) {
  try {
    const costEstimate = document.getElementById('costEstimate');
    const costBreakdown = document.getElementById('costBreakdown');
    const totalCost = document.getElementById('totalCost');

    // Show loading state
    costEstimate.style.display = 'block';
    costBreakdown.innerHTML = '<div style="color: #6c757d;">Calculating cost...</div>';
    totalCost.innerHTML = '';

    // Fetch cost data from API
    const response = await fetch(`/api/services/${serviceId}/cost`);
    const result = await response.json();

    if (result.success && result.data) {
      const cost = result.data;

      // Display cost breakdown
      costBreakdown.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span><strong>Service:</strong> ${cost.job_name}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Duration:</span>
          <span>${cost.duration_hours} hour${cost.duration_hours !== 1 ? 's' : ''}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Rate:</span>
          <span>$${cost.service_price.toFixed(2)} per hour</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Calculation:</span>
          <span>${cost.duration_hours} × $${cost.service_price.toFixed(2)}</span>
        </div>
      `;

      // Display total cost
      totalCost.innerHTML = `
        <div style="border-top: 1px solid #dee2e6; padding-top: 10px;">
          Estimated Total: <span style="color: #28a745; font-size: 1.1em;">$${cost.estimated_cost.toFixed(2)}</span>
        </div>
      `;

    } else {
      // Error fetching cost
      costBreakdown.innerHTML = '<div style="color: #dc3545;">Unable to calculate cost for this service.</div>';
      totalCost.innerHTML = '';
    }

  } catch (error) {
    console.error('Error fetching cost:', error);
    const costBreakdown = document.getElementById('costBreakdown');
    costBreakdown.innerHTML = '<div style="color: #dc3545;">Error calculating cost. Please try again.</div>';
  }
}

function hideCostEstimate() {
  const costEstimate = document.getElementById('costEstimate');
  costEstimate.style.display = 'none';
}

// Form submission
document.getElementById("appointmentForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (!selectedDate || !selectedTime) {
    alert("Please select both a date and time before submitting.");
    return;
  }

  // Set the current date as request date
  const today = new Date();
  const requestDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  document.getElementById('requestDate').value = requestDate;

  // Convert selected date to YYYY-MM-DD format
  const selectedDateObj = new Date(selectedDate);
  const scheduledDate = selectedDateObj.toISOString().split('T')[0];
  document.getElementById('scheduledDate').value = scheduledDate;

  // Collect form data
  const formData = new FormData(this);

  // Get service type and job selections
  const serviceType = formData.get('service');
  const serviceId = formData.get('serviceId');
  const jobSelect = document.getElementById('job');
  const selectedJobText = jobSelect.options[jobSelect.selectedIndex].text;

  // Validate that a service was selected
  if (!serviceId) {
    alert("Please select both a service type and job type.");
    return;
  }

  const appointmentData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    zipCode: formData.get('zipCode'),
    serviceId: parseInt(serviceId),
    requestDate: formData.get('requestDate'),
    scheduledDate: formData.get('scheduledDate'),
    scheduledTime: selectedTime,
    scheduledTime24: selectedTime24, // Include 24-hour format for employee assignment
    description: formData.get('description'),
    isCompleted: formData.get('isCompleted') === 'true',
    autoAssignEmployee: true // Flag to enable auto-assignment
  };

  // Submit to backend
  fetch('/workorders/expanded', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        // Prepare confirmation data with original form values and technician info
        const confirmationData = {
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          address: formData.get('address'),
          city: formData.get('city'),
          state: formData.get('state'),
          zipCode: formData.get('zipCode'),
          service_type: serviceType,
          job_type: selectedJobText,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          description: formData.get('description'),
          request_id: data.result.request_id,
          // Include technician data if available
          technician: data.result.technician
        };

        console.log('Technician data received:', data.result.technician);

        // Send data to confirmation page
        fetch('/confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(confirmationData)
        })
          .then(response => response.json())
          .then(confirmResponse => {
            if (confirmResponse.redirect) {
              window.location.href = confirmResponse.redirect;
            }
          });
      } else {
        alert(`Error submitting appointment: ${data.error}`);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while submitting the appointment. Please try again.');
    });
});

// Phone number validation - only allow digits, auto-format to (XXX) XXX-XXXX
const phoneInput = document.getElementById('phone');
const phoneError = document.createElement('div');
phoneError.id = 'phoneError';
phoneError.style.color = 'red';
phoneError.style.fontSize = '0.9rem';
phoneError.style.marginTop = '5px';
phoneError.style.display = 'none';

// Insert error message after phone input
phoneInput.parentNode.insertBefore(phoneError, phoneInput.nextSibling);

// Real-time validation and formatting
phoneInput.addEventListener('input', function (e) {
  let value = e.target.value;
  const hasNonDigits = /[^0-9]/.test(value.replace(/[\s\-()]/g, '')); // Check for non-digits excluding formatting chars

  // Remove all non-digit characters first
  let digitsOnly = value.replace(/[^0-9]/g, '');

  // Show error if user tried to enter invalid characters
  if (hasNonDigits && value.replace(/[^0-9\s\-()]/g, '').length !== value.length) {
    phoneError.textContent = 'Only digits (0-9) are allowed.';
    phoneError.style.display = 'block';
    phoneInput.style.borderColor = 'red';
    phoneInput.style.backgroundColor = '#fff5f5';

    // Hide error after 2 seconds
    setTimeout(() => {
      phoneError.style.display = 'none';
      phoneInput.style.borderColor = '';
      phoneInput.style.backgroundColor = '';
    }, 2000);
  } else {
    phoneError.style.display = 'none';
    phoneInput.style.borderColor = '';
    phoneInput.style.backgroundColor = '';
  }

  // Limit to 10 digits
  if (digitsOnly.length > 10) {
    digitsOnly = digitsOnly.substring(0, 10);
  }

  // Format as (XXX) XXX-XXXX
  let formattedValue = '';
  if (digitsOnly.length > 0) {
    if (digitsOnly.length <= 3) {
      formattedValue = '(' + digitsOnly;
    } else if (digitsOnly.length <= 6) {
      formattedValue = '(' + digitsOnly.substring(0, 3) + ') ' + digitsOnly.substring(3);
    } else {
      formattedValue = '(' + digitsOnly.substring(0, 3) + ') ' + digitsOnly.substring(3, 6) + '-' + digitsOnly.substring(6);
    }
  }

  e.target.value = formattedValue;
});

// Additional validation on form submit
document.getElementById("appointmentForm").addEventListener("submit", function (e) {
  const phoneValue = phoneInput.value;
  const digitsOnly = phoneValue.replace(/[^0-9]/g, '');

  if (digitsOnly.length !== 10) {
    e.preventDefault();
    e.stopPropagation();

    phoneError.textContent = 'Phone number must be exactly 10 digits.';
    phoneError.style.display = 'block';
    phoneInput.style.borderColor = 'red';
    phoneInput.style.backgroundColor = '#fff5f5';
    phoneInput.focus();
    alert('Please enter a valid 10-digit phone number.');
    return false;
  }
}, true); // Use capture phase to run before the other submit handler