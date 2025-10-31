from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.main_chatbot.chat_router import router as chat_router  # Import 'router' and rename it
from routes import organicguide_router
from routes import marketprice_router
from routes import crop_recommendation_router
from routes.main_chatbot.image_processor import get_processor_status
import os
import logging

app = FastAPI(title="AI Farming Assistant API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - now using the renamed import
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(organicguide_router.router)
app.include_router(marketprice_router.router, prefix="/api", tags=["market-price"])
app.include_router(crop_recommendation_router.router, prefix="/api", tags=["crop-recommendation"])

@app.get("/")
async def root():
    return {"message": "AI Farming Assistant API is running"}

@app.head("/")
async def head():
    return 1

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check image processor status
        image_processor_status = get_processor_status()
        
        return {
            "status": "healthy",
            "service": "AI Farming Assistant API",
            "version": "2.0.0",
            "image_processor": image_processor_status,
            "endpoints_available": [
                "GET /",
                "GET /health",
                "GET /docs",
                "POST /api/chat",
                "POST /api/chat-with-image",
                "GET /api/organic-guide",
                "GET /api/market-prices",
                "GET /api/crop-recommendation"
            ]
        }
    except Exception as e:
        logging.error(f"Health check error: {str(e)}")
        return {
            "status": "degraded",
            "service": "AI Farming Assistant API",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)