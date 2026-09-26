"use client";

import React, { useState, useRef, useEffect } from "react";
import { DecisionGraph } from "@/components/DecisionGraph";
import { DecisionConsole } from "@/components/DecisionConsole";
import { ComparisonVerdictCard } from "@/components/ComparisonVerdictCard";
import { AgentStreamInspector } from "@/components/AgentStreamInspector";
import {
  NodeExecutionStatus,
  FutureYouData,
  RiskAnalystData,
  VerdictData,
  SSEEvent,
} from "@/lib/types";
import { GitFork, Sparkles, Terminal, Activity, ArrowDown } from "lucide-react";

export default function Home() {
  const [decision, setDecision] = useState(
    "Should I accept a high-equity Founding Engineer offer at a Seed AI startup, or remain in my stable Senior SWE L5 role with guaranteed RSUs?"
  );

  const [status, setStatus] = useState<{
    root: NodeExecutionStatus;
    future_you: NodeExecutionStatus;
    risk_analyst: NodeExecutionStatus;
    verdict: NodeExecutionStatus;
  }>({
    root: "idle",
    future_you: "idle",
    risk_analyst: "idle",
    verdict: "idle",
  });

  const [parsedOptions, setParsedOptions] = useState<
    { optionA: string; optionB: string } | undefined
  >(undefined);
  const [futureYou, setFutureYou] = useState<FutureYouData | undefined>(undefined);
  const [riskAnalyst, setRiskAnalyst] = useState<RiskAnalystData | undefined>(undefined);
  const [verdict, setVerdict] = useState<VerdictData | undefined>(undefined);
  const [messages, setMessages] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const verdictCardRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    setStatus({
      root: "idle",
      future_you: "idle",
      risk_analyst: "idle",
      verdict: "idle",
    });
    setParsedOptions(undefined);
    setFutureYou(undefined);
    setRiskAnalyst(undefined);
    setVerdict(undefined);
    setMessages([]);
    setIsRunning(false);
  };

  const handleExecute = async (apiKey?: string) => {
    if (!decision.trim() || isRunning) return;

    console.log("[frontend] Sending decision request", {
      decisionPresent: Boolean(decision.trim()),
      requestKeyPresent: Boolean(apiKey?.trim()),
      bodyIncludesApiKey: Boolean(apiKey?.trim()),
    });

    // Reset previous run data
    setIsRunning(true);
    setParsedOptions(undefined);
    setFutureYou(undefined);
    setRiskAnalyst(undefined);
    setVerdict(undefined);
    setMessages(["Initializing LangGraph state graph..."]);
    setStatus({
      root: "thinking",
      future_you: "pending",
      risk_analyst: "pending",
      verdict: "pending",
    });

    try {
      const res = await fetch("/api/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, apiKey }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Execution error: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const event: SSEEvent = JSON.parse(trimmed.slice(6));

              if (event.type === "node_status") {
                setStatus((prev) => ({
                  ...prev,
                  [event.nodeId]: event.status,
                }));
                if (event.message) {
                  setMessages((prev) => [...prev, event.message!]);
                }
              } else if (event.type === "node_complete") {
                if (event.nodeId === "root") {
                  setParsedOptions(event.data);
                  setMessages((prev) => [
                    ...prev,
                    `Dilemma split: [Path A] "${event.data.optionA}" vs [Path B] "${event.data.optionB}"`,
                  ]);
                } else if (event.nodeId === "future_you") {
                  setFutureYou(event.data);
                  setMessages((prev) => [
                    ...prev,
                    `Future You persona completed: "${event.data.headline}"`,
                  ]);
                } else if (event.nodeId === "risk_analyst") {
                  setRiskAnalyst(event.data);
                  setMessages((prev) => [
                    ...prev,
                    `Risk Analyst stress-test completed: "${event.data.primaryVulnerability}"`,
                  ]);
                } else if (event.nodeId === "verdict") {
                  setVerdict(event.data);
                  setMessages((prev) => [
                    ...prev,
                    `Synthesized verdict reached: "${event.data.recommendedPath}" (${event.data.confidenceScore}% confidence)`,
                  ]);
                }
              } else if (event.type === "graph_complete") {
                setFutureYou(event.futureYou);
                setRiskAnalyst(event.riskAnalyst);
                setVerdict(event.verdict);
                setMessages((prev) => [
                  ...prev,
                  "Reconvergence complete. Verdict generated.",
                ]);
                setIsRunning(false);

                // Smooth scroll to verdict card
                setTimeout(() => {
                  verdictCardRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 400);
              } else if (event.type === "error") {
                setMessages((prev) => [...prev, `Error: ${event.message}`]);
                setIsRunning(false);
              }
            } catch (err) {
              console.error("Failed to parse SSE line:", trimmed, err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Stream reader failed:", err);
      setMessages((prev) => [
        ...prev,
        `Execution failure: ${err?.message || "Unknown network error"}`,
      ]);
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1c232e] text-[#e0fbfc] px-4 py-8 md:px-10 lg:px-14">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Asymmetric Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#3d5a80]/60 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ee6c4d]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#ee6c4d] font-semibold">
                Decision Forge · LangGraph Engine
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-black text-[#e0fbfc] tracking-tight">
              QUANTUM DECISION
            </h1>
            <p className="text-sm md:text-base text-[#98c1d9] max-w-2xl">
              Parallel AI agents branch into contrasting temporal realities —{" "}
              <span className="text-[#ee6c4d] font-medium">Future You</span> and{" "}
              <span className="text-[#98c1d9] font-medium">Risk Analyst</span> — before
              reconverging into an authoritative, synthesized verdict.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#293241] border border-[#3d5a80] flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#ee6c4d]/15 text-[#ee6c4d] flex items-center justify-center border border-[#ee6c4d]/30">
                <GitFork className="h-4 w-4" />
              </div>
              <div className="text-left font-mono">
                <div className="text-[10px] text-[#98c1d9]">GRAPH TOPOLOGY</div>
                <div className="text-xs font-bold text-[#e0fbfc]">
                  1 Root ➔ 2 Persona ➔ 1 Merge
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Top Control Section: Console & Telemetry */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Decision formulation input */}
          <div className="lg:col-span-8">
            <DecisionConsole
              decision={decision}
              setDecision={setDecision}
              onExecute={handleExecute}
              isRunning={isRunning}
            />
          </div>

          {/* Telemetry and stream monitor */}
          <div className="lg:col-span-4">
            <AgentStreamInspector status={status} messages={messages} />
          </div>
        </section>

        {/* Visual Centerpiece: Interactive React Flow Canvas */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#98c1d9]" />
              <h2 className="font-display text-lg font-bold text-[#e0fbfc] tracking-wide">
                Parallel Execution Topology
              </h2>
            </div>
            <span className="text-xs font-mono text-[#98c1d9] hidden sm:inline">
              Draggable Nodes · Live Edge Streaming
            </span>
          </div>

          <DecisionGraph
            decision={decision}
            status={status}
            parsedOptions={parsedOptions}
            futureYou={futureYou}
            riskAnalyst={riskAnalyst}
            verdict={verdict}
          />
        </section>

        {/* Final Side-by-Side Comparison Card & Synthesized Verdict */}
        {verdict && futureYou && riskAnalyst && (
          <section ref={verdictCardRef} className="pt-2 animate-fadeIn">
            <ComparisonVerdictCard
              decision={decision}
              futureYou={futureYou}
              riskAnalyst={riskAnalyst}
              verdict={verdict}
              onReset={handleReset}
            />
          </section>
        )}

        {/* Footer */}
        <footer className="pt-12 pb-6 border-t border-[#3d5a80]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#98c1d9]">
          <div>
            Built with <span className="text-[#ee6c4d]">LangGraph.js</span>,{" "}
            <span className="text-[#98c1d9]">React Flow</span>, and{" "}
            <span className="text-[#e0fbfc]">Next.js App Router</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Groq LLaMA 3.3 70B</span>
            <span>·</span>
            <span>Palette: Dusk, Powder, Peach, Cyan & Jet</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
