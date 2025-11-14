// Warranty Selection Page JavaScript

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing page...');
    
    // Add a small delay to ensure all elements are properly loaded
    setTimeout(() => {
        initializeWarrantySelection();
    }, 100);
});

function initializeWarrantySelection() {
    console.log('Initializing warranty selection page');
    
    // Add event listeners to buttons as backup
    const acceptBtn = document.querySelector('.btn-accept');
    const declineBtn = document.querySelector('.btn-decline');
    
    if (acceptBtn) {
        console.log('Accept button found, adding event listener');
        acceptBtn.addEventListener('click', function(e) {
            e.preventDefault();
            acceptWarranty();
        });
    } else {
        console.log('Accept button not found');
    }
    
    if (declineBtn) {
        console.log('Decline button found, adding event listener');
        declineBtn.addEventListener('click', function(e) {
            e.preventDefault();
            declineWarranty();
        });
    } else {
        console.log('Decline button not found');
    }
    
    // Load warranty coverage dates
    loadWarrantyCoverageDates();
    
    // Simulate real-time status updates (for demo purposes)
    // In real implementation, this would come from server-side updates
    updateWarrantyStatus();
}

// Warranty Data Loading Functions
function loadWarrantyCoverageDates() {
    try {
        // Load warranty coverage dates that were configured by admin
        // Admin can set these dates through:
        // 1. Admin Warranty Page (/admin/warranty) - when creating/editing warranties
        // 2. Admin Dashboard - when managing work order warranties
        // 3. Work Order completion - when admin marks work order as complete and sets warranty
        
        console.log('Loading warranty coverage dates...');
        
        // Fetch admin-configured warranty data from server
        const warrantyData = getWarrantyDataFromServer();
        console.log('Warranty data loaded:', warrantyData);
        
        // Update the coverage period display with admin-set dates
        updateCoveragePeriodDisplay(warrantyData.startDate, warrantyData.endDate);
        
        // Update the warranty description with admin-added details
        updateWarrantyDescription(warrantyData.description, warrantyData.configuredBy);
        
        console.log('Warranty data display updated successfully');
    } catch (error) {
        console.error('Error loading warranty coverage dates:', error);
        
        // Fallback display in case of error
        const coveragePeriodElement = document.getElementById('coveragePeriod');
        const warrantyDescriptionElement = document.getElementById('warrantyDescription');
        
        if (coveragePeriodElement) {
            coveragePeriodElement.innerHTML = '<p style="color: #dc3545;">Error loading coverage dates. Please refresh the page.</p>';
        }
        
        if (warrantyDescriptionElement) {
            warrantyDescriptionElement.innerHTML = '<p style="color: #dc3545;">Error loading warranty details. Please refresh the page.</p>';
        }
    }
}

function getWarrantyDataFromServer() {
    // This function will fetch warranty dates set by admin from the server
    // Admin can configure these dates through:
    // 1. Admin Warranty Page - when setting up warranty for specific work order
    // 2. Admin Dashboard - when managing warranty settings
    
    // In production, this would be an API call like:
    // const response = await fetch(`/api/warranty/work-order/${workOrderId}`);
    // const warrantyData = await response.json();
    
    // For demo purposes, simulating admin-configured warranty data
    // These details would come from admin input in the warranty management system
    const adminConfiguredData = {
        workOrderId: 'WO-2024-001234',
        warrantyId: 'WAR-2024-5678',
        adminSetStartDate: '2024-11-15', // Admin selected start date
        adminSetEndDate: '2025-02-13',   // Admin selected end date
        configuredBy: 'admin@vargasservice.com',
        configuredDate: '2024-10-30',
        // Admin-added warranty description/details
        warrantyDescription: `This comprehensive HVAC service warranty covers all work performed during your recent system repair on October 28, 2024. Our technician Michael Rodriguez completed a full system diagnostic and replaced the faulty thermostat control unit and cleaned the air filtration system.

Key Coverage Details:
- Complete protection for the thermostat control unit replacement
- Air filtration system maintenance and cleaning work
- All associated wiring and connection work
- System performance optimization adjustments

This warranty ensures that if any issues arise related to the specific work performed, we will return at no additional charge to address the problem. Our commitment is to ensure your HVAC system operates efficiently and reliably throughout the warranty period.

For warranty claims, please contact our service department at (555) 123-4567 or email warranty@vargasservice.com with your warranty ID: WAR-2024-5678.`
    };
    
    // Convert admin-set date strings to Date objects
    const startDate = new Date(adminConfiguredData.adminSetStartDate);
    const endDate = new Date(adminConfiguredData.adminSetEndDate);
    
    return {
        startDate: startDate,
        endDate: endDate,
        duration: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        warrantyId: adminConfiguredData.warrantyId,
        configuredBy: adminConfiguredData.configuredBy,
        description: adminConfiguredData.warrantyDescription
    };
}

function updateCoveragePeriodDisplay(startDate, endDate) {
    const coveragePeriodElement = document.getElementById('coveragePeriod');
    
    if (!coveragePeriodElement) {
        console.error('Coverage period element not found');
        return;
    }
    
    try {
        // Format dates for display
        const startDateFormatted = formatDate(startDate);
        const endDateFormatted = formatDate(endDate);
        
        // Calculate duration
        const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        // Update coverage period with admin-configured start and end dates
        coveragePeriodElement.innerHTML = `
            <div class="coverage-dates">
                <div class="date-item">
                    <strong>Start Date:</strong> ${startDateFormatted}
                </div>
                <div class="date-item">
                    <strong>End Date:</strong> ${endDateFormatted}
                </div>
                <div class="coverage-duration">
                    <span style="color: #4A70A9; font-weight: 600;">Total Coverage: ${durationDays} days</span>
                </div>
            </div>
            <div class="admin-note">
                <small style="color: #666; font-style: italic;">
                    * Coverage dates configured by service administrator
                </small>
            </div>
        `;
        
        console.log('Coverage period display updated successfully');
    } catch (error) {
        console.error('Error updating coverage period display:', error);
        coveragePeriodElement.innerHTML = '<p style="color: #dc3545;">Error displaying coverage dates</p>';
    }
}

function updateWarrantyDescription(description, configuredBy) {
    const warrantyDescriptionElement = document.getElementById('warrantyDescription');
    
    if (!warrantyDescriptionElement) {
        console.error('Warranty description element not found');
        return;
    }
    
    try {
        if (!description || description.trim() === '') {
            // Show default message if no description provided
            warrantyDescriptionElement.innerHTML = `
                <div class="no-description">
                    <p style="color: #666; font-style: italic;">
                        No additional warranty details provided by administrator.
                    </p>
                </div>
            `;
            console.log('No warranty description provided, showing default message');
            return;
        }
        
        // Format the description with proper line breaks and styling
        const formattedDescription = description.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        
        warrantyDescriptionElement.innerHTML = `
            <div class="warranty-description-content">
                <div class="description-text">
                    <p>${formattedDescription}</p>
                </div>
                <div class="description-footer">
                    <small style="color: #666; font-style: italic;">
                        * Details provided by: ${configuredBy || 'Service Administrator'}
                    </small>
                </div>
            </div>
        `;
        
        console.log('Warranty description updated successfully');
    } catch (error) {
        console.error('Error updating warranty description:', error);
        warrantyDescriptionElement.innerHTML = '<p style="color: #dc3545;">Error displaying warranty details</p>';
    }
}

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('en-US', options);
}

// Action Functions

function acceptWarranty() {
    console.log('Accept warranty function called');
    // Show loading state
    showMessage('Processing your warranty acceptance...', 'info');
    
    // Simulate API call to accept warranty
    setTimeout(() => {
        // Replace entire page content with thank you message
        document.body.innerHTML = `
            <div class="thank-you-page">
                <div class="thank-you-container">
                    <div class="thank-you-icon">✅</div>
                    <h1 class="thank-you-title">Thank You!</h1>
                    <p class="thank-you-message">
                        Your warranty acceptance has been received successfully.
                    </p>
                    
                    <div class="next-steps-info">
                        <div class="info-box accept-info">
                            <h3>What Happens Next</h3>
                            <p>Our company representative will call you within 1-2 business days to discuss the warranty details and arrange payment processing.</p>
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <h3>Questions or Concerns?</h3>
                        <p>If you have any questions, please contact us:</p>
                        <div class="phone-number">
                            <span class="phone-icon">📞</span>
                            <a href="tel:+15551234567" class="phone-link">(555) 123-4567</a>
                        </div>
                        <p class="business-hours">Business Hours: Monday - Friday, 8:00 AM - 6:00 PM</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS for thank you page
        addThankYouPageStyles();
    }, 2000);
}

function declineWarranty() {
    console.log('Decline warranty function called');
    // Show loading state
    showMessage('Processing your warranty decline...', 'info');
    
    // Simulate API call to decline warranty
    setTimeout(() => {
        // Replace entire page content with thank you message
        document.body.innerHTML = `
            <div class="thank-you-page">
                <div class="thank-you-container">
                    <div class="thank-you-icon">✅</div>
                    <h1 class="thank-you-title">Thank You!</h1>
                    <p class="thank-you-message">
                        Your warranty decision has been received and recorded.
                    </p>
                    
                    <div class="next-steps-info">
                        <div class="info-box decline-info">
                            <h3>Decision Noted</h3>
                            <p>Your decision to decline the warranty has been processed. No further action is required on your part.</p>
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <h3>Questions or Concerns?</h3>
                        <p>If you have any questions, please contact us:</p>
                        <div class="phone-number">
                            <span class="phone-icon">📞</span>
                            <a href="tel:+15551234567" class="phone-link">(555) 123-4567</a>
                        </div>
                        <p class="business-hours">Business Hours: Monday - Friday, 8:00 AM - 6:00 PM</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS for thank you page
        addThankYouPageStyles();
    }, 2000);
}

function proceedToPayment() {
    // In real implementation, this would redirect to payment gateway
    showMessage('Redirecting to secure payment portal...', 'info');
    
    // Simulate redirect
    setTimeout(() => {
        // This would be replaced with actual payment URL
        // window.location.href = '/payment/warranty/WO-2024-001234';
        
        // For demo, show payment simulation
        showMessage('Payment portal would open here (Demo mode)', 'info');
    }, 2000);
}

// Utility Functions
function updateStatusBadge(status, text, icon) {
    const statusBadge = document.querySelector('.status-badge');
    
    // Remove existing status classes
    statusBadge.classList.remove('pending', 'agreed', 'active', 'declined', 'expired');
    
    // Add new status class
    statusBadge.classList.add(status);
    
    // Update content
    statusBadge.innerHTML = `
        <span class="status-icon">${icon}</span>
        <span class="status-text">${text}</span>
    `;
}

function updateWarrantyStatus() {
    // This function would typically fetch real-time status from the server
    // For demo purposes, it's just a placeholder
    
    // Example of how you might handle different statuses:
    const currentStatus = 'pending'; // This would come from server
    
    switch(currentStatus) {
        case 'pending':
            // Default state, no changes needed
            break;
        case 'agreed':
            updateStatusBadge('agreed', 'Customer Agreed (Unpaid)', '💳');
            break;
        case 'active':
            updateStatusBadge('active', 'Active', '✅');
            hideActionButtons('Warranty is currently active');
            break;
        case 'declined':
            updateStatusBadge('declined', 'Declined', '❌');
            break;
        case 'expired':
            updateStatusBadge('expired', 'Expired', '⏰');
            hideActionButtons('Warranty offer has expired');
            break;
    }
}

function hideActionButtons(message) {
    const actionArea = document.querySelector('.action-area');
    actionArea.innerHTML = `
        <div class="status-message">
            <h3>${message}</h3>
            <p>No further action is required at this time.</p>
        </div>
    `;
}

// Message System
function showMessage(text, type = 'success') {
    const messageContainer = document.getElementById('messageContainer');
    const messageText = messageContainer.querySelector('.message-text');
    const messageContent = messageContainer.querySelector('.message-content');
    
    // Set message text
    messageText.textContent = text;
    
    // Remove existing type classes
    messageContent.classList.remove('success', 'error', 'info');
    
    // Add appropriate type class
    messageContent.classList.add(type);
    
    // Set background color based on type
    switch(type) {
        case 'success':
            messageContent.style.background = '#28a745';
            break;
        case 'error':
            messageContent.style.background = '#dc3545';
            break;
        case 'info':
            messageContent.style.background = '#17a2b8';
            break;
        default:
            messageContent.style.background = '#28a745';
    }
    
    // Show message
    messageContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds (except for error messages)
    if (type !== 'error') {
        setTimeout(() => {
            closeMessage();
        }, 5000);
    }
}

function closeMessage() {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.style.display = 'none';
}



// Page Visibility API - Update status when user returns to page
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page is now visible, update warranty status
        updateWarrantyStatus();
    }
});

// Simulate countdown timer for decision deadline
function startDecisionTimer() {
    // This would typically be calculated based on server-provided deadline
    const decisionDeadline = new Date();
    decisionDeadline.setDate(decisionDeadline.getDate() + 2); // 2 days from now
    
    function updateTimer() {
        const now = new Date();
        const timeLeft = decisionDeadline - now;
        
        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            const timerText = document.querySelector('.timer-info .timer-text');
            if (days > 0) {
                timerText.textContent = `Decision required within ${days} day${days !== 1 ? 's' : ''} and ${hours} hour${hours !== 1 ? 's' : ''}`;
            } else if (hours > 0) {
                timerText.textContent = `Decision required within ${hours} hour${hours !== 1 ? 's' : ''}`;
            } else {
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                timerText.textContent = `Decision required within ${minutes} minute${minutes !== 1 ? 's' : ''}`;
            }
        } else {
            // Deadline passed
            const timerText = document.querySelector('.timer-info .timer-text');
            timerText.textContent = 'Decision deadline has passed';
            updateStatusBadge('expired', 'Expired', '⏰');
            hideActionButtons('Warranty offer has expired');
        }
    }
    
    // Update immediately and then every minute
    updateTimer();
    setInterval(updateTimer, 60000);
}

// Start the decision timer when page loads
document.addEventListener('DOMContentLoaded', function() {
    startDecisionTimer();
});

// Thank You Page Styling
function addThankYouPageStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .thank-you-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #EFECE3 0%, #f8f9fa 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .thank-you-container {
            background: white;
            max-width: 600px;
            width: 100%;
            padding: 3rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
            animation: slideIn 0.6s ease-out;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .thank-you-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: bounce 1s ease-in-out;
        }
        
        @keyframes bounce {
            0%, 20%, 60%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            80% {
                transform: translateY(-5px);
            }
        }
        
        .thank-you-title {
            font-size: 2.5rem;
            color: #4A70A9;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        
        .thank-you-message {
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        
        .next-steps-info {
            margin: 2rem 0;
        }
        
        .info-box {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid #4A70A9;
            margin-bottom: 1.5rem;
        }
        
        .accept-info {
            border-left-color: #28a745;
            background: #e8f5e8;
        }
        
        .decline-info {
            border-left-color: #6c757d;
            background: #f8f9fa;
        }
        
        .info-box h3 {
            margin: 0 0 1rem 0;
            color: #333;
            font-size: 1.3rem;
        }
        
        .info-box p {
            margin: 0;
            color: #555;
            line-height: 1.5;
        }
        
        .contact-info {
            background: #4A70A9;
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-top: 2rem;
        }
        
        .contact-info h3 {
            margin: 0 0 1rem 0;
            font-size: 1.3rem;
        }
        
        .contact-info p {
            margin: 0.5rem 0;
            opacity: 0.9;
        }
        
        .phone-number {
            margin: 1.5rem 0;
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }
        
        .phone-icon {
            font-size: 1.5rem;
        }
        
        .phone-link {
            color: white;
            text-decoration: none;
            font-size: 1.5rem;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        
        .phone-link:hover {
            color: #EFECE3;
            text-decoration: underline;
        }
        
        .business-hours {
            font-size: 0.9rem;
            margin-top: 1rem;
            opacity: 0.8;
        }
        
        @media (max-width: 768px) {
            .thank-you-container {
                padding: 2rem;
                margin: 1rem;
            }
            
            .thank-you-title {
                font-size: 2rem;
            }
            
            .thank-you-message {
                font-size: 1.1rem;
            }
            
            .phone-link {
                font-size: 1.3rem;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Make functions globally accessible for onclick handlers
window.acceptWarranty = acceptWarranty;
window.declineWarranty = declineWarranty;

// Export functions for potential external use
window.WarrantySelection = {
    acceptWarranty,
    declineWarranty,
    showMessage,
    closeMessage
};