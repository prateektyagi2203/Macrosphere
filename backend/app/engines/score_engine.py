"""Macro scoring engine - Core quantitative analysis module.

This module implements institutional-grade factor analysis used by
major asset managers. Inspired by JP Morgan quantitative research
and Bloomberg macro analytics frameworks.
"""

from dataclasses import dataclass
from typing import Dict, Tuple

import numpy as np


@dataclass
class ScoringWeights:
    """Factor weights for macro score calculation."""

    reer: float = 0.15
    inflation_diff: float = 0.10
    real_rate_diff: float = 0.10
    gdp_diff: float = 0.10
    oil_risk: float = 0.10
    current_account: float = 0.10
    fpi_momentum: float = 0.10
    fdi_strength: float = 0.05
    bond_inflows: float = 0.05
    fx_reserves: float = 0.10
    dxy: float = 0.05

    def __post_init__(self):
        """Validate weights sum to 1.0."""
        total = sum(
            [
                self.reer,
                self.inflation_diff,
                self.real_rate_diff,
                self.gdp_diff,
                self.oil_risk,
                self.current_account,
                self.fpi_momentum,
                self.fdi_strength,
                self.bond_inflows,
                self.fx_reserves,
                self.dxy,
            ]
        )
        assert abs(total - 1.0) < 0.001, f"Weights must sum to 1.0, got {total}"


class FactorAnalyzer:
    """Analyzes individual macro factors on -3 to +3 scale."""

    @staticmethod
    def analyze_reer(reer: float) -> float:
        """REER analysis: lower is more competitive for exports.

        Args:
            reer: Real Effective Exchange Rate (70-120)

        Returns:
            Factor score (-3 to +3)
        """
        # Below 80 is very bullish for INR
        if reer < 80:
            return 2.5
        elif reer < 85:
            return 2.0
        elif reer < 88:
            return 1.0
        elif reer < 92:
            return 0.5
        elif reer < 95:
            return -0.5
        elif reer < 100:
            return -1.0
        elif reer < 110:
            return -2.0
        else:
            return -3.0

    @staticmethod
    def analyze_inflation_differential(india_cpi: float, us_cpi: float) -> float:
        """Inflation differential analysis.

        Higher India CPI relative to US is bearish for INR.

        Args:
            india_cpi: India CPI (0-10)
            us_cpi: US CPI (0-10)

        Returns:
            Factor score (-3 to +3)
        """
        diff = india_cpi - us_cpi
        if diff < -1:
            return 2.5  # India much lower inflation - bullish
        elif diff < 0:
            return 1.5
        elif diff < 1:
            return 0.5
        elif diff < 2:
            return -0.5
        elif diff < 3:
            return -1.5
        else:
            return -3.0

    @staticmethod
    def analyze_real_rate_differential(
        repo_rate: float, india_cpi: float, fed_funds: float, us_cpi: float
    ) -> float:
        """Real interest rate differential analysis.

        Higher real rates in India attract foreign capital.

        Args:
            repo_rate: RBI Repo Rate (2-10)
            india_cpi: India CPI (0-10)
            fed_funds: Fed Funds Rate (0-8)
            us_cpi: US CPI (0-10)

        Returns:
            Factor score (-3 to +3)
        """
        india_real_rate = repo_rate - india_cpi
        us_real_rate = fed_funds - us_cpi

        diff = india_real_rate - us_real_rate
        if diff > 3:
            return 3.0  # Very attractive Indian rates
        elif diff > 2:
            return 2.0
        elif diff > 1:
            return 1.0
        elif diff > -1:
            return 0.0
        elif diff > -2:
            return -1.0
        elif diff > -3:
            return -2.0
        else:
            return -3.0

    @staticmethod
    def analyze_gdp_differential(india_gdp: float, us_gdp: float) -> float:
        """GDP growth differential analysis.

        Higher India growth relative to US is bullish for INR assets.

        Args:
            india_gdp: India GDP growth (0-10)
            us_gdp: US GDP growth (-2 to 6)

        Returns:
            Factor score (-3 to +3)
        """
        diff = india_gdp - us_gdp
        if diff > 4:
            return 3.0
        elif diff > 3:
            return 2.0
        elif diff > 2:
            return 1.5
        elif diff > 1:
            return 0.5
        elif diff > -1:
            return 0.0
        elif diff > -2:
            return -1.0
        else:
            return -2.5

    @staticmethod
    def analyze_oil_risk(brent: float) -> float:
        """Oil price risk analysis.

        India is a net oil importer - high oil prices hurt CAD and INR.

        Args:
            brent: Brent crude oil price (40-180 USD/bbl)

        Returns:
            Factor score (-3 to +3)
        """
        if brent < 50:
            return 2.5  # Very bullish for India
        elif brent < 70:
            return 2.0
        elif brent < 85:
            return 1.0
        elif brent < 100:
            return 0.0
        elif brent < 115:
            return -1.0
        elif brent < 130:
            return -2.0
        else:
            return -3.0

    @staticmethod
    def analyze_current_account(
        services_exports: float, remittances: float, merchandise_deficit: float
    ) -> float:
        """Current account strength analysis.

        Services exports and remittances are credit flows.
        High merchandise deficit is debit flow.

        Args:
            services_exports: Services exports (100-700)
            remittances: Remittances B USD (50-250)
            merchandise_deficit: Merchandise deficit (100-500)

        Returns:
            Factor score (-3 to +3)
        """
        # Approximate current account proxy
        credit_flows = services_exports + remittances
        net_ca = (credit_flows - merchandise_deficit) / 100  # Normalize

        if net_ca > 80:
            return 2.5
        elif net_ca > 60:
            return 2.0
        elif net_ca > 40:
            return 1.0
        elif net_ca > 20:
            return 0.0
        elif net_ca > 0:
            return -0.5
        elif net_ca > -20:
            return -1.0
        else:
            return -2.5

    @staticmethod
    def analyze_fpi_momentum(fpi: float) -> float:
        """FPI flow momentum analysis.

        Positive FPI is bullish, negative FPI is bearish for INR.

        Args:
            fpi: Foreign Portfolio Investment (-50 to +50 B USD)

        Returns:
            Factor score (-3 to +3)
        """
        if fpi > 30:
            return 3.0
        elif fpi > 15:
            return 2.0
        elif fpi > 5:
            return 1.0
        elif fpi > -5:
            return 0.0
        elif fpi > -15:
            return -1.0
        elif fpi > -30:
            return -2.0
        else:
            return -3.0

    @staticmethod
    def analyze_fdi_strength(fdi: float) -> float:
        """FDI strength analysis.

        FDI is more stable than FPI. Higher FDI supports INR.

        Args:
            fdi: Foreign Direct Investment (0-100 B USD)

        Returns:
            Factor score (-3 to +3)
        """
        if fdi > 70:
            return 2.5
        elif fdi > 55:
            return 2.0
        elif fdi > 40:
            return 1.0
        elif fdi > 30:
            return 0.0
        elif fdi > 20:
            return -1.0
        elif fdi > 10:
            return -1.5
        else:
            return -2.5

    @staticmethod
    def analyze_bond_inflows(bond_inflows: float) -> float:
        """Bond inflow analysis.

        Positive inflows indicate strong foreign appetite for Indian debt.

        Args:
            bond_inflows: Bond inflows (-20 to +50 B USD)

        Returns:
            Factor score (-3 to +3)
        """
        if bond_inflows > 40:
            return 2.5
        elif bond_inflows > 25:
            return 2.0
        elif bond_inflows > 10:
            return 1.0
        elif bond_inflows > 0:
            return 0.0
        elif bond_inflows > -10:
            return -1.0
        elif bond_inflows > -15:
            return -2.0
        else:
            return -3.0

    @staticmethod
    def analyze_fx_reserves(fx_reserves: float) -> float:
        """FX reserves analysis.

        Higher FX reserves indicate stronger balance sheet and INR stability.

        Args:
            fx_reserves: FX reserves (300-900 B USD)

        Returns:
            Factor score (-3 to +3)
        """
        if fx_reserves > 800:
            return 2.5
        elif fx_reserves > 700:
            return 2.0
        elif fx_reserves > 600:
            return 1.0
        elif fx_reserves > 500:
            return 0.5
        elif fx_reserves > 400:
            return -0.5
        elif fx_reserves > 350:
            return -1.0
        else:
            return -2.5

    @staticmethod
    def analyze_dxy(dxy: float) -> float:
        """Dollar index analysis.

        Strong dollar (high DXY) is bearish for INR and EM.

        Args:
            dxy: Dollar Index (80-130)

        Returns:
            Factor score (-3 to +3)
        """
        if dxy < 90:
            return 2.5
        elif dxy < 95:
            return 2.0
        elif dxy < 100:
            return 1.0
        elif dxy < 105:
            return 0.0
        elif dxy < 110:
            return -1.0
        elif dxy < 115:
            return -2.0
        else:
            return -3.0


class MacroScoreEngine:
    """Main scoring engine for macro analysis."""

    def __init__(self, weights: ScoringWeights = None):
        """Initialize scoring engine.

        Args:
            weights: Optional custom weights for factors
        """
        self.weights = weights or ScoringWeights()
        self.analyzer = FactorAnalyzer()

    def calculate_score(self, macro_inputs: Dict) -> Tuple[float, Dict]:
        """Calculate macro score and factor contributions.

        Args:
            macro_inputs: Dictionary of macro inputs

        Returns:
            Tuple of (macro_score: 0-100, factor_scores: Dict)
        """
        # Extract inputs with defaults
        reer = macro_inputs.get("reer", 88)
        usdinr = macro_inputs.get("usdinr", 97)
        dxy = macro_inputs.get("dxy", 103)
        india_cpi = macro_inputs.get("india_cpi", 4)
        us_cpi = macro_inputs.get("us_cpi", 3)
        repo_rate = macro_inputs.get("repo_rate", 6)
        fed_funds = macro_inputs.get("fed_funds", 4.5)
        india_gdp = macro_inputs.get("india_gdp", 6.5)
        us_gdp = macro_inputs.get("us_gdp", 2)
        brent = macro_inputs.get("brent", 100)
        fpi = macro_inputs.get("fpi", -10)
        fdi = macro_inputs.get("fdi", 50)
        bond_inflows = macro_inputs.get("bond_inflows", 10)
        services_exports = macro_inputs.get("services_exports", 420)
        remittances = macro_inputs.get("remittances", 135)
        merchandise_deficit = macro_inputs.get("merchandise_deficit", 330)
        fx_reserves = macro_inputs.get("fx_reserves", 650)

        # Calculate individual factor scores (-3 to +3)
        factor_scores = {
            "reer": self.analyzer.analyze_reer(reer),
            "inflation_differential": self.analyzer.analyze_inflation_differential(
                india_cpi, us_cpi
            ),
            "real_rate_differential": self.analyzer.analyze_real_rate_differential(
                repo_rate, india_cpi, fed_funds, us_cpi
            ),
            "gdp_differential": self.analyzer.analyze_gdp_differential(india_gdp, us_gdp),
            "oil_risk": self.analyzer.analyze_oil_risk(brent),
            "current_account": self.analyzer.analyze_current_account(
                services_exports, remittances, merchandise_deficit
            ),
            "fpi_momentum": self.analyzer.analyze_fpi_momentum(fpi),
            "fdi_strength": self.analyzer.analyze_fdi_strength(fdi),
            "bond_inflows": self.analyzer.analyze_bond_inflows(bond_inflows),
            "fx_reserves": self.analyzer.analyze_fx_reserves(fx_reserves),
            "dxy": self.analyzer.analyze_dxy(dxy),
        }

        # Calculate weighted score
        weighted_sum = (
            factor_scores["reer"] * self.weights.reer
            + factor_scores["inflation_differential"] * self.weights.inflation_diff
            + factor_scores["real_rate_differential"] * self.weights.real_rate_diff
            + factor_scores["gdp_differential"] * self.weights.gdp_diff
            + factor_scores["oil_risk"] * self.weights.oil_risk
            + factor_scores["current_account"] * self.weights.current_account
            + factor_scores["fpi_momentum"] * self.weights.fpi_momentum
            + factor_scores["fdi_strength"] * self.weights.fdi_strength
            + factor_scores["bond_inflows"] * self.weights.bond_inflows
            + factor_scores["fx_reserves"] * self.weights.fx_reserves
            + factor_scores["dxy"] * self.weights.dxy
        )

        # Normalize from -3 to +3 scale to 0-100 scale
        # -3 -> 0, 0 -> 50, +3 -> 100
        macro_score = 50 + (weighted_sum / 3.0) * 50
        macro_score = max(0, min(100, macro_score))

        return macro_score, factor_scores

    def get_inr_outlook(self, score: float) -> str:
        """Get INR outlook from score.

        Args:
            score: Macro score (0-100)

        Returns:
            Outlook: "bearish", "neutral", or "bullish"
        """
        if score >= 65:
            return "bullish"
        elif score >= 51:
            return "neutral"
        else:
            return "bearish"

    def get_risk_level(self, score: float) -> str:
        """Get risk level from score.

        Args:
            score: Macro score (0-100)

        Returns:
            Risk level: "low", "medium", or "high"
        """
        if score >= 65:
            return "low"
        elif score >= 50:
            return "medium"
        else:
            return "high"

    def calculate_inr_range(
        self, score: float, usdinr_current: float = 97
    ) -> Tuple[float, float]:
        """Calculate INR range forecast.

        Args:
            score: Macro score (0-100)
            usdinr_current: Current USD/INR rate

        Returns:
            Tuple of (range_low, range_high)
        """
        # Score-based volatility and range
        if score >= 80:  # Strong bullish
            lower_bound = usdinr_current - 5
            upper_bound = usdinr_current - 2
        elif score >= 65:  # Bullish
            lower_bound = usdinr_current - 3
            upper_bound = usdinr_current + 1
        elif score >= 50:  # Neutral
            lower_bound = usdinr_current - 2
            upper_bound = usdinr_current + 2
        elif score >= 35:  # Bearish
            lower_bound = usdinr_current - 1
            upper_bound = usdinr_current + 3
        else:  # Strong bearish
            lower_bound = usdinr_current + 2
            upper_bound = usdinr_current + 5

        return round(lower_bound, 2), round(upper_bound, 2)

    def get_factor_contributions(
        self, factor_scores: Dict, normalize: bool = True
    ) -> Dict:
        """Calculate percentage contribution of each factor.

        Args:
            factor_scores: Dictionary of factor scores
            normalize: Whether to normalize to 100%

        Returns:
            Dictionary of factor contributions (percentage)
        """
        contributions = {}

        # Calculate absolute weighted contributions
        contributions["reer"] = abs(factor_scores["reer"]) * self.weights.reer * 100
        contributions["inflation_differential"] = (
            abs(factor_scores["inflation_differential"]) * self.weights.inflation_diff * 100
        )
        contributions["real_rate_differential"] = (
            abs(factor_scores["real_rate_differential"]) * self.weights.real_rate_diff * 100
        )
        contributions["gdp_differential"] = (
            abs(factor_scores["gdp_differential"]) * self.weights.gdp_diff * 100
        )
        contributions["oil_risk"] = abs(factor_scores["oil_risk"]) * self.weights.oil_risk * 100
        contributions["current_account"] = (
            abs(factor_scores["current_account"]) * self.weights.current_account * 100
        )
        contributions["fpi_momentum"] = (
            abs(factor_scores["fpi_momentum"]) * self.weights.fpi_momentum * 100
        )
        contributions["fdi_strength"] = (
            abs(factor_scores["fdi_strength"]) * self.weights.fdi_strength * 100
        )
        contributions["bond_inflows"] = (
            abs(factor_scores["bond_inflows"]) * self.weights.bond_inflows * 100
        )
        contributions["fx_reserves"] = (
            abs(factor_scores["fx_reserves"]) * self.weights.fx_reserves * 100
        )
        contributions["dxy"] = abs(factor_scores["dxy"]) * self.weights.dxy * 100

        if normalize:
            total = sum(contributions.values())
            if total > 0:
                contributions = {k: (v / total) * 100 for k, v in contributions.items()}

        # Sort by contribution
        contributions = dict(
            sorted(contributions.items(), key=lambda x: x[1], reverse=True)
        )

        return contributions
