import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdvisoryDetail, rateAdvisory } from "../api/website";
import type { AdvisoryDetail } from "../types";
import { AdvisoryLikeButton } from "../components/AdvisoryLikeButton";
import { RatingControl } from "../components/RatingControl";
import { sanitizeRichText, stripRichText } from "../utils/richText";

export function AdvisoryDetailPage() {
  const { advisoryId } = useParams();
  const [item, setItem] = useState<AdvisoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const id = Number(advisoryId);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Зөвлөх үйлчилгээ олдсонгүй.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    getAdvisoryDetail(id)
      .then((data) => {
        setItem(data);
        setActiveImageIndex(0);
        setLikedCount(data.like_count);
        setLiked(data.liked);
      })
      .catch((err) => {
        setItem(null);
        setError((err as Error).message || "Зөвлөх үйлчилгээ олдсонгүй.");
      })
      .finally(() => setLoading(false));
  }, [advisoryId]);

  const images = item?.images.length ? item.images : item?.thumbnail_url ? [item.thumbnail_url] : [];
  const activeImage = images[activeImageIndex] || "";
  const formattedPrice = new Intl.NumberFormat("mn-MN").format(Number(item?.price || 0));

  const showPrevImage = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNextImage = () => {
    if (!images.length) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (activeImageIndex >= images.length && images.length > 0) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, images.length]);

  if (loading) {
    return (
      <section className="software-detail-page advisory-detail-page">
        <div className="container">
          <div className="software-detail-empty">Мэдээлэл уншиж байна...</div>
        </div>
      </section>
    );
  }

  if (error || !item) {
    return (
      <section className="software-detail-page advisory-detail-page">
        <div className="container">
          <div className="software-detail-empty">{error || "Зөвлөх үйлчилгээ олдсонгүй."}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="software-detail-page advisory-detail-page">
      <div className="container">
        <div className="software-detail-breadcrumb">
          <Link to="/advisories">Зөвлөх үйлчилгээ</Link>
          <span>/</span>
          <span>{item.title}</span>
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
                  <img src={activeImage} alt={item.title} />
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
                    <img src={image} alt={`${item.title} thumbnail ${index + 1}`} />
                  </button>
                ))
              ) : (
                <div className="software-detail-image software-detail-no-image">Зураг алга</div>
              )}
            </div>

            {item.description ? (
              <section className="software-detail-description-panel">
                <h3>Дэлгэрэнгүй мэдээлэл</h3>
                <div className="software-detail-description-body" dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.description) }}></div>
              </section>
            ) : null}
          </div>

          <aside className="software-detail-sidebar">
            <div className="software-detail-card">
              <div className="advisory-detail-topline">
                <span className="advisory-card-tag">{item.service_type}</span>
                <AdvisoryLikeButton
                  advisoryId={item.id}
                  className="advisory-like-button-large"
                  initialLiked={liked}
                  initialCount={likedCount}
                  showCount
                  onToggle={(next) => {
                    setLiked(next.liked);
                    setLikedCount(next.like_count);
                  }}
                />
              </div>

              <h2 className="software-detail-product-title">{item.title}</h2>

              <RatingControl
                average={item.rating_average}
                count={item.rating_count}
                userRating={item.user_rating}
                onRate={async (score) => {
                  const next = await rateAdvisory(item.id, score);
                  setItem((current) => current ? { ...current, ...next } : current);
                  return next;
                }}
              />

              <div className="software-detail-brand">
                <div className="software-detail-brand-logo">{item.company.name.slice(0, 1)}</div>
                <div>
                  <div className="software-detail-brand-name">{item.company.name}</div>
                  <div className="advisory-detail-company-label">Оруулсан компани</div>
                </div>
              </div>

              <div className="software-detail-divider"></div>

              <div className="software-detail-meta-block">
                <h3>Үйлчилгээний мэдээлэл</h3>
                <div className="software-detail-specs">
                  <div className="software-detail-spec-row">
                    <span>Төрөл</span>
                    <strong>{item.service_type}</strong>
                  </div>
                  <div className="software-detail-spec-row">
                    <span>Ашигладаг салбар</span>
                    <strong>{item.advisory_sectors.length ? item.advisory_sectors.map((sector) => sector.name).join(", ") : "-"}</strong>
                  </div>
                  <div className="software-detail-spec-row">
                    <span>Эхэлсэн он</span>
                    <strong>{item.service_start_year}</strong>
                  </div>
                  <div className="software-detail-spec-row">
                    <span>Үнийн нөхцөл</span>
                    <strong>{item.price_terms}</strong>
                  </div>
                  <div className="software-detail-spec-row">
                    <span>Үнэ</span>
                    <strong>{formattedPrice}₮</strong>
                  </div>
                </div>
              </div>

              {item.introduction ? (
                <>
                  <div className="software-detail-divider"></div>
                  <div className="software-detail-meta-block">
                    <h3>Зөвлөх үйлчилгээний тухай мэдээлэл</h3>
                    <div className="software-detail-description-list" dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.introduction) }}></div>
                  </div>
                </>
              ) : null}

              {item.client_organizations ? (
                <>
                  <div className="software-detail-divider"></div>
                  <div className="software-detail-meta-block">
                    <h3>Зөвлөх үйлчилгээ авсан байгууллагууд</h3>
                    <div className="software-detail-description-list" dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.client_organizations) }}></div>
                  </div>
                </>
              ) : null}

              {item.is_featured ? <div className="software-detail-badge">Онцлох үйлчилгээ</div> : null}
            </div>
          </aside>
        </div>

        {item.related?.length ? (
          <section className="related-detail-section">
            <div className="related-detail-header">
              <h3>Төстэй зөвлөх үйлчилгээнүүд</h3>
              <Link to={`/advisories?service_type=${encodeURIComponent(item.service_type_value)}`}>Бүгдийг харах</Link>
            </div>
            <div className="related-detail-grid">
              {item.related.map((advisory) => (
                <Link className="catalog-card-link" to={`/advisories/${advisory.id}`} key={advisory.id}>
                  <article className="catalog-card related-detail-card">
                    <div className="catalog-card-media">
                      {advisory.thumbnail_url ? <img src={advisory.thumbnail_url} alt={advisory.title} /> : <div className="catalog-no-image">Зураг алга</div>}
                    </div>
                    <div className="catalog-card-body">
                      <h5>{advisory.title}</h5>
                      <p><strong>Төрөл:</strong> {advisory.service_type}</p>
                      <p><strong>Компани:</strong> {advisory.company.name}</p>
                      <p className="catalog-intro">{stripRichText(advisory.introduction)}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {lightboxOpen && activeImage ? (
          <div className="software-lightbox" role="dialog" aria-modal="true" aria-label={item.title}>
            <button type="button" className="software-lightbox-backdrop" onClick={() => setLightboxOpen(false)}></button>
            <div className={`software-lightbox-panel ${images.length === 1 ? "is-single" : ""}`}>
              <button type="button" className="software-lightbox-close" onClick={() => setLightboxOpen(false)}>
                x
              </button>
              {images.length > 1 ? (
                <button type="button" className="software-lightbox-nav software-lightbox-prev" onClick={showPrevImage}>
                  {"<"}
                </button>
              ) : null}
              <div className="software-lightbox-image-wrap">
                <img className="software-lightbox-image" src={activeImage} alt={item.title} />
                {images.length > 1 ? (
                  <div className="software-lightbox-counter">{activeImageIndex + 1} / {images.length}</div>
                ) : null}
              </div>
              {images.length > 1 ? (
                <button type="button" className="software-lightbox-nav software-lightbox-next" onClick={showNextImage}>
                  {">"}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
