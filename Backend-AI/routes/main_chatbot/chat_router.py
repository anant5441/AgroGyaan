from fastapi import FastAPI, HTTPException , APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
from .chat import create_workflow, AgentState

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
    sources: Optional[list] = None
    weather_data: Optional[Dict[str, Any]] = None
    temperature_data: Optional[Dict[str, Any]] = None
    detected_location: Optional[Dict[str, Any]] = None
    season_info: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Initialize workflow
workflow = create_workflow()

@router.get("/")
async def root():
    return {"message": "Agro Chatbot API is running"}

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Process a chat query"""
    try:
        logger.info(f"Processing query: {request.query}")
        
        # Initialize state
        initial_state = AgentState(
            query=request.query,
            documents=[],
            answer="",
            source_documents=[],
            weather_data={},
            temperature_data={},
            user_location={},
            tool_outputs=[],
            llm_source="",
            error=None,
            season_info={},
            needs_location=False
        )
        
        # Run workflow
        result = workflow.invoke(initial_state)
        
        # Format response
        response_data = {
            "query": result.get("query", request.query),
            "answer": result.get("answer", ""),
            "llm_source": result.get("llm_source", "Unknown"),
            "error": result.get("error")
        }
        
        if "source_documents" in result and result["source_documents"]:
            response_data["sources"] = [
                f"{doc.metadata.get('source', 'Unknown')}: {doc.page_content[:200]}..."
                for doc in result["source_documents"]
            ]
        
        if "weather_data" in result:
            response_data["weather_data"] = result["weather_data"]
        
        if "temperature_data" in result:
            response_data["temperature_data"] = result["temperature_data"]
        
        if "user_location" in result and result["user_location"]:
            response_data["detected_location"] = result["user_location"]
        
        if "season_info" in result and result["season_info"]:
            response_data["season_info"] = result["season_info"]
        
        res = ChatResponse(**response_data)
        print(res)
        
        return res
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

