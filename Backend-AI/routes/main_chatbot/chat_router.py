from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import logging
import base64
from .chat import process_query  # Import your existing process_query function
from .image_processor import process_image_query  # Import image processor

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter()

# Request models
class ChatRequest(BaseModel):
    query: str

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
                error=result["error"]
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
            "context_used": bool(result.get("sources", []))
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
            llm_source=response.get("llm_source", "Gemini-2.5-Pro (Image Analysis)"),
            sources=response.get("sources", []),
            weather=response.get("weather", {}),
            location=response.get("location", {}),
            season=response.get("season", {}),
            agricultural_alerts=response.get("agricultural_alerts", []),
            crop_suggestions=response.get("crop_suggestions", []),
            error=response.get("error"),
            analysis_type=response.get("analysis_type", "Image + Text Analysis"),
            documents_used=response.get("documents_used", 0),
            context_used=response.get("context_used", False)
        )
        
    except Exception as e:
        logger.error(f"Error processing image query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Agro Chatbot API",
        "endpoints": {
            "text_chat": "/api/chat",
            "image_chat": "/api/chat-with-image"
        }
    }