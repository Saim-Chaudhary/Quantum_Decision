"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { Scale, CheckCircle, Loader2, Award, ArrowUpRight } from "lucide-react";
import { NodeExecutionStatus, VerdictData } from "@/lib/types";

interface VerdictNodeData {
  status: NodeExecutionStatus;
  verdict?: VerdictData;
}

export const VerdictNode = memo(({ data }: { data: VerdictNodeData }) => {
  const { status, verdict } = data;

  const isThinking = status === "thinking" || status === "streaming";
  const isDone = status === "done";

  return (
    <div className="relative w-[380px] cursor-grab rounded-xl bg-[#293241] border border-[#3d5a80]/70 shadow-2xl p-4 transition-all duration-300 hover:border-teal-400/50 active:cursor-grabbing">
      {/* Top Handle from both branches */}
      <Handle
        type="target"
        position={Position.Top}
        id="verdict-in"
        className="!w-3.5 !h-3.5 !bg-teal-400 !border-2 !border-[#293241]"
      />

      {/* Glow when synthesizing */}
      {isThinking && (
        <div className="absolute -inset-0.5 rounded-xl bg-teal-500/20 blur-md animate-pulse pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col gap-2.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d5a80]/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30">
              <Scale className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-display font-semibold text-xs tracking-wide text-[#e0fbfc]">
                Synthesized Verdict
              </span>
              <span className="block text-[10px] text-[#98c1d9]">
                Parallel branch reconvergence
              </span>
            </div>
          </div>

          <div>
            {isThinking && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-400/50 animate-pulse ring-1 ring-teal-400/30">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                CONVERGING
              </span>
            )}
            {isDone && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#1c232e] bg-teal-400 px-2.5 py-0.5 rounded-full shadow-sm shadow-teal-500/30 border border-teal-300">
                <CheckCircle className="h-2.5 w-2.5 text-[#1c232e]" />
                RESOLVED
              </span>
            )}
            {!isThinking && !isDone && (
              <span className="inline-flex items-center text-[10px] font-mono text-[#98c1d9]/60 bg-transparent px-2.5 py-0.5 rounded-full border border-[#3d5a80]">
                WAITING FOR BRANCHES
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {isThinking && (
          <div className="space-y-1.5 py-1">
            <div className="flex items-center gap-2 text-xs text-teal-300 font-mono">
              <Award className="h-3.5 w-3.5 animate-spin text-teal-400" />
              <span>Synthesizing temporal outlook + risk matrices...</span>
            </div>
            <div className="h-1.5 w-full bg-[#1c232e] rounded-full overflow-hidden">
              <div className="h-full bg-teal-400 rounded-full animate-[progress_1.2s_ease-in-out_infinite] w-3/4" />
            </div>
          </div>
        )}

        {isDone && verdict && (
          <div className="space-y-2 pt-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-teal-300 font-bold block">
                  RECOMMENDED ACTION
                </span>
                <h4 className="font-display font-bold text-sm text-[#e0fbfc]">
                  {verdict.recommendedPath}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-[#98c1d9] block">CONFIDENCE</span>
                <span className="font-mono text-xs font-bold text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded border border-teal-500/30">
                  {verdict.confidenceScore}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#e0fbfc]/90 leading-relaxed line-clamp-3">
              {verdict.verdictSummary}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-[#3d5a80]/60 text-[10px]">
              <span className="text-[#98c1d9] font-mono">TACTICAL STEP:</span>
              <span className="text-[#e0fbfc] font-medium truncate max-w-[240px]">
                {verdict.contingencyStep}
              </span>
            </div>
          </div>
        )}

        {!isThinking && !isDone && (
          <div className="text-[11px] text-slate-500 italic py-1">
            Will synthesize a decisive recommendation once both Future You and Risk Analyst nodes terminate.
          </div>
        )}
      </div>
    </div>
  );
});

VerdictNode.displayName = "VerdictNode";
