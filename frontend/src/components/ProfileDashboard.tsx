import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Customer, ProfileSummary } from "../types";
import { ProfileIcon } from "./ProfileIcons";

export type DashboardTarget = "software" | "advisory" | "article" | "comments" | "ratings" | "payment" | "list";

type Props = {
  profile: Partial<Customer>;
  isOrganization: boolean;
  summary: ProfileSummary | null;
  loading: boolean;
  onEdit: () => void;
  onOpen: (target: DashboardTarget) => void;
};

const kindLabel: Record<string, string> = { software: "Програм хангамж", advisory: "Зөвлөх үйлчилгээ", article: "Нийтлэл", rating: "Үнэлгээ" };
const kindIcon: Record<string, ReactNode> = { software: <ProfileIcon name="info" />, advisory: <ProfileIcon name="advisory" />, article: <ProfileIcon name="article" />, rating: <ProfileIcon name="ratings" /> };

const dash = (value?: string | null) => (value && value.trim() ? value : "--");

export function ProfileDashboard({ profile, isOrganization, summary, loading, onEdit, onOpen }: Props) {
  const counts = summary?.counts;
  const unit = isOrganization ? "нийтэлсэн" : "хадгалсан";
  const limitText = (kind: "software" | "advisory" | "article") => {
    if (!isOrganization) return unit;
    const limit = profile.limits?.[kind];
    return `${unit} · хязгаар ${limit === null || limit === undefined ? "∞" : limit}`;
  };
  const stats: { target: DashboardTarget; label: string; value: number | undefined; caption: string; icon: ReactNode }[] = [
    { target: "software", label: "Програм хангамж", value: counts?.software, caption: limitText("software"), icon: <ProfileIcon name="info" size={26} /> },
    { target: "advisory", label: "Зөвлөх үйлчилгээ", value: counts?.advisory, caption: limitText("advisory"), icon: <ProfileIcon name="advisory" size={26} /> },
    { target: "article", label: "Нийтлэл", value: counts?.article, caption: limitText("article"), icon: <ProfileIcon name="article" size={26} /> },
    { target: "comments", label: "Сэтгэгдэл", value: counts?.comments, caption: "нийт сэтгэгдэл", icon: <ProfileIcon name="comments" size={26} /> },
    { target: "ratings", label: "Үнэлгээ", value: counts?.ratings, caption: "нийт үнэлгээ", icon: <ProfileIcon name="ratings" size={26} /> },
    { target: "payment", label: "Төлбөр", value: counts?.payments, caption: "идэвхтэй захиалга", icon: <ProfileIcon name="payment" size={26} /> },
  ];

  const fields: [string, string][] = isOrganization
    ? [
        ["Нэр", dash(profile.name)],
        ["И-мэйл", dash(profile.email)],
        ["Утас", dash(profile.phone)],
        ["Вэб сайт", dash(profile.website)],
        ["Хаяг", dash(profile.address)],
        ["Холбоо барих нэр", dash(profile.contact_person_name)],
        ["Холбоо барих утас", dash(profile.contact_person_phone)],
        ["Регистр", dash(profile.register_number)],
      ]
    : [
        ["Нэр", dash(profile.name)],
        ["И-мэйл", dash(profile.email)],
        ["Утас", dash(profile.phone)],
        ["Хаяг", dash(profile.address)],
      ];

  return (
    <div className="pd">
      <section className="pd-card pd-info">
        <header className="pd-info-head">
          <div>
            <h2>{isOrganization ? "Байгууллагын мэдээлэл" : "Хувийн мэдээлэл"}</h2>
            <p>Бүртгэсэн мэдээллээ харж, шинэчилнэ үү.</p>
          </div>
          <button type="button" className="pd-btn" onClick={onEdit}>Мэдээлэл шинэчлэх</button>
        </header>
        <dl className="pd-info-grid">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd title={value}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pd-stats" aria-label="Нэгдсэн тоо">
        {stats.map((stat) => (
          <button key={stat.target} type="button" className="pd-stat" onClick={() => onOpen(stat.target)}>
            <span className="pd-stat-icon">{stat.icon}</span>
            <span className="pd-stat-label">{stat.label}</span>
            <strong className="pd-stat-value">{stat.value === undefined ? "–" : stat.value}</strong>
            <span className="pd-stat-caption">{stat.caption}</span>
            <span className="pd-stat-arrow" aria-hidden="true">›</span>
          </button>
        ))}
      </section>

      <section className="pd-card pd-activity">
        <header className="pd-activity-head">
          <h3>Сүүлийн үйл ажиллагаа</h3>
          <button type="button" className="pd-link" onClick={() => onOpen("list")}>Бүгдийг харах <span aria-hidden="true">›</span></button>
        </header>
        {loading && !summary ? (
          <p className="pd-empty">Уншиж байна...</p>
        ) : !summary || summary.recent.length === 0 ? (
          <p className="pd-empty">Одоогоор үйл ажиллагаа байхгүй байна.</p>
        ) : (
          <ul className="pd-activity-list">
            {summary.recent.map((row) => (
              <li key={`${row.kind}-${row.id}-${row.date}-${row.status}`}>
                <Link to={row.url} className="pd-activity-row">
                  <span className="pd-activity-icon">{kindIcon[row.kind]}</span>
                  <span className="pd-activity-main">
                    <span className="pd-activity-title">{row.title}</span>
                    <span className="pd-chip">{kindLabel[row.kind]}</span>
                  </span>
                  <span className="pd-activity-status">{row.status}</span>
                  <time className="pd-activity-date" dateTime={row.date}>{row.date.replace(/-/g, ".")}</time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
