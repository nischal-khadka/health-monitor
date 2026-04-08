from pydantic import BaseModel, Field
from datetime import datetime


class VitalCreate(BaseModel):
    patient_id: int
    heart_rate: int  = Field(..., ge=0, le=300)
    spo2:       int  = Field(..., ge=0, le=100)
    temperature: float = Field(..., ge=20.0, le=45.0)


class VitalResponse(VitalCreate):
    id:          int
    recorded_at: datetime

    model_config = {"from_attributes": True}
