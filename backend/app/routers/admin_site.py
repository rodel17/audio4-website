"""Admin dashboard, editable content documents and image uploads."""

import json
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..cache import invalidate
from ..config import MAX_UPLOAD_BYTES, UPLOAD_DIR
from ..content import CONTENT_MODELS, SiteSettings, load_content, save_content
from ..db import get_db
from ..models import Category, Inquiry, Product, Service
from ..serializers import inquiry_out

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])

SEED_SLUGS = {p["slug"] for p in json.loads(Path(__file__).parent.parent.joinpath("seed_data.json").read_text(encoding="utf-8"))["products"]}


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)) -> dict:
    def count(stmt) -> int:
        return db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    site: SiteSettings = load_content(db, "site")  # type: ignore[assignment]
    defaults = SiteSettings()
    products = list(db.scalars(select(Product)))
    with_photos = sum(1 for p in products if p.images)
    sample_left = sum(1 for p in products if p.slug in SEED_SLUGS)
    contact_placeholder = (
        site.phone == defaults.phone or site.email == defaults.email or site.address == defaults.address
    )

    return {
        "stats": {
            "newInquiries": count(select(Inquiry).where(Inquiry.status == "new")),
            "openInquiries": count(select(Inquiry).where(Inquiry.status.in_(("contacted", "quoted")))),
            "publishedProducts": sum(1 for p in products if p.published),
            "featuredProducts": sum(1 for p in products if p.published and p.featured),
            "categories": count(select(Category)),
            "services": count(select(Service)),
        },
        "recentInquiries": [inquiry_out(i) for i in db.scalars(select(Inquiry).order_by(Inquiry.created_at.desc()).limit(5))],
        "checklist": [
            {
                "label": "Replace placeholder contact details",
                "note": "Phone, email and address in Site settings",
                "href": "/admin/settings",
                "done": not contact_placeholder,
            },
            {
                "label": "Upload product photos",
                "note": f"{with_photos} of {len(products)} products have photos",
                "href": "/admin/products",
                "done": bool(products) and with_photos == len(products),
            },
            {
                "label": "Replace sample products",
                "note": f"{sample_left} sample items still in the catalog" if sample_left else "No sample items left",
                "href": "/admin/products",
                "done": sample_left == 0,
            },
        ],
    }


@router.get("/content/{key}")
def get_content(key: str, db: Session = Depends(get_db)) -> dict:
    if key not in CONTENT_MODELS:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown content")
    return load_content(db, key).model_dump(mode="json", by_alias=True)


@router.put("/content/{key}")
async def put_content(key: str, request: Request, db: Session = Depends(get_db)) -> dict:
    if key not in CONTENT_MODELS:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown content")
    try:
        value = CONTENT_MODELS[key].model_validate(await request.json())
    except ValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, exc.errors(include_url=False, include_context=False))
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid JSON")
    save_content(db, key, value)
    invalidate()
    return value.model_dump(mode="json", by_alias=True)


# File signatures for the image types we accept (SVG is excluded: it can carry scripts).
_SIGNATURES = {
    b"\xff\xd8\xff": ".jpg",
    b"\x89PNG\r\n\x1a\n": ".png",
    b"GIF87a": ".gif",
    b"GIF89a": ".gif",
}


def _image_extension(head: bytes) -> str | None:
    for signature, ext in _SIGNATURES.items():
        if head.startswith(signature):
            return ext
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return ".webp"
    return None


@router.post("/uploads", status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile) -> dict:
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status.HTTP_413_CONTENT_TOO_LARGE, "Images must be 5 MB or smaller")
    ext = _image_extension(data[:16])
    if ext is None:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Upload a JPG, PNG, WebP or GIF image")
    name = f"{uuid.uuid4().hex}{ext}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / name).write_bytes(data)
    return {"url": f"/uploads/{name}"}
