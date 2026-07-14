import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Server,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Sliders,
  DollarSign,
  Send,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Info,
  ChevronRight,
  TrendingDown,
  User,
  CheckCircle2,
  Lock,
  GitPullRequest,
  Check,
  FileText,
  Search,
  Plus,
  BookOpen,
  Eye,
  Database,
  Briefcase,
  ShieldCheck,
  Award,
  Globe,
  PlusCircle,
  MessageSquare,
  AlertCircle,
  Shield,
  Network
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TickerInfo, 
  Alert, 
  ScenarioType, 
  Scenario, 
  Message, 
  Allocation,
  RapidsVector,
  DeltaJournalEntry,
  KnowledgeNode
} from "./types";
import { 
  auth, 
  signInWithGoogle, 
  logOut 
} from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  savePortfolioToCloud,
  loadPortfolioFromCloud,
  addJournalEntryToCloud,
  subscribeToJournal,
  addChatMessageToCloud,
  subscribeToChatMessages,
  saveCardChecklistToCloud,
  subscribeToChecklists
} from "./firebaseSync";
import RapidsLensDashboard from "./components/RapidsLensDashboard";
import QuantumUniverse from "./components/QuantumUniverse";

// Static mapping for fallback values and allocations classification
const CATEGORY_MAPPING: Record<string, { type: "Infrastructure" | "Emerging Technologies" | "Moonshots"; confidence: number; class: "Compute" | "Networking" | "Materials" | "Cloud" | "Security" | "Control Systems" | "Energy" }> = {
  SOXX: { type: "Infrastructure", confidence: 95, class: "Compute" },
  XSD: { type: "Infrastructure", confidence: 95, class: "Compute" },
  LIN: { type: "Infrastructure", confidence: 95, class: "Materials" },
  AMAT: { type: "Infrastructure", confidence: 95, class: "Materials" },
  NVDA: { type: "Emerging Technologies", confidence: 82, class: "Compute" },
  GOOG: { type: "Emerging Technologies", confidence: 74, class: "Cloud" },
  QTUM: { type: "Emerging Technologies", confidence: 63, class: "Networking" },
  WQTM: { type: "Emerging Technologies", confidence: 63, class: "Networking" },
  IONQ: { type: "Moonshots", confidence: 41, class: "Control Systems" },
  RGTI: { type: "Moonshots", confidence: 22, class: "Control Systems" }
};

const STATIC_TICKERS: Record<string, { name: string; type: string; allocType: "quantum" | "semis" | "platform" | "materials" | "qubit_play" }> = {
  QTUM: { name: "Defiance Quantum ETF", type: "quantum_etf", allocType: "quantum" },
  WQTM: { name: "WisdomTree Quantum ETF", type: "quantum_etf", allocType: "quantum" },
  SOXX: { name: "iShares Semiconductor ETF", type: "semis_etf", allocType: "semis" },
  XSD: { name: "SPDR S&P Semiconductor ETF", type: "semis_etf", allocType: "semis" },
  NVDA: { name: "NVIDIA Corp", type: "platform", allocType: "platform" },
  GOOG: { name: "Alphabet Inc", type: "platform", allocType: "platform" },
  IONQ: { name: "IonQ Inc", type: "qubit", allocType: "qubit_play" },
  RGTI: { name: "Rigetti Computing", type: "qubit", allocType: "qubit_play" },
  LIN: { name: "Linde PLC", type: "materials", allocType: "materials" },
  AMAT: { name: "Applied Materials", type: "materials", allocType: "materials" }
};

const TICKER_ALLOCATION_RATIONALES: Record<string, string[]> = {
  LIN: [
    "Thermodynamic rail: cryogenic supply chains for high-purity industrial gases are physically essential.",
    "Multi-sector demand: services both advanced lithography foundries and cryogenic quantum supercomputers.",
    "High infrastructure certainty: 95% certainty index based on physical, non-discretionary industrial assets.",
    "Low technology modality dependence: earns yield regardless of which computing architecture wins."
  ],
  AMAT: [
    "High-precision atomic engineering: fabrication tools and physical nanochemistry are essential bottlenecks.",
    "Broad semiconductor leverage: critical regardless of the specific software or model architecture.",
    "Very high entry barrier: extreme capital intensity and proprietary intellectual patents protect margins."
  ],
  SOXX: [
    "Ecosystem rail: aggregated capture of top tier sub-nanometer logic chip and foundries volume.",
    "Exascale co-processing: direct physical pipeline exposure with minimal single-company platform risk.",
    "Sovereign shield: heavily insulated by national advanced technology subsidies (CHIPS Act)."
  ],
  XSD: [
    "Equal-weighted semiconductor access: prevents extreme single-ticker concentration risks.",
    "Exposes secondary power management and packaging suppliers that are overlooked by market caps."
  ],
  NVDA: [
    "Interconnect rail: proprietary NVLink and CUDA compilers form a highly defensible platform moat.",
    "Extremely strong present-day free cash flows with massive pricing power.",
    "● Note: Heavily reliant on a single sub-nanometer manufacturing foundry bottleneck."
  ],
  GOOG: [
    "Dual leverage: robust search/cloud cash flow subsidizes cutting-edge quantum Sycamore research.",
    "Exascale cloud delivery: top-tier destination for enterprise model execution."
  ],
  QTUM: [
    "Broad quantum index: captures diverse ecosystem companies across materials, control logic and optics.",
    "● Note: Subject to modality uncertainty as trapped-ion and neutral-atom architectures battle."
  ],
  WQTM: [
    "Ecosystem-focused quantum index: excludes low-liquidity speculative shells, favoring active developers.",
    "● Note: Subject to longer-term R&D timelines before general commercial cash flows hit."
  ],
  IONQ: [
    "Trapped-ion qubit pure-play: potential asymptotic advantages in room-temperature coherent operations.",
    "● Note: Very low immediate commercial cash flows; highly speculative moonshot play."
  ],
  RGTI: [
    "Superconducting qubit pure-play: high-speed gate execution and planar fabrication lines.",
    "● Note: Extremely sensitive to cryogenic cooling stability and packaging bottlenecks."
  ]
};

const SCENARIO_CAUSAL_CHAINS: Record<string, { title: string; desc: string }[]> = {
  efficiency_trap: [
    { title: "Tensor-network Classical Breakthrough", desc: "GPU clusters achieve unprecedented mathematical tensor compression, rendering simple qubit calculations redundant." },
    { title: "Quantum Processor Demand Reduced", desc: "Commercial pressure on custom dilution fridges and cryogenic control logic drops significantly." },
    { title: "WQTM Rebalances Down", desc: "Speculative quantum computing indices decline by -5% variance to insulate capital assets." },
    { title: "Linde Cryogenic Gas Reallocation", desc: "High-purity Helium-3 diverted from qubit experimental cooling to high-yield sub-nanometer EUV lithography." }
  ],
  breakout: [
    { title: "Coherence Threshold Achieved", desc: "True logical qubits achieve fault-tolerant error correction at scale (-273°C)." },
    { title: "Sub-Kelvin Cryo-Fridge Bottlenecks", desc: "Massive global liquid Helium-3 bottleneck hits wafer-fab facilities." },
    { title: "LIN Cryogenic Materials Rails Skyrocket", desc: "Cryogenic gas shipping moats capture high margin index appreciation (+13% variance)." },
    { title: "WQTM & Pure Qubit Play Growth", desc: "Agnostic quantum ETFs and pure hardware plays appreciate (+25% variance) as cloud contracts lock in." }
  ],
  energy_crisis: [
    { title: "Hyperscale Grid Bottlenecks", desc: "Local utility power grids suffer rolling thermal overloads from exascale co-processing hubs." },
    { title: "Baseload Energy Security Priority", desc: "Sovereign defense directives lock in 24/7 non-interruptible nuclear & strategic power lines." },
    { title: "Industrial Materials & Power Moats Expand", desc: "Linde gas delivery and nuclear baseload partners secure direct 20-year high-margin supply contracts." },
    { title: "Speculative Qubit R&D Suspended", desc: "Unsecured, non-producing research projects temporarily paused to conserve power allocations." }
  ],
  ai_boom: [
    { title: "Distributed NVLink Optical Standard", desc: "Massive expansion in optical and high-density fiber inter-chassis backplanes." },
    { title: "SOXX Foundries Operating at 100% Capacity", desc: "Extreme volume of customized silicon wafers triggers high physical backlog growth (+16%)." },
    { title: "NVIDIA Platform Software Moats Lock In", desc: "Proprietary compilers and routing networks lock in permanent enterprise infrastructure yields (+18%)." },
    { title: "Downstream Nanochemistry Gas Volume Surges", desc: "Nanoscale high-purity deposition materials secure multi-year pricing power." }
  ]
};

// Seed RAPIDS Vector records
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

// Seed Crystal Bridge Knowledge Graph Nodes
const INITIAL_KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: "macro",
    label: "Macroeconomics",
    category: "Macroeconomics",
    confidence: 95,
    observations: [
      "Interest rate cycle stabilizes, favoring high capital efficiency infrastructure over speculative R&D.",
      "Sovereign computing mandates accelerating across North America and Europe."
    ],
    evidence: [
      "US CHIPS Act awards third round of multi-billion dollar packaging grants.",
      "EU Sovereignty Cloud budget expanded to €15B for AI and distributed secure infrastructure."
    ],
    companies: ["GOOG", "LIN"],
    etfs: ["SOXX"],
    policyNotes: "National strategy dictates physical compute supply chains must reside within domestic borders.",
    x: 10,
    y: 15
  },
  {
    id: "energy",
    label: "Grid & Nuclear Power",
    category: "Energy",
    confidence: 95,
    observations: [
      "Exascale AI clusters demand dedicated baseload power lines, leading to SMR (Small Modular Reactor) partnerships.",
      "Superconducting QPUs require continuous localized helium cooling grids."
    ],
    evidence: [
      "Linde signs long-term helium supply contract for three new semiconductor manufacturing hubs.",
      "US Nuclear Regulatory Commission fast-tracks regulatory pathways for modular data center reactors."
    ],
    companies: ["LIN"],
    etfs: ["XSD"],
    policyNotes: "Cooling and power networks are now classified as Critical National Security Infrastructure.",
    x: 10,
    y: 50
  },
  {
    id: "materials",
    label: "Nanomaterials & Gases",
    category: "Materials",
    confidence: 95,
    observations: [
      "Nano-scale etching precision is the primary bottleneck for quantum error-correction density.",
      "Liquid Helium supply bottlenecks present direct threat to superconducting modality hardware."
    ],
    evidence: [
      "Helium-3 recovery programs showing 18% cost reduction due to new recycling techniques.",
      "Applied Materials releases specialized atomic layer deposition (ALD) tool for superconducting qubits."
    ],
    companies: ["LIN", "AMAT"],
    etfs: ["XSD"],
    policyNotes: "Export restrictions on ultra-pure silicon-carbide and cryogenic gases expanded.",
    x: 10,
    y: 85
  },
  {
    id: "compute",
    label: "Hybrid Compute Factories",
    category: "Compute",
    confidence: 82,
    observations: [
      "Public markets reward hybrid architectures (CPU + GPU + QPU) over pure isolated QPU nodes.",
      "The Compute Efficiency Trap remains strong as classical GPU tensors mimic 50+ qubit circuits."
    ],
    evidence: [
      "Classical tensor-network simulator solves 80-qubit circuit in minutes, resetting the commercial edge line.",
      "NVIDIA ships first batch of high-speed optical interfaces for next-gen hybrid nodes."
    ],
    companies: ["NVDA", "GOOG"],
    etfs: ["SOXX", "XSD"],
    policyNotes: "Dual-use technology controls require tracking of exascale co-processing allocations.",
    x: 48,
    y: 50
  },
  {
    id: "networking",
    label: "High-Bandwidth Interconnects",
    category: "Networking",
    confidence: 74,
    observations: [
      "Orchestration of heterogeneous systems is limited by switching latency, not raw node clock speed.",
      "Optical backplanes represent the definitive rail for connecting remote quantum sensors."
    ],
    evidence: [
      "Vite-level laser communication achieves microsecond synchronization across dual-QPU grids.",
      "WisdomTree rebalances WQTM to increase fiber and packaging weights."
    ],
    companies: ["NVDA"],
    etfs: ["QTUM", "WQTM"],
    policyNotes: "High-frequency signal routers subjected to active sovereign export clearance.",
    x: 48,
    y: 15
  },
  {
    id: "ai",
    label: "Orchestration & AI",
    category: "AI",
    confidence: 74,
    observations: [
      "AI inference factories are the ultimate commercial consumer of accelerated quantum pipelines.",
      "Hermes scheduling software captures more compounding margin than hardware manufacturers."
    ],
    evidence: [
      "Google Cloud integrates unified hybrid SDK for automatic dispatch of quantum optimization queries.",
      "NVQLink 2.0 compiler achieves 4x reduction in queue latency for standard machine learning clients."
    ],
    companies: ["GOOG", "NVDA"],
    etfs: ["QTUM"],
    policyNotes: "Algorithms for state-level cryptography decryption categorized as munitions.",
    x: 88,
    y: 50
  },
  {
    id: "quantum",
    label: "Qubit Modalities",
    category: "Quantum",
    confidence: 41,
    observations: [
      "Superconducting circuits vs trapped ions represents a highly speculative, capital-intensive binary bet.",
      "Pre-profit pure hardware plays suffer high cash-burn and continuous dilution."
    ],
    evidence: [
      "IonQ announces 35 algorithmic qubit processor timeline slips by two quarters due to signal calibration.",
      "Rigetti raises $40M at dilutive terms to fund next-generation fridge engineering."
    ],
    companies: ["IONQ", "RGTI"],
    etfs: ["WQTM"],
    policyNotes: "National science foundation expands direct grants to offset public funding freezes.",
    x: 88,
    y: 85
  }
];

export default function App() {
  // --- TELEMETRY CLOCK ---
  const [currentTime, setCurrentTime] = useState<string>("02:29:49 UTC");
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString("en-GB", { hour12: false }) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"doctrine" | "workspace" | "rapids" | "bridge" | "daily" | "chat" | "quantum">("doctrine");
  const [tickers, setTickers] = useState<Record<string, TickerInfo>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Rule of thumb 80/15/5 allocations
  const [allocation, setAllocation] = useState<Allocation>({
    SOXX: 30,
    XSD: 20,
    LIN: 15,
    AMAT: 15,
    NVDA: 10,
    GOOG: 5,
    QTUM: 2,
    WQTM: 2,
    IONQ: 1,
    RGTI: 0
  });

  const [notional, setNotional] = useState<number>(100000); // $100,000 Portfolio
  const [expandedRationaleTicker, setExpandedRationaleTicker] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>("efficiency_trap");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [chatModel, setChatModel] = useState<"gemini" | "nemotron">("nemotron");

  // --- OPENAI KEY VERIFICATION STATE ---
  const [openaiStatus, setOpenaiStatus] = useState<"idle" | "verifying" | "valid" | "invalid" | "missing" | "error">("idle");
  const [openaiMessage, setOpenaiMessage] = useState<string>("");
  const [openaiModelsCount, setOpenaiModelsCount] = useState<number>(0);

  // --- WORKSPACE CARDS STATE (Mobile Workspace - 6 Cards) ---
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardChecklists, setCardChecklists] = useState<Record<string, string[]>>({
    compute: ["GPU leader verification", "NVQLink standard support"],
    infra: ["Switching fabric redundancy", "Power baseload contract check"],
    quantum: ["Cryogenics stability check", "Physics modality isolation"],
    materials: ["Liquid helium logistics safety", "Nanoscale packaging supply"],
    energy: ["Grid storage integration", "Thermal dissipation flow"],
    government: ["Export compliance audit", "Sovereign funding tracking"]
  });

  // --- APP LEVEL OPERATING STATUS STATE ---
  const [isOperatingPictureExpanded, setIsOperatingPictureExpanded] = useState<boolean>(true);

  // --- RAPIDS LENS STATE ---
  const [rapidsWeights, setRapidsWeights] = useState({
    cashFlow: 1.0,
    ecosystemPosition: 0.9,
    capitalIntensity: 0.5, // lower intensity = higher score
    governmentContracts: 0.8,
    aiIntegration: 0.8,
    supplyChainImportance: 0.9,
    scientificLeadership: 0.6
  });

  // --- CRYSTAL BRIDGE STATE ---
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>(INITIAL_KNOWLEDGE_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("compute");
  const [newObservationText, setNewObservationText] = useState<string>("");
  const [newEvidenceText, setNewEvidenceText] = useState<string>("");

  // --- DAILY WORKFLOW & DELTA JOURNAL STATE ---
  const [newsInput, setNewInput] = useState<string>(
    "Sovereign helium reserve levels plunge 14% amid maintenance cycle. Superconducting qubits face supply bottleneck, while Linde (LIN) expands industrial transport capabilities."
  );
  const [workflowStep, setWorkflowStep] = useState<"news" | "hermes" | "tag" | "jemma" | "completed">("news");
  const [extractedEvidence, setExtractedEvidence] = useState<{
    text: string;
    nodes: string[];
    confidence: number;
    provClass: "Observation" | "Evidence" | "Pattern" | "Model" | "Decision" | "Journal";
  }>({
    text: "Sovereign helium reserve drop stresses cryogenics supply line.",
    nodes: ["energy", "materials", "quantum"],
    confidence: 95,
    provClass: "Evidence"
  });

  // Jemma Challenges
  const [jemmaAnswers, setJemmaAnswers] = useState<Record<string, boolean>>({
    contra: false,
    rail: false,
    cash: false,
    fifteen: false,
    ecosystem: false
  });

  const [deltaJournal, setDeltaJournal] = useState<DeltaJournalEntry[]>([
    {
      id: "j-1",
      timestamp: "10:15 GMT",
      newsTitle: "NVIDIA completes primary testing of NVQLink 2.0",
      classification: "Model",
      sourceText: "Native GPU-QPU co-processing demonstrates 4x queue efficiency. Capital flows re-pricing toward Orchestration layers.",
      confidenceScore: 82,
      jemmaPassed: true,
      jemmaResponses: [
        "No major contradicts found; classical hybrid remains the primary bridge.",
        "A true middleware routing rail; independent of who builds the best processor.",
        "Highly cash-generative immediately via enterprise licensing.",
        "Still holds extreme value for exascale AI if quantum takes 15 years.",
        "Buying the entire software stack and network ecosystem."
      ],
      notes: "Reinforces Principle 1: Own the interconnect rails, ignore raw processor speculation.",
      evidenceStars: 5,
      inferenceStars: 4,
      actionabilityStars: 4
    },
    {
      id: "j-2",
      timestamp: "09:30 GMT",
      newsTitle: "Liquid Helium Supply Bottleneck Confirmed",
      classification: "Evidence",
      sourceText: "Cryogenic supply chains report 14% global liquid helium inventory decline due to maintenance shutdowns. Superconducting modalities face immediate operational cooling risks.",
      confidenceScore: 95,
      jemmaPassed: true,
      jemmaResponses: [
        "Substantiated by primary industrial gas shipping manifests.",
        "Proves that superconducting hardware rests on vulnerable physical cooling rails.",
        "Generates solid immediate revenue and pricing power for Linde and global packaging leaders.",
        "Reinforces that materials and transport dominate raw hardware modality over long cycles.",
        "Ecosystem protection: High confidence in industrial gas infrastructure."
      ],
      notes: "Thermodynamic supply chain is a hard rail. Pure quantum hardware lacks buffer.",
      evidenceStars: 5,
      inferenceStars: 3,
      actionabilityStars: 2
    },
    {
      id: "j-3",
      timestamp: "Yesterday",
      newsTitle: "WQTM Rebalancing Increases Interconnect and Packaging Weights",
      classification: "Pattern",
      sourceText: "Global index managers reweight indices, focusing on physical semiconductor substrates, high-speed switching and glass packaging systems over speculative chip startups.",
      confidenceScore: 74,
      jemmaPassed: true,
      jemmaResponses: [
        "Consistent with institutional fund-flow migration away from pre-revenue qubits.",
        "Infers that the structural 'routing' layer is capture-point for investment flows.",
        "Immediate liquidity effect on high-bandwidth optical networking players.",
        "Provides a continuous safety-margin regardless of specific quantum processor timeline slip.",
        "Ecosystem-wide shift towards physical supply chain dominance."
      ],
      notes: "Aligns with Principle 4: Hermes Routing and Principle 1: Own the Rails.",
      evidenceStars: 4,
      inferenceStars: 4,
      actionabilityStars: 3
    },
    {
      id: "j-4",
      timestamp: "2 Days Ago",
      newsTitle: "The Compute Efficiency Trap: Classical GPU Tensors Outpace QPU Benchmarks",
      classification: "Model",
      sourceText: "New mathematical compilers on standard GPU clusters mimic 50+ noiseless physical qubits in minutes, squeezing the commercial edge-case horizon of early quantum processors.",
      confidenceScore: 82,
      jemmaPassed: true,
      jemmaResponses: [
        "Falsifies claims that current NISQ-era quantum hardware provides undeniable advantage.",
        "Suggests that classical acceleration limits are highly elastic and continue to expand.",
        "Reduces commercial urgency for pure quantum hardware integrations today.",
        "Protects physical GPU data-centre scaling over the next 10-15 years.",
        "We remain high-infrastructure-conviction."
      ],
      notes: "Confirms Jemma falsification: Never underestimate the longevity and resilience of the classical GPU tensor rails.",
      evidenceStars: 5,
      inferenceStars: 3,
      actionabilityStars: 1
    }
  ]);

  // --- CHAT WITH ALICE STATE ---
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "m0",
      sender: "alice",
      text: "Good morning, Rod. 🐾 The telemetry grid is active. We are evaluating our picks-and-shovels rails today. No buying, no selling—only evidence accumulation. How shall we route current observations?",
      timestamp: "10:13 GMT"
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- FIREBASE USER & SYNC MONITOR ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<"offline" | "syncing" | "synced" | "error">("offline");
  const [syncError, setSyncError] = useState<string | null>(null);
  const isSyncingFromCloud = useRef<boolean>(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncStatus("syncing");
        try {
          // 1. Fetch saved portfolio
          isSyncingFromCloud.current = true;
          const savedPortfolio = await loadPortfolioFromCloud(currentUser.uid);
          if (savedPortfolio) {
            setAllocation(savedPortfolio.allocation);
            setSelectedScenario(savedPortfolio.selectedScenario as ScenarioType);
            setNotional(savedPortfolio.notional);
          } else {
            // First time user: save current state to cloud
            await savePortfolioToCloud(
              currentUser.uid,
              notional,
              selectedScenario,
              allocation
            );
          }
          isSyncingFromCloud.current = false;

          // 2. Real-time subscribe to delta journal
          const unsubJournal = subscribeToJournal(
            currentUser.uid,
            (entries) => {
              if (entries.length > 0) {
                setDeltaJournal(entries);
              }
            },
            (err) => {
              setSyncError(err.message || String(err));
              setSyncStatus("error");
            }
          );

          // 3. Real-time subscribe to chat messages
          const unsubChat = subscribeToChatMessages(
            currentUser.uid,
            (messages) => {
              if (messages.length > 0) {
                setChatMessages(messages);
              }
            },
            (err) => {
              setSyncError(err.message || String(err));
              setSyncStatus("error");
            }
          );

          // 4. Real-time subscribe to checklists
          const unsubChecklists = subscribeToChecklists(
            currentUser.uid,
            (lists) => {
              if (Object.keys(lists).length > 0) {
                setCardChecklists((prev) => ({ ...prev, ...lists }));
              }
            },
            (err) => {
              setSyncError(err.message || String(err));
              setSyncStatus("error");
            }
          );

          setSyncStatus("synced");

          return () => {
            unsubJournal();
            unsubChat();
            unsubChecklists();
          };
        } catch (err: any) {
          console.error("Failed to initialize sync:", err);
          setSyncStatus("error");
          setSyncError(err.message || String(err));
        }
      } else {
        setSyncStatus("offline");
      }
    });

    return () => unsubscribeAuth();
  }, [user]);

  // --- CLOUD PORTFOLIO SAVER ---
  useEffect(() => {
    if (!user || isSyncingFromCloud.current) return;
    const saveTimeout = setTimeout(async () => {
      try {
        setSyncStatus("syncing");
        await savePortfolioToCloud(user.uid, notional, selectedScenario, allocation);
        setSyncStatus("synced");
      } catch (err: any) {
        setSyncStatus("error");
        setSyncError(err.message || String(err));
      }
    }, 1000); // 1s debounce
    return () => clearTimeout(saveTimeout);
  }, [allocation, selectedScenario, notional, user]);

  // --- CLOUD CHECKLIST SAVER ---
  useEffect(() => {
    if (!user) return;
    // Sync each card checklist to cloud on change
    Object.entries(cardChecklists).forEach(([cardId, items]) => {
      saveCardChecklistToCloud(user.uid, cardId, items as string[]).catch((err) => {
        console.error("Failed to sync checklist to cloud", cardId, err);
      });
    });
  }, [cardChecklists, user]);

  // --- FETCH & REAL-TIME Fluctuations ---
  useEffect(() => {
    fetch("/api/market-data")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setTickers(json.data);
      })
      .catch((err) => console.error("Error fetching market data:", err));

    fetch("/api/alerts")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setAlerts(json.data);
      })
      .catch((err) => console.error("Error fetching alerts:", err));
  }, []);

  // Fluctuations loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTickers((prev) => {
        if (Object.keys(prev).length === 0) return prev;
        const next = { ...prev };
        const symbols = Object.keys(next);
        const randomSymbols = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ];

        randomSymbols.forEach((sym) => {
          if (!next[sym]) return;
          const ticker = next[sym];
          const isUp = Math.random() > 0.46;
          const changePercent = (Math.random() * 0.6) / 100;
          const delta = ticker.price * changePercent * (isUp ? 1 : -1);
          
          const newPrice = Number((ticker.price + delta).toFixed(2));
          const newChange = Number((ticker.change + delta).toFixed(2));
          const newChangePct = Number(((newChange / (ticker.price - newChange)) * 100).toFixed(2));

          const newHistory = [...ticker.history];
          newHistory.shift();
          newHistory.push(newPrice);

          next[sym] = {
            ...ticker,
            price: newPrice,
            change: newChange,
            changePercent: newChangePct,
            history: newHistory
          };
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Chat scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Run simulation on state change
  useEffect(() => {
    if (Object.keys(tickers).length > 0) {
      runSimulation();
    }
  }, [tickers, selectedScenario, allocation, notional]);

  // --- HELPER MATH ---
  const getPercentageByType = () => {
    let infra = 0;
    let emerging = 0;
    let moon = 0;
    Object.entries(allocation).forEach(([sym, val]) => {
      const numericVal = val as number;
      const type = CATEGORY_MAPPING[sym]?.type;
      if (type === "Infrastructure") infra += numericVal;
      if (type === "Emerging Technologies") emerging += numericVal;
      if (type === "Moonshots") moon += numericVal;
    });
    return { infra, emerging, moon };
  };

  const { infra: infraPct, emerging: emergingPct, moon: moonPct } = getPercentageByType();
  const totalAllocatedPercentage = (Object.values(allocation) as number[]).reduce((a: number, b: number) => a + b, 0);

  const handleRebalance = () => {
    const sum = (Object.values(allocation) as number[]).reduce((a: number, b: number) => a + b, 0);
    if (sum === 0) return;
    const factor = 100 / sum;
    const balanced: Allocation = {};
    Object.entries(allocation).forEach(([key, val]) => {
      balanced[key] = Math.round((val as number) * factor);
    });
    const balancedSum = (Object.values(balanced) as number[]).reduce((a: number, b: number) => a + b, 0);
    if (balancedSum !== 100) {
      const diff = 100 - balancedSum;
      const firstKey = Object.keys(balanced)[0];
      balanced[firstKey] += diff;
    }
    setAllocation(balanced);
  };

  const updateAllocation = (ticker: string, value: number) => {
    setAllocation((prev) => ({ ...prev, [ticker]: value }));
  };

  // --- PROJECTED GROWTH SIMULATOR (Principle 2) ---
  const runSimulation = () => {
    setIsSimulating(true);
    const years = Array.from({ length: 11 }, (_, i) => 2026 + i);
    const dataPoints: any[] = [];
    
    let currentPortfolioValue = notional;
    let baselineQubitPortfolioValue = notional;

    const scenarioWeights = {
      efficiency_trap: { quantum: 0.02, semis: 0.12, platform: 0.11, materials: 0.08, qubit_play: -0.05 },
      breakout: { quantum: 0.18, semis: 0.14, platform: 0.15, materials: 0.13, qubit_play: 0.25 },
      energy_crisis: { quantum: 0.04, semis: 0.06, platform: 0.05, materials: 0.15, qubit_play: 0.01 },
      ai_boom: { quantum: 0.08, semis: 0.16, platform: 0.18, materials: 0.10, qubit_play: 0.05 }
    };

    const rates = scenarioWeights[selectedScenario];
    const baselineRates = { efficiency_trap: -0.02, breakout: 0.22, energy_crisis: 0.02, ai_boom: 0.06 };
    const baselineRate = baselineRates[selectedScenario];

    years.forEach((year, index) => {
      if (index === 0) {
        dataPoints.push({
          year: String(year),
          "My Portfolio": Math.round(currentPortfolioValue),
          "Baseline Qubit Focus": Math.round(baselineQubitPortfolioValue)
        });
      } else {
        let weightedRate = 0;
        const totalAlloc = Math.max(1, totalAllocatedPercentage);
        
        Object.entries(allocation).forEach(([ticker, pct]) => {
          const numericPct = pct as number;
          const tickerInfo = tickers[ticker] || STATIC_TICKERS[ticker];
          if (!tickerInfo) return;
          const allocClass = tickerInfo.allocType;
          const classRate = rates[allocClass as keyof typeof rates] || 0.05;
          
          let variance = 0;
          if (ticker === "LIN" && selectedScenario === "energy_crisis") variance = 0.05;
          if (ticker === "NVDA" && selectedScenario === "ai_boom") variance = 0.03;

          weightedRate += (numericPct / totalAlloc) * (classRate + variance);
        });

        // cash/misallocation buffer
        if (Math.abs(totalAllocatedPercentage - 100) > 2) {
          weightedRate -= 0.015;
        }

        currentPortfolioValue = currentPortfolioValue * (1 + weightedRate);
        baselineQubitPortfolioValue = baselineQubitPortfolioValue * (1 + baselineRate);

        dataPoints.push({
          year: String(year),
          "My Portfolio": Math.round(currentPortfolioValue),
          "Baseline Qubit Focus": Math.round(baselineQubitPortfolioValue)
        });
      }
    });

    setSimulationData(dataPoints);
    setIsSimulating(false);
  };

  // --- AI ANALYSIS (Doctrine-informed) ---
  const handleAnalyzePortfolio = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("");
    
    try {
      const response = await fetch("/api/analyze-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allocations: allocation,
          scenario: selectedScenario,
          model: chatModel
        })
      });
      const data = await response.json();
      setAiAnalysis(data.analysis || "Analysis pipeline unavailable.");
    } catch (err) {
      console.error("Analysis query failed:", err);
      setAiAnalysis("Network connection refused. Unable to access Hermes Analysis Node.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- INTERACTIVE CHAT (Real-time SSE Streaming with Thinking Process) ---
  const handleSendChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " GMT"
    };

    const currentMessages = [...chatMessages, userMsg];
    setChatMessages(currentMessages);
    setInputMessage("");
    setIsSendingChat(true);

    if (user) {
      addChatMessageToCloud(user.uid, userMsg).catch((err) => {
        console.error("Failed to save user chat to cloud", err);
      });
    }

    const aliceMsgId = `a-${Date.now()}`;
    const initialAliceMsg: Message = {
      id: aliceMsgId,
      sender: "alice",
      text: "",
      reasoning: "",
      modelUsed: chatModel,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " GMT"
    };

    setChatMessages((prev) => [...prev, initialAliceMsg]);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          model: chatModel
        })
      });

      if (!response.ok) {
        throw new Error(`Stream responded with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No stream reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          if (cleanLine.startsWith("data: ")) {
            try {
              const data = JSON.parse(cleanLine.substring(6));
              if (data.done) {
                break;
              }
              if (data.reasoning) {
                setChatMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aliceMsgId
                      ? { ...msg, reasoning: (msg.reasoning || "") + data.reasoning }
                      : msg
                  )
                );
              }
              if (data.text) {
                setChatMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aliceMsgId
                      ? { ...msg, text: (msg.text || "") + data.text }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore line parse error
            }
          }
        }
      }

      // Save complete message once done
      if (user) {
        setChatMessages((prev) => {
          const finalMsg = prev.find((m) => m.id === aliceMsgId);
          if (finalMsg) {
            addChatMessageToCloud(user.uid, finalMsg).catch((err) => {
              console.error("Failed to save complete alice reply to cloud", err);
            });
          }
          return prev;
        });
      }

    } catch (err) {
      console.error("Streaming chat failed, using fallback:", err);
      // Fallback non-streaming attempt
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: currentMessages, model: chatModel })
        });
        const json = await response.json();
        
        const finalAliceMsg: Message = {
          id: aliceMsgId,
          sender: "alice",
          text: json.reply,
          reasoning: json.reasoning || "",
          modelUsed: json.modelUsed || "gemini",
          timestamp: new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " GMT"
        };

        setChatMessages((prev) =>
          prev.map((m) => m.id === aliceMsgId ? finalAliceMsg : m)
        );

        if (user) {
          addChatMessageToCloud(user.uid, finalAliceMsg).catch((cloudErr) => {
            console.error("Failed to save final fallback message to cloud", cloudErr);
          });
        }
      } catch (fallbackErr) {
        console.error("Complete chat failure:", fallbackErr);
        const errorAliceMsg: Message = {
          id: aliceMsgId,
          sender: "alice",
          text: "I am experiencing high latency on my main neural links, Rod. Let us consult our local, offline Wall Street intelligence map.",
          timestamp: new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " GMT"
        };
        setChatMessages((prev) =>
          prev.map((m) => m.id === aliceMsgId ? errorAliceMsg : m)
        );
      }
    } finally {
      setIsSendingChat(false);
    }
  };

  // --- OPENAI KEY VERIFICATION ---
  const handleVerifyOpenAIKey = async () => {
    setOpenaiStatus("verifying");
    setOpenaiMessage("Routing validation request to server...");
    try {
      const response = await fetch("/api/verify-openai");
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setOpenaiStatus(data.status);
      setOpenaiMessage(data.message);
      if (data.modelsCount !== undefined) {
        setOpenaiModelsCount(data.modelsCount);
      }
    } catch (err: any) {
      console.error("OpenAI verification error:", err);
      setOpenaiStatus("error");
      setOpenaiMessage(`Network or connection error: ${err.message || err}`);
    }
  };

  // --- RAPIDS CALCULATIONS ---
  const getSortedRapids = () => {
    const scored = INITIAL_RAPIDS_DATA.map((item) => {
      const w = rapidsWeights;
      // High weight metrics are multiplied directly, capital intensity is inverted (100 - val) since low intensity is usually desired for pure cash flow efficiency
      const invCap = 100 - item.capitalIntensity;
      const score = (
        item.cashFlow * w.cashFlow +
        item.ecosystemPosition * w.ecosystemPosition +
        invCap * w.capitalIntensity +
        item.governmentContracts * w.governmentContracts +
        item.aiIntegration * w.aiIntegration +
        item.supplyChainImportance * w.supplyChainImportance +
        item.scientificLeadership * w.scientificLeadership
      ) / (w.cashFlow + w.ecosystemPosition + w.capitalIntensity + w.governmentContracts + w.aiIntegration + w.supplyChainImportance + w.scientificLeadership);

      return {
        ...item,
        rapidsScore: Math.round(score)
      };
    });

    return scored.sort((a, b) => b.rapidsScore - a.rapidsScore);
  };

  // --- KNOWLEDGE NODE INTERACTORS ---
  const addObservationToNode = (nodeId: string) => {
    if (!newObservationText.trim()) return;
    setKnowledgeNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? { ...n, observations: [newObservationText, ...n.observations] }
          : n
      )
    );
    setNewObservationText("");
  };

  const addEvidenceToNode = (nodeId: string) => {
    if (!newEvidenceText.trim()) return;
    setKnowledgeNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? { ...n, evidence: [newEvidenceText, ...n.evidence] }
          : n
      )
    );
    setNewEvidenceText("");
  };

  // --- WORKFLOW pipeline handlers ---
  const handleProcessNews = () => {
    setWorkflowStep("hermes");
    // Simulate slight analysis delay
    setTimeout(() => {
      setWorkflowStep("tag");
    }, 1000);
  };

  const handleJemmaAnswerToggle = (key: string) => {
    setJemmaAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isJemmaComplete = Object.values(jemmaAnswers).every((v) => v);

  const handleConfirmJournalEntry = () => {
    const newEntry: DeltaJournalEntry = {
      id: `j-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " GMT",
      newsTitle: extractedEvidence.text,
      classification: extractedEvidence.provClass,
      sourceText: newsInput,
      confidenceScore: extractedEvidence.confidence,
      jemmaPassed: isJemmaComplete,
      jemmaResponses: [
        "Thesis unchallenged; Helium reserve contraction confirms supply-chain importance.",
        "Linde (LIN) is a raw physical infrastructure cooling rail.",
        "Generates solid industrial cash flow today.",
        "Undeniable necessity even if quantum timeline extends beyond 15 years.",
        "Acquiring the physical cooling and containment ecosystem, not the qubit modality."
      ],
      notes: "Provenance trace logged safely. Highly aligned with Principle 1 (Own the Rails).",
      evidenceStars: extractedEvidence.provClass === "Evidence" ? 5 : 4,
      inferenceStars: Math.floor(Math.random() * 2) + 3, // 3 or 4
      actionabilityStars: Math.floor(Math.random() * 3) + 2 // 2, 3 or 4
    };

    setDeltaJournal((prev) => [newEntry, ...prev]);

    if (user) {
      addJournalEntryToCloud(user.uid, newEntry).catch((err) => {
        console.error("Failed to save journal entry to cloud", err);
      });
    }
    
    // Propagate evidence automatically to mapped nodes!
    setKnowledgeNodes((prev) =>
      prev.map((node) => {
        if (extractedEvidence.nodes.includes(node.id)) {
          return {
            ...node,
            evidence: [extractedEvidence.text, ...node.evidence]
          };
        }
        return node;
      })
    );

    setWorkflowStep("completed");
    // Reset checks
    setJemmaAnswers({ contra: false, rail: false, cash: false, fifteen: false, ecosystem: false });
  };

  // Render markdown text
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### ")) {
        return <h4 key={i} className="text-sm font-bold text-cyan-400 mt-4 mb-2 uppercase font-display tracking-wider border-b border-slate-900 pb-1">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("#### ")) {
        return <h5 key={i} className="text-xs font-semibold text-cyan-300 mt-2 mb-1 uppercase tracking-tight">{line.replace("#### ", "")}</h5>;
      }
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const clean = line.trim().replace(/^[\*\-]\s+/, "");
        const parts = clean.split("**");
        return (
          <li key={i} className="text-xs text-slate-300 ml-4 list-disc my-1">
            {parts.map((p, idx) => idx % 2 === 1 ? <strong key={idx} className="text-slate-100 font-semibold">{p}</strong> : p)}
          </li>
        );
      }
      const parts = line.split("**");
      return (
        <p key={i} className="text-xs text-slate-300 leading-relaxed my-1.5">
          {parts.map((p, idx) => idx % 2 === 1 ? <strong key={idx} className="text-slate-100 font-medium">{p}</strong> : p)}
        </p>
      );
    });
  };

  // Colors for donut
  const PIE_COLORS = ["#06b6d4", "#a855f7", "#ec4899", "#10b981", "#eab308"];

  // 6 Workspace Cards Static Definitions
  const workspaceCards = [
    {
      id: "compute",
      title: "🟦 Compute",
      questions: [
        "Who are the definitive GPU leaders?",
        "How fast are CPU fabrics evolving?",
        "Which AI accelerations are gaining direct exascale adoption?",
        "Is high-bandwidth memory (HBM) production meeting demands?"
      ],
      keyTickers: ["NVDA", "GOOG"],
      bg: "bg-blue-950/20 border-blue-900/60 text-blue-300 hover:bg-blue-950/30",
      confidence: 82,
      confidenceBoostReasons: [
        "High immediate enterprise cash flow and compounding software pricing power",
        "Definitive software compiler lock-in and interconnect rails"
      ],
      confidenceReducedReasons: [
        "Extreme capital intensity of raw sub-nanometer foundry expansion",
        "Thermal dissipation limits in high-density co-processing packages"
      ]
    },
    {
      id: "infra",
      title: "🟩 Infrastructure",
      questions: [
        "What networking speeds constrain distributed clusters?",
        "Are fiber lines and switching backplanes scaling in parallel?",
        "Are liquid/two-phase cooling grids deployed at scale?",
        "Does regional power support exascale requirements?"
      ],
      keyTickers: ["SOXX", "XSD"],
      bg: "bg-emerald-950/20 border-emerald-900/60 text-emerald-300 hover:bg-emerald-950/30",
      confidence: 95,
      confidenceBoostReasons: [
        "Non-discretionary physical switching and routing bottlenecks",
        "High switching-fabric redundancy requirement across all exascale hubs"
      ],
      confidenceReducedReasons: [
        "Localized fiber-deployment regulatory delays",
        "Interconnection queue congestion at high-voltage transmission points"
      ]
    },
    {
      id: "quantum",
      title: "🟨 Quantum",
      questions: [
        "Which physical qubit hardware modality is leading engineering?",
        "Who manufactures ultra-precise control electronics?",
        "How reliable are continuous cryogenic fridges (-273°C)?",
        "Can optical photonics solve interconnect routing scale?"
      ],
      keyTickers: ["QTUM", "WQTM", "IONQ", "RGTI"],
      bg: "bg-amber-950/20 border-amber-900/60 text-amber-300 hover:bg-amber-950/30",
      confidence: 41,
      confidenceBoostReasons: [
        "High sovereign funding commitments via strategic defense research grants",
        "Inherent asymptotic advantage of true multi-qubit coherent states"
      ],
      confidenceReducedReasons: [
        "Competing qubit modalities (Superconducting, Trapped Ion, Neutral Atom)",
        "Limited commercial deployments and zero immediate net-positive cash flows",
        "Sparse production evidence in enterprise-scale workloads",
        "Conflicting classical benchmarks (extreme efficiency traps from tensor GPU clusters)"
      ]
    },
    {
      id: "materials",
      title: "🟧 Materials",
      questions: [
        "Who controls semiconductor materials supply?",
        "Which nanochemistry packaging allows extreme low-loss?",
        "Is industrial gas (liquid Helium/Helium-3) scaling?",
        "Who leads precision wafer-fab etching machinery?"
      ],
      keyTickers: ["LIN", "AMAT"],
      bg: "bg-orange-950/20 border-orange-900/60 text-orange-300 hover:bg-orange-950/30",
      confidence: 95,
      confidenceBoostReasons: [
        "Thermodynamic supply chain is an absolute physical rail; cannot be coded around",
        "High packaging atomic density requires specialized nanoscale gas deposition"
      ],
      confidenceReducedReasons: [
        "Vulnerability to global shipping logistics and cryogenic gas container shortages",
        "Sovereign export controls on high-purity silicon substrates"
      ]
    },
    {
      id: "energy",
      title: "🟥 Energy",
      questions: [
        "Is the regional grid fully resilient to rapid exascale loads?",
        "Are small modular nuclear reactors (SMRs) contracted directly?",
        "What backup storage technologies insulate critical cooling?",
        "How is data center heat recycled or dissipated efficiently?"
      ],
      keyTickers: ["LIN"],
      bg: "bg-red-950/20 border-red-900/60 text-red-300 hover:bg-red-950/30",
      confidence: 95,
      confidenceBoostReasons: [
        "Hyperscale exascale clusters require dedicated, non-interruptible baseload power lines",
        "Modular nuclear partnerships provide long-term utility-grade margin insulation"
      ],
      confidenceReducedReasons: [
        "Sluggish nuclear regulatory pathways and high initial capital overhead",
        "Grid transmission losses and local transformer supply shortages"
      ]
    },
    {
      id: "government",
      title: "🟪 Government",
      questions: [
        "What national strategy supports domestic advanced lithography?",
        "How do defense and national labs distribute quantum grants?",
        "Are export controls on helium or materials tightening?",
        "Who is capturing major sovereign co-processing investments?"
      ],
      keyTickers: ["GOOG"],
      bg: "bg-purple-950/20 border-purple-900/60 text-purple-300 hover:bg-purple-950/30",
      confidence: 74,
      confidenceBoostReasons: [
        "Export controls and CHIPS Act solidify structural pricing moat for domestic rails",
        "Sovereign defense contracts guarantee high floor pricing"
      ],
      confidenceReducedReasons: [
        "Funding cycles subject to political turbulence and budget freezes",
        "Bilateral regulatory barriers restrict global sales footprint"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#04060b] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 overflow-x-hidden" id="doctrine-dashboard-root">
      
      {/* 1. TOP DOCKET STREAMER BAR */}
      <div className="bg-[#080d16] border-b border-slate-800/60 py-2 px-4 flex items-center overflow-x-auto whitespace-nowrap justify-between select-none" id="ticker-bar">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mr-2 shrink-0">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-display tracking-widest uppercase text-[11px] glow-cyan">Pathfinder Frontier Substrate [SIMULATED FEEDS]</span>
          </div>
          <div className="flex items-center space-x-5 text-[11px]">
            {Object.entries(tickers).map(([sym, rawTicker]) => {
              const ticker = rawTicker as TickerInfo;
              const isUp = ticker.change >= 0;
              return (
                <div key={sym} className="inline-flex items-center space-x-1.5 shrink-0 hover:bg-slate-900/50 p-1 rounded transition-colors">
                  <span className="font-mono text-slate-400">{sym}</span>
                  <span className="font-mono text-slate-100 font-semibold">${ticker.price.toFixed(2)}</span>
                  <span className={`inline-flex items-center font-mono font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                    {isUp ? "+" : ""}{ticker.changePercent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center space-x-4 shrink-0 text-xs text-slate-500 font-mono">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-cyan-500" />
            <span>{currentTime}</span>
          </div>
          <span className="text-cyan-800">|</span>
          {user ? (
            <div className="flex items-center space-x-2 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-cyan-300 truncate max-w-[120px] font-semibold">{user.displayName || user.email}</span>
              <button 
                onClick={logOut} 
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer ml-1 font-sans"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle} 
              className="flex items-center space-x-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/60 px-2.5 py-1 rounded text-[11px] cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>Connect Cloud Alpha</span>
            </button>
          )}
          {syncStatus !== "offline" && (
            <>
              <span className="text-cyan-800">|</span>
              <span className={`text-[10px] uppercase font-bold flex items-center space-x-1 ${
                syncStatus === "synced" ? "text-emerald-400" :
                syncStatus === "syncing" ? "text-amber-400 animate-pulse" :
                "text-rose-400"
              }`}>
                <span>●</span>
                <span>{syncStatus === "synced" ? "Synced" : syncStatus === "syncing" ? "Syncing" : "Sync Error"}</span>
              </span>
            </>
          )}
          <span className="text-cyan-800">|</span>
          <span className="text-amber-400 font-semibold bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded font-mono text-[10px] uppercase">🐾 Alice Protocol Simulator</span>
        </div>
      </div>

      {/* 2. CHROME STYLE HEADER */}
      <header className="bg-[#060a12]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" id="main-header">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-slate-950 border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-500/5" id="logo-icon">
            <GitPullRequest className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold font-display tracking-tight text-white glow-cyan">PATHFINDER DOCTRINE</h1>
              <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase">WALL STREET ALPHA</span>
            </div>
            <p className="text-xs text-slate-400">An evidence architecture where positions are outputs of disciplined systems reasoning, not speculations.</p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2" id="global-tabs">
          <button
            onClick={() => setActiveTab("doctrine")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeTab === "doctrine" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm" : "bg-slate-950 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Sliders className="w-3.5 h-3.5 inline mr-1.5" />
            <span>1. Doctrine & Store</span>
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeTab === "workspace" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm" : "bg-slate-950 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Briefcase className="w-3.5 h-3.5 inline mr-1.5" />
            <span>2. Mobile Workspace</span>
          </button>
          <button
            onClick={() => setActiveTab("rapids")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeTab === "rapids" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm" : "bg-slate-950 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Database className="w-3.5 h-3.5 inline mr-1.5" />
            <span>3. RAPIDS Lens</span>
          </button>
          <button
            onClick={() => setActiveTab("bridge")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeTab === "bridge" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm" : "bg-slate-950 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Globe className="w-3.5 h-3.5 inline mr-1.5" />
            <span>4. Crystal Bridge</span>
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeTab === "daily" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm animate-pulse" : "bg-slate-950 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Activity className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" />
            <span>5. Daily Workflow</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeTab === "chat" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm" : "bg-slate-950 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
            <span>6. Alice Chat 🐾</span>
          </button>
          <button
            onClick={() => setActiveTab("quantum")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${activeTab === "quantum" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm" : "bg-slate-950 text-slate-400 border-slate-900 hover:text-white"}`}
          >
            <Network className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
            <span>7. Quantum Universe</span>
          </button>
        </div>
      </header>

      {/* 3. CORE CONTENT AREA */}
      <main className="flex-1 p-5 grid grid-cols-1 xl:grid-cols-12 gap-5 overflow-y-auto" id="main-content-layout">

        {/* ========================================================================= */}
        {/* ================= GLOBAL: TODAY'S OPERATING PICTURE ====================== */}
        {/* ========================================================================= */}
        <div className="col-span-12 bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-xl relative overflow-hidden" id="global-operating-picture">
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 w-80 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Doctrine Safety Warning Banner for Simulated/Demonstration Data */}
          <div className="mb-4 p-3 bg-amber-950/10 border border-amber-900/35 text-amber-400 rounded-lg text-[11px] font-mono leading-normal flex items-start gap-2.5 shadow-sm">
            <span className="font-bold shrink-0 uppercase bg-amber-900/30 px-1.5 py-0.5 rounded text-[8px] text-amber-200 tracking-wider">Doctrine Status Alert</span>
            <span className="leading-relaxed">
              <strong>SIMULATED ENVIRONMENT / DEMONSTRATION DATA</strong> — In strict compliance with Pathfinder's sovereign separation mandate, be advised that the ticker tickers, real-time prices, system signals, alert feeds, and certain confidence metrics are <strong>non-provenance-bound simulation assets</strong> designed to demonstrate operational UX geometry. They are not active market endpoints.
            </span>
          </div>
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <span>Today's Operating Picture (Simulated Sandbox)</span>
                  <span className="text-[10px] bg-amber-950/50 text-amber-400 border border-amber-900/40 px-1.5 py-0.5 rounded font-mono font-bold lowercase">demonstration v0.2</span>
                </h2>
                <p className="text-[10px] text-slate-500 font-mono">Disciplined evidence systems monitoring & verification pipeline</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOperatingPictureExpanded(!isOperatingPictureExpanded)}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded text-[10px] font-mono border border-slate-800 transition-all flex items-center gap-1"
            >
              <span>{isOperatingPictureExpanded ? "COLLAPSE CONSOLE" : "EXPAND CONSOLE"}</span>
              <span>{isOperatingPictureExpanded ? "▲" : "▼"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* World Model Stability circular/bar gauge */}
            <div className="md:col-span-4 bg-slate-900/40 border border-slate-850 p-3 rounded-lg flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">World Model Stability</span>
                <span className="text-lg font-bold font-mono text-cyan-400 glow-cyan">87.0%</span>
                <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                  <span>Ecosystem Ready</span>
                </span>
              </div>
              
              <div className="w-24 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850 relative">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: "87%" }}></div>
              </div>
            </div>

            {/* Main Stats Counters */}
            <div className="md:col-span-8 grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div className="bg-slate-900/30 border border-slate-850 p-2.5 rounded-lg flex flex-col items-center text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">Observations</span>
                <span className="text-sm font-bold text-slate-200 font-mono mt-0.5">18</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-850 p-2.5 rounded-lg flex flex-col items-center text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">Evidence Bound</span>
                <span className="text-sm font-bold text-slate-200 font-mono mt-0.5">15</span>
              </div>
              <div className="bg-slate-900/30 border border-amber-950/50 p-2.5 rounded-lg flex flex-col items-center text-center bg-amber-950/5">
                <span className="text-[8px] text-amber-500 font-mono uppercase tracking-widest">Verification Required</span>
                <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 animate-pulse">3</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-850 p-2.5 rounded-lg flex flex-col items-center text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">Rejected</span>
                <span className="text-sm font-bold text-slate-400 font-mono mt-0.5">2</span>
              </div>
              <div className="bg-slate-900/30 border border-rose-950/50 p-2.5 rounded-lg flex flex-col items-center text-center bg-rose-950/5">
                <span className="text-[8px] text-rose-500 font-mono uppercase tracking-widest">Contradictions</span>
                <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 animate-pulse">1</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-850 p-2.5 rounded-lg flex flex-col items-center text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">Decisions</span>
                <span className="text-sm font-bold text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                  <span>0</span>
                  <Lock className="w-2.5 h-2.5 text-rose-500" />
                </span>
              </div>
            </div>
          </div>

          {isOperatingPictureExpanded && (
            <div className="mt-4 pt-3.5 border-t border-slate-900 grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in" id="operating-console-details">
              
              {/* Active contradiction alarm box */}
              <div className="lg:col-span-5 bg-rose-950/10 border border-rose-900/30 p-3 rounded-lg space-y-1.5 text-xs">
                <div className="flex items-center space-x-1.5 text-rose-400 font-bold uppercase tracking-wider text-[10px] font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Active Contradiction Detected (Jemma challenge)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] italic">
                  "Liquid Helium logistics bottlenecks (materials rail) directly clash with superconducting qubit roadmap timing. Hardware play is unverified."
                </p>
                <div className="flex items-center space-x-1 pt-1">
                  <span className="text-[9px] font-mono text-slate-500">Status:</span>
                  <span className="text-[9px] font-mono bg-amber-950/50 text-amber-400 border border-amber-900/40 px-1 py-0.2 rounded font-bold uppercase">Awaiting Falsification Challenge</span>
                </div>
              </div>

              {/* Six Lenses summary metrics */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2 bg-slate-900/50 border border-slate-850 rounded-lg flex items-center justify-between text-xs cursor-pointer hover:bg-slate-900 transition-all" onClick={() => setActiveTab("workspace")}>
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[9px] block">🟦 Compute</span>
                    <span className="font-bold text-white font-mono">82%</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400">Verified</span>
                </div>
                <div className="p-2 bg-slate-900/50 border border-slate-850 rounded-lg flex items-center justify-between text-xs cursor-pointer hover:bg-slate-900 transition-all" onClick={() => setActiveTab("workspace")}>
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[9px] block">🟩 Infra</span>
                    <span className="font-bold text-white font-mono">95%</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400">Verified</span>
                </div>
                <div className="p-2 bg-slate-900/50 border border-slate-850 rounded-lg flex items-center justify-between text-xs cursor-pointer hover:bg-slate-900 transition-all" onClick={() => setActiveTab("workspace")}>
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[9px] block">🟨 Quantum</span>
                    <span className="font-bold text-amber-500 font-mono">41%</span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400 animate-pulse">Needs Proof</span>
                </div>
                <div className="p-2 bg-slate-900/50 border border-slate-850 rounded-lg flex items-center justify-between text-xs cursor-pointer hover:bg-slate-900 transition-all" onClick={() => setActiveTab("workspace")}>
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[9px] block">🟧 Materials</span>
                    <span className="font-bold text-white font-mono">95%</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400">Verified</span>
                </div>
                <div className="p-2 bg-slate-900/50 border border-slate-850 rounded-lg flex items-center justify-between text-xs cursor-pointer hover:bg-slate-900 transition-all" onClick={() => setActiveTab("workspace")}>
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[9px] block">🟥 Energy</span>
                    <span className="font-bold text-white font-mono">95%</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400">Verified</span>
                </div>
                <div className="p-2 bg-slate-900/50 border border-slate-850 rounded-lg flex items-center justify-between text-xs cursor-pointer hover:bg-slate-900 transition-all" onClick={() => setActiveTab("workspace")}>
                  <div>
                    <span className="text-slate-500 font-mono uppercase text-[9px] block">🟪 Government</span>
                    <span className="font-bold text-white font-mono">74%</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold">Ready</span>
                </div>
              </div>

              {/* Operator recommendations box */}
              <div className="col-span-1 lg:col-span-12 bg-[#090f18] border border-cyan-950/50 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 font-medium text-[11px]">
                    <strong className="text-cyan-400">Operator Directive:</strong> Continue collecting physical infrastructure evidence. Do not let speculatory modality allocations bypass validation rails.
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("daily")} 
                    className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 hover:text-white border border-cyan-850/40 text-[10px] font-semibold rounded font-mono"
                  >
                    + GATHER EVIDENCE
                  </button>
                  <button 
                    onClick={() => setActiveTab("chat")} 
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-[10px] font-semibold rounded font-mono"
                  >
                    🐾 ASK ALICE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ================= TAB 1: DOCTRINE & STORE ALLOCATOR ======================= */}
        {/* ========================================================================= */}
        {activeTab === "doctrine" && (
          <>
            {/* Slider Allocator Side */}
            <div className="xl:col-span-7 flex flex-col space-y-4" id="doctrine-allocator-panel">
              
              {/* Concept Banner */}
              <div className="bg-[#0b1220]/80 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 text-cyan-950 text-7xl font-bold select-none pointer-events-none tracking-tighter opacity-15">RAILS</div>
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-display mb-1">Principle 1 — Own the Rails</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Prefer infrastructure over outcomes. Ask: <span className="text-white font-medium italic">“If my prediction is wrong, does this company still earn money?”</span> Highly specialized cryogenics, foundry equipment, and interconnect layers are essential regardless of which quantum manufacturer wins.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-850">Semiconductor Packaging</span>
                  <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-850">Industrial Gases</span>
                  <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-850">High-Bandwidth Switches</span>
                </div>
              </div>

              {/* Sliders Control Panel */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider font-display text-white">Never Bet the World Model Store</h2>
                  </div>
                  <button
                    onClick={handleRebalance}
                    className="text-xs font-semibold px-2.5 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded hover:bg-cyan-900 transition-colors flex items-center space-x-1"
                    id="normalize-sliders-btn"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sync to 100%</span>
                  </button>
                </div>

                {/* Capital & Balance Checks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Total Investment Capital:</span>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                      <input
                        type="number"
                        value={notional}
                        onChange={(e) => setNotional(Math.max(1000, Number(e.target.value)))}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs font-mono text-cyan-400 text-right w-24 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Sum Allocation:</span>
                    <span className={`font-mono font-bold ${totalAllocatedPercentage === 100 ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}>
                      {totalAllocatedPercentage}% / 100%
                    </span>
                  </div>
                </div>

                {/* SLIDERS LIST */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {Object.entries(STATIC_TICKERS).map(([sym, baseTicker]) => {
                    const pct = allocation[sym] || 0;
                    const meta = CATEGORY_MAPPING[sym];
                    const details = tickers[sym] || baseTicker;

                    const colorMap = {
                      Infrastructure: "bg-cyan-500",
                      "Emerging Technologies": "bg-indigo-500",
                      Moonshots: "bg-pink-500"
                    };
                    const typeColor = colorMap[meta?.type as keyof typeof colorMap] || "bg-slate-500";

                    const isExpanded = expandedRationaleTicker === sym;

                    return (
                      <div key={sym} className="space-y-1.5 bg-slate-900/20 p-2.5 rounded-lg border border-slate-900 hover:border-slate-850 transition-colors">
                        <div className="flex justify-between items-center text-xs">
                          <div 
                            className="flex items-center space-x-2 cursor-pointer select-none"
                            onClick={() => setExpandedRationaleTicker(isExpanded ? null : sym)}
                            title="Click to view Pathfinder Doctrine Rationale"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${typeColor}`} />
                            <span className="font-mono font-bold text-slate-200 hover:text-cyan-400 transition-colors flex items-center gap-1">
                              <span>{sym}</span>
                              <span className="text-[8px] bg-slate-950 px-1 py-0.1 border border-slate-800 text-slate-400 hover:text-cyan-400 rounded">WHY?</span>
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{details.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 font-mono">
                            <span className="text-slate-500 text-[10px]">Conf: {meta?.confidence}%</span>
                            <span className="text-slate-400 text-[10px]">${(details.price || 0).toFixed(2)}</span>
                            <span className="text-white font-bold">{pct}%</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={pct}
                          onChange={(e) => updateAllocation(sym, parseInt(e.target.value) || 0)}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
                        />
                        
                        {isExpanded && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-950 text-[10px] text-slate-400 font-mono space-y-1 bg-[#05080f] p-2 rounded animate-fade-in">
                            <div className="font-bold text-cyan-400 uppercase text-[8px] tracking-wider mb-1 flex items-center justify-between">
                              <span>Doctrine Allocation Rationale:</span>
                              <span className="text-slate-500 font-normal">Principle 1 & 2 verified</span>
                            </div>
                            {TICKER_ALLOCATION_RATIONALES[sym]?.map((r, i) => (
                              <div key={i} className="flex items-start gap-1 leading-relaxed">
                                <span className={r.startsWith("●") ? "text-amber-500 font-bold" : "text-cyan-500 font-bold"}>
                                  {r.startsWith("●") ? "!" : "•"}
                                </span>
                                <span className={r.startsWith("●") ? "text-slate-300" : "text-slate-300"}>
                                  {r.replace("● Note:", "Note:")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Diagnostics and Scenario Projection Side */}
            <div className="xl:col-span-5 flex flex-col space-y-4" id="doctrine-diagnostics-panel">
              
              {/* Principle 2 Allocation Audit */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-display mb-3 flex items-center justify-between">
                  <span>Principle 2 — World Model Audit</span>
                  <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-850 px-1.5 py-0.5 rounded font-mono font-normal">Target Model</span>
                </h3>

                <div className="space-y-3">
                  {/* Infrastructure Target Check */}
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-medium text-slate-300">80% Infrastructure Rails</span>
                      <span className="font-mono font-bold text-cyan-400">{infraPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${infraPct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">SOXX, XSD, LIN, AMAT. Own the physical grid.</span>
                  </div>

                  {/* Emerging Technologies Target Check */}
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-medium text-slate-300">15% Emerging Tech Orchestrators</span>
                      <span className="font-mono font-bold text-indigo-400">{emergingPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${emergingPct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">NVDA, GOOG, QTUM, WQTM. Software and routers.</span>
                  </div>

                  {/* Moonshots Target Check */}
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-medium text-slate-300">5% Speculative Moonshots</span>
                      <span className="font-mono font-bold text-pink-400">{moonPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full transition-all duration-300" style={{ width: `${moonPct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">IONQ, RGTI. Speculative hardware modality experiments.</span>
                  </div>
                </div>

                {/* Audit verdict */}
                <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Doctrine Compliance Status:</span>
                  {infraPct >= 70 && moonPct <= 10 ? (
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                      Compliant (Rails Safeguarded)
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold uppercase tracking-wider flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-amber-400" />
                      Variance (Qubit Heavy)
                    </span>
                  )}
                </div>
              </div>

              {/* Scenario stress testing simulator */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-display mb-2">
                    Scenario Projection Simulator
                  </h3>

                  {/* Simulator target disclaimer badge */}
                  <div className="bg-[#090f19] px-2.5 py-1.5 border border-cyan-950/60 rounded-lg font-mono text-[9px] text-amber-500 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                      </span>
                      <span>SIMULATION WORKSPACE LAYER PROFILE</span>
                    </span>
                    <span className="text-slate-500 uppercase">Profile: NVIDIA H100 GPU Cluster + Liquid Helium-3 tank telemetry</span>
                  </div>

                  {/* Selector Grid */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {[
                      { id: "efficiency_trap", label: "⚠️ Efficiency Trap" },
                      { id: "breakout", label: "🚀 Quantum Break" },
                      { id: "energy_crisis", label: "⚡ Energy Crisis" },
                      { id: "ai_boom", label: "🧠 AI Factory Boom" }
                    ].map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => setSelectedScenario(sc.id as ScenarioType)}
                        className={`p-2 text-xs font-semibold rounded border text-left transition-all ${selectedScenario === sc.id ? "bg-cyan-950/40 border-cyan-500 text-cyan-400 font-bold" : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white"}`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>

                  {/* Causal Chain Trace Panel (Doctrine Principle 4 Hermes Routing & Principle 3 RAPIDS) */}
                  <div className="bg-[#050910] border border-slate-900 p-3 rounded-lg mb-4 space-y-2 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-900/60 pb-1.5">
                      <span className="text-cyan-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                        <span>Causal Chain Trace (Hermes Routing)</span>
                      </span>
                      <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1 py-0.2 rounded font-normal">Active Causal Engine</span>
                    </div>
                    <div className="space-y-2.5 pt-1 relative">
                      {/* Subtle vertical line */}
                      <div className="absolute left-1.5 top-2 bottom-2 w-[1px] bg-slate-900"></div>
                      
                      {SCENARIO_CAUSAL_CHAINS[selectedScenario]?.map((node, index) => (
                        <div key={index} className="flex items-start gap-2 relative pl-4">
                          <div className="absolute left-[3px] top-1 w-[7px] h-[7px] rounded-full bg-cyan-500/80 ring-2 ring-slate-950 flex items-center justify-center"></div>
                          <div className="flex-1 space-y-0.5">
                            <div className="font-bold text-slate-200 uppercase text-[8px] tracking-wider flex items-center gap-1.5">
                              <span>{node.title}</span>
                              {index < 3 && <span className="text-cyan-500 font-bold">↓</span>}
                            </div>
                            <p className="text-slate-400 text-[10px] leading-relaxed">{node.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Growth Chart */}
                  <div className="h-[140px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simulationData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="year" stroke="#475569" fontSize={9} />
                        <YAxis stroke="#475569" fontSize={9} />
                        <ChartTooltip contentStyle={{ backgroundColor: "#060a12", borderColor: "#334155" }} />
                        <Area type="monotone" dataKey="My Portfolio" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                        <Area type="monotone" dataKey="Baseline Qubit Focus" stroke="#ec4899" fill="#ec4899" fillOpacity={0.05} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gemini Trigger */}
                <div className="mt-3 pt-3 border-t border-slate-900 flex gap-2">
                  <button
                    onClick={handleAnalyzePortfolio}
                    disabled={isAnalyzing}
                    className="flex-1 py-1.5 px-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 font-bold font-display text-xs rounded transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAnalyzing ? "Querying Hermes Node..." : "Generate Analysis Report"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Full-width AI Analysis Overlay Box if open */}
            {aiAnalysis && (
              <div className="col-span-12 bg-slate-950 border border-slate-800 rounded-xl p-5 relative shadow-2xl">
                <button
                  onClick={() => setAiAnalysis("")}
                  className="absolute right-4 top-4 text-xs font-mono text-slate-500 hover:text-white"
                >
                  [Dismiss]
                </button>
                <div className="flex items-center space-x-2 text-cyan-400 mb-3 border-b border-slate-900 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-widest font-display">🐾 Alice's System Thesis Assessment</span>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                  {renderFormattedText(aiAnalysis)}
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* ================= TAB 2: MOBILE WORKSPACE (6 CARDS) ======================= */}
        {/* ========================================================================= */}
        {activeTab === "workspace" && (
          <div className="col-span-12 flex flex-col space-y-5" id="workspace-6-cards">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider font-display text-white">Strategic Mobile Workspace</h2>
                <p className="text-xs text-slate-400">Six filtering lenses. Collect evidence and verify underlying rails for each strategic sector.</p>
              </div>
              <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono">Mobile Layout Mimic</span>
            </div>

            {/* Grid of 6 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaceCards.map((card) => {
                const completeCount = cardChecklists[card.id]?.length || 0;
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${card.bg} ${selectedCardId === card.id ? "ring-2 ring-cyan-500 border-transparent shadow-lg" : "hover:border-slate-700"}`}
                    id={`workspace-card-${card.id}`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-100">
                          {card.title}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-950/60 border border-slate-800 px-1.5 py-0.5 rounded text-cyan-400">
                          Confidence: {card.confidence}%
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 font-mono italic mb-4">
                        Question: "{card.questions[0]}"
                      </p>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Core Rails Traced</span>
                        <div className="flex gap-1.5">
                          {card.keyTickers.map((t) => (
                            <span key={t} className="text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-850 px-1 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Interactive Checklist</span>
                      <span className="text-cyan-400 font-mono">{completeCount} items</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Detail for Selected Card */}
            {selectedCardId && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-2xl relative">
                <button
                  onClick={() => setSelectedCardId(null)}
                  className="absolute right-4 top-4 text-xs font-mono text-slate-500 hover:text-white"
                >
                  [Close Card]
                </button>
                
                {(() => {
                  const card = workspaceCards.find((c) => c.id === selectedCardId);
                  if (!card) return null;
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-900 pb-3 flex items-center space-x-2">
                        <span className="text-lg font-bold font-display uppercase tracking-wider text-white">
                          {card.title} Workspace Lens
                        </span>
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-900 px-2 py-0.5 rounded font-mono">
                          Certainty rating: {card.confidence}%
                        </span>
                      </div>

                      {/* Confidence explanation details (Doctrine Principle 5 Pathfinder Confidence) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/30 p-4 rounded-lg border border-slate-850/80">
                        <div>
                          <h5 className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                            <span>Sustaining Certainty Evidence</span>
                          </h5>
                          <ul className="space-y-1.5">
                            {card.confidenceBoostReasons?.map((r, i) => (
                              <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block"></span>
                            <span>Reasons Certainty Restricted / Reduced</span>
                          </h5>
                          <ul className="space-y-1.5">
                            {card.confidenceReducedReasons?.map((r, i) => (
                              <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                <span className="text-amber-500 font-bold">●</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Questions list */}
                        <div>
                          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-display mb-3">
                            Critical Systems Questions to Answer
                          </h4>
                          <ul className="space-y-3">
                            {card.questions.map((q, idx) => (
                              <li key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 text-xs text-slate-300 flex items-start space-x-2.5">
                                <span className="text-cyan-500 font-mono font-bold mt-0.5">{idx+1}.</span>
                                <span>{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Interactive local checklist */}
                        <div>
                          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-display mb-3 flex justify-between items-center">
                            <span>Sector Evidence Checklist</span>
                            <span className="text-[10px] font-mono text-slate-500 font-normal">Stored locally</span>
                          </h4>

                          <div className="space-y-2">
                            {cardChecklists[card.id]?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-850">
                                <span className="text-xs text-slate-200">{item}</span>
                                <button
                                  onClick={() => {
                                    setCardChecklists((prev) => ({
                                      ...prev,
                                      [card.id]: prev[card.id].filter((_, i) => i !== idx)
                                    }));
                                  }}
                                  className="text-[10px] font-mono text-rose-500 hover:text-rose-400"
                                >
                                  [Remove]
                                </button>
                              </div>
                            ))}

                            {/* Add checklist item */}
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const val = fd.get("newItem") as string;
                                if (!val.trim()) return;
                                setCardChecklists((prev) => ({
                                  ...prev,
                                  [card.id]: [...(prev[card.id] || []), val]
                                }));
                                e.currentTarget.reset();
                              }}
                              className="flex gap-2 mt-3"
                            >
                              <input
                                name="newItem"
                                placeholder="Record new evidence check..."
                                className="flex-1 bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                              />
                              <button
                                type="submit"
                                className="py-1 px-3 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-semibold text-xs"
                              >
                                Add Verification
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ================= TAB 3: RAPIDS LENS (VECTOR DATAGRID) =================== */}
        {/* ========================================================================= */}
        {activeTab === "rapids" && (
          <RapidsLensDashboard
            allocation={allocation}
            setAllocation={setAllocation}
            tickers={tickers}
            handleRebalance={handleRebalance}
            rapidsWeights={rapidsWeights}
            setRapidsWeights={setRapidsWeights}
          />
        )}

        {/* ========================================================================= */}
        {/* ================= TAB 4: CRYSTAL BRIDGE (KNOWLEDGE GRAPH) ================= */}
        {/* ========================================================================= */}
        {activeTab === "bridge" && (
          <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-5" id="crystal-bridge-panel">
            
            {/* Visual Interactive Map (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg h-[500px]">
              <div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-display">Crystal Bridge (Simulated Topology)</h3>
                    <p className="text-[11px] text-slate-400">Interactive simulated knowledge graph demonstrating causal compute routes and evidence topology.</p>
                  </div>
                  <span className="text-[10px] bg-amber-950/20 text-amber-400 border border-amber-900/30 px-2 py-0.5 rounded font-mono">Simulated Topology</span>
                </div>

                {/* SVG Graph Canvas */}
                <div className="relative bg-[#060a12] border border-slate-900 rounded-lg h-[340px] overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line x1="10%" y1="15%" x2="10%" y2="50%" stroke="#1e293b" strokeWidth="2" strokeDasharray="4" />
                    <line x1="10%" y1="50%" x2="10%" y2="85%" stroke="#1e293b" strokeWidth="2" strokeDasharray="4" />
                    <line x1="10%" y1="50%" x2="48%" y2="50%" stroke="#1e293b" strokeWidth="2" />
                    <line x1="48%" y1="15%" x2="48%" y2="50%" stroke="#1e293b" strokeWidth="2" />
                    <line x1="48%" y1="50%" x2="88%" y2="50%" stroke="#1e293b" strokeWidth="2" />
                    <line x1="88%" y1="50%" x2="88%" y2="85%" stroke="#1e293b" strokeWidth="2" />
                  </svg>

                  {/* Interactive Nodes overlays */}
                  {knowledgeNodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all duration-200 z-10 flex flex-col ${isSelected ? "bg-cyan-950 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10" : "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-600"}`}
                      >
                        <span className="font-semibold font-display tracking-tight whitespace-nowrap">{node.label}</span>
                        <div className="flex justify-between items-center text-[9px] font-mono mt-1 border-t border-slate-800 pt-0.5">
                          <span className="text-slate-500">Conf:</span>
                          <span className="text-cyan-400 font-bold ml-1">{node.confidence}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono italic">
                *Nodes map causal compute dependencies. Double-click node to instantly explore.
              </div>
            </div>

            {/* Node Metadata Explorer Side (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {(() => {
                const node = knowledgeNodes.find((n) => n.id === selectedNodeId);
                if (!node) return null;
                return (
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-lg flex-1 flex flex-col justify-between h-[500px] overflow-y-auto">
                    <div>
                      <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
                        <h4 className="text-sm font-bold uppercase tracking-wider font-display text-white">
                          {node.category} Metadata
                        </h4>
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-900 px-2.5 py-0.5 rounded font-mono font-bold">
                          Certainty: {node.confidence}%
                        </span>
                      </div>

                      {/* Observations List */}
                      <div className="space-y-3 mb-4">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1.5">Observations Log</span>
                          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                            {node.observations.map((obs, idx) => (
                              <p key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-850 text-xs text-slate-300 leading-relaxed">
                                {obs}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Evidence Provenance */}
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1.5">MAPPED EVIDENCE</span>
                          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                            {node.evidence.map((ev, idx) => (
                              <div key={idx} className="bg-emerald-950/25 border border-emerald-900/50 p-2 rounded text-xs text-emerald-300 leading-relaxed flex items-start space-x-1.5">
                                <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                                <span>{ev}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inputs to extend node observations */}
                    <div className="border-t border-slate-900 pt-4 space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Log New Observation</span>
                        <div className="flex gap-2">
                          <input
                            value={newObservationText}
                            onChange={(e) => setNewObservationText(e.target.value)}
                            placeholder="Add strategic system insight..."
                            className="flex-1 bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            onClick={() => addObservationToNode(node.id)}
                            className="py-1 px-3 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-bold text-xs"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ================= TAB 5: DAILY WORKFLOW (HERMES DELTA LAYER) =============== */}
        {/* ========================================================================= */}
        {activeTab === "daily" && (
          <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-5" id="daily-workflow-panel">
            
            {/* Pipeline Intake form (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[480px]">
              <div>
                <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-display">Daily Evidence Intake Pipeline</h3>
                    <p className="text-[11px] text-slate-400">Classify new signals safely through Hermes Routing into the Delta Layer.</p>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono">Pipeline Status: Ready</span>
                </div>

                {/* News Intake Field */}
                {workflowStep === "news" && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1.5">1. News Signal Intake Panel</span>
                      <textarea
                        value={newsInput}
                        onChange={(e) => setNewInput(e.target.value)}
                        placeholder="Paste intelligence report, earnings transcripts, or sovereign policy draft..."
                        rows={5}
                        className="w-full bg-[#060a12] border border-slate-900 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      onClick={handleProcessNews}
                      className="py-2 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-bold font-display text-xs rounded transition-all"
                    >
                      Route Signal via Hermes
                    </button>
                  </div>
                )}

                {/* Hermes Routing Simulation Loading */}
                {workflowStep === "hermes" && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                    <span className="text-xs text-slate-300 font-mono">Hermes analyzer routing data streams...</span>
                  </div>
                )}

                {/* Tag Mapped Nodes */}
                {workflowStep === "tag" && (
                  <div className="space-y-4">
                    <div className="bg-[#0b1220]/80 p-4 border border-slate-850 rounded-lg">
                      <span className="text-[10px] bg-slate-950 text-cyan-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono uppercase block w-max mb-2">Hermes Extracted Provenance</span>
                      <p className="text-xs text-white font-medium mb-2">"{extractedEvidence.text}"</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        Mapped to Nodes: <span className="text-slate-200 font-mono font-semibold">{extractedEvidence.nodes.join(", ").toUpperCase()}</span>
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-2 font-mono">
                        <span>Pathfinder Certainty: {extractedEvidence.confidence}%</span>
                        <span>Class: {extractedEvidence.provClass}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setWorkflowStep("jemma")}
                      className="py-1.5 px-4 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded hover:bg-cyan-900 font-semibold text-xs"
                    >
                      Initialize Jemma Thesis Challenge
                    </button>
                  </div>
                )}

                {/* Jemma Challenge Checklist */}
                {workflowStep === "jemma" && (
                  <div className="space-y-4">
                    <div className="bg-slate-900/60 p-4 border border-slate-850 rounded-lg">
                      <div className="border-b border-slate-850 pb-2 mb-3 flex justify-between items-center">
                        <span className="text-xs font-bold text-cyan-400 font-display uppercase tracking-widest">🐾 Jemma Challenge Challenge Matrix</span>
                        <span className="text-[9px] text-slate-500 font-mono">Verify before Decision moves</span>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-start space-x-2.5 cursor-pointer select-none text-xs">
                          <input
                            type="checkbox"
                            checked={jemmaAnswers.contra}
                            onChange={() => handleJemmaAnswerToggle("contra")}
                            className="mt-0.5 accent-cyan-500"
                          />
                          <span className="text-slate-300">1. What evidence contradicts this thesis? (Have we actively falsified our assumptions?)</span>
                        </label>
                        <label className="flex items-start space-x-2.5 cursor-pointer select-none text-xs">
                          <input
                            type="checkbox"
                            checked={jemmaAnswers.rail}
                            onChange={() => handleJemmaAnswerToggle("rail")}
                            className="mt-0.5 accent-cyan-500"
                          />
                          <span className="text-slate-300">2. Is this company a rail or a destination? (Does it control fundamental rails?)</span>
                        </label>
                        <label className="flex items-start space-x-2.5 cursor-pointer select-none text-xs">
                          <input
                            type="checkbox"
                            checked={jemmaAnswers.cash}
                            onChange={() => handleJemmaAnswerToggle("cash")}
                            className="mt-0.5 accent-cyan-500"
                          />
                          <span className="text-slate-300">3. Does it generate cash flow today? (Avoid absolute pre-revenue tech larping.)</span>
                        </label>
                        <label className="flex items-start space-x-2.5 cursor-pointer select-none text-xs">
                          <input
                            type="checkbox"
                            checked={jemmaAnswers.fifteen}
                            onChange={() => handleJemmaAnswerToggle("fifteen")}
                            className="mt-0.5 accent-cyan-500"
                          />
                          <span className="text-slate-300">4. Would I still own it if quantum took 15 years? (Protects against timeline risk.)</span>
                        </label>
                        <label className="flex items-start space-x-2.5 cursor-pointer select-none text-xs">
                          <input
                            type="checkbox"
                            checked={jemmaAnswers.ecosystem}
                            onChange={() => handleJemmaAnswerToggle("ecosystem")}
                            className="mt-0.5 accent-cyan-500"
                          />
                          <span className="text-slate-300">5. Am I buying technology or an ecosystem? (Verify full integration moats.)</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmJournalEntry}
                        disabled={!isJemmaComplete}
                        className="py-1.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 font-bold font-display text-xs rounded"
                      >
                        {isJemmaComplete ? "Commit to Delta Journal Log" : "Complete checklist to commit"}
                      </button>
                      <button
                        onClick={() => setWorkflowStep("news")}
                        className="py-1.5 px-3 bg-slate-900 border border-slate-850 text-slate-400 rounded text-xs"
                      >
                        Reset Signal
                      </button>
                    </div>
                  </div>
                )}

                {/* Workflow pipeline completed */}
                {workflowStep === "completed" && (
                  <div className="bg-emerald-950/20 border border-emerald-900 p-5 rounded-lg flex flex-col items-center justify-center text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    <h4 className="text-sm font-bold text-emerald-400 font-display uppercase tracking-widest">Delta Layer Provenance Committed</h4>
                    <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                      This signal has been successfully routed by Hermes, passed the Jemma Challenge falsification criteria, and written directly into your portfolio's knowledge base.
                    </p>
                    <button
                      onClick={() => setWorkflowStep("news")}
                      className="py-1.5 px-4 bg-slate-900 border border-slate-850 text-slate-200 text-xs rounded hover:bg-slate-850"
                    >
                      Process Next Daily Signal
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-mono italic">
                *Delta layer acts as historical registry for proven systems evidence.
              </div>
            </div>

            {/* Delta Journal History logs (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col h-[480px] overflow-y-auto">
              <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Delta Provenance Journal Logs</span>
                <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono font-normal">Active History</span>
              </div>

               <div className="space-y-4 flex-1">
                {deltaJournal.map((entry) => (
                  <div key={entry.id} className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-lg space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-slate-950 text-cyan-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">
                        {entry.classification} Log
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{entry.timestamp}</span>
                    </div>

                    <h4 className="font-bold text-white leading-snug">{entry.newsTitle}</h4>
                    <p className="text-slate-300 text-[11px] leading-relaxed italic">"{entry.sourceText}"</p>

                    {/* Three Star Badges: Evidence, Inference, Actionability */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <div className="flex flex-col items-center justify-center bg-slate-950/80 p-1.5 rounded border border-slate-800/40 text-[9px] font-mono">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px] mb-0.5">Evidence</span>
                        <span className="text-amber-500 tracking-tighter text-[11px]">
                          {"★".repeat(entry.evidenceStars || 3)}{"☆".repeat(5 - (entry.evidenceStars || 3))}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-slate-950/80 p-1.5 rounded border border-slate-800/40 text-[9px] font-mono">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px] mb-0.5">Inference</span>
                        <span className="text-cyan-400 tracking-tighter text-[11px]">
                          {"★".repeat(entry.inferenceStars || 3)}{"☆".repeat(5 - (entry.inferenceStars || 3))}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-slate-950/80 p-1.5 rounded border border-slate-800/40 text-[9px] font-mono">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px] mb-0.5">Actionability</span>
                        <span className="text-emerald-400 tracking-tighter text-[11px]">
                          {"★".repeat(entry.actionabilityStars || 2)}{"☆".repeat(5 - (entry.actionabilityStars || 2))}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-850 pt-2 text-[10px] text-slate-500 space-y-1 font-mono">
                      <div>Notes: {entry.notes}</div>
                      <div>Confidence Rank: {entry.confidenceScore}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ================= TAB 6: ALICE CHAT CONVERSATION ======================== */}
        {/* ========================================================================= */}
        {activeTab === "chat" && (
          <div className="col-span-12 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-[520px]">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-3 mb-4 gap-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-display">Alice Systems Advisor Node</h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-500 font-mono">Engine:</span>
                <div className="inline-flex rounded-md p-0.5 bg-[#080d16] border border-slate-800">
                  <button
                    onClick={() => setChatModel("nemotron")}
                    className={`px-2 py-0.5 text-[10px] font-semibold font-mono rounded transition-all cursor-pointer ${chatModel === "nemotron" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}
                  >
                    NVIDIA Nemotron-3 (Thinking)
                  </button>
                  <button
                    onClick={() => setChatModel("gemini")}
                    className={`px-2 py-0.5 text-[10px] font-semibold font-mono rounded transition-all cursor-pointer ${chatModel === "gemini" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}
                  >
                    Gemini 3.5
                  </button>
                </div>
                <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono">🐾 Active Protocol</span>
              </div>
            </div>

            {/* OpenAI Key Verification Pipeline (Doctrine-Strict Safeguard) */}
            <div className="mb-4 p-3 bg-[#080e16] border border-slate-850 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] bg-slate-950 text-cyan-400 border border-slate-800 px-1.5 py-0.2 rounded font-mono font-bold uppercase">OpenAI Key Verification (Operator Check)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ready to Validate</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal max-w-xl">
                  Test the secure status of the OpenAI API key. In line with Pathfinder's sovereign zero-leaking doctrine, this only checks authorization without integrating model endpoints.
                </p>
              </div>

              <div className="flex items-center space-x-3 self-stretch sm:self-auto shrink-0">
                {/* Status Indicator */}
                {openaiStatus !== "idle" && (
                  <div className={`text-[11px] font-mono px-2.5 py-1 rounded border flex items-center space-x-1.5 ${
                    openaiStatus === "verifying" ? "bg-cyan-950/20 border-cyan-800/40 text-cyan-400 animate-pulse" :
                    openaiStatus === "valid" ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" :
                    openaiStatus === "missing" ? "bg-amber-950/20 border-amber-900/40 text-amber-400" :
                    openaiStatus === "invalid" ? "bg-rose-950/20 border-rose-900/40 text-rose-400" :
                    "bg-slate-900 border-slate-800 text-slate-400"
                  }`} title={openaiMessage}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                    <span className="font-semibold uppercase text-[10px]">
                      {openaiStatus === "verifying" ? "Verifying..." :
                       openaiStatus === "valid" ? "Key Verified" :
                       openaiStatus === "missing" ? "No Key Found" :
                       openaiStatus === "invalid" ? "Invalid Key" :
                       "System Error"}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyOpenAIKey}
                  disabled={openaiStatus === "verifying"}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded text-xs font-mono font-medium cursor-pointer flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {openaiStatus === "verifying" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>Verify Status</span>
                </button>
              </div>
            </div>

            {openaiStatus !== "idle" && openaiStatus !== "verifying" && (
              <div className={`mb-4 px-3 py-2 rounded-lg border text-xs font-mono leading-relaxed animate-fade-in ${
                openaiStatus === "valid" ? "bg-emerald-950/10 border-emerald-900/20 text-slate-300" :
                openaiStatus === "missing" ? "bg-amber-950/10 border-amber-900/20 text-amber-300/90" :
                "bg-rose-950/10 border-rose-900/20 text-rose-300/90"
              }`}>
                <div className="font-bold text-[10px] uppercase mb-0.5">
                  {openaiStatus === "valid" ? "✓ Auth Response" : "✗ Verification Failure"}
                </div>
                {openaiMessage}
              </div>
            )}

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
              {chatMessages.map((msg) => {
                const isAlice = msg.sender === "alice";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAlice ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[85%] rounded-lg p-3 border text-xs leading-relaxed ${isAlice ? "bg-slate-900 border-slate-850 text-slate-200" : "bg-cyan-950/40 border-cyan-500/25 text-white"}`}>
                      <div className="flex justify-between items-center text-[9px] font-mono mb-1 text-slate-500">
                        <span>{isAlice ? "🐾 ALICE" : "ROD"}</span>
                        <div className="flex items-center space-x-1.5">
                          {isAlice && (
                            <span className="text-[8px] bg-slate-950 text-slate-500 px-1 py-0.2 rounded uppercase tracking-wider">
                              {msg.modelUsed === "nemotron" ? "NVIDIA" : "Gemini"}
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>

                      {/* Display Active Thought Process for Reasoning Models */}
                      {isAlice && msg.reasoning && (
                        <details className="mb-3 bg-slate-950/80 border border-slate-900 rounded p-2 text-[11px] text-slate-400" open>
                          <summary className="cursor-pointer font-mono font-bold text-cyan-500/80 hover:text-cyan-400 flex items-center space-x-1 select-none focus:outline-none">
                            <Sparkles className="w-3 h-3 text-cyan-500 animate-pulse shrink-0" />
                            <span>Nemotron Thinking Trace ({msg.reasoning.length} chars)</span>
                          </summary>
                          <p className="mt-1.5 font-mono text-slate-500 border-l border-slate-850 pl-2 whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto">
                            {msg.reasoning}
                          </p>
                        </details>
                      )}

                      <p>{msg.text || (isSendingChat && msg.id === chatMessages[chatMessages.length - 1]?.id ? "🐾 Alice is formulating output..." : "")}</p>
                    </div>
                  </div>
                );
              })}
              {isSendingChat && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 text-xs text-slate-500 italic">
                    Alice is querying the Pathfinder model...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Dynamic suggested prompts */}
            <div className="flex flex-wrap gap-1.5 mb-3 border-t border-slate-900 pt-3">
              <button
                onClick={() => handleSendChat(undefined, "Can you review the 5-layer compute hierarchy?")}
                className="text-[10px] bg-slate-900 text-slate-400 border border-slate-850 px-2 py-1 rounded hover:text-white"
              >
                Explain 5-Layer Compute Hierarchy
              </button>
              <button
                onClick={() => handleSendChat(undefined, "What is the Compute Efficiency Trap?")}
                className="text-[10px] bg-slate-900 text-slate-400 border border-slate-850 px-2 py-1 rounded hover:text-white"
              >
                What is the Compute Efficiency Trap?
              </button>
              <button
                onClick={() => handleSendChat(undefined, "How does Linde (LIN) protect our rails portfolio?")}
                className="text-[10px] bg-slate-900 text-slate-400 border border-slate-850 px-2 py-1 rounded hover:text-white"
              >
                How does LIN protect our portfolio?
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="flex gap-2.5">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Alice regarding physical infrastructure rails, timing, or sovereign packaging..."
                className="flex-1 bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isSendingChat}
                className="py-2 px-4 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-lg font-bold text-xs hover:bg-cyan-900 transition-colors shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {activeTab === "quantum" && (
          <QuantumUniverse />
        )}

      </main>

      {/* 4. REAL-TIME SYSTEM ALERTS STREAMER */}
      <footer className="bg-[#04060b] border-t border-slate-800/60 p-4" id="alerts-ticker-footer">
        <div className="flex items-center space-x-2 text-slate-500 text-xs font-mono mb-2">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-500" />
          <span className="uppercase tracking-widest text-[9px]">Live Delta Provenance Signal Log</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {alerts.slice(0, 5).map((al) => {
            const themeMap = {
              info: "bg-cyan-950/30 border-cyan-900/50 text-cyan-400",
              warning: "bg-amber-950/30 border-amber-900/50 text-amber-400",
              danger: "bg-rose-950/30 border-rose-900/50 text-rose-400",
              success: "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
            };
            const theme = themeMap[al.type] || themeMap.info;

            return (
              <div key={al.id} className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${theme}`} id={`alert-item-${al.id}`}>
                <div>
                  <div className="flex justify-between items-center mb-1 text-[9px] font-mono">
                    <span className="font-bold uppercase">{al.title}</span>
                    <span>{al.timestamp}</span>
                  </div>
                  <p className="text-[11px] leading-tight text-slate-300 mb-2 truncate" title={al.message}>
                    {al.message}
                  </p>
                </div>
                <div className="text-[10px] font-mono border-t border-slate-800/40 pt-1 flex justify-between items-center">
                  <span className="text-slate-500">Impact:</span>
                  <span className="font-semibold text-slate-100">{al.impact}</span>
                </div>
              </div>
            );
          })}
        </div>
      </footer>

    </div>
  );
}
