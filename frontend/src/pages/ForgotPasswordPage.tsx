import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "../api/auth";
import { useLanguage } from "../i18n/LanguageContext";
import { ArrowLeftIcon, ArrowRightIcon, MailIcon } from "../components/AuthIcons";

type Props = { onGoLogin: () => void };

export function ForgotPasswordPage({ onGoLogin }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    if (!email) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await requestPasswordReset(email);
      setResult({ kind: "ok", text: data.message });
    } catch (err) {
      setResult({ kind: "error", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <a className="auth-back" href="/login" onClick={(e) => { e.preventDefault(); onGoLogin(); }}>
          <ArrowLeftIcon /> {t("forgot_back")}
        </a>
        <h1 className="auth-title">{t("forgot_title")}</h1>
        <p className="auth-subtitle">{t("forgot_subtitle")}</p>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label htmlFor="forgot-email">{t("login_email_label")}</label>
            <div className="auth-input">
              <MailIcon className="auth-input-icon" />
              <input id="forgot-email" name="email" type="email" placeholder={t("login_email_placeholder")} autoComplete="email" required />
            </div>
          </div>
          {result ? <p className={`auth-notice ${result.kind}`} role="status">{result.text}</p> : null}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? t("login_loading") : <>{t("forgot_submit")} <ArrowRightIcon /></>}
          </button>
        </form>
      </div>
    </section>
  );
}
