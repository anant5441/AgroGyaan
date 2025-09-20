# 🌾 Farmer Authentication Backend

A secure, production-ready Node.js authentication system specifically designed for farmers in the AGROGYAAN platform.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with detailed error responses
- **Security**: Rate limiting, CORS, helmet security headers
- **Modular Architecture**: Clean separation of concerns
- **MongoDB Integration**: Mongoose ODM with optimized schemas
- **Production Ready**: Environment-based configuration and logging

## 📁 Project Structure

```
Backend-Farmer-Auth/
├── config/
│   └── database.js          # Database connection configuration
├── controllers/
│   └── farmerController.js  # Business logic for farmer operations
├── middleware/
│   ├── authMiddleware.js    # JWT authentication middleware
│   ├── errorMiddleware.js   # Global error handling
│   └── validationMiddleware.js # Input validation rules
├── models/
│   └── Farmer.js           # Farmer data model
├── routes/
│   └── farmerRoutes.js     # API route definitions
├── utils/
│   ├── logger.js           # Logging utilities
│   ├── responseHelper.js   # Standardized API responses
│   └── validators.js       # Custom validation functions
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── server.js              # Main application entry point
└── README.md              # This file
```

## 🛠️ Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   cd Backend-Farmer-Auth
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

4. **Run the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/agrogyaan_farmers` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRES_IN` | JWT token expiration time | `1h` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `BCRYPT_ROUNDS` | Bcrypt hashing rounds | `12` |

## 📡 API Endpoints

### Public Routes

#### Register Farmer
```http
POST /api/farmer/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "farmLocation": "Punjab, India",
  "farmSize": 5.5,
  "primaryCrops": ["wheat", "rice"],
  "phoneNumber": "+91 9876543210"
}
```

#### Login Farmer
```http
POST /api/farmer/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Protected Routes (Require JWT Token)

#### Get Profile
```http
GET /api/farmer/profile
Authorization: Bearer <jwt_token>
```

#### Update Profile
```http
PUT /api/farmer/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Updated",
  "farmLocation": "Updated Location",
  "farmSize": 6.0,
  "primaryCrops": ["wheat", "rice", "corn"],
  "phoneNumber": "+91 9876543210"
}
```

#### Change Password
```http
PUT /api/farmer/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmNewPassword": "NewSecurePass456"
}
```

#### Get Statistics
```http
GET /api/farmer/stats
Authorization: Bearer <jwt_token>
```

#### Logout
```http
POST /api/farmer/logout
Authorization: Bearer <jwt_token>
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive validation and sanitization
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers for protection
- **Error Handling**: Secure error responses without sensitive data leakage

## 🧪 Testing the API

### Using cURL

1. **Register a farmer:**
   ```bash
   curl -X POST http://localhost:5000/api/farmer/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Farmer",
       "email": "test@farmer.com",
       "password": "TestPass123",
       "confirmPassword": "TestPass123",
       "farmLocation": "Test Location",
       "farmSize": 2.5
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/farmer/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@farmer.com",
       "password": "TestPass123"
     }'
   ```

3. **Get Profile (use token from login response):**
   ```bash
   curl -X GET http://localhost:5000/api/farmer/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
   ```

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL and token
3. Test each endpoint with the provided request formats

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `EMAIL_EXISTS` | Email already registered |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `ACCOUNT_DEACTIVATED` | Account has been deactivated |
| `NO_TOKEN` | No authentication token provided |
| `INVALID_TOKEN` | Token format is invalid |
| `TOKEN_EXPIRED` | Token has expired |
| `FARMER_NOT_FOUND` | Farmer not found in database |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |

## 🔄 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit sensitive data to version control
2. **Password Security**: Strong password requirements and secure hashing
3. **Token Management**: Short-lived tokens with proper expiration
4. **Input Sanitization**: All inputs are validated and sanitized
5. **Error Handling**: No sensitive information in error responses
6. **Rate Limiting**: Protection against brute force attacks
7. **HTTPS**: Use HTTPS in production (configure reverse proxy)

## 🚀 Deployment

1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up MongoDB Atlas or production MongoDB instance
3. **Security**: Enable HTTPS and configure proper CORS origins
4. **Monitoring**: Set up logging and monitoring solutions
5. **Scaling**: Consider using PM2 or Docker for process management

## 📝 Development Notes

- All passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens expire in 1 hour by default
- Database connections include proper error handling and reconnection logic
- All routes include comprehensive input validation
- Error responses are standardized and secure
- Code follows ES6+ standards with proper async/await usage

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Add proper validation for new fields
3. Include error handling for all operations
4. Update documentation for new endpoints
5. Test all changes thoroughly

---

**Built with ❤️ for the AGROGYAAN farming community**