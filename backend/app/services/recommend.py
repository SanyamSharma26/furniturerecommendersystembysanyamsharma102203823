from app.services.embeddings import embed_text
from app.db.faiss_client import FaissClient
from app.db.pinecone_client import PineconeClient
from app.services.genai import generate_description

try:
    pc = PineconeClient()
except Exception:
    pc = None
fc = FaissClient()

async def get_recommendations(payload):
    message = payload.get('message','')
    q_emb = await embed_text(message)
    # query pinecone if available else faiss
    if pc:
        res = pc.query(q_emb, top_k=8)
        matches = res.get('matches', [])
    else:
        matches = fc.query_local(q_emb, top_k=8)
    items = [m['metadata'] for m in matches]
    # attach genai descriptions for first 3
    for it in items[:3]:
        it['creative_description'] = await generate_description(it)
    return {'results': items}

async def analytics_summary():
    import pandas as pd, os
    p = '/mnt/data/products.csv'
    if os.path.exists(p):
        df = pd.read_csv(p)
        total = len(df)
        by_cat = {}
        if 'categories' in df.columns:
            s = df['categories'].fillna('').str.split('|').explode()
            by_cat = s.value_counts().to_dict()
        return {'total_items': total, 'by_category': by_cat}
    return {'total_items': 0, 'by_category': {}}
