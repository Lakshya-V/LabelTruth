```markdown
# LabelTruth 🌿🔎

**Unmasking hidden additives, deceptive greenwashing, and ultra-processed food reliance with instant, budget-friendly campus swaps.**

LabelTruth is a precision campus nutrition platform engineered for college students and hostel residents. Moving beyond passive calorie tracking, LabelTruth provides an active dietary and financial intervention: scanning food labels in sub-seconds via on-device camera OCR, exposing synthetic E-numbers and hidden sugars, flagging condition-specific medical hazards, and offering hyper-local **"Nutrient-per-Rupee"** campus food swaps.

---

## 🎯 The Problem & Our Intervention

* **The Student UPF Trap:** College students heavily rely on ultra-processed foods (UPFs) due to tight budgets, lack of cooking infrastructure, and deceptive packaging claims (*"Fit"*, *"100% Real Fruit"*).
* **Passive vs. Active Tracking:** Standard fitness apps merely record calories after you consume them. LabelTruth intervenes **before purchase**, exposing greenwashing and calculating healthier, cheaper alternatives available on campus.

---

## ✨ Key Features

* ⚡ **Sub-Second On-Device OCR:** Parses complex ingredient lists directly on-device using Expo Camera and local rule processing with zero latency.
* 🏷️ **Greenwashing Detector:** Automatically cross-checks front-of-pack claims against NOVA Group 4 additive flags and synthetic substitute rules.
* ⚠️ **Personalized Medical Hazard Alerts:** Dynamically flags high-risk ingredients tailored to user profiles (e.g., Maltodextrin/HFCS alerts for *Diabetic* users; Sodium/MSG alerts for *Hypertension*).
* 💰 **Nutrient-per-Rupee Swap Engine:** Replaces ₹50+ packaged UPFs with ₹15 high-nutrition local campus alternatives (e.g., Roasted Chana & Jaggery).
* 📊 **Dual Health & Eco-Impact Score (0–100):** Combines additive safety, glycemic processing risk, and packaging footprints into a single visual badge (`RED`, `AMBER`, `GREEN`).

---

## 🛠️ Tech Stack

* **Mobile Frontend:** React Native / Expo (Camera OCR, Tailwind CSS/NativeWind UI, Axios/Fetch API)
* **Backend Framework:** FastAPI (Python 3.11+)
* **Database & Persistence:** SQLite (`labeltruth.db`) with SQLAlchemy ORM & Pydantic validation
* **Authentication:** Bcrypt password hashing
* **Rule Engine & Caching:** Custom additive matrix (`additive_db.py`) with Python `lru_cache` for sub-second barcode lookups

---

## 📁 Repository Directory Structure

```text
LabelTruth/
├── backend/
│   ├── main.py              # FastAPI app setup, endpoints, & pipeline logic
│   ├── database.py          # SQLite connection engine & DB session setup
│   ├── models.py            # SQLAlchemy database models (User, ScanHistory)
│   ├── schemas.py           # Pydantic request & response validation schemas
│   ├── auth.py              # Security & password hashing functions
│   ├── additive_db.py       # ADDITIVES_DB lookup table & swap rule engine
│   ├── labeltruth.db        # Local SQLite database (git-ignored)
│   └── requirements.txt     # Python backend dependencies
├── frontend/                # Expo / React Native mobile codebase
├── .gitignore               # Ignores database, node_modules, & virtualenvs
└── README.md                # Project documentation

```

---

## 🚀 Getting Started

### 1. Backend Setup (FastAPI + SQLite)

1. Navigate to the `backend` directory:
```bash
cd backend

```


2. Create and activate a Python virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate

```


3. Install required dependencies:
```bash
pip install -r requirements.txt

```


4. Start the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```


*The interactive Swagger API documentation will be available at `http://localhost:8000/docs`.*

---

### 2. Mobile Frontend Setup (Expo / React Native)

1. Navigate to the `frontend` directory:
```bash
cd frontend

```


2. Install JavaScript packages:
```bash
npm install

```


3. Configure local development server IP in your API config (`services/api.js`):
* **Android Emulator:** `http://10.0.2.2:8000`
* **iOS Simulator:** `http://127.0.0.1:8000`
* **Physical Device (Same Wi-Fi):** `http://<YOUR_LOCAL_IP>:8000`


4. Launch the Expo app:
```bash
npx expo start

```



---

## 📡 API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | System health check & DB connection status |
| `POST` | `/register` | Create student profile & medical flags |
| `POST` | `/login` | Authenticate user |
| `GET` | `/profile/{user_id}` | Retrieve active profile parameters |
| `PUT` | `/profile/{user_id}` | Update medical condition flags |
| `POST` | `/scan/text` | Process OCR text, evaluate hazards, score & generate campus swap |
| `GET` | `/scan/barcode/{barcode}` | Lookup barcode via Open Food Facts with local score engine |
| `GET` | `/history/{user_id}` | Fetch scan history logs |
| `DELETE` | `/history/{scan_id}` | Delete scan history item |

---

## 🔒 Security & Best Practices

* **Environment Safety:** Local SQLite database files (`labeltruth.db`) are excluded from Git version control via `.gitignore` to prevent repository bloat and merge conflicts.
* **Network Testing:** Always update base URLs to your machine's physical LAN IP when running on physical iOS/Android devices.

```

```