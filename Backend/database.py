from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./personal.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

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
        "featured": "BOOLEAN NOT NULL DEFAULT 0",
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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
