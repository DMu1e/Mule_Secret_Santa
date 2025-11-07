# 🧪 Testing Your Application Locally

## ⚠️ IMPORTANT: Understanding the "Cannot GET /api" Error

**This is NORMAL!** The error you saw means:
- ✅ Your backend server IS running
- ✅ The port 3000 is working
- ❌ You're just accessing the wrong URL

`/api` is not meant to be accessed directly in a browser - it's a **base path** for API endpoints.

---

## ✅ Correct Way to Test Locally

### Method 1: Open Frontend Files Directly (EASIEST)

1. **Start the Backend Server First:**
   ```bash
   cd c:\Users\dalto\OneDrive\Desktop\Coding\Mule_Secret_Santa\Backend
   node server.js
   ```
   
   You should see:
   ```
   MongoDB Connected: cluster0.9gh49va.mongodb.net
   Server running on port 3000
   ```

2. **Open the Frontend:**
   - Navigate to: `c:\Users\dalto\OneDrive\Desktop\Coding\Mule_Secret_Santa\Frontend`
   - Double-click `index.html` to open in your browser
   - **OR** right-click `index.html` → "Open with" → Chrome/Firefox

3. **The app should work!** 
   - Config.js will detect localhost
   - API calls will go to `http://localhost:3000/api`

---

### Method 2: Use VS Code Live Server (RECOMMENDED)

1. **Install Live Server Extension:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search "Live Server"
   - Install by Ritwick Dey

2. **Start Backend:**
   ```bash
   cd c:\Users\dalto\OneDrive\Desktop\Coding\Mule_Secret_Santa\Backend
   node server.js
   ```

3. **Start Frontend:**
   - Open VS Code
   - Open `Frontend/index.html`
   - Right-click in editor → "Open with Live Server"
   - Browser will open at `http://127.0.0.1:5500/index.html`

4. **Test the app!**

---

### Method 3: Production Mode Test (Tests Full Deployment Setup)

This serves the frontend FROM the backend (how it works on Railway):

1. **Set Environment Variable:**
   ```bash
   # In PowerShell:
   $env:NODE_ENV="production"
   
   # Or create a .env file with:
   NODE_ENV=production
   ```

2. **Start Server:**
   ```bash
   cd c:\Users\dalto\OneDrive\Desktop\Coding\Mule_Secret_Santa\Backend
   node server.js
   ```
   
   You should see:
   ```
   📁 Serving static files from Frontend directory
   Server running on port 3000
   ```

3. **Access the App:**
   - Open browser
   - Go to: `http://localhost:3000`
   - You should see your index.html page
   - Everything should work!

---

## 🔍 Testing Individual API Endpoints

If you want to test the API directly (not through the browser):

### Using PowerShell:

```powershell
# Test if server is running
Invoke-WebRequest -Uri "http://localhost:3000/api/login" -Method POST -ContentType "application/json" -Body '{"name":"testuser","password":"test123"}' | Select-Object -Expand Content

# Should return either:
# - Error if user doesn't exist (this is good - server is working!)
# - JWT token if user exists
```

### Using Browser DevTools:

1. Open any page (even the error page at localhost:3000/api)
2. Press F12 → Console tab
3. Run this JavaScript:

```javascript
fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'admin', password: 'admin123456' })
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## ✅ What URLs Should You Use?

| Purpose | URL | Method |
|---------|-----|--------|
| ❌ NOT THIS | `http://localhost:3000/api` | Don't access directly |
| ✅ Frontend Home | `http://localhost:3000/` (production mode) | GET |
| ✅ Frontend Home | `http://127.0.0.1:5500/index.html` (Live Server) | GET |
| ✅ Frontend Home | `file:///C:/Users/.../Frontend/index.html` (Direct) | GET |
| ✅ Login API | `http://localhost:3000/api/login` | POST |
| ✅ Signup API | `http://localhost:3000/api/signup` | POST |
| ✅ User Profile API | `http://localhost:3000/api/user/profile` | GET |

---

## 🧪 Quick Test Checklist

1. **Backend Running:**
   ```bash
   cd Backend
   node server.js
   ```
   ✅ Should see: "Server running on port 3000"

2. **Database Connected:**
   ✅ Should see: "MongoDB Connected: cluster0.9gh49va.mongodb.net"

3. **Frontend Access:**
   - Open `Frontend/index.html` in browser
   - ✅ Should see your homepage

4. **Config.js Working:**
   - Open browser console (F12)
   - ✅ Should see: "🌍 Environment: Development (localhost)"

5. **API Calls Working:**
   - Try to login or signup
   - ✅ Should work without CORS errors

---

## 🎯 Summary

### ❌ Wrong:
- Accessing `http://localhost:3000/api` in browser
- Expecting to see a webpage at `/api`

### ✅ Right:
- Start backend: `node server.js`
- Open frontend: Double-click `index.html` or use Live Server
- Let config.js handle the API URLs automatically

---

## 💡 Pro Tip

If you want a quick landing page for the API, add this to your `server.js`:

```javascript
// Health check endpoint
app.get('/api', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Mule Secret Santa API is running!',
        version: '1.0.0',
        endpoints: ['/api/login', '/api/signup', '/api/user/profile', '...']
    });
});
```

Then `http://localhost:3000/api` would show a nice JSON response!

---

**Need Help?** 
- Check that MongoDB is connected
- Verify no CORS errors in browser console
- Make sure both backend is running when testing frontend
