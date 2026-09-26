export type NodeExecutionStatus = "idle" | "pending" | "thinking" | "streaming" | "done" | "error";

export interface FutureYouData {
  timeline: string;
  headline: string;
  dailyExperience: string;
  secondOrderEffects: string[];
  emotionalOutlook: string;
  verdictStance: string;
  rawText?: string;
}

export interface RiskAnalystData {
  primaryVulnerability: string;
  concreteRisks: string[];
  hiddenTradeoffs: string[];
  reversibilityRating: string; // e.g. "Low Reversibility (Two-way door with 6mo friction)"
  mitigationProtocol: string;
  rawText?: string;
}

export interface VerdictData {
  recommendedPath: string;
  confidenceScore: number; // 0 - 100
  verdictSummary: string;
  tradeoffMatrix: {
    criteria: string;
    pathA: string;
    pathB: string;
    winner: string;
  }[];
  contingencyStep: string;
  rawText?: string;
}

export interface DecisionGraphState {
  decision: string;
  status: {
    root: NodeExecutionStatus;
    future_you: NodeExecutionStatus;
    risk_analyst: NodeExecutionStatus;
    verdict: NodeExecutionStatus;
  };
  streamingTexts: {
    root: string;
    future_you: string;
    risk_analyst: string;
    verdict: string;
  };
  data: {
    futureYou?: FutureYouData;
    riskAnalyst?: RiskAnalystData;
    verdict?: VerdictData;
  };
}

export type SSEEvent =
  | { type: "node_status"; nodeId: "root" | "future_you" | "risk_analyst" | "verdict"; status: NodeExecutionStatus; message?: string }
  | { type: "node_delta"; nodeId: "future_you" | "risk_analyst" | "verdict"; text: string }
  | { type: "node_complete"; nodeId: "root" | "future_you" | "risk_analyst" | "verdict"; data: any }
  | { type: "graph_complete"; futureYou: FutureYouData; riskAnalyst: RiskAnalystData; verdict: VerdictData }
  | { type: "error"; message: string };
