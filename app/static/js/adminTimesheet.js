// Current biweekly period start date
let currentPeriodStart = new Date();
currentPeriodStart.setDate(currentPeriodStart.getDate() - currentPeriodStart.getDay()); // Start from Sunday
currentPeriodStart.setHours(0, 0, 0, 0);

// Sample technician data (matching from adminEmployee.js)
const technicians = [
    {
        id: 1,
        name: "Michael Thompson",
        role: "Senior Technician",
        status: "active"
    },
    {
        id: 2,
        name: "Sarah Martinez",
        role: "Technician",
        status: "active"
    },
    {
        id: 3,
        name: "Jessica Williams",
        role: "Technician",
        status: "active"
    },
    {
        id: 4,
        name: "Robert Johnson",
        role: "Senior Technician",
        status: "on-leave"
    }
];

// Sample employee availability requests
/*
let availabilityRequests = [
    {
        id: 1,
        employeeId: 1,
        employeeName: "Michael Thompson",
        employeeRole: "Senior Technician",
        requestType: "time-off",
        startDate: "2025-11-05",
        endDate: "2025-11-08",
        fullDay: true,
        startTime: null,
        endTime: null,
        reason: "Family vacation planned for Thanksgiving week. Need time to travel and spend time with family out of state.",
        status: "pending",
        requestDate: "2025-10-12T10:30:00",
        reviewedBy: null,
        reviewedDate: null
    },
    {
        id: 2,
        employeeId: 2,
        employeeName: "Sarah Martinez",
        employeeRole: "Technician",
        requestType: "personal-day",
        startDate: "2025-10-29",
        endDate: "2025-10-29",
        fullDay: false,
        startTime: "08:00",
        endTime: "12:00",
        reason: "Doctor's appointment in the morning. Should be back by early afternoon.",
        status: "pending",
        requestDate: "2025-10-14T14:20:00",
        reviewedBy: null,
        reviewedDate: null
    },
    {
        id: 3,
        employeeId: 3,
        employeeName: "Jessica Williams",
        employeeRole: "Technician",
        requestType: "availability-change",
        startDate: "2025-10-25",
        endDate: "2025-10-25",
        fullDay: true,
        startTime: null,
        endTime: null,
        reason: "Need to attend a professional certification training course. Will be unavailable for the entire day.",
        status: "pending",
        requestDate: "2025-10-13T09:15:00",
        reviewedBy: null,
        reviewedDate: null
    },
    {
        id: 4,
        employeeId: 1,
        employeeName: "Michael Thompson",
        employeeRole: "Senior Technician",
        requestType: "sick-leave",
        startDate: "2025-10-18",
        endDate: "2025-10-18",
        fullDay: true,
        startTime: null,
        endTime: null,
        reason: "Not feeling well, need to rest and recover.",
        status: "approved",
        requestDate: "2025-10-17T07:30:00",
        reviewedBy: "Admin",
        reviewedDate: "2025-10-17T08:00:00"
    },
    {
        id: 5,
        employeeId: 2,
        employeeName: "Sarah Martinez",
        employeeRole: "Technician",
        requestType: "time-off",
        startDate: "2025-11-15",
        endDate: "2025-11-17",
        fullDay: true,
        startTime: null,
        endTime: null,
        reason: "Weekend getaway with family. Requesting Friday off.",
        status: "pending",
        requestDate: "2025-10-15T16:45:00",
        reviewedBy: null,
        reviewedDate: null
    }
];
*/

// Employee availability data - loaded from API
let availabilityData = [];

// Load availability data from API
async function loadAvailabilityData() {
    try {
        // Calculate date range for current biweekly period
        const startDate = formatDateForAPI(currentPeriodStart);
        const endDate = new Date(currentPeriodStart);
        endDate.setDate(endDate.getDate() + 13); // 14 days total
        const endDateFormatted = formatDateForAPI(endDate);

        const response = await fetch(`/api/employees/availability?start_date=${startDate}&end_date=${endDateFormatted}`);
        const result = await response.json();

        if (result.success) {
            // Group multiple assignments by employee + date + time
            const groupedAssignments = {};

            result.data.forEach(item => {
                const key = `${item.employee_id}_${item.availdate}_${item.starttime}_${item.endtime}`;

                if (!groupedAssignments[key]) {
                    groupedAssignments[key] = {
                        id: item.availability_id,
                        technicianId: item.employee_id,
                        technicianName: item.employee_name,
                        date: item.availdate,
                        startTime: item.starttime,
                        endTime: item.endtime,
                        status: item.status,
                        employee_email: item.employee_email,
                        employee_phone: item.employee_phone,
                        assignments: []
                    };
                }

                // Add work assignment if it exists
                if (item.work_assignment) {
                    groupedAssignments[key].assignments.push({
                        workOrderId: `SR-${item.work_assignment.request_id}`,
                        customer: item.work_assignment.customer_name,
                        service: item.work_assignment.service_name,
                        requestId: item.work_assignment.request_id
                    });
                    // Update status to assigned if there are assignments
                    groupedAssignments[key].status = 'assigned';
                }
            });

            // Convert back to array format
            availabilityData = Object.values(groupedAssignments);

            // Update technician filter dropdown first
            populateTechnicianFilter();

            // Refresh calendar with new data
            if (calendar) {
                calendar.removeAllEventSources();
                calendar.addEventSource(getFilteredEvents());
            }
        } else {
            console.error('Failed to load availability data:', result.message);
            availabilityData = []; // Fallback to empty array
        }
    } catch (error) {
        console.error('Error loading availability data:', error);
        availabilityData = []; // Fallback to empty array
    }
}

// Helper function to format date for API
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Sample commented out for reference - now using real data
/*
{
        id: 1,
        technicianId: 1,
        technicianName: "Michael Thompson",
        date: "2025-10-20",
        startTime: "09:00",
        endTime: "17:00",
        status: "assigned",
        workOrderId: "WO-2025-101",
        customer: "John Smith",
        service: "HVAC Repair"
*/

let calendar;
let currentFilter = { technician: 'all', status: 'all' };

// Initialize calendar on page load
document.addEventListener('DOMContentLoaded', async function () {
    initializeCalendar();
    updatePeriodDisplay();

    // Load real availability data from API
    await loadAvailabilityData();

    // updateSummaryCards(); // Removed - summary cards no longer displayed
    // displayAvailabilityRequests(); // Removed - availability requests section removed
});

// Initialize FullCalendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');

    const periodEnd = new Date(currentPeriodStart);
    periodEnd.setDate(periodEnd.getDate() + 13); // 14 days (biweekly)

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridTwoWeek',
        views: {
            dayGridTwoWeek: {
                type: 'dayGrid',
                duration: { weeks: 2 }
            }
        },
        initialDate: currentPeriodStart,
        validRange: {
            start: currentPeriodStart,
            end: periodEnd
        },
        headerToolbar: {
            left: '',
            center: '',
            right: ''
        },
        height: 'auto',
        events: getFilteredEvents(),
        eventClick: function (info) {
            showAvailabilityDetails(info.event);
        },
        eventContent: function (arg) {
            const status = arg.event.extendedProps.status;
            const statusIcon = getStatusIcon(status);
            const statusClass = `status-${status}`;
            const assignmentCount = arg.event.extendedProps.assignmentCount || 0;

            let title = arg.event.title;
            if (assignmentCount > 1) {
                title += ` (${assignmentCount} jobs)`;
            } else if (assignmentCount === 1) {
                title += ` (1 job)`;
            }

            return {
                html: `<div class="event-content ${statusClass}" style="padding: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <span class="status-icon">${statusIcon}</span>
                        <strong>${title}</strong><br>
                        <small>${arg.event.extendedProps.timeRange}</small>
                       </div>`
            };
        }
    });

    calendar.render();
}

// Get filtered events based on current filters
function getFilteredEvents() {
    let filteredData = availabilityData;

    // Filter out unavailable/time-off entries
    filteredData = filteredData.filter(item => item.status !== 'unavailable');

    // Filter by technician
    if (currentFilter.technician !== 'all') {
        filteredData = filteredData.filter(item =>
            item.technicianId === parseInt(currentFilter.technician)
        );
    }

    // Filter by status
    if (currentFilter.status !== 'all') {
        filteredData = filteredData.filter(item =>
            item.status === currentFilter.status
        );
    }

    // Group overlapping availabilities for better display
    const groupedData = groupOverlappingAvailabilities(filteredData);

    // Convert to FullCalendar events
    return groupedData.map(item => ({
        id: item.id,
        title: item.title || item.technicianName,
        start: `${item.date}T${item.startTime}`,
        end: `${item.date}T${item.endTime}`,
        classNames: [item.status, `priority-${getPriorityClass(item.status)}`],
        extendedProps: {
            technicianId: item.technicianId,
            status: item.status,
            timeRange: `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,
            assignments: item.assignments || [],
            assignmentCount: item.assignments ? item.assignments.length : 0,
            // Legacy single assignment support
            workOrderId: item.assignments?.[0]?.workOrderId,
            customer: item.assignments?.[0]?.customer,
            service: item.assignments?.[0]?.service,
            unavailableType: item.unavailableType,
            reason: item.reason,
            employeeCount: item.employeeCount || 1,
            isGrouped: item.isGrouped || false
        }
    }));
}

// Group overlapping availabilities to reduce visual clutter
function groupOverlappingAvailabilities(data) {
    // Data is already grouped by employee+time in loadAvailabilityData
    // This function can be used for additional visual grouping if needed
    return data;
}

// Get priority class for event ordering (assigned events should appear first)
function getPriorityClass(status) {
    switch (status) {
        case 'assigned': return '1';
        case 'available': return '2';
        case 'unavailable': return '3';
        default: return '4';
    }
}// Format time to 12-hour format
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Get status icon for visual indication
function getStatusIcon(status) {
    switch (status) {
        case 'available':
            return '✓'; // Green checkmark
        case 'assigned':
            return '📋'; // Clipboard icon
        case 'unavailable':
            return '❌'; // Red X
        default:
            return '●'; // Default dot
    }
}

// Update period display
function updatePeriodDisplay() {
    const periodEnd = new Date(currentPeriodStart);
    periodEnd.setDate(periodEnd.getDate() + 13);

    const startStr = currentPeriodStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const endStr = periodEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    document.getElementById('currentPeriod').textContent = `${startStr} - ${endStr}`;
}

// Change period (previous/next)
async function changePeriod(direction) {
    currentPeriodStart.setDate(currentPeriodStart.getDate() + (direction * 14));
    updatePeriodDisplay();

    // Reload availability data for new period
    await loadAvailabilityData();

    // Update calendar
    if (calendar) {
        const periodEnd = new Date(currentPeriodStart);
        periodEnd.setDate(periodEnd.getDate() + 13);

        calendar.setOption('validRange', {
            start: currentPeriodStart,
            end: periodEnd
        });
        calendar.gotoDate(currentPeriodStart);
        calendar.refetchEvents();
    }
}

// Populate technician filter dropdown
function populateTechnicianFilter() {
    const select = document.getElementById('technicianFilter');

    // Clear existing options (except "All Technicians")
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Get unique technicians from availability data
    const uniqueTechnicians = [];
    const seenIds = new Set();

    availabilityData.forEach(item => {
        if (!seenIds.has(item.technicianId)) {
            seenIds.add(item.technicianId);
            uniqueTechnicians.push({
                id: item.technicianId,
                name: item.technicianName
            });
        }
    });

    // Sort by name
    uniqueTechnicians.sort((a, b) => a.name.localeCompare(b.name));

    // Add to dropdown
    uniqueTechnicians.forEach(tech => {
        const option = document.createElement('option');
        option.value = tech.id;
        option.textContent = tech.name;
        select.appendChild(option);
    });
}

// Filter by technician
function filterByTechnician() {
    currentFilter.technician = document.getElementById('technicianFilter').value;
    refreshCalendarEvents();
    // updateSummaryCards(); // Removed - summary cards no longer displayed
}

// Filter by status
function filterByStatus() {
    currentFilter.status = document.getElementById('statusFilter').value;
    refreshCalendarEvents();
    // updateSummaryCards(); // Removed - summary cards no longer displayed
}

// Refresh calendar events
function refreshCalendarEvents() {
    if (calendar) {
        calendar.removeAllEventSources();
        calendar.addEventSource(getFilteredEvents());
    }
}

// Refresh entire timesheet
async function refreshTimesheet() {
    currentFilter = { technician: 'all', status: 'all' };
    document.getElementById('technicianFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';

    // Reload availability data from API
    await loadAvailabilityData();

    refreshCalendarEvents();
    // updateSummaryCards(); // Removed - summary cards no longer displayed
    showNotification('Timesheet refreshed with latest data!');
}

// Update summary cards - FUNCTION DISABLED (summary cards removed from UI)
/*
function updateSummaryCards() {
    let filteredData = availabilityData;
    
    // Apply filters
    if (currentFilter.technician !== 'all') {
        filteredData = filteredData.filter(item => 
            item.technicianId === parseInt(currentFilter.technician)
        );
    }
    if (currentFilter.status !== 'all') {
        filteredData = filteredData.filter(item => 
            item.status === currentFilter.status
        );
    }
    
    // Calculate hours for each status
    let availableHours = 0;
    let assignedHours = 0;
    let unavailableHours = 0;
    
    filteredData.forEach(item => {
        const hours = calculateHours(item.startTime, item.endTime);
        
        if (item.status === 'available') {
            availableHours += hours;
        } else if (item.status === 'assigned') {
            assignedHours += hours;
        } else if (item.status === 'unavailable') {
            unavailableHours += hours;
        }
    });
    
    // Count unique technicians in filtered data
    const uniqueTechs = new Set(filteredData.map(item => item.technicianId));
    
    // Update display - Elements no longer exist in UI
    // document.getElementById('availableHours').textContent = availableHours;
    // document.getElementById('assignedHours').textContent = assignedHours;
    // document.getElementById('unavailableHours').textContent = unavailableHours;
    // document.getElementById('totalTechs').textContent = uniqueTechs.size;
}
*/

// Calculate hours between two times
function calculateHours(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return Math.round((endMinutes - startMinutes) / 60);
}

// Show availability details modal
function showAvailabilityDetails(event) {
    const modal = document.getElementById('availabilityModal');
    const props = event.extendedProps;

    // Set basic info
    document.getElementById('modalTechName').textContent = event.title.replace(/ \(\d+ jobs?\)/, ''); // Remove job count from title
    document.getElementById('modalDate').textContent = event.start.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('modalTime').textContent = props.timeRange;

    // Set status badge
    const statusBadge = document.getElementById('modalStatus');
    statusBadge.textContent = props.status;
    statusBadge.className = `detail-value status-badge ${props.status}`;

    // Show/hide sections based on status
    const jobSection = document.getElementById('jobDetailsSection');
    const unavailableSection = document.getElementById('unavailableDetailsSection');

    if (props.status === 'assigned' && props.assignments && props.assignments.length > 0) {
        jobSection.style.display = 'block';
        unavailableSection.style.display = 'none';

        // Handle multiple assignments
        if (props.assignments.length > 1) {
            // Create multiple assignment display
            let assignmentsHTML = '<div class="multiple-assignments">';
            assignmentsHTML += `<h4>Multiple Assignments (${props.assignments.length})</h4>`;
            assignmentsHTML += '<div class="assignments-list">';

            props.assignments.forEach((assignment, index) => {
                assignmentsHTML += `
                    <div class="assignment-item">
                        <div class="assignment-header">Assignment ${index + 1}</div>
                        <div class="assignment-details">
                            <div><strong>Work Order:</strong> ${assignment.workOrderId}</div>
                            <div><strong>Customer:</strong> ${assignment.customer}</div>
                            <div><strong>Service:</strong> ${assignment.service}</div>
                        </div>
                    </div>
                `;
            });

            assignmentsHTML += '</div></div>';

            // Replace single job details with multiple assignments
            jobSection.innerHTML = assignmentsHTML;
        } else {
            // Single assignment - use original layout
            if (!jobSection.querySelector('.job-details-original')) {
                jobSection.innerHTML = `
                    <div class="job-details-original">
                        <div class="detail-row">
                            <span class="detail-label">Work Order:</span>
                            <span class="detail-value" id="modalWorkOrder"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Customer:</span>
                            <span class="detail-value" id="modalCustomer"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Service:</span>
                            <span class="detail-value" id="modalService"></span>
                        </div>
                    </div>
                `;
            }

            document.getElementById('modalWorkOrder').textContent = props.assignments[0].workOrderId || '-';
            document.getElementById('modalCustomer').textContent = props.assignments[0].customer || '-';
            document.getElementById('modalService').textContent = props.assignments[0].service || '-';
        }
    } else if (props.status === 'unavailable') {
        jobSection.style.display = 'none';
        unavailableSection.style.display = 'block';

        document.getElementById('modalUnavailableType').textContent = props.unavailableType || '-';
        document.getElementById('modalUnavailableReason').textContent = props.reason || '-';
    } else {
        jobSection.style.display = 'none';
        unavailableSection.style.display = 'none';
    }

    modal.style.display = 'block';
}

// Close availability modal
function closeAvailabilityModal() {
    const modal = document.getElementById('availabilityModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('availabilityModal');
    if (e.target === modal) {
        closeAvailabilityModal();
    }
});

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

// ===== Availability Requests Management - REMOVED =====

/*
// Display availability requests - REMOVED
function displayAvailabilityRequests() {
    const requestsContainer = document.getElementById('availabilityRequests');
    const pendingRequests = availabilityRequests.filter(req => req.status === 'pending');
    
    // Update pending count
    document.getElementById('pendingRequestsCount').textContent = pendingRequests.length;
    
    if (pendingRequests.length === 0) {
        requestsContainer.innerHTML = `
            <div class="no-requests">
                <div class="no-requests-icon">✅</div>
                <p>No pending availability requests at this time.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    pendingRequests.forEach(request => {
        const startDate = new Date(request.startDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const endDate = new Date(request.endDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const requestedDate = new Date(request.requestDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const isSameDay = request.startDate === request.endDate;
        const dateRange = isSameDay ? startDate : `${startDate} - ${endDate}`;
        
        const timeRange = request.fullDay 
            ? 'Full Day' 
            : `${formatTime(request.startTime)} - ${formatTime(request.endTime)}`;
        
        const requestTypeLabel = {
            'time-off': 'Time Off / Vacation',
            'sick-leave': 'Sick Leave',
            'personal-day': 'Personal Day',
            'availability-change': 'Availability Change',
            'other': 'Other'
        }[request.requestType] || request.requestType;
        
        html += `
            <div class="request-card ${request.status}" data-request-id="${request.id}">
                <div class="request-header-section">
                    <div class="request-employee">
                        <h4>${request.employeeName}</h4>
                        <span class="employee-role">${request.employeeRole}</span>
                    </div>
                    <span class="request-status-badge ${request.status}">${request.status}</span>
                </div>
                
                <div class="request-details">
                    <div class="request-detail-row">
                        <span class="request-label">Request Type:</span>
                        <span class="request-value">${requestTypeLabel}</span>
                    </div>
                    <div class="request-detail-row">
                        <span class="request-label">Date(s):</span>
                        <span class="request-value">${dateRange}</span>
                    </div>
                    <div class="request-detail-row">
                        <span class="request-label">Time:</span>
                        <span class="request-value">${timeRange}</span>
                    </div>
                    <div class="request-detail-row">
                        <span class="request-label">Requested On:</span>
                        <span class="request-value">${requestedDate}</span>
                    </div>
                </div>
                
                <div class="request-reason">
                    <strong>Reason:</strong>
                    <p>${request.reason}</p>
                </div>
                
                <div class="request-actions">
                    <button class="approve-btn" onclick="approveRequest(${request.id})">
                        ✅ Approve
                    </button>
                    <button class="reject-btn" onclick="rejectRequest(${request.id})">
                        ❌ Reject
                    </button>
                </div>
            </div>
        `;
    });
    
    requestsContainer.innerHTML = html;
}

// Approve availability request
function approveRequest(requestId) {
    const request = availabilityRequests.find(req => req.id === requestId);
    
    if (!request) {
        showNotification('Request not found', 'error');
        return;
    }
    
    const confirmed = confirm(
        `Approve ${request.employeeName}'s ${request.requestType} request from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}?`
    );
    
    if (!confirmed) return;
    
    // Update request status
    request.status = 'approved';
    request.reviewedBy = 'Admin';
    request.reviewedDate = new Date().toISOString();
    
    // Add unavailable periods to availability data
    addUnavailablePeriod(request);
    
    // Refresh displays
    displayAvailabilityRequests();
    refreshCalendarEvents();
    // updateSummaryCards(); // Removed - summary cards no longer displayed
    
    showNotification(`${request.employeeName}'s request has been approved!`, 'success');
    
    // TODO: Send to backend API
    // fetch('/api/availability-requests/approve', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ requestId: requestId, reviewedBy: 'Admin' })
    // })
}

// Reject availability request
function rejectRequest(requestId) {
    const request = availabilityRequests.find(req => req.id === requestId);
    
    if (!request) {
        showNotification('Request not found', 'error');
        return;
    }
    
    const reason = prompt(
        `Reject ${request.employeeName}'s ${request.requestType} request?\n\nOptional: Enter reason for rejection:`
    );
    
    if (reason === null) return; // User cancelled
    
    // Update request status
    request.status = 'rejected';
    request.reviewedBy = 'Admin';
    request.reviewedDate = new Date().toISOString();
    request.rejectionReason = reason || 'No reason provided';
    
    // Refresh display
    displayAvailabilityRequests();
    
    showNotification(`${request.employeeName}'s request has been rejected`, 'success');
    
    // TODO: Send to backend API
    // fetch('/api/availability-requests/reject', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ 
    //         requestId: requestId, 
    //         reviewedBy: 'Admin',
    //         reason: reason 
    //     })
    // })
}
*/

/*
// Add unavailable period to availability data after approval - REMOVED
function addUnavailablePeriod(request) {
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    // Generate unavailable entries for each day in the range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        
        // Check if there's already an entry for this date
        const existingIndex = availabilityData.findIndex(
            item => item.technicianId === request.employeeId && item.date === dateStr
        );
        
        // Create new unavailable entry
        const newEntry = {
            id: availabilityData.length + 1,
            technicianId: request.employeeId,
            technicianName: request.employeeName,
            date: dateStr,
            startTime: request.fullDay ? "09:00" : request.startTime,
            endTime: request.fullDay ? "17:00" : request.endTime,
            status: "unavailable",
            unavailableType: request.requestType,
            reason: request.reason
        };
        
        if (existingIndex >= 0) {
            // Replace existing entry
            availabilityData[existingIndex] = newEntry;
        } else {
            // Add new entry
            availabilityData.push(newEntry);
        }
    }
}
*/
