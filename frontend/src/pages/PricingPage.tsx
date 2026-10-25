import { useNavigate } from "react-router-dom";
import type { MembershipType } from "../types";

type Tier = {
  id: MembershipType;
  icon: string;
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
};

const tiers: Tier[] = [
  {
    id: "bronze",
    icon: "🎭",
    name: "Энгийн",
    price: "Үнэгүй",
    priceNote: "Эхлэн туршиж үзэхэд",
    features: ["1 програм хангамж", "1 зөвлөх үйлчилгээ", "1 нийтлэл"],
  },
  {
    id: "silver",
    icon: "🥈",
    name: "Silver",
    price: "99,000₮",
    priceNote: "Сарын хураамж",
    features: ["Програм хангамж (анхдагч 3)", "Зөвлөх үйлчилгээ (анхдагч 3)", "Нийтлэл (анхдагч 3)", "Оруулах тоог админ тохируулна"],
  },
  {
    id: "gold",
    icon: "👑",
    name: "Gold",
    price: "499,000₮",
    priceNote: "Сарын хураамж",
    features: [
      "Програм хангамж хязгааргүй",
      "Нийтлэл хязгааргүй",
      "Зөвлөх үйлчилгээ хязгааргүй",
      "Оруулах тоог админ тохируулж болно",
      "2 баннер байршуулах",
    ],
    highlighted: true,
    badge: "Санал болгож буй",
  },
];

export function PricingPage() {
  const navigate = useNavigate();

  return (
    <section className="pricing-page">
      <div className="container">
        <div className="pricing-header">
          <h1>
            Багцын <span className="pricing-header-accent">төрлүүд</span>
          </h1>
          <p>Хэрэгцээндээ тохирсон багцаа сонгоорой</p>
        </div>

        <div className="pricing-grid">
          {tiers.map((tier) => (
            <div key={tier.id} className={`pricing-card ${tier.highlighted ? "pricing-card-highlighted" : ""}`}>
              {tier.badge ? <div className="pricing-card-badge">{tier.badge}</div> : null}
              <div className="pricing-card-icon">{tier.icon}</div>
              <h3 className="pricing-card-name">{tier.name}</h3>
              <div className="pricing-card-price">{tier.price}</div>
              <div className="pricing-card-note">{tier.priceNote}</div>
              <ul className="pricing-card-features">
                {tier.features.map((feature) => {
                  const parts = feature.split(/(хязгааргүй)/i);
                  return (
                    <li key={feature}>
                      <span className="pricing-check" aria-hidden="true">✓</span>
                      <span>
                        {parts.map((part, i) =>
                          part.toLowerCase() === "хязгааргүй" ? (
                            <span className="pricing-feature-accent" key={i}>{part}</span>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className={`pricing-card-btn ${tier.highlighted ? "pricing-card-btn-dark" : ""}`}
                onClick={() => navigate(`/payment?plan=${tier.id}`)}
              >
                {tier.id === "bronze" ? "Үнэгүй эхлэх" : "Сонгох"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
