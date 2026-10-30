"use client";

import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import { api, errorText } from "@/lib/admin-api";
import { move } from "./editors";
import { btn } from "./ui";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { url } = await api<{ url: string }>("/admin/uploads", { method: "POST", formData: form });
  return url;
}

function useUploader(onUploaded: (urls: string[]) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const urls: string[] = [];
    try {
      for (const file of Array.from(files)) urls.push(await uploadFile(file));
    } catch (err) {
      setError(errorText(err));
    } finally {
      if (urls.length) onUploaded(urls);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return { inputRef, busy, error, handleFiles };
}

/** Product photos: upload several, reorder (the first is the main photo), remove. */
export function ImageListEditor({ images, onChange, max = 12 }: { images: string[]; onChange: (images: string[]) => void; max?: number }) {
  const { inputRef, busy, error, handleFiles } = useUploader((urls) => onChange([...images, ...urls].slice(0, max)));

  return (
    <div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
        {images.map((src, i) => (
          <li key={src} className="group relative aspect-square overflow-hidden rounded-md border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- uploaded file preview */}
            <img src={src} alt={`Photo ${i + 1}`} className="absolute inset-0 size-full object-contain p-2" />
            {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">Main</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/90 p-1">
              <div className="flex">
                <button type="button" className={btn.icon} disabled={i === 0} onClick={() => onChange(move(images, i, i - 1))} aria-label={`Move photo ${i + 1} earlier`}>
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  className={btn.icon}
                  disabled={i === images.length - 1}
                  onClick={() => onChange(move(images, i, i + 1))}
                  aria-label={`Move photo ${i + 1} later`}
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <button type="button" className={btn.icon} onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}>
                <X className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {images.length < max && (
          <li>
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-[#c4c8cd] bg-[#fafbfb] text-muted transition hover:border-ink hover:text-ink"
            >
              {busy ? <LoaderCircle className="size-6 animate-spin" aria-hidden /> : <ImagePlus className="size-6" aria-hidden />}
              <span className="font-semibold">{busy ? "Uploading…" : "Upload photos"}</span>
              <span className="text-xs">JPG, PNG or WebP, up to 5 MB</span>
            </button>
          </li>
        )}
      </ul>
      <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-[#a3000a]">
          {error}
        </p>
      )}
    </div>
  );
}

/** A single image (logo, share image) with replace / remove. */
export function SingleImageField({
  label,
  value,
  onChange,
  hint,
  previewClass = "h-12",
  removable = true,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  previewClass?: string;
  removable?: boolean;
}) {
  const { inputRef, busy, error, handleFiles } = useUploader((urls) => onChange(urls[0]));

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold">{label}</p>
      <div className="flex flex-wrap items-center gap-4 rounded-md border border-line p-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- uploaded file preview
          <img src={value} alt={`Current ${label.toLowerCase()}`} className={`w-auto max-w-full ${previewClass}`} />
        ) : (
          <span className="grid h-20 w-36 place-items-center rounded-md border-2 border-dashed border-[#c4c8cd] text-xs font-semibold text-muted">No image</span>
        )}
        <div className="flex gap-2">
          <button type="button" className={btn.secondary} disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && removable && (
            <button type="button" className={btn.secondary} onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
        {hint && <p className="basis-full text-xs text-muted">{hint}</p>}
      </div>
      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => handleFiles(e.target.files)} />
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-[#a3000a]">
          {error}
        </p>
      )}
    </div>
  );
}
