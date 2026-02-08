# File Upload Feature - Implementation Summary

## Overview
Successfully implemented file upload functionality for the chat interface, allowing users to attach and analyze documents (PDF, DOCX, TXT).

## Architecture & Storage Strategy

### How Files Are Stored:
1. **Text Extraction**: Files are processed on upload, extracting text content
2. **Chunking**: Large documents (5+ pages) are automatically split into manageable chunks
3. **Metadata Storage**: File info stored in `attached_documents` JSONB field in messages table
4. **Context Processing**: Extracted text is sent to AI for analysis, not the raw file

### For Large Documents (e.g., 5 pages):
- Text is extracted (typically 2,500-5,000 tokens per 5 pages)
- Automatically chunked into sections (~4,000 chars each)
- First 5 chunks sent to AI for context
- Metadata shows total chunk count and word count
- User sees file name, size, and word count in chat bubble

## Backend Changes

### New File: `backend/file_processing.py`
- `FileProcessor` class with methods:
  - `validate_file()` - Check file type and size (max 10MB)
  - `extract_text_from_pdf()` - PDF text extraction
  - `extract_text_from_docx()` - DOCX text extraction
  - `extract_text_from_txt()` - TXT text extraction
  - `chunk_text()` - Smart text chunking at sentence boundaries
  - `process_file()` - Main processing pipeline
  - `create_context_for_ai()` - Format document context for AI

### Updated: `backend/routes/conversations.py`
- Changed `/conversations/{id}/messages` endpoint to accept multipart/form-data
- Added `files: List[UploadFile]` parameter
- Process uploaded files before sending to AI
- Include document context in AI prompt
- Store file metadata in message's `attached_documents` field
- Enhanced system prompt for document analysis

### Updated: `backend/requirements.txt`
- Changed `python-magic` to `python-magic-bin` (Windows compatible)
- Added PyPDF2 for PDF processing

## Frontend Changes

### Updated: `frontend/src/store/chatStore.ts`
- Added `attachedDocuments` field to Message interface
- Changed `sendMessage()` to accept `files?: File[]` parameter
- Switched to FormData for file uploads
- Send multipart/form-data to backend

### Updated: `frontend/app/(tabs)/index.tsx`
- Added `expo-document-picker` import
- Added `selectedFiles` state
- Implemented `handleFilePicker()` function
- Implemented `removeFile()` function
- Added file chips UI showing selected files
- Updated send button to enable when files are attached
- Handle both web and native file picking

### Updated: `frontend/src/components/ChatBubble.tsx`
- Display attached documents in chat bubbles
- Show file name, size (KB), and word count
- Styled attachment chips with document icon

## Supported File Types
- **PDF** (.pdf)
- **Word Documents** (.docx)
- **Text Files** (.txt)

## File Size Limits
- Maximum file size: **10MB**
- Maximum text extraction: **50,000 characters**
- Chunk size: **4,000 characters** per chunk

## User Experience

### Uploading Files:
1. Click 📎 button in chat input
2. Select one or more files (PDF/DOCX/TXT)
3. Files appear as chips above input
4. Can remove individual files with × button
5. Send message with or without text

### Viewing Files in Chat:
- User messages show attached files with metadata
- Files display as chips with:
  - 📎 icon and filename
  - File size in KB
  - Word count

### AI Analysis:
- AI receives full document text as context
- AI references specific parts of documents in responses
- System prompt instructs AI to analyze documents carefully

## Database Schema
No changes needed - existing `messages.attached_documents` JSONB field stores:
```json
{
  "file_id": "uuid",
  "filename": "contract.pdf",
  "file_type": "pdf",
  "file_size": 245678,
  "word_count": 1523,
  "chunk_count": 2,
  "processed_at": "2026-02-08T..."
}
```

## Future Enhancements
1. **Cloud Storage**: Store original files in S3/Cloudflare R2 for download
2. **Semantic Search**: Use embeddings to find most relevant chunks
3. **Image Analysis**: Extract text from images using OCR
4. **File Preview**: Show file thumbnails/previews in chat
5. **Download**: Allow users to download previously uploaded files
6. **Batch Processing**: Process multiple files more efficiently

## Testing Checklist
- [ ] Upload PDF file and verify text extraction
- [ ] Upload DOCX file and verify text extraction
- [ ] Upload TXT file and verify text extraction
- [ ] Test with large document (5+ pages)
- [ ] Test file size limit (>10MB)
- [ ] Test unsupported file type
- [ ] Test removing selected files before sending
- [ ] Test sending message with multiple files
- [ ] Test AI response with document context
- [ ] Verify file metadata displays correctly in chat bubble
- [ ] Test on web platform
- [ ] Test on mobile (iOS/Android)

## How to Test

1. **Start Backend**:
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npx expo start
   ```

3. **Test File Upload**:
   - Login to the app
   - Go to chat screen
   - Click 📎 button
   - Select a PDF/DOCX/TXT file
   - Add a message like "What is this document about?"
   - Send and verify AI analyzes the document

## Notes
- Files are processed synchronously (upload → extract → send to AI)
- No persistent file storage yet (files not saved to disk/cloud)
- Text extraction happens on every upload (no caching)
- For production, consider async processing for large files
