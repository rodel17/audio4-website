"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { HeadingFields, useContentDoc } from "@/components/admin/content-fields";
import { IconPicker, RowControls, StepsEditor, StringListEditor, move } from "@/components/admin/editors";
import { Card, Checkbox, Loading, Notice, PageHeader, SaveStatus, SelectField, TextAreaField, TextField, btn } from "@/components/admin/ui";
import type { ContentMap, HomePage, HomeSectionKey, LinkTarget } from "@/lib/types";

const pages = [
  { key: "home", label: "Home", preview: "/" },
  { key: "products", label: "Products page", preview: "/products" },
  { key: "product-detail", label: "Product detail", preview: "/products" },
  { key: "services", label: "Services page", preview: "/services" },
  { key: "contact", label: "Contact page", preview: "/contact" },
] as const;

type PageKey = (typeof pages)[number]["key"];

const targetOptions: { value: LinkTarget; label: string }[] = [
  { value: "products", label: "Products" },
  { value: "services", label: "Services" },
  { value: "contact", label: "Contact Sales" },
];

// ---------------- Home ----------------

const sectionInfo: Record<HomeSectionKey, { title: string; summary: (h: HomePage) => string }> = {
  hero: { title: "Hero banner", summary: (h) => [h.hero.line1, h.hero.line2, h.hero.line3].join(" ") },
  howToBuy: { title: "How to buy", summary: (h) => `${h.howToBuy.steps.length} steps · ${h.howToBuy.steps.map((s) => s.title).join(" → ")}` },
  categories: { title: "Shop by category", summary: (h) => `${h.categories.title} · lists categories from Catalog › Categories` },
  featured: { title: "Featured products", summary: (h) => `${h.featured.title} · shows ${h.featured.count} products marked “Feature on homepage”` },
  services: { title: "Services", summary: (h) => `${h.services.title} · lists services from Website content › Services` },
  whyUs: { title: "Why choose us", summary: (h) => `${h.whyUs.title} · ${h.whyUs.reasons.length} reasons` },
  cta: { title: "Contact Sales banner", summary: (h) => `${h.cta.title} · also used at the bottom of other pages` },
};

function HomeSectionFields({ sectionKey, home, onChange }: { sectionKey: HomeSectionKey; home: HomePage; onChange: (home: HomePage) => void }) {
  switch (sectionKey) {
    case "hero": {
      const hero = home.hero;
      const set = (patch: Partial<HomePage["hero"]>) => onChange({ ...home, hero: { ...hero, ...patch } });
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Small label above the headline" value={hero.eyebrow} maxLength={80} onChange={(eyebrow) => set({ eyebrow })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="Headline line 1" value={hero.line1} maxLength={40} onChange={(line1) => set({ line1 })} />
            <TextField label="Line 2" value={hero.line2} maxLength={40} onChange={(line2) => set({ line2 })} />
            <TextField label="Line 3" hint="red" value={hero.line3} maxLength={40} onChange={(line3) => set({ line3 })} />
          </div>
          <TextAreaField label="Tagline" rows={2} maxLength={300} value={hero.tagline} onChange={(tagline) => set({ tagline })} />
          <div className="grid gap-3 sm:grid-cols-2">
            {(["primary", "secondary"] as const).map((which) => (
              <fieldset key={which} className="flex flex-col gap-2.5 rounded-md border border-line p-3">
                <legend className="px-1 text-[13px] font-bold">{which === "primary" ? "Main button" : "Second button"}</legend>
                <TextField label="Text" value={hero[which].label} maxLength={60} onChange={(label) => set({ [which]: { ...hero[which], label } })} />
                <SelectField label="Goes to" value={hero[which].target} options={targetOptions} onChange={(target) => set({ [which]: { ...hero[which], target } })} />
              </fieldset>
            ))}
          </div>
          <Checkbox label="Show category tiles beside the headline" checked={hero.showCategoryTiles} onChange={(showCategoryTiles) => set({ showCategoryTiles })} />
        </div>
      );
    }
    case "howToBuy": {
      const block = home.howToBuy;
      const set = (patch: Partial<HomePage["howToBuy"]>) => onChange({ ...home, howToBuy: { ...block, ...patch } });
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Title" value={block.title} maxLength={80} onChange={(title) => set({ title })} />
            <TextField label="Subtitle" value={block.subtitle} maxLength={200} onChange={(subtitle) => set({ subtitle })} />
          </div>
          <StepsEditor steps={block.steps} max={6} onChange={(steps) => set({ steps })} />
        </div>
      );
    }
    case "categories":
      return <HeadingFields value={home.categories} onChange={(categories) => onChange({ ...home, categories })} />;
    case "featured": {
      const block = home.featured;
      return (
        <div className="flex flex-col gap-4">
          <HeadingFields value={block} withDescription={false} onChange={(h) => onChange({ ...home, featured: { ...block, ...h } })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="How many to show"
              value={String(block.count)}
              options={["4", "8", "12"].map((n) => ({ value: n, label: n }))}
              onChange={(n) => onChange({ ...home, featured: { ...block, count: Number(n) } })}
            />
            <TextField label="Button text" value={block.buttonLabel} maxLength={60} onChange={(buttonLabel) => onChange({ ...home, featured: { ...block, buttonLabel } })} />
          </div>
          <p className="text-xs text-muted">
            Products are chosen with the “Feature on homepage” box on each{" "}
            <Link href="/admin/products?featured=1" className="font-semibold text-brand">
              product
            </Link>
            .
          </p>
        </div>
      );
    }
    case "services": {
      const block = home.services;
      return (
        <div className="flex flex-col gap-4">
          <HeadingFields value={block} onChange={(h) => onChange({ ...home, services: { ...block, ...h } })} />
          <TextField label="Button text" value={block.buttonLabel} maxLength={60} onChange={(buttonLabel) => onChange({ ...home, services: { ...block, buttonLabel } })} />
          <p className="text-xs text-muted">Service cards marked “Show on homepage” in Services appear here.</p>
        </div>
      );
    }
    case "whyUs": {
      const block = home.whyUs;
      const setReasons = (reasons: HomePage["whyUs"]["reasons"]) => onChange({ ...home, whyUs: { ...block, reasons } });
      return (
        <div className="flex flex-col gap-4">
          <HeadingFields value={block} withDescription={false} onChange={(h) => onChange({ ...home, whyUs: { ...block, ...h } })} />
          {block.reasons.map((r, i) => (
            <fieldset key={i} className="flex flex-col gap-3 rounded-md border border-line p-3">
              <legend className="flex items-center gap-2 px-1 text-[13px] font-bold">Reason {i + 1}</legend>
              <div className="flex flex-wrap items-end gap-3">
                <TextField className="flex-1 basis-48" label="Title" value={r.title} maxLength={80} onChange={(title) => setReasons(block.reasons.map((x, j) => (j === i ? { ...x, title } : x)))} />
                <RowControls
                  index={i}
                  count={block.reasons.length}
                  label={`reason ${i + 1}`}
                  onMove={(to) => setReasons(move(block.reasons, i, to))}
                  onRemove={() => setReasons(block.reasons.filter((_, j) => j !== i))}
                />
              </div>
              <TextField label="Text" value={r.text} maxLength={300} onChange={(text) => setReasons(block.reasons.map((x, j) => (j === i ? { ...x, text } : x)))} />
              <IconPicker value={r.icon} onChange={(icon) => setReasons(block.reasons.map((x, j) => (j === i ? { ...x, icon } : x)))} />
            </fieldset>
          ))}
          {block.reasons.length < 8 && (
            <button type="button" className={`${btn.dashed} self-start`} onClick={() => setReasons([...block.reasons, { icon: "shield", title: "", text: "" }])}>
              + Add reason
            </button>
          )}
        </div>
      );
    }
    case "cta": {
      const block = home.cta;
      const set = (patch: Partial<HomePage["cta"]>) => onChange({ ...home, cta: { ...block, ...patch } });
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Title" value={block.title} maxLength={120} onChange={(title) => set({ title })} />
          <TextField label="Text" value={block.text} maxLength={300} onChange={(text) => set({ text })} />
          <TextField label="Button text" value={block.buttonLabel} maxLength={60} onChange={(buttonLabel) => set({ buttonLabel })} />
          <Checkbox label="Show the phone number button" description="The number comes from Site settings." checked={block.showPhone} onChange={(showPhone) => set({ showPhone })} />
        </div>
      );
    }
  }
}

function HomeEditor({ home, onChange }: { home: HomePage; onChange: (home: HomePage) => void }) {
  const [open, setOpen] = useState<HomeSectionKey[]>(["hero"]);
  const sections = home.sections;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">Sections appear on the homepage in this order. Use the arrows to reorder; untick “Visible” to hide one.</p>
      {sections.map((section, i) => {
        const info = sectionInfo[section.key];
        const isOpen = open.includes(section.key);
        return (
          <section key={section.key} className={`rounded-lg border border-line bg-white ${section.visible ? "" : "opacity-70"}`}>
            <div className="flex flex-wrap items-center gap-2 py-2 pr-4 pl-2">
              <RowControls
                index={i}
                count={sections.length}
                label={info.title}
                onMove={(to) => onChange({ ...home, sections: move(sections, i, to) })}
              />
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen((o) => (isOpen ? o.filter((k) => k !== section.key) : [...o, section.key]))}
                className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{info.title}</span>
                  <span className="block truncate text-[13px] text-muted">{info.summary(home)}</span>
                </span>
                <ChevronDown className={`size-4.5 shrink-0 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              <Checkbox
                label="Visible"
                checked={section.visible}
                onChange={(visible) => onChange({ ...home, sections: sections.map((s, j) => (j === i ? { ...s, visible } : s)) })}
              />
            </div>
            {isOpen && (
              <div className="border-t border-[#eef0f2] px-6 pt-4 pb-6">
                <HomeSectionFields sectionKey={section.key} home={home} onChange={onChange} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ---------------- Other pages ----------------

function ProductsPageEditor({ value, onChange }: { value: ContentMap["products"]; onChange: (v: ContentMap["products"]) => void }) {
  const set = (patch: Partial<ContentMap["products"]>) => onChange({ ...value, ...patch });
  return (
    <>
      <Card title="Page header">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Small label" value={value.eyebrow} maxLength={80} onChange={(eyebrow) => set({ eyebrow })} />
            <TextField label="Title" value={value.title} maxLength={120} onChange={(title) => set({ title })} />
          </div>
          <TextAreaField label="Description" rows={2} maxLength={600} value={value.description} onChange={(description) => set({ description })} />
          <TextField label="Search box placeholder" value={value.searchPlaceholder} maxLength={80} onChange={(searchPlaceholder) => set({ searchPlaceholder })} />
        </div>
      </Card>
      <Card title="Product cards" description="Used on every product card across the site.">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Price note" value={value.cardQuoteLabel} maxLength={40} onChange={(cardQuoteLabel) => set({ cardQuoteLabel })} />
          <TextField label="Inquire link" value={value.cardInquireLabel} maxLength={40} onChange={(cardInquireLabel) => set({ cardInquireLabel })} />
        </div>
      </Card>
      <Card title="When nothing matches a search">
        <div className="flex flex-col gap-4">
          <TextField label="Title" value={value.emptyTitle} maxLength={80} onChange={(emptyTitle) => set({ emptyTitle })} />
          <TextAreaField label="Text" rows={2} maxLength={300} value={value.emptyText} onChange={(emptyText) => set({ emptyText })} />
          <TextField label="Button text" value={value.emptyButtonLabel} maxLength={60} onChange={(emptyButtonLabel) => set({ emptyButtonLabel })} />
        </div>
      </Card>
    </>
  );
}

function ProductDetailEditor({ value, onChange }: { value: ContentMap["product-detail"]; onChange: (v: ContentMap["product-detail"]) => void }) {
  const set = (patch: Partial<ContentMap["product-detail"]>) => onChange({ ...value, ...patch });
  return (
    <>
      <Card title="Pricing note" description="Shown next to every product photo.">
        <div className="flex flex-col gap-4">
          <TextField label="Title" value={value.pricingTitle} maxLength={80} onChange={(pricingTitle) => set({ pricingTitle })} />
          <TextAreaField label="Text" rows={3} maxLength={500} value={value.pricingText} onChange={(pricingText) => set({ pricingText })} />
        </div>
      </Card>
      <Card title="Buttons and headings">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Inquire button" value={value.inquireLabel} maxLength={60} onChange={(inquireLabel) => set({ inquireLabel })} />
          <TextField label="Call button" value={value.callLabel} maxLength={60} onChange={(callLabel) => set({ callLabel })} />
          <TextField label="Overview heading" value={value.overviewTitle} maxLength={60} onChange={(overviewTitle) => set({ overviewTitle })} />
          <TextField label="Specifications heading" value={value.specsTitle} maxLength={60} onChange={(specsTitle) => set({ specsTitle })} />
          <TextField label="Related products heading" hint="followed by the category name" value={value.relatedTitle} maxLength={60} onChange={(relatedTitle) => set({ relatedTitle })} />
        </div>
        <TextAreaField className="mt-4" label="Note under specifications" rows={2} maxLength={300} value={value.specsNote} onChange={(specsNote) => set({ specsNote })} />
      </Card>
    </>
  );
}

function ServicesPageEditor({ value, onChange }: { value: ContentMap["services"]; onChange: (v: ContentMap["services"]) => void }) {
  const set = (patch: Partial<ContentMap["services"]>) => onChange({ ...value, ...patch });
  return (
    <>
      <Card title="Page header">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Small label" value={value.eyebrow} maxLength={80} onChange={(eyebrow) => set({ eyebrow })} />
            <TextField label="Title" value={value.title} maxLength={120} onChange={(title) => set({ title })} />
          </div>
          <TextAreaField label="Description" rows={2} maxLength={600} value={value.description} onChange={(description) => set({ description })} />
          <TextField label="“Request this service” link text" value={value.requestLabel} maxLength={60} onChange={(requestLabel) => set({ requestLabel })} />
        </div>
      </Card>
      <Card title="“How we work” section">
        <div className="flex flex-col gap-4">
          <HeadingFields value={value.process} withDescription={false} onChange={(process) => set({ process })} />
          <StepsEditor steps={value.steps} max={8} multilineText onChange={(steps) => set({ steps })} />
        </div>
      </Card>
      <p className="text-sm text-muted">
        The service cards themselves are edited in{" "}
        <Link href="/admin/services" className="font-semibold text-brand">
          Services
        </Link>
        .
      </p>
    </>
  );
}

function ContactPageEditor({ value, onChange }: { value: ContentMap["contact"]; onChange: (v: ContentMap["contact"]) => void }) {
  const set = (patch: Partial<ContentMap["contact"]>) => onChange({ ...value, ...patch });
  return (
    <>
      <Card title="Page header">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Small label" value={value.eyebrow} maxLength={80} onChange={(eyebrow) => set({ eyebrow })} />
            <TextField label="Title" value={value.title} maxLength={120} onChange={(title) => set({ title })} />
          </div>
          <TextAreaField label="Description" rows={2} maxLength={600} value={value.description} onChange={(description) => set({ description })} />
        </div>
      </Card>
      <Card title="Inquiry form">
        <div className="flex flex-col gap-4">
          <TextAreaField label="Message box placeholder" rows={2} maxLength={200} value={value.messagePlaceholder} onChange={(messagePlaceholder) => set({ messagePlaceholder })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Send button" value={value.submitLabel} maxLength={40} onChange={(submitLabel) => set({ submitLabel })} />
            <TextField label="Privacy note" value={value.privacyNote} maxLength={200} onChange={(privacyNote) => set({ privacyNote })} />
            <TextField label="Success title" value={value.successTitle} maxLength={80} onChange={(successTitle) => set({ successTitle })} />
          </div>
          <TextAreaField label="Success message" rows={2} maxLength={300} value={value.successText} onChange={(successText) => set({ successText })} />
        </div>
      </Card>
      <Card title="Sidebar">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Contact box title" value={value.sideTitle} maxLength={80} onChange={(sideTitle) => set({ sideTitle })} />
            <TextField label="Next steps title" value={value.nextStepsTitle} maxLength={80} onChange={(nextStepsTitle) => set({ nextStepsTitle })} />
          </div>
          <StringListEditor label="What happens next" items={value.nextSteps} onChange={(nextSteps) => set({ nextSteps })} addLabel="Add step" itemLabel="Step" max={6} />
          <p className="text-xs text-muted">Phone, email, address and hours come from Site settings.</p>
        </div>
      </Card>
    </>
  );
}

// ---------------- Page ----------------

function Editor<K extends PageKey>({ pageKey }: { pageKey: K }) {
  const { draft, setDraft, error, saver, save, dirty } = useContentDoc(pageKey);
  const preview = pages.find((p) => p.key === pageKey)!.preview;

  const body = (() => {
    if (!draft) return null;
    switch (pageKey) {
      case "home":
        return <HomeEditor home={draft as HomePage} onChange={(v) => setDraft(v as ContentMap[K])} />;
      case "products":
        return <ProductsPageEditor value={draft as ContentMap["products"]} onChange={(v) => setDraft(v as ContentMap[K])} />;
      case "product-detail":
        return <ProductDetailEditor value={draft as ContentMap["product-detail"]} onChange={(v) => setDraft(v as ContentMap[K])} />;
      case "services":
        return <ServicesPageEditor value={draft as ContentMap["services"]} onChange={(v) => setDraft(v as ContentMap[K])} />;
      case "contact":
        return <ContactPageEditor value={draft as ContentMap["contact"]} onChange={(v) => setDraft(v as ContentMap[K])} />;
    }
  })();

  return (
    <>
      <PageHeader
        title="Page content"
        description="Edit every heading, sentence and button on the public pages. Changes go live when you publish."
        actions={
          <>
            <SaveStatus {...saver} />
            {dirty && saver.status === "idle" && <span className="text-[13px] text-muted">Unpublished changes</span>}
            <a href={preview} target="_blank" rel="noreferrer" className={btn.secondary}>
              View page
            </a>
            <button type="button" className={btn.primary} disabled={!dirty || saver.saving} onClick={save}>
              Publish changes
            </button>
          </>
        }
      />
      <nav aria-label="Pages" className="flex flex-wrap gap-1 border-b border-line">
        {pages.map((p) => (
          <Link
            key={p.key}
            href={`/admin/content/${p.key}`}
            aria-current={p.key === pageKey ? "page" : undefined}
            className={`-mb-px border-b-3 px-4 py-2.5 font-semibold ${p.key === pageKey ? "border-brand font-bold text-brand" : "border-transparent text-muted hover:text-ink"}`}
          >
            {p.label}
          </Link>
        ))}
      </nav>
      {error && <Notice tone="error">{error}</Notice>}
      {draft ? <div className="flex max-w-4xl flex-col gap-5">{body}</div> : !error && <Loading />}
    </>
  );
}

export default function ContentPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = use(params);
  if (!pages.some((p) => p.key === page)) notFound();
  return <Editor key={page} pageKey={page as PageKey} />;
}
