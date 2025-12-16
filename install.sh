#!/bin/bash

echo " Starting project installation..."


echo " Installing server dependencies and building..."
if [ -d "server" ]; then
  cd server
  npm install
  npm run build
  cd .. 
else
  echo "Error: 'server' directory not found."
  exit 1
fi


echo " Installing client dependencies..."
if [ -d "client" ]; then
  cd client
  npm install
  cd .. 
else
  echo "Error: 'client' directory not found."
  exit 1
fi

echo " Installation and build complete."
echo "You can now run the application using ./start.sh"