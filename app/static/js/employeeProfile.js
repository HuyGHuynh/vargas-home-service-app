// Specialty Icons Mapping (matching database records)
const specialtyIcons = {
  'HVAC Electrician': '❄️⚡',
  'Plumber': '�',
  'Electrician': '⚡',
  'Landscaper': '�',
  'Painter': '�'
};

// Current Employee Data will be loaded from database
let currentEmployee = null;

// Populate Profile Data
function populateProfile() {
  if (!currentEmployee) {
    console.error('No employee data available');
    return;
  }

  // Header
  document.getElementById('employeeName').textContent = `${currentEmployee.firstName} ${currentEmployee.lastName}`;
  document.getElementById('employeeRole').textContent = formatRole(currentEmployee.role);
  document.getElementById('profileFullName').textContent = `${currentEmployee.firstName} ${currentEmployee.lastName}`;
  document.getElementById('profileRole').textContent = formatRole(currentEmployee.role);

  // Personal Information
  document.getElementById('employeeId').textContent = currentEmployee.employeeId;
  document.getElementById('hireDate').textContent = formatDate(currentEmployee.hireDate);
  document.getElementById('firstName').textContent = currentEmployee.firstName;
  document.getElementById('lastName').textContent = currentEmployee.lastName;

  // Contact Information
  document.getElementById('email').textContent = currentEmployee.email;
  document.getElementById('phone').textContent = currentEmployee.phone;
  // Display password as masked characters for security
  document.getElementById('password').textContent = '••••••••';

  // Specialties
  displaySpecialties();
}

// Format role for display
function formatRole(role) {
  if (role === 'employee') return 'Employee';
  if (role === 'admin') return 'Admin';
  return role;
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '';

  // Parse the date string directly to avoid timezone issues
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed in Date constructor
    const day = parseInt(parts[2]);
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Fallback to original method if format is unexpected
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Display Specialties as Badges
function displaySpecialties() {
  const specialtiesContainer = document.getElementById('specialtiesContainer');

  if (!currentEmployee || !currentEmployee.specialties || currentEmployee.specialties.length === 0) {
    specialtiesContainer.innerHTML = '<p style="color: #666; font-style: italic;">No specialties assigned</p>';
    return;
  }

  specialtiesContainer.innerHTML = '';

  currentEmployee.specialties.forEach(specialtyName => {
    const specialtyBadge = document.createElement('div');
    specialtyBadge.className = 'skill-badge';
    const icon = specialtyIcons[specialtyName] || '🔧';
    specialtyBadge.innerHTML = `
      <span class="skill-icon">${icon}</span>
      <span>${specialtyName}</span>
    `;
    specialtiesContainer.appendChild(specialtyBadge);
  });
}

// Load current employee data from database
async function loadCurrentEmployee() {
  try {
    // Get employee ID from URL or session - for now, we'll use employee ID 1
    // In a real app, this would come from the logged-in user's session
    const employeeId = getEmployeeIdFromUrl() || 1;

    const response = await fetch(`/api/employees/${employeeId}`);
    const result = await response.json();

    if (result.success) {
      currentEmployee = result.data;
      populateProfile();
    } else {
      console.error('Error loading employee profile:', result.error);
      // Show error message or redirect to login
    }
  } catch (error) {
    console.error('Error loading employee profile:', error);
    // Show error message or redirect to login
  }
}

// Extract employee ID from URL (if using route like /employee/{id}/profile)
function getEmployeeIdFromUrl() {
  const pathParts = window.location.pathname.split('/');
  const employeeIndex = pathParts.indexOf('employee');
  if (employeeIndex !== -1 && pathParts[employeeIndex + 1]) {
    return parseInt(pathParts[employeeIndex + 1]);
  }
  return null;
}

// Initialize Profile on Page Load
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentEmployee();
});

// Availability Modal Function (for navigation link)
function openAvailabilityModal() {
  // Redirect to employee view with modal open
  window.location.href = 'employeeView.html';
  // Note: In a real application, you would pass a parameter to open the modal
  // For now, the user will need to click the button again on the dashboard
}
