import type { PartnerLogo } from "../../types";
import { Link } from "react-router-dom";

type Props = {
  partners: PartnerLogo[];
};

export function SiteFooter({ partners }: Props) {
  const marqueePartners = partners.length ? [...partners, ...partners] : [];
  return (
    <footer className="site-footer">
      <div className="featured-bar">
        <div className="container">
          <div className="featured-title">ХАМТРАН АЖИЛЛАДАГ БАЙГУУЛЛАГУУД</div>
          <div className="featured-logo-marquee" aria-label="Хамтран ажилладаг байгууллагууд">
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
            <div className="footer-logo">
              <img src="/logo_blank.png" alt="Digit logo" />
            </div>
            <p>Бизнесийн дижитал шийдлийг нэг дороос хайж олоход бид танд тусална.</p>
            <div className="footer-socials">
              <a href="https://www.facebook.com/www.digit.mn" target="_blank" rel="noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f" aria-hidden="true"></i>
              </a>
              <a href="https://www.linkedin.com/company/74726658/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h6>Хэрэглэгч</h6>
            <Link to="/footer/top_software">Топ программ хангамж</Link>
            <Link to="/footer/top_advisory">Топ зөвлөх үйлчилгээ</Link>
            <Link to="/footer/top_article">Топ нийтлэл</Link>
          </div>

          <div className="footer-links">
            <h6>Байгууллага</h6>
            <Link to="/footer/update_info">Мэдээлэл шинэчлэх</Link>
            <Link to="/footer/update_product">Бүтээгдэхүүн шинэчлэх</Link>
            <Link to="/footer/submit_article">Нийтлэл оруулах</Link>
          </div>

          <div className="footer-links">
            <h6>Манай компани</h6>
            <Link to="/footer/about">Бидний тухай</Link>
            <Link to="/footer/pricing">Үнийн санал</Link>
            <Link to="/footer/contact">Холбоо барих</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
