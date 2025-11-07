// Review Form Functionality

document.addEventListener('DOMContentLoaded', function () {
  const reviewForm = document.getElementById('reviewForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message';
  errorMessage.id = 'errorMessage';
  reviewForm.parentNode.insertBefore(errorMessage, reviewForm);

  // Handle form submission
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Clear previous error messages
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Get form values
    const requestIdElement = document.getElementById('requestId');
    const commentsElement = document.getElementById('comments');

    console.log('DEBUG: Form elements at submission:');
    console.log('- requestIdElement:', requestIdElement);
    console.log('- commentsElement:', commentsElement);

    const requestId = requestIdElement ? requestIdElement.value : null;
    const comments = commentsElement ? commentsElement.value.trim() : '';

    console.log('DEBUG: Form values at submission:');
    console.log('- requestId:', requestId);
    console.log('- comments:', comments);

    // Get rating values
    const serviceQuality = document.querySelector('input[name="serviceQuality"]:checked');
    const professionalism = document.querySelector('input[name="professionalism"]:checked');
    const timeliness = document.querySelector('input[name="timeliness"]:checked');
    const communication = document.querySelector('input[name="communication"]:checked');
    const recommendation = document.querySelector('input[name="recommendation"]:checked');

    // Validate required fields (only need request_id now)
    const errors = [];

    if (!requestId) {
      errors.push('Request ID is missing. Please use the link from your email.');
    }

    if (!serviceQuality) {
      errors.push('Please rate the Service Quality');
    }

    if (!professionalism) {
      errors.push('Please rate the Professionalism');
    }

    if (!timeliness) {
      errors.push('Please rate the Timeliness');
    }

    if (!communication) {
      errors.push('Please rate the Communication');
    }

    if (!recommendation) {
      errors.push('Please rate your Overall Experience');
    }

    // Display errors if any
    if (errors.length > 0) {
      errorMessage.innerHTML = errors.join('<br>');
      errorMessage.style.display = 'block';
      errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Calculate average rating
    const ratings = [
      parseInt(serviceQuality.value),
      parseInt(professionalism.value),
      parseInt(timeliness.value),
      parseInt(communication.value),
      parseInt(recommendation.value)
    ];

    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    // Prepare review data
    const reviewData = {
      requestId: requestId,
      serviceQuality: parseInt(serviceQuality.value),
      professionalism: parseInt(professionalism.value),
      timeliness: parseInt(timeliness.value),
      communication: parseInt(communication.value),
      recommendation: parseInt(recommendation.value),
      averageRating: averageRating.toFixed(2),
      comments: comments,
      submittedAt: new Date().toISOString()
    };

    // Submit the review
    submitReview(reviewData);
  });

  // Check if review already exists for this service request
  function checkExistingReview(requestId) {
    const workOrderInfoDiv = document.getElementById('workOrderInfo');
    const reviewForm = document.getElementById('reviewForm');
    const successMessage = document.getElementById('successMessage');

    // Show loading state
    workOrderInfoDiv.innerHTML = '<div class="loading">Checking review status...</div>';
    workOrderInfoDiv.style.display = 'block';

    // Hide form initially
    reviewForm.style.display = 'none';

    fetch(`/api/reviews/${requestId}`)
      .then(response => {
        if (response.status === 404) {
          // No existing review found - proceed with loading work order data
          loadWorkOrderData(requestId);
        } else if (response.ok) {
          // Review exists - show it instead of the form
          return response.json().then(data => {
            showExistingReview(data.review);
          });
        } else {
          throw new Error('Failed to check review status');
        }
      })
      .catch(error => {
        console.error('Error checking existing review:', error);
        // If error checking review, proceed with loading work order data
        loadWorkOrderData(requestId);
      });
  }

  // Show simple message for existing review
  function showExistingReview(reviewData) {
    const workOrderInfoDiv = document.getElementById('workOrderInfo');
    const reviewForm = document.getElementById('reviewForm');

    // Hide the form completely
    reviewForm.style.display = 'none';

    // Show simple message
    workOrderInfoDiv.innerHTML = `
      <div class="already-reviewed-card">
        <div class="check-icon">✅</div>
        <h3>Review Already Submitted</h3>
        <p>You have already submitted a review for this service request.</p>
        <p class="thank-you">Thank you for your feedback!</p>
      </div>
    `;

    // Add simple CSS for already reviewed message
    if (!document.querySelector('#already-reviewed-styles')) {
      const style = document.createElement('style');
      style.id = 'already-reviewed-styles';
      style.textContent = `
        .already-reviewed-card {
          background: white;
          border: 2px solid #28a745;
          color: #213043;
          padding: 40px 30px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.1);
          margin-bottom: 20px;
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .check-icon {
          font-size: 3em;
          margin-bottom: 15px;
        }
        
        .already-reviewed-card h3 {
          color: #28a745;
          font-size: 1.5em;
          margin-bottom: 15px;
        }
        
        .already-reviewed-card p {
          color: #213043;
          font-size: 1.1em;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        
        .thank-you {
          color: #28a745;
          font-weight: 600;
          margin-top: 20px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Load work order data from API
  function loadWorkOrderData(requestId, customerIdFromUrl = null) {
    const requestIdField = document.getElementById('requestId');
    const workOrderInfoDiv = document.getElementById('workOrderInfo');

    console.log('DEBUG: DOM elements found:');
    console.log('- requestIdField:', requestIdField);
    console.log('- workOrderInfoDiv:', workOrderInfoDiv);

    // Show loading state
    workOrderInfoDiv.innerHTML = '<div class="loading">Loading work order information...</div>';
    workOrderInfoDiv.style.display = 'block';

    fetch(`/api/reviews/${requestId}/details`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load work order data');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          const workOrder = data.work_order;

          // Set hidden form field
          requestIdField.value = requestId;

          console.log('DEBUG: Setting requestId to:', requestId);
          console.log('DEBUG: requestIdField value:', requestIdField.value);

          // Display work order information
          displayWorkOrderInfo(workOrder);

          // Show the review form since no existing review was found
          const reviewForm = document.getElementById('reviewForm');
          reviewForm.style.display = 'block';
        } else {
          throw new Error(data.error || 'Failed to load work order data');
        }
      })
      .catch(error => {
        console.error('Error loading work order data:', error);

        // Show error message in the work order info section
        workOrderInfoDiv.innerHTML = `
          <div class="error-card">
            <h3>⚠️ Unable to Load Work Order</h3>
            <p>Could not load work order details: ${error.message}</p>
            <p>Please make sure you're using the correct link from your email, or contact support if this problem persists.</p>
          </div>
        `;

        // Also show error message
        errorMessage.textContent = error.message || 'Could not load work order details automatically.';
        errorMessage.style.display = 'block';
      });
  }

  // Display work order information
  function displayWorkOrderInfo(workOrder) {
    const workOrderInfoDiv = document.getElementById('workOrderInfo');

    workOrderInfoDiv.innerHTML = `
      <div class="info-card">
        <h3>📋 Service Completed - Request #${workOrder.request_id}</h3>
        
        <div class="customer-section">
          <h4>👤 Customer Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <strong>Name:</strong> ${workOrder.customer.first_name} ${workOrder.customer.last_name}
            </div>
            <div class="info-item">
              <strong>Email:</strong> ${workOrder.customer.email}
            </div>
          </div>
        </div>
        
        <div class="service-section">
          <h4>� Service Details</h4>
          <div class="info-grid">
            <div class="info-item">
              <strong>Service:</strong> ${workOrder.service.job_name}
            </div>
            <div class="info-item">
              <strong>Type:</strong> ${workOrder.service.service_type || 'N/A'}
            </div>
            <div class="info-item">
              <strong>Status:</strong> <span class="status-completed">${workOrder.request_status}</span>
            </div>
            <div class="info-item">
              <strong>Technician:</strong> ${workOrder.assigned_employee ?
        `${workOrder.assigned_employee.first_name} ${workOrder.assigned_employee.last_name}` :
        'Not specified'}
            </div>
          </div>
          <div class="service-description">
            <strong>Work Description:</strong> ${workOrder.request_description}
          </div>
          ${workOrder.final_price ? `
            <div class="price-info">
              <strong>Final Cost:</strong> $${workOrder.final_price.toFixed(2)}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Add CSS for the info section if not already added
    if (!document.querySelector('#work-order-info-styles')) {
      const style = document.createElement('style');
      style.id = 'work-order-info-styles';
      style.textContent = `
        .work-order-info {
          margin-bottom: 30px;
        }
        
        .info-card {
          background: white;
          border: 2px solid #4A70A9;
          color: #213043;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(74, 112, 169, 0.1);
          margin-bottom: 20px;
        }
        
        .info-card h3 {
          margin: 0 0 20px 0;
          font-size: 1.3em;
          text-align: center;
          color: #4A70A9;
          font-weight: 600;
        }
        
        .info-card h4 {
          margin: 20px 0 10px 0;
          font-size: 1.1em;
          border-bottom: 2px solid #4A70A9;
          padding-bottom: 5px;
          color: #4A70A9;
          font-weight: 600;
        }
        
        .customer-section, .service-section {
          margin-bottom: 20px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .info-item {
          background: #f6f9fc;
          border: 1px solid #e1e7f0;
          padding: 12px 15px;
          border-radius: 8px;
          color: #213043;
        }
        
        .service-description, .price-info {
          background: #f6f9fc;
          border: 1px solid #e1e7f0;
          padding: 15px;
          border-radius: 8px;
          line-height: 1.4;
          margin: 10px 0;
          color: #213043;
        }
        
        .status-completed {
          background: #28a745;
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.85em;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .loading {
          text-align: center;
          padding: 20px;
          font-style: italic;
          color: #666;
        }
        
        .error-card {
          background: white;
          border: 2px solid #dc3545;
          color: #213043;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.1);
        }
        
        .error-card h3 {
          color: #dc3545 !important;
        }
        
        .error-card h3 {
          margin-top: 0;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Submit review to backend
  function submitReview(reviewData) {
    // Add request_id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('request_id');

    if (!requestId) {
      errorMessage.textContent = 'Missing work order information. Please use the link from your email.';
      errorMessage.style.display = 'block';
      return;
    }

    // Prepare data for API (request_id is in URL, customer_id will be looked up by backend)
    const apiData = {
      rating_quality: reviewData.serviceQuality,
      rating_professionalism: reviewData.professionalism,
      rating_timeliness: reviewData.timeliness,
      rating_communication: reviewData.communication,
      rating_overall: reviewData.recommendation,
      comments: reviewData.comments
    };

    // Show loading state
    const submitBtn = reviewForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    fetch(`/api/reviews/${requestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to submit review');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Hide form and show success message
          reviewForm.style.display = 'none';
          successMessage.style.display = 'block';
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          throw new Error(data.error || 'Failed to submit review');
        }
      })
      .catch(error => {
        console.error('Error submitting review:', error);
        errorMessage.textContent = error.message || 'Failed to submit review. Please try again.';
        errorMessage.style.display = 'block';

        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  }



  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Back to home button
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = '/';
    });
  }

  // Animate rating options on hover
  const ratingOptions = document.querySelectorAll('.rating-option');
  ratingOptions.forEach(option => {
    option.addEventListener('mouseenter', function () {
      const label = this.querySelector('.rating-label');
      label.style.transform = 'translateY(-2px)';
    });

    option.addEventListener('mouseleave', function () {
      const label = this.querySelector('.rating-label');
      const radio = this.querySelector('input[type="radio"]');
      if (!radio.checked) {
        label.style.transform = 'translateY(0)';
      }
    });
  });

  // Check if review already exists before doing anything else
  const urlParams = new URLSearchParams(window.location.search);
  const requestIdParam = urlParams.get('request_id');
  const customerIdParam = urlParams.get('customer_id');

  if (requestIdParam) {
    checkExistingReview(requestIdParam);
  }

  // Clear error message when user starts typing in textarea
  const textarea = reviewForm.querySelector('textarea');
  if (textarea) {
    textarea.addEventListener('input', function () {
      if (errorMessage.style.display === 'block') {
        errorMessage.style.display = 'none';
      }
    });
  }

  // Clear error message when user selects a rating
  const radioButtons = reviewForm.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
      if (errorMessage.style.display === 'block') {
        errorMessage.style.display = 'none';
      }
    });
  });
});
