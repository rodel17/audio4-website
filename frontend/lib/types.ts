// Shapes returned by the FastAPI backend (camelCase JSON). Keep in sync with backend/app/schemas.py
// and backend/app/content.py.

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  visible: boolean;
  sortOrder: number;
  productCount: number;
};

export type Spec = {
  label: string;
  value: string;
};

// Intentionally has no price field: pricing is only given through the sales team.
export type Product = {
  id: number;
  slug: string;
  name: string;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  summary: string;
  description: string;
  highlights: string[];
  specs: Spec[];
  images: string[];
  featured: boolean;
  published: boolean;
  seoTitle: string;
  updatedAt: string;
};

export type ProductDetail = Product & { related: Product[] };

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export type Service = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  includes: string[];
  icon: string;
  sortOrder: number;
  showOnHome: boolean;
  offerInForm: boolean;
};

export type InquiryStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export type Inquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  quantity: string;
  preferredContact: "phone" | "email" | "either";
  message: string;
  productSlug: string;
  serviceSlug: string;
  status: InquiryStatus;
  assignee: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  events: { text: string; createdAt: string }[];
};

// ---------- editable content ----------

export type Heading = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
};

export type Step = { title: string; text: string };

export type LinkTarget = "products" | "services" | "contact";

export type SiteSettings = {
  companyName: string;
  shortName: string;
  tagline: string;
  logoUrl: string;
  brandColor: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  mapUrl: string;
  facebookUrl: string;
  messengerUrl: string;
  viber: string;
  nav: { label: string; href: string }[];
  headerButtonLabel: string;
  topBarShowHours: boolean;
  topBarShowPhone: boolean;
  topBarShowEmail: boolean;
  footerAbout: string;
  footerCopyright: string;
  footerPricingNote: string;
  seoTitle: string;
  seoDescription: string;
  shareImageUrl: string;
};

export type Notifications = {
  recipients: string[];
  sendConfirmation: boolean;
  confirmationMessage: string;
};

export type HomeSectionKey = "hero" | "howToBuy" | "categories" | "featured" | "services" | "whyUs" | "cta";

export type HomePage = {
  sections: { key: HomeSectionKey; visible: boolean }[];
  hero: {
    eyebrow: string;
    line1: string;
    line2: string;
    line3: string;
    tagline: string;
    primary: { label: string; target: LinkTarget };
    secondary: { label: string; target: LinkTarget };
    showCategoryTiles: boolean;
  };
  howToBuy: { title: string; subtitle: string; steps: Step[] };
  categories: Heading;
  featured: Heading & { count: number; buttonLabel: string };
  services: Heading & { buttonLabel: string };
  whyUs: Heading & { reasons: { icon: string; title: string; text: string }[] };
  cta: { title: string; text: string; buttonLabel: string; showPhone: boolean };
};

export type ProductsPageContent = Heading & {
  searchPlaceholder: string;
  cardQuoteLabel: string;
  cardInquireLabel: string;
  emptyTitle: string;
  emptyText: string;
  emptyButtonLabel: string;
};

export type ProductDetailContent = {
  pricingTitle: string;
  pricingText: string;
  inquireLabel: string;
  callLabel: string;
  overviewTitle: string;
  specsTitle: string;
  specsNote: string;
  relatedTitle: string;
};

export type ServicesPageContent = Heading & {
  requestLabel: string;
  process: Heading;
  steps: Step[];
};

export type ContactPageContent = Heading & {
  sideTitle: string;
  nextStepsTitle: string;
  nextSteps: string[];
  messagePlaceholder: string;
  submitLabel: string;
  privacyNote: string;
  successTitle: string;
  successText: string;
};

export type ContentMap = {
  site: SiteSettings;
  notifications: Notifications;
  home: HomePage;
  products: ProductsPageContent;
  "product-detail": ProductDetailContent;
  services: ServicesPageContent;
  contact: ContactPageContent;
};

export type PublicContentKey = Exclude<keyof ContentMap, "notifications">;
