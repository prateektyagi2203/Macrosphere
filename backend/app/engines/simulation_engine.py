"""Monte Carlo simulation engine for macro scenario analysis."""

import uuid
from typing import Dict, List, Tuple

import numpy as np
from scipy import stats

from app.engines.allocation_engine import AllocationEngine
from app.engines.score_engine import MacroScoreEngine


class MonteCarloEngine:
    """Monte Carlo simulation for macro scenarios."""

    # Distribution parameters for randomization
    FACTOR_DISTRIBUTIONS = {
        "brent": {"mean": 100, "std": 20},
        "india_gdp": {"mean": 6.5, "std": 1.0},
        "india_cpi": {"mean": 4.0, "std": 0.8},
        "fpi": {"mean": -10, "std": 15},
        "dxy": {"mean": 103, "std": 8},
        "fx_reserves": {"mean": 650, "std": 50},
        "us_gdp": {"mean": 2.0, "std": 1.5},
        "fed_funds": {"mean": 4.5, "std": 1.0},
        "us_cpi": {"mean": 3.0, "std": 0.6},
        "repo_rate": {"mean": 6.0, "std": 0.8},
    }

    def __init__(self, score_engine: MacroScoreEngine = None):
        """Initialize Monte Carlo engine.

        Args:
            score_engine: Optional scoring engine instance
        """
        self.score_engine = score_engine or MacroScoreEngine()
        self.allocation_engine = AllocationEngine()

    def run_simulation(
        self,
        base_macro_inputs: Dict,
        num_simulations: int = 10000,
        randomize_factors: List[str] = None,
    ) -> Dict:
        """Run Monte Carlo simulation.

        Args:
            base_macro_inputs: Base scenario macro inputs
            num_simulations: Number of simulations to run
            randomize_factors: List of factors to randomize

        Returns:
            Simulation results dictionary
        """
        if randomize_factors is None:
            randomize_factors = [
                "brent",
                "india_gdp",
                "india_cpi",
                "fpi",
                "dxy",
                "fx_reserves",
            ]

        # Generate randomized scenarios
        scenarios = self._generate_scenarios(
            base_macro_inputs, num_simulations, randomize_factors
        )

        # Calculate macro scores and allocations for each scenario
        macro_scores = []
        inr_ranges = []
        allocations = []

        for scenario in scenarios:
            score, _ = self.score_engine.calculate_score(scenario)
            macro_scores.append(score)

            # Estimate INR range (simplified)
            usdinr = scenario.get("usdinr", 97)
            inr_low, inr_high = self.score_engine.calculate_inr_range(score, usdinr)
            inr_ranges.append((inr_low + inr_high) / 2)  # Use midpoint

            allocation = self.allocation_engine.get_allocation(score)
            allocations.append(allocation)

        macro_scores = np.array(macro_scores)
        inr_ranges = np.array(inr_ranges)

        # Calculate probabilities
        prob_inr_above_100 = np.mean(np.array(inr_ranges) > 100)
        prob_inr_below_90 = np.mean(np.array(inr_ranges) < 90)

        # Calculate percentiles
        inr_p10 = np.percentile(inr_ranges, 10)
        inr_p50 = np.percentile(inr_ranges, 50)
        inr_p90 = np.percentile(inr_ranges, 90)

        score_p10 = np.percentile(macro_scores, 10)
        score_p50 = np.percentile(macro_scores, 50)
        score_p90 = np.percentile(macro_scores, 90)

        # Calculate expected allocation
        expected_allocation = self._calculate_expected_allocation(allocations)

        # Create distribution histograms
        inr_hist = self._create_histogram(inr_ranges, bins=50)
        score_hist = self._create_histogram(macro_scores, bins=50)

        # Calculate volatility
        expected_volatility = float(np.std(macro_scores))

        simulation_id = str(uuid.uuid4())

        return {
            "simulation_id": simulation_id,
            "num_simulations": num_simulations,
            "prob_inr_above_100": float(prob_inr_above_100),
            "prob_inr_below_90": float(prob_inr_below_90),
            "expected_macro_score": float(np.mean(macro_scores)),
            "expected_volatility": expected_volatility,
            "inr_p10": float(inr_p10),
            "inr_p50": float(inr_p50),
            "inr_p90": float(inr_p90),
            "score_p10": float(score_p10),
            "score_p50": float(score_p50),
            "score_p90": float(score_p90),
            "expected_allocation": expected_allocation,
            "inr_distribution": inr_hist,
            "macro_score_distribution": score_hist,
            "base_macro_inputs": base_macro_inputs,
        }

    def _generate_scenarios(
        self,
        base_inputs: Dict,
        num_scenarios: int,
        randomize_factors: List[str],
    ) -> List[Dict]:
        """Generate randomized scenarios.

        Args:
            base_inputs: Base macro inputs
            num_scenarios: Number of scenarios to generate
            randomize_factors: Factors to randomize

        Returns:
            List of randomized scenarios
        """
        scenarios = []

        for _ in range(num_scenarios):
            scenario = base_inputs.copy()

            # Randomize specified factors with constraints
            for factor in randomize_factors:
                if factor in self.FACTOR_DISTRIBUTIONS:
                    dist = self.FACTOR_DISTRIBUTIONS[factor]
                    # Generate from normal distribution
                    value = np.random.normal(dist["mean"], dist["std"])

                    # Apply constraints based on factor type
                    if factor == "brent":
                        value = np.clip(value, 40, 180)
                    elif factor == "india_gdp":
                        value = np.clip(value, 0, 10)
                    elif factor == "india_cpi":
                        value = np.clip(value, 0, 10)
                    elif factor == "fpi":
                        value = np.clip(value, -50, 50)
                    elif factor == "dxy":
                        value = np.clip(value, 80, 130)
                    elif factor == "fx_reserves":
                        value = np.clip(value, 300, 900)
                    elif factor == "us_gdp":
                        value = np.clip(value, -2, 6)
                    elif factor == "fed_funds":
                        value = np.clip(value, 0, 8)
                    elif factor == "us_cpi":
                        value = np.clip(value, 0, 10)
                    elif factor == "repo_rate":
                        value = np.clip(value, 2, 10)

                    scenario[factor] = value

            scenarios.append(scenario)

        return scenarios

    @staticmethod
    def _create_histogram(data: np.ndarray, bins: int = 50) -> Dict:
        """Create histogram data for visualization.

        Args:
            data: Data array
            bins: Number of bins

        Returns:
            Dictionary with bin edges and counts
        """
        counts, bin_edges = np.histogram(data, bins=bins)

        return {
            "bins": [float((bin_edges[i] + bin_edges[i + 1]) / 2) for i in range(len(bin_edges) - 1)],
            "counts": counts.tolist(),
            "min": float(np.min(data)),
            "max": float(np.max(data)),
            "mean": float(np.mean(data)),
            "std": float(np.std(data)),
        }

    @staticmethod
    def _calculate_expected_allocation(allocations: List[Dict]) -> Dict:
        """Calculate expected allocation across all scenarios.

        Args:
            allocations: List of allocation dictionaries

        Returns:
            Expected allocation
        """
        if not allocations:
            return {"equity": 50, "bond": 30, "gold": 10, "usd": 10}

        assets = ["equity", "bond", "gold", "usd"]
        result = {}

        for asset in assets:
            values = [a.get(asset, 0) for a in allocations]
            result[asset] = round(np.mean(values), 2)

        return result
