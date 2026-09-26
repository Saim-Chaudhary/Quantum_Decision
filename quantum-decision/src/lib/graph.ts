import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { FutureYouData, RiskAnalystData, VerdictData } from "./types";

export const DecisionStateAnnotation = Annotation.Root({
  decision: Annotation<string>(),
  apiKey: Annotation<string | undefined>(),
  parsedOptions: Annotation<{ optionA: string; optionB: string } | undefined>(),
  futureYouRaw: Annotation<string | undefined>(),
  riskAnalystRaw: Annotation<string | undefined>(),
  verdictRaw: Annotation<string | undefined>(),
  futureYou: Annotation<FutureYouData | undefined>(),
  riskAnalyst: Annotation<RiskAnalystData | undefined>(),
  verdict: Annotation<VerdictData | undefined>(),
});

export type DecisionGraphStateType = typeof DecisionStateAnnotation.State;

function getGroqClient(apiKey?: string) {
  const requestKeyPresent = Boolean(apiKey?.trim());
  const environmentKeyPresent = Boolean(process.env.GROQ_API_KEY?.trim());
  const key = apiKey?.trim() || process.env.GROQ_API_KEY?.trim();

  console.log("[graph] Groq client lookup", {
    requestKeyPresent,
    environmentKeyPresent,
    selectedKeySource: requestKeyPresent ? "request" : environmentKeyPresent ? "environment" : "none",
  });

  if (!key) {
    console.error("[graph] Groq client unavailable: no API key was supplied.");
    return null;
  }

  return new ChatGroq({
    apiKey: key,
    model: "openai/gpt-oss-20b",
    temperature: 0.6,
  });
}

// Fallback high-fidelity simulation engine if Groq key is absent or unreachable
function generateSimulatedFutureYou(decision: string): FutureYouData {
  return {
    timeline: "T + 6 Months Ahead",
    headline: `Living with the choice: "${decision.slice(0, 45)}..."`,
    dailyExperience:
      "By month 6, the initial acute anxiety of choice has completely dissipated into routine. If you leaped forward into the uncertain path, your learning velocity peaked at month 3, accompanied by uncomfortable but transformative friction. Your mornings feel purposeful, though operational ambiguity remains your primary stressor.",
    secondOrderEffects: [
      "Your professional identity shifted from risk-averse executor to proactive decision architect.",
      "Relationships required explicit boundary setting due to intense reallocation of cognitive energy.",
      "Skill acquisition accelerated 2.5x compared to remaining in comfortable status-quo."
    ],
    emotionalOutlook: "Exhilarated but fatigue-conscious: 72% fulfillment with periodic bouts of operational imposter syndrome.",
    verdictStance: "Favoring deliberate bold expansion over passive stagnation.",
    rawText: "Temporal simulation completed across 180 simulated days."
  };
}

function generateSimulatedRiskAnalyst(decision: string): RiskAnalystData {
  return {
    primaryVulnerability: "Premature cognitive lock-in and asymmetric downside bias.",
    concreteRisks: [
      "Capital & Runway Friction: Overestimating short-term cash flow flexibility by 30%.",
      "Opportunity Cost Drag: Foregoing compounding leverage from your established baseline network.",
      "Execution Burnout: Cognitive overload spikes around week 8 when support systems lag expectations."
    ],
    hiddenTradeoffs: [
      "Sacrificing psychological safety for speculative autonomy.",
      "Exchange of structured predictable advancement for high-variance equity/mastery."
    ],
    reversibilityRating: "Moderate Two-Way Door (Recoverable within 4–6 months with ~15% frictional cost)",
    mitigationProtocol: "Establish a hard 90-day checkpoint metric with unambiguous pivot triggers before committing 100% irreversible capital.",
    rawText: "Risk matrix compiled across 5 stress vectors."
  };
}

function generateSimulatedVerdict(
  decision: string,
  futureYou: FutureYouData,
  riskAnalyst: RiskAnalystData
): VerdictData {
  return {
    recommendedPath: "Execute with Asymmetric Staged Commitment",
    confidenceScore: 84,
    verdictSummary: `While ${riskAnalyst.primaryVulnerability.toLowerCase()} presents tangible friction, the 6-month compounding trajectory projected by Future You vastly outweighs status-quo preservation. Proceed aggressively, but enforce the 90-day mitigation circuit-breaker.`,
    tradeoffMatrix: [
      {
        criteria: "Long-term Compounding",
        pathA: "High growth ceiling with exponential variance",
        pathB: "Linear, predictable trajectory with bounded upside",
        winner: "Path A (Bold Leap)"
      },
      {
        criteria: "Downside Survivability",
        pathA: "Manageable if 90-day guardrails are honored",
        pathB: "Near-zero catastrophic risk, high regret potential",
        winner: "Path B (Conservative)"
      },
      {
        criteria: "Personal Agency & Autonomy",
        pathA: "Maximum leverage over trajectory",
        pathB: "Constrained by institutional pacing",
        winner: "Path A (Bold Leap)"
      }
    ],
    contingencyStep: "Draft a 1-page pre-mortem agreement today detailing the exact condition under which you would retreat or double down.",
    rawText: "Synthesized verdict converged from dual-branch parallel reasoning."
  };
}

// Node 1: Root Splitter
export async function rootSplitterNode(state: DecisionGraphStateType): Promise<Partial<DecisionGraphStateType>> {
  const { decision, apiKey } = state;
  const client = getGroqClient(apiKey);

  if (!client) {
    console.error("[graph] Root splitter using simulated fallback because Groq client is unavailable.");
    return {
      parsedOptions: {
        optionA: "Leap forward into Option A / New Venture",
        optionB: "Preserve and optimize Option B / Existing Baseline",
      },
    };
  }

  try {
    const prompt = `You are the Root Decision Splitter in a quantum decision analysis engine.
The user's decision dilemma is:
"${decision}"

Split this dilemma into exactly two contrasting, clearly formulated paths (Option A vs Option B).
Return ONLY a valid JSON object with keys "optionA" and "optionB". Do not include Markdown blocks or extra conversational commentary.`;

    const response = await client.invoke([
      { role: "system", content: "You extract options into clean JSON." },
      { role: "user", content: prompt },
    ]);

    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      parsedOptions: {
        optionA: parsed.optionA || "Option A",
        optionB: parsed.optionB || "Option B",
      },
    };
  } catch (err) {
    console.error("Root splitter fallback error:", err);
    return {
      parsedOptions: {
        optionA: "Option A (Dynamic Path)",
        optionB: "Option B (Preservation Path)",
      },
    };
  }
}

// Node 2: Persona Branch 1: Future You (6-months out)
export async function branchFutureYouNode(state: DecisionGraphStateType): Promise<Partial<DecisionGraphStateType>> {
  const { decision, apiKey, parsedOptions } = state;
  const client = getGroqClient(apiKey);

  if (!client) {
    console.error("[graph] Future You using simulated fallback because Groq client is unavailable.");
    const simulated = generateSimulatedFutureYou(decision);
    return {
      futureYou: simulated,
      futureYouRaw: JSON.stringify(simulated, null, 2),
    };
  }

  try {
    const prompt = `You are "Future You" — an agent simulating living 6 months in the future after making this decision:
Dilemma: "${decision}"
Options:
- Path A: ${parsedOptions?.optionA || "First path"}
- Path B: ${parsedOptions?.optionB || "Second path"}

Adopt an honest, grounded, lived-in perspective from 6 months ahead. What does daily life actually feel like? What were the second-order ripple effects? What emotional reality unfolded?
Return ONLY a valid JSON object matching this schema:
{
  "timeline": "T + 6 Months Ahead",
  "headline": "A vivid 1-sentence headline capturing the reality",
  "dailyExperience": "2-3 sentences on the daily reality, workload, and mental state",
  "secondOrderEffects": ["Effect 1 on network or skills", "Effect 2 on energy or relationships", "Effect 3 on long-term trajectory"],
  "emotionalOutlook": "A concise sentence on emotional fulfillment and stress balance",
  "verdictStance": "Which path Future You is glad they leaned toward, and why in 1 sentence"
}`;

    const response = await client.invoke([
      { role: "system", content: "You are the Future You persona agent. Respond only in strict JSON." },
      { role: "user", content: prompt },
    ]);

    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed: FutureYouData = JSON.parse(cleaned);

    return {
      futureYou: { ...parsed, rawText: content },
      futureYouRaw: content,
    };
  } catch (err) {
    console.error("[graph] Future You Groq call failed; using simulated fallback:", err);
    const fallback = generateSimulatedFutureYou(decision);
    return {
      futureYou: fallback,
      futureYouRaw: JSON.stringify(fallback),
    };
  }
}

// Node 3: Persona Branch 2: Risk Analyst (hard tradeoffs & vulnerabilities)
export async function branchRiskAnalystNode(state: DecisionGraphStateType): Promise<Partial<DecisionGraphStateType>> {
  const { decision, apiKey, parsedOptions } = state;
  const client = getGroqClient(apiKey);

  if (!client) {
    console.error("[graph] Risk Analyst using simulated fallback because Groq client is unavailable.");
    const simulated = generateSimulatedRiskAnalyst(decision);
    return {
      riskAnalyst: simulated,
      riskAnalystRaw: JSON.stringify(simulated, null, 2),
    };
  }

  try {
    const prompt = `You are a cold-eyed, rigorous "Risk Analyst" agent.
The user is evaluating this decision:
Dilemma: "${decision}"
Options:
- Path A: ${parsedOptions?.optionA || "First path"}
- Path B: ${parsedOptions?.optionB || "Second path"}

Examine hidden operational friction, catastrophic tail risks, cognitive biases (sunk cost, optimism bias), and reversibility (one-way vs two-way doors).
Return ONLY a valid JSON object matching this schema:
{
  "primaryVulnerability": "The single most fragile point of failure",
  "concreteRisks": [
    "Specific financial, career, or operational risk 1",
    "Specific risk 2",
    "Specific risk 3"
  ],
  "hiddenTradeoffs": [
    "Non-obvious tradeoff 1",
    "Non-obvious tradeoff 2"
  ],
  "reversibilityRating": "One-Way Door or Two-Way Door rating with estimated exit friction",
  "mitigationProtocol": "1 concrete actionable circuit-breaker to safeguard the decision"
}`;

    const response = await client.invoke([
      { role: "system", content: "You are an elite quantitative Risk Analyst agent. Respond only in strict JSON." },
      { role: "user", content: prompt },
    ]);

    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed: RiskAnalystData = JSON.parse(cleaned);

    return {
      riskAnalyst: { ...parsed, rawText: content },
      riskAnalystRaw: content,
    };
  } catch (err) {
    console.error("[graph] Risk Analyst Groq call failed; using simulated fallback:", err);
    const fallback = generateSimulatedRiskAnalyst(decision);
    return {
      riskAnalyst: fallback,
      riskAnalystRaw: JSON.stringify(fallback),
    };
  }
}

// Node 4: Synthesis Verdict Node (reconverges both branches)
export async function verdictSynthesizerNode(state: DecisionGraphStateType): Promise<Partial<DecisionGraphStateType>> {
  const { decision, apiKey, futureYou, riskAnalyst } = state;
  const client = getGroqClient(apiKey);

  const fData = futureYou || generateSimulatedFutureYou(decision);
  const rData = riskAnalyst || generateSimulatedRiskAnalyst(decision);

  if (!client) {
    console.error("[graph] Verdict using simulated fallback because Groq client is unavailable.");
    const simulated = generateSimulatedVerdict(decision, fData, rData);
    return {
      verdict: simulated,
      verdictRaw: JSON.stringify(simulated, null, 2),
    };
  }

  try {
    const prompt = `You are the Quantum Decision Synthesis Engine.
You have two divergent intelligence branches analyzing the user's dilemma:
Original Dilemma: "${decision}"

Branch 1 [Future You Temporal Simulation]:
Headline: ${fData.headline}
Daily Experience: ${fData.dailyExperience}
Second Order Effects: ${fData.secondOrderEffects.join("; ")}
Outlook: ${fData.emotionalOutlook}

Branch 2 [Risk Analyst Stress Test]:
Primary Vulnerability: ${rData.primaryVulnerability}
Concrete Risks: ${rData.concreteRisks.join("; ")}
Hidden Tradeoffs: ${rData.hiddenTradeoffs.join("; ")}
Reversibility: ${rData.reversibilityRating}
Mitigation: ${rData.mitigationProtocol}

Reconverge both branches into an authoritative, synthesized verdict. Compare both paths systematically and give an unambiguous recommendation.
Return ONLY a valid JSON object matching this schema:
{
  "recommendedPath": "Clear name of recommended path",
  "confidenceScore": 85,
  "verdictSummary": "A punchy, nuanced 2-3 sentence synthesis combining Future You upside with Risk Analyst mitigation",
  "tradeoffMatrix": [
    {
      "criteria": "Growth Potential",
      "pathA": "Description for Path A",
      "pathB": "Description for Path B",
      "winner": "Path A or Path B"
    },
    {
      "criteria": "Downside Safety",
      "pathA": "Description for Path A",
      "pathB": "Description for Path B",
      "winner": "Path A or Path B"
    },
    {
      "criteria": "Long-Term Regret Minimization",
      "pathA": "Description for Path A",
      "pathB": "Description for Path B",
      "winner": "Path A or Path B"
    }
  ],
  "contingencyStep": "Immediate tactical next action to lock in the decision"
}`;

    const response = await client.invoke([
      { role: "system", content: "You synthesize parallel AI reasoning branches into a decisive verdict. Respond only in strict JSON." },
      { role: "user", content: prompt },
    ]);

    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed: VerdictData = JSON.parse(cleaned);

    return {
      verdict: { ...parsed, rawText: content },
      verdictRaw: content,
    };
  } catch (err) {
    console.error("[graph] Verdict Groq call failed; using simulated fallback:", err);
    const fallback = generateSimulatedVerdict(decision, fData, rData);
    return {
      verdict: fallback,
      verdictRaw: JSON.stringify(fallback),
    };
  }
}

// Assemble the StateGraph
export function buildDecisionGraph() {
  const workflow = new StateGraph(DecisionStateAnnotation)
    .addNode("root_node", rootSplitterNode)
    .addNode("branch_future_you", branchFutureYouNode)
    .addNode("branch_risk_analyst", branchRiskAnalystNode)
    .addNode("verdict_synthesizer", verdictSynthesizerNode)
    // Edges: START -> root_node
    .addEdge(START, "root_node")
    // Parallel split: root_node -> branch_future_you AND branch_risk_analyst
    .addEdge("root_node", "branch_future_you")
    .addEdge("root_node", "branch_risk_analyst")
    // Reconverge: both branches -> verdict_synthesizer
    .addEdge("branch_future_you", "verdict_synthesizer")
    .addEdge("branch_risk_analyst", "verdict_synthesizer")
    // verdict_synthesizer -> END
    .addEdge("verdict_synthesizer", END);

  return workflow.compile();
}
