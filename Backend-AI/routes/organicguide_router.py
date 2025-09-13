# routes/organicguide_router.py
from fastapi import APIRouter, Query
from services.Farming_Guide.guide import generate_organic_guide,generate_organic_crop_guide

router = APIRouter()

@router.get("/guide-region")
async def get_guide(location: str = Query(..., description="Location for organic guide")):
    data = await generate_organic_guide(location)
    return {"location": location, "guide": data}

@router.get("/guide-crop")
async def get_crop_guide(location: str = Query(..., description="Location for organic guide"),crop:str=Query(...,description="Crop name for organic guide")):
    data=await generate_organic_crop_guide(location,crop)
    return {"location":location,"crop":crop,"guide":data}
# async def get_crop_guide(crop: str = Query(..., description="Crop name for organic guide")):
#     data = await generate_organic_guide(crop)
#     return {"crop": crop, "guide": data}
