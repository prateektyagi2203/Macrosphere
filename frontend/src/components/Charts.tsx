"use client";

import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScoreResponse, AllocationResponse, SimulationResult } from "@/types";

interface ChartsProps {
  scoreResponse: ScoreResponse | null;
  allocation: AllocationResponse | null;
  simulationResult: SimulationResult | null;
}

const ALLOCATION_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#6B7280"];
const FACTOR_COLORS = ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-text-primary mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.fill || p.color }}>
            {p.name}: {p.value}
            {p.name === "weight" ? "%" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Charts({ scoreResponse, allocation, simulationResult }: ChartsProps) {
  const factorData = scoreResponse
    ? Object.entries(scoreResponse.factor_contributions)
        .map(([name, value]) => ({
          name: name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          score: Math.round(value * 10) / 10,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
    : [];

  const allocationData = allocation
    ? [
        { name: "Equity", value: allocation.equity },
        { name: "Bonds", value: allocation.bond },
        { name: "Gold", value: allocation.gold },
        { name: "Cash/USD", value: allocation.usd },
      ]
    : [];

  const inrDistData = simulationResult
    ? simulationResult.inr_distribution.bins.map((bin, idx) => ({
        range: bin.toFixed(1),
        count: simulationResult.inr_distribution.counts[idx],
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Factor Contributions */}
      {factorData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4">Factor Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={factorData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {factorData.map((_, index) => (
                  <Cell key={index} fill={FACTOR_COLORS[index % FACTOR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Allocation Donut */}
      {allocationData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4">Recommended Allocation</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationData.map((_, index) => (
                    <Cell key={index} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {allocationData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ALLOCATION_COLORS[index] }}
                    />
                    <span className="text-xs text-text-secondary">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-text-primary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monte Carlo Distribution */}
      {inrDistData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-text-primary mb-1">INR Distribution (Monte Carlo)</h3>
          <p className="text-xs text-text-secondary mb-4">
            {simulationResult?.num_simulations.toLocaleString()} simulations
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={inrDistData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="range" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {simulationResult && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
              {[
                { label: "P10 (Bear)", value: simulationResult.inr_p10?.toFixed(2) },
                { label: "P50 (Base)", value: simulationResult.inr_p50?.toFixed(2) },
                { label: "P90 (Bull)", value: simulationResult.inr_p90?.toFixed(2) },
              ].map((p) => (
                <div key={p.label} className="text-center">
                  <p className="text-[10px] text-text-secondary">{p.label}</p>
                  <p className="text-sm font-bold text-text-primary">₹{p.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
