import { useEffect, useState } from "react";
import { getMySavedAdvisories, getMySavedArticles, getMySavedSoftwares } from "../api/website";
import type { AuthResponse } from "../types";

type Kind = "software" | "advisory" | "article";

const loaders: Record<Kind, () => Promise<{ results: { id: number }[] }>> = {
  software: getMySavedSoftwares,
  advisory: getMySavedAdvisories,
  article: getMySavedArticles,
};

// Нэвтэрсэн хувь хэрэглэгчийн хадгалсан контентын id-ууд (зүрхийг будаж харуулахад).
export function useSavedIds(kind: Kind, auth: AuthResponse | null) {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const userId = auth?.user?.id;
  const isPerson = auth?.customer?.account_type === "person";

  useEffect(() => {
    if (!userId || !isPerson) {
      setSavedIds(new Set());
      return;
    }
    let cancelled = false;
    loaders[kind]()
      .then((data) => {
        if (!cancelled) setSavedIds(new Set(data.results.map((item) => item.id)));
      })
      .catch(() => {
        if (!cancelled) setSavedIds(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [kind, userId, isPerson]);

  const setSaved = (id: number, saved: boolean) =>
    setSavedIds((current) => {
      const next = new Set(current);
      if (saved) next.add(id);
      else next.delete(id);
      return next;
    });

  return { savedIds, setSaved };
}
