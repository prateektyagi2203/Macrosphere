"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const ARTICLES = [
  {
    category: "Currency",
    emoji: "💱",
    title: "What is REER and Why Does It Matter?",
    summary: "The Real Effective Exchange Rate (REER) measures the rupee's value against a basket of trading partner currencies, adjusted for inflation differentials. A REER above 100 signals INR overvaluation — historically a leading indicator of depreciation pressure.",
    keyPoints: ["REER > 100 → INR overvalued → export competitiveness weakens", "India's REER has averaged ~95-105 over the past decade", "RBI monitors REER closely when setting intervention strategy"],
    tags: ["REER", "Exchange Rate", "Competitiveness"],
  },
  {
    category: "Flows",
    emoji: "💰",
    title: "How FPI Flows Drive Short-Term INR Moves",
    summary: "Foreign Portfolio Investors (FPIs) are the largest source of short-term INR volatility. Monthly net FPI flows into Indian equity and debt markets directly impact USD/INR — $1B net inflow typically appreciates INR by ~10-15 paise.",
    keyPoints: ["India added to JP Morgan EM Bond Index in 2024 — structural FPI tailwind", "FPI equity flows are faster-moving and more volatile than debt flows", "RBI uses FX forward book to offset temporary FPI outflow pressure"],
    tags: ["FPI", "Capital Flows", "INR Volatility"],
  },
  {
    category: "Macro",
    emoji: "🏦",
    title: "RBI's Dual Mandate: Inflation + Growth",
    summary: "The RBI targets CPI inflation at 4% (±2% band) while supporting economic growth. The repo rate is the primary lever — raising it cools inflation but tightens financial conditions. The India-US rate differential is a key driver of carry trade positioning.",
    keyPoints: ["India-US rate differential of 1.5-2% attracts carry trade capital", "RBI's Monetary Policy Committee meets every 8 weeks", "Rate cuts typically announced when CPI is sustainably below 4.5%"],
    tags: ["RBI", "Repo Rate", "Inflation", "Monetary Policy"],
  },
  {
    category: "Oil",
    emoji: "🛢️",
    title: "Why Brent Crude is India's Macro Achilles Heel",
    summary: "India imports ~85% of its oil needs, making Brent the single most impactful external variable for the INR. Every $10/bbl rise in oil widens India's current account deficit by approximately $14-16 billion annually, directly weakening the rupee.",
    keyPoints: ["India = world's 3rd largest oil importer", "$10 Brent rise → ~0.4% of GDP wider CAD → ~₹1-2 INR depreciation", "Petro-products are India's largest import item (~$150B/year)"],
    tags: ["Brent", "Oil", "Current Account", "CAD"],
  },
  {
    category: "External",
    emoji: "🌐",
    title: "India's $700B FX Reserves: Asia's Buffer",
    summary: "India's foreign exchange reserves have grown from ~$300B in 2016 to over $650B in 2025, providing the RBI with enormous firepower to manage INR volatility. High reserves reduce convertibility risk and support sovereign credit ratings.",
    keyPoints: ["Covers ~10 months of import payments — well above IMF's 3-month benchmark", "RBI actively intervenes both in spot and forward FX markets", "Reserve accumulation accelerates during FPI inflow periods"],
    tags: ["FX Reserves", "RBI", "Intervention"],
  },
  {
    category: "Global",
    emoji: "🔮",
    title: "Fed Policy and Its Outsized Effect on INR",
    summary: "The US Federal Reserve's rate decisions reverberate through global capital markets. When the Fed raises rates, the dollar strengthens (DXY rises), EM currencies including INR weaken, and FPI typically outflows from India. A Fed pivot is therefore highly bullish for INR.",
    keyPoints: ["Every 25bps Fed hike historically weakens INR by ₹0.5-1", "DXY and INR are strongly negatively correlated (r ≈ -0.75)", "India is more resilient to Fed hikes than peers due to strong fundamentals"],
    tags: ["Fed", "DXY", "Global Rates", "EM"],
  },
];

const GLOSSARY = [
  { term: "REER", def: "Real Effective Exchange Rate — trade-weighted, inflation-adjusted INR value" },
  { term: "USD/INR", def: "How many rupees per US dollar. Higher = weaker INR" },
  { term: "DXY", def: "US Dollar Index vs 6 major currencies. Higher = stronger USD globally" },
  { term: "CPI", def: "Consumer Price Index — monthly inflation measure" },
  { term: "Repo Rate", def: "RBI's benchmark lending rate — primary monetary policy tool" },
  { term: "Fed Funds", def: "US Federal Reserve's overnight rate — global risk-free rate anchor" },
  { term: "FPI", def: "Foreign Portfolio Investment — foreign buying/selling of listed securities" },
  { term: "FDI", def: "Foreign Direct Investment — long-term capital into businesses" },
  { term: "CAD", def: "Current Account Deficit — gap between imports and exports of goods+services" },
  { term: "Brent", def: "Global oil benchmark price (USD per barrel)" },
  { term: "G-Sec", def: "Government Securities — Indian sovereign bonds" },
  { term: "Forward Book", def: "RBI's hedged FX position — used to manage INR without depleting spot reserves" },
];

const DATA_SOURCES = [
  { name: "RBI Data Warehouse", url: "https://dbie.rbi.org.in", desc: "Official India macro data" },
  { name: "MOSPI", url: "https://mospi.gov.in", desc: "India GDP, CPI, trade data" },
  { name: "FRED (St. Louis Fed)", url: "https://fred.stlouisfed.org", desc: "US macro data + global series" },
  { name: "SEBI FPI Monitor", url: "https://www.sebi.gov.in", desc: "Daily FPI flow tracker" },
  { name: "Bloomberg / Refinitiv", url: "#", desc: "Professional terminal data" },
];

export default function ResearchPage() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="lg:ml-[280px] mt-16 p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-text-primary">Research</h1>
          <p className="text-sm text-text-secondary mt-1">Macro explainers, glossary, and data sources for India macro analysis</p>
        </div>

        {/* Articles */}
        <div className="space-y-4 mb-8">
          {ARTICLES.map((article, idx) => (
            <div key={idx} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full text-left p-5 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{article.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{article.category}</span>
                    </div>
                    <h3 className="font-bold text-text-primary text-sm">{article.title}</h3>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{article.summary}</p>
                  </div>
                </div>
                {expanded === idx ? <ChevronUp size={16} className="text-text-secondary flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-text-secondary flex-shrink-0 mt-1" />}
              </button>

              {expanded === idx && (
                <div className="px-5 pb-5 border-t border-border">
                  <p className="text-sm text-text-secondary leading-relaxed mt-4 mb-4">{article.summary}</p>
                  <ul className="space-y-2 mb-4">
                    {article.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                        <span className="text-primary font-bold flex-shrink-0">→</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Glossary */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-text-primary">📖 Glossary</h2>
              <button onClick={() => setShowGlossary(!showGlossary)} className="text-xs text-primary hover:underline">
                {showGlossary ? "Hide" : "Show all"}
              </button>
            </div>
            <div className="space-y-3">
              {(showGlossary ? GLOSSARY : GLOSSARY.slice(0, 6)).map((g) => (
                <div key={g.term} className="flex gap-3">
                  <span className="text-xs font-bold text-primary w-24 flex-shrink-0">{g.term}</span>
                  <span className="text-xs text-text-secondary">{g.def}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-text-primary mb-4">🔗 Data Sources</h2>
            <div className="space-y-3">
              {DATA_SOURCES.map((source) => (
                <a key={source.name} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group">
                  <div>
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary">{source.name}</p>
                    <p className="text-xs text-text-secondary">{source.desc}</p>
                  </div>
                  <ExternalLink size={13} className="text-text-secondary group-hover:text-primary flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
