import {
  Cable,
  Cctv,
  ClipboardCheck,
  Gauge,
  Handshake,
  Headset,
  Lightbulb,
  Mic,
  Monitor,
  Network,
  Package,
  Radio,
  Ruler,
  ShieldCheck,
  SlidersVertical,
  Speaker,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

// Icons that categories, services and "why us" reasons can use. The names are stored in the
// database, so keep them in sync with IconName in backend/app/schemas.py.
export const icons: Record<string, { label: string; Icon: LucideIcon }> = {
  speaker: { label: "Speaker", Icon: Speaker },
  gauge: { label: "Amplifier", Icon: Gauge },
  sliders: { label: "Mixer", Icon: SlidersVertical },
  mic: { label: "Microphone", Icon: Mic },
  cctv: { label: "CCTV camera", Icon: Cctv },
  cable: { label: "Cable", Icon: Cable },
  radio: { label: "Radio", Icon: Radio },
  network: { label: "Network", Icon: Network },
  monitor: { label: "Monitor", Icon: Monitor },
  lightbulb: { label: "Lighting", Icon: Lightbulb },
  wrench: { label: "Repair", Icon: Wrench },
  clipboard: { label: "Checklist", Icon: ClipboardCheck },
  ruler: { label: "Survey", Icon: Ruler },
  shield: { label: "Quality", Icon: ShieldCheck },
  handshake: { label: "Deal", Icon: Handshake },
  headset: { label: "Support", Icon: Headset },
  package: { label: "Package", Icon: Package },
};

export const iconNames = Object.keys(icons);

export function NamedIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name]?.Icon ?? Package;
  return <Icon aria-hidden {...props} />;
}
