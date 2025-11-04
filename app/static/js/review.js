// Review Form Functionality

document.addEventListener('DOMContentLoaded', function() {
  const reviewForm = document.getElementById('reviewForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message';
  errorMessage.id = 'errorMessage';
  reviewForm.parentNode.insertBefore(errorMessage, reviewForm);

  // Handle form submission
  reviewForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Clear previous error messages
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Get form values
    const workOrderId = document.getElementById('workOrderId').value.trim();
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const comments = document.getElementById('comments').value.trim();

    // Get rating values
    const serviceQuality = document.querySelector('input[name="serviceQuality"]:checked');
    const professionalism = document.querySelector('input[name="professionalism"]:checked');
    const timeliness = document.querySelector('input[name="timeliness"]:checked');
    const communication = document.querySelector('input[name="communication"]:checked');
    const recommendation = document.querySelector('input[name="recommendation"]:checked');

    // Validate required fields
    const errors = [];

    if (!workOrderId) {
      errors.push('Work Order ID is required');
    }

    if (!customerName) {
      errors.push('Customer Name is required');
    }

    if (!customerEmail) {
      errors.push('Email is required');
    } else if (!isValidEmail(customerEmail)) {
      errors.push('Please enter a valid email address');
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
      workOrderId: workOrderId,
      customerName: customerName,
      customerEmail: customerEmail,
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

  // Submit review to backend
  function submitReview(reviewData) {
    // TODO: Replace with actual API endpoint
    console.log('Submitting review:', reviewData);

    // Simulate API call
    setTimeout(() => {
      // Hide form and show success message
      reviewForm.style.display = 'none';
      successMessage.style.display = 'block';
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Store review in localStorage for demo purposes
      const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      reviews.push(reviewData);
      localStorage.setItem('reviews', JSON.stringify(reviews));

      // Update work order with rating
      updateWorkOrderRating(reviewData.workOrderId, reviewData.averageRating);
    }, 500);

    // Uncomment when backend is ready:
    /*
    fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      return response.json();
    })
    .then(data => {
      // Hide form and show success message
      reviewForm.style.display = 'none';
      successMessage.style.display = 'block';
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
    .catch(error => {
      errorMessage.textContent = 'Failed to submit review. Please try again.';
      errorMessage.style.display = 'block';
      console.error('Error submitting review:', error);
    });
    */
  }

  // Update work order with rating
  function updateWorkOrderRating(workOrderId, rating) {
    const workOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
    const workOrder = workOrders.find(wo => wo.id === workOrderId);

    if (workOrder) {
      workOrder.rating = parseFloat(rating);
      localStorage.setItem('workOrders', JSON.stringify(workOrders));
    }
  }

  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Back to home button
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = '/';
    });
  }

  // Animate rating options on hover
  const ratingOptions = document.querySelectorAll('.rating-option');
  ratingOptions.forEach(option => {
    option.addEventListener('mouseenter', function() {
      const label = this.querySelector('.rating-label');
      label.style.transform = 'translateY(-2px)';
    });

    option.addEventListener('mouseleave', function() {
      const label = this.querySelector('.rating-label');
      const radio = this.querySelector('input[type="radio"]');
      if (!radio.checked) {
        label.style.transform = 'translateY(0)';
      }
    });
  });

  // Auto-fill work order ID from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const workOrderIdParam = urlParams.get('workOrderId');
  if (workOrderIdParam) {
    document.getElementById('workOrderId').value = workOrderIdParam;
  }

  // Clear error message when user starts typing
  const inputs = reviewForm.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      if (errorMessage.style.display === 'block') {
        errorMessage.style.display = 'none';
      }
    });
  });

  // Clear error message when user selects a rating
  const radioButtons = reviewForm.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      if (errorMessage.style.display === 'block') {
        errorMessage.style.display = 'none';
      }
    });
  });
});
