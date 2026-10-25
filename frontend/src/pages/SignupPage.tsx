import type { AccountType } from "../types";
import { useState, type FormEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { ArrowLeftIcon, ArrowRightIcon, BuildingIcon, CheckIcon, EyeIcon, EyeOffIcon, GoogleIcon, LockIcon, MailIcon, UserIcon } from "../components/AuthIcons";

type Props = {
  loading: boolean;
  signupType: AccountType;
  signupName: string;
  onSignupTypeChange: (value: AccountType) => void;
  onSignupNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoLogin: () => void;
};

export function SignupPage({
  loading,
  signupType,
  signupName,
  onSignupTypeChange,
  onSignupNameChange,
  onSubmit,
  onGoLogin
}: Props) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Backend-ийн нууц үгийн бодлоготой ижил: 8+ тэмдэгт, том, жижиг үсэг, тоо, тусгай тэмдэгт.
  const passwordOk =
    password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  const isOrg = signupType === "org";
  return (
    <section className="auth-page">
      <div className="auth-card">
        <img src="/logo_blank.png" alt="Digit" className="auth-logo" />
        <a className="auth-back" href="/login" onClick={(e) => { e.preventDefault(); onGoLogin(); }}>
          <ArrowLeftIcon /> {t("signup_back")}
        </a>
        <h1 className="auth-title">{t("signup_title")}</h1>
        <p className="auth-subtitle">{t("signup_subtitle")}</p>

        <div className="auth-tabs" role="group">
          <button type="button" aria-pressed={!isOrg} className={!isOrg ? "active" : ""} onClick={() => onSignupTypeChange("person")}>
            <UserIcon /> {t("signup_person_tab")}
          </button>
          <button type="button" aria-pressed={isOrg} className={isOrg ? "active" : ""} onClick={() => onSignupTypeChange("org")}>
            <BuildingIcon /> {t("signup_org_tab")}
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="signup-name">{isOrg ? t("signup_org_name_label") : t("signup_person_name_label")}</label>
            <div className="auth-input">
              {isOrg ? <BuildingIcon className="auth-input-icon" /> : <UserIcon className="auth-input-icon" />}
              <input id="signup-name" type="text" value={signupName} onChange={(e) => onSignupNameChange(e.target.value)} placeholder={isOrg ? t("signup_org_name_placeholder") : t("signup_person_name_placeholder")} autoComplete={isOrg ? "organization" : "name"} required />
            </div>
          </div>
          {isOrg ? (
            <div className="auth-field">
              <label htmlFor="signup-register">{t("signup_register_label")}</label>
              <div className="auth-input">
                <BuildingIcon className="auth-input-icon" />
                <input id="signup-register" name="register_number" type="text" placeholder={t("signup_register_placeholder")} autoCapitalize="characters" required />
              </div>
            </div>
          ) : null}
          <div className="auth-field">
            <label htmlFor="signup-email">{t("signup_email_label")}</label>
            <div className="auth-input">
              <MailIcon className="auth-input-icon" />
              <input id="signup-email" name="email" type="email" placeholder={t("signup_email_placeholder")} autoComplete="email" required />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="signup-password">{t("signup_password_label")}</label>
            <div className="auth-input">
              <LockIcon className="auth-input-icon" />
              <input id="signup-password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("signup_password_placeholder")} autoComplete="new-password" required />
              <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t("auth_hide_password") : t("auth_show_password")}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p className={`auth-hint ${password && !passwordOk ? "invalid" : ""}`}>{t("signup_password_hint")}</p>
          </div>

          <label className="auth-check auth-terms">
            <input type="checkbox" name="terms" defaultChecked required />
            <span className="auth-check-box"><CheckIcon /></span>
            <span className="auth-check-text">
              {t("signup_terms_before")}
              <a className="auth-inline-link" href="#" onClick={(e) => e.preventDefault()}>{t("signup_terms_link")}</a>
              {t("signup_terms_and")}
              <a className="auth-inline-link" href="#" onClick={(e) => e.preventDefault()}>{t("signup_privacy_link")}</a>
              {t("signup_terms_after")}
            </span>
          </label>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? t("login_loading") : <>{t("signup_submit")} <ArrowRightIcon /></>}
          </button>
        </form>

        {!isOrg && (
          <>
            <div className="auth-divider"><span>{t("login_or")}</span></div>
            <button type="button" className="auth-google" onClick={() => { window.location.href = "/api/auth/google/start/"; }}>
              <GoogleIcon /> {t("signup_google")}
            </button>
          </>
        )}

        <div className="auth-footer">
          <span>{t("signup_have_account")}</span>
          <a href="/login" onClick={(e) => { e.preventDefault(); onGoLogin(); }}>{t("signup_login_link")} <ArrowRightIcon /></a>
        </div>
      </div>
    </section>
  );
}
