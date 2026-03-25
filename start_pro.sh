#!/bin/bash

# Network name
NETWORK="langueschool_net"

# Create network if it doesn't exist
docker network inspect $NETWORK >/dev/null 2>&1 || \
    docker network create $NETWORK

echo "Stopping any existing containers..."
docker stop langueschool_frontend langueschool_backend langueschool_db >/dev/null 2>&1
docker rm langueschool_frontend langueschool_backend langueschool_db >/dev/null 2>&1

echo "1. Starting Database..."
docker run -d \
    --name langueschool_db \
    --network $NETWORK \
    -v postgres_data:/var/lib/postgresql/data \
    -e POSTGRES_DB=langueschool_db \
    -e POSTGRES_USER=langueschool_user \
    -e POSTGRES_PASSWORD=M.g.4646 \
    postgres:15-alpine

echo "2. Building and Starting Backend..."
docker build -t langueschool_backend ./backend
docker run -d \
    --name langueschool_backend \
    --network $NETWORK \
    -p 8000:8000 \
    --env-file ./backend/.env \
    -e DB_HOST=langueschool_db \
    langueschool_backend

echo "3. Building and Starting Frontend..."
docker build -t langueschool_frontend ./frontend
docker run -d \
    --name langueschool_frontend \
    --network $NETWORK \
    -p 3000:3000 \
    --env-file ./frontend/.env \
    langueschool_frontend

echo "----------------------------------------"
echo "Done! The site is now running:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "----------------------------------------"
echo "View logs with: docker logs -f langueschool_frontend"
