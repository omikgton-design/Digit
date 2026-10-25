import { useEffect, useState } from "react";
import type { CustomerBanner } from "../types";

type Props = {
  banners: CustomerBanner[];
  intervalMs?: number;
};

export function BannerCarousel({ banners, intervalMs = 7000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (index >= banners.length) setIndex(0);
  }, [banners.length, index]);

  useEffect(() => {
    if (banners.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [banners.length, paused, intervalMs]);

  if (!banners.length) return null;

  return (
    <section className="home-banner-strip">
      <div className="container">
        <div
          className="home-banner-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {banners.map((banner, i) => {
            const image = <img src={banner.image_url} alt="Зар" draggable={false} />;
            const className = `home-banner-slide ${i === index ? "is-active" : ""}`;
            return banner.link_url ? (
              <a
                key={banner.id}
                className={className}
                href={banner.link_url}
                target="_blank"
                rel="noreferrer sponsored"
                tabIndex={i === index ? 0 : -1}
                aria-hidden={i !== index}
              >
                {image}
              </a>
            ) : (
              <div key={banner.id} className={className} aria-hidden={i !== index}>
                {image}
              </div>
            );
          })}

          {banners.length > 1 ? (
            <div className="home-banner-dots">
              {banners.map((banner, i) => (
                <button
                  key={banner.id}
                  type="button"
                  className={`home-banner-dot ${i === index ? "is-active" : ""}`}
                  aria-label={`Баннер ${i + 1}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
