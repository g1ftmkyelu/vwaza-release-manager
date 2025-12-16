@echo off
REM Script for Windows to drop the PostgreSQL database.

echo  Starting database cleanup...

REM Check if .env file exists
if not exist ".env" (
    echo Error: .env file not found.
    exit /b 1
)

REM Load DATABASE_URL from .env file
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if "%%a"=="DATABASE_URL" set DATABASE_URL=%%b
)

if "%DATABASE_URL%"=="" (
    echo Error: DATABASE_URL not set in .env file.
    exit /b 1
)

REM Remove protocol
set TEMP_URL=%DATABASE_URL:postgresql://=%

REM Extract user:password@host:port/database
for /f "tokens=1,2 delims=@" %%a in ("%TEMP_URL%") do (
    set USERPASS=%%a
    set HOSTDB=%%b
)

REM Extract user and password
for /f "tokens=1,2 delims=:" %%a in ("%USERPASS%") do (
    set DB_USER=%%a
    set DB_PASSWORD=%%b
)

REM Extract host:port/database
for /f "tokens=1,2 delims=/" %%a in ("%HOSTDB%") do (
    set HOSTPORT=%%a
    set DB_NAME=%%b
)

REM Extract host and port
for /f "tokens=1,2 delims=:" %%a in ("%HOSTPORT%") do (
    set DB_HOST=%%a
    set DB_PORT=%%b
)

REM Remove query parameters from database name if any
for /f "tokens=1 delims=?" %%a in ("%DB_NAME%") do (
    set DB_NAME=%%a
)

REM Set PGPASSWORD for non-interactive psql commands
set PGPASSWORD=%DB_PASSWORD%

echo Dropping database '%DB_NAME%'...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;"

if errorlevel 1 (
    echo Error: Failed to drop database.
    set PGPASSWORD=
    exit /b 1
)

REM Unset PGPASSWORD for security
set PGPASSWORD=

echo  Database dropped. Run setup-db.bat to recreate.