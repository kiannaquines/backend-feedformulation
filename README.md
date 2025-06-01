# FastAPI with Alembic Setup (Windows)

This guide shows how to set up and run a FastAPI app with Alembic database migrations on Windows.

---

## Prerequisites

- Python 3.8+ or latest
- Windows PowerShell or Command Prompt
- Virtual environment (recommended)
- SQLite

---

## Setup Instructions

### 1. Create and activate a virtual environment

Open PowerShell or Command Prompt and run:

```powershell

python -m venv env

# PowerShell:
.\env\Scripts\Activate.ps1

# Command Prompt:
.\env\Scripts\activate.bat

# Gitbash
source ./env/Scripts/activate
```

Install required dependencies and run the api

```powershell
# Install required dependencies
pip install -r requirements.txt

# Run the fastapi
fastapi dev main.py

# Access Local API Route
http://127.0.0.1:8000/docs
```
