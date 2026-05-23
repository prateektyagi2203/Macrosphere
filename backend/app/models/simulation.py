"""Monte Carlo simulation results model."""

from typing import Optional

from sqlalchemy import JSON, Float, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.models.base import Base, TimestampMixin


class SimulationResult(Base, TimestampMixin):
    """Stores Monte Carlo simulation results."""

    __tablename__ = "simulation_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    simulation_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    # Input parameters
    num_simulations: Mapped[int] = mapped_column(Integer)
    base_macro_inputs: Mapped[dict] = mapped_column(JSON)

    # Results
    prob_inr_above_100: Mapped[float] = mapped_column(Float)
    prob_inr_below_90: Mapped[float] = mapped_column(Float)
    expected_macro_score: Mapped[float] = mapped_column(Float)
    expected_volatility: Mapped[float] = mapped_column(Float)

    # Distribution data
    inr_distribution: Mapped[dict] = mapped_column(JSON)  # histogram bins
    macro_score_distribution: Mapped[dict] = mapped_column(JSON)

    # Confidence intervals
    inr_p10: Mapped[float] = mapped_column(Float)
    inr_p50: Mapped[float] = mapped_column(Float)
    inr_p90: Mapped[float] = mapped_column(Float)

    score_p10: Mapped[float] = mapped_column(Float)
    score_p50: Mapped[float] = mapped_column(Float)
    score_p90: Mapped[float] = mapped_column(Float)

    # Expected allocation
    expected_allocation: Mapped[dict] = mapped_column(JSON)

    # User ID (optional)
    user_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)

    def __repr__(self) -> str:
        return f"<SimulationResult {self.simulation_id}>"
