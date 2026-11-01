import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from urllib.parse import quote_plus

# ---------------------------------------------------------
# LOAD .ENV FROM BACKEND FOLDER
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

# ---------------------------------------------------------
# MYSQL CONFIGURATION
# ---------------------------------------------------------

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "dropout_prediction")

# Safely handle special characters in MySQL password
encoded_password = quote_plus(DB_PASSWORD)

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{encoded_password}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# ---------------------------------------------------------
# DATABASE ENGINE
# ---------------------------------------------------------

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=280,
    echo=False
)

# ---------------------------------------------------------
# SESSION
# ---------------------------------------------------------

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)

# ---------------------------------------------------------
# BASE MODEL
# ---------------------------------------------------------

Base = declarative_base()

# ---------------------------------------------------------
# DATABASE DEPENDENCY
# ---------------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()