"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Activity, ArrowUp, ArrowDown } from "lucide-react";
import { ScoreResponse } from "@/types";

interface KPICardsProps {
  scoreResponse: ScoreResponse | null;
  prevScore?: number | null;
}

const FACTOR_LABELS: Record<string, string> = {
  reer: "REER (Currency Competitiveness)",
  inflation_differential: "Inflation Differential (India vs US)",
  real_rate_differential: "Real Rate Differential",
  gdp_differential: "GDP Growth Differential",
  oil_risk: "Oil Price (Brent)",
  current_account: "Current Account Balance",
  fpi_momentum: "FPI Capital Flows",
  fdi_strength: "FDI Inflows",
  bond_inflows: "Bond Inflows",
  fx_reserves: "FX Reserves (RBI Buffer)",
  dxy: "US Dollar Index",
};

function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const angle = (clamped / 100) * 180 - 90;
  const color = clamped < 30 ? "#EF4444" : clamped < 50 ? "#F59E0B" : clamped < 70 ? "#3B82F6" : "#22C55E";
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <svg viewBox="0 0 120 70" className="w-28 h-16">
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(clamped / 100) * 157} 157`} />
        <line x1="60" y1="60" x2={60 + 35 * Math.cos(((angle - 90) * Math.PI) / 180)} y2={60 + 35 * Math.sin(((angle - 90) * Math.PI) / 180)} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="60" r="3" fill={color} />
      </svg>
      <span className="text-3xl font-black mt-1" style={{ color }}>{Math.round(score)}</span>
      <span className="text-[10px] text-text-secondary">out of 100</span>
    </div>
  );
}

function getVerdict(score: number, breakdown: Record<string, number>): string {
  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const topBull = sorted.filter(([, v]) => v > 0).slice(0, 2).map(([k]) => FACTOR_LABELS[k] ?? k);
  const topBear = sorted.filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([k]) => FACTOR_LABELS[k] ?? k);

  if (score >= 75) return `Strong bullish macro. Key tailwinds: ${topBull.join(" and ")}.`;
  if (score >= 60) return `Constructive setup - ${topBull[0] ?? "growth"} supports INR, watch ${topBear[0] ?? "risks"}.`;
  if (score >= 45) return `Mixed signals. ${topBear[0] ? topBear[0] + " is the main headwind" : "No clear directional catalyst"}.`;
  if (score >= 30) return `Macro headwinds building. ${topBear.slice(0, 2).join(" and ")} weighing on INR.`;
  return `High stress environment. Defensive positioning advised - ${topBear[0] ?? "multiple risks"} dominant.`;
}

export default function KPICards({ scoreResponse, prevScore }: KPICardsProps) {
  if (!scoreResponse) {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-5 h-28 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-card rounded-xl border border-border p-4 h-20 animate-pulse" />)}
        </div>
        <div className="bg-card rounded-xl border border-border p-4 h-24 animate-pulse" />
      </div>
    );
  }

  const { macro_score, inr_outlook, risk_level, inr_range_low, inr_range_high, score_breakdown, factor_contributions } = scoreResponse;
  const scoreDelta = prevScore != null ? macro_score - prevScore : null;
  const verdict = getVerdict(macro_score, score_breakdown);

  const outlookIcon = inr_outlook === "bullish" ? <TrendingUp className="text-positive" size={20} /> : inr_outlook === "bearish" ? <TrendingDown className="text-negative" size={20} /> : <Minus className="text-warning" size={20} />;
  const outlookColor = inr_outlook === "bullish" ? "text-positive" : inr_outlook === "bearish" ? "text-negative" : "text-warning";
  const riskBg = risk_level === "low" ? "bg-positive/10 text-positive" : risk_level === "high" ? "bg-negative/10 text-negative" : "bg-warning/10 text-warning";
  const riskIcon = risk_level === "low" ? <Shield size={14} /> : risk_level === "high" ? <AlertTriangle size={14} /> : <Activity size={14} />;
  const band = macro_score < 30 ? "Very Bearish" : macro_score < 50 ? "Bearish" : macro_score < 65 ? "Neutral" : macro_score < 80 ? "Bullish" : "Very Bullish";

  const entries = Object.entries(score_breakdown);
  const bullDrivers = entries.filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const bearDrivers = entries.filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]).slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">India Macro Score</p>
            {scoreDelta != null && (
              <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${scoreDelta > 0 ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"}`}>
                {scoreDelta > 0 ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
                {Math.abs(scoreDelta).toFixed(1)} pts
              </span>
            )}
          </div>
          <p className="text-lg font-black text-text-primary">{band}</p>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed max-w-xs">{verdict}</p>
        </div>
        <ScoreGauge score={macro_score} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">{outlookIcon}<p className="text-xs text-text-secondary">INR Outlook</p></div>
          <p className={`text-lg font-bold capitalize ${outlookColor}`}>{inr_outlook}</p>
          <p className="text-[10px] text-text-secondary mt-1">12-month view</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-text-secondary mb-2">Risk Level</p>
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${riskBg}`}>
            {riskIcon}{risk_level.toUpperCase()}
          </div>
          <p className="text-[10px] text-text-secondary mt-1.5">Portfolio risk regime</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-text-secondary mb-2">12M INR Range</p>
          <p className="text-sm font-bold text-text-primary">\u20b9{inr_range_low.toFixed(1)}</p>
          <p className="text-xs text-text-secondary">to \u20b9{inr_range_high.toFixed(1)}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-xs font-bold text-text-primary mb-3 uppercase tracking-wide">What is Driving the Score</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold text-green-600 uppercase mb-2">Tailwinds</p>
            {bullDrivers.length === 0 ? (
              <p className="text-xs text-text-secondary italic">No positive factors</p>
            ) : (
              <ul className="space-y-1.5">
                {bullDrivers.map(([key, val]) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="text-[11px] font-medium text-text-primary">{FACTOR_LABELS[key] ?? key}</span>
                      <span className="text-[10px] text-green-600 ml-1">+{val.toFixed(1)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-red-500 uppercase mb-2">Headwinds</p>
            {bearDrivers.length === 0 ? (
              <p className="text-xs text-text-secondary italic">No negative factors</p>
            ) : (
              <ul className="space-y-1.5">
                {bearDrivers.map(([key, val]) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="text-[11px] font-medium text-text-primary">{FACTOR_LABELS[key] ?? key}</span>
                      <span className="text-[10px] text-red-500 ml-1">{val.toFixed(1)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
