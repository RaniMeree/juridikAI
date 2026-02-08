# Quick Setup Guide - Cloudflare R2 Storage

## Step-by-Step Setup (5 minutes)

### 1. Create R2 Bucket
1. Go to https://dash.cloudflare.com
2. Click **R2** in left sidebar
3. Click **Create bucket**
4. Bucket name: `anna-legal-files`
5. Location: **Automatic** (recommended)
6. Click **Create bucket**

✅ Done! Your bucket is ready.

### 2. Verify API Token
Your token is already configured:
- ✅ Access Key ID: `cff23ead1c9ff7dcfc270ed571ae4175`
- ✅ Secret Access Key: `ae8b62be70c4e2ce5750cce022df0329cf1187e28a0c3db1d1503c52c2ed09f7`
- ✅ Already added to `.env` file

### 3. Install Dependencies
```bash
cd backend
pip install boto3
```

### 4. Run Database Migration (Optional)
```bash
psql $DATABASE_URL < ../database/migrations/add_uploaded_files_table.sql
```

### 5. Test It!
```bash
# Start backend
cd backend
uvicorn main:app --reload

# Start frontend (new terminal)
cd frontend
npx expo start
```

Then:
1. Login to app
2. Go to chat
3. Click 📎 button
4. Upload a PDF/DOCX/TXT file
5. Send message
6. **Check R2 dashboard** - file should appear!
7. **Check admin panel** - go to Files tab

## Quick Verification Commands

### Test R2 Connection (Python)
```python
python -c "
from backend.r2_storage import get_r2_storage
r2 = get_r2_storage()
print('R2 Connection: OK')
print(f'Bucket: {r2.bucket_name}')
"
```

### Check Files in R2 (Python)
```python
python -c "
from backend.r2_storage import get_r2_storage
r2 = get_r2_storage()
files = r2.list_user_files('test-user-id')
print(f'Found {len(files)} files')
"
```

## What You'll See

### In Cloudflare R2 Dashboard:
```
Bucket: anna-legal-files
├── uploads/
    └── {user-id}/
        └── {conversation-id}/
            └── {file-id}.pdf
```

### In Admin Panel:
- **Files Tab** shows:
  - Total files uploaded
  - Storage used
  - Users with uploads
  - Table of all files with download links

### In Database:
- Messages have `attached_documents` JSON field with file metadata

## Troubleshooting

**"Bucket not found" error:**
- Make sure bucket name is exactly: `anna-legal-files`
- Check you created it in the correct Cloudflare account

**"Access denied" error:**
- Verify API token has **Admin Read & Write** permissions
- Check token isn't expired

**Files upload but don't appear in admin:**
- Check backend logs for errors
- Verify admin panel API calls are working
- Check browser console for errors

## Cost Tracking

Monitor your usage at:
https://dash.cloudflare.com → R2 → Usage

Current limits:
- ✅ 10GB storage: **FREE**
- ✅ All downloads: **FREE** (no egress fees)

You'll see alerts before hitting limits.

## Success Criteria

✅ Bucket created in R2 dashboard
✅ `pip install boto3` runs successfully
✅ Backend starts without errors
✅ File upload works in chat
✅ File appears in R2 dashboard
✅ Admin panel shows file
✅ Download link works

---

**Ready to go!** Just create the bucket and you're done. 🚀
