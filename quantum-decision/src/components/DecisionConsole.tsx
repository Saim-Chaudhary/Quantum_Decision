"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  Play,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  HelpCircle,
} from "lucide-react";

interface DecisionConsoleProps {
  decision: string;
  setDecision: (val: string) => void;
  onExecute: (apiKey?: string) => void;
  isRunning: boolean;
}

const PRESET_DILEMMAS = [
  {
    label: "Career Pivot",
    text: "Should I accept a high-equity Founding Engineer offer at a Seed AI startup, or remain in my stable Senior SWE L5 role with guaranteed RSUs?",
  },
  {
    label: "Tech Architecture",
    text: "Should we execute a complete backend rewrite in Go for concurrency performance, or incrementally refactor our existing Node.js monolith?",
  },
  {
    label: "Life & Relocation",
    text: "Should I relocate to Tokyo on a 1-year exploratory contract, or renew my 2-year residential lease in New York?",
  },
];

export const DecisionConsole: React.FC<DecisionConsoleProps> = ({
  decision,
  setDecision,
  onExecute,
  isRunning,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [savedKey, setSavedKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("qd_groq_api_key");
    if (stored) {
      setApiKey(stored);
      setSavedKey(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("qd_groq_api_key", apiKey.trim());
      setSavedKey(true);
      setShowKeyDrawer(false);
    } else {
      localStorage.removeItem("qd_groq_api_key");
      setSavedKey(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isRunning && decision.trim()) {
      e.preventDefault();
      onExecute(apiKey.trim() || undefined);
    }
  };

  return (
    <div className="rounded-2xl bg-[#293241] border border-[#3d5a80]/80 p-6 shadow-2xl space-y-4">
      {/* Top Header / Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-teal-400" />
          <span className="font-mono text-xs text-[#e0fbfc] font-medium uppercase tracking-wider">
            Decision Formulation Console
          </span>
        </div>

        {/* Groq API Key Status Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyDrawer(!showKeyDrawer)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono bg-[#222a37] hover:bg-[#3d5a80]/50 border border-[#3d5a80] text-[#e0fbfc] transition-colors cursor-pointer"
          >
            <Key className="h-3 w-3 text-teal-300" />
            <span>
              {savedKey ? "Groq Key Configured" : "Add Groq API Key"}
            </span>
            {showKeyDrawer ? (
              <ChevronUp className="h-3 w-3 text-[#98c1d9]" />
            ) : (
              <ChevronDown className="h-3 w-3 text-[#98c1d9]" />
            )}
          </button>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono border ${
              savedKey
                ? "bg-teal-500/15 text-teal-300 border-teal-400/40"
                : "bg-transparent text-[#98c1d9]/70 border-[#3d5a80]"
            }`}
          >
            <Cpu className="h-2.5 w-2.5" />
            {savedKey ? "LLaMA-3.3 70B Live" : "Smart Simulation Ready"}
          </span>
        </div>
      </div>

      {/* Groq API Key Drawer */}
      {showKeyDrawer && (
        <div className="p-4 rounded-xl bg-[#1c232e] border border-[#3d5a80] space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[#e0fbfc] flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-teal-300" /> Enter Groq API Key (gsk_...)
            </span>
            <span className="text-[10px] text-[#98c1d9] font-mono">
              Stored locally in browser
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setSavedKey(false);
              }}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#222a37] border border-[#3d5a80] text-xs font-mono text-[#e0fbfc] placeholder:text-[#98c1d9]/60 focus:outline-none focus:border-teal-400"
            />
            <button
              onClick={handleSaveKey}
              className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#1c232e] text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              Save Key
            </button>
          </div>
          <p className="text-[10px] text-[#98c1d9] leading-normal">
            If no key is provided, the app will execute using high-fidelity local simulations so you can test the entire LangGraph workflow immediately without friction.
          </p>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          rows={3}
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          placeholder="Enter a real-life crossroad decision (e.g. 'Should I accept job offer A or stay at job B?')..."
          className="w-full rounded-xl bg-[#1c232e] border border-[#3d5a80] p-4 text-sm text-[#e0fbfc] placeholder:text-[#98c1d9]/60 focus:outline-none focus:border-teal-400 transition-colors resize-none disabled:opacity-60"
        />
        <div className="absolute right-3 bottom-3 text-[10px] font-mono text-[#98c1d9] hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#222a37] text-[#e0fbfc]">Ctrl</kbd> +{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-[#222a37] text-[#e0fbfc]">Enter</kbd> to run
        </div>
      </div>

      {/* Preset Dilemmas & Trigger Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#98c1d9] mr-1 uppercase">
            Test Dilemma:
          </span>
          {PRESET_DILEMMAS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setDecision(preset.text)}
              disabled={isRunning}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#222a37] hover:bg-[#3d5a80]/60 text-[#98c1d9] hover:text-[#e0fbfc] border border-[#3d5a80] transition-colors cursor-pointer disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Execute Action Button */}
        <button
          onClick={() => onExecute(apiKey.trim() || undefined)}
          disabled={isRunning || !decision.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ee6c4d] hover:bg-[#f28469] text-[#293241] font-mono text-xs font-bold transition-all shadow-lg shadow-[#ee6c4d]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#293241]" />
              <span>Synthesizing Branches...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-[#293241]" />
              <span>Split & Converge</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
