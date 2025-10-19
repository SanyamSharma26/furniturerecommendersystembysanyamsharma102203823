# Training script to fine-tune a ResNet on the furniture dataset.
# Assumes images are arranged or there is a CSV mapping uniq_id -> image_path -> category.
import argparse
import os
from PIL import Image
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
import torch.nn as nn, torch.optim as optim

class FurnitureDataset(Dataset):
    def __init__(self, df, root='data', transform=None):
        self.df = df.reset_index(drop=True)
        self.root = root
        self.transform = transform
    def __len__(self):
        return len(self.df)
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = row.get('image_path') or row.get('images')
        # if images column contains list-like string, take first
        if isinstance(img_path, str) and img_path.startswith('http'):
            # skip remote for training in this script; prefer local images
            raise RuntimeError('Local images required for training')
        img = Image.open(os.path.join(self.root, img_path)).convert('RGB')
        if self.transform:
            img = self.transform(img)
        label = row['label']
        return img, label

def train(args):
    df = pd.read_csv(args.csv)
    # expect df to have a 'label' column as integer
    transform = transforms.Compose([
        transforms.Resize((224,224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
    ])
    ds = FurnitureDataset(df, root=args.image_root, transform=transform)
    dl = DataLoader(ds, batch_size=32, shuffle=True, num_workers=4)
    model = models.resnet18(pretrained=True)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, args.num_classes)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-4)
    for epoch in range(args.epochs):
        model.train()
        total=0; correct=0
        for xb,yb in dl:
            xb=xb.to(device); yb=yb.to(device)
            optimizer.zero_grad()
            out = model(xb)
            loss = criterion(out,yb)
            loss.backward(); optimizer.step()
            preds = out.argmax(dim=1)
            total += yb.size(0)
            correct += (preds==yb).sum().item()
        acc = correct/total
        print(f'Epoch {epoch+1}/{args.epochs} acc={acc:.4f}')
    torch.save(model.state_dict(), args.out)

if __name__=='__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', required=True)
    parser.add_argument('--image-root', default='data/images')
    parser.add_argument('--num-classes', type=int, required=True)
    parser.add_argument('--epochs', type=int, default=5)
    parser.add_argument('--out', default='models/resnet_finetuned.pth')
    args = parser.parse_args()
    train(args)
