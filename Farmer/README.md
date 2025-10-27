# 🌱 AgroGyaan Farmer Frontend

A modern React-based frontend application designed specifically for farmers, providing intelligent agricultural solutions, AI-powered insights, and comprehensive farming tools.

## 🎯 Overview

The Farmer frontend is a comprehensive agricultural platform that empowers farmers with:
- **AI-powered chat assistant** for farming queries
- **Smart crop recommendations** based on soil and weather data
- **Real-time market price tracking**
- **Organic farming guidance** with location-specific recommendations
- **Disease classification** for crop health monitoring
- **Interactive crop calendar** for planning and scheduling


### Pages & Features

#### 🏠 **Landing Page** (`/`)
- Hero section with platform introduction
- Feature showcase
- AI assistant integration
- Responsive design for all devices

#### 🤖 **AI Chat Assistant** (Global Component)
- **API Endpoints**: 
  - `POST http://localhost:8000/api/chat` - Text-only chat
  - `POST http://localhost:8000/api/chat-with-image` - Chat with image analysis
- **Features**:
  - Real-time chat interface with streaming responses
  - Image upload and analysis for crop disease detection
  - Location-aware responses with automatic detection
  - Weather data integration from OpenWeatherMap
  - Agricultural alerts and crop suggestions based on season
  - Response caching for improved performance
  - Multi-model support (Groq primary with Gemini fallback)
  - Conversation history with clear and reset options

#### 🌱 **Crop Prediction** (`/crop-prediction`)
- **NPK Prediction**: Advanced soil nutrient analysis
  - **API Endpoint**: `POST http://localhost:8000/api/predict`
  - **Input**: N, P, K levels, temperature, humidity, pH, rainfall
  - **Output**: Recommended crop with confidence score
- **Simple Prediction**: Basic crop recommendations
- **Visual Results**: Charts and confidence indicators

#### 📊 **Market Price Dashboard** (`/pricedashboard`)
- **API Endpoint**: `GET http://localhost:8000/api/market-price`
- **Features**:
  - Real-time agricultural commodity prices
  - Advanced filtering by state, district, commodity
  - Date-based filtering
  - Data visualization with charts
  - Export capabilities

#### 🌿 **Organic Farming Guide** (`/organic`)
- **API Endpoints**:
  - `GET http://localhost:8000/guide-region?location={location}` - Location-specific guide
  - `GET http://localhost:8000/guide-crop/?location={location}&crop={crop}` - Crop-specific guide
- **Features**:
  - Location detection and display
  - Personalized organic farming principles
  - Crop-specific guidance
  - Nearby organic suppliers
  - Image integration from Pixabay API

#### 📅 **Crop Calendar** (`/calendar`)
- Interactive farming calendar
- Seasonal crop planning
- Weather integration
- Planting and harvesting schedules

#### 🔍 **Disease Classifier** (`/diseaseclassifier`)
- Image-based crop disease detection
- Upload interface with drag-and-drop
- Real-time classification results
- Treatment recommendations

#### 🔐 **Authentication** (`/login`)
- Secure login interface
- Form validation
- Error handling
- Responsive design

## 🔌 API Integration

### Backend-AI Services (Port 8000)

#### 1. AI Chat Assistant (Text Only)
```javascript
// Usage in components/ai-assistant.jsx
const response = await fetch("http://localhost:8000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: message })
});
```

**Request Body:**
```json
{
  "query": "What crops should I plant in winter season?"
}
```

#### 1b. AI Chat with Image
```javascript
// Usage in components/ai-assistant.jsx
const formData = new FormData();
formData.append("query", message); // Optional query
formData.append("image", selectedImage); // Image file

const response = await fetch("http://localhost:8000/api/chat-with-image", {
  method: "POST",
  body: formData
});
```

**Response:**
```json
{
  "query": "What crops should I plant in winter season?",
  "answer": "For winter season (Rabi), consider planting wheat, barley, mustard...",
  "llm_source": "Groq (Llama 3.1)",
  "sources": ["Document: farming_guide.pdf (Page 15)"],
  "weather": {
    "location": "Delhi",
    "temperature": 22,
    "conditions": "clear sky",
    "humidity": 45
  },
  "location": {
    "city": "Delhi",
    "state": "Delhi",
    "country": "India"
  },
  "season": {
    "current_season": "Winter (Rabi Season)",
    "description": "Cold and dry season, suitable for wheat, barley, peas, and mustard"
  },
  "agricultural_alerts": ["Winter season: Protect crops from frost and cold waves"],
  "crop_suggestions": ["Wheat", "Barley", "Mustard", "Peas", "Chickpeas"]
}
```

#### 2. Market Price Data
```javascript
// Usage in pages/MarketPriceDashboard.jsx
const response = await fetch(
  `http://127.0.0.1:8000/api/market-price?${params.toString()}`
);
```

**Query Parameters:**
- `state` - Indian state name
- `district` - District name (optional)
- `commodity` - Crop/commodity name (optional)
- `arrival_date` - Date filter (optional)

**Response:**
```json
{
  "data": {
    "total": 150,
    "count": 10,
    "records": [
      {
        "state": "Maharashtra",
        "district": "Mumbai",
        "commodity": "Rice",
        "variety": "Basmati",
        "min_price": 2500,
        "max_price": 3000,
        "modal_price": 2750,
        "arrival_date": "15/12/2024"
      }
    ]
  },
  "used_date": "15/12/2024"
}
```

#### 3. Organic Farming Guide
```javascript
// Usage in components/PersonalizedGuide.jsx
const response = await fetch(
  `http://127.0.0.1:8000/guide-region?location=${encodeURIComponent(demoLocation)}`
);
```

**Response:**
```json
{
  "location": "Punjab",
  "guide": [
    {
      "icon": "🌱",
      "title": "Soil Health Management",
      "description": "Build organic matter through composting, green manure, and cover crops..."
    },
    {
      "icon": "🔄",
      "title": "Crop Rotation",
      "description": "Rotate crops to prevent soil depletion and break pest cycles..."
    }
  ]
}
```

#### 4. Crop-Specific Guide
```javascript
// Usage in components/CropGuide.jsx
const response = await fetch(
  `http://127.0.0.1:8000/guide-crop/?location=${location}&crop=${crop}`
);
```

#### 5. NPK Crop Prediction
```javascript
// Usage in pages/NPKPrediction.jsx
const response = await axios.post("http://127.0.0.1:8000/api/predict", formData);
```

**Request Body:**
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.9,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```

**Response:**
```json
{
  "predicted_crop": "Rice",
  "confidence": 0.85,
  "alternatives": ["Maize", "Sugarcane", "Wheat"],
  "reasoning": "Based on the provided soil and weather conditions..."
}
```

### External APIs

#### Pixabay API
- **Purpose**: Crop and farming images
- **Usage**: Organic farming guide image display
- **API Key**: Configured in components/CropGuide.jsx


## 🎯 Key Features

### 🤖 AI-Powered Assistance
- **Intelligent Chat**: Real-time farming advice with location awareness
- **Image Analysis**: Upload crop images for disease detection and analysis
- **Streaming Responses**: Real-time streaming of AI-generated responses
- **Context-Aware Responses**: Weather and seasonal data integration
- **Multi-Model Support**: Groq Llama 3.1 with Google Gemini fallback
- **Conversation Management**: Clear and reset conversation history

### 📊 Data Visualization
- **Interactive Charts**: Market price trends and crop data
- **Real-Time Updates**: Live data from agricultural APIs
- **Export Capabilities**: Data download in multiple formats

### 🌱 Smart Agriculture
- **Crop Recommendations**: ML-based crop suggestions
- **Soil Analysis**: NPK prediction with confidence scores
- **Disease Detection**: Image-based crop health monitoring


### Environment Configuration
Create a `.env` file in the root directory:
```env
PIXABAY_API_KEY=your_pixabay_api_key
```


## 📄 License

This project is part of the AgroGyaan platform and follows the main project license.

---

*Empowering Farmers Through Technology* 🌾✨