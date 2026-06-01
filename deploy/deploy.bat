@echo off
REM QR Menu Platform - Production Deployment Script (Windows)
REM Server: 188.245.65.247
REM Usage: deploy.bat

echo ======================================
echo QR Menu Platform - Production Deploy
echo ======================================
echo.

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose not found.
    pause
    exit /b 1
)

echo [1/5] Checking environment...
if not exist ".env.production" (
    echo [ERROR] .env.production file not found!
    echo Please create .env.production file first.
    pause
    exit /b 1
)
echo [OK] Environment file found
echo.

echo [2/5] Stopping existing containers...
docker-compose -f docker-compose.prod.yml --env-file .env.production down
echo [OK] Stopped
echo.

echo [3/5] Building images...
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
echo [OK] Built
echo.

echo [4/5] Starting services...
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
echo [OK] Services started
echo.

echo [5/5] Waiting for services...
timeout /t 10 /nobreak >nul
echo.

echo ======================================
echo [SUCCESS] Deployment Complete!
echo ======================================
echo.
echo Access URLs:
echo   Frontend:  http://188.245.65.247:3000
echo   Backend:   http://188.245.65.247:8080
echo   API Docs:  http://188.245.65.247:8080/swagger-ui.html
echo   MinIO:     http://188.245.65.247:9001
echo.
echo Check status:
echo   docker-compose -f docker-compose.prod.yml ps
echo.
echo View logs:
echo   docker-compose -f docker-compose.prod.yml logs -f
echo.
pause
