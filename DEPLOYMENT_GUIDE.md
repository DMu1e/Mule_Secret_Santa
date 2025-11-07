# 🚀 Deployment Guide - Mule Secret Santa

## Quick Start Deployment to Railway.app

### Prerequisites
- [ ] GitHub account
- [ ] MongoDB Atlas account (free tier)
- [ ] Credit/debit card for Railway (first $5 free)

---

## Step 1: Set Up MongoDB Atlas (5 minutes)

### 1.1 Create Account and Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier)
3. Create a **FREE M0 Cluster**:
   - Cloud Provider: AWS
   - Region: Choose closest to you
   - Cluster Name: `SecretSantaCluster`

### 1.2 Create Database User
1. Go to **Database Access** → **Add New Database User**
   - Username: `secretsanta`
   - Password: Generate strong password (SAVE THIS!)
   - Database User Privileges: **Read and write to any database**
   - Click **Add User**

### 1.3 Whitelist All IPs
1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** → Click **Connect**
2. Choose **"Connect your application"**
3. Copy connection string, it looks like:
   ```
   mongodb+srv://secretsanta:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name at the end:
   ```
   mongodb+srv://secretsanta:YourPassword@cluster0.xxxxx.mongodb.net/secret-santa?retryWrites=true&w=majority
   ```
6. **SAVE THIS CONNECTION STRING!**

---

## Step 2: Generate JWT Secret

Open PowerShell and run:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**SAVE THE OUTPUT!** (looks like: `a7f3b2c1d4e5...`)

---

## Step 3: Push to GitHub

### 3.1 Initialize Git (if not already done)
```bash
cd c:\Users\dalto\OneDrive\Desktop\Coding\Mule_Secret_Santa
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 3.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `Mule_Secret_Santa`
3. Description: "Secret Santa gift exchange web application"
4. **Keep it Public** (or Private if you prefer)
5. **Don't** initialize with README
6. Click **Create repository**

### 3.3 Push Code
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Mule_Secret_Santa.git
git push -u origin main
```

---

## Step 4: Deploy to Railway

### 4.1 Sign Up
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with **GitHub**

### 4.2 Create New Project
1. Click **"Deploy from GitHub repo"**
2. Select **`Mule_Secret_Santa`** repository
3. Railway will auto-detect it as a Node.js project

### 4.3 Configure Settings
1. Click your project
2. Go to **Settings** tab
3. Set these:
   - **Root Directory**: `Backend`
   - **Start Command**: `node server.js`
   - **Watch Paths**: `Backend/**`

### 4.4 Add Environment Variables
1. Go to **Variables** tab
2. Click **"New Variable"**
3. Add these variables ONE BY ONE:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://secretsanta:YourPassword@cluster0.xxxxx.mongodb.net/secret-santa?retryWrites=true&w=majority
JWT_SECRET=your_generated_jwt_secret_from_step_2
```

4. Click **Deploy** (or it will auto-deploy)

### 4.5 Get Your App URL
1. Go to **Settings** tab
2. Scroll to **Domains**
3. Click **"Generate Domain"**
4. Your URL: `https://mule-secret-santa-production.up.railway.app`

---

## Step 5: Update Frontend Config

1. Edit `Frontend/js/config.js`
2. No changes needed! The config automatically detects production vs development

---

## Step 6: Migrate Your Data (Optional)

If you have existing users/data on localhost:

### 6.1 Export from Local MongoDB
```bash
cd Backend
mongodump --db=secret-santa --out=./backup
```

### 6.2 Import to Atlas
```bash
mongorestore --uri="mongodb+srv://secretsanta:YourPassword@cluster0.xxxxx.mongodb.net/secret-santa" ./backup/secret-santa
```

Or manually in MongoDB Compass:
1. Download MongoDB Compass
2. Connect to your Atlas cluster
3. Import collections

---

## Step 7: Test Your Live App

1. Visit your Railway URL
2. Test checklist:
   - [ ] Homepage loads
   - [ ] Can signup/login
   - [ ] Dashboard works
   - [ ] Admin can access admin pages
   - [ ] Wishlists work
   - [ ] Can generate assignments
   - [ ] Gift selection works
   - [ ] Password reset works
   - [ ] Pictures/slideshow display correctly

---

## Troubleshooting

### App Not Loading
**Check Railway Logs:**
1. Go to Railway dashboard
2. Click your project
3. View **Deployments** → **View Logs**

**Common Issues:**
- MongoDB connection failed → Check MONGODB_URI
- Port error → Railway sets PORT automatically, don't hardcode it
- CORS error → Check NODE_ENV is set to "production"

### Database Connection Failed
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check username/password in connection string
- Ensure database user has correct permissions

### Frontend Not Loading
- Check that `NODE_ENV=production` is set
- Verify static files are being served (check logs)
- Make sure Frontend folder is at root level with Backend

---

## Custom Domain (Optional)

### Option 1: Use Railway Domain
- Free `.up.railway.app` domain provided automatically

### Option 2: Buy Custom Domain
1. Purchase from:
   - Namecheap: ~$10/year
   - Google Domains: ~$12/year  
   - Cloudflare: ~$9/year

2. In Railway:
   - Go to **Settings** → **Domains**
   - Click **"Custom Domain"**
   - Enter your domain
   - Update DNS records as instructed

---

## Cost Summary

| Service | Cost | Notes |
|---------|------|-------|
| Railway | $5/month | First $5 free |
| MongoDB Atlas | FREE | M0 tier (512MB) |
| Domain (optional) | ~$10/year | If you want custom URL |
| **Total** | **$5/month** | **First month FREE** |

---

## Ongoing Maintenance

### Monitor Your App
- **Railway Dashboard**: Check logs and metrics
- **MongoDB Atlas**: Monitor database usage
- **UptimeRobot** (free): Get alerts if site goes down

### Regular Backups
MongoDB Atlas:
1. Go to **Backup** tab
2. Configure automatic backups
3. Manual backup: **Export** → **Export Collection**

### Updates
```bash
# Make changes locally
git add .
git commit -m "Your update description"
git push

# Railway auto-deploys from GitHub!
```

---

## Environment Variables Reference

| Variable | Example | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `production` | Sets environment mode |
| `PORT` | `3000` | Server port (Railway sets this) |
| `MONGODB_URI` | `mongodb+srv://...` | Database connection |
| `JWT_SECRET` | `a7f3b2c1d4e5...` | Auth token encryption |
| `FRONTEND_URL` | `https://your-app.railway.app` | Your app URL |

---

## Success Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with read/write permissions
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] MongoDB connection string obtained and tested
- [ ] JWT secret generated
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables configured in Railway
- [ ] App deployed successfully
- [ ] Custom domain configured (optional)
- [ ] Data migrated (if applicable)
- [ ] All features tested on live URL
- [ ] Monitoring set up

---

## Quick Commands

```bash
# View Railway logs
railway logs

# Restart deployment
railway up

# Run command in production
railway run node script.js

# Update code
git add .
git commit -m "Update"
git push

# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Node.js Docs**: https://nodejs.org/docs

---

**Your app is now live! 🎉**

Share your URL: `https://your-app-name.up.railway.app`
