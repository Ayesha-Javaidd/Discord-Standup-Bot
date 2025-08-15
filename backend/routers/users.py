from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.User])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.get("/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    for k, v in user.dict().items():
        setattr(db_user, k, v)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"ok": True}

# CheckinUser endpoints
@router.post("/add_to_checkin/")
def add_user_to_checkin(user_id: int, checkin_id: int, db: Session = Depends(get_db)):
    exists = db.query(models.CheckinUser).filter_by(user_id=user_id, checkin_id=checkin_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="User already in checkin")
    cu = models.CheckinUser(user_id=user_id, checkin_id=checkin_id)
    db.add(cu)
    db.commit()
    return {"ok": True}

@router.delete("/remove_from_checkin/")
def remove_user_from_checkin(user_id: int, checkin_id: int, db: Session = Depends(get_db)):
    cu = db.query(models.CheckinUser).filter_by(user_id=user_id, checkin_id=checkin_id).first()
    if not cu:
        raise HTTPException(status_code=404, detail="User not in checkin")
    db.delete(cu)
    db.commit()
    return {"ok": True}

@router.get("/by_checkin/{checkin_id}", response_model=List[schemas.User])
def list_users_for_checkin(checkin_id: int, db: Session = Depends(get_db)):
    cu_list = db.query(models.CheckinUser).filter_by(checkin_id=checkin_id).all()
    user_ids = [cu.user_id for cu in cu_list]
    return db.query(models.User).filter(models.User.id.in_(user_ids)).all() 