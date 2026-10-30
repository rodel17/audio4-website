from datetime import datetime
from typing import Literal

from pydantic import EmailStr, Field, field_validator

from .content import CamelModel

SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"

# Icon names the frontend knows how to draw (frontend/components/icons.tsx).
IconName = Literal[
    "speaker", "gauge", "sliders", "mic", "cctv", "cable", "radio", "network", "monitor", "lightbulb",
    "wrench", "clipboard", "ruler", "shield", "handshake", "headset", "package",
]


def _check_image_url(url: str) -> str:
    if not (url.startswith("/") or url.startswith("https://")):
        raise ValueError("Image must be an uploaded file or an https:// link")
    return url


# ---------- auth ----------

class LoginIn(CamelModel):
    email: str = Field(max_length=255)
    password: str = Field(max_length=200)


class UserOut(CamelModel):
    id: int
    email: str
    name: str


# ---------- catalog ----------

class CategoryIn(CamelModel):
    slug: str = Field(pattern=SLUG_PATTERN, max_length=80)
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=400)
    icon: IconName = "package"
    visible: bool = True


class CategoryOut(CategoryIn):
    id: int
    sort_order: int
    product_count: int = 0


class Spec(CamelModel):
    label: str = Field(min_length=1, max_length=80)
    value: str = Field(min_length=1, max_length=200)


class ProductIn(CamelModel):
    slug: str = Field(pattern=SLUG_PATTERN, max_length=120)
    name: str = Field(min_length=1, max_length=200)
    category_id: int
    summary: str = Field(default="", max_length=300)
    description: str = Field(default="", max_length=5000)
    highlights: list[str] = Field(default_factory=list, max_length=12)
    specs: list[Spec] = Field(default_factory=list, max_length=40)
    images: list[str] = Field(default_factory=list, max_length=12)
    featured: bool = False
    published: bool = True
    seo_title: str = Field(default="", max_length=200)

    @field_validator("highlights")
    @classmethod
    def _highlights(cls, v: list[str]) -> list[str]:
        return [h.strip()[:200] for h in v if h.strip()]

    @field_validator("images")
    @classmethod
    def _images(cls, v: list[str]) -> list[str]:
        return [_check_image_url(u) for u in v]


class ProductPatch(CamelModel):
    featured: bool | None = None
    published: bool | None = None


class ProductOut(ProductIn):
    id: int
    category_slug: str
    category_name: str
    category_icon: str
    updated_at: datetime


class ProductPageOut(CamelModel):
    items: list[ProductOut]
    total: int
    page: int
    page_count: int
    page_size: int


class BulkAction(CamelModel):
    ids: list[int] = Field(min_length=1, max_length=200)
    action: Literal["publish", "draft", "delete"]


class Reorder(CamelModel):
    ids: list[int] = Field(min_length=1, max_length=500)


class ServiceIn(CamelModel):
    slug: str = Field(pattern=SLUG_PATTERN, max_length=80)
    name: str = Field(min_length=1, max_length=160)
    summary: str = Field(default="", max_length=600)
    includes: list[str] = Field(default_factory=list, max_length=12)
    icon: IconName = "wrench"
    show_on_home: bool = True
    offer_in_form: bool = True

    @field_validator("includes")
    @classmethod
    def _includes(cls, v: list[str]) -> list[str]:
        return [i.strip()[:160] for i in v if i.strip()]


class ServiceOut(ServiceIn):
    id: int
    sort_order: int


# ---------- inquiries ----------

class InquiryIn(CamelModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=3, max_length=60)
    company: str = Field(default="", max_length=160)
    subject: str = Field(min_length=1, max_length=200)
    quantity: str = Field(default="", max_length=40)
    preferred_contact: Literal["phone", "email", "either"] = "either"
    message: str = Field(min_length=1, max_length=5000)
    product_slug: str = Field(default="", max_length=120)
    service_slug: str = Field(default="", max_length=80)
    # Honeypot: hidden from people, often filled in by spam bots.
    website: str = Field(default="", max_length=200)


InquiryStatus = Literal["new", "contacted", "quoted", "won", "lost"]


class InquiryEventOut(CamelModel):
    text: str
    created_at: datetime


class InquiryOut(CamelModel):
    id: int
    name: str
    email: str
    phone: str
    company: str
    subject: str
    quantity: str
    preferred_contact: str
    message: str
    product_slug: str
    service_slug: str
    status: InquiryStatus
    assignee: str
    notes: str
    created_at: datetime
    updated_at: datetime
    events: list[InquiryEventOut] = []


class InquiryUpdate(CamelModel):
    status: InquiryStatus | None = None
    assignee: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=5000)
