"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { iconNames, icons } from "@/components/icons";
import type { Spec, Step } from "@/lib/types";
import { btn, inputClass } from "./ui";

export function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Up / down / remove buttons for one row of a list. */
export function RowControls({
  index,
  count,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove?: () => void;
  label: string;
}) {
  return (
    <div className="flex shrink-0">
      <button type="button" className={btn.icon} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" className={btn.icon} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="size-4" />
      </button>
      {onRemove && (
        <button type="button" className={btn.icon} onClick={onRemove} aria-label={`Remove ${label}`}>
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function StringListEditor({
  label,
  hint,
  items,
  onChange,
  addLabel,
  itemLabel,
  placeholder,
  max = 12,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  itemLabel: string;
  placeholder?: string;
  max?: number;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-semibold">
        {label}
        {hint && <span className="font-normal text-muted"> — {hint}</span>}
      </legend>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <input
              aria-label={`${itemLabel} ${i + 1}`}
              value={item}
              placeholder={placeholder}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              className={inputClass}
            />
            <RowControls
              index={i}
              count={items.length}
              label={`${itemLabel} ${i + 1}`}
              onMove={(to) => onChange(move(items, i, to))}
              onRemove={() => onChange(items.filter((_, j) => j !== i))}
            />
          </li>
        ))}
      </ul>
      {items.length < max && (
        <button type="button" className={`${btn.dashed} mt-2.5`} onClick={() => onChange([...items, ""])}>
          + {addLabel}
        </button>
      )}
    </fieldset>
  );
}

export function SpecsEditor({ specs, onChange }: { specs: Spec[]; onChange: (specs: Spec[]) => void }) {
  const update = (i: number, patch: Partial<Spec>) => onChange(specs.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div>
      {specs.length > 0 && (
        <div className="mb-2 hidden grid-cols-[2fr_3fr_auto] gap-2 text-xs font-bold tracking-wider text-muted uppercase sm:grid">
          <span>Label</span>
          <span>Value</span>
          <span className="w-30" />
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {specs.map((spec, i) => (
          <li key={i} className="grid gap-2 sm:grid-cols-[2fr_3fr_auto] sm:items-center">
            <input aria-label={`Spec ${i + 1} label`} value={spec.label} placeholder="e.g. Weight" onChange={(e) => update(i, { label: e.target.value })} className={inputClass} />
            <input aria-label={`Spec ${i + 1} value`} value={spec.value} placeholder="e.g. 22 kg" onChange={(e) => update(i, { value: e.target.value })} className={inputClass} />
            <RowControls
              index={i}
              count={specs.length}
              label={`spec ${i + 1}`}
              onMove={(to) => onChange(move(specs, i, to))}
              onRemove={() => onChange(specs.filter((_, j) => j !== i))}
            />
          </li>
        ))}
      </ul>
      {specs.length < 40 && (
        <button type="button" className={`${btn.dashed} mt-2.5`} onClick={() => onChange([...specs, { label: "", value: "" }])}>
          + Add specification
        </button>
      )}
    </div>
  );
}

export function StepsEditor({
  steps,
  onChange,
  itemLabel = "Step",
  max = 6,
  multilineText = false,
}: {
  steps: Step[];
  onChange: (steps: Step[]) => void;
  itemLabel?: string;
  max?: number;
  multilineText?: boolean;
}) {
  const update = (i: number, patch: Partial<Step>) => onChange(steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div>
      <ul className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li key={i}>
            <fieldset className="rounded-md border border-line p-3">
              <legend className="px-1 text-[13px] font-bold">
                {itemLabel} {i + 1}
              </legend>
              <div className="flex flex-wrap items-start gap-2">
                <input
                  aria-label={`${itemLabel} ${i + 1} title`}
                  value={step.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  className={`${inputClass} font-semibold sm:max-w-56`}
                />
                {multilineText ? (
                  <textarea
                    aria-label={`${itemLabel} ${i + 1} text`}
                    value={step.text}
                    rows={2}
                    onChange={(e) => update(i, { text: e.target.value })}
                    className={`${inputClass} min-w-0 flex-1 basis-64 resize-y py-2`}
                  />
                ) : (
                  <input
                    aria-label={`${itemLabel} ${i + 1} text`}
                    value={step.text}
                    onChange={(e) => update(i, { text: e.target.value })}
                    className={`${inputClass} min-w-0 flex-1 basis-64`}
                  />
                )}
                <RowControls
                  index={i}
                  count={steps.length}
                  label={`${itemLabel.toLowerCase()} ${i + 1}`}
                  onMove={(to) => onChange(move(steps, i, to))}
                  onRemove={() => onChange(steps.filter((_, j) => j !== i))}
                />
              </div>
            </fieldset>
          </li>
        ))}
      </ul>
      {steps.length < max && (
        <button type="button" className={`${btn.dashed} mt-2.5`} onClick={() => onChange([...steps, { title: "", text: "" }])}>
          + Add {itemLabel.toLowerCase()}
        </button>
      )}
    </div>
  );
}

export function IconPicker({ value, onChange, label = "Icon" }: { value: string; onChange: (name: string) => void; label?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-semibold">{label}</legend>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2">
        {iconNames.map((name) => {
          const { Icon, label: iconLabel } = icons[name];
          const on = name === value;
          return (
            <button
              key={name}
              type="button"
              title={iconLabel}
              aria-label={`${iconLabel} icon`}
              aria-pressed={on}
              onClick={() => onChange(name)}
              className={`grid h-13 place-items-center rounded-md border-2 transition ${
                on ? "border-brand bg-[#fff7f7] text-brand" : "border-line bg-white text-[#3f4349] hover:border-field"
              }`}
            >
              <Icon className="size-5.5" strokeWidth={1.6} aria-hidden />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
