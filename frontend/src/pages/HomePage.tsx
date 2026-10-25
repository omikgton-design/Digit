import { FormEvent, Fragment, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdvisoryLikeButton } from "../components/AdvisoryLikeButton";
import { RatingControl } from "../components/RatingControl";
import type { AboutSection, Category, FeaturedAdvisory, FeaturedArticle, FeaturedSoftware, PublicStats, SiteContent } from "../types";
import { stripRichText } from "../utils/richText";
import { useLanguage } from "../i18n/LanguageContext";

type Props = {
  programParents: Category[];
  programCategories: Category[];
  featuredSoftwares: FeaturedSoftware[];
  featuredAdvisories: FeaturedAdvisory[];
  featuredArticles: FeaturedArticle[];
  publicStats: PublicStats;
  aboutSection: AboutSection | null;
  processContent?: SiteContent["process"] | null;
};

function formatArticleDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function formatStatValue(value: number) {
  return new Intl.NumberFormat("mn-MN").format(value);
}

const fallbackAboutSection: AboutSection = {
  id: 0,
  kicker: "Бидний тухай",
  title: "Бизнесийн шийдлээ нэг дороос сонгоход тусална",
  description: "Digit нь байгууллагуудад тохирох програм хангамж, зөвлөх үйлчилгээ, мэдлэг мэдээллийг нэг платформ дээр цэгцтэй харьцуулж сонгоход тусалдаг.",
  feature_title: "Ил тод, бодит мэдээлэл",
  feature_text: "Шийдэл, үйлчилгээ, нийтлэлийг нэг дороос ойлгомжтой харьцуулна.",
  button_text: "Дэлгэрэнгүй",
  button_url: "/company#about",
  circle_right_text: "Найдвартай мэдээлэл",
  circle_left_text: "Зөв сонголт",
  top_image_url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop",
  bottom_image_url: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1000&auto=format&fit=crop",
  sort_order: 0,
};

export function HomePage({ programParents, programCategories, featuredSoftwares, featuredAdvisories, featuredArticles, publicStats, aboutSection, processContent }: Props) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedArticleTypeId, setSelectedArticleTypeId] = useState<number | null>(null);
  const [softwareSearch, setSoftwareSearch] = useState("");
  const about = aboutSection || fallbackAboutSection;
  // "Ажлын үе шат": админаас оруулсан бичвэр, байхгүй бол өгөгдмөл 3 алхам.
  const fallbackIcons = ["🧭", "📝", "🚀"];
  const processSteps = processContent?.steps?.length
    ? processContent.steps
    : ([1, 2, 3] as const).map((index) => ({
        id: -index,
        icon: fallbackIcons[index - 1],
        title: t(`process_step${index}_title` as const),
        text: t(`process_step${index}_text` as const),
        sort_order: index,
      }));
  const showProcess = processContent ? processContent.is_active : true;
  const processKicker = processContent?.kicker || t("process_kicker");
  const processTitle = processContent?.title || t("process_title");
  const processCtaText = processContent ? processContent.cta_text : t("process_cta_text");
  const processCtaButton = processContent?.cta_button_text || t("process_cta_button");
  const processCtaUrl = processContent?.cta_button_url || "/company#contact";
  const programList = programParents.length ? programParents : [
    { id: 10001, name: "CRM", type: "program", parent_id: null },
    { id: 10002, name: "ERP", type: "program", parent_id: null },
    { id: 10003, name: "POS", type: "program", parent_id: null },
    { id: 10004, name: "Accounting", type: "program", parent_id: null }
  ];

  const softwareColumns = programParents.length
    ? programParents.map((parent) => {
        const children = programCategories.filter((item) => item.parent_id === parent.id);
        return {
          title: parent.name,
          parentId: parent.id,
          items: children.length ? children.map((item) => ({ id: item.id, name: item.name })) : [{ id: parent.id, name: parent.name }]
        };
      })
    : [
        {
          title: t("home_software_types_fallback"),
          parentId: null,
          items: programList.map((item) => ({ id: item.id, name: item.name }))
        }
      ];

  const featuredList = featuredSoftwares.slice(0, 12);
  const filteredFeaturedList = useMemo(() => {
    const query = softwareSearch.trim().toLowerCase();
    if (!query) return featuredList;
    return featuredList.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      (item.developer || "").toLowerCase().includes(query) ||
      (item.program_type || "").toLowerCase().includes(query),
    );
  }, [featuredList, softwareSearch]);
  const submitSoftwareSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = softwareSearch.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };
  const featuredAdvisoryList = featuredAdvisories.slice(0, 12);
  const articleTypeOptions = useMemo(() => {
    const seen = new Set<number>();
    return featuredArticles
      .filter((item) => {
        if (seen.has(item.article_type_id)) return false;
        seen.add(item.article_type_id);
        return true;
      })
      .map((item) => ({ id: item.article_type_id, name: item.article_type }));
  }, [featuredArticles]);
  const featuredArticleList = featuredArticles
    .filter((item) => selectedArticleTypeId === null || item.article_type_id === selectedArticleTypeId)
    .slice(0, 3);

  return (
    <>
      <section className="home-stats-section">
        <div className="container">
          <div className="process-stats">
            <div className="stat-item">
              <div className="stat-icon"><i className="fas fa-users" aria-hidden="true"></i></div>
              <div><div className="stat-number">{formatStatValue(publicStats.users)}</div><div className="stat-label">{t("stat_users")}</div></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><i className="fas fa-cube" aria-hidden="true"></i></div>
              <div><div className="stat-number">{formatStatValue(publicStats.softwares)}</div><div className="stat-label">{t("stat_softwares")}</div></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><i className="fas fa-headset" aria-hidden="true"></i></div>
              <div><div className="stat-number">{formatStatValue(publicStats.advisories)}</div><div className="stat-label">{t("stat_advisories")}</div></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><i className="far fa-file-alt" aria-hidden="true"></i></div>
              <div><div className="stat-number">{formatStatValue(publicStats.articles)}</div><div className="stat-label">{t("stat_articles")}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="services-header home-grid-header text-center">
            <div>
              <span className="services-kicker">{t("home_featured_kicker")}</span>
              <h2>{t("home_featured_software_title")}</h2>
            </div>
          </div>
          <form className="home-software-search" onSubmit={submitSoftwareSearch}>
            <span className="home-software-search-icon" aria-hidden="true">⌕</span>
            <input
              type="text"
              value={softwareSearch}
              onChange={(e) => setSoftwareSearch(e.target.value)}
              placeholder={t("home_software_search_placeholder")}
              className="home-software-search-input"
            />
            <button className="home-software-search-btn" type="submit">{t("home_search_btn")}</button>
          </form>
          <div className="home-feature-grid">
            {filteredFeaturedList.length ? (
              filteredFeaturedList.map((item) => (
                <div className="service-card home-compact-card" key={item.id}>
                  <div className="service-media">
                    <a href={`/softwares/${item.id}`}>
                      <img src={item.thumbnail_url} alt={item.name} />
                    </a>
                  </div>
                  <h5>
                    <a className="service-card-link" href={`/softwares/${item.id}`}>
                      {item.name}
                    </a>
                  </h5>
                  <p className="home-card-intro">
                    {stripRichText(item.introduction) || t("home_no_intro")}
                  </p>
                  <RatingControl average={item.rating_average} count={item.rating_count} userRating={item.user_rating} compact />
                  <ul className="service-list">
                    <li title={t("home_category_label")}><i className="fas fa-sitemap" aria-hidden="true"></i> {item.program_type}</li>
                    <li title={t("home_developer_label")}><i className="fas fa-building" aria-hidden="true"></i> {item.developer}</li>
                    <li title={t("home_sectors_label")}><i className="fas fa-tags" aria-hidden="true"></i> {item.advisory_sectors.length ? item.advisory_sectors.join(", ") : "-"}</li>
                  </ul>
                </div>
              ))
            ) : (
              <div className="service-card home-empty-card">
                <h5>{softwareSearch.trim() ? t("home_no_search_results") : t("home_no_featured_software")}</h5>
                <ul className="service-list">
                  <li>{softwareSearch.trim() ? t("home_try_other_keyword") : t("home_no_software_registered")}</li>
                </ul>
              </div>
            )}
          </div>
          <div className="home-view-all-row">
            <a className="home-view-all" href="/softwares">{t("home_view_all")}</a>
          </div>
        </div>
      </section>

      {showProcess ? (
        <section className="process-section">
          <div className="container">
            <div className="process-header text-center">
              <span className="process-kicker">{processKicker}</span>
              <h2>{processTitle}</h2>
            </div>

            <div className="process-steps" style={{ "--process-cols": Math.max(1, processSteps.length * 2 - 1) } as CSSProperties}>
              {processSteps.map((step, index) => (
                <Fragment key={step.id}>
                  {index > 0 ? <div className="process-arrow">→</div> : null}
                  <div className="process-step">
                    <div className="step-icon"><span className="step-badge">{String(index + 1).padStart(2, "0")}</span>{step.icon || fallbackIcons[index % 3]}</div>
                    <h5>{step.title}</h5>
                    <p>{step.text}</p>
                  </div>
                </Fragment>
              ))}
            </div>

            {processCtaText || processCtaButton ? (
              <div className="process-cta">
                <div className="cta-box">
                  {processCtaText ? <span>{processCtaText}</span> : null}
                  <Link to={processCtaUrl} className="cta-button">{processCtaButton}</Link>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="software-section">
        <div className="container">
          <h3 className="software-title text-center">{t("home_software_by_type_title")}</h3>
          <div className="software-grid">
            {softwareColumns.map((column) => (
              <div className="software-col" key={column.title}>
                <h6>
                  <a href={column.parentId ? `/softwares?program_type=${column.parentId}` : "/softwares"} className="software-link-title">
                    {column.title}
                  </a>
                </h6>
                <ul>
                  {column.items.map((item) => (
                    <li key={`${column.title}-${item.id}`}>
                      <a href={`/softwares?program_type=${item.id}`} className="software-link">
                        <span>{item.name}</span>
                        <i className="fas fa-arrow-right" aria-hidden="true"></i>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="advisory-section">
        <div className="container">
          <div className="home-grid-header text-center">
            <h3 className="advisory-title">{t("home_advisory_title")}</h3>
          </div>
          <div className="home-feature-grid">
            {featuredAdvisoryList.length ? (
              featuredAdvisoryList.map((item) => (
                <article className="advisory-card home-compact-card" key={item.id}>
                  <div className="advisory-media">
                    <a href={`/advisories/${item.id}`}>
                      <img src={item.thumbnail_url} alt={item.title} />
                    </a>
                    <span className="advisory-badge">{item.service_type}</span>
                  </div>
                  <div className="advisory-body">
                    <h5><a className="service-card-link" href={`/advisories/${item.id}`}>{item.title}</a></h5>
                    <RatingControl average={item.rating_average} count={item.rating_count} userRating={item.user_rating} compact />
                    <p>{stripRichText(item.introduction) || t("home_no_intro")}</p>
                    <div className="advisory-meta">
                      <span className="advisory-company">{item.company}</span>
                      <AdvisoryLikeButton advisoryId={item.id} initialLiked={item.liked} initialCount={item.like_count} />
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <article className="advisory-card home-empty-card">
                <div className="advisory-body">
                  <h5>{t("home_no_featured_advisory")}</h5>
                  <p>{t("home_no_advisory_registered")}</p>
                </div>
              </article>
            )}
          </div>
          <div className="home-view-all-row">
            <a className="home-view-all" href="/advisories">{t("home_view_all")}</a>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span className="why-kicker">{about.kicker || t("why_kicker_fallback")}</span>
              <h2>{about.title || fallbackAboutSection.title}</h2>
              <p className="why-lead">
                {about.description || fallbackAboutSection.description}
              </p>
              <div className="why-feature">
                <div className="why-icon">✔</div>
                <div>
                  <div className="why-feature-title">{about.feature_title || fallbackAboutSection.feature_title}</div>
                  <div className="why-feature-text">{about.feature_text || fallbackAboutSection.feature_text}</div>
                </div>
              </div>
              <a href={about.button_url || fallbackAboutSection.button_url} className="why-cta">{about.button_text || fallbackAboutSection.button_text} <span>›</span></a>
            </div>
            <div className="col-lg-6">
              <div className="why-circles">
                <div className="circle-image circle-top"><img src={about.top_image_url || fallbackAboutSection.top_image_url} alt={about.title || "Бидний тухай"} /></div>
                <div className="circle-yellow circle-right">{about.circle_right_text || fallbackAboutSection.circle_right_text}</div>
                <div className="circle-yellow circle-left">{about.circle_left_text || fallbackAboutSection.circle_left_text}</div>
                <div className="circle-image circle-bottom"><img src={about.bottom_image_url || fallbackAboutSection.bottom_image_url} alt={about.feature_title || "Бидний тухай"} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-section">
        <div className="container">
          <div className="blog-header text-center">
            <span className="blog-kicker">{t("home_newsroom_kicker")}</span>
            <h2>{t("home_news_articles_title")}</h2>
          </div>
          {articleTypeOptions.length > 1 ? (
            <div className="blog-type-tabs" aria-label={t("home_news_articles_title")}>
              <button
                type="button"
                className={selectedArticleTypeId === null ? "is-active" : ""}
                onClick={() => setSelectedArticleTypeId(null)}
              >
                {t("home_article_type_all")}
              </button>
              {articleTypeOptions.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  className={selectedArticleTypeId === type.id ? "is-active" : ""}
                  onClick={() => setSelectedArticleTypeId(type.id)}
                >
                  {type.name}
                </button>
              ))}
            </div>
          ) : null}
          <div className="row g-4">
            {featuredArticleList.map((item) => (
              <div className="col-md-6 col-lg-4" key={item.title}>
                <a className="blog-card blog-card-anchor" href={`/articles/${item.id}`}>
                  <div className="blog-media">
                    <img src={item.thumbnail_url} alt={item.title} />
                    <div className="blog-date">{formatArticleDate(item.update_date)}</div>
                  </div>
                  <div className="blog-body">
                    <div className="blog-meta">
                      <span>{item.article_type}</span>
                      <span className="blog-meta-sep" aria-hidden="true">—</span>
                      <span>{item.organization}</span>
                    </div>
                    <h5>{item.title}</h5>
                    <p className="article-card-excerpt">{stripRichText(item.description) || t("home_no_article_desc")}</p>
                  </div>
                </a>
              </div>
            ))}
            {!featuredArticleList.length ? (
              <div className="col-12">
                <article className="blog-card blog-card-empty">
                  <div className="blog-body">
                    <h5>{t("home_no_featured_article")}</h5>
                    <p>{t("home_no_article_registered")}</p>
                  </div>
                </article>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="home-slim-banner-section">
        <div className="container">
          <a className="home-slim-banner" href="/articles" aria-label={t("home_articles_banner_alt")}>
            <img src="/media/green.jpg" alt={t("home_articles_banner_alt")} />
          </a>
        </div>
      </section>
    </>
  );
}
