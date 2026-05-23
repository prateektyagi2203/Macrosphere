"""Production-ready utility functions."""

from datetime import datetime
from typing import Dict, Any
import json
import csv
from io import StringIO


def format_number(value: float, decimals: int = 2) -> str:
    """Format number with thousand separators.
    
    Args:
        value: Number to format
        decimals: Decimal places
        
    Returns:
        Formatted string
    """
    return f"{value:,.{decimals}f}"


def get_score_label(score: float) -> str:
    """Get label for macro score.
    
    Args:
        score: Macro score (0-100)
        
    Returns:
        Label string
    """
    if score >= 80:
        return "Strong Bullish"
    elif score >= 65:
        return "Bullish"
    elif score >= 50:
        return "Neutral"
    elif score >= 35:
        return "Bearish"
    else:
        return "Strong Bearish"


def export_to_csv(data: Dict[str, Any]) -> str:
    """Export data to CSV format.
    
    Args:
        data: Data dictionary
        
    Returns:
        CSV string
    """
    output = StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow(data.keys())
    
    # Write values
    writer.writerow(data.values())
    
    return output.getvalue()


def export_to_json(data: Dict[str, Any]) -> str:
    """Export data to JSON format.
    
    Args:
        data: Data dictionary
        
    Returns:
        JSON string
    """
    return json.dumps(data, indent=2, default=str)


def get_timestamp() -> str:
    """Get current timestamp.
    
    Returns:
        ISO format timestamp
    """
    return datetime.utcnow().isoformat()


def calculate_percentage_change(old: float, new: float) -> float:
    """Calculate percentage change.
    
    Args:
        old: Old value
        new: New value
        
    Returns:
        Percentage change
    """
    if old == 0:
        return 0
    return ((new - old) / old) * 100


def get_color_for_value(value: float, threshold_low: float = 0, threshold_high: float = 100) -> str:
    """Get color based on value.
    
    Args:
        value: Value to evaluate
        threshold_low: Lower threshold
        threshold_high: Upper threshold
        
    Returns:
        Color code
    """
    if value >= threshold_high:
        return "green"
    elif value <= threshold_low:
        return "red"
    else:
        return "yellow"
