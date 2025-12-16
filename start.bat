@echo off
REM Script for Windows to start the application in native or Docker mode.

set MODE=%1
if "%MODE%"=="" set MODE=native

REM Load BACKEND_PORT from .env
set "BACKEND_PORT="
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if "%%a"=="PORT" set "BACKEND_PORT=%%b"
)
if "%BACKEND_PORT%"=="" (
    echo Error: BACKEND_PORT not found in .env file.
    exit /b 1
)

REM Load CLIENT_PORT from cdev.json
set "CLIENT_PORT="
for /f "tokens=2 delims=:" %%a in ('findstr /R /C:"\"frontendPort\":" cdev.json') do (
    set "CLIENT_PORT=%%a"
)
REM Remove leading/trailing spaces and comma
set "CLIENT_PORT=%CLIENT_PORT: =%"
set "CLIENT_PORT=%CLIENT_PORT:,=%"
if "%CLIENT_PORT%"=="" (
    echo Error: CLIENT_PORT not found in cdev.json file.
    exit /b 1
)

if "%MODE%"=="native" (
  echo  Starting backend in native mode on port %BACKEND_PORT%...
  if exist "server" (
    start /B cmd /c "cd server && call npm start"
    echo Backend started in background.
  ) else (
    echo Error: 'server' directory not found. Please run install.bat first.
    exit /b 1
  )

  echo Starting frontend in native mode on port %CLIENT_PORT%...
  if exist "client" (
    cd client
    call npm run dev
  ) else (
    echo Error: 'client' directory not found. Please run install.bat first.
    REM Note: In Windows batch, reliably killing a background process started with 'start /B'
    REM without knowing its PID is complex. Manual termination might be required if the frontend fails.
    exit /b 1
  )
) else if "%MODE%"=="docker" (
  echo Starting backend in Docker mode on port %BACKEND_PORT%...
  docker info > nul 2>&1
  if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker Desktop or daemon.
    exit /b 1
  )
  call docker-compose up --build -d
  if %errorlevel% neq 0 (
    echo Error: Docker Compose failed to start the backend.
    exit /b 1
  )
  echo Backend Docker container started.

  echo Starting frontend in native mode on port %CLIENT_PORT%...
  if exist "client" (
    cd client
    call npm run dev
  ) else (
    echo Error: 'client' directory not found. Please run install.bat first.
    echo Stopping Docker backend...
    call docker-compose down
    exit /b 1
  )

  echo Stopping Docker backend...
  call docker-compose down

) else (
  echo ❌ Invalid mode: %MODE%
  echo Usage: start.bat [native|docker]
  exit /b 1
)