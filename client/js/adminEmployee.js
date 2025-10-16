// Sample employee data
let employees = [
    {
        id: 1,
        firstName: "Michael",
        lastName: "Thompson",
        email: "m.thompson@vargas.com",
        phone: "(555) 234-5678",
        address: "456 Oak Street, Springfield, IL 62701",
        role: "senior-technician",
        payRate: 35.00,
        hireDate: "2022-03-15",
        status: "active",
        skills: ["Plumbing", "HVAC", "Electrical"],
        certifications: "Licensed Plumber, EPA 608 Universal Certification, OSHA 10",
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: "07:00",
        endTime: "16:00",
        notes: "Excellent with commercial HVAC systems"
    },
    {
        id: 2,
        firstName: "Sarah",
        lastName: "Martinez",
        email: "s.martinez@vargas.com",
        phone: "(555) 345-6789",
        address: "789 Pine Avenue, Springfield, IL 62702",
        role: "technician",
        payRate: 28.50,
        hireDate: "2023-06-01",
        status: "active",
        skills: ["Electrical", "Carpentry"],
        certifications: "Licensed Electrician, Residential Wiring Specialist",
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        startTime: "08:00",
        endTime: "17:00",
        notes: "Specializes in electrical renovations"
    },
    {
        id: 3,
        firstName: "David",
        lastName: "Chen",
        email: "d.chen@vargas.com",
        phone: "(555) 456-7890",
        address: "321 Maple Drive, Springfield, IL 62703",
        role: "manager",
        payRate: 45.00,
        hireDate: "2020-01-10",
        status: "active",
        skills: ["Plumbing", "HVAC", "Electrical", "Carpentry", "Roofing"],
        certifications: "Master Plumber, Project Management Professional (PMP), EPA Universal",
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: "08:00",
        endTime: "18:00",
        notes: "Operations manager with 15 years experience"
    },
    {
        id: 4,
        firstName: "Jessica",
        lastName: "Williams",
        email: "j.williams@vargas.com",
        phone: "(555) 567-8901",
        address: "654 Elm Street, Springfield, IL 62704",
        role: "technician",
        payRate: 26.00,
        hireDate: "2024-02-15",
        status: "active",
        skills: ["Painting", "Flooring", "Carpentry"],
        certifications: "Certified Flooring Installer, Interior Design Certificate",
        availability: ["Monday", "Wednesday", "Friday", "Saturday"],
        startTime: "09:00",
        endTime: "17:00",
        notes: "Excellent finish work and attention to detail"
    },
    {
        id: 5,
        firstName: "Robert",
        lastName: "Johnson",
        email: "r.johnson@vargas.com",
        phone: "(555) 678-9012",
        address: "987 Cedar Lane, Springfield, IL 62705",
        role: "senior-technician",
        payRate: 32.00,
        hireDate: "2021-09-20",
        status: "on-leave",
        skills: ["Roofing", "Carpentry"],
        certifications: "Licensed Roofing Contractor, Fall Protection Certified",
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: "07:00",
        endTime: "15:00",
        notes: "On medical leave - returning next month"
    },
    {
        id: 6,
        firstName: "Emily",
        lastName: "Davis",
        email: "e.davis@vargas.com",
        phone: "(555) 789-0123",
        address: "159 Birch Road, Springfield, IL 62706",
        role: "admin",
        payRate: 28.00,
        hireDate: "2023-04-01",
        status: "active",
        skills: [],
        certifications: "Administrative Professional Certification, QuickBooks Certified",
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: "08:00",
        endTime: "17:00",
        notes: "Handles scheduling and customer service"
    }
];

let currentFilter = 'all';

// Load employees on page load
document.addEventListener('DOMContentLoaded', function() {
    displayEmployees('all');
});

// Filter employees by role
function filterEmployees(role) {
    currentFilter = role;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayEmployees(role);
}

// Display employees
function displayEmployees(filter) {
    const grid = document.getElementById('employeesGrid');
    let filteredEmployees = employees;
    
    if (filter !== 'all') {
        filteredEmployees = employees.filter(e => e.role === filter);
    }
    
    if (filteredEmployees.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                <h3>No Employees Found</h3>
                <p>No employees match the current filter.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredEmployees.map(emp => {
        const initials = emp.firstName.charAt(0) + emp.lastName.charAt(0);
        const roleDisplay = emp.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const availabilityDays = emp.availability.length === 7 ? 'All days' : 
                                 emp.availability.length === 5 && !emp.availability.includes('Saturday') && !emp.availability.includes('Sunday') ? 
                                 'Weekdays' : emp.availability.join(', ');
        
        return `
            <div class="employee-card">
                <span class="employee-status ${emp.status}">${emp.status.replace('-', ' ')}</span>
                
                <div class="employee-header-card">
                    <div class="employee-avatar">${initials}</div>
                    <div class="employee-basic-info">
                        <h3>${emp.firstName} ${emp.lastName}</h3>
                        <span class="employee-role">${roleDisplay}</span>
                    </div>
                </div>
                
                <div class="employee-info">
                    <div class="employee-info-item">
                        <span class="icon">✉️</span>
                        <span>${emp.email}</span>
                    </div>
                    <div class="employee-info-item">
                        <span class="icon">📞</span>
                        <span>${emp.phone}</span>
                    </div>
                    <div class="employee-info-item">
                        <span class="icon">📅</span>
                        <span>Hired: ${formatDate(emp.hireDate)}</span>
                    </div>
                </div>
                
                ${emp.skills.length > 0 ? `
                    <div class="employee-skills">
                        <h4>Skills</h4>
                        <div class="skills-tags">
                            ${emp.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="employee-pay">
                    <span class="pay-label">Pay Rate</span>
                    <span class="pay-rate">$${emp.payRate.toFixed(2)}/hr</span>
                </div>
                
                <div class="employee-availability">
                    <h4>Availability</h4>
                    <div class="availability-info">
                        <div>${availabilityDays}</div>
                        <div>${formatTime(emp.startTime)} - ${formatTime(emp.endTime)}</div>
                    </div>
                </div>
                
                <div class="employee-actions">
                    <button class="edit-btn" onclick="editEmployee(${emp.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteEmployee(${emp.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Open modal for adding new employee
function openAddEmployeeModal() {
    document.getElementById('modalTitle').textContent = 'Add New Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    
    // Set default values
    document.getElementById('employmentStatus').value = 'active';
    document.getElementById('startTime').value = '08:00';
    document.getElementById('endTime').value = '17:00';
    
    // Check weekday availability by default
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    document.querySelectorAll('input[name="availability"]').forEach(checkbox => {
        checkbox.checked = weekdays.includes(checkbox.value);
    });
    
    document.getElementById('employeeModal').style.display = 'block';
}

// Edit employee
function editEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Employee';
    document.getElementById('employeeId').value = employee.id;
    document.getElementById('firstName').value = employee.firstName;
    document.getElementById('lastName').value = employee.lastName;
    document.getElementById('email').value = employee.email;
    document.getElementById('phone').value = employee.phone;
    document.getElementById('address').value = employee.address || '';
    document.getElementById('employeeRole').value = employee.role;
    document.getElementById('payRate').value = employee.payRate;
    document.getElementById('hireDate').value = employee.hireDate;
    document.getElementById('employmentStatus').value = employee.status;
    document.getElementById('certifications').value = employee.certifications || '';
    document.getElementById('startTime').value = employee.startTime;
    document.getElementById('endTime').value = employee.endTime;
    document.getElementById('notes').value = employee.notes || '';
    
    // Set skills checkboxes
    document.querySelectorAll('input[name="skills"]').forEach(checkbox => {
        checkbox.checked = employee.skills.includes(checkbox.value);
    });
    
    // Set availability checkboxes
    document.querySelectorAll('input[name="availability"]').forEach(checkbox => {
        checkbox.checked = employee.availability.includes(checkbox.value);
    });
    
    document.getElementById('employeeModal').style.display = 'block';
}

// Close modal
function closeEmployeeModal() {
    document.getElementById('employeeModal').style.display = 'none';
    document.getElementById('employeeForm').reset();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('employeeModal');
    if (event.target === modal) {
        closeEmployeeModal();
    }
}

// Handle form submission
document.getElementById('employeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value;
    
    // Get selected skills
    const skills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
                        .map(cb => cb.value);
    
    // Get selected availability
    const availability = Array.from(document.querySelectorAll('input[name="availability"]:checked'))
                              .map(cb => cb.value);
    
    // Validate at least one skill is selected (except for admin role)
    const role = document.getElementById('employeeRole').value;
    if (role !== 'admin' && skills.length === 0) {
        showNotification('Please select at least one skill for this employee', 'error');
        return;
    }
    
    // Validate at least one day of availability
    if (availability.length === 0) {
        showNotification('Please select at least one day of availability', 'error');
        return;
    }
    
    const employeeData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        role: role,
        payRate: parseFloat(document.getElementById('payRate').value),
        hireDate: document.getElementById('hireDate').value,
        status: document.getElementById('employmentStatus').value,
        skills: skills,
        certifications: document.getElementById('certifications').value,
        availability: availability,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        notes: document.getElementById('notes').value
    };
    
    if (employeeId) {
        // Edit existing employee
        const index = employees.findIndex(e => e.id === parseInt(employeeId));
        if (index !== -1) {
            employees[index] = { ...employees[index], ...employeeData };
            showNotification('Employee updated successfully!', 'success');
        }
    } else {
        // Add new employee
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        employees.push({ id: newId, ...employeeData });
        showNotification('Employee added successfully!', 'success');
    }
    
    displayEmployees(currentFilter);
    closeEmployeeModal();
    
    // TODO: Send data to backend
    // fetch('/api/admin/employees', {
    //     method: employeeId ? 'PUT' : 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(employeeData)
    // });
});

// Delete employee
function deleteEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;
    
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
        employees = employees.filter(e => e.id !== id);
        displayEmployees(currentFilter);
        showNotification('Employee deleted successfully!', 'success');
        
        // TODO: Send delete request to backend
        // fetch(`/api/admin/employees/${id}`, { method: 'DELETE' });
    }
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
