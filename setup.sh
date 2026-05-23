#!/bin/bash

# MacroSphere Setup Script

set -e

echo "🚀 MacroSphere Setup"
echo "===================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Backend Setup
echo -e "\n${BLUE}Setting up Backend...${NC}"
cd backend

if ! command -v poetry &> /dev/null; then
    echo "Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
fi

poetry install
cp .env.example .env

echo -e "${GREEN}✓ Backend setup complete${NC}"

# Frontend Setup
echo -e "\n${BLUE}Setting up Frontend...${NC}"
cd ../frontend

npm install
cp .env.example .env.local

echo -e "${GREEN}✓ Frontend setup complete${NC}"

# Database Setup
echo -e "\n${BLUE}Starting services with Docker Compose...${NC}"
cd ..
docker-compose up -d

echo -e "\n${GREEN}✓ All services started${NC}"

echo -e "\n${BLUE}Access points:${NC}"
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo "Database:  localhost:5432"
echo "Redis:     localhost:6379"

echo -e "\n${GREEN}Setup complete!${NC}"
