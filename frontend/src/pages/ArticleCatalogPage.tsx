import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getArticles } from "../api/website";
import type { ArticleFacets, ArticleListItem, AuthResponse, FacetCategory } from "../types";
import { stripRichText } from "../utils/richText";
import { Pagination, readPageParam } from "../components/Pagination";
import { SaveHeartButton } from "../components/SaveHeartButton";
import { useSavedIds } from "../hooks/useSavedIds";

// Эхэнд хамгийн сүүлийн 3 нийтлэлийг тодруулж, үлдсэнийг 9-өөр хуудаслана.
const LATEST_COUNT = 3;
const PAGE_SIZE = 9;

const EMPTY_FACETS: ArticleFacets = {
  article_types: [],
  organizations: [],
};

function parseIdList(params: URLSearchParams, key: string) {
  return params
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => Number(value))
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

function formatPublishedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

type Props = {
  auth?: AuthResponse | null;
};

export function ArticleCatalogPage({ auth = null }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const selectedArticleTypes = useMemo(() => parseIdList(params, "article_type"), [params]);
  const selectedFeatured = params.get("featured") === "1";
  const selectedQuery = params.get("q") || "";
  const page = readPageParam(params);

  const [searchText, setSearchText] = useState(selectedQuery);
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [facets, setFacets] = useState<ArticleFacets>(EMPTY_FACETS);
  const [latest, setLatest] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [expandedArticleTypes, setExpandedArticleTypes] = useState<Set<number>>(new Set());
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const { savedIds, setSaved } = useSavedIds("article", auth);

  useEffect(() => {
    setSearchText(selectedQuery);
  }, [selectedQuery]);

  // Сүүлийн 3 нийтлэл (шүүлтүүртэй уялдана).
  useEffect(() => {
    let cancelled = false;
    getArticles({ q: selectedQuery || undefined, articleTypeIds: selectedArticleTypes, featured: selectedFeatured, page: 1, pageSize: LATEST_COUNT })
      .then((data) => {
        if (cancelled) return;
        setLatest(data.results);
        setFacets(data.facets);
      })
      .catch(() => {
        if (!cancelled) setLatest([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedArticleTypes, selectedFeatured, selectedQuery]);

  // Үлдсэн нийтлэлүүд — хуудаслалттай.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getArticles({
      q: selectedQuery || undefined,
      articleTypeIds: selectedArticleTypes,
      featured: selectedFeatured,
      page,
      pageSize: PAGE_SIZE,
      offset: LATEST_COUNT,
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
  }, [selectedArticleTypes, selectedFeatured, selectedQuery, page]);

  useEffect(() => {
    setExpandedArticleTypes((current) => new Set([...current, ...getInitialExpandedIds(facets.article_types, selectedArticleTypes)]));
  }, [facets.article_types, selectedArticleTypes]);

  const updateParams = (next: URLSearchParams, keepPage = false) => {
    next.delete("organization");
    if (!keepPage) next.delete("page");
    const query = next.toString();
    navigate(query ? `/articles?${query}` : "/articles");
  };

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(location.search);
    if (nextPage > 1) next.set("page", String(nextPage));
    else next.delete("page");
    updateParams(next, true);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderCard = (item: ArticleListItem, extraClass = "") => (
    <a key={item.id} className={`catalog-card article-card-listing catalog-card-anchor ${extraClass}`.trim()} href={`/articles/${item.id}`}>
      <div className="catalog-card-media article-card-media">
        {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} /> : <div className="catalog-no-image">Зураг алга</div>}
        <div className="article-date-badge">{formatPublishedDate(item.update_date)}</div>
        <SaveHeartButton
          kind="article"
          id={item.id}
          auth={auth}
          initialSaved={savedIds.has(item.id)}
          className="catalog-card-save"
          onChange={(saved) => setSaved(item.id, saved)}
        />
      </div>
      <div className="catalog-card-body">
        <h5>{item.title}</h5>
        <p><strong>Төрөл:</strong> {item.article_type.name}</p>
        <p><strong>Байгууллага:</strong> {item.organization.name}</p>
        <p className="article-card-excerpt">{stripRichText(item.description) || "Нийтлэлийн товч тайлбар оруулаагүй."}</p>
      </div>
    </a>
  );

  const toggleFilter = (key: string, value: string) => {
    const next = new URLSearchParams(location.search);
    const existing = new Set(next.getAll(key).flatMap((entry) => entry.split(",")).map((entry) => entry.trim()).filter(Boolean));
    next.delete(key);
    if (existing.has(value)) existing.delete(value);
    else existing.add(value);
    if (existing.size) next.set(key, Array.from(existing).join(","));
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
    <section className="catalog-page article-catalog-page">
      <div className="container">
        <div className="catalog-toolbar">
          <h2>Нийтлэлийн жагсаалт</h2>
          <button type="button" className="catalog-clear" onClick={() => navigate("/articles")}>
            Бүгдийг цэвэрлэх
          </button>
        </div>

        <div className="catalog-layout">
          <aside className="catalog-filters">
            <form className="catalog-search" onSubmit={onSearchSubmit}>
              <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Гарчгаар хайх..." />
              <button type="submit">Хайх</button>
            </form>

            <div className="catalog-filter-group">
              <h6>Нийтлэлийн төрөл</h6>
              {renderTreeFilter(facets.article_types, selectedArticleTypes, expandedArticleTypes, setExpandedArticleTypes, "article_type")}
            </div>

            <div className="catalog-filter-group">
              <label>
                <input type="checkbox" checked={selectedFeatured} onChange={toggleFeatured} />
                <span>Онцлох нийтлэл</span>
              </label>
            </div>
          </aside>

          <div className="catalog-results" ref={resultsRef}>
            <div className="catalog-meta">
              <span>{loading ? "Уншиж байна..." : `Нийт ${total + latest.length} нийтлэл`}</span>
            </div>

            {latest.length ? (
              <>
                <h6 className="article-section-label">Сүүлийн нийтлэлүүд</h6>
                <div className="catalog-grid article-grid article-latest-grid">
                  {latest.map((item) => renderCard(item, "is-latest"))}
                </div>
              </>
            ) : null}

            {items.length ? (
              <>
                <h6 className="article-section-label">Бусад нийтлэлүүд</h6>
                <div className="catalog-grid article-grid">
                  {items.map((item) => renderCard(item))}
                </div>
              </>
            ) : null}

            {!loading && !latest.length && !items.length ? <div className="catalog-load-more">Мэдээлэл олдсонгүй.</div> : null}
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={goToPage} />
          </div>
        </div>
      </div>
    </section>
  );
}
