#!/bin/sh

echo "Waiting for PostgreSQL..."

sleep 10

echo "Running migrations..."
npm run migration:run

echo "Checking if database needs seed..."

EVENT_COUNT=$(psql \
  -h "$DB_HOST" \
  -U "$DB_USERNAME" \
  -d "$DB_NAME" \
  -t \
  -c "SELECT COUNT(*) FROM events;" 2>/dev/null | xargs)

if [ "$EVENT_COUNT" = "0" ] || [ -z "$EVENT_COUNT" ]; then
  echo "Database is empty. Running seed..."
  npm run seed
else
  echo "Events already exist. Skipping seed."
fi

echo "Starting NestJS application..."

npm run start:prod