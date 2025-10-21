// Calendar generation
const monthYear = document.getElementById('monthYear');
const calendarBody = document.getElementById('calendarBody');
let currentDate = new Date();

function generateCalendar(date) {
  calendarBody.innerHTML = '';
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();

  monthYear.textContent = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  let row = document.createElement('tr');
  for (let i = 0; i < startDay; i++) {
    row.appendChild(document.createElement('td'));
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const cell = document.createElement('td');
    cell.textContent = d;
    cell.onclick = () => selectDate(new Date(year, month, d), cell);
    row.appendChild(cell);
    if ((startDay + d) % 7 === 0) {
      calendarBody.appendChild(row);
      row = document.createElement('tr');
    }
  }
  calendarBody.appendChild(row);
}

document.getElementById('prevMonth').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar(currentDate);
};

document.getElementById('nextMonth').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar(currentDate);
};

let selectedDate = null;
let selectedTime = null;
const confirmText = document.getElementById('confirmText');

function selectDate(date, cell) {
  document.querySelectorAll('.calendar td').forEach(td => td.classList.remove('selected'));
  cell.classList.add('selected');
  selectedDate = date.toDateString();
  updateConfirm();
}

function updateConfirm() {
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

// Time slots generation
const timeSlotsContainer = document.getElementById("timeSlots");
const startHour = 9;
const endHour = 18.5; // 6:30 PM
const slotIncrement = 30; // minutes

function formatTime(hour, minute) {
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

for (let time = startHour * 60; time <= endHour * 60; time += slotIncrement) {
  const hour = Math.floor(time / 60);
  const minute = time % 60;
  const timeLabel = formatTime(hour, minute);
  const div = document.createElement("div");
  div.classList.add("time-slot");
  div.textContent = timeLabel;
  div.onclick = () => {
    document.querySelectorAll(".time-slot").forEach(s => s.classList.remove("selected"));
    div.classList.add("selected");
    selectedTime = timeLabel;
    updateConfirm();
  };
  timeSlotsContainer.appendChild(div);
}

generateCalendar(currentDate);

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

  // Map service type and job type to serviceId
  const serviceType = formData.get('service');
  const jobType = formData.get('job');
  let serviceId = 1; // Default fallback

  // Simple mapping logic (you can modify this later)
  if (serviceType === 'plumbing' && jobType === 'repair') serviceId = 1;
  else if (serviceType === 'plumbing' && jobType === 'install') serviceId = 2;
  else if (serviceType === 'electrician' && jobType === 'repair') serviceId = 3;
  else if (serviceType === 'electrician' && jobType === 'install') serviceId = 4;
  else if (serviceType === 'plumbing' && jobType === 'quote') serviceId = 5;
  else if (serviceType === 'electrician' && jobType === 'quote') serviceId = 6;
  else if (serviceType === 'other' && jobType === 'repair') serviceId = 7;
  else if (serviceType === 'other' && jobType === 'install') serviceId = 8;
  else serviceId = 1; // Default to service 1 if no match

  const appointmentData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    zipCode: formData.get('zipCode'),
    serviceId: serviceId,
    requestDate: formData.get('requestDate'),
    scheduledDate: formData.get('scheduledDate'),
    scheduledTime: selectedTime,
    description: formData.get('description'),
    isCompleted: formData.get('isCompleted') === 'true'
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
        // Prepare confirmation data with original form values
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
          job_type: jobType,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          description: formData.get('description'),
          request_id: data.result.request_id
        };

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
phoneInput.addEventListener('input', function(e) {
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