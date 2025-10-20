"""
Application configuration.
Loads environment variables and provides configuration settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables
# Uses DOTENV_PATH if set (e.g., ".env.test"), otherwise falls back to ".env"
load_dotenv(dotenv_path=os.getenv("DOTENV_PATH", ".env"))


class Config:
    """Base configuration class."""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    
    # Database settings
    DATABASE_URL = os.getenv('DATABASE_URL')
    
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
