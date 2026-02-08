"""
Firebase Storage Integration for Anna Legal AI
Handles file uploads to Firebase Storage (5GB free tier)
"""

import os
import uuid
from typing import Optional, Tuple
import json
from datetime import timedelta

try:
    import firebase_admin
    from firebase_admin import credentials, storage
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    print("Warning: firebase-admin not installed. File storage disabled.")


class FirebaseStorageManager:
    """Manages file uploads to Firebase Storage"""
    
    _initialized = False
    _bucket = None
    
    @classmethod
    def initialize(cls):
        """Initialize Firebase Admin SDK"""
        if cls._initialized:
            return True
        
        if not FIREBASE_AVAILABLE:
            print("Firebase Admin SDK not available")
            return False
        
        try:
            # Check if already initialized
            try:
                firebase_admin.get_app()
                print("Firebase already initialized")
            except ValueError:
                # Not initialized yet, do it now
                
                # Option 1: Use service account JSON file
                service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
                if service_account_path and os.path.exists(service_account_path):
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred, {
                        'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET")
                    })
                    print(f"Firebase initialized with service account file")
                
                # Option 2: Use service account JSON from environment variable
                elif os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON"):
                    service_account_json = json.loads(os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON"))
                    cred = credentials.Certificate(service_account_json)
                    firebase_admin.initialize_app(cred, {
                        'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET")
                    })
                    print(f"Firebase initialized with service account JSON")
                
                else:
                    print("No Firebase credentials found in environment")
                    return False
            
            # Get bucket
            bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
            if not bucket_name:
                print("FIREBASE_STORAGE_BUCKET not set")
                return False
            
            cls._bucket = storage.bucket(bucket_name)
            cls._initialized = True
            print(f"Firebase Storage ready: {bucket_name}")
            return True
            
        except Exception as e:
            print(f"Failed to initialize Firebase: {e}")
            return False
    
    @classmethod
    def upload_file(cls, file_content: bytes, filename: str, content_type: str, 
                   folder: str = "user-uploads") -> Optional[Tuple[str, str]]:
        """
        Upload file to Firebase Storage
        
        Args:
            file_content: File bytes
            filename: Original filename
            content_type: MIME type
            folder: Storage folder path
            
        Returns:
            Tuple of (file_url, file_path) or None if failed
        """
        if not cls.initialize():
            print("Firebase not initialized, skipping upload")
            return None
        
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            extension = os.path.splitext(filename)[1]
            storage_path = f"{folder}/{file_id}{extension}"
            
            # Upload to Firebase Storage
            blob = cls._bucket.blob(storage_path)
            blob.upload_from_string(file_content, content_type=content_type)
            
            # Make publicly accessible (with signed URL for security)
            # For private files, use blob.generate_signed_url()
            blob.make_public()
            
            file_url = blob.public_url
            
            print(f"Uploaded file to Firebase: {storage_path}")
            return (file_url, storage_path)
            
        except Exception as e:
            print(f"Failed to upload to Firebase: {e}")
            return None
    
    @classmethod
    def get_signed_url(cls, file_path: str, expiration_minutes: int = 60) -> Optional[str]:
        """
        Generate a temporary signed URL for private file access
        
        Args:
            file_path: Storage path from upload_file()
            expiration_minutes: URL validity duration
            
        Returns:
            Signed URL or None
        """
        if not cls.initialize():
            return None
        
        try:
            blob = cls._bucket.blob(file_path)
            url = blob.generate_signed_url(
                expiration=timedelta(minutes=expiration_minutes),
                method='GET'
            )
            return url
        except Exception as e:
            print(f"Failed to generate signed URL: {e}")
            return None
    
    @classmethod
    def delete_file(cls, file_path: str) -> bool:
        """
        Delete file from Firebase Storage
        
        Args:
            file_path: Storage path from upload_file()
            
        Returns:
            True if deleted, False otherwise
        """
        if not cls.initialize():
            return False
        
        try:
            blob = cls._bucket.blob(file_path)
            blob.delete()
            print(f"Deleted file from Firebase: {file_path}")
            return True
        except Exception as e:
            print(f"Failed to delete from Firebase: {e}")
            return False
    
    @classmethod
    def is_enabled(cls) -> bool:
        """Check if Firebase Storage is enabled and configured"""
        return cls.initialize()


# Convenience functions
def upload_file(file_content: bytes, filename: str, content_type: str) -> Optional[Tuple[str, str]]:
    """Upload file to Firebase Storage"""
    return FirebaseStorageManager.upload_file(file_content, filename, content_type)


def get_file_url(file_path: str) -> Optional[str]:
    """Get signed URL for file"""
    return FirebaseStorageManager.get_signed_url(file_path)


def delete_file(file_path: str) -> bool:
    """Delete file from storage"""
    return FirebaseStorageManager.delete_file(file_path)


def is_storage_enabled() -> bool:
    """Check if storage is enabled"""
    return FirebaseStorageManager.is_enabled()
