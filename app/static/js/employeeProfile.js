// Specialty Icons Mapping (matching database records)
const specialtyIcons = {
  'HVAC Electrician': '❄️⚡',
  'Plumber': '�',
  'Electrician': '⚡',
  'Landscaper': '�',
  'Painter': '�'
};

// Current Employee Data (now loaded server-side)
// This file now primarily handles dynamic interactions since data is rendered server-side

// Utility functions kept for potential future use

// Format role for display (now handled server-side, but kept for consistency)
function formatRole(role) {
  if (role === 'employee') return 'Employee';
  if (role === 'admin') return 'Admin';
  return role;
}

// Format date for display (now handled server-side, but kept for potential client-side formatting)
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

// Initialize Profile on Page Load (data is now server-side rendered)
document.addEventListener('DOMContentLoaded', () => {
  console.log('Employee profile loaded with server-side data');

  // Any additional dynamic functionality can be added here
  // For example, if you want to add edit functionality later
});

// Availability Modal Function (for navigation link)
function openAvailabilityModal() {
  // Redirect to employee view with modal open
  window.location.href = 'employeeView.html';
  // Note: In a real application, you would pass a parameter to open the modal
  // For now, the user will need to click the button again on the dashboard
}
