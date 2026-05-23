"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { PageExplainer } from "@/components/PageExplainer";
import { useAnalysisStore } from "@/lib/store";
import { Save, ArrowRight, Star, ChevronDown, ChevronUp } from "lucide-react";
import { MacroInputs, AllocationResponse } from "@/types";

interface ScenarioItem {
  name: string;
  description: string;
  narrative: string;
  portfolio_implication: string;
  scenario_type: string;
  macro_inputs: MacroInputs;
  macro_score: number;
  inr_outlook: string;
  risk_level: string;
  inr_range_low: number;
  inr_range_high: number;
  allocation: AllocationResponse;
  is_favourite: boolean;
}

const PRESET_SCENARIOS: ScenarioItem[] = [
  {
    name: "Base Case", description: "Central scenario with current macro conditions",
    narrative: "India muddling through — growth steady at 6.5%, inflation near RBI target, Fed on hold. No major catalyst for significant INR movement either way. FPI outflows are a drag but RBI has ample reserves to prevent sharp depreciation.",
    portfolio_implication: "Balanced positioning makes sense. Maintain equity core but hedge with 12% gold. No need to aggressively buy USD protection yet.",
    scenario_type: "base",
    macro_inputs: { reer: 88, usdinr: 97, dxy: 103, india_cpi: 4, us_cpi: 3, repo_rate: 6, fed_funds: 4.5, india_gdp: 6.5, us_gdp: 2, brent: 100, fpi: -10, fdi: 50, bond_inflows: 10, services_exports: 420, remittances: 135, merchandise_deficit: 330, fx_reserves: 650, forward_book: 13 },
    macro_score: 55, inr_outlook: "neutral", risk_level: "medium", inr_range_low: 94, inr_range_high: 100, allocation: { equity: 55, bond: 25, gold: 12, usd: 8 }, is_favourite: false,
  },
  {
    name: "Bull Run 2026", description: "Strong FDI, benign oil, Fed pivot",
    narrative: "The ideal macro cocktail: Fed cuts rates, global liquidity flows to EM, India captures disproportionate share. Brent stays under $80 (India's current account improves sharply). JPMorgan bond index inclusion brings $25B in systematic inflows. INR appreciates to low 80s.",
    portfolio_implication: "Go risk-on. Maximize equity. Minimal gold and USD needed — INR appreciation makes foreign assets less attractive. Large-caps and infrastructure beneficiaries outperform.",
    scenario_type: "bull",
    macro_inputs: { reer: 82, usdinr: 83, dxy: 95, india_cpi: 3.5, us_cpi: 2.5, repo_rate: 5.5, fed_funds: 3, india_gdp: 8, us_gdp: 1.5, brent: 75, fpi: 25, fdi: 75, bond_inflows: 20, services_exports: 500, remittances: 150, merchandise_deficit: 280, fx_reserves: 750, forward_book: 18 },
    macro_score: 82, inr_outlook: "bullish", risk_level: "low", inr_range_low: 80, inr_range_high: 86, allocation: { equity: 75, bond: 15, gold: 7, usd: 3 }, is_favourite: true,
  },
  {
    name: "Oil Shock", description: "Brent spikes to $140 on supply crunch",
    narrative: "A geopolitical supply shock pushes Brent to $140. India's import bill swells by $40B+ — current account deficit blows out. RBI forced to hike rates to defend INR. FPI exits equity and bonds. Stagflation risk rises. INR hits ₹110+.",
    portfolio_implication: "Defensive — go maximum gold and USD. Slash equity. Indian oil marketing companies (HPCL, BPCL) bleed. Oil upstream (ONGC, Oil India) benefit. Look at energy ETFs for hedge.",
    scenario_type: "bear",
    macro_inputs: { reer: 95, usdinr: 108, dxy: 110, india_cpi: 6.5, us_cpi: 4, repo_rate: 7, fed_funds: 5.5, india_gdp: 4.5, us_gdp: 1, brent: 140, fpi: -30, fdi: 35, bond_inflows: -5, services_exports: 400, remittances: 125, merchandise_deficit: 420, fx_reserves: 580, forward_book: 8 },
    macro_score: 22, inr_outlook: "bearish", risk_level: "high", inr_range_low: 105, inr_range_high: 115, allocation: { equity: 20, bond: 25, gold: 30, usd: 25 }, is_favourite: false,
  },
  {
    name: "Fed Pivot", description: "Fed cuts 150bps — EM carry trade rush",
    narrative: "US inflation finally tamed. Fed signals 150bps of cuts over 12 months. Global EM carry trade explodes — India gets $30B FPI. DXY drops to 97. Bond yields fall globally. India's real rate differential widens, attracting sticky bond flows via the FAR route.",
    portfolio_implication: "Equity-heavy. Indian IT sector (USD earner) underperforms as INR appreciates, but domestic consumption and banking rally. Long duration bonds for capital gains.",
    scenario_type: "bull",
    macro_inputs: { reer: 85, usdinr: 88, dxy: 97, india_cpi: 4, us_cpi: 2, repo_rate: 6, fed_funds: 3, india_gdp: 7, us_gdp: 1.8, brent: 85, fpi: 30, fdi: 60, bond_inflows: 25, services_exports: 460, remittances: 140, merchandise_deficit: 300, fx_reserves: 700, forward_book: 16 },
    macro_score: 74, inr_outlook: "bullish", risk_level: "low", inr_range_low: 85, inr_range_high: 91, allocation: { equity: 68, bond: 20, gold: 8, usd: 4 }, is_favourite: false,
  },
  {
    name: "Stagflation", description: "High inflation + low growth — worst of both worlds",
    narrative: "India gets stuck in the worst combination — sticky inflation forces RBI to keep rates high while growth slows on global demand weakness. High oil and food prices squeeze real incomes. FPI flees. RBI uses reserves to slow INR depreciation but can't stop it.",
    portfolio_implication: "Maximum defensiveness. Gold is the primary hedge. USD cash buffers INR depreciation. Minimal equity — only consumer staples and pharma for defensive exposure.",
    scenario_type: "bear",
    macro_inputs: { reer: 93, usdinr: 104, dxy: 108, india_cpi: 7, us_cpi: 5, repo_rate: 7.5, fed_funds: 6, india_gdp: 3, us_gdp: -0.5, brent: 115, fpi: -20, fdi: 30, bond_inflows: -8, services_exports: 380, remittances: 120, merchandise_deficit: 380, fx_reserves: 600, forward_book: 10 },
    macro_score: 18, inr_outlook: "bearish", risk_level: "high", inr_range_low: 102, inr_range_high: 112, allocation: { equity: 15, bond: 20, gold: 35, usd: 30 }, is_favourite: false,
  },
  {
    name: "Election Boom", description: "Pre-election fiscal push + infra spending surge",
    narrative: "Government ramps up capital expenditure ahead of elections. Infrastructure, defence, and PLI sectors surge. Fiscal deficit widens slightly but RBI comfortable with the growth impulse. FPI cautious initially but domestic retail investor flows power markets.",
    portfolio_implication: "Overweight domestic cyclicals — infrastructure, defence, PSU banks. IT and export plays underperform due to moderate INR strength. Increase equity but keep some gold as fiscal risk hedge.",
    scenario_type: "bull",
    macro_inputs: { reer: 87, usdinr: 91, dxy: 100, india_cpi: 4.5, us_cpi: 3, repo_rate: 6, fed_funds: 4, india_gdp: 7.5, us_gdp: 2, brent: 90, fpi: 15, fdi: 65, bond_inflows: 12, services_exports: 450, remittances: 142, merchandise_deficit: 310, fx_reserves: 680, forward_book: 14 },
    macro_score: 68, inr_outlook: "bullish", risk_level: "medium", inr_range_low: 88, inr_range_high: 94, allocation: { equity: 65, bond: 20, gold: 10, usd: 5 }, is_favourite: false,
  },
];

const OUTLOOK_COLORS: Record<string, string> = { bullish: "text-positive bg-positive/10", neutral: "text-warning bg-warning/10", bearish: "text-negative bg-negative/10" };
const RISK_COLORS: Record<string, string> = { low: "text-positive", medium: "text-warning", high: "text-negative" };

export default function ScenariosPage() {
  const { macroInputs, setMacroInputs, scoreResponse } = useAnalysisStore();
  const [savedScenarios, setSavedScenarios] = useState<ScenarioItem[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [expandedStory, setExpandedStory] = useState<number | null>(null);
  const baseCase = PRESET_SCENARIOS[0];

  const allScenarios = [...PRESET_SCENARIOS, ...savedScenarios];

  const handleSaveCurrent = () => {
    if (!scenarioName.trim()) return;
    setSavedScenarios((prev) => [...prev, {
      name: scenarioName, description: "Custom saved scenario", narrative: "Your custom macro view based on current dashboard inputs.", portfolio_implication: "Run analysis on the Dashboard to generate allocation for this scenario.", scenario_type: "custom",
      macro_inputs: { ...macroInputs },
      macro_score: scoreResponse?.macro_score ?? 0,
      inr_outlook: scoreResponse?.inr_outlook ?? "neutral",
      risk_level: scoreResponse?.risk_level ?? "medium",
      inr_range_low: scoreResponse?.inr_range_low ?? 90,
      inr_range_high: scoreResponse?.inr_range_high ?? 100,
      allocation: { equity: 50, bond: 25, gold: 15, usd: 10 },
      is_favourite: false,
    }]);
    setSaveModalOpen(false);
    setScenarioName("");
  };

  const toggleCompare = (idx: number) => {
    setCompareIds((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : prev.length < 3 ? [...prev, idx] : prev);
  };

  const compareScenarios = compareIds.map((i) => allScenarios[i]).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="lg:ml-[280px] mt-16 p-4 lg:p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-black text-text-primary">Scenario Builder</h1>
          <p className="text-sm text-text-secondary mt-1">Load presets or save your own macro scenarios. Select up to 3 to compare.</p>
        </div>
        <PageExplainer
          title="How scenarios work"
          what="Each scenario is a complete set of 18 macro inputs representing a coherent future state of the world — a specific macro story. When you click Load, the inputs are applied to your dashboard so you can run analysis and see the score, INR range, and allocation for that scenario."
          howToUse="Browse the presets below. Click 'Load' to apply a scenario to the Dashboard. Click 'Compare' on 2–3 scenarios to see a side-by-side table. Click 'Save Current' to snapshot your own view from the Dashboard sliders."
          keyInsight="Compare the Bull Run vs Stagflation scenarios to understand the full range of possible portfolio tilts — 75% equity vs 15% equity is a 60% swing driven purely by macro."
        />
        <div className="flex items-center justify-between mb-4">
          <div />
          <button onClick={() => setSaveModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Save size={14} />Save Current
          </button>
        </div>

        {saveModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm shadow-xl">
              <h2 className="font-bold text-text-primary mb-4">Save Current Scenario</h2>
              <input type="text" placeholder="e.g. My Q3 View..." value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4" autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveCurrent()} />
              <div className="flex gap-3">
                <button onClick={handleSaveCurrent} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Save</button>
                <button onClick={() => setSaveModalOpen(false)} className="flex-1 border border-border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {compareScenarios.length >= 2 && (
          <div className="bg-card rounded-xl border border-border p-5 mb-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-text-primary text-sm">Side-by-Side Comparison</h2>
              <button onClick={() => setCompareIds([])} className="text-xs text-text-secondary hover:text-negative">Clear</button>
            </div>
            <table className="w-full text-xs min-w-[500px]">
              <thead><tr className="border-b border-border">
                <th className="text-left py-2 text-text-secondary font-medium pr-4 w-28">Metric</th>
                {compareScenarios.map((s) => <th key={s.name} className="text-center py-2 font-bold text-text-primary px-3">{s.name}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {[
                  { label: "Macro Score", fn: (s: ScenarioItem) => { const d = s.macro_score - baseCase.macro_score; return <span className="font-black text-primary">{Math.round(s.macro_score)}{s.name !== "Base Case" && <span className={`text-[10px] ml-1 ${d >= 0 ? "text-positive" : "text-negative"}`}>{d >= 0 ? "▲" : "▼"}{Math.abs(Math.round(d))}</span>}</span>; } },
                  { label: "INR Outlook", fn: (s: ScenarioItem) => <span className={`capitalize font-semibold ${s.inr_outlook === "bullish" ? "text-positive" : s.inr_outlook === "bearish" ? "text-negative" : "text-warning"}`}>{s.inr_outlook}</span> },
                  { label: "Risk", fn: (s: ScenarioItem) => <span className={`capitalize ${RISK_COLORS[s.risk_level]}`}>{s.risk_level}</span> },
                  { label: "INR Range", fn: (s: ScenarioItem) => `₹${s.inr_range_low}–${s.inr_range_high}` },
                  { label: "Equity", fn: (s: ScenarioItem) => { const d = s.allocation.equity - baseCase.allocation.equity; return <span>{s.allocation.equity}%{s.name !== "Base Case" && <span className={`text-[10px] ml-1 ${d >= 0 ? "text-positive" : "text-negative"}`}>{d >= 0 ? "▲" : "▼"}{Math.abs(d)}</span>}</span>; } },
                  { label: "Gold", fn: (s: ScenarioItem) => { const d = s.allocation.gold - baseCase.allocation.gold; return <span>{s.allocation.gold}%{s.name !== "Base Case" && <span className={`text-[10px] ml-1 ${d >= 0 ? "text-positive" : "text-negative"}`}>{d >= 0 ? "▲" : "▼"}{Math.abs(d)}</span>}</span>; } },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-2.5 text-text-secondary pr-4">{row.label}</td>
                    {compareScenarios.map((s) => <td key={s.name} className="py-2.5 text-center px-3">{typeof row.fn(s) === "string" ? <span className="font-semibold text-text-primary">{row.fn(s) as string}</span> : row.fn(s)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {allScenarios.map((scenario, idx) => {
            const isComparing = compareIds.includes(idx);
            return (
              <div key={idx} className={`bg-card rounded-xl border-2 p-5 transition-all ${isComparing ? "border-primary shadow-md" : "border-border hover:border-gray-300"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-text-primary text-sm">{scenario.name}</h3>
                      {scenario.is_favourite && <Star size={11} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{scenario.description}</p>
                  </div>
                  <span className={`text-2xl font-black tabular-nums flex-shrink-0 ${RISK_COLORS[scenario.risk_level]}`}>{Math.round(scenario.macro_score)}</span>
                </div>
                {/* Story toggle */}
                <button onClick={() => setExpandedStory(expandedStory === idx ? null : idx)} className="flex items-center gap-1 text-[10px] text-primary mb-2 hover:underline">
                  {expandedStory === idx ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  {expandedStory === idx ? "Hide story" : "What's the story?"}
                </button>
                {expandedStory === idx && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
                    <p className="text-[11px] text-blue-800 leading-relaxed mb-2">{scenario.narrative}</p>
                    <p className="text-[10px] font-semibold text-blue-700">Portfolio implication:</p>
                    <p className="text-[11px] text-blue-800 leading-relaxed">{scenario.portfolio_implication}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${OUTLOOK_COLORS[scenario.inr_outlook]}`}>{scenario.inr_outlook}</span>
                  <span className={`text-xs font-semibold capitalize ${RISK_COLORS[scenario.risk_level]}`}>{scenario.risk_level} risk</span>
                  <span className="text-xs text-text-secondary ml-auto">₹{scenario.inr_range_low}–{scenario.inr_range_high}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-4">
                  {[{ l: "EQ", v: scenario.allocation.equity }, { l: "BD", v: scenario.allocation.bond }, { l: "AU", v: scenario.allocation.gold }, { l: "$", v: scenario.allocation.usd }].map((a) => (
                    <div key={a.l} className="bg-background rounded-lg p-2 text-center"><p className="text-[10px] text-text-secondary">{a.l}</p><p className="text-xs font-bold text-text-primary">{a.v}%</p></div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setMacroInputs(scenario.macro_inputs)} className="flex-1 flex items-center justify-center gap-1 bg-primary text-white py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"><ArrowRight size={11} />Load</button>
                  <button onClick={() => toggleCompare(idx)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${isComparing ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-gray-50 text-text-secondary"}`}>{isComparing ? "✓ Added" : "Compare"}</button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}


