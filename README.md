# Feed Formulation System

A comprehensive feed formulation system for livestock with an optimized backend API and user-friendly web interface designed for farmers and scientists.

## Features

### Backend API (FastAPI)
- ✅ User authentication with JWT and OTP support
- ✅ **Email OTP delivery** - Secure OTP codes sent via email
- ✅ Ingredient management with comprehensive nutritional data
- ✅ Nutrient requirements profiles
- ✅ Advanced feed formulation optimization (Linear Programming)
- ✅ Multiple optimization methods (HiGHS, Revised Simplex, Interior Point)
- ✅ Cost optimization with nutritional constraints
- ✅ RESTful API with automatic documentation
- ✅ Professional HTML email templates

### Frontend Web Application
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ User-friendly interface optimized for farmers and scientists
- ✅ Real-time feed formulation calculator
- ✅ Ingredient library management
- ✅ Nutrient requirement profiles
- ✅ Visual results display with charts and breakdowns
- ✅ Save and manage formulations
- ✅ Mobile-responsive design

## Prerequisites

- Python 3.8+ or latest
- Windows PowerShell or Command Prompt
- Virtual environment (recommended)
- SQLite
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Docker (Optional)

---

## Quick Start

### 1. Create and activate a virtual environment

Open PowerShell or Command Prompt and run:

```powershell
python -m venv env

# PowerShell:
.\env\Scripts\Activate.ps1

# Command Prompt:
.\env\Scripts\activate.bat

# Git Bash:
source ./env/Scripts/activate
```

### 2. Configure Email Settings (Required for OTP)

```powershell
# Copy the example environment file
cp .env.example .env

# Edit .env with your email credentials
# For detailed setup instructions, see EMAIL_SETUP.md
```

**Quick Gmail Setup:**
1. Enable 2-Step Verification in Google Account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Update `.env` with your credentials

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed configuration guides for Gmail, Outlook, SendGrid, and more.

### 3. Install dependencies and run the API

```powershell
# Install required dependencies
pip install -r requirements.txt

# Run the FastAPI backend
fastapi dev main.py

# Or use uvicorn directly
python -m uvicorn main:app --reload
```

The API will be available at:
- API: http://127.0.0.1:8000
- Documentation: http://127.0.0.1:8000/docs
- Alternative docs: http://127.0.0.1:8000/redoc

### 4. Open the Web Application

**Option A: Direct file access**
```powershell
# Simply open frontend/index.html in your browser
start frontend/index.html
```

**Option B: Local web server (recommended)**
```powershell
# Navigate to frontend directory
cd frontend

# Start a local web server
python -m http.server 8080

# Open browser to http://localhost:8080
```

### 4. Start Using the System

1. **Register**: Create a new account at the registration page
2. **Login**: Sign in with your credentials
3. **Add Ingredients**: Navigate to "Manage Ingredients" and add your feed ingredients
4. **Create Formulation**: Go to "Create Formulation" and optimize your feed mix
5. **Save & Manage**: Save successful formulations for future reference

For detailed instructions, see [frontend/quick-start.html](frontend/quick-start.html)

---

## Docker Deployment

```powershell
# Build the Docker image
docker build -t fastapi-feed-formulation-app .

# Run the container
docker run -d -p 8000:8000 fastapi-feed-formulation-app
```

Then access:
- API: http://localhost:8000
- Frontend: Open frontend/index.html in your browser
