"use client";

import React, { useEffect, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  BackgroundVariant,
  MarkerType,
  useNodesState,
} from "reactflow";
import { RootNode } from "./nodes/RootNode";
import { BranchNode } from "./nodes/BranchNode";
import { VerdictNode } from "./nodes/VerdictNode";
import { NodeExecutionStatus, FutureYouData, RiskAnalystData, VerdictData } from "@/lib/types";

interface DecisionGraphProps {
  decision: string;
  status: {
    root: NodeExecutionStatus;
    future_you: NodeExecutionStatus;
    risk_analyst: NodeExecutionStatus;
    verdict: NodeExecutionStatus;
  };
  parsedOptions?: { optionA: string; optionB: string };
  futureYou?: FutureYouData;
  riskAnalyst?: RiskAnalystData;
  verdict?: VerdictData;
}

const nodeTypes = {
  rootNode: RootNode,
  branchNode: BranchNode,
  verdictNode: VerdictNode,
};

export const DecisionGraph: React.FC<DecisionGraphProps> = ({
  decision,
  status,
  parsedOptions,
  futureYou,
  riskAnalyst,
  verdict,
}) => {
  const nodeTemplates: Node[] = useMemo(() => {
    return [
      {
        id: "root",
        type: "rootNode",
        position: { x: 260, y: 15 },
        data: {
          decision,
          status: status.root,
          parsedOptions,
        },
      },
      {
        id: "future_you",
        type: "branchNode",
        position: { x: 30, y: 165 },
        data: {
          branchType: "future_you",
          status: status.future_you,
          futureYou,
        },
      },
      {
        id: "risk_analyst",
        type: "branchNode",
        position: { x: 470, y: 165 },
        data: {
          branchType: "risk_analyst",
          status: status.risk_analyst,
          riskAnalyst,
        },
      },
      {
        id: "verdict",
        type: "verdictNode",
        position: { x: 240, y: 320 },
        data: {
          status: status.verdict,
          verdict,
        },
      },
    ];
  }, [decision, status, parsedOptions, futureYou, riskAnalyst, verdict]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(nodeTemplates);

  useEffect(() => {
    setNodes((currentNodes) =>
      nodeTemplates.map((nextNode) => {
        const currentNode = currentNodes.find((node) => node.id === nextNode.id);
        return currentNode
          ? { ...nextNode, position: currentNode.position }
          : nextNode;
      }),
    );
  }, [nodeTemplates, setNodes]);

  // Construct reactive animated edges
  const edges: Edge[] = useMemo(() => {
    const isFutureActive = status.future_you === "thinking" || status.future_you === "streaming";
    const isFutureDone = status.future_you === "done";
    const isRiskActive = status.risk_analyst === "thinking" || status.risk_analyst === "streaming";
    const isRiskDone = status.risk_analyst === "done";
    const isVerdictActive = status.verdict === "thinking" || status.verdict === "streaming";
    const isVerdictDone = status.verdict === "done";

    return [
      // Root -> Future You
      {
        id: "e-root-future",
        source: "root",
        target: "future_you",
        animated: isFutureActive || (status.root === "done" && !isFutureDone),
        className: isFutureActive ? "active" : isFutureDone ? "completed" : "",
        style: {
          stroke: isFutureActive ? "#14b8a6" : isFutureDone ? "#14b8a6" : "#3d5a80",
          strokeWidth: isFutureActive ? 2.5 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isFutureActive ? "#14b8a6" : isFutureDone ? "#14b8a6" : "#3d5a80",
        },
      },
      // Root -> Risk Analyst
      {
        id: "e-root-risk",
        source: "root",
        target: "risk_analyst",
        animated: isRiskActive || (status.root === "done" && !isRiskDone),
        className: isRiskActive ? "accent-active" : isRiskDone ? "completed" : "",
        style: {
          stroke: isRiskActive ? "#2dd4bf" : isRiskDone ? "#2dd4bf" : "#3d5a80",
          strokeWidth: isRiskActive ? 2.5 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isRiskActive ? "#2dd4bf" : isRiskDone ? "#2dd4bf" : "#3d5a80",
        },
      },
      // Future You -> Verdict
      {
        id: "e-future-verdict",
        source: "future_you",
        target: "verdict",
        animated: isVerdictActive || (isFutureDone && !isVerdictDone),
        className: isVerdictActive ? "active" : isVerdictDone ? "completed" : "",
        style: {
          stroke: isVerdictActive ? "#14b8a6" : isVerdictDone ? "#14b8a6" : "#3d5a80",
          strokeWidth: isVerdictActive ? 2.5 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isVerdictActive ? "#14b8a6" : isVerdictDone ? "#14b8a6" : "#3d5a80",
        },
      },
      // Risk Analyst -> Verdict
      {
        id: "e-risk-verdict",
        source: "risk_analyst",
        target: "verdict",
        animated: isVerdictActive || (isRiskDone && !isVerdictDone),
        className: isVerdictActive ? "accent-active" : isVerdictDone ? "completed" : "",
        style: {
          stroke: isVerdictActive ? "#2dd4bf" : isVerdictDone ? "#2dd4bf" : "#3d5a80",
          strokeWidth: isVerdictActive ? 2.5 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isVerdictActive ? "#2dd4bf" : isVerdictDone ? "#2dd4bf" : "#3d5a80",
        },
      },
    ];
  }, [status]);

  return (
    <div className="relative w-full h-[500px] rounded-2xl bg-[#1c232e] border border-[#3d5a80]/80 overflow-hidden shadow-2xl">
      {/* Top Left: Canvas Header Indicator */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2 bg-[#242c3a]/70 backdrop-blur-sm border border-[#3d5a80]/50 px-2.5 py-1 rounded-md">
        <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#e0fbfc] font-medium">
          LangGraph.js Canvas
        </span>
      </div>

      <div className="absolute top-14 left-4 z-10 pointer-events-none text-[10px] font-mono uppercase tracking-wider text-[#98c1d9]/80">
        Drag nodes to arrange the topology
      </div>

      {/* Top Right: Persona legend */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-3 text-[10px] font-mono text-[#98c1d9] bg-[#242c3a]/70 backdrop-blur-sm border border-[#3d5a80]/50 px-2.5 py-1 rounded-md">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-400" /> Future You (T+6M)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#98c1d9]" /> Risk Analyst
        </span>
      </div>

      {/* Bottom Left: Graph Stats HUD */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-3 bg-[#242c3a]/80 backdrop-blur-sm border border-[#3d5a80]/60 px-3 py-1.5 rounded-lg text-[10px] font-mono text-[#98c1d9]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> 4 NODES · 4 EDGES
        </span>
        <span className="text-[#3d5a80]">|</span>
        <span className="text-[#e0fbfc]">PARALLEL RECONVERGENCE</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.6}
        maxZoom={1.3}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={false}
        attributionPosition="bottom-left"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#3d5a80"
        />
        <Controls
          showInteractive={false}
          className="!bottom-4 !right-4 !left-auto"
        />
      </ReactFlow>
    </div>
  );
};
