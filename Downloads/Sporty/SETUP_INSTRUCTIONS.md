# Complete Setup Instructions

## Campus Sports Ground Booking System

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Firebase project
- Git

---

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create free account and cluster

2. **Configure Database Access**
   - Create database user with read/write permissions
   - Note down username and password

3. **Configure Network Access**
   - Add your IP address (or 0.0.0.0/0 for development)

4. **Get Connection String**
   - Copy the connection string from Atlas
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sporty_booking?retryWrites=true&w=majority`

---

## Step 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Edit `/backend/.env` file
   - Replace `MONGODB_URI` with your Atlas connection string
   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/sporty_booking?retryWrites=true&w=majority
   DB_NAME=sporty_booking
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Seed sample data**
   ```bash
   node scripts/seedData.js
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```
   - Server should start on http://localhost:5000
   - You should see "MongoDB Connected" message

---

## Step 3: Firebase Setup

1. **Create Firebase Project**
   - Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Create new project: `sporty-booking-system`

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable Google provider
   - Add your email as test user

3. **Get Firebase Configuration**
   - Go to Project Settings
   - Add web app: `sporty-frontend`
   - Copy the config object

4. **Configure Frontend**
   - Edit `/frontend/public/index.html`
   - Replace the Firebase config (around line 185):
   ```javascript
   const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
   };
   ```

---

## Step 4: Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start frontend server**
   ```bash
   npm start
   ```
   - Frontend should open at http://localhost:3000

---

## Step 5: Testing the System

1. **Backend Health Check**
   - Visit http://localhost:5000/health
   - Should return: `{"status": "OK", "message": "Sports Booking API is running"}`

2. **API Endpoints Test**
   - GET http://localhost:5000/api/grounds (should return 5 sample grounds)
   - POST http://localhost:5000/api/students/register (test with sample data)

3. **Frontend Testing**
   - Open http://localhost:3000
   - Click "Sign In with Google"
   - Complete registration form
   - Test booking flow

---

## Step 6: Deployment (Optional)

### Firebase Hosting
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**
   ```bash
   firebase login
   cd frontend
   firebase init hosting
   ```

3. **Deploy**
   ```bash
   firebase deploy
   ```

### Backend Deployment Options
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Simple Node.js hosting
- **DigitalOcean**: VPS deployment
- **AWS/GCP**: Cloud platform deployment

---

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check connection string format
- Verify username/password
- Ensure IP whitelist includes your address
- Check network connectivity

**Firebase Auth Not Working**
- Verify Firebase config is correct
- Check authorized domains in Firebase Console
- Ensure Google provider is enabled

**CORS Errors**
- Verify FRONTEND_URL in backend .env
- Check browser console for specific errors
- Ensure backend server is running

**Port Already in Use**
- Change PORT in backend .env file
- Kill existing processes: `lsof -ti:5000 | xargs kill -9`

### Support
- Check logs in terminal for detailed error messages
- Verify all environment variables are set correctly
- Test API endpoints individually using Postman/curl
- Check Firebase Console for authentication issues

---

## Project Structure Overview

```
sporty/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── config/          # Database configuration
│   ├── scripts/         # Data seeding
│   ├── server.js        # Main server file
│   └── .env            # Environment variables
├── frontend/
│   ├── public/
│   │   ├── index.html   # Main HTML file
│   │   ├── app.js       # Frontend JavaScript
│   │   └── styles.css   # Styling
│   └── firebase.json    # Firebase config
├── docs/
│   ├── schema-diagrams/ # Database documentation
│   ├── survey/          # User feedback surveys
│   └── presentation/    # Project presentation
└── README.md           # Project overview
```

## Next Steps After Setup

1. **Customize the system**
   - Add more sports grounds
   - Modify time slots
   - Update department list

2. **Enhance features**
   - Add mobile app
   - Implement recurring bookings
   - Add payment integration

3. **Monitor and maintain**
   - Set up logging and monitoring
   - Regular database backups
   - User feedback collection

**System is now ready for use! 🎉**
