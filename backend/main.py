import sys
import os
import requests
from pathlib import Path
from typing import Optional
from functools import lru_cache
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from dotenv import load_dotenv

# Ensure backend modules load smoothly regardless of terminal launch location
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.database import engine, Base, get_db
from backend.models import User, ScanLog

load_dotenv()

# Initialize SQLite Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LabelTruth Engine")

# 1. LOCAL CAMPUS SWAP DATABASE (Nutrient-per-Rupee Engine)
LOCAL_SWAPS = {
    "MALTODEXTRIN": {"swap_item": "Roasted Chana & Jaggery", "approx_cost": "₹15", "benefit": "3x Protein, GI index < 30 (Saves ₹35 vs packaged bar)"},
    "HIGH FRUCTOSE CORN SYRUP": {"swap_item": "Fresh Coconut Water or Local Banana", "approx_cost": "₹20", "benefit": "Natural Electrolytes, Zero UPF (Saves ₹25 vs canned juice)"},
    "E621": {"swap_item": "Spiced Boiled Peanut Bowl", "approx_cost": "₹15", "benefit": "High Fiber & Healthy Fats (Saves ₹30 vs Processed Chips)"},
    "DEFAULT_UPF": {"swap_item": "Sprouted Moong / Sprouts Chaat", "approx_cost": "₹10-15", "benefit": "Zero Processing, Max Micronutrients"}
}

# 2. GREENWASHING DETECTOR
def detect_greenwashing(text: str, nova_level: int, flagged_additives: list):
    claims = ["100% natural", "fit", "healthy", "no added sugar", "real fruit", "organic", "diet"]
    found_claims = [c for c in claims if c in text.lower()]
    
    # If it advertises as healthy but is NOVA 3/4 or has hazardous additives
    if found_claims and (nova_level >= 3 or len(flagged_additives) > 0):
        return f"⚠️ GREENWASHING DETECTED: Advertised as '{found_claims[0].title()}', but contains ultra-processed additives/NOVA {nova_level} level."
    return None

# 3. UPDATED SCORING ENGINE (Health + Eco Impact + Swaps)
def calculate_extended_metrics(raw_text: str, nova_level: int, flagged_additives: list, dietary_condition: str):
    # Health Score
    health_score = 100 - (40 if nova_level == 4 else 25 if nova_level == 3 else 10 if nova_level == 2 else 0)
    health_score -= (len(flagged_additives) * 12)
    health_score = max(0, min(100, health_score))
    
    # Planet / Eco Processing Impact Score (UPF manufacturing & packaging footprint)
    eco_score = max(10, 100 - (nova_level * 20) - (len(flagged_additives) * 5))
    
    # Combined Visual Badge
    combined_score = round((health_score + eco_score) / 2)
    badge = "GREEN" if combined_score >= 75 else "AMBER" if combined_score >= 45 else "RED"

    # Personalized Warning
    warning = None
    cond_lower = dietary_condition.lower()
    additive_names = [a.get("name", "").lower() for a in flagged_additives]
    
    if "diabetic" in cond_lower and any("maltodextrin" in n or "hfcs" in n for n in additive_names):
        warning = "⚠️ CRITICAL ALERT: High-glycemic additives detected for your Diabetic profile!"
    elif "hypertension" in cond_lower and any("sodium" in n or "msg" in n for n in additive_names):
        warning = "⚠️ SODIUM ALERT: Ingredients detected that may elevate blood pressure."

    # Greenwashing Alert
    greenwash_alert = detect_greenwashing(raw_text, nova_level, flagged_additives)

    # Local Swap Recommendation
    recommended_swap = LOCAL_SWAPS.get("DEFAULT_UPF")
    for a in flagged_additives:
        key = a.get("name", "").upper()
        if "MALTODEXTRIN" in key: recommended_swap = LOCAL_SWAPS["MALTODEXTRIN"]; break
        elif "HFCS" in key: recommended_swap = LOCAL_SWAPS["HIGH FRUCTOSE CORN SYRUP"]; break
        elif "MSG" in key: recommended_swap = LOCAL_SWAPS["E621"]; break

    return {
        "health_score": health_score,
        "eco_impact_score": eco_score,
        "overall_score": combined_score,
        "badge_color": badge,
        "personalized_warning": warning,
        "greenwashing_alert": greenwash_alert,
        "nutrient_per_rupee_swap": recommended_swap
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Local Additive & UPF Reference Database
ADDITIVES_DB = {
    "E621": {"name": "Monosodium Glutamate (MSG)", "risk": "Moderate", "note": "Excitotoxin; promotes overeating"},
    "E102": {"name": "Tartrazine", "risk": "High", "note": "Artificial dye; linked to hyperactivity"},
    "E250": {"name": "Sodium Nitrite", "risk": "High", "note": "Preservative; forms carcinogenic nitrosamines"},
    "MALTODEXTRIN": {"name": "Maltodextrin", "risk": "High", "note": "Glycemic Index ~110 (Higher than sugar!)"},
    "HIGH FRUCTOSE CORN SYRUP": {"name": "HFCS", "risk": "High", "note": "Linked to fatty liver & insulin resistance"}
}

# --- CACHING ENGINE ---
@lru_cache(maxsize=256)
def fetch_off_barcode_data(barcode_id: str):
    """Caches Open Food Facts API requests in memory for instant repeated lookups."""
    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode_id}.json"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return None
        data = response.json()
        return data if data.get("status") == 1 else None
    except Exception:
        return None

# --- HEALTH SCORING ENGINE ---
def calculate_health_metrics(nova_level: int, flagged_additives: list, dietary_condition: str):
    score = 100
    if nova_level == 4: score -= 40
    elif nova_level == 3: score -= 25
    elif nova_level == 2: score -= 10

    score -= (len(flagged_additives) * 12)
    score = max(0, min(100, score))
    badge = "GREEN" if score >= 75 else "AMBER" if score >= 45 else "RED"

    warning = None
    cond_lower = dietary_condition.lower()
    additive_names = [a.get("name", "").lower() for a in flagged_additives]

    if "diabetic" in cond_lower and any("maltodextrin" in n or "hfcs" in n for n in additive_names):
        warning = "⚠️ CRITICAL ALERT: High-glycemic ingredients detected for your Diabetic profile!"
    elif "hypertension" in cond_lower and any("sodium" in n or "msg" in n for n in additive_names):
        warning = "⚠️ SODIUM ALERT: Ingredients detected that may elevate blood pressure."

    return {"health_score": score, "badge_color": badge, "personalized_warning": warning}

# --- PYDANTIC SCHEMAS ---
class UserRegister(BaseModel):
    email: str
    password: str
    dietary_condition: str = "None"

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    dietary_condition: str

class TextScanRequest(BaseModel):
    ocr_text: str
    user_id: Optional[int] = None

# --- ROUTE 1: HOME HEALTH CHECK ---
@app.get("/")
def home():
    return {"status": "LabelTruth API Running"}

# --- ROUTES 2 & 3: AUTHENTICATION ---
@app.post("/auth/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = pwd_context.hash(user_data.password)
    new_user = User(
        email=user_data.email, 
        password_hash=hashed_pwd, 
        dietary_condition=user_data.dietary_condition
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "user_id": new_user.id, "email": new_user.email}

@app.post("/auth/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not pwd_context.verify(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "status": "success", 
        "user_id": user.id, 
        "email": user.email, 
        "dietary_condition": user.dietary_condition
    }

# --- ROUTES 4 & 5: USER PROFILES ---
@app.get("/user/profile/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email, "dietary_condition": user.dietary_condition}

@app.put("/user/profile/{user_id}")
def update_user_profile(user_id: int, profile_data: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.dietary_condition = profile_data.dietary_condition
    db.commit()
    return {"status": "success", "dietary_condition": user.dietary_condition}

# --- ROUTE 6: EXPO FRONTEND OCR SCAN ---
@app.post("/scan/text")
def scan_ocr_text(payload: TextScanRequest, db: Session = Depends(get_db)):
    raw_text = payload.ocr_text.lower()
    flagged = [info for key, info in ADDITIVES_DB.items() if key.lower() in raw_text]
    
    estimated_nova = 4 if len(flagged) >= 2 else 3 if len(flagged) == 1 else 1

    dietary_condition = "None"
    if payload.user_id:
        user = db.query(User).filter(User.id == payload.user_id).first()
        if user: dietary_condition = user.dietary_condition

    metrics = calculate_health_metrics(estimated_nova, flagged, dietary_condition)

    if payload.user_id:
        log_entry = ScanLog(
            user_id=payload.user_id,
            product_name="Expo Label Scan",
            nova_level=estimated_nova,
            verdict=f"Score: {metrics['health_score']}/100 - {metrics['badge_color']}"
        )
        db.add(log_entry)
        db.commit()

    return {
        "source": "Expo OCR Text Engine",
        "raw_text_received": payload.ocr_text,
        "estimated_nova_level": estimated_nova,
        "flagged_additives": flagged,
        **metrics
    }

# --- ROUTE 7: CACHED BARCODE SCAN ---
@app.get("/scan/barcode/{barcode_id}")
def scan_barcode(barcode_id: str, user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    data = fetch_off_barcode_data(barcode_id)
    if not data:
        raise HTTPException(status_code=404, detail="Product not found in database")

    product = data.get("product", {})
    ingredients_text = product.get("ingredients_text", "")
    nova_group = int(product.get("nova_group", 0)) if str(product.get("nova_group")).isdigit() else 0
    product_name = product.get("product_name", "Unknown Product")
    
    flagged = [info for key, info in ADDITIVES_DB.items() if key.lower() in ingredients_text.lower()]
    
    dietary_condition = "None"
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user: dietary_condition = user.dietary_condition

    metrics = calculate_health_metrics(nova_group, flagged, dietary_condition)

    if user_id:
        log_entry = ScanLog(
            user_id=user_id,
            product_name=product_name,
            nova_level=nova_group,
            verdict=f"Score: {metrics['health_score']}/100 - {metrics['badge_color']}"
        )
        db.add(log_entry)
        db.commit()

    return {
        "source": "Barcode API (Cached)",
        "product_name": product_name,
        "nova_upf_level": nova_group,
        "ingredients": ingredients_text,
        "flagged_additives": flagged,
        **metrics
    }

# --- ROUTES 8 & 9: USER HISTORY ---
@app.get("/user/history/{user_id}")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    logs = db.query(ScanLog).filter(ScanLog.user_id == user_id).all()
    return {"user_id": user_id, "history": logs}

@app.delete("/user/history/{log_id}")
def delete_scan_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(ScanLog).filter(ScanLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log entry not found")
    db.delete(log)
    db.commit()
    return {"status": "deleted", "log_id": log_id}