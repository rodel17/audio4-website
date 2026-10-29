import {
  Cable,
  Cctv,
  ClipboardCheck,
  Gauge,
  Mic,
  Network,
  Package,
  Ruler,
  SlidersVertical,
  Speaker,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  speakers: Speaker,
  amplifiers: Gauge,
  "mixers-processors": SlidersVertical,
  microphones: Mic,
  cctv: Cctv,
  "cables-accessories": Cable,
};

const serviceIcons: Record<string, LucideIcon> = {
  "sound-system-installation": Speaker,
  "cctv-installation": Cctv,
  "repair-servicing": Wrench,
  "preventive-maintenance": ClipboardCheck,
  "site-survey-consultation": Ruler,
  "structured-cabling": Network,
};

export function CategoryIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const Icon = categoryIcons[slug] ?? Package;
  return <Icon aria-hidden {...props} />;
}

export function ServiceIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const Icon = serviceIcons[slug] ?? Wrench;
  return <Icon aria-hidden {...props} />;
}
