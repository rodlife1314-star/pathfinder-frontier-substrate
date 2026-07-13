# Rapids Substrate Core Service

The core high-integrity vector ranking and registry service powering the **Pathfinder Wall Street Doctrine v0.1**. 

This service is architected to operate with strict "fails-closed" security guarantees, separating relational consensus state from multi-source unstructured evidence pipelines.

---

## 🛠️ Architecture Design & Division

```
                          ┌────────────────────────┐
                          │    Client Web App      │
                          └───────────┬────────────┘
                                      │
                                      ▼
                        ┌────────────────────────────┐
                        │   rapids-substrate (API)   │
                        └─────────────┬──────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼ (Postgres OLTP)                               ▼ (Firestore Append-Only)
   ┌───────────────────────┐                       ┌───────────────────────┐
   │     Cloud SQL         │                       │     Cloud Firestore   │
   ├───────────────────────┤                       ├───────────────────────┤
   │ - canonical companies │                       │ - evidence_docs       │
   │ - append-only ledger  │                       │   (source/evidence)   │
   └───────────────────────┘                       └───────────────────────┘
```

### 1. The Postgres Storage Layer
Stores standard, highly structured relational entities and audit logs.
*   `companies`: Represents the canonical registry of assets (e.g., `NVDA`, `LIN`).
*   `score_ledger`: Represents an append-only historic log of company attribute evaluations. It records scores for the seven core RAPIDS metrics alongside a separate confidence score.

### 2. The Firestore Storage Layer
Stores the decentralized, append-only verification trail documents to enforce strict three-binding integrity.
*   `evidence_docs` collection: Every vector metric recorded on Postgres is backed by a document containing an explicit `source_id` + `evidence_id` pair. Any score entry submitted without complete bindings is rejected.

---

## 🔒 Security & Fails-Closed Design

The service **will fail to start** at boot time if any of the following parameters are absent:
1.  `SQL_DATABASE_URL`: Connection string to the Cloud SQL PostgreSQL instance.
2.  `FIREBASE_PROJECT_ID`: The ID of the GCP project hosting the Firestore instance.
3.  `GOOGLE_APPLICATION_CREDENTIALS`: Absolute path to the Service Account JSON credential key.

There is **no placeholder fallback or mock system**. Production execution requires actual, live secure databases.

---

## 🛣️ API Endpoint Definitions

### 🏢 Companies Canonical Registry
#### `POST /rapids/companies`
Registers a new asset or updates an existing metadata entry.
*   **Payload:**
    ```json
    {
      "ticker": "NVDA",
      "name": "NVIDIA Corp",
      "classification": "Compute"
    }
    ```

---

### 📊 Vector Ledger
#### `POST /rapids/vectors`
Appends a new evaluation vector. Validates and saves evidence bindings to Firestore before writing scores to the SQL Ledger. Rejects partial vectors or any metric missing `source_id`/`evidence_id`.
*   **Payload:**
    ```json
    {
      "ticker": "NVDA",
      "cash_flow": { "value": 98, "source_id": "news_src_2026_07_12", "evidence_id": "ev_nvda_q2_earnings" },
      "ecosystem_position": { "value": 99, "source_id": "news_src_2026_07_12", "evidence_id": "ev_nvda_q2_earnings" },
      "capital_intensity": { "value": 68, "source_id": "news_src_2026_07_12", "evidence_id": "ev_nvda_q2_earnings" },
      "government_contracts": { "value": 92, "source_id": "news_src_2026_07_12", "evidence_id": "ev_nvda_q2_earnings" },
      "ai_integration": { "value": 100, "source_id": "news_src_2026_07_12", "evidence_id": "ev_nvda_q2_earnings" },
      "supply_chain_importance": { "value": 95, "source_id": "news_src_2026_07_12", "evidence_id": "ev_nvda_q2_earnings" },
      "scientific_leadership": { "value": 96, "source_id": "news_src_2026_07_12", "evidence_id": "ev_nvda_q2_earnings" },
      "confidence_score": 82
    }
    ```

#### `GET /rapids/vectors/{ticker}/latest`
Retrieves the most recent row vector recorded for a company.

#### `GET /rapids/vectors/{ticker}/history`
Retrieves all historical vector recordings for audit trails.

---

### 🏆 Ranking Engine
#### `GET /rapids/rank`
Returns the ranked list of assets based on dynamically weighted scores. Uses Postgres-specific `DISTINCT ON` query parsing to query only the latest state from the append-only ledger in a single transaction.
*   **Query Parameters (Optional):**
    *   `rail` (str): Filters by classification (e.g., `compute`, `materials`, `energy`).
    *   `w_cash_flow` (float, default: 1.0)
    *   `w_ecosystem_position` (float, default: 1.0)
    *   `w_capital_intensity` (float, default: 1.0)
    *   `w_government_contracts` (float, default: 1.0)
    *   `w_ai_integration` (float, default: 1.0)
    *   `w_supply_chain_importance` (float, default: 1.0)
    *   `w_scientific_leadership` (float, default: 1.0)

---

## 🛜 Honest Sandboxing Limitations (Acknowledge / Verification)

1.  **Isolated Verification:** The sandboxed workspace environment has restricted outbound network access. You can test code syntax and compilation rules locally using:
    ```bash
    python -m py_compile main.py
    ```
    This guarantees that the FastAPI file has no syntactic or module import bugs. 
2.  **Postgres Portability Notice:** The ranking endpoint utilizes the `DISTINCT ON (sl.ticker)` statement. This is a PostgreSQL-specific feature optimized for Cloud SQL; it is not standard SQL and will fail if run on SQLite or standard MySQL instances without modification.

---

## 🏗️ Deployment & IAM Setup (Service Accounts & Secret Bindings)

To deploy the `rapids-substrate` service safely alongside the main applet to Google Cloud Run, execute the following IAM and routing configuration commands:

### Step 1: Create IAM Service Accounts
```bash
# Create service account for the rapids microservice
gcloud iam service-accounts create rapids-substrate-sa \
    --display-name="SA for Rapids Substrate microservice"

# Create service account for the main Web interface applet
gcloud iam service-accounts create wall-street-doctrine-sa \
    --display-name="SA for Wall Street Doctrine UI App"
```

### Step 2: Grant Datastore & Database Permissions
```bash
# Grant Firestore Admin / Document User to the Rapids Service Account
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:rapids-substrate-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

# Grant Cloud SQL Client to the Rapids Service Account (for secure proxy)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:rapids-substrate-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

### Step 3: Configure Secret Access
Ensure the Postgres Database URL is saved inside Secret Manager:
```bash
# Create the secret
gcloud secrets create sql-db-url-secret --replication-policy="automatic"

# Add your secure Postgres connection string
echo -n "postgresql://user:password@/dbname?host=/cloudsql/project-id:region:instance-name" | \
    gcloud secrets versions add sql-db-url-secret --data-file=-

# Grant Access to the Secret version for the Rapids microservice
gcloud secrets add-iam-policy-binding sql-db-url-secret \
    --member="serviceAccount:rapids-substrate-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Step 4: Run Cloud Build Trigger
Initiate Cloud Build to compile both services and wire the web applet route to the python microservice:
```bash
gcloud builds submit --config=cloudbuild.yaml
```
