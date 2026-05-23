import { create } from "zustand";
import { MacroInputs, ScoreResponse, AllocationResponse, AIInsights } from "@/types";

interface AnalysisState {
  // Macro inputs
  macroInputs: MacroInputs;
  setMacroInputs: (inputs: Partial<MacroInputs>) => void;
  resetInputs: () => void;

  // Analysis results
  scoreResponse: ScoreResponse | null;
  setScoreResponse: (score: ScoreResponse | null) => void;

  allocationResponse: AllocationResponse | null;
  setAllocationResponse: (allocation: AllocationResponse | null) => void;

  aiInsights: AIInsights | null;
  setAIInsights: (insights: AIInsights | null) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Theme
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const DEFAULT_INPUTS: MacroInputs = {
  reer: 88,
  usdinr: 97,
  dxy: 103,
  india_cpi: 4,
  us_cpi: 3,
  repo_rate: 6,
  fed_funds: 4.5,
  india_gdp: 6.5,
  us_gdp: 2,
  brent: 100,
  fpi: -10,
  fdi: 50,
  bond_inflows: 10,
  services_exports: 420,
  remittances: 135,
  merchandise_deficit: 330,
  fx_reserves: 650,
  forward_book: 13,
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  // Macro inputs
  macroInputs: DEFAULT_INPUTS,
  setMacroInputs: (inputs) =>
    set((state) => ({
      macroInputs: { ...state.macroInputs, ...inputs },
    })),
  resetInputs: () => set({ macroInputs: DEFAULT_INPUTS }),

  // Analysis results
  scoreResponse: null,
  setScoreResponse: (score) => set({ scoreResponse: score }),

  allocationResponse: null,
  setAllocationResponse: (allocation) => set({ allocationResponse: allocation }),

  aiInsights: null,
  setAIInsights: (insights) => set({ aiInsights: insights }),

  // UI state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),

  // Theme
  isDarkMode: false,
  setIsDarkMode: (dark) => set({ isDarkMode: dark }),
}));
