// Database warranty data
let warranties = [];

let currentFilter = 'all';
let currentWarrantyId = null;

// Load warranties on page load
document.addEventListener('DOMContentLoaded', function () {
    loadWarranties();
});

// Load warranties from database
async function loadWarranties() {
    try {
        showLoadingState();

        // First update expired warranties
        await updateExpiredWarranties();

        const response = await fetch('/api/admin/warranties');
        const result = await response.json();

        if (result.success) {
            // Transform database data to match UI expectations
            warranties = result.data.map(warranty => ({
                id: warranty.warranty_id,
                customerId: warranty.customer?.customerid,
                customerName: `${warranty.customer?.first_name || ''} ${warranty.customer?.last_name || ''}`.trim(),
                customerEmail: warranty.customer?.email || 'No email',
                customerPhone: warranty.customer?.phone || 'No phone',
                serviceName: warranty.service?.job_name || 'Unknown Service',
                serviceType: warranty.service?.service_type || 'Unknown Type',
                workOrderId: `SR-${warranty.service_request?.request_id || 'N/A'}`,
                startDate: warranty.start_date,
                endDate: warranty.end_date,
                description: warranty.warranty_description || 'No description',
                price: warranty.warranty_price || 0,
                status: warranty.warranty_status?.toLowerCase() || 'pending',
                servicePrice: warranty.service?.service_price || 0,
                duration: warranty.service?.duration_hours || 0,
                serviceRequest: null, // Service requests handled separately
                isExpired: isWarrantyExpired(warranty.end_date)
            }));

            displayWarranties(currentFilter);
        } else {
            showErrorState(result.error || 'Failed to load warranties');
        }
    } catch (error) {
        console.error('Error loading warranties:', error);
        showErrorState('Network error loading warranties');
    }
}

// Update expired warranties
async function updateExpiredWarranties() {
    try {
        await fetch('/api/admin/warranties/update-expired', {
            method: 'POST'
        });
    } catch (error) {
        console.error('Error updating expired warranties:', error);
    }
}

// Check if warranty is expired
function isWarrantyExpired(endDate) {
    if (!endDate) return false;
    const today = new Date();
    const warrantyEnd = new Date(endDate);
    return warrantyEnd < today;
}

// Show loading state
function showLoadingState() {
    const grid = document.getElementById('warrantyGrid');
    grid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <h3>Loading Warranties...</h3>
            <p>Please wait while we fetch warranty data</p>
        </div>
    `;
}

// Show error state
function showErrorState(message) {
    const grid = document.getElementById('warrantyGrid');
    grid.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Error Loading Warranties</h3>
            <p>${message}</p>
            <button onclick="loadWarranties()" class="retry-btn">Retry</button>
        </div>
    `;
}

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

        // Determine actions based on warranty status
        let actionsHtml = `<button class="view-btn" onclick="viewWarrantyDetails(${warranty.id})">View Details</button>`;

        if (warranty.status === 'pending') {
            actionsHtml += `
                <button class="accept-btn" onclick="showAcceptConfirmationForCard(${warranty.id})">Accept</button>
                <button class="reject-btn" onclick="showRejectConfirmationForCard(${warranty.id})">Reject</button>
            `;
        }
        // Active and Inactive warranties only show View Details button

        return `
            <div class="warranty-card ${warranty.status}">
                <div class="warranty-header">
                    <div class="warranty-title">
                        <h3>${warranty.customerName}</h3>
                        <div class="warranty-service-type">${warranty.serviceType}</div>
                    </div>
                    <div class="warranty-status-container">
                        <span class="warranty-status ${warranty.status}">${warranty.status}</span>
                        ${hasRequest ? '<span class="warranty-request-badge">Service Request</span>' : ''}
                        ${warranty.isExpired ? '<span class="expired-badge">Expired</span>' : ''}
                    </div>
                </div>
                
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
                        <span class="warranty-info-label">Warranty Price:</span>
                        <span class="warranty-info-value">$${warranty.price.toFixed(2)}</span>
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
                    ${actionsHtml}
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
                <div class="detail-value">${formatDate(warranty.endDate)} ${warranty.isExpired ? '(EXPIRED)' : ''}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Pricing Details</h3>
            <div class="detail-row">
                <div class="detail-label">Service Price:</div>
                <div class="detail-value">$${warranty.servicePrice?.toFixed(2) || '0.00'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Warranty Price:</div>
                <div class="detail-value">$${warranty.price?.toFixed(2) || '0.00'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Duration:</div>
                <div class="detail-value">${warranty.duration || 0} hours</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Description</h3>
            <div class="detail-row">
                <div class="detail-label">Warranty Description:</div>
                <div class="detail-value">${warranty.description || 'No description available'}</div>
            </div>
        </div>
    `;

    document.getElementById('warrantyDetails').innerHTML = detailsHtml;

    // Update modal action buttons based on warranty status
    const acceptBtn = document.getElementById('acceptBtn');
    const rejectBtn = document.getElementById('rejectBtn');

    if (warranty.status === 'pending') {
        acceptBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'inline-block';
        acceptBtn.textContent = 'Accept Request';
        rejectBtn.textContent = 'Reject';
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

// Update warranty status
async function updateWarrantyStatus(warrantyId, newStatus) {
    if (!newStatus) return;

    const warranty = warranties.find(w => w.id === warrantyId);
    if (!warranty) return;

    if (confirm(`Change warranty status to ${newStatus} for ${warranty.customerName}?`)) {
        try {
            const response = await fetch(`/api/admin/warranties/${warrantyId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();

            if (result.success) {
                warranty.status = newStatus.toLowerCase();
                displayWarranties(currentFilter);
                showNotification(`Warranty status updated to ${newStatus}!`, 'success');
            } else {
                showNotification(`Failed to update status: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error updating warranty status:', error);
            showNotification('Network error updating status', 'error');
        }
    }
}

// Delete warranty
async function deleteWarranty(warrantyId) {
    const warranty = warranties.find(w => w.id === warrantyId);
    if (!warranty) return;

    if (confirm(`Are you sure you want to delete the warranty for ${warranty.customerName}?\n\nThis action cannot be undone.`)) {
        try {
            const response = await fetch(`/api/admin/warranties/${warrantyId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                // Remove from local array
                warranties = warranties.filter(w => w.id !== warrantyId);
                displayWarranties(currentFilter);
                showNotification('Warranty deleted successfully!', 'success');
            } else {
                showNotification(`Failed to delete warranty: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting warranty:', error);
            showNotification('Network error deleting warranty', 'error');
        }
    }
}

// Accept warranty (change status from Pending to Active)
async function acceptWarranty(warrantyId) {
    const warranty = warranties.find(w => w.id === warrantyId);
    if (!warranty) return;

    try {
        const response = await fetch(`/api/admin/warranties/${warrantyId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Active' })
        });

        const result = await response.json();

        if (result.success) {
            warranty.status = 'active';
            displayWarranties(currentFilter);
            showNotification(`Warranty accepted and activated for ${warranty.customerName}!`, 'success');
            if (document.getElementById('warrantyModal').style.display === 'block') {
                closeWarrantyModal();
            }
        } else {
            showNotification(`Failed to accept warranty: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error accepting warranty:', error);
        showNotification('Network error accepting warranty', 'error');
    }
}

// Reject warranty (delete warranty)
async function rejectWarranty(warrantyId) {
    const warranty = warranties.find(w => w.id === warrantyId);
    if (!warranty) return;

    try {
        const response = await fetch(`/api/admin/warranties/${warrantyId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            // Remove from local array
            warranties = warranties.filter(w => w.id !== warrantyId);
            displayWarranties(currentFilter);
            showNotification(`Warranty rejected and deleted for ${warranty.customerName}!`, 'success');
            if (document.getElementById('warrantyModal').style.display === 'block') {
                closeWarrantyModal();
            }
        } else {
            showNotification(`Failed to reject warranty: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error rejecting warranty:', error);
        showNotification('Network error rejecting warranty', 'error');
    }
}

// Show accept confirmation for card buttons
function showAcceptConfirmationForCard(warrantyId) {
    currentWarrantyId = warrantyId;
    showAcceptConfirmation();
}

// Show reject confirmation for card buttons
function showRejectConfirmationForCard(warrantyId) {
    currentWarrantyId = warrantyId;
    showRejectConfirmation();
}

// Show accept confirmation
function showAcceptConfirmation() {
    const warranty = warranties.find(w => w.id === currentWarrantyId);
    if (!warranty) return;

    document.getElementById('confirmationTitle').textContent = 'Accept Warranty';
    document.getElementById('confirmationMessage').innerHTML = `
        <div class="confirmation-details">
            <div class="confirmation-icon accept-icon">✓</div>
            <p><strong>Accept warranty for ${warranty.customerName}?</strong></p>
            <p>This will change the warranty status from <span class="status-badge pending">Pending</span> to <span class="status-badge active">Active</span>.</p>
            <div class="warranty-summary">
                <div class="summary-item">
                    <span class="summary-label">Service:</span>
                    <span class="summary-value">${warranty.serviceName}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Work Order:</span>
                    <span class="summary-value">${warranty.workOrderId}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Warranty Price:</span>
                    <span class="summary-value">$${warranty.price.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    const confirmBtn = document.getElementById('confirmActionBtn');
    confirmBtn.textContent = 'Accept Warranty';
    confirmBtn.className = 'accept-btn';
    confirmBtn.onclick = () => {
        acceptWarranty(currentWarrantyId);
        closeConfirmationModal();
    };

    document.getElementById('confirmationModal').style.display = 'block';
}

// Show reject confirmation
function showRejectConfirmation() {
    const warranty = warranties.find(w => w.id === currentWarrantyId);
    if (!warranty) return;

    document.getElementById('confirmationTitle').textContent = 'Reject Warranty';
    document.getElementById('confirmationMessage').innerHTML = `
        <div class="confirmation-details">
            <div class="confirmation-icon reject-icon">⚠️</div>
            <p><strong>Reject and delete warranty for ${warranty.customerName}?</strong></p>
            <p class="warning-text">This action will permanently delete the warranty and cannot be undone.</p>
            <div class="warranty-summary">
                <div class="summary-item">
                    <span class="summary-label">Service:</span>
                    <span class="summary-value">${warranty.serviceName}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Work Order:</span>
                    <span class="summary-value">${warranty.workOrderId}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Warranty Price:</span>
                    <span class="summary-value">$${warranty.price.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    const confirmBtn = document.getElementById('confirmActionBtn');
    confirmBtn.textContent = 'Delete Warranty';
    confirmBtn.className = 'reject-btn';
    confirmBtn.onclick = () => {
        rejectWarranty(currentWarrantyId);
        closeConfirmationModal();
    };

    document.getElementById('confirmationModal').style.display = 'block';
}

// Close modals
function closeWarrantyModal() {
    document.getElementById('warrantyModal').style.display = 'none';
    currentWarrantyId = null;
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

function closeServiceRequestModal() {
    document.getElementById('serviceRequestModal').style.display = 'none';
    currentWarrantyId = null;
}

// Close modal when clicking outside
window.onclick = function (event) {
    const warrantyModal = document.getElementById('warrantyModal');
    const serviceModal = document.getElementById('serviceRequestModal');
    const confirmationModal = document.getElementById('confirmationModal');

    if (event.target === warrantyModal) {
        closeWarrantyModal();
    } else if (event.target === serviceModal) {
        closeServiceRequestModal();
    } else if (event.target === confirmationModal) {
        closeConfirmationModal();
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

// Add animation and admin styles
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
    
    .loading-state, .error-state {
        text-align: center;
        padding: 40px;
        grid-column: 1 / -1;
    }
    
    .loading-spinner {
        border: 4px solid #f3f3f3;
        border-radius: 50%;
        border-top: 4px solid #2c5282;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .status-select {
        background: #2c5282;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        margin: 0 5px;
    }
    
    .delete-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        margin: 0 5px;
    }
    
    .delete-btn:hover {
        background: #c82333;
    }
    
    .status-control-section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }
    
    .status-controls {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .status-select-modal {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
    }
    
    .update-status-btn {
        background: #2c5282;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .update-status-btn:hover {
        background: #1e3a5f;
    }
    
    .retry-btn {
        background: #2c5282;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 10px;
    }
    
    .confirmation-modal {
        max-width: 500px;
    }
    
    .confirmation-details {
        text-align: center;
        padding: 20px 0;
    }
    
    .confirmation-icon {
        font-size: 3rem;
        margin-bottom: 20px;
    }
    
    .accept-icon {
        color: #4caf50;
    }
    
    .reject-icon {
        color: #f44336;
    }
    
    .confirmation-message p {
        margin: 10px 0;
        font-size: 1rem;
    }
    
    .warning-text {
        color: #f44336;
        font-weight: 600;
    }
    
    .warranty-summary {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        margin: 20px 0;
        text-align: left;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 0.9rem;
    }
    
    .summary-label {
        color: #666;
        font-weight: 500;
    }
    
    .summary-value {
        color: #333;
        font-weight: 600;
    }
    
    .status-badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-badge.pending {
        background-color: #fff3e0;
        color: #f57c00;
    }
    
    .status-badge.active {
        background-color: #e8f5e9;
        color: #2e7d32;
    }
    
    .confirm-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
`;
document.head.appendChild(style);
