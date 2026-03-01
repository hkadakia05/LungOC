from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from torchvision.models import resnet18
from torchvision import transforms
import torch
import torch.nn as nn
from PIL import Image
import io
import os

app = FastAPI(title="Lung Cancer Risk Prediction API", version="1.0.0")

# CORS - allow all origins for now, configure specific domains in production if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Lung Cancer Risk Prediction API", "endpoints": {"/predict": "POST"}, "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True}

device = torch.device("cpu")

model = resnet18(weights=None)
model.fc = nn.Linear(512, 3)
model.load_state_dict(torch.load("lung_model.pth", map_location=device))
model.to(device)
model.eval()


#ignore txtx and add only case images from dataset
class_names = ['Benign cases', 'Malignant cases', 'Normal cases']


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    age: int = Form(...),
    smoking: int = Form(...),
    family_history: bool = Form(...)
):

   # read image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.softmax(outputs, dim=1)
        predicted_class = torch.argmax(probs, dim=1).item()

    image_malignant_prob = probs[0][1].item()

    # Clinical risk formula
    clinical_score = (
        0.01 * age +
        0.02 * smoking +
        (0.1 if family_history else 0)
    )

    final_risk = min(0.7 * image_malignant_prob + 0.3 * clinical_score, 1.0) #leveled 1.0 to avoid risk > 100%

    if final_risk > 0.7:
        risk_level = "High"
    elif final_risk > 0.4:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    return {
        "prediction": class_names[predicted_class],
        "image_probability": round(image_malignant_prob, 3), #prob 3 in decimal places
        "final_risk": round(final_risk, 3),
        "risk_level": risk_level
    }