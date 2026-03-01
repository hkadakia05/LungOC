
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from torchvision.models import resnet18
from torchvision import transforms
import torch
import torch.nn as nn
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict later if deploying
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


device = torch.device("cpu")

model = resnet18(weights=None)
model.fc = nn.Linear(512, 3)
model.load_state_dict(torch.load("lung_model.pth", map_location=device))
model.to(device)
model.eval()

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

   