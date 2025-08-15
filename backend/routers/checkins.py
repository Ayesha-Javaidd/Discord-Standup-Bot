from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas, database

router = APIRouter()

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.Checkin])
def list_checkins(db: Session = Depends(get_db)):
    return db.query(models.Checkin).all()

@router.get("/{checkin_id}", response_model=schemas.Checkin)
def get_checkin(checkin_id: int, db: Session = Depends(get_db)):
    checkin = db.query(models.Checkin).filter(models.Checkin.id == checkin_id).first()
    if not checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")
    return checkin

@router.get("/{checkin_id}/full")
def get_checkin_full(checkin_id: int, db: Session = Depends(get_db)):
    checkin = db.query(models.Checkin).filter(models.Checkin.id == checkin_id).first()
    if not checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")
    # Get questions
    questions = db.query(models.Question).filter(models.Question.checkin_id == checkin_id).order_by(models.Question.order).all()
    # Get users
    cu_list = db.query(models.CheckinUser).filter_by(checkin_id=checkin_id).all()
    user_ids = [cu.user_id for cu in cu_list]
    users = db.query(models.User).filter(models.User.id.in_(user_ids)).all()
    return {
        "checkin": schemas.Checkin.from_orm(checkin),
        "questions": [schemas.Question.from_orm(q) for q in questions],
        "users": [schemas.User.from_orm(u) for u in users],
    }

@router.post("/", response_model=schemas.Checkin)
def create_checkin(checkin: schemas.CheckinCreate, db: Session = Depends(get_db)):
    db_checkin = models.Checkin(**checkin.dict())
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

@router.put("/{checkin_id}", response_model=schemas.Checkin)
def update_checkin(checkin_id: int, checkin: schemas.CheckinCreate, db: Session = Depends(get_db)):
    db_checkin = db.query(models.Checkin).filter(models.Checkin.id == checkin_id).first()
    if not db_checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")
    for k, v in checkin.dict().items():
        setattr(db_checkin, k, v)
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

@router.delete("/{checkin_id}")
def delete_checkin(checkin_id: int, db: Session = Depends(get_db)):
    db_checkin = db.query(models.Checkin).filter(models.Checkin.id == checkin_id).first()
    if not db_checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")
    db.delete(db_checkin)
    db.commit()
    return {"ok": True} 