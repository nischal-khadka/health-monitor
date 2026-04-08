from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PatientCreate(BaseModel):
    name:   str
    age:    int
    gender: str
    ward:   Optional[str] = None


class PatientResponse(PatientCreate):
    id:         int
    created_at: datetime

    model_config = {"from_attributes": True}
