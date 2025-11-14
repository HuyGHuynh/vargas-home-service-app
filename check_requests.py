#!/usr/bin/env python3
"""
Quick script to check recent service requests in the database.
"""
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

from repositories.servicerequest_repository import ServiceRequestRepository

def check_recent_requests():
    """Check the most recent service requests."""
    print("=== Recent Service Requests ===")
    
    try:
        # Get all service requests
        requests = ServiceRequestRepository.get_all_service_requests()
        
        if not requests:
            print("❌ No service requests found")
            return
        
        # Sort by request_id (most recent first)
        requests.sort(key=lambda x: x['request_id'], reverse=True)
        
        # Show the 5 most recent
        print(f"Found {len(requests)} total service requests")
        print("\nMost Recent 5:")
        print("-" * 80)
        
        for i, req in enumerate(requests[:5]):
            customer_name = f"{req['customer']['first_name']} {req['customer']['last_name']}"
            assigned = "Assigned" if req['assigned_employee'] else "Unassigned"
            image_status = "Has Image" if req.get('image_url') else "No Image"
            
            print(f"{i+1}. ID: {req['request_id']} | {customer_name} | {req['request_status']} | {assigned} | {image_status}")
            print(f"   Service: {req['service']['job_name']}")
            print(f"   Date: {req['preferred_datetime']}")
            if req.get('image_url'):
                print(f"   Image: {req['image_url']}")
            print()
            
    except Exception as e:
        print(f"❌ Error checking requests: {e}")

if __name__ == "__main__":
    check_recent_requests()