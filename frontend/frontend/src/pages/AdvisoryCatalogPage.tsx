import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAdvisories } from "../api/website";
import type { AdvisoryFacets, AdvisoryListItem, FacetCategory } from "../types";
import { AdvisoryLikeButton } from "../components/AdvisoryLikeButton";
import { RatingControl } from "../components/RatingControl";

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

export function AdvisoryCatalogPage() {
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

  const [searchText, setSearchText] = useState(selectedQuery);
  const [items, setItems] = useState<AdvisoryListItem[]>([]);
  const [facets, setFacets] = useState<AdvisoryFacets>(EMPTY_FACETS);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedAdvisorySectors, setExpandedAdvisorySectors] = useState<Set<number>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearchText(selectedQuery);
    setLoading(true);
    setPage(1);
    getAdvisories({
      q: selectedQuery || undefined,
      serviceTypes: selectedServiceTypes,
      advisorySectorIds: selectedAdvisorySectors,
      featured: selectedFeatured,
      page: 1,
      pageSize: 12,
    })
      .then((data) => {
        setItems(data.results);
        setFacets(data.facets);
        setHasNextPage(data.pagination.has_next);
        setTotal(data.pagination.total);
      })
      .catch(() => {
        setItems([]);
        setFacets(EMPTY_FACETS);
        setHasNextPage(false);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [selectedAdvisorySectors, selectedFeatured, selectedQuery, selectedServiceTypes]);

  useEffect(() => {
    setExpandedAdvisorySectors((current) => new Set([...current, ...getInitialExpandedIds(facets.advisory_sectors, selectedAdvisorySectors)]));
  }, [facets.advisory_sectors, selectedAdvisorySectors]);

  useEffect(() => {
    if (!hasNextPage || loading || loadingMore) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        setLoadingMore(true);
        const nextPage = page + 1;
        getAdvisories({
          q: selectedQuery || undefined,
          serviceTypes: selectedServiceTypes,
          advisorySectorIds: selectedAdvisorySectors,
          featured: selectedFeatured,
          page: nextPage,
          pageSize: 12,
        })
          .then((data) => {
            setItems((prev) => [...prev, ...data.results]);
            setHasNextPage(data.pagination.has_next);
            setTotal(data.pagination.total);
            setPage(nextPage);
          })
          .finally(() => setLoadingMore(false));
      },
      { rootMargin: "320px 0px 320px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, loading, loadingMore, page, selectedAdvisorySectors, selectedFeatured, selectedQuery, selectedServiceTypes]);

  const updateParams = (next: URLSearchParams) => {
    const query = next.toString();
    navigate(query ? `/advisories?${query}` : "/advisories");
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

          <div className="catalog-results">
            <div className="catalog-meta">
              <span>{loading ? "Уншиж байна..." : `${items.length} / ${total} үйлчилгээ`}</span>
            </div>

            <div className="catalog-grid advisory-grid">
              {items.map((item) => (
                <article key={item.id} className="catalog-card advisory-card-listing">
                  <div className="catalog-card-media">
                    {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} /> : <div className="catalog-no-image">No image</div>}
                  </div>
                  <div className="catalog-card-body">
                    <h5>
                      <a className="catalog-card-link" href={`/advisories/${item.id}`}>
                        {item.title}
                      </a>
                    </h5>
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

            <div ref={loadMoreRef} className="catalog-load-more">
              {loadingMore ? "Дараагийн мэдээлэл уншиж байна..." : hasNextPage ? "Доош гүйлгэж үргэлжлүүлнэ үү" : "Мэдээлэл байхгүй"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
