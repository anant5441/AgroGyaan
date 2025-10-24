import os
import base64
import logging
from typing import Optional, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Import reusable functions from your existing code
from .chat import (
    get_embedding_model,
    get_pinecone_vector_store,
    retrieve_relevant_documents,
    get_seasonal_info,
    get_agricultural_alerts,
    get_crop_suggestions,
    detect_user_location,
    get_weather_data,
    needs_location_detection,
    extract_location_from_query
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        self.gemini_model = None
        self.vector_store = None
        self.initialized = False
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize Gemini and reuse existing Pinecone components"""
        try:
            # Initialize Gemini
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
            genai.configure(api_key=api_key)
            self.gemini_model = genai.GenerativeModel("gemini-2.5-pro")
            logger.info("Gemini model initialized successfully")
            
            # Reuse existing Pinecone vector store
            self.vector_store = get_pinecone_vector_store()
            if self.vector_store:
                logger.info("Successfully reused existing Pinecone vector store")
            else:
                logger.warning("Could not initialize Pinecone vector store")
            
            self.initialized = True
            logger.info("Image processor initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize image processor: {str(e)}")
            raise
    
    def _get_contextual_data(self, query: str):
        """Get location, weather, and seasonal context using existing functions"""
        context_data = {
            "location_data": {},
            "weather_data": {},
            "season_info": get_seasonal_info(query),
            "agricultural_alerts": [],
            "crop_suggestions": []
        }
        
        try:
            # Check if query needs location detection
            if needs_location_detection(query):
                extracted_location = extract_location_from_query(query)
                
                if extracted_location:
                    # Use extracted location
                    context_data["location_data"] = {
                        "city": extracted_location,
                        "detected_via": "query extraction"
                    }
                    context_data["weather_data"] = get_weather_data(None, None, extracted_location)
                else:
                    # Detect user location
                    location_data = detect_user_location()
                    context_data["location_data"] = location_data
                    
                    if "error" not in location_data:
                        context_data["weather_data"] = get_weather_data(
                            location_data.get("latitude"),
                            location_data.get("longitude"),
                            location_data.get("city", "Unknown")
                        )
            
            # Get agricultural alerts and crop suggestions
            if context_data["weather_data"] and "error" not in context_data["weather_data"]:
                context_data["agricultural_alerts"] = get_agricultural_alerts(
                    context_data["weather_data"], 
                    context_data["season_info"]
                )
                context_data["crop_suggestions"] = get_crop_suggestions(
                    context_data["location_data"],
                    context_data["weather_data"],
                    context_data["season_info"]
                )
                
        except Exception as e:
            logger.error(f"Error getting contextual data: {str(e)}")
        
        return context_data
    
    def _build_context_prompt(self, query: str, context_text: str, contextual_data: Dict) -> str:
        """Build comprehensive prompt with all contextual information"""
        
        location_context = ""
        if contextual_data["location_data"] and "error" not in contextual_data["location_data"]:
            loc = contextual_data["location_data"]
            location_context = f"Location: {loc.get('city', 'Unknown')}, {loc.get('state', 'Unknown')}, {loc.get('country', 'Unknown')}"
        
        weather_context = ""
        if contextual_data["weather_data"] and "error" not in contextual_data["weather_data"]:
            weather = contextual_data["weather_data"]
            weather_context = f"Weather: {weather.get('temperature', 'N/A')}°C, {weather.get('conditions', 'N/A')}, Humidity: {weather.get('humidity', 'N/A')}%"
        
        season_context = f"Season: {contextual_data['season_info'].get('current_season', 'N/A')} - {contextual_data['season_info'].get('description', '')}"
        
        agricultural_context = ""
        if contextual_data["agricultural_alerts"]:
            agricultural_context = f"Agricultural Alerts: {', '.join(contextual_data['agricultural_alerts'])}"
        
        crop_context = ""
        if contextual_data["crop_suggestions"]:
            crop_context = f"Crop Suggestions: {', '.join(contextual_data['crop_suggestions'])}"

        return f"""
        You are an expert agricultural assistant specializing in image analysis for farming. 
        Analyze the provided image and answer the user's question using visual analysis combined with contextual farming information.

        CONTEXTUAL FARMING INFORMATION FROM DATABASE:
        {context_text if context_text else "No specific contextual information available. Use your comprehensive agricultural knowledge."}

        ADDITIONAL CONTEXT:
        {location_context}
        {weather_context}
        {season_context}
        {agricultural_context}
        {crop_context}

        USER'S QUESTION: {query}

        IMAGE ANALYSIS INSTRUCTIONS:
        1. Carefully examine the agricultural image for crops, plants, soil conditions, or farming practices
        2. Identify any visible issues: diseases, pests, nutrient deficiencies, water problems, growth abnormalities
        3. Analyze plant health indicators: leaf color, size, shape, spots, wilting, etc.
        4. Consider soil conditions, irrigation status, and environmental factors
        5. Combine visual analysis with the contextual information above

        RESPONSE GUIDELINES:
        - Be practical, specific, and farmer-friendly
        - Suggest immediate actionable advice and treatments
        - Recommend preventive measures for future
        - Consider location-specific factors (climate, season, regional practices)
        - If uncertain about diagnosis, suggest next steps or consultation
        - Keep response comprehensive but under 250 words
        - Focus on solutions and practical recommendations

        SPECIFIC ANALYSIS AREAS:
        - Crop disease identification and organic/chemical treatment options
        - Pest detection and integrated pest management strategies
        - Nutrient deficiency analysis and fertilization recommendations
        - Irrigation assessment and water management advice
        - Soil health evaluation and improvement suggestions
        - Growth stage analysis and harvest timing recommendations
        - Farming practice optimization

        Please provide a clear, practical analysis that combines image observations with contextual farming knowledge:
        """
    
    async def process_image_query(self, query: str, image_b64: str, image_type: str) -> Dict[str, Any]:
        """
        Process image queries using Gemini with comprehensive Pinecone document context
        
        Args:
            query: User's text query
            image_b64: Base64 encoded image data
            image_type: MIME type of the image
        
        Returns:
            dict: Response with answer and metadata
        """
        if not self.initialized:
            raise RuntimeError("Image processor not initialized")
        
        try:
            # Step 1: Get contextual data (location, weather, season)
            contextual_data = self._get_contextual_data(query)
            
            # Step 2: Retrieve relevant documents from Pinecone
            relevant_docs = retrieve_relevant_documents(query, threshold=0.5)
            context_text = self._extract_context_from_documents(relevant_docs)
            
            # Step 3: Build comprehensive prompt
            prompt = self._build_context_prompt(query, context_text, contextual_data)
            
            # Step 4: Generate response using Gemini with image
            response = self.gemini_model.generate_content([
                prompt,
                {
                    "mime_type": image_type,
                    "data": image_b64
                }
            ])
            
            answer = response.text.strip()
            
            # Step 5: Format comprehensive response
            return self._format_response(
                query=query,
                answer=answer,
                relevant_docs=relevant_docs,
                contextual_data=contextual_data
            )
            
        except Exception as e:
            logger.error(f"Error processing image query: {str(e)}")
            return self._format_error_response(query, str(e))
    
    def _extract_context_from_documents(self, documents):
        """Extract context text from retrieved documents"""
        if not documents:
            return ""
        
        # Use top 2 documents and limit content length
        context_parts = []
        for doc in documents[:2]:
            content = doc.page_content
            # Limit to first 500 characters to avoid token limits
            if len(content) > 500:
                content = content[:500] + "..."
            context_parts.append(content)
        
        return "\n\n".join(context_parts)
    
    def _format_response(self, query: str, answer: str, relevant_docs: list, contextual_data: Dict) -> Dict[str, Any]:
        """Format comprehensive response with all metadata"""
        response = {
            "query": query,
            "answer": answer,
            "llm_source": "Gemini-2.5-Pro (Image Analysis)",
            "sources": [
                f"Document: {doc.metadata.get('source', 'Unknown')}"
                for doc in relevant_docs[:2]
            ] if relevant_docs else ["General agricultural knowledge"],
            "analysis_type": "Image + Text Analysis",
            "documents_used": len(relevant_docs),
            "context_used": bool(relevant_docs)
        }
        
        # Add location data if available
        if contextual_data["location_data"] and "error" not in contextual_data["location_data"]:
            response["location"] = {
                "city": contextual_data["location_data"].get("city", "Unknown"),
                "state": contextual_data["location_data"].get("state", "Unknown"),
                "country": contextual_data["location_data"].get("country", "Unknown")
            }
        
        # Add weather data if available
        if contextual_data["weather_data"] and "error" not in contextual_data["weather_data"]:
            response["weather"] = contextual_data["weather_data"]
        
        # Add seasonal information
        response["season"] = contextual_data["season_info"]
        
        # Add agricultural alerts and crop suggestions
        if contextual_data["agricultural_alerts"]:
            response["agricultural_alerts"] = contextual_data["agricultural_alerts"]
        
        if contextual_data["crop_suggestions"]:
            response["crop_suggestions"] = contextual_data["crop_suggestions"]
        
        return response
    
    def _format_error_response(self, query: str, error: str) -> Dict[str, Any]:
        """Format error response"""
        return {
            "query": query,
            "answer": f"Sorry, I encountered an error analyzing your image. Please try again with a clear photo of your crops or farming issue. Error: {error}",
            "llm_source": "Error",
            "sources": [],
            "analysis_type": "Error",
            "documents_used": 0,
            "context_used": False,
            "error": error
        }

# Global instance
image_processor = ImageProcessor()

# Public functions
async def process_image_query(query: str, image_b64: str, image_type: str) -> Dict[str, Any]:
    """
    Public interface for processing image queries
    """
    return await image_processor.process_image_query(query, image_b64, image_type)

async def process_image_only_query(image_b64: str, image_type: str) -> Dict[str, Any]:
    """
    Process image-only queries (when no text query is provided)
    """
    general_query = "Analyze this farming image and provide comprehensive agricultural insights including crop health, potential issues, and practical recommendations"
    return await image_processor.process_image_query(general_query, image_b64, image_type)

def get_processor_status() -> Dict[str, Any]:
    """Get the status of the image processor"""
    return {
        "initialized": image_processor.initialized,
        "gemini_available": image_processor.gemini_model is not None,
        "pinecone_available": image_processor.vector_store is not None
    }