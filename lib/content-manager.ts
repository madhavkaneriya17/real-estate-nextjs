import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SITE_CONTENT_PATH = path.join(DATA_DIR, "site-content.json");
const CATEGORIES_PATH = path.join(DATA_DIR, "categories.json");

export interface GeneralContact {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
}

export interface GeneralSettings {
  siteName: string;
  copyright: string;
  logoUrl: string;
  whiteLogoUrl: string;
  contact: GeneralContact;
}

export interface HeroContent {
  marqueeItems: string[];
  tagline: string;
  priceBadge: string;
  heroImage: string;
  heroImageAlt: string;
}

export interface SelectionCard {
  id: string;
  path: string;
  title: string;
  desc: string;
  symbol: string;
  cover: string;
}

export interface SiteContent {
  general: GeneralSettings;
  hero: HeroContent;
  selectionCards: SelectionCard[];
}

export interface GallerySlideItem {
  src: string;
  alt?: string;
}

export interface WhyInvestItemData {
  imageSrc: string;
  imageAlt: string;
  title: string;
  text: string;
  reverse?: boolean;
}

export interface WhyInvestQuoteData {
  text: string;
  name: string;
  source: string;
  image?: string;
  imageAlt?: string;
}

export interface CategoryData {
  slug: string;
  name: string;
  theme: {
    bg: string;
    text: string;
  };
  hero: {
    marquee: string[];
    visual: string;
    visualAlt?: string;
    tagline: string;
    priceBadge: string;
  };
  gallery: {
    label: string;
    title: string;
    description: string;
    slides: GallerySlideItem[];
  };
  secondMarquee?: string[];
  whyInvestQuote: WhyInvestQuoteData;
  whyInvestItems: WhyInvestItemData[];
  cta?: {
    titleLine1: string;
    titleLine2: string;
    buttonText?: string;
    buttonLink?: string;
    subtitle?: string;
  };
}

export type CategoriesMap = Record<string, CategoryData>;

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(SITE_CONTENT_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading site-content.json, returning empty structure:", err);
    throw err;
  }
}

export async function saveSiteContent(data: SiteContent): Promise<void> {
  await fs.writeFile(SITE_CONTENT_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getCategories(): Promise<CategoriesMap> {
  try {
    const raw = await fs.readFile(CATEGORIES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading categories.json:", err);
    throw err;
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  const all = await getCategories();
  return all[slug] || null;
}

export async function saveCategory(slug: string, data: Partial<CategoryData>): Promise<CategoryData> {
  const all = await getCategories();
  const existing = all[slug] || { slug, name: slug };
  const updated = { ...existing, ...data, slug };
  all[slug] = updated as CategoryData;
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(all, null, 2), "utf-8");
  return updated as CategoryData;
}

export async function saveAllCategories(categories: CategoriesMap): Promise<void> {
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(categories, null, 2), "utf-8");
}
