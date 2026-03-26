#!/bin/bash

# Kill all background processes on exit
trap 'kill 0' EXIT

echo "Checking Database..."
# Start the DB container if it's not running
if ! docker ps | grep -q "langueschool_db"; then
    echo "Starting Database container..."
    docker compose up -d db
fi

echo "Starting Backend (Django)..."
cd backend/languageschool
# Ensure a virtual env exists or just run if globally installed
if [ -d "venv" ]; then
    source venv/bin/activate
fi
# Set DB_HOST to localhost for local development (outside Docker)
export DB_HOST=localhost
python manage.py runserver 8000 &

echo "Starting Frontend (Next.js)..."
cd ../../frontend
npm run dev -- -p 3000 &

# Keep the script running
wait

