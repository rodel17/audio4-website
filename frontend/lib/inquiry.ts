export type Inquiry = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  quantity?: string;
  preferredContact: "phone" | "email" | "either";
  message: string;
};

// Sends a sales inquiry to the backend.
// The backend endpoint (POST /api/inquiries) is not implemented yet, so this
// currently fails and the form falls back to showing the phone and email.
export async function submitInquiry(inquiry: Inquiry): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiry),
  });
  if (!res.ok) {
    throw new Error(`Inquiry request failed with status ${res.status}`);
  }
}
