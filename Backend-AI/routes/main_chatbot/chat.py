from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List
from dotenv import load_dotenv
import os
import logging
import requests
import json
from datetime import datetime
import google.generativeai as genai

# Configure logging
logging.getLogger().setLevel(logging.ERROR)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

PDF_DIR = "data"
VECTOR_STORE_DIR = "vector_store/chat_db_faiss"
GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
COSINE_THRESHOLD = 0.5

# Define state
class AgentState(TypedDict):
    query: str
    documents: List
    answer: str
    source_documents: List
    weather_data: dict
    temperature_data: dict
    user_location: dict
    tool_outputs: List
    llm_source: str
    error: str
    season_info: dict
    needs_location: bool

def load_pdf(path):
    """Load PDF documents from directory"""
    loader = DirectoryLoader(
        path,
        glob='*.pdf',
        loader_cls=PyPDFLoader
    )
    return loader.load()

def create_chunks(documents):
    """Split documents into chunks"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    return text_splitter.split_documents(documents)

def get_embedding_model():
    """Initialize embedding model"""
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def create_vector_store(chunks, embedding_model, persist_directory=VECTOR_STORE_DIR):
    """Create and persist FAISS vector store"""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(persist_directory), exist_ok=True)
    
    vector_store = FAISS.from_documents(documents=chunks, embedding=embedding_model)
    vector_store.save_local(persist_directory)
    return vector_store

def get_llm():
    """Initialize Groq LLM with proper error handling"""
    api_key = os.getenv("GROQ_API_KEY") 
    if not api_key:
        raise ValueError("Missing GROQ_API_KEY in environment variables")

    try:
        return ChatGroq(
            temperature=0.3,
            groq_api_key=api_key,
            model_name=GROQ_MODEL,
            max_tokens=512
        )
    except Exception as e:
        raise ValueError(f"Failed to initialize Groq LLM: {str(e)}")

def get_gemini_model():
    """Initialize Gemini model for fallback"""
    api_key = os.getenv("GEMINI_API_KEY") or "AIzaSyBzAV8r2Mkx0ETndVYYUSOW7rMhD2QlgSk"
    if not api_key:
        raise ValueError("Missing GEMINI_API_KEY in environment variables")
    
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-2.0-flash")
    except Exception as e:
        raise ValueError(f"Failed to initialize Gemini model: {str(e)}")

def cosine_threshold_retriever(vector_store, query, embedding_model, threshold=0.5, top_k=10):
    embedded_query = embedding_model.embed_query(query)
    docs_and_scores = vector_store.similarity_search_with_score_by_vector(embedded_query, k=top_k)
    filtered_docs = [doc for doc, score in docs_and_scores if score >= threshold]
    return filtered_docs

def is_poor_answer(answer):
    """Check if the answer from Groq is unsatisfactory or too verbose"""
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
    
    # Check for overly verbose answers (more than 150 words)
    if len(answer.split()) > 150:
        return True
    
    # Check for poor indicators
    for indicator in poor_indicators:
        if indicator in answer_lower:
            return True
    
    return False

def truncate_answer(answer, max_words=200):
    """Truncate answer to specified word count"""
    words = answer.split()
    if len(words) > max_words:
        return " ".join(words[:max_words]) + "..."
    return answer

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

def needs_location_detection(query):
    """Determine if query needs location detection"""
    location_keywords = [
        "my location", "here", "this area", "this region", "locally", 
        "in my area", "around here", "for me", "this place",
        "weather", "temperature", "forecast", "rain", "sunny", "humidity", "climate"
    ]
    
    crop_keywords = [
        "crop", "crops", "farming", "agriculture", "planting", "cultivation",
        "season", "seasonal", "grow", "growing", "plant", "harvest"
    ]
    
    query_lower = query.lower()
    
    # Check if it's a location-dependent query
    has_location_keyword = any(keyword in query_lower for keyword in location_keywords)
    has_crop_keyword = any(keyword in query_lower for keyword in crop_keywords)
    
    # Special case: if it's specifically about temperature/weather, it needs location
    is_weather_temp_query = any(kw in query_lower for kw in ["temperature", "weather", "forecast"])
    
    return has_location_keyword or (has_crop_keyword and ("my" in query_lower or "here" in query_lower)) or is_weather_temp_query

# Geoapify API Tool for location detection
def detect_user_location():
    """Detect user's location using Geoapify API"""
    try:
        api_key = os.getenv("GEOAPIFY_API_KEY") or "963418ee0f5e478abdb114f824bf4f6a"
        if not api_key:
            return {"error": "Geoapify API key not configured in environment variables"}
        
        # Get IP-based location
        url = f"https://api.geoapify.com/v1/ipinfo?apiKey={api_key}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "city": data.get("city", {}).get("name", "Unknown"),
                "country": data.get("country", {}).get("name", "Unknown"),
                "state": data.get("state", {}).get("name", "Unknown"),
                "latitude": data.get("location", {}).get("latitude"),
                "longitude": data.get("location", {}).get("longitude"),
                "detected_via": "IP geolocation"
            }
        else:
            return {"error": f"Failed to detect location: HTTP {response.status_code}"}
    except Exception as e:
        return {"error": f"Location detection error: {str(e)}"}

# Weather API Tool with automatic location detection
def get_weather_data(location: str = None):
    """Get current weather data - automatically detects location if not provided"""
    try:
        if not location:
            user_location = detect_user_location()
            if "error" in user_location:
                return user_location
            location = user_location.get("city", "New Delhi")
        
        api_key = os.getenv("OPENWEATHER_API_KEY") or "57fdae09256220490933044e4a0c3ff9"
        if not api_key:
            return {"error": "OpenWeather API key not configured in environment variables"}
        
        # Use direct API call with proper encoding
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "main" in data:
                return {
                    "location": data.get("name", location),
                    "temperature": data["main"].get("temp", "N/A"),
                    "humidity": data["main"].get("humidity", "N/A"),
                    "conditions": data["weather"][0].get("description", "N/A"),
                    "wind_speed": data["wind"].get("speed", "N/A"),
                    "pressure": data["main"].get("pressure", "N/A"),
                    "visibility": data.get("visibility", "N/A")
                }
            else:
                return {"error": f"No weather data found for {location}"}
        else:
            return {"error": f"Failed to get weather for {location}: HTTP {response.status_code}"}
    except Exception as e:
        return {"error": f"Weather API error: {str(e)}"}

# Temperature Forecast Tool with automatic location detection
def get_temperature_forecast(location: str = None, days: int = 3):
    """Get temperature forecast - automatically detects location if not provided"""
    try:
        # If no location provided, detect it automatically
        if not location:
            user_location = detect_user_location()
            if "error" in user_location:
                return user_location
            location = user_location.get("city", "New Delhi")
        
        api_key = os.getenv("OPENWEATHER_API_KEY") or "57fdae09256220490933044e4a0c3ff9"
        if not api_key:
            return {"error": "OpenWeather API key not configured in environment variables"}
        
        url = f"http://api.openweathermap.org/data/2.5/forecast?q={location}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            forecasts = []
            for item in data["list"][:days*8]:  # 8 forecasts per day
                forecast_time = datetime.fromtimestamp(item["dt"])
                forecasts.append({
                    "datetime": forecast_time.strftime("%Y-%m-%d %H:%M"),
                    "temperature": item["main"]["temp"],
                    "feels_like": item["main"]["feels_like"],
                    "conditions": item["weather"][0]["description"],
                    "humidity": item["main"]["humidity"]
                })
            
            return {
                "location": data["city"]["name"],
                "country": data["city"]["country"],
                "forecasts": forecasts[:days*3],  # Return 3 forecasts per day
                "detected_location": location
            }
        else:
            return {"error": f"Failed to get forecast data for {location}: HTTP {response.status_code}"}
    except Exception as e:
        return {"error": f"Forecast API error: {str(e)}"}

def get_seasonal_info():
    """Get current season information for India"""
    current_month = datetime.now().month
    
    # Define seasons for India
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
        "month": current_month,
        "season_name": season.split("(")[0].strip()
    }

def extract_location_from_query(query):
    """Extract location name from a query"""
    # List of common Indian cities and location indicators
    indian_cities = [
        "kanpur", "delhi", "mumbai", "chennai", "kolkata", "bangalore", 
        "hyderabad", "pune", "jaipur", "lucknow", "gurgaon", "gurugram",
        "ahmedabad", "surat", "kochi", "bhopal", "indore", "nagpur",
        "patna", "varanasi", "ludhiana", "agra", "nashik", "faridabad"
    ]
    
    query_lower = query.lower()
    
    # Check for specific city mentions
    for city in indian_cities:
        if city in query_lower:
            return city.title()
    
    # Try to extract location based on common patterns
    location_patterns = [
        "temperature of", "weather in", "weather at", "weather for",
        "temperature in", "temperature at", "temperature for",
        "forecast in", "forecast at", "forecast for"
    ]
    
    for pattern in location_patterns:
        if pattern in query_lower:
            parts = query_lower.split(pattern)
            if len(parts) > 1:
                potential_location = parts[1].strip().split()[0]
                if len(potential_location) > 2:  # Avoid very short words
                    return potential_location.title()
    
    return None

def generate_answer_with_gemini(query, source_documents=None, weather_data=None, temperature_data=None, user_location=None, season_info=None):
    """Generate answer using Gemini as the primary LLM"""
    try:
        gemini_model = get_gemini_model()
        
        # Create enhanced prompt with emphasis on conciseness
        context_text = ""
        if source_documents:
            context_text = "\n".join([doc.page_content for doc in source_documents[:3]])
        
        # Add location context if available
        location_context = ""
        if user_location and "city" in user_location and "error" not in user_location:
            location_context = f"\nUser Location: {user_location['city']}, {user_location.get('state', '')}, {user_location.get('country', '')}"
        
        # Add seasonal context
        seasonal_context = ""
        if season_info:
            seasonal_context = f"\nCurrent Season: {season_info['current_season']}\nSeason Description: {season_info['description']}"
        
        # Add weather context if available
        weather_context = ""
        if weather_data and "error" not in weather_data:
            weather_context = f"\nCurrent Weather Data: {json.dumps(weather_data, indent=2)}"
        elif weather_data and "error" in weather_data:
            weather_context = f"\nWeather API Error: {weather_data['error']}"
            
        if temperature_data and "error" not in temperature_data:
            weather_context += f"\nTemperature Forecast: {json.dumps(temperature_data, indent=2)}"
        elif temperature_data and "error" in temperature_data:
            weather_context += f"\nForecast API Error: {temperature_data['error']}"
        
        prompt = f"""
        You are an expert farming assistant. Please provide a concise and precise answer to the following question.
        Answer should be direct, to the point, and not exceed 120 words.
        
        Question: {query}
        
        Context from documents (if available):
        {context_text}
        {location_context}
        {seasonal_context}
        {weather_context}
        
        If you have location and seasonal information, provide specific crop recommendations for that location and season.
        If you have weather data, incorporate it into your recommendations.
        If the context doesn't fully answer the question, use your agricultural knowledge to provide practical advice.
        Focus on providing actionable, location-specific recommendations when possible.
        
        """
        
        response = gemini_model.generate_content(prompt)
        return response.text.strip(), "Gemini"
        
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")

# Define nodes
def load_documents_node(state: AgentState):
    """Load or create vector store"""
    logging.info("Loading documents...")
    
    try:
        # Check if vector store exists in the vector_store folder
        faiss_index_path = os.path.join(VECTOR_STORE_DIR, "index.faiss")
        faiss_pkl_path = os.path.join(VECTOR_STORE_DIR, "index.pkl")
        
        if os.path.exists(faiss_index_path) and os.path.exists(faiss_pkl_path):
            logging.info("Loading existing FAISS vector store from vector_store/chat_db_faiss...")
            embedding_model = get_embedding_model()
            vector_store = FAISS.load_local(
                VECTOR_STORE_DIR,
                embeddings=embedding_model,
                allow_dangerous_deserialization=True
            )
        else:
            logging.info("Creating new FAISS vector store from PDFs...")
            documents = load_pdf("data")
            chunks = create_chunks(documents)
            embedding_model = get_embedding_model()
            vector_store = create_vector_store(chunks, embedding_model, VECTOR_STORE_DIR)
        
        # Check if the query needs location detection
        needs_loc = needs_location_detection(state["query"])
        
        return {
            "documents": vector_store,  # This should be the FAISS object, not a list
            "needs_location": needs_loc,
            "season_info": get_seasonal_info(),
            "error": None
        }
    except Exception as e:
        return {"error": f"Failed to load documents: {str(e)}"}

def detect_location_node(state: AgentState):
    """Detect user location for location-dependent queries"""
    logging.info("Detecting user location...")
    
    if state.get("needs_location", False):
        user_location = detect_user_location()
        return {"user_location": user_location, "error": None}
    
    return {"user_location": {}, "error": None}

def retrieve_documents_node(state: AgentState):
    """Retrieve relevant documents"""
    logging.info("Retrieving relevant documents...")
    
    try:
        vector_store = state["documents"]
        query = state["query"]
        embedding_model = get_embedding_model()
        
        retrieved_docs = cosine_threshold_retriever(
            vector_store, query, embedding_model, threshold=COSINE_THRESHOLD
        )
        
        return {"source_documents": retrieved_docs, "error": None}
    except Exception as e:
        return {"error": f"Failed to retrieve documents: {str(e)}"}

def generate_answer_node(state: AgentState):
    """Generate answer using Gemini as the primary LLM"""
    logging.info("Generating answer...")
    
    try:
        query = state["query"]
        user_location = state.get("user_location", {})
        source_documents = state.get("source_documents", [])
        season_info = state.get("season_info", {})
        needs_location = state.get("needs_location", False)

        # Enhanced query type detection
        weather_keywords = ["weather", "temperature", "forecast", "rain", "sunny", "humidity", "climate", "hot", "cold", "warm"]
        location_keywords = ["location", "where am i", "my city", "detect location", "what is my location"]
        
        query_lower = query.lower()
        is_weather_query = any(k in query_lower for k in weather_keywords)
        is_location_query = any(k in query_lower for k in location_keywords) and not is_weather_query

        # 🔹 Location-only query → Skip LLM
        if is_location_query:
            location = user_location.get("city") or detect_user_location().get("city", "Unknown")
            return {
                "answer": f"Your current detected location is {location}.",
                "source_documents": [],
                "llm_source": "Location API",
                "weather_data": {},
                "temperature_data": {},
                "season_info": season_info,
                "user_location": user_location,
                "error": None
            }

        # 🔹 Weather/temperature query → Call API directly
        if is_weather_query:
            # Use detected location or extract from query
            location = user_location.get("city") or extract_location_from_query(query) or "New Delhi"
            
            # Debug: Print the location being used
            print(f"DEBUG: Using location: {location}")
            
            # Get weather data
            weather_data = get_weather_data(location)
            forecast = get_temperature_forecast(location)
            
            # Debug: Print weather API response
            print(f"DEBUG: Weather API response: {weather_data}")
            
            # If weather API fails, use Gemini to provide a helpful response
            if "error" in weather_data:
                print(f"DEBUG: Weather API error: {weather_data['error']}")
                answer, source = generate_answer_with_gemini(
                    query, source_documents, weather_data, forecast, user_location, season_info
                )
                return {
                    "answer": answer,
                    "source_documents": [],
                    "llm_source": source,
                    "weather_data": weather_data,
                    "temperature_data": forecast,
                    "season_info": season_info,
                    "user_location": user_location,
                    "error": None
                }
            
            # 🔹 Create a proper temperature response
            temp = weather_data.get('temperature', 'N/A')
            conditions = weather_data.get('conditions', 'N/A')
            location_name = weather_data.get('location', location)
            
            # Special handling for temperature-specific queries
            if "temperature" in query_lower:
                if temp != 'N/A':
                    answer = f"The current temperature at your location ({location_name}) is {temp}°C."
                    if conditions != 'N/A':
                        answer += f" Weather conditions: {conditions}."
                else:
                    answer = f"Sorry, I couldn't retrieve the temperature for {location_name}. Please try again later."
            else:
                answer = f"Current weather in {location_name}: {temp}°C, {conditions}."
            
            return {
                "answer": answer,
                "source_documents": [],
                "llm_source": "OpenWeather API",
                "weather_data": weather_data,
                "temperature_data": forecast,
                "season_info": season_info,
                "user_location": user_location,
                "error": None
            }

        # 🔹 Else → Use Gemini as the primary LLM
        answer, source = generate_answer_with_gemini(
            query, source_documents, {}, {}, user_location, season_info
        )

        return {
            "answer": answer,
            "source_documents": source_documents,
            "llm_source": source,
            "weather_data": {},
            "temperature_data": {},
            "season_info": season_info,
            "user_location": user_location,
            "error": None
        }

    except Exception as e:
        return {"error": f"Failed to generate answer: {str(e)}"}

def output_node(state: AgentState):
    """Format and output the final result"""
    logging.info("Formatting output...")
    
    if state.get("error"):
        return {"error": state["error"]}
    
    # Apply conciseness filters to the answer
    concise_answer = remove_redundancies(state["answer"])
    concise_answer = truncate_answer(concise_answer, max_words=120)
    
    result = {
        "query": state["query"],
        "answer": concise_answer,  # Use the filtered answer
        "llm_source": state.get("llm_source", "Unknown")
    }
    
    if "source_documents" in state and state["source_documents"]:
        result["source_documents"] = state["source_documents"]
    
    if "weather_data" in state:
        result["weather_data"] = state["weather_data"]
    
    if "temperature_data" in state:
        result["temperature_data"] = state["temperature_data"]
    
    if "user_location" in state and state["user_location"]:
        result["user_location"] = state["user_location"]
    
    if "season_info" in state and state["season_info"]:
        result["season_info"] = state["season_info"]
    
    return result

# Create LangGraph workflow
def create_workflow():
    """Create the LangGraph workflow"""
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("load_documents", load_documents_node)
    workflow.add_node("detect_location", detect_location_node)
    workflow.add_node("retrieve_documents", retrieve_documents_node)
    workflow.add_node("generate_answer", generate_answer_node)
    workflow.add_node("output", output_node)
    
    # Add edges with conditional routing
    workflow.set_entry_point("load_documents")
    workflow.add_conditional_edges(
        "load_documents",
        lambda state: "detect_location" if state.get("needs_location", False) else "retrieve_documents"
    )
    workflow.add_edge("detect_location", "retrieve_documents")
    workflow.add_edge("retrieve_documents", "generate_answer")
    workflow.add_edge("generate_answer", "output")
    workflow.add_edge("output", END)
    
    return workflow.compile()

# Main execution function
def main():
    """Main function to run the workflow"""
    workflow = create_workflow()
    
    # Test with temperature query
    query = "what is the temperature of my current location"
    
    # Initialize state
    initial_state = {
        "query": query,
        "documents": [],
        "answer": "",
        "source_documents": [],
        "weather_data": {},
        "temperature_data": {},
        "user_location": {},
        "tool_outputs": [],
        "llm_source": "",
        "error": None,
        "season_info": {},
        "needs_location": False
    }
    
    # Execute the workflow
    result = workflow.invoke(initial_state)
    
    print(f"Query: {result['query']}")
    print(f"Answer: {result['answer']}")
    print(f"Source: {result['llm_source']}")
    
    if 'user_location' in result and result['user_location']:
        print(f"Detected Location: {result['user_location']}")

if __name__ == "__main__":
    main()