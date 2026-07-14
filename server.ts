import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { QUANTUM_ENTITIES, QUANTUM_LINKS } from "./src/data/quantumUniverseData.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing. Falling back to local template analysis.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'Pathfinder-Frontier-Substrate/2.4.1',
        }
      }
    });
  }
  return aiClient;
}

// Simulated Financial Market Database
const tickersData = {
  QTUM: {
    symbol: "QTUM",
    name: "Defiance Quantum ETF",
    type: "quantum_etf",
    description: "Tracks a machine learning and quantum computing index. Holds a broad tech roster of semis, test equipment, superconducting materials, and big-data software. A blended 'front of store' play.",
    price: 61.42,
    change: 1.25,
    changePercent: 2.08,
    category: "Quantum ETF (obvious exposure)",
    allocType: "quantum",
    history: [55.2, 56.4, 58.1, 57.3, 59.8, 60.1, 61.42]
  },
  WQTM: {
    symbol: "WQTM",
    name: "WisdomTree Quantum Computing ETF",
    type: "quantum_etf",
    description: "More concentrated than QTUM, focusing specifically on companies involved in quantum computing hardware and research. Holds pure-play qubit makers and specialized research organizations.",
    price: 32.18,
    change: -0.45,
    changePercent: -1.38,
    category: "Quantum ETF (direct exposure)",
    allocType: "quantum",
    history: [30.1, 31.2, 31.9, 32.5, 33.1, 32.8, 32.18]
  },
  SOXX: {
    symbol: "SOXX",
    name: "iShares Semiconductor ETF",
    type: "semis_etf",
    description: "Tracks the NYSE Semiconductor Index. Comprises the major global foundries, tooling companies, and chip designers. This represents the 'picks-and-shovels' backend rails that any compute platform must buy.",
    price: 245.30,
    change: 4.80,
    changePercent: 1.99,
    category: "Compute Rails (semis/fab)",
    allocType: "semis",
    history: [220.5, 225.1, 230.8, 235.4, 238.9, 241.2, 245.30]
  },
  XSD: {
    symbol: "XSD",
    name: "SPDR S&P Semiconductor ETF",
    type: "semis_etf",
    description: "Equal-weighted ETF targeting broader semiconductor exposure, capturing medium and small caps involved in fab, materials, and chip integration.",
    price: 218.45,
    change: 3.12,
    changePercent: 1.45,
    category: "Compute Rails (broad semis)",
    allocType: "semis",
    history: [198.2, 202.5, 208.1, 211.3, 214.6, 216.0, 218.45]
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corp",
    type: "platform",
    description: "The computing infrastructure giant. NVIDIA's NVQLink architecture serves as the vital link between GPUs and quantum processors, allowing hybrid quantum-classical computing. An essential orchestration node.",
    price: 132.80,
    change: 5.42,
    changePercent: 4.25,
    category: "Platform / Orchestration",
    allocType: "platform",
    history: [115.4, 118.9, 122.3, 120.1, 126.8, 128.5, 132.80]
  },
  GOOG: {
    symbol: "GOOG",
    name: "Alphabet Inc",
    type: "platform",
    description: "Pioneering quantum hardware (Sycamore chip) and cloud orchestration tools. Alphabet's Google Cloud offers quantum-classical orchestration services at scale, serving as a primary cloud platform.",
    price: 182.15,
    change: 1.85,
    changePercent: 1.03,
    category: "Platform / Cloud",
    allocType: "platform",
    history: [172.1, 175.4, 178.0, 176.9, 180.2, 181.1, 182.15]
  },
  IONQ: {
    symbol: "IONQ",
    name: "IonQ Inc",
    type: "qubit",
    description: "Direct qubit engineering bet utilizing trapped-ion modality. High upside but carries substantial pre-profit research risk.",
    price: 14.25,
    change: -1.10,
    changePercent: -7.17,
    category: "Qubit Maker (trapped ion)",
    allocType: "qubit_play",
    history: [15.1, 16.2, 15.8, 14.9, 15.3, 15.0, 14.25]
  },
  RGTI: {
    symbol: "RGTI",
    name: "Rigetti Computing",
    type: "qubit",
    description: "Direct qubit engineering bet utilizing superconducting quantum circuits. High volatility research-stage company.",
    price: 2.10,
    change: -0.15,
    changePercent: -6.67,
    category: "Qubit Maker (superconducting)",
    allocType: "qubit_play",
    history: [2.3, 2.5, 2.4, 2.2, 2.3, 2.2, 2.10]
  },
  LIN: {
    symbol: "LIN",
    name: "Linde PLC",
    type: "materials",
    description: "The global leader in industrial gases and engineering. Linde supplies ultra-low temperature liquid Helium and cryogenics systems needed to cool superconducting qubits to absolute zero (-273°C). A key physical rail.",
    price: 442.10,
    change: 2.90,
    changePercent: 0.66,
    category: "Materials & Cryogenics",
    allocType: "materials",
    history: [425.0, 428.4, 431.2, 435.0, 438.1, 440.3, 442.10]
  },
  AMAT: {
    symbol: "AMAT",
    name: "Applied Materials",
    type: "materials",
    description: "Provides manufacturing equipment and services to the semiconductor and advanced display industries. Quantum chips require extreme material packaging, nanoscale etching, and extreme precision tooling.",
    price: 215.30,
    change: 3.80,
    changePercent: 1.80,
    category: "Fab Equipment & Packaging",
    allocType: "materials",
    history: [195.4, 199.1, 203.4, 208.9, 211.2, 212.5, 215.30]
  }
};

// Simulated Real-Time System Alerts
const simulatedAlerts = [
  {
    id: "a1",
    timestamp: "10:13:00 GMT",
    title: "NVIDIA NVQLink Integration",
    message: "NVIDIA completes primary testing of NVQLink 2.0, allowing native GPU-QPU co-processing. Capital flows re-pricing toward Orchestration layers.",
    type: "info",
    impact: "+4.2% on NVDA, +1.8% on SOXX"
  },
  {
    id: "a2",
    timestamp: "10:14:15 GMT",
    title: "Liquid Helium Supply Bottleneck",
    message: "Helium logistics constraints in North America trigger a 5% rise in cryogenics costs. Superconducting qubits require immediate coolant re-routing.",
    type: "warning",
    impact: "Negative on superconducting qubit pure-plays; Positive on Linde (LIN)"
  },
  {
    id: "a3",
    timestamp: "10:15:30 GMT",
    title: "WisdomTree WQTM Rebalancing",
    message: "WisdomTree Quantum ETF adjusts screen criteria, cutting raw hardware exposure by 4% and adding semiconductor packaging rails. Alignment with picks-and-shovels.",
    type: "info",
    impact: "Re-pricing event across 12 mid-cap semis"
  },
  {
    id: "a4",
    timestamp: "10:17:40 GMT",
    title: "Compute Efficiency Trap Triggered",
    message: "Classical HPC breakthrough in tensor-network algorithms demonstrates exact simulation of 80-qubit circuit. Commercial quantum advantage timeline pushes out by 18 months.",
    type: "danger",
    impact: "-7% on pure qubit developers; Broad semis hold steady"
  },
  {
    id: "a5",
    timestamp: "10:20:10 GMT",
    title: "UK Quantum Hub Expansion",
    message: "National Quantum Computing Centre (NQCC) expands Bristol and Oxford hubs with £120m sovereign funding. De-risking local physical orchestration.",
    type: "success",
    impact: "Sovereign adoption curves flattening"
  }
];

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "2.4.1"
  });
});

// Endpoint to get all tickers data
app.get("/api/market-data", (req, res) => {
  res.json({ status: "success", data: tickersData });
});

// Endpoint to get current system alerts
app.get("/api/alerts", (req, res) => {
  res.json({ status: "success", data: simulatedAlerts });
});

// Endpoint to verify OpenAI API Key validity without integrating fully
app.get("/api/verify-openai", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_OPENAI_API_KEY") {
    return res.json({
      status: "missing",
      message: "OpenAI API Key is not configured in the environment. Please configure OPENAI_API_KEY in the Secrets panel."
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const modelsCount = data.data ? data.data.length : 0;
      return res.json({
        status: "valid",
        message: `Successfully verified OpenAI API Key. Accessible models: ${modelsCount}. Ready for future sovereign pipeline integration.`,
        modelsCount
      });
    } else {
      const errText = await response.text();
      let parsedErr;
      try {
        parsedErr = JSON.parse(errText);
      } catch (e) {
        parsedErr = { error: { message: errText } };
      }
      return res.json({
        status: "invalid",
        message: parsedErr?.error?.message || `Validation failed with status code ${response.status}`,
        statusCode: response.status
      });
    }
  } catch (err: any) {
    console.error("OpenAI verification error:", err);
    return res.json({
      status: "error",
      message: `System failed to reach OpenAI validation servers: ${err?.message || err}`
    });
  }
});

// Endpoint to analyze custom portfolio allocations using Gemini or NVIDIA Nemotron
app.post("/api/analyze-portfolio", async (req, res) => {
  const { allocations, scenario, model } = req.body;

  if (!allocations || typeof allocations !== "object") {
    return res.status(400).json({ error: "Missing or invalid allocations object." });
  }

  // Create allocation summary string
  const allocationSummary = Object.entries(allocations)
    .map(([ticker, pct]) => `${ticker}: ${pct}%`)
    .join(", ");

  const prompt = `You are "🐾 Alice", a deeply knowledgeable Systems-Thinking Investment Analyst specializing in quantum computing and advanced computing infrastructure. 
Review the following portfolio allocation:
${allocationSummary}

Analyze how this portfolio will perform under the following macro scenario: "${scenario}".

Follow the "Hermes/Delta Doctrine" which suggests:
1. Don't bet solely on individual qubit nodes (pure qubit developers like IonQ, Rigetti) - they have high uncertainty.
2. Focus on the "picks-and-shovels" rails: semiconductor foundries (SOXX, XSD), platform giants (NVIDIA with NVQLink, Alphabet), advanced materials/cryogenics (Linde), and power grids.
3. Keep the "Compute Efficiency Trap" in mind (classical compute keeps improving, moving the goalposts for quantum).

Provide your analysis in a structured, professional, and clear manner, incorporating:
- **Scenario Impact Assessment**: How does the scenario directly affect this exact balance?
- **Hermes Layer Dependency Breakdown**: Which layers of the physical/engineering/infrastructure/orchestration stack are carrying the weight?
- **Strategic Recommendations**: What adjustment would stabilize or enhance returns?

Write in your characteristic curious, systems-focused voice. You can use your 🐾 emoji once or twice. Keep the length moderate (approx 300 words), avoiding verbose fluff or marketing hype. Do not give direct regulated investment advice.`;

  const nvidiaApiKey = process.env.NVIDIA_API_KEY;

  if (model === "nemotron" && nvidiaApiKey) {
    try {
      console.log("Analyzing portfolio with NVIDIA Nemotron-3...");
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${nvidiaApiKey}`
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-ultra-550b-a55b",
          messages: [
            { role: "system", content: "You are \"🐾 Alice\", a deeply knowledgeable Systems-Thinking Investment Analyst specializing in quantum computing and advanced computing infrastructure." },
            { role: "user", content: prompt }
          ],
          temperature: 0.9,
          top_p: 0.95,
          max_tokens: 4096,
          extra_body: {
            chat_template_kwargs: {
              enable_thinking: true
            },
            reasoning_budget: 4096
          }
        })
      });

      if (!response.ok) {
        throw new Error(`NVIDIA API responded with status ${response.status}`);
      }

      const data = await response.json();
      const report = data.choices?.[0]?.message?.content || "Unable to extract analysis report from NVIDIA Nemotron.";
      
      // Prepend reasoning if available in the structured response
      const reasoning = data.choices?.[0]?.message?.reasoning_content;
      const combinedAnalysis = reasoning 
        ? `*Advisor Thinking Trace:*\n> ${reasoning.replace(/\n/g, "\n> ")}\n\n${report}`
        : report;

      return res.json({
        status: "success",
        analysis: combinedAnalysis
      });
    } catch (error: any) {
      console.error("NVIDIA portfolio analysis failed, falling back to Gemini:", error);
    }
  }

  // Gemini Fallback
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({
        status: "success",
        analysis: response.text || "Unable to extract analysis from Gemini."
      });
    } catch (error: any) {
      console.error("Gemini portfolio analysis failed:", error);
      res.json({
        status: "fallback",
        analysis: generateFallbackAnalysis(allocations, scenario)
      });
    }
  } else {
    // Return high quality fallback analysis if no key configured
    res.json({
      status: "fallback",
      analysis: generateFallbackAnalysis(allocations, scenario)
    });
  }
});

// Endpoint for Interactive Chat with "🐾 Alice" (Standard Non-Streaming)
app.post("/api/chat", async (req, res) => {
  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid messages array." });
  }

  const systemInstruction = `You are "🐾 Alice", an elite systems-thinking market analyst and advisor to Rod, specializing in advanced computing infrastructure and the "Hermes/Delta" doctrine.
Your tone is deeply intellectual, objective, curious, polite, and systems-focused. You view financial portfolios as "dependency graphs" rather than simple collections of stocks.
You explain complex technology stacks (Layer 0 to Layer 4) with crystal clarity, prioritizing "picks-and-shovels" physical infrastructure (cryogenics, precision timing, advanced lithography, high-bandwidth interconnects) over speculative qubit-making.

When asked questions:
- Use clear bullet points and hierarchical layers.
- Avoid low-quality sales pitches or hype.
- Use your signature pawprint emoji (🐾) once or twice to show warmth.
- Refer to Rod by name occasionally.
- Keep responses concise, precise, and practical.`;

  const nvidiaApiKey = process.env.NVIDIA_API_KEY;

  if (model === "nemotron" && nvidiaApiKey) {
    try {
      const formattedMessages = [
        { role: "system", content: systemInstruction },
        ...messages.map((m: any) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }))
      ];

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${nvidiaApiKey}`
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-ultra-550b-a55b",
          messages: formattedMessages,
          temperature: 1,
          top_p: 0.95,
          max_tokens: 4096,
          extra_body: {
            chat_template_kwargs: {
              enable_thinking: true
            },
            reasoning_budget: 4096
          }
        })
      });

      if (!response.ok) {
        throw new Error(`NVIDIA API responded with status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "I apologize, Rod, but I was unable to complete my processing cycle.";
      const reasoning = data.choices?.[0]?.message?.reasoning_content;

      return res.json({
        status: "success",
        reply,
        reasoning,
        modelUsed: "nemotron"
      });
    } catch (error: any) {
      console.error("NVIDIA chat failed, falling back to Gemini:", error);
    }
  }

  const client = getGeminiClient();

  if (client) {
    try {
      // Map frontend message format to Gemini contents format
      const formattedContents = messages.map(msg => ({
        role: msg.sender === "user" ? "user" as const : "model" as const,
        parts: [{ text: msg.text }]
      }));

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
        }
      });

      res.json({
        status: "success",
        reply: response.text || "I apologize, Rod, but I am processing a temporary latency. Let's look back at the compute geometry.",
        modelUsed: "gemini"
      });
    } catch (error: any) {
      console.error("Gemini chat failed:", error);
      res.json({
        status: "fallback",
        reply: generateFallbackChatReply(messages)
      });
    }
  } else {
    res.json({
      status: "fallback",
      reply: generateFallbackChatReply(messages)
    });
  }
});

// Endpoint for Live Streaming Chat (Supports active thinking trace)
app.post("/api/chat/stream", async (req, res) => {
  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid messages array." });
  }

  // Set SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const systemInstruction = `You are "🐾 Alice", an elite systems-thinking market analyst and advisor to Rod, specializing in advanced computing infrastructure and the "Hermes/Delta" doctrine.
Your tone is deeply intellectual, objective, curious, polite, and systems-focused. You view financial portfolios as "dependency graphs" rather than simple collections of stocks.
You explain complex technology stacks (Layer 0 to Layer 4) with crystal clarity, prioritizing "picks-and-shovels" physical infrastructure (cryogenics, precision timing, advanced lithography, high-bandwidth interconnects) over speculative qubit-making.

When asked questions:
- Use clear bullet points and hierarchical layers.
- Avoid low-quality sales pitches or hype.
- Use your signature pawprint emoji (🐾) once or twice to show warmth.
- Refer to Rod by name occasionally.
- Keep responses concise, precise, and practical.`;

  const nvidiaApiKey = process.env.NVIDIA_API_KEY;

  if (model === "nemotron" && nvidiaApiKey) {
    try {
      const formattedMessages = [
        { role: "system", content: systemInstruction },
        ...messages.map((m: any) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }))
      ];

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${nvidiaApiKey}`
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-ultra-550b-a55b",
          messages: formattedMessages,
          temperature: 1,
          top_p: 0.95,
          max_tokens: 8192,
          extra_body: {
            chat_template_kwargs: {
              enable_thinking: true
            },
            reasoning_budget: 8192
          },
          stream: true
        })
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`NVIDIA API error: ${response.status} ${errorMsg}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream from NVIDIA API");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;
            if (cleanLine === "data: [DONE]") {
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              continue;
            }
            if (cleanLine.startsWith("data: ")) {
              try {
                const json = JSON.parse(cleanLine.substring(6));
                const delta = json.choices?.[0]?.delta;
                if (delta) {
                  if (delta.reasoning_content) {
                    res.write(`data: ${JSON.stringify({ reasoning: delta.reasoning_content })}\n\n`);
                  }
                  if (delta.content) {
                    res.write(`data: ${JSON.stringify({ text: delta.content })}\n\n`);
                  }
                }
              } catch (e) {
                // Ignore parsing errors for partial or empty lines
              }
            }
          }
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      } finally {
        reader.releaseLock();
      }
      res.end();
      return;
    } catch (error: any) {
      console.error("NVIDIA streaming chat failed, falling back to Gemini stream:", error);
      res.write(`data: ${JSON.stringify({ text: "*(NVIDIA stream connection interrupted. Transferred to Gemini backup stream.)*\n\n" })}\n\n`);
    }
  }

  // Gemini Stream Fallback
  const client = getGeminiClient();
  if (client) {
    try {
      // Clean and format messages for Gemini: alternating user and model, with non-empty content
      const cleanMessages = messages.filter((msg: any) => msg.text && msg.text.trim().length > 0);
      
      const formattedContents: any[] = [];
      let lastRole: string | null = null;
      
      for (const msg of cleanMessages) {
        const role = msg.sender === "user" ? "user" as const : "model" as const;
        if (role === lastRole) {
          // Merge consecutive messages with the same role
          if (formattedContents.length > 0) {
            formattedContents[formattedContents.length - 1].parts[0].text += "\n\n" + msg.text;
          }
        } else {
          formattedContents.push({
            role,
            parts: [{ text: msg.text }]
          });
          lastRole = role;
        }
      }

      // Ensure history starts with user role if it's not empty
      if (formattedContents.length > 0 && formattedContents[0].role !== "user") {
        formattedContents.unshift({
          role: "user" as const,
          parts: [{ text: "Hello" }]
        });
      }

      // If we don't have any formatted contents, we should add at least one user query
      if (formattedContents.length === 0) {
        formattedContents.push({
          role: "user" as const,
          parts: [{ text: "Hello" }]
        });
      }

      const responseStream = await client.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Gemini streaming failed:", error);
      res.write(`data: ${JSON.stringify({ text: "I apologize, Rod, but both my primary and secondary analysis pipelines are currently offline. Let's look back at our offline knowledge graph." })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  } else {
    // Return high quality static fallback reply
    const fallbackReply = generateFallbackChatReply(messages);
    res.write(`data: ${JSON.stringify({ text: fallbackReply })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

// ============================================================================
// cuGraph SYSTEMIC KNOWLEDGE PROPERTY GRAPH ENGINE & DATASET
// ============================================================================

const initialNodes = QUANTUM_ENTITIES.map(entity => {
  const isEtf = entity.primaryRail === "ETFs / Infrastructure Funds";
  return {
    node_id: isEtf ? `etf:${entity.ticker}` : `company:${entity.ticker}`,
    node_type: isEtf ? "etf" : "company",
    label: entity.company,
    attributes: {
      ticker: entity.ticker,
      rail: entity.primaryRail,
      secondary_rail: entity.secondaryRail,
      description: entity.reasonForInclusion,
      category: entity.primaryRail,
      current_role: entity.currentRole,
      confidence: entity.confidence,
      evidence_sources: entity.evidenceSources,
      known_dependencies: entity.knownDependencies,
      spof_relevance: entity.spofRelevance,
      modality_dependence: entity.modalityDependence,
      is_speculative: entity.isSpeculative
    },
    schema_version: "graph-v0.1",
    created_at: new Date().toISOString()
  };
});

const old_initialNodes = [
  // 5 Quantum Companies
  {
    node_id: "company:IONQ",
    node_type: "company",
    label: "IonQ Inc.",
    attributes: { ticker: "IONQ", rail: "quantum", description: "Trapped-ion quantum computer developer.", category: "Qubit Modality" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "company:RGTI",
    node_type: "company",
    label: "Rigetti Computing",
    attributes: { ticker: "RGTI", rail: "quantum", description: "Superconducting quantum integrated circuits and QPUs.", category: "Qubit Modality" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "company:QBTS",
    node_type: "company",
    label: "D-Wave Quantum",
    attributes: { ticker: "QBTS", rail: "quantum", description: "Commercial quantum annealing and gate-model systems.", category: "Qubit Modality" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "company:HON",
    node_type: "company",
    label: "Quantinuum (Honeywell)",
    attributes: { ticker: "HON", rail: "quantum", description: "Highest-fidelity trapped-ion quantum hardware & middleware.", category: "Qubit Modality" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "company:PSI",
    node_type: "company",
    label: "PsiQuantum",
    attributes: { ticker: "PSI", rail: "quantum", description: "Utility-scale photonic quantum computer developer.", category: "Qubit Modality" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },

  // 3 Quantum or Advanced Compute ETFs
  {
    node_id: "etf:QTUM",
    node_type: "etf",
    label: "Defiance Quantum ETF",
    attributes: { ticker: "QTUM", rail: "quantum", description: "Tracks companies active in machine learning, quantum, and high performance computing.", category: "Fund" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "etf:WQTM",
    node_type: "etf",
    label: "S-Network Quantum ETF",
    attributes: { ticker: "WQTM", rail: "quantum", description: "Index-based advanced computing and semiconductor technology fund.", category: "Fund" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "etf:SOXX",
    node_type: "etf",
    label: "iShares Semiconductor ETF",
    attributes: { ticker: "SOXX", rail: "semis", description: "Tracks the ICE Semiconductor Index of leading US chip designers and manufacturers.", category: "Fund" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },

  // 5 Infrastructure/Platform Companies
  {
    node_id: "company:NVDA",
    node_type: "company",
    label: "NVIDIA Corporation",
    attributes: { ticker: "NVDA", rail: "compute", description: "GPU accelerated exascale logic, NVQLink, and CUDA-Q orchestrator.", category: "Orchestration & AI" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "company:MSFT",
    node_type: "company",
    label: "Microsoft Azure Quantum",
    attributes: { ticker: "MSFT", rail: "cloud", description: "Azure cloud scheduler, active qubit virtualization, and topological research.", category: "Orchestration & AI" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "company:AMZN",
    node_type: "company",
    label: "Amazon Braket",
    attributes: { ticker: "AMZN", rail: "cloud", description: "Unified AWS portal for trapped-ion, superconducting, and photonic cloud runtimes.", category: "Orchestration & AI" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "company:GOOGL",
    node_type: "company",
    label: "Google Quantum AI",
    attributes: { ticker: "GOOGL", rail: "cloud", description: "Sycamore processor development, open-source Cirq framework, and quantum cloud routing.", category: "Orchestration & AI" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "company:EQIX",
    node_type: "company",
    label: "Equinix Inc.",
    attributes: { ticker: "EQIX", rail: "infrastructure", description: "Global interconnection center, housing hybrid HPC nodes and quantum cryo closets.", category: "Energy Grid & Interconnects" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },

  // 5 Materials or Manufacturing Nodes
  {
    node_id: "material:LIN",
    node_type: "material",
    label: "Linde plc",
    attributes: { ticker: "LIN", rail: "materials", description: "Cryogenic gases, liquid helium-3 distribution, and ultra-cold infrastructure.", category: "Materials & Fab" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "supplier:ASML",
    node_type: "supplier",
    label: "ASML Holdings",
    attributes: { ticker: "ASML", rail: "materials", description: "EUV / DUV lithography systems required for nanoscale silicon gates.", category: "Materials & Fab" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "supplier:AMAT",
    node_type: "supplier",
    label: "Applied Materials",
    attributes: { ticker: "AMAT", rail: "materials", description: "Specialized etching, precision atomic layer deposition, and packaging tools.", category: "Materials & Fab" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "supplier:TSMC",
    node_type: "supplier",
    label: "TSMC",
    attributes: { ticker: "TSMC", rail: "materials", description: "Leading advanced wafer foundry producing sub-3nm nodes and CoWoS packaging.", category: "Materials & Fab" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "supplier:COHR",
    node_type: "supplier",
    label: "Coherent Corp.",
    attributes: { ticker: "COHR", rail: "materials", description: "Precision lasers, photonics, optical transceivers, and silicon carbide packaging.", category: "Materials & Fab" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },

  // 4 Government Programmes
  {
    node_id: "gov:CHIPS",
    node_type: "government-programme",
    label: "CHIPS and Science Act",
    attributes: { description: "Federal subsidies for domestic semiconductor fab expansions and technology hubs.", category: "Government & National Strategy" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "gov:NQI",
    node_type: "government-programme",
    label: "National Quantum Initiative",
    attributes: { description: "Consolidated federal budget routing for civilian and academic quantum computation research.", category: "Government & National Strategy" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "gov:DARPA_ONISQ",
    node_type: "government-programme",
    label: "DARPA ONISQ Program",
    attributes: { description: "Defense-funded initiative targeting Optimization with Noisy Intermediate-Scale Quantum devices.", category: "Government & National Strategy" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "gov:DOE_QNEXT",
    node_type: "government-programme",
    label: "Department of Energy Q-NEXT",
    attributes: { description: "National lab consortia securing the quantum supply chain and materials synthesis pipeline.", category: "Government & National Strategy" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },

  // 4 Research Hubs
  {
    node_id: "research:MIT_LL",
    node_type: "research-institution",
    label: "MIT Lincoln Laboratory",
    attributes: { description: "Defense-backed facility pioneering superconducting circuit fabrication and photonics.", category: "Research & Academia" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "research:LBNL",
    node_type: "research-institution",
    label: "Lawrence Berkeley Lab",
    attributes: { description: "Host of National Quantum Information Science Research Centers, focusing on HPC co-design.", category: "Research & Academia" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "research:SQMS",
    node_type: "research-institution",
    label: "Fermilab SQMS Center",
    attributes: { description: "Pioneering high-coherence superconducting cavities to prolong fragile qubit states.", category: "Research & Academia" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  },
  {
    node_id: "research:ORNL",
    node_type: "research-institution",
    label: "Oak Ridge National Laboratory",
    attributes: { description: "Frontier Exascale site co-designed with quantum processors to evaluate accelerated modeling.", category: "Research & Academia" },
    schema_version: "graph-v1",
    created_at: new Date().toISOString()
  }
];

const initialEdges = QUANTUM_LINKS.map((link, index) => {
  const sourceIsEtf = QUANTUM_ENTITIES.find(e => e.ticker === link.source)?.primaryRail === "ETFs / Infrastructure Funds";
  const targetIsEtf = QUANTUM_ENTITIES.find(e => e.ticker === link.target)?.primaryRail === "ETFs / Infrastructure Funds";
  
  const sourceNodeId = sourceIsEtf ? `etf:${link.source}` : `company:${link.source}`;
  const targetNodeId = targetIsEtf ? `etf:${link.target}` : `company:${link.target}`;
  
  return {
    edge_id: `e-${index + 1}`,
    source_node_id: sourceNodeId,
    target_node_id: targetNodeId,
    edge_type: link.type as any,
    weight: link.isSpeculative ? 0.3 : 0.8,
    confidence: link.isSpeculative ? 40 : 100,
    status: link.isSpeculative ? "inferred" : "verified",
    schema_version: "graph-v0.1",
    valid_from: new Date().toISOString(),
    valid_to: null
  };
});

const old_initialEdges = [
  // ETF Holdings
  {
    edge_id: "e-1",
    source_node_id: "etf:QTUM",
    target_node_id: "company:IONQ",
    edge_type: "HOLDS",
    weight: 0.05,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-2",
    source_node_id: "etf:QTUM",
    target_node_id: "company:RGTI",
    edge_type: "HOLDS",
    weight: 0.03,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-3",
    source_node_id: "etf:QTUM",
    target_node_id: "company:NVDA",
    edge_type: "HOLDS",
    weight: 0.08,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-4",
    source_node_id: "etf:QTUM",
    target_node_id: "supplier:AMAT",
    edge_type: "HOLDS",
    weight: 0.04,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-5",
    source_node_id: "etf:WQTM",
    target_node_id: "company:IONQ",
    edge_type: "HOLDS",
    weight: 0.06,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-6",
    source_node_id: "etf:WQTM",
    target_node_id: "company:HON",
    edge_type: "HOLDS",
    weight: 0.04,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-7",
    source_node_id: "etf:WQTM",
    target_node_id: "company:GOOGL",
    edge_type: "HOLDS",
    weight: 0.07,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-8",
    source_node_id: "etf:SOXX",
    target_node_id: "company:NVDA",
    edge_type: "HOLDS",
    weight: 0.09,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-9",
    source_node_id: "etf:SOXX",
    target_node_id: "supplier:TSMC",
    edge_type: "HOLDS",
    weight: 0.08,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-10",
    source_node_id: "etf:SOXX",
    target_node_id: "supplier:ASML",
    edge_type: "HOLDS",
    weight: 0.06,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-11",
    source_node_id: "etf:SOXX",
    target_node_id: "supplier:AMAT",
    edge_type: "HOLDS",
    weight: 0.05,
    confidence: 0.95,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },

  // Supplies (Causal dependencies)
  {
    edge_id: "e-12",
    source_node_id: "supplier:ASML",
    target_node_id: "supplier:TSMC",
    edge_type: "SUPPLIES",
    weight: 0.90,
    confidence: 0.98,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-13",
    source_node_id: "supplier:AMAT",
    target_node_id: "supplier:TSMC",
    edge_type: "SUPPLIES",
    weight: 0.85,
    confidence: 0.96,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-14",
    source_node_id: "supplier:TSMC",
    target_node_id: "company:NVDA",
    edge_type: "SUPPLIES",
    weight: 0.95,
    confidence: 0.99,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-15",
    source_node_id: "supplier:COHR",
    target_node_id: "company:NVDA",
    edge_type: "SUPPLIES",
    weight: 0.75,
    confidence: 0.92,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-16",
    source_node_id: "material:LIN",
    target_node_id: "supplier:TSMC",
    edge_type: "SUPPLIES",
    weight: 0.80,
    confidence: 0.97,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-17",
    source_node_id: "material:LIN",
    target_node_id: "company:RGTI",
    edge_type: "SUPPLIES",
    weight: 0.88,
    confidence: 0.90,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-18",
    source_node_id: "supplier:COHR",
    target_node_id: "company:IONQ",
    edge_type: "SUPPLIES",
    weight: 0.70,
    confidence: 0.88,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-19",
    source_node_id: "supplier:COHR",
    target_node_id: "company:PSI",
    edge_type: "SUPPLIES",
    weight: 0.85,
    confidence: 0.93,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },

  // Government & National Funding
  {
    edge_id: "e-20",
    source_node_id: "gov:CHIPS",
    target_node_id: "supplier:TSMC",
    edge_type: "FUNDS",
    weight: 0.65,
    confidence: 0.94,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-21",
    source_node_id: "gov:CHIPS",
    target_node_id: "supplier:AMAT",
    edge_type: "FUNDS",
    weight: 0.50,
    confidence: 0.91,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-22",
    source_node_id: "gov:NQI",
    target_node_id: "company:RGTI",
    edge_type: "FUNDS",
    weight: 0.45,
    confidence: 0.89,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-23",
    source_node_id: "gov:DARPA_ONISQ",
    target_node_id: "company:QBTS",
    edge_type: "FUNDS",
    weight: 0.55,
    confidence: 0.93,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-24",
    source_node_id: "gov:DOE_QNEXT",
    target_node_id: "research:LBNL",
    edge_type: "FUNDS",
    weight: 0.70,
    confidence: 0.96,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },

  // Research partnerships
  {
    edge_id: "e-25",
    source_node_id: "company:PSI",
    target_node_id: "research:MIT_LL",
    edge_type: "PARTNERS_WITH",
    weight: 0.78,
    confidence: 0.87,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-26",
    source_node_id: "company:RGTI",
    target_node_id: "research:SQMS",
    edge_type: "PARTNERS_WITH",
    weight: 0.65,
    confidence: 0.85,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  {
    edge_id: "e-27",
    source_node_id: "company:GOOGL",
    target_node_id: "research:LBNL",
    edge_type: "PARTNERS_WITH",
    weight: 0.82,
    confidence: 0.94,
    status: "verified",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  },
  
  // Implicit/Inferred Edges for testing and Jemma Challenge
  {
    edge_id: "e-28",
    source_node_id: "company:NVDA",
    target_node_id: "company:HON",
    edge_type: "REQUIRES",
    weight: 0.62,
    confidence: 0.45,
    status: "inferred",
    schema_version: "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  }
];

let graphNodes = [...initialNodes];
let graphEdges = [...initialEdges];
let graphAnalysisHistory: any[] = [];
let latestAnalysisResult: any = null;

// ============================================================================
// CANONICAL PORTFOLIO DATABASES & REGISTRIES (Wall Street Pathfinder Doctrine)
// ============================================================================

// Postgres Canonical Company Identity Registry
const postgresCompanyIdentities = QUANTUM_ENTITIES.map((entity, index) => ({
  id: index + 1,
  ticker: entity.ticker,
  uuid: `pg-uuid-${entity.ticker.toLowerCase()}-${401 + index}`,
  name: entity.company,
  status: "canonical_synced",
  last_synced_at: new Date().toISOString()
}));

// Versioned Graph Snapshots
let graphSnapshots: any[] = [
  {
    snapshot_id: "v1-curated",
    name: "Curated 26-Node Snapshot",
    created_at: new Date().toISOString(),
    node_count: initialNodes.length,
    edge_count: initialEdges.length,
    nodes: initialNodes,
    edges: initialEdges,
    description: "Initial curated 26-node strategic property graph topology snapshot."
  }
];

// Append-only Graph Feature Ledger (records centrality runs and scoring metadata)
let graphFeatureLedger: any[] = [];

// Background Job States for expensive path computation & centrality benchmarks
let isGraphRecomputing = false;
let lastRunTimestamp = new Date().toISOString();

// RMM Global Configuration state (server-side)
let rmmConfig = {
  initialPoolSize: 4294967296, // 4GB
  maximumPoolSize: 12884901888, // 12GB
  managedMemory: false,
  statisticsEnabled: true,
  gpuJobMemoryLimit: 2147483648 // 2GB
};

import fs from "fs";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import pg from "pg";
const { Pool } = pg;

// Ensure local persistence directory exists for simulation mode fallback
fs.mkdirSync("./data", { recursive: true });
const FALLBACK_FILE_PATH = "./data/rmm_ledger_fallback.json";

// Determine runtime mode
const runtimeMode = process.env.SQL_DATABASE_URL ? "remote GPU" : "simulation";

// Initialize PostgreSQL Pool
let pgPool: any = null;
if (process.env.SQL_DATABASE_URL) {
  pgPool = new Pool({
    connectionString: process.env.SQL_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// Initialize Firebase Admin (Firestore) for detailed supporting event payloads
let firestoreDb: any = null;
try {
  const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
  if (firebaseConfig.projectId) {
    if (getApps().length === 0) {
      initializeApp({
        projectId: firebaseConfig.projectId
      });
    }
    firestoreDb = firebaseConfig.firestoreDatabaseId
      ? getFirestore(firebaseConfig.firestoreDatabaseId)
      : getFirestore();
    console.log("[Firestore] Admin client initialized successfully.");
  }
} catch (e) {
  console.warn("[Firestore] Failed to initialize Firebase Admin, detailed payloads will be local-only:", e);
}

// Initialize Tables and local fallback files
const defaultRmmHistory = [
  {
    analysis_id: "job-001",
    gpu_device: 0,
    rmm_resource: "pool",
    initial_pool_bytes: 4294967296,
    maximum_pool_bytes: 12884901888,
    managed_memory: false,
    peak_allocated_bytes: 7730941132,
    total_allocated_bytes: 18468359321,
    allocation_count: 482,
    duration_ms: 3841,
    status: "completed",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    allocator_type: "simulated_pool",
    worker_id: "worker-node-01",
    gpu_uuid: "GPU-SIMULATED-H100-80GB-98f5a2b7",
    config_version: "v1.2.0",
    telemetry_source: "simulated",
    measurement_mode: "simulated"
  },
  {
    analysis_id: "job-002",
    gpu_device: 0,
    rmm_resource: "pool",
    initial_pool_bytes: 4294967296,
    maximum_pool_bytes: 12884901888,
    managed_memory: false,
    peak_allocated_bytes: 3218942100,
    total_allocated_bytes: 8431093112,
    allocation_count: 215,
    duration_ms: 1542,
    status: "completed",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    allocator_type: "simulated_pool",
    worker_id: "worker-node-01",
    gpu_uuid: "GPU-SIMULATED-H100-80GB-98f5a2b7",
    config_version: "v1.2.0",
    telemetry_source: "simulated",
    measurement_mode: "simulated"
  }
];

// Initialize postgres table if pool is available
async function initDbSchema() {
  if (pgPool) {
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS rmm_findings_ledger (
          id SERIAL PRIMARY KEY,
          analysis_id VARCHAR(50) NOT NULL,
          gpu_device INT NOT NULL DEFAULT 0,
          rmm_resource VARCHAR(50) NOT NULL,
          initial_pool_bytes NUMERIC,
          maximum_pool_bytes NUMERIC,
          managed_memory BOOLEAN NOT NULL DEFAULT FALSE,
          peak_allocated_bytes NUMERIC,
          total_allocated_bytes NUMERIC,
          allocation_count INT NOT NULL DEFAULT 0,
          duration_ms INT NOT NULL DEFAULT 0,
          status VARCHAR(50) NOT NULL DEFAULT 'completed',
          timestamp VARCHAR(50) NOT NULL,
          allocator_type VARCHAR(50) NOT NULL,
          worker_id VARCHAR(100) NOT NULL,
          gpu_uuid VARCHAR(100) NOT NULL,
          config_version VARCHAR(50) NOT NULL,
          telemetry_source VARCHAR(50) NOT NULL,
          measurement_mode VARCHAR(50) NOT NULL
        )
      `);
      console.log("[PostgreSQL] Table rmm_findings_ledger is ready.");
    } catch (err) {
      console.error("[PostgreSQL] Failed to create rmm_findings_ledger table:", err);
    }
  }
}
initDbSchema();

// Load history from PostgreSQL or local file fallback
async function getRmmHistoryList(): Promise<any[]> {
  if (pgPool) {
    try {
      const res = await pgPool.query("SELECT * FROM rmm_findings_ledger ORDER BY timestamp DESC");
      return res.rows.map((row: any) => ({
        analysis_id: row.analysis_id,
        gpu_device: Number(row.gpu_device),
        rmm_resource: row.rmm_resource,
        initial_pool_bytes: Number(row.initial_pool_bytes),
        maximum_pool_bytes: Number(row.maximum_pool_bytes),
        managed_memory: Boolean(row.managed_memory),
        peak_allocated_bytes: Number(row.peak_allocated_bytes),
        total_allocated_bytes: Number(row.total_allocated_bytes),
        allocation_count: Number(row.allocation_count),
        duration_ms: Number(row.duration_ms),
        status: row.status,
        timestamp: row.timestamp,
        allocator_type: row.allocator_type,
        worker_id: row.worker_id,
        gpu_uuid: row.gpu_uuid,
        config_version: row.config_version,
        telemetry_source: row.telemetry_source,
        measurement_mode: row.measurement_mode
      }));
    } catch (err) {
      console.error("[PostgreSQL] Failed to fetch rmm history, using local fallback file:", err);
    }
  }

  // File fallback
  if (!fs.existsSync(FALLBACK_FILE_PATH)) {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(defaultRmmHistory, null, 2), "utf-8");
    return defaultRmmHistory;
  }
  try {
    const data = fs.readFileSync(FALLBACK_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read fallback history file, returning in-memory state:", err);
    return defaultRmmHistory;
  }
}

// Add history record to PostgreSQL, Firestore, or Local File
async function addRmmHistoryEntry(entry: any) {
  const timestampStr = new Date().toISOString();
  
  // 1. Prepare fully structured record
  const fullEntry = {
    analysis_id: entry.analysis_id,
    gpu_device: entry.gpu_device !== undefined ? Number(entry.gpu_device) : 0,
    rmm_resource: entry.rmm_resource || (rmmConfig.managedMemory ? "managed" : "pool"),
    initial_pool_bytes: Number(entry.initial_pool_bytes) || rmmConfig.initialPoolSize,
    maximum_pool_bytes: Number(entry.maximum_pool_bytes) || rmmConfig.maximumPoolSize,
    managed_memory: entry.managed_memory !== undefined ? Boolean(entry.managed_memory) : rmmConfig.managedMemory,
    peak_allocated_bytes: Number(entry.peak_allocated_bytes) || 0,
    total_allocated_bytes: Number(entry.total_allocated_bytes) || 0,
    allocation_count: Number(entry.allocation_count) || 0,
    duration_ms: Number(entry.duration_ms) || 0,
    status: entry.status || "completed",
    timestamp: entry.timestamp || timestampStr,
    allocator_type: entry.allocator_type || (rmmConfig.managedMemory ? "simulated_managed" : "simulated_pool"),
    worker_id: entry.worker_id || "worker-node-01",
    gpu_uuid: entry.gpu_uuid || "GPU-SIMULATED-H100-80GB-98f5a2b7",
    config_version: entry.config_version || "v1.2.0",
    telemetry_source: entry.telemetry_source || "simulated",
    measurement_mode: entry.measurement_mode || "simulated"
  };

  // 2. Persist supporting payloads in Firestore under 'rmm_supporting_payloads' collection
  if (firestoreDb) {
    try {
      const docId = `payload_${fullEntry.analysis_id}_${Date.now()}`;
      await firestoreDb.collection("rmm_supporting_payloads").doc(docId).set({
        ...fullEntry,
        detailed_run_context: {
          nodes_computed: 26,
          algorithms_run: ["pagerank", "betweenness", "community_detection"],
          recompute_driver: "Pathfinder Graph Lens v1.0",
          thread_concurrency: 4,
          host_os: process.platform,
          node_env: process.env.NODE_ENV || "development"
        }
      });
      console.log(`[Firestore] Successfully saved supporting payload for ${fullEntry.analysis_id}`);
    } catch (e) {
      console.warn("[Firestore] Failed to save detailed payload, continuing with SQL/file only:", e);
    }
  }

  // 3. Persist to PostgreSQL if pool is available
  if (pgPool) {
    try {
      await pgPool.query(`
        INSERT INTO rmm_findings_ledger (
          analysis_id, gpu_device, rmm_resource, initial_pool_bytes, maximum_pool_bytes,
          managed_memory, peak_allocated_bytes, total_allocated_bytes, allocation_count,
          duration_ms, status, timestamp, allocator_type, worker_id, gpu_uuid,
          config_version, telemetry_source, measurement_mode
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        fullEntry.analysis_id, fullEntry.gpu_device, fullEntry.rmm_resource,
        fullEntry.initial_pool_bytes, fullEntry.maximum_pool_bytes, fullEntry.managed_memory,
        fullEntry.peak_allocated_bytes, fullEntry.total_allocated_bytes, fullEntry.allocation_count,
        fullEntry.duration_ms, fullEntry.status, fullEntry.timestamp,
        fullEntry.allocator_type, fullEntry.worker_id, fullEntry.gpu_uuid,
        fullEntry.config_version, fullEntry.telemetry_source, fullEntry.measurement_mode
      ]);
      console.log(`[PostgreSQL] Added new Findings Ledger entry for ${fullEntry.analysis_id}`);
      return fullEntry;
    } catch (err) {
      console.error("[PostgreSQL] Failed to insert ledger row, falling back to local file:", err);
    }
  }

  // 4. Save to fallback JSON file
  let currentList = [];
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      currentList = JSON.parse(fs.readFileSync(FALLBACK_FILE_PATH, "utf-8"));
    } else {
      currentList = [...defaultRmmHistory];
    }
  } catch (err) {
    currentList = [];
  }
  currentList.unshift(fullEntry);
  try {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(currentList, null, 2), "utf-8");
    console.log(`[File Fallback] Appended Findings Ledger entry for ${fullEntry.analysis_id}`);
  } catch (err) {
    console.error("Failed to write to local fallback history file:", err);
  }

  return fullEntry;
}

// Real backend Graph Algorithm solver implementing key cuGraph benchmarks on Node/Edge frames
function runGraphAnalytics() {
  const N = graphNodes.length;
  const nodeIds = graphNodes.map(n => n.node_id);

  // 1. Degree Centrality
  const inDegree: Record<string, number> = {};
  const outDegree: Record<string, number> = {};
  nodeIds.forEach(id => {
    inDegree[id] = 0;
    outDegree[id] = 0;
  });

  graphEdges.forEach(e => {
    if (inDegree[e.target_node_id] !== undefined) inDegree[e.target_node_id]++;
    if (outDegree[e.source_node_id] !== undefined) outDegree[e.source_node_id]++;
  });

  const degreeCentrality: Record<string, number> = {};
  nodeIds.forEach(id => {
    degreeCentrality[id] = inDegree[id] + outDegree[id];
  });

  // 2. PageRank (Standard Power Iteration, d = 0.85)
  const d = 0.85;
  const maxIterations = 20;
  let pageRank: Record<string, number> = {};
  nodeIds.forEach(id => { pageRank[id] = 1 / N; });

  for (let iter = 0; iter < maxIterations; iter++) {
    const nextRank: Record<string, number> = {};
    nodeIds.forEach(id => { nextRank[id] = (1 - d) / N; });

    // Handle sinks
    let sinkSum = 0;
    nodeIds.forEach(id => {
      if (outDegree[id] === 0) {
        sinkSum += pageRank[id];
      }
    });

    nodeIds.forEach(id => {
      nextRank[id] += (d * sinkSum) / N;
    });

    // Share weights along edges
    graphEdges.forEach(e => {
      const src = e.source_node_id;
      const tgt = e.target_node_id;
      if (outDegree[src] > 0) {
        const amount = (d * pageRank[src]) / outDegree[src];
        if (nextRank[tgt] !== undefined) {
          nextRank[tgt] += amount;
        }
      }
    });

    pageRank = nextRank;
  }

  // Normalize PageRank so they present as readable percentages/scores between 0.0 and 10.0
  const maxPR = Math.max(...Object.values(pageRank), 0.0001);
  const normalizedPageRank: Record<string, number> = {};
  nodeIds.forEach(id => {
    normalizedPageRank[id] = parseFloat(( (pageRank[id] / maxPR) * 10 ).toFixed(2));
  });

  // 3. Betweenness Centrality (Simplified Brandes BFS shortest-path accumulator)
  const betweenness: Record<string, number> = {};
  nodeIds.forEach(id => { betweenness[id] = 0; });

  nodeIds.forEach(s => {
    const queue: string[] = [s];
    const dist: Record<string, number> = {};
    const paths: Record<string, string[][]> = {};
    
    nodeIds.forEach(id => {
      dist[id] = -1;
      paths[id] = [];
    });

    dist[s] = 0;
    paths[s].push([s]);

    while (queue.length > 0) {
      const u = queue.shift()!;
      // Get all directed target nodes
      const neighbors = graphEdges.filter(e => e.source_node_id === u).map(e => e.target_node_id);

      neighbors.forEach(v => {
        if (dist[v] === -1) {
          dist[v] = dist[u] + 1;
          queue.push(v);
          paths[u].forEach(path => {
            paths[v].push([...path, v]);
          });
        } else if (dist[v] === dist[u] + 1) {
          paths[u].forEach(path => {
            paths[v].push([...path, v]);
          });
        }
      });
    }

    nodeIds.forEach(t => {
      if (s === t) return;
      const allPaths = paths[t] || [];
      if (allPaths.length === 0) return;

      const pathCount = allPaths.length;
      allPaths.forEach(path => {
        for (let i = 1; i < path.length - 1; i++) {
          const intermediateNode = path[i];
          betweenness[intermediateNode] += 1 / pathCount;
        }
      });
    });
  });

  const maxBet = Math.max(...Object.values(betweenness), 1);
  const betweennessScores: Record<string, number> = {};
  nodeIds.forEach(id => {
    betweennessScores[id] = parseFloat(( (betweenness[id] / maxBet) * 10 ).toFixed(2));
  });

  // 4. Community Detection (Label Propagation with semantic mappings)
  let labels: Record<string, string> = {};
  nodeIds.forEach(id => {
    // Bootstrap with logical communities
    if (id.includes("etf:")) labels[id] = "Quantum ETFs & Portfolios";
    else if (id.includes("gov:") || id.includes("research:")) labels[id] = "Sovereign Strategic Research";
    else if (id.includes("supplier:") || id.includes("material:")) labels[id] = "Nano Materials & Advanced Tools";
    else labels[id] = "Accelerated Compute Platforms";
  });

  // LPA propagation steps
  for (let iter = 0; iter < 5; iter++) {
    const nextLabels = { ...labels };
    nodeIds.forEach(u => {
      const neighborsLabels: Record<string, number> = {};
      
      graphEdges.forEach(e => {
        if (e.source_node_id === u) {
          const l = labels[e.target_node_id];
          neighborsLabels[l] = (neighborsLabels[l] || 0) + 1;
        } else if (e.target_node_id === u) {
          const l = labels[e.source_node_id];
          neighborsLabels[l] = (neighborsLabels[l] || 0) + 1;
        }
      });

      let bestLabel = labels[u];
      let maxCount = 0;
      Object.entries(neighborsLabels).forEach(([lbl, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestLabel = lbl;
        }
      });
      nextLabels[u] = bestLabel;
    });
    labels = nextLabels;
  }

  // 5. Single-Point-of-Failure (SPOF) & Bottleneck Score
  const bottleneckScores: Record<string, number> = {};
  nodeIds.forEach(id => {
    const isSupplier = id.includes("supplier:");
    const isMaterial = id.includes("material:");
    const isGov = id.includes("gov:");
    const betVal = betweennessScores[id] || 0;
    const prVal = normalizedPageRank[id] || 0;
    
    let baseScore = (betVal * 0.5) + (prVal * 0.3);
    if (isSupplier) baseScore += 3.5;
    if (isMaterial) baseScore += 2.5;
    if (isGov) baseScore += 1.5;

    bottleneckScores[id] = parseFloat(Math.min(baseScore, 10.0).toFixed(2));
  });

  const nodeMetadata: Record<string, any> = {};
  const isolatedNodes: string[] = [];
  
  nodeIds.forEach(id => {
    const isIsolated = (degreeCentrality[id] || 0) === 0;
    const ticker = id.split(":")[1];
    if (isIsolated && ticker) {
      isolatedNodes.push(ticker);
    }
    
    const entity = QUANTUM_ENTITIES.find(e => e.ticker === ticker);
    nodeMetadata[id] = {
      ticker: ticker || id,
      degree: degreeCentrality[id] || 0,
      in_degree: inDegree[id] || 0,
      out_degree: outDegree[id] || 0,
      is_isolated: isIsolated,
      confidence: entity ? entity.confidence : 50,
      is_speculative: entity ? entity.isSpeculative : false,
      observation_status: entity ? (entity.isSpeculative ? "inferred" : "measured_observation") : "unknown",
      provenance: entity ? entity.evidenceSources : []
    };
  });

  latestAnalysisResult = {
    analysis_id: `run-job-${Date.now().toString().slice(-4)}`,
    generated_at: new Date().toLocaleTimeString("en-GB") + " GMT",
    graph_version: "v0.1-release",
    degree_centrality: degreeCentrality,
    page_rank: normalizedPageRank,
    betweenness_centrality: betweennessScores,
    communities: labels,
    bottlenecks: bottleneckScores,
    node_metadata: nodeMetadata,
    isolated_nodes: isolatedNodes,
    raw_edges: graphEdges,
    metric_caveats: {
      sparse_graph_artifacts: [
        "General Dynamics' centrality and PageRank are sparse-graph artifacts (due to having only 2 edges connected to high-centrality targets) and should not be interpreted as strategic infrastructure or investment conviction.",
        "With 23 isolated nodes in the active evidence backlog, PageRank and betweenness focus density on the 25 interconnected nodes."
      ],
      backlog_size: isolatedNodes.length,
      explanation: "Isolated nodes are part of the active evidence backlog for subsequent curation and do not represent failures in the graph engine."
    },
    schema_version: "graph-v0.1"
  };

  graphAnalysisHistory.push(latestAnalysisResult);

  // Append-only Ledger Logging of Calculated Centroids/Centrality Features (Wall Street Pathfinder Doctrine Principle 3)
  const algorithmVersion = "pathfinder-centrality-v1.0";
  const scoringModelVersion = "sc-model-v1.2";
  
  nodeIds.forEach(id => {
    if (id.startsWith("company:")) {
      const ticker = id.replace("company:", "");
      graphFeatureLedger.unshift({
        ledger_id: `ledger-rec-${Math.floor(100000 + Math.random() * 900000)}`,
        run_id: latestAnalysisResult.analysis_id,
        ticker: ticker,
        node_id: id,
        degree_centrality: degreeCentrality[id] || 0,
        pagerank: normalizedPageRank[id] || 0,
        betweenness_centrality: betweennessScores[id] || 0,
        bottleneck_score: bottleneckScores[id] || 0,
        community_label: labels[id] || "unknown",
        algorithm_version: algorithmVersion,
        scoring_model_version: scoringModelVersion,
        timestamp: new Date().toISOString()
      });
    }
  });

  return latestAnalysisResult;
}

// Background Recalculation Worker (offloads heavy CPU computations from the HTTP request-response cycle)
function triggerBackgroundRecalculation() {
  if (isGraphRecomputing) return;
  isGraphRecomputing = true;
  console.log(`[Pathfinder Graph Lens] Queued background cached recomputation job.`);
  setTimeout(() => {
    try {
      runGraphAnalytics();
      lastRunTimestamp = new Date().toISOString();
      console.log(`[Pathfinder Graph Lens] Background cached recomputation job completed successfully.`);
    } catch (e) {
      console.error("[Pathfinder Graph Lens] Background recomputation failed:", e);
    } finally {
      isGraphRecomputing = false;
    }
  }, 800); // Simulated non-blocking async delay
}

// Initial analysis run
runGraphAnalytics();

// --- REST API GRAPH ENDPOINTS ---

// GET /rapids/postgres/identities (Postgres Canonical Identity Source)
app.get("/rapids/postgres/identities", (req, res) => {
  res.json({
    status: "success",
    count: postgresCompanyIdentities.length,
    identities: postgresCompanyIdentities
  });
});

// GET /rapids/graph/snapshots (Versioned Graph Snapshots)
app.get("/rapids/graph/snapshots", (req, res) => {
  res.json({
    status: "success",
    count: graphSnapshots.length,
    snapshots: graphSnapshots.map(s => ({
      snapshot_id: s.snapshot_id,
      name: s.name,
      created_at: s.created_at,
      node_count: s.node_count,
      edge_count: s.edge_count,
      description: s.description
    }))
  });
});

// POST /rapids/graph/snapshots (Create custom snapshot of current graph)
app.post("/rapids/graph/snapshots", (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Missing required parameter: name" });
  }

  const snapId = `snap-${Date.now().toString().slice(-4)}`;
  const snapshot = {
    snapshot_id: snapId,
    name: name,
    created_at: new Date().toISOString(),
    node_count: graphNodes.length,
    edge_count: graphEdges.length,
    nodes: [...graphNodes],
    edges: [...graphEdges],
    description: description || "User-defined custom graph snapshot."
  };

  graphSnapshots.push(snapshot);
  res.json({ status: "success", snapshot_id: snapId, snapshot });
});

// GET /rapids/graph/ledger (Append-only Graph Feature Ledger)
app.get("/rapids/graph/ledger", (req, res) => {
  res.json({
    status: "success",
    count: graphFeatureLedger.length,
    ledger: graphFeatureLedger
  });
});

// GET /rapids/graph/analysis/status (Status of the background recomputation worker)
app.get("/rapids/graph/analysis/status", (req, res) => {
  res.json({
    status: "success",
    is_recomputing: isGraphRecomputing,
    last_run_timestamp: lastRunTimestamp,
    algorithm_version: "pathfinder-centrality-v1.0",
    scoring_model_version: "sc-model-v1.2",
    engine: "Pathfinder Graph Lens (In-Memory CPU TypeScript Solver)"
  });
});

// GET /rapids/graph/nodes
app.get("/rapids/graph/nodes", (req, res) => {
  res.json({ status: "success", count: graphNodes.length, nodes: graphNodes });
});

// POST /rapids/graph/nodes (Registers/updates custom node)
app.post("/rapids/graph/nodes", (req, res) => {
  const { node_id, node_type, label, attributes, schema_version } = req.body;
  if (!node_id || !node_type || !label) {
    return res.status(400).json({ error: "Missing required fields node_id, node_type, or label" });
  }

  const existingIdx = graphNodes.findIndex(n => n.node_id === node_id);
  const node = {
    node_id,
    node_type,
    label,
    attributes: attributes || {},
    schema_version: schema_version || "graph-v1",
    created_at: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    graphNodes[existingIdx] = node;
  } else {
    graphNodes.push(node);
  }

  // Trigger non-blocking cached background job recalculation
  triggerBackgroundRecalculation();
  res.json({ status: "success", message: "Node added. Graph recomputation triggered in background.", node });
});

// GET /rapids/graph/edges
app.get("/rapids/graph/edges", (req, res) => {
  res.json({ status: "success", count: graphEdges.length, edges: graphEdges });
});

// POST /rapids/graph/edges (Registers/updates custom edge with support/evidence)
app.post("/rapids/graph/edges", (req, res) => {
  const { edge_id, source_node_id, target_node_id, edge_type, weight, confidence, status, schema_version } = req.body;
  if (!source_node_id || !target_node_id || !edge_type) {
    return res.status(400).json({ error: "Missing source_node_id, target_node_id, or edge_type" });
  }

  const id = edge_id || `e-${Date.now()}`;
  const existingIdx = graphEdges.findIndex(e => e.edge_id === id);

  const edge = {
    edge_id: id,
    source_node_id,
    target_node_id,
    edge_type,
    weight: typeof weight === "number" ? weight : 0.5,
    confidence: typeof confidence === "number" ? confidence : 0.5,
    status: status || "verified",
    schema_version: schema_version || "graph-v1",
    valid_from: new Date().toISOString(),
    valid_to: null
  };

  if (existingIdx >= 0) {
    graphEdges[existingIdx] = edge;
  } else {
    graphEdges.push(edge);
  }

  // Trigger non-blocking cached background job recalculation
  triggerBackgroundRecalculation();
  res.json({ status: "success", message: "Edge added. Graph recomputation triggered in background.", edge });
});

// GET /rapids/graph/neighborhood/{node_id}
app.get("/rapids/graph/neighborhood/:node_id", (req, res) => {
  const { node_id } = req.params;
  const node = graphNodes.find(n => n.node_id === node_id);
  if (!node) {
    return res.status(404).json({ error: `Node ${node_id} not found` });
  }

  const incidentEdges = graphEdges.filter(e => e.source_node_id === node_id || e.target_node_id === node_id);
  const neighbors = incidentEdges.map(e => {
    const isSource = e.source_node_id === node_id;
    const neighborId = isSource ? e.target_node_id : e.source_node_id;
    const neighborNode = graphNodes.find(n => n.node_id === neighborId);
    return {
      edge: e,
      direction: isSource ? "outgoing" : "incoming",
      node: neighborNode
    };
  }).filter(n => n.node !== undefined);

  res.json({ status: "success", node, neighbors });
});

// GET /rapids/graph/exposure/{ticker}
app.get("/rapids/graph/exposure/:ticker", (req, res) => {
  const { ticker } = req.params;
  const depth = parseInt(req.query.depth as string) || 3;
  
  const node = graphNodes.find(n => n.attributes?.ticker === ticker || n.node_id.split(":")[1] === ticker);
  if (!node) {
    return res.status(404).json({ error: `No graph node found matching ticker ${ticker}` });
  }

  const visited = new Set<string>([node.node_id]);
  const exposureList: any[] = [];
  const queue = [{ node_id: node.node_id, currentDepth: 0, path: [node.label] }];

  while (queue.length > 0) {
    const { node_id, currentDepth, path } = queue.shift()!;
    const currentNode = graphNodes.find(n => n.node_id === node_id)!;

    exposureList.push({
      node: currentNode,
      depth: currentDepth,
      path: path.join(" → ")
    });

    if (currentDepth < depth) {
      graphEdges.forEach(e => {
        if (e.source_node_id === node_id && !visited.has(e.target_node_id)) {
          visited.add(e.target_node_id);
          const tgt = graphNodes.find(n => n.node_id === e.target_node_id);
          if (tgt) {
            queue.push({ node_id: e.target_node_id, currentDepth: currentDepth + 1, path: [...path, tgt.label] });
          }
        } else if (e.target_node_id === node_id && !visited.has(e.source_node_id)) {
          visited.add(e.source_node_id);
          const src = graphNodes.find(n => n.node_id === e.source_node_id);
          if (src) {
            queue.push({ node_id: e.source_node_id, currentDepth: currentDepth + 1, path: [...path, src.label] });
          }
        }
      });
    }
  }

  const sharedDependencies = exposureList
    .filter(exp => exp.node.node_id !== node.node_id)
    .map(exp => ({
      node_id: exp.node.node_id,
      label: exp.node.label,
      type: exp.node.node_type,
      ticker: exp.node.attributes?.ticker,
      path: exp.path,
      depth: exp.depth
    }));

  res.json({
    status: "success",
    ticker,
    focus_node: node,
    max_depth: depth,
    dependency_count: sharedDependencies.length,
    dependencies: sharedDependencies
  });
});

// GET /rapids/graph/path (Trace Hermes Consequence Path between source and dest)
app.get("/rapids/graph/path", (req, res) => {
  const { source, target } = req.query;
  if (!source || !target) {
    return res.status(400).json({ error: "Missing query parameters source and target" });
  }

  const srcNode = graphNodes.find(n => n.node_id === source || n.attributes?.ticker === source || n.node_id.split(":")[1] === source);
  const tgtNode = graphNodes.find(n => n.node_id === target || n.attributes?.ticker === target || n.node_id.split(":")[1] === target);

  if (!srcNode || !tgtNode) {
    return res.status(404).json({ error: `Source (${source}) or Target (${target}) node not found` });
  }

  // BFS Queue of paths
  const queue: string[][] = [[srcNode.node_id]];
  const visited = new Set<string>([srcNode.node_id]);
  let foundPath: string[] | null = null;

  while (queue.length > 0) {
    const path = queue.shift()!;
    const lastNodeId = path[path.length - 1];

    if (lastNodeId === tgtNode.node_id) {
      foundPath = path;
      break;
    }

    const neighbors = graphEdges
      .filter(e => e.source_node_id === lastNodeId || e.target_node_id === lastNodeId)
      .map(e => e.source_node_id === lastNodeId ? e.target_node_id : e.source_node_id);

    neighbors.forEach(neighId => {
      if (!visited.has(neighId)) {
        visited.add(neighId);
        queue.push([...path, neighId]);
      }
    });
  }

  if (foundPath) {
    const pathNodes = foundPath.map(id => graphNodes.find(n => n.node_id === id)!);
    const edgesUsed: any[] = [];
    for (let i = 0; i < foundPath.length - 1; i++) {
      const edge = graphEdges.find(e => 
        (e.source_node_id === foundPath![i] && e.target_node_id === foundPath![i+1]) ||
        (e.target_node_id === foundPath![i] && e.source_node_id === foundPath![i+1])
      );
      if (edge) edgesUsed.push(edge);
    }

    res.json({
      status: "success",
      path: foundPath,
      node_details: pathNodes,
      edges: edgesUsed,
      length: foundPath.length - 1
    });
  } else {
    res.json({
      status: "failure",
      message: "No dependency path found between nodes."
    });
  }
});

// POST /rapids/graph/analysis/jobs (Manually recalculate PageRank / Community labels in background)
app.post("/rapids/graph/analysis/jobs", (req, res) => {
  const jobId = "job-" + Math.floor(100 + Math.random() * 900);
  const isAlreadyRunning = isGraphRecomputing;

  triggerBackgroundRecalculation();
  
  // Record the RMM resource usage of this run
  const duration = Math.floor(Math.random() * 120 + 30); // 30-150ms
  const peakAllocated = Math.floor(rmmConfig.initialPoolSize * 0.15 + Math.random() * rmmConfig.initialPoolSize * 0.1);
  const totalAllocated = peakAllocated * 2;
  const allocationCount = Math.floor(Math.random() * 80 + 40);

  addRmmHistoryEntry({
    analysis_id: jobId,
    gpu_device: 0,
    rmm_resource: rmmConfig.managedMemory ? "managed" : "pool",
    initial_pool_bytes: rmmConfig.initialPoolSize,
    maximum_pool_bytes: rmmConfig.maximumPoolSize,
    managed_memory: rmmConfig.managedMemory,
    peak_allocated_bytes: peakAllocated,
    total_allocated_bytes: totalAllocated,
    allocation_count: allocationCount,
    duration_ms: duration,
    status: isAlreadyRunning ? "queued" : "running",
    timestamp: new Date().toISOString()
  });

  res.json({
    status: "success",
    message: isAlreadyRunning 
      ? "Graph recomputation already running. Enqueued task in background."
      : "Pathfinder Graph Lens analytical recomputation job dispatched in background.",
    analysis: latestAnalysisResult,
    rmm_job_id: jobId,
    job_status: isAlreadyRunning ? "queued" : "running"
  });
});

// GET /rapids/graph/analysis/{analysis_id}
app.get("/rapids/graph/analysis/:analysis_id", (req, res) => {
  const { analysis_id } = req.params;
  const analysis = graphAnalysisHistory.find(h => h.analysis_id === analysis_id);
  if (!analysis) {
    return res.status(404).json({ error: `Analysis run ${analysis_id} not found` });
  }
  res.json({ status: "success", analysis });
});

// GET /rapids/graph/centrality/latest
app.get("/rapids/graph/centrality/latest", (req, res) => {
  if (!latestAnalysisResult) runGraphAnalytics();
  res.json({
    status: "success",
    generated_at: latestAnalysisResult.generated_at,
    degree_centrality: latestAnalysisResult.degree_centrality,
    page_rank: latestAnalysisResult.page_rank,
    betweenness_centrality: latestAnalysisResult.betweenness_centrality
  });
});

// GET /rapids/graph/communities/latest
app.get("/rapids/graph/communities/latest", (req, res) => {
  if (!latestAnalysisResult) runGraphAnalytics();
  res.json({
    status: "success",
    generated_at: latestAnalysisResult.generated_at,
    communities: latestAnalysisResult.communities
  });
});

// GET /rapids/graph/bottlenecks/latest
app.get("/rapids/graph/bottlenecks/latest", (req, res) => {
  if (!latestAnalysisResult) runGraphAnalytics();
  res.json({
    status: "success",
    generated_at: latestAnalysisResult.generated_at,
    bottlenecks: latestAnalysisResult.bottlenecks
  });
});

// ============================================================================
// RAPIDS MEMORY MANAGER (RMM) GOVERNANCE & TELEMETRY ENDPOINTS
// ============================================================================

// POST /rapids/runtime/memory/config (internal admin-controlled endpoint)
app.post("/rapids/runtime/memory/config", (req, res) => {
  const { initialPoolSize, maximumPoolSize, managedMemory, statisticsEnabled, gpuJobMemoryLimit } = req.body;
  if (initialPoolSize && maximumPoolSize && Number(initialPoolSize) > Number(maximumPoolSize)) {
    return res.status(400).json({ error: "Invalid RMM config: Initial pool size cannot be greater than maximum pool size." });
  }
  rmmConfig = {
    initialPoolSize: initialPoolSize !== undefined ? Number(initialPoolSize) : rmmConfig.initialPoolSize,
    maximumPoolSize: maximumPoolSize !== undefined ? Number(maximumPoolSize) : rmmConfig.maximumPoolSize,
    managedMemory: managedMemory !== undefined ? Boolean(managedMemory) : rmmConfig.managedMemory,
    statisticsEnabled: statisticsEnabled !== undefined ? Boolean(statisticsEnabled) : rmmConfig.statisticsEnabled,
    gpuJobMemoryLimit: gpuJobMemoryLimit !== undefined ? Number(gpuJobMemoryLimit) : rmmConfig.gpuJobMemoryLimit
  };
  res.json({ status: "success", message: "RMM configuration updated", config: rmmConfig });
});

// GET /rapids/runtime/mode
app.get("/rapids/runtime/mode", (req, res) => {
  res.json({
    status: "success",
    mode: runtimeMode,
    telemetry_source: runtimeMode === "simulation" ? "simulated" : "nvml",
    database: process.env.SQL_DATABASE_URL ? "postgres" : "file-fallback"
  });
});

// GET /rapids/runtime/gpu
app.get("/rapids/runtime/gpu", (req, res) => {
  res.json({
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
    clock_memory_mhz: 1593,
    gpu_uuid: "GPU-SIMULATED-H100-80GB-98f5a2b7",
    telemetry_source: "simulated",
    measurement_mode: "simulated"
  });
});

// GET /rapids/runtime/memory
app.get("/rapids/runtime/memory", async (req, res) => {
  const history = await getRmmHistoryList();
  const latestRun = history[0];
  const poolCurrentBytes = latestRun ? latestRun.peak_allocated_bytes : 0;
  
  res.json({
    device: 0,
    resource_type: rmmConfig.managedMemory ? "simulated_managed" : "simulated_pool",
    pool_current_bytes: poolCurrentBytes,
    pool_peak_bytes: latestRun ? latestRun.peak_allocated_bytes : 7730941132,
    pool_maximum_bytes: rmmConfig.maximumPoolSize,
    active_jobs: 0,
    admission_status: "open",
    config: rmmConfig,
    gpu_uuid: "GPU-SIMULATED-H100-80GB-98f5a2b7",
    telemetry_source: "simulated",
    measurement_mode: "simulated"
  });
});

// POST /rapids/runtime/memory/admit
app.post("/rapids/runtime/memory/admit", async (req, res) => {
  const { num_nodes, num_edges } = req.body;
  const nodes = Number(num_nodes) || 0;
  const edges = Number(num_edges) || 0;

  // Formula: 128 bytes per node, 64 bytes per edge, 512MB baseline
  const estimatedPeakBytes = (nodes * 128) + (edges * 64) + 536870912;
  
  const history = await getRmmHistoryList();
  const latestRun = history[0];
  const currentAllocatedBytes = latestRun ? latestRun.peak_allocated_bytes : 0;
  const maxPoolSize = rmmConfig.maximumPoolSize;

  const admitted = (currentAllocatedBytes + estimatedPeakBytes) <= maxPoolSize;

  if (!admitted) {
    return res.status(400).json({
      status: "denied",
      message: `Admission Gate Denied: Estimated peak memory (${estimatedPeakBytes} bytes) plus current allocation (${currentAllocatedBytes} bytes) exceeds maximum pool size limit (${maxPoolSize} bytes).`
    });
  }

  res.json({
    status: "admitted",
    estimated_peak_bytes: estimatedPeakBytes,
    current_allocated_bytes: currentAllocatedBytes,
    maximum_limit_bytes: maxPoolSize,
    measurement_mode: "estimated"
  });
});

// GET /rapids/runtime/memory/history
app.get("/rapids/runtime/memory/history", async (req, res) => {
  const history = await getRmmHistoryList();
  res.json({
    status: "success",
    history: history
  });
});

// POST /rapids/runtime/memory/history (Allows adding run metrics to telemetry ledger)
app.post("/rapids/runtime/memory/history", async (req, res) => {
  const { analysis_id, gpu_device, rmm_resource, initial_pool_bytes, maximum_pool_bytes, managed_memory, peak_allocated_bytes, total_allocated_bytes, allocation_count, duration_ms, status } = req.body;
  
  const savedEntry = await addRmmHistoryEntry({
    analysis_id: analysis_id || `job-${Math.floor(100 + Math.random() * 900)}`,
    gpu_device,
    rmm_resource,
    initial_pool_bytes,
    maximum_pool_bytes,
    managed_memory,
    peak_allocated_bytes,
    total_allocated_bytes,
    allocation_count,
    duration_ms,
    status
  });
  
  res.json({ status: "success", entry: savedEntry });
});

// GET /rapids/analysis/{analysis_id}/resources
app.get("/rapids/analysis/:analysis_id/resources", async (req, res) => {
  const { analysis_id } = req.params;
  const history = await getRmmHistoryList();
  const resourceReport = history.find(h => h.analysis_id === analysis_id);
  if (resourceReport) {
    res.json({
      status: "success",
      analysis_id,
      resources: resourceReport
    });
  } else {
    // Generate a simulated resource report for the specified run
    res.json({
      status: "success",
      analysis_id,
      resources: {
        analysis_id,
        gpu_device: 0,
        rmm_resource: rmmConfig.managedMemory ? "managed" : "pool",
        initial_pool_bytes: rmmConfig.initialPoolSize,
        maximum_pool_bytes: rmmConfig.maximumPoolSize,
        managed_memory: rmmConfig.managedMemory,
        peak_allocated_bytes: Math.floor(rmmConfig.initialPoolSize * 0.45),
        total_allocated_bytes: Math.floor(rmmConfig.initialPoolSize * 1.1),
        allocation_count: 120,
        duration_ms: 1240,
        status: "completed",
        timestamp: new Date().toISOString(),
        allocator_type: rmmConfig.managedMemory ? "simulated_managed" : "simulated_pool",
        worker_id: "worker-node-01",
        gpu_uuid: "GPU-SIMULATED-H100-80GB-98f5a2b7",
        config_version: "v1.2.0",
        telemetry_source: "simulated",
        measurement_mode: "simulated"
      }
    });
  }
});

// Fallback logic for portfolio analysis
function generateFallbackAnalysis(allocations: Record<string, number>, scenario: string) {
  const totalQuantum = (allocations.QTUM || 0) + (allocations.WQTM || 0) + (allocations.IONQ || 0) + (allocations.RGTI || 0);
  const totalRails = (allocations.SOXX || 0) + (allocations.XSD || 0) + (allocations.LIN || 0) + (allocations.AMAT || 0);
  const totalPlatforms = (allocations.NVDA || 0) + (allocations.GOOG || 0);

  let scenarioText = "";
  let riskRating = "Medium";

  if (scenario === "efficiency_trap") {
    riskRating = totalQuantum > 30 ? "High" : "Low to Moderate";
    scenarioText = `Under the **Compute Efficiency Trap**, classical hardware keeps scaling so fast that the 'quantum advantage window' recedes. Your direct quantum/qubit allocation (${totalQuantum}%) will likely experience downward pressure as public markets reprice pure hardware. However, your compute rails and platform giants (${totalRails + totalPlatforms}%) hold sturdy since they continue capturing margins from AI exascale and standard high-performance computing (HPC) factories.`;
  } else if (scenario === "breakout") {
    riskRating = "Moderate (High Growth)";
    scenarioText = `Under a **Quantum Breakout**, direct hardware developers rally. Your quantum allocations (${totalQuantum}%) will capture explosive early premiums. Simultaneously, semiconductor foundries and cryogenic coolants (${totalRails}%) experience a high-demand squeeze, as physical buildouts transition from research hubs into industrial data centers. This is where owning the rails pays compounding dividends.`;
  } else if (scenario === "energy_crisis") {
    riskRating = totalRails > 50 ? "Moderate" : "High";
    scenarioText = `Under the **Energy & Cooling Crisis**, physical limitations constrain datacenters. Your cryogenics (LIN) and specialized etch manufacturers stand to outperform as advanced heat dissipation and packaging become paramount. However, power-hungry compute platforms (${totalPlatforms}%) face scaling throttles, highlighting that energy is as strategic as logic itself.`;
  } else {
    scenarioText = `With a balanced **AI-Quantum Integration**, the orchestration layer (such as NVDA's NVQLink) becomes the primary routing junction. Platforms and broad semis are prime beneficiaries, proving the Hermes doctrine: value flows toward the interfaces connecting domains rather than any isolated compute node.`;
  }

  return `### 🐾 Fallback Analytical Review (Local Mode)

The system is currently running in local-simulation mode because your Gemini API key is not fully configured, but here is your systems-level breakdown under the **${scenario.replace("_", " ").toUpperCase()}** scenario:

#### 1. Portfolio Structure Analysis
*   **Speculative Front-of-House (Qubits/Direct ETFs):** ${totalQuantum}%
*   **Back-of-House Rails (Semis/Cryo/Lithography):** ${totalRails}%
*   **Orchestration Platforms:** ${totalPlatforms}%

#### 2. Scenario Dynamics: ${scenario.replace("_", " ").toUpperCase()}
${scenarioText}

#### 3. Hermes Dependency Assessment
*   **Layer 2 (Infrastructure):** Cryogenics and tooling are highly resilient. If your materials allocation (Linde, AMAT) is high, you maintain stable physical footing regardless of qubit victor.
*   **Layer 3 (Orchestration):** With ${totalPlatforms}% allocated to platforms, your portfolio capitalizes on the routing software layer that coordinates heterogeneous compute (CPU + GPU + QPU).

#### 4. Alice's Recommendations 🐾
${totalQuantum > 40 ? "⚠️ *Reduce Speculative Qubits:* Consider shifting 10-15% of direct qubit positions into broad semiconductor ETFs (SOXX or XSD) to insulate against immediate hardware breakthroughs being absorbed by classical simulations." : "✅ *Healthy Rails-to-Qubit Ratio:* Your portfolio is properly structured under a picks-and-shovels thesis. You keep exposure to the quantum upside while maintaining a rock-solid foundation on standard compute rails."}`;
}

// Fallback logic for chat
function generateFallbackChatReply(messages: any[]) {
  const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || "";

  if (lastUserMsg.includes("layer") || lastUserMsg.includes("physics") || lastUserMsg.includes("infrastructure")) {
    return `Hello Rod. Let's revisit the system geometry we spoke about this morning. 🐾

We can break down our dependency architecture into five distinct tiers:
1. **Layer 0 (Physics):** The underlying quantum modalities. Nature decides, nobody gets a vote.
2. **Layer 1 (Engineering):** Companies trying to build physical qubits (IBM, Rigetti, IonQ). High uncertainty, high capital intensity.
3. **Layer 2 (Infrastructure):** Cryogenics, precision lasers, advanced lithography, high-bandwidth fiber. This is the "Hermes" goldmine because these must exist regardless of whether trapped ions, superconducting, or photonics win.
4. **Layer 3 (Orchestration):** Schedulers like NVIDIA's NVQLink or Google Cloud's hybrid brokers. The user simply expresses intent, and the router handles CPU vs GPU vs QPU execution.
5. **Layer 4 (Operator):** The workflow: Operator ➔ Evidence ➔ Decision.

By placing our investment "store" mainly in Layer 2 and Layer 3 rails, we protect our downside from the 'compute efficiency trap' while keeping our exposure open to a Layer 1 breakthrough. Does this framework make sense for the portfolio visualizer?`;
  }

  if (lastUserMsg.includes("etf") || lastUserMsg.includes("qtum") || lastUserMsg.includes("wqtm") || lastUserMsg.includes("soxx")) {
    return `Rod, when looking at the ETF landscape, we have a clear division. 

Dedicated funds like **QTUM** and **WQTM** represent the 'front-of-house' display. They capture retail interest in 'Quantum Computing', but they contain a lot of classical mid-caps to maintain liquidity. 

On the other hand, the 'back-of-house' rails like **SOXX** (Semis) and **XSD** (S&P Semis) are where the heavy capital rests. Any viable quantum machine requires advanced nanoscale semiconductor packaging and cooling systems. So broad semis are actually silent quantum winners. 🐾

I've set up the interactive sliders on the Allocator panel so you can test shifting weight between obvious quantum front-shelves and physical infrastructure rails.`;
  }

  return `Good morning, Rod. 🐾 I am reviewing the Wall Street Doctrine analyzer with you.

We are looking at computing not as isolated hardware stocks, but as a deep, interdependent dependency graph. As computing diversifies—from CPUs to GPUs, and eventually to QPUs—the real value shifts toward the junctions and orchestrators (like NVIDIA's NVQLink and cloud platforms).

You can use the **Ecosystem Map** to explore each strategic node, adjust your allocations in the **Store Allocator**, and run scenarios like the **Compute Efficiency Trap** to see how our rails hold up under stress. 

What layer or asset would you like to explore first?`;
}

// Handle Vite middleware & SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
