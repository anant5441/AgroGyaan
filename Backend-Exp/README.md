# 🏪 AgroGyaan Backend-Exp - Core Marketplace API

AgroGyaan Backend-Exp is an Express.js service powering authentication, user profiles, crop listings, and lightweight user-to-user connection utilities (for chat rooms) used by the platform.

## 🎯 Overview

The Backend-Exp service provides the essential marketplace infrastructure for:
- **User Authentication & Authorization** - Secure JWT-based authentication for farmers, buyers, and suppliers
- **Crop Listing Management** - Complete CRUD operations for agricultural product listings
- **User Profile Management** - User data handling and profile updates
- **Marketplace Operations** - Core marketplace functionality and data management

### Messaging & Connections (Used by Chats)
- **Unconnected Users** - Find users not yet connected to the current user
- **Deterministic Room IDs** - Create stable room IDs for any two users
- **Room Linking** - Persist room IDs on both users to avoid duplicates


## 🔌 API Documentation

### Base URL: `http://localhost:5000`

### Deployed (Production) URL: `https://backend-exp-yul4.onrender.com`

### Authentication Endpoints

#### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "password": "securePassword123",
  "role": "farmer",
  "email": "john@example.com"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "msg": "User registered successfully",
  "user": {
    "id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "role": "farmer"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "code": "MISSING_REQUIRED_FIELDS",
  "msg": "Name, phone, password, and role are required fields"
}
```

```json
{
  "success": false,
  "code": "PHONE_ROLE_EXISTS",
  "msg": "User already exists with this phone number and role"
}
```

#### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Deployed Endpoint:** `https://backend-exp-yul4.onrender.com/api/auth/login`

**Request Body:**
```json
{
  "identifier": "9876543210",  // Phone number or email
  "password": "securePassword123",
  "role": "farmer"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "farmer",
    "language_pref": "en",
    "trust_score": 0.0
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "code": "INVALID_CREDENTIALS",
  "msg": "Invalid credentials or role mismatch"
}
```

### User Management Endpoints

#### 1. Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "farmer",
  "language_pref": "en",
  "trust_score": 0.0,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "language_pref": "hi"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "phone": "9876543210",
    "role": "farmer",
    "language_pref": "hi",
    "trust_score": 0.0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

#### 3. Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User deleted successfully",
  "user": {
    "id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Connection & Chat Endpoints

#### 1. Get Unconnected Users
```http
GET /api/users/unconnected-users?user_id=<user_id>
```

**Query Parameters:**
- `user_id` (required) - The ID of the user to find unconnected users for

**Response:**
```json
{
  "success": true,
  "unconnected_users": [
    { "id": "64a7...k9", "name": "Jane Smith", "role": "buyer" },
    { "id": "64a7...k0", "name": "Amit Kumar", "role": "farmer" }
  ],
  "metadata": {
    "total_users": 10,
    "connected_users": 3,
    "unconnected_users": 6
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "code": "MISSING_USER_ID",
  "msg": "User ID is required"
}
```

```json
{
  "success": false,
  "code": "INVALID_USER_ID",
  "msg": "Invalid user ID format"
}
```

```json
{
  "success": false,
  "code": "USER_NOT_FOUND",
  "msg": "User not found"
}
```

**Deployed Endpoint:** `https://backend-exp-yul4.onrender.com/api/users/unconnected-users?user_id=<user_id>`

#### 2. Get Room ID
```http
GET /api/users/get-room-id?id1=<user_id1>&id2=<user_id2>
```

**Query Parameters:**
- `id1` (required) - First user ID
- `id2` (required) - Second user ID

**Response:**
```json
{
  "success": true,
  "room_id": "64a7b8c9d1e2f3g4h5i6j7k8_64a7b8c9d1e2f3g4h5i6j7k9",
  "other_user": {
    "id": "64a7b8c9d1e2f3g4h5i6j7k9",
    "name": "Jane Smith",
    "role": "buyer"
  },
  "message": "Room created and stored in both users"
}
```

**Note:** This endpoint automatically creates a deterministic room ID by sorting the two user IDs lexicographically and joining them with an underscore. It also stores the room ID in both users' `rooms_id` arrays if not already present.

**Error Responses:**
```json
{
  "success": false,
  "code": "MISSING_IDS",
  "msg": "Both id1 and id2 are required"
}
```

```json
{
  "success": false,
  "code": "SAME_USER_IDS",
  "msg": "Cannot create room with same user"
}
```

```json
{
  "success": false,
  "code": "USER_NOT_FOUND",
  "msg": "One or both users not found"
}
```

**Deployed Endpoint:** `https://backend-exp-yul4.onrender.com/api/users/get-room-id?id1=<user_id1>&id2=<user_id2>`

#### 3. Add Room to Users (Manual)
```http
POST /api/users/add-room
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id1": "64a7b8c9d1e2f3g4h5i6j7k8",
  "user_id2": "64a7b8c9d1e2f3g4h5i6j7k9"
}
```

**Response:**
```json
{
  "success": true,
  "room_id": "64a7b8c9d1e2f3g4h5i6j7k8_64a7b8c9d1e2f3g4h5i6j7k9",
  "other_user": {
    "id": "64a7b8c9d1e2f3g4h5i6j7k9",
    "name": "Jane Smith",
    "role": "buyer"
  },
  "message": "Room successfully added to both users"
}
```

**Error Responses:**
```json
{
  "success": false,
  "code": "MISSING_USER_IDS",
  "msg": "Both user_id1 and user_id2 are required"
}
```

**Deployed Endpoint:** `https://backend-exp-yul4.onrender.com/api/users/add-room`

#### 4. Get My Rooms (with other user details)
```http
GET /api/users/my-rooms?user_id=<user_id>
```

**Query Parameters:**
- `user_id` (required) - The ID of the user whose rooms to fetch

**Response:**
```json
{
  "success": true,
  "rooms": [
    {
      "id": "64a7...12_64b8...9f",    
      "name": "Jane Smith",
      "role": "buyer",
      "other_user_id": "64b8...9f"
    }
  ],
  "metadata": {
    "total_rooms": 2,
    "rooms_with_details": 2
  }
}
```

**Deployed Endpoint:** `https://backend-exp-yul4.onrender.com/api/users/my-rooms?user_id=<user_id>`


### Crop Listing Endpoints

#### 1. Get All Crop Listings
```http
GET /api/crop-listings
```

**Response:**
```json
[
  {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
    "farmer_id": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "crop_name": "Rice",
    "variety": "Basmati",
    "Quantity_available_retail": 100,
    "Quantity_available_wholesale": 1000,
    "unit_retail": "kg",
    "unit_wholesale": "quintal",
    "price_per_unit_retail": 50,
    "price_per_unit_wholesale": 4500,
    "sale_type": "both",
    "organic_certified": true,
    "listing_status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### 2. Get Crop Listing by ID
```http
GET /api/crop-listings/:id
```

**Response:**
```json
{
  "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
  "farmer_id": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "crop_name": "Rice",
  "variety": "Basmati",
  "Quantity_available_retail": 100,
  "Quantity_available_wholesale": 1000,
  "unit_retail": "kg",
  "unit_wholesale": "quintal",
  "price_per_unit_retail": 50,
  "price_per_unit_wholesale": 4500,
  "sale_type": "both",
  "organic_certified": true,
  "listing_status": "active",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 3. Create Crop Listing
```http
POST /api/crop-listings
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "farmer_id": "64a7b8c9d1e2f3g4h5i6j7k8",
  "crop_name": "Wheat",
  "variety": "Durum",
  "Quantity_available_retail": 200,
  "Quantity_available_wholesale": 2000,
  "unit_retail": "kg",
  "unit_wholesale": "quintal",
  "price_per_unit_retail": 25,
  "price_per_unit_wholesale": 2200,
  "sale_type": "both",
  "organic_certified": false,
  "listing_status": "active"
}
```

**Response:**
```json
{
  "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
  "farmer_id": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "crop_name": "Wheat",
  "variety": "Durum",
  "Quantity_available_retail": 200,
  "Quantity_available_wholesale": 2000,
  "unit_retail": "kg",
  "unit_wholesale": "quintal",
  "price_per_unit_retail": 25,
  "price_per_unit_wholesale": 2200,
  "sale_type": "both",
  "organic_certified": false,
  "listing_status": "active",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 4. Update Crop Listing
```http
PUT /api/crop-listings/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "price_per_unit_retail": 30,
  "price_per_unit_wholesale": 2500,
  "Quantity_available_retail": 150
}
```

**Response:**
```json
{
  "message": "Crop listing updated successfully",
  "cropListing": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
    "farmer_id": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "crop_name": "Wheat",
    "variety": "Durum",
    "Quantity_available_retail": 150,
    "Quantity_available_wholesale": 2000,
    "unit_retail": "kg",
    "unit_wholesale": "quintal",
    "price_per_unit_retail": 30,
    "price_per_unit_wholesale": 2500,
    "sale_type": "both",
    "organic_certified": false,
    "listing_status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

#### 5. Delete Crop Listing
```http
DELETE /api/crop-listings/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Crop listing deleted successfully",
  "cropListing": {
    "id": "64a7b8c9d1e2f3g4h5i6j7k9",
    "crop_name": "Wheat",
    "farmer_id": "64a7b8c9d1e2f3g4h5i6j7k8"
  }
}
```

### System Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "✅ OK",
  "database": "✅ Connected"
}
```

#### 2. API Test
```http
GET /api/test
```

**Response:**
```json
{
  "message": "✅ API is working!",
  "version": "1.0.0"
}
```

## 🔐 Authentication & Security

### JWT Token Structure
```json
{
  "id": "64a7b8c9d1e2f3g4h5i6j7k8",
  "role": "farmer",
  "email": "john@example.com",
  "name": "John Doe",
  "iat": 1642234567,
  "exp": 1642238167
}
```

### Authorization Header
```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **farmer** - Agricultural producers
- **buyer** - Agricultural product purchasers
- **supplier** - Equipment and supply providers

### Security Features
- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access** - Different permissions for different user types
- **Input Validation** - Request data validation and sanitization
- **CORS Protection** - Cross-origin resource sharing configuration

## 📊 Data Models

### User Model
```javascript
{
  name: String (required),
  email: String (optional, sparse unique),
  phone: String (required, 10 digits),
  password_hash: String (required),
  role: String (required, enum: ['farmer', 'buyer', 'supplier']),
  language_pref: String (default: 'en'),
  trust_score: Number (default: 0.0),
  createdAt: Date,
  updatedAt: Date
}
```

### CropListing Model
```javascript
{
  farmer_id: ObjectId (required, ref: 'Farmer'),
  crop_name: String (required),
  variety: String (optional),
  Quantity_available_retail: Number,
  Quantity_available_wholesale: Number,
  unit_retail: String (enum: ['kg', 'quintal', 'ton']),
  unit_wholesale: String (enum: ['kg', 'quintal', 'ton']),
  price_per_unit_retail: Number,
  price_per_unit_wholesale: Number,
  sale_type: String (required, enum: ['retail', 'wholesale', 'both']),
  organic_certified: Boolean (default: false),
  listing_status: String (enum: ['active', 'sold'], default: 'active'),
  createdAt: Date,
  updatedAt: Date
}
```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URL=mongodb://localhost:27017/agrogyaan

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here


### Database Connection
The application automatically connects to MongoDB on startup. Ensure MongoDB is running and the connection string is correct in your environment variables.

### Error Handling
The application includes comprehensive error handling:
- **404 Errors** - Route not found
- **Validation Errors** - Input validation failures
- **Authentication Errors** - Invalid or missing tokens
- **Database Errors** - MongoDB connection and query errors



*Powering the Future of Agricultural Commerce* 🌾✨
