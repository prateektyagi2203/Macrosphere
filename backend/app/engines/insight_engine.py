"""AI-powered insights engine using OpenAI API."""

import logging
from typing import Dict

from openai import AsyncOpenAI, OpenAI

logger = logging.getLogger(__name__)


class AIInsightEngine:
    """Generates institutional-grade macro analysis using OpenAI."""

    SYSTEM_PROMPT = """You are a senior macro strategist at JP Morgan with 20 years of experience.
Your expertise covers Indian macroeconomics, currency markets, and portfolio strategy.

Analyze the provided macro inputs and financial metrics. Provide institutional-quality insights
on Indian macro dynamics, currency outlook, and asset allocation implications.

Keep analysis focused, analytical, and avoid retail investment advice. Use data to support claims.
Maximum 350 words. Structure your response with clear sections."""

    def __init__(self, api_key: str = None):
        """Initialize AI insight engine.

        Args:
            api_key: OpenAI API key (uses env var if not provided)
        """
        self._api_key = api_key
        self._client = None  # lazy init to avoid crash when key not set

    async def generate_insights_async(
        self,
        macro_inputs: Dict,
        macro_score: float,
        allocation: Dict,
    ) -> Dict[str, str]:
        """Generate AI insights asynchronously.

        Args:
            macro_inputs: Macro inputs dictionary
            macro_score: Calculated macro score
            allocation: Asset allocation

        Returns:
            Dictionary with insights sections
        """
        from app.config import get_settings
        settings = get_settings()
        api_key = self._api_key or settings.openai_api_key
        if not api_key:
            return {"summary": "AI insights unavailable: OPENAI_API_KEY not configured.",
                    "outlook": "", "risks": "", "recommendations": ""}
        client = AsyncOpenAI(api_key=api_key)

        prompt = self._build_prompt(macro_inputs, macro_score, allocation)

        try:
            message = await client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=500,
            )

            response_text = message.choices[0].message.content

            # Parse response into sections
            return self._parse_response(response_text)

        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            return {
                "positive_drivers": "Analysis unavailable",
                "negative_drivers": "Analysis unavailable",
                "inr_outlook": "Unable to generate",
                "equity_outlook": "Unable to generate",
                "bond_outlook": "Unable to generate",
                "key_risks": "Unable to generate",
                "monitoring_points": "Unable to generate",
            }

    def generate_insights(
        self,
        macro_inputs: Dict,
        macro_score: float,
        allocation: Dict,
    ) -> Dict[str, str]:
        """Generate AI insights synchronously.

        Args:
            macro_inputs: Macro inputs dictionary
            macro_score: Calculated macro score
            allocation: Asset allocation

        Returns:
            Dictionary with insights sections
        """
        prompt = self._build_prompt(macro_inputs, macro_score, allocation)

        try:
            message = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=500,
            )

            response_text = message.choices[0].message.content

            # Parse response into sections
            return self._parse_response(response_text)

        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            return {
                "positive_drivers": "Analysis unavailable",
                "negative_drivers": "Analysis unavailable",
                "inr_outlook": "Unable to generate",
                "equity_outlook": "Unable to generate",
                "bond_outlook": "Unable to generate",
                "key_risks": "Unable to generate",
                "monitoring_points": "Unable to generate",
            }

    @staticmethod
    def _build_prompt(
        macro_inputs: Dict,
        macro_score: float,
        allocation: Dict,
    ) -> str:
        """Build analysis prompt for AI model.

        Args:
            macro_inputs: Macro inputs
            macro_score: Macro score
            allocation: Asset allocation

        Returns:
            Formatted prompt
        """
        return f"""Analyze the following macro scenario and provide insights:

MACRO INPUTS:
- REER: {macro_inputs.get('reer', 88)}
- USD/INR: {macro_inputs.get('usdinr', 97)}
- DXY: {macro_inputs.get('dxy', 103)}
- India CPI: {macro_inputs.get('india_cpi', 4)}%
- US CPI: {macro_inputs.get('us_cpi', 3)}%
- Repo Rate: {macro_inputs.get('repo_rate', 6)}%
- Fed Funds: {macro_inputs.get('fed_funds', 4.5)}%
- India GDP Growth: {macro_inputs.get('india_gdp', 6.5)}%
- US GDP Growth: {macro_inputs.get('us_gdp', 2)}%
- Brent Oil: ${macro_inputs.get('brent', 100)}/bbl
- FPI Flows: ${macro_inputs.get('fpi', -10)}B
- FDI Flows: ${macro_inputs.get('fdi', 50)}B
- Bond Inflows: ${macro_inputs.get('bond_inflows', 10)}B
- Services Exports: ${macro_inputs.get('services_exports', 420)}B
- Remittances: ${macro_inputs.get('remittances', 135)}B
- Merchandise Deficit: ${macro_inputs.get('merchandise_deficit', 330)}B
- FX Reserves: ${macro_inputs.get('fx_reserves', 650)}B
- Forward Book: {macro_inputs.get('forward_book', 13)}%

ANALYSIS OUTPUT:
- Macro Score: {macro_score:.1f}/100
- Recommended Allocation: Equity {allocation.get('equity', 50)}%, Bonds {allocation.get('bond', 30)}%, Gold {allocation.get('gold', 10)}%, USD {allocation.get('usd', 10)}%

Please provide analysis structured as follows:

1. POSITIVE DRIVERS: Key factors supporting INR strength and growth
2. NEGATIVE DRIVERS: Key risks and headwinds
3. INR OUTLOOK: Expected USD/INR direction and drivers
4. EQUITY OUTLOOK: Implications for Indian equities
5. BOND OUTLOOK: Outlook for Indian government securities
6. KEY RISKS: Major risks to the central scenario
7. MONITORING POINTS: Key indicators to watch

Be specific and data-driven. Use the macro inputs provided."""

    @staticmethod
    def _parse_response(response: str) -> Dict[str, str]:
        """Parse AI response into structured sections.

        Args:
            response: Raw AI response

        Returns:
            Dictionary with parsed sections
        """
        sections = {
            "positive_drivers": "",
            "negative_drivers": "",
            "inr_outlook": "",
            "equity_outlook": "",
            "bond_outlook": "",
            "key_risks": "",
            "monitoring_points": "",
        }

        # Simple section extraction
        text = response.upper()

        for key in sections.keys():
            search_term = key.upper().replace("_", " ")

            if search_term in text:
                # Find position of this section
                start_pos = text.find(search_term)

                # Find next section
                next_pos = len(response)
                for other_key in sections.keys():
                    if other_key != key:
                        other_term = other_key.upper().replace("_", " ")
                        pos = text.find(other_term, start_pos + len(search_term))
                        if pos != -1 and pos < next_pos:
                            next_pos = pos

                # Extract section content
                section_text = response[start_pos + len(search_term) : next_pos].strip()
                # Remove common delimiters
                section_text = section_text.lstrip(": \n-")
                sections[key] = section_text[:300]  # Limit to 300 chars per section

        return sections
