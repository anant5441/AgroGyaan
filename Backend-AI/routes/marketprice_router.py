# routes/marketprice_router.py
from fastapi import APIRouter, Query
import httpx
from datetime import datetime, timedelta
from typing import Optional

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
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=1000, description="Items per page"),
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
                    
                    total_records=len(data["records"])
                    total_pages=(total_records + limit - 1) // limit

                    start_idx=(page-1) * limit
                    end_idx=start_idx + limit

                    paginated_records=data["records"][start_idx:end_idx]

                    return {
                        "used_date": date,  # tell frontend which date was actually used
                        "pagination": {
                            "page": page,
                            "limit": limit,
                            "total_records": total_records,
                            "total_pages": total_pages,
                            "has_next": page < total_pages,
                            "has_prev": page > 1
                        },
                        "data": {
                            **data,
                            "records": paginated_records
                        },
                    }

    return {"error": "No data found for today or yesterday"}
