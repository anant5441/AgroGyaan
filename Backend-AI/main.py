from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat_router import router as chat_router  # Import 'router' and rename it
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

@app.get("/")
async def root():
    return {"message": "AI Farming Assistant API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}