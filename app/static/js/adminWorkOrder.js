// Work order data from database
let workOrders = [];

let currentFilter = 'all';
let currentWorkOrderId = null;
let isEditMode = false;

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
  loadWorkOrders();
  setupEventListeners();
});

// Load work orders from API
async function loadWorkOrders() {
  try {
    // Show loading state
    showLoadingState();

    const response = await fetch('/api/service-requests');
    const data = await response.json();

    console.log('API Response:', data); // Debug log

    if (data.success && data.data) {
      console.log('Service requests count:', data.data.length); // Debug log
      workOrders = data.data.map(transformServiceRequestToWorkOrder);

      // Load service types first
      loadServiceTypes();

      // Load reviews for completed orders before rendering
      await loadReviewsForCompletedOrders();

      // Now render everything at once with all data loaded
      renderWorkOrders();

      // Set "All Orders" tab as active
      const allOrdersTab = document.querySelector('.tab-btn[onclick*="all"]');
      if (allOrdersTab) {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => tab.classList.remove('active'));
        allOrdersTab.classList.add('active');
      }
    } else {
      console.error('Failed to load work orders:', data.error || 'Unknown error');
      showError(data.error || 'Failed to load work orders');
    }
  } catch (error) {
    console.error('Error loading work orders:', error);
    showError('Network error loading work orders');
  }
}

// Transform service request data to work order format
function transformServiceRequestToWorkOrder(serviceRequest) {
  return {
    id: serviceRequest.request_id,
    customerName: `${serviceRequest.customer.first_name} ${serviceRequest.customer.last_name}`,
    customerPhone: serviceRequest.customer.phone,
    customerEmail: serviceRequest.customer.email,
    serviceType: serviceRequest.service.service_type,
    description: serviceRequest.request_description,
    status: serviceRequest.request_status, // Use actual database status
    dateScheduled: serviceRequest.preferred_datetime ? serviceRequest.preferred_datetime.split('T')[0] : '',
    technician: serviceRequest.assigned_employee ?
      `${serviceRequest.assigned_employee.first_name} ${serviceRequest.assigned_employee.last_name}` : null,
    estimatedCost: `$${serviceRequest.service.service_price.toFixed(2)}`,
    finalCost: serviceRequest.final_price ? `$${serviceRequest.final_price.toFixed(2)}` : null,
    address: serviceRequest.address,
    service: serviceRequest.service,
    assignedEmployee: serviceRequest.assigned_employee
  };
}

// Load reviews for completed work orders
async function loadReviewsForCompletedOrders() {
  const completedOrders = workOrders.filter(order => order.status === 'Completed');

  if (completedOrders.length === 0) {
    console.log('No completed orders found, skipping review loading');
    return; // No completed orders, skip review loading
  }

  console.log(`Loading reviews for ${completedOrders.length} completed orders:`, completedOrders.map(o => o.id));

  // Load reviews in parallel for better performance
  const reviewPromises = completedOrders.map(async (order) => {
    try {
      console.log(`Fetching review for order ${order.id}...`);
      const response = await fetch(`/api/reviews/${order.id}/get`);
      if (response.ok) {
        const reviewData = await response.json();
        console.log(`Review response for order ${order.id}:`, reviewData);
        if (reviewData.success && reviewData.review) {
          order.rating = parseFloat(reviewData.review.avg_rating);
          order.review = {
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            serviceQuality: reviewData.review.rating_quality,
            professionalism: reviewData.review.rating_professionalism,
            timeliness: reviewData.review.rating_timeliness,
            communication: reviewData.review.rating_communication,
            recommendation: reviewData.review.rating_overall,
            averageRating: parseFloat(reviewData.review.avg_rating),
            comments: reviewData.review.comments || 'No comments provided',
            submittedAt: new Date().toISOString().split('T')[0] // We don't have submission date in DB
          };
          console.log(`Review loaded for order ${order.id}: rating ${order.rating}`);
        } else {
          console.log(`No review data found for order ${order.id}`);
        }
      } else {
        console.log(`Review fetch failed for order ${order.id}: ${response.status}`);
      }
    } catch (error) {
      console.log(`Error fetching review for order ${order.id}:`, error);
    }
  });

  // Wait for all review requests to complete
  await Promise.all(reviewPromises);
  console.log('Reviews loaded successfully');
}

// Show loading state
function showLoadingState() {
  const tableContainer = document.querySelector('.workorder-table-container');
  tableContainer.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <h3>Loading Work Orders...</h3>
      <p>Please wait while we fetch work orders and reviews</p>
    </div>
  `;
}

// Show error message
function showError(message) {
  const tableContainer = document.querySelector('.workorder-table-container');
  tableContainer.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error Loading Work Orders</h3>
      <p>${message}</p>
      <button onclick="loadWorkOrders()" class="retry-btn">Retry</button>
    </div>
  `;
}

// Load service types for filter dropdown
async function loadServiceTypes() {
  try {
    // Extract unique service types from loaded work orders
    const uniqueServiceTypes = [...new Set(workOrders.map(order => order.serviceType))].sort();

    const serviceTypeFilter = document.getElementById('serviceTypeFilter');

    // Clear existing options except the first one
    serviceTypeFilter.innerHTML = '<option value="">All Service Types</option>';

    // Add service type options
    uniqueServiceTypes.forEach(serviceType => {
      if (serviceType) {
        const option = document.createElement('option');
        option.value = serviceType;
        option.textContent = serviceType;
        serviceTypeFilter.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Error loading service types:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
      searchWorkOrders();
    }
  });
}

// Render work orders in table
function renderWorkOrders(ordersToRender = null) {
  const orders = ordersToRender || workOrders;
  const tableContainer = document.querySelector('.workorder-table-container');

  // Restore table structure if it was replaced by loading/error state
  if (!tableContainer.querySelector('table')) {
    tableContainer.innerHTML = `
      <table class="workorder-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Service Type</th>
            <th>Status</th>
            <th>Date Scheduled</th>
            <th>Technician</th>
            <th>Cost</th>
            <th>Review</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="workOrderTableBody">
        </tbody>
      </table>
    `;
  }

  const tableBody = document.getElementById('workOrderTableBody');

  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">
          <p>No work orders found</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>#${order.id}</strong></td>
      <td>
        <div>${order.customerName}</div>
        <div style="font-size: 12px; color: #666;">${order.customerPhone}</div>
      </td>
      <td>${order.serviceType}</td>
      <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${formatStatus(order.status)}</span></td>
      <td>${formatDate(order.dateScheduled)}</td>
      <td>${order.technician || 'Not Assigned'}</td>
      <td>${order.finalCost || order.estimatedCost}</td>
      <td>${order.status === 'Completed' && order.rating ? renderRating(order.rating, order.id) : '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="view-btn" onclick="viewWorkOrder('${order.id}')">View</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Filter work orders by status
function filterWorkOrders(status) {
  currentFilter = status;

  // Update active tab
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Find and activate the correct tab
  if (event && event.target) {
    event.target.classList.add('active');
  } else {
    // If no event (programmatic call), find tab by status
    const targetTab = Array.from(tabs).find(tab => {
      const onclick = tab.getAttribute('onclick');
      return onclick && onclick.includes(`'${status}'`);
    });
    if (targetTab) {
      targetTab.classList.add('active');
    }
  }

  // Filter orders
  if (status === 'all') {
    renderWorkOrders();
  } else {
    // Map filter status to database status
    const statusMap = {
      'scheduled': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed'
    };
    const dbStatus = statusMap[status] || status;
    const filtered = workOrders.filter(order => order.status === dbStatus);
    renderWorkOrders(filtered);
  }
}

// Search work orders
function searchWorkOrders() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const serviceTypeFilter = document.getElementById('serviceTypeFilter').value;

  let filtered = workOrders;

  // Apply status filter
  if (currentFilter !== 'all') {
    // Map filter status to database status
    const statusMap = {
      'scheduled': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed'
    };
    const dbStatus = statusMap[currentFilter] || currentFilter;
    filtered = filtered.filter(order => order.status === dbStatus);
  }

  // Apply search term filter
  if (searchTerm) {
    filtered = filtered.filter(order =>
      order.id.toString().toLowerCase().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.customerPhone.includes(searchTerm) ||
      order.customerEmail.toLowerCase().includes(searchTerm) ||
      (order.technician && order.technician.toLowerCase().includes(searchTerm))
    );
  }

  // Apply service type filter
  if (serviceTypeFilter) {
    filtered = filtered.filter(order => order.serviceType === serviceTypeFilter);
  }

  renderWorkOrders(filtered);
}

// Format status text
function formatStatus(status) {
  // Handle database status values directly
  return status;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Render rating with stars
function renderRating(rating, orderId) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '';

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }

  // Half star
  if (hasHalfStar) {
    stars += '⯨';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆';
  }

  return `<span class="review-stars" onclick="openReviewModal('${orderId}')">${stars}</span> <span style="color: #666; font-size: 13px;">(${rating})</span>`;
}

// Open create modal
function openCreateModal() {
  document.getElementById('createWorkOrderModal').style.display = 'block';
  document.getElementById('createWorkOrderForm').reset();
}

// Close create modal
function closeCreateModal() {
  document.getElementById('createWorkOrderModal').style.display = 'none';
}

// Handle create form submission (placeholder - not yet implemented)
// TODO: Implement create work order using API endpoints

// View work order details
function viewWorkOrder(orderId) {
  const order = workOrders.find(o => o.id == orderId);
  if (!order) return;

  currentWorkOrderId = orderId;
  isEditMode = false;

  const detailsDiv = document.getElementById('workOrderDetails');
  detailsDiv.innerHTML = `
    <div class="detail-group">
      <label>Order ID</label>
      <div class="detail-value">#${order.id}</div>
    </div>
    <div class="detail-group">
      <label>Status</label>
      <div class="detail-value">
        <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${formatStatus(order.status)}</span>
      </div>
    </div>
    <div class="detail-group">
      <label>Customer Name</label>
      <div class="detail-value" id="view-customerName">${order.customerName}</div>
    </div>
    <div class="detail-group">
      <label>Phone Number</label>
      <div class="detail-value" id="view-customerPhone">${order.customerPhone}</div>
    </div>
    <div class="detail-group">
      <label>Email Address</label>
      <div class="detail-value" id="view-customerEmail">${order.customerEmail}</div>
    </div>
    <div class="detail-group">
      <label>Service Type</label>
      <div class="detail-value" id="view-serviceType">${order.serviceType}</div>
    </div>
    <div class="detail-group">
      <label>Service</label>
      <div class="detail-value">${order.service ? order.service.job_name : 'N/A'}</div>
    </div>
    <div class="detail-group">
      <label>Scheduled Date</label>
      <div class="detail-value" id="view-dateScheduled">${formatDate(order.dateScheduled)}</div>
    </div>
    <div class="detail-group">
      <label>Assigned Technician</label>
      <div class="detail-value" id="view-technician">${order.technician || 'Not Assigned'}</div>
    </div>
    <div class="detail-group">
      <label>Service Price</label>
      <div class="detail-value">${order.estimatedCost}</div>
    </div>
    ${order.finalCost ? `
    <div class="detail-group">
      <label>Final Price</label>
      <div class="detail-value" id="view-finalCost">${order.finalCost}</div>
    </div>
    ` : ''}
    ${order.address ? `
    <div class="detail-group">
      <label>Service Address</label>
      <div class="detail-value">${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zip_code}</div>
    </div>
    ` : ''}
    <div class="detail-group full-width">
      <label>Description</label>
      <div class="detail-value" id="view-description">${order.description}</div>
    </div>
  `;

  document.getElementById('modalTitle').textContent = 'Work Order Details';
  document.getElementById('editBtn').style.display = 'none';
  document.getElementById('deleteBtn').style.display = 'none';
  document.getElementById('workOrderModal').style.display = 'block';
}

// Enable edit mode
function enableEdit() {
  alert('Edit functionality will be implemented to use API endpoints for updating service requests.');
  return;

  // TODO: Implement edit functionality using API endpoints:
  // - PUT /api/service-requests/{id}/status for status changes
  // - PUT /api/service-requests/{id}/assign for technician assignment
  // - Other endpoints as needed for customer/service updates

  document.getElementById('modalTitle').textContent = 'Edit Work Order';
  document.getElementById('editBtn').textContent = 'Save Changes';
  document.getElementById('editBtn').onclick = saveWorkOrder;
  document.getElementById('deleteBtn').style.display = 'none';
}

// Delete work order
async function deleteWorkOrder() {
  if (confirm('Are you sure you want to delete this service request? This action cannot be undone.')) {
    try {
      const response = await fetch(`/api/service-requests/${currentWorkOrderId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local array
        workOrders = workOrders.filter(o => o.id != currentWorkOrderId);
        renderWorkOrders();
        closeWorkOrderModal();
        alert('Service request deleted successfully!');
      } else {
        alert('Failed to delete service request: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting service request:', error);
      alert('Network error deleting service request');
    }
  }
}

// Close work order modal
function closeWorkOrderModal() {
  document.getElementById('workOrderModal').style.display = 'none';
  currentWorkOrderId = null;
  isEditMode = false;
}

// Close modals when clicking outside
window.onclick = function (event) {
  const workOrderModal = document.getElementById('workOrderModal');
  const createModal = document.getElementById('createWorkOrderModal');
  const reviewModal = document.getElementById('reviewDetailsModal');

  if (event.target === workOrderModal) {
    closeWorkOrderModal();
  }
  if (event.target === createModal) {
    closeCreateModal();
  }
  if (event.target === reviewModal) {
    closeReviewModal();
  }
}

// Open review details modal
function openReviewModal(orderId) {
  console.log('Opening review modal for order ID:', orderId, typeof orderId);
  const order = workOrders.find(o => o.id == orderId); // Use == for loose comparison

  console.log('Found order:', order);
  if (!order) {
    console.log('Order not found in workOrders array');
    alert('Work order not found.');
    return;
  }

  if (!order.review) {
    console.log('No review data found for order:', order);
    alert('No review available for this work order.');
    return;
  }

  const review = order.review;
  const modal = document.getElementById('reviewDetailsModal');
  const content = document.getElementById('reviewDetailsContent');

  // Helper function to render stars
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '★';
    if (hasHalfStar) stars += '⯨';
    for (let i = 0; i < emptyStars; i++) stars += '☆';

    return stars;
  };

  // Question titles and descriptions
  const questions = [
    {
      title: 'Service Quality',
      description: 'Quality of work performed',
      rating: review.serviceQuality
    },
    {
      title: 'Professionalism',
      description: 'Professional behavior and expertise',
      rating: review.professionalism
    },
    {
      title: 'Timeliness',
      description: 'Completion within scheduled time',
      rating: review.timeliness
    },
    {
      title: 'Communication',
      description: 'Clarity and responsiveness',
      rating: review.communication
    },
    {
      title: 'Overall Experience',
      description: 'Would you recommend our service?',
      rating: review.recommendation
    }
  ];

  // Build the review details HTML
  content.innerHTML = `
    <div class="review-header-info">
      <h3>Work Order: #${order.id}</h3>
      <div style="color: #666; margin-top: 5px;">
        <strong>Customer:</strong> ${review.customerName}<br>
        <strong>Email:</strong> ${review.customerEmail}<br>
        <strong>Service:</strong> ${order.serviceType}
      </div>
      <div class="review-overall-rating">
        <span class="overall-rating-label">Overall Rating:</span>
        <span class="overall-rating-stars">${renderStars(review.averageRating)}</span>
        <span class="overall-rating-score">${review.averageRating.toFixed(1)}/5.0</span>
      </div>
    </div>
    
    <div class="review-questions">
      ${questions.map(q => `
        <div class="review-question-item">
          <div class="question-header">
            <div>
              <div class="question-title">${q.title}</div>
              <div class="question-description">${q.description}</div>
            </div>
            <div class="question-rating">
              <span class="question-rating-stars">${renderStars(q.rating)}</span>
              <span class="question-rating-number">${q.rating}/5</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="review-comments">
      <h4>Additional Comments</h4>
      <div class="comments-text ${!review.comments ? 'no-comments' : ''}">
        ${review.comments || 'No additional comments provided.'}
      </div>
    </div>
    
    <div class="review-metadata">
      <p><strong>Submitted:</strong> ${formatDate(review.submittedAt)}</p>
      <p><strong>Work Completed:</strong> ${formatDate(order.dateScheduled)}</p>
    </div>
  `;

  modal.style.display = 'block';
}

// Close review modal
function closeReviewModal() {
  document.getElementById('reviewDetailsModal').style.display = 'none';
}
