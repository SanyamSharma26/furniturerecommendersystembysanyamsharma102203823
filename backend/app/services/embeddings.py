import os
from sentence_transformers import SentenceTransformer
from app.db.faiss_client import FaissClient
from app.db.pinecone_client import PineconeClient

model = SentenceTransformer('all-MiniLM-L6-v2')
# init clients (pinecone optional)
try:
    pc = PineconeClient()
except Exception:
    pc = None
fc = FaissClient()

async def embed_text(text: str):
    return model.encode([text], convert_to_numpy=True)[0].tolist()

async def upsert_items(items):
    vectors = []
    for it in items:
        text = f"{it.get('title','')} - {it.get('description','')} - brand:{it.get('brand','')}"
        emb = await embed_text(text)
        vectors.append({'id': it['uniq_id'], 'vector': emb, 'metadata': it})
    # upsert to pinecone if available else faiss
    if pc:
        pc.upsert(vectors)
    else:
        fc.upsert_local(vectors)
    return len(vectors)
