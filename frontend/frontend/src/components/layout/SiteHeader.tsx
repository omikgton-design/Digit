import { useState } from "react";
import { Link } from "react-router-dom";
import type { AdvisoryFacets, AuthResponse, Category, HomeSlide } from "../../types";
import type { Page } from "../../root/types";
import { stripRichText } from "../../utils/richText";

type SiteLang = "mn" | "en";

const uiText: Record<SiteLang, {
  software: string; advisory: string; article: string;
  byType: string; bySector: string; types: string; articleTypes: string;
  login: string; myAccount: string; logout: string;
  searchPlaceholder: string; searchBtn: string;
  heroTitles: Record<string, string>;
}> = {
  mn: {
    software: "Програм хангамж",
    advisory: "Зөвлөх үйлчилгээ",
    article: "Нийтлэл",
    byType: "Төрлөөр",
    bySector: "Салбараар",
    types: "Төрлүүд",
    articleTypes: "Нийтлэлийн төрлүүд",
    login: "Нэвтрэх",
    myAccount: "Миний бүртгэл",
    logout: "Гарах",
    searchPlaceholder: "Хайх...",
    searchBtn: "Хайх",
    heroTitles: {
      login: "Нэвтрэх",
      signup: "Бүртгүүлэх",
      softwares: "Програм хангамжийн жагсаалт",
      "software-detail": "Програмын дэлгэрэнгүй",
      advisories: "Зөвлөх үйлчилгээний жагсаалт",
      "advisory-detail": "Зөвлөх үйлчилгээний дэлгэрэнгүй",
      articles: "Нийтлэлийн жагсаалт",
      "article-detail": "Нийтлэлийн дэлгэрэнгүй",
      search: "Хайлтын үр дүн",
      profile: "Миний бүртгэл",
    },
  },
  en: {
    software: "Software",
    advisory: "Advisory Services",
    article: "Articles",
    byType: "By Type",
    bySector: "By Sector",
    types: "Types",
    articleTypes: "Article Types",
    login: "Log In",
    myAccount: "My Account",
    logout: "Log Out",
    searchPlaceholder: "Search...",
    searchBtn: "Search",
    heroTitles: {
      login: "Log In",
      signup: "Sign Up",
      softwares: "Software Catalog",
      "software-detail": "Software Details",
      advisories: "Advisory Services Catalog",
      "advisory-detail": "Advisory Service Details",
      articles: "Articles",
      "article-detail": "Article Details",
      search: "Search Results",
      profile: "My Account",
    },
  },
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
  onPageChange,
  onSearchToggle,
  onSearchSubmit,
  onLogout
}: Props) {
  const [lang, setLang] = useState<SiteLang>(() => {
    if (typeof window === "undefined") return "mn";
    return (window.localStorage.getItem("digit_lang") as SiteLang) || "mn";
  });
  const t = uiText[lang];
  const visibleSlides = slides.length ? slides : fallbackSlides;

  const changeLang = (next: SiteLang) => {
    setLang(next);
    if (typeof window !== "undefined") window.localStorage.setItem("digit_lang", next);
  };

  return (
    <header className={`hero ${page === "home" ? "has-slider" : "hero-compact"}`}>
      <nav className="navbar navbar-expand-lg navbar-dark" id="mainNavbar">
        <div className="container">
          <div className="nav-shell">
            <a className="navbar-brand" href="/" onClick={(e) => { e.preventDefault(); onPageChange("home"); }}>
              <img className="logo-mark logo-default" src="/logo.png" alt="Digit logo" />
              <img className="logo-mark logo-scrolled" src="/logo_blank.png" alt="Digit logo" />
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
                    {t.software}
                  </a>
                  <div className="dropdown-menu mega-menu shadow-lg">
                    <div className="mega-grid">
                      <div className="mega-col">
                        <h6>{t.byType}</h6>
                        {programParents.map((item) => (
                          <a key={item.id} className="dropdown-item" href={`/softwares?program_type=${item.id}`}>{item.name}</a>
                        ))}
                      </div>
                      <div className="mega-col">
                        <h6>{t.bySector}</h6>
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
                    {t.advisory}
                  </a>
                  <div className="dropdown-menu mega-menu shadow-lg">
                    <div className="mega-grid" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                      <div className="mega-col">
                        <h6>{t.types}</h6>
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
                    {t.article}
                  </a>
                  <div className="dropdown-menu mega-menu shadow-lg article-mega-menu">
                    <div className="mega-grid" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                      <div className="mega-col">
                        <h6>{t.articleTypes}</h6>
                        {articleCategories.map((item) => (
                          <a key={item.id} className="dropdown-item" href={`/articles?article_type=${item.id}`}>
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
              <div className="nav-right d-none d-lg-flex align-items-center gap-3">
                <div className="lang-switch" role="group" aria-label="Хэл сонгох">
                  <Link
                    to="/footer/contact"
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
                  <button
                    type="button"
                    className={`lang-switch-word ${lang === "mn" ? "is-active" : ""}`}
                    onClick={() => changeLang("mn")}
                  >
                    МОН
                  </button>
                  <span className="lang-switch-sep">/</span>
                  <button
                    type="button"
                    className={`lang-switch-word ${lang === "en" ? "is-active" : ""}`}
                    onClick={() => changeLang("en")}
                  >
                    ENG
                  </button>
                </div>
                <div className={`call-box ${auth ? "" : "call-box-login"}`}>
                  <div className="call-action">
                    {auth ? (
                      <div className="dropdown dropdown-account">
                        <button
                          className="call-login-btn call-login-btn-icon dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-label={auth.user?.email || "Хэрэглэгч"}
                          title={auth.user?.email || "Хэрэглэгч"}
                        >
                          <span className="call-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" role="img" aria-label="User">
                              <path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z" fill="currentColor" />
                            </svg>
                          </span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li><a className="dropdown-item" href="/profile" onClick={(e) => { e.preventDefault(); onPageChange("profile"); }}>{t.myAccount}</a></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li><a className="dropdown-item" href="/" onClick={(e) => { e.preventDefault(); onLogout(); }}>{t.logout}</a></li>
                        </ul>
                      </div>
                    ) : (
                      <a className="call-login-btn" href="/login" onClick={(e) => { e.preventDefault(); onPageChange("login"); }}>{t.login}</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {page === "home" ? (
        <div className="hero-slider swiper" key={visibleSlides.map((slide) => slide.id).join("-")}>
          <div className="swiper-wrapper">
            {visibleSlides.map((slide) => (
              <div className="swiper-slide" key={slide.id}>
                <img src={slide.image_url} alt={slide.title} />
                <div className="home-hero-panel">
                  <div className="home-hero-partner">
                    <span className="home-hero-partner-icon" aria-hidden="true">
                      <i className="fas fa-layer-group"></i>
                    </span>
                    <span>{slide.partner_label || "Digit"}</span>
                  </div>
                  <h1>{slide.title}</h1>
                  <p>{stripRichText(slide.description)}</p>
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
            ))}
          </div>
          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
          <div className="hero-pagination swiper-pagination"></div>
        </div>
      ) : (
        <div className="page-hero">
          <div className="page-hero-overlay"></div>
          <div className="page-hero-content container">
            <div className="page-hero-text">
              <h1 className="page-hero-title">
                {t.heroTitles[page] || t.myAccount}
              </h1>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
