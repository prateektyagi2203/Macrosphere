"""Scenario management API endpoints."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.engines import MacroScoreEngine, ScenarioEngine, AllocationEngine
from app.models import Scenario
from app.schemas import (
    MacroInputsBase,
    ScenarioCreate,
    ScenarioResponse,
    ScenarioUpdate,
)

router = APIRouter(prefix="/api/v1/scenarios", tags=["scenarios"])
logger = logging.getLogger(__name__)

# Initialize engines
score_engine = MacroScoreEngine()
scenario_engine = ScenarioEngine()
allocation_engine = AllocationEngine()


@router.get("/preloaded")
async def list_preloaded_scenarios():
    """List all preloaded scenarios.

    Returns:
        Dictionary of preloaded scenarios
    """
    return scenario_engine.list_preloaded_scenarios()


@router.get("/preloaded/{scenario_key}")
async def get_preloaded_scenario(scenario_key: str):
    """Get a specific preloaded scenario.

    Args:
        scenario_key: Scenario key (e.g., 'base_case', 'bull_case')

    Returns:
        Scenario with macro inputs

    Raises:
        HTTPException: If scenario not found
    """
    try:
        scenario = scenario_engine.get_preloaded_scenario(scenario_key)
        return scenario
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/load/{scenario_key}")
async def load_preloaded_scenario(scenario_key: str):
    """Load a preloaded scenario and calculate analysis.

    Args:
        scenario_key: Scenario key

    Returns:
        Full scenario analysis

    Raises:
        HTTPException: If scenario not found
    """
    try:
        scenario = scenario_engine.get_preloaded_scenario(scenario_key)
        macro_inputs = scenario["macro_inputs"]

        # Calculate score and allocation
        score, factor_scores = score_engine.calculate_score(macro_inputs)
        inr_outlook = score_engine.get_inr_outlook(score)
        risk_level = score_engine.get_risk_level(score)
        inr_low, inr_high = score_engine.calculate_inr_range(score, macro_inputs.get("usdinr", 97))

        allocation = allocation_engine.get_allocation_with_interpolation(score)
        factor_contributions = score_engine.get_factor_contributions(factor_scores)

        return {
            **scenario,
            "macro_score": score,
            "inr_outlook": inr_outlook,
            "risk_level": risk_level,
            "inr_range_low": inr_low,
            "inr_range_high": inr_high,
            "allocation": allocation,
            "factor_scores": factor_scores,
            "factor_contributions": factor_contributions,
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/create", response_model=ScenarioResponse)
async def create_custom_scenario(
    request: ScenarioCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create and save a custom scenario.

    Args:
        request: Scenario creation request
        db: Database session

    Returns:
        Created scenario response
    """
    macro_inputs = request.macro_inputs.model_dump()

    # Calculate analysis
    score, factor_scores = score_engine.calculate_score(macro_inputs)
    inr_outlook = score_engine.get_inr_outlook(score)
    risk_level = score_engine.get_risk_level(score)
    inr_low, inr_high = score_engine.calculate_inr_range(score, macro_inputs.get("usdinr", 97))

    allocation = allocation_engine.get_allocation_with_interpolation(score)
    factor_contributions = score_engine.get_factor_contributions(factor_scores)

    # Save to database
    db_scenario = Scenario(
        name=request.name,
        description=request.description,
        scenario_type=request.scenario_type,
        macro_inputs=macro_inputs,
        macro_score=score,
        inr_outlook=inr_outlook,
        risk_level=risk_level,
        inr_range_low=inr_low,
        inr_range_high=inr_high,
        allocation=allocation,
        factor_scores=factor_scores,
    )

    db.add(db_scenario)
    await db.commit()
    await db.refresh(db_scenario)

    return ScenarioResponse.model_validate(db_scenario)


@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(scenario_id: int, db: AsyncSession = Depends(get_db)):
    """Get a scenario by ID.

    Args:
        scenario_id: Scenario ID
        db: Database session

    Returns:
        Scenario response

    Raises:
        HTTPException: If scenario not found
    """
    query = select(Scenario).where(Scenario.id == scenario_id)
    result = await db.execute(query)
    scenario = result.scalar_one_or_none()

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    return ScenarioResponse.model_validate(scenario)


@router.get("", response_model=list[ScenarioResponse])
async def list_scenarios(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """List saved scenarios.

    Args:
        skip: Number of scenarios to skip
        limit: Maximum number of scenarios to return
        db: Database session

    Returns:
        List of scenarios
    """
    query = select(Scenario).offset(skip).limit(limit)
    result = await db.execute(query)
    scenarios = result.scalars().all()

    return [ScenarioResponse.model_validate(s) for s in scenarios]


@router.patch("/{scenario_id}", response_model=ScenarioResponse)
async def update_scenario(
    scenario_id: int,
    request: ScenarioUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a scenario.

    Args:
        scenario_id: Scenario ID
        request: Update request
        db: Database session

    Returns:
        Updated scenario

    Raises:
        HTTPException: If scenario not found
    """
    query = select(Scenario).where(Scenario.id == scenario_id)
    result = await db.execute(query)
    scenario = result.scalar_one_or_none()

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    if request.name is not None:
        scenario.name = request.name
    if request.description is not None:
        scenario.description = request.description
    if request.is_favourite is not None:
        scenario.is_favourite = request.is_favourite

    await db.commit()
    await db.refresh(scenario)

    return ScenarioResponse.model_validate(scenario)


@router.delete("/{scenario_id}")
async def delete_scenario(scenario_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a scenario.

    Args:
        scenario_id: Scenario ID
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If scenario not found
    """
    query = select(Scenario).where(Scenario.id == scenario_id)
    result = await db.execute(query)
    scenario = result.scalar_one_or_none()

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    await db.delete(scenario)
    await db.commit()

    return {"message": "Scenario deleted successfully"}
