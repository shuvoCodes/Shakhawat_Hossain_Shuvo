import os

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./personal.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine_options = {}
if DATABASE_URL.startswith("sqlite:"):
    engine_options["connect_args"] = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def migrate_project_columns():
    project_columns = {
        column["name"] for column in inspect(engine).get_columns("projects")
    }
    new_columns = {
        "category": "VARCHAR NOT NULL DEFAULT 'frontend'",
        "status": "VARCHAR NOT NULL DEFAULT 'in_progress'",
        "featured": "BOOLEAN NOT NULL DEFAULT FALSE",
        "priority": "INTEGER NOT NULL DEFAULT 0",
        "live_url": "VARCHAR",
        "github_url": "VARCHAR",
        "backend_source_url": "VARCHAR",
    }

    with engine.begin() as connection:
        for column_name, definition in new_columns.items():
            if column_name not in project_columns:
                connection.execute(text(
                    f"ALTER TABLE projects ADD COLUMN {column_name} {definition}"
                ))


def migrate_auth_columns():
    user_columns = {
        column["name"] for column in inspect(engine).get_columns("users")
    }
    with engine.begin() as connection:
        if "token_version" not in user_columns:
            connection.execute(text(
                "ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0"
            ))
        account_count = connection.execute(
            text("SELECT COUNT(*) FROM users")
        ).scalar_one()
        if account_count > 1:
            raise RuntimeError(
                "The database contains multiple accounts; remove extras before "
                "enabling one-time account setup."
            )
        admin_count = connection.execute(
            text("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        ).scalar_one()
        if admin_count > 1:
            raise RuntimeError(
                "The database contains multiple admin accounts; remove extras before "
                "enabling one-time admin setup."
            )
        connection.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_users_single_account "
            "ON users ((1))"
        ))
        connection.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_users_single_admin "
            "ON users (role) WHERE role = 'admin'"
        ))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
