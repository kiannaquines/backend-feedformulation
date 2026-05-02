# Quick Reference - Backend API

## 🚀 Getting Started

```bash
# Setup (first time only)
./setup.sh

# Start server
source venv/bin/activate
python main.py

# Or with hot reload
uvicorn main:app --reload
```

## ⚙️ Configuration

```python
from core.config import settings

# Access any config
settings.APP_NAME
settings.DEBUG
settings.JWT_SECRET_KEY
settings.DATABASE_PATH
```

## 📝 API Responses

```python
from utils.response_helper import success_response, error_response, paginated_response

# Success
return success_response(
    data={"user": user},
    message="Success",
    status_code=200
)

# Error
return error_response(
    message="Not found",
    status_code=404
)

# Paginated
return paginated_response(
    items=users,
    total=100,
    page=1,
    page_size=10
)
```

## 📊 Logging

```python
from utils.logger import logger

logger.debug("Debug info")
logger.info("Info message")
logger.warning("Warning")
logger.error("Error occurred", exc_info=True)
```

## ✅ Validation

```python
from utils.validators import validate_email, validate_password_strength, sanitize_string

# Email
if not validate_email(email):
    return error_response("Invalid email")

# Password
is_valid, msg = validate_password_strength(password)
if not is_valid:
    return error_response(msg)

# Sanitize
clean_text = sanitize_string(user_input, max_length=100)
```

## 🗄️ Database

```python
from sqlalchemy.orm import Session
from api.deps import get_db

@router.get("/items")
def get_items(db: Session = Depends(get_db)):
    # Query
    items = db.query(Item).all()
    
    # Create
    new_item = Item(name="Test")
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    # Update
    item.name = "Updated"
    db.commit()
    
    # Delete
    db.delete(item)
    db.commit()
```

## 🔐 Authentication

```python
from api.deps import get_current_user, get_current_user_optional
from models.models import User

# Required auth
@router.get("/protected")
def protected(current_user: User = Depends(get_current_user)):
    return success_response(data=current_user)

# Optional auth
@router.get("/public")
def public(current_user: User | None = Depends(get_current_user_optional)):
    if current_user:
        # Authenticated
        pass
    else:
        # Anonymous
        pass
```

## 🛣️ Creating Routes

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.deps import get_db
from utils.response_helper import success_response

router = APIRouter(tags=["items"])

@router.get("/items")
def list_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return success_response(data={"items": items})

# Register in main.py
from routes.item_routes import router as item_router
app.include_router(item_router, prefix="/api/v1")
```

## 🗃️ Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# History
alembic history
```

## 🔧 Environment Variables

```bash
# .env file structure
APP_NAME="Feed Formulation API"
APP_PORT=8000
DEBUG=False

DATABASE_PATH=app_database.db

JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24

SMTP_USERNAME=email@gmail.com
SMTP_PASSWORD=app-password

GROQ_API_KEY=your-key
```

## 📁 File Structure

```
routes/          → Route handlers
models/          → Database models
schema/          → Pydantic schemas
core/            → Config & core services
utils/           → Helper functions
tests/           → Test files
middleware/      → Custom middleware
```

## 🧪 Testing

```bash
# Run all tests
pytest tests/

# Run specific test
pytest tests/test_email.py

# With coverage
pytest --cov=. tests/
```

## 📚 API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🆘 Common Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Generate JWT secret
openssl rand -hex 32

# Check Python packages
pip list

# Freeze requirements
pip freeze > requirements.txt

# Run server
python main.py
uvicorn main:app --reload
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 💡 Best Practices

1. ✅ Always use response helpers
2. ✅ Log important operations
3. ✅ Validate user input
4. ✅ Handle exceptions properly
5. ✅ Use type hints
6. ✅ Use dependencies (Depends)
7. ✅ Keep routes thin, logic in services
8. ✅ Test your code

## 📞 Help

See `API_GUIDE.md` for detailed documentation.

Contact: kjgnaquines@usm.edu.ph
