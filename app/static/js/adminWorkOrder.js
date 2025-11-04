// Sample work order data
let workOrders = [
  {
    id: 'WO-2024-001',
    customerName: 'John Smith',
    customerPhone: '(555) 123-4567',
    customerEmail: 'john.smith@email.com',
    serviceType: 'Kitchen Remodel',
    description: 'Complete kitchen renovation including new cabinets, countertops, and appliances.',
    status: 'scheduled',
    dateScheduled: '2024-11-15',
    technician: 'Mike Johnson',
    priority: 'Normal',
    estimatedCost: '$15,000.00',
    dateCreated: '2024-11-01'
  },
  {
    id: 'WO-2024-002',
    customerName: 'Sarah Williams',
    customerPhone: '(555) 234-5678',
    customerEmail: 'sarah.williams@email.com',
    serviceType: 'Plumbing Repair',
    description: 'Fix leaking pipes in master bathroom and replace water heater.',
    status: 'in-progress',
    dateScheduled: '2024-11-05',
    technician: 'Dave Martinez',
    priority: 'High',
    estimatedCost: '$2,500.00',
    dateCreated: '2024-10-28'
  },
  {
    id: 'WO-2024-003',
    customerName: 'Michael Brown',
    customerPhone: '(555) 345-6789',
    customerEmail: 'michael.brown@email.com',
    serviceType: 'HVAC Installation',
    description: 'Install new central air conditioning system for entire house.',
    status: 'completed',
    dateScheduled: '2024-10-20',
    technician: 'Tom Wilson',
    priority: 'Urgent',
    estimatedCost: '$8,500.00',
    dateCreated: '2024-10-10',
    rating: 4.6,
    review: {
      customerName: 'Michael Brown',
      customerEmail: 'michael.brown@email.com',
      serviceQuality: 5,
      professionalism: 5,
      timeliness: 4,
      communication: 5,
      recommendation: 4,
      averageRating: 4.6,
      comments: 'Excellent service! The team was very professional and completed the work on time. Very satisfied with the new HVAC system.',
      submittedAt: '2024-10-25'
    }
  },
  {
    id: 'WO-2024-004',
    customerName: 'Emily Davis',
    customerPhone: '(555) 456-7890',
    customerEmail: 'emily.davis@email.com',
    serviceType: 'Electrical',
    description: 'Upgrade electrical panel and install new outlets in garage.',
    status: 'scheduled',
    dateScheduled: '2024-11-10',
    technician: 'Mike Johnson',
    priority: 'Normal',
    estimatedCost: '$1,800.00',
    dateCreated: '2024-11-01'
  },
  {
    id: 'WO-2024-005',
    customerName: 'David Martinez',
    customerPhone: '(555) 567-8901',
    customerEmail: 'david.martinez@email.com',
    serviceType: 'Roof Repair',
    description: 'Repair roof damage from recent storm and replace missing shingles.',
    status: 'in-progress',
    dateScheduled: '2024-11-03',
    technician: 'Dave Martinez',
    priority: 'Urgent',
    estimatedCost: '$4,200.00',
    dateCreated: '2024-11-02'
  },
  {
    id: 'WO-2024-006',
    customerName: 'Jennifer Wilson',
    customerPhone: '(555) 678-9012',
    customerEmail: 'jennifer.wilson@email.com',
    serviceType: 'Bathroom Renovation',
    description: 'Complete bathroom remodel with new fixtures, tile, and vanity.',
    status: 'completed',
    dateScheduled: '2024-10-15',
    technician: 'Mike Johnson',
    priority: 'Normal',
    estimatedCost: '$12,000.00',
    dateCreated: '2024-10-01',
    rating: 5.0,
    review: {
      customerName: 'Jennifer Wilson',
      customerEmail: 'jennifer.wilson@email.com',
      serviceQuality: 5,
      professionalism: 5,
      timeliness: 5,
      communication: 5,
      recommendation: 5,
      averageRating: 5.0,
      comments: 'Outstanding work! The team exceeded all expectations. The bathroom looks absolutely beautiful and the project was completed exactly on schedule. Highly recommend!',
      submittedAt: '2024-10-20'
    }
  }
];

let currentFilter = 'all';
let currentWorkOrderId = null;
let isEditMode = false;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  renderWorkOrders();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
      searchWorkOrders();
    }
  });
}

// Render work orders in table
function renderWorkOrders(ordersToRender = null) {
  const orders = ordersToRender || workOrders;
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
      <td><strong>${order.id}</strong></td>
      <td>
        <div>${order.customerName}</div>
        <div style="font-size: 12px; color: #666;">${order.customerPhone}</div>
      </td>
      <td>${order.serviceType}</td>
      <td><span class="status-badge status-${order.status}">${formatStatus(order.status)}</span></td>
      <td>${formatDate(order.dateScheduled)}</td>
      <td>${order.technician || 'Not Assigned'}</td>
      <td>${order.estimatedCost}</td>
      <td>${order.status === 'completed' && order.rating ? renderRating(order.rating, order.id) : '-'}</td>
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
  event.target.classList.add('active');
  
  // Filter orders
  if (status === 'all') {
    renderWorkOrders();
  } else if (status === 'reviews') {
    // Show only completed orders with ratings
    const filtered = workOrders.filter(order => order.status === 'completed' && order.rating);
    renderWorkOrders(filtered);
  } else {
    const filtered = workOrders.filter(order => order.status === status);
    renderWorkOrders(filtered);
  }
}

// Search work orders
function searchWorkOrders() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const serviceTypeFilter = document.getElementById('serviceTypeFilter').value;
  
  let filtered = workOrders;
  
  // Apply status filter
  if (currentFilter === 'reviews') {
    // Filter for completed orders with ratings
    filtered = filtered.filter(order => order.status === 'completed' && order.rating);
  } else if (currentFilter !== 'all') {
    filtered = filtered.filter(order => order.status === currentFilter);
  }
  
  // Apply search term filter
  if (searchTerm) {
    filtered = filtered.filter(order => 
      order.id.toLowerCase().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.customerPhone.includes(searchTerm) ||
      order.customerEmail.toLowerCase().includes(searchTerm)
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
  return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

// Handle create form submission
document.addEventListener('DOMContentLoaded', function() {
  const createForm = document.getElementById('createWorkOrderForm');
  if (createForm) {
    createForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const newOrder = {
        id: `WO-2024-${String(workOrders.length + 1).padStart(3, '0')}`,
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerEmail: document.getElementById('customerEmail').value,
        serviceType: document.getElementById('serviceType').value,
        description: document.getElementById('description').value,
        status: 'scheduled',
        dateScheduled: document.getElementById('dateScheduled').value,
        technician: document.getElementById('technician').value,
        priority: document.getElementById('priority').value,
        estimatedCost: document.getElementById('estimatedCost').value || '$0.00',
        dateCreated: new Date().toISOString().split('T')[0]
      };
      
      workOrders.unshift(newOrder);
      renderWorkOrders();
      closeCreateModal();
      
      alert('Work order created successfully!');
    });
  }
});

// View work order details
function viewWorkOrder(orderId) {
  const order = workOrders.find(o => o.id === orderId);
  if (!order) return;
  
  currentWorkOrderId = orderId;
  isEditMode = false;
  
  const detailsDiv = document.getElementById('workOrderDetails');
  detailsDiv.innerHTML = `
    <div class="detail-group">
      <label>Order ID</label>
      <div class="detail-value">${order.id}</div>
    </div>
    <div class="detail-group">
      <label>Status</label>
      <div class="detail-value">
        <span class="status-badge status-${order.status}">${formatStatus(order.status)}</span>
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
      <label>Scheduled Date</label>
      <div class="detail-value" id="view-dateScheduled">${formatDate(order.dateScheduled)}</div>
    </div>
    <div class="detail-group">
      <label>Priority</label>
      <div class="detail-value">
        <span class="priority-badge priority-${order.priority.toLowerCase()}">${order.priority}</span>
      </div>
    </div>
    <div class="detail-group">
      <label>Assigned Technician</label>
      <div class="detail-value" id="view-technician">${order.technician || 'Not Assigned'}</div>
    </div>
    <div class="detail-group">
      <label>Estimated Cost</label>
      <div class="detail-value" id="view-estimatedCost">${order.estimatedCost}</div>
    </div>
    <div class="detail-group full-width">
      <label>Description</label>
      <div class="detail-value" id="view-description">${order.description}</div>
    </div>
  `;
  
  document.getElementById('modalTitle').textContent = 'Work Order Details';
  document.getElementById('editBtn').style.display = 'inline-block';
  document.getElementById('deleteBtn').style.display = 'inline-block';
  document.getElementById('workOrderModal').style.display = 'block';
}

// Enable edit mode
function enableEdit() {
  const order = workOrders.find(o => o.id === currentWorkOrderId);
  if (!order) return;
  
  isEditMode = true;
  
  const detailsDiv = document.getElementById('workOrderDetails');
  detailsDiv.innerHTML = `
    <div class="form-group">
      <label>Customer Name</label>
      <input type="text" id="edit-customerName" value="${order.customerName}">
    </div>
    <div class="form-group">
      <label>Phone Number</label>
      <input type="tel" id="edit-customerPhone" value="${order.customerPhone}">
    </div>
    <div class="form-group">
      <label>Email Address</label>
      <input type="email" id="edit-customerEmail" value="${order.customerEmail}">
    </div>
    <div class="form-group">
      <label>Service Type</label>
      <select id="edit-serviceType">
        <option value="Kitchen Remodel" ${order.serviceType === 'Kitchen Remodel' ? 'selected' : ''}>Kitchen Remodel</option>
        <option value="Bathroom Renovation" ${order.serviceType === 'Bathroom Renovation' ? 'selected' : ''}>Bathroom Renovation</option>
        <option value="Roof Repair" ${order.serviceType === 'Roof Repair' ? 'selected' : ''}>Roof Repair</option>
        <option value="HVAC Installation" ${order.serviceType === 'HVAC Installation' ? 'selected' : ''}>HVAC Installation</option>
        <option value="Plumbing Repair" ${order.serviceType === 'Plumbing Repair' ? 'selected' : ''}>Plumbing Repair</option>
        <option value="Electrical" ${order.serviceType === 'Electrical' ? 'selected' : ''}>Electrical</option>
        <option value="Outdoor Projects" ${order.serviceType === 'Outdoor Projects' ? 'selected' : ''}>Outdoor Projects</option>
        <option value="Other" ${order.serviceType === 'Other' ? 'selected' : ''}>Other</option>
      </select>
    </div>
    <div class="form-group">
      <label>Status</label>
      <select id="edit-status">
        <option value="scheduled" ${order.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
        <option value="in-progress" ${order.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
    </div>
    <div class="form-group">
      <label>Scheduled Date</label>
      <input type="date" id="edit-dateScheduled" value="${order.dateScheduled}">
    </div>
    <div class="form-group">
      <label>Priority</label>
      <select id="edit-priority">
        <option value="Low" ${order.priority === 'Low' ? 'selected' : ''}>Low</option>
        <option value="Normal" ${order.priority === 'Normal' ? 'selected' : ''}>Normal</option>
        <option value="High" ${order.priority === 'High' ? 'selected' : ''}>High</option>
        <option value="Urgent" ${order.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
      </select>
    </div>
    <div class="form-group">
      <label>Assigned Technician</label>
      <select id="edit-technician">
        <option value="">Select Technician</option>
        <option value="Mike Johnson" ${order.technician === 'Mike Johnson' ? 'selected' : ''}>Mike Johnson</option>
        <option value="Dave Martinez" ${order.technician === 'Dave Martinez' ? 'selected' : ''}>Dave Martinez</option>
        <option value="Tom Wilson" ${order.technician === 'Tom Wilson' ? 'selected' : ''}>Tom Wilson</option>
      </select>
    </div>
    <div class="form-group">
      <label>Estimated Cost</label>
      <input type="text" id="edit-estimatedCost" value="${order.estimatedCost}">
    </div>
    <div class="form-group full-width">
      <label>Description</label>
      <textarea id="edit-description" rows="4">${order.description}</textarea>
    </div>
  `;
  
  document.getElementById('modalTitle').textContent = 'Edit Work Order';
  document.getElementById('editBtn').textContent = 'Save Changes';
  document.getElementById('editBtn').onclick = saveWorkOrder;
  document.getElementById('deleteBtn').style.display = 'none';
}

// Save work order changes
function saveWorkOrder() {
  const orderIndex = workOrders.findIndex(o => o.id === currentWorkOrderId);
  if (orderIndex === -1) return;
  
  workOrders[orderIndex] = {
    ...workOrders[orderIndex],
    customerName: document.getElementById('edit-customerName').value,
    customerPhone: document.getElementById('edit-customerPhone').value,
    customerEmail: document.getElementById('edit-customerEmail').value,
    serviceType: document.getElementById('edit-serviceType').value,
    status: document.getElementById('edit-status').value,
    dateScheduled: document.getElementById('edit-dateScheduled').value,
    priority: document.getElementById('edit-priority').value,
    technician: document.getElementById('edit-technician').value,
    estimatedCost: document.getElementById('edit-estimatedCost').value,
    description: document.getElementById('edit-description').value
  };
  
  renderWorkOrders();
  closeWorkOrderModal();
  alert('Work order updated successfully!');
}

// Update status quick action
function updateStatus(orderId) {
  const order = workOrders.find(o => o.id === orderId);
  if (!order) return;
  
  const statusOptions = ['scheduled', 'in-progress', 'completed', 'cancelled'];
  const currentIndex = statusOptions.indexOf(order.status);
  const nextIndex = (currentIndex + 1) % statusOptions.length;
  
  order.status = statusOptions[nextIndex];
  renderWorkOrders();
  
  alert(`Work order ${orderId} status updated to ${formatStatus(order.status)}`);
}

// Delete work order
function deleteWorkOrder() {
  if (confirm('Are you sure you want to delete this work order? This action cannot be undone.')) {
    workOrders = workOrders.filter(o => o.id !== currentWorkOrderId);
    renderWorkOrders();
    closeWorkOrderModal();
    alert('Work order deleted successfully!');
  }
}

// Close work order modal
function closeWorkOrderModal() {
  document.getElementById('workOrderModal').style.display = 'none';
  currentWorkOrderId = null;
  isEditMode = false;
}

// Close modals when clicking outside
window.onclick = function(event) {
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
  const order = workOrders.find(o => o.id === orderId);
  
  if (!order || !order.review) {
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
      <h3>Work Order: ${order.id}</h3>
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
