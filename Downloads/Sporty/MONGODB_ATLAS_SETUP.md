# MongoDB Atlas Setup Guide

Follow these steps to set up MongoDB Atlas for the Sports Booking System:

## Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Build a database" → "FREE" (M0 Sandbox)

## Step 2: Create Cluster
1. Choose **AWS** as cloud provider
2. Select a region closest to you
3. Keep cluster name as "Cluster0" or rename to "sporty-cluster"
4. Click "Create Cluster"

## Step 3: Database Access Setup
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
   - Username: `sporty_admin`
   - Password: Generate a secure password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Network Access Setup
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (0.0.0.0/0)
   - For production, restrict to specific IPs
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://sporty_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Configure Backend
1. Create `.env` file in `/backend` directory:
   ```env
   MONGODB_URI=mongodb+srv://sporty_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sporty_booking?retryWrites=true&w=majority
   DB_NAME=sporty_booking
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

2. Replace:
   - `YOUR_PASSWORD` with the password you created
   - `cluster0.xxxxx` with your actual cluster URL
   - Add `/sporty_booking` before the `?` to specify database name

## What to Feed into the Database

The system will automatically create these collections:

### 1. Students Collection
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "rollNo": "CS2021001",
  "department": "Computer Science",
  "firebaseUID": "firebase_user_id_here",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Grounds Collection (Auto-seeded)
```json
{
  "_id": "ObjectId",
  "name": "Football Ground",
  "location": "North Campus Sports Complex",
  "slots": [
    "06:00-07:00",
    "07:00-08:00",
    "08:00-09:00",
    "16:00-17:00",
    "17:00-18:00",
    "18:00-19:00",
    "19:00-20:00"
  ],
  "description": "Full-size football field with grass surface",
  "capacity": 22,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. Bookings Collection (Created by users)
```json
{
  "_id": "ObjectId",
  "studentId": "firebase_user_id",
  "groundId": "ObjectId_of_ground",
  "date": "2024-01-15T00:00:00.000Z",
  "slot": "16:00-17:00",
  "status": "confirmed",
  "bookingReference": "BK1234567890ABC",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Testing Connection
After setup, run:
```bash
cd backend
npm install
npm run dev
```

You should see: "MongoDB Connected: cluster0-xxxxx.mongodb.net"

## Seed Sample Data
To populate grounds data:
```bash
cd backend
node scripts/seedData.js
```

This will create 5 sample sports grounds with time slots.
