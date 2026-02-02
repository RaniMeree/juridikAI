# Fix: Admin Panel 404 Error

## The Problem

You're getting a 404 error when accessing `https://juridikai.onrender.com/admin` because:
1. The backend is deployed but doesn't have the admin panel routes yet
2. The admin panel HTML file isn't being served

## The Solution (3 Steps)

### Step 1: Generate Password Hash

First, create a password hash for your admin account:

```bash
cd APP-Anna/backend
python generate_password_hash.py
```

Enter your desired password and copy the generated hash.

### Step 2: Create Admin User in Database

Connect to your production PostgreSQL database on Render and run:

```sql
-- Replace YOUR_HASH and your email
INSERT INTO users (
    user_id, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    account_status, 
    email_verified, 
    created_at, 
    updated_at
)
VALUES (
    uuid_generate_v4(),
    'admin@yourcompany.com',
    'YOUR_HASH_HERE',
    'Admin',
    'User',
    'admin',
    'active',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

**OR** update an existing user:

```sql
UPDATE users 
SET 
    role = 'admin',
    account_status = 'active'
WHERE email = 'your-existing-email@example.com';
```

### Step 3: Deploy Updated Backend

The code has been updated to serve the admin panel. Now deploy it:

```bash
# If using Git with Render
git add .
git commit -m "Add admin panel routes"
git push origin main
```

Render will automatically detect and redeploy your backend.

**OR** manually trigger a redeploy in Render Dashboard:
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## Verify It's Working

### 1. Check Backend Health

```bash
curl https://juridikai.onrender.com/
```

Should return: `{"status":"ok","app":"Juridik AI","version":"1.0.0"}`

### 2. Check Admin Route

```bash
curl https://juridikai.onrender.com/admin
```

Should return HTML content (not 404)

### 3. Login to Admin Panel

1. Go to: https://juridikai.onrender.com/admin
2. Enter your admin email and password
3. Should see the dashboard!

---

## Quick Alternative (For Testing)

If you want to test the admin panel locally first:

```bash
# 1. Start backend locally
cd APP-Anna/backend
uvicorn main:app --reload --port 8000

# 2. Open admin panel
open http://localhost:8000/admin
# Or open in browser: http://localhost:8000/admin
```

---

## Files That Were Updated

✅ `backend/main.py` - Added admin panel routes  
✅ `backend/routes/admin.py` - All admin API endpoints  
✅ `frontend/admin/index.html` - Auto-detects API URL  
✅ `render.yaml` - Backend deployment config  

---

## Still Getting 404?

### Check Deployment Status

1. Go to Render Dashboard
2. Check if deployment completed successfully
3. Look at deployment logs for errors

### Check File Exists

```bash
# Verify the admin HTML file exists
ls -la APP-Anna/frontend/admin/index.html
```

### Check Git Tracking

```bash
# Make sure file is tracked by Git
git ls-files | grep admin/index.html
```

If not tracked:
```bash
git add frontend/admin/index.html
git commit -m "Add admin panel HTML"
git push
```

---

## Need Help?

1. Check deployment logs in Render Dashboard
2. Test locally first: `http://localhost:8000/admin`
3. Verify database has admin user: `SELECT * FROM users WHERE role='admin';`
4. Check CORS settings in `backend/main.py`

---

**That's it!** Once you deploy the changes and create the admin user, you'll be able to access the admin panel at:

🎉 **https://juridikai.onrender.com/admin**
