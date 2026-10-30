"""Admin CRUD for products, categories and services."""

import math

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from ..auth import require_admin
from ..cache import invalidate
from ..db import get_db
from ..models import Category, Product, Service
from ..schemas import BulkAction, CategoryIn, ProductIn, ProductPatch, Reorder, ServiceIn
from ..serializers import category_out, product_out, service_out

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def _commit(db: Session, conflict: str) -> None:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, conflict)
    invalidate()


def _get(db: Session, model, obj_id: int):
    obj = db.get(model, obj_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    return obj


# ---------- products ----------

@router.get("/products")
def list_products(
    q: str = Query("", max_length=100),
    category_id: int | None = Query(None, alias="categoryId"),
    status_: str = Query("", alias="status", pattern="^(|published|draft)$"),
    featured: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100, alias="pageSize"),
    db: Session = Depends(get_db),
) -> dict:
    stmt = select(Product).options(joinedload(Product.category))
    if q.strip():
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(Product.name.ilike(like), Product.summary.ilike(like), Product.slug.ilike(like)))
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if status_:
        stmt = stmt.where(Product.published.is_(status_ == "published"))
    if featured:
        stmt = stmt.where(Product.featured.is_(True))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    page_count = max(1, math.ceil(total / page_size))
    current = min(page, page_count)
    items = db.scalars(
        stmt.order_by(Product.updated_at.desc(), Product.id.desc()).offset((current - 1) * page_size).limit(page_size)
    ).unique()
    return {
        "items": [product_out(p) for p in items],
        "total": total,
        "page": current,
        "pageCount": page_count,
        "pageSize": page_size,
    }


@router.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)) -> dict:
    return product_out(_get(db, Product, product_id))


def _apply_product(db: Session, product: Product, data: ProductIn) -> None:
    _get(db, Category, data.category_id)
    values = data.model_dump()
    values["specs"] = [s.model_dump() for s in data.specs]
    for key, value in values.items():
        setattr(product, key, value)


@router.post("/products", status_code=status.HTTP_201_CREATED)
def create_product(data: ProductIn, db: Session = Depends(get_db)) -> dict:
    product = Product(sort_order=(db.scalar(select(func.max(Product.sort_order))) or 0) + 1)
    _apply_product(db, product, data)
    db.add(product)
    _commit(db, "Another product already uses this web address")
    return product_out(product)


@router.put("/products/{product_id}")
def update_product(product_id: int, data: ProductIn, db: Session = Depends(get_db)) -> dict:
    product = _get(db, Product, product_id)
    _apply_product(db, product, data)
    _commit(db, "Another product already uses this web address")
    return product_out(product)


@router.patch("/products/{product_id}")
def patch_product(product_id: int, data: ProductPatch, db: Session = Depends(get_db)) -> dict:
    product = _get(db, Product, product_id)
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(product, key, value)
    _commit(db, "Could not update product")
    return product_out(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> Response:
    db.delete(_get(db, Product, product_id))
    _commit(db, "Could not delete product")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/products/bulk")
def bulk_products(data: BulkAction, db: Session = Depends(get_db)) -> dict:
    products = list(db.scalars(select(Product).where(Product.id.in_(data.ids))))
    for p in products:
        if data.action == "delete":
            db.delete(p)
        else:
            p.published = data.action == "publish"
    _commit(db, "Could not update products")
    return {"updated": len(products)}


# ---------- categories ----------

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)) -> list[dict]:
    counts = dict(db.execute(select(Product.category_id, func.count()).group_by(Product.category_id)).all())
    cats = db.scalars(select(Category).order_by(Category.sort_order, Category.id))
    return [category_out(c, counts.get(c.id, 0)) for c in cats]


@router.post("/categories", status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryIn, db: Session = Depends(get_db)) -> dict:
    cat = Category(**data.model_dump(), sort_order=(db.scalar(select(func.max(Category.sort_order))) or 0) + 1)
    db.add(cat)
    _commit(db, "Another category already uses this web address")
    return category_out(cat)


@router.put("/categories/{category_id}")
def update_category(category_id: int, data: CategoryIn, db: Session = Depends(get_db)) -> dict:
    cat = _get(db, Category, category_id)
    for key, value in data.model_dump().items():
        setattr(cat, key, value)
    _commit(db, "Another category already uses this web address")
    count = db.scalar(select(func.count()).where(Product.category_id == cat.id)) or 0
    return category_out(cat, count)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)) -> Response:
    cat = _get(db, Category, category_id)
    if db.scalar(select(func.count()).where(Product.category_id == cat.id)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Move this category's products to another category first")
    db.delete(cat)
    _commit(db, "Could not delete category")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _reorder(db: Session, model, ids: list[int]) -> None:
    rows = {row.id: row for row in db.scalars(select(model).where(model.id.in_(ids)))}
    for index, row_id in enumerate(ids):
        if row_id in rows:
            rows[row_id].sort_order = index
    _commit(db, "Could not reorder")


@router.post("/categories/reorder")
def reorder_categories(data: Reorder, db: Session = Depends(get_db)) -> dict:
    _reorder(db, Category, data.ids)
    return {"ok": True}


# ---------- services ----------

@router.get("/services")
def list_services(db: Session = Depends(get_db)) -> list[dict]:
    return [service_out(s) for s in db.scalars(select(Service).order_by(Service.sort_order, Service.id))]


@router.post("/services", status_code=status.HTTP_201_CREATED)
def create_service(data: ServiceIn, db: Session = Depends(get_db)) -> dict:
    service = Service(**data.model_dump(), sort_order=(db.scalar(select(func.max(Service.sort_order))) or 0) + 1)
    db.add(service)
    _commit(db, "Another service already uses this web address")
    return service_out(service)


@router.put("/services/{service_id}")
def update_service(service_id: int, data: ServiceIn, db: Session = Depends(get_db)) -> dict:
    service = _get(db, Service, service_id)
    for key, value in data.model_dump().items():
        setattr(service, key, value)
    _commit(db, "Another service already uses this web address")
    return service_out(service)


@router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: int, db: Session = Depends(get_db)) -> Response:
    db.delete(_get(db, Service, service_id))
    _commit(db, "Could not delete service")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/services/reorder")
def reorder_services(data: Reorder, db: Session = Depends(get_db)) -> dict:
    _reorder(db, Service, data.ids)
    return {"ok": True}
