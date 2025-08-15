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

@router.get("/", response_model=List[schemas.Question])
def list_questions(checkin_id: int, db: Session = Depends(get_db)):
    return db.query(models.Question).filter(models.Question.checkin_id == checkin_id).order_by(models.Question.order).all()

@router.get("/{question_id}", response_model=schemas.Question)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@router.post("/", response_model=schemas.Question)
def create_question(question: schemas.QuestionCreate, checkin_id: int, db: Session = Depends(get_db)):
    db_question = models.Question(**question.dict(), checkin_id=checkin_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.put("/{question_id}", response_model=schemas.Question)
def update_question(question_id: int, question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    for k, v in question.dict().items():
        setattr(db_question, k, v)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.delete("/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(db_question)
    db.commit()
    return {"ok": True} 