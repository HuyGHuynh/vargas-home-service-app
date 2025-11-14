#!/usr/bin/env python3
"""
Test Gmail API integration for Vargas Home Services
"""
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add app to Python path (from tests directory to app directory)
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'app'))

def test_gmail_setup():
    """Test Gmail API setup and authentication."""
    print("🧪 Testing Gmail API Setup")
    print("=" * 40)
    
    try:
        from services.email_service import EmailService
        
        # Check credentials file
        if not os.path.exists('credentials.json'):
            print("❌ credentials.json not found!")
            print("   Please download it from Google Cloud Console")
            return False
        
        print("✅ credentials.json found")
        
        # Test authentication
        email_service = EmailService()
        print(f"📧 Sender email: {email_service.sender_email}")
        
        print("🔐 Testing Gmail API authentication...")
        success = email_service.test_connection()
        
        return success
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Run: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function."""
    print("🚀 Gmail API Integration Test")
    print("Press Ctrl+C to cancel anytime")
    print("=" * 40)
    
    try:
        success = test_gmail_setup()
        
        if success:
            print("\n🎉 Gmail API is ready!")
            print("✅ You can now test warranty emails from the website")
        else:
            print("\n❌ Setup incomplete")
            print("📋 Next steps:")
            print("   1. Install dependencies: pip install -r requirements.txt")
            print("   2. Set up Google Cloud Console (see instructions below)")
            print("   3. Download credentials.json")
            
    except KeyboardInterrupt:
        print("\n🛑 Test cancelled")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")

if __name__ == "__main__":
    main()