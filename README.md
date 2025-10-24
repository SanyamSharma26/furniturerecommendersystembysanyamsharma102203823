# furniturerecommendersystembysanyamsharma102203823

# Project Setup Guide

## 1. Download Dataset

_Instructions to be added_

## 2. Backend Setup

Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Set the Pinecone API key (optional):

```bash
export PINECONE_API_KEY=...
```

Start the development server:

```bash
uvicorn app.main:app --reload --port 8000
```

## 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
npm run dev
```

## Training

### Model Training Scripts

- **CV Training**: `backend/models/train_resnet.py` (PyTorch)
- **CLIP Image Embedding**: `backend/models/clip_embed.py`
- **Text Embedding/Upsert**: `backend/scripts/upsert_from_csv.py` 

## Deployed Link 
**https://furniturerecommendersystembysanyamsharma102203823.vercel.app/**
