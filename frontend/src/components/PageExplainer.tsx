"use client";

import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface PageExplainerProps {
  title: string;
  what: string;
  howToUse: string;
  keyInsight?: string;
  defaultOpen?: boolean;
}

export function PageExplainer({ title, what, howToUse, keyInsight, defaultOpen = false }: PageExplainerProps) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full text-left gap-3"
      >
        <div className="flex items-center gap-2">
          <Info size={14} className="text-blue-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-blue-700">{title}</span>
        </div>
        <span className="text-blue-400 flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {expanded && (
        <div className="mt-3 space-y-1.5 text-xs pl-5 border-t border-blue-100 pt-3">
          <p>
            <span className="font-semibold text-text-primary">What it does: </span>
            <span className="text-text-secondary">{what}</span>
          </p>
          <p>
            <span className="font-semibold text-text-primary">How to use: </span>
            <span className="text-text-secondary">{howToUse}</span>
          </p>
          {keyInsight && (
            <p className="text-blue-600 font-medium">💡 {keyInsight}</p>
          )}
        </div>
      )}
    </div>
  );
}
