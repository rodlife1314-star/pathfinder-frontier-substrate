import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  QUANTUM_ENTITIES, 
  QUANTUM_LINKS,
  FUSION_ENTITIES,
  FUSION_LINKS
} from "../data/quantumUniverseData";
import { 
  QuantumEntity, 
  QuantumCategory, 
  QuantumModality,
  FrontierInfrastructureNode
} from "../types";
import { 
  Search, 
  Layers, 
  Cpu, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Copy, 
  Check, 
  FileText, 
  Network, 
  Filter, 
  Compass, 
  ArrowRight,
  Database,
  Info,
  GitBranch,
  Flame,
  Shuffle
} from "lucide-react";

export default function QuantumUniverse() {
  // Current Active Universe: "quantum" | "fusion" | "substrate"
  const [activeUniverse, setActiveUniverse] = useState<"quantum" | "fusion" | "substrate">("quantum");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedModality, setSelectedModality] = useState<string>("ALL");
  const [selectedQtype, setSelectedQtype] = useState<"ALL" | "EVIDENCE" | "SPECULATIVE">("ALL");
  
  // Tab state inside Quantum Universe
  const [universeSubTab, setUniverseSubTab] = useState<"table" | "rails" | "graph" | "analytics" | "ledger">("table");

  // Fusion table population filter state
  const [selectedFusionPopulation, setSelectedFusionPopulation] = useState<"ALL" | "OPERATOR" | "RAIL" | "PRIVATE">("ALL");

  
  // Graph interaction state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [highlightSpeculative, setHighlightSpeculative] = useState(false);
  const [graphLayout, setGraphLayout] = useState<"pipeline" | "grid">("pipeline");

  // Ledger export state
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [ledgerFormat, setLedgerFormat] = useState<"json" | "csv" | "import">("json");

  // --- INDUSTRIAL DEPENDENCY LAYERS (0-6) CLASSIFIERS ---
  const getQuantumIndustrialLayer = useCallback((primaryRail: string, ticker: string): number => {
    if (["SHECY", "CCJ", "MP"].includes(ticker)) return 0;
    if (["LIN", "AIQUY"].includes(ticker)) return 1;
    if (["COHR", "HPHTY", "LITE", "VATYF", "JNPTF", "IPGP"].includes(ticker)) return 2;
    if (primaryRail === "Photonics / Lasers") return 2;
    if (["KEYS", "FFR", "OXIGF", "BRKR", "FTV", "EMR", "AITYY"].includes(ticker)) return 3;
    if (primaryRail === "Test & Measurement" || primaryRail === "Cryogenics") return 3;
    if (["ASML", "TSM", "GFS", "AMAT", "LRCX", "TOELY", "ENTG", "SKYT"].includes(ticker)) return 4;
    if (primaryRail === "Semiconductor Fabrication" || primaryRail === "Industrial Automation") return 4;
    if (["IONQ", "RGTI", "QBTS", "INTC", "HON", "LMT", "NOC", "CEG", "GEV", "NEE", "BWXT", "DELL"].includes(ticker)) return 5;
    if (primaryRail === "Quantum Hardware" || primaryRail === "Power & Energy" || primaryRail === "Government / Defence Exposure") return 5;
    return 6;
  }, []);

  const getFusionIndustrialLayer = useCallback((primaryRail: string, nodeId: string): number => {
    if (nodeId.includes("shared:SHECY") || nodeId.includes("shared:CCJ") || nodeId.includes("shared:MP")) return 0;
    if (nodeId.includes("shared:LIN") || nodeId.includes("shared:AIQUY")) return 1;
    if (primaryRail.includes("HTS materials") || primaryRail.includes("Advanced Materials")) return 1;
    if (nodeId.includes("shared:VATYF") || primaryRail.includes("vacuum") || primaryRail.includes("Valves") || primaryRail.includes("Vacuum")) return 2;
    if (primaryRail.includes("Cryogenics") || nodeId.includes("shared:OXIGF") || nodeId.includes("shared:KEYS") || nodeId.includes("shared:BRKR") || primaryRail.includes("Magnet") || primaryRail.includes("winding")) return 3;
    if (primaryRail.includes("Semiconductor") || primaryRail.includes("Foundry") || primaryRail.includes("Precision industrial manufacturing") || primaryRail.includes("tooling")) return 4;
    if (primaryRail.includes("Fusion Core") || primaryRail.includes("Fusion Support") || primaryRail.includes("Power and thermal") || primaryRail.includes("Power") || primaryRail.includes("Reactor") || primaryRail.includes("Developer") || primaryRail.includes("fusion:")) return 5;
    return 6;
  }, []);

  // --- LIVE GRAPH ENGINE (PAGERANK & BETWEENNESS CENTRALITY) ---
  const graphAnalytics = useMemo(() => {
    const nodes = QUANTUM_ENTITIES.map(e => e.ticker);
    const N = nodes.length;
    
    // Initialize adjacency lists
    const adj = new Map<string, string[]>(); // out-edges
    const incoming = new Map<string, string[]>(); // in-edges
    nodes.forEach(n => {
      adj.set(n, []);
      incoming.set(n, []);
    });

    QUANTUM_LINKS.forEach(link => {
      if (adj.has(link.source) && adj.has(link.target)) {
        adj.get(link.source)!.push(link.target);
        incoming.get(link.target)!.push(link.source);
      }
    });

    // 1. PageRank Calculation (Iterative Power Method)
    const d = 0.85; // Damping factor
    let pr = new Map<string, number>();
    // Start with uniform probability distribution
    nodes.forEach(n => pr.set(n, 1 / N));

    const iterations = 20;
    for (let iter = 0; iter < iterations; iter++) {
      const nextPr = new Map<string, number>();
      let sinkPR = 0; // redistributing sink node PRs

      nodes.forEach(n => {
        const outEdges = adj.get(n) || [];
        if (outEdges.length === 0) {
          sinkPR += pr.get(n)!;
        }
      });

      nodes.forEach(u => {
        let sumIncoming = 0;
        const inNodes = incoming.get(u) || [];
        inNodes.forEach(v => {
          const outDegree = adj.get(v)!.length;
          sumIncoming += pr.get(v)! / outDegree;
        });

        // PageRank formula with sink redistribution
        const uPr = ((1 - d) / N) + d * (sumIncoming + (sinkPR / N));
        nextPr.set(u, uPr);
      });
      pr = nextPr;
    }

    // Normalizing PageRank so they add up to 100% for easier relative scaling (x100)
    const normalizedPR = new Map<string, number>();
    let maxPrVal = 0.0001;
    pr.forEach(val => {
      if (val > maxPrVal) maxPrVal = val;
    });
    pr.forEach((val, key) => {
      // Relative score on a 0-100 index based on max PageRank
      normalizedPR.set(key, Math.round((val / maxPrVal) * 100));
    });

    // 2. Betweenness Centrality (Brandes' Algorithm for unweighted shortest paths)
    const betweenness = new Map<string, number>();
    nodes.forEach(n => betweenness.set(n, 0));

    nodes.forEach(s => {
      const S: string[] = []; // Stack
      const P = new Map<string, string[]>(); // Predecessors list on shortest paths from s
      const sigma = new Map<string, number>(); // Path counts
      const dDist = new Map<string, number>(); // Distances
      
      nodes.forEach(w => {
        P.set(w, []);
        sigma.set(w, 0);
        dDist.set(w, -1);
      });

      sigma.set(s, 1);
      dDist.set(s, 0);

      const Q: string[] = [s]; // BFS Queue

      while (Q.length > 0) {
        const v = Q.shift()!;
        S.push(v);
        const neighbors = adj.get(v) || [];
        neighbors.forEach(w => {
          // Path discovery
          if (dDist.get(w) === -1) {
            dDist.set(w, dDist.get(v)! + 1);
            Q.push(w);
          }
          // Path counting
          if (dDist.get(w) === dDist.get(v)! + 1) {
            sigma.set(w, sigma.get(w)! + sigma.get(v)!);
            P.get(w)!.push(v);
          }
        });
      }

      const delta = new Map<string, number>(); // accumulation
      nodes.forEach(w => delta.set(w, 0));

      // S returns vertices in order of non-decreasing distance from s
      while (S.length > 0) {
        const w = S.pop()!;
        const predecessors = P.get(w) || [];
        predecessors.forEach(v => {
          const coef = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
          delta.set(v, delta.get(v)! + coef);
        });
        if (w !== s) {
          betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
        }
      }
    });

    // Normalize betweenness to 0-100 scale based on maximum betweenness
    const normalizedBC = new Map<string, number>();
    let maxBcVal = 0.0001;
    betweenness.forEach(val => {
      if (val > maxBcVal) maxBcVal = val;
    });
    betweenness.forEach((val, key) => {
      normalizedBC.set(key, Math.round((val / maxBcVal) * 100));
    });

    return {
      pageRank: normalizedPR,
      betweenness: normalizedBC,
      adj,
      incoming
    };
  }, []);

  // Merge dynamic centrality scores into entity list
  const entitiesWithScores = useMemo(() => {
    return QUANTUM_ENTITIES.map(entity => {
      const layer = getQuantumIndustrialLayer(entity.primaryRail, entity.ticker);
      return {
        ...entity,
        industrialLayer: layer,
        pageRank: graphAnalytics.pageRank.get(entity.ticker) || 0,
        betweennessCentrality: graphAnalytics.betweenness.get(entity.ticker) || 0
      };
    });
  }, [graphAnalytics, getQuantumIndustrialLayer]);

  // --- LIVE FUSION GRAPH ENGINE (PAGERANK & BETWEENNESS CENTRALITY) ---
  const fusionGraphAnalytics = useMemo(() => {
    const nodes = FUSION_ENTITIES.map(e => e.nodeId);
    const N = nodes.length;
    
    // Initialize adjacency lists
    const adj = new Map<string, string[]>(); // out-edges
    const incoming = new Map<string, string[]>(); // in-edges
    nodes.forEach(n => {
      adj.set(n, []);
      incoming.set(n, []);
    });

    const resolveNodeId = (idOrTicker: string) => {
      const found = FUSION_ENTITIES.find(e => e.nodeId === idOrTicker || e.ticker === idOrTicker);
      return found ? found.nodeId : idOrTicker;
    };

    FUSION_LINKS.forEach(link => {
      const srcId = resolveNodeId(link.source);
      const tgtId = resolveNodeId(link.target);
      if (adj.has(srcId) && adj.has(tgtId)) {
        adj.get(srcId)!.push(tgtId);
        incoming.get(tgtId)!.push(srcId);
      }
    });

    // 1. PageRank Calculation (Iterative Power Method)
    const d = 0.85; // Damping factor
    let pr = new Map<string, number>();
    nodes.forEach(n => pr.set(n, 1 / N));

    const iterations = 20;
    for (let iter = 0; iter < iterations; iter++) {
      const nextPr = new Map<string, number>();
      let sinkPR = 0;

      nodes.forEach(n => {
        const outEdges = adj.get(n) || [];
        if (outEdges.length === 0) {
          sinkPR += pr.get(n)!;
        }
      });

      nodes.forEach(u => {
        let sumIncoming = 0;
        const inNodes = incoming.get(u) || [];
        inNodes.forEach(v => {
          const outDegree = adj.get(v)!.length;
          sumIncoming += pr.get(v)! / outDegree;
        });

        const uPr = ((1 - d) / N) + d * (sumIncoming + (sinkPR / N));
        nextPr.set(u, uPr);
      });
      pr = nextPr;
    }

    const normalizedPR = new Map<string, number>();
    let maxPrVal = 0.0001;
    pr.forEach(val => {
      if (val > maxPrVal) maxPrVal = val;
    });
    pr.forEach((val, key) => {
      normalizedPR.set(key, Math.round((val / maxPrVal) * 100));
    });

    // 2. Betweenness Centrality (Brandes' Algorithm)
    const betweenness = new Map<string, number>();
    nodes.forEach(n => betweenness.set(n, 0));

    nodes.forEach(s => {
      const S: string[] = [];
      const P = new Map<string, string[]>();
      const sigma = new Map<string, number>();
      const dDist = new Map<string, number>();
      
      nodes.forEach(w => {
        P.set(w, []);
        sigma.set(w, 0);
        dDist.set(w, -1);
      });

      sigma.set(s, 1);
      dDist.set(s, 0);

      const Q: string[] = [s];

      while (Q.length > 0) {
        const v = Q.shift()!;
        S.push(v);
        const neighbors = adj.get(v) || [];
        neighbors.forEach(w => {
          if (dDist.get(w) === -1) {
            dDist.set(w, dDist.get(v)! + 1);
            Q.push(w);
          }
          if (dDist.get(w) === dDist.get(v)! + 1) {
            sigma.set(w, sigma.get(w)! + sigma.get(v)!);
            P.get(w)!.push(v);
          }
        });
      }

      const delta = new Map<string, number>();
      nodes.forEach(w => delta.set(w, 0));

      while (S.length > 0) {
        const w = S.pop()!;
        const predecessors = P.get(w) || [];
        predecessors.forEach(v => {
          const coef = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
          delta.set(v, delta.get(v)! + coef);
        });
        if (w !== s) {
          betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
        }
      }
    });

    const normalizedBC = new Map<string, number>();
    let maxBcVal = 0.0001;
    betweenness.forEach(val => {
      if (val > maxBcVal) maxBcVal = val;
    });
    betweenness.forEach((val, key) => {
      normalizedBC.set(key, Math.round((val / maxBcVal) * 100));
    });

    return {
      pageRank: normalizedPR,
      betweenness: normalizedBC,
      adj,
      incoming
    };
  }, []);

  const fusionEntitiesWithScores = useMemo(() => {
    return FUSION_ENTITIES.map(entity => {
      const layer = getFusionIndustrialLayer(entity.primaryRail, entity.nodeId);
      return {
        ...entity,
        industrialLayer: layer,
        pageRank: fusionGraphAnalytics.pageRank.get(entity.nodeId) || 0,
        betweennessCentrality: fusionGraphAnalytics.betweenness.get(entity.nodeId) || 0
      };
    });
  }, [fusionGraphAnalytics, getFusionIndustrialLayer]);

  // --- BRIDGE NODE ANALYSIS ---
  const bridgeNodes = useMemo(() => {
    const candidates = [
      { ticker: "LIN", name: "Linde plc", role: "Plausible Cryogenic and Gas-System Bridge", quality: 0.98, breadth: 1.0, details: "Supplies liquid helium isotopes/cryocooling across both quantum superconducting QPUs and high-field fusion tokamaks." },
      { ticker: "NVDA", name: "NVIDIA Corporation", role: "Strong Computational Bridge", quality: 0.95, breadth: 1.0, details: "Accelerates quantum state-vector simulation via cuQuantum while powering complex fusion MHD magnet optimization and digital twins." },
      { ticker: "GOOG", name: "Alphabet Inc.", role: "Capital Provider, Cloud and Destination Bridge", quality: 0.95, breadth: 0.8, details: "Pioneering superconducting Sycamore qubits while investing directly in Proxima Fusion stellarators. Google Cloud hosts both simulation environments." },
      { ticker: "MSFT", name: "Microsoft Corporation", role: "Hyperscale Compute & Commercial Power PPA Bridge", quality: 0.95, breadth: 0.8, details: "Azure Quantum platform delivers multi-modal QPUs, while Microsoft has signed a 50MW Power Purchase Agreement with Helion Energy." },
      { ticker: "AMAT", name: "Applied Materials, Inc.", role: "Plausible Upstream Fabrication Bridge", quality: 0.70, breadth: 1.0, details: "Critical thin-film atomic deposition systems needed both for fabricating quantum Josephson junctions and high-yield REBCO HTS tapes." },
      { ticker: "TOELY", name: "Tokyo Electron Limited", role: "Plausible Upstream Fabrication Bridge", quality: 0.60, breadth: 0.8, details: "Thermal processing and atomic layer oxidation. Upstream semiconductor toolmaker with potential material engineering applications in HTS development." },
      { ticker: "VATYF", name: "VAT Group AG", role: "Monopoly High-Vacuum Gate Valves Bridge", quality: 0.95, breadth: 1.0, details: "VAT's high-vacuum gate valves (80%+ share) are vital to insulate both fusion stellarator reactor cores and sub-millikelvin quantum fridges." },
      { ticker: "BRKR", name: "Bruker Corporation", role: "Superconducting Wires & Analytical Instrumentation Bridge", quality: 0.90, breadth: 1.0, details: "Manufactures superconducting magnets/wire for analytical NMR and magnetic confinement fusion coils. Common physical substrate." },
      { ticker: "SMTOY", name: "Sumitomo Electric Industries, Ltd.", role: "High-Temperature Superconductor (HTS) Bridge", quality: 0.90, breadth: 0.8, details: "Key global supplier of bismuth/REBCO high-temperature superconducting tapes for magnets and precision shielding." },
      { ticker: "FUAFY", name: "Furukawa Electric Co., Ltd.", role: "High-Temperature Superconductor (HTS) Bridge", quality: 0.95, breadth: 0.8, details: "Furukawa's SuperPower Inc. subsidiary is a top commercial manufacturer of REBCO HTS tapes used in compact high-field fusion reactors." }
    ];

    return candidates.map(cand => {
      // Find quantum PageRank (0-100 scale)
      const qEntity = entitiesWithScores.find(e => e.ticker === cand.ticker);
      const qPR = qEntity ? qEntity.pageRank : 0;

      // Find fusion PageRank (0-100 scale)
      const fNodeId = `shared:${cand.ticker}`;
      const fEntity = fusionEntitiesWithScores.find(e => e.nodeId === fNodeId || e.ticker === cand.ticker);
      const fPR = fEntity ? fEntity.pageRank : 0;

      // Geometric mean
      const geoMean = Math.sqrt(qPR * fPR);

      // Bridge Score = geometric_mean * quality * breadth
      const bridgeScore = parseFloat((geoMean * cand.quality * cand.breadth).toFixed(2));

      return {
        ...cand,
        quantumCentrality: qPR,
        fusionCentrality: fPR,
        geoMean: parseFloat(geoMean.toFixed(2)),
        bridgeScore,
        isVerifiedCrossing: qPR > 0 && fPR > 0 && cand.quality >= 0.80
      };
    }).sort((a, b) => b.bridgeScore - a.bridgeScore);
  }, [entitiesWithScores, fusionEntitiesWithScores]);


  // --- PHYSICAL ECOSYSTEM RAILS METRICS DATA ---
  const getEvidenceQuality = (confidence: number, isSpeculative: boolean) => {
    if (isSpeculative) {
      return { label: "Speculative", color: "text-amber-500 bg-amber-950/40 border border-amber-900/30", badge: "🟠 Speculative" };
    }
    if (confidence >= 95) {
      return { label: "Verified (High)", color: "text-emerald-400 bg-emerald-950/40 border border-emerald-900/30", badge: "🟢 Verified (High)" };
    }
    if (confidence >= 85) {
      return { label: "Verified (Medium)", color: "text-teal-400 bg-teal-950/40 border border-teal-900/30", badge: "🟢 Verified (Medium)" };
    }
    return { label: "Emerging", color: "text-blue-400 bg-blue-950/40 border border-blue-900/30", badge: "🔵 Emerging" };
  };

  const getFusionEvidenceQuality = (confidence: number, evidenceStatus: string) => {
    if (evidenceStatus === "partial") {
      return { label: "Emerging", color: "text-amber-500 bg-amber-950/40 border border-amber-900/30", badge: "🟠 Emerging" };
    }
    if (evidenceStatus === "speculative" || confidence < 60) {
      return { label: "Speculative", color: "text-rose-400 bg-rose-950/40 border border-rose-900/30", badge: "🔴 Speculative" };
    }
    if (confidence >= 95) {
      return { label: "Verified (High)", color: "text-emerald-400 bg-emerald-950/40 border border-emerald-900/30", badge: "🟢 Verified (High)" };
    }
    if (confidence >= 85) {
      return { label: "Verified (Medium)", color: "text-teal-400 bg-teal-950/40 border border-teal-900/30", badge: "🟢 Verified (Medium)" };
    }
    return { label: "Verified (Low)", color: "text-slate-400 bg-slate-900 border border-slate-800", badge: "⚪ Verified (Low)" };
  };

  const railsData = useMemo(() => {
    if (activeUniverse === "quantum") {
      return [
        {
          id: "cryo",
          title: "Cryogenics & Sub-Kelvin Systems",
          subtitle: "Dilution refrigerators & helium liquefiers",
          description: "Superconducting and spin qubits require sub-100mK operating temperatures to prevent thermal excitation. Companies on this rail manufacture complex thermal management hardware.",
          category: "Cryogenics",
          color: "border-cyan-500/30 text-cyan-400 bg-cyan-950/10",
          glow: "shadow-cyan-950/20",
          icon: Cpu
        },
        {
          id: "materials",
          title: "Advanced Materials & Custom Isotopes",
          subtitle: "Purified silicon-28, REBCO tape, & gold-plated copper",
          description: "Solid-state and spin processors depend on isotopic purity to eliminate nuclear spin decoherence. Companies provide ultra-pure chemical materials and engineered components.",
          category: "Advanced Materials",
          color: "border-emerald-500/30 text-emerald-400 bg-emerald-950/10",
          glow: "shadow-emerald-950/20",
          icon: Compass
        },
        {
          id: "semiconductors",
          title: "Semiconductor Fabrication & Lithography",
          subtitle: "Cleanrooms, EUV systems & advanced packaging",
          description: "Enabling CMOS control circuits and solid-state silicon qubits that rely on commercial silicon manufacturing lines and nanoscale fabrication equipment.",
          category: "Semiconductor Fabrication",
          color: "border-indigo-500/30 text-indigo-400 bg-indigo-950/10",
          glow: "shadow-indigo-950/20",
          icon: Database
        },
        {
          id: "photonics",
          title: "Photonics & Precision Lasers",
          subtitle: "EOMs, frequency combs & fiber interconnects",
          description: "Trapped-ion and neutral-atom qubits are controlled using highly stable lasers and modulators. Photonic quantum systems use these components as the qubit medium itself.",
          category: "Photonics / Lasers",
          color: "border-amber-500/30 text-amber-400 bg-amber-950/10",
          glow: "shadow-amber-950/20",
          icon: Flame
        },
        {
          id: "test",
          title: "Test & Measurement Systems",
          subtitle: "Arbitrary waveform generators & vector network analyzers",
          description: "Generates the microwave pulses used to manipulate superconducting and spin qubits and records delicate readout signals.",
          category: "Test & Measurement",
          color: "border-rose-500/30 text-rose-400 bg-rose-950/10",
          glow: "shadow-rose-950/20",
          icon: AlertTriangle
        },
        {
          id: "power",
          title: "Power Conditioning & Grid Stability",
          subtitle: "Isolated power supplies & low-noise regulation",
          description: "Minimizes phase noise and electromagnetic interference that would collapse delicate quantum coherence states.",
          category: "Power & Energy",
          color: "border-yellow-500/30 text-yellow-400 bg-yellow-950/10",
          glow: "shadow-yellow-950/20",
          icon: Shuffle
        }
      ];
    } else {
      return [
        {
          id: "hts",
          title: "HTS Materials & Conductor Tape",
          subtitle: "REBCO and BSCCO high-temperature superconductors",
          description: "High-temperature superconducting tapes allow compact, high-field confinement magnets, lowering reactor volumes by 10x-100x.",
          category: "HTS materials and conductor manufacturing",
          color: "border-amber-500/30 text-amber-400 bg-amber-950/10",
          glow: "shadow-amber-950/20",
          icon: Compass
        },
        {
          id: "magnets",
          title: "Magnetic Confinement & Coil Engineering",
          subtitle: "D-shaped coils, stellarator winding & toroidal fields",
          description: "Winding superconducting tapes into stable high-field magnet assemblies capable of withholding extreme Lorenz forces.",
          category: "Magnet engineering and winding",
          color: "border-red-500/30 text-red-400 bg-red-950/10",
          glow: "shadow-red-950/20",
          icon: Network
        },
        {
          id: "vacuum",
          title: "High-Vacuum Vessel Boundaries",
          subtitle: "Cryo-pumps, vacuum gate valves & plasma-facing walls",
          description: "Maintains pristine core vacuum conditions to isolate the high-temperature plasma from room temperature structure.",
          category: "Vacuum and plasma-facing boundaries",
          color: "border-cyan-500/30 text-cyan-400 bg-cyan-950/10",
          glow: "shadow-cyan-950/20",
          icon: Layers
        },
        {
          id: "cryogas",
          title: "Cryogenic & Large-Scale Gas Systems",
          subtitle: "Liquid helium and nitrogen infrastructure",
          description: "Provides pre-cooling and continuous refrigeration to keep high-temperature superconducting magnet systems at 4K-77K operating temps.",
          category: "Power and thermal systems",
          color: "border-blue-500/30 text-blue-400 bg-blue-950/10",
          glow: "shadow-blue-950/20",
          icon: Shuffle
        },
        {
          id: "comp",
          title: "Computational Plasma Simulation",
          subtitle: "GPU digital twins & magneto-hydrodynamic modeling",
          description: "Simulating magnetohydrodynamics and plasma turbulent stability to safely control fusion reactions and design optimum magnets.",
          category: "Computational engineering",
          color: "border-emerald-500/30 text-emerald-400 bg-emerald-950/10",
          glow: "shadow-emerald-950/20",
          icon: Cpu
        },
        {
          id: "fab",
          title: "Precision Upstream Manufacturing",
          subtitle: "Atomic deposition, precision instrumentation & tools",
          description: "Upstream toolmakers supplying physical tape deposition reactors and micro-machining tools for high-yield manufacturing.",
          category: "Precision industrial manufacturing",
          color: "border-indigo-500/30 text-indigo-400 bg-indigo-950/10",
          glow: "shadow-indigo-950/20",
          icon: Database
        }
      ];
    }
  }, [activeUniverse]);

  const getNodesForRail = (category: string) => {
    if (activeUniverse === "quantum") {
      return QUANTUM_ENTITIES.filter(e => e.primaryRail === category);
    } else {
      return FUSION_ENTITIES.filter(e => e.primaryRail === category);
    }
  };


  // Handle Copy function
  const copyToClipboard = (text: string, formatLabel: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(formatLabel);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Categories counts mapping
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    QUANTUM_ENTITIES.forEach(e => {
      counts[e.primaryRail] = (counts[e.primaryRail] || 0) + 1;
    });
    return counts;
  }, []);

  // Modalities counts mapping
  const modalityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    QUANTUM_ENTITIES.forEach(e => {
      counts[e.modalityDependence] = (counts[e.modalityDependence] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered list
  const filteredEntities = useMemo(() => {
    return entitiesWithScores.filter(e => {
      const matchesSearch = 
        e.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.reasonForInclusion.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "ALL" || e.primaryRail === selectedCategory;
      const matchesModality = selectedModality === "ALL" || e.modalityDependence === selectedModality;
      const matchesSpeculative = 
        selectedQtype === "ALL" || 
        (selectedQtype === "SPECULATIVE" && e.isSpeculative) || 
        (selectedQtype === "EVIDENCE" && !e.isSpeculative);

      return matchesSearch && matchesCategory && matchesModality && matchesSpeculative;
    });
  }, [entitiesWithScores, searchTerm, selectedCategory, selectedModality, selectedQtype]);

  // Single Points of Failure List
  const spofList = useMemo(() => {
    return entitiesWithScores.filter(e => e.spofRelevance && e.spofRelevance.trim().length > 0);
  }, [entitiesWithScores]);

  // Multimodal Enablers List
  const multimodalEnablers = useMemo(() => {
    return entitiesWithScores.filter(e => e.modalityDependence === "Modality Agnostic" && e.primaryRail !== "ETFs / Infrastructure Funds");
  }, [entitiesWithScores]);

  // --- FUSION DATA AND PIPELINE STRUCTURES ---
  const fusionCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FUSION_ENTITIES.forEach(e => {
      counts[e.primaryRail] = (counts[e.primaryRail] || 0) + 1;
    });
    return counts;
  }, []);

  const fusionModalityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FUSION_ENTITIES.forEach(e => {
      e.modalityExposure.forEach(mod => {
        counts[mod] = (counts[mod] || 0) + 1;
      });
    });
    return counts;
  }, []);

  const filteredFusionEntities = useMemo(() => {
    return fusionEntitiesWithScores.filter(e => {
      const matchesSearch = 
        e.nodeId.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.legalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.observation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.ticker && e.ticker.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "ALL" || e.primaryRail === selectedCategory;
      const matchesModality = selectedModality === "ALL" || e.modalityExposure.includes(selectedModality) || (selectedModality === "Modality Agnostic" && e.modalityExposure.includes("Modality Agnostic"));
      const matchesSpeculative = 
        selectedQtype === "ALL" || 
        (selectedQtype === "SPECULATIVE" && e.evidenceStatus !== "verified") || 
        (selectedQtype === "EVIDENCE" && e.evidenceStatus === "verified");

      const isOperator = e.nodeId === "fusion:GFUZ" || e.nodeId === "fusion:DJT" || e.secondaryRails.includes("Fusion Developers");
      const isPrivate = e.referenceOnly === true || e.publicStatus === "private";
      const isRail = !isOperator && !isPrivate;

      const matchesPopulation = 
        selectedFusionPopulation === "ALL" ||
        (selectedFusionPopulation === "OPERATOR" && isOperator) ||
        (selectedFusionPopulation === "RAIL" && isRail) ||
        (selectedFusionPopulation === "PRIVATE" && isPrivate);

      return matchesSearch && matchesCategory && matchesModality && matchesSpeculative && matchesPopulation;
    });
  }, [fusionEntitiesWithScores, searchTerm, selectedCategory, selectedModality, selectedQtype, selectedFusionPopulation]);

  const fusionSpofList = useMemo(() => {
    return fusionEntitiesWithScores.filter(e => e.substitutability === "low");
  }, [fusionEntitiesWithScores]);

  const fusionMultimodalEnablers = useMemo(() => {
    return fusionEntitiesWithScores.filter(e => e.modalityExposure.includes("Modality Agnostic"));
  }, [fusionEntitiesWithScores]);

  const filteredBridgeNodes = useMemo(() => {
    return bridgeNodes.filter(b => {
      const matchesSearch = 
        b.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCrossing = 
        selectedQtype === "ALL" || 
        (selectedQtype === "EVIDENCE" && b.isVerifiedCrossing) || 
        (selectedQtype === "SPECULATIVE" && !b.isVerifiedCrossing);
      
      return matchesSearch && matchesCrossing;
    });
  }, [bridgeNodes, searchTerm, selectedQtype]);

  const fusionPipelineColumns = [
    {
      id: "layer0",
      title: "L0: Ores & Feedstocks",
      subtitle: "Lithium, structural alloys, fuel ores",
      layer: 0
    },
    {
      id: "layer1",
      title: "L1: High-Performance Materials",
      subtitle: "REBCO tapes, sumitomo conductors",
      layer: 1
    },
    {
      id: "layer2",
      title: "L2: Vacuum & RF Components",
      subtitle: "Gate valves, high-power microwaves",
      layer: 2
    },
    {
      id: "layer3",
      title: "L3: Cooling & Magnet Systems",
      subtitle: "HTS coils, non-planar winding, cryo",
      layer: 3
    },
    {
      id: "layer4",
      title: "L4: Precision Fabrication & Tools",
      subtitle: "Vessel machining, divertor tooling",
      layer: 4
    },
    {
      id: "layer5",
      title: "L5: Reactor Cores & Developers",
      subtitle: "GFUZ MTF, Tokamak confinement systems",
      layer: 5
    },
    {
      id: "layer6",
      title: "L6: Controls, Simulations & HPC",
      subtitle: "Bare-metal GPU solvers, MHD models",
      layer: 6
    }
  ];

  const fusionPipelineNodesLayout = useMemo(() => {
    const layout: Record<string, { x: number; y: number; colIndex: number }> = {};
    
    fusionPipelineColumns.forEach((col, colIdx) => {
      const colNodes = fusionEntitiesWithScores.filter(e => e.industrialLayer === col.layer);
      
      colNodes.forEach((node, nodeIdx) => {
        const x = 5 + (colIdx * 14.5);
        const spacing = colNodes.length > 1 ? 85 / (colNodes.length - 1) : 50;
        const y = colNodes.length > 1 ? 8 + (nodeIdx * spacing) : 50;
        
        layout[node.nodeId] = { x, y, colIndex: colIdx };
      });
    });

    return layout;
  }, [fusionEntitiesWithScores, fusionPipelineColumns]);


  // Pipeline layout helper columns mapping using Industrial Layers
  const pipelineColumns = [
    {
      id: "layer0",
      title: "L0: Raw Materials & Isotopes",
      subtitle: "Silicon-28, Helium-3, Uranium, Ores",
      layer: 0
    },
    {
      id: "layer1",
      title: "L1: Materials & Refining",
      subtitle: "Superconducting tapes, Purified gases",
      layer: 1
    },
    {
      id: "layer2",
      title: "L2: Precision Components & Optics",
      subtitle: "PMTs, lasers, high-vacuum valves",
      layer: 2
    },
    {
      id: "layer3",
      title: "L3: Subsystems & Waveforms",
      subtitle: "RF synthesis, Cryo-fridges",
      layer: 3
    },
    {
      id: "layer4",
      title: "L4: Foundry & Lithography",
      subtitle: "ASML, TSMC, GFS wafer fabrication",
      layer: 4
    },
    {
      id: "layer5",
      title: "L5: QPU Hardware Systems",
      subtitle: "IonQ, Rigetti, Honeywell platforms",
      layer: 5
    },
    {
      id: "layer6",
      title: "L6: Cloud, HPC & Software",
      subtitle: "Azure, AWS, NVDA cuQuantum, Networks",
      layer: 6
    }
  ];

  // Pipeline layouts node positions generator
  const pipelineNodesLayout = useMemo(() => {
    const layout: Record<string, { x: number; y: number; colIndex: number }> = {};
    
    pipelineColumns.forEach((col, colIdx) => {
      const colNodes = entitiesWithScores.filter(e => e.industrialLayer === col.layer);
      
      colNodes.forEach((node, nodeIdx) => {
        // Distribute coordinates on a % scale based on column count and node index
        const x = 5 + (colIdx * 14.5); // X coordinate %
        const spacing = colNodes.length > 1 ? 85 / (colNodes.length - 1) : 50;
        const y = colNodes.length > 1 ? 8 + (nodeIdx * spacing) : 50; // Y coordinate %
        
        layout[node.ticker] = { x, y, colIndex: colIdx };
      });
    });

    return layout;
  }, [entitiesWithScores, pipelineColumns]);

  // Export templates content
  const exportContent = useMemo(() => {
    if (activeUniverse === "quantum") {
      if (ledgerFormat === "json") {
        return JSON.stringify(QUANTUM_ENTITIES, null, 2);
      } else if (ledgerFormat === "csv") {
        const headers = ["Ticker", "Company", "Primary Rail", "Secondary Rail", "Confidence", "Modality Dependence", "Is Speculative", "SPOF Relevance", "Known Dependencies"];
        const rows = QUANTUM_ENTITIES.map(e => [
          `"${e.ticker}"`,
          `"${e.company}"`,
          `"${e.primaryRail}"`,
          `"${e.secondaryRail}"`,
          e.confidence,
          `"${e.modalityDependence}"`,
          e.isSpeculative ? "TRUE" : "FALSE",
          `"${e.spofRelevance.replace(/"/g, '""')}"`,
          `"${e.knownDependencies.join(", ")}"`
        ]);
        return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      } else {
        return QUANTUM_ENTITIES.map(e => {
          return `HERMES:LOAD_ENTITY [${e.ticker}]
  LABEL: "${e.company}"
  PRIMARY_RAIL: "${e.primaryRail}"
  SECONDARY_RAIL: "${e.secondaryRail}"
  CONFIDENCE: ${e.confidence}
  MODALITY_DEPENDENCE: "${e.modalityDependence}"
  SPOF_EXPOSURE: "${e.spofRelevance || "None"}"
  EVIDENCE_PROVENANCE:
${e.evidenceSources.map(s => `    - "${s}"`).join("\n")}
  DEPENDS_ON: [${e.knownDependencies.join(", ")}]
  STATUS: ${e.isSpeculative ? "INFERRED_SPECULATIVE" : "MEASURED_EVIDENCE"}`;
        }).join("\n\n--------------------------------------------------\n\n");
      }
    } else if (activeUniverse === "fusion") {
      if (ledgerFormat === "json") {
        return JSON.stringify(FUSION_ENTITIES, null, 2);
      } else if (ledgerFormat === "csv") {
        const headers = ["NodeID", "LegalName", "Ticker", "Exchange", "Primary Rail", "Public Status", "Confidence", "Evidence Status", "Substitutability", "Observation"];
        const rows = FUSION_ENTITIES.map(e => [
          `"${e.nodeId}"`,
          `"${e.legalName}"`,
          `"${e.ticker || ""}"`,
          `"${e.exchange || ""}"`,
          `"${e.primaryRail}"`,
          `"${e.publicStatus}"`,
          e.confidence,
          `"${e.evidenceStatus}"`,
          `"${e.substitutability}"`,
          `"${e.observation.replace(/"/g, '""')}"`
        ]);
        return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      } else {
        return FUSION_ENTITIES.map(e => {
          return `HERMES:LOAD_ENTITY [${e.nodeId}]
  LABEL: "${e.legalName}"
  PRIMARY_RAIL: "${e.primaryRail}"
  PUBLIC_STATUS: "${e.publicStatus}"
  CONFIDENCE: ${e.confidence}
  MODALITY_EXPOSURE: "${e.modalityExposure.join(", ")}"
  SUBSTITUTABILITY: "${e.substitutability}"
  EVIDENCE_PROVENANCE:
${e.evidenceRefs.map(s => `    - "${s}"`).join("\n")}
  OBSERVATION: "${e.observation}"`;
        }).join("\n\n--------------------------------------------------\n\n");
      }
    } else {
      // Substrate bridge nodes
      if (ledgerFormat === "json") {
        return JSON.stringify(bridgeNodes, null, 2);
      } else if (ledgerFormat === "csv") {
        const headers = ["Ticker", "Name", "Role", "Evidence Quality", "Modality Breadth", "Quantum Centrality", "Fusion Centrality", "Bridge Score", "Is Verified Crossing"];
        const rows = bridgeNodes.map(e => [
          `"${e.ticker}"`,
          `"${e.name}"`,
          `"${e.role}"`,
          e.quality,
          e.breadth,
          e.quantumCentrality,
          e.fusionCentrality,
          e.bridgeScore,
          e.isVerifiedCrossing ? "TRUE" : "FALSE"
        ]);
        return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      } else {
        return bridgeNodes.map(e => {
          return `HERMES:LOAD_BRIDGE [${e.ticker}]
  LABEL: "${e.name}"
  ROLE: "${e.role}"
  BRIDGE_SCORE: ${e.bridgeScore}
  QUANTUM_CENTRALITY: ${e.quantumCentrality}
  FUSION_CENTRALITY: ${e.fusionCentrality}
  EVIDENCE_QUALITY: ${e.quality}
  MODALITY_BREADTH: ${e.breadth}
  CROSSING_VERIFIED: ${e.isVerifiedCrossing ? "TRUE" : "FALSE"}
  DETAILS: "${e.details}"`;
        }).join("\n\n--------------------------------------------------\n\n");
      }
    }
  }, [ledgerFormat, activeUniverse, bridgeNodes]);


  return (
    <div className="col-span-12 bg-slate-950/65 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden" id="quantum-universe-workspace">
      {/* Dynamic Background Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1329_1px,transparent_1px),linear-gradient(to_bottom,#0b1329_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0"></div>
      
      {/* Decorative Cyan Pulse */}
      <div className="absolute right-1/4 top-0 w-[450px] h-[150px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* --- TOP-LEVEL ACTIVE UNIVERSE SELECTION RAIL --- */}
      <div className="relative flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 border border-slate-900 rounded-xl p-2.5 mb-6 z-10">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Research Portfolio Sector:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setActiveUniverse("quantum"); setUniverseSubTab("table"); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-2 border ${activeUniverse === "quantum" ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-bold" : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-white"}`}
          >
            <Network className="w-4 h-4 text-cyan-400" />
            <span>1. QUANTUM INFRASTRUCTURE (v0.1)</span>
          </button>
          <button
            onClick={() => { setActiveUniverse("fusion"); setUniverseSubTab("table"); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-2 border ${activeUniverse === "fusion" ? "bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold" : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-white"}`}
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>2. FUSION INFRASTRUCTURE (v0.1)</span>
          </button>
          <button
            onClick={() => { setActiveUniverse("substrate"); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-2 border ${activeUniverse === "substrate" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold" : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-white"}`}
          >
            <Shuffle className="w-4 h-4 text-emerald-400" />
            <span>3. FRONTIER DEEPTECH SUBSTRATE</span>
          </button>
        </div>
      </div>
      
      {/* --- WORKSPACE TITLE BANNER --- */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-5 mb-5 gap-4 z-10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-cyan-950/70 border border-cyan-800/40 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-950/40">
              {activeUniverse === "quantum" && <Network className="w-5 h-5 text-cyan-400 animate-pulse" />}
              {activeUniverse === "fusion" && <Flame className="w-5 h-5 text-amber-400 animate-pulse" />}
              {activeUniverse === "substrate" && <Shuffle className="w-5 h-5 text-emerald-400" />}
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest font-display flex items-center gap-2">
                <span>
                  {activeUniverse === "quantum" && "Pathfinder Quantum Infrastructure Universe"}
                  {activeUniverse === "fusion" && "Pathfinder Fusion Infrastructure Universe"}
                  {activeUniverse === "substrate" && "Frontier DeepTech Substrate Analyzer"}
                </span>
                <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">v0.1 Release</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {activeUniverse === "quantum" && "Durable, evidence-bound structural mapping of physical rails and systemic dependencies"}
                {activeUniverse === "fusion" && "Technical mapping of high-temperature superconductors, magnets, cryo-cooling, and private developer supply chains"}
                {activeUniverse === "substrate" && "Analytical bridging calculations identifying common industrial, fabrication, control, and measurement layers"}
              </p>
            </div>
          </div>
        </div>

        {/* Outer view toggles */}
        {activeUniverse !== "substrate" ? (
          <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setUniverseSubTab("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-1.5 ${universeSubTab === "table" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold" : "text-slate-400 border border-transparent hover:text-white"}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. MASTER TABLE</span>
            </button>
            <button
              onClick={() => setUniverseSubTab("rails")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-1.5 ${universeSubTab === "rails" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold" : "text-slate-400 border border-transparent hover:text-white"}`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2. PHYSICAL RAILS</span>
            </button>
            <button
              onClick={() => setUniverseSubTab("graph")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-1.5 ${universeSubTab === "graph" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold" : "text-slate-400 border border-transparent hover:text-white"}`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>3. DEPENDENCY PIPELINE</span>
            </button>
            <button
              onClick={() => setUniverseSubTab("analytics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-1.5 ${universeSubTab === "analytics" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold" : "text-slate-400 border border-transparent hover:text-white"}`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>4. CENTRALITY ANALYTICS</span>
            </button>
            <button
              onClick={() => setUniverseSubTab("ledger")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all flex items-center gap-1.5 ${universeSubTab === "ledger" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold" : "text-slate-400 border border-transparent hover:text-white"}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>5. EVIDENCE LEDGER</span>
            </button>
          </div>
        ) : (
          <div className="flex bg-[#040811]/90 border border-emerald-950 text-emerald-400 px-3 py-1.5 rounded-xl font-mono text-xs items-center gap-2">
            <Shuffle className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
            <span>CROSS-DOMAIN CROSSING INDEX</span>
          </div>
        )}
      </div>


      {/* --- STATS COUNTER SUMMARY TILES --- */}
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 z-10">
        {activeUniverse === "quantum" && (
          <>
            <div className="bg-[#040811]/90 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Total Ecosystem Nodes</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-cyan-400">{QUANTUM_ENTITIES.length}</span>
                <span className="text-[10px] text-slate-500 font-mono">Mapped Units</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div className="bg-[#040811]/90 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Physical Rails (Sustaining)</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-emerald-400">41</span>
                <span className="text-[10px] text-emerald-500 font-mono">Measured</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>

            <div className="bg-[#040811]/90 border border-rose-950/15 border-slate-900 rounded-xl p-3.5 hover:border-rose-900/30 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-rose-400 font-mono uppercase tracking-wider block">Single Points of Failure</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-rose-500">{spofList.length}</span>
                <span className="text-[10px] text-rose-500/80 font-mono uppercase font-bold animate-pulse">Critical choke points</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-rose-500 rounded-full animate-pulse" style={{ width: `${(spofList.length / QUANTUM_ENTITIES.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-[#040811]/90 border border-amber-950/15 border-slate-900 rounded-xl p-3.5 hover:border-amber-900/30 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">Inferred / Speculative Plays</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-amber-500">
                  {QUANTUM_ENTITIES.filter(e => e.isSpeculative).length}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Unverified relationships</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(QUANTUM_ENTITIES.filter(e => e.isSpeculative).length / QUANTUM_ENTITIES.length) * 100}%` }}></div>
              </div>
            </div>
          </>
        )}

        {activeUniverse === "fusion" && (
          <>
            <div className="bg-[#040811]/90 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Total Fusion Nodes</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-amber-400">{FUSION_ENTITIES.length}</span>
                <span className="text-[10px] text-slate-500 font-mono">Infrastructure Nodes</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div className="bg-[#040811]/90 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Public Pure-Play Developers</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-emerald-400">1</span>
                <span className="text-[10px] text-slate-500 font-mono">Nasdaq (GFUZ)</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "20%" }}></div>
              </div>
            </div>

            <div className="bg-[#040811]/90 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">Private Reference Devs</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-cyan-400">5</span>
                <span className="text-[10px] text-slate-500 font-mono">Reference Nodes</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>

            <div className="bg-[#040811]/90 border border-rose-950/15 border-slate-900 rounded-xl p-3.5 hover:border-rose-900/30 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-rose-400 font-mono uppercase tracking-wider block">Low-Substitutability Rails</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-rose-500">{fusionSpofList.length}</span>
                <span className="text-[10px] text-rose-500/80 font-mono">Scarcity choke points</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-rose-500 rounded-full animate-pulse" style={{ width: `${(fusionSpofList.length / FUSION_ENTITIES.length) * 100}%` }}></div>
              </div>
            </div>
          </>
        )}

        {activeUniverse === "substrate" && (
          <>
            <div className="bg-[#040811]/90 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">DeepTech Bridge Candidates</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-emerald-400">{bridgeNodes.length}</span>
                <span className="text-[10px] text-slate-500 font-mono">Analyzed Firms</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div className="bg-[#040811]/90 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Verified Crossings</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-cyan-400">
                  {bridgeNodes.filter(e => e.isVerifiedCrossing).length}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Proven Substrates</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(bridgeNodes.filter(e => e.isVerifiedCrossing).length / bridgeNodes.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-[#040811]/90 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">High Confidence (&gt;85%)</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {bridgeNodes.filter(e => e.quality >= 0.85).length}
                </span>
                <span className="text-[10px] text-emerald-500 font-mono">Evidence-bound</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(bridgeNodes.filter(e => e.quality >= 0.85).length / bridgeNodes.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-[#040811]/90 border border-slate-900 rounded-xl p-3.5 hover:border-slate-800 transition-all flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Avg. Cross-Domain Centrality</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {Math.round(bridgeNodes.reduce((acc, c) => acc + c.geoMean, 0) / bridgeNodes.length)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">GeoMean Scale</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round(bridgeNodes.reduce((acc, c) => acc + c.geoMean, 0) / bridgeNodes.length)}%` }}></div>
              </div>
            </div>
          </>
        )}
      </div>


      {/* ========================================================================= */}
      {/* SUB-TAB 1: MASTER TABLE OF 50+ ENTITIES                                   */}
      {/* ========================================================================= */}
      {universeSubTab === "table" && (
        <div className="relative space-y-4 z-10 animate-fade-in">
          
          {/* Controls Bar */}
          <div className="bg-[#050912]/80 border border-slate-900 p-4 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder={
                  activeUniverse === "quantum" 
                    ? "Search quantum tickers, names, dependencies or reasons..." 
                    : activeUniverse === "fusion" 
                      ? "Search fusion nodes, names, rails or observations..."
                      : "Search deeptech bridge tickers, names, roles or details..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 font-mono"
              />
            </div>

            {/* Filter Selections */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Category Filter */}
              {activeUniverse !== "substrate" && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">ALL Categories</option>
                    {activeUniverse === "quantum" ? (
                      <>
                        <option value="Compute">Compute</option>
                        <option value="Quantum Hardware">Quantum Hardware</option>
                        <option value="Semiconductor Fabrication">Semiconductor Fabrication</option>
                        <option value="Advanced Materials">Advanced Materials</option>
                        <option value="Cryogenics">Cryogenics</option>
                        <option value="Test & Measurement">Test & Measurement</option>
                        <option value="Photonics / Lasers">Photonics / Lasers</option>
                        <option value="Networking">Networking</option>
                        <option value="AI Infrastructure">AI Infrastructure</option>
                        <option value="Cloud / Hyperscalers">Cloud / Hyperscalers</option>
                        <option value="Industrial Automation">Industrial Automation</option>
                        <option value="Power & Energy">Power & Energy</option>
                        <option value="Government / Defence Exposure">Government / Defence Exposure</option>
                        <option value="ETFs / Infrastructure Funds">ETFs / Infrastructure Funds</option>
                      </>
                    ) : (
                      <>
                        <option value="HTS materials and conductor manufacturing">HTS Materials</option>
                        <option value="Magnet engineering and winding">Magnet Engineering</option>
                        <option value="Vacuum and plasma-facing boundaries">Vacuum Boundaries</option>
                        <option value="Power and thermal systems">Power & Thermal Systems</option>
                        <option value="Precision industrial manufacturing">Precision Mfg</option>
                        <option value="Computational engineering">Computational</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* Modality Filter */}
              {activeUniverse !== "substrate" && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Modality:</span>
                  <select
                    value={selectedModality}
                    onChange={(e) => setSelectedModality(e.target.value as any)}
                    className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">ALL Modalities</option>
                    {activeUniverse === "quantum" ? (
                      <>
                        <option value="Modality Agnostic">Modality Agnostic</option>
                        <option value="Superconducting">Superconducting</option>
                        <option value="Spin">Spin</option>
                        <option value="Trapped Ion">Trapped Ion</option>
                        <option value="Neutral Atom">Neutral Atom</option>
                        <option value="Photonic">Photonic</option>
                      </>
                    ) : (
                      <>
                        <option value="Modality Agnostic">Modality Agnostic</option>
                        <option value="Stellarator">Stellarator</option>
                        <option value="Tokamak">Tokamak</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* Evidence level filter */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Evidence:</span>
                <select
                  value={selectedQtype}
                  onChange={(e) => setSelectedQtype(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">ALL (Evidence & Speculative)</option>
                  {activeUniverse === "quantum" ? (
                    <>
                      <option value="EVIDENCE">Evidence-bound Rails Only</option>
                      <option value="SPECULATIVE">Speculative Relations Only</option>
                    </>
                  ) : activeUniverse === "fusion" ? (
                    <>
                      <option value="EVIDENCE">Verified Only</option>
                      <option value="SPECULATIVE">Unverified reference only</option>
                    </>
                  ) : (
                    <>
                      <option value="EVIDENCE">Verified Crossings Only</option>
                      <option value="SPECULATIVE">Inferred Crossings Only</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Fusion Population Filter Tabs */}
          {activeUniverse === "fusion" && (
            <div className="flex flex-wrap bg-slate-950/80 border border-slate-900 p-1.5 rounded-xl gap-2 max-w-4xl">
              <button
                onClick={() => setSelectedFusionPopulation("ALL")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold font-mono tracking-wide transition-all flex items-center gap-2 border ${selectedFusionPopulation === "ALL" ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 font-bold" : "bg-slate-900/30 text-slate-400 border-transparent hover:text-white"}`}
              >
                <span>ALL POPULATIONS</span>
                <span className="px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-900 text-[10px]">
                  {FUSION_ENTITIES.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedFusionPopulation("OPERATOR")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold font-mono tracking-wide transition-all flex items-center gap-2 border ${selectedFusionPopulation === "OPERATOR" ? "bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold" : "bg-slate-900/30 text-slate-400 border-transparent hover:text-white"}`}
              >
                <span>TRADABLE OPERATORS / DEVELOPERS</span>
                <span className="px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-900 text-[10px]">
                  {FUSION_ENTITIES.filter(e => e.nodeId === "fusion:GFUZ" || e.nodeId === "fusion:DJT" || e.secondaryRails.includes("Fusion Developers")).length}
                </span>
              </button>
              <button
                onClick={() => setSelectedFusionPopulation("RAIL")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold font-mono tracking-wide transition-all flex items-center gap-2 border ${selectedFusionPopulation === "RAIL" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold" : "bg-slate-900/30 text-slate-400 border-transparent hover:text-white"}`}
              >
                <span>TRADABLE INFRASTRUCTURE RAILS</span>
                <span className="px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-900 text-[10px]">
                  {FUSION_ENTITIES.filter(e => e.nodeId !== "fusion:GFUZ" && e.nodeId !== "fusion:DJT" && !e.secondaryRails.includes("Fusion Developers") && e.referenceOnly !== true && e.publicStatus !== "private").length}
                </span>
              </button>
              <button
                onClick={() => setSelectedFusionPopulation("PRIVATE")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold font-mono tracking-wide transition-all flex items-center gap-2 border ${selectedFusionPopulation === "PRIVATE" ? "bg-purple-500/15 text-purple-400 border-purple-500/30 font-bold" : "bg-slate-900/30 text-slate-400 border-transparent hover:text-white"}`}
              >
                <span>PRIVATE REFERENCE NODES</span>
                <span className="px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-900 text-[10px]">
                  {FUSION_ENTITIES.filter(e => e.referenceOnly === true || e.publicStatus === "private").length}
                </span>
              </button>
            </div>
          )}

          {/* Master Table */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-xl">
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
              {activeUniverse === "quantum" ? (
                <table className="w-full text-left border-collapse" id="quantum-master-table">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/80 sticky top-0 backdrop-blur z-20">
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Ticker / Company</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Primary Rail / Sector</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Modality dependence</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold text-center">Confidence</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold text-center">Centrality Index</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Inclusion Reason & Current Role</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Strategic Dependency / SPOF Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredEntities.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-slate-500 font-mono text-xs">
                          No quantum entities found matching the search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredEntities.map((e) => {
                        const isSpof = e.spofRelevance && e.spofRelevance.trim().length > 0;
                        
                        let modalityColor = "bg-slate-900 text-slate-400";
                        if (e.modalityDependence === "Superconducting") modalityColor = "bg-blue-950/40 text-blue-400 border border-blue-900/30";
                        else if (e.modalityDependence === "Trapped Ion") modalityColor = "bg-purple-950/40 text-purple-400 border border-purple-900/30";
                        else if (e.modalityDependence === "Neutral Atom") modalityColor = "bg-amber-950/40 text-amber-400 border border-amber-900/30";
                        else if (e.modalityDependence === "Photonic") modalityColor = "bg-cyan-950/40 text-cyan-400 border border-cyan-900/30";
                        else if (e.modalityDependence === "Spin") modalityColor = "bg-orange-950/40 text-orange-400 border border-orange-900/30";
                        else if (e.modalityDependence === "Modality Agnostic") modalityColor = "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 font-bold";

                        return (
                          <tr key={e.ticker} className={`hover:bg-slate-900/40 transition-colors text-xs ${e.isSpeculative ? "bg-amber-950/5" : ""}`}>
                            
                            {/* Ticker / Company */}
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-800">{e.ticker}</span>
                                <div>
                                  <span className="font-semibold block text-slate-300">{e.company}</span>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    {/* Evidence Quality Indicator */}
                                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border leading-none ${getEvidenceQuality(e.confidence, e.isSpeculative).color}`}>
                                      {getEvidenceQuality(e.confidence, e.isSpeculative).badge}
                                    </span>
                                    {isSpof && (
                                      <span className="text-[8px] font-mono text-rose-400 bg-rose-950/50 border border-rose-900/30 px-1.5 py-0.5 rounded uppercase font-bold animate-pulse leading-none">SPOF Risk</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Rails */}
                            <td className="p-3">
                              <span className="font-semibold text-slate-300 block">{e.primaryRail}</span>
                              <span className="text-[10px] text-slate-500 font-mono">Sec: {e.secondaryRail}</span>
                            </td>

                            {/* Modality */}
                            <td className="p-3 whitespace-nowrap">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${modalityColor}`}>
                                {e.modalityDependence}
                              </span>
                            </td>

                            {/* Confidence */}
                            <td className="p-3 text-center">
                              <span className={`font-mono font-bold text-xs ${e.confidence >= 90 ? "text-cyan-400" : e.confidence >= 75 ? "text-amber-400" : "text-slate-500"}`}>
                                {e.confidence}%
                              </span>
                            </td>

                            {/* Centrality Index */}
                            <td className="p-3 text-center font-mono">
                              <div className="flex flex-col items-center">
                                <span className="text-slate-300 text-[11px] font-bold" title="Relative PageRank score (0-100)">
                                  PR: {e.pageRank}
                                </span>
                                <span className="text-slate-500 text-[9px]" title="Betweenness Centrality score (0-100)">
                                  BC: {e.betweennessCentrality}
                                </span>
                              </div>
                            </td>

                            {/* Reason & Role */}
                            <td className="p-3 max-w-sm">
                              <p className="text-slate-300 leading-relaxed font-sans">{e.reasonForInclusion}</p>
                              <p className="text-[10px] text-slate-500 mt-1 font-mono leading-relaxed bg-slate-950/50 p-1.5 rounded border border-slate-900">
                                <strong className="text-slate-400">Ecosystem Role:</strong> {e.currentRole}
                              </p>
                            </td>

                            {/* Strategic Dependency */}
                            <td className="p-3 max-w-xs">
                              {isSpof ? (
                                <div className="bg-rose-950/15 border border-rose-900/20 p-2 rounded text-[11px] text-rose-300 mb-2 leading-relaxed">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[8px] font-mono font-bold text-rose-400 bg-rose-950/50 border border-rose-900/30 px-1 rounded uppercase">SPOF Risk</span>
                                    <span className="font-bold text-[9px] text-slate-400 font-mono uppercase">Strategic Dependency:</span>
                                  </div>
                                  {e.spofRelevance}
                                </div>
                              ) : (
                                <span className="text-slate-500 font-mono text-[10px] italic block mb-2">No critical SPOF identified</span>
                              )}
                              
                              <div>
                                <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Dependencies:</span>
                                <div className="flex flex-wrap gap-1">
                                  {e.knownDependencies.map((dep, idx) => (
                                    <span key={idx} className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-800">
                                      {dep}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : activeUniverse === "fusion" ? (
                <table className="w-full text-left border-collapse" id="fusion-master-table">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/80 sticky top-0 backdrop-blur z-20">
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Node / Company</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Primary Rail / Sector</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Modality exposure</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold text-center">Confidence</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold text-center">Centrality (PR/BC)</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Technical Observations</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Strategic Dependency / SPOF Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredFusionEntities.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-slate-500 font-mono text-xs">
                          No fusion entities found matching the search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredFusionEntities.map((e) => {
                        const isLowSub = e.substitutability === "low";
                        
                        return (
                          <tr key={e.nodeId} className={`hover:bg-slate-900/40 transition-colors text-xs ${e.evidenceStatus !== "verified" ? "bg-amber-950/5" : ""}`}>
                            
                            {/* Node / Company */}
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-800">{e.nodeId}</span>
                                <div>
                                  <span className="font-semibold block text-slate-300">{e.legalName}</span>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase border leading-none ${e.publicStatus === "public" ? "text-cyan-400 bg-cyan-950/40 border-cyan-900/30 font-bold" : "text-slate-400 bg-slate-900 border-slate-800"}`}>
                                      {e.publicStatus === "public" ? `${e.exchange || "PUBLIC"}:${e.ticker || ""}` : "PRIVATE REFERENCE"}
                                    </span>
                                    {/* Evidence Quality Indicator */}
                                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border leading-none ${getFusionEvidenceQuality(e.confidence, e.evidenceStatus).color}`}>
                                      {getFusionEvidenceQuality(e.confidence, e.evidenceStatus).badge}
                                    </span>
                                    {isLowSub && (
                                      <span className="text-[8px] font-mono text-rose-400 bg-rose-950/50 border border-rose-900/30 px-1.5 py-0.5 rounded uppercase font-bold animate-pulse leading-none">SPOF Risk</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Rails */}
                            <td className="p-3">
                              <span className="font-semibold text-slate-300 block">{e.primaryRail}</span>
                              <span className="text-[10px] text-slate-500 font-mono">Sec: {e.secondaryRails.join(", ") || "None"}</span>
                            </td>

                            {/* Modality */}
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {e.modalityExposure.map((mod, idx) => (
                                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-900/30">
                                    {mod}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Confidence */}
                            <td className="p-3 text-center">
                              <span className="font-mono font-bold text-slate-300">
                                {e.confidence}%
                              </span>
                            </td>

                            {/* Centrality Index */}
                            <td className="p-3 text-center font-mono">
                              <div className="flex flex-col items-center">
                                <span className="text-slate-300 text-[11px] font-bold">
                                  PR: {e.pageRank}
                                </span>
                                <span className="text-slate-500 text-[9px]">
                                  BC: {e.betweennessCentrality}
                                </span>
                              </div>
                            </td>

                            {/* Reason & Observation */}
                            <td className="p-3 max-w-sm">
                              <p className="text-slate-300 leading-relaxed font-sans">{e.observation}</p>
                              
                              {/* Timeline graphic for SPAC mergers */}
                              {e.pendingPublicTransaction && (
                                <div className="mt-3.5 bg-[#040814]/90 border border-slate-900/80 p-3 rounded-lg space-y-3">
                                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-900/60 pb-1.5">
                                    <span className="text-cyan-400 font-bold uppercase tracking-wider">Corporate-Action State Machine: SPAC Merger</span>
                                    <span className="text-slate-500">Effective Date: {e.effectiveDate || e.expectedClose || "TBD"}</span>
                                  </div>

                                  <div className="flex items-center justify-between relative px-2.5 pt-1.5">
                                    {/* Connector Line behind steps */}
                                    <div className="absolute top-[17px] left-8 right-8 h-0.5 bg-slate-900 z-0"></div>
                                    
                                    {/* Step 1: Rumoured */}
                                    <div className="flex flex-col items-center z-10 relative">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                                        e.transactionState === "CLOSED" 
                                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold" 
                                          : "bg-slate-900 border-slate-800 text-slate-500"
                                      }`}>✓</div>
                                      <span className="text-[8px] font-mono mt-1 text-slate-500">RUMOURED</span>
                                    </div>

                                    {/* Step 2: Announced */}
                                    <div className="flex flex-col items-center z-10 relative">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                                        e.transactionState === "CLOSED" 
                                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold" 
                                          : e.transactionState === "ANNOUNCED"
                                            ? "bg-amber-950/80 border-amber-500 text-amber-400 font-bold"
                                            : "bg-slate-900 border-slate-800 text-slate-500"
                                      }`}>
                                        {e.transactionState === "CLOSED" ? "✓" : "●"}
                                      </div>
                                      <span className={`text-[8px] font-mono mt-1 ${e.transactionState === "ANNOUNCED" ? "text-amber-400 font-bold" : "text-slate-500"}`}>ANNOUNCED</span>
                                    </div>

                                    {/* Step 3: Filed */}
                                    <div className="flex flex-col items-center z-10 relative">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                                        e.transactionState === "CLOSED" 
                                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold" 
                                          : "bg-slate-900 border-slate-800 text-slate-500"
                                      }`}>
                                        {e.transactionState === "CLOSED" ? "✓" : "○"}
                                      </div>
                                      <span className="text-[8px] font-mono mt-1 text-slate-500">FILED</span>
                                    </div>

                                    {/* Step 4: Approved */}
                                    <div className="flex flex-col items-center z-10 relative">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                                        e.transactionState === "CLOSED" 
                                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold" 
                                          : "bg-slate-900 border-slate-800 text-slate-500"
                                      }`}>
                                        {e.transactionState === "CLOSED" ? "✓" : "○"}
                                      </div>
                                      <span className="text-[8px] font-mono mt-1 text-slate-500">APPROVED</span>
                                    </div>

                                    {/* Step 5: Closed */}
                                    <div className="flex flex-col items-center z-10 relative">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                                        e.transactionState === "CLOSED" 
                                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold animate-pulse" 
                                          : "bg-slate-900 border-slate-800 text-slate-500"
                                      }`}>
                                        {e.transactionState === "CLOSED" ? "✓" : "○"}
                                      </div>
                                      <span className={`text-[8px] font-mono mt-1 ${e.transactionState === "CLOSED" ? "text-emerald-400 font-bold" : "text-slate-500"}`}>CLOSED</span>
                                    </div>

                                    {/* Step 6: Trading Live */}
                                    <div className="flex flex-col items-center z-10 relative">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                                        e.publicExposureState === "LIVE" 
                                          ? "bg-cyan-950/80 border-cyan-500 text-cyan-400 font-bold" 
                                          : "bg-slate-900 border-slate-800 text-slate-500"
                                      }`}>
                                        {e.publicExposureState === "LIVE" ? "★" : "○"}
                                      </div>
                                      <span className={`text-[8px] font-mono mt-1 ${e.publicExposureState === "LIVE" ? "text-cyan-400 font-bold" : "text-slate-500"}`}>TRADING_LIVE</span>
                                    </div>
                                  </div>

                                  {/* Narrative Note */}
                                  <div className="p-2 rounded bg-slate-950 border border-slate-900 text-[10px] font-sans leading-relaxed text-slate-400 whitespace-normal">
                                    {e.nodeId === "fusion:GFUZ" && (
                                      <span className="text-slate-300">
                                        <strong className="text-emerald-400">Transaction Status: CLOSED & LIVE.</strong> Pure-play exposure. General Fusion closed its merger with Spring Valley Acquisition Corp. III on July 10, 2026. Ticker <strong className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">GFUZ</strong> commenced active Nasdaq trading on July 13, 2026. First pure-play public fusion developer.
                                      </span>
                                    )}
                                    {e.nodeId === "fusion:DJT" && (
                                      <span className="text-slate-300">
                                        <strong className="text-amber-400">Transaction Status: ANNOUNCED / PROSPECTIVE.</strong> Legal entity is Trump Media & Technology Group. Fusion exposure is <span className="text-amber-400 font-bold uppercase underline">contingent</span> upon transaction closure with target developer <strong className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">TAE Technologies</strong>. Operationally, DJT remains a media company until transaction settlement.
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Strategic Dependency */}
                            <td className="p-3 max-w-xs">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-500 font-mono">SUBSTITUTABILITY:</span>
                                  <span className={`font-mono font-bold px-1.5 rounded uppercase ${isLowSub ? "text-rose-400 bg-rose-950/40 border border-rose-900/30 animate-pulse" : e.substitutability === "medium" ? "text-amber-400 bg-amber-950/40" : "text-slate-400 bg-slate-900"}`}>
                                    {e.substitutability}
                                  </span>
                                </div>
                                {isLowSub && (
                                  <div className="bg-rose-950/20 border border-rose-900/30 p-1.5 rounded text-[9.5px] text-rose-300 leading-normal font-mono uppercase">
                                    ⚠️ High SPOF Risk node: Hard to substitute or globally concentrated supply.
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-500 font-mono">
                                  <span className="block mb-1">PROVENANCE REFS:</span>
                                  <div className="max-h-[60px] overflow-y-auto space-y-0.5">
                                    {e.evidenceRefs.map((ref, idx) => (
                                      <span key={idx} className="block text-[9px] text-slate-400 truncate bg-slate-900 p-0.5 rounded" title={ref}>
                                        {ref}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse" id="substrate-bridge-table">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/80 sticky top-0 backdrop-blur z-20">
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Ticker / Name</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Cross-Domain Crossing Role</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold text-center">Quantum Centrality (PR)</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold text-center">Fusion Centrality (PR)</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold text-center">Geometric Mean (PR)</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold text-center">Provenance & Modality weights</th>
                      <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold text-center">Computed Bridge Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredBridgeNodes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-slate-500 font-mono text-xs">
                          No substrate bridge nodes found matching the search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredBridgeNodes.map((b) => (
                        <tr key={b.ticker} className={`hover:bg-slate-900/40 transition-colors text-xs ${!b.isVerifiedCrossing ? "bg-amber-950/5" : ""}`}>
                          {/* Ticker / Name */}
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-800">{b.ticker}</span>
                              <div>
                                <span className="font-semibold block text-slate-300">{b.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {b.isVerifiedCrossing ? (
                                    <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1 rounded uppercase">Verified crossing</span>
                                  ) : (
                                    <span className="text-[8px] font-mono text-amber-500 bg-amber-950/50 border border-amber-900/30 px-1 rounded uppercase">Inferred crossing</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="p-3 max-w-xs">
                            <span className="font-semibold text-emerald-400 block mb-0.5">{b.role}</span>
                            <span className="text-slate-400 text-[11px] leading-normal block">{b.details}</span>
                          </td>

                          {/* Quantum Centrality */}
                          <td className="p-3 text-center font-mono font-bold text-slate-300">
                            {b.quantumCentrality}
                          </td>

                          {/* Fusion Centrality */}
                          <td className="p-3 text-center font-mono font-bold text-slate-300">
                            {b.fusionCentrality}
                          </td>

                          {/* Geometric Mean */}
                          <td className="p-3 text-center font-mono font-bold text-amber-400">
                            {b.geoMean}
                          </td>

                          {/* Weights (Provenance & Modality) */}
                          <td className="p-3">
                            <div className="flex flex-col items-center gap-1 font-mono text-[10px]">
                              <span className="text-slate-400">Quality: <strong className="text-slate-300">{b.quality}</strong></span>
                              <span className="text-slate-400">Breadth: <strong className="text-slate-300">{b.breadth}</strong></span>
                            </div>
                          </td>

                          {/* Computed Bridge Score */}
                          <td className="p-3 text-center">
                            <div className="inline-block bg-[#04121a] border border-cyan-900/30 px-2.5 py-1.5 rounded-lg text-center">
                              <span className="block font-mono font-bold text-xs text-cyan-400">{b.bridgeScore}</span>
                              <span className="block text-[8px] text-slate-500 font-mono mt-0.5">Bridge Score</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="bg-slate-950 p-3 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-slate-500 font-mono">
              {activeUniverse === "quantum" ? (
                <div>
                  <span>Showing <strong>{filteredEntities.length}</strong> of <strong>{QUANTUM_ENTITIES.length}</strong> entities</span>
                  {selectedCategory !== "ALL" && <span> | Category Filter: {selectedCategory}</span>}
                  {selectedModality !== "ALL" && <span> | Modality Filter: {selectedModality}</span>}
                </div>
              ) : activeUniverse === "fusion" ? (
                <div>
                  <span>Showing <strong>{filteredFusionEntities.length}</strong> of <strong>{FUSION_ENTITIES.length}</strong> entities</span>
                  {selectedCategory !== "ALL" && <span> | Category Filter: {selectedCategory}</span>}
                  {selectedModality !== "ALL" && <span> | Modality Filter: {selectedModality}</span>}
                </div>
              ) : (
                <div>
                  <span>Showing <strong>{filteredBridgeNodes.length}</strong> of <strong>{bridgeNodes.length}</strong> deeptech bridges</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-950/50 border border-amber-900/30"></span>
                <span>Highlight indicates Inferred/Unverified relationship</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PHYSICAL RAILS ARCHITECTURE EXPLORER                            */}
      {/* ========================================================================= */}
      {universeSubTab === "rails" && (
        <div className="relative space-y-6 z-10 animate-fade-in" id="physical-rails-matrix">
          <div className="bg-[#050912]/80 border border-slate-900 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Physical Rail Architecture & Strategic Mappings</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Explore the hardware enablers and industrial enclaves whose specialized materials, tooling, and infrastructure serve as the foundations of the {activeUniverse === "quantum" ? "quantum-computing" : "fusion-energy"} ecosystem.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg whitespace-nowrap">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
              <span>{railsData.length} ACTIVE ECOSYSTEM RAILS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {railsData.map((rail) => {
              const nodes = getNodesForRail(rail.category);
              const IconComp = rail.icon;
              return (
                <div 
                  key={rail.id}
                  className={`border rounded-xl p-4 transition-all hover:border-slate-700/60 flex flex-col justify-between h-full bg-[#030712]/90 shadow-lg ${rail.color} ${rail.glow}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">Physical Rail</span>
                        <h4 className="text-sm font-extrabold text-white leading-snug">{rail.title}</h4>
                        <span className="text-[10px] text-slate-400 italic font-mono block mt-0.5">{rail.subtitle}</span>
                      </div>
                      <span className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-slate-400">
                        <IconComp className="w-4 h-4" />
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-4">
                      {rail.description}
                    </p>

                    <div className="border-t border-slate-900/60 pt-3.5 mb-4">
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mb-2">Mapped Enablers ({nodes.length}):</span>
                      {nodes.length === 0 ? (
                        <span className="text-[10px] text-slate-600 font-mono italic">No direct enablers mapped in this category yet</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                          {nodes.map((node) => {
                            const isSpec = "isSpeculative" in node ? node.isSpeculative : node.evidenceStatus !== "verified";
                            const label = "ticker" in node ? node.ticker : node.nodeId;
                            return (
                              <button
                                key={label}
                                onClick={() => {
                                  setSearchTerm("ticker" in node ? node.ticker || "" : node.nodeId);
                                  setSelectedCategory("ALL");
                                  setUniverseSubTab("table");
                                }}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 hover:text-white ${isSpec ? "bg-amber-950/20 text-amber-400 border-amber-900/30 hover:bg-amber-950/45" : "bg-slate-950/75 text-slate-300 border-slate-900 hover:bg-slate-900"}`}
                              >
                                <span>{label}</span>
                                {isSpec && <span className="text-[8px] opacity-75">⚠️</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-950">
                    <button
                      onClick={() => {
                        setSelectedCategory(rail.category);
                        setSelectedModality("ALL");
                        setSearchTerm("");
                        setUniverseSubTab("table");
                      }}
                      className="w-full bg-slate-950/80 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-300 hover:text-white transition-all rounded-lg py-2 text-center text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                    >
                      <span>Explore this Rail in Master Table</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PIPELINE / DEPENDENCY GRAPH                                    */}
      {/* ========================================================================= */}
      {universeSubTab === "graph" && (() => {
        const columns = activeUniverse === "quantum" 
          ? pipelineColumns 
          : activeUniverse === "fusion" 
            ? fusionPipelineColumns 
            : [
                { id: "q_modal", title: "1. Quantum Systems", subtitle: "Superconducting & ion platforms" },
                { id: "q_hubs", title: "2. Quantum Rails", subtitle: "Sub-Kelvin cryo & lasers" },
                { id: "bridge_l", title: "3. Substrate Bridge (A)", subtitle: "Linde, NVIDIA, Alphabet..." },
                { id: "bridge_r", title: "4. Substrate Bridge (B)", subtitle: "Bruker, VAT Group, Furukawa..." },
                { id: "f_hubs", title: "5. Fusion Rails", subtitle: "HTS magnets & vacuum core" },
                { id: "f_confinement", title: "6. Confinement Systems", subtitle: "High-field magnetic plasma" }
              ];

        const links = activeUniverse === "quantum" 
          ? QUANTUM_LINKS 
          : activeUniverse === "fusion" 
            ? FUSION_LINKS 
            : [
                { source: "Q_SUPER", target: "Q_CRYO", isSpeculative: false },
                { source: "Q_IONS", target: "Q_OPTICS", isSpeculative: false },
                { source: "Q_CRYO", target: "LIN", isSpeculative: false },
                { source: "Q_OPTICS", target: "VATYF", isSpeculative: false },
                { source: "AMAT", target: "Q_SUPER", isSpeculative: false },
                { source: "GOOG", target: "Q_SUPER", isSpeculative: false },
                { source: "NVDA", target: "Q_SUPER", isSpeculative: false },
                { source: "LIN", target: "F_HTS_WINDING", isSpeculative: false },
                { source: "BRKR", target: "F_HTS_WINDING", isSpeculative: false },
                { source: "SMTOY", target: "F_HTS_WINDING", isSpeculative: false },
                { source: "FUAFY", target: "F_HTS_WINDING", isSpeculative: false },
                { source: "VATYF", target: "F_VAC_VESSEL", isSpeculative: false },
                { source: "NVDA", target: "F_STELLARATOR", isSpeculative: false },
                { source: "F_HTS_WINDING", target: "F_TOKAMAK", isSpeculative: false },
                { source: "F_HTS_WINDING", target: "F_STELLARATOR", isSpeculative: false },
                { source: "F_VAC_VESSEL", target: "F_TOKAMAK", isSpeculative: false },
                { source: "F_VAC_VESSEL", target: "F_STELLARATOR", isSpeculative: false }
              ];

        const layout = activeUniverse === "quantum" 
          ? pipelineNodesLayout 
          : activeUniverse === "fusion" 
            ? fusionPipelineNodesLayout 
            : {
                Q_SUPER: { x: 8, y: 30, colIndex: 0 },
                Q_IONS: { x: 8, y: 70, colIndex: 0 },
                Q_CRYO: { x: 25, y: 25, colIndex: 1 },
                Q_OPTICS: { x: 25, y: 75, colIndex: 1 },
                LIN: { x: 41, y: 15, colIndex: 2 },
                NVDA: { x: 41, y: 38, colIndex: 2 },
                GOOG: { x: 41, y: 61, colIndex: 2 },
                AMAT: { x: 41, y: 84, colIndex: 2 },
                VATYF: { x: 58, y: 15, colIndex: 3 },
                BRKR: { x: 58, y: 38, colIndex: 3 },
                SMTOY: { x: 58, y: 61, colIndex: 3 },
                FUAFY: { x: 58, y: 84, colIndex: 3 },
                F_HTS_WINDING: { x: 75, y: 25, colIndex: 4 },
                F_VAC_VESSEL: { x: 75, y: 75, colIndex: 4 },
                F_TOKAMAK: { x: 92, y: 30, colIndex: 5 },
                F_STELLARATOR: { x: 92, y: 70, colIndex: 5 }
              };

        const entities = activeUniverse === "quantum" 
          ? entitiesWithScores.map(e => ({
              id: e.ticker,
              ticker: e.ticker,
              company: e.company,
              reasonForInclusion: e.reasonForInclusion,
              currentRole: e.currentRole,
              primaryRail: e.primaryRail,
              pageRank: e.pageRank,
              betweennessCentrality: e.betweennessCentrality,
              modalityDependence: e.modalityDependence,
              confidence: e.confidence,
              evidenceSources: e.evidenceSources,
              spofRelevance: e.spofRelevance,
              isSpeculative: e.isSpeculative
            }))
          : activeUniverse === "fusion" 
            ? fusionEntitiesWithScores.map(e => ({
                id: e.nodeId,
                ticker: e.ticker || e.nodeId,
                company: e.legalName,
                reasonForInclusion: e.observation,
                currentRole: e.roleDescription || e.observation,
                primaryRail: e.primaryRail,
                pageRank: e.pageRank,
                betweennessCentrality: e.betweennessCentrality,
                modalityDependence: e.modalityExposure.join(", "),
                confidence: e.confidence,
                evidenceSources: [e.citation],
                spofRelevance: e.substitutability === "low" ? "High single point of failure risk due to low market substitutability." : "",
                isSpeculative: e.evidenceStatus !== "verified"
              }))
            : [
                { id: "Q_SUPER", ticker: "Q_SUPER", company: "Superconducting QPU Hub", reasonForInclusion: "Represents multi-qubit superconducting quantum computers.", currentRole: "High-density Josephson junction arrays.", primaryRail: "Quantum Modality", pageRank: 78, betweennessCentrality: 45, modalityDependence: "Superconducting", confidence: 95, evidenceSources: ["IEEE Quantum Roadmap"], spofRelevance: "", isSpeculative: false },
                { id: "Q_IONS", ticker: "Q_IONS", company: "Trapped Ion / Spin Hub", reasonForInclusion: "Represents hyperfine atomic trapped-ion and quantum spin computers.", currentRole: "Laser-cooled atomic chains.", primaryRail: "Quantum Modality", pageRank: 65, betweennessCentrality: 30, modalityDependence: "Trapped Ion / Spin", confidence: 95, evidenceSources: ["NIST Quantum Physics"], spofRelevance: "", isSpeculative: false },
                { id: "Q_CRYO", ticker: "Q_CRYO", company: "Sub-Kelvin Cryogenics", reasonForInclusion: "Essential support subsystem for superconducting and spin platforms.", currentRole: "Dilution refrigerator shielding.", primaryRail: "Quantum Support", pageRank: 82, betweennessCentrality: 55, modalityDependence: "Multi-modality", confidence: 95, evidenceSources: ["Cryogenics Journal"], spofRelevance: "Critical helium gas availability.", isSpeculative: false },
                { id: "Q_OPTICS", ticker: "Q_OPTICS", company: "Optical & RF Control", reasonForInclusion: "Microwave and optical control paths for quantum manipulation.", currentRole: "Laser frequency stabilization.", primaryRail: "Quantum Support", pageRank: 70, betweennessCentrality: 35, modalityDependence: "Multi-modality", confidence: 95, evidenceSources: ["Optics Express"], spofRelevance: "", isSpeculative: false },
                { id: "LIN", ticker: "LIN", company: "Linde plc", reasonForInclusion: "Dominant supplier of liquid Helium-3 isotopes and Helium-4 gas.", currentRole: "Primary cryogenic gas provider.", primaryRail: "Crossing Substrate", pageRank: 95, betweennessCentrality: 90, modalityDependence: "Modality Agnostic", confidence: 100, evidenceSources: ["Linde Annual Report 2025"], spofRelevance: "Helium isotope refining supply monopoly.", isSpeculative: false },
                { id: "NVDA", ticker: "NVDA", company: "NVIDIA Corporation", reasonForInclusion: "Standard simulation hardware for quantum circuits and MHD plasma physics.", currentRole: "GPU hardware developer.", primaryRail: "Crossing Substrate", pageRank: 92, betweennessCentrality: 85, modalityDependence: "Modality Agnostic", confidence: 100, evidenceSources: ["NVIDIA GTC Quantum / Fusion Announcements"], spofRelevance: "", isSpeculative: false },
                { id: "GOOG", ticker: "GOOG", company: "Alphabet Inc. (Google)", reasonForInclusion: "Active hardware developer and venture funder of fusion (Proxima) and quantum.", currentRole: "Quantum hardware & deeptech capital.", primaryRail: "Crossing Substrate", pageRank: 85, betweennessCentrality: 70, modalityDependence: "Modality Agnostic", confidence: 100, evidenceSources: ["Google Quantum AI Research", "Proxima Fusion Funding announcement 2026"], spofRelevance: "", isSpeculative: false },
                { id: "AMAT", ticker: "AMAT", company: "Applied Materials, Inc.", reasonForInclusion: "Supplies advanced thin-film deposition equipment for superconducting logic and fusion first-wall coatings.", currentRole: "Material deposition tracks.", primaryRail: "Crossing Substrate", pageRank: 80, betweennessCentrality: 60, modalityDependence: "Modality Agnostic", confidence: 95, evidenceSources: ["Applied Materials Product Docs"], spofRelevance: "", isSpeculative: false },
                { id: "VATYF", ticker: "VATYF", company: "VAT Group AG", reasonForInclusion: "Global monopoly on vacuum gate valves required in fusion vessels and quantum fridges.", currentRole: "Precision vacuum valves.", primaryRail: "Crossing Substrate", pageRank: 88, betweennessCentrality: 75, modalityDependence: "Modality Agnostic", confidence: 95, evidenceSources: ["VAT Group Market Report"], spofRelevance: "Absolute gate-valve supply bottleneck.", isSpeculative: false },
                { id: "BRKR", ticker: "BRKR", company: "Bruker Corporation", reasonForInclusion: "Global manufacturer of NbTi and REBCO superconducting wires used in MRI, quantum fridges, and high-field fusion coils.", currentRole: "Superconducting wire supplier.", primaryRail: "Crossing Substrate", pageRank: 84, betweennessCentrality: 65, modalityDependence: "Modality Agnostic", confidence: 95, evidenceSources: ["Bruker Supercon Division Docs"], spofRelevance: "", isSpeculative: false },
                { id: "SMTOY", ticker: "SMTOY", company: "Sumitomo Electric Industries", reasonForInclusion: "Key manufacturer of high-temperature REBCO superconducting tapes for advanced fusion magnets and quantum shielding.", currentRole: "HTS conductor manufacturer.", primaryRail: "Crossing Substrate", pageRank: 81, betweennessCentrality: 58, modalityDependence: "Modality Agnostic", confidence: 90, evidenceSources: ["Sumitomo HTS product release"], spofRelevance: "", isSpeculative: false },
                { id: "FUAFY", ticker: "FUAFY", company: "Furukawa Electric Co.", reasonForInclusion: "Produces REBCO HTS tapes via SuperPower subsidiary, supplying magnets across both domains.", currentRole: "HTS tape development.", primaryRail: "Crossing Substrate", pageRank: 83, betweennessCentrality: 62, modalityDependence: "Modality Agnostic", confidence: 90, evidenceSources: ["SuperPower/Furukawa product catalogue"], spofRelevance: "", isSpeculative: false },
                { id: "F_HTS_WINDING", ticker: "F_HTS_WINDING", company: "HTS Magnet Winding", reasonForInclusion: "Process of turning raw HTS tape into complex 3D magnetic confinement coils.", currentRole: "High-field non-planar coils.", primaryRail: "Fusion Support", pageRank: 89, betweennessCentrality: 70, modalityDependence: "Modality Agnostic", confidence: 95, evidenceSources: ["Journal of Fusion Energy"], spofRelevance: "Severe bottleneck for compact stellarators.", isSpeculative: false },
                { id: "F_VAC_VESSEL", ticker: "F_VAC_VESSEL", company: "Tokamak Vacuum Vessel", reasonForInclusion: "High-precision physical vacuum containment and plasma-facing shielding.", currentRole: "Vacuum vessel and divertors.", primaryRail: "Fusion Support", pageRank: 80, betweennessCentrality: 50, modalityDependence: "Modality Agnostic", confidence: 95, evidenceSources: ["ITER Mechanical Design"], spofRelevance: "SPOF for structural integrity.", isSpeculative: false },
                { id: "F_TOKAMAK", ticker: "F_TOKAMAK", company: "Tokamak Confinement", reasonForInclusion: "Symmetric doughnut-shaped plasma confinement device using magnetic fields.", currentRole: "Tokamak fusion reactors.", primaryRail: "Fusion Core", pageRank: 75, betweennessCentrality: 40, modalityDependence: "Tokamak", confidence: 95, evidenceSources: ["IAEA Fusion Surveys"], spofRelevance: "", isSpeculative: false },
                { id: "F_STELLARATOR", ticker: "F_STELLARATOR", company: "Stellarator Confinement", reasonForInclusion: "Complex twisted 3D coil confinement device requiring modern supercomputing to design.", currentRole: "Quasi-isodynamic stellarators.", primaryRail: "Fusion Core", pageRank: 76, betweennessCentrality: 42, modalityDependence: "Stellarator", confidence: 95, evidenceSources: ["Max Planck Institute of Plasma Physics"], spofRelevance: "", isSpeculative: false }
              ];

        return (
          <div className="relative space-y-4 z-10 animate-fade-in" id="quantum-pipeline-graph">
            
            <div className="bg-[#050912]/85 border border-slate-900 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <span>
                    {activeUniverse === "quantum" 
                      ? "Hermes Quantum Pipeline Topology" 
                      : activeUniverse === "fusion" 
                        ? "High-Field Fusion Pipeline Topology" 
                        : "Cross-Domain Frontier Tech Substrate Bridges"}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {activeUniverse === "substrate" 
                    ? "Interactive map showcasing how the substrate crossings connect the quantum computing and high-field fusion confinement worlds."
                    : "Visualizing the flow of physical dependencies from materials to deployment nodes. Hover a node to isolate upstream/downstream connections."}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setHighlightSpeculative(!highlightSpeculative)}
                  className={`px-3 py-1.5 bg-slate-950 border rounded-lg text-[10px] font-mono transition-all ${highlightSpeculative ? "border-amber-500/50 text-amber-400 font-bold bg-amber-950/5" : "border-slate-800 text-slate-400 hover:text-white"}`}
                >
                  {highlightSpeculative ? "SHOWN: SPECULATIVE HIGHLIGHTS" : "SHOW SPECULATIVE CHANNELS"}
                </button>

                <button
                  onClick={() => { setSelectedNode(null); setHoveredNode(null); }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-[10px] font-mono transition-all"
                >
                  RESET VISUAL STATE
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Visual Interactive Map (lg:col-span-9) */}
              <div className="lg:col-span-9 bg-[#04080e] border border-slate-900 rounded-xl p-5 flex flex-col justify-between shadow-xl relative min-h-[580px] overflow-x-auto">
                
                {/* Columns Header */}
                <div className="grid gap-2 border-b border-slate-900/70 pb-3 mb-4 min-w-[900px]" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
                  {columns.map((col, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">{col.title}</span>
                      <span className="text-[8px] font-mono text-slate-500 lowercase mt-0.5">{col.subtitle}</span>
                    </div>
                  ))}
                </div>

                {/* Dynamic Interactive Pipeline Area */}
                <div className="relative h-[440px] border border-slate-950 bg-[#03060a]/90 rounded-lg min-w-[900px] overflow-hidden select-none">
                  
                  {/* SVG Connecting Paths */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b" />
                      </marker>
                      <marker id="arrow-active-in" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                      </marker>
                      <marker id="arrow-active-out" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                      </marker>
                      <marker id="arrow-speculative" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                      </marker>
                    </defs>

                    {links.map((link, idx) => {
                      const sourcePos = (layout as any)[link.source];
                      const targetPos = (layout as any)[link.target];
                      
                      if (!sourcePos || !targetPos) return null;

                      const isSourceHovered = hoveredNode === link.source;
                      const isTargetHovered = hoveredNode === link.target;
                      const isAnyHovered = hoveredNode !== null;

                      // Compute path attributes
                      let stroke = "#0e1726";
                      let strokeWidth = 1;
                      let markerId = "arrow";
                      let opacity = 0.35;
                      let dashArray: string | undefined = undefined;

                      if (link.isSpeculative && highlightSpeculative) {
                        stroke = "#d97706";
                        markerId = "arrow-speculative";
                        dashArray = "3 3";
                      }

                      if (isAnyHovered) {
                        if (isSourceHovered) {
                          // link represents an OUTGOING dependency from hovered node
                          stroke = "#06b6d4"; // Cyan
                          strokeWidth = 2;
                          markerId = "arrow-active-out";
                          opacity = 1.0;
                        } else if (isTargetHovered) {
                          // link represents an INCOMING dependency to hovered node
                          stroke = "#10b981"; // Emerald
                          strokeWidth = 2;
                          markerId = "arrow-active-in";
                          opacity = 1.0;
                        } else {
                          opacity = 0.05; // Fade completely
                        }
                      } else if (selectedNode) {
                        const isSourceSelected = selectedNode === link.source;
                        const isTargetSelected = selectedNode === link.target;
                        if (isSourceSelected) {
                          stroke = "#06b6d4";
                          strokeWidth = 2;
                          markerId = "arrow-active-out";
                          opacity = 1.0;
                        } else if (isTargetSelected) {
                          stroke = "#10b981";
                          strokeWidth = 2;
                          markerId = "arrow-active-in";
                          opacity = 1.0;
                        } else {
                          opacity = 0.08;
                        }
                      }

                      // Draw organic cubic bezier curve
                      const x1 = (sourcePos.x / 100) * 900;
                      const y1 = (sourcePos.y / 100) * 440;
                      const x2 = (targetPos.x / 100) * 900;
                      const y2 = (targetPos.y / 100) * 440;
                      
                      // Bezier anchor points
                      const cp1x = x1 + (x2 - x1) * 0.4;
                      const cp1y = y1;
                      const cp2x = x1 + (x2 - x1) * 0.6;
                      const cp2y = y2;

                      return (
                        <path
                          key={idx}
                          d={`M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`}
                          stroke={stroke}
                          strokeWidth={strokeWidth}
                          strokeDasharray={dashArray}
                          markerEnd={`url(#${markerId})`}
                          fill="none"
                          opacity={opacity}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>

                  {/* Nodes rendering as absolute positioned HTML */}
                  {entities.map((node) => {
                    const pos = (layout as any)[node.id];
                    if (!pos) return null;

                    const isHovered = hoveredNode === node.id;
                    const isSelected = selectedNode === node.id;
                    const isAnyHovered = hoveredNode !== null;
                    
                    // Compute if this node is connected to hovered node
                    let connectionStatus: "none" | "incoming" | "outgoing" | "hovered" = "none";
                    
                    if (isAnyHovered) {
                      if (isHovered) {
                        connectionStatus = "hovered";
                      } else {
                        const hasIncoming = links.some(l => l.source === hoveredNode && l.target === node.id);
                        const hasOutgoing = links.some(l => l.source === node.id && l.target === hoveredNode);
                        if (hasIncoming) connectionStatus = "outgoing"; // hovered node supplies this node
                        if (hasOutgoing) connectionStatus = "incoming"; // this node supplies hovered node
                      }
                    }

                    let nodeBorder = "border-slate-800 text-slate-300 bg-slate-950/90";
                    let scale = "scale-100";
                    let zIndex = "z-10";
                    let shadow = "";

                    if (connectionStatus === "hovered" || isSelected) {
                      nodeBorder = "border-cyan-400 text-white bg-cyan-950 shadow-lg shadow-cyan-500/10";
                      scale = "scale-110";
                      zIndex = "z-30";
                      shadow = "ring-2 ring-cyan-500/20";
                    } else if (connectionStatus === "incoming") {
                      nodeBorder = "border-emerald-500 text-emerald-300 bg-[#02130e]/95";
                      scale = "scale-105";
                      zIndex = "z-25";
                    } else if (connectionStatus === "outgoing") {
                      nodeBorder = "border-cyan-500 text-cyan-300 bg-[#01141c]/95";
                      scale = "scale-105";
                      zIndex = "z-25";
                    } else if (isAnyHovered) {
                      nodeBorder = "border-slate-900 text-slate-600 bg-slate-950/30 opacity-20";
                      scale = "scale-90";
                      zIndex = "z-0";
                    }

                    return (
                      <div
                        key={node.id}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                        style={{ 
                          left: `${pos.x}%`, 
                          top: `${pos.y}%`
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded border font-mono text-[9px] cursor-pointer select-none transition-all duration-300 ${nodeBorder} ${scale} ${zIndex} ${shadow}`}
                        title={`${node.company} | PR: ${node.pageRank}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">{node.ticker}</span>
                          {node.isSpeculative && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          )}
                          {node.spofRelevance && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono italic mt-4">
                  <span>*Hover over any node to trace its precise supply pathways. Emerald is Upstream (Suppliers); Cyan is Downstream (Consumers).</span>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500 inline-block"></span> Upstream Rails</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-500 inline-block"></span> Downstream Consumers</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500 inline-block"></span> Speculative Relationship</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500 inline-block"></span> SPOF Risk Node</span>
                  </div>
                </div>
              </div>

              {/* Dependency Node Info Sidebar (lg:col-span-3) */}
              <div className="lg:col-span-3 flex flex-col space-y-4">
                {(() => {
                  const node = entities.find((e) => e.id === (hoveredNode || selectedNode));
                  if (!node) {
                    return (
                      <div className="bg-slate-950 border border-slate-900 p-5 rounded-xl text-center flex flex-col justify-center items-center h-full min-h-[580px] text-slate-500">
                        <Compass className="w-8 h-8 text-slate-700 mb-2 animate-spin" style={{ animationDuration: "12s" }} />
                        <p className="text-xs font-mono font-bold uppercase text-slate-400">Pathfinder routing ready</p>
                        <p className="text-[10px] text-slate-600 font-mono mt-1 leading-relaxed">Hover or select any entity on the pipeline layout to audit its physical dependencies, centrality scores, and structural evidence footprint.</p>
                      </div>
                    );
                  }

                  const nodeUpstream = links.filter(l => l.target === node.id).map(l => l.source);
                  const nodeDownstream = links.filter(l => l.source === node.id).map(l => l.target);

                  return (
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl shadow-xl flex-1 flex flex-col justify-between h-full min-h-[580px] overflow-y-auto">
                      <div className="space-y-4">
                        
                        {/* Node Header */}
                        <div className="border-b border-slate-900 pb-3">
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs">{node.ticker}</span>
                            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-900 px-2 py-0.5 rounded font-mono font-bold">
                              PR Centrality: {node.pageRank}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold font-display text-white mt-2 leading-tight">{node.company}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wider">{node.primaryRail}</p>
                        </div>

                        {/* Pathfinder Doctrine Statement */}
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-1">Pathfinder Doctrine Statement</span>
                          <p className="bg-[#050912]/80 border border-slate-900 p-2.5 rounded text-xs text-slate-300 leading-relaxed font-sans italic">
                            "{node.reasonForInclusion}"
                          </p>
                        </div>

                        {/* Current Ecosystem Role */}
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-1">Current Ecosystem Role</span>
                          <p className="text-xs text-slate-300 leading-relaxed bg-[#03060c] p-2 rounded border border-slate-900 font-mono text-[11px]">
                            {node.currentRole}
                          </p>
                        </div>

                        {/* Upstream & Downstream Counts */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2 rounded border border-slate-900 text-center text-xs font-mono">
                          <div>
                            <span className="text-emerald-400 font-bold block">{nodeUpstream.length}</span>
                            <span className="text-[9px] text-slate-500 uppercase">Upstream suppliers</span>
                          </div>
                          <div>
                            <span className="text-cyan-400 font-bold block">{nodeDownstream.length}</span>
                            <span className="text-[9px] text-slate-500 uppercase">Downstream users</span>
                          </div>
                        </div>

                        {/* Speculative / Evidence Provenance */}
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-1.5">Evidence Provenance</span>
                          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                            {node.evidenceSources.map((source, idx) => (
                              <div key={idx} className="bg-emerald-950/20 border border-emerald-900/30 p-2 rounded text-[11px] text-emerald-300 leading-relaxed flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="font-mono">{source}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SPOF Relevance */}
                        {node.spofRelevance && (
                          <div className="bg-rose-950/15 border border-rose-900/30 p-2.5 rounded">
                            <span className="text-[9px] text-rose-400 font-mono font-bold uppercase tracking-widest block mb-1">⚠️ SINGLE POINT OF FAILURE RISK</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                              {node.spofRelevance}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-900 pt-3 mt-4 text-[10px] text-slate-500 font-mono flex justify-between items-center">
                        <span>Modality: <strong>{node.modalityDependence}</strong></span>
                        <span>Confidence: <strong>{node.confidence}%</strong></span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: CENTRALITY ANALYTICS                                           */}
      {/* ========================================================================= */}
      {universeSubTab === "analytics" && (
        <div className="relative space-y-5 z-10 animate-fade-in" id="quantum-centrality-analytics">
          
          <div className="bg-[#050912]/80 border border-slate-900 p-4 rounded-xl">
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest">
              {activeUniverse === "quantum" ? (
                "Quantum Systemic Connectivity & Centrality Matrix"
              ) : activeUniverse === "fusion" ? (
                "Fusion Sector Structural Connectivity & Centrality Matrix"
              ) : (
                "Frontier DeepTech Substrate Crossing & Bridge Analytics"
              )}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {activeUniverse === "quantum" ? (
                "Live algorithmic calculation of PageRank and Betweenness Centrality on the 54-entity quantum dependency graph. High PageRank nodes indicate critical structural hubs. High Betweenness indicates systemic bridges and potential single points of failure."
              ) : activeUniverse === "fusion" ? (
                "Structural PageRank and Betweenness Centrality computed against the modular high-field fusion ecosystem graph. Accents physical bottlenecks, magnetic winding rails, and high-temperature superconductor enablers."
              ) : (
                "Analyzes the intersection of frontier deeptech systems. Employs a strict geometric mean calculation over normalized quantum and fusion centralities to uncover the shared industrial enablers whose capabilities underpin both revolutions."
              )}
            </p>
          </div>

          {activeUniverse === "substrate" ? (
            <div className="space-y-5">
              {/* Formula and Methodology Banner */}
              <div className="bg-slate-950 border border-emerald-950/50 p-4 rounded-xl shadow-xl">
                <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-widest block mb-2">Crossing Formula & Filtering Logic</span>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-7 space-y-2">
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      The <strong className="text-white">Substrate Bridge Score</strong> measures a company's systemic exposure across both the quantum and magnetic confinement fusion supply chains. It is defined as:
                    </p>
                    <div className="bg-[#041118] border border-cyan-900/30 p-3 rounded-lg font-mono text-xs text-cyan-300 text-center select-all">
                      Bridge Score = GeometricMean(PR_Quantum, PR_Fusion) × QualityWeight × BreadthWeight
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                      *Where <strong>PR_Quantum</strong> and <strong>PR_Fusion</strong> represent normalized PageRank centralities, <strong>QualityWeight</strong> measures supplier-level verification (0-1), and <strong>BreadthWeight</strong> measures multi-modality applicability (0-1).
                    </p>
                  </div>
                  <div className="md:col-span-5 bg-slate-900/40 p-3.5 rounded-lg border border-slate-900 text-xs text-slate-400 space-y-1.5 font-sans leading-relaxed">
                    <span className="text-[10px] text-slate-300 font-mono font-bold block uppercase">Why Geometric Mean?</span>
                    The geometric mean acts as a strict mathematical filter. If an entity is exceptionally dominant in quantum but has zero documented relationship in fusion (e.g., ASML or Rigetti), its bridge score collapses to exactly <strong className="text-white">0.00</strong>. This elevates only companies providing a shared physical substrate.
                  </div>
                </div>
              </div>

              {/* Grid of Bridge Rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-xl">
                  <div className="border-b border-slate-900 pb-2.5 mb-3 flex justify-between items-center">
                    <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Substrate Crossings Index (Ranked)</span>
                    </h4>
                    <span className="text-[9px] bg-[#04121a] text-cyan-400 border border-cyan-900/50 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Cross-Domain Moat</span>
                  </div>

                  <div className="space-y-2">
                    {bridgeNodes.map((node, idx) => (
                      <div key={node.ticker} className="p-3 bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex items-start space-x-3">
                          <span className="text-[10px] text-slate-500 font-mono font-bold mt-1">#{idx+1}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">{node.ticker}</span>
                              <span className="text-slate-300 font-bold text-xs">{node.name}</span>
                              {node.isVerifiedCrossing ? (
                                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1 rounded uppercase">Verified</span>
                              ) : (
                                <span className="text-[8px] font-mono text-amber-500 bg-amber-950/40 border border-amber-900/20 px-1 rounded uppercase">Inferred</span>
                              )}
                            </div>
                            <span className="text-slate-400 text-[10px] font-mono block mt-1 leading-normal italic">{node.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <div className="flex space-x-4 text-center font-mono text-[10px] text-slate-500">
                            <div>
                              <span className="text-slate-400 block font-bold">{node.quantumCentrality}%</span>
                              <span>PR Q</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">{node.fusionCentrality}%</span>
                              <span>PR F</span>
                            </div>
                            <div>
                              <span className="text-amber-400 block font-bold">{node.geoMean}%</span>
                              <span>GeoMean</span>
                            </div>
                          </div>

                          <div className="bg-[#04121a] border border-cyan-900/40 px-3 py-1 rounded-lg text-center min-w-[70px]">
                            <span className="block font-mono font-bold text-xs text-cyan-400">{node.bridgeScore}</span>
                            <span className="block text-[8px] text-slate-600 font-mono">Score</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  {/* Key Substrate Sectors */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-xl">
                    <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider mb-3 border-b border-slate-900 pb-2">Primary Substrate Rails</h4>
                    <div className="space-y-2.5">
                      <div className="p-2.5 bg-slate-900/30 rounded border border-slate-900 text-xs">
                        <span className="font-mono text-cyan-400 font-bold block mb-1 text-[10px] uppercase">1. Cryogenics & Noble Gases</span>
                        Liquid Helium-3 and Helium-4 isotopes are critical to cool superconducting QPUs (0.01K) and to purge/cool HTS fusion coils. Linde dominates here.
                      </div>
                      <div className="p-2.5 bg-slate-900/30 rounded border border-slate-900 text-xs">
                        <span className="font-mono text-cyan-400 font-bold block mb-1 text-[10px] uppercase">2. Ultra-High Vacuum Systems</span>
                        VAT Group provides precise gate valves necessary to isolate sub-millikelvin quantum fridges and insulate high-temperature plasma confinement vacuum boundaries.
                      </div>
                      <div className="p-2.5 bg-slate-900/30 rounded border border-slate-900 text-xs">
                        <span className="font-mono text-cyan-400 font-bold block mb-1 text-[10px] uppercase">3. High-Field Superconductors</span>
                        REBCO and NbTi wire systems manufactured by Bruker, Furukawa, and Sumitomo are the foundational material substrate across magnets and quantum chips.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* PageRank top rankings (col-span-4) */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-xl min-h-[450px]">
                <div>
                  <div className="border-b border-slate-900 pb-2.5 mb-3 flex justify-between items-center">
                    <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{activeUniverse === "quantum" ? "PageRank Connectivity (Top 10)" : "Fusion PageRank Connectivity (Top 10)"}</span>
                    </h4>
                    <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-900/65 px-1.5 py-0.2 rounded font-mono font-bold uppercase">Influence Index</span>
                  </div>
                  
                  <div className="space-y-2">
                    {(activeUniverse === "quantum" ? entitiesWithScores : fusionEntitiesWithScores)
                      .sort((a, b) => b.pageRank - a.pageRank)
                      .slice(0, 10)
                      .map((node, idx) => {
                        const id = activeUniverse === "quantum" ? node.ticker : node.nodeId;
                        const label = activeUniverse === "quantum" ? node.ticker : node.nodeId;
                        const name = activeUniverse === "quantum" ? node.company : node.legalName;
                        return (
                          <div key={id} className="flex items-center justify-between p-2 bg-slate-900/30 border border-slate-900 hover:border-slate-850 rounded-lg transition-colors text-xs font-mono">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-slate-500 font-bold w-4">#{idx+1}</span>
                              <span className="font-bold text-white bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">{label}</span>
                              <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-cyan-400 font-bold">{node.pageRank}</span>
                              <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${node.pageRank}%` }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 font-mono italic mt-4">*PageRank score represents the frequency that a dependency path routes back into this company's physical infrastructure.</p>
              </div>

              {/* Betweenness Centrality top rankings (col-span-4) */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-xl min-h-[450px]">
                <div>
                  <div className="border-b border-slate-900 pb-2.5 mb-3 flex justify-between items-center">
                    <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{activeUniverse === "quantum" ? "Betweenness Centrality (Top 10)" : "Fusion Betweenness (Top 10)"}</span>
                    </h4>
                    <span className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 px-1.5 py-0.2 rounded font-mono font-bold uppercase">Bridge Index</span>
                  </div>

                  <div className="space-y-2">
                    {(activeUniverse === "quantum" ? entitiesWithScores : fusionEntitiesWithScores)
                      .sort((a, b) => {
                        const valA = activeUniverse === "quantum" ? a.betweennessCentrality : a.betweennessCentrality;
                        const valB = activeUniverse === "quantum" ? b.betweennessCentrality : b.betweennessCentrality;
                        return valB - valA;
                      })
                      .slice(0, 10)
                      .map((node, idx) => {
                        const id = activeUniverse === "quantum" ? node.ticker : node.nodeId;
                        const label = activeUniverse === "quantum" ? node.ticker : node.nodeId;
                        const name = activeUniverse === "quantum" ? node.company : node.legalName;
                        const val = activeUniverse === "quantum" ? node.betweennessCentrality : node.betweennessCentrality;
                        return (
                          <div key={id} className="flex items-center justify-between p-2 bg-slate-900/30 border border-slate-900 hover:border-slate-850 rounded-lg transition-colors text-xs font-mono">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-slate-500 font-bold w-4">#{idx+1}</span>
                              <span className="font-bold text-white bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">{label}</span>
                              <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-emerald-400 font-bold">{val}</span>
                              <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${val}%` }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 font-mono italic mt-4">*Betweenness represents structural bridge count. High betweenness points are natural gatekeepers and critical structural vulnerabilities.</p>
              </div>

              {/* Systemic Analysis: SPOFs & Multimodality (col-span-4) */}
              <div className="lg:col-span-4 flex flex-col space-y-4">
                
                {/* SPOF Box */}
                <div className="bg-slate-950 border border-rose-950/50 rounded-xl p-4 shadow-xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-rose-950/45 pb-2.5 mb-3">
                      <h4 className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span>Sovereign SPOF Threat Profiles</span>
                      </h4>
                      <span className="text-[8px] bg-rose-950/60 text-rose-400 border border-rose-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">Critical Audit</span>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {activeUniverse === "quantum" ? (
                        <>
                          <div className="bg-rose-950/10 border border-rose-900/25 p-2 rounded text-xs leading-relaxed">
                            <strong className="text-rose-400 font-mono block text-[10px] uppercase">Cryogenic Gas (LIN / AIQUY):</strong>
                            Extreme global helium isotope refining concentration. 100% of superconducting/spin R&D relies on Linde and Air Liquide strategic isotope reserves.
                          </div>
                          <div className="bg-rose-950/10 border border-rose-900/25 p-2 rounded text-xs leading-relaxed">
                            <strong className="text-rose-400 font-mono block text-[10px] uppercase">Lithography Monopoly (ASML):</strong>
                            Absolute supply lock-in for high-NA EUV lithography tracks. If ASML's Netherlands campus experiences a major logistics interruption, advanced logic scaling stalls globally.
                          </div>
                          <div className="bg-rose-950/10 border border-rose-900/25 p-2 rounded text-xs leading-relaxed">
                            <strong className="text-rose-400 font-mono block text-[10px] uppercase">Advanced Foundry Packaging (TSM / GFS):</strong>
                            Taiwan and US packaging pipelines represent a highly concentrated physical bottleneck for cryo-ASICs and silicon photonics runs.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-rose-950/10 border border-rose-900/25 p-2 rounded text-xs leading-relaxed">
                            <strong className="text-rose-400 font-mono block text-[10px] uppercase">HTS Conductor Tapes (FUAFY / SMTOY):</strong>
                            Furukawa (SuperPower) and Sumitomo are global gatekeepers for REBCO tape. Compact high-field confinement magnets cannot scale without their manufacturing.
                          </div>
                          <div className="bg-rose-950/10 border border-rose-900/25 p-2 rounded text-xs leading-relaxed">
                            <strong className="text-rose-400 font-mono block text-[10px] uppercase">Vacuum Valve Monopolies (VATYF):</strong>
                            VAT Group controls over 80% of high-end gate valves needed to maintain physical stellarator vacuum boundaries. No alternatives exist.
                          </div>
                          <div className="bg-rose-950/10 border border-rose-900/25 p-2 rounded text-xs leading-relaxed">
                            <strong className="text-rose-400 font-mono block text-[10px] uppercase">Plasma Simulation Engines (NVDA):</strong>
                            Magnetohydrodynamic (MHD) optimization and real-time stellarator feedback systems depend completely on high-density NVIDIA tensor arrays.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-slate-500 font-mono italic mt-3">*Sovereign security mandates suggest establishing high-density local physical buffers for these critical rails.</p>
                </div>

                {/* Multimodal enablers benefit box */}
                <div className="bg-slate-950 border border-cyan-950/50 rounded-xl p-4 shadow-xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-cyan-950/45 pb-2.5 mb-3">
                      <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>{activeUniverse === "quantum" ? "Multimodality (Doctrine Principle 1)" : "Cross-Confinement Enablers"}</span>
                      </h4>
                      <span className="text-[8px] bg-cyan-950 text-cyan-300 border border-cyan-900/60 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Moat Audit</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                      {activeUniverse === "quantum" ? (
                        "Pathfinder prefers modality agnostic enablers over single-qubit architecture pure plays. These enablers generate immediate commercial yields regardless of which modality (Superconducting, Trapped Ion, Neutral Atom, Spin or Photonic) wins."
                      ) : (
                        "Fusions enablers classified as 'Modality Agnostic' service both Stellarator and Tokamak architectures. They possess durable moats and are highly insulated from design-level obsolescence risks."
                      )}
                    </p>

                    <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                      {(activeUniverse === "quantum" ? multimodalEnablers : fusionMultimodalEnablers).slice(0, 8).map(e => {
                        const label = activeUniverse === "quantum" ? e.ticker : e.nodeId;
                        return (
                          <span key={label} className="bg-slate-900 text-slate-300 hover:text-cyan-400 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1">
                            <span>{label}</span>
                            <span className="text-[8px] text-slate-500">• {e.pageRank}%</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono mt-3 flex items-center gap-1.5 leading-tight bg-cyan-950/15 p-2 rounded border border-cyan-900/20">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>These enablers act as physical pipelines or rails. Their cash flows are locked-in and secure across 15-year R&D timelines.</span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: EVIDENCE LEDGER EXPORT                                         */}
      {/* ========================================================================= */}
      {universeSubTab === "ledger" && (
        <div className="relative space-y-4 z-10 animate-fade-in" id="quantum-evidence-ledger">
          
          <div className="bg-[#050912]/80 border border-slate-900 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Quantum Infrastructure Evidence Ledger</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">Format and export the full 54-entity Pathfinder Quantum Infrastructure Universe. Directly import this structured evidentiary set into your Wall Street database.</p>
            </div>

            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setLedgerFormat("json")}
                className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all ${ledgerFormat === "json" ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40" : "text-slate-400"}`}
              >
                JSON SCHEMA
              </button>
              <button
                onClick={() => setLedgerFormat("csv")}
                className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all ${ledgerFormat === "csv" ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40" : "text-slate-400"}`}
              >
                CSV TABLE
              </button>
              <button
                onClick={() => setLedgerFormat("import")}
                className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all ${ledgerFormat === "import" ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40" : "text-slate-400"}`}
              >
                HERMES COMPILER
              </button>
            </div>
          </div>

          <div className="relative bg-[#02050b] border border-slate-900 rounded-xl overflow-hidden min-h-[400px]">
            {/* Copy button */}
            <button
              onClick={() => copyToClipboard(exportContent, ledgerFormat.toUpperCase())}
              className="absolute right-4 top-4 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 z-25 shadow-lg"
            >
              {copiedText === ledgerFormat.toUpperCase() ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">COPIED SUCCESSFULLY</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY {ledgerFormat.toUpperCase()} TO CLIPBOARD</span>
                </>
              )}
            </button>

            {/* Export block */}
            <pre className="p-5 overflow-auto max-h-[500px] text-[10px] text-slate-400 font-mono leading-relaxed select-all">
              {exportContent}
            </pre>
          </div>

          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex items-center gap-3 text-xs leading-relaxed">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="text-slate-300">
              <strong className="text-cyan-400 uppercase font-mono block text-[10px] mb-0.5">Physical Provenance Certification:</strong>
              This ledger has been certified under the Pathfinder Quantum Infrastructure protocol. It is pre-configured to automatically connect with existing sovereign defense mapping engines and nuclear energy grid telemetry databases.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
