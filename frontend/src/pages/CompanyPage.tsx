import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getFooterContent } from "../api/website";
import type { FooterMenuContent } from "../types";
import { sanitizeRichText } from "../utils/richText";
import { PricingPage } from "./PricingPage";

type Block = { loading: boolean; item: FooterMenuContent | null; error: string };

const SECTION_IDS = ["about", "pricing", "contact"];

function useFooterBlock(key: string): Block {
  const [block, setBlock] = useState<Block>({ loading: true, item: null, error: "" });
  useEffect(() => {
    let alive = true;
    setBlock({ loading: true, item: null, error: "" });
    getFooterContent(key)
      .then((item) => alive && setBlock({ loading: false, item, error: "" }))
      .catch((err) => alive && setBlock({ loading: false, item: null, error: (err as Error).message || "Мэдээлэл олдсонгүй." }));
    return () => {
      alive = false;
    };
  }, [key]);
  return block;
}

function ContentCard({ block, onImageLoad }: { block: Block; onImageLoad: () => void }) {
  if (block.loading) return <div className="software-detail-empty">Мэдээлэл уншиж байна...</div>;
  if (block.error || !block.item) return <div className="software-detail-empty">{block.error || "Мэдээлэл олдсонгүй."}</div>;
  const item = block.item;
  return (
    <article className="footer-content-card">
      {item.image_url ? (
        <div className="footer-content-image">
          <img src={item.image_url} alt={item.title} onLoad={onImageLoad} />
        </div>
      ) : null}
      <div className="footer-content-body">
        <h2>{item.title}</h2>
        <div
          className="software-detail-description-body"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.content || "<p>Мэдээлэл оруулаагүй байна.</p>") }}
        ></div>
      </div>
    </article>
  );
}

/**
 * Manai company: Бидний тухай → Үнийн санал → Холбоо барих гурвыг нэг хуудсанд дарааллаар нь харуулна.
 * /company#about, /company#pricing, /company#contact хаягаар тухайн хэсэг рүү шууд очно.
 */
export function CompanyPage() {
  const location = useLocation();
  const about = useFooterBlock("about");
  const contact = useFooterBlock("contact");
  const ready = !about.loading && !contact.loading;

  const interacted = useRef(false);
  const arrived = useRef(false);

  const scrollToHash = useCallback(
    (smooth: boolean) => {
      const id = location.hash.replace("#", "");
      if (!SECTION_IDS.includes(id)) {
        if (!smooth) window.scrollTo({ top: 0 });
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    },
    [location.hash]
  );

  // Хэрэглэгч өөрөө scroll хийсэн бол зураг ачаалагдахад байрлалыг нь хөдөлгөхгүй.
  useEffect(() => {
    const mark = () => {
      interacted.current = true;
    };
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchstart", mark, { passive: true });
    window.addEventListener("keydown", mark);
    return () => {
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchstart", mark);
      window.removeEventListener("keydown", mark);
    };
  }, []);

  // Footer/цэс дээр дарах бүрт (hash ижил байсан ч) тухайн хэсэг рүү очно.
  useEffect(() => {
    if (!ready) return;
    interacted.current = false;
    scrollToHash(arrived.current);
    arrived.current = true;
  }, [ready, location.key, location.hash, scrollToHash]);

  const handleImageLoad = useCallback(() => {
    if (!interacted.current) scrollToHash(false);
  }, [scrollToHash]);

  return (
    <div className="company-page">
      <section id="about" className="company-section company-section-light">
        <div className="container">
          <div className="footer-content-layout">
            <ContentCard block={about} onImageLoad={handleImageLoad} />
          </div>
        </div>
      </section>

      <div id="pricing" className="company-section company-section-pricing">
        <PricingPage />
      </div>

      <section id="contact" className="company-section company-section-light">
        <div className="container">
          <div className="footer-content-layout">
            <ContentCard block={contact} onImageLoad={handleImageLoad} />
          </div>
        </div>
      </section>
    </div>
  );
}
