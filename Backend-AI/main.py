from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.main_chatbot.chat_router import router as chat_router  # Import 'router' and rename it
from routes import organicguide_router
from routes import marketprice_router
import os

app = FastAPI(title="AI Farming Assistant API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - now using the renamed import
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(organicguide_router.router)
app.include_router(marketprice_router.router, prefix="/api", tags=["market-price"])
@app.get("/")
async def root():
    return {"message": "AI Farming Assistant API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)