"""
Base repository class with database connection management.
Provides common functionality for all repositories.
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager


class BaseRepository:
    """Base class for all repositories with database connection utilities."""
    
    @staticmethod
    def get_db_connection():
        """Get a database connection using DATABASE_URL from environment."""
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is not set")
        return psycopg2.connect(database_url)
    
    @staticmethod
    @contextmanager
    def get_cursor(cursor_factory=None):
        """
        Context manager for database cursor with automatic connection cleanup.
        
        Usage:
            with BaseRepository.get_cursor() as cur:
                cur.execute("SELECT * FROM table")
                results = cur.fetchall()
        """
        conn = BaseRepository.get_db_connection()
        try:
            if cursor_factory:
                cursor = conn.cursor(cursor_factory=cursor_factory)
            else:
                cursor = conn.cursor()
            try:
                yield cursor
                conn.commit()
            except Exception:
                conn.rollback()
                raise
            finally:
                cursor.close()
        finally:
            conn.close()
    
    @staticmethod
    @contextmanager
    def get_dict_cursor():
        """Get a cursor that returns results as dictionaries."""
        with BaseRepository.get_cursor(cursor_factory=RealDictCursor) as cur:
            yield cur
