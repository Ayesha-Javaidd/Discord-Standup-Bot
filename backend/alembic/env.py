# alembic/env.py
import os
import sys
from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
from dotenv import load_dotenv
import models

# Load .env variables
load_dotenv()

# Add project root to Python path so imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import database connection info
from database import Base, SQLALCHEMY_DATABASE_URL
import models  # Import all models so Alembic can detect them

# Alembic Config
config = context.config
config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for 'autogenerate'
target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=SQLALCHEMY_DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = create_engine(SQLALCHEMY_DATABASE_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
