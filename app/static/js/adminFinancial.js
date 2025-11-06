// Financial Transactions Data
const transactions = [
  {
    txnId: "TXN-2024-001",
    date: "2024-10-01",
    category: "Service Revenue",
    direction: "Income",
    amount: 15000.00,
    status: "Completed",
    description: "Kitchen Remodel - John Smith",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-001"
  },
  {
    txnId: "TXN-2024-002",
    date: "2024-10-01",
    category: "Labor Cost",
    direction: "Expense",
    amount: 3500.00,
    status: "Paid",
    description: "Labor payment for Kitchen Remodel",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-001"
  },
  {
    txnId: "TXN-2024-003",
    date: "2024-10-01",
    category: "Material Cost",
    direction: "Expense",
    amount: 5200.00,
    status: "Paid",
    description: "Kitchen cabinets, countertops, and appliances",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-001"
  },
  {
    txnId: "TXN-2024-004",
    date: "2024-10-05",
    category: "Service Revenue",
    direction: "Income",
    amount: 2500.00,
    status: "Completed",
    description: "Plumbing Repair - Sarah Williams",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-002"
  },
  {
    txnId: "TXN-2024-005",
    date: "2024-10-05",
    category: "Material Cost",
    direction: "Expense",
    amount: 1200.00,
    status: "Paid",
    description: "Plumbing materials and supplies",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-002"
  },
  {
    txnId: "TXN-2024-006",
    date: "2024-10-06",
    category: "Labor Cost",
    direction: "Expense",
    amount: 850.00,
    status: "Paid",
    description: "Labor payment for Plumbing Repair",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-002"
  },
  {
    txnId: "TXN-2024-007",
    date: "2024-10-10",
    category: "Service Revenue",
    direction: "Income",
    amount: 8500.00,
    status: "Completed",
    description: "HVAC Installation - Michael Brown",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-003"
  },
  {
    txnId: "TXN-2024-008",
    date: "2024-10-10",
    category: "Labor Cost",
    direction: "Expense",
    amount: 2000.00,
    status: "Paid",
    description: "Labor payment for HVAC Installation",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-003"
  },
  {
    txnId: "TXN-2024-009",
    date: "2024-10-10",
    category: "Material Cost",
    direction: "Expense",
    amount: 3800.00,
    status: "Paid",
    description: "HVAC system and installation materials",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-003"
  },
  {
    txnId: "TXN-2024-010",
    date: "2024-10-12",
    category: "Service Revenue",
    direction: "Income",
    amount: 1800.00,
    status: "Pending",
    description: "Electrical Upgrade - Emily Davis",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-004"
  },
  {
    txnId: "TXN-2024-011",
    date: "2024-10-12",
    category: "Material Cost",
    direction: "Expense",
    amount: 800.00,
    status: "Paid",
    description: "Electrical supplies and components",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-004"
  },
  {
    txnId: "TXN-2024-012",
    date: "2024-10-15",
    category: "Service Revenue",
    direction: "Income",
    amount: 4200.00,
    status: "Pending",
    description: "Roof Repair - David Martinez",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-005"
  },
  {
    txnId: "TXN-2024-013",
    date: "2024-10-15",
    category: "Labor Cost",
    direction: "Expense",
    amount: 1500.00,
    status: "Pending",
    description: "Labor payment for Roof Repair",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-005"
  },
  {
    txnId: "TXN-2024-014",
    date: "2024-10-15",
    category: "Material Cost",
    direction: "Expense",
    amount: 1100.00,
    status: "Paid",
    description: "Roofing shingles and materials",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-005"
  },
  {
    txnId: "TXN-2024-015",
    date: "2024-10-18",
    category: "Service Revenue",
    direction: "Income",
    amount: 12000.00,
    status: "Completed",
    description: "Bathroom Renovation - Jennifer Wilson",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-006"
  },
  {
    txnId: "TXN-2024-016",
    date: "2024-10-18",
    category: "Material Cost",
    direction: "Expense",
    amount: 3500.00,
    status: "Paid",
    description: "Bathroom fixtures and materials",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-006"
  },
  {
    txnId: "TXN-2024-017",
    date: "2024-10-18",
    category: "Labor Cost",
    direction: "Expense",
    amount: 2800.00,
    status: "Paid",
    description: "Labor payment for Bathroom Renovation",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-006"
  },
  {
    txnId: "TXN-2024-018",
    date: "2024-10-20",
    category: "Service Revenue",
    direction: "Income",
    amount: 3200.00,
    status: "Completed",
    description: "Deck Building - Robert Taylor",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-007"
  },
  {
    txnId: "TXN-2024-019",
    date: "2024-10-20",
    category: "Material Cost",
    direction: "Expense",
    amount: 1600.00,
    status: "Paid",
    description: "Lumber and deck materials",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-007"
  },
  {
    txnId: "TXN-2024-020",
    date: "2024-10-20",
    category: "Labor Cost",
    direction: "Expense",
    amount: 950.00,
    status: "Paid",
    description: "Labor payment for Deck Building",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-007"
  },
  {
    txnId: "TXN-2024-021",
    date: "2024-10-22",
    category: "Service Revenue",
    direction: "Income",
    amount: 950.00,
    status: "Completed",
    description: "Water Heater Installation - Lisa Anderson",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-008"
  },
  {
    txnId: "TXN-2024-022",
    date: "2024-10-22",
    category: "Material Cost",
    direction: "Expense",
    amount: 550.00,
    status: "Paid",
    description: "Water heater unit",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-008"
  },
  {
    txnId: "TXN-2024-023",
    date: "2024-10-22",
    category: "Labor Cost",
    direction: "Expense",
    amount: 250.00,
    status: "Paid",
    description: "Labor payment for Water Heater Installation",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-008"
  },
  {
    txnId: "TXN-2024-024",
    date: "2024-10-25",
    category: "Service Revenue",
    direction: "Income",
    amount: 5800.00,
    status: "Pending",
    description: "Flooring Installation - James White",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-009"
  },
  {
    txnId: "TXN-2024-025",
    date: "2024-10-25",
    category: "Material Cost",
    direction: "Expense",
    amount: 2400.00,
    status: "Paid",
    description: "Hardwood flooring materials",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-009"
  },
  {
    txnId: "TXN-2024-026",
    date: "2024-10-28",
    category: "Service Revenue",
    direction: "Income",
    amount: 1250.00,
    status: "Completed",
    description: "Fence Repair - Patricia Garcia",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-010"
  },
  {
    txnId: "TXN-2024-027",
    date: "2024-10-28",
    category: "Material Cost",
    direction: "Expense",
    amount: 480.00,
    status: "Paid",
    description: "Fencing materials and posts",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-010"
  },
  {
    txnId: "TXN-2024-028",
    date: "2024-10-28",
    category: "Labor Cost",
    direction: "Expense",
    amount: 380.00,
    status: "Paid",
    description: "Labor payment for Fence Repair",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-010"
  },
  {
    txnId: "TXN-2024-029",
    date: "2024-10-30",
    category: "Service Revenue",
    direction: "Income",
    amount: 2100.00,
    status: "Completed",
    description: "Window Replacement - Daniel Moore",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-011"
  },
  {
    txnId: "TXN-2024-030",
    date: "2024-10-30",
    category: "Material Cost",
    direction: "Expense",
    amount: 1200.00,
    status: "Paid",
    description: "Energy-efficient windows",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-011"
  },
  {
    txnId: "TXN-2024-031",
    date: "2024-10-30",
    category: "Labor Cost",
    direction: "Expense",
    amount: 580.00,
    status: "Paid",
    description: "Labor payment for Window Replacement",
    employee: "Dave Martinez",
    requestOrder: "WO-2024-011"
  },
  {
    txnId: "TXN-2024-032",
    date: "2024-11-01",
    category: "Operating Expense",
    direction: "Expense",
    amount: 450.00,
    status: "Paid",
    description: "Vehicle fuel and maintenance",
    employee: "N/A",
    requestOrder: "N/A"
  },
  {
    txnId: "TXN-2024-033",
    date: "2024-11-01",
    category: "Operating Expense",
    direction: "Expense",
    amount: 800.00,
    status: "Paid",
    description: "Office supplies and equipment",
    employee: "N/A",
    requestOrder: "N/A"
  },
  {
    txnId: "TXN-2024-034",
    date: "2024-11-02",
    category: "Operating Expense",
    direction: "Expense",
    amount: 1200.00,
    status: "Paid",
    description: "Insurance premium - Monthly",
    employee: "N/A",
    requestOrder: "N/A"
  },
  {
    txnId: "TXN-2024-035",
    date: "2024-11-02",
    category: "Operating Expense",
    direction: "Expense",
    amount: 350.00,
    status: "Paid",
    description: "Advertising and marketing",
    employee: "N/A",
    requestOrder: "N/A"
  },
  {
    txnId: "TXN-2024-036",
    date: "2024-11-03",
    category: "Service Revenue",
    direction: "Income",
    amount: 780.00,
    status: "Pending",
    description: "Gutter Cleaning - Susan Clark",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-012"
  },
  {
    txnId: "TXN-2024-037",
    date: "2024-11-03",
    category: "Labor Cost",
    direction: "Expense",
    amount: 280.00,
    status: "Pending",
    description: "Labor payment for Gutter Cleaning",
    employee: "Tom Wilson",
    requestOrder: "WO-2024-012"
  },
  {
    txnId: "TXN-2024-038",
    date: "2024-11-04",
    category: "Operating Expense",
    direction: "Expense",
    amount: 650.00,
    status: "Paid",
    description: "Tool and equipment purchases",
    employee: "N/A",
    requestOrder: "N/A"
  },
  {
    txnId: "TXN-2024-039",
    date: "2024-11-04",
    category: "Service Revenue",
    direction: "Income",
    amount: 1450.00,
    status: "Completed",
    description: "Painting Service - Mark Thompson",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-013"
  },
  {
    txnId: "TXN-2024-040",
    date: "2024-11-04",
    category: "Material Cost",
    direction: "Expense",
    amount: 420.00,
    status: "Paid",
    description: "Paint and painting supplies",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-013"
  },
  {
    txnId: "TXN-2024-041",
    date: "2024-11-04",
    category: "Labor Cost",
    direction: "Expense",
    amount: 480.00,
    status: "Paid",
    description: "Labor payment for Painting Service",
    employee: "Mike Johnson",
    requestOrder: "WO-2024-013"
  }
];

// Initialize category dropdown with unique categories from data
function initializeCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;
  
  // Get unique categories from transactions
  const uniqueCategories = [...new Set(transactions.map(txn => txn.category))];
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add unique categories to dropdown
  uniqueCategories.sort().forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Revenue Trend Chart Functions
let revenueChart = null;

function getMonthlyRevenueData() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Get filtered transactions based on category
  let filteredTransactions = transactions;
  if (categoryFilter && categoryFilter.value !== 'all') {
    filteredTransactions = transactions.filter(txn => txn.category === categoryFilter.value);
  }
  
  // Filter only revenue (income) transactions
  const revenueTransactions = filteredTransactions.filter(txn => txn.direction === 'Income');
  
  // Group by month
  const monthlyData = {};
  revenueTransactions.forEach(txn => {
    const date = new Date(txn.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        name: monthName,
        total: 0,
        count: 0
      };
    }
    
    monthlyData[monthKey].total += txn.amount;
    monthlyData[monthKey].count += 1;
  });
  
  // Sort by month and return arrays for Chart.js
  const sortedMonths = Object.keys(monthlyData).sort();
  const labels = sortedMonths.map(key => monthlyData[key].name);
  const values = sortedMonths.map(key => monthlyData[key].total);
  const counts = sortedMonths.map(key => monthlyData[key].count);
  
  return { labels, values, counts };
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
            label: function(context) {
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
            callback: function(value) {
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
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Get filtered transactions based on category
  let filteredTransactions = transactions;
  if (categoryFilter && categoryFilter.value !== 'all') {
    filteredTransactions = transactions.filter(txn => txn.category === categoryFilter.value);
  }
  
  // Only analyze Service Revenue transactions (actual services requested by customers)
  const serviceTransactions = filteredTransactions.filter(txn => 
    txn.direction === 'Income' && txn.category === 'Service Revenue'
  );
  
  // Group by service type
  const serviceData = {};
  serviceTransactions.forEach(txn => {
    const serviceType = extractServiceType(txn.description);
    
    if (!serviceData[serviceType]) {
      serviceData[serviceType] = {
        count: 0,
        revenue: 0
      };
    }
    
    serviceData[serviceType].count += 1;
    serviceData[serviceType].revenue += txn.amount;
  });
  
  // Sort services by request count (descending) and take top 5
  const sortedServices = Object.keys(serviceData).sort((a, b) => 
    serviceData[b].count - serviceData[a].count
  );
  
  // Take only top 5 services
  const top5Services = sortedServices.slice(0, 5);
  
  // Group remaining services as "Others" if there are more than 5
  let labels, counts, revenues;
  if (sortedServices.length > 5) {
    const othersCount = sortedServices.slice(5).reduce((sum, service) => 
      sum + serviceData[service].count, 0
    );
    const othersRevenue = sortedServices.slice(5).reduce((sum, service) => 
      sum + serviceData[service].revenue, 0
    );
    
    labels = [...top5Services, 'Others'];
    counts = [...top5Services.map(service => serviceData[service].count), othersCount];
    revenues = [...top5Services.map(service => serviceData[service].revenue), othersRevenue];
  } else {
    labels = top5Services;
    counts = top5Services.map(service => serviceData[service].count);
    revenues = top5Services.map(service => serviceData[service].revenue);
  }
  
  return { labels, counts, revenues, serviceData };
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
            label: function(context) {
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
document.addEventListener('DOMContentLoaded', function() {
  initializeCategoryFilter();
  renderTransactions();
  updateFinancialSummary();
  createRevenueChart();
  createServiceChart();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  const dateRange = document.getElementById('dateRange');
  if (dateRange) {
    dateRange.addEventListener('change', function() {
      if (this.value === 'custom') {
        document.getElementById('customDateRange').style.display = 'flex';
        document.getElementById('customDateRangeEnd').style.display = 'flex';
      } else {
        document.getElementById('customDateRange').style.display = 'none';
        document.getElementById('customDateRangeEnd').style.display = 'none';
        renderTransactions();
        updateFinancialSummary();
      }
    });
  }
}

// Render transactions table
function renderTransactions() {
  const tableBody = document.getElementById('tableBody');
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Get filtered transactions based on category
  let filteredTransactions = transactions;
  if (categoryFilter && categoryFilter.value !== 'all') {
    filteredTransactions = transactions.filter(txn => txn.category === categoryFilter.value);
  }
  
  if (filteredTransactions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
          No transactions found for the selected category
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = filteredTransactions.map(txn => `
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
  
  // Get filtered transactions based on category
  let filteredTransactions = transactions;
  if (categoryFilter && categoryFilter.value !== 'all') {
    filteredTransactions = transactions.filter(txn => txn.category === categoryFilter.value);
  }
  
  const totalIncome = filteredTransactions
    .filter(t => t.direction === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.direction === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpense;
  
  const receivables = filteredTransactions
    .filter(t => t.direction === 'Income' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const payables = filteredTransactions
    .filter(t => t.direction === 'Expense' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Update summary cards
  document.getElementById('totalIncome').textContent = `$${formatNumber(totalIncome)}`;
  document.getElementById('totalExpense').textContent = `$${formatNumber(totalExpense)}`;
  document.getElementById('netProfit').textContent = `$${formatNumber(netProfit)}`;
  document.getElementById('receivables').textContent = `$${formatNumber(receivables)}`;
  document.getElementById('payables').textContent = `$${formatNumber(payables)}`;
  
  // Update filter indicator
  const filterIndicator = document.getElementById('filterIndicator');
  const currentCategory = document.getElementById('currentCategory');
  if (categoryFilter && categoryFilter.value !== 'all') {
    filterIndicator.style.display = 'flex';
    currentCategory.textContent = categoryFilter.value;
  } else {
    filterIndicator.style.display = 'none';
  }
  
  // Update profit card color based on positive/negative
  const profitCard = document.querySelector('.summary-card.profit');
  if (netProfit >= 0) {
    profitCard.classList.remove('negative');
    profitCard.classList.add('positive');
  } else {
    profitCard.classList.remove('positive');
    profitCard.classList.add('negative');
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

// Update report
function updateReport() {
  renderTransactions();
  updateFinancialSummary();
  createRevenueChart();
  createServiceChart();
}

// Export to CSV
function exportToCSV() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Get filtered transactions based on category
  let filteredTransactions = transactions;
  if (categoryFilter && categoryFilter.value !== 'all') {
    filteredTransactions = transactions.filter(txn => txn.category === categoryFilter.value);
  }
  
  let csv = 'Txn ID,Date,Category,Direction,Amount,Status,Description,Employee,Request Order\n';
  
  filteredTransactions.forEach(txn => {
    csv += `"${txn.txnId}","${txn.date}","${txn.category}","${txn.direction}","${txn.amount}","${txn.status}","${txn.description}","${txn.employee}","${txn.requestOrder}"\n`;
  });
  
  // Add summary for filtered data
  const totalIncome = filteredTransactions.filter(t => t.direction === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.direction === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const receivables = filteredTransactions.filter(t => t.direction === 'Income' && t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
  const payables = filteredTransactions.filter(t => t.direction === 'Expense' && t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
  
  csv += '\n';
  csv += `"Total Income","","","","${totalIncome}","","","",""\n`;
  csv += `"Total Expense","","","","${totalExpense}","","","",""\n`;
  csv += `"Net Profit","","","","${netProfit}","","","",""\n`;
  csv += `"Receivables","","","","${receivables}","","","",""\n`;
  csv += `"Payables","","","","${payables}","","","",""\n`;
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const categoryName = categoryFilter.value === 'all' ? 'all_categories' : categoryFilter.value.replace(/\s+/g, '_').toLowerCase();
  a.setAttribute('href', url);
  a.setAttribute('download', `financial_report_${categoryName}_${new Date().toISOString().split('T')[0]}.csv`);
  a.click();
  window.URL.revokeObjectURL(url);
}
