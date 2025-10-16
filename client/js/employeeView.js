// Simulated logged-in employee data
const currentEmployee = {
    id: 1,
    firstName: "Michael",
    lastName: "Thompson",
    role: "Senior Technician",
    email: "m.thompson@vargas.com"
};

// Sample jobs assigned to this employee
let employeeJobs = [
    {
        id: 1,
        workOrderId: "WO-2025-101",
        title: "HVAC Repair",
        customer: "John Smith",
        customerPhone: "(555) 123-4567",
        customerEmail: "john.smith@email.com",
        address: "123 Oak Street, Springfield, IL",
        date: "2025-10-17",
        startTime: "09:00",
        endTime: "12:00",
        status: "pending",
        description: "AC unit not cooling properly. Customer reports strange noises.",
        estimatedCost: 450.00,
        notes: ""
    },
    {
        id: 2,
        workOrderId: "WO-2025-102",
        title: "Plumbing Installation",
        customer: "Sarah Johnson",
        customerPhone: "(555) 234-5678",
        customerEmail: "sarah.j@email.com",
        address: "456 Pine Avenue, Springfield, IL",
        date: "2025-10-18",
        startTime: "13:00",
        endTime: "17:00",
        status: "in-progress",
        description: "Install new kitchen faucet and garbage disposal.",
        estimatedCost: 650.00,
        notes: "Started installation. Faucet installed, working on disposal."
    },
    {
        id: 3,
        workOrderId: "WO-2025-103",
        title: "Electrical Inspection",
        customer: "Michael Brown",
        customerPhone: "(555) 345-6789",
        customerEmail: "m.brown@email.com",
        address: "789 Maple Drive, Springfield, IL",
        date: "2025-10-19",
        startTime: "10:00",
        endTime: "11:30",
        status: "pending",
        description: "Annual electrical system inspection for home warranty.",
        estimatedCost: 200.00,
        notes: ""
    },
    {
        id: 4,
        workOrderId: "WO-2025-104",
        title: "Water Heater Maintenance",
        customer: "Emily Davis",
        customerPhone: "(555) 456-7890",
        customerEmail: "emily.davis@email.com",
        address: "321 Elm Street, Springfield, IL",
        date: "2025-10-20",
        startTime: "08:00",
        endTime: "10:00",
        status: "pending",
        description: "Routine water heater maintenance and inspection.",
        estimatedCost: 150.00,
        notes: ""
    },
    {
        id: 5,
        workOrderId: "WO-2025-105",
        title: "HVAC System Upgrade",
        customer: "Robert Wilson",
        customerPhone: "(555) 567-8901",
        customerEmail: "r.wilson@email.com",
        address: "654 Cedar Lane, Springfield, IL",
        date: "2025-10-15",
        startTime: "09:00",
        endTime: "16:00",
        status: "completed",
        description: "Complete HVAC system upgrade with new thermostat.",
        estimatedCost: 3500.00,
        notes: "Completed installation. System tested and running perfectly. Customer satisfied."
    },
    {
        id: 6,
        workOrderId: "WO-2025-106",
        title: "Emergency Plumbing Repair",
        customer: "Jennifer Martinez",
        customerPhone: "(555) 678-9012",
        customerEmail: "jen.martinez@email.com",
        address: "987 Birch Road, Springfield, IL",
        date: "2025-10-14",
        startTime: "14:00",
        endTime: "16:00",
        status: "completed",
        description: "Emergency call - burst pipe in basement.",
        estimatedCost: 850.00,
        notes: "Fixed burst pipe. Replaced damaged section. Tested for leaks. All clear."
    }
];

let calendar;
let currentJobId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set employee name and role
    document.getElementById('employeeName').textContent = `${currentEmployee.firstName} ${currentEmployee.lastName}`;
    document.getElementById('employeeRole').textContent = currentEmployee.role;
    
    // Update stats
    updateStats();
    
    // Initialize calendar
    initializeCalendar();
});

// Update statistics cards
function updateStats() {
    const pending = employeeJobs.filter(job => job.status === 'pending').length;
    const inProgress = employeeJobs.filter(job => job.status === 'in-progress').length;
    const completed = employeeJobs.filter(job => job.status === 'completed').length;
    
    // Calculate hours this week
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    const hoursThisWeek = employeeJobs.filter(job => {
        const jobDate = new Date(job.date);
        return jobDate >= weekStart && jobDate <= weekEnd;
    }).reduce((total, job) => {
        const start = new Date(`2000-01-01 ${job.startTime}`);
        const end = new Date(`2000-01-01 ${job.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        return total + hours;
    }, 0);
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('hoursCount').textContent = hoursThisWeek.toFixed(1);
}

// Initialize FullCalendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    // Convert jobs to calendar events
    const events = employeeJobs.map(job => ({
        id: job.id,
        title: job.title,
        start: `${job.date}T${job.startTime}`,
        end: `${job.date}T${job.endTime}`,
        extendedProps: {
            workOrderId: job.workOrderId,
            customer: job.customer,
            status: job.status
        },
        className: job.status
    }));
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: events,
        eventClick: function(info) {
            const jobId = parseInt(info.event.id);
            openJobModal(jobId);
        },
        height: 'auto',
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }
    });
    
    try {
        calendar.render();
    } catch (error) {
        document.getElementById('errorBox').style.display = 'block';
        console.error('Calendar error:', error);
    }
}

// Open job details modal
function openJobModal(jobId) {
    const job = employeeJobs.find(j => j.id === jobId);
    if (!job) return;
    
    currentJobId = jobId;
    
    const detailsHtml = `
        <div class="detail-section">
            <h3>Work Order Information</h3>
            <div class="detail-row">
                <div class="detail-label">Work Order ID:</div>
                <div class="detail-value highlight">${job.workOrderId}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="status-badge ${job.status}">${job.status.replace('-', ' ')}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Service Type:</div>
                <div class="detail-value">${job.title}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${formatDate(job.date)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Time:</div>
                <div class="detail-value">${formatTime(job.startTime)} - ${formatTime(job.endTime)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Estimated Cost:</div>
                <div class="detail-value">$${job.estimatedCost.toFixed(2)}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Customer Information</h3>
            <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${job.customer}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${job.customerPhone}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${job.customerEmail}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Address:</div>
                <div class="detail-value">${job.address}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Job Description</h3>
            <div class="detail-row">
                <div class="detail-value">${job.description}</div>
            </div>
        </div>
        
        ${job.notes ? `
            <div class="detail-section">
                <h3>Previous Notes</h3>
                <div class="detail-row">
                    <div class="detail-value">${job.notes}</div>
                </div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('jobDetails').innerHTML = detailsHtml;
    document.getElementById('workNotes').value = job.notes || '';
    
    // Highlight current status button
    updateStatusButtonHighlight(job.status);
    
    // Show/hide and enable/disable status buttons based on job status
    const statusButtons = document.querySelectorAll('.status-btn');
    const statusSection = document.querySelector('.status-update-section');
    
    if (job.status === 'completed') {
        // Disable all status buttons for completed jobs
        statusButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        statusSection.querySelector('h3').textContent = 'Job Status (Completed - No Changes Allowed)';
    } else {
        // Enable status buttons for non-completed jobs
        statusButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
        statusSection.querySelector('h3').textContent = 'Update Job Status';
    }
    
    // Show/hide cancel button based on job status
    const cancelSection = document.querySelector('.cancel-job-section');
    if (job.status === 'pending' || job.status === 'in-progress') {
        cancelSection.style.display = 'block';
    } else {
        cancelSection.style.display = 'none';
    }
    
    document.getElementById('jobModal').style.display = 'block';
}

// Update status button highlight
function updateStatusButtonHighlight(currentStatus) {
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const statusMap = {
        'pending': 0,
        'in-progress': 1,
        'completed': 2
    };
    
    const buttons = document.querySelectorAll('.status-btn');
    if (buttons[statusMap[currentStatus]]) {
        buttons[statusMap[currentStatus]].classList.add('active');
    }
}

// Update job status
function updateJobStatus(newStatus) {
    if (currentJobId === null) return;
    
    const job = employeeJobs.find(j => j.id === currentJobId);
    if (!job) return;
    
    // Prevent changing status of completed jobs
    if (job.status === 'completed') {
        showNotification('Cannot change status of a completed job', 'error');
        return;
    }
    
    const statusText = newStatus.replace('-', ' ');
    
    if (confirm(`Update job status to "${statusText}"?`)) {
        job.status = newStatus;
        
        // Update calendar event color immediately
        const event = calendar.getEventById(currentJobId);
        if (event) {
            // Remove old status class and add new one
            event.setProp('classNames', [newStatus]);
        }
        
        // Update stats
        updateStats();
        
        // Update modal display
        openJobModal(currentJobId);
        
        showNotification(`Job status updated to ${statusText}!`, 'success');
        
        // TODO: Send status update to backend
        // fetch(`/api/employee/jobs/${currentJobId}/status`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status: newStatus, employeeId: currentEmployee.id })
        // });
    }
}

// Save work notes
function saveWorkNotes() {
    if (currentJobId === null) return;
    
    const job = employeeJobs.find(j => j.id === currentJobId);
    if (!job) return;
    
    const notes = document.getElementById('workNotes').value;
    job.notes = notes;
    
    showNotification('Work notes saved successfully!', 'success');
    
    // TODO: Send notes to backend
    // fetch(`/api/employee/jobs/${currentJobId}/notes`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ notes: notes, employeeId: currentEmployee.id })
    // });
}

// Close modal
function closeJobModal() {
    document.getElementById('jobModal').style.display = 'none';
    currentJobId = null;
}

// Open cancel modal
function openCancelModal() {
    if (currentJobId === null) return;
    
    const job = employeeJobs.find(j => j.id === currentJobId);
    if (!job) return;
    
    // Don't allow canceling completed jobs
    if (job.status === 'completed') {
        showNotification('Cannot cancel a completed job', 'error');
        return;
    }
    
    document.getElementById('cancelModal').style.display = 'block';
}

// Close cancel modal
function closeCancelModal() {
    document.getElementById('cancelModal').style.display = 'none';
    document.getElementById('cancelForm').reset();
}

// Handle cancel form submission
document.getElementById('cancelForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (currentJobId === null) return;
    
    const job = employeeJobs.find(j => j.id === currentJobId);
    if (!job) return;
    
    const reason = document.getElementById('cancelReason').value;
    const description = document.getElementById('cancelDescription').value;
    
    if (!reason || !description.trim()) {
        showNotification('Please provide both reason and description', 'error');
        return;
    }
    
    // Update job status to cancelled
    job.status = 'cancelled';
    job.cancellationReason = reason;
    job.cancellationDescription = description;
    job.cancelledBy = `${currentEmployee.firstName} ${currentEmployee.lastName}`;
    job.cancelledDate = new Date().toISOString();
    
    // Remove event from calendar
    const event = calendar.getEventById(currentJobId);
    if (event) {
        event.remove();
    }
    
    // Update stats
    updateStats();
    
    // Close both modals
    closeCancelModal();
    closeJobModal();
    
    showNotification(`Job ${job.workOrderId} has been cancelled`, 'success');
    
    // TODO: Send cancellation to backend
    // fetch(`/api/employee/jobs/${currentJobId}/cancel`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         reason: reason,
    //         description: description,
    //         employeeId: currentEmployee.id,
    //         cancelledBy: job.cancelledBy
    //     })
    // });
});

// Close modal when clicking outside
window.onclick = function(event) {
    const jobModal = document.getElementById('jobModal');
    const cancelModal = document.getElementById('cancelModal');
    
    if (event.target === jobModal) {
        closeJobModal();
    } else if (event.target === cancelModal) {
        closeCancelModal();
    }
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
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

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== Availability Request Functions =====

// Biweekly calendar state
let availabilityPeriodStart = new Date();
availabilityPeriodStart.setDate(availabilityPeriodStart.getDate() - availabilityPeriodStart.getDay()); // Start from Sunday
availabilityPeriodStart.setHours(0, 0, 0, 0);

let selectedDates = [];
let currentAvailabilityTab = 'time-off';

// Open availability request modal
function openAvailabilityModal() {
    const modal = document.getElementById('availabilityModal');
    modal.style.display = 'block';
    
    // Reset state
    selectedDates = [];
    currentAvailabilityTab = 'time-off';
    
    // Initialize calendar
    renderAvailabilityCalendar();
    updatePeriodDisplay();
}

// Close availability request modal
function closeAvailabilityModal() {
    const modal = document.getElementById('availabilityModal');
    modal.style.display = 'none';
    document.getElementById('availabilityForm').reset();
    selectedDates = [];
    currentAvailabilityTab = 'time-off';
}

// Switch between tabs
function switchAvailabilityTab(tabName) {
    currentAvailabilityTab = tabName;
    
    // Update tab buttons
    const tabs = document.querySelectorAll('.availability-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update sections
    const timeOffSection = document.getElementById('timeOffSection');
    const availableHoursSection = document.getElementById('availableHoursSection');
    
    if (tabName === 'time-off') {
        timeOffSection.classList.add('active');
        availableHoursSection.classList.remove('active');
    } else {
        timeOffSection.classList.remove('active');
        availableHoursSection.classList.add('active');
    }
    
    // Reset selected dates when switching tabs
    selectedDates = [];
    renderAvailabilityCalendar();
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
    const calendar2 = document.getElementById('availabilityCalendar2');
    
    const calendarHTML = generateCalendarHTML();
    
    if (calendar1) calendar1.innerHTML = calendarHTML;
    if (calendar2) calendar2.innerHTML = calendarHTML;
    
    updateSelectedDatesSummary();
}

// Generate calendar HTML
function generateCalendarHTML() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = '';
    
    // Add day headers
    dayHeaders.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });
    
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
                <div class="day-number">${dayNumber}</div>
                <div class="day-label">${dayName}</div>
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
    const count2 = document.getElementById('selectedDatesCount2');
    
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
    if (count2) count2.textContent = summaryText;
}

// Toggle time range section
document.addEventListener('DOMContentLoaded', () => {
    const fullDayCheckbox = document.getElementById('fullDay');
    const timeRangeSection = document.getElementById('timeRangeSection');
    const unavailableStartTime = document.getElementById('unavailableStartTime');
    const unavailableEndTime = document.getElementById('unavailableEndTime');
    
    if (fullDayCheckbox) {
        fullDayCheckbox.addEventListener('change', function() {
            if (this.checked) {
                timeRangeSection.style.display = 'none';
                if (unavailableStartTime) unavailableStartTime.removeAttribute('required');
                if (unavailableEndTime) unavailableEndTime.removeAttribute('required');
            } else {
                timeRangeSection.style.display = 'block';
                if (unavailableStartTime) unavailableStartTime.setAttribute('required', 'required');
                if (unavailableEndTime) unavailableEndTime.setAttribute('required', 'required');
            }
        });
    }
});

// Handle availability form submission
document.addEventListener('DOMContentLoaded', () => {
    const availabilityForm = document.getElementById('availabilityForm');
    
    if (availabilityForm) {
        availabilityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate that dates are selected
            if (selectedDates.length === 0) {
                alert('Please select at least one date on the calendar.');
                return;
            }
            
            let formData;
            
            if (currentAvailabilityTab === 'time-off') {
                // Time off request
                const requestType = document.getElementById('requestType').value;
                const fullDay = document.getElementById('fullDay').checked;
                const reason = document.getElementById('requestReason').value;
                
                if (!requestType) {
                    alert('Please select a request type.');
                    return;
                }
                
                if (!reason.trim()) {
                    alert('Please provide a reason for your request.');
                    return;
                }
                
                formData = {
                    employeeId: currentEmployee.id,
                    employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
                    employeeRole: currentEmployee.role,
                    requestType: requestType,
                    selectedDates: selectedDates,
                    startDate: selectedDates[0],
                    endDate: selectedDates[selectedDates.length - 1],
                    fullDay: fullDay,
                    startTime: fullDay ? null : document.getElementById('unavailableStartTime').value,
                    endTime: fullDay ? null : document.getElementById('unavailableEndTime').value,
                    reason: reason,
                    status: 'pending',
                    requestDate: new Date().toISOString()
                };
                
                // Validate time range if not full day
                if (!fullDay) {
                    if (!formData.startTime || !formData.endTime) {
                        alert('Please specify start and end times.');
                        return;
                    }
                    if (formData.startTime >= formData.endTime) {
                        alert('End time must be after start time.');
                        return;
                    }
                }
            } else {
                // Available hours update
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
                
                formData = {
                    employeeId: currentEmployee.id,
                    employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
                    employeeRole: currentEmployee.role,
                    requestType: 'availability-change',
                    selectedDates: selectedDates,
                    startDate: selectedDates[0],
                    endDate: selectedDates[selectedDates.length - 1],
                    fullDay: true,
                    startTime: availableStartTime,
                    endTime: availableEndTime,
                    reason: notes || 'Updating available work hours for selected dates',
                    status: 'pending',
                    requestDate: new Date().toISOString()
                };
            }
            
            console.log('Availability Request Submitted:', formData);
            
            // TODO: Send to backend API
            // fetch('/api/availability-requests', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showNotification('Request submitted successfully! Admin will review your request.');
            //     closeAvailabilityModal();
            // })
            // .catch(error => {
            //     showNotification('Failed to submit request. Please try again.', 'error');
            // });
            
            // Simulated success
            const requestTypeText = currentAvailabilityTab === 'time-off' ? 'time-off request' : 'availability update';
            showNotification(`Your ${requestTypeText} has been submitted to admin for review!`);
            closeAvailabilityModal();
        });
    }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const availabilityModal = document.getElementById('availabilityModal');
    if (e.target === availabilityModal) {
        closeAvailabilityModal();
    }
});
