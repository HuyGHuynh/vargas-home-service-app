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
