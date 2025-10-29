# Secret_Santa
This is an application to randomly assign everybody a secret santa and allow them to add their wishlists.

## Setup Instructions

### Backend Setup
1. Navigate to the Backend folder:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your MongoDB connection string:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   node server.js
   ```

### Frontend Setup
1. Open any HTML file in the Frontend folder with a web browser
2. Or use a local server like Live Server in VS Code

## Database Maintenance

### Cleaning Up Orphaned Wishlists
If you delete users from the database directly, their wishlists may become orphaned. To clean them up:

**Option 1: Run the cleanup script**
```bash
cd Backend
node cleanupOrphanedWishlists.js
```

**Option 2: Use the admin API endpoint**
Make a POST request to `/api/admin/cleanup-wishlists` with admin authentication.

The application now automatically filters out orphaned wishlists, but running the cleanup script will permanently remove them from the database.

### Fixing Child User Creation Issues
If you encounter an error when trying to add multiple child users (E11000 duplicate key error on email), run this fix:

```bash
cd Backend
node fixEmailIndex.js
```

This script will update the database email index to be "sparse", which allows multiple child users to have null email addresses.

**Symptoms of this issue:**
- Can add the first child user successfully
- Second child user fails with: `E11000 duplicate key error collection: test.users index: email_1 dup key: { email: null }`

**Why this happens:**
MongoDB's unique index on the email field was created before the schema was updated to support child users. The fix drops the old index and recreates it with the `sparse: true` option.

## Targets
I am trying to write a program for secret santa
I want the program to be able to do some certain things like:

1.	Be able to input the names of all the people who will be involved in the secret santa
2.	Be able to set parameters on who can be able to gift who and who can't gift who
3.	Be able to decide how many individuals a secret santa will be able to gift
4.	Individuals involved in the secret santa should also be able to make a wish list and update it at will
5.	There should also be some anonymity as no one should be able to see who is their secret santa
6.	Secret santa should be able to view the wish list of whoever they are gifting 
7.	The parameters should be able to be set by the user as well
8.  It should be connected to a an API
9.  It should also be a web application that is updated in real time 


### Languages

## How to achieve these 

### Yet to Implement 
 next I want you to create a main page that can be accessed after logging in to the web app 
here It will Read welcome to the Mule Secret Santa (User'sname) It will also have a sidebar that can allow users to be able to access other pages such as profile, Chat between Santa and the giftee and Wishlist on the main page I want it to have this verse 2 Corinthians 9:6-8
"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver"  

I also want to have an admin user who can customise the number of people a specific person should be gifting and who the person cannot gift for example a member of their immediate family.His main page should be similar to a normal user but have the extra configuration title in the sidebar.

Only after the admin has set all the parameters and confirmed it, should the system randomly assign Santas to every user.The admin should also be able to see every users santa.The admin should also have the ability to add child users who do not have a login.

The database will have the following ID, Name, Family, no_of_giftees, Email, password.This will be known as the user Table .
