import type { FormEvent } from "react";

type Props = {
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoSignup: () => void;
};

export function LoginPage({ loading, onSubmit, onGoSignup }: Props) {
  return (
    <section className="login-page">
      <div className="container">
        <div className="login-shell">
          <div className="login-card">
            <div className="login-header"><h1>Нэвтрэх хэсэг</h1></div>
            <form className="login-form" onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">Имэйл</label>
                <input id="login-email" name="email" type="email" placeholder="example@email.com" autoComplete="username" required />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Нууц үг</label>
                <input id="login-password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <button className="login-submit" type="submit" disabled={loading}>{loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}</button>
            </form>
            <div className="login-footer">
              <span>Шинээр бүртгүүлэх үү?</span>
              <a href="/signup" onClick={(e) => { e.preventDefault(); onGoSignup(); }}>Бүртгүүлэх</a>
            </div>
          </div>
          <div className="login-aside">
            <div className="login-aside-content">
              <h2>Digit платформд тавтай морил</h2>
              <p>Бизнесийн дижитал шийдлүүд, үйлчилгээ, зөвлөгөөг нэг дороос авна.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
