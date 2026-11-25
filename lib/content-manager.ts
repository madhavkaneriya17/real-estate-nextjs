import path from "path";
import { getJSONFromStorage, saveJSONToStorage } from "./storage-adapter";
import defaultSiteContent from "@/data/site-content.json";
import defaultCategories from "@/data/categories.json";

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
  return getJSONFromStorage<SiteContent>(
    "site-content",
    SITE_CONTENT_PATH,
    defaultSiteContent as SiteContent
  );
}

export async function saveSiteContent(data: SiteContent): Promise<void> {
  await saveJSONToStorage<SiteContent>("site-content", SITE_CONTENT_PATH, data);
}

export async function getCategories(): Promise<CategoriesMap> {
  const defaults = defaultCategories as unknown as CategoriesMap;
  const stored = await getJSONFromStorage<CategoriesMap>(
    "categories",
    CATEGORIES_PATH,
    defaults
  );

  let needsResave = false;
  const merged: CategoriesMap = { ...defaults, ...stored };

  for (const slug of Object.keys(defaults)) {
    if (!merged[slug]) {
      merged[slug] = defaults[slug];
      needsResave = true;
    } else {
      const defaultWhy = defaults[slug]?.whyInvestItems || [];
      const storedWhy = merged[slug]?.whyInvestItems || [];
      // If code was updated with more items than stale storage (e.g. 5 cards vs stale 1 card in Netlify Blobs)
      if (defaultWhy.length > storedWhy.length) {
        merged[slug] = {
          ...merged[slug],
          whyInvestItems: defaultWhy,
        };
        needsResave = true;
      }
    }
  }

  // Heal Netlify Blobs/tmp storage with full items in background
  if (needsResave) {
    saveAllCategories(merged).catch(() => {});
  }

  return merged;
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
  await saveAllCategories(all);
  return updated as CategoryData;
}

export async function saveAllCategories(categories: CategoriesMap): Promise<void> {
  await saveJSONToStorage<CategoriesMap>("categories", CATEGORIES_PATH, categories);
}
