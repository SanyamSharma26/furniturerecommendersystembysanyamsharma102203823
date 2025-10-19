import os, json, numpy as np
import faiss

class FaissClient:
    def __init__(self, index_path='/mnt/data/faiss.index'):
        self.index_path = index_path
        self.dim = 384
        self.ids = []
        self.metadatas = {}
        self.index = None
        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
            if os.path.exists(index_path + '.meta'):
                with open(index_path + '.meta','r',encoding='utf-8') as f:
                    data = json.load(f)
                    self.ids = data.get('ids', [])
                    self.metadatas = data.get('metadatas', {})

    def upsert_local(self, vectors):
        # vectors: list of {'id': id, 'vector': [...], 'metadata': {...}}
        vecs = np.array([v['vector'] for v in vectors]).astype('float32')
        if self.index is None:
            self.index = faiss.IndexFlatL2(self.dim)
        self.index.add(vecs)
        for v in vectors:
            self.ids.append(v['id'])
            self.metadatas[v['id']] = v['metadata']
        faiss.write_index(self.index, self.index_path)
        with open(self.index_path + '.meta','w',encoding='utf-8') as f:
            json.dump({'ids': self.ids, 'metadatas': self.metadatas}, f)

    def query_local(self, vector, top_k=10):
        import numpy as np
        v = np.array(vector).astype('float32').reshape(1,-1)
        if self.index is None:
            return []
        D, I = self.index.search(v, top_k)
        results = []
        for dist, idx in zip(D[0], I[0]):
            if idx < 0 or idx >= len(self.ids):
                continue
            _id = self.ids[idx]
            results.append({'id': _id, 'score': float(1.0/(1.0+float(dist))), 'metadata': self.metadatas.get(_id)})
        return results
