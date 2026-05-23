"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, LayoutDashboard, BarChart2, GitBranch, Dices, PieChart, Sparkles, BookOpen, Settings } from "lucide-react";
import { useAnalysisStore } from "@/lib/store";

const NAVIGATION_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Macro Factors", href: "/factors", icon: BarChart2 },
  { label: "Scenario Builder", href: "/scenarios", icon: GitBranch },
  { label: "Monte Carlo", href: "/simulations", icon: Dices },
  { label: "Allocation Engine", href: "/allocation", icon: PieChart },
  { label: "AI Insights", href: "/insights", icon: Sparkles },
  { label: "Research", href: "/research", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isDarkMode, setIsDarkMode } = useAnalysisStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button className="fixed top-4 left-4 z-40 lg:hidden bg-card border border-border rounded-lg p-2 shadow-sm" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-[260px] bg-card border-r border-border transition-transform duration-300 flex flex-col z-30 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <div>
              <h1 className="text-base font-black text-primary leading-none">MacroSphere</h1>
              <p className="text-[10px] text-text-secondary">India Macro Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary hover:bg-gray-100"}`}>
                  <Icon size={16} className={isActive ? "text-white" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-3 py-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm text-text-secondary mb-3">
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="text-center text-[10px] text-text-secondary">
            <p className="font-semibold text-text-primary">Prateek Tyagi</p>
            <p>v1.0 · India Macro Engine</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}

