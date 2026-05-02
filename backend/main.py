from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import *
from schema.schema import *
from core.config import settings

from routes.authentication_routes import auth_router
from routes.feed_formulation_routes import feed_formulation_router
from routes.root_routes import root_router
from routes.ingredient_routes import ingredient_router
from routes.nutrient_requirements_routes import nutrient_requirements_router

app = FastAPI(
    title=settings.APP_NAME,
    description="API for feed formulation and management with user authentication and OTP security",
    version=settings.APP_VERSION,
    contact={"name": "Kian Naquines", "email": "kjgnaquines@usm.edu.ph"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

app.include_router(root_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(feed_formulation_router, prefix="/api/v1")
app.include_router(ingredient_router, prefix="/api/v1")
app.include_router(nutrient_requirements_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.APP_HOST, port=settings.APP_PORT)
