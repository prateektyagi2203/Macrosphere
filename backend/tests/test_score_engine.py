"""Tests for scoring engine."""

import pytest

from app.engines.score_engine import FactorAnalyzer, MacroScoreEngine, ScoringWeights


class TestFactorAnalyzer:
    """Test individual factor analysis."""

    def test_reer_analysis(self):
        """Test REER factor analysis."""
        assert FactorAnalyzer.analyze_reer(75) > 0  # Bullish
        assert FactorAnalyzer.analyze_reer(90) < 0.5  # Slightly bullish
        assert FactorAnalyzer.analyze_reer(115) < 0  # Bearish

    def test_inflation_differential(self):
        """Test inflation differential analysis."""
        assert FactorAnalyzer.analyze_inflation_differential(3, 3) > 0  # Equal inflation
        assert FactorAnalyzer.analyze_inflation_differential(5, 3) < 0  # Higher India inflation

    def test_oil_analysis(self):
        """Test oil price analysis."""
        assert FactorAnalyzer.analyze_oil_risk(60) > 0  # Low oil bullish
        assert FactorAnalyzer.analyze_oil_risk(140) < 0  # High oil bearish


class TestMacroScoreEngine:
    """Test main macro scoring engine."""

    def test_score_calculation_base_case(self):
        """Test score calculation with base case inputs."""
        engine = MacroScoreEngine()

        inputs = {
            "reer": 88,
            "usdinr": 97,
            "dxy": 103,
            "india_cpi": 4.0,
            "us_cpi": 3.0,
            "repo_rate": 6.0,
            "fed_funds": 4.5,
            "india_gdp": 6.5,
            "us_gdp": 2.0,
            "brent": 100,
            "fpi": -10,
            "fdi": 50,
            "bond_inflows": 10,
            "services_exports": 420,
            "remittances": 135,
            "merchandise_deficit": 330,
            "fx_reserves": 650,
        }

        score, factors = engine.calculate_score(inputs)

        assert 0 <= score <= 100
        assert len(factors) == 11
        assert all(v >= -3 and v <= 3 for v in factors.values())

    def test_inr_outlook_bullish(self):
        """Test INR outlook for bullish scenario."""
        engine = MacroScoreEngine()
        assert engine.get_inr_outlook(75) == "bullish"

    def test_inr_outlook_bearish(self):
        """Test INR outlook for bearish scenario."""
        engine = MacroScoreEngine()
        assert engine.get_inr_outlook(25) == "bearish"

    def test_inr_outlook_neutral(self):
        """Test INR outlook for neutral scenario."""
        engine = MacroScoreEngine()
        assert engine.get_inr_outlook(55) == "neutral"

    def test_risk_level_calculation(self):
        """Test risk level assignment."""
        engine = MacroScoreEngine()

        assert engine.get_risk_level(75) == "low"
        assert engine.get_risk_level(55) == "medium"
        assert engine.get_risk_level(25) == "high"

    def test_inr_range_calculation(self):
        """Test INR range forecast."""
        engine = MacroScoreEngine()

        range_low, range_high = engine.calculate_inr_range(75, 97)
        assert range_low < 97
        assert range_high < 97
        assert range_low < range_high

    def test_factor_contributions_sum(self):
        """Test that factor contributions sum to 100%."""
        engine = MacroScoreEngine()

        inputs = {
            "reer": 88,
            "usdinr": 97,
            "dxy": 103,
            "india_cpi": 4.0,
            "us_cpi": 3.0,
            "repo_rate": 6.0,
            "fed_funds": 4.5,
            "india_gdp": 6.5,
            "us_gdp": 2.0,
            "brent": 100,
            "fpi": -10,
            "fdi": 50,
            "bond_inflows": 10,
            "services_exports": 420,
            "remittances": 135,
            "merchandise_deficit": 330,
            "fx_reserves": 650,
        }

        score, factors = engine.calculate_score(inputs)
        contributions = engine.get_factor_contributions(factors)

        total = sum(contributions.values())
        assert abs(total - 100) < 0.1  # Allow small rounding error


@pytest.mark.asyncio
async def test_scoring_engine_with_extremes():
    """Test scoring engine with extreme inputs."""
    engine = MacroScoreEngine()

    # Bull case
    bull_inputs = {
        "reer": 75,
        "usdinr": 85,
        "dxy": 90,
        "india_cpi": 2.0,
        "us_cpi": 4.0,
        "repo_rate": 6.0,
        "fed_funds": 3.0,
        "india_gdp": 8.0,
        "us_gdp": 1.0,
        "brent": 50,
        "fpi": 40,
        "fdi": 80,
        "bond_inflows": 40,
        "services_exports": 500,
        "remittances": 160,
        "merchandise_deficit": 250,
        "fx_reserves": 800,
    }

    bull_score, _ = engine.calculate_score(bull_inputs)
    assert bull_score > 70  # Should be bullish

    # Bear case
    bear_inputs = {
        "reer": 115,
        "usdinr": 110,
        "dxy": 125,
        "india_cpi": 8.0,
        "us_cpi": 2.0,
        "repo_rate": 8.0,
        "fed_funds": 5.0,
        "india_gdp": 3.0,
        "us_gdp": 3.0,
        "brent": 150,
        "fpi": -40,
        "fdi": 30,
        "bond_inflows": -15,
        "services_exports": 300,
        "remittances": 110,
        "merchandise_deficit": 400,
        "fx_reserves": 500,
    }

    bear_score, _ = engine.calculate_score(bear_inputs)
    assert bear_score < 40  # Should be bearish
