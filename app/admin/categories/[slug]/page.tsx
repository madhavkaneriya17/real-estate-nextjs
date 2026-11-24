"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import type { CategoryData, GallerySlideItem, WhyInvestItemData } from "@/lib/content-manager";
import ImageUploader from "../../components/ImageUploader";

export default function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "gallery" | "quote" | "whyInvest" | "cta">("hero");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch(`/api/categories?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.category) setCategory(data.category);
      })
      .catch((err) => console.error("Error loading category:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Hero Handlers
  const handleHeroChange = (field: string, value: string) => {
    if (!category) return;
    setCategory({
      ...category,
      hero: {
        ...category.hero,
        [field]: value,
      },
    });
  };

  const handleHeroMarqueeChange = (idx: number, value: string) => {
    if (!category) return;
    const newMarquee = [...(category.hero.marquee || [])];
    newMarquee[idx] = value;
    setCategory({
      ...category,
      hero: {
        ...category.hero,
        marquee: newMarquee,
      },
    });
  };

  const addHeroMarqueeItem = () => {
    if (!category) return;
    setCategory({
      ...category,
      hero: {
        ...category.hero,
        marquee: [...(category.hero.marquee || []), category.name],
      },
    });
  };

  const removeHeroMarqueeItem = (idx: number) => {
    if (!category) return;
    setCategory({
      ...category,
      hero: {
        ...category.hero,
        marquee: (category.hero.marquee || []).filter((_, i) => i !== idx),
      },
    });
  };

  // 2. Gallery Handlers
  const handleGalleryFieldChange = (field: "title" | "description" | "label", value: string) => {
    if (!category) return;
    setCategory({
      ...category,
      gallery: {
        ...category.gallery,
        [field]: value,
      },
    });
  };

  const handleAddSlide = () => {
    if (!category) return;
    const newSlide: GallerySlideItem = {
      src: "/assets/BTS-1.avif",
      alt: "New luxury gallery photograph",
    };
    setCategory({
      ...category,
      gallery: {
        ...category.gallery,
        slides: [...(category.gallery?.slides || []), newSlide],
      },
    });
  };

  const handleRemoveSlide = (idx: number) => {
    if (!category) return;
    const newSlides = category.gallery.slides.filter((_, i) => i !== idx);
    setCategory({
      ...category,
      gallery: {
        ...category.gallery,
        slides: newSlides,
      },
    });
  };

  const handleSlideChange = (idx: number, field: keyof GallerySlideItem, value: string) => {
    if (!category) return;
    const newSlides = [...category.gallery.slides];
    newSlides[idx] = { ...newSlides[idx], [field]: value };
    setCategory({
      ...category,
      gallery: {
        ...category.gallery,
        slides: newSlides,
      },
    });
  };

  // 3. Middle Marquee & Quote Handlers
  const handleSecondMarqueeChange = (idx: number, value: string) => {
    if (!category) return;
    const list = [...(category.secondMarquee || category.hero.marquee || [])];
    list[idx] = value;
    setCategory({ ...category, secondMarquee: list });
  };

  const addSecondMarqueeItem = () => {
    if (!category) return;
    const list = [...(category.secondMarquee || category.hero.marquee || [])];
    list.push(category.name);
    setCategory({ ...category, secondMarquee: list });
  };

  const removeSecondMarqueeItem = (idx: number) => {
    if (!category) return;
    const list = (category.secondMarquee || category.hero.marquee || []).filter((_, i) => i !== idx);
    setCategory({ ...category, secondMarquee: list });
  };

  const handleQuoteChange = (field: string, value: string) => {
    if (!category) return;
    setCategory({
      ...category,
      whyInvestQuote: {
        ...category.whyInvestQuote,
        [field]: value,
      },
    });
  };

  // 4. Why Invest Handlers
  const handleWhyInvestItemChange = (idx: number, field: keyof WhyInvestItemData, value: string | boolean) => {
    if (!category) return;
    const newItems = [...category.whyInvestItems];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setCategory({ ...category, whyInvestItems: newItems });
  };

  const handleAddWhyInvestItem = () => {
    if (!category) return;
    const newItem: WhyInvestItemData = {
      title: "New Investment Advantage",
      text: "Description of capital appreciation, luxury lifestyle, or rental yields.",
      imageSrc: "/assets/women-montenegro.avif",
      imageAlt: "Investment advantage",
      reverse: false,
    };
    setCategory({
      ...category,
      whyInvestItems: [...category.whyInvestItems, newItem],
    });
  };

  const handleRemoveWhyInvestItem = (idx: number) => {
    if (!category) return;
    const newItems = category.whyInvestItems.filter((_, i) => i !== idx);
    setCategory({ ...category, whyInvestItems: newItems });
  };

  // 5. CTA Handlers
  const handleCtaChange = (field: string, value: string) => {
    if (!category) return;
    setCategory({
      ...category,
      cta: {
        titleLine1: category.cta?.titleLine1 || "Secure Your Place",
        titleLine2: category.cta?.titleLine2 || category.name,
        buttonText: category.cta?.buttonText || "Speak With Us",
        buttonLink: category.cta?.buttonLink || "/contact",
        ...category.cta,
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!category) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, category }),
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        // Non-JSON response
      }

      if (!res.ok) {
        throw new Error(data?.error || `Save failed (${res.status}): ${rawText.slice(0, 100)}`);
      }

      showToast(`Saved! Changes for ${category.name} are live on your site!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !category) {
    return (
      <div style={{ color: "var(--adm-text-muted)", padding: "40px 0", textAlign: "center" }}>
        Loading category editor...
      </div>
    );
  }

  const secondMarqueeList = category.secondMarquee || category.hero.marquee || [];

  return (
    <div style={{ paddingBottom: "60px" }}>
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <Link href="/admin/categories" style={{ color: "var(--adm-accent)", textDecoration: "none", fontSize: "13px" }}>
              ← All Categories
            </Link>
            <span style={{ color: "var(--adm-text-dim)" }}>/</span>
            <span style={{ fontSize: "13px", color: "var(--adm-text-muted)" }}>{slug}</span>
          </div>
          <h2 style={{ fontSize: "24px", margin: 0, color: "#ffffff", fontWeight: 600 }}>
            {category.name} — Page Editor
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--adm-text-muted)" }}>
            Easily update photos, text, prices, and banners. Click Save when done.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href={`/${slug}`} target="_blank" className="admin-btn admin-btn-secondary">
            View Live Page ↗
          </Link>
          <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary" style={{ padding: "10px 24px", fontWeight: 600 }}>
            <span>💾</span>
            <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "28px",
          borderBottom: "1px solid var(--adm-card-border)",
          paddingBottom: "14px",
          overflowX: "auto",
        }}
      >
        <button
          onClick={() => setActiveTab("hero")}
          className={`admin-btn ${activeTab === "hero" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          style={{ padding: "9px 18px", fontSize: "13.5px" }}
        >
          🚀 1. Hero & Top Banner
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`admin-btn ${activeTab === "gallery" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          style={{ padding: "9px 18px", fontSize: "13.5px" }}
        >
          📸 2. Photo Slider ({category.gallery?.slides?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("quote")}
          className={`admin-btn ${activeTab === "quote" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          style={{ padding: "9px 18px", fontSize: "13.5px" }}
        >
          💬 3. Middle Marquee & Quote
        </button>
        <button
          onClick={() => setActiveTab("whyInvest")}
          className={`admin-btn ${activeTab === "whyInvest" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          style={{ padding: "9px 18px", fontSize: "13.5px" }}
        >
          💎 4. Why Invest ({category.whyInvestItems?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("cta")}
          className={`admin-btn ${activeTab === "cta" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          style={{ padding: "9px 18px", fontSize: "13.5px" }}
        >
          🎯 5. Bottom Call To Action
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: HERO & TOP BANNER */}
      {/* ======================================================== */}
      {activeTab === "hero" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Running Marquee Banner */}
          <div className="admin-card">
            <div className="admin-card__header">
              <div>
                <h3 className="admin-card__title">Top Running Banner (Marquee)</h3>
                <p className="admin-card__desc">
                  Words that continuously scroll horizontally across the very top background of the screen.
                </p>
              </div>
              <button onClick={addHeroMarqueeItem} className="admin-btn admin-btn-secondary" style={{ fontSize: "12.5px" }}>
                + Add Phrase
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(category.hero.marquee || []).map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ color: "var(--adm-text-dim)", fontSize: "12px", width: "24px" }}>#{idx + 1}</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={item}
                    onChange={(e) => handleHeroMarqueeChange(idx, e.target.value)}
                    placeholder="e.g. Waterfront Residences"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeroMarqueeItem(idx)}
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    title="Remove phrase"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Headlines & Visual */}
          <div className="admin-grid-2">
            <div className="admin-card">
              <h3 className="admin-card__title">Headline & Starting Price</h3>
              <p className="admin-card__desc">Main title and price badge displayed prominently in the center.</p>

              <div className="admin-form-group">
                <label className="admin-label">Category Title Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={category.name}
                  onChange={(e) => setCategory({ ...category, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Main Tagline Headline</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  value={category.hero.tagline}
                  onChange={(e) => handleHeroChange("tagline", e.target.value)}
                  placeholder="Enter main tagline..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Starting Price Badge (e.g. STARTING FROM 280,000€)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={category.hero.priceBadge}
                  onChange={(e) => handleHeroChange("priceBadge", e.target.value)}
                  placeholder="STARTING FROM 280,000€"
                />
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card__title">Center Hero Photo</h3>
              <p className="admin-card__desc">Featured square photograph shown in the hero stage.</p>

              <div
                style={{
                  width: "100%",
                  height: "220px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid var(--adm-card-border)",
                  marginBottom: "16px",
                  background: "#0d1117",
                }}
              >
                <img
                  src={category.hero.visual}
                  alt={category.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <ImageUploader
                label="Upload New Hero Photo"
                hint="Auto-updates the center photograph"
                onUploadSuccess={(url) => {
                  handleHeroChange("visual", url);
                  showToast("Hero photo updated!");
                }}
                onError={(err) => showToast(err, "error")}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PHOTO GALLERY SLIDER */}
      {/* ======================================================== */}
      {activeTab === "gallery" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Gallery Headlines */}
          <div className="admin-card">
            <h3 className="admin-card__title">Gallery Header & Description</h3>
            <p className="admin-card__desc">Headline and intro text shown right above the carousel slider.</p>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">Section Tag / Label</label>
                <input
                  type="text"
                  className="admin-input"
                  value={category.gallery?.label || category.name}
                  onChange={(e) => handleGalleryFieldChange("label", e.target.value)}
                  placeholder="e.g. Coastal Haven"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Slider Main Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={category.gallery?.title || ""}
                  onChange={(e) => handleGalleryFieldChange("title", e.target.value)}
                  placeholder="e.g. Invest Where Tourism, Lifestyle & Growth Meet"
                />
              </div>
            </div>

            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">Description Paragraph</label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={category.gallery?.description || ""}
                onChange={(e) => handleGalleryFieldChange("description", e.target.value)}
                placeholder="Description of the lifestyle and investment appeal..."
              />
            </div>
          </div>

          {/* Photo Slides */}
          <div className="admin-card">
            <div className="admin-card__header">
              <div>
                <h3 className="admin-card__title">Carousel Photographs ({category.gallery?.slides?.length || 0})</h3>
                <p className="admin-card__desc">The photos visitors can drag and slide through horizontally.</p>
              </div>
              <button onClick={handleAddSlide} className="admin-btn admin-btn-primary" style={{ fontSize: "12.5px" }}>
                + Add Slide Photo
              </button>
            </div>

            <div className="admin-grid-3">
              {category.gallery?.slides?.map((slide, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--adm-input-bg)",
                    border: "1px solid var(--adm-card-border)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "140px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      marginBottom: "10px",
                      background: "#000",
                    }}
                  >
                    <img
                      src={slide.src}
                      alt={slide.alt || `Slide ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <ImageUploader
                      label={`Change Photo #${idx + 1}`}
                      compact={true}
                      onUploadSuccess={(url) => {
                        handleSlideChange(idx, "src", url);
                        showToast(`Slide #${idx + 1} photo updated!`);
                      }}
                      onError={(err) => showToast(err, "error")}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ fontSize: "12px", padding: "6px 8px" }}
                      value={slide.alt || ""}
                      onChange={(e) => handleSlideChange(idx, "alt", e.target.value)}
                      placeholder="Photo description / alt"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(idx)}
                      className="admin-btn admin-btn-danger"
                      style={{ padding: "6px 10px", fontSize: "11px" }}
                      title="Delete slide"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MIDDLE MARQUEE & QUOTE */}
      {/* ======================================================== */}
      {activeTab === "quote" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Middle Running Marquee ("marq") */}
          <div className="admin-card">
            <div className="admin-card__header">
              <div>
                <h3 className="admin-card__title">Middle Running Banner ("marq")</h3>
                <p className="admin-card__desc">
                  Horizontal animated marquee shown directly underneath the slider gallery.
                </p>
              </div>
              <button onClick={addSecondMarqueeItem} className="admin-btn admin-btn-secondary" style={{ fontSize: "12.5px" }}>
                + Add Phrase
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {secondMarqueeList.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ color: "var(--adm-text-dim)", fontSize: "12px", width: "24px" }}>#{idx + 1}</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={item}
                    onChange={(e) => handleSecondMarqueeChange(idx, e.target.value)}
                    placeholder="e.g. Waterfront Prestige"
                  />
                  <button
                    type="button"
                    onClick={() => removeSecondMarqueeItem(idx)}
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    title="Remove phrase"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Quote Block & Highlight Image */}
          <div className="admin-grid-2">
            <div className="admin-card">
              <h3 className="admin-card__title">Featured Quote / Statement</h3>
              <p className="admin-card__desc">The large bold quotation underneath the middle marquee.</p>

              <div className="admin-form-group">
                <label className="admin-label">Quote Message (in quotation marks)</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  value={category.whyInvestQuote?.text || ""}
                  onChange={(e) => handleQuoteChange("text", e.target.value)}
                  placeholder="Enter quote text..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Author / Organization Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={category.whyInvestQuote?.name || ""}
                  onChange={(e) => handleQuoteChange("name", e.target.value)}
                  placeholder="e.g. Knight Frank / Savills Global Research"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Source / Report Edition</label>
                <input
                  type="text"
                  className="admin-input"
                  value={category.whyInvestQuote?.source || ""}
                  onChange={(e) => handleQuoteChange("source", e.target.value)}
                  placeholder="e.g. / World Waterfront Index / 2025 Edition"
                />
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card__title">Quote Feature Photograph</h3>
              <p className="admin-card__desc">The square photograph displayed above the quote.</p>

              <div
                style={{
                  width: "100%",
                  height: "200px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid var(--adm-card-border)",
                  marginBottom: "16px",
                  background: "#0d1117",
                }}
              >
                <img
                  src={category.whyInvestQuote?.image || "/assets/BTS-1.avif"}
                  alt={category.whyInvestQuote?.name || "Quote feature"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <ImageUploader
                label="Change Quote Feature Photo"
                hint="Updates the square photo in this section"
                onUploadSuccess={(url) => {
                  handleQuoteChange("image", url);
                  showToast("Quote photo updated!");
                }}
                onError={(err) => showToast(err, "error")}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: WHY INVEST ADVANTAGES */}
      {/* ======================================================== */}
      {activeTab === "whyInvest" && (
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <h3 className="admin-card__title">Investment Advantages ({category.whyInvestItems?.length || 0})</h3>
              <p className="admin-card__desc">
                The structured cards detailing key investment drivers (scarcity, yield, liquidity).
              </p>
            </div>
            <button onClick={handleAddWhyInvestItem} className="admin-btn admin-btn-primary" style={{ fontSize: "12.5px" }}>
              + Add Advantage Card
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {category.whyInvestItems?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--adm-input-bg)",
                  border: "1px solid var(--adm-card-border)",
                  borderRadius: "8px",
                  padding: "18px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", color: "var(--adm-accent)", fontWeight: 600 }}>
                    Advantage Point #{idx + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveWhyInvestItem(idx)}
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "4px 10px", fontSize: "11px" }}
                  >
                    Delete Point
                  </button>
                </div>

                <div className="admin-grid-2">
                  <div>
                    <div className="admin-form-group">
                      <label className="admin-label">Advantage Headline</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={item.title}
                        onChange={(e) => handleWhyInvestItemChange(idx, "title", e.target.value)}
                        placeholder="e.g. Frontline Scarcity"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Explanation Paragraph</label>
                      <textarea
                        className="admin-textarea"
                        rows={4}
                        value={item.text}
                        onChange={(e) => handleWhyInvestItemChange(idx, "text", e.target.value)}
                        placeholder="Detailed explanation of the investment appeal..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Advantage Photo</label>
                    <div
                      style={{
                        width: "100%",
                        height: "140px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        marginBottom: "10px",
                        background: "#000",
                      }}
                    >
                      <img
                        src={item.imageSrc}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <ImageUploader
                      label={`Change Photo for Point #${idx + 1}`}
                      compact={true}
                      onUploadSuccess={(url) => {
                        handleWhyInvestItemChange(idx, "imageSrc", url);
                        showToast(`Point #${idx + 1} photo updated!`);
                      }}
                      onError={(err) => showToast(err, "error")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: BOTTOM CALL TO ACTION */}
      {/* ======================================================== */}
      {activeTab === "cta" && (
        <div className="admin-card" style={{ maxWidth: "750px" }}>
          <h3 className="admin-card__title">Bottom Call To Action (CTA)</h3>
          <p className="admin-card__desc">
            The grand invitation block at the bottom of the page encouraging visitors to speak with your team.
          </p>

          <div className="admin-form-group">
            <label className="admin-label">Headline Line 1</label>
            <input
              type="text"
              className="admin-input"
              value={category.cta?.titleLine1 || "Secure Your Waterfront"}
              onChange={(e) => handleCtaChange("titleLine1", e.target.value)}
              placeholder="e.g. Claim Your Sanctuary"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Headline Line 2</label>
            <input
              type="text"
              className="admin-input"
              value={category.cta?.titleLine2 || category.name}
              onChange={(e) => handleCtaChange("titleLine2", e.target.value)}
              placeholder="e.g. In Coastal Haven"
            />
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">Button Action Text</label>
              <input
                type="text"
                className="admin-input"
                value={category.cta?.buttonText || "Speak With Us"}
                onChange={(e) => handleCtaChange("buttonText", e.target.value)}
                placeholder="Speak With Us"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Button Destination URL</label>
              <input
                type="text"
                className="admin-input"
                value={category.cta?.buttonLink || "/contact"}
                onChange={(e) => handleCtaChange("buttonLink", e.target.value)}
                placeholder="/contact"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
