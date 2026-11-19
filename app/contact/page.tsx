"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { COUNTRIES } from "./countries-data";
import "./contact.css";

export default function ContactPage() {
  // Tab State: "investors" | "developers"
  const [activeTab, setActiveTab] = useState<"investors" | "developers">("investors");

  // Copy Email State
  const [isCopied, setIsCopied] = useState(false);

  // Form Submitting & Success States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Investors Form State
  const [investorData, setInvestorData] = useState({
    fullname: "",
    email: "",
    phone: "",
    country: "",
    budget: "",
    investment_goal: "",
    destination: "",
    purchase_timeline: "",
    message: "",
    consent: false,
  });

  const [partnerData, setPartnerData] = useState({
    fullname: "",
    email: "",
    phone: "",
    country: "",
    company: "",
    partnership_interest: "",
    company_website: "",
    message: "",
    consent: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const channelsStackRef = useRef<HTMLDivElement>(null);
  const asideFormRef = useRef<HTMLDivElement>(null);

  // Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in site header
      gsap.fromTo(
        ".contact-site-nav",
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      // Stagger channels stack
      if (channelsStackRef.current) {
        gsap.fromTo(
          channelsStackRef.current.children,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.15,
          }
        );
      }

      // Stagger form elements
      if (asideFormRef.current) {
        gsap.fromTo(
          asideFormRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            delay: 0.25,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Copy Email Handler
  const handleCopyEmail = async (email: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1400);
    } catch {
      // Ignore copy error
    }
  };

  // Country Selection & Dial Code Auto-fill (Investors)
  const handleInvestorCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryName = e.target.value;
    const countryObj = COUNTRIES.find((c) => c.name === selectedCountryName);
    setInvestorData((prev) => {
      let updatedPhone = prev.phone;
      if (countryObj && countryObj.dialCode && !prev.phone.trim()) {
        updatedPhone = `${countryObj.dialCode} `;
      }
      return {
        ...prev,
        country: selectedCountryName,
        phone: updatedPhone,
      };
    });
  };

  // Country Selection & Dial Code Auto-fill (Partnership)
  const handlePartnerCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryName = e.target.value;
    const countryObj = COUNTRIES.find((c) => c.name === selectedCountryName);
    setPartnerData((prev) => {
      let updatedPhone = prev.phone;
      if (countryObj && countryObj.dialCode && !prev.phone.trim()) {
        updatedPhone = `${countryObj.dialCode} `;
      }
      return {
        ...prev,
        country: selectedCountryName,
        phone: updatedPhone,
      };
    });
  };

  // Submit Investors Form
  const handleInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (
      !investorData.fullname ||
      !investorData.email ||
      !investorData.phone ||
      !investorData.country ||
      !investorData.budget ||
      !investorData.consent
    ) {
      setSubmitError("Please fill in all required fields and accept the terms.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(
        "Thank you. Your investment inquiry has been received. Our advisory team will contact you shortly."
      );
    }, 700);
  };

  // Submit Partnership Form
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (
      !partnerData.fullname ||
      !partnerData.email ||
      !partnerData.phone ||
      !partnerData.country ||
      !partnerData.company ||
      !partnerData.partnership_interest ||
      !partnerData.consent
    ) {
      setSubmitError("Please fill in all required fields and accept the terms.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(
        "Thank you. Your partnership proposal has been submitted. Our team will review your details and reach out."
      );
    }, 700);
  };

  return (
    <div ref={containerRef} className="contact-page-root">
      {/* === Top Navigation Menu (Exact Match to User Screenshot) START === */}
      <nav className="contact-site-nav" aria-label="Primary">
        <Link href="/about" className="contact-nav-about">
          About
        </Link>

        <header className="contact-site-nav__logo">
          <Link href="/" aria-label="PROPVISTA - home">
            <img
              src="/assets/main-logo-blue.svg"
              alt="PROPVISTA"
            />
          </Link>
        </header>

        <span className="contact-nav-contact">
          Contact
        </span>
      </nav>
      {/* === Top Navigation Menu END === */}

      {/* === Contact Hero Section START === */}
      <main className="contact-hero">
        {/* Giant Vertical Background Marquee "Contact" in Solid Navy */}
        <div className="contact-hero__marquee-rotate" aria-hidden="true">
          <div className="hero-section">
            <div className="hero-top">
              <div className="marquee marquee--contact">
                <div className="marquee-reveal">
                  <div className="marquee-scroll">
                    <div className="marquee-collection">
                      <span className="marquee-text">Contact</span>
                    </div>
                    <div className="marquee-collection">
                      <span className="marquee-text">Contact</span>
                    </div>
                    <div className="marquee-collection">
                      <span className="marquee-text">Contact</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-hero__grid">
          {/* === Channels Stack (Center-Left Column) START === */}
          <div ref={channelsStackRef} className="contact-hero__channels-stack">
            <h1 className="visually-hidden">Contact Us</h1>
            <p className="contact-hero__channels-heading">Let&apos;s talk.</p>

            <div className="contact-hero__channels" aria-label="Contact details">
              {/* Channel 1: Office Email */}
              <div className="contact-hero__channel">
                <p className="contact-hero__channel-label">Office</p>
                <button
                  type="button"
                  className={`contact-hero__channel-value contact-hero__channel-copy ${
                    isCopied ? "is-copied" : ""
                  }`}
                  onClick={() => handleCopyEmail("info@realevate.agency")}
                  aria-label="Copy email address info@realevate.agency"
                >
                  <span className="contact-hero__channel-copy-label">
                    Info@realevate.agency
                  </span>
                  <span
                    className="contact-hero__channel-copy-feedback"
                    aria-live="polite"
                  >
                    <svg
                      className="contact-hero__channel-copy-check"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path 
                        d="M2.5 7.5L5.5 10.5L11.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Email Copied
                  </span>
                </button>
              </div>

              {/* Channel 2: WhatsApp */}
              <div className="contact-hero__channel">
                <p className="contact-hero__channel-label">Whatsapp</p>
                <a
                  className="contact-hero__channel-value"
                  href="https://wa.me/972546020690"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Send a message
                </a>
              </div>

              {/* Channel 3: Phone */}
              <div className="contact-hero__channel">
                <p className="contact-hero__channel-label">Phone</p>
                <a
                  className="contact-hero__channel-value"
                  href="tel:+972546020690"
                >
                  (+972) 54 60 20 690
                </a>
              </div>
            </div>
          </div>
          {/* === Channels Stack (Center-Left Column) END === */}

          {/* === Aside Form Area (Right Column) START === */}
          <div ref={asideFormRef} className="contact-hero__aside">
            <div className="contact-hero__form">
              {/* Form Tabs */}
              <div
                className="contact-form-tabs"
                role="tablist"
                aria-label="Contact form type"
              >
                <button
                  type="button"
                  className={`contact-form-tabs__tab ${
                    activeTab === "investors" ? "is-active" : ""
                  }`}
                  role="tab"
                  id="contact-tab-investors"
                  aria-selected={activeTab === "investors"}
                  aria-controls="contact-form-investors"
                  onClick={() => {
                    setActiveTab("investors");
                    setSubmitSuccess(null);
                    setSubmitError(null);
                  }}
                >
                  Investors
                </button>
                <button
                  type="button"
                  className={`contact-form-tabs__tab ${
                    activeTab === "developers" ? "is-active" : ""
                  }`}
                  role="tab"
                  id="contact-tab-developers"
                  aria-selected={activeTab === "developers"}
                  aria-controls="contact-form-developers"
                  onClick={() => {
                    setActiveTab("developers");
                    setSubmitSuccess(null);
                    setSubmitError(null);
                  }}
                >
                  Partnership
                </button>
              </div>

              {/* Form Panels Container */}
              <div className="contact-form-panels">
                {submitSuccess ? (
                  <div className="lead-form-success">
                    <p>{submitSuccess}</p>
                    <button
                      type="button"
                      style={{
                        marginTop: "1rem",
                        padding: "0.5rem 1.2rem",
                        border: "1px solid var(--contact-navy)",
                        background: "var(--contact-navy)",
                        color: "#ffffff",
                        fontFamily: "var(--contact-sans)",
                        cursor: "pointer",
                      }}
                      onClick={() => setSubmitSuccess(null)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    {/* FORM 1: INVESTORS */}
                    <form
                      id="contact-form-investors"
                      className={`contact-page-form ${
                        activeTab === "investors" ? "is-active" : ""
                      }`}
                      hidden={activeTab !== "investors"}
                      onSubmit={handleInvestorSubmit}
                      noValidate
                    >
                      <div>
                        <label className="visually-hidden" htmlFor="contact-fullname">
                          Full name
                        </label>
                        <input
                          type="text"
                          id="contact-fullname"
                          name="fullname"
                          placeholder="Full name*"
                          required
                          autoComplete="name"
                          value={investorData.fullname}
                          onChange={(e) =>
                            setInvestorData({ ...investorData, fullname: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="visually-hidden" htmlFor="contact-email">
                          Email
                        </label>
                        <input
                          type="email"
                          id="contact-email"
                          name="email"
                          placeholder="Email*"
                          required
                          autoComplete="email"
                          value={investorData.email}
                          onChange={(e) =>
                            setInvestorData({ ...investorData, email: e.target.value })
                          }
                        />
                      </div>

                      <div className="contact-form__row">
                        <div>
                          <label className="visually-hidden" htmlFor="contact-phone">
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="contact-phone"
                            name="phone"
                            placeholder="Phone*"
                            required
                            autoComplete="tel"
                            value={investorData.phone}
                            onChange={(e) =>
                              setInvestorData({ ...investorData, phone: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="visually-hidden" htmlFor="contact-country">
                            Country
                          </label>
                          <select
                            id="contact-country"
                            name="country"
                            required
                            autoComplete="country-name"
                            value={investorData.country}
                            onChange={handleInvestorCountryChange}
                          >
                            <option value="" disabled>
                              Country*
                            </option>
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="contact-form__row">
                        <div>
                          <label className="visually-hidden" htmlFor="contact-budget">
                            Investment budget
                          </label>
                          <select
                            id="contact-budget"
                            name="budget"
                            required
                            value={investorData.budget}
                            onChange={(e) =>
                              setInvestorData({ ...investorData, budget: e.target.value })
                            }
                          >
                            <option value="" disabled>
                              Investment budget*
                            </option>
                            <option value="Up to €200K">Up to €200K</option>
                            <option value="€200K – €500K">€200K – €500K</option>
                            <option value="€500K – €1M">€500K – €1M</option>
                            <option value="€1M+">€1M+</option>
                          </select>
                        </div>

                        <div>
                          <label className="visually-hidden" htmlFor="contact-goal">
                            Purchase goal
                          </label>
                          <select
                            id="contact-goal"
                            name="investment_goal"
                            value={investorData.investment_goal}
                            onChange={(e) =>
                              setInvestorData({
                                ...investorData,
                                investment_goal: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Purchase goal
                            </option>
                            <option value="Investment">Investment</option>
                            <option value="Primary Residence">Primary Residence</option>
                            <option value="Holiday Home">Holiday Home</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="contact-form__row">
                        <div>
                          <label className="visually-hidden" htmlFor="contact-destination">
                            Preferred destination
                          </label>
                          <select
                            id="contact-destination"
                            name="destination"
                            value={investorData.destination}
                            onChange={(e) =>
                              setInvestorData({
                                ...investorData,
                                destination: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Preferred destination
                            </option>
                            <option value="Cyprus">Cyprus</option>
                            <option value="Montenegro">Montenegro</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="visually-hidden" htmlFor="contact-timeline">
                            Purchase timeline
                          </label>
                          <select
                            id="contact-timeline"
                            name="purchase_timeline"
                            value={investorData.purchase_timeline}
                            onChange={(e) =>
                              setInvestorData({
                                ...investorData,
                                purchase_timeline: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Purchase timeline
                            </option>
                            <option value="Immediately">Immediately</option>
                            <option value="Within 3 Months">Within 3 Months</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="visually-hidden" htmlFor="contact-message">
                          Message
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={2}
                          placeholder="Message"
                          value={investorData.message}
                          onChange={(e) =>
                            setInvestorData({ ...investorData, message: e.target.value })
                          }
                        />
                      </div>

                      <div className="lead-form__consents">
                        <label className="lead-form__consent" htmlFor="contact-consent">
                          <input
                            type="checkbox"
                            id="contact-consent"
                            name="consent"
                            required
                            checked={investorData.consent}
                            onChange={(e) =>
                              setInvestorData({
                                ...investorData,
                                consent: e.target.checked,
                              })
                            }
                          />
                          <span className="lead-marketing__text">
                            I agree to the{" "}
                            <span className="lead-marketing__policy">
                              Privacy Policy &amp; Terms Of Use
                            </span>{" "}
                            and to receive information and occasional updates from
                            Realevate.
                          </span>
                        </label>
                      </div>

                      {submitError && <p className="lead-form-error">{submitError}</p>}

                      <div className="contact-form__submit-row">
                        <button type="submit" disabled={isSubmitting}>
                          <span>{isSubmitting ? "Sending..." : "Send"}</span>
                        </button>
                      </div>
                    </form>

                    {/* FORM 2: PARTNERSHIP */}
                    <form
                      id="contact-form-developers"
                      className={`contact-page-form ${
                        activeTab === "developers" ? "is-active" : ""
                      }`}
                      hidden={activeTab !== "developers"}
                      onSubmit={handlePartnerSubmit}
                      noValidate
                    >
                      <div>
                        <label className="visually-hidden" htmlFor="contact-dev-name">
                          Full name
                        </label>
                        <input
                          type="text"
                          id="contact-dev-name"
                          name="fullname"
                          placeholder="Full name*"
                          required
                          autoComplete="name"
                          value={partnerData.fullname}
                          onChange={(e) =>
                            setPartnerData({ ...partnerData, fullname: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="visually-hidden" htmlFor="contact-dev-email">
                          Email
                        </label>
                        <input
                          type="email"
                          id="contact-dev-email"
                          name="email"
                          placeholder="Email*"
                          required
                          autoComplete="email"
                          value={partnerData.email}
                          onChange={(e) =>
                            setPartnerData({ ...partnerData, email: e.target.value })
                          }
                        />
                      </div>

                      <div className="contact-form__row">
                        <div>
                          <label className="visually-hidden" htmlFor="contact-dev-phone">
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="contact-dev-phone"
                            name="phone"
                            placeholder="Phone*"
                            required
                            autoComplete="tel"
                            value={partnerData.phone}
                            onChange={(e) =>
                              setPartnerData({ ...partnerData, phone: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="visually-hidden" htmlFor="contact-dev-country">
                            Country
                          </label>
                          <select
                            id="contact-dev-country"
                            name="country"
                            required
                            autoComplete="country-name"
                            value={partnerData.country}
                            onChange={handlePartnerCountryChange}
                          >
                            <option value="" disabled>
                              Country*
                            </option>
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="contact-form__row">
                        <div>
                          <label className="visually-hidden" htmlFor="contact-dev-company">
                            Company Name
                          </label>
                          <input
                            type="text"
                            id="contact-dev-company"
                            name="company"
                            placeholder="Company Name*"
                            required
                            autoComplete="organization"
                            value={partnerData.company}
                            onChange={(e) =>
                              setPartnerData({ ...partnerData, company: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label
                            className="visually-hidden"
                            htmlFor="contact-dev-interest"
                          >
                            Partnership Type
                          </label>
                          <select
                            id="contact-dev-interest"
                            name="partnership_interest"
                            required
                            value={partnerData.partnership_interest}
                            onChange={(e) =>
                              setPartnerData({
                                ...partnerData,
                                partnership_interest: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Partnership Type*
                            </option>
                            <option value="Development Company">Development Company</option>
                            <option value="Independent Developer">
                              Independent Developer
                            </option>
                            <option value="Real Estate Agency">Real Estate Agency</option>
                            <option value="Freelance Agent">Freelance Agent</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          className="visually-hidden"
                          htmlFor="contact-dev-company-website"
                        >
                          Website Url
                        </label>
                        <input
                          type="text"
                          id="contact-dev-company-website"
                          name="company_website"
                          placeholder="Website Url"
                          autoComplete="url"
                          inputMode="url"
                          value={partnerData.company_website}
                          onChange={(e) =>
                            setPartnerData({
                              ...partnerData,
                              company_website: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="visually-hidden" htmlFor="contact-dev-message">
                          Message
                        </label>
                        <textarea
                          id="contact-dev-message"
                          name="message"
                          rows={2}
                          placeholder="Message"
                          value={partnerData.message}
                          onChange={(e) =>
                            setPartnerData({ ...partnerData, message: e.target.value })
                          }
                        />
                      </div>

                      <div className="lead-form__consents">
                        <label
                          className="lead-form__consent"
                          htmlFor="contact-dev-consent"
                        >
                          <input
                            type="checkbox"
                            id="contact-dev-consent"
                            name="consent"
                            required
                            checked={partnerData.consent}
                            onChange={(e) =>
                              setPartnerData({
                                ...partnerData,
                                consent: e.target.checked,
                              })
                            }
                          />
                          <span className="lead-marketing__text">
                            I agree to the{" "}
                            <span className="lead-marketing__policy">
                              Privacy Policy &amp; Terms Of Use
                            </span>{" "}
                            and to receive information and occasional updates from
                            Realevate.
                          </span>
                        </label>
                      </div>

                      {submitError && <p className="lead-form-error">{submitError}</p>}

                      <div className="contact-form__submit-row">
                        <button type="submit" disabled={isSubmitting}>
                          <span>{isSubmitting ? "Sending..." : "Send"}</span>
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* === Aside Form Area (Right Column) END === */}
        </div>
      </main>
      {/* === Contact Hero Section END === */}
    </div>
  );
}