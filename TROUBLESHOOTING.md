# 🔧 Backend Connection Troubleshooting Guide

## Current Status:
✅ **Backend Server IS Running** (Process ID: 3624)
✅ **Port 3000 IS Listening** 
✅ **API IS Responding** (Tested successfully)
✅ **All HTML files updated** with config.js

## ⚠️ So Why Can't You Login?

Let me help you diagnose the exact issue:

---

## 🎯 **STEP 1: Run the Diagnostic Tool**

I just created a comprehensive diagnostic tool for you!

### How to use it:
1. **Open this file in your browser:**
   ```
   c:\Users\dalto\OneDrive\Desktop\Coding\Mule_Secret_Santa\Frontend\DIAGNOSTIC.html
   ```

2. **Click "Run Complete Diagnostic"** button

3. **It will tell you EXACTLY what's wrong!**

The diagnostic will test:
- ✅ Config.js loading
- ✅ Backend connection
- ✅ API endpoints
- ✅ CORS configuration
- ✅ Actual login attempt

---

## 🔍 Common Issues & Solutions:

### Issue #1: Opening HTML files directly (file://)
**Symptom:** Login button does nothing, no errors in console

**Why it happens:** Some browsers block fetch requests from `file://` URLs

**Solution:**
1. **Use VS Code Live Server:**
   - Install "Live Server" extension in VS Code
   - Right-click `login.html` → "Open with Live Server"
   - Will open as `http://127.0.0.1:5500/login.html`

2. **OR use Production Mode:**
   ```bash
   # In PowerShell (in Backend directory):
   $env:NODE_ENV="production"
   node server.js
   
   # Then visit: http://localhost:3000
   ```

---

### Issue #2: CORS Errors
**Symptom:** Console shows "CORS policy" error

**Solution:** Check your `server.js` CORS configuration:
```javascript
const corsOptions = {
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', '*'],
    credentials: true,
    optionsSuccessStatus: 200
};
```

**Fix:** Add your current origin to the allowed list.

---

### Issue #3: Config.js Not Loading
**Symptom:** Console shows "APP_CONFIG is not defined"

**Check:**
1. Does `Frontend/js/config.js` exist? ✅ (We created it)
2. Is the script tag in the HTML? ✅ (We added it)
3. Open browser DevTools (F12) → Network tab → Refresh → Check if config.js loads

**Solution:** Make sure the path is correct relative to the HTML file.

---

### Issue #4: Wrong Credentials
**Symptom:** "Invalid username or password" message

**This is actually GOOD!** It means:
- ✅ Frontend is reaching backend
- ✅ Backend is processing the request
- ✅ You just need the right credentials

**Solution:**
- Try: Username: `admin`, Password: `admin123456`
- Or create a new account via signup page

---

### Issue #5: Network Request Failed
**Symptom:** Console shows "Failed to fetch" or "Network error"

**Causes:**
1. Backend not running
2. Wrong port
3. Firewall blocking

**Solution:**
1. **Verify backend is running:**
   ```powershell
   Get-Process -Name node
   ```
   Should show process ID: 3624

2. **Check if port is listening:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 3000
   ```
   Should return: True

3. **Test API directly:** Open `http://localhost:3000/api` in browser
   Should show: {"status":"ok","message":"🎄 Mule Secret Santa API is running!"}

---

## 🚀 Quick Fix Checklist:

### Check these in order:

1. **Backend Running?**
   ```bash
   cd c:\Users\dalto\OneDrive\Desktop\Coding\Mule_Secret_Santa\Backend
   node server.js
   ```
   Should see: "Server running on port 3000" and "MongoDB Connected"

2. **How are you accessing the frontend?**
   - ❌ Double-clicking HTML file? → Use Live Server instead
   - ✅ Using Live Server? → Perfect!
   - ✅ Using localhost:3000? → Perfect! (production mode)

3. **Open Browser Console (F12)**
   - Look for red errors
   - Check Network tab
   - See any failed requests?

4. **Test with Diagnostic Tool**
   Open `Frontend/DIAGNOSTIC.html` and run tests

5. **Try a simple test:**
   Open browser console and run:
   ```javascript
   fetch('http://localhost:3000/api')
     .then(r => r.json())
     .then(d => console.log(d))
   ```
   Should print the API status

---

## 🎯 Most Likely Solution:

Based on your setup, the issue is probably:

### **You're opening the HTML file directly (file://)**

**How to tell:**
- Look at the address bar
- Does it say `file:///C:/Users/...` ? ← This is the problem!

**The Fix:**

### Option A: Use Live Server (RECOMMENDED)
1. Install VS Code extension "Live Server"
2. Open `Frontend/login.html` in VS Code
3. Right-click → "Open with Live Server"
4. Browser opens at `http://127.0.0.1:5500/login.html`
5. Try logging in now!

### Option B: Use Production Mode
1. Open PowerShell in Backend directory
2. Run:
   ```powershell
   $env:NODE_ENV="production"
   node server.js
   ```
3. Open browser to `http://localhost:3000`
4. Try logging in!

---

## 📞 Still Not Working?

### Run the Diagnostic Tool:
1. Open `Frontend/DIAGNOSTIC.html` in browser
2. Click "Run Complete Diagnostic"
3. Share the results - it will tell you exactly what's wrong!

### What to check:
1. **Console errors** (F12 → Console tab)
2. **Network requests** (F12 → Network tab)
3. **Which URL** you're using (address bar)
4. **Backend console** for any errors

---

## 🎉 Quick Test:

Open browser console (F12) and paste this:

```javascript
// Test 1: Is backend running?
fetch('http://localhost:3000/api')
  .then(r => r.json())
  .then(d => console.log('✅ Backend OK:', d))
  .catch(e => console.error('❌ Backend ERROR:', e));

// Test 2: Can we login?
fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({name: 'admin', password: 'admin123456'})
})
  .then(r => r.json())
  .then(d => console.log('Login response:', d))
  .catch(e => console.error('Login ERROR:', e));
```

If both work → Your backend is fine, it's a frontend issue!
If both fail → Backend issue or CORS issue!

---

## 💡 My Bet:

I bet you're opening the HTML file directly (`file://`). 

**Try this right now:**
1. Open VS Code
2. Install "Live Server" extension
3. Open `login.html`
4. Right-click → "Open with Live Server"
5. Try login again

**This will probably fix it! 🎉**
