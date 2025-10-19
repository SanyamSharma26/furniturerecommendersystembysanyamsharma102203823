# Upsert script: reads data/products.csv and upserts into vector store using embeddings service
import pandas as pd
import asyncio
from app.services.embeddings import upsert_items

async def main():
    df = pd.read_csv('data/products.csv')
    items = []
    for i,row in df.iterrows():
        items.append({
            'uniq_id': str(row.get('uniq_id') or i),
            'title': row.get('title',''),
            'description': row.get('description',''),
            'brand': row.get('brand',''),
            'price': float(row.get('price', 0) or 0),
            'categories': str(row.get('categories','')).split('|') if pd.notna(row.get('categories','')) else [],
            'images': [row.get('images')] if pd.notna(row.get('images')) else [],
            'material': row.get('material',''),
            'color': row.get('color','')
        })
    count = await upsert_items(items)
    print('Upserted', count)

if __name__=='__main__':
    asyncio.run(main())
