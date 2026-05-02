import os
import json
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field, validator
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """
    Application Settings using Pydantic BaseSettings for automatic env loading
    and validation. All settings are loaded from environment variables.
    """
    
    # ==========================================
    # APPLICATION SETTINGS
    # ==========================================
    APP_NAME: str = Field(default="Feed Formulation API", description="Application name")
    APP_VERSION: str = Field(default="1.0.0", description="Application version")
    APP_HOST: str = Field(default="0.0.0.0", description="Host to bind the application")
    APP_PORT: int = Field(default=8000, description="Port to run the application")
    DEBUG: bool = Field(default=False, description="Debug mode")
    ENVIRONMENT: str = Field(default="development", description="Environment (development, production)")
    
    # ==========================================
    # DATABASE CONFIGURATION
    # ==========================================
    DATABASE_PATH: str = Field(default="app_database.db", description="SQLite database file path")
    
    # ==========================================
    # JWT & SECURITY SETTINGS
    # ==========================================
    JWT_SECRET_KEY: str = Field(
        default="change-this-to-a-secure-secret-key",
        description="JWT secret key for token signing"
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    JWT_EXPIRATION_HOURS: int = Field(default=24, description="JWT token expiration in hours")
    
    # ==========================================
    # OTP CONFIGURATION
    # ==========================================
    OTP_IS_ENABLED: bool = Field(default=False, description="Enable OTP authentication")
    OTP_SESSION_EXPIRATION_MINUTES: int = Field(default=10, description="OTP session expiration")
    OTP_MAX_DIGIT: int = Field(default=6, description="Number of digits in OTP")
    OTP_INTERVAL_SECONDS: int = Field(default=60, description="Seconds between OTP resend")
    
    # ==========================================
    # EMAIL/SMTP CONFIGURATION
    # ==========================================
    SMTP_SERVER: str = Field(default="smtp.gmail.com", description="SMTP server address")
    SMTP_PORT: int = Field(default=587, description="SMTP server port")
    SMTP_USERNAME: str = Field(default="your-email@gmail.com", description="SMTP username")
    SMTP_PASSWORD: str = Field(default="", description="SMTP password or app password")
    EMAIL_FROM: str = Field(default="your-email@gmail.com", description="From email address")
    EMAIL_FROM_NAME: str = Field(default="Feed Formulation System", description="From email name")
    
    # ==========================================
    # AI SERVICE CONFIGURATION
    # ==========================================
    GROQ_API_KEY: str = Field(default="", description="Groq API key for AI services")
    GOOGLE_API_KEY: str = Field(default="", description="Google Gemini API key")
    GROQ_MODEL: str = Field(default="llama-3.3-70b-versatile", description="Groq model name")
    GEMINI_MODEL: str = Field(default="gemini-1.5-flash", description="Gemini model name")
    
    # ==========================================
    # CORS CONFIGURATION
    # ==========================================
    CORS_ORIGINS: str = Field(
        default='["http://localhost:3000","http://localhost:5173","http://localhost:8080"]',
        description="Allowed CORS origins as JSON array string"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True, description="Allow credentials in CORS")
    CORS_ALLOW_METHODS: str = Field(default='["*"]', description="Allowed HTTP methods")
    CORS_ALLOW_HEADERS: str = Field(default='["*"]', description="Allowed HTTP headers")
    
    @validator("CORS_ORIGINS", "CORS_ALLOW_METHODS", "CORS_ALLOW_HEADERS", pre=True)
    def parse_json_list(cls, v):
        """Parse JSON string to list for CORS settings"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v] if v else ["*"]
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Create a global settings instance
settings = Settings()

# Legacy compatibility: export individual variables for backward compatibility
DATABASE_PATH = settings.DATABASE_PATH
JWT_SECRET_KEY = settings.JWT_SECRET_KEY
JWT_ALGORITHM = settings.JWT_ALGORITHM
JWT_EXPIRATION_HOURS = settings.JWT_EXPIRATION_HOURS
NEXT_OTP_INTERVAL = settings.OTP_INTERVAL_SECONDS  # Keep old name for compatibility
TOP_MAX_DIGIT = settings.OTP_MAX_DIGIT  # Keep old name for compatibility
OTP_IS_ENABLED = settings.OTP_IS_ENABLED
OTP_SESSION_EXPIRATION_MINUTES = settings.OTP_SESSION_EXPIRATION_MINUTES

# Email Configuration
SMTP_SERVER = settings.SMTP_SERVER
SMTP_PORT = settings.SMTP_PORT
SMTP_USERNAME = settings.SMTP_USERNAME
SMTP_PASSWORD = settings.SMTP_PASSWORD
EMAIL_FROM = settings.EMAIL_FROM
EMAIL_FROM_NAME = settings.EMAIL_FROM_NAME


# Hi, I'm Kian Naquines — a software developer and AI enthusiast who loves turning complex ideas into practical, working systems. I've built projects ranging from AI-powered monitoring tools to backend systems using FastAPI, including a feed formulation app that uses Linear Programming to optimize cost and nutrition. I enjoy exploring how data, optimization, and automation can solve real-world problems. I'm always learning, refining my craft, and building things that make an impact — clean, efficient, and built with purpose.
