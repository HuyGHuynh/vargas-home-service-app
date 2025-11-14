#!/usr/bin/env python3
"""
Debug script to check specific service request and database connection.
"""
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# Add app directory to path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

from repositories.base_repository import BaseRepository

def debug_database():
    """Debug database connection and check specific records."""
    print("=== Database Debug ===")
    
    # Check database URL
    db_url = os.getenv('DATABASE_URL')
    print(f"Database URL: {db_url[:50]}..." if db_url else "❌ No DATABASE_URL")
    
    try:
        # Direct SQL query to check service requests
        with BaseRepository.get_cursor() as cursor:
            # Count total service requests
            cursor.execute("SELECT COUNT(*) FROM servicerequests;")
            total_count = cursor.fetchone()[0]
            print(f"Total service requests in database: {total_count}")
            
            # Get the highest request ID
            cursor.execute("SELECT MAX(requestid) FROM servicerequests;")
            max_id = cursor.fetchone()[0]
            print(f"Highest request ID: {max_id}")
            
            # Check if request ID 65 exists
            cursor.execute("SELECT requestid, status, description FROM servicerequests WHERE requestid = 65;")
            result_65 = cursor.fetchone()
            
            if result_65:
                print(f"✅ Request ID 65 EXISTS: Status='{result_65[1]}', Description='{result_65[2][:50]}...'")
            else:
                print("❌ Request ID 65 NOT FOUND")
            
            # Check if request ID 64 exists
            cursor.execute("SELECT requestid, status, description FROM servicerequests WHERE requestid = 64;")
            result_64 = cursor.fetchone()
            
            if result_64:
                print(f"✅ Request ID 64 EXISTS: Status='{result_64[1]}', Description='{result_64[2][:50]}...'")
            else:
                print("❌ Request ID 64 NOT FOUND")
            
            # Show the 3 most recent records
            cursor.execute("""
                SELECT requestid, status, description, preferred_datetime 
                FROM servicerequests 
                ORDER BY requestid DESC 
                LIMIT 3;
            """)
            recent_records = cursor.fetchall()
            
            print("\nMost Recent 3 Records:")
            print("-" * 60)
            for record in recent_records:
                print(f"ID: {record[0]} | Status: {record[1]} | Date: {record[3]}")
                print(f"   Description: {record[2][:50]}...")
                print()
                
    except Exception as e:
        print(f"❌ Database error: {e}")

if __name__ == "__main__":
    debug_database()