from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from typing import TypedDict, List, Optional
from dotenv import load_dotenv
import os
import sys
import logging
import requests
import json
from datetime import datetime
import google.generativeai as genai
import hashlib
import pickle
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

# Configuration
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PDF_DIR = os.path.join(BASE_DIR, "data")
FAISS_DIR = os.path.join(BASE_DIR, "vector_store", "chat_db_faiss")
CACHE_DIR = os.path.join(BASE_DIR, "cache")
GROQ_MODEL = "llama-3.1-8b-instant"
COSINE_THRESHOLD = 0.5
CACHE_EXPIRY_HOURS = 24  # Cache expiry time in hours



# Define state
class AgentState(TypedDict):
    query: str
    documents: Optional[FAISS]
    answer: str
    source_documents: List[Document]
    weather_data: dict
    user_location: dict
    llm_source: str
    error: Optional[str]
    needs_location: bool
    agricultural_alerts: List[str]
    crop_suggestions: List[str]

# Initialize components
def initialize_components():
    """Initialize all required components"""
    # Create data directory if it doesn't exist
    if not os.path.exists(PDF_DIR):
        os.makedirs(PDF_DIR)
        logger.info(f"Created {PDF_DIR} directory. Please add your PDF files there.")
    
    # Create cache directory if it doesn't exist
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR)
        logger.info(f"Created {CACHE_DIR} directory for caching.")
    
    # Create vector store if it doesn't exist
    if not os.path.exists(FAISS_DIR):
        create_vector_store_from_pdfs()

def load_pdf_documents():
    """Load PDF documents from directory"""
    try:
        loader = DirectoryLoader(
            PDF_DIR,
            glob='*.pdf',
            loader_cls=PyPDFLoader
        )
        documents = loader.load()
        logger.info(f"Loaded {len(documents)} documents from {PDF_DIR}")
        return documents
    except Exception as e:
        logger.error(f"Error loading PDF documents: {str(e)}")
        return []

def create_chunks(documents):
    """Split documents into chunks"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    return text_splitter.split_documents(documents)

def get_embedding_model():
    """Initialize embedding model"""
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )

def create_vector_store_from_pdfs():
    """Create and persist FAISS vector store from PDFs"""
    try:
        documents = load_pdf_documents()
        if not documents:
            logger.warning("No documents found to create vector store")
            return None
            
        chunks = create_chunks(documents)
        embedding_model = get_embedding_model()
        
        vector_store = FAISS.from_documents(
            documents=chunks, 
            embedding=embedding_model
        )
        vector_store.save_local(FAISS_DIR)
        logger.info(f"Created FAISS vector store with {len(chunks)} chunks")
        return vector_store
    except Exception as e:
        logger.error(f"Error creating vector store: {str(e)}")
        return None

def load_vector_store():
    """Load existing FAISS vector store"""
    try:
        embedding_model = get_embedding_model()
        vector_store = FAISS.load_local(
            FAISS_DIR,
            embeddings=embedding_model,
            allow_dangerous_deserialization=True
        )
        logger.info("Loaded existing FAISS vector store")
        return vector_store
    except Exception as e:
        logger.error(f"Error loading vector store: {str(e)}")
        return None

def get_vector_store():
    """Get or create vector store"""
    if os.path.exists(FAISS_DIR):
        return load_vector_store()
    else:
        return create_vector_store_from_pdfs()

def get_groq_llm():
    """Initialize Groq LLM"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    
    return ChatGroq(
        temperature=0.3,
        groq_api_key=api_key,
        model_name=GROQ_MODEL,
        max_tokens=200  # Reduced to ensure concise answers
    )

def get_gemini_model():
    """Initialize Gemini model for fallback"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-pro")
    except Exception as e:
        raise ValueError(f"Failed to initialize Gemini model: {str(e)}")

def detect_user_location():
    """Detect user's location using Geoapify API"""
    try:
        api_key = os.getenv("GEOAPIFY_API_KEY")
        if not api_key:
            return {"error": "GEOAPIFY_API_KEY not found in environment variables"}
        
        # Get IP-based location
        url = f"https://api.geoapify.com/v1/ipinfo?apiKey={api_key}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            location_data = {
                "city": data.get("city", {}).get("name", "Unknown"),
                "country": data.get("country", {}).get("name", "Unknown"),
                "state": data.get("state", {}).get("name", "Unknown"),
                "latitude": data.get("location", {}).get("latitude"),
                "longitude": data.get("location", {}).get("longitude"),
                "detected_via": "IP geolocation"
            }
            logger.info(f"Detected location: {location_data['city']}, {location_data['state']}")
            return location_data
        else:
            error_msg = f"Failed to detect location: HTTP {response.status_code}"
            logger.error(error_msg)
            return {"error": error_msg}
    except Exception as e:
        error_msg = f"Location detection error: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

def get_weather_data(latitude, longitude, location_name):
    """Get current weather data for a location"""
    try:
        api_key = os.getenv("OPENWEATHER_API_KEY")
        if not api_key:
            return {"error": "OPENWEATHER_API_KEY not found in environment variables"}
        
        # Use coordinates if available, otherwise fall back to location name
        if latitude and longitude:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={api_key}&units=metric"
        else:
            url = f"https://api.openweathermap.org/data/2.5/weather?q={location_name}&appid={api_key}&units=metric"
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            weather_data = {
                "location": data.get("name", location_name),
                "temperature": data["main"].get("temp", "N/A"),
                "feels_like": data["main"].get("feels_like", "N/A"),
                "humidity": data["main"].get("humidity", "N/A"),
                "conditions": data["weather"][0].get("description", "N/A"),
                "wind_speed": data["wind"].get("speed", "N/A"),
                "pressure": data["main"].get("pressure", "N/A"),
                "visibility": data.get("visibility", "N/A")
            }
            logger.info(f"Weather data retrieved for {weather_data['location']}")
            return weather_data
        else:
            error_msg = f"Failed to get weather data: HTTP {response.status_code}"
            logger.error(error_msg)
            return {"error": error_msg}
    except Exception as e:
        error_msg = f"Weather API error: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

def get_seasonal_info():
    """Get current season information for agricultural context"""
    current_month = datetime.now().month
    
    # Define seasons for agricultural context
    if current_month in [12, 1, 2]:
        season = "Winter (Rabi Season)"
        description = "Cold and dry season, suitable for wheat, barley, peas, and mustard"
    elif current_month in [3, 4, 5]:
        season = "Summer (Pre-Monsoon)"
        description = "Hot and dry season, suitable for summer crops like fodder crops and vegetables"
    elif current_month in [6, 7, 8, 9]:
        season = "Monsoon (Kharif Season)"
        description = "Rainy season, suitable for rice, sugarcane, cotton, and jowar"
    else:  # [10, 11]
        season = "Post-Monsoon (Harvest/Transition)"
        description = "Harvest season transitioning to winter crops"
    
    return {
        "current_season": season,
        "description": description,
        "month": current_month
    }

def needs_location_detection(query):
    """Determine if query needs location detection"""
    location_keywords = [
        "weather", "temperature", "forecast", "rain", "sunny", 
        "humidity", "climate", "local", "here", "my area", "region",
        "location", "where am i", "my location", "this area"
    ]
    
    crop_keywords = [
        "crop", "crops", "farming", "agriculture", "planting", 
        "cultivation", "grow", "growing", "plant", "harvest"
    ]
    
    query_lower = query.lower()
    
    # Always detect location for weather/temperature queries
    if any(keyword in query_lower for keyword in location_keywords):
        return True
    
    # Detect location for crop-related queries that mention location
    if any(keyword in query_lower for keyword in crop_keywords):
        if "my" in query_lower or "here" in query_lower or "this" in query_lower:
            return True
    
    return False

def extract_location_from_query(query):
    """Extract location from query if explicitly mentioned"""
    query_lower = query.lower()
    
    # First, check for special phrases that should NOT be treated as locations
    special_phrases = ["current location", "my location", "here", "this area", "my area"]
    if any(phrase in query_lower for phrase in special_phrases):
        return None
    
    # Pattern 1: Common location indicators followed by location
    location_indicators = ["in ", "at ", "near ", "around ", "for ", "of "]
    
    for indicator in location_indicators:
        if indicator in query_lower:
            # Extract the words after the indicator
            parts = query_lower.split(indicator)
            if len(parts) > 1:
                # Take the next 1-2 words as potential location
                potential_words = parts[1].split()[:2]
                potential_location = " ".join(potential_words)
                # Check if it's not a special phrase
                if len(potential_location) > 2 and potential_location.lower() not in special_phrases:
                    return potential_location.title()
    
    # Pattern 2: Direct weather/temperature queries about a place
    weather_patterns = [
        "temperature of ",
        "weather in ",
        "weather at ",
        "weather of ",
        "forecast for ",
        "humidity in ",
        "rain in "
    ]
    
    for pattern in weather_patterns:
        if pattern in query_lower:
            parts = query_lower.split(pattern)
            if len(parts) > 1:
                potential_words = parts[1].split()[:2]
                potential_location = " ".join(potential_words)
                # Check if it's not a special phrase
                if len(potential_location) > 2 and potential_location.lower() not in special_phrases:
                    return potential_location.title()
    
    # Pattern 3: Check for common Indian city names anywhere in query
    cities = ["delhi", "mumbai", "chennai", "kolkata", "bangalore", "hyderabad", 
                "pune", "jaipur", "ahmedabad", "lucknow", "kanpur", "nagpur", 
                "indore", "thane", "bhopal", "visakhapatnam", "patna", "ludhiana",
                "agra", "nashik", "faridabad", "meerut", "rajkot", "varanasi",
                "srinagar", "amritsar", "allahabad", "howrah", "gwalior", "jodhpur",
                "raipur", "kota", "chandigarh", "mysore", "bareilly", "guwahati",
                "jammu", "hubli", "solapur", "trivandrum", "kochi", "coimbatore",
                "madurai", "jabalpur", "asansol", "dhanbad", "vellore", "ajmer",
                "kolhapur", "shillong", "ulhasnagar", "jamnagar", "sangli", "bhilai",
                "guntur", "amravati", "noida", "bhagalpur", "warangal", "ranchi",
                "kurnool", "gurgaon", "gurugram", "nanded", "dehradun", "durgapur",
                "ajmer", "kakinada", "nellore", "tiruchirappalli", "ujjain", "muzaffarnagar",]
    
    for city in cities:
        if city in query_lower:
            return city.title()
    
    return None

def is_poor_answer(answer):
    """Check if the answer from Groq is unsatisfactory"""
    if not answer or answer.strip() == "":
        return True
        
    poor_indicators = [
        "i don't know",
        "i don't have information",
        "not found in the documents",
        "no information provided",
        "based on the documents, i cannot",
        "the documents do not contain",
        "i'm sorry, i cannot",
        "i'm unable to",
        "i don't have enough information",
        "based on my knowledge",
        "not mentioned in the context",
        "the context doesn't provide"
    ]
    
    answer_lower = answer.lower()
    
    # Check for short or vague answers
    if len(answer.split()) < 5:
        return True
    
    # Check for poor indicators
    return any(indicator in answer_lower for indicator in poor_indicators)

def truncate_answer(answer, max_words=150):
    """Truncate answer to specified word count while ensuring complete sentences"""
    words = answer.split()
    if len(words) <= max_words:
        return answer
    
    # Truncate to max_words
    truncated = " ".join(words[:max_words])
    
    # Find the last complete sentence
    last_period = truncated.rfind('.')
    last_question = truncated.rfind('?')
    last_exclamation = truncated.rfind('!')
    
    # Find the last sentence ending
    last_end = max(last_period, last_question, last_exclamation)
    
    if last_end > 0:
        # Return up to the last complete sentence
        return truncated[:last_end + 1]
    else:
        # If no sentence ending found, just return the truncated text
        return truncated

def remove_redundancies(answer):
    """Remove common redundant phrases from answers"""
    redundancies = [
        "based on the information provided",
        "according to the documents",
        "as mentioned in the context",
        "to answer your question",
        "in summary",
        "to put it simply",
        "let me explain",
        "I should mention that",
        "it's important to note that"
    ]
    
    for phrase in redundancies:
        answer = answer.replace(phrase, "")
    
    # Clean up extra spaces
    return " ".join(answer.split())

def generate_groq_answer(query, context_docs, location_data, weather_data, season_info, agricultural_alerts, crop_suggestions):
    """Generate answer using Groq LLM with context and location/weather data"""
    try:
        llm = get_groq_llm()
        
        # Prepare context from documents
        context_text = ""
        if context_docs:
            context_text = "\n\n".join([doc.page_content[:500] for doc in context_docs[:2]])  # Limit context length
        
        # Prepare location and weather context
        location_context = ""
        if location_data and "error" not in location_data:
            location_context = f"User's Location: {location_data.get('city', 'Unknown')}, {location_data.get('state', 'Unknown')}, {location_data.get('country', 'Unknown')}"
        
        weather_context = ""
        if weather_data and "error" not in weather_data:
            weather_context = f"Current Weather: {weather_data.get('temperature', 'N/A')}°C, {weather_data.get('conditions', 'N/A')}, Humidity: {weather_data.get('humidity', 'N/A')}%"
        
        season_context = f"Current Season: {season_info.get('current_season', 'N/A')} - {season_info.get('description', '')}"
        
        # Prepare agricultural context
        agricultural_context = ""
        if agricultural_alerts:
            agricultural_context = f"Agricultural Alerts: {', '.join(agricultural_alerts)}"
        
        crop_context = ""
        if crop_suggestions:
            crop_context = f"Crop Suggestions: {', '.join(crop_suggestions)}"
        
        # Create enhanced prompt with emphasis on conciseness
        prompt_template = PromptTemplate(
            input_variables=["query", "context", "location", "weather", "season", "alerts", "crops"],
            template="""
            You are an expert agricultural assistant. Provide concise, practical answers (max 150 words).

            CONTEXT FROM DOCUMENTS:
            {context}

            ADDITIONAL INFORMATION:
            {location}
            {weather}
            {season}
            {alerts}
            {crops}

            QUESTION: {query}

            INSTRUCTIONS:
            1. Answer based on the context when possible
            2. Incorporate location, weather, and seasonal information
            3. Be concise and practical (under 150 words)
            4. Focus on actionable advice
            5. If context doesn't fully answer, provide general agricultural advice
            6. For crop recommendations, suggest specific crops based on location, weather and season
            7. Always mention the location and weather conditions in your response
            8. Include relevant agricultural alerts and crop suggestions if available

            ANSWER:
            """
        )
        
        prompt = prompt_template.format(
            query=query,
            context=context_text,
            location=location_context,
            weather=weather_context,
            season=season_context,
            alerts=agricultural_context,
            crops=crop_context
        )
        
        # Generate response
        response = llm.invoke(prompt)
        answer = response.content.strip()
        
        # Apply conciseness filters
        answer = remove_redundancies(answer)
        answer = truncate_answer(answer, 150)
        
        return answer
        
    except Exception as e:
        logger.error(f"Groq API error: {str(e)}")
        raise Exception(f"Failed to generate answer with Groq: {str(e)}")

def generate_gemini_answer(query, context_docs, location_data, weather_data, season_info, agricultural_alerts, crop_suggestions):
    """Generate fallback answer using Gemini"""
    try:
        model = get_gemini_model()
        
        # Prepare context from documents
        context_text = ""
        if context_docs:
            context_text = "\n\n".join([doc.page_content[:500] for doc in context_docs[:2]])  # Limit context length
        
        # Prepare location and weather context
        location_context = ""
        if location_data and "error" not in location_data:
            location_context = f"User's Location: {location_data.get('city', 'Unknown')}, {location_data.get('state', 'Unknown')}, {location_data.get('country', 'Unknown')}"
        
        weather_context = ""
        if weather_data and "error" not in weather_data:
            weather_context = f"Current Weather: {weather_data.get('temperature', 'N/A')}°C, {weather_data.get('conditions', 'N/A')}, Humidity: {weather_data.get('humidity', 'N/A')}%"
        
        season_context = f"Current Season: {season_info.get('current_season', 'N/A')} - {season_info.get('description', '')}"
        
        # Prepare agricultural context
        agricultural_context = ""
        if agricultural_alerts:
            agricultural_context = f"Agricultural Alerts: {', '.join(agricultural_alerts)}"
        
        crop_context = ""
        if crop_suggestions:
            crop_context = f"Crop Suggestions: {', '.join(crop_suggestions)}"
        
        # Create prompt with emphasis on conciseness
        prompt = f"""
        You are an expert agricultural assistant. Provide concise, practical answers (max 150 words).

        CONTEXT FROM DOCUMENTS:
        {context_text}

        ADDITIONAL INFORMATION:
        {location_context}
        {weather_context}
        {season_context}
        {agricultural_context}
        {crop_context}

        QUESTION: {query}

        INSTRUCTIONS:
        1. Answer based on the context when possible
        2. Incorporate location, weather, and seasonal information
        3. Be concise and practical (under 150 words)
        4. Focus on actionable advice
        5. If context doesn't fully answer, provide general agricultural advice
        6. For crop recommendations, suggest specific crops based on location, weather and season
        7. Always mention the location and weather conditions in your response
        8. Include relevant agricultural alerts and crop suggestions if available

        ANSWER:
        """
        
        # Generate response
        response = model.generate_content(prompt)
        answer = response.text.strip()
        
        # Apply conciseness filters
        answer = remove_redundancies(answer)
        answer = truncate_answer(answer, 150)
        
        return answer
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        raise Exception(f"Failed to generate answer with Gemini: {str(e)}")

def retrieve_relevant_documents(vector_store, query, threshold=0.5):
    """Retrieve relevant documents using similarity search with threshold"""
    try:
        # Get embedding model
        embedding_model = get_embedding_model()
        
        # Embed the query
        embedded_query = embedding_model.embed_query(query)
        
        # Perform similarity search
        docs_and_scores = vector_store.similarity_search_with_score_by_vector(
            embedded_query, k=5
        )
        
        # Filter by threshold
        filtered_docs = [doc for doc, score in docs_and_scores if score >= threshold]
        logger.info(f"Retrieved {len(filtered_docs)} relevant documents")
        return filtered_docs
        
    except Exception as e:
        logger.error(f"Error retrieving documents: {str(e)}")
        return []

def handle_special_queries(query, location_data, weather_data):
    """Handle special queries like location and weather directly"""
    query_lower = query.lower()
    
    # Extract location from query first
    extracted_location = extract_location_from_query(query)
    
    # Handle pure weather queries (without crop/agriculture context)
    weather_terms = ["weather", "temperature", "forecast", "rain", "sunny", "humidity"]
    is_weather_query = any(term in query_lower for term in weather_terms)
    is_agricultural_query = any(term in query_lower for term in ["crop", "plant", "grow", "agriculture", "farming"])
    
    # Special handling for "current location", "my location", etc.
    special_location_phrases = ["current location", "my location", "here", "this area", "my area"]
    is_special_location_query = any(phrase in query_lower for phrase in special_location_phrases)
    
    # If it's a special location query (like "current location")
    if is_special_location_query and is_weather_query and not is_agricultural_query:
        if weather_data and "error" not in weather_data:
            # Use detected location weather
            location = weather_data.get('location', 'your area')
            temp = weather_data.get('temperature', 'N/A')
            conditions = weather_data.get('conditions', 'N/A')
            humidity = weather_data.get('humidity', 'N/A')
            return f"Current weather in {location}: {temp}°C, {conditions}, Humidity: {humidity}%."
        else:
            return "I couldn't retrieve weather data for your location. Please ensure your OPENWEATHER_API_KEY is set correctly."
    
    # If it's a weather query for a specific extracted location
    elif extracted_location and is_weather_query and not is_agricultural_query:
        # Get weather for the extracted location
        weather_data_for_location = get_weather_data(None, None, extracted_location)
        if weather_data_for_location and "error" not in weather_data_for_location:
            location = weather_data_for_location.get('location', extracted_location)
            temp = weather_data_for_location.get('temperature', 'N/A')
            conditions = weather_data_for_location.get('conditions', 'N/A')
            humidity = weather_data_for_location.get('humidity', 'N/A')
            return f"Weather in {location}: {temp}°C, {conditions}, Humidity: {humidity}%."
        else:
            return f"Could not retrieve weather data for {extracted_location}."
    
    # If it's a weather query without agricultural context but no specific location
    elif is_weather_query and not is_agricultural_query and not extracted_location:
        if weather_data and "error" not in weather_data:
            # Use detected location weather
            location = weather_data.get('location', 'your area')
            temp = weather_data.get('temperature', 'N/A')
            conditions = weather_data.get('conditions', 'N/A')
            humidity = weather_data.get('humidity', 'N/A')
            return f"Current weather in {location}: {temp}°C, {conditions}, Humidity: {humidity}%."
        else:
            return "I couldn't retrieve weather data. Please ensure your OPENWEATHER_API_KEY is set correctly."
    
    # Handle pure location queries (without crop context)
    location_only_terms = ["location", "where am i", "my location", "this area"]
    if any(term in query_lower for term in location_only_terms) and not is_agricultural_query:
        if location_data and "error" not in location_data:
            return f"Your current location is {location_data.get('city', 'Unknown')}, {location_data.get('state', 'Unknown')}, {location_data.get('country', 'Unknown')}."
        else:
            return "I couldn't determine your location. Please ensure your GEOAPIFY_API_KEY is set correctly."
    
    return None

# ===== RESPONSE CACHING IMPLEMENTATION =====
def get_query_hash(query, location_data, weather_data):
    """Generate a unique hash for the query and context"""
    # Create a string representation of the query and context
    context_str = f"{query}_{location_data.get('city', '')}_{weather_data.get('temperature', '')}"
    
    # Generate MD5 hash
    return hashlib.md5(context_str.encode()).hexdigest()

def check_cache(query_hash):
    """Check if response is in cache and still valid"""
    cache_file = os.path.join(CACHE_DIR, f"{query_hash}.pkl")
    
    if not os.path.exists(cache_file):
        return None
    
    # Check if cache is expired
    cache_time = os.path.getmtime(cache_file)
    current_time = datetime.now().timestamp()
    cache_age_hours = (current_time - cache_time) / 3600
    
    if cache_age_hours > CACHE_EXPIRY_HOURS:
        os.remove(cache_file)  # Remove expired cache
        return None
    
    # Load cached response
    try:
        with open(cache_file, 'rb') as f:
            cached_data = pickle.load(f)
        logger.info("Response retrieved from cache")
        return cached_data
    except Exception as e:
        logger.error(f"Error reading cache: {str(e)}")
        return None

def save_to_cache(query_hash, response_data):
    """Save response to cache"""
    try:
        cache_file = os.path.join(CACHE_DIR, f"{query_hash}.pkl")
        with open(cache_file, 'wb') as f:
            pickle.dump(response_data, f)
        logger.info("Response saved to cache")
    except Exception as e:
        logger.error(f"Error saving to cache: {str(e)}")

# ===== AGRICULTURAL ENHANCEMENTS =====
def get_agricultural_alerts(weather_data, season_info):
    """Generate agricultural alerts based on weather conditions and season"""
    alerts = []
    
    if "error" in weather_data:
        return alerts
    
    # Temperature-based alerts
    temp = weather_data.get('temperature', 0)
    if isinstance(temp, (int, float)):
        if temp > 35:
            alerts.append("High temperature alert: Consider irrigation and shading for crops")
        elif temp < 10:
            alerts.append("Low temperature alert: Protect sensitive crops from cold stress")
    
    # Humidity-based alerts
    humidity = weather_data.get('humidity', 0)
    if isinstance(humidity, (int, float)):
        if humidity > 80:
            alerts.append("High humidity alert: Watch for fungal diseases in crops")
        elif humidity < 30:
            alerts.append("Low humidity alert: Increased irrigation may be needed")
    
    # Weather condition alerts
    conditions = weather_data.get('conditions', '').lower()
    if 'rain' in conditions or 'shower' in conditions:
        alerts.append("Rain alert: Good for irrigation but watch for waterlogging")
    if 'storm' in conditions or 'cyclone' in conditions:
        alerts.append("Storm alert: Protect crops from wind damage")
    if 'drought' in conditions or 'dry' in conditions:
        alerts.append("Drought alert: Implement water conservation measures")
    
    # Seasonal alerts
    season = season_info.get('current_season', '')
    if 'Winter' in season:
        alerts.append("Winter season: Protect crops from frost and cold waves")
    if 'Monsoon' in season:
        alerts.append("Monsoon season: Ensure proper drainage to prevent waterlogging")
    if 'Summer' in season:
        alerts.append("Summer season: Increase irrigation frequency for crops")
    
    return alerts

def get_crop_suggestions(location_data, weather_data, season_info):
    """Get crop suggestions based on location, weather and season"""
    suggestions = []
    
    if "error" in weather_data or "error" in location_data:
        return suggestions
    
    # Get location details
    state = location_data.get('state', '').lower()
    season = season_info.get('current_season', '')
    temp = weather_data.get('temperature', 0)
    
    # Winter crops (Rabi season)
    if 'Winter' in season:
        suggestions.extend(["Wheat", "Barley", "Mustard", "Peas", "Chickpeas"])
        if state in ['punjab', 'haryana', 'uttar pradesh']:
            suggestions.extend(["Potato", "Onion", "Garlic"])
    
    # Monsoon crops (Kharif season)
    elif 'Monsoon' in season:
        suggestions.extend(["Rice", "Maize", "Cotton", "Soybean", "Groundnut"])
        if state in ['maharashtra', 'karnataka', 'andhra pradesh']:
            suggestions.extend(["Sugarcane", "Turmeric", "Pulses"])
    
    # Summer crops
    elif 'Summer' in season:
        suggestions.extend(["Millets", "Vegetables", "Fodder crops"])
        if isinstance(temp, (int, float)) and temp < 35:
            suggestions.extend(["Cucumber", "Bottle Gourd", "Bitter Gourd"])
    
    # Post-monsoon transition crops
    else:
        suggestions.extend(["Vegetables", "Pulses", "Oilseeds"])
        if state in ['tamil nadu', 'kerala']:
            suggestions.extend(["Banana", "Coconut", "Spices"])
    
    # Limit to top 5 suggestions
    return suggestions[:5]
def is_agricultural_query(query):
    """Determine if the query is related to agriculture"""
    agricultural_keywords = [
        "crop", "crops", "farming", "agriculture", "plant", "plants", "harvest",
        "soil", "fertilizer", "irrigation", "pesticide", "cultivation", "grow",
        "growing", "farm", "farmer", "yield", "season", "monsoon", "rabi", "kharif",
        "vegetable", "fruit", "grain", "cereal", "pulse", "oilseed", "horticulture",
        "animal husbandry", "livestock", "dairy", "poultry", "fishery", "aquaculture",
        "weather", "rain", "temperature", "climate", "drought", "flood", "monsoon", "storm",
        "soil health", "crop rotation", "organic farming", "sustainable agriculture",
        "agroforestry", "permaculture", "greenhouse", "hydroponics", "aquaponics",
        "agricultural practices", "agricultural technology", "precision farming",
        "smart farming", "vertical farming", "urban farming", "agricultural research",
        "agricultural policy", "agricultural economics", "food security", "rural development",
        "agricultural extension", "agricultural education", "agricultural marketing","sow",
        "wheat","rice","maize","millet","barley","sugarcane","cotton","soybean","groundnut","mustard",
        "peas","chickpeas","potato","onion","garlic","turmeric","pulses"
    ]
    
    query_lower = query.lower()
    
    # Check for agricultural keywords
    if any(keyword in query_lower for keyword in agricultural_keywords):
        return True
    
    # Check if it's a location/weather query (which we handle in our system)
    location_weather_keywords = [
        "weather", "temperature", "forecast", "rain", "humidity", "climate",
        "location", "where am i", "my location", "this area"
    ]
    
    if any(keyword in query_lower for keyword in location_weather_keywords):
        return True
    
    return False

def handle_non_agricultural_query(query):
    """Handle queries that are not related to agriculture"""
    return {
        "query": query,
        "answer": "Unfortunately, Question is not seems related to farming category. I'm an agricultural assistant specialized in farming and related topics. Please ask me questions related to agriculture.",
        "llm_source": "System Response",
        "sources": [],
        "agricultural_alerts": [],
        "crop_suggestions": []
    }

def process_query(query):
    """Main function to process a user query"""
    logger.info(f"Processing query: {query}")
    
    # First check if this is an agricultural query
    if not is_agricultural_query(query):
        return handle_non_agricultural_query(query)
    
    # Initialize state
    state = AgentState(
        query=query,
        documents=None,
        answer="",
        source_documents=[],
        weather_data={},
        user_location={},
        llm_source="",
        error=None,
        needs_location=False,
        agricultural_alerts=[],
        crop_suggestions=[]
    )
    
    try:
        # Step 1: Get vector store
        vector_store = get_vector_store()
        if not vector_store:
            return {"error": "Failed to initialize document database"}
        
        state["documents"] = vector_store
        
        # Step 2: Check if location detection is needed
        state["needs_location"] = needs_location_detection(query)
        
        # Step 3: Handle location detection and weather data
        if state["needs_location"]:
            # FIRST, check for special location phrases like "current location"
            query_lower = query.lower()
            special_location_phrases = ["current location", "my location", "here", "this area", "my area"]
            is_special_location_query = any(phrase in query_lower for phrase in special_location_phrases)
            
            if is_special_location_query:
                # For special location queries, detect the user's physical location
                logger.info("Special location query detected. Detecting user location...")
                location_data = detect_user_location()
                state["user_location"] = location_data
                
                # Get weather data for the user's detected location
                if "error" not in location_data:
                    logger.info("Fetching weather data for user location...")
                    weather_data = get_weather_data(
                        location_data.get("latitude"),
                        location_data.get("longitude"),
                        location_data.get("city", "Unknown")
                    )
                    state["weather_data"] = weather_data
            else:
                # For regular queries, extract location from query if mentioned
                extracted_location = extract_location_from_query(query)
                
                if extracted_location:
                    # Use the location extracted from the query
                    logger.info(f"Using location extracted from query: {extracted_location}")
                    state["user_location"] = {
                        "city": extracted_location,
                        "detected_via": "query extraction"
                    }
                    # Get weather for the extracted location
                    weather_data = get_weather_data(None, None, extracted_location)
                    state["weather_data"] = weather_data
                else:
                    # No location in query, detect the user's physical location
                    logger.info("No location found in query. Detecting user location...")
                    location_data = detect_user_location()
                    state["user_location"] = location_data
                    
                    # Get weather data for the user's detected location
                    if "error" not in location_data:
                        logger.info("Fetching weather data for user location...")
                        weather_data = get_weather_data(
                            location_data.get("latitude"),
                            location_data.get("longitude"),
                            location_data.get("city", "Unknown")
                        )
                        state["weather_data"] = weather_data
            
        # Step 4: Check for special queries (only pure location/weather queries)
        special_answer = handle_special_queries(query, state["user_location"], state["weather_data"])
        if special_answer:
            return {
                "query": query,
                "answer": special_answer,
                "llm_source": "Direct API Response",
                "sources": [],
                "location": state["user_location"] if "error" not in state["user_location"] else {},
                "weather": state["weather_data"] if "error" not in state["weather_data"] else {},
                "season": get_seasonal_info(),
                "agricultural_alerts": [],
                "crop_suggestions": []
            }
        
        # Rest of the function remains the same...
        # Step 5: Check cache before processing
        query_hash = get_query_hash(query, state["user_location"], state["weather_data"])
        cached_response = check_cache(query_hash)
        if cached_response:
            return cached_response
        
        # Step 6: Retrieve relevant documents
        logger.info("Retrieving relevant documents...")
        relevant_docs = retrieve_relevant_documents(vector_store, query, COSINE_THRESHOLD)
        state["source_documents"] = relevant_docs
        
        # Step 7: Get seasonal information
        season_info = get_seasonal_info()
        
        # Step 8: Generate agricultural insights
        state["agricultural_alerts"] = get_agricultural_alerts(state["weather_data"], season_info)
        state["crop_suggestions"] = get_crop_suggestions(state["user_location"], state["weather_data"], season_info)
        
        # Step 9: Generate answer with Groq (primary)
        logger.info("Generating answer with Groq...")
        try:
            answer = generate_groq_answer(
                query, 
                relevant_docs, 
                state["user_location"], 
                state["weather_data"], 
                season_info,
                state["agricultural_alerts"],
                state["crop_suggestions"]
            )
            state["llm_source"] = "Groq (Llama 3.1)"
            
            # Check if answer is poor and fallback to Gemini if needed
            if is_poor_answer(answer):
                logger.info("Groq answer unsatisfactory, falling back to Gemini...")
                answer = generate_gemini_answer(
                    query, 
                    relevant_docs, 
                    state["user_location"], 
                    state["weather_data"], 
                    season_info,
                    state["agricultural_alerts"],
                    state["crop_suggestions"]
                )
                state["llm_source"] = "Gemini (Fallback)"
                
        except Exception as e:
            logger.error(f"Groq failed, falling back to Gemini: {str(e)}")
            answer = generate_gemini_answer(
                query, 
                relevant_docs, 
                state["user_location"], 
                state["weather_data"], 
                season_info,
                state["agricultural_alerts"],
                state["crop_suggestions"]
            )
            state["llm_source"] = "Gemini (Fallback)"
        
        state["answer"] = answer
        
        # Step 10: Format response and save to cache
        response = format_response(state, season_info)
        save_to_cache(query_hash, response)
        
        return response
        
    except Exception as e:
        error_msg = f"Error processing query: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

def format_response(state, season_info):
    """Format the final response"""
    response = {
        "query": state["query"],
        "answer": state["answer"],
        "llm_source": state["llm_source"],
        "sources": [
            f"Document: {doc.metadata.get('source', 'Unknown')} (Page {doc.metadata.get('page', 'N/A')})"
            for doc in state["source_documents"]
        ] if state["source_documents"] else ["No relevant documents found"],
        "agricultural_alerts": state["agricultural_alerts"],
        "crop_suggestions": state["crop_suggestions"]
    }
    
    # Add location data if available
    if state["user_location"] and "error" not in state["user_location"]:
        response["location"] = {
            "city": state["user_location"].get("city", "Unknown"),
            "state": state["user_location"].get("state", "Unknown"),
            "country": state["user_location"].get("country", "Unknown")
        }
    
    # Add weather data if available
    if state["weather_data"] and "error" not in state["weather_data"]:
        response["weather"] = state["weather_data"]
    
    # Add seasonal information
    response["season"] = season_info
    
    return response

def display_response(response):
    """Display the response in a user-friendly format"""
    print("\n" + "="*60)
    print("AGRO ASSISTANT RESPONSE")
    print("="*60)
    
    if "error" in response:
        print(f"❌ Error: {response['error']}")
        return
    
    print(f"📝 Question: {response['query']}")
    print(f"🧠 Source: {response['llm_source']}")
    print("\n💡 Answer:")
    print(response['answer'])
    
    if "location" in response:
        loc = response["location"]
        print(f"\n📍 Detected Location: {loc['city']}, {loc['state']}, {loc['country']}")
    
    if "weather" in response:
        weather = response["weather"]
        print(f"\n🌤️ Current Weather:")
        print(f"   Temperature: {weather.get('temperature', 'N/A')}°C")
        print(f"   Conditions: {weather.get('conditions', 'N/A')}")
        print(f"   Humidity: {weather.get('humidity', 'N/A')}%")
    
    print(f"\n🗓️ Current Season: {response['season']['current_season']}")
    print(f"   {response['season']['description']}")
    
    if response.get('agricultural_alerts'):
        print(f"\n⚠️ Agricultural Alerts:")
        for alert in response['agricultural_alerts']:
            print(f"   - {alert}")
    
    if response.get('crop_suggestions'):
        print(f"\n🌱 Crop Suggestions:")
        for crop in response['crop_suggestions']:
            print(f"   - {crop}")
    
    if "sources" in response and response['sources'] and response['sources'][0] != "No relevant documents found":
        print(f"\n📚 Sources:")
        for source in response['sources']:
            print(f"   - {source}")
    
    print("="*60)

def main():
    """Main function"""
    # Initialize components
    initialize_components()
    
    print("🌱 Welcome to Agro Assistant!")
    print("I can help with agricultural questions using your documents, location, and weather data.")
    print("Type 'exit' to quit.\n")
    
    while True:
        try:
            query = input("📝 Your question: ").strip()
            
            if query.lower() in ['exit', 'quit', 'bye']:
                print("👋 Goodbye!")
                break
                
            if not query:
                continue
                
            # Process the query
            response = process_query(query)
            
            # Display the response
            display_response(response)
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    main()

