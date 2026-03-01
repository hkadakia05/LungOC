import streamlit as st
import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import resnet18
from PIL import Image
import numpy as np


st.set_page_config(
    page_title="Lung Cancer Risk Predictor",
    layout="centered"
)

st.title("Lung Cancer Malignancy Risk Predictor")
st.markdown("AI + Clinical Risk Hybrid Decision Support Tool")


device = torch.device("cpu")


model = resnet18(weights=None)
model.fc = nn.Linear(512, 3)
model.load_state_dict(torch.load("lung_model.pth", map_location=device))
model.to(device)
model.eval()

class_names = ['Benign', 'Malignant', 'Normal']


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

st.sidebar.header("Patient Risk Factors")

age = st.sidebar.slider("Age", 20, 90, 55)
smoking = st.sidebar.slider("Smoking Pack-Years", 0, 60, 15)
family_history = st.sidebar.checkbox("Family History of Lung Cancer")


uploaded_file = st.file_uploader("Upload CT Scan Image", type=["jpg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")

    st.image(image, caption="Uploaded CT Scan", use_container_width=True)

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.softmax(outputs, dim=1)
        predicted_class = torch.argmax(probs, dim=1).item()

    image_malignant_prob = probs[0][1].item()

    
    clinical_score = (
        0.01 * age +
        0.02 * smoking +
        (0.1 if family_history else 0)
    )

    final_risk = min(0.7 * image_malignant_prob + 0.3 * clinical_score, 1.0)

    st.subheader("AI Prediction Results")

    st.write(f"Image Classification: **{class_names[predicted_class]}**")
    st.write(f"Malignancy Probability (Image Model): **{image_malignant_prob:.2f}**")
    st.write(f"Adjusted Clinical Risk Score: **{final_risk:.2f}**")

    st.progress(final_risk)

    if final_risk > 0.7:
        st.error("High Risk: Immediate specialist consultation recommended.")
    elif final_risk > 0.4:
        st.warning("Moderate Risk: Follow-up CT scan recommended.")
    else:
        st.success("Low Risk: Routine monitoring advised.")

    st.markdown("---")
    st.caption("This tool is a research prototype and not intended for clinical diagnosis.")