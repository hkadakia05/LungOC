# LungOC - Lung Cancer Risk Prediction System

> AI-powered lung cancer malignancy risk assessment tool combining deep learning with clinical risk factors

UCSC BioHacks Project 1st Place in AI Applications in Biomedical Research 

## 🎯 Overview

LungOC is a hybrid decision support system that combines:
- **Deep Learning**: CNN-based image classification of CT scans
- **Clinical Risk Assessment**: Patient demographics (age, smoking history, family history)
- **Risk Stratification**: Provides actionable risk levels (Low/Moderate/High) with recommendations

## 🏗️ Architecture

- **Backend**: FastAPI + PyTorch (ResNet18 model)
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Model**: ResNet18 trained on lung CT scan dataset

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- PyTorch, FastAPI, Streamlit (see requirements)

### Local Development

**1. Backend (FastAPI)**
```bash
cd src/backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: `http://127.0.0.1:8000`

**2. Frontend (React)**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

**Alternative: Streamlit Frontend**
```bash
cd src
streamlit run app.py
```

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to:
- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel or Netlify (Free tier)

## 🧪 API Endpoints

### `GET /`
Health check and API info

### `GET /health`
Service health status

### `POST /predict`
Predict lung cancer risk from CT scan

**Request:**
- `file`: CT scan image (JPG/PNG)
- `age`: Patient age (integer)
- `smoking`: Pack-years of smoking (integer)
- `family_history`: Family history (boolean)

**Response:**
```json
{
  "prediction": "Malignant cases",
  "image_probability": 0.873,
  "final_risk": 0.742,
  "risk_level": "High"
}
```

## 🔬 Model Information

- **Architecture**: ResNet18 (modified final layer for 3 classes)
- **Classes**: Benign, Malignant, Normal
- **Input**: 224x224 RGB images
- **Framework**: PyTorch

## 📊 Risk Calculation

```
final_risk = 0.7 × image_malignancy_prob + 0.3 × clinical_score

clinical_score = 0.01 × age + 0.02 × smoking_pack_years + (0.1 if family_history)
```

## ⚠️ Disclaimer

This tool is a **research prototype** and **not intended for clinical diagnosis**. Always consult qualified healthcare professionals for medical decisions.

## 📄 License

See LICENSE file for details.

## 👥 Contributors

Heli :)

## 🔗 Links

- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](http://localhost:8000/docs) (when running locally)
