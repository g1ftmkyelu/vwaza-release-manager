#!/bin/bash


MODE=${1:-native} 
BACKEND_PORT=$(grep -E '^PORT=' .env | cut -d '=' -f 2)
CLIENT_PORT=$(grep -E '"frontendPort":' cdev.json | cut -d ':' -f 2 | cut -d ',' -f 1 | tr -d ' ')

if [ -z "$BACKEND_PORT" ]; then
  echo "Error: BACKEND_PORT not found in .env file."
  exit 1
fi
if [ -z "$CLIENT_PORT" ]; then
  echo "Error: CLIENT_PORT not found in cdev.json file."
  exit 1
fi

if [ "$MODE" = "native" ]; then
  echo " Starting backend in native mode on port $BACKEND_PORT..."
  if [ -d "server" ]; then
    (cd server && npm start) & 
    SERVER_PID=$!
    echo "Backend started with PID $SERVER_PID."
  else
    echo "Error: 'server' directory not found. Please run install.sh first."
    exit 1
  fi

  echo " Starting frontend in native mode on port $CLIENT_PORT..."
  if [ -d "client" ]; then
    cd client
    npm run dev 
  else
    echo "Error: 'client' directory not found. Please run install.sh first."
    kill $SERVER_PID
    exit 1
  fi


  kill $SERVER_PID
  echo "Backend (PID $SERVER_PID) stopped."

elif [ "$MODE" = "docker" ]; then
  echo " Starting backend in Docker mode on port $BACKEND_PORT..."
  if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker Desktop or daemon."
    exit 1
  fi
  docker-compose up --build -d 
  if [ $? -ne 0 ]; then
    echo "Error: Docker Compose failed to start the backend."
    exit 1
  fi
  echo "Backend Docker container started."

  echo "Starting frontend in native mode on port $CLIENT_PORT..."
  if [ -d "client" ]; then
    cd client
    npm run dev 
  else
    echo "Error: 'client' directory not found. Please run install.sh first."
    echo "Stopping Docker backend..."
    docker-compose down
    exit 1
  fi


  echo "Stopping Docker backend..."
  docker-compose down

else
  echo "❌ Invalid mode: $MODE"
  echo "Usage: ./start.sh [native|docker]"
  exit 1
fi