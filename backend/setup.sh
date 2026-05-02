#!/bin/bash

# Backend Setup Script
# This script sets up the Feed Formulation API backend

set -e  # Exit on error

echo "🚀 Setting up Feed Formulation API Backend..."
echo ""

# Check Python version
echo "📋 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Found Python $python_version"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --quiet
echo "✓ pip upgraded"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt --quiet
echo "✓ Dependencies installed"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Please edit .env file with your configuration!"
    echo "   - Set JWT_SECRET_KEY (use: openssl rand -hex 32)"
    echo "   - Configure SMTP settings for email"
    echo "   - Add API keys for AI services"
else
    echo "✓ .env file exists"
fi
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
if command -v alembic &> /dev/null; then
    alembic upgrade head
    echo "✓ Database migrations completed"
else
    echo "⚠️  Alembic not found in PATH, skipping migrations"
fi
echo ""

echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run: python main.py"
echo "     or: uvicorn main:app --reload"
echo ""
echo "API Documentation will be available at:"
echo "  - Swagger UI: http://localhost:8000/docs"
echo "  - ReDoc: http://localhost:8000/redoc"
echo ""
echo "Happy coding! 🎉"
