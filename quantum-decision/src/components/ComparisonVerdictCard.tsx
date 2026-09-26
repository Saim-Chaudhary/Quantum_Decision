"use client";

import React, { useState } from "react";
import {
  Clock,
  ShieldAlert,
  Award,
  ArrowRight,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  Zap,
} from "lucide-react";
import { FutureYouData, RiskAnalystData, VerdictData } from "@/lib/types";

interface ComparisonVerdictCardProps {
  decision: string;
  futureYou: FutureYouData;
  riskAnalyst: RiskAnalystData;
  verdict: VerdictData;
  onReset: () => void;
}

export const ComparisonVerdictCard: React.FC<ComparisonVerdictCardProps> = ({
  decision,
  futureYou,
  riskAnalyst,
  verdict,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [directiveMessage, setDirectiveMessage] = useState<string | null>(null);

  const handleCopy = () => {
    const text = `QUANTUM DECISION SYNTHESIS
Dilemma: ${decision}
Recommended Path: ${verdict.recommendedPath} (${verdict.confidenceScore}% Confidence)

SUMMARY:
${verdict.verdictSummary}

BRANCH 1: FUTURE YOU (T+6M)
Headline: ${futureYou.headline}
Daily Reality: ${futureYou.dailyExperience}
Emotional Outlook: ${futureYou.emotionalOutlook}

BRANCH 2: RISK ANALYST
Primary Vulnerability: ${riskAnalyst.primaryVulnerability}
Door Reversibility: ${riskAnalyst.reversibilityRating}
Mitigation Protocol: ${riskAnalyst.mitigationProtocol}

IMMEDIATE FIRST ACTION:
${verdict.contingencyStep}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDirective = async () => {
    try {
      await navigator.clipboard.writeText(verdict.contingencyStep);
      setDirectiveMessage("Directive copied to clipboard");
    } catch {
      setDirectiveMessage("Could not copy directive");
    }

    setTimeout(() => setDirectiveMessage(null), 2200);
  };

  return (
    <div className="relative mt-8 rounded-2xl bg-[#293241] border border-[#3d5a80] shadow-2xl overflow-hidden transition-all duration-500">
      {/* Top Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#ee6c4d] via-[#98c1d9] to-[#3d5a80]" />

      <div className="p-6 md:p-8 space-y-8">
        {/* Main Verdict Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#3d5a80]/60 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-wider uppercase px-2.5 py-1 rounded bg-[#ee6c4d]/15 text-[#ee6c4d] border border-[#ee6c4d]/30">
                <Award className="h-3.5 w-3.5" />
                Synthesized Verdict
              </span>
              <span className="text-xs font-mono text-[#98c1d9]">
                Based on both analyses
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-[#e0fbfc] tracking-tight">
              {verdict.recommendedPath}
            </h3>
          </div>

          {/* Confidence Badge & Quick Actions */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
            <div className="text-left md:text-right">
              <span className="text-[11px] font-mono text-[#98c1d9] block uppercase tracking-wider">
                Confidence
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold text-[#ee6c4d]">
                  {verdict.confidenceScore}
                </span>
                <span className="text-sm font-mono text-[#98c1d9]">/100</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-[#222a37] hover:bg-[#3d5a80]/60 border border-[#3d5a80] text-[#e0fbfc] transition-colors cursor-pointer"
                title="Copy structured summary"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#98c1d9]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#98c1d9]" />
                    <span>Export</span>
                  </>
                )}
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-[#222a37] hover:bg-[#3d5a80]/60 border border-[#3d5a80] text-[#e0fbfc] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>New Dilemma</span>
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#ee6c4d]/40 bg-[#ee6c4d]/10 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[#ee6c4d]" />
            <h4 className="font-display text-base font-semibold text-[#e0fbfc]">
              Recommendation in plain English
            </h4>
          </div>
          <p className="max-w-4xl text-lg leading-8 text-[#e0fbfc]">
            {verdict.verdictSummary}
          </p>
        </div>

        {/* Side-by-Side Asymmetric Branch Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Branch 1: Future You */}
          <div className="rounded-xl bg-[#222a37] border border-[#3d5a80] p-5 space-y-4 hover:border-[#ee6c4d]/50 transition-colors">
            <div className="flex items-center justify-between border-b border-[#3d5a80]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[#ee6c4d]/15 text-[#ee6c4d] border border-[#ee6c4d]/30 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm text-[#e0fbfc]">
                    Branch 01: Future outlook
                  </h4>
                  <span className="text-[11px] font-mono text-[#ee6c4d]">
                    {futureYou.timeline}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ee6c4d]/15 text-[#ee6c4d] border border-[#ee6c4d]/30">
                SIX-MONTH PROJECTION
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#98c1d9] uppercase tracking-wider block mb-1">
                What life may feel like
              </span>
              <p className="text-sm font-medium text-[#e0fbfc] italic leading-snug">
                &quot;{futureYou.headline}&quot;
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#98c1d9] uppercase tracking-wider block mb-1">
                Day-to-day reality
              </span>
              <p className="text-sm text-[#e0fbfc]/90 leading-6">
                {futureYou.dailyExperience}
              </p>
            </div>

            {/* Second-order effects */}
            <div>
              <span className="text-[10px] font-mono text-[#98c1d9] uppercase tracking-wider block mb-1.5">
                Other things this choice could change
              </span>
              <ul className="space-y-1.5">
                {futureYou.secondOrderEffects.map((effect, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm leading-5 text-[#e0fbfc] bg-[#1c232e] p-2.5 rounded border border-[#3d5a80]/60"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ee6c4d] mt-1.5 shrink-0" />
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-[#3d5a80]/60 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#98c1d9]">Emotional Outlook:</span>
              <span className="text-[#ee6c4d] font-medium text-right text-[11px] max-w-[220px]">
                {futureYou.emotionalOutlook}
              </span>
            </div>
          </div>

          {/* Branch 2: Risk Analyst */}
          <div className="rounded-xl bg-[#222a37] border border-[#3d5a80] p-5 space-y-4 hover:border-[#98c1d9]/50 transition-colors">
            <div className="flex items-center justify-between border-b border-[#3d5a80]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[#3d5a80]/50 text-[#98c1d9] border border-[#98c1d9]/40 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm text-[#e0fbfc]">
                    Branch 02: Risk check
                  </h4>
                  <span className="text-[11px] font-mono text-[#98c1d9]">
                    What could go wrong
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3d5a80]/50 text-[#98c1d9] border border-[#98c1d9]/40">
                DOWNSIDE REVIEW
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#98c1d9] uppercase tracking-wider block mb-1">
                Biggest pressure point
              </span>
              <p className="text-sm font-semibold text-[#ee6c4d] leading-6 bg-[#ee6c4d]/15 p-2.5 rounded border border-[#ee6c4d]/30">
                {riskAnalyst.primaryVulnerability}
              </p>
            </div>

            {/* Concrete Risks */}
            <div>
              <span className="text-[10px] font-mono text-[#98c1d9] uppercase tracking-wider block mb-1.5">
                Specific risks to watch
              </span>
              <ul className="space-y-1.5">
                {riskAnalyst.concreteRisks.map((risk, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm leading-5 text-[#e0fbfc] bg-[#1c232e] p-2.5 rounded border border-[#3d5a80]/60"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#98c1d9] mt-1.5 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#98c1d9] uppercase tracking-wider block mb-1">
                How easy is it to change course?
              </span>
              <div className="text-sm leading-6 text-[#e0fbfc] bg-[#1c232e] p-2.5 rounded border border-[#3d5a80]">
                <span className="font-mono text-[#98c1d9] mr-1.5 font-bold">CLASSIFICATION:</span>
                {riskAnalyst.reversibilityRating}
              </div>
            </div>

            <div className="pt-2 border-t border-[#3d5a80]/60 space-y-1">
              <span className="text-[10px] font-mono text-[#98c1d9] uppercase tracking-wider block">
                How to reduce the risk
              </span>
              <p className="text-sm text-[#c7dce8] leading-6">
                {riskAnalyst.mitigationProtocol}
              </p>
            </div>
          </div>
        </div>

        {/* Tradeoff Matrix Table */}
        {verdict.tradeoffMatrix && verdict.tradeoffMatrix.length > 0 && (
          <div className="rounded-xl bg-[#222a37] border border-[#3d5a80] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-[#e0fbfc] flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#ee6c4d]" />
                Compare the two options
              </h4>
              <span className="text-[10px] font-mono text-[#98c1d9] uppercase">
                Side by side
              </span>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#3d5a80] text-[10px] font-mono text-[#98c1d9]">
                    <th className="py-2 px-3">What matters</th>
                    <th className="py-2 px-3">Option A</th>
                    <th className="py-2 px-3">Option B</th>
                    <th className="py-2 px-3 text-right">Stronger option</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3d5a80]/60 text-[#e0fbfc]">
                  {verdict.tradeoffMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#1c232e]/50">
                      <td className="py-2.5 px-3 font-medium text-[#e0fbfc]">
                        {item.criteria}
                      </td>
                      <td className="py-2.5 px-3 text-[#98c1d9]">{item.pathA}</td>
                      <td className="py-2.5 px-3 text-[#98c1d9]">{item.pathB}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono text-[11px] font-semibold text-[#ee6c4d] bg-[#ee6c4d]/15 px-2 py-0.5 rounded border border-[#ee6c4d]/30">
                          {item.winner}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {verdict.tradeoffMatrix.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-[#3d5a80]/60 bg-[#1c232e] p-3 space-y-3">
                  <div className="font-display text-sm font-semibold text-[#e0fbfc]">
                    {item.criteria}
                  </div>
                  <div className="grid gap-2 text-sm leading-5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#ee6c4d]">Option A</span>
                      <p className="text-[#c7dce8]">{item.pathA}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#98c1d9]">Option B</span>
                      <p className="text-[#c7dce8]">{item.pathB}</p>
                    </div>
                  </div>
                  <div className="border-t border-[#3d5a80]/60 pt-2">
                    <span className="text-[10px] font-mono uppercase text-[#98c1d9]">Stronger option</span>
                    <p className="text-sm font-semibold text-[#ee6c4d]">{item.winner}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Immediate Tactical Step Banner */}
        <div className="rounded-xl bg-gradient-to-r from-[#ee6c4d]/15 via-[#222a37] to-[#3d5a80]/30 border border-[#ee6c4d]/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ee6c4d]">
              NEXT STEP
            </span>
            <p className="text-sm font-medium text-[#e0fbfc]">
              {verdict.contingencyStep}
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
            <button
              onClick={handleCopyDirective}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#ee6c4d] text-[#293241] font-mono text-xs font-bold hover:bg-[#f28469] transition-colors shadow-lg shadow-[#ee6c4d]/20 cursor-pointer"
            >
              <span>Lock In Directive</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            {directiveMessage && (
              <span
                role="status"
                className="text-[10px] font-mono text-[#e0fbfc]"
              >
                {directiveMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
