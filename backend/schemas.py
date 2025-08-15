# from pydantic import BaseModel, Field
# from typing import List, Optional
# from datetime import datetime, time

# class UserBase(BaseModel):
#     discord_id: str
#     username: Optional[str] = None
#     display_name: Optional[str] = None
#     avatar_url: Optional[str] = None

# class UserCreate(UserBase):
#     pass

# class User(UserBase):
#     id: int
#     created_at: Optional[datetime]
#     updated_at: Optional[datetime]
#     class Config:
#         orm_mode = True

# class QuestionBase(BaseModel):
#     question_text: str
#     order: int = 0

# class QuestionCreate(QuestionBase):
#     pass

# class Question(QuestionBase):
#     id: int
#     checkin_id: int
#     created_at: Optional[datetime]
#     class Config:
#         orm_mode = True

# class CheckinBase(BaseModel):
#     name: str
#     channel_id: str
#     schedule_time: time
#     post_time: Optional[time] = None

# class CheckinCreate(CheckinBase):
#     pass

# class Checkin(CheckinBase):
#     id: int
#     created_at: Optional[datetime]
#     updated_at: Optional[datetime]
#     questions: List[Question] = []
#     class Config:
#         orm_mode = True

# class CheckinUserBase(BaseModel):
#     checkin_id: int
#     user_id: int

# class CheckinUserCreate(CheckinUserBase):
#     pass

# class CheckinUser(CheckinUserBase):
#     id: int
#     user: User
#     class Config:
#         orm_mode = True

# class ResponseBase(BaseModel):
#     checkin_id: int
#     user_id: int
#     question_id: int
#     response_text: str
#     response_date: Optional[datetime] = None

# class ResponseCreate(ResponseBase):
#     pass

# class Response(ResponseBase):
#     id: int
#     created_at: Optional[datetime]
#     user: User
#     question: Question
#     class Config:
#         orm_mode = True


from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, time

class UserBase(BaseModel):
    discord_id: str
    username: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True  # ✅ Updated for Pydantic v2

class QuestionBase(BaseModel):
    question_text: str
    order: int = 0

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    checkin_id: int
    created_at: Optional[datetime]
    class Config:
        from_attributes = True  # ✅

class CheckinBase(BaseModel):
    name: str
    channel_id: str
    schedule_time: time
    post_time: Optional[time] = None

class CheckinCreate(CheckinBase):
    pass

class Checkin(CheckinBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    questions: List[Question] = []
    class Config:
        from_attributes = True  # ✅

class CheckinUserBase(BaseModel):
    checkin_id: int
    user_id: int

class CheckinUserCreate(CheckinUserBase):
    pass

class CheckinUser(CheckinUserBase):
    id: int
    user: User
    class Config:
        from_attributes = True  # ✅

class ResponseBase(BaseModel):
    checkin_id: int
    user_id: int
    question_id: int
    response_text: str
    response_date: Optional[datetime] = None

class ResponseCreate(ResponseBase):
    pass

class Response(ResponseBase):
    id: int
    created_at: Optional[datetime]
    user: User
    question: Question
    class Config:
        from_attributes = True  # ✅
