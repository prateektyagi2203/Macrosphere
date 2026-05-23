"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useAnalysisStore } from "@/lib/store";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const FACTOR_GROUPS = [
  {
    name: "Currency",
    icon: "💱",
    description: "REER, USD/INR, DXY — measures external competitiveness",
    inputs: [
      { label: "REER", key: "reer", goodDirection: "low", tooltip: "Real Effective Exchange Rate. Below 100 = INR undervalued. Bullish for exports." },
      { label: "USD/INR", key: "usdinr", goodDirection: "low", tooltip: "Lower = stronger rupee. Below ~85 is historically strong." },
      { label: "DXY", key: "dxy", goodDirection: "low", tooltip: "Dollar Index. Higher DXY typically weakens EM currencies including INR." },
    ],
  },
  {
    name: "Inflation",
    icon: "📈",
    description: "India CPI vs US CPI — differential drives rate policy divergence",
    inputs: [
      { label: "India CPI", key: "india_cpi", goodDirection: "low", tooltip: "Below RBI's 4% target is supportive. High inflation = rate hikes = INR support but growth drag." },
      { label: "US CPI", key: "us_cpi", goodDirection: "high", tooltip: "Higher US inflation delays Fed cuts = stronger USD = weaker INR." },
    ],
  },
  {
    name: "Interest Rates",
    icon: "🏦",
    description: "Repo Rate vs Fed Funds — rate differential drives capital flows",
    inputs: [
      { label: "Repo Rate", key: "repo_rate", goodDirection: "high", tooltip: "Higher repo rate attracts foreign capital. INR positive." },
      { label: "Fed Funds", key: "fed_funds", goodDirection: "low", tooltip: "Lower Fed Funds = rate differential widens = carry trade into India." },
    ],
  },
  {
    name: "Growth",
    icon: "🚀",
    description: "India GDP vs US GDP — relative growth drives equity flows",
    inputs: [
      { label: "India GDP", key: "india_gdp", goodDirection: "high", tooltip: "Higher India growth attracts FDI and FPI. Bullish for INR and equities." },
      { label: "US GDP", key: "us_gdp", goodDirection: "low", tooltip: "Weaker US growth = risk-on = EM inflows including India." },
    ],
  },
  {
    name: "Oil & Commodities",
    icon: "🛢️",
    description: "Brent crude — India imports ~85% of oil needs, major CAD driver",
    inputs: [
      { label: "Brent Oil", key: "brent", goodDirection: "low", tooltip: "Every $10 rise in Brent widens India's CAD by ~$15B. Bearish for INR." },
    ],
  },
  {
    name: "Capital Flows",
    icon: "💰",
    description: "FPI, FDI, Bond Inflows — direct drivers of INR demand",
    inputs: [
      { label: "FPI (B$)", key: "fpi", goodDirection: "high", tooltip: "Foreign Portfolio Investment. Positive = net buying of Indian stocks/bonds." },
      { label: "FDI (B$)", key: "fdi", goodDirection: "high", tooltip: "Foreign Direct Investment. Long-term sticky capital. Very bullish for INR." },
      { label: "Bond Inflows (B$)", key: "bond_inflows", goodDirection: "high", tooltip: "Fixed income flows. Boosted by India's inclusion in global bond indices." },
    ],
  },
  {
    name: "External Sector",
    icon: "🌐",
    description: "FX Reserves, Remittances, Services Exports — India's external buffers",
    inputs: [
      { label: "Services Exports (B$)", key: "services_exports", goodDirection: "high", tooltip: "IT/software exports. India's key forex earner. Rising = INR positive." },
      { label: "Remittances (B$)", key: "remittances", goodDirection: "high", tooltip: "World's largest remittance recipient. Stable forex inflow." },
      { label: "Merch. Deficit (B$)", key: "merchandise_deficit", goodDirection: "low", tooltip: "Lower deficit = less INR selling for imports." },
      { label: "FX Reserves (B$)", key: "fx_reserves", goodDirection: "high", tooltip: "Higher reserves = more RBI firepower to defend INR volatility." },
      { label: "Forward Book (%)", key: "forward_book", goodDirection: "high", tooltip: "RBI's hedged position. Higher = more INR protection in place." },
    ],
  },
];

function getStatus(key: string, value: number, goodDirection: string, scoreBreakdown: Record<string, number>) {
  const score = scoreBreakdown[key];
  if (score === undefined) return "neutral";
  if (score >= 65) return "bullish";
  if (score <= 35) return "bearish";
  return "neutral";
}

const STATUS_CONFIG = {
  bullish: { bg: "bg-positive/10 border-positive/20", dot: "bg-positive", text: "text-positive", label: "Bullish", icon: TrendingUp },
  neutral: { bg: "bg-warning/10 border-warning/20", dot: "bg-warning", text: "text-warning", label: "Neutral", icon: Minus },
  bearish: { bg: "bg-negative/10 border-negative/20", dot: "bg-negative", text: "text-negative", label: "Bearish", icon: TrendingDown },
};

export default function FactorsPage() {
  const { macroInputs, scoreResponse } = useAnalysisStore();
  const scoreBreakdown = scoreResponse?.score_breakdown ?? {};

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="lg:ml-[280px] mt-16 p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-text-primary">Macro Factors</h1>
          <p className="text-sm text-text-secondary mt-1">
            Deep-dive on the 7 factor groups driving the macro score. Run analysis on the Dashboard first.
          </p>
        </div>

        {!scoreResponse && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 text-sm text-warning font-medium">
            ⚠️ Run analysis on the Dashboard first to see live factor scores.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {FACTOR_GROUPS.map((group) => (
            <div key={group.name} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">{group.icon}</span>
                <div>
                  <h2 className="font-bold text-text-primary">{group.name}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">{group.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {group.inputs.map((input) => {
                  const value = macroInputs[input.key as keyof typeof macroInputs] as number;
                  const status = getStatus(input.key, value, input.goodDirection, scoreBreakdown);
                  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                  const Icon = cfg.icon;

                  return (
                    <div key={input.key} className={`flex items-center justify-between p-3 rounded-lg border ${cfg.bg}`}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary">{input.label}</p>
                          <p className="text-[10px] text-text-secondary truncate">{input.tooltip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-sm font-bold text-text-primary tabular-nums">{typeof value === "number" ? value.toFixed(1) : value}</span>
                        <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${cfg.text}`}>
                          <Icon size={10} />
                          {cfg.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
