import type { Product } from "../types";

// Sample catalog. Replace with real items (or load them from the backend).
export const products: Product[] = [
  // ---- Speakers ----
  {
    slug: "active-pa-speaker-15",
    name: "15\" Two-Way Active PA Speaker",
    category: "speakers",
    summary: "Powered full-range speaker for live events, churches and mid-size venues.",
    description:
      "A high-output powered loudspeaker with a 15-inch woofer and compression driver. Built-in amplification and DSP presets make it quick to deploy for live sound, speech and music playback.",
    highlights: ["Built-in Class-D amplifier", "DSP presets for music and speech", "Pole-mount socket and fly points"],
    specs: [
      { label: "Woofer", value: "15\" (380 mm)" },
      { label: "HF driver", value: "1.75\" compression driver" },
      { label: "Amplifier power", value: "1000 W peak" },
      { label: "Frequency response", value: "45 Hz – 20 kHz" },
      { label: "Max SPL", value: "128 dB" },
      { label: "Inputs", value: "XLR/TRS combo, RCA" },
      { label: "Weight", value: "22 kg" },
    ],
    featured: true,
  },
  {
    slug: "passive-full-range-speaker-12",
    name: "12\" Passive Full-Range Speaker",
    category: "speakers",
    summary: "Durable passive cabinet for installed sound and portable PA systems.",
    description:
      "A rugged plywood cabinet with a 12-inch woofer and 1-inch HF driver. Pairs with an external power amplifier for flexible installed or portable systems.",
    highlights: ["Plywood cabinet with steel grille", "Speakon and 1/4\" inputs", "Wall-mount bracket option"],
    specs: [
      { label: "Woofer", value: "12\" (300 mm)" },
      { label: "HF driver", value: "1\" compression driver" },
      { label: "Power handling", value: "350 W RMS" },
      { label: "Impedance", value: "8 Ω" },
      { label: "Frequency response", value: "55 Hz – 18 kHz" },
      { label: "Weight", value: "17 kg" },
    ],
  },
  {
    slug: "active-subwoofer-18",
    name: "18\" Active Subwoofer",
    category: "speakers",
    summary: "Deep, powerful low end for live music, events and large rooms.",
    description:
      "A powered subwoofer with an 18-inch long-excursion driver. Integrated crossover with link outputs to feed your top speakers.",
    highlights: ["Built-in crossover with link outputs", "Top-speaker pole socket", "Heavy-duty casters"],
    specs: [
      { label: "Driver", value: "18\" (460 mm)" },
      { label: "Amplifier power", value: "1600 W peak" },
      { label: "Frequency response", value: "35 Hz – 150 Hz" },
      { label: "Max SPL", value: "132 dB" },
      { label: "Crossover", value: "Adjustable 80–150 Hz" },
      { label: "Weight", value: "45 kg" },
    ],
    featured: true,
  },
  {
    slug: "ceiling-speaker-100v",
    name: "6.5\" Ceiling Speaker (100 V Line)",
    category: "speakers",
    summary: "Background music and paging for offices, stores and restaurants.",
    description:
      "A flush-mount ceiling speaker with a 6.5-inch coaxial driver and selectable 100 V transformer taps for distributed audio systems.",
    highlights: ["100 V / 70 V transformer taps", "Spring clamps for quick install", "Paintable white grille"],
    specs: [
      { label: "Driver", value: "6.5\" coaxial" },
      { label: "Power taps", value: "3 W / 6 W / 10 W" },
      { label: "Frequency response", value: "80 Hz – 18 kHz" },
      { label: "Cut-out diameter", value: "190 mm" },
      { label: "Mounting", value: "Ceiling, spring clamp" },
    ],
  },
  {
    slug: "outdoor-horn-speaker-30w",
    name: "30 W Outdoor Horn Speaker",
    category: "speakers",
    summary: "Weatherproof paging speaker for schools, factories and outdoor areas.",
    description:
      "A weather-resistant horn speaker for announcements and paging over long distances. Works on 100 V line systems or low-impedance amplifiers.",
    highlights: ["Weather-resistant housing", "Adjustable mounting bracket", "100 V line or 8 Ω"],
    specs: [
      { label: "Rated power", value: "30 W" },
      { label: "Frequency response", value: "350 Hz – 8 kHz" },
      { label: "Sensitivity", value: "108 dB" },
      { label: "Input", value: "100 V line / 8 Ω" },
      { label: "Rating", value: "IP65" },
    ],
  },

  // ---- Amplifiers ----
  {
    slug: "power-amplifier-2x800",
    name: "2-Channel Power Amplifier 2 × 800 W",
    category: "amplifiers",
    summary: "Reliable workhorse amplifier for passive PA and installed systems.",
    description:
      "A rack-mount two-channel power amplifier with stereo, parallel and bridge modes. Protection circuits keep your speakers and amplifier safe during long sessions.",
    highlights: ["Stereo, parallel and bridge modes", "Clip limiter and protection circuits", "2U rack-mount chassis"],
    specs: [
      { label: "Power @ 8 Ω", value: "2 × 500 W" },
      { label: "Power @ 4 Ω", value: "2 × 800 W" },
      { label: "Bridged @ 8 Ω", value: "1600 W" },
      { label: "Inputs", value: "XLR, TRS" },
      { label: "Outputs", value: "Speakon, binding posts" },
      { label: "Size", value: "2U rack" },
    ],
    featured: true,
  },
  {
    slug: "mixer-amplifier-120w",
    name: "120 W Mixer Amplifier with USB/Bluetooth",
    category: "amplifiers",
    summary: "All-in-one PA amplifier for paging and background music.",
    description:
      "Combines mic and music inputs, a media player and a 100 V amplifier in one unit — ideal for stores, schools, offices and small venues.",
    highlights: ["Built-in USB/SD/Bluetooth player", "Priority mic paging", "100 V line and low-Z outputs"],
    specs: [
      { label: "Rated output", value: "120 W" },
      { label: "Inputs", value: "4 mic, 2 aux, USB/SD/BT" },
      { label: "Outputs", value: "100 V / 70 V / 4–16 Ω" },
      { label: "Zones", value: "5 selectable zones" },
      { label: "Power", value: "AC 220 V / DC 24 V" },
    ],
    featured: true,
  },
  {
    slug: "installation-amplifier-4ch",
    name: "4-Channel Class-D Installation Amplifier",
    category: "amplifiers",
    summary: "Compact, efficient multi-zone amplifier for commercial installs.",
    description:
      "A cool-running Class-D amplifier that powers up to four zones from a single rack space, with low-Z and 100 V operation per channel.",
    highlights: ["4 independent channels", "Low-Z or 100 V per channel", "1U, fan-assisted cooling"],
    specs: [
      { label: "Power @ 4 Ω", value: "4 × 300 W" },
      { label: "100 V mode", value: "4 × 250 W" },
      { label: "Inputs", value: "Euroblock balanced" },
      { label: "Amplifier class", value: "Class-D" },
      { label: "Size", value: "1U rack" },
    ],
  },

  // ---- Mixers & Processors ----
  {
    slug: "digital-mixer-16ch",
    name: "16-Channel Digital Mixer",
    category: "mixers-processors",
    summary: "Touchscreen digital console with built-in effects and recording.",
    description:
      "A compact digital mixer with recallable scenes, onboard EQ, dynamics and effects on every channel. Control it from the touchscreen or a tablet.",
    highlights: ["Scene recall", "Tablet remote control", "Multitrack USB recording"],
    specs: [
      { label: "Mic inputs", value: "16 XLR/TRS combo" },
      { label: "Aux buses", value: "8" },
      { label: "Effects", value: "4 FX engines" },
      { label: "Display", value: "7\" touchscreen" },
      { label: "Recording", value: "USB, 18 × 18" },
    ],
    featured: true,
  },
  {
    slug: "analog-mixer-8ch",
    name: "8-Channel Analog Mixer with Effects",
    category: "mixers-processors",
    summary: "Straightforward mixer for small events, rehearsals and churches.",
    description:
      "Easy-to-use analog mixer with built-in effects, 3-band EQ per channel and a USB audio interface for streaming and recording.",
    highlights: ["Built-in digital effects", "USB audio interface", "Phantom power"],
    specs: [
      { label: "Channels", value: "8 (4 mono + 2 stereo)" },
      { label: "EQ", value: "3-band per channel" },
      { label: "Aux sends", value: "2" },
      { label: "Phantom power", value: "+48 V" },
      { label: "USB", value: "2 × 2 audio interface" },
    ],
  },
  {
    slug: "speaker-processor-4x8",
    name: "4 × 8 Digital Speaker Processor",
    category: "mixers-processors",
    summary: "Crossover, EQ, delay and limiting for tuning your sound system.",
    description:
      "A rack-mount DSP for managing multi-way speaker systems with crossovers, parametric EQ, delay and limiters on every output.",
    highlights: ["Crossover, EQ, delay, limiter", "PC software control", "Password-protected presets"],
    specs: [
      { label: "Inputs / outputs", value: "4 in / 8 out" },
      { label: "Sample rate", value: "96 kHz" },
      { label: "Output EQ", value: "9-band parametric" },
      { label: "Delay", value: "Up to 1000 ms" },
      { label: "Control", value: "USB, Ethernet" },
    ],
  },

  // ---- Microphones ----
  {
    slug: "uhf-wireless-mic-dual",
    name: "Dual-Channel UHF Wireless Microphone System",
    category: "microphones",
    summary: "Two handheld wireless mics with a stable, interference-resistant link.",
    description:
      "A dual-channel UHF system with automatic frequency scanning and long operating range, suited to churches, events and conference rooms.",
    highlights: ["Auto frequency scan", "Up to 100 m range", "Rack-mountable receiver"],
    specs: [
      { label: "Channels", value: "2 handheld" },
      { label: "Band", value: "UHF" },
      { label: "Range", value: "Up to 100 m (line of sight)" },
      { label: "Battery life", value: "Approx. 8 hours (2 × AA)" },
      { label: "Outputs", value: "2 × XLR, 1 × mixed 1/4\"" },
    ],
    featured: true,
  },
  {
    slug: "dynamic-vocal-microphone",
    name: "Dynamic Vocal Microphone",
    category: "microphones",
    summary: "Rugged cardioid mic for vocals and speech.",
    description: "A tough, feedback-resistant cardioid dynamic microphone for live vocals, speech and worship.",
    highlights: ["Cardioid pickup pattern", "Built-in pop filter", "Includes clip and pouch"],
    specs: [
      { label: "Type", value: "Dynamic" },
      { label: "Polar pattern", value: "Cardioid" },
      { label: "Frequency response", value: "50 Hz – 15 kHz" },
      { label: "Connector", value: "XLR" },
    ],
  },
  {
    slug: "gooseneck-conference-microphone",
    name: "Gooseneck Conference Microphone",
    category: "microphones",
    summary: "Clear speech pickup for podiums, boardrooms and council halls.",
    description:
      "A condenser gooseneck microphone with a weighted desk base, LED ring and talk button for meetings and lecterns.",
    highlights: ["Talk/mute button with LED ring", "Flexible 45 cm gooseneck", "Weighted desk base"],
    specs: [
      { label: "Type", value: "Condenser" },
      { label: "Polar pattern", value: "Cardioid" },
      { label: "Gooseneck length", value: "45 cm" },
      { label: "Power", value: "Phantom power or battery" },
      { label: "Connector", value: "XLR" },
    ],
  },

  // ---- CCTV ----
  {
    slug: "ip-bullet-camera-4mp",
    name: "4MP IP Bullet Camera with Night Vision",
    category: "cctv",
    summary: "Outdoor-ready camera with sharp day and night footage.",
    description:
      "A weatherproof 4-megapixel IP camera with infrared night vision and PoE power, so one cable carries both power and video.",
    highlights: ["Up to 30 m IR night vision", "PoE — one cable for power and data", "Motion detection alerts"],
    specs: [
      { label: "Resolution", value: "4 MP (2560 × 1440)" },
      { label: "Lens", value: "2.8 mm fixed" },
      { label: "Night vision", value: "IR up to 30 m" },
      { label: "Power", value: "PoE / 12 V DC" },
      { label: "Rating", value: "IP67" },
      { label: "Compression", value: "H.265+" },
    ],
    featured: true,
  },
  {
    slug: "ip-dome-camera-8mp",
    name: "8MP (4K) IP Dome Camera",
    category: "cctv",
    summary: "Discreet 4K dome camera for lobbies, stores and offices.",
    description:
      "A vandal-resistant 4K dome camera with a wide dynamic range sensor for clear images in high-contrast lighting.",
    highlights: ["4K Ultra HD", "Wide dynamic range", "Vandal-resistant housing"],
    specs: [
      { label: "Resolution", value: "8 MP (3840 × 2160)" },
      { label: "Lens", value: "2.8 mm fixed" },
      { label: "Night vision", value: "IR up to 30 m" },
      { label: "Power", value: "PoE / 12 V DC" },
      { label: "Rating", value: "IP67, IK10" },
    ],
  },
  {
    slug: "nvr-16ch-4k",
    name: "16-Channel 4K Network Video Recorder",
    category: "cctv",
    summary: "Records and manages up to 16 IP cameras with remote viewing.",
    description:
      "A network video recorder with built-in PoE ports, multi-drive storage and mobile app access for monitoring from anywhere.",
    highlights: ["16 built-in PoE ports", "Up to 2 hard drives", "Remote viewing via mobile app"],
    specs: [
      { label: "Channels", value: "16 IP" },
      { label: "Max resolution", value: "8 MP (4K)" },
      { label: "PoE ports", value: "16" },
      { label: "Storage", value: "2 × SATA, up to 10 TB each" },
      { label: "Video output", value: "HDMI 4K, VGA" },
    ],
  },
  {
    slug: "cctv-kit-8-camera",
    name: "8-Camera CCTV Kit (DVR + Cameras)",
    category: "cctv",
    summary: "Complete starter surveillance package for homes and small businesses.",
    description:
      "Everything needed for a full surveillance setup: an 8-channel DVR, eight HD cameras and the essentials for installation.",
    highlights: ["Complete package, ready to install", "Smartphone remote viewing", "Installation available"],
    specs: [
      { label: "Recorder", value: "8-channel DVR" },
      { label: "Cameras", value: "8 × 2 MP HD (indoor/outdoor)" },
      { label: "Night vision", value: "IR up to 20 m" },
      { label: "Storage", value: "1 × SATA HDD bay" },
      { label: "Remote access", value: "Mobile app, web" },
    ],
    featured: true,
  },

  // ---- Cables & Accessories ----
  {
    slug: "speaker-cable-2x2-5",
    name: "Speaker Cable 2 × 2.5 mm²",
    category: "cables-accessories",
    summary: "Heavy-gauge oxygen-free copper speaker cable for long runs.",
    description:
      "Flexible, oxygen-free copper speaker cable for permanent installs and touring rigs. Available by the roll or cut to length.",
    highlights: ["Oxygen-free copper", "Flexible PVC jacket", "By the roll or cut to length"],
    specs: [
      { label: "Conductors", value: "2 × 2.5 mm²" },
      { label: "Material", value: "OFC copper" },
      { label: "Jacket", value: "PVC, black" },
      { label: "Roll length", value: "100 m" },
    ],
  },
  {
    slug: "xlr-microphone-cable",
    name: "XLR Microphone Cable",
    category: "cables-accessories",
    summary: "Low-noise balanced mic cable with metal connectors.",
    description: "A shielded, balanced XLR cable with durable metal connectors for microphones and line-level gear.",
    highlights: ["Braided shield", "Metal XLR connectors", "Several lengths available"],
    specs: [
      { label: "Connectors", value: "XLR female to XLR male" },
      { label: "Shielding", value: "Braided copper" },
      { label: "Lengths", value: "3 m, 6 m, 10 m, 20 m" },
    ],
  },
  {
    slug: "speaker-stand-pair",
    name: "Heavy-Duty Speaker Stand (Pair)",
    category: "cables-accessories",
    summary: "Steel tripod stands for PA speakers.",
    description:
      "Height-adjustable steel tripod stands with a safety pin and a standard 35 mm mount for most PA speakers.",
    highlights: ["35 mm standard mount", "Safety locking pin", "Sold as a pair"],
    specs: [
      { label: "Height", value: "1.2 m – 2.0 m" },
      { label: "Load capacity", value: "50 kg each" },
      { label: "Mount", value: "35 mm pole" },
      { label: "Material", value: "Steel" },
    ],
  },
  {
    slug: "equipment-rack-cabinet",
    name: "19\" Equipment Rack Cabinet",
    category: "cables-accessories",
    summary: "Lockable cabinet for amplifiers, recorders and network gear.",
    description:
      "A ventilated, lockable 19-inch rack cabinet for audio and CCTV equipment, with removable side panels and cable entry points.",
    highlights: ["Lockable glass front door", "Fan and vented top", "Removable side panels"],
    specs: [
      { label: "Size", value: "12U / 18U / 27U" },
      { label: "Width", value: "600 mm" },
      { label: "Depth", value: "600 mm" },
      { label: "Ventilation", value: "Top fans" },
    ],
  },
];
