import ClientHello from "./client-hello";

// Render on every request so the backend is queried at runtime, not at build time.
export const dynamic = "force-dynamic";

async function getHealth(): Promise<string> {
  // Server-side: reach the backend over the Docker network (http://backend:8000).
  const apiUrl = process.env.API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${apiUrl}/api/health`, { cache: "no-store" });
    const data: { status: string } = await res.json();
    return data.status;
  } catch {
    return "unreachable";
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main>
      <h1>Next.js + FastAPI</h1>
      <p>Backend health (server-side fetch): {health}</p>
      <ClientHello />
    </main>
  );
}
