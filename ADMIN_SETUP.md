# Admin User Setup Guide

This document explains how to set up the first admin user for the Gift Note application.

## Setting Up the First Admin User

Since there is no self-serve admin signup functionality, you need to manually set a user as an admin in the database.

### Method 1: Using MongoDB Shell

1. Connect to your MongoDB database:
```bash
mongosh "mongodb://localhost:27017/giftnote"
```

2. Find the user you want to make admin:
```javascript
db.sellers.find({ email: "user@example.com" })
```

3. Update the user to set `isAdmin` to `true`:
```javascript
db.sellers.updateOne(
  { email: "user@example.com" },
  { $set: { isAdmin: true } }
)
```

### Method 2: Using MongoDB Compass

1. Open MongoDB Compass and connect to your database
2. Navigate to the `giftnote` database
3. Open the `sellers` collection
4. Find the user you want to make admin
5. Click on the document to edit it
6. Add or modify the `isAdmin` field to `true`
7. Save the changes

### Method 3: Using a One-Time Script

Create a temporary script `scripts/setupAdmin.js`:

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Seller from '../server/models/Seller.js';

dotenv.config();

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/giftnote');
    console.log('Connected to MongoDB');

    const email = process.argv[2]; // Get email from command line
    
    if (!email) {
      console.log('Usage: node setupAdmin.js <email>');
      process.exit(1);
    }

    const seller = await Seller.findOne({ email });
    
    if (!seller) {
      console.log('User not found with email:', email);
      process.exit(1);
    }

    seller.isAdmin = true;
    await seller.save();
    
    console.log('User set as admin successfully:', email);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

setupAdmin();
```

Run the script:
```bash
node scripts/setupAdmin.js user@example.com
```

## Important Notes

- **Security**: After setting up the first admin user, delete any temporary scripts used for this purpose
- **Access Control**: Only admin users can access the admin panel at `/admin`
- **Database**: The admin status is stored in the `isAdmin` field of the `sellers` collection
- **Verification**: After setting up, log in as the user and verify you can access `/admin`

## Removing Admin Access

To remove admin access from a user:

```javascript
db.sellers.updateOne(
  { email: "user@example.com" },
  { $set: { isAdmin: false } }
)
```

## Admin Panel Features

Once set up as admin, you can:
- View all users with their subscription status
- Search users by name or email
- View detailed user information and payment history
- Activate/renew subscriptions for users
- Add notes to payment records

Access the admin panel at: `http://localhost:5173/admin` (or your frontend URL)
