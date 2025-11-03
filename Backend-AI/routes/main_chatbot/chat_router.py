from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import logging
import base64
from .chat import process_query  # Import your existing process_query function
from .image_processor import process_image_query, generate_audio_from_text, get_supported_languages, get_audio_request_keywords, get_processor_status # Import image processor and audio functions

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter()

# Request models
class ChatRequest(BaseModel):
    query: str

class AudioRequest(BaseModel):
    text: str
    language: str = "en"

class AudioResponse(BaseModel):
    audio_data: Optional[str] = None
    audio_format: Optional[str] = None
    audio_language: Optional[str] = None
    text_length: Optional[int] = None
    status: str
    message: Optional[str] = None

class ChatResponse(BaseModel):
    query: str
    answer: str
    llm_source: str
    sources: Optional[List[str]] = None
    weather: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    season: Optional[Dict[str, Any]] = None
    agricultural_alerts: Optional[List[str]] = None
    crop_suggestions: Optional[List[str]] = None
    error: Optional[str] = None
    analysis_type: Optional[str] = None
    documents_used: Optional[int] = None
    context_used: Optional[bool] = None
    audio_available: Optional[bool] = None
    audio_data: Optional[str] = None
    audio_language: Optional[str] = None

@router.get("/")
async def root():
    return {"message": "Agro Chatbot API is running"}

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Process a chat query"""
    try:
        logger.info(f"Processing query: {request.query}")
        
        # Process the query using your existing function
        result = process_query(request.query)
        
        # Check if there's an error in the result
        if "error" in result:
            return ChatResponse(
                query=request.query,
                answer="Sorry, I encountered an error processing your request.",
                llm_source="System",
                error=result["error"],
                audio_available=False
            )
        
        # Format the response according to the ChatResponse model
        response_data = {
            "query": result.get("query", request.query),
            "answer": result.get("answer", ""),
            "llm_source": result.get("llm_source", "Unknown"),
            "sources": result.get("sources", []),
            "weather": result.get("weather", {}),
            "location": result.get("location", {}),
            "season": result.get("season", {}),
            "agricultural_alerts": result.get("agricultural_alerts", []),
            "crop_suggestions": result.get("crop_suggestions", []),
            "error": result.get("error"),
            "analysis_type": "Text Analysis",
            "documents_used": len(result.get("sources", [])),
            "context_used": bool(result.get("sources", [])),
            "audio_available": False,  # Text-only responses don't have auto audio
            "audio_data": None,
            "audio_language": None
        }
        
        return ChatResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@router.post("/chat-with-image")
async def chat_with_image(
    query: str = Form(None),
    image: UploadFile = File(None)
):
    """Process chat queries with images using Gemini"""
    try:
        logger.info(f"Processing image query: {query}, Image: {image.filename if image else 'None'}")
        
        if not image:
            raise HTTPException(status_code=400, detail="No image file provided")
        
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Please upload a valid image file (JPEG, PNG, etc.)")
        
        # Read and encode image
        image_bytes = await image.read()
        image_b64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # Process with Gemini using existing Pinecone infrastructure
        if query and query.strip():
            response = await process_image_query(query.strip(), image_b64, image.content_type)
        else:
            response = await process_image_query(
                "Analyze this farming image and provide agricultural insights", 
                image_b64, 
                image.content_type
            )
        
        # Convert to ChatResponse format for consistency
        return ChatResponse(
            query=response.get("query", ""),
            answer=response.get("answer", ""),
            llm_source=response.get("llm_source", "Gemini-2.5-pro (Image Analysis)"),
            sources=response.get("sources", []),
            weather=response.get("weather", {}),
            location=response.get("location", {}),
            season=response.get("season", {}),
            agricultural_alerts=response.get("agricultural_alerts", []),
            crop_suggestions=response.get("crop_suggestions", []),
            error=response.get("error"),
            analysis_type=response.get("analysis_type", "Image + Text Analysis"),
            documents_used=response.get("documents_used", 0),
            context_used=response.get("context_used", False),
            audio_available=response.get("audio_available", False),
            audio_data=response.get("audio_data"),
            audio_language=response.get("audio_language")
        )
        
    except Exception as e:
        logger.error(f"Error processing image query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@router.post("/generate-audio", response_model=AudioResponse)
async def generate_audio_endpoint(request: AudioRequest):
    """Generate audio from text using gTTS"""
    try:
        logger.info(f"Generating audio for text (length: {len(request.text)}), language: {request.language}")
        
        # Validate text length
        if len(request.text.strip()) == 0:
            return AudioResponse(
                status="error",
                message="Text cannot be empty"
            )
        
        if len(request.text) > 5000:  # Reasonable limit for TTS
            return AudioResponse(
                status="error", 
                message="Text too long. Please keep under 5000 characters."
            )
        
        # Validate language
        supported_languages = ["en", "hi", "es", "fr", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa"]
        if request.language not in supported_languages:
            return AudioResponse(
                status="error",
                message=f"Unsupported language. Supported languages: {', '.join(supported_languages)}"
            )
        
        # Generate audio using the image_processor function
        audio_result = await generate_audio_from_text(request.text, request.language)
        
        # Check if audio_result is a dictionary (from generate_audio_from_text)
        if isinstance(audio_result, dict):
            if audio_result.get("status") == "success" and audio_result.get("audio_data"):
                # Extract audio data from the dictionary response
                return AudioResponse(
                    audio_data=audio_result["audio_data"],
                    audio_format=audio_result.get("audio_format", "audio/mp3"),
                    audio_language=audio_result.get("audio_language", request.language),
                    text_length=len(request.text),
                    status="success"
                )
            else:
                return AudioResponse(
                    status="error",
                    message=audio_result.get("message", "Failed to generate audio")
                )
        # If audio_result is bytes (direct from generate_audio_response)
        elif isinstance(audio_result, bytes):
            audio_b64 = base64.b64encode(audio_result).decode('utf-8')
            return AudioResponse(
                audio_data=audio_b64,
                audio_format="audio/mp3",
                audio_language=request.language,
                text_length=len(request.text),
                status="success"
            )
        else:
            return AudioResponse(
                status="error",
                message="Failed to generate audio - no audio data returned"
            )
            
    except Exception as e:
        logger.error(f"Error generating audio: {str(e)}")
        return AudioResponse(
            status="error",
            message=f"Audio generation failed: {str(e)}"
        )

@router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported languages for TTS"""
    try:
        languages = get_supported_languages()
        return {
            "status": "success",
            "languages": languages,
            "count": len(languages)
        }
    except Exception as e:
        logger.error(f"Error getting supported languages: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "languages": {"en": "English"}  # Fallback
        }

@router.get("/audio-request-keywords")
async def get_audio_keywords():
    """Get keywords that trigger audio generation"""
    try:
        keywords = get_audio_request_keywords()
        return {
            "status": "success",
            "keywords": keywords
        }
    except Exception as e:
        logger.error(f"Error getting audio keywords: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "keywords": {
                "english": ["audio", "speech", "voice", "listen", "hear"]
            }
        }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        processor_status = get_processor_status()
        return {
            "status": "healthy",
            "service": "Agro Chatbot API",
            "endpoints": {
                "text_chat": "/api/chat",
                "image_chat": "/api/chat-with-image",
                "audio_generation": "/api/generate-audio",
                "supported_languages": "/api/supported-languages"
            },
            "processor_status": processor_status
        }
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return {
            "status": "degraded",
            "service": "Agro Chatbot API",
            "error": str(e),
            "endpoints": {
                "text_chat": "/api/chat",
                "image_chat": "/api/chat-with-image",
                "audio_generation": "/api/generate-audio"
            }
        }