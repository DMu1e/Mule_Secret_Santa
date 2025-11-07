# Gift Selection Feature - One-Time Only

## What Changed

The gift selection page now only appears **ONCE** after Secret Santa assignments are made, maintaining the "illusion of choice" while creating excitement.

## How It Works

### 1. **Before Assignments Are Made**
   - Users cannot access gift-choice.html
   - If they try to visit, they'll be redirected to dashboard with message:
     > "Secret Santa assignments have not been generated yet. Please wait for the admin to create assignments."

### 2. **After Assignments Are Made (First Time)**
   - Users can access gift-choice.html **ONCE**
   - They select their gift(s) based on maxGifts setting
   - After selection, they're redirected to assignment.html
   - System marks them as `hasSelectedGift: true`

### 3. **After Gift Selection (All Future Visits)**
   - Users CANNOT access gift-choice.html again
   - If they try, they'll be redirected to assignment.html with message:
     > "You have already made your gift selection! Redirecting to your assignment..."

### 4. **When Admin Regenerates Assignments**
   - All users' `hasSelectedGift` flags are reset to `false`
   - Everyone gets to select gifts again (once per regeneration)
   - This allows for re-dos if needed

## Technical Implementation

### Backend Changes

1. **User Model** (`models/User.js`)
   - Added `hasSelectedGift` field (Boolean, default: false)
   - Added `giftSelectionDate` field (Date, tracks when they selected)

2. **New API Endpoints** (`server.js`)
   - `GET /api/gift-selection/status` - Check if user can select gifts
     - Returns: `canSelectGift`, `hasSelectedGift`, `assignmentsExist`
   - `POST /api/gift-selection/complete` - Mark selection as done
     - Sets `hasSelectedGift: true` and `giftSelectionDate`

3. **Updated Endpoint** (`server.js`)
   - `POST /api/admin/assignments/regenerate` - Now resets all `hasSelectedGift` flags

### Frontend Changes

1. **gift-choice.html**
   - Added `checkGiftSelectionStatus()` function
   - Added `markGiftSelectionComplete()` function
   - Checks status before showing page
   - Marks complete after gift selection
   - Redirects appropriately based on status

## Testing the Feature

### Test Case 1: Before Assignments
```
1. Login as a regular user
2. Try to visit gift-choice.html directly
3. EXPECTED: Redirected to dashboard with "assignments not generated" message
```

### Test Case 2: First Gift Selection
```
1. Admin generates Santa assignments
2. Login as a regular user
3. Click to select gifts
4. EXPECTED: Can access gift-choice.html and select gifts
5. Complete selection
6. EXPECTED: Redirected to assignment.html and marked as hasSelectedGift=true
```

### Test Case 3: Try to Select Again
```
1. After completing gift selection (Test Case 2)
2. Try to visit gift-choice.html again
3. EXPECTED: Redirected to assignment.html with "already selected" message
```

### Test Case 4: After Regeneration
```
1. Admin regenerates assignments
2. Login as user who previously selected gifts
3. Try to visit gift-choice.html
4. EXPECTED: Can access and select gifts again (flag was reset)
```

### Test Case 5: Multiple Users
```
1. Have 3+ users
2. Admin generates assignments
3. User A selects gifts → marked as complete
4. User B selects gifts → marked as complete
5. User C hasn't selected yet → can still access
6. User A tries to access again → blocked
7. EXPECTED: Each user can only select once until regeneration
```

## Database Check

You can verify the feature in MongoDB:

```javascript
// Check who has selected gifts
db.users.find(
  { hasSelectedGift: true },
  { name: 1, hasSelectedGift: 1, giftSelectionDate: 1 }
)

// Reset all users (for testing)
db.users.updateMany(
  {},
  { $set: { hasSelectedGift: false, giftSelectionDate: null } }
)
```

## Admin Notes

- When you regenerate assignments, everyone gets to select again
- You can see who has selected gifts in the database
- If someone has issues, you can manually reset their flag:
  ```javascript
  db.users.updateOne(
    { name: "UserName" },
    { $set: { hasSelectedGift: false, giftSelectionDate: null } }
  )
  ```

## User Experience Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Actions                              │
│                                                               │
│  1. Admin generates Santa assignments                         │
│     └─> global.currentAssignments populated                   │
│     └─> All users' hasSelectedGift reset to false            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    User Actions                               │
│                                                               │
│  2. User visits gift-choice.html                              │
│     ├─> Check: Assignments exist? ✓                          │
│     ├─> Check: Already selected? ✗                           │
│     └─> ALLOW ACCESS                                         │
│                                                               │
│  3. User selects gift(s)                                      │
│     └─> Mark hasSelectedGift = true                          │
│     └─> Set giftSelectionDate = now                          │
│                                                               │
│  4. Redirect to assignment.html                               │
│     └─> Show their Secret Santa assignments                  │
│                                                               │
│  5. User tries to visit gift-choice.html again                │
│     ├─> Check: Already selected? ✓                           │
│     └─> BLOCK ACCESS, redirect to assignment.html            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

The system handles these scenarios gracefully:

1. **No assignments yet** → Redirect to dashboard with explanation
2. **Already selected** → Redirect to assignments with notification
3. **API errors** → Safe fallback to dashboard
4. **Missing token** → Redirect to login

## Benefits

✅ **Maintains Mystery**: Users only see gift selection once
✅ **Fair System**: Everyone gets one chance per assignment round
✅ **Flexible**: Admin can regenerate and reset if needed
✅ **User-Friendly**: Clear messages explain what's happening
✅ **Secure**: Backend enforces rules, frontend just provides UX

## Future Enhancements

Possible additions:
- Show selection history in profile
- Admin view of who has/hasn't selected
- Email notifications when assignments are ready
- Countdown timer for selection deadline
