# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
# Note: requirements.txt is inside languageschool/ folder
COPY languageschool/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app/

# The application is inside the languageschool folder
WORKDIR /app/languageschool

# Ensure .env is available to Django (linked from parent if needed)
# Since we copied everything, /app/.env is now at /app/languageschool/../.env
# I will make sure the compose file handles the env variable part.

# EXPOSE port 8000
EXPOSE 8000

# Start Gunicorn and collect static files
CMD ["sh", "-c", "python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000"]
