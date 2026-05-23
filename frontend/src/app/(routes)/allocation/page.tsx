"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { PageExplainer } from "@/components/PageExplainer";
import { useAnalysisStore } from "@/lib/store";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#6B7280"];
const NEUTRAL_ALLOCATION = { equity: 50, bond: 30, gold: 10, usd: 10 };
const BENCHMARK_60_40 = { equity: 60, bond: 40, gold: 0, usd: 0 };

function getWhyBullets(score: number | null, currentAlloc: { equity: number; bond: number; gold: number; usd: number }): string[] {
  if (score === null) return ["Run analysis on the Dashboard to see why-bullets."];
  const bullets: string[] = [];
  if (currentAlloc.equity > 55) bullets.push(`Equity OW (${currentAlloc.equity}%): Strong GDP differential and positive FPI flows justify above-neutral equity exposure.`);
  else if (currentAlloc.equity < 40) bullets.push(`Equity UW (${currentAlloc.equity}%): Macro headwinds — high oil, weak growth, or Fed tightening — reduce equity attractiveness.`);
  else bullets.push(`Equity neutral (${currentAlloc.equity}%): Balanced macro signals; no strong directional conviction on equities.`);
  if (currentAlloc.gold > 15) bullets.push(`Gold OW (${currentAlloc.gold}%): Elevated macro risk (oil, inflation, or geopolitics) makes gold a key portfolio hedge.`);
  else if (currentAlloc.gold < 8) bullets.push(`Gold minimal (${currentAlloc.gold}%): Benign macro reduces need for insurance; gold allocation kept lean for risk-on environment.`);
  else bullets.push(`Gold moderate (${currentAlloc.gold}%): Standard hedge allocation; protects against tail risks without excessive drag.`);
  if (currentAlloc.usd > 12) bullets.push(`USD Cash high (${currentAlloc.usd}%): INR depreciation risk is elevated; USD cash buffers purchasing power.`);
  else bullets.push(`USD Cash lean (${currentAlloc.usd}%): INR stable or appreciating; minimal need to hold foreign cash.`);
  if (currentAlloc.bond > 28) bullets.push(`Bonds OW (${currentAlloc.bond}%): Real yields attractive (India 10Y > 6.5%); duration adds value in a stable-to-cutting rate environment.`);
  return bullets.slice(0, 4);
}

export default function AllocationPage() {
  const { scoreResponse } = useAnalysisStore();
  const alloc = scoreResponse ? null : null; // will use store allocationResponse in real app

  const { allocationResponse } = useAnalysisStore();

  const currentAlloc = allocationResponse ?? { equity: 55, bond: 25, gold: 12, usd: 8 };

  const donutData = [
    { name: "Equity", value: currentAlloc.equity, neutral: NEUTRAL_ALLOCATION.equity },
    { name: "Bonds", value: currentAlloc.bond, neutral: NEUTRAL_ALLOCATION.bond },
    { name: "Gold", value: currentAlloc.gold, neutral: NEUTRAL_ALLOCATION.gold },
    { name: "Cash/USD", value: currentAlloc.usd, neutral: NEUTRAL_ALLOCATION.usd },
  ];

  const radarData = [
    { subject: "Equity", current: currentAlloc.equity, neutral: NEUTRAL_ALLOCATION.equity },
    { subject: "Bonds", current: currentAlloc.bond, neutral: NEUTRAL_ALLOCATION.bond },
    { subject: "Gold", current: currentAlloc.gold, neutral: NEUTRAL_ALLOCATION.gold },
    { subject: "Cash", current: currentAlloc.usd, neutral: NEUTRAL_ALLOCATION.usd },
  ];

  const getTilt = (current: number, neutral: number) => {
    const diff = current - neutral;
    if (diff > 2) return { label: `+${diff}% OW`, color: "text-positive", Icon: TrendingUp };
    if (diff < -2) return { label: `${diff}% UW`, color: "text-negative", Icon: TrendingDown };
    return { label: "Neutral", color: "text-warning", Icon: Minus };
  };

  const score = scoreResponse?.macro_score ?? null;
  const band = score === null ? null : score < 30 ? "Very Bearish" : score < 50 ? "Bearish" : score < 65 ? "Neutral" : score < 80 ? "Bullish" : "Very Bullish";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="lg:ml-[280px] mt-16 p-4 lg:p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-black text-text-primary">Allocation Engine</h1>
          <p className="text-sm text-text-secondary mt-1">
            {score !== null ? `Score ${Math.round(score)} · ${band} · Macro-driven allocation` : "Run analysis on Dashboard to generate allocation"}
          </p>
        </div>
        <PageExplainer
          title="How the allocation engine works"
          what="The engine maps the India macro score (0–100) to a multi-asset portfolio. High score = risk-on (equity heavy). Low score = defensive (gold + USD heavy). It adjusts each asset class based on 7 sub-factors: real rate differential, oil risk, FPI momentum, FX reserve adequacy, current account, FDI, and GDP growth."
          howToUse="Run Analysis on the Dashboard first. The allocation updates automatically. Compare vs the 60/40 benchmark in the table below to see how macro-driven tilts differ from a passive portfolio."
          keyInsight="A macro score of 80 produces ~75% equity vs 60% in a 60/40 benchmark. A score of 20 produces ~15% equity. The difference is the macro alpha opportunity."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Donut */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4">Recommended Portfolio</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {donutData.map((item, i) => {
                  const tilt = getTilt(item.value, item.neutral);
                  const Icon = tilt.Icon;
                  return (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-text-primary">{item.name}</span>
                          <span className="text-xs font-bold text-text-primary">{item.value}%</span>
                        </div>
                        <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${tilt.color}`}>
                          <Icon size={9} />
                          {tilt.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Radar */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4">vs Neutral Allocation</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Current" dataKey="current" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} />
                <Radar name="Neutral" dataKey="neutral" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.1} strokeDasharray="4 2" />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tilt Table */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h3 className="text-sm font-bold text-text-primary mb-4">Tilt vs Neutral Benchmark</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-secondary">
                  <th className="text-left py-2 font-medium">Asset Class</th>
                  <th className="text-center py-2 font-medium">60/40</th>
                  <th className="text-center py-2 font-medium">Neutral</th>
                  <th className="text-center py-2 font-medium">MacroSphere</th>
                  <th className="text-center py-2 font-medium">vs Neutral</th>
                  <th className="text-left py-2 font-medium pl-4">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "Indian Equity", current: currentAlloc.equity, neutral: NEUTRAL_ALLOCATION.equity, bm: BENCHMARK_60_40.equity, rationale: "Domestic growth + earnings tailwind" },
                  { name: "G-Secs / Bonds", current: currentAlloc.bond, neutral: NEUTRAL_ALLOCATION.bond, bm: BENCHMARK_60_40.bond, rationale: "Real yield ~2% attractive; index inclusion flows" },
                  { name: "Gold", current: currentAlloc.gold, neutral: NEUTRAL_ALLOCATION.gold, bm: BENCHMARK_60_40.gold, rationale: "Geopolitical hedge; INR depreciation buffer" },
                  { name: "Cash / USD", current: currentAlloc.usd, neutral: NEUTRAL_ALLOCATION.usd, bm: BENCHMARK_60_40.usd, rationale: "Dry powder for volatility; USD carry buffer" },
                ].map((row) => {
                  const diff = row.current - row.neutral;
                  const tiltColor = diff > 2 ? "text-positive" : diff < -2 ? "text-negative" : "text-warning";
                  return (
                    <tr key={row.name}>
                      <td className="py-3 font-medium text-text-primary">{row.name}</td>
                      <td className="py-3 text-center text-text-secondary">{row.bm}%</td>
                      <td className="py-3 text-center text-text-secondary">{row.neutral}%</td>
                      <td className="py-3 text-center font-bold text-text-primary">{row.current}%</td>
                      <td className={`py-3 text-center font-bold ${tiltColor}`}>{diff > 0 ? `+${diff}%` : `${diff}%`}</td>
                      <td className="py-3 text-xs text-text-secondary pl-4">{row.rationale}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why this allocation */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h3 className="text-sm font-bold text-text-primary mb-3">Why This Allocation?</h3>
          <ul className="space-y-2">
            {getWhyBullets(score, currentAlloc).map((bullet, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span className="text-xs text-text-secondary leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Disclaimer */}
        <p className="text-xs text-text-secondary text-center">Allocation is model-driven based on macro score. Not investment advice. Past performance does not guarantee future results.</p>
      </main>
    </div>
  );
}
