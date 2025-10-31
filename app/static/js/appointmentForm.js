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

    // Check if both service type and job type are selected
    const serviceTypeSelect = document.getElementById('service');
    const jobSelect = document.getElementById('job');
    const selectedServiceType = serviceTypeSelect.value;
    const selectedJobType = jobSelect.value;
    const incompleteSelection = !selectedServiceType || !selectedJobType;

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
      } else if (incompleteSelection) {
        // Service type or job type not selected - show all future dates as unclickable with helpful message
        cell.classList.add('no-service-selected');
        cell.style.cursor = 'not-allowed';
        cell.style.opacity = '0.6';
        cell.style.color = '#adb5bd';
        if (!selectedServiceType) {
          cell.title = 'Please select a service type first';
        } else {
          cell.title = 'Please select a job type to see available dates';
        }
      } else if (!hasAvailability) {
        // Future dates with no availability - muted but visible
        cell.classList.add('no-availability');
        cell.style.cursor = 'not-allowed';
        cell.style.opacity = '0.6';
        cell.style.color = '#adb5bd';
        cell.title = 'No qualified employees available on this date';
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
  // Create new date to avoid day-of-month overflow issues
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month - 1, 1);
  await generateCalendar(currentDate);
};

document.getElementById('nextMonth').onclick = async () => {
  // Create new date to avoid day-of-month overflow issues
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month + 1, 1);
  await generateCalendar(currentDate);
};

let selectedDate = null;
let selectedTime = null;
let selectedTime24 = null; // Store time in 24-hour format for backend
let currentServiceDuration = 1; // Default 1 hour, will be updated when service is selected
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

    // Check if both service type and job type are selected for filtering
    const serviceTypeSelect = document.getElementById('service');
    const jobSelect = document.getElementById('job');
    const selectedServiceType = serviceTypeSelect.value;
    const selectedJobType = jobSelect.value;

    let response, result;

    if (selectedServiceType && selectedJobType) {
      // Fetch filtered availability based on service type
      const [availabilityResponse, employeesResponse] = await Promise.all([
        fetch(`/api/availability/date/${dateStr}`),
        fetch(`/api/employees/by-service-type/${encodeURIComponent(selectedServiceType)}`)
      ]);

      const availabilityResult = await availabilityResponse.json();
      const employeesResult = await employeesResponse.json();

      if (availabilityResult.success && employeesResult.success) {
        // Filter availability to only include qualified employees
        const qualifiedEmployeeIds = new Set(employeesResult.data.map(emp => emp.employeeid));

        result = {
          success: true,
          time_slots: availabilityResult.time_slots.filter(slot =>
            qualifiedEmployeeIds.has(slot.employee_id)
          )
        };
      } else {
        result = { success: false, message: 'Error loading filtered availability' };
      }
    } else {
      // Fetch all employee availability for this date (no filtering)
      response = await fetch(`/api/availability/date/${dateStr}`);
      result = await response.json();
    }

    // Clear loading message
    morningSlots.innerHTML = '';
    afternoonSlots.innerHTML = '';

    if (result.success && result.time_slots && result.time_slots.length > 0) {
      // Sort employees by ID for consistent precedence (lower ID = higher precedence)
      const sortedSlots = result.time_slots.sort((a, b) => a.employee_id - b.employee_id);

      // Group time slots by time period to handle multiple employees for same slot
      const timeSlotAvailability = new Map(); // Map<timeStr, {employees: [], anyAvailable: boolean}>

      // First pass: collect all employee availability for each time slot
      sortedSlots.forEach(slot => {
        const startTime = slot.starttime;
        const endTime = slot.endtime;
        const bookedRanges = slot.booked_ranges || [];

        collectEmployeeAvailability(startTime, endTime, slot, bookedRanges, timeSlotAvailability, isToday, now);
      });

      // Second pass: generate time slot buttons based on aggregated availability
      generateTimeSlotButtons(timeSlotAvailability, isToday, now);

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

// Collect employee availability for each time slot (handles multiple employees)
function collectEmployeeAvailability(startTime, endTime, slot, bookedRanges, timeSlotAvailability, isToday, now) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // Generate 30-minute slots within this employee's availability window
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Check if this time slot has passed (only for today)
    let isPastTime = false;
    if (isToday) {
      const slotTime = new Date();
      slotTime.setHours(hour, minute, 0, 0);
      isPastTime = slotTime < now;
    }

    // Check if this employee is booked for this time slot
    const isEmployeeBooked = isTimeSlotBooked(timeStr, bookedRanges);

    // Initialize time slot tracking if not exists
    if (!timeSlotAvailability.has(timeStr)) {
      timeSlotAvailability.set(timeStr, {
        employees: [],
        anyAvailable: false,
        isPastTime: isPastTime
      });
    }

    // Add this employee's availability info
    const slotInfo = timeSlotAvailability.get(timeStr);
    slotInfo.employees.push({
      employee_id: slot.employee_id,
      employee_name: slot.employee_name,
      isBooked: isEmployeeBooked
    });

    // Mark as available if ANY employee is available (not booked and not past time)
    if (!isEmployeeBooked && !isPastTime) {
      slotInfo.anyAvailable = true;
    }
  }
}

// Generate time slot buttons based on aggregated availability
function generateTimeSlotButtons(timeSlotAvailability, isToday, now) {
  const processedSlots = new Set();

  for (const [timeStr, slotInfo] of timeSlotAvailability) {
    if (processedSlots.has(timeStr)) continue;
    processedSlots.add(timeStr);

    const [hour, minute] = timeStr.split(':').map(Number);
    const timeLabel = formatTime(hour, minute);
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("time-slot");
    button.textContent = timeLabel;
    button.dataset.time24 = timeStr;

    // Determine button state based on aggregated availability
    if (slotInfo.isPastTime) {
      // Past time slots
      button.classList.add("past-time");
      button.disabled = true;
      button.style.cursor = "not-allowed";
      button.style.opacity = "0.4";
      button.style.textDecoration = "line-through";
      button.title = "Time has passed";
    } else if (!slotInfo.anyAvailable) {
      // All employees are booked for this slot
      button.classList.add("booked-time");
      button.disabled = true;
      button.style.cursor = "not-allowed";
      button.style.opacity = "0.6";
      button.style.textDecoration = "line-through";
      button.style.backgroundColor = "#ffebee";
      button.style.color = "#d32f2f";
      button.title = "All employees are booked for this time";
    } else {
      // At least one employee is available
      // Show available employee with highest precedence (lowest ID)
      const availableEmployee = slotInfo.employees
        .filter(emp => !emp.isBooked)
        .sort((a, b) => a.employee_id - b.employee_id)[0];

      button.title = `Available with ${availableEmployee.employee_name}`;
      button.onclick = () => {
        document.querySelectorAll(".time-slot").forEach(s => s.classList.remove("selected"));
        button.classList.add("selected");
        selectedTime = timeLabel;
        selectedTime24 = timeStr;
        updateConfirm();
      };
    }

    // Add to appropriate time section
    if (hour < 12) {
      morningSlots.appendChild(button);
    } else {
      afternoonSlots.appendChild(button);
    }
  }
}

// Utility function to check if a time slot overlaps with booked ranges
// Now considers the duration of the current service being scheduled
function isTimeSlotBooked(timeStr, bookedRanges) {
  const [slotHour, slotMinute] = timeStr.split(':').map(Number);
  const slotMinutes = slotHour * 60 + slotMinute;

  // Calculate the end time based on the current service duration
  const serviceDurationMinutes = currentServiceDuration * 60; // Convert hours to minutes
  const serviceEndMinutes = slotMinutes + serviceDurationMinutes;

  for (const bookedRange of bookedRanges) {
    const [bookedStartHour, bookedStartMinute] = bookedRange.start_time.split(':').map(Number);
    const [bookedEndHour, bookedEndMinute] = bookedRange.end_time.split(':').map(Number);

    const bookedStartMinutes = bookedStartHour * 60 + bookedStartMinute;
    const bookedEndMinutes = bookedEndHour * 60 + bookedEndMinute;

    // Check if the proposed service time range overlaps with any booked range
    // Overlap occurs if: (service_start < booked_end) AND (service_end > booked_start)
    if (slotMinutes < bookedEndMinutes && serviceEndMinutes > bookedStartMinutes) {
      return true; // Overlap found - this slot is booked/conflicts
    }
  }

  return false; // No overlap - slot is available for the full service duration
}

function generateSlotsInRange(startTime, endTime, employeeName, isToday, now, processedSlots, bookedRanges = []) {
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

    // Check if this time slot is booked (overlaps with existing service)
    const isBooked = isTimeSlotBooked(timeStr, bookedRanges);


    const timeLabel = formatTime(hour, minute);
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("time-slot");
    button.textContent = timeLabel;

    // Store the time in 24-hour format for backend
    button.dataset.time24 = timeStr;

    // Handle different slot states
    if (isPastTime) {
      // Past time slots
      button.classList.add("past-time");
      button.disabled = true;
      button.style.cursor = "not-allowed";
      button.style.opacity = "0.4";
      button.style.textDecoration = "line-through";
      button.title = "Time has passed";
    } else if (isBooked) {
      // Booked time slots - crossed out but visible
      button.classList.add("booked-time");
      button.disabled = true;
      button.style.cursor = "not-allowed";
      button.style.opacity = "0.6";
      button.style.textDecoration = "line-through";
      button.style.backgroundColor = "#ffebee";
      button.style.color = "#d32f2f";
      button.title = "Time slot already booked";
    } else {
      // Available time slots
      button.title = `Available with ${employeeName}`;
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

    // Check if both service type and job type are selected
    const serviceTypeSelect = document.getElementById('service');
    const jobSelect = document.getElementById('job');
    const selectedServiceType = serviceTypeSelect.value;
    const selectedJobType = jobSelect.value;

    if (selectedServiceType && selectedJobType) {
      // Fetch filtered availability for the month - pass service_type as query param
      const response = await fetch(`/api/availability/month/${year}/${apiMonth}?service_type=${encodeURIComponent(selectedServiceType)}`);
      const result = await response.json();

      if (result.success) {
        return result.available_dates || [];
      } else {
        console.error('Error fetching filtered month availability:', result.message);
        return [];
      }
    } else {
      // Service type or job type not selected - return empty array so no dates are clickable
      return [];
    }

  } catch (error) {
    console.error('Error fetching month availability:', error);
    return [];
  }
}

// Initial state - show message when no service and job selected
morningSlots.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #6c757d; padding: 20px;">Please select both service type and job type first, then choose a date from the calendar above</div>';
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

  // Reset job dropdown and hide cost estimate
  jobSelect.innerHTML = '<option value="">--Select Job Type--</option>';
  jobSelect.disabled = true;
  serviceIdInput.value = '';
  hideCostEstimate();

  if (!serviceTypeName) {
    // Reset calendar and time slots when no service selected
    updateFilterIndicator();
    refreshCalendarForServiceType();
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

  // Note: Don't refresh calendar here since job type was just reset
  // Calendar will refresh when job type is selected
});

// Function to update the filter indicator
function updateFilterIndicator() {
  const serviceTypeSelect = document.getElementById('service');
  const jobSelect = document.getElementById('job');
  const selectedServiceType = serviceTypeSelect.value;
  const selectedJobType = jobSelect.value;
  const filterIndicator = document.getElementById('filterIndicator');
  const filterServiceType = document.getElementById('filterServiceType');

  if (selectedServiceType && selectedJobType) {
    const jobText = jobSelect.options[jobSelect.selectedIndex].text;
    filterServiceType.textContent = `${selectedServiceType} - ${jobText}`;
    filterIndicator.style.display = 'block';
  } else {
    filterIndicator.style.display = 'none';
  }
}

// Function to refresh calendar when service type changes
async function refreshCalendarForServiceType() {
  // Regenerate calendar to show updated availability
  await generateCalendar(currentDate);

  // Refresh time slots if a date is already selected
  if (selectedDate) {
    generateTimeSlots(new Date(selectedDate));
  }
}

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
    // Reset service duration to default when no job selected
    currentServiceDuration = 1;
    // Refresh time slots if a date is selected
    if (selectedDate) {
      generateTimeSlots(new Date(selectedDate));
    }
  }

  // Update filter indicator and refresh calendar when job type changes
  updateFilterIndicator();
  refreshCalendarForServiceType();
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

      // Store service duration globally for time slot conflict checking
      currentServiceDuration = cost.duration_hours;

      // Refresh time slots if a date is already selected to reflect new duration
      if (selectedDate) {
        generateTimeSlots(new Date(selectedDate));
      }

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