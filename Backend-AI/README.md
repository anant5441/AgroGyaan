# AgroGyaan Backend-AI

## ✨ Features

### 🤖 AI-Powered Chat Assistant
- **Multi-Model Support**: Primary Groq (Llama 3.1) with Gemini fallback
- **Document-Based Knowledge**: RAG (Retrieval-Augmented Generation) using FAISS vector store
- **Location Awareness**: Automatic location detection and weather integration
- **Seasonal Intelligence**: Context-aware responses based on current agricultural seasons
- **Agricultural Alerts**: Smart alerts based on weather conditions and seasonal patterns
- **Crop Suggestions**: Personalized crop recommendations based on location and season

### 📊 Market Price API
- Real-time agricultural commodity prices from data.gov.in
- Filter by state, district, commodity, and arrival date
- Comprehensive market data for informed decision making

### 🌿 Organic Farming Guide
- Location-specific organic farming principles
- AI-generated guides using Google Gemini
- Structured recommendations with icons and descriptions

### 🌤️ Weather & Location Services
- Automatic IP-based location detection
- Real-time weather data integration
- Seasonal agricultural context


## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Chat Assistant
```http
POST /api/chat
Content-Type: application/json

{
  "query": "What crops should I plant in winter season?"
}
```

**Response:**
```json
{
  "query": "What crops should I plant in winter season?",
  "answer": "For winter season (Rabi), consider planting wheat, barley, mustard, peas, and chickpeas...",
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
```http
GET /api/market-price?state=Maharashtra&district=Mumbai&commodity=Rice
```

**Response:**
```json
{
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
}
```

#### 3. Organic Farming Guide
```http
GET /guide-region?location=Punjab
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

#### 4. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

## 🧠 AI Models & Technologies

### Primary AI Stack
- **Groq (Llama 3.1-8b-instant)**: Primary language model for chat responses
- **Google Gemini Pro**: Fallback model for enhanced responses
- **HuggingFace Embeddings**: Document vectorization using sentence-transformers
- **FAISS**: Vector database for document similarity search

### External APIs
- **Geoapify**: IP-based location detection
- **OpenWeatherMap**: Real-time weather data
- **Data.gov.in**: Indian agricultural market price data

### Caching & Performance
- **Response Caching**: 24-hour cache for improved performance
- **Document Chunking**: Optimized text splitting for better retrieval
- **Similarity Thresholding**: Cosine similarity filtering for relevant documents

## 📁 Project Structure

### Core Components

#### `main.py`
- FastAPI application setup
- CORS middleware configuration
- Router registration
- Health check endpoints

#### `routes/main_chatbot/chat.py`
- Core chat processing logic
- Location detection and weather integration
- AI model orchestration (Groq + Gemini)
- Document retrieval and RAG implementation
- Response caching system
- Agricultural alerts and crop suggestions

#### `routes/Farming_Guide/guide.py`
- Organic farming guide generation
- Location-specific recommendations
- Google Gemini integration for structured responses

#### `routes/marketprice_router.py`
- Market price data fetching
- Data.gov.in API integration
- Flexible filtering options


## 🔄 Workflow

1. **Query Processing**: User query received via API
2. **Location Detection**: Automatic IP-based location detection
3. **Weather Integration**: Real-time weather data fetching
4. **Document Retrieval**: FAISS-based similarity search
5. **AI Processing**: Multi-model response generation
6. **Response Enhancement**: Agricultural alerts and crop suggestions
7. **Caching**: Response stored for future queries
8. **API Response**: Structured JSON response sent to client


### Testing

```bash
# Run the application
python main.py

# Test endpoints using curl or Postman
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is organic farming?"}'
```


## 📈 Performance Optimization

- **Response Caching**: Reduces API calls and improves response time
- **Document Chunking**: Optimized text splitting for better retrieval
- **Model Fallback**: Ensures high availability with multiple AI providers
- **Location Caching**: Reduces redundant location detection calls

