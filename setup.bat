@echo off
REM MacroSphere Setup Script for Windows

echo.
echo 🚀 MacroSphere Setup
echo ====================
echo.

REM Check for Poetry
python -m poetry --version >nul 2>&1
if errorlevel 1 (
    echo Installing Poetry...
    python -m pip install poetry
)

REM Backend Setup
echo.
echo Setting up Backend...
cd backend

poetry install
copy .env.example .env

echo ✓ Backend setup complete

REM Frontend Setup
echo.
echo Setting up Frontend...
cd ..\frontend

call npm install
copy .env.example .env.local

echo ✓ Frontend setup complete

REM Docker Compose
echo.
echo Starting services with Docker Compose...
cd ..
docker-compose up -d

echo.
echo ✓ All services started
echo.
echo Access points:
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
echo Setup complete!
