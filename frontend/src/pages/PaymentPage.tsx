import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { requestMembership } from "../api/website";
import type { AuthResponse, MembershipType } from "../types";
import { useToast } from "../components/ToastProvider";

type Props = {
  auth: AuthResponse | null;
};

const planInfo: Record<MembershipType, { name: string; price: number; priceLabel: string }> = {
  bronze: { name: "Энгийн", price: 0, priceLabel: "Үнэгүй" },
  silver: { name: "Silver", price: 99000, priceLabel: "99,000₮ / сар" },
  gold: { name: "Gold", price: 499000, priceLabel: "499,000₮ / сар" },
};

const paymentMethods = [
  { id: "qpay", label: "QPay", hint: "Банкны апп-аар уншуулж төлнө" },
  { id: "card", label: "Карт", hint: "Visa / Mastercard" },
] as const;

export function PaymentPage({ auth }: Props) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const planParam = (params.get("plan") || "silver") as MembershipType;
  const plan = planInfo[planParam] ? planParam : "silver";
  const info = planInfo[plan];
  const isFree = info.price === 0;

  const [method, setMethod] = useState<"qpay" | "card">("qpay");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const total = info.price;

  const submit = async () => {
    if (!auth) {
      showToast("Төлбөр төлөхийн тулд эхлээд нэвтэрнэ үү.", "error");
      navigate("/login");
      return;
    }
    setSubmitting(true);
    try {
      await requestMembership(plan);
      setDone(true);
      showToast(
        isFree
          ? "Багц идэвхжих хүсэлт илгээгдлээ."
          : "Төлбөрийн хүсэлт амжилттай илгээгдлээ. Манай баг таны төлбөрийг баталгаажуулаад, багцыг идэвхжүүлнэ."
      );
    } catch (err) {
      showToast((err as Error).message || "Хүсэлт илгээхэд алдаа гарлаа.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="payment-page">
        <div className="container payment-shell">
          <div className="payment-done-card">
            <div className="payment-done-icon">✓</div>
            <h2>Хүсэлт хүлээж авлаа!</h2>
            <p>
              {isFree
                ? "Таны Энгийн багц идэвхжлээ. Одоо шинэ боломжуудыг ашиглаж эхэлж болно."
                : `Таны ${info.name} багцын төлбөрийн хүсэлтийг бид хүлээн авлаа. Төлбөр баталгаажсаны дараа багц идэвхжинэ, энэ талаар имэйлээр мэдэгдэнэ.`}
            </p>
            <div className="payment-done-actions">
              <button type="button" className="btn-primary" onClick={() => navigate("/profile")}>
                Миний бүртгэл рүү очих
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate("/pricing")}>
                Багцын жагсаалт руу буцах
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="payment-page">
      <div className="container payment-shell">
        <div className="payment-main">
          <h1>Төлбөр төлөх</h1>
          <p className="payment-subtitle">Та "{info.name}" багцыг сонгосон байна.</p>

          {!isFree ? (
            <div className="payment-methods">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`payment-method-card ${method === m.id ? "is-active" : ""}`}
                  onClick={() => setMethod(m.id)}
                >
                  <span className="payment-method-radio" aria-hidden="true" />
                  <span className="payment-method-text">
                    <strong>{m.label}</strong>
                    <span>{m.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {!isFree && method === "qpay" ? (
            <div className="payment-qpay-box">
              <div className="payment-qpay-qr" aria-hidden="true">QR</div>
              <p>QPay апп-аараа QR кодыг уншуулан төлбөрөө гүйцэтгэнэ үү. Төлсний дараа доорх товчийг дарж хүсэлтээ баталгаажуулна уу.</p>
            </div>
          ) : null}

          {!isFree && method === "card" ? (
            <div className="payment-card-form">
              <div className="form-group">
                <label>Картан дээрх нэр</label>
                <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="D. BATBAYAR" />
              </div>
              <div className="form-group">
                <label>Картын дугаар</label>
                <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" maxLength={19} />
              </div>
              <div className="payment-card-row">
                <div className="form-group">
                  <label>Дуусах хугацаа</label>
                  <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="form-group">
                  <label>CVC</label>
                  <input type="text" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} placeholder="123" maxLength={3} />
                </div>
              </div>
            </div>
          ) : null}

          {isFree ? (
            <p className="payment-free-note">Энэ багц үнэгүй тул төлбөр шаардахгүй. Идэвхжүүлэхийн тулд доорх товчийг дарна уу.</p>
          ) : null}

          <button type="button" className="payment-submit-btn" disabled={submitting} onClick={submit}>
            {submitting ? "Илгээж байна..." : isFree ? "Идэвхжүүлэх" : `${total.toLocaleString("mn-MN")}₮ төлөх`}
          </button>

          {!auth ? (
            <p className="payment-login-hint">Та эхлээд бүртгэлдээ нэвтэрсэн байх шаардлагатай.</p>
          ) : null}
        </div>

        <aside className="payment-summary">
          <h3>Захиалгын дэлгэрэнгүй</h3>
          <div className="payment-summary-row">
            <span>Багц</span>
            <strong>{info.name}</strong>
          </div>
          <div className="payment-summary-row">
            <span>Үнэ</span>
            <strong>{info.price.toLocaleString("mn-MN")}₮</strong>
          </div>
          <div className="payment-summary-divider" />
          <div className="payment-summary-row payment-summary-total">
            <span>Нийт дүн</span>
            <strong>{total.toLocaleString("mn-MN")}₮</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
