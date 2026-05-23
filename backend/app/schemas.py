"""Pydantic schemas for API requests and responses."""

from typing import Optional

from pydantic import BaseModel, Field


class MacroInputsBase(BaseModel):
    """Base macro inputs schema."""

    # Currency
    reer: float = Field(..., ge=70, le=120, description="Real Effective Exchange Rate")
    usdinr: float = Field(..., ge=70, le=120, description="USD/INR exchange rate")
    dxy: float = Field(..., ge=80, le=130, description="Dollar Index")

    # Inflation
    india_cpi: float = Field(..., ge=0, le=10, description="India CPI")
    us_cpi: float = Field(..., ge=0, le=10, description="US CPI")

    # Interest Rates
    repo_rate: float = Field(..., ge=2, le=10, description="RBI Repo Rate")
    fed_funds: float = Field(..., ge=0, le=8, description="Fed Funds Rate")

    # Growth
    india_gdp: float = Field(..., ge=0, le=10, description="India GDP growth")
    us_gdp: float = Field(..., ge=-2, le=6, description="US GDP growth")

    # Oil
    brent: float = Field(..., ge=40, le=180, description="Brent crude oil price")

    # Capital Flows
    fpi: float = Field(..., ge=-50, le=50, description="Foreign Portfolio Investment (B USD)")
    fdi: float = Field(..., ge=0, le=100, description="Foreign Direct Investment (B USD)")
    bond_inflows: float = Field(..., ge=-20, le=50, description="Bond inflows (B USD)")

    # External Sector
    services_exports: float = Field(..., ge=100, le=700, description="Services exports")
    remittances: float = Field(..., ge=50, le=250, description="Remittances (B USD)")
    merchandise_deficit: float = Field(..., ge=100, le=500, description="Merchandise deficit")
    fx_reserves: float = Field(..., ge=300, le=900, description="FX reserves (B USD)")
    forward_book: float = Field(..., ge=0, le=25, description="Forward book (%)")


class MacroInputsRequest(MacroInputsBase):
    """Request model for macro inputs."""

    pass


class ScoreCalculationResponse(BaseModel):
    """Response model for score calculation."""

    macro_score: float = Field(..., ge=0, le=100)
    inr_outlook: str = Field(..., description="bullish, neutral, or bearish")
    risk_level: str = Field(..., description="low, medium, or high")
    inr_range_low: float
    inr_range_high: float
    score_breakdown: dict = Field(default_factory=dict)
    factor_contributions: dict = Field(default_factory=dict)


class AllocationResponse(BaseModel):
    """Response model for allocation."""

    equity: float = Field(..., ge=0, le=100)
    bond: float = Field(..., ge=0, le=100)
    gold: float = Field(..., ge=0, le=100)
    usd: float = Field(..., ge=0, le=100)


class FullAnalysisResponse(BaseModel):
    """Full analysis response combining score and allocation."""

    macro_inputs: MacroInputsBase
    score_response: ScoreCalculationResponse
    allocation: AllocationResponse


class ScenarioCreate(BaseModel):
    """Schema for creating a scenario."""

    name: str
    description: Optional[str] = None
    scenario_type: str
    macro_inputs: MacroInputsBase


class ScenarioUpdate(BaseModel):
    """Schema for updating a scenario."""

    name: Optional[str] = None
    description: Optional[str] = None
    is_favourite: Optional[bool] = None


class ScenarioResponse(BaseModel):
    """Schema for scenario response."""

    id: int
    name: str
    description: Optional[str]
    scenario_type: str
    macro_inputs: dict
    macro_score: float
    inr_outlook: str
    risk_level: str
    inr_range_low: float
    inr_range_high: float
    allocation: dict
    factor_scores: dict
    is_favourite: bool
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class SimulationRequest(BaseModel):
    """Request model for Monte Carlo simulation."""

    base_macro_inputs: MacroInputsBase
    num_simulations: int = Field(default=10000, ge=1000, le=100000)
    randomize_factors: list[str] = Field(
        default=[
            "brent",
            "india_gdp",
            "india_cpi",
            "fpi",
            "dxy",
            "fx_reserves",
        ]
    )


class SimulationResponse(BaseModel):
    """Response model for simulation results."""

    simulation_id: str
    num_simulations: int
    prob_inr_above_100: float
    prob_inr_below_90: float
    expected_macro_score: float
    expected_volatility: float
    inr_p10: float
    inr_p50: float
    inr_p90: float
    score_p10: float
    score_p50: float
    score_p90: float
    expected_allocation: AllocationResponse
    inr_distribution: dict
    macro_score_distribution: dict


class AIInsightRequest(BaseModel):
    """Request model for AI insights."""

    macro_inputs: MacroInputsBase
    macro_score: float
    allocation: AllocationResponse


class AIInsightResponse(BaseModel):
    """Response model for AI insights."""

    positive_drivers: str
    negative_drivers: str
    inr_outlook: str
    equity_outlook: str
    bond_outlook: str
    key_risks: str
    monitoring_points: str
