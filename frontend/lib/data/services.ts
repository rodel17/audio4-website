import type { Service } from "../types";

export const services: Service[] = [
  {
    slug: "sound-system-installation",
    name: "Sound System Design & Installation",
    summary:
      "Complete PA and sound reinforcement systems for churches, schools, restaurants, function halls and offices — designed for your space and installed by our team.",
    includes: [
      "Coverage and speaker placement planning",
      "Speaker mounting and cable runs",
      "Rack wiring and system tuning",
      "Hand-over and user training",
    ],
  },
  {
    slug: "cctv-installation",
    name: "CCTV & Security Installation",
    summary:
      "Surveillance systems for homes, shops, warehouses and offices, including remote viewing on your phone.",
    includes: [
      "Camera coverage planning",
      "Cabling and mounting",
      "NVR/DVR setup and storage sizing",
      "Mobile app remote viewing setup",
    ],
  },
  {
    slug: "repair-servicing",
    name: "Repair & Servicing",
    summary:
      "Diagnosis and repair of amplifiers, mixers, speakers, cameras and other electronic equipment.",
    includes: ["Bench diagnosis", "Component-level repair", "Speaker driver replacement", "Testing before release"],
  },
  {
    slug: "preventive-maintenance",
    name: "Preventive Maintenance",
    summary: "Scheduled check-ups that keep your sound and security systems running reliably.",
    includes: ["System health checks", "Cleaning and connector inspection", "Firmware updates", "Maintenance reports"],
  },
  {
    slug: "site-survey-consultation",
    name: "Site Survey & Consultation",
    summary:
      "Not sure what you need? We visit your site, assess the requirements and recommend the right equipment.",
    includes: ["On-site assessment", "Equipment recommendation", "Layout and cabling plan", "Itemized quotation"],
  },
  {
    slug: "structured-cabling",
    name: "Network & Structured Cabling",
    summary:
      "Clean, labeled cabling for IP cameras, audio networks and office data — done right the first time.",
    includes: ["UTP and fiber runs", "Rack and patch panel termination", "Cable testing", "Labeling and documentation"],
  },
];
