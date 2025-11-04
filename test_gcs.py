#!/usr/bin/env python3
"""
Test script to debug Google Cloud Storage connection.
"""
import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

def test_environment():
    """Test environment variables and file paths."""
    print("=== Environment Variables ===")
    
    # Load .env file
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    print(f"Loading .env from: {env_path}")
    load_dotenv(dotenv_path=env_path)
    
    # Check environment variables
    bucket_name = os.getenv('GCS_BUCKET_NAME')
    project_id = os.getenv('GCS_PROJECT_ID')
    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    
    print(f"GCS_BUCKET_NAME: {bucket_name}")
    print(f"GCS_PROJECT_ID: {project_id}")
    print(f"GOOGLE_APPLICATION_CREDENTIALS: {credentials_path}")
    
    # Check if credentials file exists
    if credentials_path:
        if not os.path.isabs(credentials_path):
            # Convert relative to absolute path
            abs_path = Path(__file__).parent / credentials_path
            print(f"Relative path converted to: {abs_path}")
            credentials_path = str(abs_path)
        
        if os.path.exists(credentials_path):
            print(f"✅ Credentials file exists: {credentials_path}")
            # Set the environment variable for Google Cloud
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
        else:
            print(f"❌ Credentials file NOT found: {credentials_path}")
            return False
    else:
        print("❌ GOOGLE_APPLICATION_CREDENTIALS not set")
        return False
    
    return True

def test_gcs_connection():
    """Test Google Cloud Storage connection."""
    print("\n=== Testing Google Cloud Storage Connection ===")
    
    try:
        from google.cloud import storage
        
        # Initialize client
        client = storage.Client()
        print(f"✅ Storage client initialized successfully")
        
        # Test bucket access
        bucket_name = os.getenv('GCS_BUCKET_NAME')
        bucket = client.bucket(bucket_name)
        
        # Try to list objects (this will test authentication)
        blobs = list(bucket.list_blobs(max_results=1))
        print(f"✅ Successfully connected to bucket: {bucket_name}")
        print(f"   Bucket contains {len(blobs)} objects (showing max 1)")
        
        return True
        
    except Exception as e:
        print(f"❌ Google Cloud Storage connection failed: {e}")
        return False

def test_image_service():
    """Test the ImageService class."""
    print("\n=== Testing ImageService ===")
    
    try:
        from services.image_service import ImageService
        
        # Initialize service
        service = ImageService()
        print(f"✅ ImageService initialized successfully")
        print(f"   Bucket: {service.bucket_name}")
        print(f"   Project: {service.project_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ ImageService initialization failed: {e}")
        return False

if __name__ == "__main__":
    print("Google Cloud Storage Connection Test")
    print("=" * 50)
    
    # Test environment setup
    if not test_environment():
        print("\n❌ Environment setup failed. Check your .env file and credentials.")
        sys.exit(1)
    
    # Test GCS connection
    if not test_gcs_connection():
        print("\n❌ GCS connection failed. Check your credentials and permissions.")
        sys.exit(1)
    
    # Test ImageService
    if not test_image_service():
        print("\n❌ ImageService test failed.")
        sys.exit(1)
    
    print("\n🎉 All tests passed! Your Google Cloud Storage setup is working correctly.")