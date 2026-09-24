import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSoftwareDetail, rateSoftware } from "../api/website";
import type { SoftwareDetail } from "../types";
import { RatingControl } from "../components/RatingControl";
import { sanitizeRichText, stripRichText } from "../utils/richText";

export function SoftwareDetailPage() {
  const { softwareId } = useParams();
  const [item, setItem] = useState<SoftwareDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSaving, setRatingSaving] = useState(false);

  useEffect(() => {
    const id = Number(softwareId);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Програм олдсонгүй.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    getSoftwareDetail(id)
      .then((data) => {
        setItem(data);
        setActiveImageIndex(0);
      })
      .catch((err) => {
        setItem(null);
        setError((err as Error).message || "Програм олдсонгүй.");
      })
      .finally(() => setLoading(false));
  }, [softwareId]);

  const images = item?.images.length ? item.images : item?.thumbnail_url ? [item.thumbnail_url] : [];
  const activeImage = images[activeImageIndex] || "";
  const formattedPrice = new Intl.NumberFormat("mn-MN").format(Number(item?.price || 0));
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = item ? `${item.name} - Digit` : "Digit";
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const xShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`;
  const specRows = item
    ? [
        { label: "Төрөл", value: item.program_type.name },
        { label: "Салбар", value: item.advisory_sectors.length ? item.advisory_sectors.map((sector) => sector.name).join(", ") : "-" },
        { label: "Эхэлсэн он", value: String(item.development_start_year) },
      ]
    : [];

  const showPrevImage = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNextImage = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const copyPageUrl = async () => {
    if (!pageUrl) return;
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (activeImageIndex >= images.length && images.length > 0) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (images.length > 1 && event.key === "ArrowLeft") showPrevImage();
      if (images.length > 1 && event.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, lightboxOpen]);

  if (loading) {
    return (
      <section className="software-detail-page">
        <div className="container">
          <div className="software-detail-empty">Мэдээлэл уншиж байна...</div>
        </div>
      </section>
    );
  }

  if (error || !item) {
    return (
      <section className="software-detail-page">
        <div className="container">
          <div className="software-detail-empty">{error || "Програм олдсонгүй."}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="software-detail-page">
      <div className="container">
        <div className="software-detail-breadcrumb">
          <Link to="/softwares">Програм хангамж</Link>
          <span>/</span>
          <span>{item.name}</span>
        </div>

        <div className="software-detail-layout">
          <div className="software-detail-main">
            {images.length ? (
              <div className="software-detail-slider">
                <button
                  type="button"
                  className="software-detail-image software-detail-image-button"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img src={activeImage} alt={item.name} />
                </button>
                {images.length > 1 ? (
                  <>
                    <button type="button" className="software-detail-prev" onClick={showPrevImage} aria-label="Previous image"></button>
                    <button type="button" className="software-detail-next" onClick={showNextImage} aria-label="Next image"></button>
                    <div className="software-detail-pagination">
                      {images.map((_, index) => (
                        <button
                          type="button"
                          key={`dot-${index}`}
                          className={`software-detail-dot ${index === activeImageIndex ? "is-active" : ""}`}
                          onClick={() => setActiveImageIndex(index)}
                          aria-label={`Go to image ${index + 1}`}
                        ></button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}

            <div className="software-detail-gallery">
              {images.length ? (
                images.map((image, index) => (
                  <button
                    type="button"
                    className={`software-detail-thumb ${index === activeImageIndex ? "is-active" : ""}`}
                    key={`thumb-${image}-${index}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={image} alt={`${item.name} thumbnail ${index + 1}`} />
                  </button>
                ))
              ) : (
                <div className="software-detail-image software-detail-no-image">Зураг алга</div>
              )}
            </div>

            {item.description ? (
              <section className="software-detail-description-panel">
                <h3>Дэлгэрэнгүй тайлбар</h3>
                <div className="software-detail-description-body" dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.description) }}></div>
              </section>
            ) : null}
          </div>

          <aside className="software-detail-sidebar">
            <div className="software-detail-card">
              <h2 className="software-detail-product-title">{item.name}</h2>

              <RatingControl
                average={item.rating_average}
                count={item.rating_count}
                userRating={item.user_rating}
                onRate={async (score) => {
                 const next = await rateSoftware(item.id, score, ratingComment);
                  setItem((current) => current ? { ...current, ...next } : current);
                  return next;
                }}
              />
              <div className="software-rating-comment">
  <label htmlFor="software-rating-comment">
    Сэтгэгдэл
  </label>

  <textarea
    id="software-rating-comment"
    value={ratingComment}
    onChange={(event) => setRatingComment(event.target.value)}
    placeholder="Сэтгэгдлээ бичнэ үү..."
    rows={4}
  />
</div>

<button
  type="button"
  className="software-rating-save"
  disabled={ratingSaving || !item.user_rating}
  onClick={async () => {
    if (!item.user_rating) return;

    setRatingSaving(true);

    try {
      const next = await rateSoftware(
        item.id,
        item.user_rating,
        ratingComment
      );

      setItem((current) =>
        current ? { ...current, ...next } : current
      );
    } finally {
      setRatingSaving(false);
    }
  }}
>
  {ratingSaving ? "Хадгалж байна..." : "Сэтгэгдэл хадгалах"}
</button>

              <div className="software-detail-brand">
                <div className="software-detail-brand-logo">{item.developer.name.slice(0, 1)}</div>
                <div className="software-detail-brand-name">{item.developer.name}</div>
              </div>

              <div className="software-detail-offer">
                <div className="software-detail-offer-badge">
                  <span className="software-detail-offer-label">Үнийн төрөл:</span>{" "}
                  <span className="software-detail-offer-value">{item.price_type === "rent" ? "Түрээс" : "Худалдаа"}</span>
                </div>
                <div className="software-detail-offer-price">{formattedPrice}₮</div>
              </div>

              <div className="software-detail-divider"></div>

              <div className="software-detail-meta-block">
                <h3>Барааны мэдээлэл</h3>
                <div className="software-detail-specs">
                  {specRows.map((row) => (
                    <div className="software-detail-spec-row" key={row.label}>
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {item.introduction ? (
                <>
                  <div className="software-detail-divider"></div>
                  <div className="software-detail-meta-block">
                    <h3>Танилцуулга</h3>
                    <div className="software-detail-description-list" dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.introduction) }}></div>
                  </div>
                </>
              ) : null}

              <div className="software-detail-divider"></div>

              <div className="software-detail-meta-block">
                <h3>Бусдад түгээх</h3>
                <div className="software-detail-share">
                  <a href={facebookShareUrl} target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
                  <a href={xShareUrl} target="_blank" rel="noreferrer" aria-label="X">x</a>
                  <button type="button" onClick={copyPageUrl} aria-label="Copy link">{copied ? "✓" : "◎"}</button>
                </div>
              </div>

              {item.is_featured ? <div className="software-detail-badge">Онцлох</div> : null}
            </div>
          </aside>
        </div>

        {item.related?.length ? (
          <section className="related-detail-section">
            <div className="related-detail-header">
              <h3>Төстэй програмууд</h3>
              <Link to={`/softwares?program_type=${item.program_type.id}`}>Бүгдийг харах</Link>
            </div>
            <div className="related-detail-grid">
              {item.related.map((software) => (
                <Link className="catalog-card-link" to={`/softwares/${software.id}`} key={software.id}>
                  <article className="catalog-card related-detail-card">
                    <div className="catalog-card-media">
                      {software.thumbnail_url ? <img src={software.thumbnail_url} alt={software.name} /> : <div className="catalog-no-image">Зураг алга</div>}
                    </div>
                    <div className="catalog-card-body">
                      <h5>{software.name}</h5>
                      <p><strong>Төрөл:</strong> {software.program_type.name}</p>
                      <p><strong>Байгууллага:</strong> {software.developer.name}</p>
                      <p className="catalog-intro">{stripRichText(software.introduction)}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {lightboxOpen && activeImage ? (
          <div className="software-lightbox" role="dialog" aria-modal="true" aria-label={item.name}>
            <button type="button" className="software-lightbox-backdrop" onClick={() => setLightboxOpen(false)}></button>
            <div className={`software-lightbox-panel ${images.length === 1 ? "is-single" : ""}`}>
              <button type="button" className="software-lightbox-close" onClick={() => setLightboxOpen(false)}>
                ×
              </button>
              {images.length > 1 ? (
                <button type="button" className="software-lightbox-nav software-lightbox-prev" onClick={showPrevImage}>
                  ‹
                </button>
              ) : null}
              <div className="software-lightbox-image-wrap">
                <img className="software-lightbox-image" src={activeImage} alt={item.name} />
                {images.length > 1 ? (
                  <div className="software-lightbox-counter">{activeImageIndex + 1} / {images.length}</div>
                ) : null}
              </div>
              {images.length > 1 ? (
                <button type="button" className="software-lightbox-nav software-lightbox-next" onClick={showNextImage}>
                  ›
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
