"use client";

import { useState, useEffect } from "react";
import defaultSiteContent from "@/data/site-content.json";
import defaultCategories from "@/data/categories.json";
import type { SiteContent, CategoriesMap, CategoryData } from "./content-manager";

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent as SiteContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/content", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.siteContent) {
          setContent(data.siteContent);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch latest site content, using local defaults:", err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { content, isLoading };
}

export function useCategoryContent(slug: string) {
  const initialCategory = (defaultCategories as CategoriesMap)[slug] || null;
  const [category, setCategory] = useState<CategoryData | null>(initialCategory);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/categories?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.category) {
          setCategory(data.category);
        }
      })
      .catch((err) => {
        console.warn(`Could not fetch category ${slug}, using local defaults:`, err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { category, isLoading };
}
