# MacroSphere - AI-Powered India Macro Allocation Engine

**Bloomberg-Grade Macroeconomic Simulation Platform**

## 🎯 Overview

MacroSphere is an institutional-grade macro allocation engine built for understanding how macroeconomic variables impact Indian assets (INR, Equities, Bonds, Gold, USD).

### Key Features

✅ **Institutional-Grade Analysis**
- 11-factor macro scoring engine
- Real rate differential analysis
- Current account strength assessment
- Capital flow momentum tracking

✅ **Interactive Dashboard**
- Real-time macro score (0-100)
- Asset allocation recommendations
- INR outlook (Bullish/Neutral/Bearish)
- Risk level assessment

✅ **9 Pre-loaded Scenarios**
- Base Case, Bull Case, Bear Case
- Oil Shock, Fed Pivot, China Slowdown
- Global Recession, Election Boom, Stagflation

✅ **Monte Carlo Simulations**
- 10,000 simulation runs
- Probability distributions
- Confidence intervals (P10, P50, P90)
- Volatility estimation

✅ **AI-Powered Insights**
- OpenAI GPT-4 integration
- Institutional analysis generation
- Driver identification
- Risk assessment

✅ **Production Ready**
- Scalable FastAPI backend
- Next.js 15 frontend
- PostgreSQL persistence
- Docker containerization
- 85%+ test coverage

## 🏗️ Architecture

```
MacroSphere/
├── Backend (FastAPI + Python)
│   ├── Score Engine - Quantitative factor analysis
│   ├── Allocation Engine - Portfolio recommendations
│   ├── Scenario Engine - Economic scenarios
│   ├── Monte Carlo Engine - Probability simulations
│   └── AI Insight Engine - OpenAI integration
├── Frontend (Next.js 15 + TypeScript)
│   ├── Dashboard with KPI cards
│   ├── Interactive input sliders
│   ├── Multi-layer charting
│   ├── Scenario builder
│   └── Export (PNG/PDF/CSV)
├── Database (PostgreSQL)
└── Cache (Redis)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### Development Setup

**1. Clone and Setup Backend**
```bash
cd backend
cp .env.example .env
poetry install
poetry run pytest
poetry run uvicorn app.main:app --reload
```

**2. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

**3. Or use Docker Compose**
```bash
docker-compose up -d
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Database: postgres://localhost:5432

## 📊 Scoring Engine

The core engine calculates a 0-100 macro score from 11 weighted factors:

| Factor | Weight | Impact |
|--------|--------|--------|
| REER | 15% | Exchange rate competitiveness |
| Inflation Differential | 10% | PPP driver |
| Real Rate Differential | 10% | Capital flow attractor |
| GDP Differential | 10% | Growth momentum |
| Oil Price | 10% | Current account impact |
| Current Account | 10% | External balance |
| FPI Momentum | 10% | Volatile capital flows |
| FDI Strength | 5% | Stable investment |
| Bond Inflows | 5% | Debt appetite |
| FX Reserves | 10% | Policy ammunition |
| DXY | 5% | Global dollar strength |

### Score Interpretation
- **0-30**: Very Bearish (20% Equity, 20% Bond, 30% Gold, 30% USD)
- **31-50**: Bearish (35% Equity, 25% Bond, 20% Gold, 20% USD)
- **51-65**: Neutral (50% Equity, 30% Bond, 10% Gold, 10% USD)
- **66-80**: Bullish (65% Equity, 25% Bond, 5% Gold, 5% USD)
- **81-100**: Very Bullish (65% Equity, 25% Bond, 5% Gold, 5% USD)

## 🔌 API Endpoints

### Analysis
- `POST /api/v1/analysis/calculate` - Calculate macro score
- `POST /api/v1/analysis/allocation` - Get allocation
- `POST /api/v1/analysis/full-analysis` - Complete analysis
- `POST /api/v1/analysis/ai-insights` - AI-generated insights

### Scenarios
- `GET /api/v1/scenarios/preloaded` - List preloaded
- `POST /api/v1/scenarios/load/{key}` - Load scenario
- `POST /api/v1/scenarios/create` - Save custom
- `GET/PATCH/DELETE /api/v1/scenarios/{id}` - CRUD operations

### Simulations
- `POST /api/v1/simulations/run` - Run Monte Carlo
- `GET /api/v1/simulations/{id}` - Retrieve results

## 🧪 Testing

```bash
# Backend
poetry run pytest
poetry run pytest --cov=app
poetry run pytest tests/test_score_engine.py -v

# Frontend
npm run test
npm run test:ui
npm run playwright
```

Target coverage: **> 85%**

## 📦 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/macrosphere
OPENAI_API_KEY=sk-...
REDIS_URL=redis://localhost:6379/0
API_ENV=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚢 Deployment

### Frontend - Vercel
```bash
git push origin main
```
Auto-deploys from git.

### Backend - Render
```bash
git push origin main
```
Auto-deploys with PostgreSQL.

### Database - Supabase
PostgreSQL managed hosting.

## 📈 Performance

- Macro Score Calculation: < 10ms
- Asset Allocation: < 5ms
- Monte Carlo (10k runs): < 2 seconds
- Full Dashboard Load: < 500ms
- API Response: < 200ms (excluding AI)

## 🔒 Security

- ✅ CORS configured
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ API key validation
- ✅ HTTPS in production
- ✅ Rate limiting ready
- ✅ WCAG AA accessibility
- ✅ Dark mode support

## 📊 User Types

- **Retail Investors** - Educational macro understanding
- **CFA Students** - Learning macro relationships
- **Product Managers** - Research for product decisions
- **Financial Analysts** - Macro scenario planning
- **Macro Strategists** - Professional analysis
- **Investment Advisors** - Client briefings
- **LinkedIn Audience** - Educational content

## 🎨 Design

- **Color Scheme**: Blue primary (#2563EB), Green positive, Red negative
- **Typography**: Inter font family
- **Layout**: 280px fixed sidebar, responsive grid
- **Components**: Radix UI + Tailwind CSS
- **Charts**: Recharts + Framer Motion animations

## 📚 Documentation

- [API Documentation](http://localhost:8000/docs)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Create feature branch
2. Write tests
3. Ensure 85%+ coverage
4. Submit PR

## 📄 License

MIT

## 👤 Author

**Prateek Tyagi**
- Principal Engineer @ Bloomberg
- VP Quantitative Research @ JP Morgan
- Senior Product Architect

**Version 1.0.0**

---

Built with ❤️ for institutional-grade macro analysis
