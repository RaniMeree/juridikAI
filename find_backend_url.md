# Find Your Backend URL

## The Issue

`https://juridikai.onrender.com` points to your **frontend** (static site), not backend.

You need to find your **backend API URL** to access the admin panel.

## How to Find Backend URL

### **Method 1: Render Dashboard**

1. Go to https://dashboard.render.com
2. Look at your services list
3. Find the service with:
   - Type: "Web Service" (not "Static Site")
   - Name containing "backend" or "api"
   - Language: Python

4. Click on it and copy the URL at the top

### **Method 2: Check Your Frontend Code**

The frontend might already know the backend URL:

```powershell
cd c:\Users\rani-\Desktop\Anna\APP-Anna\frontend\src\services
type api.ts
```

Look for `API_BASE_URL` or similar.

### **Method 3: Check Environment Variables**

Your backend URL might be in your frontend's environment:

```powershell
cd c:\Users\rani-\Desktop\Anna\APP-Anna\frontend
type .env
```

## Common Backend URL Patterns

Your backend is likely at one of these:
- `https://juridikai-backend.onrender.com`
- `https://juridikai-api.onrender.com`
- `https://anna-backend.onrender.com`
- `https://anna-api.onrender.com`

## Once You Find It

Access admin panel at:
```
https://YOUR-BACKEND-URL/admin
```

## Alternative: Deploy Backend with Known URL

If you can't find your backend or it's not deployed:

1. In Render Dashboard, create new Web Service
2. Name it "juridikai-backend"
3. Connect your repository
4. Set build command: `cd backend && pip install -r requirements.txt`
5. Set start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables from your `.env` file
7. Deploy

Then your backend will be at: `https://juridikai-backend.onrender.com`

And admin panel at: `https://juridikai-backend.onrender.com/admin`
