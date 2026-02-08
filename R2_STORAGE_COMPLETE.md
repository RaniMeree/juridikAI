# Cloudflare R2 File Storage - Implementation Complete

## ✅ What's Been Implemented

### Backend Changes:

1. **R2 Storage Utility** (`backend/r2_storage.py`)
   - Upload files to Cloudflare R2
   - Generate presigned download URLs
   - List and delete files
   - Organize files by user/conversation

2. **Updated Conversations API** (`backend/routes/conversations.py`)
   - Files now uploaded to R2 storage
   - R2 URLs stored in message metadata
   - Text still extracted for AI analysis

3. **Admin Endpoints** (`backend/routes/admin.py`)
   - `GET /admin/files` - List all uploaded files
   - `GET /admin/files/stats` - Storage statistics
   - Filter by user_id or conversation_id

4. **Environment Variables** (`.env`)
   ```
   R2_ACCOUNT_ID=f68ad91187381e574b68e08dab1d20a3
   R2_ACCESS_KEY_ID=cff23ead1c9ff7dcfc270ed571ae4175
   R2_SECRET_ACCESS_KEY=ae8b62be70c4e2ce5750cce022df0329cf1187e28a0c3db1d1503c52c2ed09f7
   R2_BUCKET_NAME=anna-legal-files
   ```

5. **Database Migration** (`database/migrations/add_uploaded_files_table.sql`)
   - New table for tracking uploads (optional for future use)

### Frontend Changes:

1. **Admin Panel** (`frontend/admin/index.html`)
   - New "📎 Files" navigation tab
   - Files page with statistics
   - Table showing all uploads
   - Download links for files
   - User and conversation details

## 📋 Setup Steps

### 1. Create R2 Bucket
Go to Cloudflare Dashboard:
- Navigate to **R2 Object Storage**
- Click **Create Bucket**
- Name: `anna-legal-files`
- Location: **Automatic** (or closest to users)
- Click **Create Bucket**

### 2. Configure Bucket Access (Optional for Public Files)
If you want files to be publicly accessible without presigned URLs:
- Go to bucket settings
- Under **Public Access**, enable public access
- Or use presigned URLs (current implementation)

### 3. Run Database Migration
```bash
cd backend
psql $DATABASE_URL < ../database/migrations/add_uploaded_files_table.sql
```

### 4. Install Dependencies
```bash
cd backend
pip install boto3
```

### 5. Test File Upload
1. Start backend: `uvicorn main:app --reload`
2. Start frontend: `npx expo start`
3. Login and upload a file in chat
4. Check R2 dashboard to see file
5. Check admin panel Files page

## 🗂️ File Storage Structure

Files are organized in R2 as:
```
uploads/
  └── {user_id}/
      └── {conversation_id}/
          └── {file_id}.{extension}
```

Example:
```
uploads/
  └── 123e4567-e89b-12d3-a456-426614174000/
      └── 789e4567-e89b-12d3-a456-426614174001/
          ├── abc123.pdf
          └── def456.docx
```

## 📊 What's Stored

**In R2 (Cloudflare):**
- Original file (PDF, DOCX, TXT)
- Organized by user and conversation
- 10GB free storage

**In Database (messages.attached_documents):**
```json
{
  "file_id": "uuid",
  "filename": "contract.pdf",
  "file_type": "pdf",
  "file_size": 245678,
  "word_count": 1523,
  "chunk_count": 2,
  "processed_at": "2026-02-08T...",
  "r2_object_key": "uploads/user-id/conv-id/file-id.pdf",
  "r2_file_url": "https://...r2.cloudflarestorage.com/..."
}
```

## 🔐 Security

- Files stored in private R2 bucket
- Access controlled via API authentication
- Presigned URLs expire after 1 hour (configurable)
- Admin-only access to file management

## 💰 Cost

**Cloudflare R2:**
- ✅ First 10GB: **FREE** forever
- ✅ No egress fees (downloads are free)
- After 10GB: $0.015/GB/month

**Example:**
- 1,000 files × 50KB average = 50MB = **FREE**
- 10,000 files × 100KB average = 1GB = **FREE**

## 🎯 Features

### User Experience:
- Upload files in chat (unchanged UX)
- Files permanently stored
- Can reference files later
- Download original files

### Admin Features:
- View all uploaded files
- See storage statistics
- Filter by user or conversation
- Download any file
- Track usage

## 🚀 Next Steps (Optional Enhancements)

1. **File Expiration**
   - Auto-delete files after X days
   - Archive old conversations

2. **File Sharing**
   - Share files between conversations
   - Public file links

3. **Advanced Search**
   - Search within document content
   - Semantic search across files

4. **File Preview**
   - Show PDF preview in admin panel
   - Thumbnail generation

5. **Batch Operations**
   - Bulk download
   - Bulk delete

## 🧪 Testing Checklist

- [ ] Create R2 bucket named `anna-legal-files`
- [ ] Upload file in chat
- [ ] Verify file appears in R2 dashboard
- [ ] Check file URL is stored in database
- [ ] Open admin panel Files page
- [ ] Verify file appears in admin list
- [ ] Click download link - file downloads correctly
- [ ] Test with PDF, DOCX, TXT files
- [ ] Verify AI still analyzes files correctly
- [ ] Check storage stats are accurate

## 🐛 Troubleshooting

**Error: "No module named 'boto3'"**
```bash
pip install boto3
```

**Error: "Bucket does not exist"**
- Create bucket in Cloudflare R2 dashboard
- Name must match `R2_BUCKET_NAME` in .env

**Files not appearing in admin panel:**
- Check backend logs for errors
- Verify R2 credentials in .env
- Check database has attached_documents data

**Download links not working:**
- Verify R2 bucket has correct permissions
- Check presigned URL expiration
- Ensure R2 credentials are valid

## 📝 Notes

- Files are now **permanently stored** (unlike before)
- Original implementation: temporary (memory only)
- New implementation: persistent (Cloudflare R2)
- Both store extracted text in messages for AI
- Users can now download uploaded files
- Admins can manage all files centrally

## 🎉 Summary

Your file upload system now has **professional-grade cloud storage** with:
- ✅ Permanent file storage (10GB free)
- ✅ Download functionality
- ✅ Admin file management
- ✅ Cost-effective (free tier)
- ✅ Scalable infrastructure
- ✅ Organized file structure
