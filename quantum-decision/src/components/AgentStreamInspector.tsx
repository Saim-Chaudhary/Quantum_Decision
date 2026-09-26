"use client";

import React from "react";
import { Terminal, Activity, CheckCircle2, Clock, ShieldAlert, Scale, Loader2 } from "lucide-react";
import { NodeExecutionStatus } from "@/lib/types";

interface AgentStreamInspectorProps {
  status: {
    root: NodeExecutionStatus;
    future_you: NodeExecutionStatus;
    risk_analyst: NodeExecutionStatus;
    verdict: NodeExecutionStatus;
  };
  messages: string[];
}

export const AgentStreamInspector: React.FC<AgentStreamInspectorProps> = ({
  status,
  messages,
}) => {
  const steps = [
    {
      id: "root",
      name: "Root Dilemma Splitter",
      status: status.root,
      icon: Terminal,
      color: "text-teal-300",
    },
    {
      id: "future_you",
      name: "Future You (T+6M)",
      status: status.future_you,
      icon: Clock,
      color: "text-teal-300",
    },
    {
      id: "risk_analyst",
      name: "Risk Analyst",
      status: status.risk_analyst,
      icon: ShieldAlert,
      color: "text-[#98c1d9]",
    },
    {
      id: "verdict",
      name: "Verdict Synthesizer",
      status: status.verdict,
      icon: Scale,
      color: "text-teal-300",
    },
  ];

  return (
    <div className="rounded-2xl bg-[#293241] border border-[#3d5a80]/80 p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#3d5a80]/60 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal-400" />
          <h4 className="font-mono text-xs font-semibold text-[#e0fbfc] uppercase tracking-wider">
            Live LangGraph State Pipeline
          </h4>
        </div>
        <span className="text-[10px] font-mono text-[#98c1d9]">
          SSE Stream Monitor
        </span>
      </div>

      {/* Pipeline Status Badges with distinct visual states */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isThinking = step.status === "thinking" || step.status === "streaming";
          const isDone = step.status === "done";

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-lg border transition-all ${
                isThinking
                  ? "bg-[#242c3a] border-teal-400 shadow-sm shadow-teal-500/20 ring-1 ring-teal-400/30"
                  : isDone
                  ? "bg-[#242c3a] border-teal-500/40"
                  : "bg-[#1c232e] border-[#3d5a80]/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`h-3.5 w-3.5 ${step.color}`} />
                {isThinking && <Loader2 className="h-3 w-3 animate-spin text-teal-300" />}
                {isDone && <CheckCircle2 className="h-3 w-3 text-teal-400" />}
              </div>
              <div className="font-display text-[11px] font-medium text-[#e0fbfc] truncate">
                {step.name}
              </div>
              <div
                className={`font-mono text-[9px] uppercase tracking-wider ${
                  isThinking
                    ? "text-teal-300 font-bold animate-pulse"
                    : isDone
                    ? "text-teal-400 font-semibold"
                    : "text-[#98c1d9]/60"
                }`}
              >
                {step.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Log Terminal Output */}
      {messages.length > 0 && (
        <div className="rounded-lg bg-[#1c232e] border border-[#3d5a80] p-3 max-h-32 overflow-y-auto space-y-1 font-mono text-[11px]">
          {messages.slice(-5).map((msg, i) => (
            <div key={i} className="flex items-center gap-2 text-[#98c1d9]">
              <span className="text-[#ee6c4d] select-none font-bold">›</span>
              <span className="text-[#e0fbfc]">{msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
