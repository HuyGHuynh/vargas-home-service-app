// Skill Icons Mapping (matching admin employee management system)
const skillIcons = {
  'Plumbing': '🔧',
  'Electrical': '⚡',
  'HVAC': '❄️',
  'Carpentry': '🔨',
  'Painting': '🎨',
  'Roofing': '🏠',
  'Flooring': '📐',
  'Landscaping': '🌿'
};

// Current Employee Data (matching adminEmployee.js structure)
const currentEmployee = {
  id: 1,
  employeeId: 'EMP-001',
  firstName: 'Michael',
  lastName: 'Thompson',
  email: 'm.thompson@vargas.com',
  phone: '(555) 234-5678',
  address: '456 Oak Street, Springfield, IL 62701',
  role: 'Senior Technician',
  payRate: 35.00,
  hireDate: '2022-03-15',
  status: 'active',
  skills: ['Plumbing', 'HVAC', 'Electrical'],
  certifications: 'Licensed Plumber, EPA 608 Universal Certification, OSHA 10',
  availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '07:00',
  endTime: '16:00',
  notes: 'Excellent with commercial HVAC systems'
};

// Populate Profile Data
function populateProfile() {
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

  // Address (parse from single address field)
  parseAndDisplayAddress(currentEmployee.address);

  // Skills & Certifications
  displaySkills();
  displayCertifications();
}

// Format role for display
function formatRole(role) {
  if (role === 'senior-technician') return 'Senior Technician';
  if (role === 'technician') return 'Technician';
  if (role === 'manager') return 'Manager';
  if (role === 'admin') return 'Administrator';
  return role;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Parse address into components
function parseAndDisplayAddress(addressString) {
  // Format: "456 Oak Street, Springfield, IL 62701"
  const parts = addressString.split(',').map(p => p.trim());
  
  if (parts.length >= 3) {
    document.getElementById('street').textContent = parts[0];
    document.getElementById('city').textContent = parts[1];
    
    // Parse state and zip from last part
    const stateZip = parts[2].split(' ');
    document.getElementById('state').textContent = stateZip[0];
    document.getElementById('zip').textContent = stateZip[1] || '';
  } else {
    // If address format is different, display as-is
    document.getElementById('street').textContent = addressString;
    document.getElementById('city').textContent = '';
    document.getElementById('state').textContent = '';
    document.getElementById('zip').textContent = '';
  }
}

// Display Skills as Badges
function displaySkills() {
  const skillsContainer = document.getElementById('skillsContainer');
  
  if (currentEmployee.skills.length === 0) {
    skillsContainer.innerHTML = '<p style="color: #666; font-style: italic;">No skills assigned</p>';
    return;
  }

  skillsContainer.innerHTML = '';
  
  currentEmployee.skills.forEach(skillName => {
    const skillBadge = document.createElement('div');
    skillBadge.className = 'skill-badge';
    const icon = skillIcons[skillName] || '🔧';
    skillBadge.innerHTML = `
      <span class="skill-icon">${icon}</span>
      <span>${skillName}</span>
    `;
    skillsContainer.appendChild(skillBadge);
  });
}

// Display Certifications
function displayCertifications() {
  const certificationsContainer = document.getElementById('certificationsContainer');
  
  if (!currentEmployee.certifications || currentEmployee.certifications.trim() === '') {
    certificationsContainer.innerHTML = '<p style="color: #666; font-style: italic;">No certifications on file</p>';
    return;
  }

  // Split certifications by comma and create list
  const certList = currentEmployee.certifications.split(',').map(cert => cert.trim());
  
  certificationsContainer.innerHTML = '';
  certList.forEach(cert => {
    const certItem = document.createElement('div');
    certItem.className = 'certification-item';
    certItem.innerHTML = `
      <span class="cert-icon">📜</span>
      <span>${cert}</span>
    `;
    certificationsContainer.appendChild(certItem);
  });
}

// Initialize Profile on Page Load
document.addEventListener('DOMContentLoaded', () => {
  populateProfile();
});

// Availability Modal Function (for navigation link)
function openAvailabilityModal() {
  // Redirect to employee view with modal open
  window.location.href = 'employeeView.html';
  // Note: In a real application, you would pass a parameter to open the modal
  // For now, the user will need to click the button again on the dashboard
}
