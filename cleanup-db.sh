#!/bin/bash

if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found."
  exit 1
fi

DB_USER=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

export PGPASSWORD=$DB_PASSWORD

echo "Dropping database '$DB_NAME'..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

unset PGPASSWORD

echo "Database dropped. Run setup-db.sh to recreate."