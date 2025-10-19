#!/usr/bin/env bash
# Download dataset from Google Drive using gdown.
# Replace DRIVE_FILE_ID below with the id from the shared link.
# Example link: https://drive.google.com/file/d/1uD1UMXT2-13GQkb_H9NmEOyVI-zKyl6/view?usp=sharing
# DRIVE_FILE_ID is the long id after /d/ and before /view
DRIVE_FILE_ID="1uD1UMXT2-13GQkb_H9NmEOyUVI-zKyl6"
OUT="data/dataset.zip"
mkdir -p data
echo "Downloading dataset to ${OUT} (requires gdown)..."
if ! command -v gdown >/dev/null 2>&1; then
  echo "gdown not found. Install with: pip install gdown"
  exit 1
fi
gdown --fuzzy https://drive.google.com/uc?id=${DRIVE_FILE_ID} -O ${OUT}
echo "Downloaded. Unzip into data/ and ensure products.csv is at data/products.csv"
