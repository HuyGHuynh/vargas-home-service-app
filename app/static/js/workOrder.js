// Sample work order data
const sampleWorkOrders = [
    {
        id: 'WO-2024-001',
        customerPhone: '555-123-4567',
        customerEmail: 'john@example.com',
        customerName: 'John Smith',
        serviceType: 'Kitchen Remodel',
        description: 'Complete kitchen renovation including cabinets, countertops, and new appliances',
        status: 'Completed',
        priority: 'Normal',
        dateRequested: '2024-02-01',
        dateScheduled: '2024-03-15',
        dateCompleted: '2024-04-20',
        technician: 'Mike Johnson',
        estimatedCost: '$15,000',
        actualCost: '$14,800',
        notes: 'Customer very satisfied. Left 5-star review.'
    },
    {
        id: 'WO-2024-089',
        customerPhone: '555-123-4567',
        customerEmail: 'john@example.com',
        customerName: 'John Smith',
        serviceType: 'HVAC Installation',
        description: 'Install new central air conditioning system',
        status: 'In Progress',
        priority: 'High',
        dateRequested: '2024-05-22',
        dateScheduled: '2024-06-10',
        dateCompleted: null,
        technician: 'Dave Martinez',
        estimatedCost: '$8,500',
        actualCost: null,
        notes: 'Installation 75% complete. Final inspection scheduled for next week.'
    },
    {
        id: 'WO-2023-045',
        customerPhone: '555-123-4567',
        customerEmail: 'john@example.com',
        customerName: 'John Smith',
        serviceType: 'Roof Repair',
        description: 'Fix damaged shingles and flashing on north side of roof',
        status: 'Completed',
        priority: 'High',
        dateRequested: '2023-08-01',
        dateScheduled: '2023-08-20',
        dateCompleted: '2023-08-21',
        technician: 'Tom Wilson',
        estimatedCost: '$2,800',
        actualCost: '$2,650',
        notes: 'Completed ahead of schedule. Weather conditions were favorable.'
    },
    {
        id: 'WO-2024-156',
        customerPhone: '555-987-6543',
        customerEmail: 'jane@example.com',
        customerName: 'Jane Doe',
        serviceType: 'Plumbing Repair',
        description: 'Fix leaking pipe under kitchen sink',
        status: 'Scheduled',
        priority: 'Normal',
        dateRequested: '2024-10-10',
        dateScheduled: '2024-10-20',
        dateCompleted: null,
        technician: 'Mike Johnson',
        estimatedCost: '$350',
        actualCost: null,
        notes: 'Customer requested morning appointment'
    }
];

// Lookup work orders by phone or email
function lookupWorkOrders() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('resultsContainer');

    if (!searchInput) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <p>⚠️ Please enter a phone number or email address</p>
            </div>
        `;
        return;
    }

    // Search for work orders matching the input
    const foundOrders = sampleWorkOrders.filter(order => 
        order.customerPhone.includes(searchInput) || 
        order.customerEmail.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (foundOrders.length === 0) {
        resultsContainer.innerHTML = `
            <div class="not-found-message">
                <h3>No Work Orders Found</h3>
                <p>We couldn't find any work orders associated with "${searchInput}"</p>
                <p>Please check your information and try again, or contact us at (555) 123-4567</p>
            </div>
        `;
        return;
    }

    // Display work orders as a list
    displayWorkOrders(foundOrders);
}

// Display work orders in list format
function displayWorkOrders(orders) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    let html = `
        <div class="results-header">
            <h2>Your Work Orders</h2>
            <p class="results-count">${orders.length} work ${orders.length === 1 ? 'order' : 'orders'} found</p>
        </div>
        <div class="order-list">
    `;

    orders.forEach((order, index) => {
        const dateRequested = new Date(order.dateRequested).toLocaleDateString();
        const dateScheduled = order.dateScheduled ? new Date(order.dateScheduled).toLocaleDateString() : 'Not scheduled';
        const dateCompleted = order.dateCompleted ? new Date(order.dateCompleted).toLocaleDateString() : 'N/A';
        
        const statusClass = order.status.toLowerCase().replace(' ', '-');

        html += `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-header-left">
                        <h3>${order.serviceType}</h3>
                        <p class="order-id">Work Order #${order.id}</p>
                    </div>
                    <div class="order-header-right">
                        <span class="status-badge ${statusClass}">${order.status}</span>
                        <span class="priority-badge priority-${order.priority.toLowerCase()}">${order.priority}</span>
                    </div>
                </div>

                <div class="order-body">
                    <div class="order-description">
                        <p><strong>Description:</strong> ${order.description}</p>
                    </div>

                    <div class="order-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Customer</span>
                            <span class="detail-value">${order.customerName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Technician</span>
                            <span class="detail-value">${order.technician}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date Requested</span>
                            <span class="detail-value">${dateRequested}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date Scheduled</span>
                            <span class="detail-value">${dateScheduled}</span>
                        </div>
                        ${order.dateCompleted ? `
                            <div class="detail-item">
                                <span class="detail-label">Date Completed</span>
                                <span class="detail-value">${dateCompleted}</span>
                            </div>
                        ` : ''}
                        <div class="detail-item">
                            <span class="detail-label">Estimated Cost</span>
                            <span class="detail-value">${order.estimatedCost}</span>
                        </div>
                        ${order.actualCost ? `
                            <div class="detail-item">
                                <span class="detail-label">Actual Cost</span>
                                <span class="detail-value">${order.actualCost}</span>
                            </div>
                        ` : ''}
                    </div>

                    ${order.notes ? `
                        <div class="order-notes">
                            <p><strong>Notes:</strong> ${order.notes}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                lookupWorkOrders();
            }
        });
    }
});
