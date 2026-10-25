import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { MembershipRequestResponse } from "../types";

type Props = {
  history: MembershipRequestResponse[];
  loading: boolean;
  membershipType?: string;
};

type StatusFilter = "all" | "paid" | "pending";

const RANK: Record<string, number> = { bronze: 0, silver: 1, gold: 2 };
const TYPE_LABEL: Record<string, string> = { bronze: "Энгийн", silver: "Silver", gold: "Gold" };

const svg = (children: ReactNode, size = 22) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const I = {
  wallet: svg(<><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v3" /><path d="M4 7.5V17a2 2 0 0 0 2 2h13V8H6.5A2.5 2.5 0 0 1 4 7.5z" /><circle cx="15.5" cy="13.5" r="1.1" /></>),
  crown: svg(<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" />),
  calendar: svg(<><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
  shield: svg(<><path d="M12 3 5 6v5.5c0 4.2 2.8 7.6 7 9 4.2-1.4 7-4.8 7-9V6z" /><path d="m9 12 2.2 2.2L15.5 10" /></>),
  card: svg(<><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h4" /></>, 18),
  refresh: svg(<><path d="M20 11a8 8 0 0 0-14.5-4M4 5v3.5h3.5" /><path d="M4 13a8 8 0 0 0 14.5 4M20 19v-3.5h-3.5" /></>, 18),
  doc: svg(<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>, 18),
  download: svg(<><path d="M12 4v11M7.5 11 12 15.5 16.5 11" /><path d="M5 20h14" /></>, 15),
  check: svg(<path d="m5 12.5 4.5 4.5L19 7.5" />, 15),
  clock: svg(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>, 15),
  chevron: svg(<path d="m6 9 6 6 6-6" />, 16),
};

const money = (value: number) => `${value.toLocaleString("en-US")} ₮`;
const dotted = (iso?: string | null) => (iso ? iso.slice(0, 10).replace(/-/g, ".") : "—");
const rowDate = (row: MembershipRequestResponse) => (row.paid_date || row.created_date || "").slice(0, 10);
const documentUrl = (id: number, kind: "invoice" | "receipt") => `/api/profile/payments/${id}/document/?kind=${kind}&print=1`;

/** Гүйлгээний нэр: шинээр авсан / сунгалт / шинэчлэлт. Хуучнаас шинэ рүү харьцуулж тодорхойлно. */
function describeRows(rows: MembershipRequestResponse[]): Record<number, string> {
  const ordered = [...rows].sort((a, b) => rowDate(a).localeCompare(rowDate(b)) || a.id - b.id);
  const names: Record<number, string> = {};
  let previous: MembershipRequestResponse | null = null;
  for (const row of ordered) {
    const label = row.membership_label;
    if (!previous) names[row.id] = `${label} багц шинээр авсан`;
    else if (previous.membership_type === row.membership_type) names[row.id] = `${label} багц сунгалт`;
    else if ((RANK[previous.membership_type] ?? 0) < (RANK[row.membership_type] ?? 0)) names[row.id] = `${previous.membership_label} → ${label} шинэчлэлт`;
    else names[row.id] = `${previous.membership_label} → ${label} багц сонгосон`;
    if (row.status === "paid") previous = row;
  }
  return names;
}

export function PaymentPanel({ history, loading, membershipType }: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null); // зөвхөн шүүлтүүрийн хэсэг: бусад газар дарахад цэс хаагдана

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setStatusOpen(false);
        setRangeOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStatusOpen(false);
        setRangeOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const paidRows = history.filter((row) => row.status === "paid");
  const totalPaid = paidRows.reduce((sum, row) => sum + row.price, 0);
  const latestPaid = [...paidRows].sort((a, b) => rowDate(b).localeCompare(rowDate(a)) || b.id - a.id)[0];
  const hasPending = history.some((row) => row.status === "pending");
  const expired = !!latestPaid && !!latestPaid.end_date && latestPaid.end_date.slice(0, 10) < today;
  const activePaid = !!latestPaid && !expired;
  const type = (membershipType || "bronze").toLowerCase();

  const state = activePaid || type !== "bronze"
    ? expired && !activePaid
      ? { tone: "bad", value: "Дууссан", caption: "Үйлчилгээний хугацаа дууссан" }
      : { tone: "good", value: "Идэвхтэй", caption: "Үйлчилгээ идэвхтэй байна" }
    : hasPending
      ? { tone: "wait", value: "Хүлээгдэж байна", caption: "Төлбөр баталгаажихыг хүлээж байна" }
      : expired
        ? { tone: "bad", value: "Дууссан", caption: "Үйлчилгээний хугацаа дууссан" }
        : { tone: "muted", value: "Үнэгүй", caption: "Энгийн багц ашиглаж байна" };

  const names = useMemo(() => describeRows(history), [history]);
  const visible = useMemo(
    () =>
      history.filter((row) => {
        if (status !== "all" && row.status !== status) return false;
        const date = rowDate(row);
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      }),
    [history, status, from, to]
  );

  const latestAny = [...history].sort((a, b) => (b.created_date || "").localeCompare(a.created_date || "") || b.id - a.id)[0];
  const open = (id: number, kind: "invoice" | "receipt") => window.open(documentUrl(id, kind), "_blank", "noopener");
  const statusLabel: Record<StatusFilter, string> = { all: "Бүгд", paid: "Амжилттай", pending: "Хүлээгдэж байна" };
  const rangeLabel = from || to ? `${from ? dotted(from) : "…"} – ${to ? dotted(to) : "…"}` : "Хугацаагаар шүүх";

  const pay = () => navigate(type === "bronze" ? "/company#pricing" : `/payment?plan=${type}`);

  return (
    <div className="pay">
      <header className="pay-head">
        <h2>Төлбөр</h2>
        <p>Digit системд төлсөн төлбөрийн мэдээлэл, түүхийг харах боломжтой.</p>
      </header>

      <section className="pay-stats">
        <article className="pay-stat">
          <span className="pay-stat-icon">{I.wallet}</span>
          <div>
            <span className="pay-stat-label">Нийт төлсөн дүн</span>
            <strong>{money(totalPaid)}</strong>
            <small>Бүх хугацааны дүн</small>
          </div>
        </article>
        <article className="pay-stat">
          <span className="pay-stat-icon">{I.crown}</span>
          <div>
            <span className="pay-stat-label">Идэвхтэй багц</span>
            <strong>{TYPE_LABEL[type] || type}</strong>
            <small>Багцын төрөл</small>
          </div>
        </article>
        <article className="pay-stat">
          <span className="pay-stat-icon">{I.calendar}</span>
          <div>
            <span className="pay-stat-label">Дараагийн сунгалт</span>
            <strong>{latestPaid?.end_date ? dotted(latestPaid.end_date) : "—"}</strong>
            <small>{latestPaid?.end_date ? "Үйлчилгээний дуусах огноо" : "Сунгалтын огноо бүртгэгдээгүй"}</small>
          </div>
        </article>
        <article className="pay-stat">
          <span className={`pay-stat-icon tone-${state.tone}`}>{I.shield}</span>
          <div>
            <span className="pay-stat-label">Төлөв</span>
            <strong className={`tone-${state.tone}`}>{state.value}</strong>
            <small>{state.caption}</small>
          </div>
        </article>
      </section>

      <section className="pay-card">
        <div className="pay-card-head">
          <h3>Төлбөрийн түүх</h3>
          <div className="pay-filters" ref={rootRef}>
            <div className="pay-dropdown">
              <button type="button" className="pay-filter" aria-expanded={statusOpen} onClick={() => { setStatusOpen(!statusOpen); setRangeOpen(false); }}>
                <span>{statusLabel[status]}</span>{I.chevron}
              </button>
              {statusOpen ? (
                <ul className="pay-menu" role="listbox">
                  {(Object.keys(statusLabel) as StatusFilter[]).map((key) => (
                    <li key={key}>
                      <button type="button" className={status === key ? "is-on" : ""} onClick={() => { setStatus(key); setStatusOpen(false); }}>{statusLabel[key]}</button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="pay-dropdown">
              <button type="button" className={`pay-filter ${from || to ? "is-on" : ""}`} aria-expanded={rangeOpen} onClick={() => { setRangeOpen(!rangeOpen); setStatusOpen(false); }}>
                {I.calendar}<span>{rangeLabel}</span>
              </button>
              {rangeOpen ? (
                <div className="pay-menu pay-range">
                  <label>Эхлэх<input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></label>
                  <label>Дуусах<input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></label>
                  <button type="button" className="pay-clear" onClick={() => { setFrom(""); setTo(""); }}>Цэвэрлэх</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="pay-table-wrap">
          <table className="pay-table">
            <thead>
              <tr><th>Огноо</th><th>Гүйлгээний нэр</th><th>Багц</th><th>Дүн</th><th>Төлөв</th><th>Нэхэмжлэх</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="pay-empty">Ачааллаж байна...</td></tr>
              ) : visible.length ? (
                visible.map((row) => (
                  <tr key={row.id}>
                    <td>{dotted(rowDate(row))}</td>
                    <td>{names[row.id]}</td>
                    <td>{row.membership_label}</td>
                    <td>{money(row.price)}</td>
                    <td>
                      <span className={`pay-badge ${row.status === "paid" ? "is-paid" : "is-pending"}`}>
                        {row.status === "paid" ? I.check : I.clock}
                        {row.status === "paid" ? "Амжилттай" : "Хүлээгдэж байна"}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="pay-pdf" onClick={() => open(row.id, "invoice")}>PDF татах {I.download}</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="pay-empty">{history.length ? "Шүүлтүүрт таарах төлбөр олдсонгүй." : "Одоогоор төлбөрийн түүх байхгүй байна."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pay-actions">
        <button type="button" className="pay-btn is-primary" onClick={pay}>{I.card}Төлбөр хийх</button>
        <button type="button" className="pay-btn" onClick={() => navigate("/company#pricing")}>{I.refresh}Багцаа шинэчлэх</button>
        <button type="button" className="pay-btn" disabled={!latestAny} onClick={() => latestAny && open(latestAny.id, "invoice")}>{I.doc}Нэхэмжлэх татах</button>
        <button type="button" className="pay-btn" disabled={!latestPaid} onClick={() => latestPaid && open(latestPaid.id, "receipt")}>{I.doc}Төлбөрийн баримт харах</button>
      </section>
    </div>
  );
}
