"""Scenario and ScenarioResult models."""

from typing import Optional

from sqlalchemy import JSON, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Scenario(Base, TimestampMixin):
    """Stored scenario with macro inputs and results."""

    __tablename__ = "scenarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    scenario_type: Mapped[str] = mapped_column(
        String(50)
    )  # base_case, bull_case, bear_case, custom, etc.

    # Macro inputs (stored as JSON)
    macro_inputs: Mapped[dict] = mapped_column(JSON)

    # Computed results
    macro_score: Mapped[float] = mapped_column(Float)
    inr_outlook: Mapped[str] = mapped_column(String(20))  # bullish, neutral, bearish
    risk_level: Mapped[str] = mapped_column(String(20))  # low, medium, high
    inr_range_low: Mapped[float] = mapped_column(Float)
    inr_range_high: Mapped[float] = mapped_column(Float)

    # Allocation (stored as JSON)
    allocation: Mapped[dict] = mapped_column(JSON)

    # Factor analysis (stored as JSON)
    factor_scores: Mapped[dict] = mapped_column(JSON)

    # User ID (optional, for future multi-user support)
    user_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)

    is_favourite: Mapped[bool] = mapped_column(default=False)

    def __repr__(self) -> str:
        return f"<Scenario {self.name} ({self.scenario_type})>"


class ScenarioResult(Base, TimestampMixin):
    """Stores scenario analysis results and AI insights."""

    __tablename__ = "scenario_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scenario_id: Mapped[int] = mapped_column(Integer, index=True)
    scenario_name: Mapped[str] = mapped_column(String(255))

    # AI Insights
    positive_drivers: Mapped[str] = mapped_column(Text)
    negative_drivers: Mapped[str] = mapped_column(Text)
    inr_outlook_analysis: Mapped[str] = mapped_column(Text)
    equity_outlook_analysis: Mapped[str] = mapped_column(Text)
    bond_outlook_analysis: Mapped[str] = mapped_column(Text)
    key_risks: Mapped[str] = mapped_column(Text)
    monitoring_points: Mapped[str] = mapped_column(Text)

    # Full AI response
    full_analysis: Mapped[str] = mapped_column(Text)

    def __repr__(self) -> str:
        return f"<ScenarioResult for scenario {self.scenario_id}>"
