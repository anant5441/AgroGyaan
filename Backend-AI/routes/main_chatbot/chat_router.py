from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import logging
from .chat import process_query  # Import your existing process_query function

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
            "error": result.get("error")
        }
        
        return ChatResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")