"""Convert ORM rows to API output (camelCase JSON-ready dicts)."""

from .models import Category, Inquiry, Product, Service
from .schemas import CategoryOut, InquiryOut, ProductOut, ServiceOut


def category_out(c: Category, product_count: int = 0) -> dict:
    return CategoryOut(
        id=c.id, slug=c.slug, name=c.name, description=c.description, icon=c.icon,
        visible=c.visible, sort_order=c.sort_order, product_count=product_count,
    ).model_dump(mode="json", by_alias=True)


def product_out(p: Product) -> dict:
    return ProductOut(
        id=p.id, slug=p.slug, name=p.name, category_id=p.category_id,
        category_slug=p.category.slug, category_name=p.category.name, category_icon=p.category.icon,
        summary=p.summary, description=p.description, highlights=p.highlights, specs=p.specs,
        images=p.images, featured=p.featured, published=p.published, seo_title=p.seo_title,
        updated_at=p.updated_at,
    ).model_dump(mode="json", by_alias=True)


def service_out(s: Service) -> dict:
    return ServiceOut(
        id=s.id, slug=s.slug, name=s.name, summary=s.summary, includes=s.includes, icon=s.icon,
        show_on_home=s.show_on_home, offer_in_form=s.offer_in_form, sort_order=s.sort_order,
    ).model_dump(mode="json", by_alias=True)


def inquiry_out(i: Inquiry, with_events: bool = False) -> dict:
    out = InquiryOut.model_validate(
        {
            **{k: getattr(i, k) for k in InquiryOut.model_fields if k != "events"},
            "events": [{"text": e.text, "created_at": e.created_at} for e in i.events] if with_events else [],
        }
    )
    return out.model_dump(mode="json", by_alias=True)
