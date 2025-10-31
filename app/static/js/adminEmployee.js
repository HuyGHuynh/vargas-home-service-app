// Employee data will be loaded from database
let employees = [];
let specialties = [];
let currentFilter = 'all';

// Load employees and specialties on page load
document.addEventListener('DOMContentLoaded', function () {
    loadSpecialties();
    loadEmployees();
});

// Load specialties from database
async function loadSpecialties() {
    try {
        const response = await fetch('/api/specialties');
        const result = await response.json();

        if (result.success) {
            specialties = result.data;
            // Update specialty checkboxes if modal is already loaded
            updateSpecialtyCheckboxes();
        } else {
            showNotification('Error loading specialties: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error loading specialties:', error);
        showNotification('Error loading specialties', 'error');
    }
}

// Update specialty checkboxes in the form
function updateSpecialtyCheckboxes() {
    const checkboxContainer = document.querySelector('.checkbox-grid');
    if (checkboxContainer && specialties.length > 0) {
        checkboxContainer.innerHTML = specialties.map(specialty => `
            <label class="checkbox-label">
                <input type="checkbox" name="specialties" value="${specialty.name}"> ${specialty.name}
            </label>
        `).join('');
    }
}

// Load employees from database
async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        const result = await response.json();

        if (result.success) {
            employees = result.data;
            displayEmployees(currentFilter);
        } else {
            showNotification('Error loading employees: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        showNotification('Error loading employees', 'error');
    }
}

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

        return `
            <div class="employee-card">
                <span class="employee-status ${emp.status.toLowerCase().replace(' ', '-')}">${emp.status}</span>
                
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
                
                ${emp.specialties.length > 0 ? `
                    <div class="employee-skills">
                        <h4>Specialties</h4>
                        <div class="skills-tags">
                            ${emp.specialties.map(specialty => `<span class="skill-tag">${specialty}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
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
    document.getElementById('employmentStatus').value = 'Active';

    // Update specialty checkboxes
    updateSpecialtyCheckboxes();

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
    document.getElementById('password').value = employee.password;
    document.getElementById('employeeRole').value = employee.role;
    document.getElementById('hireDate').value = employee.hireDate;
    document.getElementById('employmentStatus').value = employee.status;

    // Update specialty checkboxes first
    updateSpecialtyCheckboxes();

    // Then set specialties checkboxes based on employee data
    setTimeout(() => {
        document.querySelectorAll('input[name="specialties"]').forEach(checkbox => {
            checkbox.checked = employee.specialties.includes(checkbox.value);
        });
    }, 50);

    document.getElementById('employeeModal').style.display = 'block';
}

// Close modal
function closeEmployeeModal() {
    document.getElementById('employeeModal').style.display = 'none';
    document.getElementById('employeeForm').reset();
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('employeeModal');
    if (event.target === modal) {
        closeEmployeeModal();
    }
}

// Handle form submission
document.getElementById('employeeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const employeeId = document.getElementById('employeeId').value;

    // Get selected specialties
    const specialties = Array.from(document.querySelectorAll('input[name="specialties"]:checked'))
        .map(cb => cb.value);

    // Validate at least one specialty is selected (except for admin role)
    const role = document.getElementById('employeeRole').value;
    if (role !== 'admin' && specialties.length === 0) {
        showNotification('Please select at least one specialty for this employee', 'error');
        return;
    }

    const employeeData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        role: role,
        hireDate: document.getElementById('hireDate').value,
        status: document.getElementById('employmentStatus').value,
        specialties: specialties
    };

    try {
        const method = employeeId ? 'PUT' : 'POST';
        const url = employeeId ? `/api/employees/${employeeId}` : '/api/employees';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
            closeEmployeeModal();
            loadEmployees(); // Reload employees from database
        } else {
            showNotification('Error: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error saving employee:', error);
        showNotification('Error saving employee', 'error');
    }
});

// Delete employee
async function deleteEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
        try {
            const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
            const result = await response.json();

            if (result.success) {
                showNotification(result.message, 'success');
                loadEmployees(); // Reload employees from database
            } else {
                showNotification('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            showNotification('Error deleting employee', 'error');
        }
    }
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return '';

    // Parse the date string directly to avoid timezone issues  
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed in Date constructor
        const day = parseInt(parts[2]);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Fallback to original method if format is unexpected
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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
