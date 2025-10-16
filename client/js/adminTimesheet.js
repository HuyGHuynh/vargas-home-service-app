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

// Sample availability data for biweekly period
let availabilityData = [
    // Week 1 - Michael Thompson
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
    },
    {
        id: 2,
        technicianId: 1,
        technicianName: "Michael Thompson",
        date: "2025-10-21",
        startTime: "09:00",
        endTime: "17:00",
        status: "available"
    },
    {
        id: 3,
        technicianId: 1,
        technicianName: "Michael Thompson",
        date: "2025-10-22",
        startTime: "13:00",
        endTime: "17:00",
        status: "assigned",
        workOrderId: "WO-2025-102",
        customer: "Sarah Johnson",
        service: "Plumbing Installation"
    },
    {
        id: 4,
        technicianId: 1,
        technicianName: "Michael Thompson",
        date: "2025-10-23",
        startTime: "09:00",
        endTime: "17:00",
        status: "available"
    },
    {
        id: 5,
        technicianId: 1,
        technicianName: "Michael Thompson",
        date: "2025-10-24",
        startTime: "09:00",
        endTime: "17:00",
        status: "available"
    },

    // Week 2 - Michael Thompson
    {
        id: 6,
        technicianId: 1,
        technicianName: "Michael Thompson",
        date: "2025-10-27",
        startTime: "09:00",
        endTime: "12:00",
        status: "assigned",
        workOrderId: "WO-2025-110",
        customer: "David Chen",
        service: "Electrical Inspection"
    },
    {
        id: 7,
        technicianId: 1,
        technicianName: "Michael Thompson",
        date: "2025-10-28",
        startTime: "09:00",
        endTime: "17:00",
        status: "available"
    },
    {
        id: 8,
        technicianId: 1,
        technicianName: "Michael Thompson",
        date: "2025-10-29",
        startTime: "09:00",
        endTime: "17:00",
        status: "available"
    },

    // Week 1 - Sarah Martinez
    {
        id: 9,
        technicianId: 2,
        technicianName: "Sarah Martinez",
        date: "2025-10-20",
        startTime: "08:00",
        endTime: "16:00",
        status: "available"
    },
    {
        id: 10,
        technicianId: 2,
        technicianName: "Sarah Martinez",
        date: "2025-10-21",
        startTime: "08:00",
        endTime: "16:00",
        status: "assigned",
        workOrderId: "WO-2025-105",
        customer: "Emily Davis",
        service: "Interior Painting"
    },
    {
        id: 11,
        technicianId: 2,
        technicianName: "Sarah Martinez",
        date: "2025-10-22",
        startTime: "08:00",
        endTime: "16:00",
        status: "assigned",
        workOrderId: "WO-2025-105",
        customer: "Emily Davis",
        service: "Interior Painting"
    },
    {
        id: 12,
        technicianId: 2,
        technicianName: "Sarah Martinez",
        date: "2025-10-23",
        startTime: "08:00",
        endTime: "16:00",
        status: "available"
    },
    {
        id: 13,
        technicianId: 2,
        technicianName: "Sarah Martinez",
        date: "2025-10-24",
        startTime: "08:00",
        endTime: "16:00",
        status: "available"
    },

    // Week 2 - Sarah Martinez
    {
        id: 14,
        technicianId: 2,
        technicianName: "Sarah Martinez",
        date: "2025-10-27",
        startTime: "08:00",
        endTime: "16:00",
        status: "available"
    },
    {
        id: 15,
        technicianId: 2,
        technicianName: "Sarah Martinez",
        date: "2025-10-28",
        startTime: "08:00",
        endTime: "16:00",
        status: "assigned",
        workOrderId: "WO-2025-112",
        customer: "Robert Lee",
        service: "Deck Repair"
    },
    {
        id: 16,
        technicianId: 2,
        technicianName: "Sarah Martinez",
        date: "2025-10-29",
        startTime: "08:00",
        endTime: "12:00",
        status: "unavailable",
        unavailableType: "Personal Day",
        reason: "Doctor's appointment"
    },
    {
        id: 17,
        technicianId: 2,
        technicianName: "Sarah Martinez",
        date: "2025-10-30",
        startTime: "08:00",
        endTime: "16:00",
        status: "available"
    },

    // Week 1 - Jessica Williams
    {
        id: 18,
        technicianId: 3,
        technicianName: "Jessica Williams",
        date: "2025-10-20",
        startTime: "10:00",
        endTime: "18:00",
        status: "assigned",
        workOrderId: "WO-2025-108",
        customer: "Patricia Wilson",
        service: "Bathroom Renovation"
    },
    {
        id: 19,
        technicianId: 3,
        technicianName: "Jessica Williams",
        date: "2025-10-21",
        startTime: "10:00",
        endTime: "18:00",
        status: "available"
    },
    {
        id: 20,
        technicianId: 3,
        technicianName: "Jessica Williams",
        date: "2025-10-22",
        startTime: "10:00",
        endTime: "18:00",
        status: "available"
    },
    {
        id: 21,
        technicianId: 3,
        technicianName: "Jessica Williams",
        date: "2025-10-23",
        startTime: "10:00",
        endTime: "18:00",
        status: "assigned",
        workOrderId: "WO-2025-109",
        customer: "Mark Anderson",
        service: "HVAC Installation"
    },
    {
        id: 22,
        technicianId: 3,
        technicianName: "Jessica Williams",
        date: "2025-10-24",
        startTime: "10:00",
        endTime: "18:00",
        status: "available"
    },

    // Week 2 - Jessica Williams
    {
        id: 23,
        technicianId: 3,
        technicianName: "Jessica Williams",
        date: "2025-10-27",
        startTime: "10:00",
        endTime: "18:00",
        status: "available"
    },
    {
        id: 24,
        technicianId: 3,
        technicianName: "Jessica Williams",
        date: "2025-10-28",
        startTime: "10:00",
        endTime: "18:00",
        status: "available"
    },
    {
        id: 25,
        technicianId: 3,
        technicianName: "Jessica Williams",
        date: "2025-10-29",
        startTime: "10:00",
        endTime: "18:00",
        status: "available"
    },
    {
        id: 26,
        technicianId: 3,
        technicianName: "Jessica Williams",
        date: "2025-10-30",
        startTime: "10:00",
        endTime: "18:00",
        status: "assigned",
        workOrderId: "WO-2025-115",
        customer: "Linda Martinez",
        service: "Kitchen Plumbing"
    },

    // Robert Johnson - On Leave entire period
    {
        id: 27,
        technicianId: 4,
        technicianName: "Robert Johnson",
        date: "2025-10-20",
        startTime: "09:00",
        endTime: "17:00",
        status: "unavailable",
        unavailableType: "Sick Leave",
        reason: "Medical leave"
    },
    {
        id: 28,
        technicianId: 4,
        technicianName: "Robert Johnson",
        date: "2025-10-21",
        startTime: "09:00",
        endTime: "17:00",
        status: "unavailable",
        unavailableType: "Sick Leave",
        reason: "Medical leave"
    },
    {
        id: 29,
        technicianId: 4,
        technicianName: "Robert Johnson",
        date: "2025-10-22",
        startTime: "09:00",
        endTime: "17:00",
        status: "unavailable",
        unavailableType: "Sick Leave",
        reason: "Medical leave"
    },
    {
        id: 30,
        technicianId: 4,
        technicianName: "Robert Johnson",
        date: "2025-10-23",
        startTime: "09:00",
        endTime: "17:00",
        status: "unavailable",
        unavailableType: "Sick Leave",
        reason: "Medical leave"
    },
    {
        id: 31,
        technicianId: 4,
        technicianName: "Robert Johnson",
        date: "2025-10-24",
        startTime: "09:00",
        endTime: "17:00",
        status: "unavailable",
        unavailableType: "Sick Leave",
        reason: "Medical leave"
    }
];

let calendar;
let currentFilter = { technician: 'all', status: 'all' };

// Initialize calendar on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    updatePeriodDisplay();
    populateTechnicianFilter();
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
        eventClick: function(info) {
            showAvailabilityDetails(info.event);
        },
        eventContent: function(arg) {
            return {
                html: `<div style="padding: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <strong>${arg.event.title}</strong><br>
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
    
    // Convert to FullCalendar events
    return filteredData.map(item => ({
        id: item.id,
        title: item.technicianName,
        start: `${item.date}T${item.startTime}`,
        end: `${item.date}T${item.endTime}`,
        classNames: [item.status],
        extendedProps: {
            technicianId: item.technicianId,
            status: item.status,
            timeRange: `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,
            workOrderId: item.workOrderId,
            customer: item.customer,
            service: item.service,
            unavailableType: item.unavailableType,
            reason: item.reason
        }
    }));
}

// Format time to 12-hour format
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
function changePeriod(direction) {
    currentPeriodStart.setDate(currentPeriodStart.getDate() + (direction * 14));
    updatePeriodDisplay();
    
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
    
    technicians.forEach(tech => {
        const option = document.createElement('option');
        option.value = tech.id;
        option.textContent = `${tech.name} (${tech.role})`;
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
        calendar.removeAllEvents();
        calendar.addEventSource(getFilteredEvents());
    }
}

// Refresh entire timesheet
function refreshTimesheet() {
    currentFilter = { technician: 'all', status: 'all' };
    document.getElementById('technicianFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    
    refreshCalendarEvents();
    // updateSummaryCards(); // Removed - summary cards no longer displayed
    showNotification('Timesheet refreshed successfully!');
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
    document.getElementById('modalTechName').textContent = event.title;
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
    
    if (props.status === 'assigned') {
        jobSection.style.display = 'block';
        unavailableSection.style.display = 'none';
        
        document.getElementById('modalWorkOrder').textContent = props.workOrderId || '-';
        document.getElementById('modalCustomer').textContent = props.customer || '-';
        document.getElementById('modalService').textContent = props.service || '-';
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
