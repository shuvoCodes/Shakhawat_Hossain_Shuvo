from database import Base
from sqlalchemy import Boolean, Column, ForeignKey, Index, Integer, String, text

class Projects(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False, default="frontend", server_default="frontend")
    status = Column(String, nullable=False, default="in_progress", server_default="in_progress")
    featured = Column(Boolean, nullable=False, default=False, server_default=text("false"))
    priority = Column(Integer, nullable=False, default=0, server_default=text("0"))
    live_url = Column(String, nullable=True)
    frontend_source_url = Column("github_url", String, nullable=True)
    backend_source_url = Column(String, nullable=True)


class ProjectFeatures(Base):
    __tablename__ = "project_features"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)

class Skills(Base):
    __tablename__ = 'skills'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    skill = Column(String, nullable=False)


class Images(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    image = Column(String, nullable=False)


class Users(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index(
            "uq_users_single_account",
            text("(1)"),
            unique=True,
        ),
        Index(
            "uq_users_single_admin",
            "role",
            unique=True,
            sqlite_where=text("role = 'admin'"),
            postgresql_where=text("role = 'admin'"),
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    token_version = Column(Integer, nullable=False, default=0, server_default=text("0"))
