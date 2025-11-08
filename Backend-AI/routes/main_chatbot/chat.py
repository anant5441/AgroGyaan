# ===== IMPORTS =====
# Core LangChain components for document processing and AI
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader  # PDF document loading
from langchain.text_splitter import RecursiveCharacterTextSplitter  # Text chunking for better processing
from langchain_google_genai import GoogleGenerativeAIEmbeddings  # Google's embedding model
from langchain_groq import ChatGroq  # Groq LLM for fast inference
from langchain.prompts import PromptTemplate  # Template for structured prompts
from langchain.schema import Document  # Document schema for LangChain
from typing import TypedDict, List, Optional  # Type hints for better code clarity

# Environment and configuration
from dotenv import load_dotenv  # Load environment variables from .env file

# Vector database and storage
from pinecone import Pinecone, ServerlessSpec  # Pinecone vector database
from langchain_pinecone import PineconeVectorStore  # LangChain integration with Pinecone

# Standard library imports
import os  # Operating system interface
import errno  # Error codes
import sys  # System-specific parameters
import logging  # Logging functionality
import requests  # HTTP library for API calls
import json  # JSON data handling
from datetime import datetime  # Date and time handling
import hashlib  # Hash functions for caching
import pickle  # Object serialization for caching
from functools import lru_cache  # Least Recently Used cache decorator
import re  # Regular expressions
import time  # Time-related functions
import threading  # Threading support
import signal  # Signal handling for graceful shutdown

# Third-party libraries
import google.generativeai as genai  # Google's Generative AI
from bs4 import BeautifulSoup  # HTML/XML parsing
import psutil  # System and process utilities
from prometheus_client import start_http_server, Counter, Histogram, Gauge  # Metrics collection

# ===== PRODUCTION CONFIGURATION =====
class Config:
    """
    Production configuration management class
    Centralizes all configuration parameters for the agricultural assistant
    """
    # API Rate Limits - Controls request frequency to prevent API overuse
    GROQ_RATE_LIMIT = 100  # Maximum Groq API calls per minute
    GEMINI_RATE_LIMIT = 60  # Maximum Gemini API calls per minute
    WEATHER_API_RATE_LIMIT = 60  # Maximum weather API calls per minute
    
    # Performance settings - Optimizes system performance and resource usage
    MAX_CONCURRENT_QUERIES = 10  # Maximum simultaneous queries to prevent overload
    CACHE_SIZE_MB = 100  # Maximum cache size in megabytes
    REQUEST_TIMEOUT = 30  # Timeout for external API requests in seconds
    MAX_DOCUMENT_SIZE_MB = 50  # Maximum size for uploaded documents
    
    # Monitoring - Health check and metrics configuration
    HEALTH_CHECK_INTERVAL = 30  # Health check frequency in seconds
    METRICS_PORT = 8000  # Port for Prometheus metrics endpoint
    
    # Security - File upload and security constraints
    ALLOWED_FILE_TYPES = ['.pdf']  # Only PDF files are allowed for upload
    MAX_FILE_UPLOAD_SIZE = 100 * 1024 * 1024  # 100MB maximum file size

# ===== PROMETHEUS METRICS =====
# Metrics for monitoring system performance and health
QUERY_COUNTER = Counter('agro_assistant_queries_total', 'Total number of queries', ['llm_source', 'status'])  # Tracks query count by LLM and status
QUERY_DURATION = Histogram('agro_assistant_query_duration_seconds', 'Query processing time')  # Measures query processing time
ACTIVE_QUERIES = Gauge('agro_assistant_active_queries', 'Number of active queries')  # Current number of active queries
CACHE_HITS = Counter('agro_assistant_cache_hits_total', 'Cache hit counter')  # Tracks cache hit frequency
API_ERRORS = Counter('agro_assistant_api_errors_total', 'API error counter', ['api_name'])  # Tracks API errors by service

# ===== RATE LIMITING =====
class RateLimiter:
    """Production rate limiting"""
    def __init__(self, calls_per_minute):
        self.calls_per_minute = calls_per_minute
        self.calls = []
        self.lock = threading.Lock()
    
    def acquire(self):
        with self.lock:
            now = time.time()
            self.calls = [call for call in self.calls if now - call < 60]
            
            if len(self.calls) >= self.calls_per_minute:
                sleep_time = 60 - (now - self.calls[0])
                if sleep_time > 0:
                    time.sleep(sleep_time)
                    self.calls = self.calls[1:]
            
            self.calls.append(now)

# Initialize rate limiters
groq_limiter = RateLimiter(Config.GROQ_RATE_LIMIT)
gemini_limiter = RateLimiter(Config.GEMINI_RATE_LIMIT)
weather_limiter = RateLimiter(Config.WEATHER_API_RATE_LIMIT)

# ===== PRODUCTION LOGGING =====
def setup_production_logging():
    """Setup structured logging for production"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('agro_assistant.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )

# Configure logging
setup_production_logging()
logger = logging.getLogger(__name__)

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PDF_DIR = os.path.join(BASE_DIR, "data")
PINECONE_INDEX_NAME = "agro-assistant-index"
CACHE_DIR = os.path.join(BASE_DIR, "cache")
GROQ_MODEL = "llama-3.1-8b-instant"
COSINE_THRESHOLD = 0.5
CACHE_EXPIRY_HOURS = 24

# ===== HEALTH CHECKS =====
class HealthChecker:
    """System health monitoring"""
    def __init__(self):
        self.healthy = True
        self.last_check = time.time()
    
    def check_health(self):
        """Comprehensive health check"""
        try:
            checks = {
                'pinecone_connection': self.check_pinecone(),
                'api_keys': self.check_api_keys(),
                'disk_space': self.check_disk_space(),
                'memory_usage': self.check_memory(),
                'cpu_usage': self.check_cpu()
            }
            
            self.healthy = all(checks.values())
            self.last_check = time.time()
            
            return {
                'healthy': self.healthy,
                'status': 'healthy' if self.healthy else 'unhealthy',
                'timestamp': self.last_check,
                'checks': checks
            }
        except Exception as e:
            logger.error(f"Health check error: {str(e)}")
            self.healthy = False
            return {
                'healthy': False,
                'status': 'unhealthy',
                'timestamp': time.time(),
                'checks': {},
                'error': str(e)
            }
    
    def check_pinecone(self):
        try:
            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            pc.list_indexes()
            return True
        except Exception as e:
            logger.error(f"Pinecone health check failed: {str(e)}")
            return False
    
    def check_api_keys(self):
        try:
            required_keys = ['PINECONE_API_KEY', 'GOOGLE_API_KEY', 'GROQ_API_KEY']
            return all(os.getenv(key) for key in required_keys)
        except Exception as e:
            logger.error(f"API keys check failed: {str(e)}")
            return False
    
    def check_disk_space(self):
        try:
            usage = psutil.disk_usage('/')
            return usage.percent < 90
        except Exception as e:
            logger.error(f"Disk space check failed: {str(e)}")
            return False
    
    def check_memory(self):
        try:
            return psutil.virtual_memory().percent < 85
        except Exception as e:
            logger.error(f"Memory check failed: {str(e)}")
            return False
    
    def check_cpu(self):
        try:
            return psutil.cpu_percent(interval=1) < 80
        except Exception as e:
            logger.error(f"CPU check failed: {str(e)}")
            return False

# ===== SECURITY =====
class SecurityManager:
    """Security and input validation"""
    @staticmethod
    def sanitize_input(text):
        """Sanitize user input to prevent injection attacks"""
        if not text or not isinstance(text, str):
            return ""
        sanitized = re.sub(r'[<>"\']', '', text)
        return sanitized[:1000]
    
    @staticmethod
    def validate_file_upload(file_path):
        """Validate uploaded files"""
        try:
            if not any(file_path.lower().endswith(ext) for ext in Config.ALLOWED_FILE_TYPES):
                return False, "Invalid file type"
            
            file_size = os.path.getsize(file_path)
            if file_size > Config.MAX_FILE_UPLOAD_SIZE:
                return False, "File too large"
            
            return True, "Valid"
        except Exception as e:
            return False, f"Validation error: {str(e)}"

# Define state
class AgentState(TypedDict):
    query: str
    documents: Optional[PineconeVectorStore]
    answer: str
    source_documents: List[Document]
    weather_data: dict
    user_location: dict
    llm_source: str
    error: Optional[str]
    needs_location: bool
    agricultural_alerts: List[str]
    crop_suggestions: List[str]

# Initialize Pinecone
def initialize_pinecone():
    """Initialize Pinecone client and create index if needed"""
    try:
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            raise ValueError("PINECONE_API_KEY not found in environment variables")
        
        pc = Pinecone(api_key=api_key)
        
        # Check if index exists
        existing_indexes = pc.list_indexes()
        index_names = [index.name for index in existing_indexes] if hasattr(existing_indexes, '__iter__') else []
        
        if PINECONE_INDEX_NAME not in index_names:
            print(f"Creating Pinecone index: {PINECONE_INDEX_NAME}")
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=768,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            print("Waiting for index to be ready...")
            time.sleep(60)
        else:
            print(f"Pinecone index {PINECONE_INDEX_NAME} already exists")
        
        return pc
    except Exception as e:
        logger.error(f"Error initializing Pinecone: {str(e)}")
        return None

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
    
    # Initialize Pinecone
    initialize_pinecone()
    
    # Create vector store if documents exist
    if not pinecone_index_has_documents():
        create_vector_store_from_pdfs()

def pinecone_index_has_documents():
    """Check if Pinecone index already has documents"""
    try:
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        index = pc.Index(PINECONE_INDEX_NAME)
        stats = index.describe_index_stats()
        return stats.get('total_vector_count', 0) > 0
    except Exception as e:
        logger.error(f"Error checking Pinecone index: {str(e)}")
        return False

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
    """Initialize Google Generative AI embedding model"""
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        return GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key
        )
    except Exception as e:
        logger.error(f"Error initializing Google Generative AI embeddings: {str(e)}")
        raise

def get_embedding_dimensions():
    """Get the dimensions of Google Generative AI embeddings"""
    try:
        embedding_model = get_embedding_model()
        test_text = "This is a test sentence to get embedding dimensions."
        embedding = embedding_model.embed_query(test_text)
        dimensions = len(embedding)
        logger.info(f"Google Generative AI embedding dimensions: {dimensions}")
        return dimensions
    except Exception as e:
        logger.error(f"Error getting embedding dimensions: {str(e)}")
        return None

def get_vector_store_stats():
    """Get statistics about the Pinecone vector store"""
    try:
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        index = pc.Index(PINECONE_INDEX_NAME)
        stats = index.describe_index_stats()
        
        embedding_dimensions = get_embedding_dimensions()
        total_vectors = stats.get('total_vector_count', 0)
        
        stats_data = {
            "total_vectors": total_vectors,
            "embedding_dimensions": embedding_dimensions,
            "vector_store_size": f"{total_vectors} vectors × {embedding_dimensions} dimensions",
            "index_fullness": stats.get('index_fullness', 'N/A'),
            "namespaces": list(stats.get('namespaces', {}).keys())
        }
        
        logger.info(f"Pinecone vector store stats: {stats_data}")
        return stats_data
    except Exception as e:
        logger.error(f"Error getting Pinecone vector store stats: {str(e)}")
        return {"error": str(e)}

def display_vector_store_info():
    """Display vector store information for Pinecone setup"""
    stats = get_vector_store_stats()
    
    if "error" in stats:
        print(f"❌ Error: {stats['error']}")
        return
    
    print("\n" + "="*50)
    print("VECTOR STORE INFORMATION FOR PINECONE")
    print("="*50)
    print(f"📊 Total Vectors: {stats['total_vectors']}")
    print(f"📐 Embedding Dimensions: {stats['embedding_dimensions']}")
    print(f"🔢 Pinecone Dimension Parameter: dimension={stats['embedding_dimensions']}")
    print("="*50)
    
    return stats

def get_pinecone_config():
    """Get Pinecone configuration parameters"""
    stats = get_vector_store_stats()
    
    if "error" in stats:
        return {"error": stats["error"]}
    
    pinecone_config = {
        "dimension": stats["embedding_dimensions"],
        "metric": "cosine",
        "total_vectors": stats["total_vectors"],
        "embedding_model": "Google Generative AI text-embedding-004"
    }
    
    return pinecone_config

def show_pinecone_setup_guide():
    """Display Pinecone setup guide with required parameters"""
    config = get_pinecone_config()
    
    if "error" in config:
        print(f"❌ Error: {config['error']}")
        return
    
    print("\n" + "="*60)
    print("PINECONE SETUP GUIDE")
    print("="*60)
    print(f"📐 Dimension: {config['dimension']}")
    print(f"📊 Metric: {config['metric']}")
    print(f"🔢 Total Vectors: {config['total_vectors']}")
    print(f"🤖 Embedding Model: {config['embedding_model']}")
    print("\n💡 Pinecone Index Creation Command:")
    print(f"pinecone.create_index(")
    print(f"    name='your-index-name',")
    print(f"    dimension={config['dimension']},")
    print(f"    metric='{config['metric']}'")
    print(f")")
    print("="*60)

def create_vector_store_from_pdfs():
    """Create and persist Pinecone vector store from PDFs"""
    try:
        documents = load_pdf_documents()
        if not documents:
            logger.warning("No documents found to create vector store")
            return None
            
        chunks = create_chunks(documents)
        embedding_model = get_embedding_model()
        
        initialize_pinecone()
        
        vector_store = PineconeVectorStore.from_documents(
            documents=chunks,
            embedding=embedding_model,
            index_name=PINECONE_INDEX_NAME
        )
        
        logger.info(f"Created Pinecone vector store with {len(chunks)} chunks using Google Generative AI embeddings")
        return vector_store
    except Exception as e:
        logger.error(f"Error creating Pinecone vector store: {str(e)}")
        return None

def get_pinecone_vector_store():
    """Get existing Pinecone vector store for querying"""
    try:
        embedding_model = get_embedding_model()
        
        vector_store = PineconeVectorStore.from_existing_index(
            index_name=PINECONE_INDEX_NAME,
            embedding=embedding_model
        )
        
        logger.info("Successfully loaded Pinecone vector store")
        return vector_store
    except Exception as e:
        logger.error(f"Error getting Pinecone vector store: {str(e)}")
        return None

def get_vector_store():
    """Get or create vector store - NOW USING PINECONE"""
    return get_pinecone_vector_store() or create_vector_store_from_pdfs()

def get_groq_llm():
    """Initialize Groq LLM"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    
    return ChatGroq(
        temperature=0.3,
        groq_api_key=api_key,
        model_name=GROQ_MODEL,
        max_tokens=200
    )

def get_gemini_model():
    """Initialize Gemini model for fallback"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables")
    
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-2.5-pro")
    except Exception as e:
        raise ValueError(f"Failed to initialize Gemini model: {str(e)}")

# REMOVED: detect_user_location function - Now handled by frontend

def get_weather_data(latitude, longitude, location_name):
    """Get current weather data for a location using frontend-provided data"""
    try:
        weather_limiter.acquire()
        api_key = os.getenv("OPENWEATHER_API_KEY")
        
        # If no API key, return informative error
        if not api_key:
            logger.warning("OPENWEATHER_API_KEY not found in environment variables")
            return {
                "error": "Weather service temporarily unavailable",
                "location": location_name or "Unknown",
                "temperature": "N/A",
                "conditions": "Weather data not available"
            }
        
        # Try location name first
        if location_name and location_name != "Unknown":
            url = f"https://api.openweathermap.org/data/2.5/weather?q={location_name}&appid={api_key}&units=metric"
            logger.info(f"Attempting weather API call for location: {location_name}")
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return format_weather_data(data, location_name)
            elif response.status_code == 404:
                logger.warning(f"Location '{location_name}' not found in weather API")
                # Fall back to coordinates if available
                if latitude and longitude:
                    return get_weather_by_coordinates(latitude, longitude, location_name, api_key)
                else:
                    return create_fallback_weather_data(location_name, "Location not found in weather service")
            else:
                logger.error(f"Weather API error for {location_name}: HTTP {response.status_code}")
                return create_fallback_weather_data(location_name, f"API error: {response.status_code}")
        
        # Try coordinates if location name fails or not provided
        elif latitude and longitude:
            return get_weather_by_coordinates(latitude, longitude, location_name, api_key)
        else:
            return create_fallback_weather_data(location_name or "Unknown", "No location data provided")
            
    except requests.exceptions.Timeout:
        logger.error("Weather API request timeout")
        return create_fallback_weather_data(location_name or "Unknown", "Weather service timeout")
    except requests.exceptions.ConnectionError:
        logger.error("Weather API connection error")
        return create_fallback_weather_data(location_name or "Unknown", "Weather service unavailable")
    except Exception as e:
        logger.error(f"Weather API unexpected error: {str(e)}")
        return create_fallback_weather_data(location_name or "Unknown", f"Service error: {str(e)}")

def get_weather_by_coordinates(latitude, longitude, location_name, api_key):
    """Get weather data using coordinates"""
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={api_key}&units=metric"
        logger.info(f"Attempting weather API call by coordinates: {latitude}, {longitude}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return format_weather_data(data, location_name or data.get("name", "Unknown"))
        else:
            logger.error(f"Weather API coordinate error: HTTP {response.status_code}")
            return create_fallback_weather_data(location_name or "Unknown", f"Coordinate lookup failed: {response.status_code}")
    except Exception as e:
        logger.error(f"Coordinate weather lookup error: {str(e)}")
        return create_fallback_weather_data(location_name or "Unknown", f"Coordinate lookup error: {str(e)}")

def format_weather_data(data, location_name):
    """Format weather data from API response"""
    weather_data = {
        "location": data.get("name", location_name),
        "temperature": data["main"].get("temp", "N/A"),
        "feels_like": data["main"].get("feels_like", "N/A"),
        "humidity": data["main"].get("humidity", "N/A"),
        "conditions": data["weather"][0].get("description", "N/A").title() if data.get("weather") else "N/A",
        "wind_speed": data["wind"].get("speed", "N/A"),
        "pressure": data["main"].get("pressure", "N/A"),
        "visibility": data.get("visibility", "N/A"),
        "api_source": "OpenWeather"
    }
    logger.info(f"Weather data successfully retrieved for {weather_data['location']}")
    return weather_data

def create_fallback_weather_data(location_name, error_reason):
    """Create fallback weather data when API fails"""
    # Get seasonal data for reasonable fallback values
    season_info = get_seasonal_info()
    current_month = datetime.now().month
    
    # Generate reasonable temperature estimates based on season and location
    base_temp = 25  # Default base temperature
    
    if current_month in [12, 1, 2]:  # Winter
        base_temp = 15 if location_name and "delhi" in location_name.lower() else 18
        conditions = "Partly Cloudy"
    elif current_month in [3, 4, 5]:  # Summer
        base_temp = 35 if location_name and "delhi" in location_name.lower() else 32
        conditions = "Sunny"
    elif current_month in [6, 7, 8, 9]:  # Monsoon
        base_temp = 30
        conditions = "Humid with Possible Rain"
    else:  # Post-monsoon
        base_temp = 28
        conditions = "Clear"
    
    return {
        "location": location_name or "Unknown",
        "temperature": base_temp,
        "feels_like": base_temp + 2,
        "humidity": 65,
        "conditions": conditions,
        "wind_speed": 12,
        "pressure": 1013,
        "visibility": 10000,
        "api_source": "Fallback",
        "fallback_reason": error_reason,
        "note": "Using estimated weather data based on season and location"
    }

def get_seasonal_info(query=""):
    """Get current season information for agricultural context with query awareness"""
    current_month = datetime.now().month
    query_lower = query.lower() if query else ""
    
    is_summer_query = any(word in query_lower for word in ['summer', 'summers'])
    
    if current_month in [12, 1, 2]:
        current_season = "Winter (Rabi Season)"
        description = "Cold and dry season, suitable for wheat, barley, peas, and mustard"
        summer_season = "Summer (Pre-Monsoon) - March to May"
        summer_description = "Hot and dry season, suitable for summer crops like fodder crops and vegetables"
    elif current_month in [3, 4, 5]:
        current_season = "Summer (Pre-Monsoon)"
        description = "Hot and dry season, suitable for summer crops like fodder crops and vegetables"
        summer_season = current_season
        summer_description = description
    elif current_month in [6, 7, 8, 9]:
        current_season = "Monsoon (Kharif Season)"
        description = "Rainy season, suitable for rice, sugarcane, cotton, and jowar"
        summer_season = "Summer (Pre-Monsoon) - March to May"
        summer_description = "Hot and dry season, suitable for summer crops like fodder crops and vegetables"
    else:
        current_season = "Post-Monsoon (Harvest/Transition)"
        description = "Harvest season transitioning to winter crops"
        summer_season = "Summer (Pre-Monsoon) - March to May"
        summer_description = "Hot and dry season, suitable for summer crops like fodder crops and vegetables"
    
    if is_summer_query:
        return {
            "current_season": summer_season,
            "description": summer_description,
            "month": current_month,
            "is_summer_focus": True,
            "actual_current_season": current_season
        }
    
    return {
        "current_season": current_season,
        "description": description,
        "month": current_month,
        "is_summer_focus": False
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
    
    if any(keyword in query_lower for keyword in location_keywords):
        return True
    
    if any(keyword in query_lower for keyword in crop_keywords):
        if "my" in query_lower or "here" in query_lower or "this" in query_lower:
            return True
    
    return False

def extract_location_from_query(query):
    """Extract location from query if explicitly mentioned"""
    query_lower = query.lower().strip()
    
    logger.info(f"DEBUG: Processing query: '{query_lower}'")
    
    # SPECIAL CASE: Handle "my location", "here", "current location" etc.
    # These should NOT be extracted as literal locations
    special_location_references = [
        "my location", "current location", "here", "this area", 
        "my area", "present location", "where i am"
    ]
    
    for ref in special_location_references:
        if ref in query_lower:
            logger.info(f"DEBUG: Special location reference '{ref}' found - returning None to use user location")
            return None  # Return None to indicate we should use user's actual location
    
    # Pattern 1: "weather of [location]"
    if "weather of " in query_lower:
        parts = query_lower.split("weather of ")
        if len(parts) > 1:
            location_part = parts[1].strip()
            # Take all words until the end or next question word
            potential_location = re.split(r'[.?]', location_part)[0].strip()
            potential_location = potential_location.rstrip('.,!?;')
            
            # Check if it's a special reference
            if potential_location.lower() in special_location_references:
                logger.info(f"DEBUG: 'weather of' with special reference - returning None")
                return None
                
            logger.info(f"DEBUG: 'weather of' pattern found. Potential location: '{potential_location}'")
            
            if len(potential_location) > 1:
                logger.info(f"DEBUG: Returning location from 'weather of' pattern: '{potential_location.title()}'")
                return potential_location.title()
    
    # Pattern 2: "weather in [location]"
    if "weather in " in query_lower:
        parts = query_lower.split("weather in ")
        if len(parts) > 1:
            location_part = parts[1].strip()
            potential_location = re.split(r'[.?]', location_part)[0].strip()
            potential_location = potential_location.rstrip('.,!?;')
            
            # Check if it's a special reference
            if potential_location.lower() in special_location_references:
                logger.info(f"DEBUG: 'weather in' with special reference - returning None")
                return None
            
            logger.info(f"DEBUG: 'weather in' pattern found. Potential location: '{potential_location}'")
            
            if len(potential_location) > 1:
                logger.info(f"DEBUG: Returning location from 'weather in' pattern: '{potential_location.title()}'")
                return potential_location.title()
    
    # Pattern 3: Other weather patterns
    weather_patterns = [
        "temperature of ", "temperature in ", "forecast for ", "forecast in ",
        "humidity in ", "rain in ", "climate in ", "crop in ", "crops in ",
        "sow in ", "plant in ", "grow in "
    ]
    
    for pattern in weather_patterns:
        if pattern in query_lower:
            start_index = query_lower.find(pattern) + len(pattern)
            remaining_text = query_lower[start_index:].strip()
            
            if remaining_text:
                potential_location = re.split(r'[.?]', remaining_text)[0].strip()
                potential_location = potential_location.rstrip('.,!?;')
                
                # Check if it's a special reference
                if potential_location.lower() in special_location_references:
                    logger.info(f"DEBUG: Pattern '{pattern}' with special reference - returning None")
                    return None
                
                # Remove common question words
                question_words = ["what", "is", "the", "a", "an", "for", "today", "now", "current", "best"]
                location_words = [word for word in potential_location.split() if word not in question_words]
                potential_location = " ".join(location_words).strip()
                
                logger.info(f"DEBUG: Pattern '{pattern}' found. Potential location: '{potential_location}'")
                
                if len(potential_location) > 1:
                    logger.info(f"DEBUG: Returning location: '{potential_location.title()}'")
                    return potential_location.title()
    
    # Pattern 4: General location indicators (only for specific locations, not references)
    location_indicators = ["in ", "at ", "near ", "around ", "for ", "of "]
    
    for indicator in location_indicators:
        if indicator in query_lower:
            start_index = query_lower.find(indicator) + len(indicator)
            remaining_text = query_lower[start_index:].strip()
            
            if remaining_text:
                potential_location = re.split(r'[.?]', remaining_text)[0].strip()
                potential_location = potential_location.rstrip('.,!?;')
                
                # Skip if it's a special reference
                if potential_location.lower() in special_location_references:
                    continue
                
                question_words = ["what", "is", "the", "a", "an", "for", "today", "now", "current", "best"]
                location_words = [word for word in potential_location.split() if word not in question_words]
                potential_location = " ".join(location_words).strip()
                
                logger.info(f"DEBUG: Indicator '{indicator}' found. Potential location: '{potential_location}'")
                
                if len(potential_location) > 1 and len(potential_location.split()) <= 3:
                    logger.info(f"DEBUG: Returning location: '{potential_location.title()}'")
                    return potential_location.title()
    
    # Pattern 5: Known cities (including Indian cities)
    indian_cities = [
        "delhi", "mumbai", "chennai", "kolkata", "bangalore", "hyderabad", "pune", "jaipur",
        "ahmedabad", "lucknow", "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam",
        "patna", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot", "varanasi",
        "srinagar", "amritsar", "allahabad", "howrah", "gwalior", "jodhpur", "raipur", "kota",
        "chandigarh", "mysore", "bareilly", "guwahati", "jammu", "hubli", "solapur", "trivandrum",
        "kochi", "coimbatore", "madurai", "jabalpur", "asansol", "dhanbad", "vellore", "ajmer",
        "kolhapur", "shillong", "ulhasnagar", "jamnagar", "sangli", "bhilai", "guntur", "amravati",
        "noida", "bhagalpur", "warangal", "ranchi", "kurnool", "gurgaon", "gurugram", "nanded",
        "dehradun", "durgapur", "kakinada", "nellore", "tiruchirappalli", "ujjain", "muzaffarnagar",
        "bewar", "jaunpur", "mirzapur", "saharanpur", "moradabad", "aligarh", "gorakhpur", "firozabad",
        "meerut", "rourkela", "jamshedpur", "bokaro", "raurkela", "kozhikode", "alappuzha", "kollam",
        "shimla", "manali", "dehradun", "nainital", "ooty", "mussorie", "darjeeling", "shillong",
        "gangtok", "itanagar", "kohima", "aizawl", "imphal", "agartala", "shillong", "dispur"
    ]
    
    words = query_lower.split()
    for word in words:
        clean_word = word.rstrip('.,!?;')
        if clean_word in indian_cities:
            logger.info(f"DEBUG: City '{clean_word}' found in query. Returning: '{clean_word.title()}'")
            return clean_word.title()
    
    logger.info("DEBUG: No location found in query")
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
    
    if len(answer.split()) < 5:
        return True
    
    return any(indicator in answer_lower for indicator in poor_indicators)

def truncate_answer(answer, max_words=150):
    """Truncate answer to specified word count while ensuring complete sentences"""
    words = answer.split()
    if len(words) <= max_words:
        return answer
    
    truncated = " ".join(words[:max_words])
    
    last_period = truncated.rfind('.')
    last_question = truncated.rfind('?')
    last_exclamation = truncated.rfind('!')
    
    last_end = max(last_period, last_question, last_exclamation)
    
    if last_end > 0:
        return truncated[:last_end + 1]
    else:
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
    
    return " ".join(answer.split())

def generate_groq_answer(query, context_docs, location_data, weather_data, season_info, agricultural_alerts, crop_suggestions):
    """Generate answer using Groq LLM with context and location/weather data"""
    try:
        groq_limiter.acquire()
        llm = get_groq_llm()
        
        context_text = ""
        if context_docs:
            context_text = "\n\n".join([doc.page_content[:500] for doc in context_docs[:2]])
        
        location_context = ""
        if location_data and "error" not in location_data:
            location_context = f"User's Location: {location_data.get('city', 'Unknown')}, {location_data.get('state', 'Unknown')}, {location_data.get('country', 'Unknown')}"
        
        weather_context = ""
        if weather_data and "error" not in weather_data:
            weather_context = f"Current Weather: {weather_data.get('temperature', 'N/A')}°C, {weather_data.get('conditions', 'N/A')}, Humidity: {weather_data.get('humidity', 'N/A')}%"
        
        season_context = f"Current Season: {season_info.get('current_season', 'N/A')} - {season_info.get('description', '')}"
        
        if season_info.get('is_summer_focus'):
            season_context = f"USER IS SPECIFICALLY ASKING ABOUT SUMMER SEASON: {season_info.get('current_season', 'N/A')} - {season_info.get('description', '')}"
        else:
            season_context = f"Current Season: {season_info.get('current_season', 'N/A')} - {season_info.get('description', '')}"

        agricultural_context = ""
        if agricultural_alerts:
            agricultural_context = f"Agricultural Alerts: {', '.join(agricultural_alerts)}"
        
        crop_context = ""
        if crop_suggestions:
            crop_context = f"Crop Suggestions: {', '.join(crop_suggestions)}"
        
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
            9. Ensure the answer is complete and doesn't end abruptly
            10. DO NOT mention "Document information" or "Based on documents" in your answer
            11. Just provide the answer naturally without referencing the source documents

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
        
        response = llm.invoke(prompt)
        answer = response.content.strip()
        
        answer = remove_redundancies(answer)
        answer = truncate_answer(answer, 150)
        
        return answer
        
    except Exception as e:
        logger.error(f"Groq API error: {str(e)}")
        API_ERRORS.labels(api_name='groq').inc()
        raise Exception(f"Failed to generate answer with Groq: {str(e)}")

def generate_gemini_answer(query, context_docs, location_data, weather_data, season_info, agricultural_alerts, crop_suggestions):
    """Generate fallback answer using Gemini"""
    try:
        gemini_limiter.acquire()
        model = get_gemini_model()
        
        context_text = ""
        if context_docs:
            context_text = "\n\n".join([doc.page_content[:500] for doc in context_docs[:2]])
        
        location_context = ""
        if location_data and "error" not in location_data:
            location_context = f"User's Location: {location_data.get('city', 'Unknown')}, {location_data.get('state', 'Unknown')}, {location_data.get('country', 'Unknown')}"
        
        weather_context = ""
        if weather_data and "error" not in weather_data:
            weather_context = f"Current Weather: {weather_data.get('temperature', 'N/A')}°C, {weather_data.get('conditions', 'N/A')}, Humidity: {weather_data.get('humidity', 'N/A')}%"
        
        season_context = f"Current Season: {season_info.get('current_season', 'N/A')} - {season_info.get('description', '')}"

        if season_info.get('is_summer_focus'):
            season_context = f"USER IS SPECIFICALLY ASKING ABOUT SUMMER SEASON: {season_info.get('current_season', 'N/A')} - {season_info.get('description', '')}"
        else:
            season_context = f"Current Season: {season_info.get('current_season', 'N/A')} - {season_info.get('description', '')}"
        
        agricultural_context = ""
        if agricultural_alerts:
            agricultural_context = f"Agricultural Alerts: {', '.join(agricultural_alerts)}"
        
        crop_context = ""
        if crop_suggestions:
            crop_context = f"Crop Suggestions: {', '.join(crop_suggestions)}"
        
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
        9. Ensure the answer is complete and doesn't end abruptly
        10. DO NOT mention "Document information" or "Based on documents" in your answer
        11. Just provide the answer naturally without referencing the source documents

        ANSWER:
        """
        
        response = model.generate_content(prompt)
        answer = response.text.strip()
        
        answer = remove_redundancies(answer)
        answer = truncate_answer(answer, 150)
        
        return answer
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        API_ERRORS.labels(api_name='gemini').inc()
        raise Exception(f"Failed to generate answer with Gemini: {str(e)}")

def retrieve_relevant_documents(query, threshold=0.5):
    """Retrieve relevant documents using Pinecone similarity search"""
    try:
        vector_store = get_vector_store()
        if not vector_store:
            return []
        
        docs_and_scores = vector_store.similarity_search_with_score(
            query, 
            k=5
        )
        
        filtered_docs = [doc for doc, score in docs_and_scores if score >= threshold]
        logger.info(f"Retrieved {len(filtered_docs)} relevant documents from Pinecone")
        return filtered_docs
        
    except Exception as e:
        logger.error(f"Error retrieving documents from Pinecone: {str(e)}")
        return []

def handle_special_queries(query, location_data, weather_data):
    """Handle special queries like location and weather directly"""
    query_lower = query.lower()
    
    extracted_location = extract_location_from_query(query)
    
    weather_terms = ["weather", "temperature", "forecast", "rain", "sunny", "humidity"]
    is_weather_query = any(term in query_lower for term in weather_terms)
    is_agricultural_query = any(term in query_lower for term in ["crop", "plant", "grow", "agriculture", "farming"])
    
    special_location_phrases = ["current location", "my location", "here", "this area", "my area"]
    is_special_location_query = any(phrase in query_lower for phrase in special_location_phrases)
    
    if is_special_location_query and is_weather_query and not is_agricultural_query:
        if weather_data and "error" not in weather_data:
            location = weather_data.get('location', 'your area')
            temp = weather_data.get('temperature', 'N/A')
            conditions = weather_data.get('conditions', 'N/A')
            humidity = weather_data.get('humidity', 'N/A')
            
            if weather_data.get('api_source') == 'Fallback':
                return f"Estimated weather in {location}: {temp}°C, {conditions}, Humidity: {humidity}%. Note: {weather_data.get('note', 'Using estimated data')}"
            else:
                return f"Current weather in {location}: {temp}°C, {conditions}, Humidity: {humidity}%."
        else:
            return "I couldn't retrieve weather data for your location. Please check if your location services are enabled."
    
    elif extracted_location and is_weather_query and not is_agricultural_query:
        weather_data_for_location = get_weather_data(None, None, extracted_location)
        if weather_data_for_location and "error" not in weather_data_for_location:
            location = weather_data_for_location.get('location', extracted_location)
            temp = weather_data_for_location.get('temperature', 'N/A')
            conditions = weather_data_for_location.get('conditions', 'N/A')
            humidity = weather_data_for_location.get('humidity', 'N/A')
            
            if weather_data_for_location.get('api_source') == 'Fallback':
                return f"Estimated weather in {location}: {temp}°C, {conditions}, Humidity: {humidity}%. Note: {weather_data_for_location.get('note', 'Using estimated data')}"
            else:
                return f"Weather in {location}: {temp}°C, {conditions}, Humidity: {humidity}%."
        else:
            return f"Could not retrieve weather data for {extracted_location}. The location might not be recognized by the weather service."
    
    elif is_weather_query and not is_agricultural_query and not extracted_location:
        if weather_data and "error" not in weather_data:
            location = weather_data.get('location', 'your area')
            temp = weather_data.get('temperature', 'N/A')
            conditions = weather_data.get('conditions', 'N/A')
            humidity = weather_data.get('humidity', 'N/A')
            
            if weather_data.get('api_source') == 'Fallback':
                return f"Estimated weather in {location}: {temp}°C, {conditions}, Humidity: {humidity}%. Note: {weather_data.get('note', 'Using estimated data')}"
            else:
                return f"Current weather in {location}: {temp}°C, {conditions}, Humidity: {humidity}%."
        else:
            return "I couldn't retrieve weather data. Please ensure your location services are enabled."
    
    location_only_terms = ["location", "where am i", "my location", "this area"]
    if any(term in query_lower for term in location_only_terms) and not is_agricultural_query:
        if location_data and "error" not in location_data:
            return f"Your current location is {location_data.get('city', 'Unknown')}, {location_data.get('state', 'Unknown')}, {location_data.get('country', 'Unknown')}."
        else:
            return "I couldn't determine your location. Location detection is now handled by the frontend."
    
    return None

# ===== RESPONSE CACHING IMPLEMENTATION =====
def get_query_hash(query, location_data, weather_data):
    """Generate a unique hash for the query and context"""
    context_str = f"{query}_{location_data.get('city', '')}_{weather_data.get('temperature', '')}"
    return hashlib.md5(context_str.encode()).hexdigest()

def check_cache(query_hash):
    """Check if response is in cache and still valid"""
    cache_file = os.path.join(CACHE_DIR, f"{query_hash}.pkl")
    
    if not os.path.exists(cache_file):
        return None
    
    cache_time = os.path.getmtime(cache_file)
    current_time = datetime.now().timestamp()
    cache_age_hours = (current_time - cache_time) / 3600
    
    if cache_age_hours > CACHE_EXPIRY_HOURS:
        os.remove(cache_file)
        return None
    
    try:
        with open(cache_file, 'rb') as f:
            cached_data = pickle.load(f)
        logger.info("Response retrieved from cache")
        CACHE_HITS.inc()
        return cached_data
    except Exception as e:
        logger.error(f"Error reading cache: {str(e)}")
        return None

def save_to_cache(query_hash, response_data):
    """Save response to cache"""
    try:
        if not os.path.exists(CACHE_DIR):
            try:
                os.makedirs(CACHE_DIR)
                logger.info(f"Created cache directory: {CACHE_DIR}")
            except OSError as e:
                if e.errno != errno.EEXIST:
                    raise
        
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
    
    temp = weather_data.get('temperature', 0)
    if isinstance(temp, (int, float)):
        if temp > 35:
            alerts.append("High temperature alert: Consider irrigation and shading for crops")
        elif temp < 10:
            alerts.append("Low temperature alert: Protect sensitive crops from cold stress")
    
    humidity = weather_data.get('humidity', 0)
    if isinstance(humidity, (int, float)):
        if humidity > 80:
            alerts.append("High humidity alert: Watch for fungal diseases in crops")
        elif humidity < 30:
            alerts.append("Low humidity alert: Increased irrigation may be needed")
    
    conditions = weather_data.get('conditions', '').lower()
    if 'rain' in conditions or 'shower' in conditions:
        alerts.append("Rain alert: Good for irrigation but watch for waterlogging")
    if 'storm' in conditions or 'cyclone' in conditions:
        alerts.append("Storm alert: Protect crops from wind damage")
    if 'drought' in conditions or 'dry' in conditions:
        alerts.append("Drought alert: Implement water conservation measures")
    
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
    
    state = location_data.get('state', '').lower()
    season = season_info.get('current_season', '')
    temp = weather_data.get('temperature', 0)
    
    is_summer_focus = season_info.get('is_summer_focus', False)
    
    if is_summer_focus or 'Summer' in season:
        suggestions.extend(["Millets (Pearl millet, Finger millet)", "Vegetables (Cucumber, Bottle Gourd, Bitter Gourd)", "Pulses (Green gram, Black gram)", "Oilseeds (Sesame, Groundnut)", "Fodder crops (Sorghum, Maize)"])
        if state in ['punjab', 'haryana', 'uttar pradesh']:
            suggestions.extend(["Summer vegetables (Okra, Pumpkin)", "Fodder maize"])
        elif state in ['maharashtra', 'karnataka', 'andhra pradesh']:
            suggestions.extend(["Sunflower", "Green gram", "Cluster beans"])
    
    elif 'Winter' in season and not is_summer_focus:
        suggestions.extend(["Wheat", "Barley", "Mustard", "Peas", "Chickpeas"])
        if state in ['punjab', 'haryana', 'uttar pradesh']:
            suggestions.extend(["Potato", "Onion", "Garlic"])
    
    elif 'Monsoon' in season and not is_summer_focus:
        suggestions.extend(["Rice", "Maize", "Cotton", "Soybean", "Groundnut"])
        if state in ['maharashtra', 'karnataka', 'andhra pradesh']:
            suggestions.extend(["Sugarcane", "Turmeric", "Pulses"])
    
    elif not is_summer_focus:
        suggestions.extend(["Vegetables", "Pulses", "Oilseeds"])
        if state in ['tamil nadu', 'kerala']:
            suggestions.extend(["Banana", "Coconut", "Spices"])
    
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
        "peas","chickpeas","potato","onion","garlic","turmeric","pulses","vegetables","fodder","millets",
        "banana","coconut","spices","jute","agricultural alert", "agricultural alerts", "alert", "alerts", "today", "today's",
        "condition", "conditions", "agricultural advice", "farming advice", "crop advice",
        "agricultural recommendation", "farming recommendation", "crop recommendation",
        "agricultural tip", "farming tip", "crop tip", "agricultural suggestion", 
        "farming suggestion", "crop suggestion", "agricultural update", "farming update",
        "crop update", "agricultural report", "farming report", "crop report","humidity", 
        "high humidity", "low humidity", "humidity alert", "vegetable farming", "summer", "summers"
    ]
    
    query_lower = query.lower()
    
    if any(keyword in query_lower for keyword in agricultural_keywords):
        return True
    
    location_weather_keywords = [
        "weather", "temperature", "forecast", "rain", "humidity", "climate",
        "location", "where am i", "my location", "this area"
    ]
    
    if any(keyword in query_lower for keyword in location_weather_keywords):
        return True
    
    agricultural_compound_terms = [
        "high humidity", "low humidity", "humidity alert", "temperature alert", 
        "rain alert", "weather alert", "farm alert", "crop alert", "vegetable farm",
        "farming condition", "agricultural condition", "crop is best", "best crop",
        "which crop", "what to grow", "what to plant"
    ]
    
    if any(term in query_lower for term in agricultural_compound_terms):
        return True
    
    return False

def normalize_repeated_characters(text):
    """Normalize repeated characters in text (e.g., 'heelllllo' -> 'hello')"""
    normalized_text = re.sub(r'(.)\1+', r'\1', text)
    return normalized_text

def is_greeting_query(query):
    """Determine if the query is purely a greeting without agricultural content"""
    normalized_query = query.lower().strip()
    
    exact_greetings = [
        "hello", "hi", "hey", "greetings", "good morning", "good afternoon", 
        "good evening", "howdy", "what's up", "sup", "yo", "hola", "namaste",
        "namaskar", "hi there", "hello there", "hey there", "khamba ghani", 
        "ram ram", "pranam", "good day", "goodnight", "good night"
    ]
    
    if normalized_query in exact_greetings:
        return True
    
    for greeting in exact_greetings:
        if normalized_query.startswith(greeting + " ") or normalized_query == greeting:
            remaining_text = normalized_query[len(greeting):].strip()
            if len(remaining_text) <= 2 or not any(c.isalpha() for c in remaining_text):
                return True
    
    greeting_patterns = [
        r'^hi+$', r'^hello+$', r'^hey+$', r'^he+l+o+$', r'^h+i+$', r'^h+e+y+$',
        r'^hi+\s*$', r'^hello+\s*$', r'^hey+\s*$'
    ]
    
    for pattern in greeting_patterns:
        if re.match(pattern, normalized_query):
            return True
    
    return False

def has_agricultural_content_after_greeting(query):
    """Check if there's agricultural content after the greeting"""
    normalized_query = query.lower().strip()
    
    if is_greeting_query(query):
        return False
    
    patterns_to_remove = [
        r'^hi+\s+', r'^hello+\s+', r'^hey+\s+', r'^greetings\s+',
        r'^good morning\s+', r'^good afternoon\s+', r'^good evening\s+',
        r'^howdy\s+', r'^what\'s up\s+', r'^sup\s+', r'^yo\s+', 
        r'^hola\s+', r'^namaste\s+', r'^namaskar\s+', r'^hi there\s+',
        r'^hello there\s+', r'^hey there\s+', r'^khamba ghani\s+',
        r'^ram ram\s+', r'^pranam\s+'
    ]
    
    agricultural_part = normalized_query
    for pattern in patterns_to_remove:
        agricultural_part = re.sub(pattern, '', agricultural_part).strip()
    
    if agricultural_part == normalized_query:
        return is_agricultural_query(agricultural_part)
    
    if len(agricultural_part) <= 2 or not any(c.isalpha() for c in agricultural_part):
        return False
    
    return is_agricultural_query(agricultural_part)

def extract_agricultural_content(query):
    """Extract the agricultural part from a mixed query"""
    query_lower = query.lower()
    
    patterns_to_remove = [
        r'^hi+\s+', r'^hello+\s+', r'^hey+\s+', r'^greetings\s+',
        r'^good morning\s+', r'^good afternoon\s+', r'^good evening\s+',
        r'^howdy\s+', r'^what\'s up\s+', r'^sup\s+', r'^yo\s+', 
        r'^hola\s+', r'^namaste\s+', r'^namaskar\s+', r'^hi there\s+',
        r'^hello there\s+', r'^hey there\s+', r'^khamba ghani\s+',
        r'^ram ram\s+', r'^pranam\s+'
    ]
    
    agricultural_part = query_lower
    for pattern in patterns_to_remove:
        agricultural_part = re.sub(pattern, '', agricultural_part).strip()
    
    follow_up_words = ['there', 'sir', 'madam', 'friend', 'dear']
    words = agricultural_part.split()
    if words and words[0] in follow_up_words:
        agricultural_part = ' '.join(words[1:]).strip()
    
    if not agricultural_part or agricultural_part == query_lower:
        agricultural_part = normalize_repeated_characters(query.strip())
    
    return agricultural_part.capitalize() if agricultural_part else query

def get_friendly_greeting():
    """Get a friendly greeting response"""
    greetings = [
        "Hello! 👋 Thanks for your farming question!",
        "Hi there! 🌱 Great question about agriculture!",
        "Hey! 👨‍🌾 Wonderful farming question! Here's my advice:",
        "Greetings! 🌾 Thanks for asking about farming!",
        "Hello farmer! 🚜 Excellent question! Here's what I recommend:",
        "Hi! 🌻 Great to hear from you! Here's my farming advice:",
        "Hey there! 🌽 Thanks for your agricultural question!"
    ]
    
    import random
    return random.choice(greetings)

def handle_greeting_query(query):
    """Handle pure greeting queries with a friendly response"""
    normalized_query = normalize_repeated_characters(query.lower().strip())
    
    greetings = [
        "Hello! 👋 I'm your Agro Assistant, here to help with all your farming questions!",
        "Hi there! 🌱 I'm your farming assistant. How can I help you today?",
        "Hey! 👨‍🌾 I'm your agricultural assistant. What farming topic can I help you with?",
        "Greetings! 🌾 I'm here to assist with crops, weather, and farming advice!",
        "Hello farmer! 🚜 How can I help with your agricultural questions today?",
        "Hi! 🌻 Welcome to your farming assistant. What would you like to know about agriculture?",
        "Hey there! 🌽 Ready to talk farming? How can I assist you today?"
    ]
    
    import random
    response = random.choice(greetings)
    
    return {
        "query": query,
        "answer": response,
        "llm_source": "System Greeting",
        "sources": [],
        "agricultural_alerts": [],
        "crop_suggestions": []
    }

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

def add_references_to_answer(answer, source_documents):
    """Add reference information to the answer from top 2 documents"""
    if not source_documents:
        return answer
    
    unique_sources = []
    seen_files = set()
    
    for doc in source_documents[:2]:
        source_file = doc.metadata.get('source', '')
        if source_file and source_file not in seen_files:
            filename = os.path.basename(source_file)
            unique_sources.append(filename)
            seen_files.add(source_file)
    
    if unique_sources:
        ref_text = "Reference: " + ", ".join(unique_sources)
        if answer and not answer.endswith(('.', '!', '?')):
            answer += '.'
        answer += f" {ref_text}"
    
    return answer

def ensure_complete_sentences(text):
    """Ensure the text ends with complete sentences"""
    if not text:
        return text
    
    text = text.strip()
    
    if text.endswith(('.', '!', '?')):
        return text
    
    last_period = text.rfind('.')
    last_question = text.rfind('?')
    last_exclamation = text.rfind('!')
    
    last_end = max(last_period, last_question, last_exclamation)
    
    if last_end > 0:
        return text[:last_end + 1]
    else:
        return text + '.'

def process_regular_agricultural_query(query, user_location_data=None):
    """Process regular agricultural queries using Pinecone with frontend location data"""
    state = AgentState(
        query=query,
        documents=None,
        answer="",
        source_documents=[],
        weather_data={},
        user_location=user_location_data or {},
        llm_source="",
        error=None,
        needs_location=False,
        agricultural_alerts=[],
        crop_suggestions=[]
    )
    
    try:
        vector_store = get_vector_store()
        if not vector_store:
            return {"error": "Failed to initialize document database"}
        
        state["documents"] = vector_store
        
        state["needs_location"] = needs_location_detection(query)
        
        extracted_location = extract_location_from_query(query)
        query_lower = query.lower()
        is_weather_query = any(term in query_lower for term in ["weather", "temperature", "forecast", "rain", "humidity"])
        
        logger.info(f"DEBUG: Query: '{query}'")
        logger.info(f"DEBUG: Extracted location: '{extracted_location}'")
        logger.info(f"DEBUG: Is weather query: {is_weather_query}")
        logger.info(f"DEBUG: User provided location: {user_location_data}")
        
        if state["needs_location"]:
            # CASE 1: Special location reference ("my location", "here", etc.) - use user location
            special_references = ["my location", "current location", "here", "this area", "my area"]
            has_special_reference = any(ref in query_lower for ref in special_references)
            
            if has_special_reference and user_location_data and "error" not in user_location_data:
                logger.info("Special location reference detected - using user's actual location")
                state["user_location"] = user_location_data
                weather_data = get_weather_data(
                    user_location_data.get("latitude"),
                    user_location_data.get("longitude"),
                    user_location_data.get("city", "Unknown")
                )
                state["weather_data"] = weather_data
            
            # CASE 2: Specific location extracted from query
            elif extracted_location:
                logger.info(f"Using extracted location from query: {extracted_location}")
                state["user_location"] = {
                    "city": extracted_location,
                    "detected_via": "query extraction",
                    "explicitly_mentioned": True
                }
                weather_data = get_weather_data(None, None, extracted_location)
                state["weather_data"] = weather_data
            
            # CASE 3: Use frontend-provided location as fallback
            elif user_location_data and "error" not in user_location_data:
                logger.info("Using frontend-provided location data")
                state["user_location"] = user_location_data
                weather_data = get_weather_data(
                    user_location_data.get("latitude"),
                    user_location_data.get("longitude"),
                    user_location_data.get("city", "Unknown")
                )
                state["weather_data"] = weather_data
            
            # CASE 4: No location available
            else:
                logger.info("No location data available")
                state["user_location"] = {"error": "Location not available"}
                state["weather_data"] = {"error": "Location required for weather data"}
        
        # Check if this is a direct weather query that should be handled specially
        special_answer = handle_special_queries(query, state["user_location"], state["weather_data"])
        if special_answer:
            return {
                "query": query,
                "answer": special_answer,
                "llm_source": "Direct API Response",
                "sources": [],
                "location": state["user_location"] if "error" not in state["user_location"] else {},
                "weather": state["weather_data"] if "error" not in state["weather_data"] else {},
                "season": get_seasonal_info(query),
                "agricultural_alerts": [],
                "crop_suggestions": []
            }
        
        # Rest of the function remains the same...
        query_hash = get_query_hash(query, state["user_location"], state["weather_data"])
        cached_response = check_cache(query_hash)
        if cached_response:
            return cached_response
        
        logger.info("Retrieving relevant documents from Pinecone...")
        relevant_docs = retrieve_relevant_documents(query, COSINE_THRESHOLD)
        state["source_documents"] = relevant_docs
        
        season_info = get_seasonal_info(query)
        
        state["agricultural_alerts"] = get_agricultural_alerts(state["weather_data"], season_info)
        state["crop_suggestions"] = get_crop_suggestions(state["user_location"], state["weather_data"], season_info)
        
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
        
        answer = add_references_to_answer(answer, state["source_documents"])
        answer = ensure_complete_sentences(answer)
        state["answer"] = answer
        
        response = format_response(state, season_info)
        save_to_cache(query_hash, response)
        
        return response
        
    except Exception as e:
        error_msg = f"Error processing query: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

def process_agricultural_query_with_greeting(query, user_location_data=None):
    """Process queries that start with greeting but have agricultural content"""
    agricultural_part = extract_agricultural_content(query)
    
    response = process_regular_agricultural_query(agricultural_part, user_location_data)
    
    if "error" not in response:
        greeting = get_friendly_greeting()
        response["answer"] = f"{greeting}\n\n{response['answer']}"
        response["llm_source"] = f"System Greeting + {response['llm_source']}"
    
    return response

def process_query(query, user_location_data=None):
    """Main function to process a user query with optional frontend location data"""
    logger.info(f"Processing query: {query}")
    logger.info(f"User location data: {user_location_data}")
    
    normalized_query = query.lower().strip()
    
    if is_greeting_query(query):
        logger.info("Pure greeting detected")
        return handle_greeting_query(query)
    
    elif not is_agricultural_query(query):
        logger.info("Non-agricultural query detected")
        return handle_non_agricultural_query(query)
    
    else:
        agricultural_part = extract_agricultural_content(query)
        has_greeting_removed = agricultural_part.lower() != normalized_query
        
        if has_greeting_removed and has_agricultural_content_after_greeting(query):
            logger.info("Mixed query detected: greeting + agricultural content")
            return process_agricultural_query_with_greeting(query, user_location_data)
        else:
            logger.info("Regular agricultural query detected")
            return process_regular_agricultural_query(query, user_location_data)

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
    
    if state["user_location"] and "error" not in state["user_location"]:
        response["location"] = {
            "city": state["user_location"].get("city", "Unknown"),
            "state": state["user_location"].get("state", "Unknown"),
            "country": state["user_location"].get("country", "Unknown")
        }
    
    if state["weather_data"] and "error" not in state["weather_data"]:
        response["weather"] = state["weather_data"]
    
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

# ===== DOCUMENT UPDATE FUNCTION =====
def update_vector_store_with_new_documents():
    """Update Pinecone vector store with new documents"""
    try:
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        index = pc.Index(PINECONE_INDEX_NAME)
        current_stats = index.describe_index_stats()
        current_count = current_stats.get('total_vector_count', 0)
        
        documents = load_pdf_documents()
        if not documents:
            logger.info("No new documents found")
            return {"status": "no_new_documents", "current_count": current_count}
        
        chunks = create_chunks(documents)
        new_count = len(chunks)
        
        if new_count <= current_count:
            logger.info("No new documents to add")
            return {"status": "no_new_documents", "current_count": current_count}
        
        embedding_model = get_embedding_model()
        
        for chunk in chunks:
            chunk.metadata.update({
                'ingestion_time': datetime.now().isoformat(),
                'document_version': '1.0',
                'processed_by': 'agro_assistant_v2'
            })
        
        vector_store = PineconeVectorStore.from_documents(
            documents=chunks,
            embedding=embedding_model,
            index_name=PINECONE_INDEX_NAME
        )
        
        logger.info(f"Updated Pinecone with {new_count} vectors (was {current_count})")
        
        return {
            "status": "success",
            "documents_added": new_count - current_count,
            "total_vectors": new_count,
            "previous_count": current_count
        }
        
    except Exception as e:
        logger.error(f"Document update failed: {str(e)}")
        API_ERRORS.labels(api_name='pinecone').inc()
        return {"status": "error", "error": str(e)}

def cleanup_old_cache():
    """Clean up expired cache files"""
    try:
        current_time = time.time()
        for filename in os.listdir(CACHE_DIR):
            if filename.endswith('.pkl'):
                filepath = os.path.join(CACHE_DIR, filename)
                file_time = os.path.getmtime(filepath)
                cache_age_hours = (current_time - file_time) / 3600
                
                if cache_age_hours > CACHE_EXPIRY_HOURS:
                    os.remove(filepath)
                    logger.info(f"Removed expired cache: {filename}")
    except Exception as e:
        logger.error(f"Cache cleanup error: {str(e)}")

def display_system_info(health_status):
    """Display comprehensive system information"""
    print("\n" + "="*70)
    print("🌱 AGRO ASSISTANT - PRODUCTION READY")
    print("="*70)
    print(f"✅ Health Status: {health_status.get('status', 'unknown')}")
    print(f"📊 Metrics: http://localhost:{Config.METRICS_PORT}")
    print(f"🔧 Version: 2.0.0")
    print(f"🐳 Environment: Production")
    print("="*70)
    
    stats = get_vector_store_stats()
    if "error" not in stats:
        print(f"📚 Vector Store: {stats['total_vectors']} vectors")
    
    show_pinecone_setup_guide()

def start_background_tasks(health_checker):
    """Start background maintenance tasks"""
    def health_monitor():
        while True:
            health_checker.check_health()
            time.sleep(Config.HEALTH_CHECK_INTERVAL)
    
    def cache_cleaner():
        while True:
            cleanup_old_cache()
            time.sleep(3600)
    
    threading.Thread(target=health_monitor, daemon=True).start()
    threading.Thread(target=cache_cleaner, daemon=True).start()

def handle_document_update():
    """Handle document updates with progress tracking"""
    print("🔄 Checking for new documents...")
    result = update_vector_store_with_new_documents()
    
    if result["status"] == "success":
        print(f"✅ Documents updated successfully!")
        print(f"📊 Added {result['documents_added']} new documents")
        print(f"📚 Total vectors: {result['total_vectors']}")
    elif result["status"] == "no_new_documents":
        print("ℹ️ No new documents found")
    else:
        print(f"❌ Update failed: {result.get('error', 'Unknown error')}")

def display_health_status():
    """Display current system health"""
    health_checker = HealthChecker()
    health = health_checker.check_health()
    
    print("\n" + "="*50)
    print("SYSTEM HEALTH STATUS")
    print("="*50)
    
    # Safe access to health status
    overall_status = health.get('status', 'unknown')
    is_healthy = health.get('healthy', False)
    
    print(f"Overall Status: {'✅ HEALTHY' if is_healthy else '❌ UNHEALTHY'} ({overall_status})")
    
    checks = health.get('checks', {})
    for check_name, check_result in checks.items():
        status = "✅" if check_result else "❌"
        print(f"{status} {check_name.replace('_', ' ').title()}")
    
    if 'error' in health:
        print(f"🔴 Error: {health['error']}")
    
    print("="*50)

def display_system_stats():
    """Display system statistics"""
    stats = get_vector_store_stats()
    
    print("\n" + "="*50)
    print("SYSTEM STATISTICS")
    print("="*50)
    
    if "error" not in stats:
        print(f"📚 Vector Store: {stats['total_vectors']} vectors")
        print(f"📐 Embedding Dimensions: {stats['embedding_dimensions']}")
    
    memory = psutil.virtual_memory()
    print(f"💾 Memory Usage: {memory.percent}%")
    
    cpu = psutil.cpu_percent()
    print(f"⚡ CPU Usage: {cpu}%")
    
    print("="*50)

def setup_signal_handlers():
    """Setup graceful shutdown handlers"""
    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}, shutting down gracefully...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

def main():
    """Production main function with monitoring and health checks"""
    setup_signal_handlers()
    
    # Start metrics server
    start_http_server(Config.METRICS_PORT)
    logger.info(f"Metrics server started on port {Config.METRICS_PORT}")
    
    # Initialize components
    try:
        initialize_components()
        
        # Health check
        health_checker = HealthChecker()
        health_status = health_checker.check_health()
        
        # Display system info even if health check fails
        display_system_info(health_status)
        
        if not health_status.get('healthy', False):
            logger.warning("System health check failed, but continuing with limited functionality")
            print("⚠️  System has some issues, but continuing with limited functionality...")
        
        # Start background tasks
        start_background_tasks(health_checker)
        
        # Main application loop
        print("\n🌱 Welcome to Agro Assistant (Production)!")
        print("Available commands:")
        print("  • Ask any agricultural question")
        print("  • 'update' - Update documents")
        print("  • 'health' - System health check")
        print("  • 'stats' - System statistics")
        print("  • 'exit' - Quit application")
        print()
        
        while True:
            try:
                query = input("📝 Your question: ").strip()
                
                if query.lower() in ['exit', 'quit', 'bye']:
                    print("👋 Goodbye!")
                    break
                elif query.lower() == 'update':
                    handle_document_update()
                    continue
                elif query.lower() == 'health':
                    display_health_status()
                    continue
                elif query.lower() == 'stats':
                    display_system_stats()
                    continue
                    
                if not query:
                    continue
                
                # Process query with monitoring
                ACTIVE_QUERIES.inc()
                start_time = time.time()
                
                try:
                    response = process_query(query)
                    QUERY_COUNTER.labels(
                        llm_source=response.get('llm_source', 'unknown'),
                        status='success'
                    ).inc()
                except Exception as e:
                    QUERY_COUNTER.labels(llm_source='unknown', status='error').inc()
                    response = {"error": f"Processing error: {str(e)}"}
                finally:
                    QUERY_DURATION.observe(time.time() - start_time)
                    ACTIVE_QUERIES.dec()
                
                display_response(response)
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ System error: {str(e)}")
                logger.error(f"Main loop error: {str(e)}")
                
    except KeyboardInterrupt:
        logger.info("Application shutdown requested")
    except Exception as e:
        logger.error(f"Application error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()