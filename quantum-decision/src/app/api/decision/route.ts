import { NextRequest } from "next/server";
import { buildDecisionGraph } from "@/lib/graph";
import { SSEEvent, FutureYouData, RiskAnalystData, VerdictData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MIN_NODE_ANIMATION_MS = 1600;

export async function POST(req: NextRequest) {
  let body: { decision?: string; apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { decision, apiKey } = body;
  console.log("[api/decision] Request received", {
    decisionPresent: typeof decision === "string" && decision.trim().length > 0,
    requestKeyPresent: Boolean(apiKey?.trim()),
    environmentKeyPresent: Boolean(process.env.GROQ_API_KEY?.trim()),
  });
  if (!decision || typeof decision !== "string" || decision.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Decision query is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const nodeStartedAt = new Map<string, number>();

      function markNodeThinking(nodeId: string) {
        nodeStartedAt.set(nodeId, Date.now());
      }

      async function waitForMinimumAnimation(nodeId: string) {
        const elapsed = Date.now() - (nodeStartedAt.get(nodeId) || Date.now());
        const remaining = MIN_NODE_ANIMATION_MS - elapsed;
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
      }

      function send(event: SSEEvent) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch (err) {
          console.error("Error enqueuing SSE chunk:", err);
        }
      }

      try {
        // Step 1: Initialize Root Node
        send({
          type: "node_status",
          nodeId: "root",
          status: "thinking",
          message: "Parsing dilemma into divergent decision vectors...",
        });
        markNodeThinking("root");

        const app = buildDecisionGraph();
        const initialState = {
          decision: decision.trim(),
          apiKey: apiKey?.trim() || process.env.GROQ_API_KEY,
        };
        console.log("[api/decision] Graph initial state prepared", {
          requestKeyPresent: Boolean(apiKey?.trim()),
          stateKeyPresent: Boolean(initialState.apiKey?.trim()),
          keySource: apiKey?.trim() ? "request" : process.env.GROQ_API_KEY?.trim() ? "environment" : "none",
        });

        let futureYouResult: FutureYouData | undefined;
        let riskAnalystResult: RiskAnalystData | undefined;
        let verdictResult: VerdictData | undefined;

        // Stream updates from LangGraph
        const updatesStream = await app.stream(initialState, {
          streamMode: "updates",
        });

        for await (const chunk of updatesStream) {
          const update = chunk as Record<string, any>;

          if (update.root_node) {
            await waitForMinimumAnimation("root");
            send({
              type: "node_complete",
              nodeId: "root",
              data: update.root_node.parsedOptions,
            });
            send({
              type: "node_status",
              nodeId: "root",
              status: "done",
            });

            // Immediately mark parallel persona branches as thinking
            send({
              type: "node_status",
              nodeId: "future_you",
              status: "thinking",
              message: "Simulating lived reality 6 months into the future...",
            });
            markNodeThinking("future_you");
            send({
              type: "node_status",
              nodeId: "risk_analyst",
              status: "thinking",
              message: "Stress-testing vulnerabilities, tail risks & reversibility...",
            });
            markNodeThinking("risk_analyst");
          }

          if (update.branch_future_you) {
            await waitForMinimumAnimation("future_you");
            futureYouResult = update.branch_future_you.futureYou;
            send({
              type: "node_complete",
              nodeId: "future_you",
              data: futureYouResult,
            });
            send({
              type: "node_status",
              nodeId: "future_you",
              status: "done",
            });
          }

          if (update.branch_risk_analyst) {
            await waitForMinimumAnimation("risk_analyst");
            riskAnalystResult = update.branch_risk_analyst.riskAnalyst;
            send({
              type: "node_complete",
              nodeId: "risk_analyst",
              data: riskAnalystResult,
            });
            send({
              type: "node_status",
              nodeId: "risk_analyst",
              status: "done",
            });
          }

          // If both branches finished, announce verdict node thinking
          if (
            (update.branch_future_you || update.branch_risk_analyst) &&
            !verdictResult
          ) {
            markNodeThinking("verdict");
            send({
              type: "node_status",
              nodeId: "verdict",
              status: "thinking",
              message: "Synthesizing parallel intelligence branches into verdict...",
            });
          }

          if (update.verdict_synthesizer) {
            await waitForMinimumAnimation("verdict");
            verdictResult = update.verdict_synthesizer.verdict;
            send({
              type: "node_complete",
              nodeId: "verdict",
              data: verdictResult,
            });
            send({
              type: "node_status",
              nodeId: "verdict",
              status: "done",
            });
          }
        }

        // Final reconvergence event
        if (futureYouResult && riskAnalystResult && verdictResult) {
          send({
            type: "graph_complete",
            futureYou: futureYouResult,
            riskAnalyst: riskAnalystResult,
            verdict: verdictResult,
          });
        }
      } catch (err: any) {
        console.error("Execution error in decision graph:", err);
        send({
          type: "error",
          message: err?.message || "An unexpected error occurred during graph execution",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
