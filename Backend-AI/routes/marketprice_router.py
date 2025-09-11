# routes/marketprice_router.py
from fastapi import APIRouter, Query
import httpx

router = APIRouter()

# Base API endpoint
BASE_URL = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"
API_KEY = "579b464db66ec23bdd000001abfa9b4116554203699ab39f0ff62533"  # demo key

@router.get("/market-price")
async def get_market_price(
    state: str = Query(..., description="State name"),
    district: str = Query(None, description="District name"),
    commodity: str = Query(None, description="Commodity name"),
    arrival_date: str = Query(None, description="Arrival date in DD/MM/YYYY format"),
):
    """
    Fetch market price data from data.gov.in based on filters.
    """

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 1000,
        "filters[State]": state,
    }

    if district:
        params["filters[District]"] = district
    if commodity:
        params["filters[Commodity]"] = commodity
    if arrival_date:
        params["filters[Arrival_Date]"] = arrival_date

    async with httpx.AsyncClient() as client:
        response = await client.get(BASE_URL, params=params)

    if response.status_code != 200:
        return {"error": "Failed to fetch data from external API"}

    return response.json()
