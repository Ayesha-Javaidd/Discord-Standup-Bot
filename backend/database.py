# import os
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
# from dotenv import load_dotenv

# load_dotenv()

# DB_HOST = os.getenv('DB_HOST', 'localhost')
# DB_PORT = os.getenv('DB_PORT', '3306')
# DB_USER = os.getenv('DB_USER', 'root')
# DB_PASSWORD = os.getenv('DB_PASSWORD', '14082005')
# DB_NAME = os.getenv('DB_NAME', 'discord_checkin')

# SQLALCHEMY_DATABASE_URL = (
#     f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
# )

# engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()


# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# DB credentials from .env or defaults
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 14082005)  # your password
DB_NAME = os.getenv('DB_NAME', 'discord_checkin')

# Full SQLAlchemy connection string
SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://root:14082005@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

# Create engine & session factory
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model
Base = declarative_base()
