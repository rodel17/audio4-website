"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useContentDoc } from "@/components/admin/content-fields";
import { RowControls, move } from "@/components/admin/editors";
import { SingleImageField } from "@/components/admin/image-upload";
import { Card, Checkbox, Field, Loading, Notice, PageHeader, SaveStatus, TextAreaField, TextField, btn, inputClass } from "@/components/admin/ui";
import type { SiteSettings } from "@/lib/types";

const PLACEHOLDERS = { phone: "(000) 000-0000", email: "sales@example.com", address: "Street, City, Province" };

const sectionLinks = [
  ["company", "Company & brand"],
  ["contact", "Contact details"],
  ["navigation", "Header & menu"],
  ["footer", "Footer"],
  ["seo", "Search & sharing"],
  ["notify", "Inquiry emails"],
] as const;

function RecipientsField({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [text, setText] = useState("");
  const [invalid, setInvalid] = useState(false);

  function add() {
    const email = text.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInvalid(true);
      return;
    }
    if (!value.includes(email)) onChange([...value, email]);
    setText("");
    setInvalid(false);
  }

  return (
    <Field label="Send new inquiries to" hint="press Enter to add">
      {(id) => (
        <>
          <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-field px-2 py-1.5 focus-within:border-brand">
            {value.map((email) => (
              <span key={email} className="inline-flex items-center gap-1 rounded-full bg-[#eceef0] py-1 pr-1 pl-3 text-[13px] font-semibold">
                {email}
                <button type="button" aria-label={`Remove ${email}`} onClick={() => onChange(value.filter((e) => e !== email))} className="grid size-6 place-items-center rounded-full hover:bg-white">
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            <input
              id={id}
              type="email"
              value={text}
              placeholder="Add email…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  add();
                }
              }}
              onBlur={add}
              className="min-h-8 min-w-40 flex-1 text-sm outline-none"
            />
          </div>
          {invalid && <p className="mt-1.5 text-xs font-semibold text-[#a3000a]">That doesn&apos;t look like an email address.</p>}
        </>
      )}
    </Field>
  );
}

export default function SettingsPage() {
  const site = useContentDoc("site");
  const notify = useContentDoc("notifications");
  const s = site.draft;
  const n = notify.draft;

  const set = (patch: Partial<SiteSettings>) => s && site.setDraft({ ...s, ...patch });
  const saving = site.saver.saving || notify.saver.saving;
  const dirty = site.dirty || notify.dirty;
  const placeholdersLeft = s && (s.phone === PLACEHOLDERS.phone || s.email === PLACEHOLDERS.email || s.address === PLACEHOLDERS.address);

  async function saveAll() {
    await Promise.all([site.dirty && site.save(), notify.dirty && notify.save()]);
  }

  return (
    <>
      <PageHeader
        title="Site settings"
        description="Company details used across every page: header, footer, contact page and buttons."
        actions={
          <>
            <SaveStatus {...(site.saver.status === "error" ? site.saver : notify.saver.status === "error" ? notify.saver : site.saver.status !== "idle" ? site.saver : notify.saver)} />
            {dirty && !saving && <span className="text-[13px] text-muted">Unsaved changes</span>}
            <button type="button" className={btn.primary} disabled={!dirty || saving} onClick={saveAll}>
              Save settings
            </button>
          </>
        }
      />
      {(site.error || notify.error) && <Notice tone="error">{site.error || notify.error}</Notice>}
      {!s || !n ? (
        !site.error && <Loading />
      ) : (
        <div className="flex flex-wrap items-start gap-6">
          <nav aria-label="Settings sections" className="flex min-w-0 flex-[1_1_180px] flex-col gap-0.5 lg:sticky lg:top-6">
            {sectionLinks.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-r-md border-l-3 border-transparent px-3 py-2 font-semibold text-[#3f4349] hover:border-brand hover:bg-white">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex min-w-0 flex-[4_1_560px] flex-col gap-5">
            <Card id="company" title="Company & brand">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <TextField className="flex-[2_1_260px]" label="Company name" value={s.companyName} maxLength={120} onChange={(companyName) => set({ companyName })} />
                  <TextField className="flex-[1_1_180px]" label="Short name" hint="browser tab titles" value={s.shortName} maxLength={60} onChange={(shortName) => set({ shortName })} />
                </div>
                <TextField label="Tagline" value={s.tagline} maxLength={200} onChange={(tagline) => set({ tagline })} />
                <div className="flex flex-wrap gap-4">
                  <div className="flex-[2_1_300px]">
                    <SingleImageField
                      label="Logo"
                      value={s.logoUrl}
                      removable={false}
                      onChange={(logoUrl) => set({ logoUrl: logoUrl || "/logo.png" })}
                      hint="Used in the header. PNG or JPG, ideally on a white or transparent background."
                    />
                  </div>
                  <Field label="Brand color" hint="buttons and highlights" className="flex-[1_1_200px]">
                    {(id) => (
                      <div className="flex items-center gap-2.5 rounded-md border border-line p-3">
                        <input
                          type="color"
                          aria-label="Pick brand color"
                          value={s.brandColor}
                          onChange={(e) => set({ brandColor: e.target.value })}
                          className="size-10 cursor-pointer rounded-md border border-field"
                        />
                        <input
                          id={id}
                          value={s.brandColor}
                          maxLength={7}
                          onChange={(e) => set({ brandColor: e.target.value })}
                          className={`${inputClass} w-28 font-mono`}
                        />
                        <button type="button" className="text-xs font-semibold text-muted hover:text-ink" onClick={() => set({ brandColor: "#cf010d" })}>
                          Reset
                        </button>
                      </div>
                    )}
                  </Field>
                </div>
              </div>
            </Card>

            <Card id="contact" title="Contact details" description="Shown in the top bar, footer, contact page and every “Call sales” button.">
              <div className="flex flex-col gap-4">
                {placeholdersLeft && (
                  <Notice tone="warning">
                    <strong>Still placeholders:</strong> replace the sample phone, email and address before launch.
                  </Notice>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Sales phone" type="tel" value={s.phone} maxLength={40} onChange={(phone) => set({ phone })} />
                  <TextField label="Sales email" type="email" value={s.email} maxLength={200} onChange={(email) => set({ email })} />
                  <TextField label="Business hours" value={s.hours} maxLength={120} onChange={(hours) => set({ hours })} />
                  <TextField label="Map link" hint="optional" type="url" placeholder="https://maps.google.com/…" value={s.mapUrl} maxLength={300} onChange={(mapUrl) => set({ mapUrl })} />
                </div>
                <TextAreaField label="Address" rows={2} maxLength={300} value={s.address} onChange={(address) => set({ address })} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField label="Facebook page" hint="optional" type="url" value={s.facebookUrl} maxLength={300} onChange={(facebookUrl) => set({ facebookUrl })} />
                  <TextField label="Messenger link" hint="optional" type="url" value={s.messengerUrl} maxLength={300} onChange={(messengerUrl) => set({ messengerUrl })} />
                  <TextField label="Viber / WhatsApp" hint="optional" value={s.viber} maxLength={60} onChange={(viber) => set({ viber })} />
                </div>
              </div>
            </Card>

            <Card id="navigation" title="Header & menu">
              <div className="flex flex-col gap-4">
                <fieldset>
                  <legend className="mb-2 text-[13px] font-semibold">Menu items</legend>
                  <ul className="flex flex-col gap-2">
                    {s.nav.map((item, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-2">
                        <input
                          aria-label={`Menu item ${i + 1} label`}
                          value={item.label}
                          maxLength={40}
                          onChange={(e) => set({ nav: s.nav.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                          className={`${inputClass} flex-1 basis-40`}
                        />
                        <input
                          aria-label={`Menu item ${i + 1} link`}
                          value={item.href}
                          maxLength={200}
                          placeholder="/products"
                          onChange={(e) => set({ nav: s.nav.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)) })}
                          className={`${inputClass} flex-1 basis-40 font-mono`}
                        />
                        <RowControls
                          index={i}
                          count={s.nav.length}
                          label={`menu item ${i + 1}`}
                          onMove={(to) => set({ nav: move(s.nav, i, to) })}
                          onRemove={() => set({ nav: s.nav.filter((_, j) => j !== i) })}
                        />
                      </li>
                    ))}
                  </ul>
                  {s.nav.length < 8 && (
                    <button type="button" className={`${btn.dashed} mt-2.5`} onClick={() => set({ nav: [...s.nav, { label: "", href: "/" }] })}>
                      + Add menu item
                    </button>
                  )}
                  <p className="mt-2 text-xs text-muted">Links: /, /products, /services, /contact, or a full https:// address.</p>
                </fieldset>
                <TextField label="Header button text" value={s.headerButtonLabel} maxLength={40} onChange={(headerButtonLabel) => set({ headerButtonLabel })} />
                <fieldset>
                  <legend className="mb-2 text-[13px] font-semibold">Top bar shows</legend>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <Checkbox label="Business hours" checked={s.topBarShowHours} onChange={(topBarShowHours) => set({ topBarShowHours })} />
                    <Checkbox label="Phone" checked={s.topBarShowPhone} onChange={(topBarShowPhone) => set({ topBarShowPhone })} />
                    <Checkbox label="Email" checked={s.topBarShowEmail} onChange={(topBarShowEmail) => set({ topBarShowEmail })} />
                  </div>
                </fieldset>
              </div>
            </Card>

            <Card id="footer" title="Footer" description="The footer’s product and service links come from Categories and Services automatically.">
              <div className="flex flex-col gap-4">
                <TextField label="Text under the logo" value={s.footerAbout} maxLength={300} onChange={(footerAbout) => set({ footerAbout })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Copyright line" hint="{year} becomes the current year" value={s.footerCopyright} maxLength={200} onChange={(footerCopyright) => set({ footerCopyright })} />
                  <TextField label="Pricing note" value={s.footerPricingNote} maxLength={200} onChange={(footerPricingNote) => set({ footerPricingNote })} />
                </div>
              </div>
            </Card>

            <Card id="seo" title="Search & sharing" description="How the site appears in Google results and when a link is shared on social media.">
              <div className="flex flex-col gap-4">
                <TextField label="Site title" value={s.seoTitle} maxLength={120} onChange={(seoTitle) => set({ seoTitle })} />
                <TextAreaField label="Description" rows={3} maxLength={300} value={s.seoDescription} onChange={(seoDescription) => set({ seoDescription })} />
                <SingleImageField label="Share image" previewClass="h-21" value={s.shareImageUrl} onChange={(shareImageUrl) => set({ shareImageUrl })} hint="1200 × 630 recommended." />
              </div>
            </Card>

            <Card id="notify" title="Inquiry emails" description="Who gets notified when someone sends an inquiry, and what the customer receives.">
              <div className="flex flex-col gap-4">
                <RecipientsField value={n.recipients} onChange={(recipients) => notify.setDraft({ ...n, recipients })} />
                <Checkbox label="Send the customer a confirmation email" checked={n.sendConfirmation} onChange={(sendConfirmation) => notify.setDraft({ ...n, sendConfirmation })} />
                <TextAreaField
                  label="Confirmation message"
                  rows={3}
                  maxLength={1000}
                  value={n.confirmationMessage}
                  onChange={(confirmationMessage) => notify.setDraft({ ...n, confirmationMessage })}
                />
                <p className="text-xs text-muted">Emails are sent only when an SMTP server is configured on the backend (SMTP_HOST in .env).</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
