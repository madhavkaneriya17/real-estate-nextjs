"use client";

import React, { useEffect, useState } from "react";

interface UploadedFile {
  name: string;
  url: string;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadMedia = () => {
    fetch("/api/admin/upload")
      .then((res) => res.json())
      .then((data) => {
        if (data.files) setFiles(data.files);
      })
      .catch((err) => console.error("Error loading media:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append("file", file);
      try {
        await fetch("/api/admin/upload", { method: "POST", body: formData });
      } catch (err) {
        console.error("Upload error", err);
      }
    }
    setUploading(false);
    loadMedia();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 style={{ fontSize: "20px", margin: "0 0 6px", color: "#ffffff" }}>Media Library</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--adm-text-muted)" }}>
            Upload property photographs, hero images, and floor plans. Click &quot;Copy Path&quot; to use them anywhere on the website.
          </p>
        </div>

        <label className="admin-btn admin-btn-primary" style={{ cursor: "pointer" }}>
          <span>{uploading ? "Uploading..." : "+ Upload New Files"}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Upload Drop Zone card */}
      <div
        className="admin-uploader-box"
        style={{ marginBottom: "28px" }}
        onClick={() => {
          const input = document.getElementById("media-file-input") as HTMLInputElement;
          input?.click();
        }}
      >
        <input
          id="media-file-input"
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleUpload}
          disabled={uploading}
        />
        <div className="admin-uploader-box__inner">
          <div className="admin-uploader-box__icon-wrap">
            <svg
              className="admin-uploader-box__icon"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div className="admin-uploader-box__badge-plus">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>
          <div className="admin-uploader-box__title">
            {uploading ? "Uploading Assets..." : "Upload Media Assets"}
          </div>
          <div className="admin-uploader-box__hint">
            Supports JPG, PNG, WebP, AVIF, and SVG. Saved directly in /public/uploads/
          </div>
          <button
            type="button"
            className="admin-uploader-box__browse-btn"
            onClick={(e) => {
              e.stopPropagation();
              const input = document.getElementById("media-file-input") as HTMLInputElement;
              input?.click();
            }}
          >
            Browse from Computer
          </button>
        </div>
      </div>

      {/* Grid of uploaded images */}
      <div className="admin-card">
        <h3 className="admin-card__title" style={{ marginBottom: "16px" }}>
          Uploaded Files ({files.length})
        </h3>

        {loading ? (
          <div style={{ color: "var(--adm-text-muted)" }}>Loading media files...</div>
        ) : files.length === 0 ? (
          <div style={{ color: "var(--adm-text-dim)", padding: "20px 0", textAlign: "center" }}>
            No uploads yet. Upload an image above to get started!
          </div>
        ) : (
          <div className="admin-grid-4">
            {files.map((file) => (
              <div
                key={file.name}
                style={{
                  background: "var(--adm-input-bg)",
                  border: "1px solid var(--adm-card-border)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "140px",
                    background: "#000",
                    position: "relative",
                  }}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <div style={{ padding: "12px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: "8px",
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </div>

                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="admin-btn admin-btn-secondary"
                    style={{ width: "100%", padding: "6px 10px", fontSize: "11px" }}
                  >
                    {copiedUrl === file.url ? "✓ Copied to Clipboard!" : "📋 Copy Path"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
