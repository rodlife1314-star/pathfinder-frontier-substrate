export interface TickerInfo {
  symbol: string;
  name: string;
  type: string;
  description: string;
  price: number;
  change: number;
  changePercent: number;
  category: string;
  allocType: "quantum" | "semis" | "platform" | "materials" | "qubit_play";
  history: number[];
}

export interface Alert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: "info" | "warning" | "danger" | "success";
  impact: string;
}

export type ScenarioType = "efficiency_trap" | "breakout" | "energy_crisis" | "ai_boom";

export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
  icon: string;
}

export interface Message {
  id: string;
  sender: "user" | "alice";
  text: string;
  timestamp: string;
  reasoning?: string;
  modelUsed?: "gemini" | "nemotron";
}

export type Allocation = Record<string, number>;

// PATHFINDER V0.1 DOCTRINE SPECIFIC TYPES
export interface RapidsVector {
  ticker: string;
  name: string;
  cashFlow: number;            // High Weight
  ecosystemPosition: number;   // High Weight
  capitalIntensity: number;    // Medium Weight (low = better score usually, or as raw feature)
  governmentContracts: number; // High Weight
  aiIntegration: number;       // High Weight
  supplyChainImportance: number;// High Weight
  scientificLeadership: number; // Medium Weight
  confidenceScore: number;     // Pathfinder Confidence Principle 5
  classification: "Compute" | "Networking" | "Materials" | "Cloud" | "Security" | "Control Systems" | "Energy";
}

export interface GraphNode {
  node_id: string;
  node_type: "company" | "etf" | "rail" | "technology" | "material" | "supplier" | "customer" | "government-programme" | "research-institution" | "geography" | "evidence-source" | "risk";
  label: string;
  attributes: {
    ticker?: string;
    rail?: string;
    description?: string;
    category?: string;
    [key: string]: any;
  };
  schema_version: string;
  created_at: string;
}

export interface GraphEdge {
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: "OPERATES_IN" | "SUPPLIES" | "DEPENDS_ON" | "HOLDS" | "FUNDS" | "PARTNERS_WITH" | "REQUIRES" | "SUPPORTS";
  weight: number;      // Strength or magnitude of relationship
  confidence: number;  // Certainty in the evidence
  source_id?: string;
  evidence_id?: string;
  valid_from: string;
  valid_to: string | null;
  status: "verified" | "inferred";
  schema_version: string;
}

export interface DeltaJournalEntry {
  id: string;
  timestamp: string;
  newsTitle: string;
  classification: "Observation" | "Evidence" | "Pattern" | "Model" | "Decision" | "Journal";
  sourceText: string;
  confidenceScore: number;
  jemmaPassed: boolean;
  jemmaResponses: string[];
  notes: string;
  evidenceStars?: number;
  inferenceStars?: number;
  actionabilityStars?: number;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  category: "Macroeconomics" | "Energy" | "Compute" | "AI" | "Networking" | "Quantum" | "Materials" | "Manufacturing" | "Supply Chains";
  confidence: number;
  observations: string[];
  evidence: string[];
  companies: string[];
  etfs: string[];
  policyNotes: string;
  x: number; // visual placement
  y: number; // visual placement
}

export type QuantumCategory =
  | "Compute"
  | "Quantum Hardware"
  | "Semiconductor Fabrication"
  | "Advanced Materials"
  | "Cryogenics"
  | "Test & Measurement"
  | "Photonics / Lasers"
  | "Networking"
  | "AI Infrastructure"
  | "Cloud / Hyperscalers"
  | "Industrial Automation"
  | "Power & Energy"
  | "Government / Defence Exposure"
  | "Quantum Software"
  | "ETFs / Infrastructure Funds";

export type QuantumModality =
  | "Superconducting"
  | "Spin"
  | "Trapped Ion"
  | "Neutral Atom"
  | "Photonic"
  | "Modality Agnostic";

export interface QuantumEntity {
  ticker: string;
  company: string;
  primaryRail: QuantumCategory;
  secondaryRail: QuantumCategory;
  reasonForInclusion: string;
  currentRole: string;
  confidence: number; // 0 to 100
  evidenceSources: string[];
  knownDependencies: string[];
  spofRelevance: string; // empty string if none, otherwise describes the single-point-of-failure exposure
  modalityDependence: QuantumModality;
  isSpeculative: boolean;
  pageRank?: number;
  betweennessCentrality?: number;
}

export interface FrontierInfrastructureNode {
  nodeId: string;
  legalName: string;
  ticker?: string;
  exchange?: string;
  universe: "quantum" | "fusion" | "shared-substrate";
  primaryRail: string;
  secondaryRails: string[];
  publicStatus: "public" | "private" | "subsidiary";
  modalityExposure: string[];
  evidenceStatus: "verified" | "partial" | "edge-pending" | "under-review";
  substitutability: "low" | "medium" | "high" | "unknown";
  qualificationBurden: "low" | "medium" | "high" | "unknown";
  geographicConcentration: "low" | "medium" | "high" | "unknown";
  evidenceRefs: string[];
  observation: string;
  inference?: string;
  confidence: number;
  graphVersion: string;
  // Pathfinder Corporate-Action and Ontology State Additions
  tradable?: boolean;
  referenceOnly?: boolean;
  transactionState?: "RUMOURED" | "ANNOUNCED" | "FILED" | "SHAREHOLDER_APPROVED" | "CLOSED" | "TRADING_LIVE" | "TERMINATED" | "WITHDRAWN" | "DELAYED";
  publicExposureState?: "LIVE" | "PROSPECTIVE" | "NONE";
  fusionExposure?: "CONTINGENT_ON_CLOSE" | "DIRECT" | "INDIRECT" | "NONE";
  expectedClose?: string;
  targetCompany?: string;
  technology?: string;
  graphRole?: string;
  effectiveDate?: string;
  pendingPublicTransaction?: {
    counterparty: string;
    state: "rumoured" | "announced" | "filed" | "shareholder_approved" | "closed" | "trading_live" | "terminated" | "withdrawn" | "delayed";
    expectedClose: string;
  };
}



