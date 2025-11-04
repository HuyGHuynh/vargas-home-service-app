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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  renderTransactions();
  updateFinancialSummary();
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
  
  if (transactions.length === 0) {
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
  const totalIncome = transactions
    .filter(t => t.direction === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.direction === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpense;
  
  const receivables = transactions
    .filter(t => t.direction === 'Income' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const payables = transactions
    .filter(t => t.direction === 'Expense' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Update summary cards
  document.getElementById('totalIncome').textContent = `$${formatNumber(totalIncome)}`;
  document.getElementById('totalExpense').textContent = `$${formatNumber(totalExpense)}`;
  document.getElementById('netProfit').textContent = `$${formatNumber(netProfit)}`;
  document.getElementById('receivables').textContent = `$${formatNumber(receivables)}`;
  document.getElementById('payables').textContent = `$${formatNumber(payables)}`;
  
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
}

// Export to CSV
function exportToCSV() {
  let csv = 'Txn ID,Date,Category,Direction,Amount,Status,Description,Employee,Request Order\n';
  
  transactions.forEach(txn => {
    csv += `"${txn.txnId}","${txn.date}","${txn.category}","${txn.direction}","${txn.amount}","${txn.status}","${txn.description}","${txn.employee}","${txn.requestOrder}"\n`;
  });
  
  // Add summary
  const totalIncome = transactions.filter(t => t.direction === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.direction === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const receivables = transactions.filter(t => t.direction === 'Income' && t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
  const payables = transactions.filter(t => t.direction === 'Expense' && t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
  
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
  a.setAttribute('href', url);
  a.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
  a.click();
  window.URL.revokeObjectURL(url);
}
