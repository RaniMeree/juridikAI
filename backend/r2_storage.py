"""
Cloudflare R2 Storage Utility
Handles file uploads and downloads to/from R2
"""

import os
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
import uuid
from typing import Optional, Dict

class R2Storage:
    """Cloudflare R2 storage client using S3-compatible API"""
    
    def __init__(self):
        self.account_id = os.getenv("R2_ACCOUNT_ID", "f68ad91187381e574b68e08dab1d20a3")
        self.access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        self.secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
        self.bucket_name = os.getenv("R2_BUCKET_NAME", "anna-legal-files")
        self.endpoint_url = f"https://{self.account_id}.r2.cloudflarestorage.com"
        
        # Initialize S3 client
        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
            config=Config(signature_version='s3v4'),
            region_name='auto'  # R2 uses 'auto' for region
        )
    
    def upload_file(
        self, 
        file_content: bytes, 
        filename: str, 
        content_type: str,
        user_id: str,
        conversation_id: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Upload file to R2 storage
        
        Args:
            file_content: File bytes
            filename: Original filename
            content_type: MIME type
            user_id: UUID of user
            conversation_id: UUID of conversation
            metadata: Additional metadata
        
        Returns:
            Dict with file info including URL
        """
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            ext = filename.split('.')[-1] if '.' in filename else ''
            object_key = f"uploads/{user_id}/{conversation_id}/{file_id}.{ext}"
            
            # Prepare metadata
            upload_metadata = {
                'user-id': user_id,
                'conversation-id': conversation_id,
                'original-filename': filename,
                'uploaded-at': datetime.utcnow().isoformat()
            }
            
            if metadata:
                for key, value in metadata.items():
                    upload_metadata[f'custom-{key}'] = str(value)
            
            # Upload to R2
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_content,
                ContentType=content_type,
                Metadata=upload_metadata
            )
            
            # Generate public URL (if bucket is public) or signed URL
            file_url = f"{self.endpoint_url}/{self.bucket_name}/{object_key}"
            
            return {
                'success': True,
                'file_id': file_id,
                'object_key': object_key,
                'file_url': file_url,
                'filename': filename,
                'content_type': content_type,
                'size': len(file_content),
                'uploaded_at': datetime.utcnow().isoformat()
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e),
                'message': f"Failed to upload file: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': f"Unexpected error: {str(e)}"
            }
    
    def get_file(self, object_key: str) -> Optional[bytes]:
        """
        Download file from R2
        
        Args:
            object_key: The S3 object key
        
        Returns:
            File bytes or None if error
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return response['Body'].read()
        except ClientError as e:
            print(f"Error downloading file: {e}")
            return None
    
    def generate_presigned_url(
        self, 
        object_key: str, 
        expiration: int = 3600
    ) -> Optional[str]:
        """
        Generate a presigned URL for downloading a file
        
        Args:
            object_key: The S3 object key
            expiration: URL expiration time in seconds (default 1 hour)
        
        Returns:
            Presigned URL or None if error
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return None
    
    def delete_file(self, object_key: str) -> bool:
        """
        Delete file from R2
        
        Args:
            object_key: The S3 object key
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return True
        except ClientError as e:
            print(f"Error deleting file: {e}")
            return False
    
    def list_user_files(self, user_id: str) -> list:
        """
        List all files uploaded by a specific user
        
        Args:
            user_id: UUID of user
        
        Returns:
            List of file info dicts
        """
        try:
            prefix = f"uploads/{user_id}/"
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat(),
                    })
            
            return files
        except ClientError as e:
            print(f"Error listing files: {e}")
            return []


# Singleton instance
_r2_storage = None

def get_r2_storage() -> R2Storage:
    """Get or create R2 storage instance"""
    global _r2_storage
    if _r2_storage is None:
        _r2_storage = R2Storage()
    return _r2_storage
