# Copilot Instructions - Feed Formulation System

This document provides context and guidance for GitHub Copilot when working with the Feed Formulation System codebase.

## 📚 Project Documentation

### Backend Documentation

The backend documentation is comprehensive and should be consulted for all backend-related tasks:

- **[backend/README.md](../backend/README.md)** - Complete backend documentation including:
  - Project structure overview
  - Getting started guide
  - Installation instructions
  - Configuration documentation
  - API documentation links
  - Testing guide
  - Development workflow

- **[backend/API_GUIDE.md](../backend/API_GUIDE.md)** - Comprehensive developer guide:
  - Configuration usage with Pydantic Settings
  - Utility functions (response helpers, logging, validators)
  - Step-by-step route creation guide
  - Database operations and migrations
  - Best practices and patterns
  - Code examples for common tasks

- **[backend/QUICK_REFERENCE.md](../backend/QUICK_REFERENCE.md)** - Quick reference for:
  - Common commands and operations
  - Configuration access
  - API response formats
  - Database queries
  - Authentication patterns
  - Validation helpers

- **[backend/CHANGELOG.md](../backend/CHANGELOG.md)** - Detailed change log:
  - Version history
  - Configuration improvements
  - Repository structure changes
  - Migration notes
  - Breaking changes

- **[backend/IMPROVEMENTS_SUMMARY.md](../backend/IMPROVEMENTS_SUMMARY.md)** - Summary of recent improvements:
  - Configuration management enhancements
  - Repository structure reorganization
  - New utility functions
  - Documentation additions

### Frontend Documentation

- **[frontend/AUTH_SYSTEM.md](../frontend/AUTH_SYSTEM.md)** - Authentication system documentation
- **[frontend/TOAST_USAGE.md](../frontend/TOAST_USAGE.md)** - Toast notification usage
- **[ADMIN_DASHBOARD.md](../ADMIN_DASHBOARD.md)** - Admin dashboard documentation
- **[INGREDIENTS_UI.md](../INGREDIENTS_UI.md)** - Ingredients UI documentation

### General Documentation

- **[README.md](../README.md)** - Main project README
- **[QUICKSTART.md](../QUICKSTART.md)** - Quick start guide
- **[IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)** - Implementation overview

## 🎯 Development Guidelines

### Backend Development

When working on backend code, always:

1. **Use Pydantic Settings for Configuration**
   ```python
   from core.config import settings
   app_name = settings.APP_NAME
   ```

2. **Use Standardized Response Helpers**
   ```python
   from utils.response_helper import success_response, error_response
   return success_response(data=user, message="Success")
   ```

3. **Use Application Logger**
   ```python
   from utils.logger import logger
   logger.info("Operation completed")
   ```

4. **Validate User Input**
   ```python
   from utils.validators import validate_email, validate_password_strength
   if not validate_email(email):
       return error_response("Invalid email")
   ```

5. **Follow RESTful Patterns**
   - GET for retrieving data
   - POST for creating resources
   - PUT/PATCH for updating
   - DELETE for removing

6. **Use Type Hints**
   ```python
   def get_user(user_id: int, db: Session) -> User | None:
       return db.query(User).filter(User.id == user_id).first()
   ```

7. **Handle Exceptions Properly**
   ```python
   try:
       db.commit()
   except Exception as e:
       logger.error(f"Error: {str(e)}", exc_info=True)
       db.rollback()
       return error_response("Operation failed")
   ```

### Frontend Development

When working on frontend code:

1. **Use shadcn/ui Components** - Refer to components.json
2. **Follow Authentication Patterns** - See AUTH_SYSTEM.md
3. **Use Toast Notifications** - See TOAST_USAGE.md
4. **Maintain TypeScript Types** - Always type your components and functions

## 🏗️ Project Structure

### Backend Structure

```
backend/
├── alembic/              # Database migrations
├── api/                  # API dependencies
├── core/                 # Core configuration and services
│   ├── config.py        # Pydantic Settings configuration
│   ├── authentication.py # Auth utilities
│   ├── ai_service.py    # AI service integration
│   ├── email.py         # Email service
│   └── otp.py           # OTP functionality
├── db/                   # Database setup
├── models/               # SQLAlchemy models
├── routes/               # API route handlers
├── schema/               # Pydantic schemas
├── services/             # Business logic services
├── utils/                # Utility functions
│   ├── response_helper.py  # Standardized API responses
│   ├── logger.py           # Logging utilities
│   └── validators.py       # Input validation
├── middleware/           # Custom middleware
├── tests/                # Test files
└── main.py              # Application entry point
```

### Frontend Structure

```
frontend/
├── src/
│   ├── app/             # Application pages
│   ├── components/      # React components
│   ├── contexts/        # React contexts (AuthContext)
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities (api.ts, utils.ts)
└── public/              # Static assets
```

## 🔑 Key Concepts

### Backend

1. **Configuration Management**
   - All config in `.env` file
   - Accessed via `settings` object from `core.config`
   - Type-safe with Pydantic validation

2. **Database Operations**
   - SQLAlchemy ORM
   - Alembic for migrations
   - Session management via dependency injection

3. **Authentication**
   - JWT-based authentication
   - Optional OTP verification
   - Dependency injection for protected routes

4. **AI Integration**
   - Primary: Groq (fast LLaMA inference)
   - Fallback: Google Gemini
   - Used for ingredient suggestions

### Frontend

1. **State Management**
   - React Context for auth state
   - Local state for component-specific data

2. **API Communication**
   - Centralized in `lib/api.ts`
   - Axios for HTTP requests
   - JWT token management

3. **UI Components**
   - shadcn/ui component library
   - Tailwind CSS for styling
   - Responsive design patterns

## 🛠️ Common Tasks

### Adding a New Backend Route

See [backend/API_GUIDE.md](../backend/API_GUIDE.md) for detailed steps:
1. Define Pydantic schema in `schema/schema.py`
2. Create database model in `models/models.py`
3. Create route handler in `routes/`
4. Register router in `main.py`

### Adding a New Frontend Page

1. Create page component in `src/app/`
2. Add route in routing configuration
3. Use shadcn/ui components
4. Connect to API via `lib/api.ts`

### Running Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

## 📝 Code Style

### Backend (Python)

- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use docstrings for functions and classes
- Import order: standard library, third-party, local

### Frontend (TypeScript/React)

- Use functional components
- Use TypeScript for all files
- Follow React best practices
- Use meaningful component and variable names
- Extract reusable logic into custom hooks

## 🔐 Security Considerations

- Never commit `.env` files
- Always validate user input
- Use parameterized queries (SQLAlchemy ORM)
- Implement proper authentication checks
- Sanitize user-generated content
- Use HTTPS in production

## 🧪 Testing

### Backend

```bash
pytest tests/
```

### Frontend

```bash
npm test
```

## 📞 Support

- **Developer**: Kian Naquines
- **Email**: kjgnaquines@usm.edu.ph

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [React Documentation](https://react.dev/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

**Note to Copilot**: When suggesting code or solutions, always reference the appropriate documentation files listed above and follow the established patterns and best practices documented in the project.
