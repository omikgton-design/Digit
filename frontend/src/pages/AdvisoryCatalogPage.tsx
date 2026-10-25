import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAdvisories } from "../api/website";
import type { AdvisoryFacets, AdvisoryListItem, AuthResponse, FacetCategory } from "../types";
import { Pagination, readPageParam } from "../components/Pagination";
import { SaveHeartButton } from "../components/SaveHeartButton";
import { useSavedIds } from "../hooks/useSavedIds";

const PAGE_SIZE = 12;
import { AdvisoryLikeButton } from "../components/AdvisoryLikeButton";
import { RatingControl } from "../components/RatingControl";
import { stripRichText } from "../utils/richText";

const EMPTY_FACETS: AdvisoryFacets = {
  service_types: [],
  advisory_sectors: [],
  companies: [],
  price_terms: [],
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
    if (option.parent_id && selected.has(option.id)) expanded.add(option.parent_id);
    if (selected.has(option.id)) expanded.add(option.id);
  });
  return expanded;
}

type Props = {
  auth?: AuthResponse | null;
};

export function AdvisoryCatalogPage({ auth = null }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const selectedServiceTypes = useMemo(
    () => params.getAll("service_type").flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean),
    [params]
  );
  const selectedAdvisorySectors = useMemo(() => parseIdList(params, "advisory_sector"), [params]);
  const selectedFeatured = params.get("featured") === "1";
  const selectedQuery = params.get("q") || "";
  const page = readPageParam(params);

  const [searchText, setSearchText] = useState(selectedQuery);
  const [items, setItems] = useState<AdvisoryListItem[]>([]);
  const [facets, setFacets] = useState<AdvisoryFacets>(EMPTY_FACETS);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [expandedAdvisorySectors, setExpandedAdvisorySectors] = useState<Set<number>>(new Set());
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const { savedIds, setSaved } = useSavedIds("advisory", auth);

  useEffect(() => {
    setSearchText(selectedQuery);
  }, [selectedQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdvisories({
      q: selectedQuery || undefined,
      serviceTypes: selectedServiceTypes,
      advisorySectorIds: selectedAdvisorySectors,
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
  }, [selectedAdvisorySectors, selectedFeatured, selectedQuery, selectedServiceTypes, page]);

  useEffect(() => {
    setExpandedAdvisorySectors((current) => new Set([...current, ...getInitialExpandedIds(facets.advisory_sectors, selectedAdvisorySectors)]));
  }, [facets.advisory_sectors, selectedAdvisorySectors]);

  // Шүүлтүүр өөрчлөгдөхөд эхний хуудаснаас эхэлнэ.
  const updateParams = (next: URLSearchParams, keepPage = false) => {
    if (!keepPage) next.delete("page");
    const query = next.toString();
    navigate(query ? `/advisories?${query}` : "/advisories");
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

  const toggleFilter = (key: string, value: string) => {
    const next = new URLSearchParams(location.search);
    const existing = new Set(next.getAll(key).flatMap((entry) => entry.split(",")).map((entry) => entry.trim()).filter(Boolean));
    if (existing.has(value)) existing.delete(value);
    else existing.add(value);
    setMultiValueParam(next, key, existing);
    updateParams(next);
  };

  const toggleFeatured = () => {
    const next = new URLSearchParams(location.search);
    if (next.get("featured") === "1") next.delete("featured");
    else next.set("featured", "1");
    updateParams(next);
  };

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams(location.search);
    if (searchText.trim()) next.set("q", searchText.trim());
    else next.delete("q");
    updateParams(next);
  };

  const renderTreeFilter = (
    options: FacetCategory[],
    selectedIds: number[],
    expandedIds: Set<number>,
    setExpandedIds: Dispatch<SetStateAction<Set<number>>>,
    filterKey: string,
  ) => {
    const childrenByParent = new Map<number | null, FacetCategory[]>();
    options.forEach((option) => {
      const key = option.parent_id || null;
      const children = childrenByParent.get(key) || [];
      children.push(option);
      childrenByParent.set(key, children);
    });

    const toggleExpanded = (id: number) => {
      setExpandedIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const renderNode = (option: FacetCategory, depth = 0): ReactNode => {
      const children = childrenByParent.get(option.id) || [];
      const hasChildren = children.length > 0;
      const isExpanded = expandedIds.has(option.id);

      return (
        <div className="catalog-tree-node" key={option.id}>
          <div className="catalog-tree-row" style={{ paddingLeft: `${depth * 18}px` }}>
            <button
              type="button"
              className={`catalog-tree-toggle ${hasChildren ? "" : "is-empty"} ${isExpanded ? "is-open" : ""}`}
              onClick={() => hasChildren && toggleExpanded(option.id)}
              aria-label={hasChildren ? `${option.name} дэд төрөл` : undefined}
            >
              {hasChildren ? "›" : ""}
            </button>
            <input
              type="checkbox"
              checked={selectedIds.includes(option.id)}
              onChange={() => toggleFilter(filterKey, String(option.id))}
              aria-label={option.name}
            />
            {hasChildren ? (
              <button type="button" className="catalog-tree-name" onClick={() => toggleExpanded(option.id)}>
                {option.name}
              </button>
            ) : (
              <span className="catalog-tree-name catalog-tree-name-static">{option.name}</span>
            )}
          </div>
          {hasChildren && isExpanded ? <div className="catalog-tree-children">{children.map((child) => renderNode(child, depth + 1))}</div> : null}
        </div>
      );
    };

    return <div className="catalog-tree">{(childrenByParent.get(null) || []).map((option) => renderNode(option))}</div>;
  };

  return (
    <section className="catalog-page advisory-catalog-page">
      <div className="container">
        <div className="catalog-toolbar">
          <h2>Зөвлөх үйлчилгээний жагсаалт</h2>
          <button type="button" className="catalog-clear" onClick={() => navigate("/advisories")}>Бүгдийг цэвэрлэх</button>
        </div>

        <div className="catalog-layout">
          <aside className="catalog-filters">
            <form className="catalog-search" onSubmit={onSearchSubmit}>
              <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Гарчиг, салбар, байгууллагаар хайх..." />
              <button type="submit">Хайх</button>
            </form>

            <div className="catalog-filter-group">
              <h6>Төрөл</h6>
              {facets.service_types.map((option) => (
                <label key={option.id}>
                  <input
                    type="checkbox"
                    checked={selectedServiceTypes.includes(option.id)}
                    onChange={() => toggleFilter("service_type", option.id)}
                  />
                  <span>{option.name}</span>
                </label>
              ))}
            </div>

            <div className="catalog-filter-group">
              <h6>Ашигладаг салбар</h6>
              {renderTreeFilter(facets.advisory_sectors, selectedAdvisorySectors, expandedAdvisorySectors, setExpandedAdvisorySectors, "advisory_sector")}
            </div>

            <div className="catalog-filter-group">
              <label>
                <input type="checkbox" checked={selectedFeatured} onChange={toggleFeatured} />
                <span>Онцлох үйлчилгээ</span>
              </label>
            </div>
          </aside>

          <div className="catalog-results" ref={resultsRef}>
            <div className="catalog-meta">
              <span>{loading ? "Уншиж байна..." : `Нийт ${total} үйлчилгээ`}</span>
            </div>

            <div className="catalog-grid advisory-grid">
              {items.map((item) => (
                <article key={item.id} className="catalog-card advisory-card-listing">
                  <div className="catalog-card-media">
                    {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} /> : <div className="catalog-no-image">Зураг алга</div>}
                    <SaveHeartButton
                      kind="advisory"
                      id={item.id}
                      auth={auth}
                      initialSaved={savedIds.has(item.id)}
                      className="catalog-card-save"
                      onChange={(saved) => setSaved(item.id, saved)}
                    />
                  </div>
                  <div className="catalog-card-body">
                    <h5>
                      <a className="catalog-card-link" href={`/advisories/${item.id}`}>
                        {item.title}
                      </a>
                    </h5>
                    <p className="catalog-card-intro">
                      {stripRichText(item.introduction) || "Танилцуулга оруулаагүй."}
                    </p>
                    <RatingControl average={item.rating_average} count={item.rating_count} userRating={item.user_rating} compact />
                    <p><strong>Төрөл:</strong> {item.service_type}</p>
                    <p><strong>Салбар:</strong> {item.advisory_sectors.length ? item.advisory_sectors.map((sector) => sector.name).join(", ") : "-"}</p>
                    <p><strong>Үнэ:</strong> {new Intl.NumberFormat("mn-MN").format(Number(item.price || 0))}₮</p>
                    <p><strong>Үнийн нөхцөл:</strong> {item.price_terms}</p>
                    <div className="advisory-card-actions">
                      <span className="advisory-card-tag">{item.service_type}</span>
                      <AdvisoryLikeButton advisoryId={item.id} initialLiked={item.liked} initialCount={item.like_count} />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!loading && items.length === 0 ? <div className="catalog-load-more">Мэдээлэл олдсонгүй.</div> : null}
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={goToPage} />
          </div>
        </div>
      </div>
    </section>
  );
}
