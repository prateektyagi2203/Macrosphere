"""Allocation engine - Portfolio allocation based on macro score."""

from typing import Dict, Tuple


class AllocationEngine:
    """Determines optimal asset allocation based on macro score."""

    # Score bands and corresponding allocations
    ALLOCATION_RULES = {
        (0, 30): {"equity": 20, "bond": 20, "gold": 30, "usd": 30},  # Very bearish
        (30, 50): {"equity": 35, "bond": 25, "gold": 20, "usd": 20},  # Bearish
        (50, 70): {"equity": 50, "bond": 30, "gold": 10, "usd": 10},  # Neutral/Bullish
        (70, 100): {"equity": 65, "bond": 25, "gold": 5, "usd": 5},  # Strong bullish
    }

    @classmethod
    def get_allocation(cls, score: float) -> Dict[str, int]:
        """Get allocation based on macro score.

        Args:
            score: Macro score (0-100)

        Returns:
            Dictionary with allocation percentages
        """
        for (lower, upper), allocation in cls.ALLOCATION_RULES.items():
            if lower <= score < upper:
                return allocation.copy()

        # Default to strong bullish if score >= 100
        return cls.ALLOCATION_RULES[(70, 100)].copy()

    @classmethod
    def get_allocation_with_interpolation(cls, score: float) -> Dict[str, float]:
        """Get smooth allocation with interpolation between bands.

        Args:
            score: Macro score (0-100)

        Returns:
            Dictionary with interpolated allocation percentages
        """
        if score <= 30:
            return cls.ALLOCATION_RULES[(0, 30)].copy()
        elif score >= 70:
            return cls.ALLOCATION_RULES[(70, 100)].copy()
        elif 30 < score < 50:
            # Interpolate between bearish and neutral
            lower_alloc = cls.ALLOCATION_RULES[(0, 30)]
            upper_alloc = cls.ALLOCATION_RULES[(30, 50)]
            t = (score - 30) / 20  # 0 to 1
            return cls._interpolate(lower_alloc, upper_alloc, t)
        elif 50 <= score < 70:
            # Interpolate between neutral and bullish
            lower_alloc = cls.ALLOCATION_RULES[(30, 50)]
            upper_alloc = cls.ALLOCATION_RULES[(70, 100)]
            t = (score - 50) / 20  # 0 to 1
            return cls._interpolate(lower_alloc, upper_alloc, t)

    @staticmethod
    def _interpolate(
        lower: Dict[str, int], upper: Dict[str, int], t: float
    ) -> Dict[str, float]:
        """Linear interpolation between two allocations.

        Args:
            lower: Lower band allocation
            upper: Upper band allocation
            t: Interpolation factor (0 to 1)

        Returns:
            Interpolated allocation
        """
        result = {}
        for key in lower.keys():
            result[key] = lower[key] * (1 - t) + upper[key] * t
        return result

    @classmethod
    def validate_allocation(cls, allocation: Dict[str, float]) -> bool:
        """Validate that allocation sums to 100%.

        Args:
            allocation: Allocation dictionary

        Returns:
            True if valid, False otherwise
        """
        total = sum(allocation.values())
        return abs(total - 100) < 0.01  # Allow 0.01% rounding error

    @classmethod
    def get_allocation_description(cls, allocation: Dict[str, int]) -> str:
        """Get human-readable description of allocation.

        Args:
            allocation: Allocation dictionary

        Returns:
            Description string
        """
        parts = []
        for asset, pct in allocation.items():
            if pct > 0:
                parts.append(f"{asset.capitalize()} {pct}%")
        return ", ".join(parts)
