export type Inquiry = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  quantity?: string;
  preferredContact: "phone" | "email" | "either";
  message: string;
  productSlug?: string;
  serviceSlug?: string;
  // Honeypot field: hidden from visitors, left empty by real people.
  website?: string;
};

// Sends a sales inquiry to the backend (proxied through Next.js at /api).
export async function submitInquiry(inquiry: Inquiry): Promise<void> {
  const res = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiry),
  });
  if (!res.ok) {
    throw new Error(`Inquiry request failed with status ${res.status}`);
  }
}
