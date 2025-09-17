# Campus Sports Ground Booking System

A complete booking system for campus sports facilities with MongoDB backend and Firebase frontend.

## Architecture

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: HTML/CSS/JavaScript + Firebase Authentication
- **Database**: MongoDB with collections for students, grounds, and bookings
- **Authentication**: Firebase Auth (Google sign-in)
- **Deployment**: Firebase Hosting

## Project Structure

```
sporty/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── firebase.json
│   └── package.json
└── docs/
    ├── schema-diagrams/
    ├── survey/
    └── presentation/
```

## Features

- Student authentication via Firebase
- Real-time slot availability checking
- Booking validation (prevent double bookings)
- Dynamic UI updates
- MongoDB persistence
- Firebase hosting deployment

## Setup Instructions

### Backend Setup
1. Navigate to backend directory
2. Install dependencies: `npm install`
3. Set up MongoDB connection
4. Start server: `npm start`

### Frontend Setup
1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Configure Firebase credentials
4. Deploy: `firebase deploy`

## API Endpoints

- `POST /book` - Create new booking
- `GET /availability` - Get available slots for ground and date

## Database Schema

### Students Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string", 
  "rollNo": "string",
  "department": "string"
}
```

### Grounds Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "location": "string",
  "slots": ["array of time slots"]
}
```

### Bookings Collection
```json
{
  "_id": "ObjectId",
  "studentId": "string",
  "groundId": "ObjectId",
  "date": "Date",
  "slot": "string",
  "status": "string"
}
```
