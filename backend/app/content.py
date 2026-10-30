"""Editable site content.

Each key ("site", "home", ...) is one JSON document in the `content` table. The models below
define its shape and default text, so a fresh database shows the same site as before the CMS.
Stored documents are merged over these defaults, so new fields can be added safely.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel
from sqlalchemy.orm import Session

from .models import ContentDoc

Short = Field(default="", max_length=300)


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")


# ---------- shared pieces ----------

class Heading(CamelModel):
    eyebrow: str = Field(default="", max_length=80)
    title: str = Field(default="", max_length=120)
    highlight: str = Field(default="", max_length=80)  # part of the title shown in red
    description: str = Field(default="", max_length=600)


class Step(CamelModel):
    title: str = Field(max_length=80)
    text: str = Field(default="", max_length=300)


class LinkButton(CamelModel):
    label: str = Field(max_length=60)
    target: Literal["products", "services", "contact"]


# ---------- site settings ----------

class NavItem(CamelModel):
    label: str = Field(max_length=40)
    href: str = Field(max_length=200)

    @field_validator("href")
    @classmethod
    def _href(cls, v: str) -> str:
        if not (v.startswith("/") or v.startswith("https://") or v.startswith("http://")):
            raise ValueError("Link must start with / or http(s)://")
        return v


class SiteSettings(CamelModel):
    company_name: str = Field(default="Audio 4 Design N Technology Corp.", max_length=120)
    short_name: str = Field(default="Audio4Design", max_length=60)
    tagline: str = Field(default="Sound systems, CCTV and electronics — supplied, installed and supported.", max_length=200)
    logo_url: str = Field(default="/logo.png", max_length=300)
    brand_color: str = Field(default="#cf010d", pattern=r"^#[0-9a-fA-F]{6}$")

    phone: str = Field(default="(000) 000-0000", max_length=40)
    email: str = Field(default="sales@example.com", max_length=200)
    address: str = Field(default="Street, City, Province", max_length=300)
    hours: str = Field(default="Mon–Sat · 8:00 AM – 5:00 PM", max_length=120)
    map_url: str = Short
    facebook_url: str = Short
    messenger_url: str = Short
    viber: str = Field(default="", max_length=60)

    nav: list[NavItem] = Field(
        default_factory=lambda: [
            NavItem(label="Home", href="/"),
            NavItem(label="Products", href="/products"),
            NavItem(label="Services", href="/services"),
            NavItem(label="Contact", href="/contact"),
        ],
        max_length=8,
    )
    header_button_label: str = Field(default="Contact Sales", max_length=40)
    top_bar_show_hours: bool = True
    top_bar_show_phone: bool = True
    top_bar_show_email: bool = True

    footer_about: str = Field(default="Sound systems, CCTV and electronics — supplied, installed and supported.", max_length=300)
    footer_copyright: str = Field(default="© {year} Audio 4 Design N Technology Corp. All rights reserved.", max_length=200)
    footer_pricing_note: str = Field(default="Prices are not published online. Contact our sales team for a quotation.", max_length=200)

    seo_title: str = Field(default="Audio 4 Design N Technology Corp. | Sound, CCTV & Electronics", max_length=120)
    seo_description: str = Field(
        default=(
            "Audio 4 Design N Technology Corp. supplies and installs professional sound systems, CCTV and "
            "surveillance, and electronic equipment for homes, businesses, churches and events."
        ),
        max_length=300,
    )
    share_image_url: str = Short


class Notifications(CamelModel):
    """Admin-only: never exposed by the public API."""

    recipients: list[str] = Field(default_factory=list, max_length=10)
    send_confirmation: bool = True
    confirmation_message: str = Field(
        default="Thank you for your inquiry! Our sales team will get back to you shortly with pricing and availability.",
        max_length=1000,
    )


# ---------- pages ----------

HomeSectionKey = Literal["hero", "howToBuy", "categories", "featured", "services", "whyUs", "cta"]
HOME_SECTION_KEYS: tuple[str, ...] = ("hero", "howToBuy", "categories", "featured", "services", "whyUs", "cta")


class HomeSection(CamelModel):
    key: HomeSectionKey
    visible: bool = True


class Hero(CamelModel):
    eyebrow: str = Field(default="Audio · CCTV · Electronics", max_length=80)
    line1: str = Field(default="Sound.", max_length=40)
    line2: str = Field(default="Security.", max_length=40)
    line3: str = Field(default="Technology.", max_length=40)
    tagline: str = Field(default="Sound systems, CCTV and electronics — supplied, installed and supported.", max_length=300)
    primary: LinkButton = LinkButton(label="Browse products", target="products")
    secondary: LinkButton = LinkButton(label="Talk to sales", target="contact")
    show_category_tiles: bool = True


class HowToBuy(CamelModel):
    title: str = Field(default="How to buy", max_length=80)
    subtitle: str = Field(default="No cart, no checkout — just a quote built for you.", max_length=200)
    steps: list[Step] = Field(
        default_factory=lambda: [
            Step(title="Browse", text="Explore our catalog and check the specs of the items you need."),
            Step(title="Inquire", text="Send an inquiry or call our sales team about the items or service."),
            Step(title="Get your quote", text="We prepare a quotation and work out the best deal for your project."),
        ],
        max_length=6,
    )


class FeaturedSection(Heading):
    count: int = Field(default=8, ge=1, le=24)
    button_label: str = Field(default="View all products", max_length=60)


class ServicesSection(Heading):
    button_label: str = Field(default="All services", max_length=60)


class Reason(CamelModel):
    icon: str = Field(default="shield", max_length=40)
    title: str = Field(max_length=80)
    text: str = Field(default="", max_length=300)


class WhyUs(Heading):
    reasons: list[Reason] = Field(default_factory=list, max_length=8)


class CtaBand(CamelModel):
    title: str = Field(default="Found what you need?", max_length=120)
    text: str = Field(default="Talk to our sales team for pricing, availability and package deals for your project.", max_length=300)
    button_label: str = Field(default="Contact Sales", max_length=60)
    show_phone: bool = True


class HomePage(CamelModel):
    sections: list[HomeSection] = Field(default_factory=lambda: [HomeSection(key=k) for k in HOME_SECTION_KEYS])
    hero: Hero = Hero()
    how_to_buy: HowToBuy = HowToBuy()
    categories: Heading = Heading(
        eyebrow="Shop by category",
        title="What we carry",
        highlight="carry",
        description="From sound materials to complete surveillance systems — browse by category and check the full specs.",
    )
    featured: FeaturedSection = FeaturedSection(eyebrow="Featured", title="Popular picks", highlight="picks")
    services: ServicesSection = ServicesSection(
        eyebrow="Services",
        title="We supply. We install.",
        highlight="We install.",
        description="Our technicians design, install and maintain sound and security systems for homes, businesses, churches, schools and events.",
    )
    why_us: WhyUs = WhyUs(
        eyebrow="Why Audio4Design",
        title="Built on service",
        highlight="service",
        reasons=[
            Reason(icon="shield", title="Quality equipment", text="Professional-grade audio, surveillance and electronics we stand behind."),
            Reason(icon="wrench", title="Supply + installation", text="One team from equipment selection to installation and tuning."),
            Reason(icon="handshake", title="Project-based pricing", text="Quotes tailored to your quantity, setup and budget."),
            Reason(icon="headset", title="After-sales support", text="Repairs, maintenance and technical help after the sale."),
        ],
    )
    cta: CtaBand = CtaBand()

    @field_validator("sections")
    @classmethod
    def _every_section_once(cls, sections: list[HomeSection]) -> list[HomeSection]:
        seen: list[HomeSection] = []
        for s in sections:
            if s.key not in {x.key for x in seen}:
                seen.append(s)
        seen += [HomeSection(key=k) for k in HOME_SECTION_KEYS if k not in {x.key for x in seen}]
        return seen


class ProductsPage(Heading):
    eyebrow: str = "Catalog"
    title: str = "Products"
    description: str = "Browse our range and check the specs. Prices are available on request from our sales team."
    search_placeholder: str = Field(default="Search products…", max_length=80)
    card_quote_label: str = Field(default="Quote on request", max_length=40)
    card_inquire_label: str = Field(default="Inquire", max_length=40)
    empty_title: str = Field(default="No items found", max_length=80)
    empty_text: str = Field(default="Can't find what you're looking for? We can source many items on request — ask our sales team.", max_length=300)
    empty_button_label: str = Field(default="Ask our sales team", max_length=60)


class ProductDetailPage(CamelModel):
    pricing_title: str = Field(default="Pricing upon request", max_length=80)
    pricing_text: str = Field(
        default=(
            "We don't publish prices online. Our sales team will prepare a quotation based on quantity, configuration "
            "and installation needs — and we're open to discussing the best deal for your project."
        ),
        max_length=500,
    )
    inquire_label: str = Field(default="Inquire about this item", max_length=60)
    call_label: str = Field(default="Call sales", max_length=60)
    overview_title: str = Field(default="Overview", max_length=60)
    specs_title: str = Field(default="Specifications", max_length=60)
    specs_note: str = Field(default="Specifications may vary by model or supplier. Confirm details with our sales team.", max_length=300)
    related_title: str = Field(default="More in", max_length=60)


class ServicesPage(Heading):
    eyebrow: str = "Services"
    title: str = "We supply. We install."
    description: str = "Design, installation, repair and maintenance for sound, surveillance and electronic systems."
    request_label: str = Field(default="Request this service", max_length=60)
    process: Heading = Heading(eyebrow="How we work", title="From inquiry to installation", highlight="installation")
    steps: list[Step] = Field(
        default_factory=lambda: [
            Step(title="Consultation", text="Tell us what you need — by phone, email or our inquiry form."),
            Step(title="Site survey", text="We visit your location to assess the space and requirements."),
            Step(title="Quotation", text="You receive an itemized proposal we can adjust together."),
            Step(title="Installation", text="Our technicians install, configure and test everything."),
            Step(title="Support", text="Hand-over, training and after-sales service when you need it."),
        ],
        max_length=8,
    )


class ContactPage(Heading):
    eyebrow: str = "Contact sales"
    title: str = "Request a quote"
    description: str = "Tell us what you need and our sales team will get back to you with pricing and availability."
    side_title: str = Field(default="Prefer to talk?", max_length=80)
    next_steps_title: str = Field(default="What happens next", max_length=80)
    next_steps: list[str] = Field(
        default_factory=lambda: [
            "Our sales team reviews your inquiry.",
            "We contact you to confirm details and requirements.",
            "You receive a quotation — and we can discuss the best deal.",
        ],
        max_length=6,
    )
    message_placeholder: str = Field(
        default="Tell us about your project, location and timeline so we can prepare an accurate quotation.", max_length=200
    )
    submit_label: str = Field(default="Send inquiry", max_length=40)
    privacy_note: str = Field(default="We'll only use your details to respond to this inquiry.", max_length=200)
    success_title: str = Field(default="Inquiry sent", max_length=80)
    success_text: str = Field(default="Thank you! Our sales team will get back to you shortly with pricing and availability.", max_length=300)


CONTENT_MODELS: dict[str, type[CamelModel]] = {
    "site": SiteSettings,
    "notifications": Notifications,
    "home": HomePage,
    "products": ProductsPage,
    "product-detail": ProductDetailPage,
    "services": ServicesPage,
    "contact": ContactPage,
}
PUBLIC_CONTENT_KEYS = set(CONTENT_MODELS) - {"notifications"}


def load_content(db: Session, key: str) -> CamelModel:
    model = CONTENT_MODELS[key]
    doc = db.get(ContentDoc, key)
    if doc is None:
        return model()
    try:
        return model.model_validate(doc.data)
    except ValueError:
        # A stored document that no longer validates falls back to defaults rather than breaking the site.
        return model()


def save_content(db: Session, key: str, value: CamelModel) -> None:
    data = value.model_dump(mode="json")
    doc = db.get(ContentDoc, key)
    if doc is None:
        db.add(ContentDoc(key=key, data=data))
    else:
        doc.data = data
    db.commit()
