@echo off
REM Script for Windows to install project dependencies and build the application.

echo  Starting project installation...

REM Install server dependencies and build
echo Installing server dependencies and building...
if exist "server" (
  cd server
  call npm install
  call npm run build
  cd ..
) else (
  echo Error: 'server' directory not found.
  exit /b 1
)

REM Install client dependencies
echo  Installing client dependencies...
if exist "client" (
  cd client
  call npm install
  cd ..
) else (
  echo Error: 'client' directory not found.
  exit /b 1
)

echo Installation and build complete.
echo You can now run the application using start.bat