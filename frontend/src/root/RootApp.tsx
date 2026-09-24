import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { getAboutSection, getAdvisories, getCategories, getFeaturedAdvisories, getFeaturedArticles, getFeaturedSoftwares, getPartners, getProfile, getPublicStats, getSlides, updateProfile, uploadProfileLogo } from "../api/website";
import { changePassword, login, logout, me, signup } from "../api/auth";
import type { AboutSection, AccountType, AdvisoryFacets, AuthResponse, Category, Customer, FeaturedAdvisory, FeaturedArticle, FeaturedSoftware, HomeSlide, PartnerLogo, PublicStats } from "../types";
import type { Page } from "./types";
import { useNavbarScrollEffect, useSwiperInitEffect } from "../hooks/useUiEffects";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { ProfilePage } from "../pages/ProfilePage";
import { SoftwareCatalogPage } from "../pages/SoftwareCatalogPage";
import { SoftwareDetailPage } from "../pages/SoftwareDetailPage";
import { AdvisoryCatalogPage } from "../pages/AdvisoryCatalogPage";
import { AdvisoryDetailPage } from "../pages/AdvisoryDetailPage";
import { ArticleCatalogPage } from "../pages/ArticleCatalogPage";
import { ArticleDetailPage } from "../pages/ArticleDetailPage";
import { SearchPage } from "../pages/SearchPage";
import { FooterContentPage } from "../pages/FooterContentPage";
import { useToast } from "../components/ToastProvider";

export default function RootApp() {
  const emptyAdvisoryFacets: AdvisoryFacets = { service_types: [], advisory_sectors: [], companies: [], price_terms: [] };
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<Partial<Customer>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredSoftwares, setFeaturedSoftwares] = useState<FeaturedSoftware[]>([]);
  const [featuredAdvisories, setFeaturedAdvisories] = useState<FeaturedAdvisory[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>([]);
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [aboutSection, setAboutSection] = useState<AboutSection | null>(null);
  const [partners, setPartners] = useState<PartnerLogo[]>([]);
  const [publicStats, setPublicStats] = useState<PublicStats>({ users: 0, softwares: 0, advisories: 0, articles: 0 });
  const [advisoryFacets, setAdvisoryFacets] = useState<AdvisoryFacets>(emptyAdvisoryFacets);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupType, setSignupType] = useState<AccountType>("org");
  const [signupName, setSignupName] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    me()
      .then((data) => {
        if (data.user) {
          setAuth(data);
          setProfile(data.customer || {});
        } else {
          setAuth(null);
          setProfile({});
        }
      })
      .catch(() => {
        setAuth(null);
        setProfile({});
      })
      .finally(() => {
        setAuthReady(true);
      });

    getCategories().then((data) => setCategories(data.results)).catch(() => null);
    getFeaturedSoftwares().then((data) => setFeaturedSoftwares(data.results)).catch(() => null);
    getFeaturedAdvisories().then((data) => setFeaturedAdvisories(data.results)).catch(() => null);
    getFeaturedArticles().then((data) => setFeaturedArticles(data.results)).catch(() => null);
    getSlides().then((data) => setSlides(data.results)).catch(() => null);
    getAboutSection().then((data) => setAboutSection(data)).catch(() => null);
    getPartners().then((data) => setPartners(data.results)).catch(() => null);
    getPublicStats().then((data) => setPublicStats(data)).catch(() => null);
    getAdvisories({ page: 1, pageSize: 1 }).then((data) => setAdvisoryFacets(data.facets)).catch(() => null);
  }, []);

  useEffect(() => {
    if (auth && location.pathname === "/profile") {
      getProfile().then((res) => setProfile(res.customer)).catch(() => null);
    }
  }, [auth, location.pathname]);

  const page: Page = useMemo(() => {
    if (location.pathname === "/login") return "login";
    if (location.pathname === "/signup") return "signup";
    if (location.pathname === "/profile") return "profile";
    if (location.pathname === "/softwares") return "softwares";
    if (location.pathname.startsWith("/softwares/")) return "software-detail";
    if (location.pathname === "/advisories") return "advisories";
    if (location.pathname.startsWith("/advisories/")) return "advisory-detail";
    if (location.pathname === "/articles") return "articles";
    if (location.pathname.startsWith("/articles/")) return "article-detail";
    if (location.pathname === "/search") return "search";
    if (location.pathname.startsWith("/footer/")) return "home";
    return "home";
  }, [location.pathname]);

  useNavbarScrollEffect();
  useSwiperInitEffect(`${page}:${slides.length}`);

  const programParents = useMemo(() => categories.filter((c) => c.type === "program" && c.parent_id === null), [categories]);
  const programCategories = useMemo(() => categories.filter((c) => c.type === "program"), [categories]);
  const advisoryCategories = useMemo(() => categories.filter((c) => c.type === "advisory"), [categories]);
  const articleCategories = useMemo(() => categories.filter((c) => c.type === "article"), [categories]);
  const advisoryParents = useMemo(() => categories.filter((c) => c.type === "advisory" && c.parent_id === null), [categories]);

  const submitLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const data = await login(String(form.get("email") || ""), String(form.get("password") || ""));
      setAuth(data);
      setProfile(data.customer || {});
      navigate("/profile");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const passwordConfirm = String(form.get("password_confirm") || "");

    if (password !== passwordConfirm) {
      showToast("Нууц үг таарахгүй байна.", "error");
      setLoading(false);
      return;
    }

    try {
      const data = await signup(signupName, String(form.get("email") || ""), password, signupType);
      setAuth(data);
      setProfile(data.customer || {});
      navigate("/profile");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  };

  const submitProfile = async (e: FormEvent<HTMLFormElement>): Promise<boolean> => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await updateProfile(profile);
      setProfile(data.customer);
      setAuth((prev) => (prev ? { ...prev, customer: data.customer } : prev));
      showToast("Хэрэглэгчийн мэдээлэл шинэчлэгдлээ.");
      return true;
    } catch (err) {
      showToast((err as Error).message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (e: FormEvent<HTMLFormElement>): Promise<boolean> => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await changePassword(
        String(form.get("current_password") || ""),
        String(form.get("new_password") || ""),
        String(form.get("confirm_password") || ""),
      );
      e.currentTarget.reset();
      showToast("Нууц үг амжилттай солигдлоо.");
      return true;
    } catch (err) {
      showToast((err as Error).message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = async (file: File) => {
    setLoading(true);

    try {
      const data = await uploadProfileLogo(file);
      setProfile(data.customer);
      setAuth((prev) => (prev ? { ...prev, customer: data.customer } : prev));
      showToast("Logo амжилттай шинэчлэгдлээ.");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  };

  const doLogout = async () => {
    await logout();
    setAuth(null);
    setProfile({});
    navigate("/");
  };

  return (
    <>
      <SiteHeader
        page={page}
        auth={auth}
        searchOpen={searchOpen}
        programParents={programParents}
        advisoryParents={advisoryParents}
        articleCategories={articleCategories}
        advisoryServiceTypes={advisoryFacets.service_types}
        slides={slides}
        onPageChange={(nextPage) => {
          if (nextPage === "home") navigate("/");
          else if (nextPage === "softwares") navigate("/softwares");
          else if (nextPage === "advisories") navigate("/advisories");
          else if (nextPage === "articles") navigate("/articles");
          else navigate(`/${nextPage}`);
        }}
        onSearchToggle={() => setSearchOpen((v) => !v)}
        onSearchSubmit={(query) => {
          setSearchOpen(false);
          navigate(`/search?q=${encodeURIComponent(query)}`);
        }}
        onLogout={doLogout}
      />
      <Routes>
        <Route
          path="/"
          element={(
            <HomePage
              programParents={programParents}
              programCategories={programCategories}
              featuredSoftwares={featuredSoftwares}
              featuredAdvisories={featuredAdvisories}
              featuredArticles={featuredArticles}
              publicStats={publicStats}
              aboutSection={aboutSection}
            />
          )}
        />
        <Route path="/softwares" element={<SoftwareCatalogPage />} />
        <Route path="/softwares/:softwareId" element={<SoftwareDetailPage />} />
        <Route path="/advisories" element={<AdvisoryCatalogPage />} />
        <Route path="/advisories/:advisoryId" element={<AdvisoryDetailPage />} />
        <Route path="/articles" element={<ArticleCatalogPage />} />
        <Route path="/articles/:articleId" element={<ArticleDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/footer/:key" element={<FooterContentPage />} />
        <Route
          path="/login"
          element={
            !authReady ? null : auth ? (
              <Navigate to="/profile" replace />
            ) : (
              <LoginPage loading={loading} onSubmit={submitLogin} onGoSignup={() => navigate("/signup")} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !authReady ? null : auth ? (
              <Navigate to="/profile" replace />
            ) : (
              <SignupPage
                loading={loading}
                signupType={signupType}
                signupName={signupName}
                onSignupTypeChange={(value) => {
                  setSignupType(value);
                  setSignupName("");
                }}
                onSignupNameChange={setSignupName}
                onSubmit={submitSignup}
                onGoLogin={() => navigate("/login")}
              />
            )
          }
        />
        <Route
          path="/profile"
          element={
            !authReady ? null : auth ? (
              <ProfilePage
                profile={profile}
                loading={loading}
                programCategories={programCategories}
                advisoryCategories={advisoryCategories}
                articleCategories={articleCategories}
                advisoryFacets={advisoryFacets}
                onProfileChange={setProfile}
                onProfileSubmit={submitProfile}
                onPasswordSubmit={submitPassword}
                onLogoChange={handleLogoChange}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SiteFooter partners={partners} />
    </>
  );
}
