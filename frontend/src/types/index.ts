export interface MacroInputs {
  reer: number;
  usdinr: number;
  dxy: number;
  india_cpi: number;
  us_cpi: number;
  repo_rate: number;
  fed_funds: number;
  india_gdp: number;
  us_gdp: number;
  brent: number;
  fpi: number;
  fdi: number;
  bond_inflows: number;
  services_exports: number;
  remittances: number;
  merchandise_deficit: number;
  fx_reserves: number;
  forward_book: number;
}

export interface ScoreResponse {
  macro_score: number;
  inr_outlook: "bullish" | "neutral" | "bearish";
  risk_level: "low" | "medium" | "high";
  inr_range_low: number;
  inr_range_high: number;
  score_breakdown: Record<string, number>;
  factor_contributions: Record<string, number>;
}

export interface AllocationResponse {
  equity: number;
  bond: number;
  gold: number;
  usd: number;
}

export interface FullAnalysisResponse {
  macro_inputs: MacroInputs;
  score_response: ScoreResponse;
  allocation: AllocationResponse;
}

export interface SimulationResult {
  simulation_id: string;
  num_simulations: number;
  prob_inr_above_100: number;
  prob_inr_below_90: number;
  expected_macro_score: number;
  expected_volatility: number;
  inr_p10: number;
  inr_p50: number;
  inr_p90: number;
  score_p10: number;
  score_p50: number;
  score_p90: number;
  expected_allocation: AllocationResponse;
  inr_distribution: {
    bins: number[];
    counts: number[];
    min: number;
    max: number;
    mean: number;
    std: number;
  };
  macro_score_distribution: {
    bins: number[];
    counts: number[];
    min: number;
    max: number;
    mean: number;
    std: number;
  };
}

export interface Scenario {
  id: number;
  name: string;
  description?: string;
  scenario_type: string;
  macro_inputs: MacroInputs;
  macro_score: number;
  inr_outlook: string;
  risk_level: string;
  inr_range_low: number;
  inr_range_high: number;
  allocation: AllocationResponse;
  factor_scores: Record<string, number>;
  is_favourite: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIInsights {
  positive_drivers: string;
  negative_drivers: string;
  inr_outlook: string;
  equity_outlook: string;
  bond_outlook: string;
  key_risks: string;
  monitoring_points: string;
}
