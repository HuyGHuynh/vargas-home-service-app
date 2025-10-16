// Sample financial data
const financialData = {
    workOrders: [
        {
            id: "WO-2025-001",
            date: "2025-10-01",
            customer: "John Smith",
            service: "HVAC Repair",
            revenue: 450.00,
            laborCost: 180.00,
            materialCost: 120.00,
            status: "completed",
            duration: 3.5
        },
        {
            id: "WO-2025-002",
            date: "2025-10-03",
            customer: "Sarah Johnson",
            service: "Plumbing Installation",
            revenue: 650.00,
            laborCost: 280.00,
            materialCost: 200.00,
            status: "completed",
            duration: 5.0
        },
        {
            id: "WO-2025-003",
            date: "2025-10-05",
            customer: "Michael Brown",
            service: "Electrical Repair",
            revenue: 320.00,
            laborCost: 150.00,
            materialCost: 80.00,
            status: "completed",
            duration: 2.5
        },
        {
            id: "WO-2025-004",
            date: "2025-10-07",
            customer: "Emily Davis",
            service: "Kitchen Remodel",
            revenue: 3500.00,
            laborCost: 1800.00,
            materialCost: 1200.00,
            status: "completed",
            duration: 40.0
        },
        {
            id: "WO-2025-005",
            date: "2025-10-08",
            customer: "Robert Wilson",
            service: "Roof Repair",
            revenue: 2800.00,
            laborCost: 1200.00,
            materialCost: 1000.00,
            status: "completed",
            duration: 30.0
        },
        {
            id: "WO-2025-006",
            date: "2025-10-10",
            customer: "Jennifer Martinez",
            service: "Water Heater Installation",
            revenue: 890.00,
            laborCost: 320.00,
            materialCost: 400.00,
            status: "completed",
            duration: 4.0
        },
        {
            id: "WO-2025-007",
            date: "2025-10-11",
            customer: "David Anderson",
            service: "Deck Repair",
            revenue: 1250.00,
            laborCost: 600.00,
            materialCost: 450.00,
            status: "completed",
            duration: 12.0
        },
        {
            id: "WO-2025-008",
            date: "2025-10-12",
            customer: "Lisa White",
            service: "Bathroom Renovation",
            revenue: 4200.00,
            laborCost: 2100.00,
            materialCost: 1500.00,
            status: "completed",
            duration: 45.0
        },
        {
            id: "WO-2025-009",
            date: "2025-10-13",
            customer: "James Taylor",
            service: "Gutter Installation",
            revenue: 780.00,
            laborCost: 350.00,
            materialCost: 250.00,
            status: "completed",
            duration: 6.0
        },
        {
            id: "WO-2025-010",
            date: "2025-10-14",
            customer: "Maria Garcia",
            service: "Drywall Repair",
            revenue: 420.00,
            laborCost: 200.00,
            materialCost: 100.00,
            status: "completed",
            duration: 4.0
        },
        {
            id: "WO-2025-011",
            date: "2025-10-15",
            customer: "Thomas Moore",
            service: "Painting Service",
            revenue: 1650.00,
            laborCost: 900.00,
            materialCost: 400.00,
            status: "completed",
            duration: 20.0
        }
    ]
};

let currentReportType = 'summary';
let currentDateRange = 'current-month';

// Load report on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set up date range listener
    document.getElementById('dateRange').addEventListener('change', function() {
        const customRange = document.getElementById('customDateRange');
        const customRangeEnd = document.getElementById('customDateRangeEnd');
        
        if (this.value === 'custom') {
            customRange.style.display = 'flex';
            customRangeEnd.style.display = 'flex';
        } else {
            customRange.style.display = 'none';
            customRangeEnd.style.display = 'none';
        }
    });
    
    updateReport();
});

// Update report based on filters
function updateReport() {
    currentReportType = document.getElementById('reportType').value;
    currentDateRange = document.getElementById('dateRange').value;
    
    // Filter data based on date range
    const filteredData = filterDataByDateRange(financialData.workOrders);
    
    // Update summary cards
    updateSummaryCards(filteredData);
    
    // Update detailed report table
    updateReportTable(filteredData);
}

// Filter data by date range
function filterDataByDateRange(data) {
    const now = new Date();
    let startDate, endDate;
    
    switch (currentDateRange) {
        case 'current-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'last-month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'current-quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
            break;
        case 'current-year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
        case 'custom':
            const startInput = document.getElementById('startDate').value;
            const endInput = document.getElementById('endDate').value;
            if (startInput && endInput) {
                startDate = new Date(startInput);
                endDate = new Date(endInput);
            } else {
                return data; // Return all data if custom dates not set
            }
            break;
        default:
            return data;
    }
    
    return data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });
}

// Update summary cards
function updateSummaryCards(data) {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalLabor = data.reduce((sum, item) => sum + item.laborCost, 0);
    const totalMaterial = data.reduce((sum, item) => sum + item.materialCost, 0);
    const netProfit = totalRevenue - totalLabor - totalMaterial;
    const completedOrders = data.filter(item => item.status === 'completed').length;
    
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('totalLabor').textContent = `$${totalLabor.toFixed(2)}`;
    document.getElementById('netProfit').textContent = `$${netProfit.toFixed(2)}`;
    document.getElementById('completedOrders').textContent = completedOrders;
    
    // Calculate percentage changes (mock data for demo)
    document.getElementById('revenueChange').textContent = '+15.2%';
    document.getElementById('laborChange').textContent = '+8.5%';
    document.getElementById('profitChange').textContent = '+22.3%';
    document.getElementById('ordersChange').textContent = '+12';
}

// Update report table
function updateReportTable(data) {
    const table = document.getElementById('reportTable');
    const thead = document.getElementById('tableHeader');
    const tbody = document.getElementById('tableBody');
    const tfoot = document.getElementById('tableFooter');
    
    // Clear existing content
    thead.innerHTML = '';
    tbody.innerHTML = '';
    tfoot.innerHTML = '';
    
    switch (currentReportType) {
        case 'summary':
            generateSummaryReport(data, thead, tbody, tfoot);
            document.getElementById('reportTitle').textContent = 'Summary Report';
            break;
        case 'revenue':
            generateRevenueReport(data, thead, tbody, tfoot);
            document.getElementById('reportTitle').textContent = 'Revenue Details';
            break;
        case 'labor':
            generateLaborReport(data, thead, tbody, tfoot);
            document.getElementById('reportTitle').textContent = 'Labor Costs';
            break;
        case 'work-orders':
            generateWorkOrdersReport(data, thead, tbody, tfoot);
            document.getElementById('reportTitle').textContent = 'Completed Work Orders';
            break;
    }
}

// Generate summary report
function generateSummaryReport(data, thead, tbody, tfoot) {
    thead.innerHTML = `
        <tr>
            <th>Service Type</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Labor Cost</th>
            <th>Material Cost</th>
            <th>Net Profit</th>
            <th>Margin %</th>
        </tr>
    `;
    
    // Group by service type
    const serviceGroups = {};
    data.forEach(item => {
        if (!serviceGroups[item.service]) {
            serviceGroups[item.service] = {
                count: 0,
                revenue: 0,
                labor: 0,
                material: 0
            };
        }
        serviceGroups[item.service].count++;
        serviceGroups[item.service].revenue += item.revenue;
        serviceGroups[item.service].labor += item.laborCost;
        serviceGroups[item.service].material += item.materialCost;
    });
    
    let totalRevenue = 0, totalLabor = 0, totalMaterial = 0, totalOrders = 0;
    
    Object.entries(serviceGroups).forEach(([service, stats]) => {
        const profit = stats.revenue - stats.labor - stats.material;
        const margin = (profit / stats.revenue * 100).toFixed(1);
        
        tbody.innerHTML += `
            <tr>
                <td>${service}</td>
                <td>${stats.count}</td>
                <td class="amount-positive">$${stats.revenue.toFixed(2)}</td>
                <td>$${stats.labor.toFixed(2)}</td>
                <td>$${stats.material.toFixed(2)}</td>
                <td class="amount-positive">$${profit.toFixed(2)}</td>
                <td>${margin}%</td>
            </tr>
        `;
        
        totalRevenue += stats.revenue;
        totalLabor += stats.labor;
        totalMaterial += stats.material;
        totalOrders += stats.count;
    });
    
    const totalProfit = totalRevenue - totalLabor - totalMaterial;
    const totalMargin = (totalProfit / totalRevenue * 100).toFixed(1);
    
    tfoot.innerHTML = `
        <tr>
            <td><strong>TOTAL</strong></td>
            <td><strong>${totalOrders}</strong></td>
            <td><strong>$${totalRevenue.toFixed(2)}</strong></td>
            <td><strong>$${totalLabor.toFixed(2)}</strong></td>
            <td><strong>$${totalMaterial.toFixed(2)}</strong></td>
            <td><strong>$${totalProfit.toFixed(2)}</strong></td>
            <td><strong>${totalMargin}%</strong></td>
        </tr>
    `;
}

// Generate revenue report
function generateRevenueReport(data, thead, tbody, tfoot) {
    thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Work Order ID</th>
            <th>Customer</th>
            <th>Service</th>
            <th>Revenue</th>
            <th>Status</th>
        </tr>
    `;
    
    let totalRevenue = 0;
    
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>${item.id}</td>
                <td>${item.customer}</td>
                <td>${item.service}</td>
                <td class="amount-positive">$${item.revenue.toFixed(2)}</td>
                <td><span class="status-badge ${item.status}">${item.status}</span></td>
            </tr>
        `;
        totalRevenue += item.revenue;
    });
    
    tfoot.innerHTML = `
        <tr>
            <td colspan="4"><strong>TOTAL REVENUE</strong></td>
            <td colspan="2"><strong>$${totalRevenue.toFixed(2)}</strong></td>
        </tr>
    `;
}

// Generate labor report
function generateLaborReport(data, thead, tbody, tfoot) {
    thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Work Order ID</th>
            <th>Service</th>
            <th>Duration (hrs)</th>
            <th>Labor Cost</th>
            <th>Hourly Rate</th>
        </tr>
    `;
    
    let totalLabor = 0;
    let totalHours = 0;
    
    data.forEach(item => {
        const hourlyRate = (item.laborCost / item.duration).toFixed(2);
        tbody.innerHTML += `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>${item.id}</td>
                <td>${item.service}</td>
                <td>${item.duration}</td>
                <td>$${item.laborCost.toFixed(2)}</td>
                <td>$${hourlyRate}/hr</td>
            </tr>
        `;
        totalLabor += item.laborCost;
        totalHours += item.duration;
    });
    
    const avgRate = (totalLabor / totalHours).toFixed(2);
    
    tfoot.innerHTML = `
        <tr>
            <td colspan="3"><strong>TOTAL</strong></td>
            <td><strong>${totalHours.toFixed(1)} hrs</strong></td>
            <td><strong>$${totalLabor.toFixed(2)}</strong></td>
            <td><strong>$${avgRate}/hr avg</strong></td>
        </tr>
    `;
}

// Generate work orders report
function generateWorkOrdersReport(data, thead, tbody, tfoot) {
    thead.innerHTML = `
        <tr>
            <th>Work Order ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Service</th>
            <th>Revenue</th>
            <th>Total Cost</th>
            <th>Profit</th>
            <th>Status</th>
        </tr>
    `;
    
    let totalRevenue = 0, totalCost = 0, totalProfit = 0;
    
    data.forEach(item => {
        const cost = item.laborCost + item.materialCost;
        const profit = item.revenue - cost;
        
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${formatDate(item.date)}</td>
                <td>${item.customer}</td>
                <td>${item.service}</td>
                <td class="amount-positive">$${item.revenue.toFixed(2)}</td>
                <td>$${cost.toFixed(2)}</td>
                <td class="amount-positive">$${profit.toFixed(2)}</td>
                <td><span class="status-badge ${item.status}">${item.status}</span></td>
            </tr>
        `;
        
        totalRevenue += item.revenue;
        totalCost += cost;
        totalProfit += profit;
    });
    
    tfoot.innerHTML = `
        <tr>
            <td colspan="4"><strong>TOTAL</strong></td>
            <td><strong>$${totalRevenue.toFixed(2)}</strong></td>
            <td><strong>$${totalCost.toFixed(2)}</strong></td>
            <td colspan="2"><strong>$${totalProfit.toFixed(2)}</strong></td>
        </tr>
    `;
}

// Export to CSV
function exportToCSV() {
    const reportType = document.getElementById('reportType').value;
    const dateRange = document.getElementById('dateRange').value;
    const filteredData = filterDataByDateRange(financialData.workOrders);
    
    if (filteredData.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }
    
    let csv = '';
    let filename = '';
    
    // Generate CSV based on report type
    switch (reportType) {
        case 'summary':
            csv = generateSummaryCSV(filteredData);
            filename = `summary_report_${dateRange}_${getCurrentDate()}.csv`;
            break;
        case 'revenue':
            csv = generateRevenueCSV(filteredData);
            filename = `revenue_report_${dateRange}_${getCurrentDate()}.csv`;
            break;
        case 'labor':
            csv = generateLaborCSV(filteredData);
            filename = `labor_report_${dateRange}_${getCurrentDate()}.csv`;
            break;
        case 'work-orders':
            csv = generateWorkOrdersCSV(filteredData);
            filename = `work_orders_report_${dateRange}_${getCurrentDate()}.csv`;
            break;
    }
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Report exported successfully!', 'success');
}

// Generate CSV for different report types
function generateSummaryCSV(data) {
    let csv = 'Service Type,Orders,Revenue,Labor Cost,Material Cost,Net Profit,Margin %\n';
    
    const serviceGroups = {};
    data.forEach(item => {
        if (!serviceGroups[item.service]) {
            serviceGroups[item.service] = { count: 0, revenue: 0, labor: 0, material: 0 };
        }
        serviceGroups[item.service].count++;
        serviceGroups[item.service].revenue += item.revenue;
        serviceGroups[item.service].labor += item.laborCost;
        serviceGroups[item.service].material += item.materialCost;
    });
    
    let totalRevenue = 0, totalLabor = 0, totalMaterial = 0, totalOrders = 0;
    
    Object.entries(serviceGroups).forEach(([service, stats]) => {
        const profit = stats.revenue - stats.labor - stats.material;
        const margin = (profit / stats.revenue * 100).toFixed(1);
        
        csv += `"${service}",${stats.count},${stats.revenue.toFixed(2)},${stats.labor.toFixed(2)},${stats.material.toFixed(2)},${profit.toFixed(2)},${margin}\n`;
        
        totalRevenue += stats.revenue;
        totalLabor += stats.labor;
        totalMaterial += stats.material;
        totalOrders += stats.count;
    });
    
    const totalProfit = totalRevenue - totalLabor - totalMaterial;
    const totalMargin = (totalProfit / totalRevenue * 100).toFixed(1);
    
    csv += `\nTOTAL,${totalOrders},${totalRevenue.toFixed(2)},${totalLabor.toFixed(2)},${totalMaterial.toFixed(2)},${totalProfit.toFixed(2)},${totalMargin}\n`;
    
    return csv;
}

function generateRevenueCSV(data) {
    let csv = 'Date,Work Order ID,Customer,Service,Revenue,Status\n';
    let totalRevenue = 0;
    
    data.forEach(item => {
        csv += `${item.date},"${item.id}","${item.customer}","${item.service}",${item.revenue.toFixed(2)},${item.status}\n`;
        totalRevenue += item.revenue;
    });
    
    csv += `\n,,,TOTAL REVENUE,${totalRevenue.toFixed(2)},\n`;
    return csv;
}

function generateLaborCSV(data) {
    let csv = 'Date,Work Order ID,Service,Duration (hrs),Labor Cost,Hourly Rate\n';
    let totalLabor = 0, totalHours = 0;
    
    data.forEach(item => {
        const hourlyRate = (item.laborCost / item.duration).toFixed(2);
        csv += `${item.date},"${item.id}","${item.service}",${item.duration},${item.laborCost.toFixed(2)},${hourlyRate}\n`;
        totalLabor += item.laborCost;
        totalHours += item.duration;
    });
    
    const avgRate = (totalLabor / totalHours).toFixed(2);
    csv += `\n,,TOTAL,${totalHours.toFixed(1)},${totalLabor.toFixed(2)},${avgRate}\n`;
    return csv;
}

function generateWorkOrdersCSV(data) {
    let csv = 'Work Order ID,Date,Customer,Service,Revenue,Total Cost,Profit,Status\n';
    let totalRevenue = 0, totalCost = 0, totalProfit = 0;
    
    data.forEach(item => {
        const cost = item.laborCost + item.materialCost;
        const profit = item.revenue - cost;
        
        csv += `"${item.id}",${item.date},"${item.customer}","${item.service}",${item.revenue.toFixed(2)},${cost.toFixed(2)},${profit.toFixed(2)},${item.status}\n`;
        
        totalRevenue += item.revenue;
        totalCost += cost;
        totalProfit += profit;
    });
    
    csv += `\n,,,TOTAL,${totalRevenue.toFixed(2)},${totalCost.toFixed(2)},${totalProfit.toFixed(2)},\n`;
    return csv;
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'linear-gradient(135deg, #f44336, #d32f2f)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
