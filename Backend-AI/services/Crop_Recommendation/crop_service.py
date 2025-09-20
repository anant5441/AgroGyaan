import joblib
import numpy as np
from typing import List,Dict
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "Model", "Crop_Recommendation")

class CropRecommendationService:
    def __init__(self):
        self.model = joblib.load(os.path.join(MODEL_DIR, "optimized_crop_model.pkl"))
        self.scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
        self.feature_names = joblib.load(os.path.join(MODEL_DIR, "feature_names.pkl"))
        self.crop_labels = joblib.load(os.path.join(MODEL_DIR, "crop_labels.pkl"))
        self.best_params = joblib.load(os.path.join(MODEL_DIR, "best_params.pkl"))

    def predict_crop(self,features:Dict)->Dict:
            try:
                input_data=np.array([[
                    features['N'],
                    features['P'],
                    features['K'],
                    features['temperature'],
                    features['humidity'],
                    features['ph'],
                    features['rainfall']
                ]])
                # scale all the features for best results
                scaled_data=self.scaler.transform(input_data)

                # Make prediction
                prediction = self.model.predict(scaled_data)
                probabilities = self.model.predict_proba(scaled_data)[0]

                # Get the predicted crop name
                predicted_crop_index = prediction[0]
                predicted_crop_name = self.crop_labels[predicted_crop_index].replace('crops_', '')

                # Get top 3 recommendations with confidence
                top_3_indices = np.argsort(probabilities)[-3:][::-1]
                recommendations = []
            
                for idx in top_3_indices:
                    crop_name = self.crop_labels[idx].replace('crops_', '')
                    recommendations.append({
                        'crop': crop_name,
                        'confidence': float(probabilities[idx]),
                        'suitability': self._get_suitability_level(probabilities[idx])
                    })

                # Get recommendation level
                confidence = float(probabilities[predicted_crop_index])
                recommendation_level = self._get_recommendation_level(confidence)
                
                return {
                    'predicted_crop': predicted_crop_name,
                    'confidence': confidence,
                    'recommendation_level': recommendation_level,
                    'recommendations': recommendations,
                    'model_type': 'OneVsRestClassifier with GridSearchCV',
                    'model_parameters': self.best_params
                }
            
            except Exception as e:
                raise ValueError(f"Prediction error: {str(e)}")

    def _get_recommendation_level(self, confidence: float) -> str:
        # Get recommendation level based on confidence score
        if confidence > 0.8:
            return "HIGH_CONFIDENCE"
        elif confidence > 0.6:
            return "MODERATE_CONFIDENCE"
        elif confidence > 0.4:
            return "LOW_CONFIDENCE"
        else:
            return "VERY_LOW_CONFIDENCE"
    
    def _get_suitability_level(self, confidence: float) -> str:
        # Get suitability level for alternative crops
        if confidence > 0.3:
            return "SUITABLE"
        elif confidence > 0.15:
            return "MODERATELY_SUITABLE"
        else:
            return "MARGINALLY_SUITABLE"
    
    def get_crop_list(self) -> List[str]:
        # Get list of all possible crops
        return [label.replace('crops_', '') for label in self.crop_labels]
    
    def get_model_info(self) -> Dict:
        # Get information about the trained model
        return {
            'model_type': type(self.model).__name__,
            'number_of_classes': len(self.crop_labels),
            'number_of_estimators': len(self.model.estimators_),
            'feature_names': self.feature_names,
            'best_parameters': self.best_params
        }

# Create singleton instance
crop_service = CropRecommendationService()
