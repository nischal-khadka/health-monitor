from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models.vitals import Vital
from app.schemas.vitals import VitalCreate, VitalResponse
from app.core.security import get_current_user
from app.core.alerts import check_alerts

router = APIRouter(prefix="/api/vitals", tags=["vitals"])


@router.post("/", response_model=VitalResponse, status_code=201)
def create_vital(payload: VitalCreate, db: Session = Depends(get_db)):
    # ESP32 posts here — no auth required so device doesn't need a token
    record = Vital(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/latest", response_model=VitalResponse)
def get_latest(patient_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    record = (
        db.query(Vital)
        .filter(Vital.patient_id == patient_id)
        .order_by(Vital.recorded_at.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="No vitals found")
    return record


@router.get("/alerts")
def get_alerts(patient_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    record = (
        db.query(Vital)
        .filter(Vital.patient_id == patient_id)
        .order_by(Vital.recorded_at.desc())
        .first()
    )
    if not record:
        return {"alerts": []}
    alerts = check_alerts(record.heart_rate, record.spo2, record.temperature)
    return {"alerts": alerts, "checked_at": record.recorded_at}


@router.get("/{patient_id}", response_model=List[VitalResponse])
def get_history(
    patient_id: int,
    limit: int = 50,
    from_date: Optional[datetime] = Query(None, description="Filter from this datetime (ISO 8601)"),
    to_date:   Optional[datetime] = Query(None, description="Filter to this datetime (ISO 8601)"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Vital).filter(Vital.patient_id == patient_id)

    if from_date:
        q = q.filter(Vital.recorded_at >= from_date)
    if to_date:
        q = q.filter(Vital.recorded_at <= to_date)

    return q.order_by(Vital.recorded_at.desc()).limit(limit).all()
