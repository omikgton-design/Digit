import { useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { confirmPasswordReset } from "../api/auth";
import { useLanguage } from "../i18n/LanguageContext";
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon } from "../components/AuthIcons";

type Props = { onGoLogin: () => void };

export function ResetPasswordPage({ onGoLogin }: Props) {
  const { t } = useLanguage();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Backend-ийн нууц үгийн бодлоготой ижил.
  const passwordOk =
    password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const confirm = String(new FormData(event.currentTarget).get("password_confirm") || "");
    if (password !== confirm) {
      setResult({ kind: "error", text: t("reset_mismatch") });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await confirmPasswordReset(uid, token, password);
      setResult({ kind: "ok", text: data.message });
      setDone(true);
    } catch (err) {
      setResult({ kind: "error", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const invalid = !uid || !token;

  return (
    <section className="auth-page">
      <div className="auth-card">
        <a className="auth-back" href="/login" onClick={(e) => { e.preventDefault(); onGoLogin(); }}>
          <ArrowLeftIcon /> {t("forgot_back")}
        </a>
        <h1 className="auth-title">{t("reset_title")}</h1>
        <p className="auth-subtitle">{t("reset_subtitle")}</p>

        {invalid ? (
          <>
            <p className="auth-notice error" role="alert">{t("reset_invalid_link")}</p>
            <a className="auth-submit auth-submit-link" href="/forgot-password">{t("reset_request_new")} <ArrowRightIcon /></a>
          </>
        ) : done ? (
          <>
            {result ? <p className="auth-notice ok" role="status">{result.text}</p> : null}
            <button type="button" className="auth-submit" onClick={onGoLogin}>{t("login_submit")} <ArrowRightIcon /></button>
          </>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <label htmlFor="reset-password">{t("reset_password_label")}</label>
              <div className="auth-input">
                <LockIcon className="auth-input-icon" />
                <input id="reset-password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("signup_password_placeholder")} autoComplete="new-password" required />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t("auth_hide_password") : t("auth_show_password")}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className={`auth-hint ${password && !passwordOk ? "invalid" : ""}`}>{t("signup_password_hint")}</p>
            </div>
            <div className="auth-field">
              <label htmlFor="reset-password-confirm">{t("reset_confirm_label")}</label>
              <div className="auth-input">
                <LockIcon className="auth-input-icon" />
                <input id="reset-password-confirm" name="password_confirm" type={showPassword ? "text" : "password"} placeholder={t("reset_confirm_placeholder")} autoComplete="new-password" required />
              </div>
            </div>
            {result ? <p className={`auth-notice ${result.kind}`} role="alert">{result.text}</p> : null}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? t("login_loading") : <>{t("reset_submit")} <ArrowRightIcon /></>}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
