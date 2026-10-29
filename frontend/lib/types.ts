export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type Spec = {
  label: string;
  value: string;
};

// Intentionally has no price field: pricing is only given through the sales team.
export type Product = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  highlights: string[];
  specs: Spec[];
  featured?: boolean;
  image?: string;
};

export type Service = {
  slug: string;
  name: string;
  summary: string;
  includes: string[];
};
