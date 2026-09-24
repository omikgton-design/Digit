import type { AccountType } from "../types";
import type { FormEvent } from "react";

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
  return (
    <section className="login-page">
      <div className="container">
        <div className="login-shell">
          <div className="login-card">
            <div className="login-header"><h1>Бүртгүүлэх хэсэг</h1><br /></div>
            <form className="login-form signup-form" onSubmit={onSubmit}>
              <div className="signup-switch">
                <div className="signup-tabs">
                  <label className={`signup-tab ${signupType === "org" ? "active" : ""}`}>
                    <input type="radio" checked={signupType === "org"} onChange={() => onSignupTypeChange("org")} /> Байгууллага
                  </label>
                  <label className={`signup-tab ${signupType === "person" ? "active" : ""}`}>
                    <input type="radio" checked={signupType === "person"} onChange={() => onSignupTypeChange("person")} /> Хувь хүн
                  </label>
                </div>
                <div className="form-group mt-3">
                  <label>{signupType === "org" ? "Байгууллагын нэр" : "Хувь хүний нэр"}</label>
                  <input type="text" value={signupName} onChange={(e) => onSignupNameChange(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Имэйл</label>
                <input id="signup-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Нууц үг</label>
                <input id="signup-password" name="password" type="password" autoComplete="new-password" required />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password-confirm">Нууц үг баталгаажуулах</label>
                <input id="signup-password-confirm" name="password_confirm" type="password" autoComplete="new-password" required />
              </div>
              <button className="login-submit" type="submit" disabled={loading}>{loading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}</button>
            </form>
            <div className="login-footer">
              <span>Бүртгэлтэй юу?</span>
              <a href="/login" onClick={(e) => { e.preventDefault(); onGoLogin(); }}>Нэвтрэх</a>
            </div>
          </div>
          <div className="login-aside">
            <div className="login-aside-content">
              <h2>Digit платформд нэгдэх</h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
