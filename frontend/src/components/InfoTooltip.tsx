"use client";

import React, { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

export interface TooltipContent {
  what: string;
  impact: string;
  signal: "bullish" | "neutral" | "bearish";
}

export function InfoTooltip({ content }: { content: TooltipContent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sigColor =
    content.signal === "bullish"
      ? "text-green-600 bg-green-50 border-green-100"
      : content.signal === "bearish"
      ? "text-red-500 bg-red-50 border-red-100"
      : "text-yellow-600 bg-yellow-50 border-yellow-100";

  const sigLabel =
    content.signal === "bullish"
      ? "✓ Bullish signal for INR"
      : content.signal === "bearish"
      ? "⚠ Bearish signal for INR"
      : "→ Neutral — watch closely";

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="text-gray-300 hover:text-primary transition-colors focus:outline-none ml-1"
        aria-label="More info"
      >
        <HelpCircle size={10} />
      </button>
      {open && (
        <div className="absolute left-4 top-0 z-50 w-60 bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-xs pointer-events-none">
          <p className="font-semibold text-text-primary mb-1 leading-snug">{content.what}</p>
          <p className="text-text-secondary leading-snug mb-2">{content.impact}</p>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sigColor}`}>
            {sigLabel}
          </span>
        </div>
      )}
    </div>
  );
}
