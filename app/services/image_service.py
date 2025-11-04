"""
Image service for handling Google Cloud Storage uploads.
Handles image uploads for service requests.
"""
import os
import uuid
from google.cloud import storage
from werkzeug.utils import secure_filename
import tempfile


class ImageService:
    """Service for handling image uploads to Google Cloud Storage."""
    
    def __init__(self):
        """Initialize the image service with GCS configuration."""
        # These should be set in environment variables
        self.bucket_name = os.getenv('GCS_BUCKET_NAME', 'vargas-home-service-images')
        self.project_id = os.getenv('GCS_PROJECT_ID')
        
        # Initialize the storage client
        # This will use Application Default Credentials or service account key
        self.storage_client = storage.Client(project=self.project_id)
        self.bucket = self.storage_client.bucket(self.bucket_name)
    
    def upload_service_request_image(self, file, request_id):
        """
        Upload an image for a service request.
        
        Args:
            file: Flask file object from request.files
            request_id (int): Service request ID
            
        Returns:
            str or None: URL of uploaded image or None if failed
        """
        try:
            if not file or file.filename == '':
                return None
            
            # Validate file type
            if not self._is_allowed_file(file.filename):
                raise ValueError("Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.")
            
            # Generate unique filename
            original_filename = secure_filename(file.filename)
            file_extension = original_filename.rsplit('.', 1)[1].lower()
            unique_filename = f"service-requests/{request_id}/{uuid.uuid4().hex}.{file_extension}"
            
            # Create a temporary file to save the upload
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                file.save(temp_file.name)
                temp_file_path = temp_file.name
            
            try:
                # Upload to GCS
                blob = self.bucket.blob(unique_filename)
                
                # Set generation-match precondition to avoid race conditions
                generation_match_precondition = 0
                
                # Set content type based on file extension
                content_type = self._get_content_type(file_extension)
                
                # Upload the file with proper content type
                blob.upload_from_filename(
                    temp_file_path, 
                    content_type=content_type,
                    if_generation_match=generation_match_precondition
                )
                
                # Return URL that will display the image in browser instead of downloading
                return f"https://storage.googleapis.com/{self.bucket_name}/{unique_filename}"
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            print(f"Error uploading image: {e}")
            return None
    
    def delete_service_request_image(self, image_url):
        """
        Delete an image from Google Cloud Storage.
        
        Args:
            image_url (str): The URL of the image to delete
            
        Returns:
            bool: True if deleted successfully, False otherwise
        """
        try:
            if not image_url:
                return True
            
            # Extract blob name from URL
            blob_name = self._extract_blob_name_from_url(image_url)
            if not blob_name:
                return False
            
            blob = self.bucket.blob(blob_name)
            blob.delete()
            
            return True
            
        except Exception as e:
            print(f"Error deleting image: {e}")
            return False
    
    def upload_multiple_images(self, files, request_id, max_files=5):
        """
        Upload multiple images for a service request.
        
        Args:
            files: List of Flask file objects
            request_id (int): Service request ID
            max_files (int): Maximum number of files to upload
            
        Returns:
            list: List of uploaded image URLs
        """
        uploaded_urls = []
        
        try:
            # Limit number of files
            files_to_process = files[:max_files]
            
            for file in files_to_process:
                url = self.upload_service_request_image(file, request_id)
                if url:
                    uploaded_urls.append(url)
            
            return uploaded_urls
            
        except Exception as e:
            print(f"Error uploading multiple images: {e}")
            return uploaded_urls
    
    def _is_allowed_file(self, filename):
        """
        Check if the file type is allowed.
        
        Args:
            filename (str): The filename to check
            
        Returns:
            bool: True if file type is allowed
        """
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in allowed_extensions
    
    def _get_content_type(self, file_extension):
        """
        Get the proper MIME content type for the file extension.
        
        Args:
            file_extension (str): File extension (without dot)
            
        Returns:
            str: MIME content type
        """
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }
        return content_types.get(file_extension.lower(), 'application/octet-stream')
    
    def _extract_blob_name_from_url(self, image_url):
        """
        Extract blob name from Google Cloud Storage URL.
        
        Args:
            image_url (str): The full URL of the image
            
        Returns:
            str or None: The blob name or None if unable to extract
        """
        try:
            # Handle different URL formats for GCS
            if f'/{self.bucket_name}/' in image_url:
                return image_url.split(f'/{self.bucket_name}/')[-1]
            elif f'{self.bucket_name}.storage.googleapis.com/' in image_url:
                return image_url.split(f'{self.bucket_name}.storage.googleapis.com/')[-1]
            return None
        except Exception:
            return None
    
    def get_image_metadata(self, image_url):
        """
        Get metadata for an image.
        
        Args:
            image_url (str): The URL of the image
            
        Returns:
            dict or None: Image metadata or None if not found
        """
        try:
            blob_name = self._extract_blob_name_from_url(image_url)
            if not blob_name:
                return None
            
            blob = self.bucket.blob(blob_name)
            blob.reload()  # Fetch metadata from GCS
            
            return {
                'name': blob.name,
                'size': blob.size,
                'content_type': blob.content_type,
                'created': blob.time_created.isoformat() if blob.time_created else None,
                'updated': blob.updated.isoformat() if blob.updated else None,
                'url': blob.public_url
            }
            
        except Exception as e:
            print(f"Error getting image metadata: {e}")
            return None