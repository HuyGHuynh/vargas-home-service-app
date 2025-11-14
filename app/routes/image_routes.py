"""
Image upload routes for service requests.
Handles image upload, deletion, and management for service requests.
"""
from flask import Blueprint, request, jsonify, session
from services.image_service import ImageService
from repositories.workorder_repository import WorkorderRepository
import os

image_bp = Blueprint('image', __name__, url_prefix='/api/images')


@image_bp.route('/upload/service-request/<int:request_id>', methods=['POST'])
def upload_service_request_image(request_id):
    """
    Upload an image for a service request.
    
    Args:
        request_id (int): Service request ID
        
    Returns:
        JSON response with upload result
    """
    try:
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
        
        # Initialize image service
        image_service = ImageService()
        
        # Upload the image
        image_url = image_service.upload_service_request_image(file, request_id)
        
        if image_url:
            # Update the service request with the image URL
            success = WorkorderRepository.update_service_request_image(request_id, image_url)
            
            if success:
                return jsonify({
                    'success': True,
                    'message': 'Image uploaded successfully',
                    'image_url': image_url
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to save image URL to database'
                }), 500
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to upload image'
            }), 500
            
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        print(f"Error uploading service request image: {e}")
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500


@image_bp.route('/upload/multiple/service-request/<int:request_id>', methods=['POST'])
def upload_multiple_service_request_images(request_id):
    """
    Upload multiple images for a service request.
    
    Args:
        request_id (int): Service request ID
        
    Returns:
        JSON response with upload results
    """
    try:
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        # Check if files were uploaded
        if 'images' not in request.files:
            return jsonify({'success': False, 'message': 'No image files provided'}), 400
        
        files = request.files.getlist('images')
        
        if not files or all(f.filename == '' for f in files):
            return jsonify({'success': False, 'message': 'No files selected'}), 400
        
        # Initialize image service
        image_service = ImageService()
        
        # Upload multiple images
        image_urls = image_service.upload_multiple_images(files, request_id, max_files=5)
        
        if image_urls:
            # For multiple images, we might need to store them differently
            # For now, just update with the first image URL
            primary_image_url = image_urls[0] if image_urls else None
            
            if primary_image_url:
                success = WorkorderRepository.update_service_request_image(request_id, primary_image_url)
                
                return jsonify({
                    'success': True,
                    'message': f'Uploaded {len(image_urls)} images successfully',
                    'image_urls': image_urls,
                    'primary_image_url': primary_image_url
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'No images were uploaded successfully'
                }), 400
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to upload images'
            }), 500
            
    except Exception as e:
        print(f"Error uploading multiple service request images: {e}")
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500


@image_bp.route('/delete/service-request/<int:request_id>', methods=['DELETE'])
def delete_service_request_image(request_id):
    """
    Delete image for a service request.
    
    Args:
        request_id (int): Service request ID
        
    Returns:
        JSON response with deletion result
    """
    try:
        # Check if user is logged in and is admin
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        if not session.get('is_admin'):
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        
        # Get current image URL from database
        current_image_url = WorkorderRepository.get_service_request_image_url(request_id)
        
        if not current_image_url:
            return jsonify({'success': False, 'message': 'No image found for this service request'}), 404
        
        # Initialize image service
        image_service = ImageService()
        
        # Delete from GCS
        gcs_deleted = image_service.delete_service_request_image(current_image_url)
        
        # Remove URL from database
        db_updated = WorkorderRepository.update_service_request_image(request_id, None)
        
        if gcs_deleted and db_updated:
            return jsonify({
                'success': True,
                'message': 'Image deleted successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to delete image completely'
            }), 500
            
    except Exception as e:
        print(f"Error deleting service request image: {e}")
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500


@image_bp.route('/metadata/service-request/<int:request_id>', methods=['GET'])
def get_service_request_image_metadata(request_id):
    """
    Get metadata for a service request image.
    
    Args:
        request_id (int): Service request ID
        
    Returns:
        JSON response with image metadata
    """
    try:
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        # Get image URL from database
        image_url = WorkorderRepository.get_service_request_image_url(request_id)
        
        if not image_url:
            return jsonify({'success': False, 'message': 'No image found for this service request'}), 404
        
        # Initialize image service
        image_service = ImageService()
        
        # Get metadata
        metadata = image_service.get_image_metadata(image_url)
        
        if metadata:
            return jsonify({
                'success': True,
                'metadata': metadata
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to get image metadata'
            }), 500
            
    except Exception as e:
        print(f"Error getting service request image metadata: {e}")
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500


@image_bp.route('/config', methods=['GET'])
def get_upload_config():
    """
    Get upload configuration for the frontend.
    
    Returns:
        JSON response with upload configuration
    """
    try:
        return jsonify({
            'success': True,
            'config': {
                'max_file_size': 5 * 1024 * 1024,  # 5MB in bytes
                'allowed_types': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
                'max_files': 5,
                'upload_url': '/api/images/upload/service-request/'
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting upload config: {e}")
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500
