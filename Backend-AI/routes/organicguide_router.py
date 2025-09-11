# routes/organicguide_router.py
from fastapi import APIRouter, Query
from Farming_Guide.guide import generate_organic_guide

router = APIRouter()

@router.get("/guide-region")
async def get_guide(location: str = Query(..., description="Location for organic guide")):
    data = await generate_organic_guide(location)
    return {"location": location, "guide": data}
