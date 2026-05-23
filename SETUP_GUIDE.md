# MacroSphere Setup & Deployment Guide

## 📋 Prerequisites

### System Requirements
- Python 3.11+
- Node.js 18+ with npm 9+
- PostgreSQL 14+ (for production)
- Redis 7+ (optional, for caching)
- Docker & Docker Compose (for containerized deployment)

### Recommended Tools
- Poetry (Python dependency management)
- VS Code with Python & TypeScript extensions
- Postman or Insomnia (for API testing)

---

## 🚀 Quick Start (5 minutes)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
python -m poetry install

# Configure environment
cp .env.example .env

# Edit .env with your settings (optional for local development)
# - DATABASE_URL: defaults to local SQLite
# - OPENAI_API_KEY: required for AI insights
# - LOG_LEVEL: DEBUG/INFO/WARNING/ERROR (default: INFO)

# Run the API server
python -m poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**API will be available at:**
- Main API: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`
- API Docs (ReDoc): `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (use --legacy-peer-deps for Node 18+)
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env.local

# Edit .env.local (optional)
# - NEXT_PUBLIC_API_URL: API endpoint (default: http://localhost:8000)

# Run development server
npm run dev
```

**Frontend will be available at:**
- `http://localhost:3000`

### 3. Access the Application

1. Open `http://localhost:3000` in your browser
2. Adjust macro inputs in the left panel
3. View real-time analysis and allocation recommendations
4. Export reports to PDF/PNG/CSV

---

## 🛠️ Development Workflow

### Running Tests

#### Backend Tests
```bash
cd backend

# Run all tests with coverage
python -m poetry run pytest -v --cov=app --cov-report=html

# Run specific test file
python -m poetry run pytest tests/test_score_engine.py -v

# Run tests in watch mode
python -m poetry run pytest --watch
```

#### Frontend Tests
```bash
cd frontend

# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Check test coverage
npm run test:coverage
```

### Code Quality

#### Backend
```bash
cd backend

# Linting
python -m poetry run flake8 app/

# Type checking
python -m poetry run mypy app/

# Code formatting
python -m poetry run black app/
python -m poetry run isort app/
```

#### Frontend
```bash
cd frontend

# Linting
npm run lint

# Type checking
npm run type-check

# Code formatting
npm run format
```

---

## 📦 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up -d --build backend
```

### Services Started
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379
- **Backend API**: Port 8000
- **Frontend**: Port 3000

---

## 🌐 Production Deployment

### Environment Variables

#### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:password@hostname:5432/macrosphere
SQLALCHEMY_ECHO=false

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# API Configuration
API_ENV=production
API_TITLE=MacroSphere API
API_VERSION=1.0.0
LOG_LEVEL=INFO

# AI/ML
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# CORS
CORS_ORIGINS=["https://yourdomain.com", "https://app.yourdomain.com"]
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_ENV=production
```

### Deployment Options

#### 1. **Render.com** (Backend)
```bash
# Create render.yaml in project root
# Deploy with environment variables
# API docs: https://api.yourdomain.render.com/docs
```

#### 2. **Vercel** (Frontend)
```bash
# Connect GitHub repository
# Set environment variables
# Auto-deploys on push to main
# App: https://app.yourdomain.vercel.app
```

#### 3. **Supabase** (Database)
```bash
# Create PostgreSQL database
# Update DATABASE_URL in backend .env
# Enable Row Level Security for multi-tenancy
```

#### 4. **AWS Deployment**

**Backend (EC2 or ECS):**
```bash
# Build Docker image
docker build -t macrosphere-api:latest ./backend

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {aws_account_id}.dkr.ecr.us-east-1.amazonaws.com
docker tag macrosphere-api:latest {aws_account_id}.dkr.ecr.us-east-1.amazonaws.com/macrosphere-api:latest
docker push {aws_account_id}.dkr.ecr.us-east-1.amazonaws.com/macrosphere-api:latest
```

**Frontend (CloudFront + S3):**
```bash
npm run build
aws s3 sync ./out s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## 🔧 Configuration & Customization

### Backend Settings (app/config.py)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API
    api_title: str = "MacroSphere API"
    api_version: str = "1.0.0"
    environment: str = "development"
    
    # Database
    database_url: str = "sqlite:///./macrosphere.db"
    sqlalchemy_echo: bool = False
    
    # CORS
    cors_origins: list = ["http://localhost:3000"]
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
```

### Frontend Theme (tailwind.config.ts)

Customize colors, fonts, and breakpoints:

```typescript
export default {
  theme: {
    colors: {
      primary: "#0066cc",
      positive: "#10b981",
      negative: "#ef4444",
    },
  },
}
```

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit .env files
   - Use .env.example as template
   - Rotate secrets regularly

2. **API Security**
   - Enable HTTPS in production
   - Implement rate limiting
   - Add API key authentication (future)
   - Use CORS properly

3. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups
   - Restrict access IPs

4. **Frontend Security**
   - Enable CSP headers
   - Use SRI for external scripts
   - Sanitize user inputs
   - Keep dependencies updated

---

## 📊 Monitoring & Logging

### Application Logs

**Backend:** Check logs via Docker
```bash
docker-compose logs -f backend
```

**Frontend:** Check browser console and Network tab

### Health Checks

```bash
# Backend health check
curl http://localhost:8000/health

# Response:
# {
#   "status": "ok",
#   "version": "1.0.0",
#   "environment": "development"
# }
```

### Performance Monitoring

- Enable APM (Application Performance Monitoring)
- Monitor database query times
- Track API response times
- Monitor error rates

---

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

**Database Connection Error**
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Verify credentials
```

### Frontend Issues

**Module Not Found Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**API Connection Issues**
1. Check NEXT_PUBLIC_API_URL in .env.local
2. Verify backend is running
3. Check browser console for CORS errors
4. Clear browser cache

---

## 📚 API Documentation

### Key Endpoints

#### Analysis
- `POST /api/v1/analysis/calculate` - Calculate macro score
- `POST /api/v1/analysis/allocation` - Get portfolio allocation
- `POST /api/v1/analysis/full-analysis` - Complete analysis
- `POST /api/v1/analysis/ai-insights` - Generate insights

#### Scenarios
- `GET /api/v1/scenarios/preloaded` - List scenarios
- `POST /api/v1/scenarios/load/{key}` - Load scenario
- `POST /api/v1/scenarios/create` - Create custom scenario

#### Simulations
- `POST /api/v1/simulations/run` - Run MC simulation
- `GET /api/v1/simulations/{id}` - Get simulation results

### Example Request

```bash
curl -X POST http://localhost:8000/api/v1/analysis/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "reer": 95,
    "usdinr": 83.5,
    "dxy": 105,
    "india_cpi": 5.5,
    "us_cpi": 3.4,
    ...
  }'
```

---

## 📞 Support & Resources

- **API Docs**: `/docs` (Swagger UI)
- **Code Docs**: Check inline comments and docstrings
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions

---

## 📄 License

This project is proprietary. All rights reserved.
