from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

from .database import Base


# from .database import Base
# Base = declarative_base()
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    discord_id = Column(String(32), unique=True, index=True, nullable=False)
    username = Column(String(64))
    display_name = Column(String(128))
    avatar_url = Column(String(256))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    responses = relationship('Response', back_populates='user')
    checkins = relationship('CheckinUser', back_populates='user')

class Checkin(Base):
    __tablename__ = 'checkins'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    channel_id = Column(String(32), nullable=False)
    schedule_time = Column(Time, nullable=False)
    post_time = Column(Time, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    questions = relationship('Question', back_populates='checkin', cascade='all, delete')
    users = relationship('CheckinUser', back_populates='checkin', cascade='all, delete')
    responses = relationship('Response', back_populates='checkin')

class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True, index=True)
    checkin_id = Column(Integer, ForeignKey('checkins.id'), nullable=False)
    question_text = Column(Text, nullable=False)
    order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    checkin = relationship('Checkin', back_populates='questions')
    responses = relationship('Response', back_populates='question')

class CheckinUser(Base):
    __tablename__ = 'checkin_users'
    id = Column(Integer, primary_key=True, index=True)
    checkin_id = Column(Integer, ForeignKey('checkins.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    checkin = relationship('Checkin', back_populates='users')
    user = relationship('User', back_populates='checkins')

class Response(Base):
    __tablename__ = 'responses'
    id = Column(Integer, primary_key=True, index=True)
    checkin_id = Column(Integer, ForeignKey('checkins.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    response_text = Column(Text, nullable=False)
    response_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    checkin = relationship('Checkin', back_populates='responses')
    user = relationship('User', back_populates='responses')
    question = relationship('Question', back_populates='responses')
