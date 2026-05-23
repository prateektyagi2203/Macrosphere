"""Tests for allocation and scenario engines."""

import pytest

from app.engines.allocation_engine import AllocationEngine
from app.engines.scenario_engine import PRELOADED_SCENARIOS, ScenarioEngine


class TestAllocationEngine:
    """Test allocation engine."""

    def test_allocation_bearish(self):
        """Test allocation for bearish score."""
        alloc = AllocationEngine.get_allocation(25)
        assert alloc["equity"] == 20
        assert alloc["bond"] == 20
        assert alloc["gold"] == 30
        assert alloc["usd"] == 30

    def test_allocation_bullish(self):
        """Test allocation for bullish score."""
        alloc = AllocationEngine.get_allocation(75)
        assert alloc["equity"] == 65
        assert alloc["bond"] == 25
        assert alloc["gold"] == 5
        assert alloc["usd"] == 5

    def test_allocation_neutral(self):
        """Test allocation for neutral score."""
        alloc = AllocationEngine.get_allocation(55)
        assert alloc["equity"] == 50
        assert alloc["bond"] == 30
        assert alloc["gold"] == 10
        assert alloc["usd"] == 10

    def test_allocation_interpolation(self):
        """Test smooth allocation interpolation."""
        alloc = AllocationEngine.get_allocation_with_interpolation(60)
        total = sum(alloc.values())
        assert abs(total - 100) < 0.1

    def test_allocation_validation(self):
        """Test allocation validation."""
        valid_alloc = {"equity": 50, "bond": 30, "gold": 10, "usd": 10}
        assert AllocationEngine.validate_allocation(valid_alloc)

        invalid_alloc = {"equity": 50, "bond": 30, "gold": 10, "usd": 5}
        assert not AllocationEngine.validate_allocation(invalid_alloc)


class TestScenarioEngine:
    """Test scenario engine."""

    def test_preloaded_scenarios_exist(self):
        """Test that preloaded scenarios are available."""
        scenarios = ScenarioEngine.list_preloaded_scenarios()
        assert "base_case" in scenarios
        assert "bull_case" in scenarios
        assert "bear_case" in scenarios
        assert "oil_shock" in scenarios
        assert "fed_pivot" in scenarios

    def test_get_preloaded_scenario(self):
        """Test retrieving a preloaded scenario."""
        scenario = ScenarioEngine.get_preloaded_scenario("base_case")
        assert scenario["name"] == "Base Case"
        assert "macro_inputs" in scenario

    def test_invalid_scenario_raises(self):
        """Test that invalid scenario raises error."""
        with pytest.raises(ValueError):
            ScenarioEngine.get_preloaded_scenario("invalid_scenario")

    def test_create_custom_scenario(self):
        """Test creating custom scenario."""
        inputs = {
            "reer": 90,
            "usdinr": 98,
            "dxy": 105,
            "india_cpi": 4.0,
            "us_cpi": 3.0,
            "repo_rate": 6.0,
            "fed_funds": 4.5,
            "india_gdp": 6.5,
            "us_gdp": 2.0,
            "brent": 100,
            "fpi": -5,
            "fdi": 50,
            "bond_inflows": 15,
            "services_exports": 420,
            "remittances": 135,
            "merchandise_deficit": 330,
            "fx_reserves": 650,
            "forward_book": 13,
        }

        scenario = ScenarioEngine.create_custom_scenario(
            "My Scenario",
            "Test scenario",
            inputs,
        )

        assert scenario["name"] == "My Scenario"
        assert scenario["scenario_type"] == "custom"

    def test_scenario_interpolation(self):
        """Test scenario interpolation."""
        scenario1 = ScenarioEngine.get_preloaded_scenario("base_case")
        scenario2 = ScenarioEngine.get_preloaded_scenario("bull_case")

        interpolated = ScenarioEngine.interpolate_scenarios(scenario1, scenario2, 0.5)

        # Check that values are between the two scenarios
        for key in scenario1["macro_inputs"].keys():
            val1 = scenario1["macro_inputs"][key]
            val2 = scenario2["macro_inputs"][key]
            inter_val = interpolated[key]

            assert min(val1, val2) <= inter_val <= max(val1, val2)

    def test_all_preloaded_scenarios_have_valid_inputs(self):
        """Test that all preloaded scenarios have valid macro inputs."""
        required_inputs = [
            "reer",
            "usdinr",
            "dxy",
            "india_cpi",
            "us_cpi",
            "repo_rate",
            "fed_funds",
            "india_gdp",
            "us_gdp",
            "brent",
            "fpi",
            "fdi",
            "bond_inflows",
            "services_exports",
            "remittances",
            "merchandise_deficit",
            "fx_reserves",
        ]

        scenarios = ScenarioEngine.list_preloaded_scenarios()

        for scenario_key in scenarios.keys():
            scenario = ScenarioEngine.get_preloaded_scenario(scenario_key)
            for input_key in required_inputs:
                assert input_key in scenario["macro_inputs"]
