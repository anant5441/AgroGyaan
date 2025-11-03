import os
import base64
import logging
import re
import time
from typing import Optional, Dict, Any
from google import genai
from google.genai import types
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

class CacheManager:
    """Simple cache manager for audio and image responses"""
    
    def __init__(self, max_size=100, ttl=3600):  # 1 hour TTL by default
        self.cache = {}
        self.max_size = max_size
        self.ttl = ttl
    
    def _generate_key(self, text: str, language: str = "en") -> str:
        """Generate a cache key from text and language"""
        return f"{language}:{hash(text)}"
    
    def get(self, key: str) -> Optional[Any]:
        """Get item from cache if not expired"""
        if key in self.cache:
            item = self.cache[key]
            if time.time() - item['timestamp'] < self.ttl:
                logger.debug(f"Cache hit for key: {key}")
                return item['data']
            else:
                # Remove expired item
                del self.cache[key]
                logger.debug(f"Cache expired for key: {key}")
        return None
    
    def set(self, key: str, data: Any) -> None:
        """Set item in cache with timestamp"""
        # Remove oldest items if cache is full
        if len(self.cache) >= self.max_size:
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]['timestamp'])
            del self.cache[oldest_key]
            logger.debug(f"Cache evicted key: {oldest_key}")
        
        self.cache[key] = {
            'data': data,
            'timestamp': time.time()
        }
        logger.debug(f"Cache set for key: {key}")
    
    def clear(self) -> None:
        """Clear all cache"""
        self.cache.clear()
        logger.info("Cache cleared")

class ImageProcessor:
    def __init__(self):
        self.client = None
        self.vector_store = None
        self.initialized = False
        self.cache = CacheManager(max_size=200, ttl=7200)  # 2 hours TTL for audio
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize Gemini and reuse existing Pinecone components"""
        try:
            # Initialize Gemini client with new google-genai library
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
            self.client = genai.Client(api_key=api_key)
            logger.info("Gemini client initialized successfully")
            
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
    
    def _should_include_audio(self, query: str) -> bool:
        """
        Check if user explicitly requests audio/speech in their query
        """
        audio_keywords = [
            # English
            'audio', 'speech', 'voice', 'listen', 'hear', 'read aloud', 'speak',
            'tell me', 'say it', 'verbal', 'vocal',
            # Hindi
            'आडियो', 'स्पीच', 'वॉइस', 'सुनाओ', 'बोलो', 'बताओ', 'सुनाईए',
            'बोलिए', 'आवाज', 'ध्वनि',
            # Spanish
            'audio', 'voz', 'escuchar', 'oír', 'habla', 'dilo',
            # French
            'audio', 'voix', 'écouter', 'entendre', 'parle', 'dis'
        ]
        
        query_lower = query.lower()
        return any(keyword in query_lower for keyword in audio_keywords)
    
    def _extract_language_from_audio_request(self, query: str) -> str:
        """
        Extract language preference from audio request
        """
        query_lower = query.lower()
        
        # Language mapping with various terms
        language_mapping = {
            'hi': ['hindi', 'हिंदी', 'हिन्दी', 'hindi me', 'हिंदी में'],
            'en': ['english', 'अंग्रेजी', 'english me', 'अंग्रेजी में', 'inglish'],
            'es': ['spanish', 'español', 'espanol', 'spanish'],
            'fr': ['french', 'français', 'francais', 'french me'],
            'bn': ['bengali', 'bangla', 'বাংলা', 'bengali me'],
            'ta': ['tamil', 'தமிழ்', 'tamil me'],
            'te': ['telugu', 'తెలుగు', 'telugu me'],
            'mr': ['marathi', 'मराठी', 'marathi me'],
            'gu': ['gujarati', 'ગુજરાતી', 'gujarati me'],
            'kn': ['kannada', 'ಕನ್ನಡ', 'kannada me'],
            'ml': ['malayalam', 'മലയാളം', 'malayalam me'],
            'pa': ['punjabi', 'ਪੰਜਾਬੀ', 'punjabi me']
        }
        
        for lang_code, keywords in language_mapping.items():
            if any(keyword in query_lower for keyword in keywords):
                return lang_code
        
        # Default to English if no specific language requested
        return "en"
    
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
    
    async def generate_audio_response(self, text: str, language: str = "en") -> Optional[bytes]:
        """
        Generate audio response using gTTS with caching
        """
        try:
            # Generate cache key
            cache_key = self.cache._generate_key(text, language)
            
            # Check cache first
            cached_audio = self.cache.get(cache_key)
            if cached_audio:
                logger.info(f"Using cached audio for {len(text)} characters in {language}")
                return cached_audio
            
            # Use gTTS directly since it's working
            from gtts import gTTS
            import io
            
            # Limit text length for TTS (gTTS has limits)
            if len(text) > 1000:
                text = text[:1000] + "..."
            
            # Map language codes to gTTS supported codes
            lang_map = {
                'hi': 'hi',  # Hindi
                'en': 'en',  # English
                'es': 'es',  # Spanish
                'fr': 'fr',  # French
                'bn': 'bn',  # Bengali
                'ta': 'ta',  # Tamil
                'te': 'te',  # Telugu
                'mr': 'mr',  # Marathi
                'gu': 'gu',  # Gujarati
                'kn': 'kn',  # Kannada
                'ml': 'ml',  # Malayalam
                'pa': 'pa'   # Punjabi
            }
            
            tts_lang = lang_map.get(language, 'en')
            
            tts = gTTS(text=text, lang=tts_lang, slow=False)
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_data = audio_buffer.getvalue()
            
            # Cache the audio data
            self.cache.set(cache_key, audio_data)
            
            logger.info(f"gTTS generated audio: {len(audio_data)} bytes for language: {language}")
            return audio_data
            
        except ImportError:
            logger.error("gTTS not installed. Please run: pip install gtts")
            return None
        except Exception as e:
            logger.error(f"Error generating audio with gTTS: {str(e)}")
            return None
    
    async def process_image_with_gemini(self, query: str, image_b64: str, image_type: str) -> str:
        """Process image using the new Gemini client"""
        try:
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=query),
                        types.Part.from_bytes(
                            data=base64.b64decode(image_b64),
                            mime_type=image_type
                        ),
                    ],
                ),
            ]
            
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",  # Use stable model for image processing
                contents=contents,
            )
            
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error processing image with Gemini: {str(e)}")
            raise
    
    async def process_image_query(self, query: str, image_b64: str, image_type: str) -> Dict[str, Any]:
        """
        Process image queries using Gemini with comprehensive Pinecone document context
        """
        if not self.initialized:
            raise RuntimeError("Image processor not initialized")
        
        try:
            # Step 1: Check if user wants audio
            include_audio = self._should_include_audio(query)
            audio_language = self._extract_language_from_audio_request(query)
            
            if include_audio:
                logger.info(f"Audio requested in language: {audio_language}")
            
            # Step 2: Get contextual data (location, weather, season)
            contextual_data = self._get_contextual_data(query)
            
            # Step 3: Retrieve relevant documents from Pinecone
            relevant_docs = retrieve_relevant_documents(query, threshold=0.5)
            context_text = self._extract_context_from_documents(relevant_docs)
            
            # Step 4: Build comprehensive prompt
            prompt = self._build_context_prompt(query, context_text, contextual_data)
            
            # Step 5: Generate response using Gemini with image
            answer = await self.process_image_with_gemini(prompt, image_b64, image_type)
            
            # Step 6: Generate audio ONLY if user explicitly requested it
            audio_data = None
            if include_audio:
                audio_data = await self.generate_audio_response(answer, audio_language)
            
            # Step 7: Format comprehensive response
            return self._format_response(
                query=query,
                answer=answer,
                relevant_docs=relevant_docs,
                contextual_data=contextual_data,
                audio_data=audio_data,
                include_audio=include_audio,
                audio_language=audio_language
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
    
    def _format_response(self, query: str, answer: str, relevant_docs: list, contextual_data: Dict, audio_data: Optional[bytes] = None, include_audio: bool = False, audio_language: str = "en") -> Dict[str, Any]:
        """Format comprehensive response with all metadata"""
        response = {
            "query": query,
            "answer": answer,
            "llm_source": "Gemini-2.5-Flash (Image Analysis)",
            "sources": [
                f"Document: {doc.metadata.get('source', 'Unknown')}"
                for doc in relevant_docs[:2]
            ] if relevant_docs else ["General agricultural knowledge"],
            "analysis_type": "Image + Text Analysis",
            "documents_used": len(relevant_docs),
            "context_used": bool(relevant_docs),
            "audio_available": include_audio and audio_data is not None,
            "audio_requested": include_audio
        }
        
        # Add audio data if available
        if audio_data and include_audio:
            response["audio_data"] = base64.b64encode(audio_data).decode('utf-8')
            response["audio_format"] = "audio/mp3"
            response["audio_language"] = audio_language
        
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
            "error": error,
            "audio_available": False,
            "audio_requested": False
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

async def generate_audio_from_text(text: str, language: str = "en") -> Optional[Dict[str, Any]]:
    """
    Generate audio from text using gTTS with caching
    """
    try:
        audio_data = await image_processor.generate_audio_response(text, language)
        
        if audio_data:
            return {
                "audio_data": base64.b64encode(audio_data).decode('utf-8'),
                "audio_format": "audio/mp3",
                "audio_language": language,
                "text_length": len(text),
                "status": "success"
            }
        else:
            return {
                "status": "error",
                "message": "Failed to generate audio. Please ensure gTTS is installed."
            }
    except Exception as e:
        logger.error(f"Error generating audio from text: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

def clear_audio_cache() -> Dict[str, Any]:
    """Clear the audio cache"""
    try:
        image_processor.cache.clear()
        return {
            "status": "success",
            "message": "Audio cache cleared successfully",
            "cache_size": 0
        }
    except Exception as e:
        logger.error(f"Error clearing audio cache: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    try:
        cache_size = len(image_processor.cache.cache)
        return {
            "status": "success",
            "cache_size": cache_size,
            "max_size": image_processor.cache.max_size,
            "ttl": image_processor.cache.ttl
        }
    except Exception as e:
        logger.error(f"Error getting cache stats: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

def get_supported_languages() -> Dict[str, str]:
    """Get supported languages for TTS"""
    return {
        "en": "English",
        "hi": "Hindi",
        "es": "Spanish", 
        "fr": "French",
        "bn": "Bengali",
        "ta": "Tamil",
        "te": "Telugu",
        "mr": "Marathi",
        "gu": "Gujarati",
        "kn": "Kannada",
        "ml": "Malayalam",
        "pa": "Punjabi"
    }

def get_audio_request_keywords() -> Dict[str, list]:
    """Get keywords that trigger audio generation"""
    return {
        "english": ["audio", "speech", "voice", "listen", "hear", "read aloud", "speak", "tell me", "say it"],
        "hindi": ["आडियो", "स्पीच", "वॉइस", "सुनाओ", "बोलो", "बताओ", "सुनाईए", "बोलिए", "आवाज", "ध्वनि", "कहो"],
        "bengali": ["অডিও", "স্পিচ", "ভয়েস", "শোনাও", "বলো", "বোলো", "কথা বলো", "শুনি", "কহো"],
        "tamil": ["ஆடியோ", "ஸ்பீச்ச்", "குரல்", "கேளுங்கள்", "சொல்லுங்கள்", "பேசுங்கள்", "கேள்", "சொல்"],
        "telugu": ["ఆడియో", "స్పీచ్", "వాయిస్", "వినండి", "చెప్పండి", "మాట్లాడండి", "అనండి", "విని"],
        "marathi": ["ऑडिओ", "स्पीच", "वॉइस", "ऐका", "बोला", "सांगा", "बोल", "ऐक"],
        "gujarati": ["ઑડિઓ", "સ્પીચ", "વ voice", "સાંભળો", "બોલો", "કહો", "વાત કરો", "સun"],
        "kannada": ["ಆಡಿಯೋ", "ಸ್ಪೀಚ್", "ವ voice", "ಕೇಳಿ", "ಹೇಳಿ", "ಮಾತನಾಡಿ", "ಅಂದರು", "ಕೇಳು"],
        "malayalam": ["ഓഡിയോ", "സ്പീച്ച്", "വ voice", "കേൾക്കുക", "പറയുക", "സംസാരിക്കുക", "ശബ്ദം", "കേൾപ്പിക്കുക"],
        "punjabi": ["ਆਡੀਓ", "ਸਪੀਚ", "ਵ voice", "ਸੁਣਾਓ", "ਬੋਲੋ", "ਦੱਸੋ", "ਗੱਲ ਕਰੋ", "ਆਵਾਜ਼"],
        "odia": ["ଅଡିଓ", "ସ୍ପିଚ", "ଭ voice", "ଶୁଣାନ୍ତୁ", "କୁହନ୍ତୁ", "କଥା ହେବେ", "ବୋଲ"],
        "assamese": ["অডিঅ'", "স্পিচ", "ভ voice", "শুনাও", "কোৱা", "কথা কোৱা", "বোল"],
        "urdu": ["آڈیو", "سپیچ", "آواز", "سنائیں", "بولیں", "بتائیں", "کہیں"],
        "spanish": ["audio", "voz", "escuchar", "oír", "habla", "dilo"],
        "french": ["audio", "voix", "écouter", "entendre", "parle", "dis"]
    }

def get_processor_status() -> Dict[str, Any]:
    """Get the status of the image processor"""
    cache_stats = get_cache_stats()
    return {
        "initialized": image_processor.initialized,
        "gemini_available": image_processor.client is not None,
        "tts_available": True,  # gTTS is available
        "pinecone_available": image_processor.vector_store is not None,
        "cache_enabled": True,
        "cache_stats": cache_stats,
        "supported_languages": get_supported_languages(),
        "audio_keywords": get_audio_request_keywords()
    }