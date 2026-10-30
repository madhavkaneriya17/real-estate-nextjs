"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import "./NavigationMenu.css";

export interface NavigationMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
  showFloatingButton?: boolean;
  floatingButtonClassName?: string;
  theme?: "light" | "dark";
  panelBg?: string;
  textColor?: string;
  backdropBg?: string;
}

export default function NavigationMenu({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  showFloatingButton = true,
  floatingButtonClassName = "",
  theme = "light",
  panelBg = "#1F2B5E",
  textColor = "#FFFFFF",
  backdropBg,
}: NavigationMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isMenuOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleOpen = () => {
    if (controlledIsOpen !== undefined && controlledOnClose) {
      // Parent controls state
    } else {
      setInternalIsOpen(true);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // GSAP Opening Bloom Animation
  useEffect(() => {
    if (!isMenuOpen) return;

    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const btn = buttonRef.current || document.querySelector(".nav-floating-menu-btn, .about-menu-toggle-btn, .menu-toggle-btn");

    if (!panel || !overlay) return;

    gsap.killTweensOf([panel, overlay, ".nav-menu-link-item", ".nav-menu-bottom"]);

    // Calculate initial clip from button rect
    let initialClip = "inset(100% 0% 0% 100%)";
    if (btn) {
      const b = btn.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      const topDiff = Math.max(b.top - p.top, 0);
      const rightDiff = Math.max(p.right - b.right, 0);
      const bottomDiff = Math.max(p.bottom - b.bottom, 0);
      const leftDiff = Math.max(b.left - p.left, 0);
      initialClip = `inset(${topDiff}px ${rightDiff}px ${bottomDiff}px ${leftDiff}px)`;
    }

    // 1. Overlay fades in smoothly
    gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.65, ease: "power2.out", overwrite: "auto" }
    );

    // 2. Exact clip-path expand from trigger button to full rectangle
    gsap.fromTo(
      panel,
      {
        clipPath: initialClip,
        opacity: 1,
      },
      {
        clipPath: "inset(0px 0px 0px 0px)",
        duration: 0.7,
        ease: "cubic-bezier(0.4, 0.3, 0, 0.99)",
        overwrite: "auto",
      }
    );

    // 3. Links slide up on entrance (animating parent wrapper so hover transform on __inner works cleanly)
    gsap.fromTo(
      panel.querySelectorAll(".nav-menu-link-item"),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.55,
        ease: "power3.out",
        delay: 0.18,
        overwrite: "auto",
        clearProps: "transform",
      }
    );

    // 4. Contact items and close dash fade & rise
    gsap.fromTo(
      panel.querySelectorAll(".nav-menu-bottom"),
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.3,
        overwrite: "auto",
      }
    );
  }, [isMenuOpen]);

  return (
    <>
      {/* === Floating Toggle Button START === */}
      {showFloatingButton && (
        <button
          ref={buttonRef}
          type="button"
          className={`nav-floating-menu-btn ${theme === "dark" ? "dark-theme" : ""} ${floatingButtonClassName}`}
          onClick={handleOpen}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
        >
          <svg width="23" height="12" viewBox="0 0 23 12" fill="none" aria-hidden="true">
            <rect width="23" height="3" fill="currentColor" />
            <rect className="menu-btn-line-bottom" y="9" width="10" height="3" fill="currentColor" />
          </svg>
        </button>
      )}
      {/* === Floating Toggle Button END === */}

      {/* === Modal Drawer Overlay START === */}
      <div
        className={`nav-menu-wrapper ${isMenuOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        <div
          ref={overlayRef}
          className="nav-menu-backdrop"
          style={backdropBg ? { background: backdropBg } : undefined}
          onClick={handleClose}
        />

        <div
          ref={panelRef}
          className="nav-menu-panel"
          style={{
            backgroundColor: panelBg,
            color: textColor,
            ["--nav-menu-bg" as string]: panelBg,
            ["--nav-menu-color" as string]: textColor,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="nav-menu-links">
            <div className="nav-menu-link-item">
              <Link
                href="/"
                className="nav-menu-link"
                onClick={handleClose}
              >
                <span className="nav-menu-link__inner">
                  <span className="nav-menu-link__text">Home</span>
                  <span className="nav-menu-link__text" aria-hidden="true">Home</span>
                </span>
              </Link>
            </div>
            <div className="nav-menu-link-item">
              <Link
                href="/about"
                className="nav-menu-link"
                onClick={handleClose}
              >
                <span className="nav-menu-link__inner">
                  <span className="nav-menu-link__text">About</span>
                  <span className="nav-menu-link__text" aria-hidden="true">About</span>
                </span>
              </Link>
            </div>
            <div className="nav-menu-link-item">
              <Link
                href="/contact"
                className="nav-menu-link"
                onClick={handleClose}
              >
                <span className="nav-menu-link__inner">
                  <span className="nav-menu-link__text">Contact</span>
                  <span className="nav-menu-link__text" aria-hidden="true">Contact</span>
                </span>
              </Link>
            </div>
          </div>

          <div className="nav-menu-bottom">
            <div className="nav-menu-channels">
              <a
                href="https://wa.me/972546020690"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-menu-channel-link"
              >
                <span className="nav-menu-channel-icon-wrap" aria-hidden="true">
                  <span className="nav-menu-channel-icon-inner">
                    <span className="nav-menu-channel-icon-slot">
                      <svg className="nav-menu-contact-icon" width="20" height="19" viewBox="0 0 20 19" fill="none">
                        <path d="M16 0C17.0609 0 18.0783 0.421427 18.8284 1.17157C19.5786 1.92172 20 2.93913 20 4V12C20 13.0609 19.5786 14.0783 18.8284 14.8284C18.0783 15.5786 17.0609 16 16 16H11.276L6.514 18.857C6.37059 18.9431 6.20788 18.9918 6.04077 18.9987C5.87366 19.0056 5.70749 18.9705 5.55746 18.8966C5.40743 18.8227 5.27833 18.7123 5.18199 18.5756C5.08565 18.4389 5.02514 18.2802 5.006 18.114L5 18V16H4C2.97376 16 1.98677 15.6056 1.24319 14.8983C0.499605 14.191 0.0563122 13.225 0.00500011 12.2L0 12V4C0 2.93913 0.421427 1.92172 1.17157 1.17157C1.92172 0.421427 2.93913 0 4 0H16ZM12 9H6C5.73478 9 5.48043 9.10536 5.29289 9.29289C5.10536 9.48043 5 9.73478 5 10C5 10.2652 5.10536 10.5196 5.29289 10.7071C5.48043 10.8946 5.73478 11 6 11H12C12.2652 11 12.5196 10.8946 12.7071 10.7071C12.8946 10.5196 13 10.2652 13 10C13 9.73478 12.8946 9.48043 12.7071 9.29289C12.5196 9.10536 12.2652 9 12 9ZM14 5H6C5.73478 5 5.48043 5.10536 5.29289 5.29289C5.10536 5.48043 5 5.73478 5 6C5 6.26522 5.10536 6.51957 5.29289 6.70711C5.48043 6.89464 5.73478 7 6 7H14C14.2652 7 14.5196 6.89464 14.7071 6.70711C14.8946 6.51957 15 6.26522 15 6C15 5.73478 14.8946 5.48043 14.7071 5.29289C14.5196 5.10536 14.2652 5 14 5Z" fill="currentColor"/>
                      </svg>
                    </span>
                    <span className="nav-menu-channel-icon-slot" aria-hidden="true">
                      <svg className="nav-menu-contact-icon" width="20" height="19" viewBox="0 0 20 19" fill="none">
                        <path d="M16 0C17.0609 0 18.0783 0.421427 18.8284 1.17157C19.5786 1.92172 20 2.93913 20 4V12C20 13.0609 19.5786 14.0783 18.8284 14.8284C18.0783 15.5786 17.0609 16 16 16H11.276L6.514 18.857C6.37059 18.9431 6.20788 18.9918 6.04077 18.9987C5.87366 19.0056 5.70749 18.9705 5.55746 18.8966C5.40743 18.8227 5.27833 18.7123 5.18199 18.5756C5.08565 18.4389 5.02514 18.2802 5.006 18.114L5 18V16H4C2.97376 16 1.98677 15.6056 1.24319 14.8983C0.499605 14.191 0.0563122 13.225 0.00500011 12.2L0 12V4C0 2.93913 0.421427 1.92172 1.17157 1.17157C1.92172 0.421427 2.93913 0 4 0H16ZM12 9H6C5.73478 9 5.48043 9.10536 5.29289 9.29289C5.10536 9.48043 5 9.73478 5 10C5 10.2652 5.10536 10.5196 5.29289 10.7071C5.48043 10.8946 5.73478 11 6 11H12C12.2652 11 12.5196 10.8946 12.7071 10.7071C12.8946 10.5196 13 10.2652 13 10C13 9.73478 12.8946 9.48043 12.7071 9.29289C12.5196 9.10536 12.2652 9 12 9ZM14 5H6C5.73478 5 5.48043 5.10536 5.29289 5.29289C5.10536 5.48043 5 5.73478 5 6C5 6.26522 5.10536 6.51957 5.29289 6.70711C5.48043 6.89464 5.73478 7 6 7H14C14.2652 7 14.5196 6.89464 14.7071 6.70711C14.8946 6.51957 15 6.26522 15 6C15 5.73478 14.8946 5.48043 14.7071 5.29289C14.5196 5.10536 14.2652 5 14 5Z" fill="currentColor"/>
                      </svg>
                    </span>
                  </span>
                </span>
                <span>WhatsApp</span>
              </a>

              <a
                href="mailto:info@realevate.agency"
                className="nav-menu-channel-link"
              >
                <span className="nav-menu-channel-icon-wrap" aria-hidden="true">
                  <span className="nav-menu-channel-icon-inner">
                    <span className="nav-menu-channel-icon-slot">
                      <svg className="nav-menu-contact-icon" width="20" height="16" viewBox="0 0 20 16" fill="none">
                        <path d="M17.6014 4.2491C17.8494 4.09414 18 3.82238 18 3.53C18 2.86395 17.2674 2.45789 16.7026 2.8109L12.0582 5.71359C10.7989 6.50066 9.20105 6.50066 7.94175 5.71359L3.29744 2.8109C2.73263 2.45789 2 2.86395 2 3.53C2 3.82238 2.15062 4.09414 2.39856 4.2491L7.35001 7.34375C8.97136 8.3571 11.0286 8.3571 12.65 7.34375L17.6014 4.2491ZM18 0C18.5304 0 19.0391 0.210714 19.4142 0.585786C19.7893 0.960859 20 1.46957 20 2V14C20 14.5304 19.7893 15.0391 19.4142 15.4142C19.0391 15.7893 18.5304 16 18 16H2C1.46957 16 0.960859 15.7893 0.585786 15.4142C0.210714 15.0391 0 14.5304 0 14V2C0 0.89 0.89 0 2 0H18Z" fill="currentColor"/>
                      </svg>
                    </span>
                    <span className="nav-menu-channel-icon-slot" aria-hidden="true">
                      <svg className="nav-menu-contact-icon" width="20" height="16" viewBox="0 0 20 16" fill="none">
                        <path d="M17.6014 4.2491C17.8494 4.09414 18 3.82238 18 3.53C18 2.86395 17.2674 2.45789 16.7026 2.8109L12.0582 5.71359C10.7989 6.50066 9.20105 6.50066 7.94175 5.71359L3.29744 2.8109C2.73263 2.45789 2 2.86395 2 3.53C2 3.82238 2.15062 4.09414 2.39856 4.2491L7.35001 7.34375C8.97136 8.3571 11.0286 8.3571 12.65 7.34375L17.6014 4.2491ZM18 0C18.5304 0 19.0391 0.210714 19.4142 0.585786C19.7893 0.960859 20 1.46957 20 2V14C20 14.5304 19.7893 15.0391 19.4142 15.4142C19.0391 15.7893 18.5304 16 18 16H2C1.46957 16 0.960859 15.7893 0.585786 15.4142C0.210714 15.0391 0 14.5304 0 14V2C0 0.89 0.89 0 2 0H18Z" fill="currentColor"/>
                      </svg>
                    </span>
                  </span>
                </span>
                <span>Email</span>
              </a>
            </div>

            <button
              type="button"
              className="nav-menu-close-btn"
              onClick={handleClose}
              aria-label="Close menu"
            >
              <svg width="22" height="3" viewBox="0 0 22 3" fill="none" aria-hidden="true">
                <rect width="22" height="3" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* === Modal Drawer Overlay END === */}
    </>
  );
}
