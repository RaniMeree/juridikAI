# Admin Panel - Quick Start Guide

## Get Started in 3 Steps

### Step 1: Create an Admin User (5 minutes)

Navigate to the backend directory and run the admin creation script:

```bash
cd APP-Anna/backend
python create_admin.py
```

Follow the prompts to create your admin account:
- Enter your email
- Enter your name
- Set a secure password

Example:
```
Enter admin email: admin@juridikai.com
Enter first name: Admin
Enter last name: User
Enter password: ********
Confirm password: ********
```

### Step 2: Start the Backend (if not already running)

```bash
# In the backend directory
uvicorn main:app --reload --port 8000
```

The API will be available at: http://localhost:8000

### Step 3: Open the Admin Panel

#### Option A: Using a Local Server (Recommended)

```bash
# In a new terminal
cd APP-Anna/frontend/admin
python -m http.server 3000
```

Then open in your browser: http://localhost:3000

#### Option B: Direct File Access

Simply open the file in your browser:
```
APP-Anna/frontend/admin/index.html
```

### Login

1. Navigate to the admin panel URL
2. Enter your admin credentials
3. Start managing your application!

## What You Can Do

### Dashboard
- View key metrics at a glance
- Monitor user growth
- Track total conversations and messages
- See active subscriptions and revenue

### Users Management
- Search and filter users
- View detailed user profiles
- See user conversations and messages
- Manage subscriptions
- Update user status (active/suspended/deleted)

### Conversations
- Browse all conversations
- View full message history
- Search by user
- Monitor AI responses

### Subscriptions
- Track all subscription plans
- Monitor usage (queries used vs. limit)
- Filter by status
- View subscription periods

### Payments
- View transaction history
- Track payment status
- Monitor revenue
- Export payment data

## Common Tasks

### Making a User Admin

If you need to promote another user to admin:

```bash
cd APP-Anna/backend
python create_admin.py
# Choose option 1 and use the existing user's email
```

### Checking Database Connection

Test if your backend can connect to the database:

```bash
curl http://localhost:8000/db-test
```

### Viewing API Documentation

FastAPI provides automatic API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

### "Cannot connect to backend"
- Check that backend is running on port 8000
- Verify DATABASE_URL in .env file is correct
- Check PostgreSQL is running

### "Invalid credentials"
- Verify admin user exists in database
- Check user role is 'admin'
- Try resetting password with create_admin.py

### "CORS Error"
- Check CORS settings in backend/main.py
- Verify admin panel URL is in allowed origins
- Try using http://localhost:3000 instead of file://

### Database Connection Issues

Make sure PostgreSQL is running and the database exists:

```bash
# Check PostgreSQL status
# On Windows (if using PostgreSQL):
pg_ctl status

# On Linux/Mac:
sudo systemctl status postgresql
```

Create the database if it doesn't exist:

```sql
CREATE DATABASE juridik_ai;
```

Run the schema:

```bash
cd APP-Anna/database
psql -U postgres -d juridik_ai -f schema.sql
```

## Security Best Practices

1. **Use Strong Passwords**: Admin accounts should have strong, unique passwords
2. **HTTPS in Production**: Always use HTTPS for the admin panel in production
3. **Restrict Access**: Consider IP whitelisting for admin endpoints
4. **Regular Backups**: Backup your database regularly
5. **Monitor Logs**: Check admin logs regularly for suspicious activity

## Next Steps

Once you're comfortable with the admin panel, consider:

1. **Setting up monitoring**: Add alerts for critical metrics
2. **Automating backups**: Schedule regular database backups
3. **Customizing the UI**: Modify the admin panel to match your brand
4. **Adding features**: Extend the admin panel with custom features
5. **Deploying to production**: Deploy both backend and admin panel

## Production Deployment

### Backend

Deploy to Render, Heroku, or DigitalOcean:

```bash
# Render (render.yaml is already configured)
git push render main

# Or use Docker:
docker build -t anna-backend .
docker run -p 8000:8000 anna-backend
```

### Admin Panel

Deploy to Netlify, Vercel, or any static hosting:

1. Update API_BASE_URL in admin/index.html to your production API URL
2. Upload the admin/index.html file to your hosting provider
3. Configure your domain and SSL

Example for Netlify:

```bash
cd APP-Anna/frontend/admin
netlify deploy --prod
```

## Support

Need help? Check these resources:

1. **Main README**: APP-Anna/README.md
2. **API Documentation**: http://localhost:8000/docs
3. **Admin Panel Docs**: ADMIN_PANEL_README.md
4. **Database Schema**: database/schema.sql

## Important URLs

- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:3000 (or your deployed URL)
- **Main App**: http://localhost:8081 (Expo/React Native)

---

**Ready to go!** 🚀

Your admin panel is now set up and ready to use. Login with your admin credentials and start managing your Anna Legal AI application.
