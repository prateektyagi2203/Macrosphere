"""Main analysis API endpoints."""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.engines import (
    AIInsightEngine,
    AllocationEngine,
    MacroScoreEngine,
    ScenarioEngine,
)
from app.models import Scenario
from app.schemas import (
    AIInsightRequest,
    AIInsightResponse,
    AllocationResponse,
    FullAnalysisResponse,
    MacroInputsRequest,
    ScoreCalculationResponse,
)

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])
logger = logging.getLogger(__name__)

# Initialize engines
score_engine = MacroScoreEngine()
allocation_engine = AllocationEngine()
ai_engine = AIInsightEngine()


@router.post("/calculate", response_model=ScoreCalculationResponse)
async def calculate_score(request: MacroInputsRequest):
    """Calculate macro score from inputs.

    Args:
        request: Macro inputs

    Returns:
        Score calculation response
        
    Raises:
        ValueError: If input validation fails
    """
    try:
        logger.info("Calculating macro score...")
        macro_inputs = request.model_dump()

        # Calculate score and factor contributions
        score, factor_scores = score_engine.calculate_score(macro_inputs)
        
        # Validate score is in range
        if not (0 <= score <= 100):
            logger.error(f"Invalid score calculated: {score}")
            raise ValueError(f"Score out of range: {score}")

        # Get outlooks
        inr_outlook = score_engine.get_inr_outlook(score)
        risk_level = score_engine.get_risk_level(score)
        inr_low, inr_high = score_engine.calculate_inr_range(score, macro_inputs.get("usdinr", 97))

        # Get factor contributions
        factor_contributions = score_engine.get_factor_contributions(factor_scores)

        logger.info(f"Score calculated successfully: {score:.2f}")
        
        return ScoreCalculationResponse(
            macro_score=score,
            inr_outlook=inr_outlook,
            risk_level=risk_level,
            inr_range_low=inr_low,
            inr_range_high=inr_high,
            score_breakdown=factor_scores,
            factor_contributions=factor_contributions,
        )
    except Exception as e:
        logger.error(f"Error calculating score: {str(e)}", exc_info=True)
        raise


@router.post("/allocation", response_model=AllocationResponse)
async def get_allocation(score: float):
    """Get allocation based on macro score.

    Args:
        score: Macro score (0-100)

    Returns:
        Allocation response
        
    Raises:
        ValueError: If score is out of valid range
    """
    try:
        if not (0 <= score <= 100):
            logger.warning(f"Invalid score provided: {score}")
            raise ValueError("Score must be between 0 and 100")
            
        logger.info(f"Getting allocation for score: {score:.2f}")
        allocation = allocation_engine.get_allocation_with_interpolation(score)
        
        # Validate allocation sums to 100
        total = sum(allocation.values())
        if not (99 <= total <= 101):
            logger.warning(f"Allocation sum invalid: {total}")
        
        logger.info("Allocation retrieved successfully")
        return AllocationResponse(**allocation)
    except Exception as e:
        logger.error(f"Error getting allocation: {str(e)}", exc_info=True)
        raise


@router.post("/full-analysis", response_model=FullAnalysisResponse)
async def run_full_analysis(
    request: MacroInputsRequest,
    db: AsyncSession = Depends(get_db),
):
    """Run complete analysis: score, allocation, and save scenario.

    Args:
        request: Macro inputs
        db: Database session

    Returns:
        Full analysis response
        
    Raises:
        ValueError: If analysis fails validation
    """
    try:
        logger.info("Running full analysis...")
        macro_inputs = request.model_dump()

        # Calculate score
        score, factor_scores = score_engine.calculate_score(macro_inputs)
        inr_outlook = score_engine.get_inr_outlook(score)
        risk_level = score_engine.get_risk_level(score)
        inr_low, inr_high = score_engine.calculate_inr_range(score, macro_inputs.get("usdinr", 97))

        factor_contributions = score_engine.get_factor_contributions(factor_scores)

        # Get allocation
        allocation = allocation_engine.get_allocation_with_interpolation(score)

        score_response = ScoreCalculationResponse(
            macro_score=score,
            inr_outlook=inr_outlook,
            risk_level=risk_level,
            inr_range_low=inr_low,
            inr_range_high=inr_high,
            score_breakdown=factor_scores,
            factor_contributions=factor_contributions,
        )

        allocation_response = AllocationResponse(**allocation)
        
        logger.info(f"Full analysis completed - Score: {score:.2f}, Outlook: {inr_outlook}")

        return FullAnalysisResponse(
            macro_inputs=request,
            score_response=score_response,
            allocation=allocation_response,
        )
    except Exception as e:
        logger.error(f"Error running full analysis: {str(e)}", exc_info=True)
        raise


@router.post("/ai-insights", response_model=AIInsightResponse)
async def generate_ai_insights(request: AIInsightRequest):
    """Generate AI-powered macro insights.

    Args:
        request: Macro inputs, score, and allocation

    Returns:
        AI insight response
    """
    insights = ai_engine.generate_insights(
        request.macro_inputs.model_dump(),
        request.macro_score,
        request.allocation.model_dump(),
    )

    return AIInsightResponse(**insights)


@router.get("/factors")
async def get_factor_reference():
    """Get reference on scoring factors.

    Returns:
        Factor documentation
    """
    return {
        "factors": {
            "reer": {
                "name": "Real Effective Exchange Rate",
                "weight": "15%",
                "description": "Measures INR competitiveness vs trading partners",
                "range": "70-120",
                "interpretation": "Lower = More competitive for exports",
            },
            "inflation_differential": {
                "name": "India vs US Inflation",
                "weight": "10%",
                "description": "PPP driver for exchange rates",
                "range": "-10 to 10",
                "interpretation": "Higher India inflation = INR bearish",
            },
            "real_rate_differential": {
                "name": "India vs US Real Rates",
                "weight": "10%",
                "description": "Capital flow attractor",
                "range": "-5 to 5",
                "interpretation": "Higher India real rates = INR bullish",
            },
            "gdp_differential": {
                "name": "India vs US Growth",
                "weight": "10%",
                "description": "Growth momentum differential",
                "range": "-2 to 8",
                "interpretation": "Higher India growth = INR bullish",
            },
            "oil_risk": {
                "name": "Brent Oil Price",
                "weight": "10%",
                "description": "Current account impact (India is net importer)",
                "range": "40-180 USD/bbl",
                "interpretation": "Higher oil = INR bearish (widens CAD)",
            },
            "current_account": {
                "name": "Current Account Strength",
                "weight": "10%",
                "description": "Services exports + remittances - merchandise deficit",
                "interpretation": "Stronger CA = INR bullish",
            },
            "fpi_momentum": {
                "name": "Foreign Portfolio Flows",
                "weight": "10%",
                "description": "Volatile but significant for asset prices",
                "range": "-50 to 50 B USD",
                "interpretation": "Positive flows = INR bullish",
            },
            "fdi_strength": {
                "name": "Foreign Direct Investment",
                "weight": "5%",
                "description": "More stable than FPI",
                "range": "0-100 B USD",
                "interpretation": "Higher FDI = INR bullish",
            },
            "bond_inflows": {
                "name": "Foreign Bond Inflows",
                "weight": "5%",
                "description": "Indicates appetite for Indian debt",
                "range": "-20 to 50 B USD",
                "interpretation": "Positive inflows = INR bullish",
            },
            "fx_reserves": {
                "name": "FX Reserves",
                "weight": "10%",
                "description": "Policy ammunition for RBI defense",
                "range": "300-900 B USD",
                "interpretation": "Higher reserves = INR bullish",
            },
            "dxy": {
                "name": "Dollar Index",
                "weight": "5%",
                "description": "Global dollar strength",
                "range": "80-130",
                "interpretation": "Higher DXY = INR bearish (strong dollar)",
            },
        },
        "score_bands": {
            "0-30": "Very Bearish",
            "31-50": "Bearish",
            "51-65": "Neutral",
            "66-80": "Bullish",
            "81-100": "Very Bullish",
        },
    }
