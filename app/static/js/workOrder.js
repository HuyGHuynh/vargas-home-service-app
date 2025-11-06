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

// Lookup work orders by phone or email and service type
function lookupWorkOrders() {
    let searchInput = document.getElementById('searchInput').value.trim();
    const serviceType = document.getElementById('serviceTypeSelect').value;
    const resultsContainer = document.getElementById('resultsContainer');

    // Validate input
    if (!searchInput) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <p>⚠️ Please enter a phone number or email address</p>
            </div>
        `;
        return;
    }

    // Check if input contains @ (indicating it's an email)
    if (searchInput.includes('@')) {
        // Email validation
        searchInput = searchInput.toLowerCase();
        const emailRegex = /^[a-z0-9][a-z0-9._-]*@[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/;
        
        // Check for invalid patterns
        if (searchInput.includes(' ')) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Email address cannot contain spaces</p>
                </div>
            `;
            return;
        }
        
        if (searchInput.split('@').length > 2) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Email address cannot contain multiple @ symbols</p>
                </div>
            `;
            return;
        }
        
        if (searchInput.startsWith('@') || searchInput.endsWith('@')) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Invalid email format. Email must have text before and after @</p>
                </div>
            `;
            return;
        }
        
        if (!emailRegex.test(searchInput)) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Please enter a valid email address (e.g., example@domain.com)</p>
                </div>
            `;
            return;
        }
    } else {
        // Phone number validation
        // Remove all non-digit characters for validation
        const digitsOnly = searchInput.replace(/\D/g, '');
        
        if (digitsOnly.length !== 10) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Phone number must contain exactly 10 digits</p>
                </div>
            `;
            return;
        }
        
        // Format phone number for searching: (XXX) XXX-XXXX
        searchInput = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }

    if (!serviceType) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <p>⚠️ Please select a service type</p>
            </div>
        `;
        return;
    }

    // Show loading message
    resultsContainer.innerHTML = `
        <div class="loading-message">
            <p>🔍 Searching for work orders...</p>
        </div>
    `;

    // Call the work order lookup API
    fetch('/workorders/lookup-details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: searchInput.includes('@') ? searchInput : '',
            phone: !searchInput.includes('@') ? searchInput : '',
            service_type: serviceType
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                resultsContainer.innerHTML = `
                    <div class="success-message">
                        <h3>✓ Work Order Information Found</h3>
                        <p>We found ${data.workorders_count} work ${data.workorders_count === 1 ? 'order' : 'orders'} associated with your account.</p>
                        <p><strong>Your work order information will be sent to your email shortly.</strong></p>
                        <p>Please check your inbox for detailed work order information including service status, scheduled dates, and cost estimates.</p>
                        <p>If you don't receive the email within a few minutes, please contact us at (555) 123-4567</p>
                    </div>
                `;
                
                // Console log as requested for debugging
                console.log(`✅ Work order details found for ${data.workorders_count} work orders`);
                console.log('Details have been logged to server console for debugging');
            } else {
                // Show not found message
                resultsContainer.innerHTML = `
                    <div class="not-found-message">
                        <h3>No Work Orders Found</h3>
                        <p>${data.message || `We couldn't find any work orders associated with "${searchInput}" for ${serviceType} services.`}</p>
                        <p>Please check your information and try again, or contact us at (555) 123-4567</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error looking up work orders:', error);
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>⚠️ An error occurred while searching for work orders. Please try again or contact us at (555) 123-4567</p>
                </div>
            `;
        });
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                lookupWorkOrders();
            }
        });
        
        // Auto-format phone number as user types (only if no letters or @ symbol)
        searchInput.addEventListener('input', function(event) {
            let value = event.target.value;
            
            // Check if value contains any letters or @ symbol (indicating email)
            const containsLettersOrAt = /[a-zA-Z@]/.test(value);
            
            // Only format as phone number if it doesn't contain letters or @
            if (!containsLettersOrAt) {
                // Remove all non-digit characters
                const digitsOnly = value.replace(/\D/g, '');
                
                // Limit to 10 digits
                const limitedDigits = digitsOnly.substring(0, 10);
                
                // Format based on length
                let formattedValue = '';
                if (limitedDigits.length === 0) {
                    formattedValue = '';
                } else if (limitedDigits.length <= 3) {
                    formattedValue = limitedDigits;
                } else if (limitedDigits.length <= 6) {
                    formattedValue = `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
                } else {
                    formattedValue = `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
                }
                
                // Only update if the formatted value is different
                if (formattedValue !== value) {
                    event.target.value = formattedValue;
                }
            }
        });
    }
});
