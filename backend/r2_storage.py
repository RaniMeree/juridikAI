"""
Cloudflare R2 Storage Service for Anna Legal AI
Handles file uploads, downloads, and management
"""

import os
import uuid
import boto3
from botocore.config import Config
from datetime import datetime
from typing import Optional, Dict


class R2Storage:
    """Cloudflare R2 storage client (S3-compatible)"""
    
    def __init__(self):
        self.account_id = os.getenv("R2_ACCOUNT_ID", "f68ad91187381e574b68e08dab1d20a3")
        self.access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        self.secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
        self.bucket_name = os.getenv("R2_BUCKET_NAME", "files")
        self.endpoint_url = f"https://{self.account_id}.r2.cloudflarestorage.com"
        
        # Initialize S3 client for R2
        self.client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
            config=Config(
                signature_version='s3v4',
                retries={'max_attempts': 3}
            ),
            region_name='auto'  # R2 uses 'auto' for region
        )
    
    def upload_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        user_id: str,
        conversation_id: str
    ) -> Dict:
        """
        Upload a file to R2 storage
        
        Args:
            file_content: Raw file bytes
            filename: Original filename
            content_type: MIME type
            user_id: User's UUID
            conversation_id: Conversation's UUID
            
        Returns:
            Dict with file_id, key, url, and metadata
        """
        # Generate unique file ID and key
        file_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime("%Y/%m/%d")
        
        # Create organized path: users/{user_id}/{date}/{file_id}_{filename}
        safe_filename = "".join(c for c in filename if c.isalnum() or c in '.-_').strip()
        key = f"users/{user_id}/{timestamp}/{file_id}_{safe_filename}"
        
        # Upload to R2
        self.client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=file_content,
            ContentType=content_type,
            Metadata={
                'user_id': user_id,
                'conversation_id': conversation_id,
                'original_filename': filename,
                'file_id': file_id,
                'uploaded_at': datetime.utcnow().isoformat()
            }
        )
        
        return {
            "file_id": file_id,
            "key": key,
            "filename": filename,
            "content_type": content_type,
            "file_size": len(file_content),
            "bucket": self.bucket_name,
            "uploaded_at": datetime.utcnow().isoformat()
        }
    
    def get_download_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Generate a pre-signed URL for file download
        
        Args:
            key: File key in R2
            expires_in: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Pre-signed download URL
        """
        url = self.client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': self.bucket_name,
                'Key': key
            },
            ExpiresIn=expires_in
        )
        return url
    
    def delete_file(self, key: str) -> bool:
        """
        Delete a file from R2 storage
        
        Args:
            key: File key in R2
            
        Returns:
            True if deleted successfully
        """
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
    
    def list_user_files(self, user_id: str, max_files: int = 100) -> list:
        """
        List all files for a specific user
        
        Args:
            user_id: User's UUID
            max_files: Maximum number of files to return
            
        Returns:
            List of file objects
        """
        try:
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=f"users/{user_id}/",
                MaxKeys=max_files
            )
            
            files = []
            for obj in response.get('Contents', []):
                files.append({
                    'key': obj['Key'],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'].isoformat()
                })
            
            return files
        except Exception as e:
            print(f"Error listing files: {e}")
            return []
    
    def get_file_info(self, key: str) -> Optional[Dict]:
        """
        Get metadata for a specific file
        
        Args:
            key: File key in R2
            
        Returns:
            File metadata dict or None
        """
        try:
            response = self.client.head_object(
                Bucket=self.bucket_name,
                Key=key
            )
            
            return {
                'key': key,
                'size': response['ContentLength'],
                'content_type': response['ContentType'],
                'last_modified': response['LastModified'].isoformat(),
                'metadata': response.get('Metadata', {})
            }
        except Exception as e:
            print(f"Error getting file info: {e}")
            return None


# Global instance
r2_storage = R2Storage()
