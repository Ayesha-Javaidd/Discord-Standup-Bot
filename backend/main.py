# import os
# from fastapi import FastAPI, Depends, HTTPException, status, Request
# from fastapi.security.api_key import APIKeyHeader
# from dotenv import load_dotenv
# from backend.routers import checkins, questions, users, responses
# from backend import models, schemas, database

# from fastapi.middleware.cors import CORSMiddleware

# load_dotenv()

# API_KEY = "SDASDSADWQRGHY"
# API_KEY_NAME = 'X-API-KEY'
# api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
# origins = ["*"]

# def get_api_key(api_key_header: str = Depends(api_key_header)):
#     print("Received API key:", api_key_header)  # Add this line to debug
#     if api_key_header == API_KEY:
#         return api_key_header
#     raise HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Invalid or missing API Key",
#     )


# # def get_api_key(api_key_header: str = Depends(api_key_header)):
# #     if api_key_header == API_KEY:
# #         return api_key_header
# #     raise HTTPException(
# #         status_code=status.HTTP_401_UNAUTHORIZED,
# #         detail="Invalid or missing API Key",
# #     )

# app = FastAPI(title="Discord Checkin API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(checkins.router, prefix="/checkins", tags=["Checkins"], dependencies=[Depends(get_api_key)])
# app.include_router(questions.router, prefix="/questions", tags=["Questions"], dependencies=[Depends(get_api_key)])
# app.include_router(users.router, prefix="/users", tags=["Users"], dependencies=[Depends(get_api_key)])
# app.include_router(responses.router, prefix="/responses", tags=["Responses"], dependencies=[Depends(get_api_key)])




# @app.get("/")
# def root():
#     return {"status": "ok"}



import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from dotenv import load_dotenv
from backend.routers import checkins, questions, users, responses
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# API key config
API_KEY = "SDASDSADWQRGHY"
API_KEY_NAME = 'X-API-KEY'
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# Allow both frontend origins and Swagger testing
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8000",  # optional if testing from backend docs
]

def get_api_key(api_key_header: str = Depends(api_key_header)):
    print("Received API key:", api_key_header)  # Debug log
    if api_key_header == API_KEY:
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API Key",
    )

app = FastAPI(title="Discord Checkin API")

# CORS middleware — allow frontend to make API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   
    allow_credentials=True,
    allow_methods=["*"],     
    allow_headers=["*"],     
)

# Register routers
app.include_router(checkins.router, prefix="/checkins", tags=["Checkins"], dependencies=[Depends(get_api_key)])
app.include_router(questions.router, prefix="/questions", tags=["Questions"], dependencies=[Depends(get_api_key)])
app.include_router(users.router, prefix="/users", tags=["Users"], dependencies=[Depends(get_api_key)])
app.include_router(responses.router, prefix="/responses", tags=["Responses"], dependencies=[Depends(get_api_key)])

# Root endpoint
@app.get("/")
def root():
    return {"status": "ok"}
