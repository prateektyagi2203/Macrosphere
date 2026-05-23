# MacroSphere Backend

AI-Powered India Macro Allocation Engine Backend

## Architecture

```
backend/
├── app/
│   ├── engines/          # Quantitative engines
│   │   ├── score_engine.py        # Macro scoring
│   │   ├── allocation_engine.py   # Asset allocation
│   │   ├── scenario_engine.py     # Scenario management
│   │   ├── simulation_engine.py   # Monte Carlo
│   │   └── insight_engine.py      # AI insights
│   ├── models/           # SQLAlchemy ORM models
│   ├── api/              # API route handlers
│   ├── db/               # Database utilities
│   ├── schemas.py        # Pydantic models
│   ├── config.py         # Configuration
│   └── main.py           # FastAPI app factory
├── tests/                # Unit tests
├── migrations/           # Alembic migrations
└── pyproject.toml        # Poetry dependencies
```

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL
- Redis (for caching)

### Installation

```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Create .env file
cp .env.example .env

# Set up database
poetry run alembic upgrade head

# Run tests
poetry run pytest

# Start development server
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Analysis
- `POST /api/v1/analysis/calculate` - Calculate macro score
- `POST /api/v1/analysis/allocation` - Get allocation
- `POST /api/v1/analysis/full-analysis` - Complete analysis
- `POST /api/v1/analysis/ai-insights` - Generate AI insights
- `GET /api/v1/analysis/factors` - Factor reference

### Scenarios
- `GET /api/v1/scenarios/preloaded` - List preloaded scenarios
- `GET /api/v1/scenarios/preloaded/{key}` - Get scenario
- `POST /api/v1/scenarios/load/{key}` - Load and analyze
- `POST /api/v1/scenarios/create` - Create custom
- `GET /api/v1/scenarios` - List saved
- `PATCH /api/v1/scenarios/{id}` - Update
- `DELETE /api/v1/scenarios/{id}` - Delete

### Simulations
- `POST /api/v1/simulations/run` - Run Monte Carlo
- `GET /api/v1/simulations/{id}` - Get results
- `GET /api/v1/simulations` - List

## Scoring Engine

The macro scoring engine implements institutional-grade factor analysis with 11 factors:

1. **REER (15%)** - Exchange rate competitiveness
2. **Inflation Differential (10%)** - PPP driver
3. **Real Rate Differential (10%)** - Capital flow attractor
4. **GDP Differential (10%)** - Growth momentum
5. **Oil Risk (10%)** - Current account impact
6. **Current Account (10%)** - External balance
7. **FPI Momentum (10%)** - Capital flows
8. **FDI Strength (5%)** - Stable investment
9. **Bond Inflows (5%)** - Debt appetite
10. **FX Reserves (10%)** - Policy ammunition
11. **DXY (5%)** - Global dollar strength

Each factor generates a -3 to +3 score, which is normalized to 0-100 macro score.

## Allocation Engine

Asset allocation based on macro score:

- **Score 0-30**: 20% Equity, 20% Bond, 30% Gold, 30% USD
- **Score 30-50**: 35% Equity, 25% Bond, 20% Gold, 20% USD
- **Score 50-70**: 50% Equity, 30% Bond, 10% Gold, 10% USD
- **Score 70-100**: 65% Equity, 25% Bond, 5% Gold, 5% USD

## Monte Carlo Simulation

Runs 10,000 simulations with randomized factors to generate:
- Probability distributions
- Confidence intervals (P10, P50, P90)
- Expected allocation
- Volatility estimates

## AI Insights

Uses OpenAI GPT-4 to generate institutional-grade analysis covering:
- Positive drivers
- Negative drivers
- INR outlook
- Equity outlook
- Bond outlook
- Key risks
- Monitoring points

## Testing

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app

# Run specific test file
poetry run pytest tests/test_score_engine.py

# Run with verbose output
poetry run pytest -v
```

Target coverage: > 85%

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/macrosphere
OPENAI_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379/0
LOG_LEVEL=INFO
API_ENV=production
```

## Deployment

### Docker

```bash
docker-compose up -d
```

### Render

Connected to this repository for automatic deployments.

Database: Supabase PostgreSQL

## Performance

- Scoring: < 10ms
- Allocation: < 5ms
- Monte Carlo (10k): < 2s
- API response: < 500ms (including AI generation)

## Security

- CORS configured for frontend origin
- API key validation for OpenAI
- SQL injection prevention via SQLAlchemy ORM
- HTTPS enforced in production

## Contributing

1. Create feature branch
2. Write tests
3. Ensure 85%+ coverage
4. Submit PR

## License

MIT

## Author

Prateek Tyagi

## Contact

Version 1.0.0
