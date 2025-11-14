#!/usr/bin/env python3
"""
Warranty Cleanup Background Task

This script should be run periodically (e.g., via cron job) to clean up
inactive warranties that have been declined for more than 24 hours.

Usage:
    python app/cleanup_warranties.py

Or schedule it to run every hour via cron:
    0 * * * * /usr/bin/python3 /path/to/app/cleanup_warranties.py
"""

import sys
import os
import requests
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), '..', 'logs', 'warranty_cleanup.log')),
        logging.StreamHandler()
    ]
)

def cleanup_warranties(base_url='http://localhost:5000'):
    """
    Clean up inactive warranties that are older than 24 hours.
    
    Args:
        base_url (str): Base URL of the Flask application
        
    Returns:
        bool: True if cleanup was successful, False otherwise
    """
    try:
        logging.info("Starting warranty cleanup process...")
        
        # Make API call to cleanup endpoint
        response = requests.delete(f'{base_url}/api/warranties/cleanup', timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                deleted_count = result.get('deleted_count', 0)
                logging.info(f"✅ Successfully cleaned up {deleted_count} inactive warranties")
                return True
            else:
                error_msg = result.get('error', 'Unknown error')
                logging.error(f"❌ API returned error: {error_msg}")
                return False
        else:
            logging.error(f"❌ HTTP error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        logging.error("❌ Failed to connect to the Flask application. Make sure it's running.")
        return False
    except requests.exceptions.Timeout:
        logging.error("❌ Request timed out. The application may be overloaded.")
        return False
    except Exception as e:
        logging.error(f"❌ Unexpected error during warranty cleanup: {str(e)}")
        return False

def main():
    """Main function to run warranty cleanup."""
    try:
        # Create logs directory if it doesn't exist
        logs_dir = os.path.join(os.path.dirname(__file__), '..', 'logs')
        os.makedirs(logs_dir, exist_ok=True)
        
        logging.info("="*50)
        logging.info("Warranty Cleanup Task Started")
        logging.info(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logging.info("="*50)
        
        # Get base URL from environment variable or use default
        base_url = os.getenv('BASE_URL', 'http://localhost:5000')
        logging.info(f"Using base URL: {base_url}")
        
        # Run cleanup
        success = cleanup_warranties(base_url)
        
        if success:
            logging.info("✅ Warranty cleanup completed successfully")
            logging.info("="*50)
            sys.exit(0)
        else:
            logging.error("❌ Warranty cleanup failed - check logs above for details")
            logging.info("="*50)
            sys.exit(1)
            
    except KeyboardInterrupt:
        logging.info("🛑 Cleanup interrupted by user")
        sys.exit(1)
    except Exception as e:
        logging.error(f"❌ Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()