"use client";

import React from "react";
import { Download, Save, RotateCcw, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GlossaryModal from "@/components/GlossaryModal";

interface HeaderProps {
  onRefresh?: () => void;
  onSave?: () => void;
}

export default function Header({ onRefresh, onSave }: HeaderProps) {
  const handleExportPNG = async () => {
    const dashboardElement = document.getElementById("dashboard");
    if (!dashboardElement) return;

    const canvas = await html2canvas(dashboardElement, {
      backgroundColor: "#F5F7FA",
      scale: 2,
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = `macrosphere-${Date.now()}.png`;
    link.click();
  };

  const handleExportPDF = async () => {
    const dashboardElement = document.getElementById("dashboard");
    if (!dashboardElement) return;

    const canvas = await html2canvas(dashboardElement, {
      backgroundColor: "#F5F7FA",
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const img = canvas.toDataURL("image/png");
    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(img, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`macrosphere-${Date.now()}.pdf`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-20 lg:ml-[280px]">
      <div>
        <h2 className="text-page-title font-bold text-text-primary">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Export PNG */}
        <button
          onClick={handleExportPNG}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm"
          title="Export as PNG"
        >
          <Download size={18} />
          <span className="hidden sm:inline">PNG</span>
        </button>

        {/* Export PDF */}
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm"
          title="Export as PDF"
        >
          <Download size={18} />
          <span className="hidden sm:inline">PDF</span>
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm"
          title="Save scenario"
        >
          <Save size={18} />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm"
          title="Refresh"
        >
          <RotateCcw size={18} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <GlossaryModal />
      </div>
    </header>
  );
}
