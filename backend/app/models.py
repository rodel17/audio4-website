from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String(40), default="package")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    visible: Mapped[bool] = mapped_column(Boolean, default=True)

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(Base):
    """A catalog item. There is deliberately no price: pricing is handled by the sales team."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="RESTRICT"))
    summary: Mapped[str] = mapped_column(String(300), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    highlights: Mapped[list[str]] = mapped_column(JSON, default=list)
    specs: Mapped[list[dict]] = mapped_column(JSON, default=list)
    images: Mapped[list[str]] = mapped_column(JSON, default=list)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    seo_title: Mapped[str] = mapped_column(String(200), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    category: Mapped[Category] = relationship(back_populates="products")


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(160))
    summary: Mapped[str] = mapped_column(Text, default="")
    includes: Mapped[list[str]] = mapped_column(JSON, default=list)
    icon: Mapped[str] = mapped_column(String(40), default="wrench")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    show_on_home: Mapped[bool] = mapped_column(Boolean, default=True)
    offer_in_form: Mapped[bool] = mapped_column(Boolean, default=True)


class ContentDoc(Base):
    """Editable page text and site settings, one JSON document per key (see content.py)."""

    __tablename__ = "content"

    key: Mapped[str] = mapped_column(String(40), primary_key=True)
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


INQUIRY_STATUSES = ("new", "contacted", "quoted", "won", "lost")


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(60))
    company: Mapped[str] = mapped_column(String(160), default="")
    subject: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[str] = mapped_column(String(40), default="")
    preferred_contact: Mapped[str] = mapped_column(String(10), default="either")
    message: Mapped[str] = mapped_column(Text)
    product_slug: Mapped[str] = mapped_column(String(120), default="")
    service_slug: Mapped[str] = mapped_column(String(80), default="")
    status: Mapped[str] = mapped_column(String(20), default="new", index=True)
    assignee: Mapped[str] = mapped_column(String(120), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    events: Mapped[list["InquiryEvent"]] = relationship(
        back_populates="inquiry", cascade="all, delete-orphan", order_by="InquiryEvent.created_at"
    )


class InquiryEvent(Base):
    __tablename__ = "inquiry_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    inquiry_id: Mapped[int] = mapped_column(ForeignKey("inquiries.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    inquiry: Mapped[Inquiry] = relationship(back_populates="events")
