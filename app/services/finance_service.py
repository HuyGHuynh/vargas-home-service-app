"""
Financial service for handling business logic related to financial operations.
"""
from typing import List, Dict, Any, Optional
from repositories.finance_repository import FinanceRepository


class FinanceService:
    
    @staticmethod
    def get_financial_data(category_filter: Optional[str] = None,
                          start_date: Optional[str] = None,
                          end_date: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive financial data including transactions and summary."""
        
        # Get transactions
        transactions = FinanceRepository.get_all_transactions(
            category_filter=category_filter,
            start_date=start_date,
            end_date=end_date
        )
        
        # Format transactions for frontend
        formatted_transactions = []
        for txn in transactions:
            formatted_transactions.append({
                'txnId': f"TXN-{txn['txn_id']}",
                'rawId': txn['txn_id'],  # Raw ID for API calls
                'date': txn['txn_date'],
                'category': txn['category'],
                'direction': 'Income' if txn['direction'] == 'IN' else 'Expense',
                'amount': txn['amount'],
                'status': txn['status'],
                'description': txn['description'],
                'employee': txn['employee_name'],
                'requestOrder': txn['request_order']
            })
        
        # Get summary
        summary = FinanceRepository.get_financial_summary(
            category_filter=category_filter,
            start_date=start_date,
            end_date=end_date
        )
        
        # Get categories
        categories = FinanceRepository.get_all_categories()
        category_names = [cat['category_name'] for cat in categories]
        
        return {
            'transactions': formatted_transactions,
            'summary': summary,
            'categories': category_names
        }
    
    @staticmethod
    def get_chart_data(category_filter: Optional[str] = None) -> Dict[str, Any]:
        """Get data for charts (revenue trend and service distribution)."""
        
        # Monthly revenue data
        monthly_revenue = FinanceRepository.get_monthly_revenue_data(category_filter)
        revenue_chart_data = {
            'labels': [data['month_name'] for data in monthly_revenue],
            'values': [data['total_revenue'] for data in monthly_revenue],
            'counts': [data['transaction_count'] for data in monthly_revenue]
        }
        
        # Service distribution data
        service_distribution = FinanceRepository.get_service_distribution_data(category_filter)
        service_chart_data = {
            'labels': [data['category'] for data in service_distribution],
            'counts': [data['count'] for data in service_distribution],
            'revenues': [data['revenue'] for data in service_distribution]
        }
        
        return {
            'revenue_chart': revenue_chart_data,
            'service_chart': service_chart_data
        }
    
    @staticmethod
    def export_transactions_csv(category_filter: Optional[str] = None,
                               start_date: Optional[str] = None,
                               end_date: Optional[str] = None) -> str:
        """Generate CSV content for export."""
        
        # Get transactions
        transactions = FinanceRepository.get_all_transactions(
            category_filter=category_filter,
            start_date=start_date,
            end_date=end_date
        )
        
        # Get summary
        summary = FinanceRepository.get_financial_summary(
            category_filter=category_filter,
            start_date=start_date,
            end_date=end_date
        )
        
        # Generate CSV content
        csv_lines = ['Txn ID,Date,Category,Direction,Amount,Status,Description,Employee,Request Order']
        
        for txn in transactions:
            direction = 'Income' if txn['direction'] == 'IN' else 'Expense'
            
            # Format date to be more Excel-friendly (MM/DD/YYYY)
            date_str = txn['txn_date']
            if date_str:
                try:
                    from datetime import datetime
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    formatted_date = date_obj.strftime('%m/%d/%Y')
                except:
                    formatted_date = date_str
            else:
                formatted_date = ''
            
            csv_lines.append(
                f'"TXN-{txn["txn_id"]}","{formatted_date}","{txn["category"]}","'
                f'{direction}","{txn["amount"]}","{txn["status"]}","'
                f'{txn["description"]}","{txn["employee_name"]}","{txn["request_order"]}"'
            )
        
        # Add summary
        csv_lines.extend([
            '',
            f'"Total Income","","","","{summary["total_income"]}","","","",""',
            f'"Total Expense","","","","{summary["total_expense"]}","","","",""',
            f'"Net Profit","","","","{summary["net_profit"]}","","","",""',
            f'"Receivables","","","","{summary["receivables"]}","","","",""',
            f'"Payables","","","","{summary["payables"]}","","","",""'
        ])
        
        return '\n'.join(csv_lines)
    
    @staticmethod
    def create_transaction(transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new financial transaction."""
        
        # Validate required fields
        required_fields = ['category_id', 'direction', 'amount', 'description']
        for field in required_fields:
            if field not in transaction_data or transaction_data[field] is None:
                return {
                    'success': False,
                    'message': f'Missing required field: {field}'
                }
        
        # Convert direction format (Income/Expense -> IN/OUT)
        if transaction_data['direction'] == 'Income':
            transaction_data['direction'] = 'IN'
        elif transaction_data['direction'] == 'Expense':
            transaction_data['direction'] = 'OUT'
        
        # Create transaction
        txn_id = FinanceRepository.create_transaction(transaction_data)
        
        if txn_id:
            return {
                'success': True,
                'message': 'Transaction created successfully',
                'txn_id': txn_id
            }
        else:
            return {
                'success': False,
                'message': 'Failed to create transaction'
            }