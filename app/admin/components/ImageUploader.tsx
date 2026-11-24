"use client";

import React, { useState, useRef } from "react";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  onError?: (error: string) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
  className?: string;
}

export default function ImageUploader({
  onUploadSuccess,
  onError,
  label = "Upload New Image",
  hint = "Drag & drop or browse image (WebP, AVIF, PNG, JPG)",
  compact = false,
  className = "",
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file) return;

    // Check if image
    if (!file.type.startsWith("image/")) {
      const err = "Please upload an image file (PNG, JPG, WebP, AVIF, SVG)";
      if (onError) onError(err);
      return;
    }

    setUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      if (data.url) {
        onUploadSuccess(data.url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      if (onError) onError(msg);
      setUploadedFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input value so same file can be re-uploaded if needed
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  if (compact) {
    return (
      <label
        className={`admin-uploader-compact ${uploading ? "is-uploading" : ""} ${className}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <span className="admin-uploader-spinner" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{label}</span>
          </>
        )}
      </label>
    );
  }

  return (
    <div
      className={`admin-uploader-box ${isDragging ? "is-dragging" : ""} ${
        uploading ? "is-uploading" : ""
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !uploading && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={uploading}
      />

      <div className="admin-uploader-box__inner">
        {uploading ? (
          <div className="admin-uploader-box__status">
            <div className="admin-uploader-spinner-large" />
            <div className="admin-uploader-box__title">Uploading Asset...</div>
            <div className="admin-uploader-box__hint">
              {uploadedFileName || "Processing image upload"}
            </div>
          </div>
        ) : (
          <>
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
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>

            <div className="admin-uploader-box__title">{label}</div>
            <div className="admin-uploader-box__hint">{hint}</div>

            <button
              type="button"
              className="admin-uploader-box__browse-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </button>
          </>
        )}
      </div>
    </div>
  );
}
