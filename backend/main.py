import sys
from pathlib import Path
from typing import Optional
from functools import lru_cache

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# ---------------------------------------------------------------------------
# PATH / ENVIRONMENT
# ---------------------------------------------------------------------------

sys.path.append(str(Path(__file__).resolve().parent.parent))
load_dotenv()

from backend.database import engine, Base, get_db
from backend.models import User, ScanLog


# ---------------------------------------------------------------------------
# DATABASE
# ---------------------------------------------------------------------------

Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------------------------------

app = FastAPI(
    title="LabelTruth Engine API",
    description="Health, additive, NOVA and greenwashing analysis engine",
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# PASSWORD HASHING
# ---------------------------------------------------------------------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ---------------------------------------------------------------------------
# ADDITIVE DATABASE
# ---------------------------------------------------------------------------

ADDITIVES_DB = {
    "E621": {
        "name": "Monosodium Glutamate (MSG)",
        "risk": "Moderate",
        "note": "Flavor enhancer; contains sodium."
    },
    "E102": {
        "name": "Tartrazine",
        "risk": "High",
        "note": "Artificial food colouring."
    },
    "E250": {
        "name": "Sodium Nitrite",
        "risk": "High",
        "note": "Preservative used in processed foods."
    },
    "MALTODEXTRIN": {
        "name": "Maltodextrin",
        "risk": "High",
        "note": "Highly processed carbohydrate."
    },
    "HIGH FRUCTOSE CORN SYRUP": {
        "name": "HFCS",
        "risk": "High",
        "note": "Added sweetener."
    },
    "PALM OIL": {
        "name": "Palm Oil",
        "risk": "Moderate",
        "note": "Oil high in saturated fat."
    },
}


# ---------------------------------------------------------------------------
# LOCAL DEMO PRODUCTS
#
# These are ONLY for testing the backend.
# If these work, we know the running FastAPI process is using this file.
# ---------------------------------------------------------------------------

MOCK_LOCAL_PRODUCTS = {
    "611124672126111": {
        "product_name": "FitMax Energy & Protein Snack Bar",
        "ingredients_text": (
            "Maltodextrin, Whey Protein Concentrate, Palm Oil, "
            "High Fructose Corn Syrup, Sodium Chloride, Artificial Flavors"
        ),
        "nova_group": 4,
    },

    "890123456789011": {
        "product_name": "NutriFit Real Fruit Crunch Bar",
        "ingredients_text": (
            "Wheat Flour, Sugar, Palm Oil, Maltodextrin, "
            "Dried Apple Bits, E621, Artificial Flavor"
        ),
        "nova_group": 4,
    },
}


# ---------------------------------------------------------------------------
# OPEN FOOD FACTS
# ---------------------------------------------------------------------------

@lru_cache(maxsize=256)
def fetch_off_barcode_data(barcode: str):
    """
    Fetch a product from Open Food Facts using its barcode.
    """

    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"

    print(f"[OFF] Looking up barcode: {barcode}")
    print(f"[OFF] URL: {url}")

    try:
        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": "LabelTruth/1.0 (hackathon prototype)"
            },
        )

        print(f"[OFF] HTTP status: {response.status_code}")

        if response.status_code != 200:
            return None

        data = response.json()

        print(f"[OFF] Product status: {data.get('status')}")

        if data.get("status") != 1:
            return None

        return data

    except requests.RequestException as exc:
        print(f"[OFF] Request failed: {exc}")
        return None

    except Exception as exc:
        print(f"[OFF] Unexpected error: {exc}")
        return None


# ---------------------------------------------------------------------------
# GREENWASHING
# ---------------------------------------------------------------------------

def detect_greenwashing(
    text: str,
    nova_level: int,
    flagged_additives: list,
) -> Optional[str]:

    claims = [
        "100% natural",
        "100% real",
        "fit",
        "healthy",
        "no added sugar",
        "real fruit",
        "organic",
        "diet",
        "high protein",
    ]

    lower_text = text.lower()

    found_claims = [
        claim for claim in claims
        if claim in lower_text
    ]

    if found_claims and (
        nova_level >= 3 or len(flagged_additives) > 0
    ):
        return (
            f"⚠️ GREENWASHING DETECTED: "
            f"Advertised as '{found_claims[0].title()}', "
            f"but contains ultra-processed additives or "
            f"NOVA Level {nova_level} classification."
        )

    return None


# ---------------------------------------------------------------------------
# SCORE CALCULATION
# ---------------------------------------------------------------------------

def calculate_extended_metrics(
    raw_text: str,
    nova_level: int,
    flagged_additives: list,
    dietary_condition: str,
):

    # Health score
    health_score = 100

    if nova_level == 4:
        health_score -= 40
    elif nova_level == 3:
        health_score -= 25
    elif nova_level == 2:
        health_score -= 10

    health_score -= len(flagged_additives) * 12

    health_score = max(
        0,
        min(100, health_score)
    )

    # Environmental score
    eco_score = max(
        10,
        100 - (nova_level * 20) - (len(flagged_additives) * 5)
    )

    # Overall score
    overall_score = round(
        (health_score + eco_score) / 2
    )

    if overall_score >= 75:
        badge = "GREEN"
    elif overall_score >= 45:
        badge = "AMBER"
    else:
        badge = "RED"

    # Personalized warning
    warning = None

    condition = dietary_condition.lower()

    additive_names = [
        item.get("name", "").lower()
        for item in flagged_additives
    ]

    if (
        "diabetic" in condition
        and any(
            "maltodextrin" in name or "hfcs" in name
            for name in additive_names
        )
    ):
        warning = (
            "⚠️ CRITICAL ALERT: "
            "High-glycemic additives detected "
            "for your Diabetic profile!"
        )

    elif (
        "hypertension" in condition
        and any(
            "sodium" in name or "msg" in name
            for name in additive_names
        )
    ):
        warning = (
            "⚠️ SODIUM ALERT: "
            "Ingredients detected that may "
            "be relevant to your hypertension profile."
        )

    greenwashing_alert = detect_greenwashing(
        raw_text,
        nova_level,
        flagged_additives,
    )

    return {
        "health_score": health_score,
        "eco_impact_score": eco_score,
        "overall_score": overall_score,
        "badge_color": badge,
        "personalized_warning": warning,
        "greenwashing_alert": greenwashing_alert,
    }


# ---------------------------------------------------------------------------
# PYDANTIC SCHEMAS
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# HEALTH / ROOT
# ---------------------------------------------------------------------------

@app.get("/")
def home():
    return {
        "status": "LabelTruth Engine Online",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LabelTruth Engine v1.0.0",
    }


# ---------------------------------------------------------------------------
# AUTH
# ---------------------------------------------------------------------------

@app.post("/auth/register")
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):

    existing = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    hashed_pwd = pwd_context.hash(
        user_data.password
    )

    new_user = User(
        email=user_data.email,
        password_hash=hashed_pwd,
        dietary_condition=user_data.dietary_condition,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success",
        "user_id": new_user.id,
        "email": new_user.email,
    }


@app.post("/auth/login")
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(User.email == credentials.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not pwd_context.verify(
        credentials.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "status": "success",
        "user_id": user.id,
        "email": user.email,
        "dietary_condition": user.dietary_condition,
    }


# ---------------------------------------------------------------------------
# PROFILE
# ---------------------------------------------------------------------------

@app.get("/user/profile/{user_id}")
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return {
        "id": user.id,
        "email": user.email,
        "dietary_condition": user.dietary_condition,
    }


@app.put("/user/profile/{user_id}")
def update_user_profile(
    user_id: int,
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.dietary_condition = (
        profile_data.dietary_condition
    )

    db.commit()

    return {
        "status": "success",
        "dietary_condition": user.dietary_condition,
    }


# ---------------------------------------------------------------------------
# OCR TEXT SCAN
# ---------------------------------------------------------------------------

@app.post("/scan/text")
def scan_ocr_text(
    payload: TextScanRequest,
    db: Session = Depends(get_db),
):

    raw_text = payload.ocr_text.lower()

    flagged = [
        info
        for key, info in ADDITIVES_DB.items()
        if key.lower() in raw_text
    ]

    if len(flagged) >= 2:
        estimated_nova = 4
    elif len(flagged) == 1:
        estimated_nova = 3
    else:
        estimated_nova = 1

    dietary_condition = "None"

    if payload.user_id:
        user = (
            db.query(User)
            .filter(User.id == payload.user_id)
            .first()
        )

        if user:
            dietary_condition = user.dietary_condition

    metrics = calculate_extended_metrics(
        payload.ocr_text,
        estimated_nova,
        flagged,
        dietary_condition,
    )

    if payload.user_id:

        log_entry = ScanLog(
            user_id=payload.user_id,
            product_name="Expo Label Scan",
            nova_level=estimated_nova,
            verdict=(
                f"Score: "
                f"{metrics['overall_score']}/100 - "
                f"{metrics['badge_color']}"
            ),
        )

        db.add(log_entry)
        db.commit()

    return {
        "source": "Expo OCR Text Engine",
        "raw_text_received": payload.ocr_text,
        "estimated_nova_level": estimated_nova,
        "flagged_additives": flagged,
        **metrics,
    }


# ---------------------------------------------------------------------------
# BARCODE SCAN
# ---------------------------------------------------------------------------

@app.get("/scan/barcode/{barcode_id}")
def scan_barcode(
    barcode_id: str,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):

    barcode_id = barcode_id.strip()

    print("=" * 60)
    print(f"[BARCODE] Received: {barcode_id}")
    print("=" * 60)

    product_name = ""
    ingredients_text = ""
    nova_group = 0
    source = ""

    # -----------------------------------------------------------------------
    # 1. LOCAL DEMO DATABASE
    # -----------------------------------------------------------------------

    if barcode_id in MOCK_LOCAL_PRODUCTS:

        print(
            f"[BARCODE] Found in LOCAL MOCK DATABASE: "
            f"{barcode_id}"
        )

        local_item = MOCK_LOCAL_PRODUCTS[
            barcode_id
        ]

        product_name = local_item[
            "product_name"
        ]

        ingredients_text = local_item[
            "ingredients_text"
        ]

        nova_group = local_item[
            "nova_group"
        ]

        source = "Local Hackathon Seed DB"

    # -----------------------------------------------------------------------
    # 2. OPEN FOOD FACTS
    # -----------------------------------------------------------------------

    else:

        print(
            f"[BARCODE] Not in local DB. "
            f"Trying Open Food Facts..."
        )

        data = fetch_off_barcode_data(
            barcode_id
        )

        if not data:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Product {barcode_id} "
                    f"not found in Open Food Facts"
                ),
            )

        product = data.get(
            "product",
            {}
        )

        product_name = (
            product.get("product_name")
            or product.get("product_name_en")
            or "Unknown Product"
        )

        ingredients_text = (
            product.get("ingredients_text")
            or product.get("ingredients_text_en")
            or ""
        )

        nova_value = product.get(
            "nova_group",
            0
        )

        try:
            nova_group = int(
                nova_value
            )
        except (
            TypeError,
            ValueError,
        ):
            nova_group = 0

        source = "Open Food Facts API"

        print(
            f"[BARCODE] Open Food Facts product: "
            f"{product_name}"
        )

    # -----------------------------------------------------------------------
    # 3. ADDITIVE DETECTION
    # -----------------------------------------------------------------------

    flagged = [
        info
        for key, info in ADDITIVES_DB.items()
        if key.lower()
        in ingredients_text.lower()
    ]

    # -----------------------------------------------------------------------
    # 4. USER CONDITION
    # -----------------------------------------------------------------------

    dietary_condition = "None"

    if user_id:

        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if user:
            dietary_condition = (
                user.dietary_condition
            )

    # -----------------------------------------------------------------------
    # 5. METRICS
    # -----------------------------------------------------------------------

    combined_label_text = (
        f"{product_name} "
        f"{ingredients_text}"
    )

    metrics = calculate_extended_metrics(
        combined_label_text,
        nova_group,
        flagged,
        dietary_condition,
    )

    # -----------------------------------------------------------------------
    # 6. SAVE HISTORY
    # -----------------------------------------------------------------------

    if user_id:

        log_entry = ScanLog(
            user_id=user_id,
            product_name=product_name,
            nova_level=nova_group,
            verdict=(
                f"Score: "
                f"{metrics['overall_score']}/100 - "
                f"{metrics['badge_color']}"
            ),
        )

        db.add(log_entry)
        db.commit()

    # -----------------------------------------------------------------------
    # 7. RESPONSE
    # -----------------------------------------------------------------------

    return {
        "source": source,
        "product_name": product_name,
        "nova_upf_level": nova_group,
        "ingredients": ingredients_text,
        "flagged_additives": flagged,
        **metrics,
    }


# ---------------------------------------------------------------------------
# HISTORY
# ---------------------------------------------------------------------------

@app.get("/user/history/{user_id}")
def get_user_history(
    user_id: int,
    db: Session = Depends(get_db),
):

    logs = (
        db.query(ScanLog)
        .filter(ScanLog.user_id == user_id)
        .all()
    )

    return {
        "user_id": user_id,
        "history": logs,
    }


@app.delete("/user/history/{log_id}")
def delete_scan_log(
    log_id: int,
    db: Session = Depends(get_db),
):

    log = (
        db.query(ScanLog)
        .filter(ScanLog.id == log_id)
        .first()
    )

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Log entry not found",
        )

    db.delete(log)
    db.commit()

    return {
        "status": "deleted",
        "log_id": log_id,
    }