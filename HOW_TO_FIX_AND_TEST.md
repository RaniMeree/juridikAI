# 🔧 How to Fix & Test the Chat

## The Problem
1. ❌ You're connected to **production** (`juridikai-1.onrender.com`) which doesn't have the new chat API
2. ❌ You have an **expired/invalid token** stored in your browser

## The Solution - Follow These Steps:

### Step 1: Clear Your Browser Storage
Open your **browser console** (F12 or Right Click > Inspect > Console) and paste this:

```javascript
localStorage.clear();
location.reload();
```

This will clear the bad token and refresh the page.

### Step 2: Start Your Local Backend
Open PowerShell in the backend folder:

```powershell
cd C:\Users\rani-\Desktop\Anna\APP-Anna\backend
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
🚀 Starting Juridik AI API...
```

**Keep this terminal open!**

### Step 3: Restart Your Frontend
Stop your current Expo server (Ctrl+C) and restart it:

```powershell
cd C:\Users\rani-\Desktop\Anna\APP-Anna\frontend
npx expo start --clear
```

The `--clear` flag clears the cache.

### Step 4: Test the Chat
1. Open the app in your browser (press `w` in the Expo terminal)
2. **Sign up for a new account** or **log in**
3. Navigate to the chat tab
4. Send a message: "Hello, I need legal help"
5. You should receive a response!

## Verify It's Working

### Check 1: Backend Logs
In your backend terminal, you should see requests like:
```
INFO:     127.0.0.1 - "POST /api/auth/login 200 OK"
INFO:     127.0.0.1 - "POST /api/conversations 200 OK"
INFO:     127.0.0.1 - "POST /api/conversations/{id}/messages 200 OK"
```

### Check 2: Browser Console
No 401 errors! You should see:
```
POST http://localhost:8000/api/conversations 200 (OK)
POST http://localhost:8000/api/conversations/{id}/messages 200 (OK)
```

### Check 3: The Response
The AI will say something like:
> "Thank you for your message. I received: 'Hello, I need legal help'. The AI integration is pending."

This confirms the chat is working! The response is a placeholder until you integrate the real AI.

## Troubleshooting

### "Connection refused" error
- ✅ Make sure backend is running on port 8000
- ✅ Check `http://localhost:8000` in your browser - you should see `{"status":"ok"}`

### Still getting 401 errors
- ✅ Clear localStorage again
- ✅ Make sure you **logged in** (not just signed up previously)
- ✅ Check the backend terminal for any errors

### "Cannot read property of undefined"
- ✅ Restart both frontend and backend
- ✅ Clear Expo cache: `npx expo start --clear`

## Configuration Explained

I updated `frontend/app.json` to force development mode:

```json
"extra": {
  "isDev": true,
  "apiUrl": "http://localhost:8000/api"
}
```

This tells your app to use **localhost** instead of production.

## For Production Deployment Later

When you want to deploy to production:

1. Update the code on your Render backend
2. Change `isDev` to `false` in `app.json`
3. Or set `apiUrl` to your production URL

---

**Need Help?** Make sure both terminals are running and check for error messages!
