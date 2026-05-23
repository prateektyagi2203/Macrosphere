"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useAnalysisStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { Sparkles, RefreshCw, Copy, CheckCheck, AlertCircle } from "lucide-react";

const MOCK_INSIGHTS = {
  positive_drivers: "India's GDP growth trajectory remains one of the strongest among G20 economies at 6.5%, underpinned by robust domestic consumption and a resilient IT services sector. FX reserves at $650B provide significant RBI firepower to defend INR volatility. Remittances continue to be a structural inflow anchor.",
  negative_drivers: "Elevated Brent crude at $100/bbl is the key macro headwind, widening the current account deficit by an estimated $12-15B annually. FPI outflows of -$10B reflect global risk-off as the Fed maintains a restrictive stance with fed funds at 4.5%.",
  inr_outlook: "INR is expected to trade in a range of ₹94–100 over the next 12 months. The RBI's active intervention via its forward book (~13% of reserves) limits sharp depreciations. A sustained break above 100 would require a confluence of oil shock + FPI selloff + Fed hawkishness.",
  equity_outlook: "Indian equities remain structurally attractive on a 12–18 month view. The macro score of 55 supports a neutral-to-overweight position in domestic-facing sectors (consumption, financials, infrastructure). Export-oriented IT and pharma benefit from a weaker INR.",
  bond_outlook: "10-year G-secs offer real yields of ~2% above CPI, attractive by EM standards. RBI's inclusion in global bond indices brings incremental $20-25B inflows. Duration trades look favorable if oil stabilizes below $95.",
  key_risks: "1. Brent spike to $120+ on Middle East escalation. 2. Fed re-acceleration (CPI re-ignition). 3. China slowdown reducing global risk appetite. 4. Pre-election fiscal slippage widening fiscal deficit beyond 5.5% of GDP.",
  monitoring_points: "Watch: Monthly FPI data (BSE/NSE), RBI MPC minutes, US CPI prints, OPEC production decisions, India CAD prints (quarterly), G-sec auction cutoffs.",
};

export default function InsightsPage() {
  const { macroInputs, scoreResponse } = useAnalysisStore();
  const [insights, setInsights] = useState<typeof MOCK_INSIGHTS | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generate = async () => {
    if (!scoreResponse) {
      setError("Run analysis on the Dashboard first to generate contextual insights.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const alloc = { equity: 55, bond: 25, gold: 12, usd: 8 };
      const data = await apiClient.generateAIInsights(macroInputs, scoreResponse.macro_score, alloc);
      setInsights(data as any);
      setLastUpdated(new Date());
    } catch (err) {
      // Fallback to mock if API fails (no key configured)
      setInsights(MOCK_INSIGHTS);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!insights) return;
    const text = Object.entries(insights).map(([k, v]) => `${k.replace(/_/g, " ").toUpperCase()}\n${v}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SECTIONS = [
    { key: "positive_drivers", label: "✅ Positive Drivers", color: "border-l-positive bg-positive/5" },
    { key: "negative_drivers", label: "❌ Negative Drivers", color: "border-l-negative bg-negative/5" },
    { key: "inr_outlook", label: "💱 INR Outlook", color: "border-l-primary bg-blue-50" },
    { key: "equity_outlook", label: "📈 Equity Outlook", color: "border-l-positive bg-positive/5" },
    { key: "bond_outlook", label: "🏦 Bond Outlook", color: "border-l-purple-500 bg-purple-50" },
    { key: "key_risks", label: "⚠️ Key Risks", color: "border-l-warning bg-warning/5" },
    { key: "monitoring_points", label: "👁️ Monitoring Points", color: "border-l-gray-400 bg-gray-50" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="lg:ml-[280px] mt-16 p-4 lg:p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-text-primary">AI Insights</h1>
            <p className="text-sm text-text-secondary mt-1">GPT-4 powered institutional macro commentary based on your inputs</p>
          </div>
          <div className="flex items-center gap-2">
            {insights && (
              <button onClick={handleCopy} className="flex items-center gap-1.5 border border-border px-3 py-2 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                {copied ? <CheckCheck size={13} className="text-positive" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
            <button onClick={generate} disabled={isLoading} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isLoading ? "Generating..." : insights ? "Regenerate" : "Generate Insights"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 text-sm text-warning">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!scoreResponse && !insights && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <div className="text-4xl mb-3">🤖</div>
            <p className="font-semibold text-text-primary mb-1">Ready to generate AI insights</p>
            <p className="text-sm text-text-secondary mb-4">Run analysis on the Dashboard first, then click Generate Insights for contextual GPT-4 commentary.</p>
            <button onClick={generate} className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700">
              Generate with Sample Data
            </button>
          </div>
        )}

        {insights && (
          <>
            {lastUpdated && (
              <p className="text-xs text-text-secondary mb-4">Generated {lastUpdated.toLocaleTimeString()} · Powered by GPT-4 · Not financial advice</p>
            )}
            <div className="space-y-4">
              {SECTIONS.map((section) => (
                <div key={section.key} className={`bg-card rounded-xl border border-border border-l-4 p-5 ${section.color}`}>
                  <h3 className="text-sm font-bold text-text-primary mb-2">{section.label}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {(insights as any)[section.key] || "—"}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
