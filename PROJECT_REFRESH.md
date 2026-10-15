# Mule Secret Santa Project Refresh

This document is a quick reset for the project so you can get back up to speed without changing any application code.

## 1) Tech Stack

The project is a full-stack web app built around:

- Frontend: HTML, CSS, and vanilla JavaScript in the `Frontend/` folder
- Backend: Node.js + Express in the `Backend/` folder
- Database: MongoDB with Mongoose ODM
- Authentication: JWT + bcryptjs
- Deployment: Railway for hosting, MongoDB Atlas for the database
- Local testing: browser + local Node server, usually with `node server.js` and a browser running against `localhost:3000`
- Additional support tools: dotenv, cors, node-fetch

The key package files confirm this:

- Root `package.json` is a startup wrapper for the backend
- `Backend/package.json` includes the actual app dependencies:
  - express
  - mongoose
  - bcryptjs
  - jsonwebtoken
  - dotenv
  - cors
  - node-fetch
  - nodemon (dev dependency)

## 2) How the Web Application Works

The app is built around a secret Santa assignment workflow with a user/admin split.

### Main user flow

1. A user signs up or logs in via the API.
2. The backend validates the credentials and returns a JWT token.
3. The frontend stores that token and uses it for authenticated API calls.
4. Users can:
   - view/update their profile
   - change their password
   - manage a wishlist
   - view their secret Santa assignment
   - complete a one-time gift selection
5. Normal users are prevented from seeing the identity of who they are assigned to beyond the application logic.

### Admin flow

1. An admin account exists or is created with elevated permissions.
2. Admins can:
   - view all users
   - manage restrictions such as `maxGifts`, exclusions, and included users
   - create child users (with parent linkage and age)
   - generate Santa assignments
   - see assignment data
   - reset or regenerate assignments
   - inspect system stats

### Assignment logic

The assignment engine is in:

- `Backend/generateSantaAssignments.js`

It generates Santa pairings using:

- random shuffling
- restrictions such as excluded users and included users
- cluster-based restrictions
- maxGifts capacity checks
- validation to avoid self-assignment and invalid pairings

### Gift selection logic

There is a one-time-only gift selection feature aimed at the user experience:

- if assignments are not created yet, users are blocked
- once assignments exist, each user may select gifts once
- after selection, they cannot select again until assignments are regenerated

This is enforced in the backend and front-end status checks.

### Wishlist logic

Each user has a corresponding wishlist entry in MongoDB, and wishlist items can be:

- created
- updated
- deleted
- prioritized
- marked purchased

Wishlist logic is implemented in `Backend/server.js` and the `Wishlist` model.

## 3) How It Was Deployed

The project was prepared for deployment using Railway and MongoDB Atlas.

### Deployment pattern

- Backend hosted on Railway
- MongoDB database hosted on MongoDB Atlas
- Frontend static files served through the backend in production mode
- Environment variables supplied in Railway's Variables section

### Key deployment docs in this repo

- `DEPLOYMENT_GUIDE.md`
- `RAILWAY_FIX.md`
- `PRE_DEPLOYMENT_CHECKLIST.md`
- `FRONTEND_UPDATE_COMPLETE.md`
- `GIFT_SELECTION_FEATURE.md`

### Deployment variables used

The app expects these environment variables in production:

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- optionally `PORT` (Railway often sets this automatically)

The project also includes a root-level `package.json` and `railway.toml`/`nixpacks.json` to help Railway detect the app correctly.

### Deployment architecture

In production mode, the Node app serves the static frontend from:

- `Backend/server.js` uses `express.static(path.join(__dirname, '../Frontend'))`

So the app can run as a single backend service with the front-end bundled in the same deployment.

## 4) How to Run the Project Locally

### Recommended way

From the project root:

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` with:

```env
MONGODB_URI=mongodb://localhost:27017/secret_santa
JWT_SECRET=your_local_secret_here
NODE_ENV=development
PORT=3000
```

Then start the backend:

```bash
node server.js
```

Or use:

```bash
npm run dev
```

If you want to run the app through the project root helper:

```bash
START_SERVER.bat
```

This script starts the backend from the `Backend` folder and points the app at:

- `http://localhost:3000`
- `http://localhost:3000/api`

### Frontend access

You can open any page in `Frontend/` directly in a browser, or run a local static server such as Live Server. The app also has a dynamic config file that detects whether it is running locally or in production:

- `Frontend/js/config.js`

This uses localhost URLs when running locally and the production origin when deployed.

## 5) What Was Still to Implement / Current Project Status

This project is closer to finished than the original README suggested, but there are still a few practical follow-ups worth noting.

### Features that appear to be implemented already

- login and signup
- JWT-authenticated API
- admin user logic
- child user creation and parent linkage
- wishlist CRUD
- assignment generation and regeneration
- gift restrictions configuration
- one-time gift selection flow
- password update flow
- profile management
- deployment docs and Railway prep
- static frontend marketing/homepage and dashboard experience

### Remaining / likely future improvements

These are the most obvious items still worth polishing:

1. Real-time chat or messaging between Santa and giftee
   - there is mention of chat pages, but the feature does not appear to be fully central or robust yet

2. More complete admin dashboard UX
   - reporting, assignment history, pending user statuses, gift selection visibility, and better filtering

3. Better data validation and edge-case handling
   - invalid user assignment regeneration cases
   - duplicate edge cases during user creation
   - stronger admin confirmation flow before assignment generation

4. Automated tests
   - the repo has at least one assignment-related test file (`Backend/test/generateSantaAssignments.test.js`), but the project would benefit from broader end-to-end and API test coverage

5. Better password reset flow lifecycle
   - some docs and pages exist, but this may still need to be more tightly standardized and hardened

6. Security hardening for production
   - stricter admin token checks
   - more explicit role-authorisation patterns
   - environment validation for all optional settings
   - rate limiting and request validation if this becomes public-facing

7. Cleaner frontend architecture
   - currently a mix of static HTML pages with inline JS/CSS and some dynamic config behavior
   - long-term, it would be easier to maintain with a proper frontend framework or a more modular static architecture

8. User experience refinements
   - notifications, success/error banners, mobile polish, and a cleaner onboarding flow

## 6) Recommendations to Improve the App

If you want to make this stronger, I would prioritize these in order:

### Priority 1: Stability and reliability

- add automated tests for assignment generation, auth, wishlist flows, and admin restrictions
- centralize validation and error formatting for API responses
- add a more robust admin “generate assignments” confirmation workflow
- keep production logs clearer and more structured

### Priority 2: User experience

- add a dashboard summary card for assignment status, wishlist completion, and selection status
- improve mobile responsiveness across all HTML pages
- add visual progress in the gift selection flow
- make admin actions easier to understand and less fragile

### Priority 3: Feature completeness

- complete the messaging/chat feature properly if it is intended to be a part of the real product
- add assignment history or generation timestamps
- add email or notification reminders for gift selection and assignment generation
- add a “reset/re-run” flow that is clearly documented and safe

### Priority 4: Production readiness

- add a stronger `.env.example` and deployment checklist for future deployments
- ensure admin user creation is safer and more intentional
- review the security around token expiry, admin routes, and user access rules
- consider a proper frontend framework if the app continues to grow

## 7) Database Used

The database is MongoDB.

The project uses Mongoose models:

- `Backend/models/User.js`
- `Backend/models/Wishlist.js`

### User model highlights

The `User` schema includes fields such as:

- `name`
- `email`
- `password`
- `isAdmin`
- `isChild`
- `parentUser`
- `age`
- `maxGifts`
- `cluster`
- `excludedUsers`
- `includedUsers`
- `hasSelectedGift`
- `giftSelectionDate`
- timestamps

This means the app is not just a basic secret Santa list; it is already designed to support:

- adults and children
- family restrictions
- Santa capacity rules
- assignment-based gift selection
- admin-managed configuration

### Database setup

The default local connection is:

```env
MONGODB_URI=mongodb://localhost:27017/secret_santa
```

The production deployment uses MongoDB Atlas, with the URI passed from Railway environment variables.

## 8) Parts of the Code That Look Redundant or Unnecessary

These are the main things I would strongly consider trimming or archiving later:

### Very likely redundant / temporary

- `Backend/server.temp.js`
  - appears to be a scratch or backup server file
  - not part of the main runtime flow

- `Backend/createAdmin.js`
  - useful for a one-time admin creation task, but not part of normal app operation

- `Backend/testRestrictions.js`
  - likely a debugging or validation helper script rather than production code

- `Backend/verifyEmailIndex.js`
  - maintenance script for a one-time database index fix

- `Backend/fixEmailIndex.js`
  - also likely a one-time migration/fix script

- `Backend/updateChildPasswords.js`
  - likely a data maintenance helper, not part of the live app

- `Backend/cleanupOrphanedWishlists.js`
  - useful for a maintenance case, but not core app runtime

### Useful but better archived than kept in the active codeflow

- historical Markdown notes such as:
  - `FRONTEND_UPDATE_COMPLETE.md`
  - `GIFT_SELECTION_FEATURE.md`
  - `PRE_DEPLOYMENT_CHECKLIST.md`
  - `RAILWAY_FIX.md`
  - `DEPLOYMENT_GUIDE.md`
  - `PASSWORD_RESET_GUIDE.md`
  - `CHILD_USER_LOGIN_UPDATE.md`
  - `CLUSTER_FEATURE_SUMMARY.md`
  - `WISHLIST_FIX_SUMMARY.md`
  - `GIFT_RESTRICTIONS_SAVE_FIX.md`
  - `CHILD_USER_FIX_SUMMARY.md`

These are valuable for project context, but they read more like operational history than current app logic. They should probably be consolidated into a single project document later.

### Potentially redundant developer conveniences

- root `package.json` script duplicates backend setup logic
- `START_SERVER.bat` is useful for Windows local startup, but it is not required for the app itself
- `nodemon` is nice for development but not required in production

### Not necessarily dead code, but worth reviewing later

- some older README text still describes early goals and unfinished concepts that are no longer fully accurate
- some duplicate logic in the repo reflects iterative feature work rather than final architecture

## Bottom Line

This project already has a strong foundation:

- Express backend
- MongoDB persistence
- JWT-based auth
- admin controls
- user wishlist management
- automated assignment generation with restrictions
- production deployment preparation

The main next wins are not full-stack rewrites — they are:

- cleanup and consolidation
- stronger tests
- improved UX and admin workflow
- more complete production hardening
- finalizing the remaining “nice-to-have” features such as chat and richer assignment management

If you want, the next natural step would be to decide whether you want to:

1. clean up the redundant maintenance scripts and docs,
2. tighten the app architecture,
3. or start implementing the next priority features in a deliberate order.
