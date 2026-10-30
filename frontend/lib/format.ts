// Small display helpers shared by the public site and the admin.

/** A dialable tel: link from a display number like "(02) 123-4567" or "+63 912 345 6789". */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

export function linkTargetHref(target: "products" | "services" | "contact"): string {
  return `/${target}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** "10 min ago", "Yesterday", "3 days ago", or a date for older items. */
export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  const days = Math.floor(seconds / 86400);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}
