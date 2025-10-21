// Services data from database
let services = [];
let serviceTypes = [];

// Load services on page load
document.addEventListener('DOMContentLoaded', function () {
    loadServices();
    loadServiceTypes();
});

// Fetch services from API
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const result = await response.json();

        if (result.success) {
            // Transform database fields to match frontend format
            services = result.data.map(service => ({
                id: service.service_id,
                name: service.job_name,
                category: service.category,
                price: parseFloat(service.service_price),
                duration: service.duration_hours ? parseFloat(service.duration_hours) : null,
                description: service.job_desc || ''
            }));
            displayServices();
        } else {
            showNotification('Failed to load services: ' + result.error, 'error');
            displayServices(); // Show empty state
        }
    } catch (error) {
        console.error('Error loading services:', error);
        showNotification('Failed to load services from server', 'error');
        displayServices(); // Show empty state
    }
}

// Fetch service types from API
async function loadServiceTypes() {
    try {
        const response = await fetch('/api/service-types');
        const result = await response.json();

        if (result.success) {
            serviceTypes = result.data;
            // Update the category dropdown if it exists
            updateCategoryDropdown();
        }
    } catch (error) {
        console.error('Error loading service types:', error);
    }
}

// Update category dropdown with service types from database
function updateCategoryDropdown() {
    const categorySelect = document.getElementById('serviceCategory');
    if (categorySelect && serviceTypes.length > 0) {
        // Keep the first "Select Category" option
        const firstOption = categorySelect.options[0];
        categorySelect.innerHTML = '';
        categorySelect.appendChild(firstOption);

        // Add service types from database
        serviceTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.service_type_name;
            option.textContent = type.service_type_name;
            categorySelect.appendChild(option);
        });
    }
}

// Display all services
function displayServices() {
    const grid = document.getElementById('servicesGrid');

    if (!grid) return;

    if (services.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No Services Available</h3>
                <p>Click "Add New Service" to create your first service.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = services.map(service => {
        const price = typeof service.price === 'number' ? service.price : 0;
        const duration = service.duration ? parseFloat(service.duration) : null;

        return `
            <div class="service-card">
                <span class="service-category">${service.category || 'Uncategorized'}</span>
                <h3>${service.name || 'Unnamed Service'}</h3>
                <div class="service-price">$${price.toFixed(2)}</div>
                ${duration ? `<div class="service-duration">${duration} hours</div>` : ''}
                <div class="service-description">${service.description || 'No description available.'}</div>
                <div class="service-actions">
                    <button class="edit-btn" onclick="editService(${service.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteService(${service.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Open modal for adding new service
function openAddServiceModal() {
    document.getElementById('modalTitle').textContent = 'Add New Service';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceModal').style.display = 'block';
}

// Open modal for editing service
function editService(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;

    document.getElementById('modalTitle').textContent = 'Edit Service';
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceCategory').value = service.category;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceDuration').value = service.duration || '';
    document.getElementById('serviceDescription').value = service.description || '';

    document.getElementById('serviceModal').style.display = 'block';
}

// Close modal
function closeServiceModal() {
    document.getElementById('serviceModal').style.display = 'none';
    document.getElementById('serviceForm').reset();
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('serviceModal');
    if (event.target === modal) {
        closeServiceModal();
    }
}

// Handle form submission
document.getElementById('serviceForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const serviceId = document.getElementById('serviceId').value;
    const serviceData = {
        name: document.getElementById('serviceName').value,
        category: document.getElementById('serviceCategory').value,
        price: parseFloat(document.getElementById('servicePrice').value),
        duration: document.getElementById('serviceDuration').value ? parseFloat(document.getElementById('serviceDuration').value) : null,
        description: document.getElementById('serviceDescription').value
    };

    try {
        let response;
        if (serviceId) {
            // Edit existing service
            response = await fetch(`/api/services/${serviceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceData)
            });
        } else {
            // Add new service
            response = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceData)
            });
        }

        const result = await response.json();

        if (result.success) {
            showNotification(result.message || (serviceId ? 'Service updated successfully!' : 'Service added successfully!'), 'success');
            closeServiceModal();
            // Reload services from database
            await loadServices();
        } else {
            showNotification('Error: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error saving service:', error);
        showNotification('Failed to save service', 'error');
    }
});

// Delete service
async function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        try {
            const response = await fetch(`/api/services/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showNotification(result.message || 'Service deleted successfully!', 'success');
                // Reload services from database
                await loadServices();
            } else {
                showNotification('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            showNotification('Failed to delete service', 'error');
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
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

    // Remove after 3 seconds
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
