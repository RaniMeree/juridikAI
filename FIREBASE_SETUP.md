# Firebase Storage Setup Guide

## Overview
Firebase Storage gives you **5GB free storage** for uploaded files with 1GB/day free downloads.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `anna-legal-ai` (or your choice)
4. Disable Google Analytics (not needed) or enable it
5. Click **"Create project"**

## Step 2: Enable Storage

1. In Firebase Console, click **"Storage"** in left menu
2. Click **"Get Started"**
3. Choose **Production mode** (we'll set rules later)
4. Select storage location (e.g., `us-central1` or closest to you)
5. Click **"Done"**

## Step 3: Get Service Account Credentials

### Option A: Download JSON File (Easier for Local Development)

1. In Firebase Console, click ⚙️ **Settings** > **Project settings**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Save the JSON file as `firebase-service-account.json`
5. Move it to your backend folder: `backend/firebase-service-account.json`
6. **IMPORTANT:** Add to `.gitignore` to not commit it!

### Option B: Environment Variable (Better for Production/Render)

1. Download the JSON file as above
2. Copy the entire contents
3. Set as environment variable (see Step 4)

## Step 4: Configure Environment Variables

### Local Development (.env file):

```bash
# Add to backend/.env

# Your Firebase Storage bucket name (found in Storage section)
FIREBASE_STORAGE_BUCKET=anna-legal-ai.appspot.com

# Option A: Use JSON file path (for local)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Option B: Use JSON as string (for Render/production)
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...entire JSON here..."}
```

### Production/Render:

1. Go to your Render Web Service
2. Click **Environment** tab
3. Add these variables:
   - `FIREBASE_STORAGE_BUCKET`: `your-project-id.appspot.com`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: Paste entire JSON content from downloaded file

## Step 5: Update .gitignore

Add to your `.gitignore` file:

```
# Firebase credentials
firebase-service-account.json
**/firebase-service-account.json
```

## Step 6: Install Dependencies

```bash
cd backend
pip install firebase-admin==6.4.0
```

Or just:
```bash
pip install -r requirements.txt
```

## Step 7: Test It

Run the backend and upload a file in the chat. Check:

1. **Backend logs** should show: `"Uploaded file to Firebase: user-uploads/xxx.pdf"`
2. **Firebase Console** > Storage > Files should show your uploaded file
3. **Database** message should have `file_url` in `attached_documents`

## Storage Rules (Optional Security)

By default, files are public. To make them private:

1. Go to Firebase Console > Storage > **Rules**
2. Replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /user-uploads/{allPaths=**} {
      allow read: if request.auth != null;  // Only authenticated users
      allow write: if request.auth != null;
    }
  }
}
```

**Note:** You'll need to implement Firebase Auth for this to work. For now, public URLs are fine.

## Free Tier Limits

- **Storage:** 5GB
- **Downloads:** 1GB/day
- **Uploads:** 20,000/day
- **Operations:** 50,000/day

More than enough for most apps!

## How It Works Now

1. **User uploads file** in chat
2. **Backend extracts text** for AI analysis
3. **Backend uploads original file to Firebase** Storage
4. **Database stores:** File metadata + Firebase URL
5. **User can download** file later via URL

## File URLs

Files are stored as:
- Path: `user-uploads/{uuid}.pdf`
- URL: `https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/user-uploads%2Ffile.pdf?alt=media`

## Troubleshooting

**"Firebase not initialized"**
- Check `FIREBASE_STORAGE_BUCKET` is set
- Check service account JSON is valid
- Check file path or environment variable

**"Permission denied"**
- Check Storage Rules in Firebase Console
- Make sure bucket name matches exactly

**"Module not found: firebase_admin"**
- Run: `pip install firebase-admin`

## Cost After Free Tier

If you exceed 5GB:
- $0.026/GB per month
- Still very affordable!

## Next Steps

✅ Firebase is now integrated
✅ Files are automatically uploaded if Firebase is configured
✅ If Firebase fails, app still works (just no file storage)
✅ No changes needed to frontend

**Test it:** Upload a file and check Firebase Console!
