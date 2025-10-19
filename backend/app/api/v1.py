from fastapi import APIRouter, Body, HTTPException
from typing import List
from pydantic import BaseModel
from app.services import recommend, embeddings, cv_service

router = APIRouter()


class UpsertItem(BaseModel):
    uniq_id: str
    title: str = ''
    description: str = ''
    brand: str = None
    price: float = None
    categories: List[str] = []
    images: List[str] = []
    material: str = None
    color: str = None

@router.post('/upsert')
async def upsert(items: List[UpsertItem]):
    count = await embeddings.upsert_items([i.dict() for i in items])
    return {'upserted': count}

@router.post('/recommend')
async def recommend_route(payload: dict = Body(...)):
    resp = await recommend.get_recommendations(payload)
    return resp

@router.get('/analytics')
async def analytics():
    return await recommend.analytics_summary()

@router.post('/classify-image')
async def classify_image(payload: dict = Body(...)):
    # payload: { 'image_url': 'http://...' }
    url = payload.get('image_url')
    if not url:
        raise HTTPException(status_code=400, detail='image_url required')
    return await cv_service.classify_image_url(url)
