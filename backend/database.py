"""
database.py – SQLAlchemy models and engine setup for PrismGuard.

Tables created automatically on import:
  • prompts         – stores all prompt records (seed + admin-classified)
  • model_metadata  – one row per ML resource, tracks version/accuracy
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    Text,
    create_engine,
    func,
)
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# ---------------------------------------------------------------------------
# Load .env from the project root (one level above this file)
# ---------------------------------------------------------------------------
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_PROJECT_ROOT / ".env")

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
_db_path: str = os.getenv("DATABASE_PATH", "backend/prismguard.db")

# If the path is relative, resolve it against the project root so it works
# regardless of the working directory uvicorn is launched from.
if not os.path.isabs(_db_path):
    _db_path = str(_PROJECT_ROOT / _db_path)

# Ensure the parent directory exists
os.makedirs(os.path.dirname(_db_path), exist_ok=True)

engine = create_engine(
    f"sqlite:///{_db_path}",
    connect_args={"check_same_thread": False},
)


# ---------------------------------------------------------------------------
# Declarative base
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    text = Column(Text, nullable=False)
    resource = Column(Text, nullable=False)
    label = Column(Integer, default=0)          # 0 = safe, 1 = malicious
    category = Column(Text, nullable=True)
    risk = Column(Text, default="Low")
    source = Column(Text, default="seed")       # 'seed' | 'admin'
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())


class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, autoincrement=True)
    resource = Column(Text, nullable=False, unique=True)
    version = Column(Text, default="v1.0")
    status = Column(Text, default="Active")
    training_samples = Column(Integer, default=0)
    detection_accuracy = Column(Float, default=0.0)
    last_trained = Column(DateTime, nullable=True)
    attacks_detected = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())


# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# Dependency helper (used by FastAPI route handlers)
# ---------------------------------------------------------------------------
def get_db():
    """Yield a database session and close it when the request is done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
