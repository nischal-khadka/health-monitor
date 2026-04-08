from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.vitals import Vital
from app.schemas.vitals import VitalCreate, VitalResponse

router = APIRouter(prefix="/api/vitals", tags=["vitals"])


@router.post("/", response_model=VitalResponse, status_code=201)
def create_vital(payload: VitalCreate, db: Session = Depends(get_db)):
    record = Vital(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/latest", response_model=VitalResponse)
def get_latest(patient_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(Vital)
        .filter(Vital.patient_id == patient_id)
        .order_by(Vital.recorded_at.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="No vitals found")
    return record


@router.get("/{patient_id}", response_model=List[VitalResponse])
def get_history(patient_id: int, limit: int = 50, db: Session = Depends(get_db)):
    records = (
        db.query(Vital)
        .filter(Vital.patient_id == patient_id)
        .order_by(Vital.recorded_at.desc())
        .limit(limit)
        .all()
    )
    return records
