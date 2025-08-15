from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from backend import models, schemas, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.Response])
def list_responses(checkin_id: Optional[int] = None, response_date: Optional[date] = None, db: Session = Depends(get_db)):
    q = db.query(models.Response)
    if checkin_id:
        q = q.filter(models.Response.checkin_id == checkin_id)
    if response_date:
        q = q.filter(models.Response.response_date >= datetime.combine(response_date, datetime.min.time()),
                     models.Response.response_date <= datetime.combine(response_date, datetime.max.time()))
    return q.all()

@router.get("/{response_id}", response_model=schemas.Response)
def get_response(response_id: int, db: Session = Depends(get_db)):
    response = db.query(models.Response).filter(models.Response.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response

@router.post("/", response_model=schemas.Response)
def create_response(response: schemas.ResponseCreate, db: Session = Depends(get_db)):
    db_response = models.Response(**response.dict())
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    return db_response

@router.put("/{response_id}", response_model=schemas.Response)
def update_response(response_id: int, response: schemas.ResponseCreate, db: Session = Depends(get_db)):
    db_response = db.query(models.Response).filter(models.Response.id == response_id).first()
    if not db_response:
        raise HTTPException(status_code=404, detail="Response not found")
    for k, v in response.dict().items():
        setattr(db_response, k, v)
    db.commit()
    db.refresh(db_response)
    return db_response

@router.delete("/{response_id}")
def delete_response(response_id: int, db: Session = Depends(get_db)):
    db_response = db.query(models.Response).filter(models.Response.id == response_id).first()
    if not db_response:
        raise HTTPException(status_code=404, detail="Response not found")
    db.delete(db_response)
    db.commit()
    return {"ok": True} 