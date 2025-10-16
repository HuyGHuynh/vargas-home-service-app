// Work Order Form Handling
document.getElementById('workOrderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const messageDiv = document.getElementById('workOrderMessage');
    const workOrderResultsDiv = document.getElementById('workOrderResults');
    
    // Check if at least one field is filled
    if (!email && !phone) {
        messageDiv.className = 'error';
        messageDiv.textContent = 'Please enter either an email address or phone number.';
        workOrderResultsDiv.innerHTML = '';
        return;
    }
    
    // Prepare the data to send
    const workOrderData = {};
    if (email) workOrderData.email = email;
    if (phone) workOrderData.phone = phone;
    
    // Show loading message
    messageDiv.className = 'success';
    messageDiv.textContent = 'Looking up your work orders...';
    workOrderResultsDiv.innerHTML = '';
    
    // HARDCODED SAMPLE DATA FOR TESTING
    // Simulate a delay to mimic API call
    setTimeout(() => {
        // Sample work order data
        const sampleData = {
            workOrders: [
                {
                    id: 1,
                    workOrderId: 'WO-2024-156',
                    serviceType: 'Plumbing',
                    description: 'Kitchen sink repair and faucet replacement',
                    status: 'completed',
                    createdDate: '2024-08-15',
                    completedDate: '2024-08-18',
                    estimatedCost: '$450',
                    actualCost: '$425',
                    technician: 'John Smith'
                },
                {
                    id: 2,
                    workOrderId: 'WO-2024-189',
                    serviceType: 'Electrical',
                    description: 'Living room light fixture installation',
                    status: 'in-progress',
                    createdDate: '2024-10-10',
                    scheduledDate: '2024-10-16',
                    estimatedCost: '$320',
                    technician: 'Mike Johnson'
                },
                {
                    id: 3,
                    workOrderId: 'WO-2024-203',
                    serviceType: 'HVAC',
                    description: 'Annual AC maintenance and filter replacement',
                    status: 'pending',
                    createdDate: '2024-10-14',
                    scheduledDate: '2024-10-20',
                    estimatedCost: '$150',
                    technician: 'Not assigned yet'
                },
                {
                    id: 4,
                    workOrderId: 'WO-2024-098',
                    serviceType: 'General Repair',
                    description: 'Drywall repair in bedroom',
                    status: 'cancelled',
                    createdDate: '2024-06-05',
                    cancelledDate: '2024-06-07',
                    estimatedCost: '$200',
                    cancellationReason: 'Customer requested cancellation'
                }
            ]
        };
        
        displayWorkOrders(sampleData.workOrders);
        messageDiv.style.display = 'none';
    }, 1000);
    
    /* UNCOMMENT THIS SECTION TO USE REAL BACKEND API
    try {
        // Send request to backend
        const response = await fetch('/api/workorder/lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workOrderData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch work orders');
        }
        
        const data = await response.json();
        
        // Display work orders
        displayWorkOrders(data.workOrders);
        messageDiv.style.display = 'none';
        
    } catch (error) {
        console.error('Error:', error);
        messageDiv.className = 'error';
        messageDiv.textContent = 'Error looking up work orders. Please try again later.';
        workOrderResultsDiv.innerHTML = '';
    }
    */
});

// Function to display work orders
function displayWorkOrders(workOrders) {
    const workOrderResultsDiv = document.getElementById('workOrderResults');
    
    if (!workOrders || workOrders.length === 0) {
        workOrderResultsDiv.innerHTML = `
            <div class="no-work-orders">
                <p>No work orders found for this email/phone number.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="work-orders-container"><h3>Your Work Orders</h3><div class="work-order-grid">';
    
    workOrders.forEach((order) => {
        const createdDate = new Date(order.createdDate).toLocaleDateString();
        const statusClass = order.status.toLowerCase().replace(' ', '-');
        const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ');
        const isPending = order.status.toLowerCase() === 'pending';
        
        html += `
            <div class="work-order-card ${statusClass}">
                <div class="work-order-header">
                    <h4>Work Order #${order.workOrderId}</h4>
                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </div>
                <div class="work-order-details">
                    <p><strong>Service Type:</strong> ${order.serviceType}</p>
                    <p><strong>Description:</strong> ${order.description}</p>
                    <p><strong>Created Date:</strong> ${createdDate}</p>
                    ${order.scheduledDate ? `<p><strong>Scheduled Date:</strong> ${new Date(order.scheduledDate).toLocaleDateString()}</p>` : ''}
                    ${order.completedDate ? `<p><strong>Completed Date:</strong> ${new Date(order.completedDate).toLocaleDateString()}</p>` : ''}
                    ${order.cancelledDate ? `<p><strong>Cancelled Date:</strong> ${new Date(order.cancelledDate).toLocaleDateString()}</p>` : ''}
                    <p><strong>Estimated Cost:</strong> ${order.estimatedCost}</p>
                    ${order.actualCost ? `<p><strong>Actual Cost:</strong> ${order.actualCost}</p>` : ''}
                    <p><strong>Technician:</strong> ${order.technician}</p>
                    ${order.cancellationReason ? `<p><strong>Cancellation Reason:</strong> ${order.cancellationReason}</p>` : ''}
                </div>
                ${isPending ? `
                    <div class="work-order-actions">
                        <button class="action-btn reschedule-btn" onclick="rescheduleWorkOrder('${order.id}', '${order.workOrderId}')">
                            <span class="btn-icon">📅</span> Reschedule
                        </button>
                        <button class="action-btn cancel-btn" onclick="cancelWorkOrder('${order.id}', '${order.workOrderId}')">
                            <span class="btn-icon">✖</span> Cancel
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    html += '</div></div>';
    workOrderResultsDiv.innerHTML = html;
}

// Function to reschedule a work order
function rescheduleWorkOrder(orderId, workOrderId) {
    // Store work order info in modal
    document.getElementById('modalOrderId').value = orderId;
    document.getElementById('modalWorkOrderId').value = workOrderId;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('preferredDate').setAttribute('min', today);
    
    // Show modal
    document.getElementById('rescheduleModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Function to close reschedule modal
function closeRescheduleModal() {
    document.getElementById('rescheduleModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    document.getElementById('rescheduleForm').reset();
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('rescheduleModal');
    if (event.target === modal) {
        closeRescheduleModal();
    }
}

// Handle reschedule form submission
document.addEventListener('DOMContentLoaded', function() {
    const rescheduleForm = document.getElementById('rescheduleForm');
    if (rescheduleForm) {
        rescheduleForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const orderId = document.getElementById('modalOrderId').value;
            const workOrderId = document.getElementById('modalWorkOrderId').value;
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            
            // Get form data
            const requestData = {
                orderId: orderId,
                workOrderId: workOrderId,
                email: email,
                phone: phone,
                preferredDate: document.getElementById('preferredDate').value,
                preferredTime: document.getElementById('preferredTime').value,
                action: 'reschedule'
            };
            
            console.log('Submitting reschedule request:', requestData);
            
            // Close modal
            closeRescheduleModal();
            
            // Show success message
            showNotification('Reschedule request submitted! We will contact you within 24 hours to confirm.', 'success');
            
            // TODO: Send actual API request
            /*
            try {
                const response = await fetch('/api/workorder/reschedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    closeRescheduleModal();
                    showNotification('Reschedule request submitted successfully!', 'success');
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

// Function to cancel a work order
function cancelWorkOrder(orderId, workOrderId) {
    const confirmed = confirm(`Cancel Work Order #${workOrderId}?\n\nThis action cannot be undone. Are you sure you want to cancel this work order?`);
    
    if (!confirmed) return;
    
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // Prepare request data
    const requestData = {
        orderId: orderId,
        workOrderId: workOrderId,
        email: email,
        phone: phone,
        action: 'cancel'
    };
    
    console.log('Cancelling work order:', requestData);
    
    // Show success notification
    showNotification('Work order cancelled successfully.', 'success');
    
    // TODO: Send actual API request and reload work orders
    /*
    fetch('/api/workorder/cancel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Work order cancelled successfully!', 'success');
        // Reload work orders to show updated status
        setTimeout(() => {
            document.getElementById('workOrderForm').dispatchEvent(new Event('submit'));
        }, 1500);
    })
    .catch(error => {
        showNotification('Failed to cancel work order. Please try again.', 'error');
    });
    */
}

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
    const messageDiv = document.getElementById('workOrderMessage');
    if (messageDiv.className === 'error') {
        messageDiv.style.display = 'none';
    }
}
