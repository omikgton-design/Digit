import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getMySavedSoftwares, getSoftwares, saveSoftware, unsaveSoftware } from "../api/website";
import type { AuthResponse, FacetCategory, SoftwareFacets, SoftwareListItem } from "../types";
import { CategoryAccordion } from "../components/CategoryAccordion";
import { useToast } from "../components/ToastProvider";
import { Pagination, readPageParam } from "../components/Pagination";

const PAGE_SIZE = 12;

const EMPTY_FACETS: SoftwareFacets = {
  program_types: [],
  advisory_sectors: [],
  developers: [],
  price_types: [],
};

function parseIdList(params: URLSearchParams, key: string) {
  return params
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);
}

function getInitialExpandedIds(options: FacetCategory[], selectedIds: number[]) {
  const selected = new Set(selectedIds);
  const expanded = new Set<number>();
  options.forEach((option) => {
    if (option.parent_id && selected.has(option.id)) {
      expanded.add(option.parent_id);
    }
    if (selected.has(option.id)) {
      expanded.add(option.id);
    }
  });
  return expanded;
}

type Props = {
  auth: AuthResponse | null;
};

export function SoftwareCatalogPage({ auth }: Props) {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const selectedProgramTypes = useMemo(() => parseIdList(params, "program_type"), [params]);
  const selectedAdvisorySectors = useMemo(() => parseIdList(params, "advisory_sector"), [params]);
  const selectedDevelopers = useMemo(() => parseIdList(params, "developer"), [params]);
  const selectedPriceTypes = useMemo(
    () =>
      params
        .getAll("price_type")
        .flatMap((value) => value.split(","))
        .filter((v): v is "rent" | "sale" => v === "rent" || v === "sale"),
    [params]
  );
  const selectedFeatured = params.get("featured") === "1";
  const selectedQuery = params.get("q") || "";
  const page = readPageParam(params);

  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [items, setItems] = useState<SoftwareListItem[]>([]);
  const [facets, setFacets] = useState<SoftwareFacets>(EMPTY_FACETS);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [expandedProgramTypes, setExpandedProgramTypes] = useState<Set<number>>(new Set());
  const [expandedAdvisorySectors, setExpandedAdvisorySectors] = useState<Set<number>>(new Set());
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSoftwares({
      q: selectedQuery || undefined,
      programTypeIds: selectedProgramTypes,
      advisorySectorIds: selectedAdvisorySectors,
      developerIds: selectedDevelopers,
      priceTypes: selectedPriceTypes,
      featured: selectedFeatured,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((data) => {
        if (cancelled) return;
        setItems(data.results);
        setFacets(data.facets);
        setTotal(data.pagination.total);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setFacets(EMPTY_FACETS);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedQuery, selectedProgramTypes, selectedAdvisorySectors, selectedDevelopers, selectedPriceTypes, selectedFeatured, page]);

  useEffect(() => {
    setExpandedProgramTypes((current) => new Set([...current, ...getInitialExpandedIds(facets.program_types, selectedProgramTypes)]));
  }, [facets.program_types, selectedProgramTypes]);

  useEffect(() => {
    setExpandedAdvisorySectors((current) => new Set([...current, ...getInitialExpandedIds(facets.advisory_sectors, selectedAdvisorySectors)]));
  }, [facets.advisory_sectors, selectedAdvisorySectors]);

  // Шүүлтүүр өөрчлөгдөхөд эхний хуудаснаас эхэлнэ.
  const updateParams = (next: URLSearchParams, keepPage = false) => {
    if (!keepPage) next.delete("page");
    const query = next.toString();
    navigate(query ? `/softwares?${query}` : "/softwares");
  };

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(location.search);
    if (nextPage > 1) next.set("page", String(nextPage));
    else next.delete("page");
    updateParams(next, true);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setMultiValueParam = (paramsToUpdate: URLSearchParams, key: string, values: Iterable<string>) => {
    const uniqueValues = Array.from(new Set(Array.from(values).filter(Boolean)));
    paramsToUpdate.delete(key);
    if (uniqueValues.length) {
      paramsToUpdate.set(key, uniqueValues.join(","));
    }
  };

  const toggleIdFilter = (key: string, id: number) => {
    const next = new URLSearchParams(location.search);
    const existing = new Set(next.getAll(key).flatMap((entry) => entry.split(",")).filter(Boolean));
    const value = String(id);
    if (existing.has(value)) existing.delete(value);
    else existing.add(value);
    setMultiValueParam(next, key, existing);
    updateParams(next);
  };

  const togglePriceType = (value: "rent" | "sale") => {
    const next = new URLSearchParams(location.search);
    const existing = new Set(next.getAll("price_type").flatMap((entry) => entry.split(",")).filter(Boolean));
    if (existing.has(value)) existing.delete(value);
    else existing.add(value);
    setMultiValueParam(next, "price_type", existing);
    updateParams(next);
  };

  const toggleFeatured = () => {
    const next = new URLSearchParams(location.search);
    if (next.get("featured") === "1") next.delete("featured");
    else next.set("featured", "1");
    updateParams(next);
  };

  const clearAll = () => navigate("/softwares");

  const clearParam = (key: string) => {
    const next = new URLSearchParams(location.search);
    next.delete(key);
    updateParams(next);
  };

  const toggleExpanded = (setter: Dispatch<SetStateAction<Set<number>>>, id: number) => {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Зүрхэн дээр дарж програмыг хадгалах (профайл дээрх "Хадгалсан" жагсаалттай нэг).
  // Хадгалах боломж зөвхөн хувь хэрэглэгчид нээлттэй (байгууллага хадгалахгүй).
  const canSave = !auth || auth.customer?.account_type === "person";
  const savedUserId = auth?.user?.id;
  useEffect(() => {
    if (!savedUserId || !canSave) {
      setSavedIds(new Set());
      return;
    }
    getMySavedSoftwares()
      .then((data) => setSavedIds(new Set(data.results.map((item) => item.id))))
      .catch(() => setSavedIds(new Set()));
  }, [savedUserId, canSave]);

  const toggleSaved = async (id: number) => {
    if (!auth) {
      showToast("Хадгалахын тулд эхлээд нэвтэрнэ үү.", "error");
      navigate("/login");
      return;
    }
    const wasSaved = savedIds.has(id);
    setSavedIds((current) => {
      const next = new Set(current);
      if (wasSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (wasSaved) await unsaveSoftware(id);
      else await saveSoftware(id);
    } catch {
      setSavedIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.add(id);
        else next.delete(id);
        return next;
      });
      showToast("Хадгалах үед алдаа гарлаа.", "error");
    }
  };

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (selectedQuery) chips.push({ key: "q", label: `Хайлт: ${selectedQuery}`, onRemove: () => clearParam("q") });
  if (selectedFeatured) chips.push({ key: "featured", label: "Онцлох", onRemove: toggleFeatured });
  selectedDevelopers.forEach((id) => {
    const name = facets.developers.find((developer) => developer.id === id)?.name;
    chips.push({ key: `developer-${id}`, label: `Хөгжүүлэгч: ${name || id}`, onRemove: () => toggleIdFilter("developer", id) });
  });

  return (
    <section className="sw-page">
      <div className="container">
        <div className="sw-layout">
          <aside className="sw-sidebar">
            <div className="sw-side-card">
              <CategoryAccordion
                title="Ангилал"
                options={facets.program_types}
                selectedIds={selectedProgramTypes}
                expandedIds={expandedProgramTypes}
                onToggleExpand={(id) => toggleExpanded(setExpandedProgramTypes, id)}
                onSelect={(id) => toggleIdFilter("program_type", id)}
                allLabel="Бүх ангилал харах"
                onShowAll={() => clearParam("program_type")}
              />
              <CategoryAccordion
                title="Салбар"
                options={facets.advisory_sectors}
                selectedIds={selectedAdvisorySectors}
                expandedIds={expandedAdvisorySectors}
                onToggleExpand={(id) => toggleExpanded(setExpandedAdvisorySectors, id)}
                onSelect={(id) => toggleIdFilter("advisory_sector", id)}
              />
              {facets.price_types.length ? (
                <div className="cat-acc">
                  <h6 className="cat-acc-title">Үнийн төрөл</h6>
                  <div className="sw-price-chips">
                    {facets.price_types.map((option) => {
                      const on = selectedPriceTypes.includes(option.id as "rent" | "sale");
                      return (
                        <button key={option.id} type="button" className={`sw-chip ${on ? "is-on" : ""}`} aria-pressed={on} onClick={() => togglePriceType(option.id as "rent" | "sale")}>
                          {option.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="sw-main" ref={resultsRef}>
            <div className="sw-head">
              <div>
                <h1>Програм хангамж</h1>
                <p>Бизнесээ өсгөх хамгийн шилдэг шийдлүүдийг олж, сонгоорой.</p>
              </div>
              <button type="button" className="sw-view-all" onClick={clearAll}>Бүгдийг харах <span aria-hidden="true">›</span></button>
            </div>

            {chips.length ? (
              <div className="sw-chips">
                {chips.map((chip) => (
                  <button key={chip.key} type="button" className="sw-chip is-on" onClick={chip.onRemove} aria-label={`${chip.label} арилгах`}>
                    {chip.label} <span aria-hidden="true">✕</span>
                  </button>
                ))}
                <button type="button" className="sw-chip-clear" onClick={clearAll}>Бүгдийг цэвэрлэх</button>
              </div>
            ) : null}

            <div className="sw-count">{loading ? "Уншиж байна..." : `Нийт ${total} програм`}</div>

            <div className="sw-grid">
              {items.map((item) => {
                const saved = savedIds.has(item.id);
                return (
                  <article key={item.id} className="sw-card">
                    <div className="sw-card-top">
                      {item.is_featured ? (
                        <span className="sw-badge">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" /></svg>
                          PREMIUM
                        </span>
                      ) : <span />}
                      {canSave ? (
                      <button
                        type="button"
                        className={`sw-heart ${saved ? "is-saved" : ""}`}
                        onClick={() => toggleSaved(item.id)}
                        aria-pressed={saved}
                        aria-label={saved ? "Хадгалснаас хасах" : "Хадгалах"}
                        title={saved ? "Хадгалснаас хасах" : "Хадгалах"}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.6 4.5 6.9 4.5c1.9 0 3.5 1 5.1 3 1.6-2 3.2-3 5.1-3 3.3 0 5.3 3.1 4.1 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" />
                        </svg>
                      </button>
                      ) : null}
                    </div>
                    {item.thumbnail_url ? (
                      <img className="sw-logo" src={item.thumbnail_url} alt="" loading="lazy" />
                    ) : (
                      <div className="sw-logo sw-logo-fallback" aria-hidden="true">{item.name.trim().charAt(0).toUpperCase()}</div>
                    )}
                    <h2 className="sw-name">
                      <Link className="sw-card-link" to={`/softwares/${item.id}`}>{item.name}</Link>
                    </h2>
                    <p className="sw-sub">{item.program_type.name}</p>
                    <div className="sw-rating">
                      {item.rating_count > 0 ? (
                        <>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="#f5a623" aria-hidden="true"><path d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.1 6.4 20l1.1-6.2L3 9.4l6.2-.9z" /></svg>
                          <strong>{item.rating_average.toFixed(1)}</strong>
                          <span>({item.rating_count} үнэлгээ)</span>
                        </>
                      ) : (
                        <span className="sw-rating-empty">Үнэлгээгүй</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {!loading && items.length === 0 ? (
              <div className="sw-empty">
                Илэрц олдсонгүй.
                <button type="button" className="sw-chip-clear" onClick={clearAll}>Шүүлтүүрийг цэвэрлэх</button>
              </div>
            ) : null}

            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={goToPage} />
            <div className="sw-legend"><span className="sw-badge">PREMIUM</span> Онцлох бүтээгдэхүүн</div>
          </div>
        </div>
      </div>
    </section>
  );
}
