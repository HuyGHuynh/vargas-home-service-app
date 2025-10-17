// Sample warranty data (in production, this would come from a database)
const sampleWarranties = [
    {
        id: 'W001',
        customerPhone: '555-123-4567',
        customerEmail: 'john@example.com',
        serviceName: 'Kitchen Remodel',
        serviceType: 'Remodeling',
        workOrderId: 'WO-2024-001',
        startDate: '2024-03-15',
        warrantyPeriod: '2 years',
        expirationDate: '2026-03-15',
        coverage: 'Full coverage for all materials and workmanship including cabinets, countertops, plumbing fixtures, and electrical work.',
        notes: 'Excludes normal wear and tear. Annual inspection recommended.',
        status: 'active'
    },
    {
        id: 'W002',
        customerPhone: '555-123-4567',
        customerEmail: 'john@example.com',
        serviceName: 'Roof Repair',
        serviceType: 'Roofing',
        workOrderId: 'WO-2023-045',
        startDate: '2023-08-20',
        warrantyPeriod: '5 years',
        expirationDate: '2028-08-20',
        coverage: 'Covers all roofing materials, flashing, and leak repairs. Includes annual inspection.',
        notes: 'Storm damage covered. Keep gutters clean for warranty validity.',
        status: 'active'
    },
    {
        id: 'W003',
        customerPhone: '555-123-4567',
        customerEmail: 'john@example.com',
        serviceName: 'HVAC Installation',
        serviceType: 'HVAC',
        workOrderId: 'WO-2024-089',
        startDate: '2024-06-10',
        warrantyPeriod: '3 years',
        expirationDate: '2027-06-10',
        coverage: 'Complete system warranty including parts and labor. Filter replacement every 3 months recommended.',
        notes: 'Annual maintenance required to maintain warranty.',
        status: 'active'
    },
    {
        id: 'W004',
        customerPhone: '555-987-6543',
        customerEmail: 'jane@example.com',
        serviceName: 'Bathroom Renovation',
        serviceType: 'Remodeling',
        workOrderId: 'WO-2022-112',
        startDate: '2022-11-05',
        warrantyPeriod: '1 year',
        expirationDate: '2023-11-05',
        coverage: 'Covered tile work, plumbing fixtures, and vanity installation.',
        notes: 'Warranty has expired. Contact us for renewal options.',
        status: 'expired'
    },
    {
        id: 'W005',
        customerPhone: '555-456-7890',
        customerEmail: 'bob@example.com',
        serviceName: 'Deck Construction',
        serviceType: 'Outdoor Projects',
        workOrderId: 'WO-2024-134',
        startDate: '2024-05-22',
        warrantyPeriod: '10 years',
        expirationDate: '2034-05-22',
        coverage: 'Structural warranty covers all framing, decking materials, and railing systems.',
        notes: 'Annual sealing recommended but not required for warranty.',
        status: 'active'
    }
];

// Lookup warranty by phone or email
function lookupWarranty() {
    const searchInput = document.getElementById('warrantySearchInput').value.trim();
    const resultsDiv = document.getElementById('warrantyResults');

    if (!searchInput) {
        resultsDiv.innerHTML = `
            <div class="error-message">
                <p>⚠️ Please enter a phone number or email address</p>
            </div>
        `;
        return;
    }

    // Search for warranties matching the input
    const foundWarranties = sampleWarranties.filter(warranty => 
        warranty.customerPhone.includes(searchInput) || 
        warranty.customerEmail.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (foundWarranties.length === 0) {
        resultsDiv.innerHTML = `
            <div class="not-found-message">
                <h3>No Warranties Found</h3>
                <p>We couldn't find any warranties associated with "${searchInput}"</p>
                <p>Please check your information and try again, or contact us at (555) 123-4567</p>
            </div>
        `;
        return;
    }

    // Display warranties as a list
    displayWarranties(foundWarranties);
}

// Display warranties in list format with expandable details
function displayWarranties(warranties) {
    const resultsDiv = document.getElementById('warrantyResults');
    
    let html = `
        <div class="results-header">
            <h2>Your Warranties</h2>
            <p class="results-count">${warranties.length} ${warranties.length === 1 ? 'warranty' : 'warranties'} found</p>
        </div>
        <div class="warranty-list">
    `;

    warranties.forEach((warranty, index) => {
        const startDate = new Date(warranty.startDate).toLocaleDateString();
        const expirationDate = new Date(warranty.expirationDate).toLocaleDateString();
        const today = new Date();
        const expDate = new Date(warranty.expirationDate);
        const daysRemaining = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        const isActive = expDate > today;
        const isExpiringSoon = isActive && daysRemaining < 90;

        html += `
            <div class="warranty-card ${isActive ? 'active' : 'expired'}">
                <div class="warranty-header">
                    <div class="warranty-header-left">
                        <h3>${warranty.serviceName}</h3>
                        <p class="warranty-id">Work Order #${warranty.workOrderId}</p>
                    </div>
                    <div class="warranty-header-right">
                        <span class="status-badge ${isActive ? 'active' : 'expired'}">
                            ${isActive ? 'Active' : 'Expired'}
                        </span>
                        ${isExpiringSoon ? `<span class="expiring-badge">⚠️ Expiring Soon</span>` : ''}
                    </div>
                </div>

                <div class="warranty-body">
                    ${isExpiringSoon ? `
                        <div class="warranty-alert">
                            ⚠️ This warranty expires in ${daysRemaining} days. Contact us to discuss renewal options.
                        </div>
                    ` : ''}

                    <div class="warranty-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Service Type</span>
                            <span class="detail-value">${warranty.serviceType || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Warranty Period</span>
                            <span class="detail-value">${warranty.warrantyPeriod}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Start Date</span>
                            <span class="detail-value">${startDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Expiration Date</span>
                            <span class="detail-value">${expirationDate}</span>
                        </div>
                        ${isExpiringSoon ? `
                            <div class="detail-item">
                                <span class="detail-label">Days Remaining</span>
                                <span class="detail-value expiring-text">${daysRemaining} days</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="warranty-coverage">
                        <p><strong>Coverage Details:</strong> ${warranty.coverage}</p>
                    </div>

                    ${warranty.notes ? `
                        <div class="warranty-notes">
                            <p><strong>Important Notes:</strong> ${warranty.notes}</p>
                        </div>
                    ` : ''}
                </div>

                <div class="warranty-footer">
                    ${isActive ? `
                        <button class="action-btn primary-btn" onclick="requestWarrantyService('${warranty.id}', '${warranty.workOrderId}')">
                            Request Warranty Service
                        </button>
                        <button class="action-btn secondary-btn" onclick="requestWarrantyDetails('${warranty.id}', '${warranty.workOrderId}')">
                            Email Details
                        </button>
                    ` : `
                        <button class="action-btn primary-btn" onclick="renewWarranty('${warranty.id}')">
                            Renew Warranty
                        </button>
                    `}
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultsDiv.innerHTML = html;
}

// Function to request warranty details via email
function requestWarrantyDetails(warrantyId, workOrderId) {
    alert(`Warranty details for ${workOrderId} will be emailed to you shortly.\n\nWarranty ID: ${warrantyId}`);
    // In production, this would trigger an email via backend API
}

// Function to request warranty service
function requestWarrantyService(warrantyId, workOrderId) {
    const confirmed = confirm(`Would you like to request warranty service for Work Order ${workOrderId}?\n\nA service technician will contact you within 24 hours.`);
    if (confirmed) {
        alert('Warranty service request submitted! We will contact you soon.');
        // In production, this would create a service request in the database
    }
}

// Function to renew warranty
function renewWarranty(warrantyId) {
    const confirmed = confirm('Would you like to renew this warranty?\n\nOur team will contact you with renewal options and pricing.');
    if (confirmed) {
        alert('Warranty renewal request submitted! We will contact you within 2 business days.');
        // In production, this would trigger a renewal workflow
    }
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('warrantySearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                lookupWarranty();
            }
        });
    }
});
