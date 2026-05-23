"""Monte Carlo simulation API endpoints."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.engines import MonteCarloEngine
from app.models import SimulationResult
from app.schemas import SimulationRequest, SimulationResponse

router = APIRouter(prefix="/api/v1/simulations", tags=["simulations"])
logger = logging.getLogger(__name__)

# Initialize engine
simulation_engine = MonteCarloEngine()


@router.post("/run", response_model=SimulationResponse)
async def run_simulation(
    request: SimulationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Run Monte Carlo simulation.

    Args:
        request: Simulation request with base inputs and parameters
        db: Database session

    Returns:
        Simulation results
    """
    try:
        # Run simulation
        results = simulation_engine.run_simulation(
            base_macro_inputs=request.base_macro_inputs.model_dump(),
            num_simulations=request.num_simulations,
            randomize_factors=request.randomize_factors,
        )

        # Save to database
        db_result = SimulationResult(
            simulation_id=results["simulation_id"],
            num_simulations=results["num_simulations"],
            base_macro_inputs=results["base_macro_inputs"],
            prob_inr_above_100=results["prob_inr_above_100"],
            prob_inr_below_90=results["prob_inr_below_90"],
            expected_macro_score=results["expected_macro_score"],
            expected_volatility=results["expected_volatility"],
            inr_p10=results["inr_p10"],
            inr_p50=results["inr_p50"],
            inr_p90=results["inr_p90"],
            score_p10=results["score_p10"],
            score_p50=results["score_p50"],
            score_p90=results["score_p90"],
            expected_allocation=results["expected_allocation"],
            inr_distribution=results["inr_distribution"],
            macro_score_distribution=results["macro_score_distribution"],
        )

        db.add(db_result)
        await db.commit()
        await db.refresh(db_result)

        return SimulationResponse(**results)

    except Exception as e:
        logger.error(f"Simulation error: {e}")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    simulation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a previous simulation result.

    Args:
        simulation_id: Simulation ID
        db: Database session

    Returns:
        Simulation results

    Raises:
        HTTPException: If simulation not found
    """
    query = select(SimulationResult).where(SimulationResult.simulation_id == simulation_id)
    result = await db.execute(query)
    sim_result = result.scalar_one_or_none()

    if not sim_result:
        raise HTTPException(status_code=404, detail="Simulation not found")

    return SimulationResponse(
        simulation_id=sim_result.simulation_id,
        num_simulations=sim_result.num_simulations,
        prob_inr_above_100=sim_result.prob_inr_above_100,
        prob_inr_below_90=sim_result.prob_inr_below_90,
        expected_macro_score=sim_result.expected_macro_score,
        expected_volatility=sim_result.expected_volatility,
        inr_p10=sim_result.inr_p10,
        inr_p50=sim_result.inr_p50,
        inr_p90=sim_result.inr_p90,
        score_p10=sim_result.score_p10,
        score_p50=sim_result.score_p50,
        score_p90=sim_result.score_p90,
        expected_allocation=sim_result.expected_allocation,
        inr_distribution=sim_result.inr_distribution,
        macro_score_distribution=sim_result.macro_score_distribution,
    )


@router.get("", response_model=list[dict])
async def list_simulations(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List recent simulations.

    Args:
        skip: Number to skip
        limit: Max to return
        db: Database session

    Returns:
        List of simulations
    """
    query = (
        select(SimulationResult)
        .order_by(SimulationResult.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    simulations = result.scalars().all()

    return [
        {
            "simulation_id": s.simulation_id,
            "num_simulations": s.num_simulations,
            "expected_macro_score": s.expected_macro_score,
            "created_at": s.created_at.isoformat(),
        }
        for s in simulations
    ]
