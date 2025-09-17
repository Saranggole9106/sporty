# Firebase Setup Guide

Follow these steps to set up Firebase for the Sports Booking System:

## Step 1: Create Firebase Project
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `sporty-booking-system`
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication
1. In Firebase Console, go to "Authentication" in left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider:
   - Click on Google
   - Toggle "Enable"
   - Add your email as test user
   - Click "Save"

## Step 3: Get Firebase Configuration
1. Go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (`</>`)
4. Register app name: `sporty-frontend`
5. Copy the Firebase configuration object

## Step 4: Configure Frontend
Replace the Firebase config in `/frontend/public/index.html` (around line 185):

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

## Step 5: Set up Firebase Hosting
1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in frontend directory:
   ```bash
   cd frontend
   firebase init hosting
   ```
   - Select your project
   - Set public directory as `public`
   - Configure as single-page app: `Yes`
   - Don't overwrite index.html: `No`

4. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

## Step 6: Update CORS Settings
After deployment, update the backend CORS configuration in `/backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-project.web.app',
    'https://your-project.firebaseapp.com'
  ],
  credentials: true
}));
```

## Testing Authentication
1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Open your frontend (locally or deployed)
3. Click "Sign In with Google"
4. Complete the authentication flow
5. Fill out the registration form
6. Test booking functionality

## Authorized Domains
If you get authentication errors, add your domain to authorized domains:
1. Go to Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add your deployment domain (e.g., `your-project.web.app`)

## Environment Variables for Backend
Create `/backend/.env` file:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
DB_NAME=sporty_booking
PORT=5000
NODE_ENV=development
FRONTEND_URL=https://your-project.web.app
```

## Security Rules (Optional)
For additional security, you can set up Firebase Security Rules, but for this project, the backend API handles all validation.

## Troubleshooting
- **Auth errors**: Check authorized domains in Firebase Console
- **CORS errors**: Ensure backend CORS includes your frontend URL
- **Connection errors**: Verify MongoDB Atlas IP whitelist includes your server IP
- **Deployment issues**: Check Firebase CLI is logged in with correct account
