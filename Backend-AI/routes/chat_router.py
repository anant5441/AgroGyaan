from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from main_chatbot.chat import run_chat_pipeline
import asyncio
from sse_starlette.sse import EventSourceResponse
import json

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

@router.post("/chat")
async def get_chat_response(req: QueryRequest):
    result = run_chat_pipeline(req.query)
    return result

# Add streaming endpoint
# @router.post("/chat/stream")
# async def stream_chat_response(query: str):
#     async def event_generator():
#         try:
#             # Process the query and stream results
#             for chunk in run_chat_pipeline_streaming(query):
#                 yield {
#                     "event": "message",
#                     "data": json.dumps({
#                         "content": chunk.get("content", ""),
#                         "is_final": chunk.get("is_final", False),
#                         "llm_source": chunk.get("llm_source", ""),
#                         "sources": chunk.get("sources", [])
#                     })
#                 }
#                 await asyncio.sleep(0.01)  # Small delay to prevent overwhelming the client
#         except Exception as e:
#             yield {
#                 "event": "error",
#                 "data": json.dumps({"error": str(e)})
#             }
    
#     return EventSourceResponse(event_generator())