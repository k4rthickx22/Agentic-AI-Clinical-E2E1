import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Default to SQLite — creates clinic.db automatically, no server needed.
# Override by setting DATABASE_URL in backend/.env
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./clinic.db"
)

# SQLite needs check_same_thread=False for multi-threaded FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)