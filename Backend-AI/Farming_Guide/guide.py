# Farming_Guide/guide.py
import google.generativeai as genai
import os
import json
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Configure API key (make sure it's set in environment variables)
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
genai.configure(api_key="AIzaSyBlSjEYhD1vOt2TkbkQRGFz5hjFixvxpEQ")

# Use a valid model name
model = genai.GenerativeModel("gemini-2.0-flash")  # or "gemini-1.0-pro"

async def generate_organic_guide(location: str):
    prompt = f"""
    You are an expert organic farming advisor. 
    Generate a JSON array of farming principles for organic farming in {location}.
    Each item must have fields: icon, title, description. 
    
    Example format:
    [
      {{
        "icon": "🌱",
        "title": "Soil Health Management",
        "description": "Build organic matter through composting, green manure, and cover crops to improve soil structure and fertility"
      }},
      {{
        "icon": "🔄",
        "title": "Crop Rotation",
        "description": "Rotate crops to prevent soil depletion, break pest cycles, and maintain soil nutrients"
      }},
      {{
        "icon": "🐞",
        "title": "Natural Pest Control",
        "description": "Use beneficial insects, companion planting, and organic pesticides to manage pests"
      }},
      {{
        "icon": "💧",
        "title": "Water Conservation",
        "description": "Implement drip irrigation, rainwater harvesting, and mulching to optimize water usage"
      }},
      {{
        "icon": "🌾",
        "title": "Native Crop Selection",
        "description": "Choose crop varieties that are well-suited to {location}'s climate and soil conditions"
      }}
    ]
    
    Return only valid JSON format without any additional text, explanations, or markdown code blocks.
    Focus on principles specific to {location} and organic farming practices.
    """

    try:
        response = await model.generate_content_async(prompt)
        
        # Clean the response text
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Use json.loads instead of eval for security
        data = json.loads(response_text)
        
        # Validate the structure
        if isinstance(data, list):
            for item in data:
                if not all(key in item for key in ['icon', 'title', 'description']):
                    raise ValueError("Missing required fields in response")
            return data
        else:
            raise ValueError("Response is not a list")
            
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}, Response: {response_text}")
        return [{
            "icon": "❌",
            "title": "Format Error",
            "description": f"Could not parse AI response: {str(e)}"
        }]
    except Exception as e:
        logger.error(f"Error generating guide: {str(e)}")
        return [{
            "icon": "⚠️",
            "title": "Service Unavailable",
            "description": "Unable to generate farming guide at this time. Please try again later."
        }]