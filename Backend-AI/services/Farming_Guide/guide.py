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
model = genai.GenerativeModel("gemini-2.0-flash")  

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

# async def generate_organic_crop_guide(location: str, crop: str):
#     prompt = f"""
#     You are an expert organic farming advisor. 
#     Generate a JSON array of farming principles for organic farming in {location} for {crop} particularly.
#     Each item must have fields: name, difficulty, timeToHarvest, spacing, practices, planting, title, tips. 
    
#     Example format:
#     {{
#       "name": "Tomatoes",
#       "difficulty": "Intermediate",
#       "timeToHarvest": "70-80 days",
#       "spacing": "18-24 inches apart",
#       "practices": {{
#         "planting": {{
#           "title": "Planting",
#           "tips": [
#             "Start seeds indoors 6-8 weeks before last frost",
#             "Transplant after soil temperature reaches 60°F",
#             "Plant deep, burying 2/3 of the stem"
#           ]
#         }},
#         "soil": {{
#           "title": "Soil Preparation",
#           "tips": [
#             "Well-draining, nutrient-rich soil with pH 6.0-6.8",
#             "Add compost and aged manure before planting",
#             "Ensure good air circulation"
#           ]
#         }},
#         "care": {{
#           "title": "Organic Care",
#           "tips": [
#             "Mulch around plants to retain moisture",
#             "Use companion planting with basil and marigolds",
#             "Apply liquid kelp fertilizer bi-weekly"
#           ]
#         }},
#         "pest": {{
#           "title": "Natural Pest Control",
#           "tips": [
#             "Use beneficial insects like ladybugs",
#             "Spray neem oil for aphids and whiteflies",
#             "Handpick hornworms and dispose of them"
#           ]
#         }}
#       }}
#     }}

#     Return only valid JSON format without any additional text, explanations, or markdown code blocks.
#     Focus on guide specific to {crop} in {location} and organic farming practices.
#     """

#     try:
#         response = await model.generate_content_async(prompt)
#         response_text = response.text.strip()
        
#         # Clean up JSON response
#         if response_text.startswith('```json'):
#             response_text = response_text[7:]
#         if response_text.startswith('```'):
#             response_text = response_text[3:]
#         if response_text.endswith('```'):
#             response_text = response_text[:-3]
#         response_text = response_text.strip()
        
#         data = json.loads(response_text)
        
#         # Validate the expected structure
#         if isinstance(data, dict):  # Changed from list to dict based on example
#             required_fields = ['name', 'difficulty', 'timeToHarvest', 'spacing', 'practices']
#             if not all(key in data for key in required_fields):
#                 raise ValueError("Missing required fields in response")
#             return data
#         else:
#             raise ValueError("Response is not a JSON object")

#     except json.JSONDecodeError as e:
#         logger.error(f"JSON decode error: {e}, Response: {response_text}")
#         return {
#             "error": {
#                 "icon": "❌",
#                 "title": "Format Error",
#                 "description": f"Could not parse AI response: {str(e)}"
#             }
#         }
#     except Exception as e:
#         logger.error(f"Error generating guide: {str(e)}")
#         return {
#             "error": {
#                 "icon": "⚠️",
#                 "title": "Service Unavailable",
#                 "description": "Unable to generate farming guide at this time. Please try again later."
#             }
#         }

async def generate_organic_crop_guide(location: str, crop: str):
    prompt = f"""
    You are an expert organic farming advisor. 
    Generate a JSON object (not array) of farming principles for organic farming in {location} for {crop}.
    Include these fields: name, difficulty, timeToHarvest, spacing, practices.
    
    Practices should be an object with sub-sections like planting, soil, care, pest.
    Example format:
    {{
      "name": "Tomatoes",
      "difficulty": "Intermediate",
      "timeToHarvest": "70-80 days",
      "spacing": "18-24 inches apart",
      "practices": {{
        "planting": {{
          "title": "Planting",
          "tips": [
            "Start seeds indoors 6-8 weeks before last frost",
            "Transplant after soil temperature reaches 60°F",
            "Plant deep, burying 2/3 of the stem"
          ]
        }},
        "soil": {{
          "title": "Soil Preparation",
          "tips": [
            "Well-draining, nutrient-rich soil with pH 6.0-6.8",
            "Add compost and aged manure before planting",
            "Ensure good air circulation"
          ]
        }},
        "care": {{
          "title": "Organic Care",
          "tips": [
            "Mulch around plants to retain moisture",
            "Use companion planting with basil and marigolds",
            "Apply liquid kelp fertilizer bi-weekly"
          ]
        }},
        "pest": {{
          "title": "Natural Pest Control",
          "tips": [
            "Use beneficial insects like ladybugs",
            "Spray neem oil for aphids and whiteflies",
            "Handpick hornworms and dispose of them"
          ]
        }}
      }}
    }}
    Return ONLY valid JSON without any additional text or markdown blocks.
    Focus on principles specific to {location} and organic farming practices.
    """

    try:
        # Check if model is available
        if not hasattr(model, 'generate_content_async'):
            raise Exception("Model not properly initialized")
            
        response = await model.generate_content_async(prompt)
        response_text = response.text.strip()
        
        logger.info(f"Raw AI response: {response_text}")
        
        # Clean up JSON response
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        data = json.loads(response_text)
        
        # Validate the expected structure
        required_fields = ['name', 'difficulty', 'timeToHarvest', 'spacing', 'practices']
        if not all(key in data for key in required_fields):
            raise ValueError(f"Missing required fields. Got: {list(data.keys())}")
            
        return data

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}, Response: {response_text}")
        return {
            "error": {
                "icon": "❌",
                "title": "Format Error",
                "description": f"Could not parse AI response: {str(e)}"
            }
        }
    except Exception as e:
        logger.error(f"Error generating guide: {str(e)}", exc_info=True)
        return {
            "error": {
                "icon": "⚠️",
                "title": "Service Unavailable",
                "description": f"AI service error: {str(e)}"
            }
        }