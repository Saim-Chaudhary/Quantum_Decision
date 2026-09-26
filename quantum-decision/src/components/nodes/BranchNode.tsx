"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { Clock, ShieldAlert, CheckCircle2, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { NodeExecutionStatus, FutureYouData, RiskAnalystData } from "@/lib/types";

interface BranchNodeData {
  branchType: "future_you" | "risk_analyst";
  status: NodeExecutionStatus;
  futureYou?: FutureYouData;
  riskAnalyst?: RiskAnalystData;
  streamingText?: string;
}

export const BranchNode = memo(({ data }: { data: BranchNodeData }) => {
  const { branchType, status, futureYou, riskAnalyst } = data;

  const isFuture = branchType === "future_you";
  const isThinking = status === "thinking" || status === "streaming";
  const isDone = status === "done";

  const theme = isFuture
    ? {
        accent: "future",
        borderColor: isThinking ? "border-teal-400" : isDone ? "border-teal-400/50" : "border-[#3d5a80]/70",
        glow: "bg-teal-500/20",
        badgeBg: "bg-teal-500/15 text-teal-300 border-teal-500/30",
        title: "Future You",
        subtitle: "Simulating 6 months out",
        icon: Clock,
      }
    : {
        accent: "risk",
        borderColor: isThinking ? "border-teal-400" : isDone ? "border-teal-400/50" : "border-[#3d5a80]/70",
        glow: "bg-teal-500/20",
        badgeBg: "bg-teal-500/15 text-teal-300 border-teal-500/30",
        title: "Risk Analyst",
        subtitle: "Tradeoffs & failure modes",
        icon: ShieldAlert,
      };

  const Icon = theme.icon;

  return (
    <div
      className={`relative w-[340px] cursor-grab rounded-xl bg-[#293241] border ${theme.borderColor} shadow-2xl p-4 transition-all duration-300 hover:border-teal-400/40 active:cursor-grabbing`}
    >
      {/* Top Handle from Root */}
      <Handle
        type="target"
        position={Position.Top}
        id={`${branchType}-in`}
        className="!w-3 !h-3 !border-2 !border-[#293241] !bg-teal-400"
      />

      {/* Pulse glow while active */}
      {isThinking && (
        <div className={`absolute -inset-0.5 rounded-xl ${theme.glow} blur-sm animate-pulse pointer-events-none`} />
      )}

      <div className="relative z-10 flex flex-col gap-2.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d5a80]/60 pb-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-md border ${theme.badgeBg}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="font-display font-semibold text-xs tracking-wide text-[#e0fbfc]">
                {theme.title}
              </div>
              <div className="text-[10px] text-[#98c1d9]">{theme.subtitle}</div>
            </div>
          </div>

          {/* Status pill with distinct visual states */}
          <div>
            {isThinking && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-400/50 animate-pulse ring-1 ring-teal-400/30">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                REASONING
              </span>
            )}
            {isDone && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#1c232e] bg-teal-400 px-2.5 py-0.5 rounded-full shadow-sm shadow-teal-500/30 border border-teal-300">
                <CheckCircle2 className="h-2.5 w-2.5 text-[#1c232e]" />
                CONVERGED
              </span>
            )}
            {!isThinking && !isDone && (
              <span className="inline-flex items-center text-[10px] font-mono text-[#98c1d9]/60 bg-transparent px-2.5 py-0.5 rounded-full border border-[#3d5a80]">
                STANDBY
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Branch Content */}
        {isThinking && (
          <div className="space-y-1.5 py-1">
            <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-mono animate-pulse">
              <Sparkles className="h-3 w-3 text-teal-400" />
              <span>Synthesizing persona trajectory...</span>
            </div>
            <div className="h-1.5 w-full bg-[#1c232e] rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full animate-[progress_1.5s_ease-in-out_infinite] w-2/3"
              />
            </div>
          </div>
        )}

        {/* Future You completed details */}
        {isDone && isFuture && futureYou && (
          <div className="space-y-2 pt-0.5">
            <div className="text-[11px] font-medium text-[#e0fbfc] line-clamp-2 italic">
              &quot;{futureYou.headline}&quot;
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#98c1d9] bg-[#222a37] p-1.5 rounded border border-[#3d5a80]/60">
              <span className="font-mono text-teal-300 flex items-center gap-1 font-semibold">
                <TrendingUp className="h-3 w-3" /> {futureYou.timeline}
              </span>
              <span className="truncate max-w-[170px] text-[#e0fbfc]">
                {futureYou.emotionalOutlook.split(":")[0]}
              </span>
            </div>
          </div>
        )}

        {/* Risk Analyst completed details */}
        {isDone && !isFuture && riskAnalyst && (
          <div className="space-y-2 pt-0.5">
            <div className="text-[11px] text-[#e0fbfc] font-medium line-clamp-2">
              <span className="text-[#ee6c4d] font-mono text-[10px] block font-bold uppercase tracking-wider">
                CRITICAL VULNERABILITY
              </span>
              <span className="text-[#ee6c4d] font-semibold">{riskAnalyst.primaryVulnerability}</span>
            </div>
            <div className="text-[10px] text-[#98c1d9] bg-[#222a37] p-1.5 rounded border border-[#3d5a80]/60 truncate">
              <span className="font-mono text-teal-300 mr-1.5">DOOR TYPE:</span>
              <span className="text-[#98c1d9]">{riskAnalyst.reversibilityRating.split("(")[0]}</span>
            </div>
          </div>
        )}

        {!isThinking && !isDone && (
          <div className="text-[11px] text-[#98c1d9]/60 italic py-1">
            Waiting for root dilemma split to initialize branch execution...
          </div>
        )}
      </div>

      {/* Bottom Handle to Verdict */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${branchType}-out`}
        className="!w-3 !h-3 !border-2 !border-[#293241] !bg-teal-400 transition-transform hover:scale-125"
      />
    </div>
  );
});

BranchNode.displayName = "BranchNode";
