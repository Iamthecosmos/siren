# Siren Safety App - Setup Instructions

## 🚀 Getting Started

This is a full-stack safety application with a React frontend and Node.js backend, now fully integrated!

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration if needed

# Create upload directories
mkdir -p uploads/voices

# Start the backend server
npm run dev
# Or for production: npm start
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate to root directory (if not already there)
cd ..

# Install frontend dependencies (if not done)
npm install

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## ✨ New Features Added

### 🔐 User Authentication
- **Sign Up/Sign In**: Complete user registration and login system
- **JWT Authentication**: Secure token-based authentication
- **User Profiles**: Manage user information and verification status

### 🏘️ Community Reports
- **Report Incidents**: Users can report safety incidents with location data
- **Browse Reports**: View community-reported incidents in your area
- **Verify Reports**: Community members can verify incident reports
- **Geographic Filtering**: Find reports near your location

### 🎤 Voice Library
- **Upload Voices**: Contribute voice recordings for fake call scenarios
- **Browse Voices**: Search and filter available voices by type, gender, age
- **Rate & Review**: Community rating system for voice quality
- **Download Tracking**: Analytics for most popular voices

### 🔧 Backend Features
- **RESTful API**: Complete API for all frontend features
- **File Upload**: Secure audio file handling with validation
- **Database**: SQLite database with comprehensive schema
- **Security**: Rate limiting, input validation, CORS protection
- **Error Handling**: Structured error responses and logging

## 📱 How to Use

### For New Users:
1. **Sign Up**: Create an account to access community features
2. **Browse Reports**: View safety incidents in your area
3. **Browse Voices**: Explore available voices for fake calls
4. **Report Incidents**: Contribute to community safety by reporting incidents
5. **Upload Voices**: Help others by contributing voice recordings

### For Existing Users:
- All your previous safety features work as before
- New community features are now available
- Sign in to access full functionality

## 🔗 API Integration

The frontend now connects to the backend through:
- **Authentication API**: Login, registration, profile management
- **Reports API**: Create, read, verify community reports
- **Voices API**: Upload, browse, rate voice contributions
- **User API**: Profile management and statistics

## 🛡️ Security Features

- **JWT Authentication**: Secure user sessions
- **Input Validation**: Server-side data validation
- **File Security**: Safe audio file uploads with type checking
- **Rate Limiting**: Protection against API abuse
- **CORS Protection**: Secure cross-origin requests

## 📊 Database Schema

The backend includes tables for:
- **Users**: User accounts and profiles
- **Community Reports**: Safety incident reports
- **Voice Contributions**: User-uploaded voice recordings
- **Verifications**: Report verification tracking
- **Ratings**: Voice quality ratings
- **Sessions**: User session management

## 🚨 Emergency Features (Still Available)

All your original emergency features work exactly as before:
- Emergency SOS alerts
- Fake call functionality (now with community voices!)
- Location sharing
- Quick dial emergency services
- Danger zone alerts (now with real community data!)
- Hidden mode calculator
- Check-in timers
- Voice activation
- Shake alerts

## 📝 Environment Configuration

### Backend (.env)
```
PORT=3001
NODE_ENV=development
DATABASE_URL=./database/siren.db
JWT_SECRET=your-super-secret-jwt-key
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Siren Safety App
```

## 🔧 Development

### Running Both Servers

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### Building for Production

```bash
# Build frontend
npm run build

# Build backend (if using TypeScript)
cd server && npm run build
```

## 📚 API Documentation

Full API documentation is available in `server/README.md` with:
- Authentication endpoints
- Community reports API
- Voice contributions API
- User management API
- Request/response examples

## 🎯 Next Steps

You now have a fully integrated safety app with:
- Real user authentication
- Community-driven safety reports
- Shared voice library for fake calls
- All original emergency features enhanced with real data

The app is production-ready and can be deployed to any hosting platform!

## 🆘 Support

- Check `server/README.md` for detailed API documentation
- All frontend components are documented inline
- Error handling provides helpful messages
- Rate limiting protects against abuse

Enjoy your enhanced community safety app! 🛡️✨
