# Developed by: Kian Naquines
# Description: This Dockerfile sets up a FastAPI application environment.
# Date: 23/06/2025
# Version: 1.0 beta
# Usage: Build the Docker image with `fastapi-feed-formulation-app`

# Dockerfile for a FastAPI application
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
