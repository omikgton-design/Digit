import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { saveAdvisory, saveArticle, saveSoftware, unsaveAdvisory, unsaveArticle, unsaveSoftware } from "../api/website";
import type { AuthResponse } from "../types";
import { useToast } from "./ToastProvider";

type Kind = "software" | "advisory" | "article";

type Props = {
  kind: Kind;
  id: number;
  auth: AuthResponse | null;
  initialSaved?: boolean;
  className?: string;
  showLabel?: boolean;
  onChange?: (saved: boolean) => void;
};

const actions: Record<Kind, { save: (id: number) => Promise<unknown>; unsave: (id: number) => Promise<unknown> }> = {
  software: { save: saveSoftware, unsave: unsaveSoftware },
  advisory: { save: saveAdvisory, unsave: unsaveAdvisory },
  article: { save: saveArticle, unsave: unsaveArticle },
};

// Хадгалах боломж зөвхөн хувь хэрэглэгчид нээлттэй (байгууллага хадгалахгүй).
export function canUseSave(auth: AuthResponse | null) {
  return !auth || auth.customer?.account_type === "person";
}

export function SaveHeartButton({ kind, id, auth, initialSaved = false, className = "", showLabel = false, onChange }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => setSaved(initialSaved), [initialSaved]);

  if (!canUseSave(auth)) return null;

  const toggle = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!auth) {
      showToast("Хадгалахын тулд эхлээд нэвтэрнэ үү.", "error");
      navigate("/login");
      return;
    }
    if (busy) return;
    const next = !saved;
    setBusy(true);
    setSaved(next);
    try {
      if (next) await actions[kind].save(id);
      else await actions[kind].unsave(id);
      onChange?.(next);
      showToast(next ? "Хадгалагдлаа." : "Хадгалснаас хасагдлаа.");
    } catch (error) {
      setSaved(!next);
      showToast((error as Error).message || "Хадгалах үед алдаа гарлаа.", "error");
    } finally {
      setBusy(false);
    }
  };

  const label = saved ? "Хадгалснаас хасах" : "Хадгалах";
  return (
    <button
      type="button"
      className={`sw-heart save-heart ${saved ? "is-saved" : ""} ${showLabel ? "save-heart--labeled" : ""} ${className}`.trim()}
      onClick={toggle}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      disabled={busy}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.6 4.5 6.9 4.5c1.9 0 3.5 1 5.1 3 1.6-2 3.2-3 5.1-3 3.3 0 5.3 3.1 4.1 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" />
      </svg>
      {showLabel ? <span>{saved ? "Хадгалсан" : "Хадгалах"}</span> : null}
    </button>
  );
}
