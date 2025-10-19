import requests, io, base64
from PIL import Image
import torch, torchvision.transforms as T
from torchvision import models
import os

# Simple image classifier using a pretrained ResNet (transfer learning would be done in training script)
model = models.resnet18(pretrained=True)
model.eval()

transform = T.Compose([
    T.Resize((224,224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
])

async def classify_image_url(url):
    r = requests.get(url, timeout=10)
    img = Image.open(io.BytesIO(r.content)).convert('RGB')
    x = transform(img).unsqueeze(0)
    with torch.no_grad():
        logits = model(x)
        probs = torch.nn.functional.softmax(logits, dim=1)
        topk = torch.topk(probs, k=3)
    # return indices and scores
    return {'top_indices': topk.indices[0].tolist(), 'top_scores': topk.values[0].tolist()}
