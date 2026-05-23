"use client";

import React, { useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { RotateCcw, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { MacroInputs } from "@/types";
import { useAnalysisStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { InfoTooltip, TooltipContent } from "@/components/InfoTooltip";

const TOOLTIPS: Record<keyof MacroInputs, TooltipContent> = {
  reer: { what: "Real Effective Exchange Rate — INR vs a weighted basket of trading partners, inflation-adjusted.", impact: "Above 100 = INR overvalued ? exports uncompetitive ? bearish long-term.", signal: "neutral" },
  usdinr: { what: "How many Rupees buy one US Dollar. Lower = INR is stronger.", impact: "Driven by trade balance, FPI flows, Fed/RBI policy. RBI defends ?90+ aggressively.", signal: "neutral" },
  dxy: { what: "US Dollar Index vs 6 major currencies (EUR, JPY, GBP, CAD, SEK, CHF).", impact: "Strong DXY = global USD strength = pressure on all EM currencies including INR.", signal: "neutral" },
  india_cpi: { what: "India Consumer Price Inflation. RBI targets 4% ±2%.", impact: "High inflation erodes INR value and forces rate hikes, crowding out growth.", signal: "neutral" },
  us_cpi: { what: "US Consumer Price Inflation. Fed targets 2%.", impact: "High US CPI keeps Fed hawkish ? USD strength ? capital flows away from EM.", signal: "neutral" },
  repo_rate: { what: "RBI benchmark overnight lending rate — anchor for all Indian rates.", impact: "Higher repo vs Fed = better carry trade for INR. Too high = slows growth.", signal: "neutral" },
  fed_funds: { what: "US Federal Reserve target rate — world's most important policy rate.", impact: "Higher Fed Funds = stronger USD = weaker INR. Rate cuts = EM rally.", signal: "neutral" },
  india_gdp: { what: "India annual GDP growth. India is the world's fastest-growing major economy.", impact: "Strong growth attracts FPI + FDI ? INR demand ? INR appreciation.", signal: "neutral" },
  us_gdp: { what: "US annual GDP growth rate.", impact: "Strong US GDP keeps Fed tight ? USD strength ? INR headwinds. Weak US GDP = Fed cuts = good for EM.", signal: "neutral" },
  brent: { what: "Brent crude oil (USD/barrel). India imports ~85% of oil needs (~$140B/year).", impact: "Every $10 rise in Brent widens India Current Account Deficit by ~$15B ? INR weakness.", signal: "neutral" },
  fpi: { what: "Foreign Portfolio Investment — net flows of foreign money into Indian stocks and bonds.", impact: "Positive FPI = foreigners buying INR. Negative = selling ? depreciation pressure.", signal: "neutral" },
  fdi: { what: "Foreign Direct Investment — long-term investments in Indian companies.", impact: "FDI is sticky unlike FPI. High FDI = structural INR support regardless of market mood.", signal: "neutral" },
  bond_inflows: { what: "Foreign flows into Indian govt bonds via the FAR route.", impact: "India's inclusion in JPMorgan/Bloomberg bond indices drives systematic inflows.", signal: "neutral" },
  services_exports: { what: "India's IT, BPO, consulting exports (USD, annualized).", impact: "India earns $300B+/year — major structural USD earner. IT services = INR's backbone.", signal: "neutral" },
  remittances: { what: "Money sent home by 35M Indian diaspora. India is world's #1 remittance recipient.", impact: "~$125B/year of sticky, counter-cyclical USD inflows. Key INR stabilizer.", signal: "neutral" },
  merchandise_deficit: { what: "India imports more goods than it exports — this gap is the trade deficit.", impact: "Wider deficit = more USD outflows. Oil, electronics, gold are major import drivers.", signal: "neutral" },
  fx_reserves: { what: "RBI total foreign exchange reserves (USD, gold, SDRs).", impact: "Higher reserves = more RBI ammunition to defend INR. $600B+ = ~9 months import cover.", signal: "neutral" },
  forward_book: { what: "RBI net forward USD position — USD sold forward in derivatives.", impact: "Large forward book = implicit INR support. When unwound, can create volatility.", signal: "neutral" },
};

function getSignal(key: keyof MacroInputs, value: number): "bullish" | "neutral" | "bearish" {
  switch (key) {
    case "reer": return value < 95 ? "bullish" : value < 105 ? "neutral" : "bearish";
    case "usdinr": return value < 84 ? "bullish" : value < 90 ? "neutral" : "bearish";
    case "dxy": return value < 96 ? "bullish" : value < 105 ? "neutral" : "bearish";
    case "india_cpi": return value < 4 ? "bullish" : value < 5.5 ? "neutral" : "bearish";
    case "us_cpi": return value < 2.5 ? "bullish" : value < 4 ? "neutral" : "bearish";
    case "repo_rate": return value >= 5.5 && value <= 7 ? "bullish" : value < 4.5 ? "bearish" : "neutral";
    case "fed_funds": return value < 3.5 ? "bullish" : value < 5 ? "neutral" : "bearish";
    case "india_gdp": return value > 7 ? "bullish" : value > 5 ? "neutral" : "bearish";
    case "us_gdp": return value < 1.5 ? "bullish" : value < 3 ? "neutral" : "bearish";
    case "brent": return value < 75 ? "bullish" : value < 100 ? "neutral" : "bearish";
    case "fpi": return value > 10 ? "bullish" : value > -10 ? "neutral" : "bearish";
    case "fdi": return value > 60 ? "bullish" : value > 40 ? "neutral" : "bearish";
    case "bond_inflows": return value > 15 ? "bullish" : value > 3 ? "neutral" : "bearish";
    case "services_exports": return value > 450 ? "bullish" : value > 370 ? "neutral" : "bearish";
    case "remittances": return value > 130 ? "bullish" : value > 105 ? "neutral" : "bearish";
    case "merchandise_deficit": return value < 280 ? "bullish" : value < 360 ? "neutral" : "bearish";
    case "fx_reserves": return value > 660 ? "bullish" : value > 560 ? "neutral" : "bearish";
    case "forward_book": return value > 15 ? "bullish" : value > 7 ? "neutral" : "bearish";
    default: return "neutral";
  }
}

const INPUT_CONFIG: { label: string; key: keyof MacroInputs; min: number; max: number; step: number; unit?: string; group: string }[] = [
  { label: "REER", key: "reer", min: 70, max: 120, step: 1, group: "Currency" },
  { label: "USD/INR", key: "usdinr", min: 70, max: 120, step: 0.5, group: "Currency" },
  { label: "DXY", key: "dxy", min: 80, max: 130, step: 1, group: "Currency" },
  { label: "India CPI", key: "india_cpi", min: 0, max: 10, step: 0.1, unit: "%", group: "Inflation" },
  { label: "US CPI", key: "us_cpi", min: 0, max: 10, step: 0.1, unit: "%", group: "Inflation" },
  { label: "Repo Rate", key: "repo_rate", min: 2, max: 10, step: 0.1, unit: "%", group: "Rates" },
  { label: "Fed Funds", key: "fed_funds", min: 0, max: 8, step: 0.1, unit: "%", group: "Rates" },
  { label: "India GDP", key: "india_gdp", min: 0, max: 10, step: 0.1, unit: "%", group: "Growth" },
  { label: "US GDP", key: "us_gdp", min: -2, max: 6, step: 0.1, unit: "%", group: "Growth" },
  { label: "Brent Oil", key: "brent", min: 40, max: 180, step: 1, unit: "$", group: "Commodities" },
  { label: "FPI", key: "fpi", min: -50, max: 50, step: 1, unit: "B$", group: "Flows" },
  { label: "FDI", key: "fdi", min: 0, max: 100, step: 1, unit: "B$", group: "Flows" },
  { label: "Bond Inflows", key: "bond_inflows", min: -20, max: 50, step: 1, unit: "B$", group: "Flows" },
  { label: "Services Exports", key: "services_exports", min: 100, max: 700, step: 10, unit: "B$", group: "External" },
  { label: "Remittances", key: "remittances", min: 50, max: 250, step: 5, unit: "B$", group: "External" },
  { label: "Merch. Deficit", key: "merchandise_deficit", min: 100, max: 500, step: 10, unit: "B$", group: "External" },
  { label: "FX Reserves", key: "fx_reserves", min: 300, max: 900, step: 10, unit: "B$", group: "External" },
  { label: "Forward Book", key: "forward_book", min: 0, max: 25, step: 0.5, unit: "B$", group: "External" },
];

const GROUP_COLORS: Record<string, string> = {
  Currency: "text-blue-600", Inflation: "text-orange-500", Rates: "text-purple-600",
  Growth: "text-green-600", Commodities: "text-yellow-600", Flows: "text-pink-600", External: "text-teal-600",
};
const GROUP_BG: Record<string, string> = {
  Currency: "bg-blue-50 text-blue-700", Inflation: "bg-orange-50 text-orange-700",
  Rates: "bg-purple-50 text-purple-700", Growth: "bg-green-50 text-green-700",
  Commodities: "bg-yellow-50 text-yellow-700", Flows: "bg-pink-50 text-pink-700", External: "bg-teal-50 text-teal-700",
};

export default function MacroInputPanel() {
  const { macroInputs, setMacroInputs, resetInputs } = useAnalysisStore();
  const [liveStatus, setLiveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [liveFields, setLiveFields] = useState<string[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const handleChange = (key: keyof MacroInputs, value: number[]) => setMacroInputs({ [key]: value[0] });

  const loadLiveData = async () => {
    setLiveStatus("loading");
    try {
      const data = await apiClient.fetchLiveMarketData();
      const clamped: Partial<MacroInputs> = {};
      for (const cfg of INPUT_CONFIG) {
        const raw = data.inputs[cfg.key];
        if (raw !== undefined && raw !== null) clamped[cfg.key] = Math.min(cfg.max, Math.max(cfg.min, raw as number));
      }
      setMacroInputs(clamped);
      setLiveFields(data.live_fields);
      setFetchedAt(data.fetched_at);
      setLiveStatus("success");
      setTimeout(() => setLiveStatus("idle"), 6000);
    } catch { setLiveStatus("error"); setTimeout(() => setLiveStatus("idle"), 4000); }
  };

  const groups = Array.from(new Set(INPUT_CONFIG.map((c) => c.group)));

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-text-primary text-base">Macro Inputs</h3>
          <p className="text-[10px] text-text-secondary mt-0.5">?? bullish · ?? neutral · ?? bearish for INR</p>
        </div>
        <div className="flex items-center gap-2">
          {liveStatus === "success" && (
            <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
              <CheckCircle size={11} />{liveFields.length} live
              {fetchedAt && <span className="text-text-secondary">· {new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
            </span>
          )}
          {liveStatus === "error" && <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium"><AlertCircle size={11} />fetch failed</span>}
          <button onClick={loadLiveData} disabled={liveStatus === "loading"} title="Load live USD/INR, DXY & Brent"
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${liveStatus === "loading" ? "border-blue-200 text-blue-400 bg-blue-50 cursor-wait" : "border-border text-text-secondary hover:text-primary hover:border-primary"}`}>
            <RefreshCw size={11} className={liveStatus === "loading" ? "animate-spin" : ""} />
            {liveStatus === "loading" ? "Fetching…" : "Live Data"}
          </button>
          <button onClick={resetInputs} className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors">
            <RotateCcw size={12} />Reset
          </button>
        </div>
      </div>

      <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
        {groups.map((group) => (
          <div key={group} className="mb-5">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3 ${GROUP_BG[group]}`}>{group}</span>
            <div className="space-y-4">
              {INPUT_CONFIG.filter((c) => c.group === group).map((config) => {
                const value = macroInputs[config.key] as number;
                const signal = getSignal(config.key, value);
                const isLive = liveFields.includes(config.key);
                const dotColor = signal === "bullish" ? "bg-green-500" : signal === "bearish" ? "bg-red-500" : "bg-yellow-400";
                const rangeColor = signal === "bullish" ? "bg-green-500" : signal === "bearish" ? "bg-red-400" : "bg-primary";
                return (
                  <div key={config.key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                        <span className="text-xs font-medium text-text-primary">{config.label}</span>
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Live" />}
                        <InfoTooltip content={{ ...TOOLTIPS[config.key], signal }} />
                      </div>
                      <span className={`text-xs font-bold tabular-nums ${GROUP_COLORS[config.group]}`}>
                        {value.toFixed(config.step < 1 ? 2 : 0)}{config.unit ? ` ${config.unit}` : ""}
                      </span>
                    </div>
                    <SliderPrimitive.Root value={[value]} onValueChange={(v) => handleChange(config.key, v)} min={config.min} max={config.max} step={config.step} className="relative flex items-center select-none touch-none w-full h-5">
                      <SliderPrimitive.Track className="relative h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                        <SliderPrimitive.Range className={`absolute h-full rounded-full ${rangeColor}`} />
                      </SliderPrimitive.Track>
                      <SliderPrimitive.Thumb className="block w-4 h-4 rounded-full bg-white border-2 border-primary shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-shadow cursor-grab active:cursor-grabbing" aria-label={config.label} />
                    </SliderPrimitive.Root>
                    <div className="flex justify-between text-[10px] text-text-secondary mt-0.5">
                      <span>{config.min}</span><span>{config.max}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
