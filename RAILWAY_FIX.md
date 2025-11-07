# 🔧 Railway Deployment Fix

## The Problem
You're getting a 502 error because Railway needs proper configuration to run the app from the Backend directory.

## ✅ Files I Just Created

1. **`package.json`** (root) - Tells Railway how to start the app
2. **`railway.toml`** - Railway configuration
3. **`nixpacks.json`** - Build configuration
4. **Updated `server.js`** - Added better logging and error handling

---

## 🚀 Steps to Fix Your Deployment

### Step 1: Commit and Push Changes
```bash
cd c:\Users\dalto\OneDrive\Desktop\Coding\Mule_Secret_Santa

git add .
git commit -m "Fix Railway deployment configuration"
git push
```

### Step 2: Check Railway Settings

1. Go to your Railway dashboard
2. Click your project
3. Go to **Settings** tab
4. Verify these settings:

#### Important Settings:
- **Root Directory**: Leave EMPTY (or set to `/`)
- **Start Command**: `npm start` (Railway will read from package.json)
- **Install Command**: Leave default or set to `npm install`
- **Build Command**: Leave empty

### Step 3: Verify Environment Variables

Make sure these are set in Railway **Variables** tab:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_generated_jwt_secret
```

**Important:** Make sure there are NO spaces in your MONGODB_URI or JWT_SECRET!

### Step 4: Redeploy

After pushing changes:
1. Railway should auto-deploy
2. If not, click **"Deploy"** button
3. Watch the **Deployment Logs**

---

## 📊 What to Look For in Logs

### ✅ Good Signs:
```
✅ Environment variables loaded
📊 NODE_ENV: production
🔌 PORT: 3000
🗄️  MongoDB URI: ✅ Set
🔐 JWT Secret: ✅ Set
MongoDB Connected: ...
📁 Serving static files from Frontend directory
==================================================
🚀 Server running in production mode
🔌 Port: 3000
🔗 API available at: http://localhost:3000/api
🌐 Frontend served from: /app/Backend/../Frontend
📁 Static files: /app/Backend/../Frontend
==================================================
```

### ❌ Bad Signs (and fixes):

1. **"Missing required environment variables"**
   - Fix: Add MONGODB_URI and JWT_SECRET in Railway Variables

2. **"Cannot find module"**
   - Fix: Railway might not be installing dependencies
   - Make sure `npm install` runs in the logs

3. **"EADDRINUSE"**
   - Fix: Railway port conflict (shouldn't happen, but restart deployment)

4. **"MongoDB connection error"**
   - Fix: Check your MONGODB_URI is correct
   - Make sure MongoDB Atlas IP whitelist includes 0.0.0.0/0

---

## 🧪 Testing After Deployment

### 1. Test API Health
Open: `https://your-app.railway.app/api`

Should see:
```json
{
  "status": "ok",
  "message": "🎄 Mule Secret Santa API is running!",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Test Homepage
Open: `https://your-app.railway.app`

Should see your Secret Santa homepage!

### 3. Test Login
Go to: `https://your-app.railway.app/login.html`

Try logging in with your credentials.

---

## 🔍 Troubleshooting

### Still Getting 502 Error?

1. **Check Railway Logs:**
   ```
   Railway Dashboard → Your Project → Deployments → View Logs
   ```
   Look for the last error message

2. **Common Issues:**

   **Issue: "Error: Cannot find module '../Frontend/index.html'"**
   - The Frontend folder might not be getting deployed
   - Check that Frontend folder is in your git repository
   - Run: `git status` and make sure Frontend files are tracked

   **Issue: "MongoServerError: Authentication failed"**
   - Wrong MongoDB credentials
   - Check MONGODB_URI has correct password
   - Make sure you replaced `<password>` with actual password

   **Issue: "Port already in use"**
   - Shouldn't happen on Railway
   - Try redeploying (click Deploy button again)

3. **Verify Files Exist:**
   ```bash
   git ls-files | grep -E "(Frontend|Backend)"
   ```
   Make sure both directories are tracked

---

## 📝 Quick Checklist

Before deploying, verify:

- [ ] `package.json` exists in root directory
- [ ] `railway.toml` exists in root directory
- [ ] `Backend/package.json` has all dependencies
- [ ] `Frontend` folder is committed to git
- [ ] All HTML files are in `Frontend` folder
- [ ] Environment variables set in Railway:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI (from MongoDB Atlas)
  - [ ] JWT_SECRET (generated with crypto)
  - [ ] PORT (optional, Railway sets automatically)
- [ ] MongoDB Atlas IP whitelist: 0.0.0.0/0
- [ ] Changes committed and pushed to GitHub

---

## 🎯 Alternative: Manual Deploy Test

If Railway keeps failing, test locally in production mode:

```bash
# In PowerShell
cd Backend
$env:NODE_ENV="production"
$env:MONGODB_URI="your_mongodb_uri"
$env:JWT_SECRET="your_jwt_secret"
node server.js
```

Then visit: `http://localhost:3000`

If this works locally, the issue is with Railway configuration.
If this fails locally, the issue is in your code.

---

## 💡 Pro Tips

1. **Watch the logs in real-time:**
   - Railway Dashboard → Deployments → View Logs
   - Keep this open while deploying

2. **Test the build locally:**
   ```bash
   cd Backend
   npm install
   npm start
   ```

3. **Check file paths:**
   - Make sure `Frontend` and `Backend` are at the same level
   - Verify `../Frontend` path is correct from Backend

4. **Railway uses `/app` as root:**
   - Your app will be at `/app/Backend/server.js`
   - Frontend should be at `/app/Frontend/`

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Deployment logs show "Server running in production mode"
2. ✅ `https://your-app.railway.app/api` returns JSON
3. ✅ `https://your-app.railway.app` shows your homepage
4. ✅ Can navigate to login page and login works

---

## 🆘 Still Stuck?

1. Share your Railway deployment logs (last 50 lines)
2. Share output of: `git ls-files | grep -E "(package.json|Frontend|Backend)"`
3. Confirm environment variables are set correctly

The most common issue is missing environment variables or incorrect folder structure!
