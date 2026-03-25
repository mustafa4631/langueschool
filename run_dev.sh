#!/bin/bash

# Kill all background processes on exit
trap 'kill 0' EXIT

echo "Starting Backend (Django)..."
cd backend/languageschool
# Ensure a virtual env exists or just run if globally installed
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python manage.py runserver 8000 &

echo "Starting Frontend (Next.js)..."
cd ../../frontend
npm run dev -- -p 3000 &

# Keep the script running
wait
