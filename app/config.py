"""
Application configuration.
Loads environment variables and provides configuration settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables
# Uses DOTENV_PATH if set (e.g., ".env.test"), otherwise falls back to ".env"
# Look for .env file in the parent directory (project root) if not found in current directory
env_path = os.getenv("DOTENV_PATH", ".env")
if not os.path.exists(env_path):
    # Try parent directory
    parent_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(parent_env_path):
        env_path = parent_env_path

load_dotenv(dotenv_path=env_path)


class Config:
    """Base configuration class."""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    
    # Database settings
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    # Gmail API settings
    SENDER_EMAIL = os.getenv('SENDER_EMAIL', '')
    SENDER_NAME = os.getenv('SENDER_NAME', "Vargas' Home Services")
    
    # Google Cloud Storage settings
    GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME', 'vargas-home-service-images')
    GCS_PROJECT_ID = os.getenv('GCS_PROJECT_ID')
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    
    @staticmethod
    def setup_gcs_credentials():
        """Set up Google Cloud Storage credentials."""
        credentials_path = Config.GOOGLE_APPLICATION_CREDENTIALS
        if credentials_path and not os.path.isabs(credentials_path):
            # Convert relative path to absolute path
            project_root = os.path.dirname(os.path.dirname(__file__))
            credentials_path = os.path.join(project_root, credentials_path)
        
        if credentials_path and os.path.exists(credentials_path):
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            return True
        return False
    
    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Application settings
    JSON_SORT_KEYS = False  # Preserve key order in JSON responses
    

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


class TestConfig(Config):
    """Test configuration."""
    TESTING = True
    DEBUG = True


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'test': TestConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get configuration based on environment."""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
