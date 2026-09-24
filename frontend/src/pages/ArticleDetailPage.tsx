import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArticleDetail, saveArticle } from "../api/website";
import type { ArticleDetail } from "../types";
import { safeText, sanitizeRichText, stripRichText } from "../utils/richText";

function formatPublishedDate(value: unknown) {
  const text = safeText(value);
  if (!text) return "Огноо оруулаагүй";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export function ArticleDetailPage() {
  const { articleId } = useParams();
  const [item, setItem] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = Number(articleId);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Нийтлэл олдсонгүй.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    getArticleDetail(id)
      .then((data) => setItem(data))
      .catch((err) => {
        setItem(null);
        setError((err as Error).message || "Нийтлэл олдсонгүй.");
      })
      .finally(() => setLoading(false));
  }, [articleId]);

  if (loading) {
    return (
      <section className="software-detail-page article-detail-page">
        <div className="container">
          <div className="software-detail-empty">Мэдээлэл уншиж байна...</div>
        </div>
      </section>
    );
  }

  if (error || !item) {
    return (
      <section className="software-detail-page article-detail-page">
        <div className="container">
          <div className="software-detail-empty">{error || "Нийтлэл олдсонгүй."}</div>
        </div>
      </section>
    );
  }

  const title = safeText(item.title, "Нийтлэл");
  const heroImage = safeText(item.image_url) || safeText(item.thumbnail_url);
  const organizationName = safeText(item.organization?.name, "Байгууллага");
  const articleTypeName = safeText(item.article_type?.name, "Төрөл сонгоогүй");
  const relatedArticles = Array.isArray(item.related)
    ? item.related.filter((article) => article && typeof article === "object")
    : [];

  return (
    <section className="software-detail-page article-detail-page">
      <div className="container">
        <div className="software-detail-breadcrumb">
          <Link to="/articles">Нийтлэл</Link>
          <span>/</span>
          <span>{title}</span>
        </div>

        <div className="software-detail-layout">
          <div className="software-detail-main">
            {heroImage ? (
              <div className="article-hero-image">
                <div className="software-detail-image">
                  <img src={heroImage} alt={title} />
                </div>
              </div>
            ) : null}

            <section className="software-detail-description-panel">
              <h3>Дэлгэрэнгүй мэдээлэл</h3>
              <div
                className="software-detail-description-body article-detail-content"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(item.description || "<p>Нийтлэлийн дэлгэрэнгүй мэдээлэл оруулаагүй.</p>"),
                }}
              ></div>
            </section>
          </div>

          <aside className="software-detail-sidebar">
            <div className="software-detail-card">
              <h2 className="software-detail-product-title">{title}</h2>
              <button type="button" className="login-submit" style={{width:"auto", marginBottom:16}} onClick={async()=>{try{await saveArticle(item.id);window.alert("Хадгаллаа.");}catch(e){window.alert((e as Error).message || "Хадгалахад алдаа гарлаа.");}}}>Хадгалах</button>

              <div className="software-detail-brand">
                <div className="software-detail-brand-logo">{organizationName.slice(0, 1)}</div>
                <div>
                  <div className="software-detail-brand-name">{organizationName}</div>
                  <div className="advisory-detail-company-label">Оруулсан байгууллага</div>
                </div>
              </div>

              <div className="software-detail-divider"></div>

              <div className="software-detail-meta-block">
                <h3>Нийтлэлийн мэдээлэл</h3>
                <div className="software-detail-specs">
                  <div className="software-detail-spec-row">
                    <span>Нийтлэлийн төрөл</span>
                    <strong>{articleTypeName}</strong>
                  </div>
                  <div className="software-detail-spec-row">
                    <span>Огноо</span>
                    <strong>{formatPublishedDate(item.published_date)}</strong>
                  </div>
                </div>
              </div>

              {item.is_featured ? <div className="software-detail-badge">Онцлох нийтлэл</div> : null}
            </div>
          </aside>
        </div>

        {relatedArticles.length ? (
          <section className="related-detail-section">
            <div className="related-detail-header">
              <h3>Төстэй нийтлэлүүд</h3>
              <Link to={item.article_type?.id ? `/articles?article_type=${item.article_type.id}` : "/articles"}>Бүгдийг харах</Link>
            </div>
            <div className="related-detail-grid">
              {relatedArticles.map((article) => {
                const relatedTitle = safeText(article.title, "Нийтлэл");
                return (
                <Link className="catalog-card-link" to={`/articles/${article.id}`} key={article.id}>
                  <article className="catalog-card related-detail-card">
                    <div className="catalog-card-media">
                      {article.thumbnail_url ? <img src={safeText(article.thumbnail_url)} alt={relatedTitle} /> : <div className="catalog-no-image">Зураг алга</div>}
                    </div>
                    <div className="catalog-card-body">
                      <h5>{relatedTitle}</h5>
                      <p><strong>Төрөл:</strong> {safeText(article.article_type?.name, "Төрөл сонгоогүй")}</p>
                      <p><strong>Байгууллага:</strong> {safeText(article.organization?.name, "Байгууллага")}</p>
                      <p className="catalog-intro">{stripRichText(article.description)}</p>
                    </div>
                  </article>
                </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
