@echo off
REM QR Menu Platform - Production Deployment Script (Windows)
REM Server: 188.245.65.247
REM Usage: deploy.bat

setlocal enabledelayedexpansion

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

REM Create .env.production if it doesn't exist
if not exist ".env.production" (
    echo [INFO] Creating .env.production with auto-generated passwords...
    echo.

    REM Generate random passwords using PowerShell
    for /f "delims=" %%i in ('powershell -Command "[Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 })) -replace '[=+/]',''"') do set DB_PASSWORD=%%i
    for /f "delims=" %%i in ('powershell -Command "[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 })) -replace '[=+/',''"') do set JWT_SECRET=%%i
    for /f "delims=" %%i in ('powershell -Command "[Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 })) -replace '[=+/]',''"') do set MINIO_SECRET_KEY=%%i

    REM Create .env.production file
    (
        echo # QR Menu Production Environment Variables
        echo # Auto-generated on %date% %time%
        echo # Server: 188.245.65.247
        echo.
        echo # Database
        echo DB_NAME=qrmenu
        echo DB_USER=qrmenu_user
        echo DB_PASSWORD=!DB_PASSWORD!
        echo.
        echo # JWT - 64 character secure secret
        echo JWT_SECRET=!JWT_SECRET!
        echo.
        echo # MinIO
        echo MINIO_ACCESS_KEY=qrmenu_minio_admin
        echo MINIO_SECRET_KEY=!MINIO_SECRET_KEY!
        echo.
        echo # Frontend
        echo VITE_API_BASE_URL=http://188.245.65.247:8080/api/v1
    ) > .env.production

    echo [SUCCESS] .env.production created with secure passwords
    echo.
    echo =========================================
    echo IMPORTANT: Save these credentials!
    echo =========================================
    echo Database Password: !DB_PASSWORD!
    echo MinIO Secret: !MINIO_SECRET_KEY!
    echo =========================================
    echo.
    echo Press any key to continue deployment...
    pause >nul
) else (
    echo [OK] Environment file found
)
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
echo MinIO Console Login:
echo   Username: qrmenu_minio_admin
echo   Password: (check .env.production file)
echo.
echo Check status:
echo   docker-compose -f docker-compose.prod.yml ps
echo.
echo View logs:
echo   docker-compose -f docker-compose.prod.yml logs -f
echo.
pause
