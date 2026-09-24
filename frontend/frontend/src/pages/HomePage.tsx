import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdvisoryLikeButton } from "../components/AdvisoryLikeButton";
import { RatingControl } from "../components/RatingControl";
import type { AboutSection, Category, FeaturedAdvisory, FeaturedArticle, FeaturedSoftware, PublicStats } from "../types";
import { stripRichText } from "../utils/richText";

type Props = {
  programParents: Category[];
  programCategories: Category[];
  featuredSoftwares: FeaturedSoftware[];
  featuredAdvisories: FeaturedAdvisory[];
  featuredArticles: FeaturedArticle[];
  publicStats: PublicStats;
  aboutSection: AboutSection | null;
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
  button_url: "/footer/about",
  circle_right_text: "Найдвартай мэдээлэл",
  circle_left_text: "Зөв сонголт",
  top_image_url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop",
  bottom_image_url: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1000&auto=format&fit=crop",
  sort_order: 0,
};

export function HomePage({ programParents, programCategories, featuredSoftwares, featuredAdvisories, featuredArticles, publicStats, aboutSection }: Props) {
  const navigate = useNavigate();
  const [selectedArticleTypeId, setSelectedArticleTypeId] = useState<number | null>(null);
  const [softwareSearch, setSoftwareSearch] = useState("");
  const about = aboutSection || fallbackAboutSection;
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
          title: "Програмын төрлүүд",
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
              <div><div className="stat-number">{formatStatValue(publicStats.users)}</div><div className="stat-label">ХЭРЭГЛЭГЧ, БАЙГУУЛЛАГА</div></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><i className="fas fa-cube" aria-hidden="true"></i></div>
              <div><div className="stat-number">{formatStatValue(publicStats.softwares)}</div><div className="stat-label">ПРОГРАМ ХАНГАМЖ</div></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><i className="fas fa-headset" aria-hidden="true"></i></div>
              <div><div className="stat-number">{formatStatValue(publicStats.advisories)}</div><div className="stat-label">ЗӨВЛӨХ ҮЙЛЧИЛГЭЭ</div></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><i className="far fa-file-alt" aria-hidden="true"></i></div>
              <div><div className="stat-number">{formatStatValue(publicStats.articles)}</div><div className="stat-label">НИЙТЛЭЛ</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="services-header home-grid-header text-center">
            <div>
              <span className="services-kicker">Онцлох</span>
              <h2>Програм хангамжууд</h2>
            </div>
          </div>
          <form className="home-software-search" onSubmit={submitSoftwareSearch}>
            <span className="home-software-search-icon" aria-hidden="true">⌕</span>
            <input
              type="text"
              value={softwareSearch}
              onChange={(e) => setSoftwareSearch(e.target.value)}
              placeholder="Програм хангамж хайх..."
              className="home-software-search-input"
            />
            <button className="home-software-search-btn" type="submit">Хайх</button>
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
                  <RatingControl average={item.rating_average} count={item.rating_count} userRating={item.user_rating} compact />
                  <ul className="service-list">
                    <li title="Ангилал"><i className="fas fa-sitemap" aria-hidden="true"></i> {item.program_type}</li>
                    <li title="Хөгжүүлэгч"><i className="fas fa-building" aria-hidden="true"></i> {item.developer}</li>
                    <li title="Салбарууд"><i className="fas fa-tags" aria-hidden="true"></i> {item.advisory_sectors.length ? item.advisory_sectors.join(", ") : "-"}</li>
                  </ul>
                </div>
              ))
            ) : (
              <div className="service-card home-empty-card">
                <h5>{softwareSearch.trim() ? "Хайлтад тохирох програм олдсонгүй" : "Онцлох програм алга"}</h5>
                <ul className="service-list">
                  <li>{softwareSearch.trim() ? "Өөр түлхүүр үгээр хайж үзнэ үү." : "Одоогоор програм бүртгэгдээгүй байна."}</li>
                </ul>
              </div>
            )}
          </div>
          <div className="home-view-all-row">
            <a className="home-view-all" href="/softwares">Бүгдийг харах</a>
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="container">
          <div className="process-header text-center">
            <span className="process-kicker">Working Process</span>
            <h2>Our Work Process In 3 Easy Steps</h2>
          </div>

          <div className="process-steps">
            <div className="process-step">
              <div className="step-icon"><span className="step-badge">01</span>🧭</div>
              <h5>Choose Service</h5>
              <p>Төслийн зорилго, шаардлага дээрээ тулгуурлан зөв үйлчилгээ сонгоно.</p>
            </div>
            <div className="process-arrow">→</div>
            <div className="process-step">
              <div className="step-icon"><span className="step-badge">02</span>📝</div>
              <h5>Start Optimizing</h5>
              <p>Шийдлийн загвар, тохиргоо, хөгжүүлэлтийг үе шаттай эхлүүлнэ.</p>
            </div>
            <div className="process-arrow">→</div>
            <div className="process-step">
              <div className="step-icon"><span className="step-badge">03</span>🚀</div>
              <h5>Launch Now</h5>
              <p>Бэлэн болсон шийдлээ production орчинд аюулгүй нэвтрүүлнэ.</p>
            </div>
          </div>

          <div className="process-cta">
            <div className="cta-box">
              <span>Let&apos;s Request a Suitable Plan for You Consultation</span>
              <a href="#" className="cta-button">GET IN TOUCH</a>
            </div>
          </div>
        </div>
      </section>

      <section className="software-section">
        <div className="container">
          <h3 className="software-title text-center">ПРОГРАМ ХАНГАМЖИЙГ ТӨРЛӨӨР НЬ ХАЙХ</h3>
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
            <h3 className="advisory-title">ЗӨВЛӨХ ҮЙЛЧИЛГЭЭНҮҮД</h3>
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
                    <p>{stripRichText(item.introduction) || "Товч танилцуулга оруулаагүй."}</p>
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
                  <h5>Онцлох зөвлөх үйлчилгээ алга</h5>
                  <p>Одоогоор зөвлөх үйлчилгээ бүртгэгдээгүй байна.</p>
                </div>
              </article>
            )}
          </div>
          <div className="home-view-all-row">
            <a className="home-view-all" href="/advisories">Бүгдийг харах</a>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span className="why-kicker">{about.kicker || fallbackAboutSection.kicker}</span>
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
            <span className="blog-kicker">Newsroom</span>
            <h2>Мэдээ & Нийтлэл</h2>
          </div>
          {articleTypeOptions.length > 1 ? (
            <div className="blog-type-tabs" aria-label="Нийтлэлийн төрөл">
              <button
                type="button"
                className={selectedArticleTypeId === null ? "is-active" : ""}
                onClick={() => setSelectedArticleTypeId(null)}
              >
                Бүгд
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
                      <span>{item.organization}</span>
                      <span>{item.article_type}</span>
                    </div>
                    <h5>{item.title}</h5>
                    <p className="article-card-excerpt">{stripRichText(item.description) || "Нийтлэлийн товч тайлбар оруулаагүй."}</p>
                  </div>
                </a>
              </div>
            ))}
            {!featuredArticleList.length ? (
              <div className="col-12">
                <article className="blog-card blog-card-empty">
                  <div className="blog-body">
                    <h5>Онцлох нийтлэл алга</h5>
                    <p>Одоогоор is_featured=true нийтлэл бүртгэгдээгүй байна.</p>
                  </div>
                </article>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="home-slim-banner-section">
        <div className="container">
          <a className="home-slim-banner" href="/articles" aria-label="Нийтлэлүүдийг харах">
            <img src="/media/green.jpg" alt="Нийтлэлийн баннер" />
          </a>
        </div>
      </section>
    </>
  );
}
