from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import router as v1_router

app = FastAPI(title='Product Recommender - Advanced')

app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])
app.include_router(v1_router, prefix='/api/v1')

@app.get('/health')
async def health():
    return {'status':'ok'}
