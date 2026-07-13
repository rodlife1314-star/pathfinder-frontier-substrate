import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Cpu,
  Globe,
  Zap,
  Layers,
  Sliders,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Activity,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  Terminal,
  Grid,
  TrendingUp,
  SlidersHorizontal,
  Lock,
  GitBranch,
  Info,
  History,
  FileText
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { RapidsVector, TickerInfo, Allocation, GraphNode, GraphEdge } from "../types";

// Static mapping for fallback classifications if needed
const INITIAL_RAPIDS_DATA: RapidsVector[] = [
  { ticker: "SOXX", name: "iShares Semiconductor ETF", cashFlow: 92, ecosystemPosition: 95, capitalIntensity: 78, governmentContracts: 85, aiIntegration: 90, supplyChainImportance: 98, scientificLeadership: 80, confidenceScore: 95, classification: "Compute" },
  { ticker: "XSD", name: "SPDR S&P Semiconductor ETF", cashFlow: 88, ecosystemPosition: 90, capitalIntensity: 70, governmentContracts: 80, aiIntegration: 85, supplyChainImportance: 92, scientificLeadership: 75, confidenceScore: 95, classification: "Compute" },
  { ticker: "LIN", name: "Linde PLC (Cryogenics)", cashFlow: 96, ecosystemPosition: 98, capitalIntensity: 85, governmentContracts: 88, aiIntegration: 60, supplyChainImportance: 100, scientificLeadership: 90, confidenceScore: 95, classification: "Materials" },
  { ticker: "AMAT", name: "Applied Materials (Fab)", cashFlow: 90, ecosystemPosition: 94, capitalIntensity: 75, governmentContracts: 85, aiIntegration: 88, supplyChainImportance: 96, scientificLeadership: 88, confidenceScore: 95, classification: "Materials" },
  { ticker: "NVDA", name: "NVIDIA Corp (NVQLink)", cashFlow: 98, ecosystemPosition: 99, capitalIntensity: 68, governmentContracts: 92, aiIntegration: 100, supplyChainImportance: 95, scientificLeadership: 96, confidenceScore: 82, classification: "Compute" },
  { ticker: "GOOG", name: "Alphabet Inc (Sycamore/Cloud)", cashFlow: 95, ecosystemPosition: 92, capitalIntensity: 60, governmentContracts: 90, aiIntegration: 98, supplyChainImportance: 85, scientificLeadership: 94, confidenceScore: 74, classification: "Cloud" },
  { ticker: "QTUM", name: "Defiance Quantum ETF", cashFlow: 75, ecosystemPosition: 80, capitalIntensity: 65, governmentContracts: 72, aiIntegration: 82, supplyChainImportance: 78, scientificLeadership: 82, confidenceScore: 63, classification: "Networking" },
  { ticker: "WQTM", name: "WisdomTree Quantum ETF", cashFlow: 72, ecosystemPosition: 78, capitalIntensity: 68, governmentContracts: 70, aiIntegration: 80, supplyChainImportance: 75, scientificLeadership: 85, confidenceScore: 63, classification: "Networking" },
  { ticker: "IONQ", name: "IonQ Inc (Trapped Ion)", cashFlow: 20, ecosystemPosition: 65, capitalIntensity: 90, governmentContracts: 65, aiIntegration: 72, supplyChainImportance: 50, scientificLeadership: 88, confidenceScore: 41, classification: "Control Systems" },
  { ticker: "RGTI", name: "Rigetti Computing (Supercond.)", cashFlow: 15, ecosystemPosition: 58, capitalIntensity: 92, governmentContracts: 55, aiIntegration: 68, supplyChainImportance: 45, scientificLeadership: 80, confidenceScore: 22, classification: "Control Systems" }
];

export interface ApertureRow {
  id: string;
  name: string;
  classification: string;
  metrics: Record<string, number>;
  observations: string[];
  evidenceBindings: {
    pattern: string;
    contradicts: string;
  };
  confidence: number;
  timestamp: string;
  schemaVersion: string;
}

export interface AnalysisJob {
  analysisId: string;
  analysisType: "clustering" | "dimensionality_reduction" | "anomaly_detection" | "regression" | "classification";
  modelName: string;
  modelVersion: string;
  vectorSchemaVersion: string;
  featureColumns: string[];
  parameters: Record<string, any>;
  trainingWindow: { start: string; end: string };
  generatedAt: string;
  sourceVectorIds: string[];
  findings: Array<{
    title: string;
    description: string;
    metricLabel?: string;
    metricValue?: string | number;
    severity?: "info" | "warning" | "anomaly" | "critical";
    supportingData?: string;
  }>;
}

export const APERTURES_DATA: Record<
  "finance" | "music" | "quantum" | "culinary" | "clinical",
  ApertureRow[]
> = {
  finance: [
    {
      id: "NVDA",
      name: "NVIDIA Corp (NVQLink)",
      classification: "Compute",
      metrics: {
        "Cash Flow": 98,
        "Ecosystem Position": 99,
        "Capital Intensity": 68,
        "Government Contracts": 92,
        "AI Integration": 100,
        "Supply Chain Importance": 95,
        "Scientific Leadership": 96
      },
      observations: [
        "Secured massive order for H200 chips from US National Labs.",
        "Introduced next-generation liquid-cooled rack cabinets."
      ],
      evidenceBindings: {
        pattern: "Hardware lock-in via CUDA software ecosystem layers.",
        contradicts: "Slight margin decline in non-AI data center segments."
      },
      confidence: 95,
      timestamp: "2026-07-12 04:30:12",
      schemaVersion: "1.0.0-alpha"
    },
    {
      id: "LIN",
      name: "Linde PLC (Cryogenics)",
      classification: "Materials",
      metrics: {
        "Cash Flow": 96,
        "Ecosystem Position": 98,
        "Capital Intensity": 85,
        "Government Contracts": 88,
        "AI Integration": 60,
        "Supply Chain Importance": 100,
        "Scientific Leadership": 90
      },
      observations: [
        "Constructing 3 new liquid helium capture facilities in Wyoming.",
        "Signed multi-year supply agreement with major European foundries."
      ],
      evidenceBindings: {
        pattern: "Cryogenic cooling is a physical non-negotiable rail.",
        contradicts: "Highly susceptible to localized shipping disruptions."
      },
      confidence: 98,
      timestamp: "2026-07-11 22:15:45",
      schemaVersion: "1.0.0-alpha"
    },
    {
      id: "AMAT",
      name: "Applied Materials (Fab)",
      classification: "Materials",
      metrics: {
        "Cash Flow": 90,
        "Ecosystem Position": 94,
        "Capital Intensity": 75,
        "Government Contracts": 85,
        "AI Integration": 88,
        "Supply Chain Importance": 96,
        "Scientific Leadership": 88
      },
      observations: [
        "Announced extreme ultraviolet (EUV) patterning advances.",
        "Export control waivers renewed for high-performance fabrication platforms."
      ],
      evidenceBindings: {
        pattern: "Required for atomic layer precision across all transistor nodes.",
        contradicts: "Subject to high capital expenditure cycle volatility."
      },
      confidence: 95,
      timestamp: "2026-07-12 01:10:00",
      schemaVersion: "1.0.0-alpha"
    }
  ],
  music: [
    {
      id: "BEET9",
      name: "Beethoven: Symphony No. 9",
      classification: "Classical",
      metrics: {
        "Timbral Density": 85,
        "Harmonic Congruence": 95,
        "Rhythmic Sync": 72,
        "Temporal Decay": 60,
        "Spectral Entropy": 40,
        "Pitch Centroid": 78,
        "Dynamic Range": 98
      },
      observations: [
        "Ode to Joy theme introduces four-part vocal counterpoint inside the final movement.",
        "Employs dynamic double-bass recitative passages to reject prior thematic elements."
      ],
      evidenceBindings: {
        pattern: "High timbral density paired with dynamic vocal contrast forms a massive acoustic anchor.",
        contradicts: "Excessive room reverberation can wash out the intricate counterpoint."
      },
      confidence: 94,
      timestamp: "2026-07-10 14:22:00",
      schemaVersion: "1.0.0-alpha"
    },
    {
      id: "COLTRANE",
      name: "John Coltrane: Giant Steps",
      classification: "Jazz",
      metrics: {
        "Timbral Density": 68,
        "Harmonic Congruence": 80,
        "Rhythmic Sync": 90,
        "Temporal Decay": 15,
        "Spectral Entropy": 85,
        "Pitch Centroid": 82,
        "Dynamic Range": 70
      },
      observations: [
        "Features rapid symmetric chord changes moving in major thirds (Coltrane changes).",
        "Extremely fast tempo of 250 BPM with continuous eighth-note solo runs."
      ],
      evidenceBindings: {
        pattern: "Complex micro-tonal substitutions define high-frequency harmonic geometry.",
        contradicts: "Relies heavily on traditional rhythm section templates."
      },
      confidence: 91,
      timestamp: "2026-07-09 18:05:12",
      schemaVersion: "1.0.0-alpha"
    },
    {
      id: "KRONOS",
      name: "Kronos Quartet: Aheym",
      classification: "Avant-Garde",
      metrics: {
        "Timbral Density": 90,
        "Harmonic Congruence": 62,
        "Rhythmic Sync": 96,
        "Temporal Decay": 30,
        "Spectral Entropy": 75,
        "Pitch Centroid": 65,
        "Dynamic Range": 92
      },
      observations: [
        "Features intense, abrasive string techniques (col legno, sul ponticello).",
        "Dynamic rhythmic shifts with heavy, asymmetric syncopated accents."
      ],
      evidenceBindings: {
        pattern: "Highly aggressive timbral manipulation creates complex acoustic distortion patterns.",
        contradicts: "Lacks traditional melodic resolution layers."
      },
      confidence: 88,
      timestamp: "2026-07-11 09:40:00",
      schemaVersion: "1.0.0-alpha"
    }
  ],
  quantum: [
    {
      id: "SYCAMORE",
      name: "Alphabet: Sycamore QPU",
      classification: "Superconducting",
      metrics: {
        "Coherence Time (T2)": 25,
        "Gate Fidelity": 99,
        "Qubit Count": 53,
        "Cryo Capacity": 90,
        "Control Bandwidth": 85,
        "Quantum Volume": 75,
        "Error Budget": 40
      },
      observations: [
        "Demonstrated quantum supremacy using random circuit sampling algorithms.",
        "Integrated microwave packaging to reduce cross-talk across adjacent transmon qubits."
      ],
      evidenceBindings: {
        pattern: "Gate fidelity above 99% permits multi-depth error mitigation strategies.",
        contradicts: "Extremely short coherence times require lightning-fast gate speeds."
      },
      confidence: 74,
      timestamp: "2026-07-11 11:30:15",
      schemaVersion: "1.0.0-alpha"
    },
    {
      id: "YB171",
      name: "IonQ: Trapped Ion (Yb-171)",
      classification: "Trapped Ion",
      metrics: {
        "Coherence Time (T2)": 98,
        "Gate Fidelity": 99,
        "Qubit Count": 32,
        "Cryo Capacity": 30,
        "Control Bandwidth": 55,
        "Quantum Volume": 95,
        "Error Budget": 20
      },
      observations: [
        "Individual atoms trapped in radiofrequency fields achieve exceptional coherence states.",
        "Laser-driven Raman transitions execute highly precise, arbitrary 2-qubit gates."
      ],
      evidenceBindings: {
        pattern: "Near-perfect atomic qubits eliminate natural manufacturing variances.",
        contradicts: "Laser controller calibration bottlenecks scale-out speed."
      },
      confidence: 41,
      timestamp: "2026-07-12 02:45:10",
      schemaVersion: "1.0.0-alpha"
    },
    {
      id: "SOLITON",
      name: "PsiQuantum: Photonic Soliton",
      classification: "Photonics",
      metrics: {
        "Coherence Time (T2)": 100,
        "Gate Fidelity": 98,
        "Qubit Count": 120,
        "Cryo Capacity": 50,
        "Control Bandwidth": 96,
        "Quantum Volume": 60,
        "Error Budget": 65
      },
      observations: [
        "Photon wavepackets routed through custom silicon waveguide switches.",
        "Avoids deep cryogenic dilution refrigerators by utilizing room-temperature transceivers."
      ],
      evidenceBindings: {
        pattern: "Speed-of-light photonic routing enables massive physical cluster scaling.",
        contradicts: "High loss rates during wavepacket manipulation introduce extensive error margins."
      },
      confidence: 63,
      timestamp: "2026-07-10 16:55:00",
      schemaVersion: "1.0.0-alpha"
    }
  ],
  culinary: [
    {
      id: "TRUFFLE",
      name: "White Truffle Infusion",
      classification: "Aromatics",
      metrics: {
        "Umami Index": 98,
        "Thermal Delta": 15,
        "Acidity Index": 30,
        "Texture Grain": 10,
        "Volatile Esters": 99,
        "Viscosity Bounds": 45,
        "Salt Saturation": 20
      },
      observations: [
        "Highly concentrated bis(methylthio)methane compounds detected via mass spec.",
        "Ester profile degrades rapidly when exposed to temperatures exceeding 50 degrees C."
      ],
      evidenceBindings: {
        pattern: "Volatile aromatic concentration drives powerful olfactory-limbic system activation.",
        contradicts: "Exhibits zero structural stability over extended culinary hold times."
      },
      confidence: 92,
      timestamp: "2026-07-12 00:05:30",
      schemaVersion: "1.0.0-alpha"
    },
    {
      id: "SHOYU",
      name: "Aged Shoyu Glaze (3-Year)",
      classification: "Ferment",
      metrics: {
        "Umami Index": 95,
        "Thermal Delta": 85,
        "Acidity Index": 65,
        "Texture Grain": 25,
        "Volatile Esters": 72,
        "Viscosity Bounds": 80,
        "Salt Saturation": 90
      },
      observations: [
        "Rich in free glutamic acid and amino acid fractions from slow solid-state fermentation.",
        "Naturally stabilized through long-term high salt concentration bounds."
      ],
      evidenceBindings: {
        pattern: "Deep fermentation generates stable molecular structures resistant to heat breakdown.",
        contradicts: "High salinity restricts direct pairing options with delicate elements."
      },
      confidence: 96,
      timestamp: "2026-07-08 10:20:00",
      schemaVersion: "1.0.0-alpha"
    }
  ],
  clinical: [
    {
      id: "CAS9",
      name: "CRISPR CAS9-B Vector",
      classification: "Gene Therapy",
      metrics: {
        "Binding Affinity": 96,
        "Splicing Fidelity": 92,
        "Toxicity Margin": 85,
        "Off-Target Rate": 15,
        "Transduction Ratio": 78,
        "Immunogenicity": 45,
        "Expression Yield": 80
      },
      observations: [
        "Successfully corrected specific homozygous mutations in primary cell cultures.",
        "Integrated nuclear localization signals to accelerate target chromatin binding."
      ],
      evidenceBindings: {
        pattern: "High sgRNA binding affinity paired with modified Cas9 reduces off-target cleavage.",
        contradicts: "In-vivo delivery triggers localized inflammatory cytokine production."
      },
      confidence: 90,
      timestamp: "2026-07-11 15:40:00",
      schemaVersion: "1.0.0-alpha"
    },
    {
      id: "CART",
      name: "CAR-T Immunoglobin",
      classification: "Immunotherapy",
      metrics: {
        "Binding Affinity": 99,
        "Splicing Fidelity": 10,
        "Toxicity Margin": 50,
        "Off-Target Rate": 5,
        "Transduction Ratio": 92,
        "Immunogenicity": 95,
        "Expression Yield": 70
      },
      observations: [
        "Engineered T-cells express high levels of chimeric antigen receptor targeting CD19.",
        "Triggers rapid tumor lysis and subsequent systemic cytokine storm syndromes."
      ],
      evidenceBindings: {
        pattern: "High-affinity binding triggers massive, targeted cellular cytotoxicity.",
        contradicts: "High immunogenicity profiles require precise clinical patient monitoring."
      },
      confidence: 85,
      timestamp: "2026-07-12 03:20:00",
      schemaVersion: "1.0.0-alpha"
    }
  ]
};

interface RapidsLensDashboardProps {
  allocation: Allocation;
  setAllocation: React.Dispatch<React.SetStateAction<Allocation>>;
  tickers: Record<string, TickerInfo>;
  handleRebalance: () => void;
  rapidsWeights: {
    cashFlow: number;
    ecosystemPosition: number;
    capitalIntensity: number;
    governmentContracts: number;
    aiIntegration: number;
    supplyChainImportance: number;
    scientificLeadership: number;
  };
  setRapidsWeights: React.Dispatch<React.SetStateAction<{
    cashFlow: number;
    ecosystemPosition: number;
    capitalIntensity: number;
    governmentContracts: number;
    aiIntegration: number;
    supplyChainImportance: number;
    scientificLeadership: number;
  }>>;
}

export default function RapidsLensDashboard({
  allocation,
  setAllocation,
  tickers,
  handleRebalance,
  rapidsWeights,
  setRapidsWeights
}: RapidsLensDashboardProps) {
  // Navigation for Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<"evidence_frame" | "cudf" | "cuml" | "cugraph" | "raft" | "roadmap" | "rmm">("evidence_frame");

  // RMM Telemetry and Configuration States
  const [rmmInitialPoolSize, setRmmInitialPoolSize] = useState<number>(4294967296); // 4GB
  const [rmmMaximumPoolSize, setRmmMaximumPoolSize] = useState<number>(12884901888); // 12GB
  const [rmmManagedMemory, setRmmManagedMemory] = useState<boolean>(false);
  const [rmmStatisticsEnabled, setRmmStatisticsEnabled] = useState<boolean>(true);
  const [gpuJobMemoryLimit, setGpuJobMemoryLimit] = useState<number>(2147483648); // 2GB
  const [rmmStatus, setRmmStatus] = useState<"initialized" | "fail_closed" | "rebooting">("initialized");
  const [configError, setConfigError] = useState<string | null>(null);
  const [runtimeMode, setRuntimeMode] = useState<string>("simulation");

  const [rmmLogs, setRmmLogs] = useState<string[]>([
    "[RMM System] Booting GPU memory resource governance layer...",
    "[RMM-01] Validating pre-allocation bounds. Active memory resource: pool_resource",
    "[RMM-02] Maximum memory budget constrained to 12.00 GB",
    "[RMM System] RMM initial pool allocated: 4.00 GB device memory",
    "[RMM System] Memory telemetry registered successfully. Admission controls ACTIVE.",
    "[RMM System] Intercepting CuPy and PyTorch allocators — mapped to shared RMM contract."
  ]);

  const [rmmStats, setRmmStats] = useState({
    device: 0,
    resourceType: "pool",
    poolCurrentBytes: 4294967296,
    poolPeakBytes: 7730941132,
    poolMaximumBytes: 12884901888,
    activeJobsCount: 0,
    totalAllocationsCount: 184,
    totalAllocatedBytes: 18468359321,
    admissionStatus: "open"
  });

  const [rmmHistory, setRmmHistory] = useState<any[]>([]);
  const [gpuDetails, setGpuDetails] = useState<any>({
    device: 0,
    name: "NVIDIA H100 PCIe (80GB)",
    compute_capability: "9.0",
    driver_version: "535.129.03",
    cuda_version: "12.2",
    pci_bus_id: "0000:01:00.0",
    temperature_celsius: 42,
    fan_speed_percent: 32,
    power_draw_watts: 180,
    power_limit_watts: 350,
    clock_graphics_mhz: 2415,
    clock_memory_mhz: 1593
  });

  const [simJobSize, setSimJobSize] = useState<number>(1073741824); // 1GB
  const [isAllocatingSimJob, setIsAllocatingSimJob] = useState<boolean>(false);

  const fetchRmmData = async () => {
    try {
      try {
        const resMode = await fetch("/rapids/runtime/mode");
        if (resMode.ok) {
          const data = await resMode.json();
          setRuntimeMode(data.mode);
        }
      } catch (errMode) {
        console.warn("Could not fetch runtime mode", errMode);
      }

      const resConfig = await fetch("/rapids/runtime/memory");
      if (resConfig.ok) {
        const data = await resConfig.json();
        setRmmStats({
          device: data.device,
          resourceType: data.resource_type,
          poolCurrentBytes: data.pool_current_bytes,
          poolPeakBytes: data.pool_peak_bytes,
          poolMaximumBytes: data.pool_maximum_bytes,
          activeJobsCount: data.active_jobs,
          totalAllocationsCount: 184 + (rmmHistory.length * 4),
          totalAllocatedBytes: 18468359321 + (rmmHistory.length * 1024 * 1024 * 100),
          admissionStatus: data.admission_status
        });
        if (data.config) {
          setRmmInitialPoolSize(data.config.initialPoolSize);
          setRmmMaximumPoolSize(data.config.maximumPoolSize);
          setRmmManagedMemory(data.config.managedMemory);
          setRmmStatisticsEnabled(data.config.statisticsEnabled);
          setGpuJobMemoryLimit(data.config.gpuJobMemoryLimit);
        }
      }

      const resGpu = await fetch("/rapids/runtime/gpu");
      if (resGpu.ok) {
        const data = await resGpu.json();
        setGpuDetails(data);
      }

      const resHist = await fetch("/rapids/runtime/memory/history");
      if (resHist.ok) {
        const data = await resHist.json();
        if (data.status === "success") {
          setRmmHistory(data.history);
        }
      }
    } catch (e) {
      console.error("Error fetching RMM data", e);
    }
  };

  useEffect(() => {
    fetchRmmData();
  }, [activeSubTab]);

  const saveRmmConfig = async (initSize: number, maxSize: number, managed: boolean, stats: boolean, limit: number) => {
    if (initSize <= 0 || maxSize <= 0) {
      setConfigError("Invalid RMM configuration: sizes must be positive integers.");
      setRmmStatus("fail_closed");
      setRmmLogs((prev) => [
        ...prev,
        `[CRITICAL RMM ERROR] Failed validation check: values must be positive. Entering FAIL CLOSED status.`,
        `[RMM-05] Out of Service. RMM has closed the active memory resource pool. All GPU allocations blocked.`
      ]);
      return;
    }
    if (initSize > maxSize) {
      setConfigError("Invalid RMM configuration: Initial pool size cannot be greater than maximum pool size.");
      setRmmStatus("fail_closed");
      setRmmLogs((prev) => [
        ...prev,
        `[CRITICAL RMM ERROR] Failed validation check: Initial Pool Size (${(initSize / 1e9).toFixed(2)} GB) exceeds Maximum Pool Size (${(maxSize / 1e9).toFixed(2)} GB). Entering FAIL CLOSED status.`,
        `[RMM-05] Out of Service. RMM has closed the active memory resource pool. All GPU allocations blocked.`
      ]);
      return;
    }

    setConfigError(null);
    setRmmStatus("rebooting");
    setRmmLogs((prev) => [
      ...prev,
      `[RMM System] Received reconfiguration request. Setting transition state...`,
      `[RMM System] Releasing existing pool resource (Device 0).`,
      `[RMM System] Setting active memory resource type to: ${managed ? "managed_memory_resource" : "pool_resource"}`
    ]);

    try {
      const res = await fetch("/rapids/runtime/memory/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialPoolSize: initSize,
          maximumPoolSize: maxSize,
          managedMemory: managed,
          statisticsEnabled: stats,
          gpuJobMemoryLimit: limit
        })
      });

      if (res.ok) {
        setTimeout(() => {
          setRmmStatus("initialized");
          setRmmLogs((prev) => [
            ...prev,
            `[RMM System] RMM pool successfully rebooted before subsequent device allocation!`,
            `[RMM-01] Validated. New Initial Pool Size: ${(initSize / 1e9).toFixed(2)} GB, Maximum Pool Size: ${(maxSize / 1e9).toFixed(2)} GB.`,
            `[RMM-02] Active limits registered. Admission status: OPEN.`
          ]);
          fetchRmmData();
        }, 1000);
      } else {
        const data = await res.json();
        setConfigError(data.error || "Failed to update configuration on server.");
        setRmmStatus("fail_closed");
      }
    } catch (e) {
      console.error("Failed to reconfigure RMM", e);
      setConfigError("Network error. Failed to reconfigure RMM.");
      setRmmStatus("fail_closed");
    }
  };

  const triggerSimAllocation = async () => {
    if (rmmStatus === "fail_closed") {
      setRmmLogs((prev) => [
        ...prev,
        `[ADMISSION REJECTED] Cannot dispatch job. RMM Status is FAIL CLOSED. Workspace is uninitialized or in error.`,
      ]);
      return;
    }

    setIsAllocatingSimJob(true);
    const jobId = "job-" + Math.floor(100 + Math.random() * 900);
    setRmmLogs((prev) => [
      ...prev,
      `[ADMISSION CONTROL] Job ${jobId} requested allocation of ${(simJobSize / 1e9).toFixed(2)} GB device memory.`,
      `[ADMISSION CONTROL] Checking active constraints... (Limit: ${(gpuJobMemoryLimit / 1e9).toFixed(2)} GB)`
    ]);

    setTimeout(async () => {
      if (simJobSize > gpuJobMemoryLimit) {
        setRmmLogs((prev) => [
          ...prev,
          `[ADMISSION REJECTED] Job ${jobId} failed RMM admission control. Requested ${(simJobSize / 1e9).toFixed(2)} GB exceeds active job limit of ${(gpuJobMemoryLimit / 1e9).toFixed(2)} GB.`,
          `[RMM-06] Admission control rejected allocation request due to size policy violation.`
        ]);
        setIsAllocatingSimJob(false);
        return;
      }

      setRmmLogs((prev) => [
        ...prev,
        `[ADMISSION APPROVED] Job ${jobId} approved. Transitioning memory from pool...`,
        `[RMM-01] Validating active pool resource pointer.`,
        `[RMM System] Allocated ${(simJobSize / 1e9).toFixed(2)} GB at address 0x7f3b${Math.floor(Math.random() * 9000 + 1000).toString(16)}.`,
        `[RMM System] Job ${jobId} execution running...`
      ]);

      setTimeout(async () => {
        setRmmLogs((prev) => [
          ...prev,
          `[RMM System] Job ${jobId} complete. Reclaiming memory to pool resource.`,
          `[RMM-03] Telemetry registered successfully.`
        ]);

        try {
          await fetch("/rapids/runtime/memory/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              analysis_id: jobId,
              gpu_device: 0,
              rmm_resource: rmmManagedMemory ? "managed" : "pool",
              initial_pool_bytes: rmmInitialPoolSize,
              maximum_pool_bytes: rmmMaximumPoolSize,
              managed_memory: rmmManagedMemory,
              peak_allocated_bytes: simJobSize,
              total_allocated_bytes: simJobSize * 1.5,
              allocation_count: Math.floor(Math.random() * 20 + 5),
              duration_ms: Math.floor(Math.random() * 800 + 200),
              status: "completed"
            })
          });
          fetchRmmData();
        } catch (err) {
          console.error(err);
        }
        setIsAllocatingSimJob(false);
      }, 1500);
    }, 1000);
  };

  // EvidenceFrame State
  const [selectedAperture, setSelectedAperture] = useState<"finance" | "music" | "quantum" | "culinary" | "clinical">("finance");
  const [selectedApertureRowId, setSelectedApertureRowId] = useState<string>("NVDA");
  const [activeSpecView, setActiveSpecView] = useState<"columns" | "semantics" | "provenance" | "json">("columns");
  const [gpuSimulating, setGpuSimulating] = useState<boolean>(false);
  const [gpuSimTime, setGpuSimTime] = useState<number>(0.0);
  const [gpuSimLog, setGpuSimLog] = useState<string[]>([
    "[GPU Device] EvidenceFrame subsystem allocated.",
    "[Memory] Ready for Arrow zero-copy IPC mapping."
  ]);

  useEffect(() => {
    const firstIdMap: Record<string, string> = {
      finance: "NVDA",
      music: "BEET9",
      quantum: "SYCAMORE",
      culinary: "TRUFFLE",
      clinical: "CAS9"
    };
    setSelectedApertureRowId(firstIdMap[selectedAperture] || "NVDA");
  }, [selectedAperture]);

  // Telemetry & General State
  const [gpuActive, setGpuActive] = useState<boolean>(true);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [computeTime, setComputeTime] = useState<number>(0.042);
  const [arrowBufferBytes, setArrowBufferBytes] = useState<number>(4194304); // 4MB Arrow buffer
  const [activeCudaThreads, setActiveCudaThreads] = useState<number>(1024);

  // cuML state
  const [selectedKnnTicker, setSelectedKnnTicker] = useState<string>("NVDA");
  const [clusteringRun, setClusteringRun] = useState<boolean>(false);

  // Expanded cuML Subsystem state matching the Wall Street Doctrine
  const [activeCumlView, setActiveCumlView] = useState<"findings" | "jobs" | "pca" | "anomalies" | "contract">("findings");
  const [selectedJobId, setSelectedJobId] = useState<string>("job-001");
  const [cumlModelFamily, setCumlModelFamily] = useState<"KMeans" | "DBSCAN" | "PCA" | "IsolationForest" | "LinearRegression">("KMeans");
  const [cumlGpuRunning, setCumlGpuRunning] = useState<boolean>(false);
  const [cumlGpuConsole, setCumlGpuConsole] = useState<string[]>([
    "[cuML] Subsystem initialized. Host memory mapped to H100 GPU.",
    "[CUDA] Loaded cuml.accel. Ready for high-dimensional fitting."
  ]);

  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJob[]>([
    {
      analysisId: "job-001",
      analysisType: "clustering",
      modelName: "KMeans",
      modelVersion: "26.06.2",
      vectorSchemaVersion: "wallstreet-v1.2",
      featureColumns: ["cashFlow", "ecosystemPosition", "capitalIntensity", "governmentContracts", "aiIntegration", "supplyChainImportance", "scientificLeadership"],
      parameters: { n_clusters: 3, max_iter: 300, random_state: 42, init: "k-means++" },
      trainingWindow: { start: "2026-01-01", end: "2026-07-12" },
      generatedAt: "2026-07-12 05:10:00",
      sourceVectorIds: ["SOXX", "XSD", "LIN", "AMAT", "NVDA", "GOOG", "QTUM", "WQTM", "IONQ", "RGTI"],
      findings: [
        {
          title: "Cluster 0: Systemic Rails",
          description: "High cash flow generation paired with extreme supply chain importance and high capital intensity. These constitute physical bottlenecks of the world model.",
          metricLabel: "Average Cash Flow",
          metricValue: "94.8",
          supportingData: "Contains LIN, AMAT, NVDA, SOXX. Represents 80% weight in baseline allocation model."
        },
        {
          title: "Cluster 1: Cloud & Orchestration Hubs",
          description: "High AI integration coupled with massive scale. They translate compute into software platforms and compiler ecosystems.",
          metricLabel: "Average AI Integration",
          metricValue: "93.0",
          supportingData: "Contains GOOG, XSD, QTUM, WQTM."
        },
        {
          title: "Cluster 2: Speculative Pre-Revenue Modalities",
          description: "High scientific leadership, pre-revenue, extremely capitally intensive. Coherence bounds remain low, high risk exposure.",
          metricLabel: "Centroid Confidence Score",
          metricValue: "31.5%",
          supportingData: "Contains IONQ, RGTI. Positioned in the outer shell of high-dimensional space."
        }
      ]
    },
    {
      analysisId: "job-002",
      analysisType: "dimensionality_reduction",
      modelName: "PCA",
      modelVersion: "26.06.2",
      vectorSchemaVersion: "wallstreet-v1.2",
      featureColumns: ["cashFlow", "ecosystemPosition", "capitalIntensity", "governmentContracts", "aiIntegration", "supplyChainImportance", "scientificLeadership"],
      parameters: { n_components: 2, whiten: true, svd_solver: "full" },
      trainingWindow: { start: "2026-01-01", end: "2026-07-12" },
      generatedAt: "2026-07-12 05:22:15",
      sourceVectorIds: ["SOXX", "XSD", "LIN", "AMAT", "NVDA", "GOOG", "QTUM", "WQTM", "IONQ", "RGTI"],
      findings: [
        {
          title: "PC1 (Principal Component 1) - Cash Flow vs Speculation",
          description: "Captures 64.2% of total variance. Strongly separates high cash-flow hardware giants (NVDA, LIN) from speculative quantum researchers (IONQ, RGTI).",
          metricLabel: "Explained Variance Ratio",
          metricValue: "64.2%"
        },
        {
          title: "PC2 (Principal Component 2) - Infrastructure vs Platform",
          description: "Captures 18.5% of variance. Differentiates heavy physical asset holders (Linde PLC, Applied Materials) from pure-play compiler and software ecosystems.",
          metricLabel: "Cumulative Explained Variance",
          metricValue: "82.7%"
        }
      ]
    },
    {
      analysisId: "job-003",
      analysisType: "anomaly_detection",
      modelName: "IsolationForest",
      modelVersion: "26.06.0",
      vectorSchemaVersion: "wallstreet-v1.2",
      featureColumns: ["cashFlow", "ecosystemPosition", "capitalIntensity", "confidenceScore"],
      parameters: { contamination: 0.15, bootstrap: false, n_estimators: 100 },
      trainingWindow: { start: "2026-01-01", end: "2026-07-12" },
      generatedAt: "2026-07-12 05:35:40",
      sourceVectorIds: ["SOXX", "XSD", "LIN", "AMAT", "NVDA", "GOOG", "QTUM", "WQTM", "IONQ", "RGTI"],
      findings: [
        {
          title: "ANOMALY DETECTED: Pre-revenue Quantum Incongruence",
          description: "IONQ is flagging as a statistical outlier. Confidence score remains moderate (41%) while cash flow generation is extremely low (20) compared to scientific leadership.",
          metricLabel: "Anomaly Score (F1-bounds)",
          metricValue: "0.82",
          severity: "anomaly",
          supportingData: "Model detected abrupt deviation from standard Cluster 2 bounds. Evidence bindings: Coherence vs gate fidelity does not match revenue scale."
        },
        {
          title: "ANOMALY DETECTED: Valuation-Confidence Divergence",
          description: "RGTI is flagging on low confidence (22%) and extremely high capital intensity (92%). The deviation ratio exceeds 2.5 sigma from cluster average.",
          metricLabel: "Anomaly Score (F1-bounds)",
          metricValue: "0.78",
          severity: "anomaly",
          supportingData: "Support: capitalIntensity=92 is incompatible with cashFlow=15 over a 15-year quantum commercialization thesis window."
        }
      ]
    },
    {
      analysisId: "job-004",
      analysisType: "regression",
      modelName: "LinearRegression",
      modelVersion: "26.06.1",
      vectorSchemaVersion: "wallstreet-v1.2",
      featureColumns: ["ecosystemPosition", "governmentContracts", "aiIntegration", "supplyChainImportance"],
      parameters: { fit_intercept: true, normalize: false },
      trainingWindow: { start: "2026-01-01", end: "2026-07-12" },
      generatedAt: "2026-07-12 05:44:02",
      sourceVectorIds: ["SOXX", "XSD", "LIN", "AMAT", "NVDA", "GOOG", "QTUM", "WQTM", "IONQ", "RGTI"],
      findings: [
        {
          title: "Ecosystem Position vs Revenue Durability",
          description: "Ecosystem Position carries the highest positive regression coefficient (beta = 0.44), suggesting strong developer and software lock-in is the most powerful predictor of cash flow durability.",
          metricLabel: "R-Squared Value",
          metricValue: "0.892"
        },
        {
          title: "Sovereign/Government Support Safeguards",
          description: "Government contracts act as an insurance ceiling. While not driving short-term hyper-growth, they limit downside variance (beta = 0.28) during cyclic industry downturns.",
          metricLabel: "Adjusted R-Squared",
          metricValue: "0.855"
        }
      ]
    }
  ]);

  // Pathfinder Graph Lens state hooks (in-memory CPU TypeScript Solver)
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [selectedGraphNode, setSelectedGraphNode] = useState<string>("company:NVDA");
  const [graphNodeTypeFilter, setGraphNodeTypeFilter] = useState<string>("all");
  const [graphSearchQuery, setGraphSearchQuery] = useState<string>("");

  const [graphCentrality, setGraphCentrality] = useState<any>(null);
  const [graphCommunities, setGraphCommunities] = useState<Record<string, string>>({});
  const [graphBottlenecks, setGraphBottlenecks] = useState<Record<string, number>>({});

  // Canonical Identity, Snapshots & Ledger states (Wall Street Doctrine)
  const [postgresIdentities, setPostgresIdentities] = useState<any[]>([]);
  const [graphSnapshots, setGraphSnapshots] = useState<any[]>([]);
  const [graphLedger, setGraphLedger] = useState<any[]>([]);
  const [newSnapshotName, setNewSnapshotName] = useState<string>("");
  const [newSnapshotDesc, setNewSnapshotDesc] = useState<string>("");
  const [backgroundWorkerStatus, setBackgroundWorkerStatus] = useState<any>(null);

  const [shortestPathSource, setShortestPathSource] = useState<string>("gov:CHIPS");
  const [shortestPathDest, setShortestPathDest] = useState<string>("company:NVDA");
  const [computedPath, setComputedPath] = useState<string[]>([]);
  const [computedPathEdges, setComputedPathEdges] = useState<any[]>([]);
  const [computedPathNodes, setComputedPathNodes] = useState<any[]>([]);
  const [pathError, setPathError] = useState<string>("");

  // Editor states for dynamic registration
  const [editorNodeId, setEditorNodeId] = useState<string>("");
  const [editorNodeLabel, setEditorNodeLabel] = useState<string>("");
  const [editorNodeType, setEditorNodeType] = useState<string>("company");
  const [editorNodeTicker, setEditorNodeTicker] = useState<string>("");
  const [editorNodeRail, setEditorNodeRail] = useState<string>("quantum");
  const [editorNodeDesc, setEditorNodeDesc] = useState<string>("");
  
  const [editorEdgeSource, setEditorEdgeSource] = useState<string>("");
  const [editorEdgeTarget, setEditorEdgeTarget] = useState<string>("");
  const [editorEdgeType, setEditorEdgeType] = useState<string>("SUPPLIES");
  const [editorEdgeWeight, setEditorEdgeWeight] = useState<number>(0.8);
  const [editorEdgeConfidence, setEditorEdgeConfidence] = useState<number>(0.95);

  const [isPageRankRunning, setIsPageRankRunning] = useState<boolean>(false);
  const [analysisStatusMessage, setAnalysisStatusMessage] = useState<string>("");

  // Load active graph schema on mount and sub-tab selection
  const fetchGraphData = async () => {
    try {
      const nodesRes = await fetch("/rapids/graph/nodes");
      const edgesRes = await fetch("/rapids/graph/edges");
      if (nodesRes.ok && edgesRes.ok) {
        const nodesData = await nodesRes.json();
        const edgesData = await edgesRes.json();
        setGraphNodes(nodesData.nodes);
        setGraphEdges(edgesData.edges);
      }
      
      const centralityRes = await fetch("/rapids/graph/centrality/latest");
      const communityRes = await fetch("/rapids/graph/communities/latest");
      const bottleneckRes = await fetch("/rapids/graph/bottlenecks/latest");

      if (centralityRes.ok && communityRes.ok && bottleneckRes.ok) {
        const cData = await centralityRes.json();
        const comData = await communityRes.json();
        const bData = await bottleneckRes.json();
        setGraphCentrality(cData);
        setGraphCommunities(comData.communities);
        setGraphBottlenecks(bData.bottlenecks);
      }

      // Fetch Postgres Canonical Identities, snapshots, and append-only ledger
      const postgresRes = await fetch("/rapids/postgres/identities");
      if (postgresRes.ok) {
        const pgData = await postgresRes.json();
        setPostgresIdentities(pgData.identities);
      }

      const snapshotsRes = await fetch("/rapids/graph/snapshots");
      if (snapshotsRes.ok) {
        const snapData = await snapshotsRes.json();
        setGraphSnapshots(snapData.snapshots);
      }

      const ledgerRes = await fetch("/rapids/graph/ledger");
      if (ledgerRes.ok) {
        const ledgerData = await ledgerRes.json();
        setGraphLedger(ledgerData.ledger);
      }

      const statusRes = await fetch("/rapids/graph/analysis/status");
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setBackgroundWorkerStatus(statusData);
      }
    } catch (e) {
      console.error("Failed to load graph and snapshot data from backend", e);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [activeSubTab]);

  // Query shortest path dynamic routing
  const queryShortestPath = async () => {
    if (!shortestPathSource || !shortestPathDest) return;
    try {
      setPathError("");
      const res = await fetch(`/rapids/graph/path?source=${shortestPathSource}&target=${shortestPathDest}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          setComputedPath(data.path);
          setComputedPathNodes(data.node_details);
          setComputedPathEdges(data.edges);
        } else {
          setComputedPath([]);
          setComputedPathNodes([]);
          setComputedPathEdges([]);
          setPathError(data.message || "No dependency path found.");
        }
      }
    } catch (e) {
      console.error("Shortest path query failed", e);
    }
  };

  useEffect(() => {
    queryShortestPath();
  }, [shortestPathSource, shortestPathDest, graphEdges]);

  // Dispatch live background re-computation run (CPU-bound Pathfinder solver)
  const computePageRank = async () => {
    setIsPageRankRunning(true);
    setAnalysisStatusMessage("Dispatching job queue. Calibrating Pathfinder CPU solvers...");
    try {
      const res = await fetch("/rapids/graph/analysis/jobs", { method: "POST" });
      if (res.ok) {
        setAnalysisStatusMessage("Background job dispatched. Recomputing PageRank, betweenness, and bottlenecks...");
        
        // Simulating progressive status polling as the non-blocking background thread works
        setTimeout(async () => {
          await fetchGraphData();
          setAnalysisStatusMessage("Pathfinder Graph Lens solver converged and cached results refreshed.");
          setIsPageRankRunning(false);
          setTimeout(() => setAnalysisStatusMessage(""), 3000);
        }, 1200);
      }
    } catch (e) {
      console.error("Analysis job dispatch failed", e);
      setIsPageRankRunning(false);
      setAnalysisStatusMessage("Job dispatch failed.");
    }
  };

  // Submit and archive custom versioned snapshot of causal network state
  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotName) return;
    try {
      const res = await fetch("/rapids/graph/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSnapshotName,
          description: newSnapshotDesc || ""
        })
      });
      if (res.ok) {
        setNewSnapshotName("");
        setNewSnapshotDesc("");
        // Refresh list
        const snapRes = await fetch("/rapids/graph/snapshots");
        if (snapRes.ok) {
          const snapData = await snapRes.json();
          setGraphSnapshots(snapData.snapshots);
        }
      }
    } catch (err) {
      console.error("Error creating versioned graph snapshot", err);
    }
  };

  // Submit custom node registration
  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorNodeId || !editorNodeLabel) return;
    try {
      const res = await fetch("/rapids/graph/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: editorNodeId,
          node_type: editorNodeType,
          label: editorNodeLabel,
          attributes: {
            ticker: editorNodeTicker || undefined,
            rail: editorNodeRail || undefined,
            description: editorNodeDesc || undefined
          }
        })
      });
      if (res.ok) {
        fetchGraphData();
        setEditorNodeId("");
        setEditorNodeLabel("");
        setEditorNodeTicker("");
        setEditorNodeDesc("");
      }
    } catch (err) {
      console.error("Error creating node", err);
    }
  };

  // Submit custom edge connection
  const handleAddEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorEdgeSource || !editorEdgeTarget) return;
    try {
      const res = await fetch("/rapids/graph/edges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_node_id: editorEdgeSource,
          target_node_id: editorEdgeTarget,
          edge_type: editorEdgeType,
          weight: Number(editorEdgeWeight),
          confidence: Number(editorEdgeConfidence)
        })
      });
      if (res.ok) {
        fetchGraphData();
        setEditorEdgeSource("");
        setEditorEdgeTarget("");
      }
    } catch (err) {
      console.error("Error creating edge", err);
    }
  };

  // RAFT sandbox state
  const [selectedPrimitive, setSelectedPrimitive] = useState<string>("pairwise_distance");
  const [primitiveLogs, setPrimitiveLogs] = useState<string[]>([
    "[RAFT System] Interface initialized.",
    "[Device] Ready to receive stream buffer allocation."
  ]);
  const [isExecutingPrimitive, setIsExecutingPrimitive] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // 7-Layer Substrate state
  const [selectedLayer, setSelectedLayer] = useState<number>(1);

  // Dynamic calculations for DataFrame Scores
  const calculateDynamicScore = (row: RapidsVector) => {
    const score = (
      row.cashFlow * rapidsWeights.cashFlow +
      row.ecosystemPosition * rapidsWeights.ecosystemPosition +
      (100 - row.capitalIntensity) * rapidsWeights.capitalIntensity + // inverted capital intensity
      row.governmentContracts * rapidsWeights.governmentContracts +
      row.aiIntegration * rapidsWeights.aiIntegration +
      row.supplyChainImportance * rapidsWeights.supplyChainImportance +
      row.scientificLeadership * rapidsWeights.scientificLeadership
    );
    const maxPossibleScore = (
      100 * rapidsWeights.cashFlow +
      100 * rapidsWeights.ecosystemPosition +
      100 * rapidsWeights.capitalIntensity +
      100 * rapidsWeights.governmentContracts +
      100 * rapidsWeights.aiIntegration +
      100 * rapidsWeights.supplyChainImportance +
      100 * rapidsWeights.scientificLeadership
    );
    return Math.round((score / (maxPossibleScore || 1)) * 100);
  };

  const getSortedVectors = () => {
    return INITIAL_RAPIDS_DATA.map((row) => ({
      ...row,
      rapidsScore: calculateDynamicScore(row)
    })).sort((a, b) => b.rapidsScore - a.rapidsScore);
  };

  // Run dynamic CPU/GPU DataFrame recalculation animation
  const triggerRecalculate = () => {
    setIsComputing(true);
    setComputeTime(0.005 + Math.random() * 0.015);
    setTimeout(() => {
      setIsComputing(false);
      setArrowBufferBytes(Math.floor(4000000 + Math.random() * 500000));
    }, 400);
  };

  const dispatchCumlJob = () => {
    setCumlGpuRunning(true);
    const modelFamily = cumlModelFamily;
    setCumlGpuConsole([
      `[cuML-H100] Dispatching analytical job...`,
      `[cuML-H100] Initializing ${modelFamily} algorithm inside device memory.`,
      `[Arrow IPC] Resolving zero-copy IPC pointers for WallStreet-v1.2 active vectors.`
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setCumlGpuConsole(prev => [
          ...prev,
          `[CUDA Kernel] Dispatched parallel CUDA blocks. Grid <<<16, 512>>>`,
          `[Fitting] Invoking cuML ${modelFamily}.fit_transform() on 10 source vectors...`
        ]);
      } else if (step === 2) {
        const jobId = "job-" + Math.floor(100 + Math.random() * 900);
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        let newJob: AnalysisJob;
        if (modelFamily === "KMeans" || modelFamily === "DBSCAN") {
          newJob = {
            analysisId: jobId,
            analysisType: "clustering",
            modelName: modelFamily,
            modelVersion: "26.06.2",
            vectorSchemaVersion: "wallstreet-v1.2",
            featureColumns: ["cashFlow", "ecosystemPosition", "capitalIntensity", "governmentContracts", "aiIntegration", "supplyChainImportance", "scientificLeadership"],
            parameters: modelFamily === "KMeans" ? { n_clusters: 3, init: "k-means++" } : { eps: 15.0, min_samples: 2 },
            trainingWindow: { start: "2026-01-01", end: "2026-07-12" },
            generatedAt: timestamp,
            sourceVectorIds: ["SOXX", "XSD", "LIN", "AMAT", "NVDA", "GOOG", "QTUM", "WQTM", "IONQ", "RGTI"],
            findings: [
              {
                title: `Optimized Cluster Assignment: Heavy Hardware Rails (${modelFamily})`,
                description: `cuML ${modelFamily} isolated physical semiconductor and materials foundries with extremely high cash-flow resilience and supply-chain criticalities.`,
                metricLabel: "Group Cohesion Ratio",
                metricValue: "91.2%"
              },
              {
                title: "Optimized Cluster Assignment: Orchestration & AI",
                description: "Contains software wrappers, high AI integration, and secondary compiler nodes.",
                metricLabel: "Silhouette Metric",
                metricValue: "0.76"
              }
            ]
          };
        } else if (modelFamily === "PCA") {
          newJob = {
            analysisId: jobId,
            analysisType: "dimensionality_reduction",
            modelName: "PCA",
            modelVersion: "26.06.2",
            vectorSchemaVersion: "wallstreet-v1.2",
            featureColumns: ["cashFlow", "ecosystemPosition", "capitalIntensity", "governmentContracts", "aiIntegration", "supplyChainImportance", "scientificLeadership"],
            parameters: { n_components: 2, whiten: true },
            trainingWindow: { start: "2026-01-01", end: "2026-07-12" },
            generatedAt: timestamp,
            sourceVectorIds: ["SOXX", "XSD", "LIN", "AMAT", "NVDA", "GOOG", "QTUM", "WQTM", "IONQ", "RGTI"],
            findings: [
              {
                title: "Dimensional Reduction Map Generated",
                description: "Compressed 7 dimensions to a 2D Euclidean coordinate system. Tickers are spaced out according to functional geometry.",
                metricLabel: "Total Explained Variance",
                metricValue: "83.9%"
              }
            ]
          };
        } else if (modelFamily === "IsolationForest") {
          newJob = {
            analysisId: jobId,
            analysisType: "anomaly_detection",
            modelName: "IsolationForest",
            modelVersion: "26.06.0",
            vectorSchemaVersion: "wallstreet-v1.2",
            featureColumns: ["cashFlow", "ecosystemPosition", "capitalIntensity", "confidenceScore"],
            parameters: { contamination: 0.15 },
            trainingWindow: { start: "2026-01-01", end: "2026-07-12" },
            generatedAt: timestamp,
            sourceVectorIds: ["SOXX", "XSD", "LIN", "AMAT", "NVDA", "GOOG", "QTUM", "WQTM", "IONQ", "RGTI"],
            findings: [
              {
                title: "ANOMALY DETECTED: Pre-revenue Quantum Incongruence",
                description: "IONQ is flagging as a statistical outlier. Confidence score remains moderate (41%) while cash flow generation is extremely low (20) compared to scientific leadership.",
                metricLabel: "Anomaly Score (F1-bounds)",
                metricValue: "0.82",
                severity: "anomaly",
                supportingData: "Model detected abrupt deviation from standard Cluster 2 bounds."
              }
            ]
          };
        } else {
          newJob = {
            analysisId: jobId,
            analysisType: "regression",
            modelName: "LinearRegression",
            modelVersion: "26.06.1",
            vectorSchemaVersion: "wallstreet-v1.2",
            featureColumns: ["ecosystemPosition", "governmentContracts", "aiIntegration", "supplyChainImportance"],
            parameters: { fit_intercept: true },
            trainingWindow: { start: "2026-01-01", end: "2026-07-12" },
            generatedAt: timestamp,
            sourceVectorIds: ["SOXX", "XSD", "LIN", "AMAT", "NVDA", "GOOG", "QTUM", "WQTM", "IONQ", "RGTI"],
            findings: [
              {
                title: "Ecosystem Position vs Revenue Durability",
                description: "Ecosystem Position carries the highest positive regression coefficient (beta = 0.44).",
                metricLabel: "R-Squared Value",
                metricValue: "0.892"
              }
            ]
          };
        }

        setAnalysisJobs(prev => [newJob, ...prev]);
        setSelectedJobId(jobId);
        setCumlGpuConsole(prev => [
          ...prev,
          `[Success] cuML fit finished successfully in 0.045 ms.`,
          `[Ledger] Registered reproducible Analytical Run: ${jobId}.`,
          `[Findings] Findings generated and sent to Findings Ledger.`
        ]);
        setCumlGpuRunning(false);
        clearInterval(interval);
      }
    }, 500);
  };

  // Run Primitive simulation
  const runPrimitive = () => {
    setIsExecutingPrimitive(true);
    const prims = {
      pairwise_distance: [
        `[CUDA Launch] Grid layout <<<16, 64>>> (1024 threads dispatched)`,
        `[RAFT Kernel] Instantiating raft::distance::pairwise_distance (Metric: Cosine)`,
        `[Device Mem] Pinned Arrow DataFrame pointer mapped at GPU device address 0x7f3a8b00`,
        `[Compute] Loading row vectors from cuDF Arrow buffer (10 elements, 7 dimensions)...`,
        `[Compute] Parallel thread block sync complete. Executing distance calculation...`,
        `[RAFT Output] 10x10 Distance Tensor created (Device: 0x7f3a9c00, Host mapped).`,
        `[Device Mem] Freeing local scratch space. Execution complete in 0.012 ms.`
      ],
      kmeans: [
        `[CUDA Launch] Grid layout <<<8, 128>>> (1024 threads)`,
        `[RAFT Kernel] raft::cluster::kmeans::fit (K: 3, Max Iterations: 100, Tolerance: 1e-4)`,
        `[Device Mem] Memory allocated for 3 centroids (7 dimensions each).`,
        `[Compute] Iteration 1: Centroid Delta = 1.4820`,
        `[Compute] Iteration 2: Centroid Delta = 0.2201`,
        `[Compute] Iteration 3: Centroid Delta = 0.0000 (Converged in 3 iterations)`,
        `[RAFT Output] Assigned 10 row vectors to 3 cluster centroids successfully.`,
        `[Device Mem] Memory synchronized with Host DataFrame buffer.`
      ],
      csr_matrix: [
        `[CUDA Launch] Grid layout <<<4, 32>>> (128 threads)`,
        `[RAFT Kernel] raft::matrix::dense_to_csr (10 nodes, 15 relational edges)`,
        `[Device Mem] Allocating arrays: RowPtr (11 elements), ColIdx (15 elements), Val (15 elements)`,
        `[Compute] Extracting sparse indices...`,
        `[Compute] Row-Pointer compression bounds verified. Edge map populated.`,
        `[RAFT Output] Compressed Sparse Row representation completed successfully.`,
        `[Device Mem] Buffer registered under Arrow Device Allocator.`
      ],
      knn: [
        `[CUDA Launch] Grid layout <<<32, 32>>> (1024 threads)`,
        `[RAFT Kernel] raft::neighbors::knn::brute_force_fit (Metric: L2 Euclidean, K: 3)`,
        `[Device Mem] Query buffer mapped. Database contains 10 target vectors.`,
        `[Compute] Dispatched dynamic distance calculation matrix sweeps...`,
        `[Compute] Dynamic bitonic sorting network executed on 10 element rows.`,
        `[RAFT Output] Extracted 3 nearest neighbors indices for all query points.`,
        `[Device Mem] Execution latency: 0.008 ms.`
      ]
    };

    setPrimitiveLogs((prev) => [
      ...prev,
      `--- EXECUTING ${selectedPrimitive.toUpperCase()} PRIMITIVE ---`,
      `[Device Control] Pinning Arrow CPU buffer bounds (${arrowBufferBytes} bytes)`
    ]);

    let logIndex = 0;
    const interval = setInterval(() => {
      const activePrims = prims[selectedPrimitive as keyof typeof prims];
      if (logIndex < activePrims.length) {
        setPrimitiveLogs((prev) => [...prev, activePrims[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
        setIsExecutingPrimitive(false);
        setPrimitiveLogs((prev) => [...prev, `[Device Control] Kernel completed successfully. 🐾`, ""]);
      }
    }, 250);
  };

  // Deterministic coordinate calculator for systems-thinking visual layout
  const getDeterministicCoords = (nodeId: string, nodeType: string) => {
    // 4 structured layout columns (physical capital & policy support flow left to right)
    let col = 0;
    let idx = 0;
    let totalInCol = 1;

    const col0 = [
      "gov:CHIPS", "gov:NQI", "gov:DARPA_ONISQ", "gov:DOE_QNEXT",
      "research:MIT_LL", "research:LBNL", "research:SQMS", "research:ORNL"
    ];
    const col1 = [
      "material:LIN", "supplier:ASML", "supplier:AMAT", "supplier:TSMC", "supplier:COHR"
    ];
    const col2 = [
      "company:NVDA", "company:MSFT", "company:AMZN", "company:GOOGL", "company:EQIX",
      "company:IONQ", "company:RGTI", "company:QBTS", "company:HON", "company:PSI"
    ];
    const col3 = [
      "etf:QTUM", "etf:WQTM", "etf:SOXX"
    ];

    if (col0.includes(nodeId)) {
      col = 0;
      idx = col0.indexOf(nodeId);
      totalInCol = col0.length;
    } else if (col1.includes(nodeId)) {
      col = 1;
      idx = col1.indexOf(nodeId);
      totalInCol = col1.length;
    } else if (col2.includes(nodeId)) {
      col = 2;
      idx = col2.indexOf(nodeId);
      totalInCol = col2.length;
    } else if (col3.includes(nodeId)) {
      col = 3;
      idx = col3.indexOf(nodeId);
      totalInCol = col3.length;
    } else {
      // Handle dynamically registered nodes cleanly
      col = 2; 
      // Place at the end of col2
      idx = 10;
      totalInCol = 11;
    }

    const x = 12 + col * 25.3; // beautifully spans from 12% to 88%
    
    // Distribute Y values between 15% and 88%
    const startY = 15;
    const endY = 88;
    const heightSpan = endY - startY;
    const step = totalInCol > 1 ? heightSpan / (totalInCol - 1) : 0;
    const y = startY + idx * step;

    return { x, y };
  };

  // Node type visual definitions
  const getNodeColor = (type: string, isSelected: boolean) => {
    switch (type) {
      case "company":
        return isSelected ? "bg-cyan-950/85 border-cyan-400 text-cyan-300" : "bg-slate-900/95 border-slate-800 text-slate-300 hover:border-slate-600";
      case "etf":
        return isSelected ? "bg-emerald-950/85 border-emerald-400 text-emerald-300" : "bg-slate-900/95 border-slate-800 text-slate-300 hover:border-slate-600";
      case "government-programme":
        return isSelected ? "bg-amber-950/85 border-amber-400 text-amber-300" : "bg-slate-900/95 border-slate-800 text-slate-300 hover:border-slate-600";
      case "research-institution":
        return isSelected ? "bg-violet-950/85 border-violet-400 text-violet-300" : "bg-slate-900/95 border-slate-800 text-slate-300 hover:border-slate-600";
      case "material":
        return isSelected ? "bg-orange-950/85 border-orange-400 text-orange-300" : "bg-slate-900/95 border-slate-800 text-slate-300 hover:border-slate-600";
      case "supplier":
        return isSelected ? "bg-blue-950/85 border-blue-400 text-blue-300" : "bg-slate-900/95 border-slate-800 text-slate-300 hover:border-slate-600";
      default:
        return isSelected ? "bg-slate-850/85 border-white text-white" : "bg-slate-900/95 border-slate-800 text-slate-300 hover:border-slate-600";
    }
  };

  const getEdgeStrokeColor = (type: string, isPath: boolean) => {
    if (isPath) return "#06b6d4"; // glowing cyan path
    switch (type) {
      case "HOLDS":
        return "#10b981"; // emerald
      case "SUPPLIES":
        return "#3b82f6"; // blue
      case "FUNDS":
        return "#f59e0b"; // gold
      case "PARTNERS_WITH":
        return "#8b5cf6"; // violet
      case "REQUIRES":
        return "#ef4444"; // rose
      default:
        return "#64748b"; // slate
    }
  };

  // Compute live KNN similarity for cuML high-dimensional feature matching
  const getKnnNeighbors = (targetSym: string) => {
    const target = INITIAL_RAPIDS_DATA.find((r) => r.ticker === targetSym);
    if (!target) return [];

    const features = [
      "cashFlow", "ecosystemPosition", "capitalIntensity",
      "governmentContracts", "aiIntegration", "supplyChainImportance", "scientificLeadership"
    ] as const;

    const scores = INITIAL_RAPIDS_DATA
      .filter((r) => r.ticker !== targetSym)
      .map((r) => {
        let sumSq = 0;
        features.forEach((f) => {
          const diff = (target[f] || 0) - (r[f] || 0);
          sumSq += diff * diff;
        });
        const dist = Math.sqrt(sumSq);
        // Max theoretical distance across 7 normalized dimensions is sqrt(7 * 100^2) ~ 264.57
        const maxDist = Math.sqrt(7 * 100 * 100);
        const similarity = Math.max(0, Math.min(100, Math.round((1 - dist / maxDist) * 100)));
        return {
          ticker: r.ticker,
          name: r.name,
          classification: r.classification,
          similarity
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    return scores;
  };

  // Handle capital allocation injection from dataframe
  const allocateCapitalFromRow = (sym: string) => {
    setAllocation((prev) => {
      const current = prev[sym] || 0;
      const next = current + 5;
      return { ...prev, [sym]: next };
    });
    setPrimitiveLogs((prev) => [
      ...prev,
      `[Ledger] Allocated +5% capital to ${sym}. Triggering Pathfinder index reweighting.`
    ]);
  };

  return (
    <div className="col-span-12 flex flex-col space-y-4" id="rapids-lens-module">
      {/* 1. MODULE SUB-NAVBAR */}
      <div className="bg-[#060a12]/90 border border-slate-800/80 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Pathfinder Substrate — GPU-Native Workspace</h3>
            <p className="text-[10px] text-slate-400">RAPIDS Arrow-accelerated vector analysis and 7-layer structural routing.</p>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="flex flex-wrap items-center gap-1.5" id="rapids-subtabs">
          <button
            onClick={() => setActiveSubTab("evidence_frame")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all flex items-center space-x-1 font-mono ${activeSubTab === "evidence_frame" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40" : "bg-slate-950/80 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>EvidenceFrame Spec</span>
          </button>
          <button
            onClick={() => setActiveSubTab("cudf")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all flex items-center space-x-1 font-mono ${activeSubTab === "cudf" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40" : "bg-slate-950/80 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Grid className="w-3 h-3 text-cyan-500" />
            <span>cuDF Data</span>
          </button>
          <button
            onClick={() => setActiveSubTab("cuml")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all flex items-center space-x-1 font-mono ${activeSubTab === "cuml" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40" : "bg-slate-950/80 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Cpu className="w-3 h-3 text-indigo-500" />
            <span>cuML Clusters</span>
          </button>
          <button
            onClick={() => setActiveSubTab("cugraph")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all flex items-center space-x-1 font-mono ${activeSubTab === "cugraph" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40" : "bg-slate-950/80 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Globe className="w-3 h-3 text-emerald-500" />
            <span>Pathfinder Graph Lens</span>
          </button>
          <button
            onClick={() => setActiveSubTab("raft")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all flex items-center space-x-1 font-mono ${activeSubTab === "raft" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40" : "bg-slate-950/80 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>RAFT Kernels</span>
          </button>
          <button
            onClick={() => setActiveSubTab("roadmap")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all flex items-center space-x-1 font-mono ${activeSubTab === "roadmap" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 animate-pulse" : "bg-slate-950/80 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Layers className="w-3 h-3 text-rose-500" />
            <span>7-Layer Stack</span>
          </button>
          <button
            onClick={() => setActiveSubTab("rmm")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all flex items-center space-x-1 font-mono ${activeSubTab === "rmm" ? "bg-amber-500/10 text-amber-400 border-amber-500/40 animate-pulse" : "bg-slate-950/80 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>RMM Discipline</span>
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* 1.5 SUB-TAB: EVIDENCE_FRAME SPECIFICATION & SANDBOX */}
      {/* ========================================== */}
      {activeSubTab === "evidence_frame" && (
        <div className="space-y-4 animate-fade-in" id="subtab-evidence-frame">
          {/* Banner */}
          <div className="bg-[#0b111e] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max">
                The Canonical Substrate Core
              </span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                Universal EvidenceFrame™ Specification & Sandbox (v1.0-alpha)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                The DataFrame is no longer the destination—it is the substrate. By defining a rigorous, multi-dimensional, append-only contract, the same GPU-native engine analyzes Wall Street equities, quantum coherent QPUs, music timbre profiles, or gastronomy compounds.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-right shrink-0">
              <span className="text-[9px] text-slate-500 block uppercase font-mono">Contract Integrity</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">APPEND-ONLY SECURE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT COLUMN: APERTURE SELECTOR & DATAFRAME VIEW */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              
              {/* Aperture Selector Controls */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono shrink-0">
                  Select Active Aperture:
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {(["finance", "music", "quantum", "culinary", "clinical"] as const).map((ap) => {
                    const apLabels: Record<string, { label: string; color: string; bg: string }> = {
                      finance: { label: "Wall Street (Finance)", color: "text-blue-400 border-blue-500/40", bg: "bg-blue-500/10" },
                      music: { label: "Acoustic Sync (Music)", color: "text-pink-400 border-pink-500/40", bg: "bg-pink-500/10" },
                      quantum: { label: "Qubit Modality (Quantum)", color: "text-purple-400 border-purple-500/40", bg: "bg-purple-500/10" },
                      culinary: { label: "Umami Synthesis (Culinary)", color: "text-amber-400 border-amber-500/40", bg: "bg-amber-500/10" },
                      clinical: { label: "Exome Profile (Clinical)", color: "text-emerald-400 border-emerald-500/40", bg: "bg-emerald-500/10" }
                    };
                    const meta = apLabels[ap];
                    const isActive = selectedAperture === ap;
                    return (
                      <button
                        key={ap}
                        onClick={() => setSelectedAperture(ap)}
                        className={`px-2 py-1 text-[10px] font-bold rounded border transition-all font-mono ${isActive ? `${meta.bg} ${meta.color}` : "bg-slate-900 text-slate-400 border-slate-850 hover:text-white"}`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic cuDF Arrow DataFrame Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-3 bg-slate-900/40 border-b border-slate-900 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Grid className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Computed cuDF Evidence DataFrame: {selectedAperture.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-850 px-1.5 py-0.5 rounded font-mono">
                    Schema v1.0.0-alpha
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono text-[9px] uppercase">
                        <th className="p-2.5 pl-4">ID</th>
                        <th className="p-2.5">Subject Description</th>
                        <th className="p-2.5">Category</th>
                        {Object.keys(APERTURES_DATA[selectedAperture][0].metrics).map((mKey) => (
                          <th key={mKey} className="p-2.5 text-center">{mKey}</th>
                        ))}
                        <th className="p-2.5 text-right pr-4 text-emerald-400">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-mono text-[11px]">
                      {APERTURES_DATA[selectedAperture].map((row) => {
                        const isRowSelected = selectedApertureRowId === row.id;
                        return (
                          <tr
                            key={row.id}
                            onClick={() => setSelectedApertureRowId(row.id)}
                            className={`cursor-pointer transition-colors ${isRowSelected ? "bg-cyan-950/20 text-cyan-300 border-l-2 border-l-cyan-400 font-semibold" : "hover:bg-slate-900/30 text-slate-300"}`}
                          >
                            <td className="p-2.5 pl-4 font-bold">{row.id}</td>
                            <td className="p-2.5 font-sans text-xs text-white max-w-[150px] truncate">{row.name}</td>
                            <td className="p-2.5 text-slate-400">{row.classification}</td>
                            {Object.keys(row.metrics).map((mKey) => (
                              <td key={mKey} className="p-2.5 text-center font-mono font-medium">
                                {row.metrics[mKey]}
                              </td>
                            ))}
                            <td className="p-2.5 text-right pr-4 font-bold text-emerald-400">
                              {row.confidence}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* cuDF GPU Simulation Panel */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-cyan-400 uppercase font-mono tracking-widest block">
                      Substrate Co-processor sandbox
                    </span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      cuDF Column-wise Join Engine
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      By isolating the multidimensional column values inside continuous device memory, cuDF bypasses raw CPU latency constraints, running at close to 0.003 ms.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850 text-[10px] font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Arrow Memory Bounds:</span>
                      <span className="text-emerald-400">0x7fa28c0a00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Host Vector Buffer:</span>
                      <span className="text-slate-300">Zero-copy pinned</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setGpuSimulating(true);
                      setGpuSimLog([
                        `[GPU Device] Compiling EvidenceFrame contract for aperture: ${selectedAperture.toUpperCase()}...`,
                        `[Schema Compiler] Verified required columns: [id, name, classification, metrics, observations, evidenceBindings, confidence, timestamp].`,
                        `[Arrow IPC] Zero-copy pinning initialized for Host memory buffer (1,072 bytes).`
                      ]);
                      
                      let step = 0;
                      const interval = setInterval(() => {
                        step++;
                        if (step === 1) {
                          setGpuSimLog(prev => [
                            ...prev,
                            `[CUDA Launch] Dispatched 16 CUDA blocks with 512 threads per block.`,
                            `[GPU Device] Executing parallel column scan across 7 dimensional arrays.`
                          ]);
                        } else if (step === 2) {
                          const mockArray = "0x7fa2" + Math.floor(100000 + Math.random() * 900000).toString(16);
                          setGpuSimLog(prev => [
                            ...prev,
                            `[GPU Device] Column scan complete. High-dimensional vector joins completed in 0.003 ms.`,
                            `[Memory] GPU Device Array registered at address: ${mockArray}.`,
                            `[Substrate] EvidenceFrame substrate successfully mapped.`
                          ]);
                          setGpuSimulating(false);
                          clearInterval(interval);
                        }
                      }, 500);
                    }}
                    disabled={gpuSimulating}
                    className="w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded text-xs font-mono font-bold uppercase flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${gpuSimulating ? "animate-spin" : ""}`} />
                    <span>Run cuDF Column Scan</span>
                  </button>
                </div>

                <div className="md:col-span-7 flex flex-col">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5">
                    GPU CUDA Kernel Console
                  </div>
                  <div className="flex-1 bg-black rounded-lg border border-slate-900 p-3 h-[180px] overflow-y-auto font-mono text-[10px] text-emerald-400/90 space-y-1">
                    {gpuSimLog.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CONTRACT DETAILS FOCUS PANEL */}
            <div className="lg:col-span-4 bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between">
              {(() => {
                const activeRow =
                  APERTURES_DATA[selectedAperture].find((r) => r.id === selectedApertureRowId) ||
                  APERTURES_DATA[selectedAperture][0];

                return (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="border-b border-slate-900 pb-2">
                      <span className="text-[9px] bg-slate-900 text-cyan-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider block w-max mb-1.5">
                        Selected Row Contract Focus
                      </span>
                      <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">
                        {activeRow.id} — {activeRow.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Registered: {activeRow.timestamp} (v{activeRow.schemaVersion})
                      </p>
                    </div>

                    {/* Specification focus navigation */}
                    <div className="flex border-b border-slate-900 pb-1.5 gap-2" id="spec-tabs">
                      {(["columns", "semantics", "provenance", "json"] as const).map((vt) => {
                        const vtLabels: Record<string, string> = {
                          columns: "Required Fields",
                          semantics: "Evidence Bind",
                          provenance: "Observations",
                          json: "Raw JSON"
                        };
                        const isActive = activeSpecView === vt;
                        return (
                          <button
                            key={vt}
                            onClick={() => setActiveSpecView(vt)}
                            className={`text-[9px] font-mono font-bold uppercase tracking-tighter transition-all ${isActive ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                          >
                            {vtLabels[vt]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Spec Tab Contents */}
                    <div className="min-h-[220px]">
                      {activeSpecView === "columns" && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Under the canonical EvidenceFrame contract, all records must expose fixed primary columns for relational interoperability.
                          </p>

                          <div className="space-y-2 text-[10.5px] font-mono text-slate-300">
                            <div className="bg-slate-900/60 p-2 rounded border border-slate-850">
                              <span className="text-cyan-400 font-bold block">id</span>
                              <p className="text-[10px] text-slate-500 leading-relaxed">Primary key. Unique hash or identifier (e.g., "{activeRow.id}").</p>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded border border-slate-850">
                              <span className="text-cyan-400 font-bold block">subject_descriptor</span>
                              <p className="text-[10px] text-slate-500 leading-relaxed">Common name assigned to vector element (e.g., "{activeRow.name}").</p>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded border border-slate-850">
                              <span className="text-cyan-400 font-bold block">class_taxonomic</span>
                              <p className="text-[10px] text-slate-500 leading-relaxed">Unified taxonomic category mapping (e.g., "{activeRow.classification}").</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSpecView === "semantics" && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Every raw observation registers a pattern and potential contradiction, triggering the Delta Layer validation state automatically.
                          </p>

                          <div className="space-y-2 text-[10.5px] font-mono">
                            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850 text-slate-300 leading-relaxed">
                              <span className="text-purple-400 font-bold block text-[9px] uppercase tracking-wider">
                                MAPPED EVIDENCE PATTERN:
                              </span>
                              "{activeRow.evidenceBindings.pattern}"
                            </div>

                            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850 text-slate-300 leading-relaxed">
                              <span className="text-rose-400 font-bold block text-[9px] uppercase tracking-wider">
                                CONTRADICTION TRIGGER (JEMMA PROBE):
                              </span>
                              "{activeRow.evidenceBindings.contradicts}"
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSpecView === "provenance" && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Observations represent the immutable raw source of truth behind high-dimensional vector representations.
                          </p>

                          <div className="space-y-2">
                            {activeRow.observations.map((obs, oIdx) => (
                              <div key={oIdx} className="bg-slate-900/60 p-2.5 rounded border border-slate-850 text-xs text-slate-300 leading-relaxed">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">
                                  Observation Signal #{oIdx + 1}
                                </span>
                                {obs}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeSpecView === "json" && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Canonical schema serialization format ready for Apache Arrow stream serialization.
                          </p>
                          <pre className="bg-[#03060b] text-[9.5px] text-amber-300/90 font-mono rounded-lg border border-slate-900 p-2.5 overflow-x-auto max-h-[180px]">
                            {JSON.stringify(activeRow, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#0a1220]/50 border border-slate-900 p-3 rounded-lg text-[10.5px] text-slate-400 leading-relaxed mt-4">
                      <span className="font-bold text-cyan-400 block mb-0.5">🐾 Spec Constraint Assertions</span>
                      This row complies fully with schema version v1.0-alpha. Modification attempts trigger immediate signature mismatch faults, ensuring total data provenance.
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. SUB-TAB: CUDF - ACCELERATED VECTOR GRID */}
      {/* ========================================== */}
      {activeSubTab === "cudf" && (
        <div className="space-y-4" id="subtab-cudf">
          {/* Banner */}
          <div className="bg-[#0b111e] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max mb-1.5">Layer 1: Apache Arrow DataFrame</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">GPU-Accelerated Columnar cuDF Matrix</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                By loading unstructured signals into structured column vectors, we completely bypass traditional CPU row-bound latency bottlenecks. In GPU acceleration mode, multi-million element arrays are processed concurrently using parallel CUDA blocks.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-right shrink-0">
              <span className="text-[9px] text-slate-500 block uppercase font-mono">Arrow Buffer Memory</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">{(arrowBufferBytes / 1024 / 1024).toFixed(3)} MB</span>
            </div>
          </div>

          {/* Metric Weights Controls */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
              <div className="flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Dynamic Vector Weights</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Modulates high-dimensional cosine calculations</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(rapidsWeights).map(([metric, val]) => {
                const numericVal = val as number;
                return (
                  <div key={metric} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
                      <span className="truncate">{metric.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-bold text-cyan-400 font-mono">x{numericVal.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.1"
                      value={numericVal}
                      onChange={(e) => {
                        setRapidsWeights((prev) => ({ ...prev, [metric]: parseFloat(e.target.value) }));
                        triggerRecalculate();
                      }}
                      className="w-full h-1 bg-slate-850 rounded appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* DataFrame table */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 bg-slate-900/40 border-b border-slate-900 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Grid className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-display">cuDF Vector Grid Rankings</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isComputing ? (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Re-scoring CUDA Kernel...</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400">
                      ● Columnar Kernel Idle (latency: {computeTime.toFixed(3)} ms)
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono text-[9px] uppercase">
                      <th className="p-2.5 pl-4">Rank</th>
                      <th className="p-2.5">Ticker</th>
                      <th className="p-2.5">Classification</th>
                      <th className="p-2.5 text-center">Cash Flow</th>
                      <th className="p-2.5 text-center">Ecosystem Pos</th>
                      <th className="p-2.5 text-center">Capital Int</th>
                      <th className="p-2.5 text-center">Gov Contracts</th>
                      <th className="p-2.5 text-center">AI Integration</th>
                      <th className="p-2.5 text-center">Supply Chain</th>
                      <th className="p-2.5 text-right pr-4 text-cyan-400 font-bold">cuDF Score</th>
                      <th className="p-2.5 text-center pr-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono text-[11px]">
                    {getSortedVectors().map((row, idx) => (
                      <tr key={row.ticker} className={`hover:bg-slate-900/40 transition-colors ${isComputing ? "opacity-60 animate-pulse" : ""}`}>
                        <td className="p-2.5 pl-4 text-slate-500">#{idx+1}</td>
                        <td className="p-2.5 font-bold text-white">
                          <span className="border-b border-dotted border-cyan-500/40 hover:text-cyan-300 cursor-pointer">
                            {row.ticker}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400">{row.classification}</td>
                        <td className="p-2.5 text-center">{row.cashFlow}</td>
                        <td className="p-2.5 text-center">{row.ecosystemPosition}</td>
                        <td className="p-2.5 text-center text-amber-500">{row.capitalIntensity}</td>
                        <td className="p-2.5 text-center">{row.governmentContracts}</td>
                        <td className="p-2.5 text-center">{row.aiIntegration}</td>
                        <td className="p-2.5 text-center">{row.supplyChainImportance}</td>
                        <td className="p-2.5 text-right pr-4 font-bold text-cyan-400">
                          {row.rapidsScore}/100
                        </td>
                        <td className="p-2.5 text-center pr-3">
                          <button
                            onClick={() => allocateCapitalFromRow(row.ticker)}
                            className="px-1.5 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 rounded text-[9px] tracking-tight transition-all uppercase font-semibold"
                          >
                            +5% Alloc
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GPU Accelerations telemetry */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-full">
                <div>
                  <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Device Telemetry</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${gpuActive ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : "bg-slate-900 text-slate-500"}`}>
                      {gpuActive ? "ACTIVE" : "OFFLINE"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-sans">CUDA Compute Device:</span>
                      <span className="font-mono text-cyan-300 font-semibold">NVIDIA H100 Tensor Core</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-slate-900/60 p-2 rounded border border-slate-850">
                        <span className="text-slate-500 block uppercase text-[9px]">Dispatched Blocks</span>
                        <span className="text-slate-200 font-semibold">16 Grid Blocks</span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded border border-slate-850">
                        <span className="text-slate-500 block uppercase text-[9px]">Threads per Block</span>
                        <span className="text-slate-200 font-semibold">{activeCudaThreads} Threads</span>
                      </div>
                    </div>

                    <div className="bg-[#050911] p-3 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>cudaMemoryAlloc:</span>
                        <span className="text-emerald-400">0x7fa281c00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>cuDF IPC Pointer:</span>
                        <span className="text-cyan-400">arrow::ipc::ZeroCopy</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DataFrame Host latency:</span>
                        <span>0.042 ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400 font-sans">Active Thread Multiplier:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{activeCudaThreads}x</span>
                  </div>
                  <input
                    type="range"
                    min="128"
                    max="4096"
                    step="128"
                    value={activeCudaThreads}
                    onChange={(e) => setActiveCudaThreads(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500 mb-3"
                  />

                  <button
                    onClick={triggerRecalculate}
                    className="w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/80 rounded text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center space-x-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isComputing ? "animate-spin" : ""}`} />
                    <span>Run cuDF Column Scan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. SUB-TAB: CUML - MACHINE LEARNING CLUSTERS */}
      {/* ========================================== */}
      {activeSubTab === "cuml" && (
        <div className="space-y-4" id="subtab-cuml">
          {/* Header Banner following the Wall Street Doctrine */}
          <div className="bg-[#0b111e] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max mb-1.5">
                Layer 2: GPU-Accelerated Machine Learning
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                cuML Analytical Engine & Ledger
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                <strong className="text-indigo-400">Doctrine Constraint:</strong> cuML produces findings, not authority.
                It never quietly converts statistical correlation into trade instructions. Instead, high-dimensional company vectors
                are mapped into Euclidean space to discover clusters, test relationships, and isolate structural anomalies.
              </p>
            </div>
            <div className="text-[11px] font-mono text-indigo-400 border border-indigo-900/60 bg-indigo-950/20 px-3 py-1.5 rounded-lg shrink-0">
              CUDA Version: <span className="text-white">12.2</span> | SDK: <span className="text-white">cuML 26.06.2</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Module: Main ML Substrates & Navigations */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between">
              
              {/* Internal ML Nav */}
              <div className="bg-slate-900/40 border-b border-slate-900 p-3 flex flex-wrap gap-1 items-center justify-between">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveCumlView("findings")}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                      activeCumlView === "findings"
                        ? "bg-indigo-950 border border-indigo-800 text-indigo-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📊 Findings & Map
                  </button>
                  <button
                    onClick={() => setActiveCumlView("jobs")}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                      activeCumlView === "jobs"
                        ? "bg-indigo-950 border border-indigo-800 text-indigo-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📜 Analytical Ledger ({analysisJobs.length})
                  </button>
                  <button
                    onClick={() => setActiveCumlView("anomalies")}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                      activeCumlView === "anomalies"
                        ? "bg-indigo-950 border border-indigo-800 text-indigo-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ⚠️ Anomaly Tracker
                  </button>
                  <button
                    onClick={() => setActiveCumlView("contract")}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                      activeCumlView === "contract"
                        ? "bg-indigo-950 border border-indigo-800 text-indigo-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🔒 RAPIDS Contract
                  </button>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
                  Findings Ledger Substrate
                </span>
              </div>

              {/* View Rendering */}
              <div className="p-4 flex-1">
                
                {/* 1. FINDINGS & MAP */}
                {activeCumlView === "findings" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Interactive PCA 2D Canvas */}
                      <div className="md:col-span-7 bg-[#050911]/80 border border-slate-900 p-3 rounded-lg">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                          <span className="text-xs font-bold text-white uppercase font-display flex items-center space-x-1.5">
                            <Grid className="w-3.5 h-3.5 text-cyan-400" />
                            <span>cuML PCA Dimensionality Reduction (PC1 vs PC2)</span>
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400">Total Variance: 82.7%</span>
                        </div>

                        {/* Scatter Plot SVG */}
                        <div className="relative bg-[#020408] border border-slate-900 rounded h-[240px] flex items-center justify-center overflow-hidden">
                          {/* Grid Lines */}
                          <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 pointer-events-none opacity-[0.03]">
                            {[...Array(25)].map((_, i) => (
                              <div key={i} className="border border-slate-500" />
                            ))}
                          </div>

                          {/* SVG Canvas */}
                          <svg className="w-full h-full p-4 absolute inset-0 z-10">
                            {/* Connector line from active node to its nearest neighbors */}
                            {(() => {
                              const source = {
                                NVDA: { x: "80%", y: "25%" },
                                LIN: { x: "85%", y: "70%" },
                                AMAT: { x: "75%", y: "60%" },
                                SOXX: { x: "70%", y: "35%" },
                                GOOG: { x: "50%", y: "20%" },
                                XSD: { x: "55%", y: "40%" },
                                QTUM: { x: "35%", y: "55%" },
                                WQTM: { x: "30%", y: "50%" },
                                IONQ: { x: "15%", y: "75%" },
                                RGTI: { x: "10%", y: "85%" }
                              }[selectedKnnTicker] || { x: "80%", y: "25%" };

                              // Compute similarity coordinates for some static targets
                              return (
                                <>
                                  {/* Render standard rings for clusters */}
                                  <circle cx="75%" cy="35%" r="45" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3" className="opacity-20 animate-pulse" />
                                  <circle cx="45%" cy="40%" r="35" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="3" className="opacity-20" />
                                  <circle cx="15%" cy="80%" r="25" fill="none" stroke="#ec4899" strokeWidth="1" strokeDasharray="3" className="opacity-20" />
                                </>
                              );
                            })()}

                            {/* Render interactive PCA scatter points */}
                            {[
                              { ticker: "NVDA", cx: "80%", cy: "25%", color: "#22c55e", cluster: "Cluster 0: Systemic Compute" },
                              { ticker: "SOXX", cx: "70%", cy: "35%", color: "#22c55e", cluster: "Cluster 0: Systemic Compute" },
                              { ticker: "XSD", cx: "55%", cy: "40%", color: "#22c55e", cluster: "Cluster 0: Systemic Compute" },
                              { ticker: "LIN", cx: "85%", cy: "70%", color: "#06b6d4", cluster: "Cluster 0: Systemic Materials" },
                              { ticker: "AMAT", cx: "75%", cy: "60%", color: "#06b6d4", cluster: "Cluster 0: Systemic Materials" },
                              { ticker: "GOOG", cx: "50%", cy: "20%", color: "#6366f1", cluster: "Cluster 1: Cloud & Orchestration" },
                              { ticker: "QTUM", cx: "35%", cy: "55%", color: "#6366f1", cluster: "Cluster 1: Cloud & Orchestration" },
                              { ticker: "WQTM", cx: "30%", cy: "50%", color: "#6366f1", cluster: "Cluster 1: Cloud & Orchestration" },
                              { ticker: "IONQ", cx: "15%", cy: "75%", color: "#ec4899", cluster: "Cluster 2: Spec Quantum" },
                              { ticker: "RGTI", cx: "10%", cy: "85%", color: "#ec4899", cluster: "Cluster 2: Spec Quantum" }
                            ].map((p) => (
                              <g
                                key={p.ticker}
                                className="cursor-pointer group"
                                onClick={() => setSelectedKnnTicker(p.ticker)}
                              >
                                <circle
                                  cx={p.cx}
                                  cy={p.cy}
                                  r={selectedKnnTicker === p.ticker ? "8" : "5"}
                                  fill={p.color}
                                  className={`transition-all duration-300 ${
                                    selectedKnnTicker === p.ticker
                                      ? "stroke-white stroke-2 shadow-lg filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                      : "stroke-slate-950 hover:stroke-slate-300 hover:r-7"
                                  }`}
                                />
                                <text
                                  x={p.cx}
                                  y={p.cy}
                                  dx="10"
                                  dy="4"
                                  fill={selectedKnnTicker === p.ticker ? "#ffffff" : "#64748b"}
                                  className={`text-[9px] font-mono select-none font-bold group-hover:fill-white ${
                                    selectedKnnTicker === p.ticker ? "scale-110" : ""
                                  }`}
                                >
                                  {p.ticker}
                                </text>
                              </g>
                            ))}
                          </svg>

                          {/* Axes indicators */}
                          <div className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-500 uppercase">
                            ← Speculation | Cash-Flow Resilience →
                          </div>
                          <div className="absolute top-2 right-2 text-[8px] font-mono text-slate-500 uppercase">
                            ↑ Software / Platform | Physical Bottleneck ↓
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 block mt-1.5">
                          * Click on any ticker node to bind its high-dimensional vector to the focus console.
                        </span>
                      </div>

                      {/* Ticker Details */}
                      <div className="md:col-span-5 bg-[#050911]/80 border border-slate-900 p-3 rounded-lg flex flex-col justify-between">
                        <div>
                          <div className="border-b border-slate-900 pb-2 mb-2 flex justify-between items-center">
                            <span className="text-xs font-bold text-white uppercase font-display">Active Row Vector</span>
                            <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/40">
                              {selectedKnnTicker}
                            </span>
                          </div>

                          {(() => {
                            const activeData = getSortedVectors().find((v) => v.ticker === selectedKnnTicker) || getSortedVectors()[0];
                            return (
                              <div className="space-y-2">
                                <div className="text-[11px] font-sans text-slate-300">
                                  <strong className="text-white">{activeData.name}</strong>
                                  <div className="text-[9px] font-mono text-slate-500">Classification: {activeData.classification}</div>
                                </div>

                                <div className="space-y-1.5 font-mono text-[10px] border-t border-slate-900 pt-2 text-slate-400">
                                  <div className="flex justify-between">
                                    <span>Cash Flow:</span>
                                    <span className="text-emerald-400 font-bold">{activeData.cashFlow}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Ecosystem Position:</span>
                                    <span className="text-cyan-400 font-bold">{activeData.ecosystemPosition}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Capital Intensity:</span>
                                    <span className="text-amber-500 font-bold">{activeData.capitalIntensity}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Gov Contracts:</span>
                                    <span className="text-indigo-400 font-bold">{activeData.governmentContracts}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>AI Integration:</span>
                                    <span className="text-purple-400 font-bold">{activeData.aiIntegration}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Supply Chain Imp:</span>
                                    <span className="text-rose-400 font-bold">{activeData.supplyChainImportance}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Scientific Leadership:</span>
                                    <span className="text-cyan-300 font-bold">{activeData.scientificLeadership}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="bg-indigo-950/20 border border-indigo-900/40 p-2 rounded text-[10px] text-indigo-300 leading-relaxed font-mono">
                          <span className="font-bold text-indigo-400 block uppercase">Ecosytem Vector</span>
                          Euclidean distance is evaluated dynamically against physical supply-chains to locate critical bottleneck cluster hubs.
                        </div>
                      </div>
                    </div>

                    {/* Standardized Findings Block */}
                    <div className="border-t border-slate-900 pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-white uppercase font-display flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Identified Structural Families (Findings Ledger)</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Classification: Standardized Categories</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {analysisJobs.find(j => j.analysisId === "job-001")?.findings.map((f, i) => (
                          <div
                            key={i}
                            className="bg-[#040810] border border-slate-900 p-3 rounded-lg relative overflow-hidden flex flex-col justify-between"
                          >
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/80" />
                            <div>
                              <span className="text-[9px] text-slate-500 font-mono block uppercase mb-1">
                                FAMILY NODE 0{i + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-200 block mb-1">
                                {f.title}
                              </span>
                              <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                                {f.description}
                              </p>
                            </div>
                            <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-[9px] font-mono">
                              <span className="text-slate-500">{f.metricLabel}:</span>
                              <span className="text-indigo-400 font-bold">{f.metricValue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ANALYTICAL LEDGER */}
                {activeCumlView === "jobs" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Left Column: Job Selector */}
                    <div className="md:col-span-5 bg-[#050911]/80 border border-slate-900 rounded-lg p-3 space-y-2 max-h-[340px] overflow-y-auto">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                        Dispatched Runs Ledger
                      </span>
                      {analysisJobs.map((job) => (
                        <div
                          key={job.analysisId}
                          onClick={() => setSelectedJobId(job.analysisId)}
                          className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                            selectedJobId === job.analysisId
                              ? "bg-indigo-950/40 border-indigo-700/80"
                              : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-mono font-bold text-white">
                              {job.analysisId}
                            </span>
                            <span className="text-[9px] font-mono text-indigo-400 px-1 py-0.5 rounded bg-indigo-950/30 border border-indigo-900/30 uppercase">
                              {job.analysisType}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                            <span>Model: {job.modelName}</span>
                            <span className="text-[9px] text-slate-500">{job.generatedAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column: Metadata Contract View */}
                    <div className="md:col-span-7 bg-[#050911]/80 border border-slate-900 rounded-lg p-3 flex flex-col justify-between">
                      {(() => {
                        const job = analysisJobs.find((j) => j.analysisId === setSelectedJobId ? j.analysisId === selectedJobId : true) || analysisJobs[0];
                        if (!job) return <span className="text-xs font-mono text-slate-500">No job selected.</span>;
                        return (
                          <div className="space-y-3 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
                                <span className="text-xs font-bold text-white uppercase font-display">
                                  Reproducibility Spec: {job.analysisId}
                                </span>
                                <span className="text-[9px] font-mono text-emerald-400">
                                  Provenanced Ledger Entry
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mb-3">
                                <div className="bg-slate-950/60 p-2 rounded border border-slate-900">
                                  <span className="text-slate-500 block text-[8px] uppercase">Model Name & Ver</span>
                                  <span className="text-white font-semibold">
                                    {job.modelName} v{job.modelVersion}
                                  </span>
                                </div>
                                <div className="bg-slate-950/60 p-2 rounded border border-slate-900">
                                  <span className="text-slate-500 block text-[8px] uppercase">Vector Schema</span>
                                  <span className="text-cyan-400 font-semibold">
                                    {job.vectorSchemaVersion}
                                  </span>
                                </div>
                              </div>

                              {/* Findings Inside this Job */}
                              <div className="space-y-2">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block">
                                  Ledger Findings
                                </span>
                                {job.findings.map((f, i) => (
                                  <div
                                    key={i}
                                    className="bg-slate-950/60 border border-slate-900 p-2.5 rounded text-[11px] space-y-1"
                                  >
                                    <div className="flex justify-between font-mono">
                                      <strong className="text-indigo-400">{f.title}</strong>
                                      {f.metricLabel && (
                                        <span className="text-[10px] text-emerald-400 font-bold">
                                          {f.metricLabel}: {f.metricValue}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-slate-400 text-[10px] leading-relaxed">
                                      {f.description}
                                    </p>
                                    {f.supportingData && (
                                      <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-1.5 mt-1.5">
                                        Evidence Binding: {f.supportingData}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Raw JSON Spec (collapsible/viewable) */}
                            <div className="mt-4">
                              <span className="text-[9px] text-indigo-400 uppercase font-mono block mb-1">
                                Standardized Ledger Schema (JSON Object)
                              </span>
                              <pre className="bg-black/80 border border-slate-900 p-2 rounded font-mono text-[9px] text-emerald-400 overflow-x-auto max-h-[100px] leading-relaxed">
                                {JSON.stringify(job, null, 2)}
                              </pre>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 3. ANOMALY TRACKER */}
                {activeCumlView === "anomalies" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-xs font-bold text-white uppercase font-display flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span>cuML Outlier & Anomaly Ledger</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Isolation Forest Threshold: Contamination=15%
                      </span>
                    </div>

                    <div className="space-y-3">
                      {analysisJobs
                        .flatMap((j) => j.findings.map((f) => ({ ...f, job: j })))
                        .filter((f) => f.severity === "anomaly")
                        .map((f, idx) => (
                          <div
                            key={idx}
                            className="bg-rose-950/10 border border-rose-950 p-4 rounded-lg space-y-2 relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-[3px] h-full bg-rose-500" />
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] font-mono bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-bold">
                                  ANOMALY DETECTED
                                </span>
                                <span className="text-xs font-mono font-bold text-white">
                                  {f.title}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                Timestamp: {f.job.generatedAt}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                              <strong className="text-white">Reason: </strong> {f.description}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900/60">
                              <div>
                                <span className="text-slate-500">Supporting Metrics:</span>
                                <div className="text-slate-200">
                                  {f.metricLabel}: <span className="text-rose-400 font-bold">{f.metricValue}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500">Evidence Bindings:</span>
                                <div className="text-slate-200 truncate" title={f.supportingData}>
                                  {f.supportingData}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500">Model Spec:</span>
                                <div className="text-slate-200">
                                  {f.job.modelName} v{f.job.modelVersion} (Schema: {f.job.vectorSchemaVersion})
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 4. RAPIDS CONTRACT */}
                {activeCumlView === "contract" && (
                  <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
                    <div className="border-b border-slate-900 pb-2 mb-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase font-display flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>RAPIDS Analysis Contract Specification (v1.2)</span>
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400">REPRODUCIBLE RUNS ONLY</span>
                    </div>

                    <p>
                      To prevent non-deterministic machine learning drift from corrupting the core world model thesis, all cuML output entering the
                      <strong className="text-white"> Findings Ledger</strong> must adhere strictly to the following parameters:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-[#050911]/80 border border-slate-900 p-3 rounded-lg space-y-1.5">
                        <span className="text-[11px] font-mono text-white font-bold block border-b border-slate-900 pb-1">
                          1. Permitted Model Families
                        </span>
                        <ul className="list-disc list-inside space-y-1 font-mono text-[10px] text-slate-400">
                          <li>
                            <strong className="text-indigo-400">Clustering:</strong> KMeans, DBSCAN (Strict seed locks)
                          </li>
                          <li>
                            <strong className="text-indigo-400">Dimensionality Red:</strong> PCA (Whitened PCA for normalized exposures)
                          </li>
                          <li>
                            <strong className="text-indigo-400">Anomaly Detection:</strong> IsolationForest (Contamination ≤ 0.20)
                          </li>
                          <li>
                            <strong className="text-indigo-400">Regression:</strong> Ridge Linear Regression (Collinearity penalized)
                          </li>
                        </ul>
                      </div>

                      <div className="bg-[#050911]/80 border border-slate-900 p-3 rounded-lg space-y-1.5">
                        <span className="text-[11px] font-mono text-white font-bold block border-b border-slate-900 pb-1">
                          2. Provenance & Versioning Rules
                        </span>
                        <ul className="list-disc list-inside space-y-1 font-mono text-[10px] text-slate-400">
                          <li>Every fit must snapshot the active cuDF feature vectors.</li>
                          <li>UUID registration is required before findings enter the ledger.</li>
                          <li>Outputs model relationships, never purchase commands.</li>
                          <li>Training window boundary stamps must match raw news evidence.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-lg text-[11px] text-indigo-300 font-mono flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block uppercase mb-0.5">Verification Constraint</strong>
                        All model parameters are checked against the contract schema before compilation. If a model drifts outside F1 score threshold bounds, its findings are isolated for manual Operator audit.
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Module: Interactive Model Dispatcher & KNN Focus */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              
              {/* 1. Job Dispatcher Console */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>cuML Dispatch Console</span>
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">Interactive fitting</span>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs space-y-1">
                      <span className="text-slate-400 font-sans block">Select Model Family:</span>
                      <select
                        value={cumlModelFamily}
                        onChange={(e) => setCumlModelFamily(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-400 rounded px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="KMeans">KMeans Clustering (Clusters)</option>
                        <option value="DBSCAN">DBSCAN Density-Based (Clusters)</option>
                        <option value="PCA">PCA Dimensionality Reduction</option>
                        <option value="IsolationForest">IsolationForest Anomaly Detector</option>
                        <option value="LinearRegression">Linear Regression relationships</option>
                      </select>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 space-y-1 border-t border-slate-900 pt-2.5">
                      <div className="flex justify-between">
                        <span>Model Target:</span>
                        <span className="text-white">Active EvidenceFrame</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Device:</span>
                        <span className="text-cyan-400 font-bold">NVIDIA H100</span>
                      </div>
                    </div>

                    {/* Console Printout */}
                    <div className="bg-black/90 p-3 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-400 h-[110px] overflow-y-auto space-y-1">
                      {cumlGpuConsole.map((log, idx) => (
                        <div key={idx} className="leading-tight break-all">
                          {log.startsWith("[Success]") ? (
                            <span className="text-emerald-400">{log}</span>
                          ) : log.startsWith("[Success") || log.includes("Success") || log.startsWith("[Success]") || log.startsWith("[Ledger]") ? (
                            <span className="text-emerald-400">{log}</span>
                          ) : log.includes("Success") ? (
                            <span className="text-emerald-400">{log}</span>
                          ) : (
                            <span>{log}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900">
                  <button
                    onClick={dispatchCumlJob}
                    disabled={cumlGpuRunning}
                    className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-400 rounded text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cumlGpuRunning ? "animate-spin" : ""}`} />
                    <span>Compile & Dispatch Job</span>
                  </button>
                </div>
              </div>

              {/* 2. KNN Nearest Neighbor Analyzer (preserved & enhanced) */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-900 pb-2 mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      cuML K-Nearest Neighbors (KNN)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Map high-dimensional neighbor distances
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">Focus:</span>
                    <select
                      value={selectedKnnTicker}
                      onChange={(e) => setSelectedKnnTicker(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 rounded px-2.5 py-1 focus:outline-none flex-1"
                    >
                      {INITIAL_RAPIDS_DATA.map((r) => (
                        <option key={r.ticker} value={r.ticker}>
                          {r.ticker} - {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                      Distance Match (K=3)
                    </span>

                    {getKnnNeighbors(selectedKnnTicker).map((neigh, index) => (
                      <div
                        key={neigh.ticker}
                        className="bg-slate-900/60 p-2 rounded border border-slate-850 flex items-center justify-between font-mono text-[10px]"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500">#{index + 1}</span>
                          <span className="text-xs font-bold text-white">{neigh.ticker}</span>
                          <span className="text-[9px] text-slate-400 truncate max-w-[100px]">
                            ({neigh.name})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-indigo-400 uppercase font-semibold bg-indigo-950/40 border border-indigo-900/30 px-1.5 py-0.5 rounded text-[8px]">
                            {neigh.classification}
                          </span>
                          <span className="text-emerald-400 font-bold">{neigh.similarity}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0b1220]/50 border border-slate-900 p-2.5 rounded-lg text-[10px] text-slate-400 font-sans leading-relaxed mt-4">
                  <span className="font-bold text-cyan-400 block mb-0.5">💡 Distance Geometry</span>
                  If cryogenics (<span className="text-cyan-300 font-mono">LIN</span>) shifts, nearest neighbor analysis exposes Applied Materials (<span className="text-cyan-300 font-mono">AMAT</span>) as the mathematically nearest structural equivalent.
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. SUB-TAB: CUGRAPH - RELATIONSHIP LINKAGE */}
      {/* ========================================== */}
      {/* ========================================== */}
      {/* 4. SUB-TAB: CUGRAPH - RELATIONSHIP LINKAGE */}
      {/* ========================================== */}
      {activeSubTab === "cugraph" && (
        <div className="space-y-4 animate-fade-in" id="subtab-cugraph">
          {/* Banner */}
          <div className="bg-[#0b111e] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max mb-1.5">Layer 3: Pathfinder Graph Lens (In-Memory CPU Solver)</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Sovereign Property Graph Topology</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Causal systems-thinking mapping. Runs entirely in local CPU-bound memory to resolve corporate, government, and strategic dependencies. Physical GPU acceleration is simulated; corporate identities are synced canonically with PostgreSQL.
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0 gap-1.5">
              <button
                onClick={computePageRank}
                disabled={isPageRankRunning}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 disabled:opacity-50 text-cyan-400 rounded text-xs font-mono font-semibold uppercase flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPageRankRunning ? "animate-spin" : ""}`} />
                <span>Dispatch Background Solver</span>
              </button>
              {analysisStatusMessage && (
                <span className="text-[9px] text-cyan-400 font-mono animate-pulse">{analysisStatusMessage}</span>
              )}
            </div>
          </div>

          {/* Interactive Filtering and Search */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Filter:</span>
              <div className="flex flex-wrap gap-1">
                {["all", "company", "etf", "supplier", "material", "government-programme", "research-institution"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setGraphNodeTypeFilter(type)}
                    className={`px-2 py-0.5 text-[9px] font-mono rounded transition-all capitalize ${graphNodeTypeFilter === type ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-white"}`}
                  >
                    {type.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center w-full md:w-64">
              <input
                type="text"
                placeholder="Search nodes or tickers..."
                value={graphSearchQuery}
                onChange={(e) => setGraphSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
              <Search className="absolute right-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Interactive Causal Topology Grid */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
              <div>
                <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <GitBranch className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Interactive Causal Topology Grid</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Dynamic relative-positioned canvas ({graphNodes.length} nodes)</span>
                </div>

                <div className="relative bg-[#060a12] border border-slate-900 rounded-lg h-[500px] overflow-hidden">
                  {/* Legend rails */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col space-y-1.5 bg-slate-950/80 border border-slate-900/60 p-2 rounded-md backdrop-blur text-[9px] font-mono">
                    <span className="font-bold text-slate-400 uppercase tracking-wide block mb-1">Causal Columns</span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded bg-amber-500" />
                      <span className="text-slate-300">Sovereign State Funds & Labs</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded bg-orange-500" />
                      <span className="text-slate-300">Physical Substrates / Fab Tooling</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded bg-cyan-500" />
                      <span className="text-slate-300">Compute Platforms / QPUs</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded bg-emerald-500" />
                      <span className="text-slate-300">Strategic Portfolio ETFs</span>
                    </div>
                  </div>

                  {/* SVG background connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                      </marker>
                      <marker id="arrow-path" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                      </marker>
                    </defs>

                    {/* All connections / dependencies */}
                    {graphEdges.map((edge, idx) => {
                      const srcCoord = getDeterministicCoords(edge.source_node_id, "");
                      const tgtCoord = getDeterministicCoords(edge.target_node_id, "");
                      const isSelectedPath = computedPath.includes(edge.source_node_id) && 
                                            computedPath.includes(edge.target_node_id) &&
                                            computedPath.indexOf(edge.source_node_id) + 1 === computedPath.indexOf(edge.target_node_id);
                      
                      const strokeColor = getEdgeStrokeColor(edge.edge_type, isSelectedPath);
                      const strokeWidth = isSelectedPath ? 2.5 : 1 + (edge.weight || 0.5) * 1.5;
                      const opacity = isSelectedPath ? 0.9 : 0.2 + (edge.confidence || 0.5) * 0.45;
                      
                      // Calculate nice curved bezier paths for wire harness look
                      const x1 = srcCoord.x;
                      const y1 = srcCoord.y;
                      const x2 = tgtCoord.x;
                      const y2 = tgtCoord.y;
                      
                      // Handle straight or curved based on distance
                      const dx = x2 - x1;
                      const dy = y2 - y1;
                      const cx = x1 + dx * 0.5;
                      const cy = y1 + dy * 0.5 - (dx > 0 ? 10 : -10); // subtle curve upward

                      return (
                        <g key={`edge-${edge.source_node_id}-${edge.target_node_id}-${idx}`}>
                          <path
                            d={`M ${x1}% ${y1}% Q ${cx}% ${cy}% ${x2}% ${y2}%`}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={edge.edge_type === "REQUIRES" ? "3" : undefined}
                            opacity={opacity}
                            markerEnd={isSelectedPath ? "url(#arrow-path)" : "url(#arrow)"}
                            className="transition-all duration-300"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Render filtered nodes dynamically */}
                  {graphNodes.map((node) => {
                    const coords = getDeterministicCoords(node.node_id, node.node_type);
                    const isSelected = selectedGraphNode === node.node_id;
                    const isPartOfShortestPath = computedPath.includes(node.node_id);
                    const isFilteredOut = graphNodeTypeFilter !== "all" && node.node_type !== graphNodeTypeFilter;
                    const searchMatch = graphSearchQuery === "" || 
                                       node.label.toLowerCase().includes(graphSearchQuery.toLowerCase()) ||
                                       (node.attributes?.ticker && node.attributes.ticker.toLowerCase().includes(graphSearchQuery.toLowerCase()));

                    const opacity = (isFilteredOut || !searchMatch) ? "opacity-25" : "opacity-100";
                    const pageRankVal = graphCentrality?.pagerank?.[node.node_id] || 0.01;
                    const communityVal = graphCommunities?.[node.node_id] || "0";

                    return (
                      <div
                        key={`node-${node.node_id}`}
                        onClick={() => setSelectedGraphNode(node.node_id)}
                        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded border text-[10px] cursor-pointer select-none transition-all duration-300 z-10 flex flex-col text-center w-[125px] ${getNodeColor(node.node_type, isSelected)} ${opacity} ${isPartOfShortestPath ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20" : ""}`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-900 pb-0.5 mb-1">
                          <span className="font-mono text-[7px] text-slate-500 uppercase tracking-wider">{node.node_type.substring(0, 8)}</span>
                          {node.attributes?.ticker && (
                            <span className="font-mono font-bold text-[8px] bg-slate-950/80 px-1 rounded text-cyan-400">{node.attributes.ticker}</span>
                          )}
                        </div>
                        <span className="font-bold truncate text-white">{node.label}</span>
                        <div className="flex justify-between items-center text-[7px] text-slate-400 font-mono mt-1">
                          <span>PR: {Number(pageRankVal).toFixed(3)}</span>
                          <span>Com: {communityVal}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hermes Routing Pathfinding Interface */}
              <div className="mt-3 pt-3 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-lg border border-slate-900">
                <div className="flex flex-wrap items-center space-x-2 text-[11px] w-full lg:w-auto">
                  <span className="text-cyan-400 font-mono font-bold uppercase shrink-0">Hermes Causal Route:</span>
                  <select
                    value={shortestPathSource}
                    onChange={(e) => setShortestPathSource(e.target.value)}
                    className="bg-slate-900 border border-slate-850 font-mono text-cyan-400 text-[10px] rounded px-1.5 py-0.5 focus:outline-none"
                  >
                    {graphNodes.map(node => (
                      <option key={`src-${node.node_id}`} value={node.node_id}>
                        [{node.node_type.substring(0, 3).toUpperCase()}] {node.label}
                      </option>
                    ))}
                  </select>
                  <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                  <select
                    value={shortestPathDest}
                    onChange={(e) => setShortestPathDest(e.target.value)}
                    className="bg-slate-900 border border-slate-850 font-mono text-cyan-400 text-[10px] rounded px-1.5 py-0.5 focus:outline-none"
                  >
                    {graphNodes.map(node => (
                      <option key={`dst-${node.node_id}`} value={node.node_id}>
                        [{node.node_type.substring(0, 3).toUpperCase()}] {node.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center space-x-1 text-[10px] bg-slate-900 px-3 py-1 rounded border border-slate-850 font-mono w-full lg:w-auto justify-end">
                  {pathError ? (
                    <span className="text-red-400">{pathError}</span>
                  ) : computedPathNodes.length > 0 ? (
                    computedPathNodes.map((node, i) => (
                      <React.Fragment key={`path-step-${node.node_id}`}>
                        {i > 0 && <span className="text-slate-600 font-bold shrink-0">→</span>}
                        <span className="text-cyan-400 font-semibold truncate max-w-[85px] block">{node.label}</span>
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="text-slate-500">Tracing node matrix paths...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Graph Drawer / Node Details */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              {/* Card 1: Node Details */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
                <div>
                  {(() => {
                    const node = graphNodes.find(n => n.node_id === selectedGraphNode);
                    if (!node) {
                      return (
                        <div className="text-center py-8 text-slate-500 font-mono text-xs">
                          <Info className="w-6 h-6 mx-auto mb-2 opacity-50" />
                          Select a node in the causal matrix to view metrics
                        </div>
                      );
                    }

                    const pageRankScore = graphCentrality?.pagerank?.[node.node_id] || 0.01;
                    const degreeScore = graphCentrality?.degree?.[node.node_id] || 1;
                    const betweennessScore = graphCentrality?.betweenness?.[node.node_id] || 0;
                    const communityId = graphCommunities?.[node.node_id] || "0";
                    const bottleneckVal = graphBottlenecks?.[node.node_id] || 0;

                    // Get adjacent neighbors
                    const incoming = graphEdges.filter(e => e.target_node_id === node.node_id);
                    const outgoing = graphEdges.filter(e => e.source_node_id === node.node_id);

                    return (
                      <div className="space-y-4">
                        <div className="border-b border-slate-900 pb-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase px-1.5 py-0.5 bg-cyan-950/40 rounded border border-cyan-900/40">
                              {node.node_type.replace("-", " ")}
                            </span>
                            {node.attributes?.ticker && (
                              <span className="text-[10px] font-mono font-extrabold text-white bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                                {node.attributes.ticker}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white font-display uppercase tracking-wide">
                            {node.label}
                          </h4>
                          <p className="text-[10px] text-slate-400 italic mt-1 leading-relaxed">
                            "{node.attributes?.description || 'Strategic causal dependency node in Wall Street database.'}"
                          </p>
                        </div>

                        {/* Node Properties */}
                        <div className="space-y-2 text-xs">
                          <span className="text-[9px] text-cyan-400 font-bold block uppercase font-mono">cuGraph Algorithmic Scores</span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-900/60 p-2 rounded border border-slate-850 font-mono">
                              <span className="text-[8px] text-slate-500 block uppercase">PageRank</span>
                              <span className="text-emerald-400 font-bold text-sm">{Number(pageRankScore).toFixed(4)}</span>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded border border-slate-850 font-mono">
                              <span className="text-[8px] text-slate-500 block uppercase">Community</span>
                              <span className="text-violet-400 font-bold text-sm font-mono">Cluster {communityId}</span>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded border border-slate-850 font-mono">
                              <span className="text-[8px] text-slate-500 block uppercase">Degree Connections</span>
                              <span className="text-blue-400 font-bold text-sm">{degreeScore} connections</span>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded border border-slate-850 font-mono">
                              <span className="text-[8px] text-slate-500 block uppercase">Betweenness Centrality</span>
                              <span className="text-amber-400 font-bold text-sm">{Number(betweennessScore).toFixed(4)}</span>
                            </div>
                          </div>

                          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850">
                            <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                              <span className="text-rose-400 font-bold uppercase flex items-center space-x-1">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                <span>SPOF Vulnerability Index</span>
                              </span>
                              <span className="text-rose-400 font-bold">{Math.round(bottleneckVal * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-rose-500 h-full" style={{ width: `${Math.round(bottleneckVal * 100)}%` }} />
                            </div>
                            <p className="text-[8px] text-slate-500 font-mono mt-1 leading-relaxed">
                              Specifies structural reliance. Higher values indicate nodes that represent absolute bottlenecks.
                            </p>
                          </div>
                        </div>

                        {/* Mapped Dependencies */}
                        <div className="space-y-2 text-xs">
                          <span className="text-[9px] text-cyan-400 font-bold block uppercase font-mono">Topology Neighborhood ({incoming.length + outgoing.length})</span>
                          
                          <div className="bg-slate-900/60 p-2 rounded border border-slate-850 max-h-[140px] overflow-y-auto space-y-1.5 font-mono text-[10px]">
                            {incoming.map((e, i) => {
                              const srcNode = graphNodes.find(n => n.node_id === e.source_node_id);
                              return (
                                <div key={`inc-${i}`} className="flex items-center justify-between text-slate-300">
                                  <span className="text-emerald-500 shrink-0">▲ Incoming:</span>
                                  <span className="truncate max-w-[100px] text-right font-bold text-white">{srcNode?.label}</span>
                                  <span className="text-[8px] text-slate-500 shrink-0">({e.edge_type})</span>
                                </div>
                              );
                            })}
                            {outgoing.map((e, i) => {
                              const tgtNode = graphNodes.find(n => n.node_id === e.target_node_id);
                              return (
                                <div key={`out-${i}`} className="flex items-center justify-between text-slate-300">
                                  <span className="text-blue-500 shrink-0">▼ Outgoing:</span>
                                  <span className="truncate max-w-[100px] text-right font-bold text-white">{tgtNode?.label}</span>
                                  <span className="text-[8px] text-slate-500 shrink-0">({e.edge_type})</span>
                                </div>
                              );
                            })}
                            {incoming.length === 0 && outgoing.length === 0 && (
                              <div className="text-center py-2 text-slate-600 text-[9px]">Isolated node — no active relations mapped.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Card 2: Dynamic Node/Edge Registration form */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="border-b border-slate-900 pb-2">
                    <span className="text-[9px] text-cyan-400 font-bold block uppercase font-mono">DEVELOPER REGISTRY</span>
                    <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">Dynamic Graph Mutations</h4>
                  </div>

                  <form onSubmit={handleAddNode} className="space-y-2 text-xs">
                    <span className="text-[9px] text-slate-400 font-bold font-mono uppercase block">Register New Causal Node</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Node ID (e.g. company:PSI)"
                        value={editorNodeId}
                        onChange={(e) => setEditorNodeId(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g. PsiQuantum)"
                        value={editorNodeLabel}
                        onChange={(e) => setEditorNodeLabel(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editorNodeType}
                        onChange={(e) => setEditorNodeType(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-cyan-400 font-mono focus:outline-none"
                      >
                        <option value="company">Company</option>
                        <option value="etf">ETF</option>
                        <option value="supplier">Supplier</option>
                        <option value="material">Material</option>
                        <option value="government-programme">Gov Program</option>
                        <option value="research-institution">Research Lab</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Ticker (Optional)"
                        value={editorNodeTicker}
                        onChange={(e) => setEditorNodeTicker(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Short Description..."
                      value={editorNodeDesc}
                      onChange={(e) => setEditorNodeDesc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 rounded font-mono font-bold text-[10px] uppercase transition-all"
                    >
                      + Inject Node
                    </button>
                  </form>

                  <div className="border-t border-slate-900 my-2 pt-2" />

                  <form onSubmit={handleAddEdge} className="space-y-2 text-xs">
                    <span className="text-[9px] text-slate-400 font-bold font-mono uppercase block">Connect Causal Directed Edge</span>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editorEdgeSource}
                        onChange={(e) => setEditorEdgeSource(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-white font-mono focus:outline-none"
                        required
                      >
                        <option value="">-- Source --</option>
                        {graphNodes.map(node => (
                          <option key={`opt-src-${node.node_id}`} value={node.node_id}>{node.label}</option>
                        ))}
                      </select>
                      <select
                        value={editorEdgeTarget}
                        onChange={(e) => setEditorEdgeTarget(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-white font-mono focus:outline-none"
                        required
                      >
                        <option value="">-- Target --</option>
                        {graphNodes.map(node => (
                          <option key={`opt-tgt-${node.node_id}`} value={node.node_id}>{node.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <select
                        value={editorEdgeType}
                        onChange={(e) => setEditorEdgeType(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded p-1 text-[9px] text-cyan-400 font-mono focus:outline-none col-span-1"
                      >
                        <option value="SUPPLIES">SUPPLIES</option>
                        <option value="DEPENDS_ON">DEPENDS_ON</option>
                        <option value="OPERATES_IN">OPERATES_IN</option>
                        <option value="HOLDS">HOLDS</option>
                        <option value="FUNDS">FUNDS</option>
                        <option value="REQUIRES">REQUIRES</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        placeholder="Weight (0-1)"
                        value={editorEdgeWeight}
                        onChange={(e) => setEditorEdgeWeight(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-850 rounded p-1 text-[9px] text-white placeholder-slate-600 font-mono focus:outline-none col-span-1"
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        placeholder="Conf (0-1)"
                        value={editorEdgeConfidence}
                        onChange={(e) => setEditorEdgeConfidence(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-850 rounded p-1 text-[9px] text-white placeholder-slate-600 font-mono focus:outline-none col-span-1"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 rounded font-mono font-bold text-[10px] uppercase transition-all"
                    >
                      + Inject Directed Edge
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================================ */}
          {/* PATHFINDER AUDITING & CANONICAL PERSISTENCE PANELS (Wall Street Doctrine) */}
          {/* ============================================================================ */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
            {/* Panel A: PostgreSQL Canonical Identity Registry */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
              <div>
                <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Postgres Canonical Registry</span>
                  </div>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded font-mono font-semibold">SQL SECURE</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed font-mono">
                  Canonical identity registry table in PostgreSQL. Corporate assets and programmatic nodes are resolved against verified databases to safeguard naming integrity.
                </p>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {postgresIdentities.map((item) => (
                    <div key={item.id} className="bg-[#070b13] p-2 rounded border border-slate-900 flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1 py-0.2 rounded text-[9px]">{item.ticker}</span>
                        <span className="text-slate-300 truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[8px] text-slate-500 font-bold truncate max-w-[100px]">{item.uuid}</span>
                        <span className="text-[8px] text-emerald-500 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          synced
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-900 text-center">
                <span className="text-[8px] text-slate-500 font-mono">Canonical database table: <code className="text-slate-450">pg_company_identities</code></span>
              </div>
            </div>

            {/* Panel B: Versioned Graph Snapshots */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
              <div>
                <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <History className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Versioned Snapshots</span>
                  </div>
                  <span className="text-[9px] bg-purple-950 text-purple-400 border border-purple-800/40 px-1.5 py-0.5 rounded font-mono font-semibold">IMMUTABLE</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed font-mono">
                  Freeze graph topology states. Curated <code className="text-purple-400">v1-curated</code> snapshot preserves the baseline 26-node strategic view as a read-only checkpoint.
                </p>

                {/* Snapshots List */}
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 mb-3">
                  {graphSnapshots.map((snap) => (
                    <div key={snap.snapshot_id} className="bg-[#0d0914] p-2 rounded border border-slate-900 text-[10px] font-mono">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-purple-400 font-bold">{snap.name}</span>
                        <span className="text-[8px] text-slate-500 bg-slate-900 px-1 rounded">{snap.snapshot_id}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 truncate">{snap.description}</p>
                      <div className="flex justify-between text-[7px] text-slate-500 mt-1">
                        <span>Nodes: {snap.node_count} | Edges: {snap.edge_count}</span>
                        <span>{new Date(snap.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Snapshot Form */}
                <form onSubmit={handleSaveSnapshot} className="space-y-1.5 pt-2 border-t border-slate-900">
                  <input
                    type="text"
                    placeholder="Snapshot Name (e.g. Post-Earnings v1.1)"
                    value={newSnapshotName}
                    onChange={(e) => setNewSnapshotName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Short description..."
                    value={newSnapshotDesc}
                    onChange={(e) => setNewSnapshotDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-400 rounded font-mono font-bold text-[9px] uppercase transition-all"
                  >
                    Freeze Current Graph
                  </button>
                </form>
              </div>
            </div>

            {/* Panel C: Append-Only Graph Feature Ledger */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
              <div>
                <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Graph Feature Ledger</span>
                  </div>
                  <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded font-mono font-semibold">APPEND-ONLY</span>
                </div>
                
                {/* Rule Constraint Warning banner */}
                <div className="bg-amber-950/20 border border-amber-900/40 rounded p-2 mb-3 text-[9px] leading-relaxed text-amber-300 font-mono">
                  <strong className="text-amber-400">WALL STREET SECURITY CONSTRAINT</strong>: Centrality logs must NEVER silently overwrite the base <code className="text-amber-400">rapids_score</code>. Scores are altered ONLY inside explicit Systemic modules.
                </div>

                {/* Ledger entries scrolling stream */}
                <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                  {graphLedger.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 font-mono text-[10px]">
                      No recomputation logs found. Dispatch background solver to record audit trails.
                    </div>
                  ) : (
                    graphLedger.map((item) => (
                      <div key={item.ledger_id} className="bg-[#04080e] p-2 rounded border border-slate-900 font-mono text-[9px] leading-tight text-slate-300">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-1 font-semibold text-slate-400">
                          <span className="text-cyan-400 text-[10px]">{item.ticker}</span>
                          <span className="text-[8px] bg-slate-900 px-1 rounded text-cyan-500">{item.run_id}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-0.5 text-slate-400 text-[8px]">
                          <span>PR Score: <strong className="text-white">{Number(item.pagerank).toFixed(4)}</strong></span>
                          <span>Betweenness: <strong className="text-white">{Number(item.betweenness_centrality).toFixed(3)}</strong></span>
                          <span>Degree Cent: <strong className="text-white">{item.degree_centrality}</strong></span>
                          <span>Community: <strong className="text-white">{item.community_label}</strong></span>
                        </div>
                        <div className="flex justify-between text-[7px] text-slate-500 mt-1 border-t border-slate-950/40 pt-1">
                          <span>Alg: {item.algorithm_version}</span>
                          <span>Model: {item.scoring_model_version}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 5. SUB-TAB: RAFT - REUSABLE COMPUTATIONALS */}
      {/* ========================================== */}
      {activeSubTab === "raft" && (
        <div className="space-y-4" id="subtab-raft">
          {/* Banner */}
          <div className="bg-[#0b111e] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max mb-1.5">Layer 1.5: Reusable GPU Primitives</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">RAFT Shared Computational Algorithms</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                RAFT is the foundational algorithm repository powering cuML, cuGraph, and downstream subsystems. By utilizing reusable, low-level mathematical primitives (solvers, matrix compressors, distance metrics), we ensure maximum IPC throughput.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Primitive Selector */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-2 mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Select RAFT Primitive Library</span>
                  <span className="text-[10px] text-slate-400 block">Deploy compiled CUDA kernels directly onto Apache Arrow memory bounds</span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-850 cursor-pointer select-none hover:border-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="primitive"
                      value="pairwise_distance"
                      checked={selectedPrimitive === "pairwise_distance"}
                      onChange={() => setSelectedPrimitive("pairwise_distance")}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">raft::distance::pairwise_distance</span>
                      <span className="text-[10px] text-slate-400">Pairwise L2 or Cosine distance matrix calculations for multi-dimensional similarity indexing.</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-850 cursor-pointer select-none hover:border-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="primitive"
                      value="kmeans"
                      checked={selectedPrimitive === "kmeans"}
                      onChange={() => setSelectedPrimitive("kmeans")}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">raft::cluster::kmeans</span>
                      <span className="text-[10px] text-slate-400">High-dimensional centroid assignment and iterative cluster convergence algorithms.</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-850 cursor-pointer select-none hover:border-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="primitive"
                      value="csr_matrix"
                      checked={selectedPrimitive === "csr_matrix"}
                      onChange={() => setSelectedPrimitive("csr_matrix")}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">raft::matrix::dense_to_csr</span>
                      <span className="text-[10px] text-slate-400">Compress dense linkage matrices into Compressed Sparse Row representations for memory efficiency.</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-850 cursor-pointer select-none hover:border-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="primitive"
                      value="knn"
                      checked={selectedPrimitive === "knn"}
                      onChange={() => setSelectedPrimitive("knn")}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">raft::neighbors::knn</span>
                      <span className="text-[10px] text-slate-400">High-performance brute force or approximate K-Nearest Neighbor query mapping indexes.</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={runPrimitive}
                disabled={isExecutingPrimitive}
                className="mt-4 w-full py-2 bg-amber-950/80 hover:bg-amber-900/80 text-amber-400 border border-amber-800 disabled:opacity-50 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-amber-400/25 text-amber-400" />
                <span>Compile & Dispatch Kernel</span>
              </button>
            </div>

            {/* CUDA Output Terminal */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-lg">
              <div>
                <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block font-display">CUDA Execution Console</span>
                  <span className="text-[10px] text-slate-500 font-mono">Stream: DEVICE_0_COMPUTE</span>
                </div>

                <div className="bg-[#03060b] border border-slate-900 rounded-lg p-3 h-[250px] overflow-y-auto font-mono text-[10px] text-amber-300/90 space-y-1.5">
                  {primitiveLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Memory pinned bounds: {arrowBufferBytes.toLocaleString()} bytes</span>
                <button
                  onClick={() => setPrimitiveLogs(["[RAFT System] Console buffer cleared.", "[Device] Ready."])}
                  className="text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Clear Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 6. SUB-TAB: ROADMAP - 7-LAYER SUBSTRATE */}
      {/* ========================================== */}
      {activeSubTab === "roadmap" && (
        <div className="space-y-4" id="subtab-roadmap">
          {/* Banner */}
          <div className="bg-[#0b111e] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max mb-1.5">Substrate Hierarchy Matrix</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Pathfinder 7-Layer Intelligence Architecture</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Instead of treating our portfolio as a static asset grid, Pathfinder is constructed as a modular routing substrate. Each layer is dependent on the validation of the layer immediately below it, keeping our world model highly grounded.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* The Vertical 7-Layers */}
            <div className="lg:col-span-6 flex flex-col space-y-2">
              {[
                { level: 6, title: "Layer 6: Operator Decision Engine", role: "Decisive capital allocation, sync to 100%, never-bet-the-world-model.", status: "Active", system: "Capital Allocate Rails", color: "border-rose-500/35 hover:border-rose-400 text-rose-300" },
                { level: 5, title: "Layer 5: Jemma Thesis Falsifier", role: "Rigorous thesis falsification, checks against cash flows and dilution.", status: "Verified", system: "Falsification Matrices", color: "border-pink-500/35 hover:border-pink-400 text-pink-300" },
                { level: 4, title: "Layer 4: Hermes Signal Router", role: "Algorithmic parsing and classification of daily news intelligence.", status: "Live", system: "Symmetric LLM Classifier", color: "border-purple-500/35 hover:border-purple-400 text-purple-300" },
                { level: 3, title: "Layer 3: cuGraph Causal Topology", role: "Sovereign knowledge graph routing, PageRank node validation.", status: "Healthy", system: "Sparse Matrix Solver", color: "border-indigo-500/35 hover:border-indigo-400 text-indigo-300" },
                { level: 2, title: "Layer 2: cuML Clustering Engine", role: "K-Means and Nearest Neighbors mapping of exposures and ETFs.", status: "Synced", system: "Euclidean Classifier", color: "border-blue-500/35 hover:border-blue-400 text-blue-300" },
                { level: 1, title: "Layer 1: cuDF Arrow Column Matrix", role: "Structured vector representations modulated by weights.", status: "Optimized", system: "CUDA DataFrame IPC", color: "border-cyan-500/35 hover:border-cyan-400 text-cyan-300" },
                { level: 0, title: "Layer 0: Unstructured Evidence Pool", role: "Daily intelligence streams, policy updates, earnings releases.", status: "Intaking", system: "Delta Layer Provenance", color: "border-emerald-500/35 hover:border-emerald-400 text-emerald-300" }
              ].map((layer) => {
                const isActive = selectedLayer === layer.level;
                return (
                  <div
                    key={layer.level}
                    onClick={() => setSelectedLayer(layer.level)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between bg-slate-950/80 ${layer.color} ${isActive ? "ring-2 ring-rose-500 border-transparent shadow-lg scale-[1.01]" : "opacity-80"}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[11px] font-bold text-slate-300">
                        L{layer.level}
                      </div>
                      <div>
                        <span className="text-xs font-bold font-display block">{layer.title}</span>
                        <span className="text-[10px] text-slate-400 leading-relaxed block truncate max-w-[320px]">{layer.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                        {layer.system}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">
                        {layer.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Layer Detail Focus */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-between">
              {(() => {
                const layerDetails: Record<number, { title: string, explanation: string, technicalCounterpart: string, formula: string, actionLabel: string }> = {
                  0: {
                    title: "Layer 0: Evidence Acquisition Substrate",
                    explanation: "This is the collection layer where real-time, messy macro-intelligence flows into our database. No buying or selling decisions are made here—only the careful assembly of raw data points, earnings releases, and national security drafts.",
                    technicalCounterpart: "Firebase Firestore / Delta Journal Pipeline",
                    formula: "Raw Unstructured Text -> Symmetric Parsing Struct",
                    actionLabel: "Intake New Signal"
                  },
                  1: {
                    title: "Layer 1: Columnar Data Matrix (cuDF)",
                    explanation: "We convert messy news stories into structured rows inside our cuDF dataframe. Every company is represented as a high-integrity vector with distinct dimensions (Cash Flow, AI, Ecosystem Positioning). Weight sliders adjust mathematical priority dynamically.",
                    technicalCounterpart: "cuDF / Apache Arrow",
                    formula: "RowVector = [Cash, Ecosystem, Intensity, Government, AI, Materials, Science]",
                    actionLabel: "Recalculate Row Vector Rank"
                  },
                  2: {
                    title: "Layer 2: Dimensional Cluster Matcher (cuML)",
                    explanation: "By treating row vectors as coordinate dimensions, cuML runs K-Means fit operations to discover asset categories mathematically. This prevents us from clustering by industry labels and instead forces classification by actual resource exposure.",
                    technicalCounterpart: "cuML K-Means Clustering",
                    formula: "Argmin Σ || xi - μj ||² (Iterative Centroid Fit)",
                    actionLabel: "Run Nearest Neighbor Index"
                  },
                  3: {
                    title: "Layer 3: Causal Topology Router (Pathfinder Graph Lens)",
                    explanation: "A high-integrity knowledge graph mapping causal compute dependencies. Instead of isolated stories, companies are vertices connected by edges representing supply chains, power lines, and export permissions.",
                    technicalCounterpart: "Pathfinder Graph Lens PageRank (In-Memory CPU Solver)",
                    formula: "PR(u) = (1-d) + d * Σ (PR(v) / L(v))",
                    actionLabel: "Analyze Graph Centroid PageRank"
                  },
                  4: {
                    title: "Layer 4: Hermes Algorithmic Router",
                    explanation: "The automated compiler that parses incoming signals, extracts metadata, identifies target causal nodes in our Pathfinder Graph Lens structure, and dynamically registers the corresponding confidence modifiers.",
                    technicalCounterpart: "Symmetric LLM Compiler Engine",
                    formula: "Hermes(IntelligenceString) -> [Causal Graph Node ID, Delta Score, Evidence String]",
                    actionLabel: "Check Routing Latency"
                  },
                  5: {
                    title: "Layer 5: Jemma Thesis Falsification Gate",
                    explanation: "The ultimate check. Before any capital allocation can be adjusted, Jemma triggers 5 critical questions to falsify assumptions, ensure immediate cash flow viability, and shield against pre-revenue hype cycles.",
                    technicalCounterpart: "Rigorous Falsification Checkpoints",
                    formula: "Verify(Falsified, CashGenerating, RailClassification, 15yrTimeline, EcosystemMoat)",
                    actionLabel: "Inspect Falsification Assertions"
                  },
                  6: {
                    title: "Layer 6: Operator Decision Engine",
                    explanation: "The ultimate capital allocator. Capital is directed exclusively into positions that have successfully completed layers 0 through 5. Sliders normalize automatically to ensure total portfolio bounds equal 100%.",
                    technicalCounterpart: "Portfolio Balance Controller",
                    formula: "Minimize risk s.t. Capital Bounds = 100% Notional",
                    actionLabel: "Sync Capital to 100%"
                  }
                };

                const details = layerDetails[selectedLayer];
                if (!details) return null;

                return (
                  <div className="space-y-4">
                    <div className="border-b border-slate-900 pb-3">
                      <span className="text-[10px] text-cyan-400 font-mono block mb-1">SELECTED LAYER INSIGHT</span>
                      <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">{details.title}</h4>
                    </div>

                    <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                      <p className="bg-[#050a11]/90 p-3.5 rounded border border-slate-900 font-sans">
                        {details.explanation}
                      </p>

                      <div className="bg-[#03060c] p-3 rounded-lg border border-slate-900 font-mono text-[10.5px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Underlying Engine:</span>
                          <span className="text-cyan-300 font-semibold">{details.technicalCounterpart}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-900/60 pt-1 mt-1">
                          <span className="text-slate-500">Mathematical Form:</span>
                          <span className="text-rose-400 font-semibold">{details.formula}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0a1220]/40 border border-slate-900 p-3 rounded-lg text-[11px] leading-relaxed text-slate-400">
                      <span className="font-bold text-white block mb-0.5">🐾 System Governance Guard</span>
                      Pathfinder mandates that no decision can reach Layer 6 unless the lower layers are actively verified. This enforces complete system accountability.
                    </div>
                  </div>
                );
              })()}

              <div className="text-[10px] text-slate-500 font-mono mt-4 pt-3 border-t border-slate-900">
                *Selected layer level: L{selectedLayer}. Connected pipeline statuses: HEALTHY.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 7. SUB-TAB: RMM DISCIPLINE - RESOURCE GOVERNANCE */}
      {/* ========================================== */}
      {activeSubTab === "rmm" && (
        <div className="space-y-4 animate-fade-in" id="subtab-rmm">
          {/* Banner */}
          <div className="bg-[#0b101d] border border-amber-950/40 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max">
                  RMM Resource Governance
                </span>
                <span className={`text-[10px] border px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max ${
                  runtimeMode === "simulation" 
                    ? "bg-slate-950 text-slate-400 border-slate-800" 
                    : runtimeMode === "local GPU" 
                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60" 
                    : "bg-blue-950/80 text-blue-400 border-blue-800/60"
                }`}>
                  Engine: {runtimeMode} Mode
                </span>
                <span className="text-[10px] bg-purple-950/40 text-purple-400 border border-purple-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max">
                  Telemetry: {gpuDetails.telemetry_source || "simulated"}
                </span>
                <span className="text-[10px] bg-slate-900/60 text-slate-400 border border-slate-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-max">
                  Measurement: {gpuDetails.measurement_mode || "estimated"}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                RAPIDS Memory Manager (RMM) Subsystem
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                RMM governs acceleration without becoming part of the decision logic. In accordance with the Wall Street Doctrine, RMM serves as the foundational, resource-bounded workspace beneath all analytical layers, preventing physical memory crashes during high-concurrency vector rebalancing.
              </p>
            </div>
          </div>

          {/* Fail Closed Alert Banner */}
          {rmmStatus === "fail_closed" && (
            <div className="bg-red-950/85 border border-red-800/80 p-4 rounded-xl flex items-start gap-3 text-red-200 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">RMM Critical Fault: System Fail-Closed</h4>
                <p className="text-xs mt-1 text-red-300">
                  Memory parameters violated strict safety boundaries (e.g. Initial Pool Size exceeds Maximum Pool Size, or negative sizes detected). RMM has closed the active memory resource pool. All subsequent GPU job allocations have been rejected to guarantee infrastructure sanity.
                </p>
                {configError && <p className="text-[10.5px] mt-1.5 font-mono bg-red-900/40 border border-red-800/40 px-2 py-1 rounded w-max text-white">{configError}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Config and Admin controls */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Configuration */}
              <div className="bg-[#050811] border border-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-md">
                <div>
                  <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Memory Allocator Rules
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${rmmStatus === "initialized" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" : rmmStatus === "rebooting" ? "bg-amber-950 text-amber-400 border border-amber-800/40" : "bg-red-950 text-red-400 border border-red-800/40"}`}>
                      {rmmStatus}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-mono mb-1">
                        Initial Pool Size (Bytes) — RMM-01/02
                      </label>
                      <input
                        type="number"
                        value={rmmInitialPoolSize}
                        onChange={(e) => setRmmInitialPoolSize(Number(e.target.value))}
                        disabled={rmmStatus === "rebooting"}
                        className="w-full bg-[#03060c] border border-slate-900 rounded px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-amber-500/40"
                      />
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        Formatted: {(rmmInitialPoolSize / 1e9).toFixed(2)} GB
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 font-mono mb-1">
                        Maximum Pool Size (Bytes) — RMM-02
                      </label>
                      <input
                        type="number"
                        value={rmmMaximumPoolSize}
                        onChange={(e) => setRmmMaximumPoolSize(Number(e.target.value))}
                        disabled={rmmStatus === "rebooting"}
                        className="w-full bg-[#03060c] border border-slate-900 rounded px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-amber-500/40"
                      />
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        Formatted: {(rmmMaximumPoolSize / 1e9).toFixed(2)} GB (Do not exceed physical VRAM)
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 font-mono mb-1">
                        Admission Limit per Job (Bytes) — RMM-06
                      </label>
                      <input
                        type="number"
                        value={gpuJobMemoryLimit}
                        onChange={(e) => setGpuJobMemoryLimit(Number(e.target.value))}
                        disabled={rmmStatus === "rebooting"}
                        className="w-full bg-[#03060c] border border-slate-900 rounded px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-amber-500/40"
                      />
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        Formatted: {(gpuJobMemoryLimit / 1e9).toFixed(2)} GB
                      </span>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rmmManagedMemory}
                          onChange={(e) => setRmmManagedMemory(e.target.checked)}
                          disabled={rmmStatus === "rebooting"}
                          className="rounded bg-[#03060c] border border-slate-900 text-amber-500 focus:ring-0"
                        />
                        <span className="text-slate-300 text-[11px] font-mono">
                          Enable Managed Memory (Unified Virtual)
                        </span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rmmStatisticsEnabled}
                          onChange={(e) => setRmmStatisticsEnabled(e.target.checked)}
                          disabled={rmmStatus === "rebooting"}
                          className="rounded bg-[#03060c] border border-slate-900 text-amber-500 focus:ring-0"
                        />
                        <span className="text-slate-300 text-[11px] font-mono">
                          Enable Allocation Trackers (RMM-03)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900/60">
                  <button
                    onClick={() => saveRmmConfig(rmmInitialPoolSize, rmmMaximumPoolSize, rmmManagedMemory, rmmStatisticsEnabled, gpuJobMemoryLimit)}
                    disabled={rmmStatus === "rebooting"}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${rmmStatus === "rebooting" ? "animate-spin" : ""}`} />
                    <span>Apply & Reboot Pool (RMM-01)</span>
                  </button>
                  <p className="text-[9.5px] text-slate-500 text-center mt-2 font-mono">
                    *Changing active memory resource must occur before device allocations.
                  </p>
                </div>
              </div>

              {/* Card 2: Admission Control Simulation */}
              <div className="bg-[#050811] border border-slate-900 rounded-xl p-4 shadow-md">
                <div className="border-b border-slate-900 pb-2 mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Admission Gate Sandbox (RMM-06)
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Test the RMM admission control gate by requesting a simulated allocation. Allocations larger than the active job limit will be rejected immediately.
                  </p>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-mono mb-1">
                      Job Requested Memory
                    </label>
                    <select
                      value={simJobSize}
                      onChange={(e) => setSimJobSize(Number(e.target.value))}
                      disabled={isAllocatingSimJob}
                      className="w-full bg-[#03060c] border border-slate-900 rounded px-2 py-1.5 font-mono text-white text-xs focus:outline-none"
                    >
                      <option value={536870912}>512 MB (Safe allocation)</option>
                      <option value={1073741824}>1.00 GB (Moderate vector)</option>
                      <option value={2147483648}>2.00 GB (Limit boundary)</option>
                      <option value={3221225472}>3.00 GB (Exceeds default limit)</option>
                      <option value={5368709120}>5.00 GB (Heavy recalculation)</option>
                    </select>
                  </div>

                  <button
                    onClick={triggerSimAllocation}
                    disabled={isAllocatingSimJob}
                    className="w-full py-2 bg-[#0a1220] hover:bg-[#111c30] text-slate-300 border border-slate-800 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Play className={`w-3 h-3 text-amber-400 ${isAllocatingSimJob ? "animate-ping" : ""}`} />
                    <span>{isAllocatingSimJob ? "Allocating on GPU..." : "Dispatch Simulated Job"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Middle & Right Column: Telemetry grid and history logs */}
            <div className="lg:col-span-8 space-y-4">
              {/* Telemetry Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#050811] border border-slate-900 rounded-xl p-3 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Active Memory Resource</span>
                  <span className="text-sm font-bold text-white font-mono block">
                    {rmmStats.resourceType === "managed" ? "Managed Memory" : "Bounded Pool"}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono block mt-0.5">
                    {rmmStats.resourceType === "managed" ? "managed_memory_resource" : "pool_allocator_resource"}
                  </span>
                </div>

                <div className="bg-[#050811] border border-slate-900 rounded-xl p-3 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Peak Allocated Memory</span>
                  <span className="text-sm font-bold text-white font-mono block">
                    {(rmmStats.poolPeakBytes / 1e9).toFixed(2)} GB
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    Limit: {(rmmStats.poolMaximumBytes / 1e9).toFixed(1)} GB (Budget)
                  </span>
                </div>

                <div className="bg-[#050811] border border-slate-900 rounded-xl p-3 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">GPU Silicon Status</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE / H100
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    Temp: {gpuDetails.temperature_celsius}°C | Fan: {gpuDetails.fan_speed_percent}%
                  </span>
                </div>
              </div>

              {/* Memory utilization bar */}
              <div className="bg-[#050811] border border-slate-900 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2 text-xs font-mono">
                  <span className="text-slate-400">GPU VRAM Workspace Utilization Profile</span>
                  <span className="text-white font-semibold">
                    {(rmmStats.poolCurrentBytes / 1e9).toFixed(1)} GB current / {(rmmStats.poolMaximumBytes / 1e9).toFixed(1)} GB allowed
                  </span>
                </div>
                <div className="w-full bg-[#03060c] border border-slate-900 rounded-full h-3 overflow-hidden p-0.5">
                  <div className="flex h-full rounded-full overflow-hidden">
                    {/* Current Pool Size */}
                    <div
                      style={{ width: `${Math.min(100, (rmmStats.poolCurrentBytes / rmmStats.poolMaximumBytes) * 100)}%` }}
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    />
                    {/* Peak Allocation margin */}
                    <div
                      style={{ width: `${Math.max(0, Math.min(100, ((rmmStats.poolPeakBytes - rmmStats.poolCurrentBytes) / rmmStats.poolMaximumBytes) * 100))}%` }}
                      className="bg-amber-800/60 h-full transition-all duration-500"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-amber-500" />
                    <span>Initial Pool ({(rmmStats.poolCurrentBytes / 1e9).toFixed(1)} GB)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-amber-800/60" />
                    <span>Peak Registered Workspace ({(rmmStats.poolPeakBytes / 1e9).toFixed(1)} GB)</span>
                  </div>
                  <span>Max Allowed Budget ({(rmmStats.poolMaximumBytes / 1e9).toFixed(1)} GB)</span>
                </div>
              </div>

              {/* Log terminal & History */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* RMM Live Logs */}
                <div className="md:col-span-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-display block">
                      RMM Governance Console
                    </span>
                    <button
                      onClick={() => setRmmLogs(["[RMM System] Telemetry buffer cleared.", "[RMM] Awaiting operations."])}
                      className="text-[10px] text-slate-500 hover:text-white underline font-mono cursor-pointer"
                    >
                      Clear Logs
                    </button>
                  </div>
                  <div className="bg-[#02050a] border border-slate-900 rounded-lg p-3 h-[250px] overflow-y-auto font-mono text-[9.5px] text-amber-400/90 space-y-1.5">
                    {rmmLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed border-l border-amber-900/30 pl-1.5">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Findings Ledger History */}
                <div className="md:col-span-6 space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-display block">
                    Findings Ledger — RMM-03 Telemetry
                  </span>
                  <div className="bg-[#02050a] border border-slate-900 rounded-lg p-3 h-[250px] overflow-y-auto text-xs space-y-2">
                    {rmmHistory.length === 0 ? (
                      <div className="text-slate-500 text-center py-10 font-mono text-[11px]">
                        No RMM telemetry records found. Dispatch a simulated job or recalculate Pathfinder Graph Lens solver to record metrics.
                      </div>
                    ) : (
                      rmmHistory.map((entry, idx) => (
                        <div key={idx} className="p-2 rounded bg-[#050912]/80 border border-slate-900/60 font-mono text-[10px] leading-relaxed">
                          <div className="flex justify-between text-white font-bold mb-0.5">
                            <span className="text-amber-400">{entry.analysis_id}</span>
                            <span className="text-slate-500 text-[9px]">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 text-slate-400 text-[9px] mt-1 border-t border-slate-900/40 pt-1">
                            <div>Resource: <span className="text-slate-200">{entry.rmm_resource}</span></div>
                            <div>Peak Alloc: <span className="text-slate-200">{(entry.peak_allocated_bytes / 1e6).toFixed(1)} MB</span></div>
                            <div>Total Alloc: <span className="text-slate-200">{(entry.total_allocated_bytes / 1e6).toFixed(1)} MB</span></div>
                            <div>Allocs Count: <span className="text-slate-200">{entry.allocation_count}</span></div>
                            <div>Latency: <span className="text-slate-200">{entry.duration_ms} ms</span></div>
                            <div>Status: <span className="text-emerald-400 uppercase font-bold">{entry.status}</span></div>
                            <div>Allocator Type: <span className="text-amber-500 font-bold">{entry.allocator_type || "simulated_pool"}</span></div>
                            <div>Worker ID: <span className="text-blue-400">{entry.worker_id || "worker-node-01"}</span></div>
                            <div className="col-span-2">GPU UUID: <span className="text-slate-400 font-mono break-all">{entry.gpu_uuid || "simulated-h100-vram"}</span></div>
                            <div>Config Version: <span className="text-slate-300">{entry.config_version || "v1.2.0"}</span></div>
                            <div>Telemetry Src: <span className="text-purple-400">{entry.telemetry_source || "simulated"}</span></div>
                            <div className="col-span-2">Measurement Mode: <span className="text-indigo-400 font-bold">{entry.measurement_mode || "simulated"}</span></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
