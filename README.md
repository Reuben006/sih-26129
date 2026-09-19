# GovConnect — Government Interoperability Middleware Layer
### Smart India Hackathon (SIH 2026) • Problem Statement 129
> **Federated Service Architecture Connecting Heterogeneous Government Systems Without Replacing Legacy Portals**

---

## 🏛️ Executive Summary

Government departments operate multiple portals, mobile applications, registries, workflow systems, and databases that were developed independently. They feature incompatible data formats, unique local identifiers, distinct authentication mechanisms, and siloed databases.

**GovConnect** is NOT another generic government portal. It is an **Interoperability Middleware Layer (Federated Service Architecture)** designed to act as the national digital glue. It enables businesses and citizens to submit common information **ONCE**, orchestrating statutory clearances across Municipal Corporations, Food Safety (FSSAI), and Fire Departments without replacing or migrating their existing legacy systems.

---

## ⚡ Core Interoperability Capabilities Demonstrated

1. **API-Based Data Exchange**: High-throughput FastAPI REST gateway with standard HTTP contracts and headers.
2. **Common Canonical Data Model**: Normalized data schema capturing applicant KYC, business entity identifiers, and structural dimensions.
3. **Data Mapping & Schema Transformation**: Zero-loss bi-directional translation from Common Canonical format to proprietary formats (`enterpriseName` for Municipality, `firm_name` for FSSAI, `establishment` for Fire).
4. **Master-Data Handling**: Global unique reference tracking (`APP-1001`) mapped to department local IDs (`MUNI-93821`, `FSSAI-48211`, `FIRE-73104`).
5. **Consent-Based Data Sharing**: Statutory DPDP Act 2023 compliance with granular consent scopes, grant timestamps, and citizen revocation.
6. **Role-Based Access Control (RBAC)**: Fine-grained security for `CITIZEN`, `OFFICIAL`, and `ADMIN` personas using signed JWT tokens.
7. **Configurable Workflow Engine**: Database-driven state machine managing sequential approval pipelines (`Municipality → FSSAI → Fire Services → Final License`).
8. **Unified Tracking & Event Notifications**: Real-time stage tracking and notifications on progress, clearances, rejections, or errors.
9. **Heterogeneous System Connectors**: Pluggable connector interface (`DepartmentConnector`) supporting modern REST, legacy SOAP, and RPC protocols.
10. **Immutable Compliance Audit Trail**: Cryptographic event logs tracking data transformations, IP addresses, officer remarks, and external dispatches.
11. **Data-Quality Validation**: Strict regex rules for PAN (`[A-Z]{5}[0-9]{4}[A-Z]{1}`), 10-digit Indian mobile numbers, and active duplicate submission prevention.
12. **Resilience & Fault Isolation**: Graceful handling of external system timeouts and simulated gateway outages without middleware failure.
13. **Monitoring & Telemetry**: Real-time administrative dashboard tracking application SLAs, gateway status, and connector health.

---

## 🧱 Architecture Overview

```text
                               CITIZEN / OFFICIAL
                                       │
                                       ▼
                       React Enterprise Web Frontend
                        (Tailwind CSS + Lucide Icons)
                                       │
                                       ▼
                         FastAPI Interoperability Bus
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
  API Gateway & Auth           Workflow Engine            DPDP Consent & Audit
   (JWT / Security)           (Sequential State)          (Immutable Event Log)
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       │
                       Canonical Schema Transformation
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       │                               │                               │
       ▼                               ▼                               ▼
 Municipality Connector          FSSAI Connector                 Fire Connector
(Trade & Health License)       (FoSCoS Food Safety)             (Fire Safety NOC)
       │                               │                               │
       ▼                               ▼                               ▼
 [Simulated Legacy SOAP/REST]   [Simulated Central FoSCoS]     [Simulated Emergency NOC]
 /mock/municipality/applications  /mock/fssai/licenses          /mock/fire/noc-requests
```

---

## 📂 Project Structure

```text
govconnect/
├── backend/
│   ├── app/
│   │   ├── api/                  # REST API endpoints & mock systems
│   │   │   ├── auth.py           # Registration, login, profile
│   │   │   ├── applications.py   # Application submission & tracking
│   │   │   ├── departments.py    # Department registry
│   │   │   ├── workflow.py       # Workflow progression API
│   │   │   ├── consent.py        # DPDP consent ledger
│   │   │   ├── audit.py          # Immutable audit logs
│   │   │   ├── dashboard.py      # Telemetry & SLAs
│   │   │   ├── notifications.py  # Event notifications
│   │   │   └── mock_departments.py # Simulated external department portals
│   │   ├── connectors/           # Interoperability adapters
│   │   │   ├── base.py           # Abstract DepartmentConnector
│   │   │   ├── municipality.py   # Municipal Corporation connector
│   │   │   ├── fssai.py          # FSSAI FoSCoS connector
│   │   │   └── fire.py           # Fire NOC connector
│   │   ├── core/                 # Config, DB engine, and Security
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── application.py
│   │   │   ├── department.py
│   │   │   ├── workflow.py
│   │   │   ├── consent.py
│   │   │   ├── audit.py
│   │   │   └── notification.py
│   │   ├── schemas/              # Pydantic schemas & validation
│   │   ├── services/             # Business logic layer
│   │   ├── workflow/             # Workflow state machine engine
│   │   ├── main.py               # Application entrypoint & CORS
│   │   └── seed.py               # Initial seed data
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── test_demo_flow.py         # Automated verification script
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, TransformationViewer, Timeline, etc.
│   │   ├── pages/                # Citizen, Official, Admin & Architecture views
│   │   ├── services/             # Axios API client & auth wrappers
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 🛠️ Setup Instructions (Windows)

### Prerequisites
* **Python 3.10+** (Tested on Python 3.14)
* **Node.js v18+** & **npm**
* *(Optional)* Docker Desktop (if running via containers)

### 1. Clone or Navigate to Directory
```powershell
cd c:\Users\ADMIN\Desktop\govconnect
```

### 2. Backend Setup
Open a terminal for the backend:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed
```
*(Zero-config: SQLite database `govconnect.db` is initialized and seeded automatically out of the box!)*

### 3. Frontend Setup
Open a second terminal for the frontend:
```powershell
cd frontend
npm install
```

---

## 🚀 Run Instructions

### Start Backend API Server
In the backend terminal (with venv activated):
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
* Interactive Swagger Docs: **http://localhost:8000/docs**
* Health Check: **http://localhost:8000/health**

### Start Frontend Application
In the frontend terminal:
```powershell
npm run dev
```
* Web Application: **http://localhost:5173**

---

## 🐳 Docker Deployment (Optional Alternative)
To run the full stack (PostgreSQL + FastAPI + Nginx React) in containers:
```powershell
docker-compose up --build
```
* Frontend: **http://localhost:5173**
* Backend Swagger: **http://localhost:8000/docs**

---

## 🔑 Pre-Seeded Hackathon Credentials

The system includes pre-seeded accounts. The UI also features **1-Click Demo Persona buttons** on the login page:

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Citizen (Applicant)** | `citizen@govconnect.in` | `Password123!` | Submits establishment applications |
| **Department Official** | `official@govconnect.in` | `Password123!` | Inspects & reviews department queue |
| **System Administrator** | `admin@govconnect.in` | `Password123!` | Manages connectors & fault injection |

---

## 🧪 Testing & API Demonstration Guide

### Automated End-to-End Verification
To execute the complete 14-step hackathon test flow from the CLI:
```powershell
cd backend
python test_demo_flow.py
```

### Manual API Testing via cURL / Swagger

#### 1. Citizen Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "citizen@govconnect.in", "password": "Password123!"}'
```

#### 2. Submit Single Window Common Establishment Data
```bash
curl -X POST "http://localhost:8000/api/v1/applications" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "ABC Restaurant",
    "owner_name": "Swayam Dudhela",
    "address": "Shop 12, High Street, Mumbai",
    "pan": "ABCDE1234F",
    "mobile": "9876543210",
    "seating_capacity": 50,
    "building_area_sqft": 1200,
    "grant_consent": true
  }'
```

#### 3. Inspect Data Transformation Output
```bash
curl -X GET "http://localhost:8000/api/v1/applications/1/departments" \
  -H "Authorization: Bearer <TOKEN>"
```

#### 4. Official Decision (Approve Stage 1 — Municipality)
```bash
curl -X PATCH "http://localhost:8000/api/v1/applications/1/departments/1" \
  -H "Authorization: Bearer <OFFICIAL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "remarks": "Municipal Trade License conditions met"
  }'
```

---

## 🎬 Hackathon Demo Script for Judges (Step-by-Step)

### Step 1: High-Level Context (30 seconds)
1. Open **http://localhost:5173** and click **"Architecture"** on the top navigation bar.
2. Explain to the judges:
   > *"In Problem Statement 129, the goal is NOT to build another generic citizen portal or replace legacy databases. Our solution, **GovConnect**, is an **Interoperability Middleware Layer**. Existing department portals (Municipality, FSSAI, Fire) remain untouched. GovConnect sits as the federated interoperability engine between them."*

### Step 2: The Citizen Experience (1 minute)
1. Log in using the **"Citizen"** 1-click persona button.
2. Click **"New Establishment Application"**.
3. Click the amber **"Pre-fill SIH Demo Data"** button.
4. Point out to judges:
   > *"The citizen fills common information ONCE: Establishment Name, Owner Name, Address, PAN, Mobile, and Dimensions. The DPDP Act 2023 statutory consent is explicitly captured."*
5. Click **"Submit & Initiate Clearance"**.
6. The system generates unified reference ID `APP-1001`.

### Step 3: Proving Interoperability & Schema Transformation (1.5 minutes)
1. Click into application `APP-1001`.
2. Open the **"Data Transformation Diff Viewer"** tab.
3. Show the judges:
   * Left side: Common Canonical Model (`business_name`, `owner_name`, `pan`, `mobile`).
   * Right side: Select **MUNICIPALITY** tab. The middleware transformed it into `enterpriseName`, `proprietor`, `taxIdentifier`.
   * Click **FSSAI** tab. Show how the same canonical model transformed into `firm_name`, `applicant`, `premise_address`, `foscos_license_class`.
   * Click **FIRE** tab. Show how it transformed into `establishment`, `owner`, `location`, `total_area_sqft`.
4. Point out:
   > *"Notice that each external system received data in its own proprietary schema. We also received external tracking numbers like `MUNI-53029` back from their independent registries."*

### Step 4: Live Sequential Workflow & Rejection Handling (1.5 minutes)
1. Switch to the **"Official"** persona using the top bar switcher.
2. Under application `APP-1001`, observe the **Official Review Console**:
   * **Stage 1 (Municipality)**: Click **"Approve MUNICIPALITY"**.
   * Watch the workflow automatically advance to **Stage 2 (FSSAI)**!
   * Notice that FSSAI's connector was immediately triggered with transformed data.
   * **Stage 2 (FSSAI)**: Click **"Approve FSSAI"**.
   * Watch the workflow automatically advance to **Stage 3 (Fire)**!
   * **Stage 3 (Fire)**: Click **"Reject Stage"** (Simulate fire safety distance non-compliance).
3. The overall application status immediately transitions to **`REJECTED`**.
4. Open the notification drawer: Citizen has received real-time event updates detailing the exact rejection reason.

### Step 5: Full Approval & Immutable Audit Trail (1 minute)
1. Submit a second application or demonstrate `APP-1002` where all three departments approve.
2. Show the final status turning **`APPROVED`** (Unified Establishment Clearance granted).
3. Click the **"Immutable Audit Trail"** tab:
   * Show cryptographic timestamped logs: `APPLICATION_CREATED`, `DATA_TRANSFORMED`, `CONNECTOR_DISPATCHED`, `DEPARTMENT_APPROVED`, `WORKFLOW_ADVANCED`.
   * Expand any audit entry to inspect the raw JSON transaction payload.

### Step 6: Resilience & Fault Injection Simulation (1 minute)
1. Switch to the **"Admin"** persona.
2. Navigate to **"Gateways & Fault Simulation"**.
3. Click **"Simulate Gateway Down"** on the **Fire Department**.
4. Show the judges:
   > *"If an external department portal experiences a network failure or gateway timeout, our middleware handles it gracefully with standardized error envelopes without crashing the system or terminating unrelated department processes."*
5. Click **"Restore Gateway"** to return the system to healthy status.

---

## 🏆 Summary

| Metric | Achievement |
| :--- | :--- |
| **Problem Statement** | SIH 2026 PS 129 — Interoperability Layer |
| **Architecture** | Federated Middleware & Modular Monolith |
| **Zero-Replacement** | Legacy & modern department portals connected without alteration |
| **Data Standardization** | Canonical establishment schema + dynamic connector transformation |
| **Compliance** | DPDP Act 2023 Consent Ledger + Cryptographic Audit Trail |
| **Reliability** | Local execution on Windows + Docker Compose support |
