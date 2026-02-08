"""
File Processing Utilities for Anna Legal AI
Handles document upload, text extraction, and chunking
"""

import os
import io
import uuid
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import base64

# Document processing imports
try:
    import PyPDF2
    from pdfplumber import open as pdf_open
except ImportError:
    PyPDF2 = None
    pdf_open = None

try:
    from docx import Document
except ImportError:
    Document = None


class FileProcessor:
    """Handles file upload and text extraction"""
    
    # Supported file types
    SUPPORTED_TYPES = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'text/plain': 'txt'
    }
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_TEXT_LENGTH = 50000  # ~50k characters max
    CHUNK_SIZE = 4000  # Characters per chunk for large documents
    
    @staticmethod
    def validate_file(file_content: bytes, content_type: str, filename: str) -> Tuple[bool, str]:
        """
        Validate uploaded file
        Returns: (is_valid, error_message)
        """
        # Check file size
        if len(file_content) > FileProcessor.MAX_FILE_SIZE:
            return False, f"File too large. Maximum size is {FileProcessor.MAX_FILE_SIZE / (1024*1024)}MB"
        
        # Check file type
        if content_type not in FileProcessor.SUPPORTED_TYPES:
            return False, f"Unsupported file type. Supported: PDF, DOCX, TXT"
        
        # Check filename
        if not filename or len(filename) > 255:
            return False, "Invalid filename"
        
        return True, ""
    
    @staticmethod
    def extract_text_from_pdf(file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            # Try with pdfplumber first (better text extraction)
            if pdf_open:
                pdf_file = io.BytesIO(file_content)
                with pdf_open(pdf_file) as pdf:
                    text_parts = []
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            text_parts.append(text)
                    return "\n\n".join(text_parts)
            
            # Fallback to PyPDF2
            if PyPDF2:
                pdf_file = io.BytesIO(file_content)
                reader = PyPDF2.PdfReader(pdf_file)
                text_parts = []
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
                return "\n\n".join(text_parts)
            
            raise Exception("PDF processing libraries not available")
            
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    @staticmethod
    def extract_text_from_docx(file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            if not Document:
                raise Exception("python-docx library not available")
            
            docx_file = io.BytesIO(file_content)
            doc = Document(docx_file)
            
            text_parts = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_parts.append(paragraph.text)
            
            return "\n\n".join(text_parts)
            
        except Exception as e:
            raise Exception(f"Failed to extract text from DOCX: {str(e)}")
    
    @staticmethod
    def extract_text_from_txt(file_content: bytes) -> str:
        """Extract text from TXT file"""
        try:
            # Try UTF-8 first, then fallback to latin-1
            try:
                return file_content.decode('utf-8')
            except UnicodeDecodeError:
                return file_content.decode('latin-1', errors='ignore')
        except Exception as e:
            raise Exception(f"Failed to extract text from TXT: {str(e)}")
    
    @staticmethod
    def extract_text(file_content: bytes, content_type: str) -> str:
        """
        Extract text from file based on content type
        """
        file_type = FileProcessor.SUPPORTED_TYPES.get(content_type)
        
        if file_type == 'pdf':
            return FileProcessor.extract_text_from_pdf(file_content)
        elif file_type == 'docx':
            return FileProcessor.extract_text_from_docx(file_content)
        elif file_type == 'txt':
            return FileProcessor.extract_text_from_txt(file_content)
        else:
            raise Exception(f"Unsupported file type: {content_type}")
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
        """
        Split text into chunks for processing
        Tries to break at sentence boundaries
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        current_chunk = ""
        
        # Split by paragraphs first
        paragraphs = text.split('\n\n')
        
        for para in paragraphs:
            # If adding this paragraph exceeds chunk size
            if len(current_chunk) + len(para) > chunk_size:
                # Save current chunk if it has content
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
                
                # If paragraph itself is too long, split by sentences
                if len(para) > chunk_size:
                    sentences = para.replace('. ', '.|').replace('! ', '!|').replace('? ', '?|').split('|')
                    for sentence in sentences:
                        if len(current_chunk) + len(sentence) > chunk_size:
                            if current_chunk:
                                chunks.append(current_chunk.strip())
                            current_chunk = sentence
                        else:
                            current_chunk += " " + sentence if current_chunk else sentence
                else:
                    current_chunk = para
            else:
                current_chunk += "\n\n" + para if current_chunk else para
        
        # Add remaining chunk
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    @staticmethod
    def process_file(file_content: bytes, content_type: str, filename: str) -> Dict:
        """
        Main processing function: validate, extract text, and chunk if needed
        Returns metadata about the processed file
        """
        # Validate
        is_valid, error = FileProcessor.validate_file(file_content, content_type, filename)
        if not is_valid:
            raise ValueError(error)
        
        # Extract text
        extracted_text = FileProcessor.extract_text(file_content, content_type)
        
        # Truncate if too long
        if len(extracted_text) > FileProcessor.MAX_TEXT_LENGTH:
            extracted_text = extracted_text[:FileProcessor.MAX_TEXT_LENGTH] + "\n\n[Document truncated due to length]"
        
        # Chunk if needed
        chunks = FileProcessor.chunk_text(extracted_text)
        
        # Calculate stats
        word_count = len(extracted_text.split())
        char_count = len(extracted_text)
        
        return {
            "file_id": str(uuid.uuid4()),
            "filename": filename,
            "content_type": content_type,
            "file_type": FileProcessor.SUPPORTED_TYPES[content_type],
            "file_size": len(file_content),
            "extracted_text": extracted_text,
            "chunks": chunks,
            "chunk_count": len(chunks),
            "word_count": word_count,
            "char_count": char_count,
            "processed_at": datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def create_context_for_ai(chunks: List[str], user_question: str) -> str:
        """
        Create context string for AI from document chunks
        Can be enhanced with semantic search later
        """
        if len(chunks) == 1:
            return f"[Document Content]\n{chunks[0]}\n\n[User Question]\n{user_question}"
        
        # For multiple chunks, include all or select most relevant
        # TODO: Add semantic search/relevance ranking
        context = "[Document Content - Multiple Sections]\n\n"
        for i, chunk in enumerate(chunks[:5]):  # Limit to first 5 chunks for now
            context += f"--- Section {i+1} ---\n{chunk}\n\n"
        
        if len(chunks) > 5:
            context += f"[Note: Document has {len(chunks)} sections total, showing first 5]\n\n"
        
        context += f"[User Question]\n{user_question}"
        return context
