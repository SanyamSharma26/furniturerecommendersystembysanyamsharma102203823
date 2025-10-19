import os
try:
    import pinecone
except Exception:
    pinecone = None

class PineconeClient:
    def __init__(self, index_name='products'):
        key = os.getenv('PINECONE_API_KEY')
        env = os.getenv('PINECONE_ENV')
        if not pinecone or not key:
            self.mock = True
            return
        self.mock = False
        pinecone.init(api_key=key, environment=env)
        if index_name not in pinecone.list_indexes():
            pinecone.create_index(index_name, dimension=384)
        self.index = pinecone.Index(index_name)

    def upsert(self, vectors):
        if self.mock:
            import json, os
            os.makedirs('/mnt/data/pinecone_mock', exist_ok=True)
            with open('/mnt/data/pinecone_mock/vectors.json','w',encoding='utf-8') as f:
                json.dump(vectors, f, ensure_ascii=False, indent=2)
            return
        self.index.upsert(vectors=vectors)

    def query(self, vector, top_k=10):
        if self.mock:
            import math, json, os
            p = '/mnt/data/pinecone_mock/vectors.json'
            if not os.path.exists(p):
                return {'matches': []}
            with open(p,'r',encoding='utf-8') as f:
                data = json.load(f)
            def dist(a,b):
                return math.sqrt(sum((x-y)**2 for x,y in zip(a,b)))
            sims = []
            for item in data:
                d = dist(vector, item['values'][:len(vector)])
                sims.append((d,item))
            sims = sorted(sims, key=lambda x: x[0])
            matches = [{'id': s[1]['id'], 'score': 1.0/(1+s[0]), 'metadata': s[1]['metadata']} for s in sims[:top_k]]
            return {'matches': matches}
        res = self.index.query(vector=vector, top_k=top_k, include_metadata=True)
        return res
