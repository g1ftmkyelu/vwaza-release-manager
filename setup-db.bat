@echo off
REM Script for Windows to set up the PostgreSQL database natively.

echo  Starting PostgreSQL database setup...

REM Check if .env file exists
if not exist ".env" (
    echo Error: .env file not found. Please create one with DATABASE_URL.
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

REM Extract components from DATABASE_URL
REM Example: postgresql://user:password@host:port/database

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

echo Database User: %DB_USER%
echo Database Name: %DB_NAME%
echo Database Host: %DB_HOST%
echo Database Port: %DB_PORT%

REM Check if PostgreSQL is running
pg_isready -h %DB_HOST% -p %DB_PORT% -U %DB_USER% >nul 2>&1
if errorlevel 1 (
    echo Error: PostgreSQL server is not running or not accessible at %DB_HOST%:%DB_PORT% for user %DB_USER%.
    echo Please ensure PostgreSQL is running and accessible, and DATABASE_URL in .env is correct.
    set PGPASSWORD=
    exit /b 1
)

REM Check if database exists
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='%DB_NAME%'" >nul 2>&1
if errorlevel 1 (
    echo Attempting to create database '%DB_NAME%'...
    createdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME%
    if errorlevel 1 (
        echo Error: Failed to create database '%DB_NAME%'. Check user permissions.
        set PGPASSWORD=
        exit /b 1
    )
    echo Database '%DB_NAME%' created successfully.
) else (
    echo Database '%DB_NAME%' already exists. Skipping creation.
)

REM Apply schema
echo Applying database schema from database/init.sql...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f database\init.sql

if errorlevel 1 (
    echo Error: Failed to apply database schema. Check database/init.sql or user permissions.
    set PGPASSWORD=
    exit /b 1
)

echo  Database schema applied successfully.

REM Unset PGPASSWORD for security
set PGPASSWORD=

echo  Database setup complete.