```python
import os

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker


# Get DATABASE_URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. "
        "Please set DATABASE_URL in the environment."
    )


# Convert PostgreSQL URL to psycopg driver format
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql+psycopg://",
        1,
    )

elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1,
    )


# SQLite configuration
engine_options = {}

if DATABASE_URL.startswith("sqlite:"):
    engine_options["connect_args"] = {
        "check_same_thread": False
    }


# Create database engine
engine = create_engine(
    DATABASE_URL,
    **engine_options,
)


# Database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Base model
Base = declarative_base()


def migrate_project_columns():
    project_columns = {
        column["name"]
        for column in inspect(engine).get_columns("projects")
    }

    new_columns = {
        "category": "VARCHAR NOT NULL DEFAULT 'frontend'",
        "status": "VARCHAR NOT NULL DEFAULT 'in_progress'",
        "featured": "BOOLEAN NOT NULL DEFAULT FALSE",
        "priority": "INTEGER NOT NULL DEFAULT 0",
        "live_url": "VARCHAR",
        "github_url": "VARCHAR",
        "backend_source_url": "VARCHAR",
        "start_date": "DATE",
        "end_date": "DATE",
        "last_updated": "DATE",
        "expected_start_date": "DATE",
    }

    with engine.begin() as connection:
        for column_name, definition in new_columns.items():
            if column_name not in project_columns:
                connection.execute(
                    text(
                        f"ALTER TABLE projects "
                        f"ADD COLUMN {column_name} {definition}"
                    )
                )


def migrate_auth_columns():
    user_columns = {
        column["name"]
        for column in inspect(engine).get_columns("users")
    }

    with engine.begin() as connection:

        if "token_version" not in user_columns:
            connection.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0"
                )
            )

        account_count = connection.execute(
            text("SELECT COUNT(*) FROM users")
        ).scalar_one()

        if account_count > 1:
            raise RuntimeError(
                "The database contains multiple accounts; "
                "remove extras before enabling one-time account setup."
            )

        admin_count = connection.execute(
            text("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        ).scalar_one()

        if admin_count > 1:
            raise RuntimeError(
                "The database contains multiple admin accounts; "
                "remove extras before enabling one-time admin setup."
            )

        connection.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS "
                "uq_users_single_account "
                "ON users ((1))"
            )
        )

        connection.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS "
                "uq_users_single_admin "
                "ON users (role) "
                "WHERE role = 'admin'"
            )
        )


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
```
