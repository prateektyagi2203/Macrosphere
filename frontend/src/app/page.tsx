"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import KPICards from "@/components/KPICards";
import MacroInputPanel from "@/components/MacroInputPanel";
import Charts from "@/components/Charts";
import { PageExplainer } from "@/components/PageExplainer";
import { useAnalysisStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { AllocationResponse, SimulationResult } from "@/types";

export default function Dashboard() {
  const {
    macroInputs, setScoreResponse, setAllocationResponse,
    scoreResponse, setIsLoading, isLoading, error, setError,
  } = useAnalysisStore();

  const { allocationResponse } = useAnalysisStore();
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [prevScore, setPrevScore] = useState<number | null>(null);

  const runAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (scoreResponse) setPrevScore(scoreResponse.macro_score);
      const result = await apiClient.runFullAnalysis(macroInputs);
      setScoreResponse(result.score_response);
      setAllocationResponse(result.allocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed -- make sure backend is running on port 8000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setIsLoading(true);
      const result = await apiClient.runSimulation(macroInputs, 10000);
      setSimulationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const alloc = allocationResponse;
  const allocItems = alloc
    ? [
        { label: "Equity", value: alloc.equity, color: "bg-blue-500" },
        { label: "Bonds", value: alloc.bond, color: "bg-green-500" },
        { label: "Gold", value: alloc.gold, color: "bg-yellow-500" },
        { label: "USD Cash", value: alloc.usd, color: "bg-gray-400" },
      ]
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header onRefresh={runAnalysis} onSave={() => {}} />
      <main id="dashboard" className="lg:ml-[280px] mt-16 p-4 lg:p-6 space-y-6">
        <PageExplainer
          title="How this dashboard works"
          what="Set 18 macro variables (currency, inflation, rates, oil, capital flows) using the sliders. The engine scores India's macro environment 0-100 and tells you whether the INR is likely to strengthen or weaken and how to tilt your portfolio."
          howToUse="1) Click Live Data to auto-fill USD/INR, DXY and Brent. 2) Adjust sliders to reflect your view. 3) Click Run Analysis."
          keyInsight="Score above 65 = bullish macro for INR and equities. Below 45 = headwinds -- consider gold and USD exposure."
        />
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">{error}</div>
        )}
        {!scoreResponse && !isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-800">
            <span className="font-semibold">Get started:</span> Load live market data with the Live Data button, then click <strong>Run Analysis</strong>.
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <MacroInputPanel />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <button onClick={runAnalysis} disabled={isLoading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isLoading ? "Analysing..." : "Run Analysis"}
            </button>
            <KPICards scoreResponse={scoreResponse} prevScore={prevScore} />
            {allocItems && (
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-text-primary uppercase tracking-wide">Suggested Allocation</p>
                  <a href="/allocation" className="text-[10px] text-primary hover:underline">Full breakdown</a>
                </div>
                <div className="flex rounded-full overflow-hidden h-4 mb-2">
                  {allocItems.map((item) => (
                    <div key={item.label} className={item.color + " transition-all duration-500"} style={{ width: item.value + "%" }} title={item.label + ": " + item.value + "%"} />
                  ))}
                </div>
                <div className="flex gap-4">
                  {allocItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className={"w-2 h-2 rounded-full " + item.color} />
                      <span className="text-[11px] text-text-secondary">{item.label} <strong className="text-text-primary">{item.value}%</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={handleRunSimulation} disabled={isLoading}
              className="w-full border border-primary text-primary py-2.5 rounded-lg font-semibold hover:bg-primary hover:text-white disabled:opacity-50 transition-colors">
              {isLoading ? "Running..." : "Run Monte Carlo (10,000 Simulations)"}
            </button>
            <Charts scoreResponse={scoreResponse} allocation={allocationResponse} simulationResult={simulationResult} />
          </div>
        </div>
      </main>
    </div>
  );
}
