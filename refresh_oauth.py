#!/usr/bin/env python3
"""
Script to refresh OAuth token for Gmail API.
This will handle the expired token and generate a fresh one.
"""

import os
import sys
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# Gmail API scope - we only need send permission
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

def refresh_oauth_token():
    """Refresh the OAuth token for Gmail API."""
    
    # Get current directory paths
    project_root = os.path.dirname(os.path.abspath(__file__))
    credentials_file = os.path.join(project_root, 'credentials.json')
    token_file = os.path.join(project_root, 'token.json')
    
    print(f"📁 Looking for credentials at: {credentials_file}")
    print(f"📁 Token file location: {token_file}")
    
    # Check if credentials file exists
    if not os.path.exists(credentials_file):
        print(f"❌ Credentials file not found: {credentials_file}")
        print("Please download your OAuth 2.0 credentials from Google Cloud Console")
        return False
    
    creds = None
    
    # Load existing token if it exists
    if os.path.exists(token_file):
        print("📄 Loading existing token...")
        creds = Credentials.from_authorized_user_file(token_file, SCOPES)
        print(f"Token valid: {creds.valid if creds else 'No credentials loaded'}")
        if creds:
            print(f"Token expired: {creds.expired if hasattr(creds, 'expired') else 'Unknown'}")
    
    # If no valid credentials, get new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("🔄 Attempting to refresh expired token...")
            try:
                creds.refresh(Request())
                print("✅ Token refreshed successfully!")
            except Exception as e:
                print(f"❌ Token refresh failed: {e}")
                print("🔄 Will need to re-authorize...")
                creds = None
        
        if not creds or not creds.valid:
            print("🔐 Starting OAuth authorization flow...")
            print("This will open a browser window for you to authorize the application.")
            
            flow = InstalledAppFlow.from_client_secrets_file(credentials_file, SCOPES)
            creds = flow.run_local_server(port=0)
            print("✅ Authorization completed!")
        
        # Save the credentials for the next run
        print("💾 Saving new token...")
        with open(token_file, 'w') as token:
            token.write(creds.to_json())
        print(f"✅ Token saved to: {token_file}")
    
    else:
        print("✅ Token is already valid!")
    
    return True

if __name__ == "__main__":
    print("🔧 Gmail API OAuth Token Refresh Utility")
    print("=" * 50)
    
    try:
        success = refresh_oauth_token()
        if success:
            print("\n🎉 OAuth token refresh completed successfully!")
            print("You can now use the Gmail API for sending emails.")
        else:
            print("\n❌ OAuth token refresh failed.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️ Operation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)