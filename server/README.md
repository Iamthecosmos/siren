# Siren Safety Backend Server 🚨

A comprehensive backend server for the Siren safety app, handling community safety reports and user-contributed voice library with authentication, file uploads, and moderation.

## 🚀 Features

### Core Functionality
- **Community Safety Reports**: Location-based incident reporting with verification system
- **Voice Contributions**: User-uploaded voice library for fake call scenarios
- **User Authentication**: JWT-based secure authentication system
- **File Management**: Audio file uploads with validation and processing
- **Moderation System**: Content approval and community verification
- **Geographic Filtering**: Location-based data retrieval and filtering

### Security & Performance
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **File Security**: Safe file upload handling
- **CORS Protection**: Cross-origin request security
- **Error Handling**: Structured error responses
- **Database Security**: SQL injection prevention

## 📋 Prerequisites

- Node.js 16+ 
- SQLite 3
- npm/yarn package manager

## 🛠️ Installation

1. **Clone and navigate to server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Create upload directories**
```bash
mkdir -p uploads/voices
```

5. **Initialize database**
```bash
npm run migrate
```

6. **Start development server**
```bash
npm run dev
```

## 🔧 Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=./database/siren.db

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Settings
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads
MAX_VOICE_DURATION=300  # 5 minutes
ALLOWED_AUDIO_FORMATS=mp3,wav,m4a,ogg

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "username": "johnsmith"
}
```

---

## 📍 Community Reports Endpoints

### Get Reports
```http
GET /api/reports?page=1&limit=20&type=theft&severity=high&lat=40.7128&lng=-74.0060&radius=10&since=2024-01-01T00:00:00Z
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `type` (optional): Incident type (theft, assault, harassment, etc.)
- `severity` (optional): Severity level (low, medium, high, critical)
- `lat`, `lng` (optional): Geographic filtering coordinates
- `radius` (optional): Search radius in km (default: 10)
- `since` (optional): ISO date string for time filtering

### Create Report
```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Theft at Main Street Park",
  "description": "Witnessed phone theft near the playground area around 3 PM",
  "incidentType": "theft",
  "severity": "medium",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "Main Street Park, 123 Main St",
  "timestamp": "2024-01-15T15:00:00Z",
  "witnessCount": "1-2",
  "policeNotified": true,
  "photos": ["photo1.jpg", "photo2.jpg"]
}
```

### Get Specific Report
```http
GET /api/reports/{reportId}
```

### Verify Report
```http
POST /api/reports/{reportId}/verify
Authorization: Bearer <token>
```

### Get Reports by Area
```http
GET /api/reports/area/{lat}/{lng}?radius=5
```

---

## 🎤 Voice Contributions Endpoints

### Get Voice Library
```http
GET /api/voices?page=1&limit=20&type=emergency&gender=female&ageRange=adult&language=en&sort=rating
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `type`: Voice type (emergency, casual, professional, family, custom)
- `gender`: Gender (male, female, non-binary, other)
- `ageRange`: Age range (child, teen, adult, senior)
- `language`: Language code (en, es, fr, etc.)
- `sort`: Sort order (recent, popular, rating, downloads)

### Upload Voice
```http
POST /api/voices
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "voiceFile": <audio file>,
  "title": "Emergency Mom Voice",
  "description": "Concerned mother calling about safety",
  "voiceType": "emergency",
  "gender": "female",
  "ageRange": "adult",
  "accent": "American",
  "language": "en"
}
```

**Supported Audio Formats:** MP3, WAV, M4A, OGG
**Max File Size:** 10MB
**Max Duration:** 5 minutes

### Get Specific Voice
```http
GET /api/voices/{voiceId}
```

### Rate Voice
```http
POST /api/voices/{voiceId}/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent quality and very realistic"
}
```

### Track Download
```http
POST /api/voices/{voiceId}/download
```

### Get User's Voices
```http
GET /api/voices/user/{userId}
```

---

## 👥 User Management Endpoints (Admin Only)

### Get Users List
```http
GET /api/users?page=1&limit=20&search=john&verified=true
Authorization: Bearer <admin-token>
```

### Get User Profile
```http
GET /api/users/{userId}
```

### Verify/Unverify User
```http
PUT /api/users/{userId}/verify
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "verified": true
}
```

### Grant/Revoke Admin
```http
PUT /api/users/{userId}/admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "admin": true
}
```

### Platform Statistics
```http
GET /api/users/stats/overview
Authorization: Bearer <admin-token>
```

---

## 📊 Database Schema

### Users Table
```sql
- id (INTEGER PRIMARY KEY)
- uuid (TEXT UNIQUE)
- username (TEXT UNIQUE)
- email (TEXT UNIQUE)
- password_hash (TEXT)
- full_name (TEXT)
- avatar_url (TEXT)
- is_verified (BOOLEAN)
- is_admin (BOOLEAN)
- created_at (DATETIME)
- updated_at (DATETIME)
- last_login (DATETIME)
```

### Community Reports Table
```sql
- id (INTEGER PRIMARY KEY)
- uuid (TEXT UNIQUE)
- user_id (INTEGER FOREIGN KEY)
- title (TEXT)
- description (TEXT)
- incident_type (TEXT)
- severity (TEXT)
- latitude (REAL)
- longitude (REAL)
- address (TEXT)
- timestamp (DATETIME)
- reported_at (DATETIME)
- is_verified (BOOLEAN)
- verification_count (INTEGER)
- status (TEXT)
- photos_json (TEXT)
- witness_count (TEXT)
- police_notified (BOOLEAN)
```

### Voice Contributions Table
```sql
- id (INTEGER PRIMARY KEY)
- uuid (TEXT UNIQUE)
- user_id (INTEGER FOREIGN KEY)
- title (TEXT)
- description (TEXT)
- voice_type (TEXT)
- gender (TEXT)
- age_range (TEXT)
- accent (TEXT)
- language (TEXT)
- file_path (TEXT)
- file_size (INTEGER)
- duration (REAL)
- format (TEXT)
- is_approved (BOOLEAN)
- is_featured (BOOLEAN)
- download_count (INTEGER)
- rating_average (REAL)
- rating_count (INTEGER)
```

## 🔒 Security Features

### Input Validation
- Email format validation
- Password strength requirements
- File type and size validation
- Geographic coordinate validation
- Text length and content validation

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable window and limits
- Different limits for different endpoints

### File Security
- MIME type validation
- File size limits
- Secure file storage
- Virus scanning ready

### Authentication Security
- JWT with expiration
- Password hashing with bcrypt
- Session management
- Permission-based access control

## 🚀 Deployment

### Production Environment
```bash
# Set production environment
NODE_ENV=production

# Use strong JWT secret
JWT_SECRET=your-super-secure-production-secret

# Configure proper CORS origins
ALLOWED_ORIGINS=https://yourdomain.com

# Set up proper file storage
UPLOAD_PATH=/var/uploads

# Configure rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📈 Monitoring & Health Checks

### Health Check Endpoint
```http
GET /health
```

Returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### API Documentation Endpoint
```http
GET /api
```

## 🛡️ Error Handling

### Standard Error Response
```json
{
  "error": "Validation failed",
  "message": "Please check your input data", 
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ for community safety by the Siren team.
