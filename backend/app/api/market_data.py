"""Live market data API endpoint."""

import logging
from datetime import datetime
from typing import Optional

import yfinance as yf
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/market-data", tags=["market-data"])
logger = logging.getLogger(__name__)

# Hardcoded India macro fundamentals (updated monthly/quarterly)
# These move slowly — RBI/MoSPI data as of May 2026
INDIA_MACRO_DEFAULTS = {
    "india_cpi": 3.3,        # India CPI Apr 2026 (MoSPI)
    "repo_rate": 6.0,        # RBI Repo Rate (cut Apr 2026)
    "india_gdp": 6.5,        # IMF/NSO FY26 estimate
    "fpi": -5.0,             # FPI YTD 2026 (net outflows, B USD)
    "fdi": 50.0,             # FDI annualized (B USD)
    "bond_inflows": 8.0,     # FAR bond inflows YTD (B USD)
    "services_exports": 420.0,  # FY26 run-rate (B USD)
    "remittances": 125.0,    # FY26 RBI estimate (B USD)
    "merchandise_deficit": 250.0,  # FY26 trade deficit (B USD)
    "fx_reserves": 688.0,    # RBI weekly (B USD, May 2026)
    "forward_book": 65.0,    # RBI net forward book (B USD)
    "us_cpi": 2.4,           # US CPI Apr 2026 (BLS)
    "us_gdp": 2.0,           # US GDP Q1 2026 (BEA)
    "fed_funds": 4.5,        # FOMC target rate (May 2026)
    "reer": 105.0,           # India REER (RBI, Apr 2026 est.)
}

# Ticker symbols for live market data
TICKERS = {
    "usdinr": "USDINR=X",
    "dxy": "DX-Y.NYB",
    "brent": "BZ=F",
}


def _fetch_ticker_price(symbol: str) -> Optional[float]:
    """Fetch current price for a single yfinance ticker."""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="2d", interval="1d")
        if not hist.empty:
            price = float(hist["Close"].iloc[-1])
            logger.info(f"Fetched {symbol}: {price:.4f}")
            return price
    except Exception as e:
        logger.warning(f"Failed to fetch {symbol}: {e}")
    return None


@router.get("/live")
async def get_live_market_data():
    """Fetch live market prices and return merged macro inputs.

    Market data (USD/INR, DXY, Brent) is fetched from Yahoo Finance.
    Slower-moving macro indicators (CPI, GDP, rates, flows) use
    curated defaults updated monthly from RBI/MoSPI/BLS sources.

    Returns:
        Dict with all 18 macro input fields, plus metadata on
        which fields were fetched live vs from defaults.
    """
    market_data: dict[str, Optional[float]] = {}
    live_fields: list[str] = []
    fallback_fields: list[str] = []

    # Fetch live tickers
    for field, symbol in TICKERS.items():
        price = _fetch_ticker_price(symbol)
        if price is not None:
            market_data[field] = price
            live_fields.append(field)
        else:
            fallback_fields.append(field)

    # Fill fallback for any failed tickers using sensible defaults
    TICKER_DEFAULTS = {
        "usdinr": 84.5,
        "dxy": 99.0,
        "brent": 64.0,
    }
    for field in fallback_fields:
        market_data[field] = TICKER_DEFAULTS[field]

    # Merge with India macro defaults
    all_inputs = {**INDIA_MACRO_DEFAULTS, **market_data}

    return {
        "inputs": all_inputs,
        "live_fields": live_fields,
        "default_fields": fallback_fields + list(INDIA_MACRO_DEFAULTS.keys()),
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "sources": {
            "usdinr": "Yahoo Finance (USDINR=X)",
            "dxy": "Yahoo Finance (DX-Y.NYB)",
            "brent": "Yahoo Finance (BZ=F)",
            "india_cpi": "MoSPI (Apr 2026)",
            "repo_rate": "RBI (Apr 2026)",
            "india_gdp": "IMF/NSO FY26 estimate",
            "us_cpi": "BLS (Apr 2026)",
            "fed_funds": "FOMC (May 2026)",
            "fx_reserves": "RBI Weekly (May 2026)",
            "fpi": "NSDL YTD (2026)",
        },
    }
