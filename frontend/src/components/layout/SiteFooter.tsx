import type { FooterLinkItem, PartnerLogo, SiteContent } from "../../types";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import type { TranslationKey } from "../../i18n/translations";
import { APP_VERSION } from "../../version";

type Props = {
  partners: PartnerLogo[];
  siteContent?: SiteContent | null;
};

type FooterColumn = "user" | "org" | "company";

// Админаас холбоос оруулаагүй үед харагдах өгөгдмөл холбоосууд.
const fallbackLinks: Record<FooterColumn, { key: TranslationKey; url: string }[]> = {
  user: [
    { key: "footer_top_software", url: "/footer/top_software" },
    { key: "footer_top_advisory", url: "/footer/top_advisory" },
    { key: "footer_top_article", url: "/footer/top_article" },
  ],
  org: [
    { key: "footer_update_info", url: "/footer/update_info" },
    { key: "footer_update_product", url: "/footer/update_product" },
    { key: "footer_submit_article", url: "/footer/submit_article" },
  ],
  company: [
    { key: "footer_about", url: "/company#about" },
    { key: "footer_pricing", url: "/company#pricing" },
    { key: "footer_contact", url: "/company#contact" },
  ],
};

function FooterLinkAnchor({ link }: { link: FooterLinkItem }) {
  if (/^(https?:|mailto:|tel:)/i.test(link.url)) {
    const external = /^https?:/i.test(link.url);
    return (
      <a href={link.url} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {link.label}
      </a>
    );
  }
  return <Link to={link.url}>{link.label}</Link>;
}

export function SiteFooter({ partners, siteContent }: Props) {
  const { t } = useLanguage();
  const linksFor = (column: FooterColumn): FooterLinkItem[] => {
    const fromAdmin = siteContent?.footer_links?.[column];
    if (siteContent && fromAdmin) return fromAdmin;
    return fallbackLinks[column].map((item, index) => ({ id: -(index + 1), label: t(item.key), url: item.url }));
  };
  const footerLogo = siteContent?.settings.footer_logo_url || "/logo_blank.png";
  const footerText = siteContent?.settings.footer_text || t("footer_brand_text");
  const marqueePartners = partners.length ? [...partners, ...partners] : [];
  return (
    <footer className="site-footer">
      <div className="featured-bar">
        <div className="container">
          <div className="featured-title">{t("footer_partners_title")}</div>
          <div className="featured-logo-marquee" aria-label={t("footer_partners_title")}>
            <div className="featured-logos">
              {marqueePartners.map((partner, index) => (
                <div className="featured-logo" key={`${partner.id}-${index}`}>
                  {partner.link_url ? (
                    <a href={partner.link_url} target="_blank" rel="noreferrer" aria-label={partner.name}>
                      <img src={partner.logo_url} alt={partner.name} />
                    </a>
                  ) : (
                    <img src={partner.logo_url} alt={partner.name} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className={`footer-logo ${siteContent?.settings.footer_logo_url ? "is-custom" : ""}`}>
              <img src={footerLogo} alt="Digit logo" />
            </div>
            <p>{footerText}</p>
            <div className="footer-socials">
              <a href="https://www.facebook.com/www.digit.mn" target="_blank" rel="noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f" aria-hidden="true"></i>
              </a>
              <a href="https://www.linkedin.com/company/74726658/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          {([
            ["user", "footer_col_user_title"],
            ["org", "footer_col_org_title"],
            ["company", "footer_col_company_title"],
          ] as [FooterColumn, TranslationKey][]).map(([column, titleKey]) => {
            const links = linksFor(column);
            if (!links.length) return null;
            return (
              <div className="footer-links" key={column}>
                <h6>{t(titleKey)}</h6>
                {links.map((link) => (
                  <FooterLinkAnchor key={link.id} link={link} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="footer-version-bar">
        <div className="container">
          <span className="footer-version" title="Вэбийн хувилбар">v{APP_VERSION}</span>
        </div>
      </div>
    </footer>
  );
}
