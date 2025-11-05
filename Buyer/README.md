# 🛒 AgroGyaan Buyer

A modern React-based frontend application for agricultural buyers to connect directly with farmers, browse crop listings, track prices, manage orders, and communicate with sellers on the AgroGyaan platform.

## ✨ Features

### 🏪 Marketplace
- **Browse Crop Listings**: View available crops from verified farmers
- **Advanced Search & Filtering**: Filter by crop type, price range, location, and quantity
- **Farmer Profiles**: View farmer details, ratings, and verification status
- **Real-time Availability**: Check current stock and pricing
- **Organic Certification**: Filter and identify organic-certified products

### 📊 Price Tracker
- **Market Price Monitoring**: Track commodity prices in real-time
- **Price Trends**: Visualize price fluctuations over time
- **Multi-commodity Support**: Monitor prices for various agricultural products
- **Location-based Pricing**: View prices by state and district

### 📦 Order Management
- **Order History**: View all past and current orders
- **Order Status Tracking**: Monitor order progress and delivery status
- **Order Details**: Access comprehensive order information
- **Order Filtering**: Filter orders by status, date, and farmer

### 💬 Communication
- **Direct Messaging**: Chat directly with farmers
- **Real-time Communication**: Instant messaging capabilities
- **Message History**: Access past conversations
- **User Connections**: Connect with new farmers through the platform

### 🔍 Traceability
- **Supply Chain Tracking**: Track produce from farm to table
- **Farmer Information**: Access detailed farmer and farm details
- **Quality Assurance**: Verify product origin and quality
- **Transparency**: Complete visibility into the supply chain

### 🔔 Notifications
- **Order Updates**: Receive notifications for order status changes
- **Price Alerts**: Get notified about price changes
- **New Listings**: Be informed about new crop listings
- **Messages**: Notification alerts for new messages

### ⚙️ Settings
- **Profile Management**: Update personal information and preferences
- **Account Settings**: Manage account details and security
- **Notification Preferences**: Customize notification settings
- **Language Preferences**: Select preferred language

## 🛠️ Tech Stack

### Frontend Framework
- **React 19.1.1**: Latest React with modern features
- **Vite 7.1.2**: Fast build tool and development server
- **React Router DOM 7.9.1**: Client-side routing

### Additional Libraries
- **Firebase 12.4.0**: Backend services and real-time features
- **Next Themes 0.4.6**: Dark/light theme support
- **Sonner 2.0.7**: Toast notifications

## 🚀 Getting Started

**Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_BACKEND_EXP_URL=http://localhost:5000
   VITE_BACKEND_AI_URL=http://localhost:8000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```



## 🔌 API Integration

### Backend-Exp (Core Marketplace API)
- **Base URL**: `http://localhost:5000` (Development)
- **Production**: `https://backend-exp-yul4.onrender.com`
- **Endpoints Used**:
  - `/api/auth/login` - User authentication
  - `/api/auth/register` - User registration
  - `/api/users/:id` - User profile management
  - `/api/crop-listings` - Fetch crop listings
  - `/api/users/unconnected-users` - Find new connections
  - `/api/users/get-room-id` - Create chat rooms
  - `/api/users/my-rooms` - Get user's chat rooms

### Backend-AI (AI Services)
- **Base URL**: `http://localhost:8000` (Development)
- **Production**: `https://agrogyaan-b-ai.onrender.com`
- **Endpoints Used**:
  - `/api/market-price` - Market price data
  - `/api/chat` - AI chat assistant (optional)


### Authentication Flow
1. User logs in through main authentication service
2. Token and user data passed via URL parameters
3. App stores authentication data in sessionStorage
4. Token used for authenticated API requests


## 🔗 Related Services

- **Backend-Exp**: Core marketplace API (Express.js)
- **Backend-AI**: AI services and market price API (FastAPI)
- **Farmer Frontend**: Farmer-facing application
- **Equip-Seller Frontend**: Equipment seller application

## 📝 Notes

- The app runs on port **5174** by default
- Uses **TanStack Query** for efficient data fetching and caching
- **Firebase** integration for real-time features
- **shadcn/ui** components are fully customizable
- All components support dark/light themes

## 🚀 Deployment

The app can be deployed to:
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **Any static hosting**: Build output in `dist/` directory

## 📄 License

Part of the AgroGyaan platform ecosystem.

---

*Connecting buyers with farmers for a better agricultural marketplace* 🌾✨
