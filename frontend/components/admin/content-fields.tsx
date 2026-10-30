"use client";

import { useEffect, useState } from "react";
import { api, useApi, useSaver } from "@/lib/admin-api";
import type { ContentMap, Heading } from "@/lib/types";
import { TextAreaField, TextField } from "./ui";

/** Loads one content document, keeps an editable copy, and saves it back. */
export function useContentDoc<K extends keyof ContentMap>(key: K) {
  const { data, error } = useApi<ContentMap[K]>(`/admin/content/${key}`);
  const [draft, setDraft] = useState<ContentMap[K] | null>(null);
  const [saved, setSaved] = useState<string>("");
  const saver = useSaver();

  useEffect(() => {
    if (data) {
      setDraft(data);
      setSaved(JSON.stringify(data));
    }
  }, [data]);

  async function save() {
    if (!draft) return;
    const result = await saver.run(() => api<ContentMap[K]>(`/admin/content/${key}`, { method: "PUT", body: draft }));
    if (result) {
      setDraft(result);
      setSaved(JSON.stringify(result));
    }
  }

  return { draft, setDraft, error, saver, save, dirty: draft !== null && JSON.stringify(draft) !== saved };
}

/** Label / title / red words / description fields shared by many sections. */
export function HeadingFields({
  value,
  onChange,
  withDescription = true,
  withEyebrow = true,
}: {
  value: Heading;
  onChange: (value: Heading) => void;
  withDescription?: boolean;
  withEyebrow?: boolean;
}) {
  const set = (patch: Partial<Heading>) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {withEyebrow && <TextField label="Small label" value={value.eyebrow} maxLength={80} onChange={(eyebrow) => set({ eyebrow })} />}
        <TextField label="Title" value={value.title} maxLength={120} onChange={(title) => set({ title })} />
        <TextField label="Word(s) in red" hint="part of the title" value={value.highlight} maxLength={80} onChange={(highlight) => set({ highlight })} />
      </div>
      {withDescription && <TextAreaField label="Description" rows={2} maxLength={600} value={value.description} onChange={(description) => set({ description })} />}
    </div>
  );
}
