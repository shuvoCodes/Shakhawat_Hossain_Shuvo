import os
import io
import uuid
from pathlib import Path
from urllib.parse import urlsplit

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse
from PIL import Image as PILImage, UnidentifiedImageError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from Auth import require_admin
from database import get_db
from models import Images, Projects, Users

router = APIRouter(tags=["images"])

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "Uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESUME_PATH = UPLOAD_DIR / "resume.pdf"
MAX_RESUME_SIZE = 10 * 1024 * 1024

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@router.post("/resume", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    _admin: Users = Depends(require_admin),
):
    temporary_path = UPLOAD_DIR / f".resume-{uuid.uuid4().hex}.tmp"
    try:
        content = await file.read(MAX_RESUME_SIZE + 1)
        if len(content) > MAX_RESUME_SIZE:
            raise HTTPException(status_code=413, detail="Resume must be 10 MB or smaller")
        if not content:
            raise HTTPException(status_code=400, detail="Empty resume file")
        if not content.startswith(b"%PDF-"):
            raise HTTPException(status_code=400, detail="Only valid PDF files are allowed")

        temporary_path.write_bytes(content)
        os.replace(temporary_path, RESUME_PATH)
    finally:
        temporary_path.unlink(missing_ok=True)
        await file.close()

    return {
        "message": "Resume uploaded successfully",
        "download_url": str(request.base_url).rstrip("/") + "/resume",
    }


@router.get("/resume", response_class=FileResponse)
def download_resume():
    if not RESUME_PATH.is_file():
        raise HTTPException(status_code=404, detail="Resume not found")
    return FileResponse(
        path=RESUME_PATH,
        media_type="application/pdf",
        filename="resume.pdf",
    )


async def _save_uploaded_image(file: UploadFile) -> tuple[str, Path]:
    extension = ALLOWED_TYPES.get(file.content_type)
    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, WEBP and GIF images are allowed",
        )

    content = await file.read(5 * 1024 * 1024 + 1)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller")
    if not content:
        raise HTTPException(status_code=400, detail="Empty image file")

    try:
        with PILImage.open(io.BytesIO(content)) as img:
            if img.format not in {"JPEG", "PNG", "WEBP", "GIF"}:
                raise HTTPException(status_code=400, detail="Unsupported image format")
            actual_extension = {
                "JPEG": ".jpg",
                "PNG": ".png",
                "WEBP": ".webp",
                "GIF": ".gif",
            }[img.format]
            img.verify()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="Invalid image file")

    if extension != actual_extension:
        raise HTTPException(
            status_code=400,
            detail="Image content does not match the uploaded file type",
        )

    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / filename
    try:
        file_path.write_bytes(content)
    except OSError:
        file_path.unlink(missing_ok=True)
        raise
    return filename, file_path


def _local_upload_path(image_url: str) -> Path | None:
    image_path = urlsplit(image_url).path
    if not image_path.startswith("/uploads/"):
        return None
    filename = Path(image_path).name
    if not filename or filename in {".", ".."}:
        return None
    return UPLOAD_DIR / filename


def _image_is_referenced_elsewhere(
    db: Session,
    file_path: Path,
    image_id: int,
) -> bool:
    other_images = db.query(Images).filter(Images.id != image_id).all()
    return any(_local_upload_path(image.image) == file_path for image in other_images)


@router.post(
    "/projects/{project_id}/images",
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    project_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: Users = Depends(require_admin),
):
    project = db.query(Projects).filter(Projects.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    file_path = None
    try:
        filename, file_path = await _save_uploaded_image(file)

        image_record = Images(project_id=project_id, image=f"/uploads/{filename}")
        db.add(image_record)
        db.flush()
        db.refresh(image_record)
        db.commit()

        return {
            "message": "Image uploaded successfully",
            "id": image_record.id,
            "project_id": image_record.project_id,
            "image_url": str(request.base_url).rstrip("/") + image_record.image,
        }
    except Exception:
        db.rollback()
        if file_path is not None and file_path.exists():
            file_path.unlink()
        raise
    finally:
        await file.close()


@router.put(
    "/projects/{project_id}/images/{image_id}",
)
async def update_project_image(
    project_id: int,
    image_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: Users = Depends(require_admin),
):
    project = db.query(Projects).filter(Projects.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    image_record = (
        db.query(Images)
        .filter(Images.id == image_id, Images.project_id == project_id)
        .first()
    )
    if not image_record:
        raise HTTPException(status_code=404, detail="Image not found")

    new_file_path = None
    try:
        filename, new_file_path = await _save_uploaded_image(file)
        old_image_url = image_record.image
        old_file_path = _local_upload_path(old_image_url)
        remove_old_file = (
            old_file_path is not None
            and not _image_is_referenced_elsewhere(db, old_file_path, image_id)
        )

        image_record.image = f"/uploads/{filename}"
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        if new_file_path is not None:
            new_file_path.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    if remove_old_file:
        old_file_path.unlink(missing_ok=True)

    return {
        "message": "Image updated successfully",
        "id": image_record.id,
        "project_id": image_record.project_id,
        "image_url": str(request.base_url).rstrip("/") + image_record.image,
    }


@router.delete(
    "/projects/{project_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_project_image(
    project_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    _admin: Users = Depends(require_admin),
):
    project = db.query(Projects).filter(Projects.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    image_record = (
        db.query(Images)
        .filter(Images.id == image_id, Images.project_id == project_id)
        .first()
    )
    if not image_record:
        raise HTTPException(status_code=404, detail="Image not found")

    file_path = _local_upload_path(image_record.image)
    remove_file = (
        file_path is not None
        and not _image_is_referenced_elsewhere(db, file_path, image_id)
    )
    try:
        db.delete(image_record)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise

    if remove_file:
        file_path.unlink(missing_ok=True)


@router.get("/projects/{project_id}/images")
def get_project_images(
    project_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    project = db.query(Projects).filter(Projects.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    images = db.query(Images).filter(Images.project_id == project_id).all()
    return [
        {
            "id": image.id,
            "project_id": image.project_id,
            "image_url": (
                image.image
                if image.image.startswith(("http://", "https://"))
                else str(request.base_url).rstrip("/") + "/" + image.image.lstrip("/")
            ),
        }
        for image in images
    ]
