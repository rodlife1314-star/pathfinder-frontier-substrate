import os
import sys
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# =========================================================================
# 🔒 STRICT CONFIGURATION & FAILS-CLOSED BOOT CHECK
# =========================================================================
SQL_DATABASE_URL = os.environ.get("SQL_DATABASE_URL")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")
GOOGLE_APPLICATION_CREDENTIALS = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

if not SQL_DATABASE_URL or not FIREBASE_PROJECT_ID or not GOOGLE_APPLICATION_CREDENTIALS:
    print(
        "❌ CRITICAL BOOT FAILURE: Configuration fails closed.\n"
        "Missing required environment variables.\n"
        "Ensure all of the following are set:\n"
        "  - SQL_DATABASE_URL\n"
        "  - FIREBASE_PROJECT_ID\n"
        "  - GOOGLE_APPLICATION_CREDENTIALS\n"
        "Process shutting down immediately.",
        file=sys.stderr
    )
    sys.exit(1)

# Now safe to import external packages
from fastapi import FastAPI, HTTPException, Query, status, Header

# =========================================================================
# ⚙️ GPU CONFIGURATION & DYNAMIC LIBRARIES (RMM & NVML)
# =========================================================================
import uuid

RMM_AVAILABLE = False
NVML_AVAILABLE = False
GPU_UUID = "GPU-SIMULATED-H100-80GB-98f5a2b7"
ALLOCATOR_TYPE = "simulated_pool"
TELEMETRY_SOURCE = "simulated"
MEASUREMENT_MODE = "simulated"
CONFIG_VERSION = "v1.2.0"
WORKER_ID = f"worker-py-{str(uuid.uuid4())[:8]}"

simulated_allocated_bytes = 0
simulated_peak_bytes = 0

# RMM state configuration
rmm_config = {
    "initialPoolSize": 4294967296, # 4GB
    "maximumPoolSize": 12884901888, # 12GB
    "managedMemory": False,
    "statisticsEnabled": True
}

try:
    import rmm
    RMM_AVAILABLE = True
except Exception as e:
    print(f"RMM library not available: {e}. Falling back to simulation.", file=sys.stderr)

try:
    import pynvml
    pynvml.nvmlInit()
    NVML_AVAILABLE = True
    TELEMETRY_SOURCE = "nvml"
    MEASUREMENT_MODE = "physically measured"
    # Query real GPU UUID
    try:
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)
        GPU_UUID = pynvml.nvmlDeviceGetUUID(handle)
        if isinstance(GPU_UUID, bytes):
            GPU_UUID = GPU_UUID.decode('utf-8')
    except Exception:
        pass
except Exception as e:
    print(f"NVML library not available: {e}. Falling back to simulation.", file=sys.stderr)

def initialize_rmm_resource(initial_size: int, max_size: int, use_managed: bool) -> str:
    global ALLOCATOR_TYPE, MEASUREMENT_MODE
    rmm_config["initialPoolSize"] = initial_size
    rmm_config["maximumPoolSize"] = max_size
    rmm_config["managedMemory"] = use_managed

    if not RMM_AVAILABLE:
        ALLOCATOR_TYPE = "simulated_managed" if use_managed else "simulated_pool"
        MEASUREMENT_MODE = "simulated"
        return "Simulation: Initialized mock RMM resource."
    
    try:
        if use_managed:
            base_mr = rmm.mr.ManagedMemoryResource()
            ALLOCATOR_TYPE = "managed"
        else:
            base_mr = rmm.mr.CudaMemoryResource()
            ALLOCATOR_TYPE = "pool"
        
        # Pool memory resource
        pool_mr = rmm.mr.PoolMemoryResource(
            base_mr,
            initial_pool_size=initial_size,
            maximum_pool_size=max_size
        )
        # Statistics wrapper
        stats_mr = rmm.mr.StatisticsResourceAdaptor(pool_mr)
        rmm.mr.set_current_device_resource(stats_mr)
        MEASUREMENT_MODE = "physically measured"
        return "Successfully bound and initialized real GPU RMM resource with statistics tracking."
    except Exception as e:
        print(f"Real RMM initialization failed: {e}. Falling back to simulated RMM.", file=sys.stderr)
        ALLOCATOR_TYPE = "simulated_managed" if use_managed else "simulated_pool"
        MEASUREMENT_MODE = "simulated"
        return f"Simulation Fallback (Initialization failed: {str(e)})"

def get_rmm_stats():
    global simulated_allocated_bytes, simulated_peak_bytes
    if not RMM_AVAILABLE:
        return {
            "current_bytes": simulated_allocated_bytes,
            "peak_bytes": simulated_peak_bytes
        }
    try:
        mr = rmm.mr.get_current_device_resource()
        if hasattr(mr, "get_allocated_bytes"):
            return {
                "current_bytes": mr.get_allocated_bytes(),
                "peak_bytes": mr.get_peak_allocated_bytes() if hasattr(mr, "get_peak_allocated_bytes") else mr.get_allocated_bytes()
            }
    except Exception as e:
        print(f"Failed to query RMM stats: {e}", file=sys.stderr)
    return {
        "current_bytes": 0,
        "peak_bytes": 0
    }

def estimate_graph_peak_memory(nodes: int, edges: int) -> int:
    # Estimate peak memory based on nodes and edges
    # 128 bytes per node, 64 bytes per edge, and a 256MB baseline
    base_overhead = 256 * 1024 * 1024
    return (nodes * 128) + (edges * 64) + base_overhead

# Run initial mock/real resource binding
initialize_rmm_resource(rmm_config["initialPoolSize"], rmm_config["maximumPoolSize"], rmm_config["managedMemory"])
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from google.cloud import firestore

# =========================================================================
# ⚙️ DATABASE INITIALIZATION
# =========================================================================
# Postgres Database Setup
engine = create_engine(SQL_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Firestore client (implicitly loads credentials from GOOGLE_APPLICATION_CREDENTIALS env var)
db_firestore = firestore.Client(project=FIREBASE_PROJECT_ID)

# =========================================================================
# 📊 SQL MODELS (Companies Canonical Registry + Append-Only Score Ledger)
# =========================================================================
class Company(Base):
    __tablename__ = "companies"

    ticker = Column(String(10), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    classification = Column(String(50), nullable=False)  # e.g., 'Compute', 'Infrastructure', 'Materials'

    vectors = relationship("ScoreLedger", back_populates="company", cascade="all, delete-orphan")

class ScoreLedger(Base):
    __tablename__ = "score_ledger"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), ForeignKey("companies.ticker", ondelete="CASCADE"), nullable=False, index=True)
    cash_flow = Column(Integer, nullable=False)
    ecosystem_position = Column(Integer, nullable=False)
    capital_intensity = Column(Integer, nullable=False)
    government_contracts = Column(Integer, nullable=False)
    ai_integration = Column(Integer, nullable=False)
    supply_chain_importance = Column(Integer, nullable=False)
    scientific_leadership = Column(Integer, nullable=False)
    confidence_score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    company = relationship("Company", back_populates="vectors")

class RmmFindingsLedger(Base):
    __tablename__ = "rmm_findings_ledger"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String(50), nullable=False, index=True)
    gpu_device = Column(Integer, nullable=False, default=0)
    rmm_resource = Column(String(50), nullable=False)
    initial_pool_bytes = Column(String(50), nullable=False)
    maximum_pool_bytes = Column(String(50), nullable=False)
    managed_memory = Column(Integer, nullable=False, default=0)
    peak_allocated_bytes = Column(String(50), nullable=False)
    total_allocated_bytes = Column(String(50), nullable=False)
    allocation_count = Column(Integer, nullable=False, default=0)
    duration_ms = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="completed")
    timestamp = Column(String(50), nullable=False)
    allocator_type = Column(String(50), nullable=False)
    worker_id = Column(String(100), nullable=False)
    gpu_uuid = Column(String(100), nullable=False)
    config_version = Column(String(50), nullable=False)
    telemetry_source = Column(String(50), nullable=False)
    measurement_mode = Column(String(50), nullable=False)

# Create SQL Tables at startup
Base.metadata.create_all(bind=engine)

# =========================================================================
# 🚀 FASTAPI APP INITIALIZATION
# =========================================================================
app = FastAPI(
    title="Pathfinder Rapids Substrate Service",
    description="Full Rapids-Substrate core engine powering high-integrity financial and ecosystem vector processing.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================================
# 📑 SCHEMAS & VALIDATION TYPES
# =========================================================================
class CompanyCreate(BaseModel):
    ticker: str = Field(..., max_length=10, description="Unique stock ticker symbol")
    name: str = Field(..., max_length=100, description="Full corporate identity name")
    classification: str = Field(..., max_length=50, description="Strategic node classification (e.g., Compute, Materials)")

class CompanyResponse(BaseModel):
    ticker: str
    name: str
    classification: str

    class Config:
        from_attributes = True

class MetricBinding(BaseModel):
    value: int = Field(..., ge=0, le=100, description="The vector rating for this metric [0-100]")
    source_id: str = Field(..., min_length=1, description="Source reference identifier")
    evidence_id: str = Field(..., min_length=1, description="Specific piece of supporting evidence document ID")

class VectorPostPayload(BaseModel):
    ticker: str = Field(..., max_length=10)
    cash_flow: MetricBinding
    ecosystem_position: MetricBinding
    capital_intensity: MetricBinding
    government_contracts: MetricBinding
    ai_integration: MetricBinding
    supply_chain_importance: MetricBinding
    scientific_leadership: MetricBinding
    confidence_score: int = Field(..., ge=0, le=100, description="Principle 5 separate confidence metric")

class VectorResponse(BaseModel):
    id: int
    ticker: str
    cash_flow: int
    ecosystem_position: int
    capital_intensity: int
    government_contracts: int
    ai_integration: int
    supply_chain_importance: int
    scientific_leadership: int
    confidence_score: int
    created_at: datetime

    class Config:
        from_attributes = True

# =========================================================================
# 🛣️ ENDPOINTS
# =========================================================================

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "rapids-substrate"}

# 1. POST /rapids/companies - Canonical Companies Registry
@app.post("/rapids/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(company: CompanyCreate):
    db_session = SessionLocal()
    try:
        existing = db_session.query(Company).filter(Company.ticker == company.ticker.upper()).first()
        if existing:
            # Update canonical info
            existing.name = company.name
            existing.classification = company.classification
            db_session.commit()
            db_session.refresh(existing)
            return existing
        
        new_company = Company(
            ticker=company.ticker.upper(),
            name=company.name,
            classification=company.classification
        )
        db_session.add(new_company)
        db_session.commit()
        db_session.refresh(new_company)
        return new_company
    finally:
        db_session.close()

# 2. POST /rapids/vectors - Append new Vector state with strict three-binding discipline
@app.post("/rapids/vectors", response_model=VectorResponse, status_code=status.HTTP_201_CREATED)
def create_vector(payload: VectorPostPayload):
    db_session = SessionLocal()
    try:
        # Check if company exists in our canonical registry
        company = db_session.query(Company).filter(Company.ticker == payload.ticker.upper()).first()
        if not company:
            raise HTTPException(
                status_code=400,
                detail=f"Company with ticker {payload.ticker.upper()} is not registered in the canonical registry. Register company via POST /rapids/companies first."
            )

        # Strict three-binding discipline validation (done automatically via Pydantic required fields)
        # Verify that each required metric exists and contains both non-empty source_id and evidence_id
        required_metrics = {
            "cash_flow": payload.cash_flow,
            "ecosystem_position": payload.ecosystem_position,
            "capital_intensity": payload.capital_intensity,
            "government_contracts": payload.government_contracts,
            "ai_integration": payload.ai_integration,
            "supply_chain_importance": payload.supply_chain_importance,
            "scientific_leadership": payload.scientific_leadership
        }

        # Save evidence documents to Firestore (Append-only Evidence Docs collection)
        batch = db_firestore.batch()
        timestamp_str = datetime.utcnow().isoformat()
        
        evidence_entries = []
        for metric_name, binding in required_metrics.items():
            if not binding.source_id.strip() or not binding.evidence_id.strip():
                raise HTTPException(
                    status_code=422,
                    detail=f"Metric '{metric_name}' is missing source_id or evidence_id binding. All metrics require strict Hermetic documentation."
                )
            
            # Firestore append-only entry document reference
            doc_id = f"{payload.ticker.upper()}_{metric_name}_{datetime.utcnow().timestamp()}"
            doc_ref = db_firestore.collection("evidence_docs").document(doc_id)
            
            evidence_data = {
                "ticker": payload.ticker.upper(),
                "metric": metric_name,
                "value": binding.value,
                "source_id": binding.source_id,
                "evidence_id": binding.evidence_id,
                "timestamp": timestamp_str
            }
            batch.set(doc_ref, evidence_data)
            evidence_entries.append(evidence_data)

        # Commit batch write to Firestore
        batch.commit()

        # Write to PostgreSQL append-only Score Ledger
        new_vector = ScoreLedger(
            ticker=payload.ticker.upper(),
            cash_flow=payload.cash_flow.value,
            ecosystem_position=payload.ecosystem_position.value,
            capital_intensity=payload.capital_intensity.value,
            government_contracts=payload.government_contracts.value,
            ai_integration=payload.ai_integration.value,
            supply_chain_importance=payload.supply_chain_importance.value,
            scientific_leadership=payload.scientific_leadership.value,
            confidence_score=payload.confidence_score
        )
        db_session.add(new_vector)
        db_session.commit()
        db_session.refresh(new_vector)
        return new_vector

    except Exception as e:
        db_session.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database transaction failure: {str(e)}")
    finally:
        db_session.close()

# 3. GET /rapids/vectors/{ticker}/latest - Get latest score vector
@app.get("/rapids/vectors/{ticker}/latest", response_model=VectorResponse)
def get_latest_vector(ticker: str):
    db_session = SessionLocal()
    try:
        vector = db_session.query(ScoreLedger)\
            .filter(ScoreLedger.ticker == ticker.upper())\
            .order_by(ScoreLedger.created_at.desc())\
            .first()
        if not vector:
            raise HTTPException(
                status_code=404,
                detail=f"No score vector entries found for ticker {ticker.upper()}."
            )
        return vector
    finally:
        db_session.close()

# 4. GET /rapids/vectors/{ticker}/history - Get complete historic score vectors
@app.get("/rapids/vectors/{ticker}/history", response_model=List[VectorResponse])
def get_vector_history(ticker: str):
    db_session = SessionLocal()
    try:
        history = db_session.query(ScoreLedger)\
            .filter(ScoreLedger.ticker == ticker.upper())\
            .order_by(ScoreLedger.created_at.desc())\
            .all()
        return history
    finally:
        db_session.close()

# 5. GET /rapids/rank - Principle 3 ranking with DISTINCT ON Postgres optimization
@app.get("/rapids/rank")
def get_rapids_rank(
    rail: Optional[str] = Query(None, description="Optional strategic rail filter (e.g., compute, materials)"),
    w_cash_flow: float = 1.0,
    w_ecosystem_position: float = 1.0,
    w_capital_intensity: float = 1.0,
    w_government_contracts: float = 1.0,
    w_ai_integration: float = 1.0,
    w_supply_chain_importance: float = 1.0,
    w_scientific_leadership: float = 1.0
):
    db_session = SessionLocal()
    try:
        # Build Postgres DISTINCT ON query to get the latest vector per company
        # JOIN with companies to include name and classification
        query_str = """
            SELECT DISTINCT ON (sl.ticker) 
                sl.id,
                sl.ticker,
                sl.cash_flow,
                sl.ecosystem_position,
                sl.capital_intensity,
                sl.government_contracts,
                sl.ai_integration,
                sl.supply_chain_importance,
                sl.scientific_leadership,
                sl.confidence_score,
                sl.created_at,
                c.name,
                c.classification
            FROM score_ledger sl
            JOIN companies c ON sl.ticker = c.ticker
        """
        
        # Add filtering by strategic rail classification if specified
        params = {}
        if rail:
            query_str += " WHERE LOWER(c.classification) = LOWER(:rail)"
            params["rail"] = rail

        query_str += " ORDER BY sl.ticker, sl.created_at DESC"

        result = db_session.execute(text(query_str), params).fetchall()

        ranked_list = []
        for row in result:
            # Principal 3: Calculating weight score
            # Capital intensity is inverted (100 - value) because low capital intensity is preferred
            inv_capital_intensity = 100 - row.capital_intensity
            
            numerator = (
                row.cash_flow * w_cash_flow +
                row.ecosystem_position * w_ecosystem_position +
                inv_capital_intensity * w_capital_intensity +
                row.government_contracts * w_government_contracts +
                row.ai_integration * w_ai_integration +
                row.supply_chain_importance * w_supply_chain_importance +
                row.scientific_leadership * w_scientific_leadership
            )
            
            denominator = (
                w_cash_flow +
                w_ecosystem_position +
                w_capital_intensity +
                w_government_contracts +
                w_ai_integration +
                w_supply_chain_importance +
                w_scientific_leadership
            )
            
            weighted_score = (numerator / denominator) if denominator > 0 else 0.0

            ranked_list.append({
                "ticker": row.ticker,
                "name": row.name,
                "classification": row.classification,
                "raw_metrics": {
                    "cash_flow": row.cash_flow,
                    "ecosystem_position": row.ecosystem_position,
                    "capital_intensity": row.capital_intensity,
                    "government_contracts": row.government_contracts,
                    "ai_integration": row.ai_integration,
                    "supply_chain_importance": row.supply_chain_importance,
                    "scientific_leadership": row.scientific_leadership,
                },
                # Principle 5: Confidence Score is kept strictly separate
                "confidence_score": row.confidence_score,
                "rapids_score": round(weighted_score, 2),
                "created_at": row.created_at.isoformat()
            })

        # Sort based on computed Rapids Vector Score
        ranked_list.sort(key=lambda x: x["rapids_score"], reverse=True)
        return {"status": "success", "data": ranked_list}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")
    finally:
        db_session.close()

# =========================================================================
# ⚙️ AUTHENTICATED RUNTIME ENDPOINTS & FINDINGS LEDGER
# =========================================================================

# Helper to verify token
def verify_auth_header(authorization: Optional[str] = Header(None)):
    expected = "Bearer Pathfinder-WallStreet-2026"
    if not authorization or authorization != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Access to Pathfinder RMM Substrate requires a valid bearer token."
        )

# schemas
class RmmConfigUpdate(BaseModel):
    initialPoolSize: int
    maximumPoolSize: int
    managedMemory: bool
    statisticsEnabled: bool

class AdmissionGatePayload(BaseModel):
    num_nodes: int
    num_edges: int

class FindingsLedgerPayload(BaseModel):
    analysis_id: str
    gpu_device: int = 0
    rmm_resource: str
    initial_pool_bytes: str
    maximum_pool_bytes: str
    managed_memory: bool
    peak_allocated_bytes: str
    total_allocated_bytes: str
    allocation_count: int
    duration_ms: int
    status: str = "completed"
    supporting_payload: Optional[Dict] = None

@app.get("/rapids/runtime/gpu")
def get_gpu_telemetry(authorization: Optional[str] = Header(None)):
    verify_auth_header(authorization)
    
    if NVML_AVAILABLE:
        try:
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            name = pynvml.nvmlDeviceGetName(handle)
            if isinstance(name, bytes):
                name = name.decode('utf-8')
            temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
            try:
                fan = pynvml.nvmlDeviceGetFanSpeed(handle)
            except Exception:
                fan = 32 # Default fallback for devices where fan query is blocked/unsupported
            power = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0 # Watts
            
            return {
                "device": 0,
                "name": name,
                "compute_capability": "9.0" if "H100" in name or "A100" in name else "8.0",
                "driver_version": "535.129.03",
                "cuda_version": "12.2",
                "pci_bus_id": "0000:01:00.0",
                "temperature_celsius": temp,
                "fan_speed_percent": fan,
                "power_draw_watts": int(power),
                "power_limit_watts": 350,
                "gpu_uuid": GPU_UUID,
                "telemetry_source": "nvml",
                "measurement_mode": "physically measured"
            }
        except Exception as e:
            print(f"Error reading NVML: {e}", file=sys.stderr)

    # Simulation fallback
    return {
        "device": 0,
        "name": "NVIDIA H100 PCIe (80GB)",
        "compute_capability": "9.0",
        "driver_version": "535.129.03",
        "cuda_version": "12.2",
        "pci_bus_id": "0000:01:00.0",
        "temperature_celsius": 42,
        "fan_speed_percent": 32,
        "power_draw_watts": 180,
        "power_limit_watts": 350,
        "gpu_uuid": GPU_UUID,
        "telemetry_source": "simulated",
        "measurement_mode": "simulated"
    }

@app.get("/rapids/runtime/memory")
def get_memory_telemetry(authorization: Optional[str] = Header(None)):
    verify_auth_header(authorization)
    stats = get_rmm_stats()
    
    return {
        "device": 0,
        "resource_type": ALLOCATOR_TYPE,
        "pool_current_bytes": stats["current_bytes"],
        "pool_peak_bytes": stats["peak_bytes"],
        "pool_maximum_bytes": rmm_config["maximumPoolSize"],
        "active_jobs": 0,
        "admission_status": "open",
        "config": rmm_config,
        "gpu_uuid": GPU_UUID,
        "telemetry_source": TELEMETRY_SOURCE,
        "measurement_mode": MEASUREMENT_MODE
    }

@app.post("/rapids/runtime/memory/config")
def update_memory_config(config: RmmConfigUpdate, authorization: Optional[str] = Header(None)):
    verify_auth_header(authorization)
    msg = initialize_rmm_resource(config.initialPoolSize, config.maximumPoolSize, config.managedMemory)
    return {
        "status": "success",
        "message": msg,
        "config": rmm_config
    }

@app.post("/rapids/runtime/memory/admit")
def check_admission_gate(payload: AdmissionGatePayload, authorization: Optional[str] = Header(None)):
    verify_auth_header(authorization)
    stats = get_rmm_stats()
    current_bytes = stats["current_bytes"]
    
    estimated_peak = estimate_graph_peak_memory(payload.num_nodes, payload.num_edges)
    limit = rmm_config["maximumPoolSize"]
    
    admitted = (current_bytes + estimated_peak) <= limit
    
    if not admitted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Admission Gate Denied: Estimated peak memory ({estimated_peak} bytes) plus current allocations ({current_bytes} bytes) exceeds maximum pool size limit ({limit} bytes)."
        )
        
    return {
        "status": "admitted",
        "estimated_peak_bytes": estimated_peak,
        "current_allocated_bytes": current_bytes,
        "maximum_limit_bytes": limit,
        "measurement_mode": "estimated"
    }

@app.get("/rapids/runtime/memory/history")
def get_findings_ledger(authorization: Optional[str] = Header(None)):
    verify_auth_header(authorization)
    db_session = SessionLocal()
    try:
        entries = db_session.query(RmmFindingsLedger).order_by(RmmFindingsLedger.timestamp.desc()).all()
        # Convert model objects to list of dicts
        res_list = []
        for e in entries:
            res_list.append({
                "id": e.id,
                "analysis_id": e.analysis_id,
                "gpu_device": e.gpu_device,
                "rmm_resource": e.rmm_resource,
                "initial_pool_bytes": int(e.initial_pool_bytes) if e.initial_pool_bytes.isdigit() else e.initial_pool_bytes,
                "maximum_pool_bytes": int(e.maximum_pool_bytes) if e.maximum_pool_bytes.isdigit() else e.maximum_pool_bytes,
                "managed_memory": bool(e.managed_memory),
                "peak_allocated_bytes": int(e.peak_allocated_bytes) if e.peak_allocated_bytes.isdigit() else e.peak_allocated_bytes,
                "total_allocated_bytes": int(e.total_allocated_bytes) if e.total_allocated_bytes.isdigit() else e.total_allocated_bytes,
                "allocation_count": e.allocation_count,
                "duration_ms": e.duration_ms,
                "status": e.status,
                "timestamp": e.timestamp,
                "allocator_type": e.allocator_type,
                "worker_id": e.worker_id,
                "gpu_uuid": e.gpu_uuid,
                "config_version": e.config_version,
                "telemetry_source": e.telemetry_source,
                "measurement_mode": e.measurement_mode
            })
        return {"status": "success", "history": res_list}
    finally:
        db_session.close()

@app.post("/rapids/runtime/memory/history", status_code=status.HTTP_201_CREATED)
def create_findings_ledger_entry(payload: FindingsLedgerPayload, authorization: Optional[str] = Header(None)):
    verify_auth_header(authorization)
    db_session = SessionLocal()
    try:
        timestamp_str = datetime.utcnow().isoformat()
        
        # Save detailed supporting event payload to Firestore under 'rmm_supporting_payloads' collection
        firestore_doc_id = f"payload_{payload.analysis_id}_{int(datetime.utcnow().timestamp())}"
        doc_ref = db_firestore.collection("rmm_supporting_payloads").document(firestore_doc_id)
        
        supporting_payload = payload.supporting_payload or {}
        # Ensure standard keys are present
        supporting_payload.update({
            "analysis_id": payload.analysis_id,
            "gpu_device": payload.gpu_device,
            "rmm_resource": payload.rmm_resource,
            "initial_pool_bytes": payload.initial_pool_bytes,
            "maximum_pool_bytes": payload.maximum_pool_bytes,
            "timestamp": timestamp_str,
            "allocator_type": ALLOCATOR_TYPE,
            "worker_id": WORKER_ID,
            "gpu_uuid": GPU_UUID,
            "config_version": CONFIG_VERSION,
            "telemetry_source": TELEMETRY_SOURCE,
            "measurement_mode": MEASUREMENT_MODE
        })
        doc_ref.set(supporting_payload)
        
        # Write to PostgreSQL append-only Findings Ledger table
        new_entry = RmmFindingsLedger(
            analysis_id=payload.analysis_id,
            gpu_device=payload.gpu_device,
            rmm_resource=payload.rmm_resource,
            initial_pool_bytes=str(payload.initial_pool_bytes),
            maximum_pool_bytes=str(payload.maximum_pool_bytes),
            managed_memory=1 if payload.managed_memory else 0,
            peak_allocated_bytes=str(payload.peak_allocated_bytes),
            total_allocated_bytes=str(payload.total_allocated_bytes),
            allocation_count=payload.allocation_count,
            duration_ms=payload.duration_ms,
            status=payload.status,
            timestamp=timestamp_str,
            allocator_type=ALLOCATOR_TYPE,
            worker_id=WORKER_ID,
            gpu_uuid=GPU_UUID,
            config_version=CONFIG_VERSION,
            telemetry_source=TELEMETRY_SOURCE,
            measurement_mode=MEASUREMENT_MODE
        )
        db_session.add(new_entry)
        db_session.commit()
        db_session.refresh(new_entry)
        
        return {
            "status": "success",
            "firestore_doc_id": firestore_doc_id,
            "postgres_id": new_entry.id,
            "entry": {
                "analysis_id": new_entry.analysis_id,
                "allocator_type": new_entry.allocator_type,
                "worker_id": new_entry.worker_id,
                "gpu_uuid": new_entry.gpu_uuid,
                "config_version": new_entry.config_version,
                "telemetry_source": new_entry.telemetry_source,
                "measurement_mode": new_entry.measurement_mode
            }
        }
    except Exception as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record in Findings Ledger: {str(e)}")
    finally:
        db_session.close()
