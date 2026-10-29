"use client";

import { useEffect, useState } from "react";

export default function ClientHello() {
  const [message, setMessage] = useState("loading...");

  useEffect(() => {
    // Browser-side: reach the backend through the port published on the host.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    fetch(`${apiUrl}/api/hello`)
      .then((res) => res.json())
      .then((data: { message: string }) => setMessage(data.message))
      .catch(() => setMessage("unreachable"));
  }, []);

  return <p>Backend message (browser fetch): {message}</p>;
}
