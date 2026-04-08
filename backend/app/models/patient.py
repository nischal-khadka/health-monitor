from sqlalchemy import Column, Integer, String, DateTime, func
from app.db.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    age        = Column(Integer, nullable=False)
    gender     = Column(String(10), nullable=False)   # Male / Female / Other
    ward       = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
