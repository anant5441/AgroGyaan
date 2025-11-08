# 🌾 AGROGYAAN - Crop Farmer Solution

## Overview
A comprehensive digital platform designed to revolutionize agriculture by connecting farmers, buyers, and equipment suppliers through advanced technology and data-driven insights. The platform provides intelligent crop management, market connectivity, and essential farming tools in a user-friendly interface.

## 🎯 Project Vision
To empower farmers with smart agricultural solutions, facilitate direct market access, and create a sustainable ecosystem that benefits all stakeholders in the agricultural value chain.

## 🏗️ Getting Started

**AI Backend (FastAPI):**
```bash
cd Backend-AI
pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
```

**Backend (Express.js):**
```bash
cd Backend-Exp
npm install
npm start
# Runs on http://localhost:5000
```


**Farmer Frontend:**
```bash
cd Farmer
npm install
npm run dev
# Runs on http://localhost:5173
```

**Buyer Frontend:**
```bash
cd Buyer
npm install
npm run dev
# Runs on http://localhost:5174
```

**Equipment Seller Frontend:**
```bash
cd Equip-Seller
npm install
npm run dev
# Runs on http://localhost:5175
```

### Environment Configuration
Create `.env` files in each backend directory with required environment variables:
- MongoDB connection strings
- JWT secrets
- API keys for external services (OpenWeatherMap, Geoapify, Groq, Google Gemini)

### Development Workflow
1. Start MongoDB service
2. Run all backend services (AI, Core, Auth)
3. Run frontend applications
4. Access the platform through respective URLs

## 👥 User Roles & Features

### 1. 🌱 Farmer
The core user of the platform with access to comprehensive farming solutions:

#### Smart Farming Features:
- **Crop Recommendation/Planning**: AI-driven suggestions based on:
  - Weather forecasts
  - Soil analysis and predictions
  - Area-specific crop suitability
- **Yield Prediction**: Advanced analytics for harvest estimation
- **Disease Prediction**: Early warning system for crop diseases
- **Soil Prediction**: Soil health analysis and recommendations
- **Weather Check**: Real-time and forecast weather data
- **Price Tracker**: Live market prices for various crops
- **Labour Scheduling**: Workforce management and planning tools

#### Community & Support:
- **Community Farmer**: Connect with fellow farmers
- **General Chatbot**: 24/7 AI assistance for farming queries
- **Organic Farming Guide**: Comprehensive organic cultivation guidance

### 2. 🛒 Buyer
Connects directly with farmers for fresh produce procurement:

#### Marketplace Features:
- **Buyer Listing**: Browse and purchase directly from farmers
- **Advanced Filtering**: Filter crops by:
  - Crop type
  - Price range
  - Location
  - Quantity available
- **Direct Communication**: Chat directly with farmers
- **Quality Assurance**: Verified farmer profiles and product quality

### 3. 🚜 Equipment Shopkeeper
Specialized marketplace for agricultural equipment and machinery:

#### Equipment Management:
- **Equipment Listing**: Showcase machinery and tools for sale
- **Direct Farmer Communication**: Chat with farmers for equipment needs
- **Inventory Management**: Manage equipment stock and availability
- **Technical Support**: Provide equipment guidance and support

## 🔐 Authentication System

### Signup Process
- **Email/Mobile**: Flexible registration options
- **Password Security**: Secure password with confirmation
- **Role Selection**: Choose from Farmer, Buyer, or Equipment Shopkeeper
- **Username**: Unique identifier for platform interaction

### Login System
- **Multi-option Login**: Email or mobile number
- **Secure Authentication**: Password-protected access
- **Role-based Redirection**: Customized dashboard based on user role

## 📱 App Features

### Core Functionality:
- **🌐 Multilingual Support**: Access in multiple regional languages
- **🎤 Voice Navigation**: Hands-free platform interaction
- **⚙️ Settings**: Personalized user preferences and configurations

### Smart Features:
- **📋 Plantation Guide**: Step-by-step crop cultivation instructions
- **💬 Farmer Forum**: Community discussion and knowledge sharing
- **📊 Crop Price Tracker**: Real-time market price monitoring
- **🚨 Alert System**: Notifications for:
  - Weather warnings
  - Price fluctuations
  - Disease outbreaks
  - Market opportunities
- **🌿 Organic Farming Guide**: Sustainable farming practices
- **🌤️ Weather Tracker**: Comprehensive weather monitoring
- **🧪 Pesticides Information**: Safe and effective pesticide usage guidelines

## 🆕 Latest Features & Services

### AI-Powered Services (Backend-AI):
- **🤖 Intelligent Chat Assistant**: 
  - Multi-model AI support (Groq Llama 3.1 + Google Gemini 2.5 Pro)
  - RAG-based knowledge retrieval using Pinecone vector database
  - Location-aware responses with automatic IP detection
  - Utilizes current location's weather data for context-aware answers
  - Seasonal agricultural intelligence and crop suggestions
  - 24/7 availability with response caching for performance
  - Image-based disease detection using Gemini Vision
  - Text-to-Speech audio generation with multi-language support

- **📊 Advanced Market Price API**:
  - Real-time agricultural commodity prices from data.gov.in
  - Advanced filtering by state, district, commodity, and date
  - Comprehensive market data for informed decision making

- **🌿 Dynamic Organic Farming Guide**:
  - Location-specific organic farming principles
  - AI-generated guides using Google Gemini
  - Structured recommendations with visual icons and descriptions

- **🌤️ Smart Weather & Location Services**:
  - Automatic IP-based location detection via Geoapify
  - Real-time weather data integration with OpenWeatherMap
  - Seasonal agricultural context and alerts

### ML Models & Predictions:
- **🌱 Crop Recommendation System**:
  - Trained Logistic Regression model for crop suggestions
  - Optimized model with hyperparameter tuning
  - Feature scaling and normalization for accurate predictions

- **🧪 Soil Nutrient Prediction (NPK)**:
  - Advanced soil analysis and nutrient recommendations
  - NPK (Nitrogen, Phosphorus, Potassium) prediction models

- **🔍 Disease Classification**:
  - Image-based crop disease detection
  - Early warning system for disease prevention

### Enhanced User Experience:
- **📱 Modern UI/UX**:
  - React 19 with latest Vite build system
  - shadcn/ui component library (48+ components)
  - Tailwind CSS with custom animations
  - Responsive design for all devices

- **⚡ Performance Optimizations**:
  - TanStack Query for efficient data fetching
  - Response caching in AI services
  - Optimized bundle sizes with Vite
  - Lazy loading and code splitting

### Security & Authentication:
- **🔐 Multi-tier Authentication**:
  - Dedicated farmer authentication service
  - JWT-based secure authentication
  - Rate limiting and security headers
  - Input validation and sanitization

- **🛡️ Production-Ready Security**:
  - Helmet security middleware
  - CORS configuration
  - Error handling and logging
  - Environment-based configuration

## 🛠️ Technical Architecture & Tech Stack

### Frontend Technologies:
- **Framework**: React.js 19.1.1 with Vite 7.1.2
- **UI Library**: Tailwind CSS 3.4.17 with shadcn/ui components
- **State Management**: React Context API & TanStack Query 5.87+
- **Routing**: React Router DOM 7.8+
- **Form Handling**: React Hook Form 7.62+ with Zod validation
- **Animations**: Framer Motion 12.23+ & Tailwind Animate
- **Charts**: Recharts 2.15+ for data visualization
- **Icons**: Lucide React 0.543+

### Backend Technologies:

#### Core Marketplace Backend (Backend-Exp):
- **Server Framework**: Node.js with Express.js 5.1.0
- **Database**: MongoDB 6.19+ with Mongoose 8.18+ ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs 3.0.2
- **API Architecture**: RESTful APIs with CORS support
- **Connection Management**: User-to-user connection utilities for chat rooms
- **Environment**: ES Modules with dotenv 17.2+

#### Farmer Authentication Service (Backend-Farmer-Auth):
- **Server Framework**: Node.js with Express.js 4.18.2
- **Security**: Helmet 7.1.0, express-rate-limit 7.1.5
- **Validation**: express-validator 7.0.1
- **Authentication**: JWT with bcryptjs 2.4.3
- **Logging**: Custom logger utilities

#### AI & ML Services (Backend-AI):
- **Framework**: FastAPI (Python)
- **AI Models**: 
  - **Primary LLM**: Groq (Llama 3.1-8b-instant)
  - **Fallback LLM**: Google Gemini 2.5 Pro
  - **Embeddings**: Google Generative AI (text-embedding-004)
  - **Image Analysis**: Google Gemini Vision API
- **Vector Database**: Pinecone for scalable RAG implementation
- **Caching**: 24-hour response caching system with MD5 hashing
- **Audio Services**: Google Text-to-Speech (gTTS) with multi-language support
- **Document Processing**: Optimized text chunking (1000 chars, 200 overlap) and similarity search

### Database & Storage:
- **Primary Database**: MongoDB with Mongoose ODM
- **Vector Storage**: Pinecone cloud vector database for document similarity
- **File Storage**: Local cache for ML models and responses
- **Model Storage**: Pickle files for trained ML models
- **User Connections**: MongoDB rooms_id arrays for chat room management

### AI/ML & Analytics:
- **Machine Learning Framework**: Python with Scikit-learn
- **Trained Models**: 
  - Crop recommendation model (Logistic Regression)
  - Optimized crop prediction model
  - Soil nutrient (NPK) prediction
- **Data Processing**: Pandas, NumPy for data manipulation
- **Model Training**: Jupyter notebooks for model development
- **RAG System**: Pinecone-based document retrieval with cosine similarity (0.5 threshold)
- **Audio Generation**: Text-to-Speech conversion with 12+ language support
- **Image Processing**: Gemini Vision API for crop disease detection and plant identification

### External APIs & Integrations:
- **Weather Data**: OpenWeatherMap API for real-time weather
- **Location Services**: Geoapify API for IP-based location detection
- **Market Data**: Data.gov.in API for Indian agricultural prices
- **AI Services**: 
  - Groq API for Llama 3.1 model
  - Google Gemini API for enhanced responses and image analysis
  - Google Generative AI for embeddings (text-embedding-004)
  - Pinecone API for vector database operations
  - Google Text-to-Speech (gTTS) for audio generation

### Development & Build Tools:
- **Frontend Build**: Vite with ESLint 9.33+
- **Package Management**: npm with package-lock.json
- **Code Quality**: ESLint with React hooks plugin
- **Styling**: PostCSS 8.5+ with Autoprefixer
- **Development**: Nodemon 3.1+ for backend development

### Deployment & Configuration:
- **Environment**: Node.js ES Modules
- **Configuration**: Environment variables with dotenv
- **CORS**: Cross-origin resource sharing enabled
- **Error Handling**: Centralized error middleware
- **Logging**: Custom logging utilities for production

## 🚀 Key Benefits

### For Farmers:
- Increased crop yield through data-driven decisions
- Direct market access without intermediaries
- Reduced farming risks through predictive analytics
- Community support and knowledge sharing
- Cost optimization through smart resource planning

### For Buyers:
- Direct access to fresh produce from verified farmers
- Transparent pricing and quality assurance
- Reduced supply chain costs
- Support for local farming communities
- Traceability of produce from farm to table

### For Equipment Suppliers:
- Direct access to farmer customer base
- Efficient inventory management system
- Enhanced customer support capabilities
- Market insights and demand forecasting


## 🌍 Social Impact

- **Sustainable Agriculture**: Promoting eco-friendly farming practices
- **Economic Empowerment**: Improving farmer income and market access
- **Food Security**: Ensuring efficient food distribution systems
- **Knowledge Transfer**: Sharing agricultural expertise and best practices
- **Rural Development**: Supporting rural communities through technology


## 📞 Support & Community

- **Help Center**: Comprehensive documentation and FAQs
- **Community Forum**: Peer-to-peer support and discussions
- **Customer Support**: 24/7 technical assistance and platform guidance
- **Training Programs**: Educational resources for platform adoption
- **Multilingual Support**: Customer service in regional languages

## 📁 Project Architecture

### System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Farmer App  │  Buyer App  │  Equip-Seller App                  │
│  (React 19)  │  (React 19) │  (React 19)                        │
└──────┬────────┬────────────┬────────────────────────────────────┘
       │        │            │
       │        │            │
       ▼        ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐           │
│  │   Backend-Exp        │    │   Backend-AI         │           │
│  │   (Express.js)       │    │   (FastAPI)          │           │
│  │                      │    │                      │           │
│  │  • Auth & Users      │    │  • AI Chat           │           │
│  │  • Crop Listings     │    │  • Image Analysis    │           │
│  │  • Connections       │    │  • Audio TTS         │           │
│  │  • Chat Rooms        │    │  • Market Prices     │           │
│  │                      │    │  • Crop Prediction   │           │
│  └──────────┬───────────┘    └──────────┬───────────┘           │
│             │                          │                        │
└─────────────┼──────────────────────────┼────────────────────────┘
              │                          │
              ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA & STORAGE LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐           │
│  │   MongoDB            │    │   Pinecone           │           │
│  │   (Primary DB)       │    │   (Vector DB)        │           │
│  │                      │    │                      │           │
│  │  • Users             │    │  • Document          │           │
│  │  • Listings          │    │    Embeddings        │           │
│  │  • Orders            │    │  • RAG Search        │           │
│  │  • Chat Rooms        │    │                      │           │
│  └──────────────────────┘    └──────────────────────┘           │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐           │
│  │   ML Models          │    │   Cache Storage      │           │
│  │   (Pickle Files)     │    │   (Local Files)      │           │
│  │                      │    │                      │           │
│  │  • Crop Prediction   │    │  • Response Cache    │           │
│  │  • NPK Analysis      │    │  • Model Cache       │           │
│  └──────────────────────┘    └──────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
              │                          │
              ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  • Groq API (Llama 3.1)       • Google Gemini API               │
│  • Google Generative AI        • Pinecone API                   │
│  • OpenWeatherMap API          • Geoapify API                   │
│  • Data.gov.in API            • Google TTS (gTTS)               │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment URLs

- **Backend-AI**: https://agrogyaan-b-ai.onrender.com/
- **Backend-Exp**: https://backend-exp-yul4.onrender.com

### Current Folder Structure
```
AgroGyaan/
│
├── Farmer/                             # 🌱 Farmer Frontend Application
│   ├── src/
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── ui/                     # shadcn/ui components (48+ components)
│   │   │   ├── navbar.jsx              # Navigation component
│   │   │   ├── hero-section.jsx        # Landing page hero
│   │   │   ├── features-section.jsx    # Feature showcase
│   │   │   ├── ai-assistant.jsx        # AI chat interface
│   │   │   └── footer.jsx              # Footer component
│   │   ├── pages/                      # Application pages
│   │   │   ├── Index.jsx               # Landing page
│   │   │   ├── Login.jsx               # Authentication
│   │   │   ├── CropCalender.jsx        # Crop calendar
│   │   │   ├── OrganicFarmingGuide.jsx # Organic farming guidance
│   │   │   ├── DiseaseClassifier.jsx   # Disease detection
│   │   │   ├── MarketPriceDashboard.jsx # Price tracking
│   │   │   ├── CropPrediction.jsx      # AI crop recommendations
│   │   │   ├── NPKPrediction.jsx       # Soil nutrient prediction
│   │   │   └── SimplePrediction.jsx    # Basic predictions
│   │   ├── contexts/                   # React contexts
│   │   │   └── ThemeContext.jsx        # Theme management
│   │   ├── hooks/                      # Custom React hooks
│   │   ├── lib/                        # Utility functions
│   │   ├── App.jsx                     # Main app component
│   │   └── main.jsx                    # React entry point
│   ├── package.json                    # Dependencies (React 19, Vite, Tailwind)
│   └── vite.config.js                  # Vite configuration
│
├── Buyer/                              # 🛒 Buyer Frontend Application
│   ├── src/
│   │   ├── components/                 # UI components
│   │   │   ├── ui/                     # shadcn/ui components (48 components)
│   │   │   ├── DashboardLayout.jsx     # Main dashboard layout
│   │   │   ├── DashboardOverview.jsx   # Dashboard overview
│   │   │   └── Footer.jsx              # Footer component
│   │   ├── pages/                      # Buyer-specific pages
│   │   │   ├── Index.jsx               # Landing page
│   │   │   ├── Marketplace.jsx         # Product marketplace
│   │   │   ├── Orders.jsx              # Order management
│   │   │   ├── PriceTracker.jsx        # Price monitoring
│   │   │   ├── Traceability.jsx        # Supply chain tracking
│   │   │   ├── Messages.jsx            # Communication
│   │   │   ├── Settings.jsx            # User settings
│   │   │   └── Notifications.jsx       # Notification center
│   │   ├── contexts/                   # React contexts
│   │   ├── hooks/                      # Custom hooks
│   │   ├── lib/                        # Utilities
│   │   ├── App.jsx                     # Main app component
│   │   └── main.jsx                    # Entry point
│   ├── package.json                    # Dependencies (React 19, Vite, Tailwind)
│   └── vite.config.js                  # Vite configuration
│
├── Equip-Seller/                       # 🚜 Equipment Seller Frontend
│   ├── src/
│   │   ├── components/                 # UI components
│   │   │   ├── ui/                     # shadcn/ui components (49 components)
│   │   │   ├── Dashboard_Layout.jsx    # Main layout
│   │   │   ├── Header.jsx              # Header component
│   │   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   │   └── Footer.jsx              # Footer
│   │   ├── pages/                      # Equipment seller pages
│   │   │   ├── DashboardOverview.jsx   # Dashboard
│   │   │   ├── AddEquipment.jsx        # Add equipment
│   │   │   ├── ViewEquipment.jsx       # Equipment management
│   │   │   ├── Orders.jsx              # Order processing
│   │   │   ├── Notifications.jsx       # Notifications
│   │   │   └── SellerProfile.jsx       # Profile management
│   │   ├── contexts/                   # React contexts
│   │   ├── hooks/                      # Custom hooks
│   │   ├── lib/                        # Utilities
│   │   ├── styles/                     # Custom styles
│   │   ├── App.jsx                     # Main app component
│   │   └── main.jsx                    # Entry point
│   ├── package.json                    # Dependencies (React 19, Vite, Tailwind)
│   └── vite.config.js                  # Vite configuration
│
├── Backend-AI/                         # 🤖 AI & ML Services (FastAPI)
│   ├── main.py                         # FastAPI application entry point
│   ├── routes/                         # API route modules
│   │   ├── main_chatbot/               # AI Chatbot services
│   │   │   ├── chat_router.py          # Chat API endpoints
│   │   │   ├── chat.py                 # Core chat logic & AI models
│   │   │   ├── image_processor.py      # Image analysis & audio generation
│   │   │   ├── data/                   # Training data
│   │   │   └── cache/                  # Response cache storage
│   │   ├── crop_recommendation_router.py # Crop recommendation API
│   │   ├── marketprice_router.py       # Market price data API
│   │   └── organicguide_router.py      # Organic farming guide API
│   ├── services/                       # Business logic services
│   │   ├── Crop_Recommendation/        # Crop recommendation service
│   │   │   └── crop_service.py         # ML model service
│   │   └── Farming_Guide/              # Farming guidance service
│   │       └── guide.py                # Guide generation logic
│   ├── cache/                          # Response caching
│   └── README.md                       # AI backend documentation
│
├── Backend-Exp/                        # 🏪 Core Marketplace Backend (Express.js)
│   ├── server.js                       # Express application entry point
│   ├── config/                         # Configuration files
│   │   └── database.js                 # MongoDB connection
│   ├── models/                         # Database models
│   │   ├── User.js                     # User model (with rooms_id array)
│   │   ├── Farmer.js                   # Farmer profile model
│   │   ├── Buyer.js                    # Buyer profile model
│   │   ├── Supplier.js                 # Supplier profile model
│   │   ├── CropListing.js              # Crop listing model
│   │   ├── EquipmentListing.js         # Equipment listing model
│   │   ├── Order.js                    # Order management model
│   │   ├── EquipmentOrder.js           # Equipment order model
│   │   ├── Chat.js                     # Chat/messaging model
│   │   ├── ForumPost.js                # Forum posts model
│   │   ├── MarketPrice.js              # Market price model
│   │   ├── Notification.js             # Notifications model
│   │   └── Payment.js                  # Payment model
│   ├── routes/                         # API routes
│   │   ├── auth.js                     # Authentication routes
│   │   ├── cropListings.js             # Crop listing routes
│   │   └── users.js                    # User management & connection routes
│   ├── controllers/                    # Route controllers
│   │   ├── authController.js           # Authentication logic
│   │   ├── cropListingController.js    # Crop listing management
│   │   ├── userController.js           # User management
│   │   └── connectionController.js    # Connection & chat room management
│   ├── middleware/                     # Express middleware
│   │   ├── authMiddleware.js           # JWT authentication
│   │   ├── errorMiddleware.js          # Error handling
│   │   └── validationMiddleware.js     # Input validation
│   └── package.json                    # Dependencies (Express, MongoDB)
│
│
├── Model/                              # 🧠 ML Models & Training Data
│   └── Crop_Recommendation/            # Crop recommendation models
│       ├── crop_prediction_model.pkl   # Trained ML model
│       ├── optimized_crop_model.pkl    # Optimized model
│       ├── best_params.pkl             # Best hyperparameters
│       ├── scaler.pkl                  # Data scaler
│       ├── feature_names.pkl           # Feature names
│       ├── crop_labels.pkl             # Crop label mappings
│       ├── Crop_recommendation.csv     # Training dataset
│       ├── Crop-Recommendation-Model-Logistic-Regression.ipynb # Training notebook
│       └── Logistic_Regression_Model_Testing.ipynb # Testing notebook
│
├── requirements.txt                    # Python dependencies for AI backend
├── package-lock.json                   # Root package lock file
└── README.md                           # Project documentation
```


*Empowering Agriculture Through Technology* 🌾✨