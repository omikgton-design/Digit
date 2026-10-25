import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFooterContent } from "../api/website";
import type { FooterMenuContent } from "../types";
import { sanitizeRichText } from "../utils/richText";

export function FooterContentPage() {
  const { key } = useParams();
  const [item, setItem] = useState<FooterMenuContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!key) {
      setError("Мэдээлэл олдсонгүй.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    getFooterContent(key)
      .then((data) => setItem(data))
      .catch((err) => {
        setItem(null);
        setError((err as Error).message || "Мэдээлэл олдсонгүй.");
      })
      .finally(() => setLoading(false));
  }, [key]);

  if (loading) {
    return (
      <section className="footer-content-page">
        <div className="container">
          <div className="software-detail-empty">Мэдээлэл уншиж байна...</div>
        </div>
      </section>
    );
  }

  if (error || !item) {
    return (
      <section className="footer-content-page">
        <div className="container">
          <div className="software-detail-empty">{error || "Мэдээлэл олдсонгүй."}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="footer-content-page">
      <div className="container">
        <div className="software-detail-breadcrumb">
          <Link to="/">Digit</Link>
          <span>/</span>
          <span>{item.title}</span>
        </div>

        <div className="footer-content-layout">
          <article className="footer-content-card">
            {item.image_url ? (
              <div className="footer-content-image">
                <img src={item.image_url} alt={item.title} />
              </div>
            ) : null}
            <div className="footer-content-body">
              <h1>{item.title}</h1>
              <div
                className="software-detail-description-body"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(item.content || "<p>Мэдээлэл оруулаагүй байна.</p>"),
                }}
              ></div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
