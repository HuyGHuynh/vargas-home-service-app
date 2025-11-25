"""
Repository for financial transaction operations.
Handles database operations for finance_transactions and finance_categories tables.
"""
from typing import List, Dict, Any, Optional
from .base_repository import BaseRepository


class FinanceRepository(BaseRepository):
    
    @classmethod
    def get_all_transactions(cls, category_filter: Optional[str] = None, 
                           start_date: Optional[str] = None, 
                           end_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all financial transactions with optional filters."""
        query = """
            SELECT 
                ft.txn_id,
                ft.txn_date,
                fc.category_name,
                ft.direction,
                ft.amount,
                ft.description,
                ft.status,
                COALESCE(e.firstname || ' ' || e.lastname, 'N/A') as employee_name,
                COALESCE('WO-' || ft.request_id, 'N/A') as request_order,
                ft.request_id,
                ft.employeeid,
                ft.category_id
            FROM finance_transactions ft
            LEFT JOIN finance_categories fc ON ft.category_id = fc.category_id
            LEFT JOIN employee e ON ft.employeeid = e.employeeid
        """
        
        params = []
        conditions = []
        
        if category_filter and category_filter != 'all':
            conditions.append("fc.category_name = %s")
            params.append(category_filter)
            
        if start_date:
            conditions.append("ft.txn_date >= %s")
            params.append(start_date)
            
        if end_date:
            conditions.append("ft.txn_date <= %s")
            params.append(end_date)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " ORDER BY ft.txn_date DESC, ft.txn_id DESC"
        
        try:
            with cls.get_cursor() as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                
                transactions = []
                for row in rows:
                    transactions.append({
                        'txn_id': row[0],
                        'txn_date': row[1].strftime('%Y-%m-%d') if row[1] else None,
                        'category': row[2],
                        'direction': row[3],
                        'amount': float(row[4]) if row[4] else 0.0,
                        'description': row[5],
                        'status': row[6],
                        'employee_name': row[7],
                        'request_order': row[8],
                        'request_id': row[9],
                        'employeeid': row[10],
                        'category_id': row[11]
                    })
                
                return transactions
                
        except Exception as e:
            print(f"Error fetching transactions: {e}")
            return []
    
    @classmethod
    def get_financial_summary(cls, category_filter: Optional[str] = None,
                            start_date: Optional[str] = None,
                            end_date: Optional[str] = None) -> Dict[str, float]:
        """Get financial summary (totals for income, expense, etc.)."""
        query = """
            SELECT 
                ft.direction,
                ft.status,
                COALESCE(SUM(ft.amount), 0) as total
            FROM finance_transactions ft
            LEFT JOIN finance_categories fc ON ft.category_id = fc.category_id
        """
        
        params = []
        conditions = []
        
        if category_filter and category_filter != 'all':
            conditions.append("fc.category_name = %s")
            params.append(category_filter)
            
        if start_date:
            conditions.append("ft.txn_date >= %s")
            params.append(start_date)
            
        if end_date:
            conditions.append("ft.txn_date <= %s")
            params.append(end_date)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " GROUP BY ft.direction, ft.status"
        
        try:
            with cls.get_cursor() as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                
                summary = {
                    'total_income': 0.0,
                    'total_expense': 0.0,
                    'net_profit': 0.0,
                    'receivables': 0.0,
                    'payables': 0.0
                }
                
                for row in rows:
                    direction, status, total = row
                    amount = float(total) if total else 0.0
                    
                    if direction == 'IN':
                        summary['total_income'] += amount
                        if status in ['Pending', 'Unpaid']:
                            summary['receivables'] += amount
                    elif direction == 'OUT':
                        summary['total_expense'] += amount
                        if status in ['Pending', 'Unpaid']:
                            summary['payables'] += amount
                
                summary['net_profit'] = summary['total_income'] - summary['total_expense']
                return summary
                
        except Exception as e:
            print(f"Error fetching financial summary: {e}")
            return {
                'total_income': 0.0,
                'total_expense': 0.0,
                'net_profit': 0.0,
                'receivables': 0.0,
                'payables': 0.0
            }
    
    @classmethod
    def get_all_categories(cls) -> List[Dict[str, Any]]:
        """Get all finance categories."""
        try:
            with cls.get_cursor() as cur:
                cur.execute("""
                    SELECT category_id, category_name, category_direction_type, description
                    FROM finance_categories
                    ORDER BY category_name
                """)
                rows = cur.fetchall()
                
                categories = []
                for row in rows:
                    categories.append({
                        'category_id': row[0],
                        'category_name': row[1],
                        'direction_type': row[2],
                        'description': row[3]
                    })
                
                return categories
                
        except Exception as e:
            print(f"Error fetching categories: {e}")
            return []
    
    @classmethod
    def get_monthly_revenue_data(cls, category_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get monthly revenue data for charts."""
        query = """
            SELECT 
                DATE_TRUNC('month', ft.txn_date) as month,
                COALESCE(SUM(ft.amount), 0) as total_revenue,
                COUNT(*) as transaction_count
            FROM finance_transactions ft
            LEFT JOIN finance_categories fc ON ft.category_id = fc.category_id
            WHERE ft.direction = 'IN'
        """
        
        params = []
        if category_filter and category_filter != 'all':
            query += " AND fc.category_name = %s"
            params.append(category_filter)
            
        query += """
            GROUP BY DATE_TRUNC('month', ft.txn_date)
            ORDER BY month DESC
            LIMIT 12
        """
        
        try:
            with cls.get_cursor() as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                
                monthly_data = []
                for row in rows:
                    month_date = row[0]
                    if month_date:
                        monthly_data.append({
                            'month': month_date.strftime('%Y-%m'),
                            'month_name': month_date.strftime('%b %Y'),
                            'total_revenue': float(row[1]) if row[1] else 0.0,
                            'transaction_count': row[2]
                        })
                
                # Reverse to get chronological order
                return list(reversed(monthly_data))
                
        except Exception as e:
            print(f"Error fetching monthly revenue data: {e}")
            return []
    
    @classmethod
    def get_service_distribution_data(cls, category_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get service distribution data for pie chart based on actual service types."""
        query = """
            SELECT 
                s.job_name as service_type,
                COUNT(DISTINCT ft.request_id) as request_count,
                COALESCE(SUM(CASE WHEN ft.direction = 'IN' THEN ft.amount ELSE 0 END), 0) as total_revenue
            FROM finance_transactions ft
            LEFT JOIN servicerequests sr ON ft.request_id = sr.requestid  
            LEFT JOIN services s ON sr.service_id = s.service_id
        """
        
        params = []
        conditions = ["ft.request_id IS NOT NULL", "s.job_name IS NOT NULL"]
        
        # If category filter is applied, still filter by finance category
        if category_filter and category_filter != 'all':
            query = """
                SELECT 
                    s.job_name as service_type,
                    COUNT(DISTINCT ft.request_id) as request_count,
                    COALESCE(SUM(CASE WHEN ft.direction = 'IN' THEN ft.amount ELSE 0 END), 0) as total_revenue
                FROM finance_transactions ft
                LEFT JOIN servicerequests sr ON ft.request_id = sr.requestid  
                LEFT JOIN services s ON sr.service_id = s.service_id
                LEFT JOIN finance_categories fc ON ft.category_id = fc.category_id
            """
            conditions.append("fc.category_name = %s")
            params.append(category_filter)
            
        query += " WHERE " + " AND ".join(conditions)
        query += """
            GROUP BY s.service_id, s.job_name
            ORDER BY COUNT(DISTINCT ft.request_id) DESC
            LIMIT 10
        """
        
        try:
            with cls.get_cursor() as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                
                service_data = []
                for row in rows:
                    service_data.append({
                        'category': row[0],  # Now this is the actual job name
                        'count': row[1],     # Number of distinct service requests
                        'revenue': float(row[2]) if row[2] else 0.0
                    })
                
                return service_data
                
        except Exception as e:
            print(f"Error fetching service distribution data: {e}")
            return []
    
    @classmethod
    def create_transaction(cls, transaction_data: Dict[str, Any]) -> Optional[int]:
        """Create a new financial transaction."""
        try:
            with cls.get_cursor() as cur:
                cur.execute("""
                    INSERT INTO finance_transactions 
                    (request_id, employeeid, category_id, txn_date, direction, 
                     amount, description, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING txn_id
                """, (
                    transaction_data.get('request_id'),
                    transaction_data.get('employeeid'),
                    transaction_data.get('category_id'),
                    transaction_data.get('txn_date'),
                    transaction_data.get('direction'),
                    transaction_data.get('amount'),
                    transaction_data.get('description'),
                    transaction_data.get('status', 'Cleared')
                ))
                
                return cur.fetchone()[0]
                
        except Exception as e:
            print(f"Error creating transaction: {e}")
            return None