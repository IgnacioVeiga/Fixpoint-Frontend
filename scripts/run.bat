@echo off
set ENVIRONMENT=%1
set MODE=%2

if "%ENVIRONMENT%"=="" (
    set ENVIRONMENT=dev
)
if "%MODE%"=="" (
    set MODE=local
)

if /I "%MODE%"=="docker" (
    set COMPOSE_FILE=docker-compose.%ENVIRONMENT%.yml
    if not exist "%COMPOSE_FILE%" (
        echo Compose file not found: %COMPOSE_FILE%
        exit /b 1
    )

    echo Starting frontend containers with profile '%ENVIRONMENT%'...
    docker compose -f "%COMPOSE_FILE%" up --build
    exit /b %ERRORLEVEL%
)

set START_SCRIPT=start:%ENVIRONMENT%

call npm install
call npm run %START_SCRIPT%