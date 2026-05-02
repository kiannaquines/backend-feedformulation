# Backend - Feed Formulation API

FastAPI-based backend for the Feed Formulation System with user authentication, OTP security, and AI-powered recommendations.

## 📁 Project Structure

```
backend/
├── alembic/              # Database migrations
├── api/                  # API dependencies
├── core/                 # Core configuration and services
│   ├── config.py        # Application settings (Pydantic)
│   ├── authentication.py # Auth utilities
│   ├── ai_service.py    # AI service integration
│   ├── email.py         # Email service
│   └── otp.py           # OTP functionality
├── db/                   # Database setup
├── models/               # SQLAlchemy models
├── routes/               # API route handlers
│   ├── authentication_routes.py
│   ├── feed_formulation_routes.py
│   ├── ingredient_routes.py
│   └── nutrient_requirements_routes.py
├── schema/               # Pydantic schemas
├── services/             # Business logic services
├── utils/                # Utility functions
│   ├── response_helper.py  # Standardized API responses
│   ├── logger.py           # Logging utilities
│   └── validators.py       # Input validation
├── middleware/           # Custom middleware
├── tests/                # Test files
├── main.py              # Application entry point
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables (not in git)
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- pip
- Virtual environment (recommended)

### Installation

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Start the server:**
   ```bash
   python main.py
   # or
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`

## 📝 Configuration

All configuration is managed through environment variables in the `.env` file. See `.env.example` for all available options.

### Key Configuration Sections:

- **Application Settings**: Host, port, debug mode
- **Database**: Database connection settings
- **JWT & Security**: Token configuration
- **OTP**: One-time password settings
- **Email/SMTP**: Email service configuration
- **AI Services**: Groq and Gemini API keys
- **CORS**: Cross-origin resource sharing

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | Feed Formulation API |
| `APP_PORT` | Server port | 8000 |
| `DATABASE_PATH` | SQLite database file | app_database.db |
| `JWT_SECRET_KEY` | Secret key for JWT | (required) |
| `GROQ_API_KEY` | Groq AI API key | (optional) |
| `SMTP_SERVER` | SMTP server address | smtp.gmail.com |
| `SMTP_USERNAME` | Email username | (required) |
| `SMTP_PASSWORD` | Email app password | (required) |

See `.env.example` for complete list.

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🧪 Testing

Run tests using pytest:
```bash
pytest tests/
```

## 🏗️ Development

### Adding a New Route

1. Create route handler in `routes/`
2. Define Pydantic schemas in `schema/`
3. Add business logic in `services/`
4. Register router in `main.py`

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🛠️ Utilities

### Response Helper
Standardized API responses:
```python
from utils.response_helper import success_response, error_response

return success_response(data={"user": user}, message="User created")
return error_response(message="Invalid input", status_code=400)
```

### Logger
Application logging:
```python
from utils.logger import logger

logger.info("Application started")
logger.error("Error occurred", exc_info=True)
```

### Validators
Input validation:
```python
from utils.validators import validate_email, validate_password_strength

if not validate_email(email):
    return error_response("Invalid email format")
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Optional OTP verification
- CORS protection
- Environment-based configuration
- SQL injection protection (SQLAlchemy ORM)

## 🤖 AI Integration

- **Primary**: Groq (fast LLaMA inference)
- **Fallback**: Google Gemini
- Used for ingredient suggestions and recommendations

## 📄 License

MIT

## 👨‍💻 Developer

**Kian Naquines**
- Email: kjgnaquines@usm.edu.ph
- Software Developer & AI Enthusiast

---

Built with ❤️ using FastAPI
