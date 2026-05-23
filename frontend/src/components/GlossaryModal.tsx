"use client";

import React, { useState } from "react";
import { X, Search, BookOpen } from "lucide-react";

const TERMS: { term: string; definition: string; category: string }[] = [
  { term: "REER", definition: "Real Effective Exchange Rate — INR's value adjusted for inflation vs a basket of trading partners. REER > 100 means INR is overvalued vs history, which can hurt export competitiveness.", category: "Currency" },
  { term: "DXY", definition: "US Dollar Index — measures USD strength vs 6 major currencies (EUR 57.6%, JPY 13.6%, GBP 11.9%, CAD 9.1%, SEK 4.2%, CHF 3.6%). DXY rise = pressure on all EM currencies.", category: "Currency" },
  { term: "USD/INR", definition: "How many Indian Rupees buy 1 US Dollar. Higher number = weaker INR. India's RBI actively defends the INR, especially around ₹85–90 levels.", category: "Currency" },
  { term: "Repo Rate", definition: "RBI's benchmark overnight lending rate. All Indian borrowing costs are anchored to it. Higher repo = tighter credit = lower growth but better INR carry attractiveness.", category: "Rates" },
  { term: "Fed Funds Rate", definition: "US Federal Reserve's overnight rate — the world's most important interest rate. It determines the cost of USD globally. Higher = stronger USD = weaker EM currencies.", category: "Rates" },
  { term: "Real Rate Differential", definition: "India's real interest rate (repo − CPI) minus US real rate (Fed Funds − US CPI). Positive differential = India offers better inflation-adjusted return = INR supportive.", category: "Rates" },
  { term: "CPI", definition: "Consumer Price Index — measures the cost of a basket of goods and services. India's RBI targets 4% ±2% CPI. Above 6% = emergency territory for rate hikes.", category: "Inflation" },
  { term: "FPI", definition: "Foreign Portfolio Investment — short-term foreign money flowing into Indian stocks and bonds. Highly volatile — driven by global risk appetite, Fed policy, and India's relative attractiveness.", category: "Flows" },
  { term: "FDI", definition: "Foreign Direct Investment — long-term capital for building factories, offices, and infrastructure in India. Far more stable than FPI. India receives ~$70B/year.", category: "Flows" },
  { term: "FAR Route", definition: "Fully Accessible Route — allows foreign investors to buy Indian government bonds without restrictions. India's inclusion in JPMorgan and Bloomberg bond indices drives systematic FAR inflows.", category: "Flows" },
  { term: "Current Account Deficit (CAD)", definition: "India imports more than it exports, creating a USD outflow. Widening CAD = more USD demand = INR depreciation pressure. Oil prices and merchandise deficit are the biggest drivers.", category: "External" },
  { term: "FX Reserves", definition: "RBI's stockpile of foreign currencies, gold, and SDRs (currently ~$685B). Used to defend INR by selling USD in the market. Higher = more RBI firepower.", category: "External" },
  { term: "Forward Book", definition: "RBI's net position in USD forward contracts. A large forward book means RBI has implicitly sold future USD — when it unwinds, it can create short-term INR volatility.", category: "External" },
  { term: "Brent Crude", definition: "International oil benchmark (USD/barrel). India imports ~85% of its oil. Every $10 increase in Brent widens India's current account deficit by ~$15B and weakens INR.", category: "Commodities" },
  { term: "Macro Score", definition: "MacroSphere's 0–100 composite score of India's macro health. Built from 7 factor groups: REER, inflation differential, real rate differential, GDP differential, oil risk, capital flows, and external balance.", category: "Model" },
  { term: "P10 / P50 / P90", definition: "Percentiles from Monte Carlo simulation. P10 = only 10% of outcomes are worse (bear case). P50 = median outcome (base case). P90 = only 10% of outcomes are better (bull case).", category: "Model" },
  { term: "Carry Trade", definition: "Borrowing in a low-rate currency (USD/JPY) and investing in a high-rate currency (INR). When India's real rate is positive and RBI is stable, carry trades support INR.", category: "Model" },
  { term: "Monte Carlo", definition: "A simulation technique that runs thousands of random scenarios to estimate probability distributions. MacroSphere varies 6 macro factors to produce the distribution of INR outcomes.", category: "Model" },
  { term: "Overweight (OW)", definition: "Holding more of an asset than the benchmark/neutral allocation. E.g., 70% equity vs 50% neutral = +20% OW equity.", category: "Portfolio" },
  { term: "Underweight (UW)", definition: "Holding less of an asset than the benchmark/neutral allocation. E.g., 5% gold vs 10% neutral = -5% UW gold.", category: "Portfolio" },
  { term: "Duration", definition: "A bond's sensitivity to interest rate changes. Long duration = more price gain when rates fall. Higher duration bonds outperform in rate-cutting cycles.", category: "Portfolio" },
  { term: "Services Exports", definition: "India's earnings from IT, BPO, consulting, and other services sold to foreign clients. ~$300B+/year. India's largest USD earner and a key structural INR support.", category: "External" },
  { term: "Remittances", definition: "Money sent home by India's ~35M-strong diaspora. India is the world's largest remittance recipient (~$125B/year). Counter-cyclical — rises when global economy is weak.", category: "External" },
];

const CATEGORIES = ["All", ...Array.from(new Set(TERMS.map((t) => t.category)))];

export default function GlossaryModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = TERMS.filter((t) => {
    const matchCat = category === "All" || t.category === category;
    const matchQ = !query || t.term.toLowerCase().includes(query.toLowerCase()) || t.definition.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <>
      <button onClick={() => setOpen(true)} title="Open glossary"
        className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors px-2 py-1 rounded border border-border hover:border-primary">
        <BookOpen size={12} />Glossary
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="font-bold text-text-primary text-lg">Macro Glossary</h2>
                <p className="text-xs text-text-secondary">Plain-English definitions for every term in MacroSphere</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-text-secondary hover:text-negative transition-colors p-1 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-border flex-shrink-0 flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search terms..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-1 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`text-[10px] px-2 py-1 rounded font-semibold border transition-colors ${category === cat ? "bg-primary text-white border-primary" : "border-border text-text-secondary hover:border-primary hover:text-primary"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto px-5 py-3 divide-y divide-border">
              {filtered.length === 0 ? (
                <p className="text-xs text-text-secondary py-8 text-center">No terms match your search.</p>
              ) : (
                filtered.map((t) => (
                  <div key={t.term} className="py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-text-primary">{t.term}</span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider bg-gray-100 text-text-secondary px-1.5 py-0.5 rounded">{t.category}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{t.definition}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
