# Admin Panel Documentation

## Overview

The Anna Legal AI Admin Panel is a comprehensive web-based interface for managing users, conversations, subscriptions, payments, and monitoring system analytics.

## Features

### 1. Dashboard
- Total users count with monthly growth
- Total conversations and messages
- Active subscriptions and revenue
- User growth chart (last 7 days)

### 2. Users Management
- View all users with pagination
- Search users by email, first name, or last name
- Filter users by account status (active, suspended, deleted)
- View detailed user information including:
  - Basic information (email, name, phone, role, status)
  - Usage statistics (conversations, messages)
  - Subscription details
  - Recent payment history
- Update user account status (activate, suspend, delete)

### 3. Conversations
- View all conversations across all users
- See conversation titles and message counts
- View full conversation history with messages
- Filter conversations by user

### 4. Subscriptions
- View all subscriptions with user details
- Filter by subscription status (active, cancelled, expired, past_due)
- Monitor query usage (queries used vs. limit)
- Track subscription period end dates

### 5. Payments
- View all payment transactions
- See payment amounts, currencies, and status
- Track payment methods and dates
- Filter and paginate through payment history

## Setup Instructions

### Step 1: Create an Admin User

Before you can access the admin panel, you need to create a user with admin role in the database.

#### Option A: Update an existing user to admin

Connect to your PostgreSQL database and run:

```sql
-- Update an existing user to admin role
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

#### Option B: Create a new admin user

1. First, sign up through the regular app or use the API
2. Then update the role:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

#### Option C: Create admin user directly in database

```sql
-- Generate a password hash first (use bcrypt)
-- Example: password "admin123" hashed with bcrypt

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
    'admin@juridikai.com',
    '$2b$12$your_bcrypt_hash_here',  -- Use a real bcrypt hash
    'Admin',
    'User',
    'admin',
    'active',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

To generate a bcrypt hash for your password, you can use this Python script:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
password = "your_password_here"
hashed = pwd_context.hash(password)
print(hashed)
```

### Step 2: Start the Backend

Make sure your backend server is running:

```bash
cd APP-Anna/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Access the Admin Panel

1. Open the admin panel in your browser:
   - For local development: Open the file directly or serve it with a local server
   - Using Python: `python -m http.server 3000` from the `frontend/admin` directory
   - Or simply open `frontend/admin/index.html` in your browser

2. The admin panel will be available at:
   - If using Python HTTP server: `http://localhost:3000`
   - If opening directly: `file:///path/to/frontend/admin/index.html`

3. Login with your admin credentials

## API Endpoints

All admin endpoints require authentication with an admin user token.

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

### Users
- `GET /api/admin/users` - List all users (with pagination and filters)
- `GET /api/admin/users/{user_id}` - Get detailed user information
- `PATCH /api/admin/users/{user_id}/status` - Update user account status

### Conversations
- `GET /api/admin/conversations` - List all conversations
- `GET /api/admin/conversations/{conversation_id}/messages` - Get conversation messages

### Subscriptions
- `GET /api/admin/subscriptions` - List all subscriptions

### Payments
- `GET /api/admin/payments` - List all payment transactions

### Analytics
- `GET /api/admin/analytics/usage` - Get usage analytics

### Admin Logs
- `GET /api/admin/logs` - Get admin action logs

## Security Notes

1. **Admin Role Required**: All endpoints check that the authenticated user has the `admin` role
2. **Token Authentication**: Uses JWT tokens for authentication
3. **Audit Logging**: Admin actions are logged in the `admin_logs` table
4. **CORS**: Make sure to update CORS settings in production

## Configuration

The admin panel connects to the backend API. Update the `API_BASE_URL` in the HTML file if your backend is running on a different port or domain:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

For production, change this to your production API URL:

```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

## Deployment

### Option 1: Deploy as Static Site

The admin panel is a single HTML file with all dependencies loaded from CDN. You can:
1. Upload to any static hosting (Netlify, Vercel, GitHub Pages)
2. Serve through your backend as a static file
3. Use a web server like Nginx or Apache

### Option 2: Serve from Backend

Add a static file route in your FastAPI backend:

```python
from fastapi.staticfiles import StaticFiles

app.mount("/admin", StaticFiles(directory="frontend/admin", html=True), name="admin")
```

Then access at: `http://your-domain.com/admin/`

## Troubleshooting

### Cannot Login
- Verify the user has `role = 'admin'` in the database
- Check that the backend is running and accessible
- Check browser console for error messages

### CORS Errors
- Make sure the admin panel URL is in the CORS allowed origins in `main.py`
- The backend already includes `"http://localhost:3000"` for local development

### Data Not Loading
- Check that the backend API is accessible
- Verify your admin token is valid
- Check the browser console and network tab for errors

## Future Enhancements

Potential features to add:
- Real-time analytics with charts
- Export data to CSV/Excel
- User activity timeline
- Email notifications to users
- Bulk user operations
- Advanced search and filtering
- System health monitoring
- API usage analytics
- Legal document management
- RAG system monitoring

## Support

For issues or questions, please contact the development team or check the main README.md file.
