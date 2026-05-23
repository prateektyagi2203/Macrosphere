"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { PageExplainer } from "@/components/PageExplainer";
import { useAnalysisStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { SimulationResult } from "@/types";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend } from "recharts";
import { Play, TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";

const SIM_OPTIONS = [1000, 5000, 10000];

function buildFanData(usdinr: number, p10: number, p50: number, p90: number) {
  return Array.from({ length: 13 }, (_, m) => {
    const t = m / 12;
    return {
      month: m === 0 ? "Today" : `M${m}`,
      bear: +(usdinr + t * (p10 - usdinr)).toFixed(2),
      base: +(usdinr + t * (p50 - usdinr)).toFixed(2),
      bull: +(usdinr + t * (p90 - usdinr)).toFixed(2),
      bandLow: +(usdinr + t * (p10 - usdinr)).toFixed(2),
      bandHigh: +(usdinr + t * (p90 - usdinr)).toFixed(2),
    };
  });
}

export default function SimulationsPage() {
  const { macroInputs } = useAnalysisStore();
  const [numSims, setNumSims] = useState(10000);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.runSimulation(macroInputs, numSims);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fanData = result ? buildFanData(macroInputs.usdinr, result.inr_p10, result.inr_p50, result.inr_p90) : [];
  const scoreDistData = result ? result.macro_score_distribution.bins.map((bin, idx) => ({ range: bin.toFixed(0), count: result.macro_score_distribution.counts[idx] })) : [];
  const probAbove100Pct = result ? (result.prob_inr_above_100 * 100).toFixed(1) : null;
  const probBelow90Pct = result ? (result.prob_inr_below_90 * 100).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="lg:ml-[280px] mt-16 p-4 lg:p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-black text-text-primary">Monte Carlo Simulation</h1>
          <p className="text-sm text-text-secondary mt-1">Probabilistic INR outcomes across thousands of macro scenarios</p>
        </div>
        <PageExplainer
          title="What is Monte Carlo simulation?"
          what="MacroSphere randomly varies 6 key macro factors (oil price, GDP, inflation, FPI flows, DXY, FX reserves) thousands of times. Each variation produces a different macro score and INR outcome — together forming a probability distribution."
          howToUse="Set your base macro inputs on the Dashboard first. Choose the number of simulations and click Run. P10 = bear case (only 10% of outcomes are worse). P50 = base case. P90 = bull case. The fan width = how uncertain the macro outlook is."
          keyInsight="A wide fan = high macro uncertainty. A narrow fan = strong directional conviction. Compare P10 vs P90 INR levels to size your hedges."
        />
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-semibold text-text-secondary mb-2">Number of Simulations</p>
              <div className="flex gap-2">
                {SIM_OPTIONS.map((n) => (
                  <button key={n} onClick={() => setNumSims(n)} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${numSims === n ? "bg-primary text-white border-primary" : "border-border hover:bg-gray-50 text-text-secondary"}`}>
                    {n.toLocaleString()}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-text-secondary mt-1.5">More simulations = better probability estimates. 10,000 takes ~2 seconds.</p>
            </div>
            <button onClick={runSimulation} disabled={isLoading} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors ml-auto">
              <Play size={14} />{isLoading ? "Running..." : "Run Simulation"}
            </button>
          </div>
          {error && <p className="text-xs text-negative mt-3">{error}</p>}
        </div>
        {result && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Bear Case (P10)", value: `\u20b9${result.inr_p10?.toFixed(2)}`, sub: "INR weaker than this in only 10% of simulations", icon: TrendingDown, color: "text-negative", bg: "bg-red-50 border-red-100" },
                { label: "Base Case (P50)", value: `\u20b9${result.inr_p50?.toFixed(2)}`, sub: "Most likely 12-month INR outcome", icon: Activity, color: "text-primary", bg: "bg-blue-50 border-blue-100" },
                { label: "Bull Case (P90)", value: `\u20b9${result.inr_p90?.toFixed(2)}`, sub: "INR stronger than this in only 10% of simulations", icon: TrendingUp, color: "text-positive", bg: "bg-green-50 border-green-100" },
                { label: "Tail Risk: INR > \u20b9100", value: `${probAbove100Pct}%`, sub: "Probability of severe INR depreciation", icon: AlertTriangle, color: parseFloat(probAbove100Pct!) > 30 ? "text-negative" : "text-positive", bg: parseFloat(probAbove100Pct!) > 30 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100" },
              ].map((stat) => { const Icon = stat.icon; return (
                <div key={stat.label} className={`rounded-xl border p-4 ${stat.bg}`}>
                  <div className="flex items-center gap-2 mb-1"><Icon size={14} className={stat.color} /><p className="text-xs font-semibold text-text-secondary">{stat.label}</p></div>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-text-secondary mt-1 leading-tight">{stat.sub}</p>
                </div>
              ); })}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Prob. INR stays below \u20b990 (bullish)", value: `${probBelow90Pct}%`, color: parseFloat(probBelow90Pct!) > 50 ? "text-positive" : "text-warning" },
                { label: "Expected Macro Score", value: result.expected_macro_score?.toFixed(1) + "/100", color: "text-primary" },
                { label: "Expected Volatility (annualized)", value: `${(result.expected_volatility * 100).toFixed(2)}%`, color: "text-text-primary" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl border border-border p-4">
                  <p className="text-[10px] text-text-secondary mb-1">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-bold text-text-primary mb-0.5">INR Probability Fan (12-Month Path)</h3>
                <p className="text-xs text-text-secondary mb-4">Shaded band = P10-P90 uncertainty range. Centre line = P50 base case.</p>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={fanData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} tickFormatter={(v) => `\u20b9${v}`} />
                    <Tooltip formatter={(v: any) => `\u20b9${Number(v).toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="bandHigh" fill="#BFDBFE" stroke="none" name="Bull band" fillOpacity={0.5} />
                    <Area type="monotone" dataKey="bandLow" fill="#FFFFFF" stroke="none" name="Bear band" fillOpacity={1} />
                    <Line type="monotone" dataKey="base" stroke="#2563EB" strokeWidth={2.5} dot={false} name="Base (P50)" />
                    <Line type="monotone" dataKey="bear" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Bear (P10)" />
                    <Line type="monotone" dataKey="bull" stroke="#22C55E" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Bull (P90)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-bold text-text-primary mb-0.5">Macro Score Distribution</h3>
                <p className="text-xs text-text-secondary mb-4">How the score distributes across all scenarios. Skewed right = more bullish outcomes.</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={scoreDistData} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} interval={Math.floor(scoreDistData.length / 6)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => [`${v} sims`, "Count"]} />
                    <ReferenceLine x={result.expected_macro_score?.toFixed(0)} stroke="#2563EB" strokeDasharray="4 2" label={{ value: "Avg", fill: "#2563EB", fontSize: 9 }} />
                    <Bar dataKey="count" fill="#22C55E" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 mt-6">
              <h3 className="text-sm font-bold text-text-primary mb-1">Scenario-Conditional Portfolio</h3>
              <p className="text-xs text-text-secondary mb-4">How your allocation should shift depending on which scenario materialises.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Base Case (P50)", alloc: result.expected_allocation, bg: "bg-blue-50 border-blue-100" },
                  { label: "Bear Case — Defensive", alloc: { equity: Math.max(10, (result.expected_allocation?.equity ?? 40) - 15), bond: (result.expected_allocation?.bond ?? 25) + 5, gold: (result.expected_allocation?.gold ?? 15) + 8, usd: (result.expected_allocation?.usd ?? 10) + 7 }, bg: "bg-red-50 border-red-100" },
                  { label: "Bull Case — Risk-On", alloc: { equity: Math.min(85, (result.expected_allocation?.equity ?? 40) + 15), bond: Math.max(5, (result.expected_allocation?.bond ?? 25) - 8), gold: Math.max(3, (result.expected_allocation?.gold ?? 15) - 5), usd: Math.max(2, (result.expected_allocation?.usd ?? 10) - 7) }, bg: "bg-green-50 border-green-100" },
                ].map((sc) => (
                  <div key={sc.label} className={`rounded-xl border p-4 ${sc.bg}`}>
                    <p className="text-xs font-bold text-text-primary mb-2">{sc.label}</p>
                    {sc.alloc && Object.entries({ Equity: sc.alloc.equity, Bonds: sc.alloc.bond, Gold: sc.alloc.gold, "USD Cash": sc.alloc.usd }).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs mb-1">
                        <span className="text-text-secondary">{k}</span>
                        <span className="font-bold text-text-primary">{typeof v === "number" ? v.toFixed(0) : v}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {!result && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🎲</div>
            <p className="text-sm font-semibold text-text-primary mb-1">Run your first simulation</p>
            <p className="text-xs text-text-secondary max-w-md">MacroSphere will randomly vary oil, GDP, FPI flows and other factors thousands of times to show you the full probability distribution of INR outcomes — not a single prediction, but a range with odds.</p>
          </div>
        )}
      </main>
    </div>
  );
}
