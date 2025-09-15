# routes/marketprice_router.py
from fastapi import APIRouter, Query
import httpx
from datetime import datetime, timedelta

router = APIRouter()

# Base API endpoint
BASE_URL = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"
API_KEY = "579b464db66ec23bdd000001abfa9b4116554203699ab39f0ff62533"  # demo key

def format_date(date_obj: datetime) -> str:
    return date_obj.strftime("%d/%m/%Y")

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

    today = datetime.today()
    yesterday = today - timedelta(days=1)

    dates_to_try = [arrival_date] if arrival_date else [format_date(today), format_date(yesterday)]


    async with httpx.AsyncClient() as client:
        
        for date in dates_to_try:
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
            if date:
                params["filters[Arrival_Date]"] = date

        response = await client.get(BASE_URL, params=params)

        if response.status_code == 200:
                data = response.json()
                if data.get("records"):  # ✅ only return if records exist
                    return {
                        "used_date": date,  # tell frontend which date was actually used
                        "data": data,
                    }

    return {"error": "No data found for today or yesterday"}
