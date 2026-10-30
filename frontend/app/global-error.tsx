"use client";

// Shown when the root layout itself fails, e.g. the backend is unreachable.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>We&apos;ll be right back</h1>
          <p style={{ color: "#5b6068" }}>The website is temporarily unavailable. Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ padding: "10px 18px", background: "#cf010d", color: "#fff", border: 0, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
