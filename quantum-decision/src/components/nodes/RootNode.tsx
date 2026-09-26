"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { Compass, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { NodeExecutionStatus } from "@/lib/types";

interface RootNodeData {
  decision: string;
  status: NodeExecutionStatus;
  parsedOptions?: { optionA: string; optionB: string };
}

export const RootNode = memo(({ data }: { data: RootNodeData }) => {
  const { decision, status, parsedOptions } = data;

  const isThinking = status === "thinking";
  const isDone = status === "done";

  return (
    <div className="relative w-[340px] cursor-grab rounded-xl bg-[#293241] border border-[#3d5a80]/70 shadow-2xl p-4 transition-all duration-300 hover:border-teal-400/50 active:cursor-grabbing">
      {/* Glow highlight when thinking */}
      {isThinking && (
        <div className="absolute -inset-0.5 rounded-xl bg-teal-500/20 blur-sm animate-pulse pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col gap-2.5">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#3d5a80]/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30">
              <Compass className="h-3.5 w-3.5" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#98c1d9] font-medium">
              Root Dilemma Splitter
            </span>
          </div>

          {/* Status pill with distinct visual states */}
          <div className="flex items-center gap-1.5">
            {isThinking && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-400/50 animate-pulse ring-1 ring-teal-400/30">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                BRANCHING
              </span>
            )}
            {isDone && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#1c232e] bg-teal-400 px-2.5 py-0.5 rounded-full shadow-sm shadow-teal-500/30 border border-teal-300">
                <CheckCircle2 className="h-2.5 w-2.5 text-[#1c232e]" />
                SPLIT ACTIVE
              </span>
            )}
            {!isThinking && !isDone && (
              <span className="inline-flex items-center text-[10px] font-mono text-[#98c1d9]/60 bg-transparent px-2.5 py-0.5 rounded-full border border-[#3d5a80]">
                STANDBY
              </span>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="text-xs text-[#e0fbfc] line-clamp-2 font-medium leading-relaxed">
          {decision || "Awaiting decision input..."}
        </div>

        {/* Options preview if resolved */}
        {parsedOptions && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#3d5a80]/50">
            <div className="rounded bg-[#222a37] p-1.5 border border-[#3d5a80]/60">
              <span className="text-[9px] font-mono text-[#ee6c4d] block font-semibold">PATH A</span>
              <p className="text-[10px] text-[#e0fbfc] truncate">{parsedOptions.optionA}</p>
            </div>
            <div className="rounded bg-[#222a37] p-1.5 border border-[#3d5a80]/60">
              <span className="text-[9px] font-mono text-teal-300 block font-semibold">PATH B</span>
              <p className="text-[10px] text-[#e0fbfc] truncate">{parsedOptions.optionB}</p>
            </div>
          </div>
        )}
      </div>

      {/* React Flow Source Handle (splits to both branches) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="root-out"
        className="!w-3 !h-3 !bg-teal-400 !border-2 !border-[#293241] transition-transform hover:scale-125"
      />
    </div>
  );
});

RootNode.displayName = "RootNode";
