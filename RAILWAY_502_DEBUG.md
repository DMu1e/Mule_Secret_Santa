# 🔍 Railway 502 Error - Server Crashing After Startup

## What's Happening
The 502 error appearing after it worked briefly means:
- ✅ Server starts successfully
- ❌ Server crashes shortly after
- Railway returns 502 when trying to route requests to crashed server

---

## 🚨 IMMEDIATE ACTION: Check Railway Logs

### Step 1: View Deployment Logs
1. Go to Railway Dashboard
2. Click your project
3. Click **Deployments** tab
4. Click on the latest deployment
5. Click **View Logs**

### Step 2: Look for These Errors

#### Error Type 1: MongoDB Connection Timeout
```
MongoServerError: connection timeout
MongoNetworkError: connection attempt failed
```

**Fix:**
- Go to MongoDB Atlas → Network Access
- Make sure **0.0.0.0/0** is whitelisted
- Wait 2-3 minutes for Atlas to apply changes

---

#### Error Type 2: Memory/Resource Limit
```
JavaScript heap out of memory
SIGKILL
Process exited with code 137
```

**Fix:**
- Railway free tier: 512MB RAM
- Your app might be using too much memory
- Restart the deployment

---

#### Error Type 3: Unhandled Promise Rejection
```
UnhandledPromiseRejectionWarning
DeprecationWarning
```

**Fix:** This is likely the database connection failing silently.

---

## 🔧 QUICK FIX: Update Database Connection Handler

The issue is probably that MongoDB connection is failing but not being caught properly.

✅ **I've already updated your files:**
1. `Backend/config/db.js` - Better error handling and connection monitoring
2. `Backend/server.js` - Added `/health` endpoint for Railway to check

---

## 🚀 DEPLOY THE FIX

### Step 1: Commit and Push
```bash
cd c:\Users\dalto\OneDrive\Desktop\Coding\Mule_Secret_Santa

git add .
git commit -m "Fix MongoDB connection handling and add health check"
git push
```

### Step 2: Railway Will Auto-Deploy
- Watch the deployment in Railway dashboard
- Go to Deployments → View Logs

---

## 📊 What to Check in Railway Logs

### ✅ GOOD - Server Starting:
```
✅ Environment variables loaded
📊 NODE_ENV: production
🔄 Attempting to connect to MongoDB...
✅ MongoDB Connected: ac-oujwog8-shard-00-00.9gh49va.mongodb.net
📁 Serving static files from Frontend directory
==================================================
🚀 Server running in production mode
```

### ❌ BAD - Connection Failing:
```
❌ MongoDB connection failed: connection timeout
MongoServerError: ...
```

**If you see this:**
1. Go to MongoDB Atlas → Network Access
2. Make sure 0.0.0.0/0 is whitelisted
3. Wait 2-3 minutes
4. Redeploy on Railway

---

## 🔍 Test Your Health Endpoints

Once deployed, test these URLs:

### 1. Health Check:
```
https://your-app.railway.app/health
```

**Should return:**
```json
{
  "uptime": 123.45,
  "message": "OK",
  "timestamp": 1699347600000,
  "database": "connected"
}
```

### 2. API Check:
```
https://your-app.railway.app/api
```

**Should return:**
```json
{
  "status": "ok",
  "message": "🎄 Mule Secret Santa API is running!",
  "database": "connected",
  ...
}
```

### 3. Homepage:
```
https://your-app.railway.app
```

**Should show:** Your Secret Santa homepage

---

## 🎯 Most Common Causes of 502 After Brief Success

### 1. MongoDB Connection Timeout (90% of cases)
**Symptoms:**
- Works for 30 seconds
- Then crashes
- Logs show: "MongoServerError" or "connection timeout"

**Fix:**
- MongoDB Atlas → Network Access → Add 0.0.0.0/0
- Wait 3 minutes for Atlas to apply
- Redeploy on Railway

### 2. MongoDB URI Missing Database Name
**Your current URI:**
```
mongodb+srv://daltonmuindi_db_user:TRfVVyUL4hZrWNnj@cluster0.9gh49va.mongodb.net/?appName=Cluster0
```

**Should be:**
```
mongodb+srv://daltonmuindi_db_user:TRfVVyUL4hZrWNnj@cluster0.9gh49va.mongodb.net/secret-santa?retryWrites=true&w=majority&appName=Cluster0
```

**Fix:** Update MONGODB_URI in Railway Variables tab

### 3. Railway Running Out of Memory
**Symptoms:**
- Process killed (code 137)
- "JavaScript heap out of memory"

**Fix:**
- Railway free tier: 512MB RAM
- Upgrade to Hobby plan ($5/month) for 8GB RAM

### 4. Unhandled Promise Rejection
**Symptoms:**
- "UnhandledPromiseRejectionWarning"
- Server crashes randomly

**Fix:** Already handled in updated db.js file

---

## 🔧 Railway Settings Double-Check

Go to Railway → Settings:

```
Root Directory: (empty or /)
Start Command: npm start
Install Command: npm install
Build Command: (empty)
```

Go to Railway → Variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://daltonmuindi_db_user:TRfVVyUL4hZrWNnj@cluster0.9gh49va.mongodb.net/secret-santa?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=[generate new one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
```

---

## 🆘 Emergency Debugging

If it's still failing, check these in order:

### 1. View Full Railway Logs
```
Railway Dashboard → Deployments → Latest → View Logs → Scroll to bottom
```

Look for the LAST error before it crashes.

### 2. Test MongoDB Connection Directly
In PowerShell:
```powershell
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGODB_URI').then(() => console.log('Connected!')).catch(err => console.error('Error:', err));"
```

Replace YOUR_MONGODB_URI with your actual URI.

### 3. Check MongoDB Atlas Status
```
https://status.mongodb.com/
```

Make sure Atlas is not having issues.

### 4. Restart Deployment
Sometimes Railway just needs a fresh start:
- Railway Dashboard → Deployments → Click "Redeploy"

---

## ✅ Success Checklist

After deploying the fix:

- [ ] Railway deployment shows "Deployed successfully"
- [ ] Logs show "MongoDB Connected"
- [ ] `/health` endpoint returns 200 with "database": "connected"
- [ ] `/api` endpoint returns JSON
- [ ] Homepage loads without 502
- [ ] Can login successfully

---

## 💡 Pro Tip: Keep Logs Open

While testing:
1. Open Railway logs in one tab
2. Open your app in another tab
3. Watch logs while using the app
4. Any crashes will show immediately in logs

---

**Push the changes now and watch the Railway logs!**
