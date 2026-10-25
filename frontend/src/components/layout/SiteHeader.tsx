import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import type { AdvisoryFacets, AuthResponse, Category, CustomerBanner, HomeSlide } from "../../types";
import type { Page } from "../../root/types";
import { stripRichText } from "../../utils/richText";
import { LANGUAGE_SWITCH_ENABLED, useLanguage } from "../../i18n/LanguageContext";
import type { TranslationKey } from "../../i18n/translations";

const heroTitleKeyByPage: Record<Page, TranslationKey> = {
  home: "hero_title_search",
  login: "hero_title_login",
  signup: "hero_title_signup",
  profile: "hero_title_profile",
  softwares: "hero_title_softwares",
  "software-detail": "hero_title_software_detail",
  advisories: "hero_title_advisories",
  "advisory-detail": "hero_title_advisory_detail",
  articles: "hero_title_articles",
  "article-detail": "hero_title_article_detail",
  search: "hero_title_search",
  pricing: "hero_title_pricing",
  company: "footer_col_company_title",
  payment: "hero_title_payment",
};

const fallbackSlides: HomeSlide[] = [
  {
    id: -1,
    image_url: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1920&auto=format&fit=crop",
    partner_label: "Digit",
    title: "БИЗНЕСИЙГ ХӨГЖҮҮЛЭХ ШИЙДЛИЙН НЭГ ДОРООС",
    description: "Програм хангамж, зөвлөх үйлчилгээ, нийтлэлийг нэг платформоос хайж, харьцуулж сонгоорой.",
    link_url: "",
    sort_order: 0,
  },
  {
    id: -2,
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1920&auto=format&fit=crop",
    partner_label: "Програм хангамж",
    title: "ТАНАЙ БАЙГУУЛЛАГАД ТОХИРОХ СИСТЕМҮҮД",
    description: "CRM, ERP, POS болон салбарын шийдлүүдийг ангиллаар нь цэгцтэй үзнэ.",
    link_url: "",
    sort_order: 1,
  },
  {
    id: -3,
    image_url: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1920&auto=format&fit=crop",
    partner_label: "Зөвлөх үйлчилгээ",
    title: "МЭРГЭЖЛИЙН ҮЙЛЧИЛГЭЭГ ХУРДАН ОЛ",
    description: "Хэрэгцээндээ нийцсэн зөвлөх байгууллага, үйлчилгээний мэдээллийг нэг дороос аваарай.",
    link_url: "",
    sort_order: 2,
  }
];

type Props = {
  page: Page;
  auth: AuthResponse | null;
  searchOpen: boolean;
  programParents: Category[];
  advisoryParents: Category[];
  articleCategories: Category[];
  advisoryServiceTypes: AdvisoryFacets["service_types"];
  slides: HomeSlide[];
  banners: CustomerBanner[];
  headerLogoUrl?: string;
  headerLogoScrolledUrl?: string;
  onPageChange: (page: Page) => void;
  onSearchToggle: () => void;
  onSearchSubmit: (query: string) => void;
  onLogout: () => void;
};

export function SiteHeader({
  page,
  auth,
  searchOpen,
  programParents,
  advisoryParents,
  articleCategories,
  advisoryServiceTypes,
  slides,
  banners,
  headerLogoUrl,
  headerLogoScrolledUrl,
  onPageChange,
  onSearchToggle,
  onSearchSubmit,
  onLogout
}: Props) {
  const { lang, setLang, t } = useLanguage();
  const visibleSlides = slides.length ? slides : fallbackSlides;
  // Дээд slider: admin-ы slide болон Gold хэрэглэгчийн banner-ыг ээлжлүүлж нэг slider-т нэгтгэнэ.
  const heroItems = useMemo(() => {
    type HeroItem = { key: string; slide?: HomeSlide; banner?: CustomerBanner };
    const slideItems: HeroItem[] = visibleSlides.map((slide) => ({ key: `slide-${slide.id}`, slide }));
    const bannerItems: HeroItem[] = banners.map((banner) => ({ key: `banner-${banner.id}`, banner }));
    const merged: HeroItem[] = [];
    for (let i = 0; i < Math.max(slideItems.length, bannerItems.length); i += 1) {
      if (slideItems[i]) merged.push(slideItems[i]);
      if (bannerItems[i]) merged.push(bannerItems[i]);
    }
    return merged;
  }, [visibleSlides, banners]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className={`hero ${page === "home" ? "has-slider" : page === "profile" ? "hero-bare" : "hero-compact"}`}>
      <nav className="navbar navbar-expand-lg navbar-dark" id="mainNavbar">
        <div className="container">
          <div className="nav-shell">
            <a className="navbar-brand" href="/" onClick={(e) => { e.preventDefault(); onPageChange("home"); }}>
              <img className="logo-mark logo-default" src={headerLogoUrl || "/logo.png"} alt="Digit logo" />
              <img className="logo-mark logo-scrolled" src={headerLogoScrolledUrl || headerLogoUrl || "/logo_blank.png"} alt="Digit logo" />
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="mainNav">
              <ul className="navbar-nav me-auto gap-lg-4">
                <li className="nav-item dropdown mega">
                  <a
                    className="nav-link dropdown-toggle"
                    href="/softwares"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange("softwares");
                    }}
                  >
                    {t("nav_software")}
                  </a>
                  <div className="dropdown-menu mega-menu shadow-lg">
                    <div className="mega-grid">
                      <div className="mega-col">
                        <h6>{t("nav_by_type")}</h6>
                        {programParents.map((item) => (
                          <a key={item.id} className="dropdown-item" href={`/softwares?program_type=${item.id}`}>{item.name}</a>
                        ))}
                      </div>
                      <div className="mega-col">
                        <h6>{t("nav_by_sector")}</h6>
                        {advisoryParents.map((item) => (
                          <a key={item.id} className="dropdown-item" href={`/softwares?advisory_sector=${item.id}`}>{item.name}</a>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
                <li className="nav-item dropdown mega">
                  <a
                    className="nav-link dropdown-toggle"
                    href="/advisories"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange("advisories");
                    }}
                  >
                    {t("nav_advisory")}
                  </a>
                  <div className="dropdown-menu mega-menu shadow-lg">
                    <div className="mega-grid" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                      <div className="mega-col">
                        <h6>{t("nav_types")}</h6>
                        {advisoryServiceTypes.map((item) => (
                          <a key={item.id} className="dropdown-item" href={`/advisories?service_type=${item.id}`}>
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
                <li className="nav-item dropdown mega">
                  <a className="nav-link dropdown-toggle" href="/articles" onClick={(e) => { e.preventDefault(); onPageChange("articles"); }}>
                    {t("nav_article")}
                  </a>
                  <div className="dropdown-menu mega-menu shadow-lg article-mega-menu">
                    <div className="mega-grid" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                      <div className="mega-col">
                        <h6>{t("nav_article_types")}</h6>
                        {articleCategories.map((item) => (
                          <a key={item.id} className="dropdown-item" href={`/articles?article_type=${item.id}`}>
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/company#pricing">{t("nav_pricing")}</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/company#about">{t("nav_about")}</Link>
                </li>
              </ul>
              <div className="nav-mobile-auth d-lg-none">
                {auth ? (
                  <>
                    <a className="nav-auth-login" href="/profile" onClick={(e) => { e.preventDefault(); onPageChange("profile"); }}>{t("nav_my_account")}</a>
                    <a className="call-login-btn" href="/" onClick={(e) => { e.preventDefault(); onLogout(); }}>{t("nav_logout")}</a>
                  </>
                ) : (
                  <>
                    <a className="nav-auth-login" href="/login" onClick={(e) => { e.preventDefault(); onPageChange("login"); }}>{t("nav_login")}</a>
                    <a className="call-login-btn" href="/signup" onClick={(e) => { e.preventDefault(); onPageChange("signup"); }}>{t("nav_signup")}</a>
                  </>
                )}
              </div>
              <div className="nav-right d-none d-lg-flex align-items-center gap-3">
                <div className={`lang-switch ${LANGUAGE_SWITCH_ENABLED ? "" : "lang-switch--contact-only"}`} role="group" aria-label={LANGUAGE_SWITCH_ENABLED ? "Хэл сонгох" : "Холбоо барих"}>
                  <Link
                    to="/company#contact"
                    className="lang-switch-icon"
                    aria-label="Холбоо барих хаяг"
                    title="Холбоо барих хаяг"
                  >
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-2.95a15.6 15.6 0 0 0-1.38-4.06A8.03 8.03 0 0 1 18.93 8zM12 4.06c.86 1.14 1.54 2.5 1.97 3.94h-3.94c.43-1.44 1.11-2.8 1.97-3.94zM4.26 14A7.9 7.9 0 0 1 4 12c0-.69.09-1.36.26-2h3.38a17.3 17.3 0 0 0 0 4H4.26zm.81 2h2.95c.32 1.44.78 2.8 1.38 4.06A8.03 8.03 0 0 1 5.07 16zm2.95-8H5.07a8.03 8.03 0 0 1 4.33-4.06A15.6 15.6 0 0 0 8.02 8zM12 19.94A15.6 15.6 0 0 1 10.03 16h3.94A15.6 15.6 0 0 1 12 19.94zM14.36 14H9.64a15.16 15.16 0 0 1 0-4h4.72a15.16 15.16 0 0 1 0 4zm.25 5.06c.6-1.26 1.06-2.62 1.38-4.06h2.95a8.03 8.03 0 0 1-4.33 4.06zM16.36 12a17.3 17.3 0 0 0 0-4h3.38c.17.64.26 1.31.26 2s-.09 1.36-.26 2h-3.38z"
                      />
                    </svg>
                  </Link>
                  {LANGUAGE_SWITCH_ENABLED ? (
                    <>
                      <button
                        type="button"
                        className={`lang-switch-word ${lang === "mn" ? "is-active" : ""}`}
                        onClick={() => setLang("mn")}
                      >
                        МОН
                      </button>
                      <span className="lang-switch-sep">/</span>
                      <button
                        type="button"
                        className={`lang-switch-word ${lang === "en" ? "is-active" : ""}`}
                        onClick={() => setLang("en")}
                      >
                        ENG
                      </button>
                    </>
                  ) : null}
                </div>
                <form
                  className="nav-search"
                  role="search"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const query = String(new FormData(e.currentTarget).get("q") || "").trim();
                    if (query) onSearchSubmit(query);
                  }}
                >
                  <input
                    ref={searchInputRef}
                    name="q"
                    type="search"
                    className={`search-input ${searchOpen ? "show" : ""}`}
                    placeholder={t("nav_search_placeholder")}
                    autoComplete="off"
                    tabIndex={searchOpen ? 0 : -1}
                    onKeyDown={(e) => { if (e.key === "Escape") onSearchToggle(); }}
                  />
                  <button type="button" className="btn-search" onClick={onSearchToggle} aria-label={t("nav_search_btn")} aria-expanded={searchOpen}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </button>
                </form>
                {auth ? (
                  <div className="dropdown dropdown-account">
                    <button
                      className="call-login-btn nav-user-pill dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-label={auth.user?.email || "Хэрэглэгч"}
                      title={auth.user?.email || "Хэрэглэгч"}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5z" />
                      </svg>
                      <span className="nav-user-email">{auth.user?.email || "Хэрэглэгч"}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><a className="dropdown-item" href="/profile" onClick={(e) => { e.preventDefault(); onPageChange("profile"); }}>{t("nav_my_account")}</a></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><a className="dropdown-item" href="/" onClick={(e) => { e.preventDefault(); onLogout(); }}>{t("nav_logout")}</a></li>
                    </ul>
                  </div>
                ) : (
                  <div className="nav-auth">
                    <a className="nav-auth-login" href="/login" onClick={(e) => { e.preventDefault(); onPageChange("login"); }}>{t("nav_login")}</a>
                    <a className="call-login-btn" href="/signup" onClick={(e) => { e.preventDefault(); onPageChange("signup"); }}>{t("nav_signup")}</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {page === "home" ? (
        <div className="hero-slider swiper" key={heroItems.map((item) => item.key).join("-")}>
          <div className="swiper-wrapper">
            {heroItems.map((item) =>
              item.banner ? (
                <div className="swiper-slide hero-banner-slide" key={item.key}>
                  {(() => {
                    const banner = item.banner;
                    const pictures = (
                      <>
                        <img className="hero-banner-bg" src={banner.image_url} alt="" aria-hidden="true" draggable={false} />
                        <img className="hero-banner-main" src={banner.image_url} alt="Зар" draggable={false} />
                        <span className="hero-banner-tag">Зар</span>
                      </>
                    );
                    return banner.link_url ? (
                      <a className="hero-banner-link" href={banner.link_url} target="_blank" rel="noreferrer sponsored">
                        {pictures}
                      </a>
                    ) : (
                      <div className="hero-banner-link">{pictures}</div>
                    );
                  })()}
                </div>
              ) : item.slide ? (
                <div className="swiper-slide" key={item.key}>
                  <img src={item.slide.image_url} alt={item.slide.title} />
                  <div className="home-hero-panel">
                    <div className="home-hero-partner">
                      <span className="home-hero-partner-icon" aria-hidden="true">
                        <i className="fas fa-layer-group"></i>
                      </span>
                      <span>{item.slide.partner_label || "Digit"}</span>
                    </div>
                    <h1>{item.slide.title}</h1>
                    <p>{stripRichText(item.slide.description)}</p>
                    <div className="home-store-row" aria-label="Апп татах холбоосууд">
                      <a className="home-store-badge" href="#" aria-label="App Store">
                        <i className="fab fa-apple" aria-hidden="true"></i>
                        <span>App Store</span>
                      </a>
                      <a className="home-store-badge" href="#" aria-label="Google Play">
                        <i className="fab fa-google-play" aria-hidden="true"></i>
                        <span>Google Play</span>
                      </a>
                      <a className="home-store-badge" href="#" aria-label="AppGallery">
                        <i className="fas fa-mobile-alt" aria-hidden="true"></i>
                        <span>AppGallery</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
          <div className="hero-pagination swiper-pagination"></div>
        </div>
      ) : page === "profile" ? null : (
        <div className="page-hero">
          <div className="page-hero-overlay"></div>
          <div className="page-hero-content container">
            <div className="page-hero-text">
              <h1 className="page-hero-title">
                {t(heroTitleKeyByPage[page])}
              </h1>
              {page === "softwares" || page === "advisories" || page === "articles" ? (
                <p className="page-hero-subtitle">{t("hero_subtitle_catalog")}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
