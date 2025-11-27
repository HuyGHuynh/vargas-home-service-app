// Global variables for financial data
let transactions = [];
let categories = [];
let financialSummary = {};
let chartData = {};

// API Functions
async function fetchFinancialData(categoryFilter = 'all', startDate = null, endDate = null) {
  try {
    const params = new URLSearchParams({
      category: categoryFilter
    });

    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`/api/admin/financial/data?${params}`);
    const result = await response.json();

    if (result.success) {
      transactions = result.data.transactions;
      categories = result.data.categories;
      financialSummary = result.data.summary;
      return true;
    } else {
      console.error('Failed to fetch financial data:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Error fetching financial data:', error);
    return false;
  }
}

async function fetchChartData(categoryFilter = 'all') {
  try {
    const params = new URLSearchParams({
      category: categoryFilter
    });

    const response = await fetch(`/api/admin/financial/charts?${params}`);
    const result = await response.json();

    if (result.success) {
      chartData = result.data;
      return true;
    } else {
      console.error('Failed to fetch chart data:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return false;
  }
}

// Initialize category dropdown with categories from database
function initializeCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Add categories from database
  if (categories && categories.length > 0) {
    categories.sort().forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }
}

// Revenue Trend Chart Functions
let revenueChart = null;

function getMonthlyRevenueData() {
  // Return chart data from API
  if (chartData && chartData.revenue_chart) {
    return chartData.revenue_chart;
  }

  // Fallback: empty data
  return { labels: [], values: [], counts: [] };
}

function updateChartStats(data) {
  if (data.values.length === 0) {
    document.getElementById('avgMonthlyRevenue').textContent = '$0';
    document.getElementById('bestMonth').textContent = '-';
    document.getElementById('totalMonths').textContent = '0';
    return;
  }

  // Calculate average monthly revenue
  const avgRevenue = data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
  document.getElementById('avgMonthlyRevenue').textContent = '$' + formatNumber(avgRevenue);

  // Find best month
  const maxValue = Math.max(...data.values);
  const bestMonthIndex = data.values.indexOf(maxValue);
  const bestMonthName = data.labels[bestMonthIndex];
  document.getElementById('bestMonth').textContent = `${bestMonthName} ($${formatNumber(maxValue)})`;

  // Total months
  document.getElementById('totalMonths').textContent = data.labels.length.toString();
}

function createRevenueChart() {
  const chartPlaceholder = document.getElementById('revenueChart');
  if (!chartPlaceholder) return;

  const data = getMonthlyRevenueData();

  // Update chart statistics
  updateChartStats(data);

  // Destroy existing chart if it exists
  if (revenueChart) {
    revenueChart.destroy();
    revenueChart = null;
  }

  // Handle empty state
  if (data.values.length === 0) {
    chartPlaceholder.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #666; font-size: 1rem;">No revenue data available for the selected category</div>';
    return;
  }

  // Restore canvas if it was replaced
  if (!document.getElementById('revenueChartCanvas')) {
    chartPlaceholder.innerHTML = '<canvas id="revenueChartCanvas"></canvas>';
  }

  const ctx = document.getElementById('revenueChartCanvas');

  revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Monthly Revenue',
        data: data.values,
        backgroundColor: 'rgba(74, 112, 169, 0.8)',
        borderColor: '#4A70A9',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(143, 171, 212, 0.9)',
        hoverBorderColor: '#8FABD4',
        maxBarThickness: 60
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              const count = data.counts[context.dataIndex];
              return [
                `Revenue: $${formatNumber(value)}`,
                `Transactions: ${count}`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return '$' + formatNumber(value);
            },
            color: '#333'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#333',
            maxRotation: 45,
            minRotation: 0
          },
          grid: {
            display: false
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 8
        }
      },
      categoryPercentage: 0.8,
      barPercentage: 0.9
    }
  });
}

// Service Distribution Pie Chart Functions
let serviceChart = null;

function extractServiceType(description) {
  // Extract service type from description (everything before " - " or the whole description)
  const servicePart = description.split(' - ')[0];

  // Map similar services together
  const serviceMapping = {
    'Kitchen Remodel': 'Kitchen Services',
    'Kitchen': 'Kitchen Services',
    'Plumbing Repair': 'Plumbing Services',
    'Plumbing': 'Plumbing Services',
    'Water Heater Installation': 'Plumbing Services',
    'HVAC Installation': 'HVAC Services',
    'HVAC': 'HVAC Services',
    'Electrical Upgrade': 'Electrical Services',
    'Electrical': 'Electrical Services',
    'Roof Repair': 'Roofing Services',
    'Roofing': 'Roofing Services',
    'Bathroom Renovation': 'Bathroom Services',
    'Bathroom': 'Bathroom Services',
    'Deck Building': 'Exterior Services',
    'Deck': 'Exterior Services',
    'Painting Service': 'Painting Services',
    'Painting': 'Painting Services'
  };

  // Check for exact matches first
  if (serviceMapping[servicePart]) {
    return serviceMapping[servicePart];
  }

  // Check for partial matches
  for (const key in serviceMapping) {
    if (servicePart.toLowerCase().includes(key.toLowerCase())) {
      return serviceMapping[key];
    }
  }

  // If no match found, return the cleaned service part
  return servicePart || 'Other Services';
}

function getServiceDistributionData() {
  // Return chart data from API
  if (chartData && chartData.service_chart) {
    return chartData.service_chart;
  }

  // Fallback: empty data
  return { labels: [], counts: [], revenues: [] };
}

function updateServiceStats(data) {
  if (data.labels.length === 0) {
    document.getElementById('mostRequestedService').textContent = '-';
    document.getElementById('totalServices').textContent = '0';
    document.getElementById('serviceTypes').textContent = '0';
    return;
  }

  // Find most requested service
  const maxCount = Math.max(...data.counts);
  const mostRequestedIndex = data.counts.indexOf(maxCount);
  const mostRequestedService = data.labels[mostRequestedIndex];
  document.getElementById('mostRequestedService').textContent = `${mostRequestedService} (${maxCount})`;

  // Total number of service requests
  const totalRequests = data.counts.reduce((sum, count) => sum + count, 0);
  document.getElementById('totalServices').textContent = totalRequests.toString();

  // Number of different service types
  document.getElementById('serviceTypes').textContent = data.labels.length.toString();
}

function createServiceChart() {
  const chartPlaceholder = document.getElementById('serviceChart');
  if (!chartPlaceholder) return;

  const data = getServiceDistributionData();

  // Update service statistics
  updateServiceStats(data);

  // Destroy existing chart if it exists
  if (serviceChart) {
    serviceChart.destroy();
    serviceChart = null;
  }

  // Handle empty state
  if (data.labels.length === 0) {
    chartPlaceholder.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #666; font-size: 1rem;">No service data available for the selected category</div>';
    return;
  }

  // Restore canvas if it was replaced
  if (!document.getElementById('serviceChartCanvas')) {
    chartPlaceholder.innerHTML = '<canvas id="serviceChartCanvas"></canvas>';
  }

  const ctx = document.getElementById('serviceChartCanvas');

  // Generate colors for pie slices
  const colors = [
    'rgba(74, 112, 169, 0.8)',   // Primary blue
    'rgba(143, 171, 212, 0.8)',  // Light blue
    'rgba(76, 175, 80, 0.8)',    // Green
    'rgba(255, 193, 7, 0.8)',    // Amber
    'rgba(244, 67, 54, 0.8)',    // Red
    'rgba(156, 39, 176, 0.8)',   // Purple
    'rgba(255, 152, 0, 0.8)',    // Orange
    'rgba(96, 125, 139, 0.8)',   // Blue Grey
    'rgba(121, 85, 72, 0.8)',    // Brown
    'rgba(158, 158, 158, 0.8)'   // Grey
  ];

  serviceChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.counts,
        backgroundColor: colors.slice(0, data.labels.length),
        borderColor: colors.slice(0, data.labels.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            },
            color: '#333'
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const serviceName = context.label;
              const count = context.parsed;
              const revenue = data.revenues[context.dataIndex];
              const percentage = ((count / data.counts.reduce((a, b) => a + b, 0)) * 100).toFixed(1);

              return [
                `${serviceName}: ${count} requests`,
                `Revenue: $${formatNumber(revenue)}`,
                `Percentage: ${percentage}%`
              ];
            }
          }
        }
      }
    }
  });
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function () {
  // Load initial data
  await loadFinancialData();
  setupEventListeners();
});

async function loadFinancialData() {
  try {
    // Show loading state
    showLoadingState();

    // Get initial filter values (default to current month)
    const dateRange = calculateDateRange('current-month');

    // Fetch data from API with current month filter
    const dataSuccess = await fetchFinancialData('all', dateRange.startDate, dateRange.endDate);
    const chartSuccess = await fetchChartData('all');

    if (dataSuccess && chartSuccess) {
      // Initialize UI with data
      initializeCategoryFilter();
      renderTransactions();
      updateFinancialSummary();
      createRevenueChart();
      createServiceChart();
      updateFilterIndicator();
    } else {
      showErrorState();
    }
  } catch (error) {
    console.error('Error loading financial data:', error);
    showErrorState();
  }
}

function showLoadingState() {
  const tableBody = document.getElementById('tableBody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: #666;">
          Loading financial data...
        </td>
      </tr>
    `;
  }
}

function showErrorState() {
  const tableBody = document.getElementById('tableBody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: #e74c3c;">
          Error loading financial data. Please refresh the page.
        </td>
      </tr>
    `;
  }
}

// Setup event listeners
function setupEventListeners() {
  const dateRange = document.getElementById('dateRange');
  if (dateRange) {
    dateRange.addEventListener('change', function () {
      if (this.value === 'custom') {
        document.getElementById('customDateRange').style.display = 'flex';
        document.getElementById('customDateRangeEnd').style.display = 'flex';
        // Don't auto-update - wait for user to select custom dates
      } else {
        document.getElementById('customDateRange').style.display = 'none';
        document.getElementById('customDateRangeEnd').style.display = 'none';
        // Update report with predefined date range
        updateReport();
      }
      updateFilterIndicator();
    });
  }
}

// Update filter indicator to show current filters
function updateFilterIndicator() {
  const categoryFilter = document.getElementById('categoryFilter');
  const dateRangeSelect = document.getElementById('dateRange');
  const filterIndicator = document.getElementById('filterIndicator');
  const currentCategory = document.getElementById('currentCategory');

  if (!filterIndicator || !currentCategory) return;

  let filterText = '';
  const categoryValue = categoryFilter ? categoryFilter.value : 'all';
  const dateRangeValue = dateRangeSelect ? dateRangeSelect.value : '';

  // Add category filter info
  if (categoryValue !== 'all') {
    filterText += `Category: ${categoryValue}`;
  } else {
    filterText += 'All Categories';
  }

  // Add date range info
  if (dateRangeValue && dateRangeValue !== '') {
    const dateRangeText = {
      'current-month': 'Current Month',
      'last-month': 'Last Month',
      'current-quarter': 'Current Quarter',
      'current-year': 'Current Year',
      'custom': 'Custom Range'
    };

    filterText += ` | ${dateRangeText[dateRangeValue] || dateRangeValue}`;
  }

  currentCategory.textContent = filterText;

  // Show/hide indicator based on whether filters are active
  const hasActiveFilters = categoryValue !== 'all' || (dateRangeValue && dateRangeValue !== '');
  filterIndicator.style.display = hasActiveFilters ? 'flex' : 'none';
}

// Render transactions table
function renderTransactions() {
  const tableBody = document.getElementById('tableBody');

  if (!transactions || transactions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
          No transactions found
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = transactions.map(txn => `
    <tr>
      <td><strong>${txn.txnId}</strong></td>
      <td>${formatDate(txn.date)}</td>
      <td>${txn.category}</td>
      <td>
        <span class="direction-badge ${txn.direction.toLowerCase()}">
          ${txn.direction === 'Income' ? '↓' : '↑'} ${txn.direction}
        </span>
      </td>
      <td class="${txn.direction.toLowerCase()}-amount">
        ${txn.direction === 'Income' ? '+' : '-'}$${formatNumber(txn.amount)}
      </td>
      <td>
        <span class="status-badge status-${txn.status.toLowerCase().replace(' ', '-')}">
          ${txn.status}
        </span>
      </td>
      <td>${txn.description}</td>
      <td>${txn.employee}</td>
      <td>${txn.requestOrder}</td>
    </tr>
  `).join('');
}

// Update financial summary
function updateFinancialSummary() {
  const categoryFilter = document.getElementById('categoryFilter');

  // Use summary from API
  if (financialSummary) {
    // Update summary cards
    document.getElementById('totalIncome').textContent = `$${formatNumber(financialSummary.total_income || 0)}`;
    document.getElementById('totalExpense').textContent = `$${formatNumber(financialSummary.total_expense || 0)}`;
    document.getElementById('netProfit').textContent = `$${formatNumber(financialSummary.net_profit || 0)}`;
    document.getElementById('receivables').textContent = `$${formatNumber(financialSummary.receivables || 0)}`;
    document.getElementById('payables').textContent = `$${formatNumber(financialSummary.payables || 0)}`;

    // Update profit card color based on positive/negative
    const profitCard = document.querySelector('.summary-card.profit');
    if (financialSummary.net_profit >= 0) {
      profitCard.classList.remove('negative');
      profitCard.classList.add('positive');
    } else {
      profitCard.classList.remove('positive');
      profitCard.classList.add('negative');
    }
  }

  // Update filter indicator
  const filterIndicator = document.getElementById('filterIndicator');
  const currentCategory = document.getElementById('currentCategory');
  if (categoryFilter && categoryFilter.value !== 'all') {
    filterIndicator.style.display = 'flex';
    currentCategory.textContent = categoryFilter.value;
  } else {
    filterIndicator.style.display = 'none';
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format number with commas
function formatNumber(num) {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate date range based on selection
function calculateDateRange(rangeType) {
  const today = new Date();
  let startDate, endDate;

  switch (rangeType) {
    case 'current-month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;

    case 'last-month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;

    case 'current-quarter':
      const quarterStart = Math.floor(today.getMonth() / 3) * 3;
      startDate = new Date(today.getFullYear(), quarterStart, 1);
      endDate = new Date(today.getFullYear(), quarterStart + 3, 0);
      break;

    case 'current-year':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;

    case 'custom':
      // Return null - will use custom date inputs
      return { startDate: null, endDate: null };

    default:
      // No filter - return null
      return { startDate: null, endDate: null };
  }

  // Format dates as YYYY-MM-DD for API
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

// Update report
async function updateReport() {
  const categoryFilter = document.getElementById('categoryFilter');
  const dateRangeSelect = document.getElementById('dateRange');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  // Get filter values
  const category = categoryFilter ? categoryFilter.value : 'all';
  const dateRangeType = dateRangeSelect ? dateRangeSelect.value : '';

  let start, end;

  if (dateRangeType === 'custom') {
    // Use custom date inputs - only proceed if both dates are provided
    const startValue = startDateInput ? startDateInput.value : null;
    const endValue = endDateInput ? endDateInput.value : null;

    // If custom range is selected but dates are incomplete, don't update
    if (!startValue || !endValue) {
      return; // Exit early - don't update report until both dates are provided
    }

    start = startValue;
    end = endValue;
  } else if (dateRangeType) {
    // Calculate predefined date range
    const dateRange = calculateDateRange(dateRangeType);
    start = dateRange.startDate;
    end = dateRange.endDate;
  } else {
    // No date filter
    start = null;
    end = null;
  }

  // Show loading state
  showLoadingState();

  try {
    // Fetch updated data
    const dataSuccess = await fetchFinancialData(category, start, end);
    const chartSuccess = await fetchChartData(category);

    if (dataSuccess && chartSuccess) {
      // Update UI
      renderTransactions();
      updateFinancialSummary();
      createRevenueChart();
      createServiceChart();
      updateFilterIndicator();
    } else {
      showErrorState();
    }
  } catch (error) {
    console.error('Error updating report:', error);
    showErrorState();
  }
}

// Export to CSV
async function exportToCSV() {
  try {
    const categoryFilter = document.getElementById('categoryFilter');
    const dateRangeSelect = document.getElementById('dateRange');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Get filter values
    const category = categoryFilter ? categoryFilter.value : 'all';
    const dateRangeType = dateRangeSelect ? dateRangeSelect.value : '';

    let start, end;

    if (dateRangeType === 'custom') {
      // Use custom date inputs - only proceed if both dates are provided
      const startValue = startDateInput ? startDateInput.value : null;
      const endValue = endDateInput ? endDateInput.value : null;

      // If custom range is selected but dates are incomplete, show error
      if (!startValue || !endValue) {
        alert('Please select both start and end dates for custom range export.');
        return; // Exit early
      }

      start = startValue;
      end = endValue;
    } else if (dateRangeType) {
      // Calculate predefined date range
      const dateRange = calculateDateRange(dateRangeType);
      start = dateRange.startDate;
      end = dateRange.endDate;
    } else {
      // No date filter
      start = null;
      end = null;
    }

    // Build query parameters
    const params = new URLSearchParams({
      category: category
    });

    if (start) params.append('start_date', start);
    if (end) params.append('end_date', end);

    // Download CSV from API
    const response = await fetch(`/api/admin/financial/export?${params}`);

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const categoryName = category === 'all' ? 'all_categories' : category.replace(/\s+/g, '_').toLowerCase();
      a.setAttribute('href', url);
      a.setAttribute('download', `financial_report_${categoryName}_${new Date().toISOString().split('T')[0]}.csv`);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Failed to export CSV');
      alert('Failed to export data. Please try again.');
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Error exporting data. Please try again.');
  }
}

// Modal Functions
function openAddTransactionModal() {
  const modal = document.getElementById('addTransactionModal');
  modal.style.display = 'flex';

  // Initialize form data
  initializeTransactionForm();

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('transactionDate').value = today;
}

function closeAddTransactionModal() {
  const modal = document.getElementById('addTransactionModal');
  modal.style.display = 'none';

  // Reset form
  document.getElementById('addTransactionForm').reset();
}

async function initializeTransactionForm() {
  try {
    // Fetch form data from API
    const response = await fetch('/api/admin/financial/form-data');
    const result = await response.json();

    if (result.success) {
      // Populate categories
      const categorySelect = document.getElementById('transactionCategory');
      categorySelect.innerHTML = '<option value="">Select Category</option>';

      result.data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });

      // Populate employees
      const employeeSelect = document.getElementById('transactionEmployee');
      employeeSelect.innerHTML = '<option value="">No Employee</option>';

      result.data.employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        employeeSelect.appendChild(option);
      });
    }

  } catch (error) {
    console.error('Error initializing form:', error);
  }
}

async function submitTransaction(event) {
  event.preventDefault();

  try {
    const form = document.getElementById('addTransactionForm');
    const formData = new FormData(form);

    // Convert form data to JSON
    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) {
        data[key] = value;
      }
    }

    // Validate required fields
    if (!data.category_id || !data.direction || !data.amount || !data.description) {
      alert('Please fill in all required fields.');
      return;
    }

    // Convert numeric fields
    data.amount = parseFloat(data.amount);
    if (data.category_id) {
      data.category_id = parseInt(data.category_id);
    }
    if (data.employeeid) {
      data.employeeid = parseInt(data.employeeid);
    }
    if (data.request_id) {
      data.request_id = parseInt(data.request_id);
    }

    // Submit to API
    const response = await fetch('/api/admin/financial/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      alert('Transaction added successfully!');
      closeAddTransactionModal();

      // Refresh the data
      await loadFinancialData();
    } else {
      alert(`Error: ${result.message}`);
    }

  } catch (error) {
    console.error('Error submitting transaction:', error);
    alert('Error adding transaction. Please try again.');
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('addTransactionModal');
  if (event.target === modal) {
    closeAddTransactionModal();
  }
}
