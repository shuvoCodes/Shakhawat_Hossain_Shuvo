import os
from datetime import date
from typing import Literal

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from pydantic import AliasChoices, BaseModel, Field
from sqlalchemy.orm import Session
from urllib.parse import urlsplit

from Auth import require_admin, router as auth_router
from Upload import UPLOAD_DIR, router as upload_router
from database import Base, engine, get_db, migrate_auth_columns, migrate_project_columns
from models import Images, ProjectFeatures, Projects, Skills

ProjectStatus = Literal["completed", "in_progress", "on_hold", "planned"]
TIMELINE_FIELDS = (
    "start_date",
    "end_date",
    "last_updated",
    "expected_start_date",
)
STATUS_TIMELINE_FIELDS = {
    "completed": ("start_date", "end_date"),
    "in_progress": ("start_date",),
    "on_hold": ("start_date", "last_updated"),
    "planned": ("expected_start_date",),
}

app = FastAPI(
    title="Portfolio API",
    description="API for managing portfolio projects, technologies, and images.",
    version="1.0.0",
)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)

Base.metadata.create_all(bind=engine)
migrate_project_columns()
migrate_auth_columns()


class FeatureCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)


class ImageCreate(BaseModel):
    image_url: str = Field(min_length=1, max_length=2048)


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    category: str = Field(default="frontend", min_length=1, max_length=100)
    status: ProjectStatus = "in_progress"
    featured: bool = False
    priority: int = 0
    start_date: date | None = None
    end_date: date | None = None
    last_updated: date | None = None
    expected_start_date: date | None = None
    features: list[FeatureCreate] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    images: list[ImageCreate] = Field(default_factory=list)
    live_url: str | None = Field(default=None, max_length=2048)
    frontend_source_url: str | None = Field(
        default=None,
        max_length=2048,
        validation_alias=AliasChoices("frontend_source_url", "github_url"),
    )
    backend_source_url: str | None = Field(default=None, max_length=2048)


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1, max_length=5000)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    status: ProjectStatus | None = None
    featured: bool | None = None
    priority: int | None = None
    start_date: date | None = None
    end_date: date | None = None
    last_updated: date | None = None
    expected_start_date: date | None = None
    features: list[FeatureCreate] | None = None
    technologies: list[str] | None = None
    images: list[ImageCreate] | None = None
    live_url: str | None = Field(default=None, max_length=2048)
    frontend_source_url: str | None = Field(
        default=None,
        max_length=2048,
        validation_alias=AliasChoices("frontend_source_url", "github_url"),
    )
    backend_source_url: str | None = Field(default=None, max_length=2048)


def _validated_timeline(status: str, dates: dict[str, date | None]) -> dict[str, date | None]:
    required_fields = STATUS_TIMELINE_FIELDS.get(status)
    if required_fields is None:
        raise HTTPException(status_code=422, detail="Unsupported project status.")

    missing_fields = [field for field in required_fields if dates.get(field) is None]
    if missing_fields:
        raise HTTPException(
            status_code=422,
            detail=f"{', '.join(missing_fields)} is required for {status} projects.",
        )

    start_date = dates.get("start_date")
    end_date = dates.get("end_date")
    last_updated = dates.get("last_updated")
    if start_date and end_date and end_date < start_date:
        raise HTTPException(status_code=422, detail="end_date cannot be before start_date.")
    if start_date and last_updated and last_updated < start_date:
        raise HTTPException(
            status_code=422,
            detail="last_updated cannot be before start_date.",
        )

    return {
        field: dates.get(field) if field in required_fields else None
        for field in TIMELINE_FIELDS
    }


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://shakhawathossainshuvo.vercel.app",
        *[
            origin.strip()
            for origin in os.getenv("CORS_ORIGINS", "").split(",")
            if origin.strip()
        ],
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(upload_router)


@app.post("/projects", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_project(
    payload: ProjectCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    timeline = _validated_timeline(
        payload.status,
        {field: getattr(payload, field) for field in TIMELINE_FIELDS},
    )
    project = Projects(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        status=payload.status,
        featured=payload.featured,
        priority=payload.priority,
        **timeline,
        live_url=payload.live_url,
        frontend_source_url=payload.frontend_source_url,
        backend_source_url=payload.backend_source_url,
    )
    db.add(project)
    db.flush()
    db.add_all([
        ProjectFeatures(
            project_id=project.id,
            title=feature.title,
            description=feature.description,
        )
        for feature in payload.features
    ])
    db.add_all([
        Skills(project_id=project.id, skill=technology)
        for technology in payload.technologies
    ])
    db.add_all([
        Images(project_id=project.id, image=image.image_url)
        for image in payload.images
    ])
    db.commit()
    db.refresh(project)
    return serialize_project(project, request, db)


def _image_url(image: Images, request: Request) -> str:
    if image.image.startswith(("http://", "https://")):
        return image.image
    return str(request.base_url).rstrip("/") + "/" + image.image.lstrip("/")


def _uploaded_image_path(image_url: str) -> Path | None:
    image_path = urlsplit(image_url).path
    if not image_path.startswith("/uploads/"):
        return None
    return UPLOAD_DIR / Path(image_path).name


def _image_path_is_referenced(db: Session, image_path: Path) -> bool:
    images = db.query(Images).all()
    return any(_uploaded_image_path(image.image) == image_path for image in images)


def serialize_project(project: Projects, request: Request, db: Session):
    features = db.query(ProjectFeatures).filter(
        ProjectFeatures.project_id == project.id
    ).all()
    technologies = db.query(Skills).filter(Skills.project_id == project.id).all()
    images = db.query(Images).filter(Images.project_id == project.id).all()
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "category": project.category,
        "status": project.status,
        "featured": project.featured,
        "priority": project.priority,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "last_updated": project.last_updated,
        "expected_start_date": project.expected_start_date,
        "features": [
            {"title": feature.title, "description": feature.description}
            for feature in features
        ],
        "technologies": [technology.skill for technology in technologies],
        "images": [{"image_url": _image_url(image, request)} for image in images],
        "live_url": project.live_url,
        "frontend_source_url": project.frontend_source_url,
        "backend_source_url": project.backend_source_url,
        "github_url": project.frontend_source_url,
    }


@app.get("/projects/all")
def show_all_projects(request: Request, db: Session = Depends(get_db)):
    projects = db.query(Projects).order_by(
        Projects.priority.desc(), Projects.id.asc()
    ).all()
    if not projects:
        raise HTTPException(status_code=404, detail="Project not found")

    return [serialize_project(project, request, db) for project in projects]


@app.patch(
    "/projects/{project_id}",
    dependencies=[Depends(require_admin)],
)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    project = db.query(Projects).filter(Projects.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    updates = payload.model_dump(exclude_unset=True)
    nullable_fields = {
        "live_url",
        "frontend_source_url",
        "backend_source_url",
        *TIMELINE_FIELDS,
    }
    for field, value in updates.items():
        if value is None and field not in nullable_fields:
            raise HTTPException(status_code=422, detail=f"{field} cannot be null")

    if set(updates).intersection({"status", *TIMELINE_FIELDS}):
        timeline = _validated_timeline(
            updates.get("status", project.status),
            {
                field: updates.get(field, getattr(project, field))
                for field in TIMELINE_FIELDS
            },
        )
        updates.update(timeline)

    old_image_paths = []
    if "images" in updates:
        old_images = db.query(Images).filter(Images.project_id == project_id).all()
        old_image_paths = {
            path
            for image in old_images
            if (path := _uploaded_image_path(image.image)) is not None
        }
        new_images = updates.pop("images")
        retained_image_paths = {
            path
            for image in new_images
            if (path := _uploaded_image_path(image["image_url"])) is not None
        }
        old_image_paths.difference_update(retained_image_paths)
        db.query(Images).filter(
            Images.project_id == project_id
        ).delete(synchronize_session="fetch")
        db.add_all([
            Images(project_id=project_id, image=image["image_url"])
            for image in new_images
        ])

    if "features" in updates:
        db.query(ProjectFeatures).filter(
            ProjectFeatures.project_id == project_id
        ).delete(synchronize_session="fetch")
        db.add_all([
            ProjectFeatures(
                project_id=project_id,
                title=feature["title"],
                description=feature["description"],
            )
            for feature in updates.pop("features")
        ])

    if "technologies" in updates:
        db.query(Skills).filter(
            Skills.project_id == project_id
        ).delete(synchronize_session="fetch")
        db.add_all([
            Skills(project_id=project_id, skill=technology)
            for technology in updates.pop("technologies")
        ])

    for field, value in updates.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    for image_path in old_image_paths:
        if not _image_path_is_referenced(db, image_path):
            image_path.unlink(missing_ok=True)

    return serialize_project(project, request, db)


@app.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Projects).filter(Projects.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    images = db.query(Images).filter(Images.project_id == project_id).all()
    image_paths = {
        path
        for image in images
        if (path := _uploaded_image_path(image.image)) is not None
    }

    db.query(Skills).filter(Skills.project_id == project_id).delete(synchronize_session=False)
    db.query(ProjectFeatures).filter(
        ProjectFeatures.project_id == project_id
    ).delete(synchronize_session=False)
    db.query(Images).filter(Images.project_id == project_id).delete(synchronize_session=False)
    db.delete(project)
    db.commit()

    for image_path in image_paths:
        if _image_path_is_referenced(db, image_path):
            continue
        try:
            image_path.unlink(missing_ok=True)
        except OSError:
            pass

@app.get("/projects/{project_id}")
def get_project(project_id: int, request: Request, db: Session = Depends(get_db)):
    project = db.query(Projects).filter(Projects.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return serialize_project(project, request, db)
