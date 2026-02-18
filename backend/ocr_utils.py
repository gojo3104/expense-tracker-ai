# backend/ocr_utils.py
import os
import re
import math
import cv2
from datetime import datetime
from dateparser import parse as parse_date
from typing import Optional
import pytesseract

# ✅ Windows Tesseract path (verify this exists)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Allowed image types
ALLOWED_EXT = {"png", "jpg", "jpeg", "tif", "tiff", "bmp"}

# ---------- File Utilities ----------

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT


# ---------- Image Preprocessing (SAFE) ----------

def preprocess_image_for_ocr(image_path: str):
    """
    Minimal preprocessing for receipts.
    DO NOT over-process.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Light thresholding only (Otsu)
    gray = cv2.threshold(
        gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    return gray


# ---------- OCR ----------

def extract_text_from_image(image_path: str) -> str:
    try:
        img = preprocess_image_for_ocr(image_path)

        # Receipt-optimized config
        custom_config = r"--oem 3 --psm 4"

        text = pytesseract.image_to_string(img, config=custom_config)

        # 🔍 DEBUG (important)
        print("\n========== OCR OUTPUT ==========")
        print(text)
        print("================================\n")

        return text.strip()

    except Exception as e:
        print(f"OCR Extraction Error: {e}")
        return ""


# ---------- Parsing ----------

def parse_amount(text: str) -> Optional[float]:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    candidates = []

    amount_regex = re.compile(
        r"(?<!\d)(\d{1,3}(?:[,\d]{0,12})?(?:\.\d{1,2})?)(?!\d)"
    )

    def clean_num(s: str):
        try:
            v = float(s.replace(",", ""))
            if not math.isfinite(v) or v < 1 or v > 200000:
                return None
            return v
        except Exception:
            return None

    context_words = ("total", "amount", "grand", "balance", "payable")

    for ln in lines:
        if any(w in ln.lower() for w in context_words):
            for m in amount_regex.findall(ln):
                v = clean_num(m)
                if v:
                    candidates.append((v, 2))

    if not candidates:
        for ln in lines:
            for m in amount_regex.findall(ln):
                v = clean_num(m)
                if v:
                    candidates.append((v, 1))

    if not candidates:
        return None

    candidates.sort(key=lambda x: (x[1], x[0]), reverse=True)
    return candidates[0][0]


def parse_date_from_text(text: str) -> str:
    patterns = re.findall(r"\b\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}\b", text)

    for p in patterns:
        dt = parse_date(p, settings={"PREFER_DATES_FROM": "past"})
        if dt:
            return dt.date().isoformat()

    dt = parse_date(text, settings={"PREFER_DATES_FROM": "past"})
    if dt:
        return dt.date().isoformat()

    return datetime.now().date().isoformat()


def parse_merchant(text: str) -> Optional[str]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    skip = (
        "invoice",
        "receipt",
        "gst",
        "tax",
        "date",
        "time",
        "total",
        "amount",
        "payment",
    )

    for line in lines[:7]:
        if any(k in line.lower() for k in skip):
            continue
        if re.search(r"[A-Za-z]", line):
            return line

    return lines[0] if lines else None


def detect_category(text: str) -> str:
    t = text.lower()
    if re.search(r"hospital|medical|clinic|pharmacy", t):
        return "Healthcare"
    if re.search(r"grocery|mart|supermarket|store", t):
        return "Groceries"
    if re.search(r"restaurant|cafe|food|pizza|burger", t):
        return "Food & Dining"
    if re.search(r"uber|ola|taxi|fuel|petrol|bus|train", t):
        return "Travel"
    if re.search(r"electricity|water|gas|rent|wifi", t):
        return "Utilities"
    return "Other"


# ---------- Main Pipeline ----------

def extract_data(image_path: str) -> dict:
    raw_text = extract_text_from_image(image_path)

    if not raw_text.strip():
        return {
            "merchant": "Unknown",
            "amount": 0.0,
            "date": datetime.now().date().isoformat(),
            "category": "Other",
            "raw_text": "",
        }

    return {
        "merchant": parse_merchant(raw_text) or "Unknown",
        "amount": parse_amount(raw_text) or 0.0,
        "date": parse_date_from_text(raw_text),
        "category": detect_category(raw_text),
        "raw_text": raw_text,
    }
