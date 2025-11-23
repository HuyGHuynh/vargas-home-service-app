let serviceRequests = [];
let currentRequestId = null;

try {
  document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
    loadServiceRequests();

    // Initialize FullCalendar
    window.calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      height: "auto",
      events: [],
      eventClick: function (info) {
        const requestId = info.event.extendedProps.requestId;
        showServiceRequestDetails(requestId);
      },
      dateClick: function (info) {
        // Open add work order modal when clicking on a date
        openAddWorkOrderModal(info.dateStr);
      },
      eventDidMount: function (info) {
        // Add status-based styling
        const status = info.event.extendedProps.status;
        if (status) {
          info.el.classList.add(`status-${status.toLowerCase().replace(' ', '-')}`);
        }
      }
    });

    calendar.render();

    // Initialize service type and job type functionality
    initializeServiceTypeHandling();

    // Handle add work order form submission
    const addWorkOrderForm = document.getElementById('addWorkOrderForm');
    if (addWorkOrderForm) {
      addWorkOrderForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const fullAddress = `${formData.get('address')}, ${formData.get('city')}, ${formData.get('state')} ${formData.get('zipCode')}`;

        // Get estimated cost from the cost estimate display
        const totalCostElement = document.getElementById('totalCost');
        const estimatedCost = totalCostElement && totalCostElement.textContent ?
          parseFloat(totalCostElement.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;

        // Format data to match backend expectations (flat structure)
        const data = {
          // Customer info
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          phone: formData.get('customerPhone'),
          email: formData.get('customerEmail'),

          // Address info  
          address: formData.get('address'),
          city: formData.get('city'),
          state: formData.get('state'),
          zipCode: formData.get('zipCode'),

          // Service info
          serviceId: parseInt(formData.get('serviceId')) || null,
          description: formData.get('requestDescription'),

          // Scheduling info
          requestDate: formData.get('selectedDate'),
          scheduledDate: formData.get('selectedDate'),
          scheduledTime: "09:00 AM", // Default time since no time picker in form
          isCompleted: false,

          // Employee assignment (admin feature)
          assignedEmployeeId: formData.get('assignedTechnician') || null
        };

        // Debug: Log the data being sent
        console.log('Form data being sent:', data);

        // Check for missing required fields
        const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'address', 'city', 'state', 'zipCode'];
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          showNotification(`Missing required fields: ${missingFields.join(', ')}`, 'error');
          return;
        }

        if (!data.serviceId) {
          console.error('Service ID is missing - make sure a job type is selected');
          showNotification('Please select a job type', 'error');
          return;
        }

        try {
          showNotification('Creating work order...', 'info');

          const response = await fetch('/workorders/expanded', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });

          const result = await response.json();
          console.log('Backend response:', result);

          if (result.ok || result.success) {
            showNotification('Work order created successfully!', 'success');
            closeAddWorkOrderModal();
            // Reload service requests to show the new work order
            loadServiceRequests();
          } else {
            showNotification(result.error || 'Failed to create work order', 'error');
          }
        } catch (error) {
          console.error('Error creating work order:', error);
          showNotification('Network error creating work order', 'error');
        }
      });
    }
  });
} catch (error) {
  console.error(error);
  document.getElementById("errorBox").style.display = "block";
}

// Load service requests from API
async function loadServiceRequests() {
  try {
    showLoadingState();

    const response = await fetch('/api/service-requests');
    const result = await response.json();

    if (result.success) {
      serviceRequests = result.data;
      displayServiceRequests();
    } else {
      showErrorState(result.error || 'Failed to load service requests');
    }
  } catch (error) {
    console.error('Error loading service requests:', error);
    showErrorState('Network error loading service requests');
  }
}

// Convert UTC datetime to display correctly in calendar
function adjustDateTimeForCalendar(dateTimeString) {
  if (!dateTimeString) return null;

  // Check if the datetime is stored in UTC format (ends with +00 or Z)
  const isUTC = dateTimeString.includes('+00') || dateTimeString.endsWith('Z');

  if (isUTC) {
    // For UTC times, we need to adjust them to display correctly
    // FullCalendar will apply local timezone, so we counter-adjust
    const utcDate = new Date(dateTimeString);
    const timezoneOffset = utcDate.getTimezoneOffset(); // minutes difference from UTC

    // Add the timezone offset to show the UTC time as if it were local
    const adjustedDate = new Date(utcDate.getTime() + (timezoneOffset * 60000));
    return adjustedDate.toISOString();
  }

  return dateTimeString;
}

// Display service requests on calendar
function displayServiceRequests() {
  const events = serviceRequests.map(sr => {
    const customerName = `${sr.customer.first_name || ''} ${sr.customer.last_name || ''}`.trim();
    const serviceType = sr.service.service_type || 'Service';
    const assignedEmployee = sr.assigned_employee ? `${sr.assigned_employee.first_name} ${sr.assigned_employee.last_name}` : 'Unassigned';

    return {
      id: sr.request_id,
      title: `${customerName} - ${serviceType} (${assignedEmployee})`,
      start: adjustDateTimeForCalendar(sr.preferred_datetime),
      backgroundColor: getStatusColor(sr.request_status),
      borderColor: getStatusColor(sr.request_status),
      extendedProps: {
        requestId: sr.request_id,
        status: sr.request_status,
        customerName: customerName,
        email: sr.customer.email,
        phone: sr.customer.phone,
        serviceType: serviceType,
        jobName: sr.service.job_name,
        description: sr.request_description,
        assignedEmployee: assignedEmployee
      }
    };
  });

  window.calendar.removeAllEvents();
  window.calendar.addEventSource(events);
}

// Get color based on status
function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return '#ff9800';
    case 'in progress': return '#2196f3';
    case 'completed': return '#4caf50';
    case 'cancelled': return '#f44336';
    default: return '#9e9e9e';
  }
}

// Show service request details in modal
function showServiceRequestDetails(requestId) {
  const serviceRequest = serviceRequests.find(sr => sr.request_id === requestId);
  if (!serviceRequest) return;

  currentRequestId = requestId;

  const customerName = `${serviceRequest.customer.first_name || ''} ${serviceRequest.customer.last_name || ''}`.trim();
  const fullAddress = `${serviceRequest.address.street || ''}, ${serviceRequest.address.city || ''}, ${serviceRequest.address.state || ''} ${serviceRequest.address.zip_code || ''}`.trim();

  const detailsHtml = `
    <div class="detail-section">
      <div class="detail-row">
        <div class="detail-label">Status:</div>
        <div class="detail-value">
          <span class="status-badge ${serviceRequest.request_status.toLowerCase().replace(' ', '-')}">${serviceRequest.request_status}</span>
        </div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Scheduled Date:</div>
        <div class="detail-value">${formatDateTime(serviceRequest.preferred_datetime)}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Assigned Technician:</div>
        <div class="detail-value">
          ${serviceRequest.assigned_employee ?
      `<span class="employee-assigned">${serviceRequest.assigned_employee.first_name} ${serviceRequest.assigned_employee.last_name}</span>` :
      '<span class="employee-unassigned">Not Assigned</span>'
    }
        </div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Customer Name:</div>
        <div class="detail-value">${customerName}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Address:</div>
        <div class="detail-value">${fullAddress}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Phone:</div>
        <div class="detail-value">${serviceRequest.customer.phone || 'N/A'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Email:</div>
        <div class="detail-value">${serviceRequest.customer.email || 'N/A'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Job Name:</div>
        <div class="detail-value">${serviceRequest.service.job_name || 'N/A'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Service Price:</div>
        <div class="detail-value">$${serviceRequest.service.service_price?.toFixed(2) || '0.00'}</div>
      </div>
      ${serviceRequest.request_status !== 'Pending' || serviceRequest.final_price ? `
      <div class="detail-row">
        <div class="detail-label">Final Price:</div>
        <div class="detail-value" id="finalPriceDisplay" data-field="final_price">
          ${serviceRequest.final_price ? `$${serviceRequest.final_price.toFixed(2)}` : '<span class="tbd-price">TBD</span>'}
        </div>
      </div>
      ` : ''}
      <div class="detail-row">
        <div class="detail-label">Request Description:</div>
        <div class="detail-value">${serviceRequest.request_description || 'No description provided'}</div>
      </div>
      ${serviceRequest.imageurl ? `
      <div class="detail-row">
        <div class="detail-label">Submitted Image:</div>
        <div class="detail-value">
          <div class="service-image-container">
            <img src="${serviceRequest.imageurl}" alt="Service Request Image" class="service-request-image" onclick="openImageModal('${serviceRequest.imageurl}')">
            <div class="image-caption">Click to view full size</div>
          </div>
        </div>
      </div>
      ` : ''}
    </div>
    

  `;

  document.getElementById('serviceRequestDetails').innerHTML = detailsHtml;

  // Update modal action buttons based on request status
  const modalActions = document.querySelector('.modal-actions');

  // Clear all existing action buttons
  modalActions.innerHTML = '';

  if (serviceRequest.request_status === 'Pending') {
    // Add final price setting section for Pending requests
    const finalPriceSection = document.createElement('div');
    finalPriceSection.className = 'final-price-section';
    finalPriceSection.innerHTML = `
      <div class="price-input-group">
        <label for="finalPriceInput">Set Final Price ($):</label>
        <div class="price-input-container">
          <input type="number" 
                 id="finalPriceInput" 
                 step="0.01" 
                 min="0" 
                 placeholder="Enter final price"
                 value="${serviceRequest.final_price && serviceRequest.final_price !== 'TBD' ? serviceRequest.final_price : ''}"
                 class="price-input">
          <button type="button" 
                  class="save-price-btn" 
                  onclick="saveFinalPrice(${serviceRequest.request_id})">
            Save Price
          </button>
        </div>
      </div>
    `;

    // Add Accept and Reject buttons for Pending requests (admin warranty style)
    const acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.className = 'modal-accept-btn';
    acceptBtn.textContent = 'Accept Request';
    acceptBtn.onclick = () => acceptRequest(serviceRequest.request_id);

    const rejectBtn = document.createElement('button');
    rejectBtn.type = 'button';
    rejectBtn.className = 'modal-reject-btn';
    rejectBtn.textContent = 'Reject Request';
    rejectBtn.onclick = () => rejectRequest(serviceRequest.request_id);

    modalActions.appendChild(finalPriceSection);
    modalActions.appendChild(rejectBtn);
    modalActions.appendChild(acceptBtn);
  } else if (serviceRequest.request_status === 'In Progress') {
    // Add warranty form and Mark as Complete button for In Progress orders
    const warrantySection = document.createElement('div');
    warrantySection.className = 'warranty-section';
    warrantySection.innerHTML = `
      <h3>Optional Warranty Attachment</h3>
      <div class="warranty-form">
        <div class="form-group">
          <label for="warrantyStartDate">Start Date:</label>
          <input type="date" id="warrantyStartDate" class="form-control">
        </div>
        <div class="form-group">
          <label for="warrantyEndDate">End Date:</label>
          <input type="date" id="warrantyEndDate" class="form-control">
        </div>
        <div class="form-group">
          <label for="warrantyDescription">Description:</label>
          <textarea id="warrantyDescription" class="form-control" rows="3" placeholder="Enter warranty description..."></textarea>
        </div>
        <div class="form-group">
          <label for="warrantyPrice">Price ($):</label>
          <input type="number" id="warrantyPrice" class="form-control" step="0.01" min="0" placeholder="0.00">
        </div>
      </div>
    `;

    const completeBtn = document.createElement('button');
    completeBtn.type = 'button';
    completeBtn.className = 'modal-accept-btn';
    completeBtn.textContent = 'Mark as Complete';
    completeBtn.onclick = () => completeOrder(serviceRequest.request_id);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'modal-reject-btn';
    cancelBtn.textContent = 'Cancel Order';
    cancelBtn.onclick = () => cancelOrder(serviceRequest.request_id);

    modalActions.appendChild(warrantySection);
    modalActions.appendChild(cancelBtn);
    modalActions.appendChild(completeBtn);
  }
  // For Completed and Cancelled status, no action buttons (modal can only be closed with X)

  document.getElementById('serviceRequestModal').style.display = 'block';
}

// Accept request (Pending -> In Progress with final price)
async function acceptRequest(requestId) {
  const finalPriceInput = document.getElementById('finalPriceInput');
  const finalPrice = finalPriceInput ? parseFloat(finalPriceInput.value) : null;

  // Validate final price for pending requests without existing final price
  const serviceRequest = serviceRequests.find(sr => sr.request_id === requestId);
  if (!serviceRequest.final_price && (!finalPrice || finalPrice <= 0)) {
    showNotification('Please enter a valid final price before accepting the request.', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/service-requests/${requestId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        final_price: finalPrice || serviceRequest.final_price
      })
    });

    const result = await response.json();

    if (result.success) {
      // Update local data
      if (serviceRequest) {
        serviceRequest.request_status = 'In Progress';
        serviceRequest.final_price = finalPrice || serviceRequest.final_price;
      }

      displayServiceRequests();
      closeServiceRequestModal();
      showNotification(`Service request accepted and moved to In Progress!`, 'success');
    } else {
      showNotification(`Failed to accept request: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error accepting request:', error);
    showNotification('Network error accepting request', 'error');
  }
}

// Reject request (delete from database)
async function rejectRequest(requestId) {
  if (!confirm('Are you sure you want to reject and delete this service request?\n\nThis action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`/api/service-requests/${requestId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      // Remove from local data
      serviceRequests = serviceRequests.filter(sr => sr.request_id !== requestId);

      displayServiceRequests();
      closeServiceRequestModal();
      showNotification('Service request rejected and deleted successfully!', 'success');
    } else {
      showNotification(`Failed to reject request: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error rejecting request:', error);
    showNotification('Network error rejecting request', 'error');
  }
}

// Save final price for pending request without changing status
async function saveFinalPrice(requestId) {
  const finalPriceInput = document.getElementById('finalPriceInput');
  const finalPrice = parseFloat(finalPriceInput.value);

  // Validate input
  if (!finalPrice || finalPrice <= 0) {
    showNotification('Please enter a valid price greater than 0', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/service-requests/${requestId}/set-final-price`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        final_price: finalPrice
      })
    });

    const result = await response.json();

    if (result.success) {
      // Update local data
      const serviceRequest = serviceRequests.find(sr => sr.request_id === requestId);
      if (serviceRequest) {
        serviceRequest.final_price = finalPrice.toFixed(2);
      }

      // Update the final price display in the modal if it exists
      const finalPriceElement = document.querySelector('.detail-value[data-field="final_price"]');
      if (finalPriceElement) {
        finalPriceElement.textContent = `$${finalPrice.toFixed(2)}`;
        finalPriceElement.classList.remove('tbd-price');
      }

      showNotification('Final price saved successfully!', 'success');
    } else {
      showNotification(`Failed to save final price: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error saving final price:', error);
    showNotification('Network error saving final price', 'error');
  }
}

// Complete order (In Progress -> Completed with optional warranty)
async function completeOrder(requestId) {
  const warrantyData = {
    start_date: document.getElementById('warrantyStartDate')?.value || null,
    end_date: document.getElementById('warrantyEndDate')?.value || null,
    description: document.getElementById('warrantyDescription')?.value || null,
    price: document.getElementById('warrantyPrice')?.value ? parseFloat(document.getElementById('warrantyPrice').value) : null
  };

  // Validate warranty dates if any are provided
  if (warrantyData.start_date || warrantyData.end_date || warrantyData.description || warrantyData.price) {
    if (!warrantyData.start_date || !warrantyData.end_date) {
      showNotification('Please provide both start and end dates for the warranty.', 'error');
      return;
    }

    if (new Date(warrantyData.start_date) >= new Date(warrantyData.end_date)) {
      showNotification('Warranty end date must be after start date.', 'error');
      return;
    }

    if (!warrantyData.description || !warrantyData.description.trim()) {
      showNotification('Please provide a warranty description.', 'error');
      return;
    }

    if (!warrantyData.price || warrantyData.price <= 0) {
      showNotification('Please provide a valid warranty price.', 'error');
      return;
    }
  }

  try {
    const response = await fetch(`/api/service-requests/${requestId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        warranty: warrantyData.start_date ? warrantyData : null
      })
    });

    const result = await response.json();

    if (result.success) {
      // Update local data
      const serviceRequest = serviceRequests.find(sr => sr.request_id === requestId);
      if (serviceRequest) {
        serviceRequest.request_status = 'Completed';
      }

      displayServiceRequests();
      closeServiceRequestModal();

      const warrantyMessage = warrantyData.start_date ? ' with warranty attached' : '';
      showNotification(`Service request marked as completed${warrantyMessage}!`, 'success');
    } else {
      showNotification(`Failed to complete request: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error completing request:', error);
    showNotification('Network error completing request', 'error');
  }
}

// Cancel order (In Progress -> Cancelled)
async function cancelOrder(requestId) {
  if (!confirm('Are you sure you want to cancel this order?\n\nThis action will change the status to Cancelled.')) {
    return;
  }

  try {
    const response = await fetch(`/api/service-requests/${requestId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      // Update local data
      const serviceRequest = serviceRequests.find(sr => sr.request_id === requestId);
      if (serviceRequest) {
        serviceRequest.request_status = 'Cancelled';
      }

      displayServiceRequests();
      closeServiceRequestModal();
      showNotification('Service request cancelled successfully!', 'success');
    } else {
      showNotification(`Failed to cancel request: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error cancelling request:', error);
    showNotification('Network error cancelling request', 'error');
  }
}

// Close modal
function closeServiceRequestModal() {
  document.getElementById('serviceRequestModal').style.display = 'none';
  currentRequestId = null;
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('serviceRequestModal');
  if (event.target === modal) {
    closeServiceRequestModal();
  }
}

// Show loading state
function showLoadingState() {
  // Add loading indicator to calendar if needed
}

// Show error state
function showErrorState(message) {
  document.getElementById("errorBox").textContent = message;
  document.getElementById("errorBox").style.display = "block";
}

// Format date and time
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);

  // Check if the datetime is stored in UTC format (ends with +00 or Z)
  const isUTC = dateTimeString.includes('+00') || dateTimeString.endsWith('Z');

  if (isUTC) {
    // For UTC times, display them as stored without timezone conversion
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  } else {
    // For local times, display normally
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'linear-gradient(135deg, #f44336, #d32f2f)'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 3000;
    font-weight: 600;
    animation: slideInRight 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Open add work order modal
function openAddWorkOrderModal(dateStr) {
  const modal = document.getElementById('addWorkOrderModal');
  const selectedDateInput = document.getElementById('selectedDate');
  const selectedDateDisplay = document.getElementById('selectedDateDisplay');

  // Format date for display - fix timezone issue by parsing as local date
  const dateParts = dateStr.split('-');
  const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  selectedDateInput.value = dateStr;
  selectedDateDisplay.textContent = formattedDate;
  modal.style.display = 'block';

  // Reset form
  document.getElementById('addWorkOrderForm').reset();
  selectedDateInput.value = dateStr; // Set date again after reset
  selectedDateDisplay.textContent = formattedDate; // Set display again after reset

  // Ensure state field always shows NJ after reset
  const stateInput = document.getElementById('state');
  if (stateInput) {
    stateInput.value = 'NJ';
  }

  // Reset service dropdowns
  const jobSelect = document.getElementById('jobType');
  const serviceIdInput = document.getElementById('serviceId');
  if (jobSelect) {
    jobSelect.innerHTML = '<option value="">--Select Service Type First--</option>';
    jobSelect.disabled = true;
  }
  if (serviceIdInput) {
    serviceIdInput.value = '';
  }

  // Hide cost estimate
  hideCostEstimateInModal();

  // Ensure service types are populated and technicians show all initially
  populateServiceTypeDropdown();
  populateTechnicianDropdown(); // Show all technicians initially
}

// Close add work order modal
function closeAddWorkOrderModal() {
  const modal = document.getElementById('addWorkOrderModal');
  modal.style.display = 'none';
  document.getElementById('addWorkOrderForm').reset();
}

// Close modal when clicking outside of it
window.addEventListener('click', function (event) {
  const addWorkOrderModal = document.getElementById('addWorkOrderModal');

  if (event.target === addWorkOrderModal) {
    closeAddWorkOrderModal();
  }
});

// Service Type and Job Type Handling
let servicesByType = {}; // Cached services organized by type
let serviceTypes = [];
let allServices = [];
let allTechnicians = []; // Cached technicians

// Initialize service type functionality
function initializeServiceTypeHandling() {
  // Preload service data when modal is opened
  preloadServiceData();

  // Preload technician data
  preloadTechnicianData();

  // Add event listeners for service type and job type changes
  setupServiceTypeEventListeners();
}

// Preload all service data
async function preloadServiceData() {
  try {
    // Fetch both service types and all services in parallel
    const [typesResponse, servicesResponse] = await Promise.all([
      fetch('/api/service-types'),
      fetch('/api/services')
    ]);

    const typesResult = await typesResponse.json();
    const servicesResult = await servicesResponse.json();

    if (typesResult.success && servicesResult.success) {
      serviceTypes = typesResult.data;
      allServices = servicesResult.data;

      // Organize services by type in memory for instant lookup
      servicesByType = {};
      allServices.forEach(service => {
        const typeName = service.category;
        if (!servicesByType[typeName]) {
          servicesByType[typeName] = [];
        }
        servicesByType[typeName].push(service);
      });

      // Populate service type dropdown when modal opens
      populateServiceTypeDropdown();
    } else {
      console.error('Failed to load service data');
    }
  } catch (error) {
    console.error('Error preloading service data:', error);
  }
}

// Populate service type dropdown
function populateServiceTypeDropdown() {
  const serviceSelect = document.getElementById('serviceType');
  if (serviceSelect && serviceTypes.length > 0) {
    serviceSelect.innerHTML = '<option value="">--Select Service Type--</option>';
    serviceTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type.service_type_name;
      option.textContent = type.service_type_name;
      serviceSelect.appendChild(option);
    });
    serviceSelect.disabled = false;
  }
}

// Preload technician data
async function preloadTechnicianData() {
  try {
    const response = await fetch('/api/employees');
    const result = await response.json();

    if (result.success) {
      allTechnicians = result.data;
      populateTechnicianDropdown();
    } else {
      console.error('Failed to load technician data:', result.error);
    }
  } catch (error) {
    console.error('Error preloading technician data:', error);
  }
}

// Populate technician dropdown (all technicians)
function populateTechnicianDropdown() {
  const technicianSelect = document.getElementById('assignedTechnician');
  const adminNote = document.getElementById('adminTechnicianNote');

  if (technicianSelect && allTechnicians.length > 0) {
    technicianSelect.innerHTML = '<option value="">--Select Technician--</option>';
    allTechnicians.forEach(technician => {
      const option = document.createElement('option');
      option.value = technician.employee_id;
      const fullName = `${technician.first_name} ${technician.last_name}`;
      const specialties = technician.specialties ? ` (${technician.specialties.join(', ')})` : '';
      option.textContent = fullName + specialties;
      technicianSelect.appendChild(option);
    });
  }

  // Hide admin note when showing all technicians
  if (adminNote) {
    adminNote.style.display = 'none';
  }
}

// Populate technician dropdown with qualified technicians (admin mode - no availability check)
async function populateQualifiedTechniciansDropdown(serviceTypeName) {
  const technicianSelect = document.getElementById('assignedTechnician');
  const adminNote = document.getElementById('adminTechnicianNote');

  if (!technicianSelect) {
    return;
  }

  // Show loading state
  technicianSelect.innerHTML = '<option value="">Loading qualified technicians...</option>';

  try {
    // Use admin API endpoint to get ALL qualified technicians (no availability check)
    const response = await fetch(`/api/admin/qualified-employees/${encodeURIComponent(serviceTypeName)}`);
    const result = await response.json();

    if (result.success && result.data) {
      // Clear and repopulate dropdown
      technicianSelect.innerHTML = '<option value="">--Select Technician--</option>';

      if (result.data.length > 0) {
        result.data.forEach(technician => {
          const option = document.createElement('option');
          option.value = technician.employee_id;
          const fullName = `${technician.first_name} ${technician.last_name}`;
          const specialties = technician.specialties ? ` (${technician.specialties.join(', ')})` : '';
          option.textContent = fullName + specialties;
          technicianSelect.appendChild(option);
        });

        // Show admin note
        if (adminNote) {
          adminNote.style.display = 'block';
          adminNote.textContent = `Admin Mode: ${result.data.length} qualified technicians (availability not checked)`;
        }
      } else {
        // If no qualified technicians, show a message
        const option = document.createElement('option');
        option.value = '';
        option.textContent = `No technicians qualified for ${serviceTypeName}`;
        option.disabled = true;
        technicianSelect.appendChild(option);

        if (adminNote) {
          adminNote.style.display = 'block';
          adminNote.textContent = `No technicians found with required specialties for ${serviceTypeName}`;
        }
      }
    } else {
      // Error handling
      technicianSelect.innerHTML = '<option value="">Error loading technicians</option>';
      if (adminNote) {
        adminNote.style.display = 'block';
        adminNote.textContent = `Error loading technicians: ${result.error || 'Unknown error'}`;
      }
    }
  } catch (error) {
    console.error('Error fetching qualified technicians:', error);
    technicianSelect.innerHTML = '<option value="">Error loading technicians</option>';
    if (adminNote) {
      adminNote.style.display = 'block';
      adminNote.textContent = 'Network error loading technicians';
    }
  }
}

// Setup event listeners for service type and job type
function setupServiceTypeEventListeners() {
  // Service type change handler
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'serviceType') {
      const serviceTypeName = e.target.value;
      const jobSelect = document.getElementById('jobType');
      const serviceIdInput = document.getElementById('serviceId');

      // Reset job dropdown and hide cost estimate
      jobSelect.innerHTML = '<option value="">--Select Job Type--</option>';
      jobSelect.disabled = true;
      serviceIdInput.value = '';
      hideCostEstimateInModal();

      if (!serviceTypeName) {
        // Reset technician dropdown to show all technicians when no service type is selected
        populateTechnicianDropdown();
        // Hide admin note
        const adminNote = document.getElementById('adminTechnicianNote');
        if (adminNote) {
          adminNote.style.display = 'none';
        }
        return;
      }

      // Get services from cached data
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

      // Filter technicians based on selected service type
      populateQualifiedTechniciansDropdown(serviceTypeName);
    }
  });

  // Job type change handler
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'jobType') {
      const serviceIdInput = document.getElementById('serviceId');
      const serviceId = e.target.value;
      serviceIdInput.value = serviceId;

      // Fetch and display cost estimate
      if (serviceId) {
        fetchAndDisplayCostInModal(serviceId);
      } else {
        hideCostEstimateInModal();
      }
    }
  });
}

// Fetch and display cost estimate in modal
async function fetchAndDisplayCostInModal(serviceId) {
  try {
    const costEstimate = document.getElementById('costEstimate');
    const costBreakdown = document.getElementById('costBreakdown');
    const totalCost = document.getElementById('totalCost');

    // Show cost estimate section
    costEstimate.style.display = 'block';
    costBreakdown.innerHTML = '<div style="color: #6c757d;">Calculating cost...</div>';
    totalCost.innerHTML = '';

    // Fetch cost data from API
    const response = await fetch(`/api/services/${serviceId}/cost`);
    const result = await response.json();

    if (result.success && result.data) {
      const cost = result.data;

      // Display cost breakdown similar to appointmentForm
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
      throw new Error('Failed to fetch cost data');
    }
  } catch (error) {
    console.error('Error fetching cost estimate:', error);
    const costBreakdown = document.getElementById('costBreakdown');
    costBreakdown.innerHTML = '<div style="color: #dc3545;">Unable to load cost estimate</div>';
  }
}

// Hide cost estimate in modal
function hideCostEstimateInModal() {
  const costEstimate = document.getElementById('costEstimate');

  if (costEstimate) {
    costEstimate.style.display = 'none';
  }
}

// Image modal functionality
function openImageModal(imageUrl) {
  // Create modal if it doesn't exist
  let imageModal = document.getElementById('imageModal');
  if (!imageModal) {
    imageModal = document.createElement('div');
    imageModal.id = 'imageModal';
    imageModal.className = 'image-modal';
    imageModal.innerHTML = `
      <div class="image-modal-content">
        <span class="close-image-modal" onclick="closeImageModal()">&times;</span>
        <img id="modalImage" src="" alt="Service Request Image">
        <div class="image-modal-caption">Service Request Image</div>
      </div>
    `;
    document.body.appendChild(imageModal);

    // Close modal when clicking outside the image
    imageModal.addEventListener('click', function (e) {
      if (e.target === imageModal) {
        closeImageModal();
      }
    });
  }

  // Set the image source and show modal
  document.getElementById('modalImage').src = imageUrl;
  imageModal.style.display = 'block';
}

function closeImageModal() {
  const imageModal = document.getElementById('imageModal');
  if (imageModal) {
    imageModal.style.display = 'none';
  }
}