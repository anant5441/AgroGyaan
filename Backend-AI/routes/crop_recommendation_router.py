from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
from services.Crop_Recommendation.crop_service import crop_service

router = APIRouter()

# Pydantic models for request/response
class CropFeatures(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class CropRecommendation(BaseModel):
    crop: str
    confidence: float
    suitability: str

class PredictionResponse(BaseModel):
    predicted_crop: str
    confidence: float
    recommendation_level: str
    recommendations: List[CropRecommendation]
    model_type: str
    model_parameters: Dict

class ModelInfoResponse(BaseModel):
    model_type: str
    number_of_classes: int
    number_of_estimators: int
    feature_names: List[str]
    best_parameters: Dict


@router.post("/predict", response_model=PredictionResponse)
async def predict_crop(features: CropFeatures):
    try:
        prediction = crop_service.predict_crop(features.dict())
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/crops", response_model=List[str])
async def get_available_crops():
    # Get list of all crop types that can be predicted
    try:
        return crop_service.get_crop_list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching crop list: {str(e)}")

@router.get("/model-info", response_model=ModelInfoResponse)
async def get_model_info():
    #Get information about the trained machine learning model
    try:
        return crop_service.get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching model information")

@router.get("/features")
async def get_feature_info():
    
    #Get information about the input features required for prediction
    return {
        "features": crop_service.feature_names,
        "description": {
            "N": "Nitrogen content in soil (kg/ha)",
            "P": "Phosphorus content in soil (kg/ha)",
            "K": "Potassium content in soil (kg/ha)",
            "temperature": "Temperature in Celsius (°C)",
            "humidity": "Relative humidity percentage (%)",
            "ph": "Soil pH level (0-14 scale)",
            "rainfall": "Rainfall in millimeters (mm)"
        }
    }

@router.get("/example")
async def get_example_prediction():
    
    # Get an example prediction with sample data
    example_data = {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 20.88,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.94
    }
    
    try:
        prediction = crop_service.predict_crop(example_data)
        return {
            "example_input": example_data,
            "prediction": prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Example prediction error: {str(e)}")