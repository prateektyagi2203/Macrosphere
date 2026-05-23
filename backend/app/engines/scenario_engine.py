"""Scenario engine - Pre-loaded economic scenarios."""

from typing import Dict

# Pre-loaded scenarios inspired by JP Morgan and BlackRock frameworks
PRELOADED_SCENARIOS = {
    "base_case": {
        "name": "Base Case",
        "description": "Central case scenario with moderate growth and inflation",
        "scenario_type": "base_case",
        "macro_inputs": {
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
            "forward_book": 13,
        },
    },
    "bull_case": {
        "name": "Bull Case",
        "description": "Strong growth with positive capital flows and weak dollar",
        "scenario_type": "bull_case",
        "macro_inputs": {
            "reer": 82,
            "usdinr": 92,
            "dxy": 95,
            "india_cpi": 3.5,
            "us_cpi": 3.0,
            "repo_rate": 5.5,
            "fed_funds": 4.0,
            "india_gdp": 7.5,
            "us_gdp": 2.5,
            "brent": 80,
            "fpi": 25,
            "fdi": 65,
            "bond_inflows": 30,
            "services_exports": 500,
            "remittances": 155,
            "merchandise_deficit": 280,
            "fx_reserves": 750,
            "forward_book": 10,
        },
    },
    "bear_case": {
        "name": "Bear Case",
        "description": "Weak growth with capital outflows and strong dollar",
        "scenario_type": "bear_case",
        "macro_inputs": {
            "reer": 105,
            "usdinr": 105,
            "dxy": 115,
            "india_cpi": 5.5,
            "us_cpi": 3.5,
            "repo_rate": 7.0,
            "fed_funds": 5.5,
            "india_gdp": 5.0,
            "us_gdp": 1.5,
            "brent": 130,
            "fpi": -30,
            "fdi": 35,
            "bond_inflows": -10,
            "services_exports": 350,
            "remittances": 120,
            "merchandise_deficit": 380,
            "fx_reserves": 550,
            "forward_book": 16,
        },
    },
    "oil_shock": {
        "name": "Oil Shock",
        "description": "Sharp oil price spike affecting India's current account",
        "scenario_type": "oil_shock",
        "macro_inputs": {
            "reer": 95,
            "usdinr": 100,
            "dxy": 108,
            "india_cpi": 6.0,
            "us_cpi": 3.2,
            "repo_rate": 6.5,
            "fed_funds": 4.8,
            "india_gdp": 6.0,
            "us_gdp": 2.0,
            "brent": 160,
            "fpi": -15,
            "fdi": 45,
            "bond_inflows": 5,
            "services_exports": 420,
            "remittances": 135,
            "merchandise_deficit": 420,
            "fx_reserves": 600,
            "forward_book": 14,
        },
    },
    "fed_pivot": {
        "name": "Fed Pivot",
        "description": "Fed cuts rates aggressively with capital rotation to EM",
        "scenario_type": "fed_pivot",
        "macro_inputs": {
            "reer": 80,
            "usdinr": 88,
            "dxy": 92,
            "india_cpi": 4.0,
            "us_cpi": 2.5,
            "repo_rate": 5.5,
            "fed_funds": 2.5,
            "india_gdp": 7.0,
            "us_gdp": 2.5,
            "brent": 90,
            "fpi": 40,
            "fdi": 70,
            "bond_inflows": 35,
            "services_exports": 480,
            "remittances": 150,
            "merchandise_deficit": 300,
            "fx_reserves": 800,
            "forward_book": 8,
        },
    },
    "china_slowdown": {
        "name": "China Slowdown",
        "description": "Chinese economic deceleration impacts global demand and commodity prices",
        "scenario_type": "china_slowdown",
        "macro_inputs": {
            "reer": 92,
            "usdinr": 98,
            "dxy": 105,
            "india_cpi": 3.8,
            "us_cpi": 3.0,
            "repo_rate": 5.8,
            "fed_funds": 4.5,
            "india_gdp": 6.0,
            "us_gdp": 1.5,
            "brent": 75,
            "fpi": 10,
            "fdi": 48,
            "bond_inflows": 15,
            "services_exports": 400,
            "remittances": 132,
            "merchandise_deficit": 320,
            "fx_reserves": 670,
            "forward_book": 12,
        },
    },
    "global_recession": {
        "name": "Global Recession",
        "description": "Global growth collapses with risk-off sentiment",
        "scenario_type": "global_recession",
        "macro_inputs": {
            "reer": 108,
            "usdinr": 107,
            "dxy": 120,
            "india_cpi": 2.5,
            "us_cpi": 2.0,
            "repo_rate": 5.0,
            "fed_funds": 2.0,
            "india_gdp": 3.0,
            "us_gdp": -1.0,
            "brent": 60,
            "fpi": -45,
            "fdi": 25,
            "bond_inflows": -15,
            "services_exports": 300,
            "remittances": 110,
            "merchandise_deficit": 340,
            "fx_reserves": 450,
            "forward_book": 18,
        },
    },
    "election_boom": {
        "name": "Election Boom",
        "description": "Post-election fiscal stimulus driving growth and asset demand",
        "scenario_type": "election_boom",
        "macro_inputs": {
            "reer": 85,
            "usdinr": 94,
            "dxy": 100,
            "india_cpi": 4.5,
            "us_cpi": 3.0,
            "repo_rate": 6.0,
            "fed_funds": 4.5,
            "india_gdp": 8.0,
            "us_gdp": 2.2,
            "brent": 95,
            "fpi": 20,
            "fdi": 60,
            "bond_inflows": 25,
            "services_exports": 450,
            "remittances": 145,
            "merchandise_deficit": 310,
            "fx_reserves": 720,
            "forward_book": 11,
        },
    },
    "stagflation": {
        "name": "Stagflation",
        "description": "High inflation with low growth - 1970s style scenario",
        "scenario_type": "stagflation",
        "macro_inputs": {
            "reer": 110,
            "usdinr": 110,
            "dxy": 125,
            "india_cpi": 8.0,
            "us_cpi": 5.5,
            "repo_rate": 8.0,
            "fed_funds": 6.5,
            "india_gdp": 3.5,
            "us_gdp": 0.5,
            "brent": 150,
            "fpi": -40,
            "fdi": 30,
            "bond_inflows": -20,
            "services_exports": 350,
            "remittances": 120,
            "merchandise_deficit": 400,
            "fx_reserves": 500,
            "forward_book": 17,
        },
    },
}


class ScenarioEngine:
    """Manages economic scenarios."""

    @staticmethod
    def get_preloaded_scenario(scenario_key: str) -> Dict:
        """Get a preloaded scenario.

        Args:
            scenario_key: Scenario key (e.g., 'base_case', 'bull_case')

        Returns:
            Scenario dictionary with macro inputs

        Raises:
            ValueError: If scenario not found
        """
        if scenario_key not in PRELOADED_SCENARIOS:
            available = list(PRELOADED_SCENARIOS.keys())
            raise ValueError(
                f"Scenario '{scenario_key}' not found. Available: {available}"
            )
        return PRELOADED_SCENARIOS[scenario_key].copy()

    @staticmethod
    def list_preloaded_scenarios() -> Dict:
        """List all preloaded scenarios.

        Returns:
            Dictionary of scenario metadata
        """
        result = {}
        for key, scenario in PRELOADED_SCENARIOS.items():
            result[key] = {
                "name": scenario["name"],
                "description": scenario["description"],
                "scenario_type": scenario["scenario_type"],
            }
        return result

    @staticmethod
    def create_custom_scenario(
        name: str,
        description: str,
        macro_inputs: Dict,
    ) -> Dict:
        """Create a custom scenario.

        Args:
            name: Scenario name
            description: Scenario description
            macro_inputs: Macro inputs dictionary

        Returns:
            Custom scenario dictionary
        """
        return {
            "name": name,
            "description": description,
            "scenario_type": "custom",
            "macro_inputs": macro_inputs,
        }

    @staticmethod
    def interpolate_scenarios(scenario1: Dict, scenario2: Dict, weight: float) -> Dict:
        """Interpolate between two scenarios.

        Args:
            scenario1: First scenario
            scenario2: Second scenario
            weight: Weight for scenario2 (0 to 1)

        Returns:
            Interpolated macro inputs
        """
        inputs1 = scenario1["macro_inputs"]
        inputs2 = scenario2["macro_inputs"]

        result = {}
        for key in inputs1.keys():
            val1 = inputs1.get(key, 0)
            val2 = inputs2.get(key, 0)
            result[key] = val1 * (1 - weight) + val2 * weight

        return result
