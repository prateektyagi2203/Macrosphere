import axios, { AxiosInstance, AxiosError } from "axios";
import {
  MacroInputs,
  ScoreResponse,
  AllocationResponse,
  FullAnalysisResponse,
  SimulationResult,
  Scenario,
  AIInsights,
} from "@/types";

// Use relative URL so requests go through Next.js proxy (avoids CORS)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Helper for logging
const log = (level: "info" | "warn" | "error", message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [API]`;
  
  if (data) {
    console.log(`${prefix} [${level.toUpperCase()}] ${message}`, data);
  } else {
    console.log(`${prefix} [${level.toUpperCase()}] ${message}`);
  }
};

// Custom error class
class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      log("info", `${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for error handling and logging
    this.client.interceptors.response.use(
      (response) => {
        log("info", `${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        const status = error.response?.status || 0;
        const message = (error.response?.data as any)?.detail || error.message;
        
        log("error", `${status} ${error.config?.url} - ${message}`);
        
        throw new APIError(status, message, error.response?.data);
      }
    );
  }

  // Analysis endpoints
  async calculateScore(inputs: Partial<MacroInputs>): Promise<ScoreResponse> {
    try {
      log("info", "Calculating macro score...");
      const response = await this.client.post("/api/v1/analysis/calculate", inputs);
      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Score calculation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async getAllocation(score: number): Promise<AllocationResponse> {
    try {
      log("info", `Getting allocation for score: ${score}`);
      const response = await this.client.post("/api/v1/analysis/allocation", { score });
      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to get allocation: ${error.message}`);
      }
      throw error;
    }
  }

  async runFullAnalysis(inputs: Partial<MacroInputs>): Promise<FullAnalysisResponse> {
    try {
      log("info", "Running full analysis...");
      const response = await this.client.post("/api/v1/analysis/full-analysis", inputs);
      log("info", "Full analysis completed successfully");
      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Full analysis failed: ${error.message}`);
      }
      throw error;
    }
  }

  async generateAIInsights(
    inputs: Partial<MacroInputs>,
    score: number,
    allocation: AllocationResponse
  ): Promise<AIInsights> {
    try {
      log("info", "Generating AI insights...");
      const response = await this.client.post("/api/v1/analysis/ai-insights", {
        macro_inputs: inputs,
        macro_score: score,
        allocation,
      });
      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`AI insights generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async getFactorReference(): Promise<any> {
    try {
      const response = await this.client.get("/api/v1/analysis/factors");
      return response.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch factor reference: ${error.message}`);
      }
      throw error;
    }
  }

  // Scenario endpoints
  async listPreloadedScenarios(): Promise<Record<string, any>> {
    const response = await this.client.get("/api/v1/scenarios/preloaded");
    return response.data;
  }

  async getPreloadedScenario(key: string): Promise<any> {
    const response = await this.client.get(`/api/v1/scenarios/preloaded/${key}`);
    return response.data;
  }

  async loadScenario(key: string): Promise<FullAnalysisResponse> {
    const response = await this.client.post(`/api/v1/scenarios/load/${key}`);
    return response.data;
  }

  async createScenario(
    name: string,
    description: string,
    inputs: Partial<MacroInputs>
  ): Promise<Scenario> {
    const response = await this.client.post("/api/v1/scenarios/create", {
      name,
      description,
      scenario_type: "custom",
      macro_inputs: inputs,
    });
    return response.data;
  }

  async listScenarios(skip = 0, limit = 100): Promise<Scenario[]> {
    const response = await this.client.get("/api/v1/scenarios", {
      params: { skip, limit },
    });
    return response.data;
  }

  async getScenario(id: number): Promise<Scenario> {
    const response = await this.client.get(`/api/v1/scenarios/${id}`);
    return response.data;
  }

  async updateScenario(
    id: number,
    updates: Partial<Scenario>
  ): Promise<Scenario> {
    const response = await this.client.patch(`/api/v1/scenarios/${id}`, updates);
    return response.data;
  }

  async deleteScenario(id: number): Promise<void> {
    await this.client.delete(`/api/v1/scenarios/${id}`);
  }

  // Simulation endpoints
  async runSimulation(
    inputs: Partial<MacroInputs>,
    numSimulations = 10000,
    randomizeFactors?: string[]
  ): Promise<SimulationResult> {
    const response = await this.client.post("/api/v1/simulations/run", {
      base_macro_inputs: inputs,
      num_simulations: numSimulations,
      randomize_factors: randomizeFactors || [
        "brent",
        "india_gdp",
        "india_cpi",
        "fpi",
        "dxy",
        "fx_reserves",
      ],
    });
    return response.data;
  }

  async getSimulation(id: string): Promise<SimulationResult> {
    const response = await this.client.get(`/api/v1/simulations/${id}`);
    return response.data;
  }

  async listSimulations(skip = 0, limit = 50): Promise<any[]> {
    const response = await this.client.get("/api/v1/simulations", {
      params: { skip, limit },
    });
    return response.data;
  }

  // Market data
  async fetchLiveMarketData(): Promise<{
    inputs: Partial<MacroInputs>;
    live_fields: string[];
    default_fields: string[];
    fetched_at: string;
    sources: Record<string, string>;
  }> {
    const response = await this.client.get("/api/v1/market-data/live");
    return response.data;
  }
}

export const apiClient = new APIClient();
