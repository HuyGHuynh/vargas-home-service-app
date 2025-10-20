// Sample hardcoded services data
let services = [
    {
        id: 1,
        name: "Basic Plumbing Repair",
        category: "Plumbing",
        price: 125.00,
        duration: 1.5,
        description: "Fix leaky faucets, clogged drains, and minor pipe repairs. Includes basic materials and labor."
    },
    {
        id: 2,
        name: "Electrical Outlet Installation",
        category: "Electrical",
        price: 95.00,
        duration: 1.0,
        description: "Install new electrical outlets or replace existing ones. Includes wiring and safety inspection."
    },
    {
        id: 3,
        name: "HVAC Maintenance",
        category: "HVAC",
        price: 150.00,
        duration: 2.0,
        description: "Complete heating and cooling system inspection, filter replacement, and performance check."
    },
    {
        id: 4,
        name: "Interior Painting (per room)",
        category: "Painting",
        price: 350.00,
        duration: 6.0,
        description: "Professional interior painting service for standard-sized rooms. Includes prep work and cleanup."
    },
    {
        id: 5,
        name: "Drywall Repair",
        category: "General Repairs",
        price: 180.00,
        duration: 3.0,
        description: "Repair holes, cracks, and damage to drywall. Includes patching, sanding, and painting to match."
    },
    {
        id: 6,
        name: "Kitchen Faucet Replacement",
        category: "Plumbing",
        price: 200.00,
        duration: 2.0,
        description: "Remove old faucet and install new one. Faucet not included in price."
    },
    {
        id: 7,
        name: "Ceiling Fan Installation",
        category: "Electrical",
        price: 175.00,
        duration: 2.5,
        description: "Install new ceiling fan with light fixture. Fan not included in price."
    },
    {
        id: 8,
        name: "Gutter Cleaning",
        category: "Landscaping",
        price: 120.00,
        duration: 2.0,
        description: "Complete gutter cleaning and debris removal for average-sized home."
    },
    {
        id: 9,
        name: "Door Lock Replacement",
        category: "General Repairs",
        price: 85.00,
        duration: 0.5,
        description: "Replace existing door locks with new hardware. Lock not included in price."
    },
    {
        id: 10,
        name: "Water Heater Inspection",
        category: "Plumbing",
        price: 110.00,
        duration: 1.0,
        description: "Comprehensive water heater inspection and maintenance check."
    }
];

// Load services on page load
document.addEventListener('DOMContentLoaded', function() {
    displayServices();
});

// Display all services
function displayServices() {
    const grid = document.getElementById('servicesGrid');
    
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
    
    grid.innerHTML = services.map(service => `
        <div class="service-card">
            <span class="service-category">${service.category}</span>
            <h3>${service.name}</h3>
            <div class="service-price">$${service.price.toFixed(2)}</div>
            ${service.duration ? `<div class="service-duration">${service.duration} hours</div>` : ''}
            <div class="service-description">${service.description || 'No description available.'}</div>
            <div class="service-actions">
                <button class="edit-btn" onclick="editService(${service.id})">Edit</button>
                <button class="delete-btn" onclick="deleteService(${service.id})">Delete</button>
            </div>
        </div>
    `).join('');
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
window.onclick = function(event) {
    const modal = document.getElementById('serviceModal');
    if (event.target === modal) {
        closeServiceModal();
    }
}

// Handle form submission
document.getElementById('serviceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const serviceId = document.getElementById('serviceId').value;
    const serviceData = {
        name: document.getElementById('serviceName').value,
        category: document.getElementById('serviceCategory').value,
        price: parseFloat(document.getElementById('servicePrice').value),
        duration: parseFloat(document.getElementById('serviceDuration').value) || null,
        description: document.getElementById('serviceDescription').value
    };
    
    if (serviceId) {
        // Edit existing service
        const index = services.findIndex(s => s.id === parseInt(serviceId));
        if (index !== -1) {
            services[index] = { ...services[index], ...serviceData };
            showNotification('Service updated successfully!', 'success');
        }
    } else {
        // Add new service
        const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
        services.push({ id: newId, ...serviceData });
        showNotification('Service added successfully!', 'success');
    }
    
    displayServices();
    closeServiceModal();
    
    // TODO: Send data to backend
    // fetch('/api/services', {
    //     method: serviceId ? 'PUT' : 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(serviceData)
    // });
});

// Delete service
function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        services = services.filter(s => s.id !== id);
        displayServices();
        showNotification('Service deleted successfully!', 'success');
        
        // TODO: Send delete request to backend
        // fetch(`/api/services/${id}`, { method: 'DELETE' });
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
