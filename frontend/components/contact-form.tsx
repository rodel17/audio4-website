"use client";

import { CircleAlert, CircleCheck, Send } from "lucide-react";
import { useState } from "react";
import { submitInquiry, type Inquiry } from "@/lib/inquiry";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

function Field({ label, htmlFor, required, children }: { label: string; htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold uppercase tracking-wider">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const inquiry: Inquiry = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      company: String(data.get("company") ?? "") || undefined,
      subject: String(data.get("subject") ?? ""),
      quantity: String(data.get("quantity") ?? "") || undefined,
      preferredContact: (data.get("preferredContact") as Inquiry["preferredContact"]) ?? "either",
      message: String(data.get("message") ?? ""),
    };

    setStatus("sending");
    try {
      await submitInquiry(inquiry);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-black/10 bg-white p-8 text-center" role="status">
        <CircleCheck className="mx-auto size-12 text-brand" aria-hidden />
        <h2 className="display mt-4 text-3xl">Inquiry sent</h2>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          Thank you! Our sales team will get back to you shortly with pricing and availability.
        </p>
        <button type="button" className="btn btn-dark mt-6" onClick={() => setStatus("idle")}>
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border border-black/10 bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required>
          <input id="name" name="name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Company / organization" htmlFor="company">
          <input id="company" name="company" autoComplete="organization" className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </Field>
        <Field label="Phone / mobile" htmlFor="phone" required>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
        <Field label="Item or service you're interested in" htmlFor="subject" required>
          <input
            id="subject"
            name="subject"
            required
            defaultValue={defaultSubject}
            placeholder="e.g. 8-camera CCTV kit with installation"
            className={inputClass}
          />
        </Field>
        <Field label="Quantity" htmlFor="quantity">
          <input id="quantity" name="quantity" inputMode="numeric" placeholder="e.g. 4" className={inputClass} />
        </Field>
      </div>

      <Field label="Message" htmlFor="message" required>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us about your project, location and timeline so we can prepare an accurate quotation."
          className={inputClass}
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider">Preferred contact method</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[
            { value: "phone", label: "Phone call" },
            { value: "email", label: "Email" },
            { value: "either", label: "Either" },
          ].map((option) => (
            <label key={option.value} className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="preferredContact"
                value={option.value}
                defaultChecked={option.value === "either"}
                className="size-4 accent-brand"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {status === "error" && (
        <div className="flex gap-3 border-l-4 border-brand bg-brand/5 p-4 text-sm" role="alert">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <p>
            We couldn&apos;t send your inquiry right now. Please call us at{" "}
            <a href={site.phoneHref} className="font-bold text-brand underline">
              {site.phone}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${site.email}`} className="font-bold text-brand underline">
              {site.email}
            </a>
            .
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">We&apos;ll only use your details to respond to this inquiry.</p>
        <button type="submit" className="btn" disabled={status === "sending"}>
          <Send className="size-4" aria-hidden />
          {status === "sending" ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
