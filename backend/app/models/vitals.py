from sqlalchemy import Column, Integer, Float, DateTime, func
from app.db.database import Base


class Vital(Base):
    __tablename__ = "vitals"

    id          = Column(Integer, primary_key=True, index=True)
    patient_id  = Column(Integer, index=True, nullable=False)
    heart_rate  = Column(Integer, nullable=False)       # bpm
    spo2        = Column(Integer, nullable=False)       # %
    temperature = Column(Float, nullable=False)         # Celsius
    recorded_at = Column(DateTime, server_default=func.now(), index=True)
