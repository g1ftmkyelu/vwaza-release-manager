#!/bin/bash
# Script for Linux/macOS to set up the PostgreSQL database natively.

echo "Starting PostgreSQL database setup..."

# Source the .env file to load DATABASE_URL
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found. Please create one with DATABASE_URL."
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not set in .env file."
  exit 1
fi

# Extract components from DATABASE_URL
# Example: postgresql://user:password@host:port/database
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Set PGPASSWORD for non-interactive psql commands
export PGPASSWORD=$DB_PASSWORD

echo "Database User: $DB_USER"
echo "Database Name: $DB_NAME"
echo "Database Host: $DB_HOST"
echo "Database Port: $DB_PORT"

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
  echo "Error: PostgreSQL server is not running or not accessible at $DB_HOST:$DB_PORT for user $DB_USER."
  echo "Please ensure PostgreSQL is running and accessible, and DATABASE_URL in .env is correct."
  exit 1
fi

# Create database if it doesn't exist
echo "Attempting to create database '$DB_NAME'..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
  if [ $? -eq 0 ]; then
    echo "Database '$DB_NAME' created successfully."
  else
    echo "Error: Failed to create database '$DB_NAME'. Check user permissions or if database already exists."
    exit 1
  fi
else
  echo "Database '$DB_NAME' already exists. Skipping creation."
fi

# Apply schema
echo "Applying database schema from database/init.sql..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/init.sql

if [ $? -eq 0 ]; then
  echo " Database schema applied successfully."
else
  echo "Error: Failed to apply database schema. Check database/init.sql or user permissions."
  exit 1
fi

# Unset PGPASSWORD for security
unset PGPASSWORD

echo "Database setup complete."