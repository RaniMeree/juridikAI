# Deploying Admin Panel to Render.com

## Current Situation

Your backend is deployed at `https://juridikai.onrender.com` but it's missing the admin panel routes.

## Solution

I've updated your code to serve the admin panel. Now you need to deploy the changes.

## Steps to Deploy

### Step 1: Commit the Changes

```bash
cd APP-Anna

# Add all the new admin files
git add backend/routes/admin.py
git add backend/create_admin.py
git add backend/main.py
git add frontend/admin/index.html
git add render.yaml

# Commit
git commit -m "Add admin panel with backend routes"
```

### Step 2: Push to Your Repository

If you're using Render's Git integration:

```bash
git push origin main
```

Render will automatically detect the changes and redeploy.

### Step 3: Create Admin User on Production

Once deployed, you need to create an admin user on the production database.

**Option A: Using SQL directly in Render Dashboard**

1. Go to your Render Dashboard
2. Navigate to your PostgreSQL database
3. Click "Connect" → "External Connection"
4. Use a PostgreSQL client or pgAdmin to connect
5. Run this query (replace with your desired credentials):

```sql
-- First, generate a bcrypt hash for your password
-- You can use: https://bcrypt-generator.com/
-- Or run: python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('YourPassword123'))"

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
    '$2b$12$YOUR_BCRYPT_HASH_HERE',  -- Replace with actual hash
    'Admin',
    'User',
    'admin',
    'active',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

**Option B: Update an Existing User to Admin**

If you already have a user account:

```sql
UPDATE users 
SET role = 'admin', account_status = 'active'
WHERE email = 'your-existing-email@example.com';
```

**Option C: Using create_admin.py script (if you have SSH access)**

```bash
# SSH into Render (if available)
python backend/create_admin.py
```

### Step 4: Access the Admin Panel

Once deployed and admin user is created:

1. Go to: `https://juridikai.onrender.com/admin`
2. Login with your admin credentials
3. Start managing your application!

## Quick Password Hash Generator

To generate a bcrypt hash for your password, run this locally:

```bash
cd APP-Anna/backend
python -c "from passlib.context import CryptContext; import getpass; pwd = getpass.getpass('Enter password: '); print('Hash:', CryptContext(schemes=['bcrypt']).hash(pwd))"
```

Or use this Python script:

```python
from passlib.context import CryptContext

password = "YourSecurePassword123"  # Change this
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash(password)
print(f"Password hash: {hashed}")
```

## Verification

After deployment, verify everything is working:

1. **Check backend is running:**
   ```bash
   curl https://juridikai.onrender.com/
   ```
   Should return: `{"status":"ok","app":"Juridik AI","version":"1.0.0"}`

2. **Check admin route exists:**
   ```bash
   curl https://juridikai.onrender.com/admin
   ```
   Should return HTML content

3. **Check API endpoints:**
   ```bash
   curl https://juridikai.onrender.com/docs
   ```
   Should show FastAPI documentation

4. **Test admin login:**
   - Go to https://juridikai.onrender.com/admin
   - Enter admin credentials
   - Should redirect to dashboard

## Troubleshooting

### Issue: "Admin panel not found"

**Solution:** The frontend/admin/index.html file might not be accessible. Check that:
1. The file exists in your repository
2. The path in main.py is correct
3. The file was included in the git commit

### Issue: "404 Not Found"

**Solution:** Backend might not have redeployed. Try:
1. Check Render dashboard for deployment status
2. Look at deployment logs for errors
3. Manually trigger a redeploy

### Issue: "CORS Error"

**Solution:** Update CORS settings in `backend/main.py`:
```python
allow_origins=[
    "https://juridikai.onrender.com",
    "*"  # Remove in production
],
```

### Issue: "Cannot login - Invalid credentials"

**Solution:** 
1. Verify admin user exists: `SELECT * FROM users WHERE role = 'admin';`
2. Check password hash was created correctly
3. Ensure user status is 'active'

### Issue: "403 Forbidden - Admin access required"

**Solution:** User exists but role is not 'admin':
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## Alternative: Deploy Admin Panel Separately

If you prefer to deploy the admin panel as a separate static site:

### Option 1: Netlify

```bash
cd APP-Anna/frontend/admin
netlify deploy --prod
```

### Option 2: Vercel

```bash
cd APP-Anna/frontend/admin
vercel deploy --prod
```

### Option 3: GitHub Pages

1. Create a new repository for admin panel
2. Push the `frontend/admin/index.html` file
3. Enable GitHub Pages in repository settings
4. Access at: `https://yourusername.github.io/admin-panel/`

**Note:** If deploying separately, make sure to update CORS in backend to allow the admin panel URL.

## Environment Variables Needed on Render

Make sure these are set in your Render dashboard:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `OPENAI_API_KEY` - OpenAI API key
- `SENDGRID_API_KEY` - SendGrid API key (optional)
- `FROM_EMAIL` - Email sender address (optional)
- `FRONTEND_URL` - Frontend URL for CORS

## Security Checklist for Production

- [ ] Change default SECRET_KEY
- [ ] Use strong admin passwords
- [ ] Enable HTTPS (Render does this automatically)
- [ ] Restrict CORS origins (remove "*")
- [ ] Set up database backups
- [ ] Monitor admin logs regularly
- [ ] Use environment variables for sensitive data
- [ ] Consider IP whitelisting for admin panel
- [ ] Enable 2FA (future enhancement)

## Next Steps

1. Deploy the updated code
2. Create admin user in production database
3. Login to admin panel
4. Test all features
5. Set up monitoring and alerts
6. Document your admin credentials securely

---

**Ready to Deploy!** 🚀

Your admin panel is now configured and ready to be deployed to production.
