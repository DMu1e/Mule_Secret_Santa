# Password Reset Feature - Admin Guide

## Overview
The password reset feature allows you (as admin) to reset any user's password if they've forgotten it.

## How to Use

### Step 1: Access the Admin Panel
1. Login to your account (make sure you're an admin)
2. Navigate to **Gift Restrictions** page
3. You'll see a new "Password Reset" section at the top

### Step 2: Reset a User's Password
1. **Select User**: Choose the user from the dropdown menu
   - Users are listed with their names
   - Child accounts are marked as "(Child)"
   - Admin accounts are marked as "(Admin)"

2. **Enter New Password**: Type the new password
   - Must be at least 6 characters long
   - Choose something the user can remember or communicate it to them

3. **Confirm Password**: Re-type the password to confirm
   - Must match the new password exactly

4. **Click "Reset Password"**: 
   - You'll get a confirmation prompt
   - After confirming, the password is immediately changed

### Step 3: Communicate to User
- **IMPORTANT**: Make sure to tell the user their new password securely
- Options:
  - In person
  - Phone call
  - WhatsApp/SMS (use caution)
  - They can change it later in their profile settings

## Security Notes
- ✅ Only admins can reset passwords
- ✅ Passwords are hashed (encrypted) in the database
- ✅ Password changes take effect immediately
- ⚠️ Make sure to communicate new passwords securely
- ⚠️ Encourage users to change their password after reset

## Common Scenarios

### User Forgot Password
1. User contacts you saying they forgot their password
2. Go to Password Reset section
3. Select their name
4. Create a temporary password (e.g., "TempPass123")
5. Tell them the temporary password
6. Advise them to change it in their Profile settings

### User Never Set Password (Child Account)
1. Go to Password Reset section
2. Select the child user
3. Set an appropriate password for them
4. Give the password to their parent/guardian

## Troubleshooting

### "Access denied. Admin only" error
- You need to be logged in as an admin
- Check that your account has admin privileges

### Password reset successful but user can't login
- Double-check you communicated the correct password
- Make sure there are no extra spaces when typing
- Password is case-sensitive

### Can't find user in dropdown
- Make sure the server is running
- Refresh the page
- Check that the user exists in the database

## Technical Details
- **Backend Endpoint**: `POST /api/admin/reset-password`
- **Required**: Admin authentication token
- **Password Hashing**: bcrypt with 10 salt rounds
- **Minimum Password Length**: 6 characters
