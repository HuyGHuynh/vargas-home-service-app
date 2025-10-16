// Warranty Form Handling
document.getElementById('warrantyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const messageDiv = document.getElementById('warrantyMessage');
    const warrantyResultsDiv = document.getElementById('warrantyResults');
    
    // Check if at least one field is filled
    if (!email && !phone) {
        messageDiv.className = 'error';
        messageDiv.textContent = 'Please enter either an email address or phone number.';
        warrantyResultsDiv.innerHTML = '';
        return;
    }
    
    // Prepare the data to send
    const warrantyData = {};
    if (email) warrantyData.email = email;
    if (phone) warrantyData.phone = phone;
    
    // Show loading message
    messageDiv.className = 'success';
    messageDiv.textContent = 'Looking up your warranty information...';
    warrantyResultsDiv.innerHTML = '';
    
    // HARDCODED SAMPLE DATA FOR TESTING
    // Simulate a delay to mimic API call
    setTimeout(() => {
        // Sample warranty data
        const sampleData = {
            warranties: [
                {
                    id: 1,
                    serviceName: 'Kitchen Remodel',
                    serviceType: 'Remodeling',
                    workOrderId: 'WO-2024-001',
                    startDate: '2024-06-15',
                    endDate: '2026-06-15',
                    coverage: '2-year warranty covering all workmanship and materials for kitchen cabinets, countertops, and plumbing fixtures.',
                    notes: 'Includes free annual inspection'
                },
                {
                    id: 2,
                    serviceName: 'Bathroom Plumbing Repair',
                    serviceType: 'Plumbing',
                    workOrderId: 'WO-2024-045',
                    startDate: '2024-09-20',
                    endDate: '2025-09-20',
                    coverage: '1-year warranty on all plumbing work including pipe replacement and fixture installation.',
                    notes: 'Emergency service available 24/7'
                },
                {
                    id: 3,
                    serviceName: 'Electrical Panel Upgrade',
                    serviceType: 'Electrical',
                    workOrderId: 'WO-2023-112',
                    startDate: '2023-03-10',
                    endDate: '2025-03-10',
                    coverage: '2-year warranty on electrical panel and all wiring upgrades.',
                    notes: 'Passed county inspection'
                },
                {
                    id: 4,
                    serviceName: 'Deck Installation',
                    serviceType: 'Outdoor Projects',
                    workOrderId: 'WO-2022-089',
                    startDate: '2022-07-01',
                    endDate: '2024-07-01',
                    coverage: '2-year warranty on deck materials and construction.',
                    notes: 'Warranty expired - contact for renewal options'
                }
            ]
        };
        
        displayWarranties(sampleData.warranties);
        messageDiv.style.display = 'none';
    }, 1000);
    
    /* UNCOMMENT THIS SECTION TO USE REAL BACKEND API
    try {
        // Send request to backend
        const response = await fetch('/api/warranty/lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(warrantyData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch warranty information');
        }
        
        const data = await response.json();
        
        // Display warranty information
        displayWarranties(data.warranties);
        messageDiv.style.display = 'none';
        
    } catch (error) {
        console.error('Error:', error);
        messageDiv.className = 'error';
        messageDiv.textContent = 'Error looking up warranty. Please try again later.';
        warrantyResultsDiv.innerHTML = '';
    }
    */
});

// Function to display warranty information
function displayWarranties(warranties) {
    const warrantyResultsDiv = document.getElementById('warrantyResults');
    
    if (!warranties || warranties.length === 0) {
        warrantyResultsDiv.innerHTML = `
            <div class="no-warranties">
                <p>No warranties found for this email/phone number.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="warranties-container"><h3>Your Warranties</h3><div class="warranty-grid">';
    
    warranties.forEach((warranty, index) => {
        const startDate = new Date(warranty.startDate).toLocaleDateString();
        const endDate = new Date(warranty.endDate).toLocaleDateString();
        const isActive = new Date(warranty.endDate) > new Date();
        
        html += `
            <div class="warranty-card ${isActive ? 'active' : 'expired'}">
                <div class="warranty-header">
                    <h4>${warranty.serviceName || 'Service Warranty'}</h4>
                    <span class="status-badge ${isActive ? 'active' : 'expired'}">
                        ${isActive ? 'Active' : 'Expired'}
                    </span>
                </div>
                <div class="warranty-details">
                    <p><strong>Service Type:</strong> ${warranty.serviceType || 'N/A'}</p>
                    <p><strong>Work Order #:</strong> ${warranty.workOrderId || 'N/A'}</p>
                    <p><strong>Start Date:</strong> ${startDate}</p>
                    <p><strong>End Date:</strong> ${endDate}</p>
                    <p><strong>Coverage:</strong> ${warranty.coverage || 'Standard warranty coverage'}</p>
                    ${warranty.notes ? `<p><strong>Notes:</strong> ${warranty.notes}</p>` : ''}
                </div>
                ${isActive ? `
                    <div class="warranty-actions">
                        <button class="action-btn email-btn" onclick="requestWarrantyDetails('${warranty.id}', '${warranty.workOrderId}')">
                            <span class="btn-icon">📧</span> Email Warranty Details
                        </button>
                        <button class="action-btn help-btn" onclick="requestWarrantyHelp('${warranty.id}', '${warranty.workOrderId}')">
                            <span class="btn-icon">🔧</span> Request Warranty Service
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    html += '</div></div>';
    warrantyResultsDiv.innerHTML = html;
}

// Function to request warranty details via email
function requestWarrantyDetails(warrantyId, workOrderId) {
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // Show confirmation message
    const confirmed = confirm(`Send warranty details for Work Order #${workOrderId} to your email?`);
    
    if (!confirmed) return;
    
    // Prepare request data
    const requestData = {
        warrantyId: warrantyId,
        workOrderId: workOrderId,
        email: email,
        phone: phone,
        requestType: 'details'
    };
    
    console.log('Requesting warranty details:', requestData);
    
    // Show success message
    showNotification('Warranty details will be sent to your email shortly!', 'success');
    
    // TODO: Send actual API request
    /*
    fetch('/api/warranty/request-details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Warranty details sent to your email!', 'success');
    })
    .catch(error => {
        showNotification('Failed to send warranty details. Please try again.', 'error');
    });
    */
}

// Function to request warranty service/help
function requestWarrantyHelp(warrantyId, workOrderId) {
    // Store warranty info in modal
    document.getElementById('modalWarrantyId').value = warrantyId;
    document.getElementById('modalWorkOrderId').value = workOrderId;
    
    // Show modal
    document.getElementById('serviceRequestModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Function to close service request modal
function closeServiceModal() {
    document.getElementById('serviceRequestModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    document.getElementById('serviceRequestForm').reset();
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('serviceRequestModal');
    if (event.target === modal) {
        closeServiceModal();
    }
}

// Handle service request form submission
document.addEventListener('DOMContentLoaded', function() {
    const serviceForm = document.getElementById('serviceRequestForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const warrantyId = document.getElementById('modalWarrantyId').value;
            const workOrderId = document.getElementById('modalWorkOrderId').value;
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            
            // Get form data
            const requestData = {
                warrantyId: warrantyId,
                workOrderId: workOrderId,
                email: email,
                phone: phone,
                issueType: document.getElementById('issueType').value,
                urgency: document.getElementById('urgency').value,
                problemDescription: document.getElementById('problemDescription').value,
                requestType: 'service'
            };
            
            console.log('Submitting service request:', requestData);
            
            // Close modal
            closeServiceModal();
            
            // Show success message
            showNotification('Service request submitted! We will contact you within 24 hours.', 'success');
            
            // TODO: Send actual API request
            /*
            try {
                const response = await fetch('/api/warranty/request-service', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    closeServiceModal();
                    showNotification('Service request submitted successfully!', 'success');
                } else {
                    showNotification('Failed to submit request. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Failed to submit request. Please try again.', 'error');
            }
            */
        });
    }
});

// Function to show notification messages
function showNotification(message, type) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification ${type}`;
    notificationDiv.textContent = message;
    
    document.body.appendChild(notificationDiv);
    
    // Show notification
    setTimeout(() => {
        notificationDiv.classList.add('show');
    }, 100);
    
    // Hide and remove notification after 4 seconds
    setTimeout(() => {
        notificationDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notificationDiv);
        }, 300);
    }, 4000);
}

// Clear error message when user starts typing
document.getElementById('email').addEventListener('input', clearMessage);
document.getElementById('phone').addEventListener('input', clearMessage);

function clearMessage() {
    const messageDiv = document.getElementById('warrantyMessage');
    if (messageDiv.className === 'error') {
        messageDiv.style.display = 'none';
    }
}
