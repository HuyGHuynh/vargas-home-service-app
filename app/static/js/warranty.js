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

// Lookup warranty by phone or email and service type
function lookupWarranty() {
    let searchInput = document.getElementById('warrantySearchInput').value.trim();
    const serviceType = document.getElementById('serviceTypeSelect').value;
    const resultsDiv = document.getElementById('warrantyResults');

    // Validate input
    if (!searchInput) {
        resultsDiv.innerHTML = `
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
            resultsDiv.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Email address cannot contain spaces</p>
                </div>
            `;
            return;
        }
        
        if (searchInput.split('@').length > 2) {
            resultsDiv.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Email address cannot contain multiple @ symbols</p>
                </div>
            `;
            return;
        }
        
        if (searchInput.startsWith('@') || searchInput.endsWith('@')) {
            resultsDiv.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Invalid email format. Email must have text before and after @</p>
                </div>
            `;
            return;
        }
        
        if (!emailRegex.test(searchInput)) {
            resultsDiv.innerHTML = `
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
            resultsDiv.innerHTML = `
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
        resultsDiv.innerHTML = `
            <div class="error-message">
                <p>⚠️ Please select a service type</p>
            </div>
        `;
        return;
    }

    // Search for warranties matching the input and service type
    const foundWarranties = sampleWarranties.filter(warranty => 
        (warranty.customerPhone.includes(searchInput) || 
         warranty.customerEmail.toLowerCase().includes(searchInput)) &&
        warranty.serviceType === serviceType
    );

    if (foundWarranties.length === 0) {
        // Show "No Warranties Found" message
        resultsDiv.innerHTML = `
            <div class="not-found-message">
                <h3>No Warranties Found</h3>
                <p>We couldn't find any warranties associated with "${searchInput}" for ${serviceType} services.</p>
                <p>Please check your information and try again, or contact us at (555) 123-4567</p>
            </div>
        `;
    } else {
        // Show email confirmation message instead of listing warranties
        resultsDiv.innerHTML = `
            <div class="success-message">
                <h3>✓ Warranty Information Found</h3>
                <p>We found ${foundWarranties.length} ${foundWarranties.length === 1 ? 'warranty' : 'warranties'} associated with your account.</p>
                <p><strong>Your warranty information will be sent to your email shortly.</strong></p>
                <p>Please check your inbox for detailed warranty information including coverage details, expiration dates, and service history.</p>
                <p>If you don't receive the email within a few minutes, please contact us at (555) 123-4567</p>
            </div>
        `;
        
        // In production, this would trigger an email via backend API
        console.log(`Sending warranty details to customer for ${foundWarranties.length} warranties`);
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
