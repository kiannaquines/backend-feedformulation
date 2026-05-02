# API Development Guide

## Table of Contents
1. [Configuration](#configuration)
2. [Utility Functions](#utility-functions)
3. [Creating New Routes](#creating-new-routes)
4. [Database Operations](#database-operations)
5. [Best Practices](#best-practices)
6. [Common Patterns](#common-patterns)

## Configuration

### Using Settings

The application uses Pydantic Settings for configuration management. All settings are typed and validated.

```python
from core.config import settings

# Access configuration
app_name = settings.APP_NAME
debug_mode = settings.DEBUG
jwt_secret = settings.JWT_SECRET_KEY

# CORS origins (automatically parsed from JSON)
cors_origins = settings.CORS_ORIGINS  # Returns a list
```

### Environment Variables

All configuration is loaded from `.env` file. See `.env.example` for all available options.

```bash
# Generate a secure JWT secret key
openssl rand -hex 32
```

## Utility Functions

### Standardized API Responses

Use response helpers for consistent API responses:

```python
from utils.response_helper import success_response, error_response, paginated_response

# Success response
@router.get("/users/{user_id}")
def get_user(user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return error_response(
            message="User not found",
            status_code=404
        )
    
    return success_response(
        data={"user": user},
        message="User retrieved successfully"
    )

# Paginated response
@router.get("/users")
def list_users(page: int = 1, page_size: int = 10):
    total = db.query(User).count()
    users = db.query(User).offset((page - 1) * page_size).limit(page_size).all()
    
    return paginated_response(
        items=users,
        total=total,
        page=page,
        page_size=page_size,
        message="Users retrieved successfully"
    )
```

### Logging

```python
from utils.logger import logger

# Log at different levels
logger.debug("Debug information")
logger.info("Operation completed successfully")
logger.warning("This might be a problem")
logger.error("An error occurred", exc_info=True)

# With context
logger.info(f"User {user_id} logged in from {ip_address}")
```

### Input Validation

```python
from utils.validators import validate_email, validate_password_strength, sanitize_string

# Email validation
@router.post("/register")
def register(email: str, password: str):
    if not validate_email(email):
        return error_response("Invalid email format")
    
    # Password strength validation
    is_valid, error_msg = validate_password_strength(password)
    if not is_valid:
        return error_response(error_msg)
    
    # Sanitize user input
    username = sanitize_string(username, max_length=50)
    
    # Continue with registration...
```

## Creating New Routes

### Step-by-Step Guide

1. **Define Pydantic Schema** (`schema/schema.py`):

```python
from pydantic import BaseModel, Field

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    price: float = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: float
    stock: int
    created_at: str
    
    class Config:
        from_attributes = True
```

2. **Create Database Model** (`models/models.py`):

```python
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from db.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500))
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

3. **Create Route Handler** (`routes/product_routes.py`):

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.deps import get_db, get_current_user
from models.models import Product, User
from schema.schema import ProductCreate, ProductResponse
from utils.response_helper import success_response, error_response
from utils.logger import logger

router = APIRouter(tags=["products"])

@router.post("/products", response_model=dict)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new product"""
    try:
        # Create product
        db_product = Product(**product.dict())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        logger.info(f"Product {db_product.id} created by user {current_user.id}")
        
        return success_response(
            data={"product": ProductResponse.from_orm(db_product)},
            message="Product created successfully",
            status_code=201
        )
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}", exc_info=True)
        db.rollback()
        return error_response(
            message="Failed to create product",
            status_code=500
        )

@router.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        return error_response(
            message="Product not found",
            status_code=404
        )
    
    return success_response(
        data={"product": ProductResponse.from_orm(product)}
    )

@router.get("/products")
def list_products(
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    """List all products with pagination"""
    total = db.query(Product).count()
    products = db.query(Product)\
        .offset((page - 1) * page_size)\
        .limit(page_size)\
        .all()
    
    return paginated_response(
        items=[ProductResponse.from_orm(p) for p in products],
        total=total,
        page=page,
        page_size=page_size
    )
```

4. **Register Router** (`main.py`):

```python
from routes.product_routes import router as product_router

app.include_router(product_router, prefix="/api/v1")
```

## Database Operations

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Add products table"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View migration history
alembic history
```

### Common Database Patterns

```python
# Create
new_item = Model(**data)
db.add(new_item)
db.commit()
db.refresh(new_item)

# Read
item = db.query(Model).filter(Model.id == id).first()
items = db.query(Model).all()
items = db.query(Model).limit(10).all()

# Update
item = db.query(Model).filter(Model.id == id).first()
item.field = new_value
db.commit()

# Delete
item = db.query(Model).filter(Model.id == id).first()
db.delete(item)
db.commit()

# Transaction with rollback
try:
    # operations
    db.commit()
except Exception as e:
    db.rollback()
    raise
```

## Best Practices

### 1. Always Use Response Helpers

```python
# ✅ Good
return success_response(data=user)

# ❌ Bad
return {"user": user}
```

### 2. Use Logging

```python
# ✅ Good
from utils.logger import logger
logger.info(f"User {user_id} performed action")

# ❌ Bad
print(f"User {user_id} performed action")
```

### 3. Validate Input

```python
# ✅ Good
if not validate_email(email):
    return error_response("Invalid email")

# ❌ Bad (assuming input is valid)
user = create_user(email)
```

### 4. Handle Exceptions

```python
# ✅ Good
try:
    # database operation
    db.commit()
except Exception as e:
    logger.error(f"Error: {str(e)}", exc_info=True)
    db.rollback()
    return error_response("Operation failed")

# ❌ Bad (letting exceptions propagate)
db.commit()  # Could fail
```

### 5. Use Type Hints

```python
# ✅ Good
def get_user(user_id: int, db: Session) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

# ❌ Bad
def get_user(user_id, db):
    return db.query(User).filter(User.id == user_id).first()
```

### 6. Use Dependencies

```python
# ✅ Good
@router.get("/protected")
def protected_route(current_user: User = Depends(get_current_user)):
    return success_response(data=current_user)

# ❌ Bad (manual authentication)
@router.get("/protected")
def protected_route(token: str):
    user = verify_token(token)  # Repeated code
    return {"user": user}
```

## Common Patterns

### Authentication Required

```python
from api.deps import get_current_user

@router.post("/items")
def create_item(
    item: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only authenticated users can access this
    pass
```

### Optional Authentication

```python
from api.deps import get_current_user_optional

@router.get("/items")
def list_items(
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # Both authenticated and anonymous users can access
    if current_user:
        # Show personalized results
        pass
    else:
        # Show public results
        pass
```

### Error Handling Decorator

```python
from functools import wraps
from utils.response_helper import error_response
from utils.logger import logger

def handle_errors(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {str(e)}", exc_info=True)
            return error_response("Internal server error", status_code=500)
    return wrapper

@router.get("/risky-operation")
@handle_errors
def risky_operation():
    # This will automatically catch and handle errors
    pass
```

### Query Parameters with Defaults

```python
from typing import Optional

@router.get("/search")
def search_items(
    q: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db)
):
    query = db.query(Item)
    
    if q:
        query = query.filter(Item.name.ilike(f"%{q}%"))
    
    # Sorting
    if order == "desc":
        query = query.order_by(getattr(Item, sort_by).desc())
    else:
        query = query.order_by(getattr(Item, sort_by).asc())
    
    # Pagination
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return paginated_response(items, total, page, page_size)
```

---

## Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/
- **Pydantic Documentation**: https://docs.pydantic.dev/

## Need Help?

Contact: **Kian Naquines** (kjgnaquines@usm.edu.ph)
