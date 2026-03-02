import numpy as np
from PIL import Image
import io
import logging
from typing import Tuple, Optional
import torch
from torchvision import transforms

logger = logging.getLogger(__name__)

class ImageProcessor:
    
    @staticmethod
    def enhance_contrast(image: Image.Image, alpha: float = 1.5, beta: float = 0) -> Image.Image:
        try:
            img_array = np.array(image, dtype=np.float32)
            enhanced = np.clip(alpha * img_array + beta, 0, 255).astype(np.uint8)
            return Image.fromarray(enhanced)
        except Exception as e:
            logger.error(f"Contrast enhancement failed: {str(e)}")
            return image
    
    @staticmethod
    def normalize_image(image: Image.Image) -> Image.Image:
        try:
            img_array = np.array(image, dtype=np.float32)
            mean = np.mean(img_array)
            std = np.std(img_array)
            if std > 0:
                normalized = (img_array - mean) / std
                normalized = np.clip((normalized + 3) * 255 / 6, 0, 255).astype(np.uint8)
                return Image.fromarray(normalized)
            return image
        except Exception as e:
            logger.error(f"Normalization failed: {str(e)}")
            return image
    
    @staticmethod
    def get_image_quality_score(image: Image.Image) -> float:
        try:
            img_array = np.array(image, dtype=np.float32)
            
            std = np.std(img_array)
            contrast_score = min(std / 50, 1.0)
            
            mean_brightness = np.mean(img_array)
            brightness_score = 1 - abs(mean_brightness - 128) / 128
            
            from scipy import ndimage
            edges = ndimage.sobel(img_array.mean(axis=2))
            edge_score = np.mean(edges > 10)
            
            quality = (0.4 * contrast_score + 0.3 * brightness_score + 0.3 * edge_score)
            
            logger.info(f"Image quality: {quality:.2f} (contrast: {contrast_score:.2f}, brightness: {brightness_score:.2f}, edges: {edge_score:.2f})")
            
            return quality
        except Exception as e:
            logger.error(f"Quality assessment failed: {str(e)}")
            return 0.5  # Default to neutral if calculation fails
    
    @staticmethod
    def preprocess_for_model(image: Image.Image, 
                             enhance: bool = True,
                             normalize: bool = True) -> torch.Tensor:
        try:
            if enhance:
                image = ImageProcessor.enhance_contrast(image)
            if normalize:
                image = ImageProcessor.normalize_image(image)
            
            # Standard transforms
            transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
            ])
            
            tensor = transform(image)
            return tensor
        except Exception as e:
            logger.error(f"Preprocessing failed: {str(e)}")
            raise


class RiskCalculator:
    
    HIGH_RISK_THRESHOLD = 0.7
    MODERATE_RISK_THRESHOLD = 0.4
    
    @staticmethod
    def calculate_age_risk(age: int) -> float:
        if age < 40:
            return 0
        elif age < 50:
            return 0.2
        elif age < 60:
            return 0.4
        elif age < 70:
            return 0.6
        else:
            return 0.8
    
    @staticmethod
    def calculate_smoking_risk(pack_years: int) -> float:
        if pack_years == 0:
            return 0
        elif pack_years < 15:
            return 0.2
        elif pack_years < 30:
            return 0.5
        elif pack_years < 50:
            return 0.75
        else:
            return 1.0
    
    @staticmethod
    def calculate_combined_risk(
        image_malignancy_prob: float,
        age: int,
        smoking: int,
        family_history: bool,
        image_weight: float = 0.7,
        clinical_weight: float = 0.3
    ) -> Tuple[float, str]:
        age_risk = RiskCalculator.calculate_age_risk(age)
        smoking_risk = RiskCalculator.calculate_smoking_risk(smoking)
        family_risk = 0.2 if family_history else 0
        
        clinical_score = (0.4 * age_risk + 0.4 * smoking_risk + 0.2 * family_risk)
        
        final_risk = min(
            image_weight * image_malignancy_prob + clinical_weight * clinical_score,
            1.0
        )
        
        if final_risk >= RiskCalculator.HIGH_RISK_THRESHOLD:
            risk_level = "High"
        elif final_risk >= RiskCalculator.MODERATE_RISK_THRESHOLD:
            risk_level = "Moderate"
        else:
            risk_level = "Low"
        
        return final_risk, risk_level
    
    @staticmethod
    def get_risk_recommendations(risk_level: str, age: int, smoking: int) -> list:
        recommendations = []
        
        if risk_level == "High":
            recommendations.extend([
                "Immediate referral to thoracic oncology specialist",
                "Consider PET-CT scan for further evaluation",
                "Schedule biopsy consultation within 2 weeks"
            ])
        elif risk_level == "Moderate":
            recommendations.extend([
                "Follow-up CT scan recommended in 3-6 months",
                "Consultation with pulmonologist advised",
                "Consider low-dose CT screening enrollment"
            ])
        else:
            recommendations.extend([
                "Routine follow-up in 12 months",
                "Continue annual screening if eligible",
                "Maintain healthy lifestyle"
            ])
        
        if smoking > 0:
            recommendations.append("Smoking cessation programs strongly recommended")
        
        if age >= 65:
            recommendations.append("Consider geriatric oncology consultation if diagnosed")
        
        return recommendations


class ModelEvaluator:
    
    @staticmethod
    def get_prediction_confidence_details(
        probabilities: dict,
        predicted_class: int,
        class_names: list
    ) -> dict:
        prob_values = list(probabilities.values())
        max_prob = max(prob_values)
        
        confidence = max_prob
        entropy = -sum(p * np.log(p + 1e-10) for p in prob_values)
        max_entropy = np.log(len(prob_values))
        uncertainty = entropy / max_entropy if max_entropy > 0 else 0
        
        return {
            "confidence": confidence,
            "uncertainty": uncertainty,
            "predicted_class": class_names[predicted_class],
            "all_probabilities": probabilities,
            "margin": confidence - sorted(prob_values, reverse=True)[1] if len(prob_values) > 1 else 1.0
        }
    
    @staticmethod
    def detect_anomalies(image: Image.Image) -> dict:
        try:
            img_array = np.array(image, dtype=np.float32)
            
            anomalies = []
            
            if np.max(img_array) == np.min(img_array):
                anomalies.append("Uniform image (no variation)")
            
            if np.std(img_array) < 10:
                anomalies.append("Very low contrast (potential artifact)")
            
            if np.sum(img_array > 250) > (img_array.size * 0.05):
                anomalies.append("Possible oversaturation")
            
            return {
                "anomalies_detected": len(anomalies) > 0,
                "issues": anomalies
            }
        except Exception as e:
            logger.error(f"Anomaly detection failed: {str(e)}")
            return {"anomalies_detected": False, "issues": []}
