import { useState, type FormEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { ArrowLeftIcon, ArrowRightIcon, BuildingIcon, CheckIcon, EyeIcon, EyeOffIcon, GoogleIcon, LockIcon, MailIcon, UserIcon } from "../components/AuthIcons";

type Props = {
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoSignup: () => void;
  onForgotPassword: () => void;
};

export function LoginPage({ loading, onSubmit, onGoSignup, onForgotPassword }: Props) {
  const { t } = useLanguage();
  // Хувь хүн: имэйл + нууц үг. Байгууллага: регистр + нууц үг.
  const [accountType, setAccountType] = useState<"person" | "org">("person");
  const [showPassword, setShowPassword] = useState(false);
  const isOrg = accountType === "org";
  return (
    <section className="auth-page">
      <div className="auth-card">
        <a className="auth-back" href="/signup" onClick={(e) => { e.preventDefault(); onGoSignup(); }}>
          <ArrowLeftIcon /> {t("login_back")}
        </a>
        <h1 className="auth-title">{t("login_title")}</h1>
        <p className="auth-subtitle">{t("login_subtitle")}</p>

        <div className="auth-tabs" role="group">
          <button type="button" aria-pressed={!isOrg} className={!isOrg ? "active" : ""} onClick={() => setAccountType("person")}>
            <UserIcon /> {t("signup_person_tab")}
          </button>
          <button type="button" aria-pressed={isOrg} className={isOrg ? "active" : ""} onClick={() => setAccountType("org")}>
            <BuildingIcon /> {t("signup_org_tab")}
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit} key={accountType}>
          {isOrg ? (
            <div className="auth-field">
              <label htmlFor="login-register">{t("login_register_label")}</label>
              <div className="auth-input">
                <BuildingIcon className="auth-input-icon" />
                <input id="login-register" name="register_number" type="text" placeholder={t("login_register_placeholder")} autoComplete="username" autoCapitalize="characters" required />
              </div>
            </div>
          ) : (
            <div className="auth-field">
              <label htmlFor="login-email">{t("login_email_label")}</label>
              <div className="auth-input">
                <MailIcon className="auth-input-icon" />
                <input id="login-email" name="email" type="email" placeholder={t("login_email_placeholder")} autoComplete="username" required />
              </div>
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="login-password">{t("login_password_label")}</label>
            <div className="auth-input">
              <LockIcon className="auth-input-icon" />
              <input id="login-password" name="password" type={showPassword ? "text" : "password"} placeholder={t("login_password_placeholder")} autoComplete="current-password" required />
              <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t("auth_hide_password") : t("auth_show_password")}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="auth-row">
            <label className="auth-check">
              <input type="checkbox" name="remember" defaultChecked />
              <span className="auth-check-box"><CheckIcon /></span>
              <span className="auth-check-text">{t("login_remember")}</span>
            </label>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? t("login_loading") : <>{t("login_submit")} <ArrowRightIcon /></>}
          </button>
        </form>

        {!isOrg && (
          <>
            <div className="auth-divider"><span>{t("login_or")}</span></div>
            <button type="button" className="auth-google" onClick={() => { window.location.href = "/api/auth/google/start/"; }}>
              <GoogleIcon /> {t("login_google")}
            </button>
          </>
        )}

        <div className="auth-footer">
          <span>{t("login_no_account")}</span>
          <a href="/signup" onClick={(e) => { e.preventDefault(); onGoSignup(); }}>{t("login_signup_link")} <ArrowRightIcon /></a>
          <span className="auth-footer-sep" aria-hidden="true">·</span>
          <span>{t("login_forgot")}</span>
          <a href="/forgot-password" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>{t("login_forgot_recover")} <ArrowRightIcon /></a>
        </div>
      </div>
    </section>
  );
}
