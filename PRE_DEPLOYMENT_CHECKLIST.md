# 📋 Pre-Deployment Checklist

## Before You Deploy - Complete These Steps

### ✅ Code Preparation
- [ ] All features working locally
- [ ] No console errors in browser
- [ ] Backend server runs without errors
- [ ] All HTML files load config.js (check next section)
- [ ] Test login/logout flow
- [ ] Test admin features
- [ ] Test user features
- [ ] Test gift selection one-time access

### ✅ Configuration Files
- [x] `Frontend/js/config.js` created
- [x] `Backend/.env.example` created
- [x] `.gitignore` created
- [x] `package.json` updated with engines
- [x] Backend updated for production mode

### ✅ Security
- [ ] .env file NOT committed to git (check `.gitignore`)
- [ ] JWT_SECRET will be generated
- [ ] MongoDB password will be strong
- [ ] CORS properly configured

### ✅ Database
- [ ] All models tested locally
- [ ] Sample data exists for testing
- [ ] Know how to export/import data if needed

### ✅ Frontend Files That Need Config.js

Add this line to the `<head>` section of these files BEFORE other scripts:
```html
<script src="js/config.js"></script>
```

Then update their JavaScript to use:
```javascript
const BASE_URL = window.APP_CONFIG.BASE_URL;
const API_URL = window.APP_CONFIG.API_URL;
const ADMIN_URL = window.APP_CONFIG.ADMIN_URL;
```

Files to update:
- [x] `login.html` ✅
- [x] `signup.html` ✅
- [x] `dashboard.html` ✅
- [x] `admin.html` ✅
- [x] `gift-restrictions.html` ✅
- [x] `password_reset.html` ✅
- [x] `santa-assignments.html` ✅
- [x] `assignment.html` ✅
- [x] `wishlist.html` ✅
- [x] `gift-choice.html` ✅
- [x] `profile.html` ✅
- [x] `santachat.html` (N/A - no API calls) ✅

### ✅ Testing
- [ ] Test on Chrome
- [ ] Test on Firefox  
- [ ] Test on mobile (responsive)
- [ ] Test admin functions
- [ ] Test user functions
- [ ] Test error handling

### ✅ Accounts
- [ ] GitHub account ready
- [ ] MongoDB Atlas account created (or ready to create)
- [ ] Railway account ready (or ready to create)
- [ ] Credit card for Railway available

### ✅ Documentation
- [x] DEPLOYMENT_GUIDE.md created
- [x] GIFT_SELECTION_FEATURE.md exists
- [x] PASSWORD_RESET_GUIDE.md exists
- [ ] README.md updated (optional)

---

## Quick File Update Script

Need to add config.js to all HTML files? Here's what to add:

### In `<head>` section (after other meta tags, before other scripts):
```html
<script src="js/config.js"></script>
```

### In `<script>` section (at the very top):
```javascript
// Use dynamic API URLs
const BASE_URL = window.APP_CONFIG.BASE_URL;
const API_URL = window.APP_CONFIG.API_URL;
const ADMIN_URL = window.APP_CONFIG.ADMIN_URL;
```

### Replace hardcoded URLs:
Find: `'http://localhost:3000'` or `http://localhost:3000/api`
Replace with: Use the variables above

---

## What Happens During Deployment

1. **Push to GitHub** → Code stored in repository
2. **Railway detects push** → Automatically starts deployment
3. **Railway installs dependencies** → Runs `npm install`
4. **Railway starts server** → Runs `npm start` or `node server.js`
5. **App goes live** → Gets a URL like `https://your-app.railway.app`

---

## After Deployment Testing

- [ ] Homepage loads without errors
- [ ] Can create an account
- [ ] Can login
- [ ] Dashboard displays correctly
- [ ] Admin can access admin panel
- [ ] Can create/view wishlists
- [ ] Can generate Santa assignments
- [ ] Gift selection works (one time only)
- [ ] Password reset works
- [ ] Pictures/images display
- [ ] Navigation works correctly
- [ ] Logout works
- [ ] No CORS errors in console

---

## Estimated Time

- MongoDB Atlas setup: **5 minutes**
- GitHub push: **2 minutes**
- Railway deployment: **5-10 minutes**
- Testing: **10-15 minutes**
- **Total: ~30 minutes**

---

## Ready to Deploy?

1. ✅ Complete this checklist
2. 📖 Follow DEPLOYMENT_GUIDE.md step by step
3. 🚀 Your app will be live!

---

## Need Help?

Common issues and solutions in DEPLOYMENT_GUIDE.md

If stuck:
1. Check Railway logs
2. Verify environment variables
3. Test MongoDB connection
4. Check console for errors
