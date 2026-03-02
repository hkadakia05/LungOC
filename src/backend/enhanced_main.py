from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from torchvision.models import resnet18
from torchvision import transforms
import torch
import torch.nn as nn
from PIL import Image
import io
import os
import logging
from datetime import datetime
from typing import Optional, List
import json
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lung_predictions.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lung Cancer Risk Prediction API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cpu")
model = resnet18(weights=None)
model.fc = nn.Linear(512, 3)

model_path = Path(__file__).parent / "lung_model.pth"
model.load_state_dict(torch.load(str(model_path), map_location=device))
model.to(device)
model.eval()

class_names = ['Benign cases', 'Malignant cases', 'Normal cases']

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

predictions_log = []

@app.get("/")
async def root():
    return {
        "message": "Lung Cancer Risk Prediction API v2.0",
        "endpoints": {
            "/predict": "POST - Run prediction",
            "/health": "GET - Health check",
            "/history": "GET - Get prediction history",
            "/stats": "GET - Get analytics",
            "/validate-image": "POST - Validate image quality"
        },
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": True,
        "predictions_total": len(predictions_log)
    }

@app.post("/validate-image")
async def validate_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        if image.format not in ['JPEG', 'PNG', 'JPG']:
            raise HTTPException(status_code=400, detail="Invalid image format. Use JPEG or PNG.")
        
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large. Max 10MB.")
        
        width, height = image.size
        if width < 100 or height < 100:
            raise HTTPException(status_code=400, detail="Image too small. Min 100x100 pixels.")
        
        logger.info(f"Image validation passed: {width}x{height}, {image.format}")
        
        return {
            "valid": True,
            "format": image.format,
            "dimensions": f"{width}x{height}",
            "size_mb": round(len(contents) / (1024*1024), 2)
        }
    except Exception as e:
        logger.error(f"Image validation failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    age: int = Form(...),
    smoking: int = Form(...),
    family_history: bool = Form(...)
):
    try:
        if not (18 <= age <= 120):
            raise HTTPException(status_code=400, detail="Age must be between 18 and 120")
        if smoking < 0:
            raise HTTPException(status_code=400, detail="Smoking pack-years cannot be negative")
        
        logger.info(f"Prediction request: age={age}, smoking={smoking}, family_history={family_history}")
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        if image.size[0] < 100 or image.size[1] < 100:
            raise HTTPException(status_code=400, detail="Image dimensions too small")
        
        input_tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(input_tensor)
            probs = torch.softmax(outputs, dim=1)
            predicted_class = torch.argmax(probs, dim=1).item()
        
        image_malignant_prob = probs[0][1].item()
        benign_prob = probs[0][0].item()
        normal_prob = probs[0][2].item()
        
        age_factor = min((age - 40) / 40, 1.0) if age > 40 else 0
        smoking_factor = min(smoking / 100, 1.0)
        family_factor = 0.15 if family_history else 0
        
        clinical_score = (0.3 * age_factor + 0.4 * smoking_factor + 0.3 * family_factor)
        
        final_risk = min(0.7 * image_malignant_prob + 0.3 * clinical_score, 1.0)
        
        if predicted_class == 1:
            confidence = image_malignant_prob
        elif predicted_class == 0:
            confidence = benign_prob
        else:
            confidence = normal_prob
        
        if final_risk > 0.7:
            risk_level = "High"
        elif final_risk > 0.4:
            risk_level = "Moderate"
        else:
            risk_level = "Low"
        
        response = {
            "prediction": class_names[predicted_class],
            "probabilities": {
                "benign": round(benign_prob, 3),
                "malignant": round(image_malignant_prob, 3),
                "normal": round(normal_prob, 3)
            },
            "final_risk": round(final_risk, 3),
            "risk_level": risk_level,
            "confidence": round(confidence, 3),
            "timestamp": datetime.now().isoformat()
        }
        
        prediction_record = {
            **response,
            "age": age,
            "smoking": smoking,
            "family_history": family_history,
            "image_name": file.filename
        }
        predictions_log.append(prediction_record)
        
        logger.info(f"Prediction successful: {risk_level} risk (confidence: {confidence:.2%})")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/history")
async def get_history(limit: int = 100):
    try:
        recent = predictions_log[-limit:] if len(predictions_log) > limit else predictions_log
        
        logger.info(f"History requested: {len(recent)} predictions returned")
        
        return {
            "total_predictions": len(predictions_log),
            "returned": len(recent),
            "predictions": recent
        }
    except Exception as e:
        logger.error(f"History retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")

@app.get("/stats")
async def get_analytics():
    try:
        if not predictions_log:
            return {
                "total_predictions": 0,
                "message": "No predictions yet"
            }
        
        high_risk = sum(1 for p in predictions_log if p["risk_level"] == "High")
        moderate_risk = sum(1 for p in predictions_log if p["risk_level"] == "Moderate")
        low_risk = sum(1 for p in predictions_log if p["risk_level"] == "Low")
        
        avg_confidence = sum(p["confidence"] for p in predictions_log) / len(predictions_log)
        avg_age = sum(p["age"] for p in predictions_log) / len(predictions_log)
        avg_smoking = sum(p["smoking"] for p in predictions_log) / len(predictions_log)
        
        family_history_count = sum(1 for p in predictions_log if p["family_history"])
        
        stats = {
            "total_predictions": len(predictions_log),
            "risk_distribution": {
                "high": high_risk,
                "moderate": moderate_risk,
                "low": low_risk
            },
            "averages": {
                "confidence": round(avg_confidence, 3),
                "age": round(avg_age, 1),
                "smoking_pack_years": round(avg_smoking, 1),
                "family_history_percentage": round((family_history_count / len(predictions_log)) * 100, 1)
            },
            "most_common_prediction": max(set(p["prediction"] for p in predictions_log), 
                                         key=lambda x: sum(1 for p in predictions_log if p["prediction"] == x))
        }
        
        logger.info(f"Analytics retrieved: {len(predictions_log)} total predictions")
        
        return stats
        
    except Exception as e:
        logger.error(f"Analytics calculation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating analytics: {str(e)}")

@app.on_event("startup")
async def startup_event():
    logger.info("Lung Cancer Risk Prediction API v2.0 started")
    logger.info(f"Model: ResNet18, Classes: {class_names}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"API shutdown. Total predictions processed: {len(predictions_log)}")
