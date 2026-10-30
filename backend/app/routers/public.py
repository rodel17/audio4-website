"""Public API used by the website. Responses are cached in Redis and cleared on admin saves."""

import math

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from ..auth import client_ip
from ..cache import cached, hit_rate_limit
from ..content import PUBLIC_CONTENT_KEYS, Notifications, SiteSettings, load_content
from ..db import get_db
from ..mailer import send_mail
from ..models import Category, Inquiry, InquiryEvent, Product, Service
from ..schemas import InquiryIn
from ..serializers import category_out, product_out, service_out

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/content/{key}")
def public_content(key: str, db: Session = Depends(get_db)) -> dict:
    if key not in PUBLIC_CONTENT_KEYS:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown content")
    return cached(f"content:{key}", lambda: load_content(db, key).model_dump(mode="json", by_alias=True))


def _published_products():
    return (
        select(Product)
        .join(Product.category)
        .options(joinedload(Product.category))
        .where(Product.published.is_(True), Category.visible.is_(True))
        .order_by(Category.sort_order, Product.sort_order, Product.id)
    )


@router.get("/categories")
def public_categories(db: Session = Depends(get_db)) -> list[dict]:
    def build() -> list[dict]:
        counts = dict(
            db.execute(
                select(Product.category_id, func.count()).where(Product.published.is_(True)).group_by(Product.category_id)
            ).all()
        )
        cats = db.scalars(select(Category).where(Category.visible.is_(True)).order_by(Category.sort_order, Category.id))
        return [category_out(c, counts.get(c.id, 0)) for c in cats]

    return cached("categories", build)


def _matches(product: Product, words: list[str]) -> bool:
    haystack = " ".join(
        [product.name, product.summary, product.description, *product.highlights, *(s.get("value", "") for s in product.specs)]
    ).lower()
    return all(w in haystack for w in words)


@router.get("/products")
def public_products(
    category: str = "",
    q: str = Query("", max_length=100),
    featured: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(9, ge=1, le=48, alias="pageSize"),
    db: Session = Depends(get_db),
) -> dict:
    def build() -> dict:
        stmt = _published_products()
        if category:
            stmt = stmt.where(Category.slug == category)
        if featured:
            stmt = stmt.where(Product.featured.is_(True))
        products = list(db.scalars(stmt).unique())
        # Every search word must appear somewhere in the product (catalogs here are small).
        words = q.lower().split()
        if words:
            products = [p for p in products if _matches(p, words)]
        page_count = max(1, math.ceil(len(products) / page_size))
        current = min(page, page_count)
        start = (current - 1) * page_size
        return {
            "items": [product_out(p) for p in products[start : start + page_size]],
            "total": len(products),
            "page": current,
            "pageCount": page_count,
            "pageSize": page_size,
        }

    return cached(f"products:{category}:{q.strip().lower()}:{featured}:{page}:{page_size}", build)


@router.get("/products/{slug}")
def public_product(slug: str, db: Session = Depends(get_db)) -> dict:
    def build() -> dict | None:
        product = db.scalars(_published_products().where(Product.slug == slug)).first()
        if product is None:
            return None
        related = db.scalars(
            _published_products().where(Product.category_id == product.category_id, Product.id != product.id).limit(4)
        ).unique()
        return {**product_out(product), "related": [product_out(p) for p in related]}

    result = cached(f"product:{slug}", build)
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return result


@router.get("/services")
def public_services(db: Session = Depends(get_db)) -> list[dict]:
    return cached(
        "services",
        lambda: [service_out(s) for s in db.scalars(select(Service).order_by(Service.sort_order, Service.id))],
    )


def _notify(inquiry_id: int, site: SiteSettings, notifications: Notifications, data: InquiryIn) -> None:
    summary = (
        f"From: {data.name} ({data.company or 'no company'})\n"
        f"Email: {data.email}\nPhone: {data.phone}\nPrefers: {data.preferred_contact}\n"
        f"Interested in: {data.subject}\nQuantity: {data.quantity or '-'}\n\n{data.message}\n"
    )
    send_mail(notifications.recipients, f"New inquiry #{inquiry_id}: {data.subject}", summary, reply_to=data.email)
    if notifications.send_confirmation:
        send_mail([data.email], f"We received your inquiry — {site.short_name}", notifications.confirmation_message)


@router.post("/inquiries", status_code=status.HTTP_201_CREATED)
def create_inquiry(data: InquiryIn, request: Request, background: BackgroundTasks, db: Session = Depends(get_db)) -> dict:
    if data.website:
        # Honeypot filled in: pretend success so bots don't retry.
        return {"ok": True}
    if hit_rate_limit(f"inquiry:{client_ip(request)}", limit=5, window_seconds=600):
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many inquiries. Please call or email us instead.")

    inquiry = Inquiry(**data.model_dump(exclude={"website"}))
    inquiry.events.append(InquiryEvent(text="Inquiry received from the website"))
    db.add(inquiry)
    db.commit()

    site = load_content(db, "site")
    notifications = load_content(db, "notifications")
    background.add_task(_notify, inquiry.id, site, notifications, data)
    return {"ok": True}
