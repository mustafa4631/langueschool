#!/bin/bash

echo "Starting LangueSchool Production Stack..."

# Build and start services in detached mode
docker compose up -d --build

echo "----------------------------------------"
echo "Done! The site is now running:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "----------------------------------------"
echo "View logs with: docker compose logs -f"

