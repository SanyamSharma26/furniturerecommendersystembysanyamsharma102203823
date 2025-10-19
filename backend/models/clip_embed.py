# Create CLIP image embeddings for all images in the dataset and save as numpy arrays
import os, argparse
import pandas as pd
from PIL import Image
import torch
import numpy as np
from torchvision import transforms
from transformers import CLIPProcessor, CLIPModel

def main(args):
    df = pd.read_csv(args.csv)
    model = CLIPModel.from_pretrained('openai/clip-vit-base-patch32')
    processor = CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32')
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model = model.to(device)
    embs = []
    ids = []
    for i,row in df.iterrows():
        img_path = row.get('image_path') or row.get('images')
        if isinstance(img_path, str) and img_path.startswith('http'):
            # skip remote
            continue
        img = Image.open(os.path.join(args.image_root, img_path)).convert('RGB')
        inputs = processor(images=img, return_tensors='pt').to(device)
        with torch.no_grad():
            out = model.get_image_features(**inputs)
            feat = out.cpu().numpy()[0]
        embs.append(feat)
        ids.append(row['uniq_id'])
    import numpy as np
    np.save(args.out + '.npy', np.vstack(embs))
    with open(args.out + '.ids','w',encoding='utf-8') as f:
        f.write('\n'.join(ids))

if __name__=='__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', required=True)
    parser.add_argument('--image-root', default='data/images')
    parser.add_argument('--out', default='clip_embeddings')
    args = parser.parse_args()
    main(args)
