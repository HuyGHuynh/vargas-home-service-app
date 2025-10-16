// Sample hardcoded warranty data including customer requests
let warranties = [
    {
        id: 1,
        customerId: 101,
        customerName: "John Smith",
        customerEmail: "john.smith@email.com",
        customerPhone: "(555) 123-4567",
        serviceName: "HVAC Installation",
        serviceType: "Heating & Cooling",
        workOrderId: "WO-2024-001",
        startDate: "2024-06-15",
        endDate: "2026-06-15",
        coverage: "Full system coverage including parts and labor",
        status: "active",
        notes: "2-year warranty on new HVAC system installation",
        serviceRequest: {
            issueType: "Repair",
            urgency: "High",
            description: "AC unit not cooling properly. Making strange noises.",
            requestDate: "2025-10-10"
        }
    },
    {
        id: 2,
        customerId: 102,
        customerName: "Sarah Johnson",
        customerEmail: "sarah.j@email.com",
        customerPhone: "(555) 234-5678",
        serviceName: "Kitchen Remodel",
        serviceType: "Carpentry & Installation",
        workOrderId: "WO-2024-015",
        startDate: "2025-03-20",
        endDate: "2026-03-20",
        coverage: "Cabinets, countertops, and installation workmanship",
        status: "pending",
        notes: "Pending customer approval for warranty terms",
        serviceRequest: null
    },
    {
        id: 3,
        customerId: 103,
        customerName: "Michael Brown",
        customerEmail: "m.brown@email.com",
        customerPhone: "(555) 345-6789",
        serviceName: "Roof Repair",
        serviceType: "Roofing",
        workOrderId: "WO-2023-087",
        startDate: "2023-09-10",
        endDate: "2025-09-10",
        coverage: "5-year warranty on materials and workmanship",
        status: "active",
        notes: "Comprehensive roof repair with extended warranty",
        serviceRequest: null
    },
    {
        id: 4,
        customerId: 104,
        customerName: "Emily Davis",
        customerEmail: "emily.davis@email.com",
        customerPhone: "(555) 456-7890",
        serviceName: "Plumbing System Upgrade",
        serviceType: "Plumbing",
        workOrderId: "WO-2024-032",
        startDate: "2024-11-05",
        endDate: "2026-11-05",
        coverage: "All pipes, fixtures, and installation labor",
        status: "active",
        notes: "Complete bathroom plumbing replacement",
        serviceRequest: {
            issueType: "Maintenance",
            urgency: "Low",
            description: "Routine inspection needed before warranty expires. Want to ensure everything is working properly.",
            requestDate: "2025-10-12"
        }
    },
    {
        id: 5,
        customerId: 105,
        customerName: "Robert Wilson",
        customerEmail: "r.wilson@email.com",
        customerPhone: "(555) 567-8901",
        serviceName: "Electrical Panel Upgrade",
        serviceType: "Electrical",
        workOrderId: "WO-2023-045",
        startDate: "2023-05-15",
        endDate: "2025-05-15",
        coverage: "Panel, wiring, and installation",
        status: "expired",
        notes: "Warranty period has ended",
        serviceRequest: null
    },
    {
        id: 6,
        customerId: 106,
        customerName: "Jennifer Martinez",
        customerEmail: "jen.martinez@email.com",
        customerPhone: "(555) 678-9012",
        serviceName: "Water Heater Installation",
        serviceType: "Plumbing",
        workOrderId: "WO-2024-078",
        startDate: "2025-08-22",
        endDate: "2027-08-22",
        coverage: "Complete unit and installation warranty",
        status: "pending",
        notes: "Customer requesting warranty activation",
        serviceRequest: null
    },
    {
        id: 7,
        customerId: 107,
        customerName: "David Anderson",
        customerEmail: "d.anderson@email.com",
        customerPhone: "(555) 789-0123",
        serviceName: "Deck Construction",
        serviceType: "Carpentry",
        workOrderId: "WO-2024-055",
        startDate: "2024-07-10",
        endDate: "2027-07-10",
        coverage: "3-year structural warranty",
        status: "active",
        notes: "Outdoor deck with weather-resistant materials",
        serviceRequest: {
            issueType: "Repair",
            urgency: "Medium",
            description: "Some boards are starting to warp. Need inspection and possible replacement under warranty.",
            requestDate: "2025-10-14"
        }
    }
];

let currentFilter = 'all';
let currentWarrantyId = null;

// Load warranties on page load
document.addEventListener('DOMContentLoaded', function() {
    displayWarranties('all');
});

// Filter warranties by status
function filterWarranties(status) {
    currentFilter = status;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayWarranties(status);
}

// Display warranties based on filter
function displayWarranties(filter) {
    const grid = document.getElementById('warrantyGrid');
    let filteredWarranties = warranties;
    
    if (filter !== 'all') {
        filteredWarranties = warranties.filter(w => w.status === filter);
    }
    
    if (filteredWarranties.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No Warranties Found</h3>
                <p>No warranties match the current filter.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredWarranties.map(warranty => {
        const hasRequest = warranty.serviceRequest !== null;
        
        return `
            <div class="warranty-card ${warranty.status}">
                <span class="warranty-status ${warranty.status}">${warranty.status}</span>
                ${hasRequest ? '<span class="warranty-request-badge">Service Request</span>' : ''}
                <h3>${warranty.customerName}</h3>
                <div class="warranty-service-type">${warranty.serviceType}</div>
                
                <div class="warranty-info">
                    <div class="warranty-info-item">
                        <span class="warranty-info-label">Service:</span>
                        <span class="warranty-info-value">${warranty.serviceName}</span>
                    </div>
                    <div class="warranty-info-item">
                        <span class="warranty-info-label">Work Order:</span>
                        <span class="warranty-info-value">${warranty.workOrderId}</span>
                    </div>
                    <div class="warranty-info-item">
                        <span class="warranty-info-label">Start Date:</span>
                        <span class="warranty-info-value">${formatDate(warranty.startDate)}</span>
                    </div>
                    <div class="warranty-info-item">
                        <span class="warranty-info-label">End Date:</span>
                        <span class="warranty-info-value">${formatDate(warranty.endDate)}</span>
                    </div>
                    <div class="warranty-info-item">
                        <span class="warranty-info-label">Email:</span>
                        <span class="warranty-info-value">${warranty.customerEmail}</span>
                    </div>
                    <div class="warranty-info-item">
                        <span class="warranty-info-label">Phone:</span>
                        <span class="warranty-info-value">${warranty.customerPhone}</span>
                    </div>
                </div>
                
                <div class="warranty-actions">
                    <button class="view-btn" onclick="viewWarrantyDetails(${warranty.id})">View Details</button>
                    ${hasRequest ? `<button class="view-request-btn" onclick="viewServiceRequest(${warranty.id})">View Request</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// View warranty details
function viewWarrantyDetails(id) {
    const warranty = warranties.find(w => w.id === id);
    if (!warranty) return;
    
    currentWarrantyId = id;
    
    const detailsHtml = `
        <div class="detail-section">
            <h3>Customer Information</h3>
            <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${warranty.customerName}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${warranty.customerEmail}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${warranty.customerPhone}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Warranty Information</h3>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value highlight">${warranty.status.toUpperCase()}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Service Name:</div>
                <div class="detail-value">${warranty.serviceName}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Service Type:</div>
                <div class="detail-value">${warranty.serviceType}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Work Order ID:</div>
                <div class="detail-value">${warranty.workOrderId}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Start Date:</div>
                <div class="detail-value">${formatDate(warranty.startDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">End Date:</div>
                <div class="detail-value">${formatDate(warranty.endDate)}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Coverage Details</h3>
            <div class="detail-row">
                <div class="detail-label">Coverage:</div>
                <div class="detail-value">${warranty.coverage}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Notes:</div>
                <div class="detail-value">${warranty.notes}</div>
            </div>
        </div>
    `;
    
    document.getElementById('warrantyDetails').innerHTML = detailsHtml;
    
    // Show/hide accept/reject buttons based on status
    const acceptBtn = document.getElementById('acceptBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    
    if (warranty.status === 'pending') {
        acceptBtn.style.display = 'block';
        rejectBtn.style.display = 'block';
    } else {
        acceptBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
    }
    
    document.getElementById('warrantyModal').style.display = 'block';
}

// View service request details
function viewServiceRequest(id) {
    const warranty = warranties.find(w => w.id === id);
    if (!warranty || !warranty.serviceRequest) return;
    
    currentWarrantyId = id;
    const request = warranty.serviceRequest;
    
    const requestHtml = `
        <div class="detail-section">
            <h3>Customer Information</h3>
            <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${warranty.customerName}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${warranty.customerEmail}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${warranty.customerPhone}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Warranty Details</h3>
            <div class="detail-row">
                <div class="detail-label">Service:</div>
                <div class="detail-value">${warranty.serviceName}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Work Order:</div>
                <div class="detail-value">${warranty.workOrderId}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Coverage:</div>
                <div class="detail-value">${warranty.coverage}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Service Request Details</h3>
            <div class="detail-row">
                <div class="detail-label">Request Date:</div>
                <div class="detail-value">${formatDate(request.requestDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Issue Type:</div>
                <div class="detail-value">${request.issueType}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Urgency:</div>
                <div class="detail-value">
                    <span class="urgency-badge ${request.urgency.toLowerCase()}">${request.urgency}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Description:</div>
                <div class="detail-value">${request.description}</div>
            </div>
        </div>
    `;
    
    document.getElementById('serviceRequestDetails').innerHTML = requestHtml;
    document.getElementById('serviceRequestModal').style.display = 'block';
}

// Accept warranty
function acceptWarranty() {
    const warranty = warranties.find(w => w.id === currentWarrantyId);
    if (!warranty) return;
    
    if (confirm(`Accept warranty for ${warranty.customerName}?`)) {
        warranty.status = 'active';
        warranty.notes = 'Warranty activated by admin';
        
        closeWarrantyModal();
        displayWarranties(currentFilter);
        showNotification('Warranty accepted and activated successfully!', 'success');
        
        // TODO: Send acceptance to backend
        // fetch(`/api/admin/warranty/${currentWarrantyId}/accept`, { method: 'POST' });
    }
}

// Reject warranty
function rejectWarranty() {
    const warranty = warranties.find(w => w.id === currentWarrantyId);
    if (!warranty) return;
    
    const reason = prompt('Enter reason for rejection:');
    if (reason) {
        warranty.status = 'expired';
        warranty.notes = `Rejected: ${reason}`;
        
        closeWarrantyModal();
        displayWarranties(currentFilter);
        showNotification('Warranty request rejected.', 'error');
        
        // TODO: Send rejection to backend
        // fetch(`/api/admin/warranty/${currentWarrantyId}/reject`, {
        //     method: 'POST',
        //     body: JSON.stringify({ reason })
        // });
    }
}

// Schedule service for warranty request
function scheduleService() {
    const warranty = warranties.find(w => w.id === currentWarrantyId);
    if (!warranty) return;
    
    // Remove the service request after scheduling
    warranty.serviceRequest = null;
    
    closeServiceRequestModal();
    displayWarranties(currentFilter);
    showNotification('Service scheduled successfully! Customer will be notified.', 'success');
    
    // TODO: Create work order and schedule service
    // fetch('/api/admin/warranty/schedule-service', {
    //     method: 'POST',
    //     body: JSON.stringify({ warrantyId: currentWarrantyId })
    // });
}

// Close modals
function closeWarrantyModal() {
    document.getElementById('warrantyModal').style.display = 'none';
    currentWarrantyId = null;
}

function closeServiceRequestModal() {
    document.getElementById('serviceRequestModal').style.display = 'none';
    currentWarrantyId = null;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const warrantyModal = document.getElementById('warrantyModal');
    const serviceModal = document.getElementById('serviceRequestModal');
    
    if (event.target === warrantyModal) {
        closeWarrantyModal();
    } else if (event.target === serviceModal) {
        closeServiceRequestModal();
    }
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
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

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
