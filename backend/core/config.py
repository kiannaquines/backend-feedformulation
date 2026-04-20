import hashlib
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DATABASE_PATH = "app_database.db"
JWT_SECRET_KEY = hashlib.sha256(b"feed_formulation_secret_key_1234567890").hexdigest()
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
NEXT_OTP_INTERVAL = 60
TOP_MAX_DIGIT = 6
OTP_IS_ENABLED = False
OTP_SESSION_EXPIRATION_MINUTES = 10

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your-app-password")
EMAIL_FROM = os.getenv("EMAIL_FROM", "your-email@gmail.com")
EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "Feed Formulation System")


# Hi, I’m Kian Naquines — a software developer and AI enthusiast who loves turning complex ideas into practical, working systems. I’ve built projects ranging from AI-powered monitoring tools to backend systems using FastAPI, including a feed formulation app that uses Linear Programming to optimize cost and nutrition. I enjoy exploring how data, optimization, and automation can solve real-world problems. I’m always learning, refining my craft, and building things that make an impact — clean, efficient, and built with purpose.