import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAdvisories, getArticles, getSoftwares } from "../api/website";
import type { AdvisoryListItem, ArticleListItem, SoftwareListItem } from "../types";
import { RatingControl } from "../components/RatingControl";
import { stripRichText } from "../utils/richText";

type SearchResults = {
  softwares: SoftwareListItem[];
  advisories: AdvisoryListItem[];
  articles: ArticleListItem[];
  totals: {
    softwares: number;
    advisories: number;
    articles: number;
  };
};

const EMPTY_RESULTS: SearchResults = {
  softwares: [],
  advisories: [],
  articles: [],
  totals: {
    softwares: 0,
    advisories: 0,
    articles: 0,
  },
};

function formatPublishedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(location.search).get("q")?.trim() || "", [location.search]);
  const [searchText, setSearchText] = useState(query);
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchText(query);
    if (!query) {
      setResults(EMPTY_RESULTS);
      return;
    }

    setLoading(true);
    setError("");
    Promise.all([
      getSoftwares({ q: query, page: 1, pageSize: 6 }),
      getAdvisories({ q: query, page: 1, pageSize: 6 }),
      getArticles({ q: query, page: 1, pageSize: 6 }),
    ])
      .then(([softwareData, advisoryData, articleData]) => {
        setResults({
          softwares: softwareData.results,
          advisories: advisoryData.results,
          articles: articleData.results,
          totals: {
            softwares: softwareData.pagination.total,
            advisories: advisoryData.pagination.total,
            articles: articleData.pagination.total,
          },
        });
      })
      .catch(() => {
        setResults(EMPTY_RESULTS);
        setError("Хайлтын үр дүн авахад алдаа гарлаа.");
      })
      .finally(() => setLoading(false));
  }, [query]);

  const totalResults = results.totals.softwares + results.totals.advisories + results.totals.articles;

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchText.trim();
    navigate(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search");
  };

  return (
    <section className="catalog-page search-page">
      <div className="container">
        <div className="search-page-head">
          <form className="global-search-form" onSubmit={submitSearch}>
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Програм, зөвлөх үйлчилгээ, нийтлэл хайх..." />
            <button type="submit">Хайх</button>
          </form>
          <div className="catalog-meta">
            {loading ? "Уншиж байна..." : query ? `"${query}" хайлтаар ${totalResults} үр дүн олдлоо` : "Хайх үгээ оруулна уу"}
          </div>
          {error ? <div className="form-message error">{error}</div> : null}
        </div>

        <div className="search-summary">
          <span>Програм: {results.totals.softwares}</span>
          <span>Зөвлөх үйлчилгээ: {results.totals.advisories}</span>
          <span>Нийтлэл: {results.totals.articles}</span>
        </div>

        <SearchSection title="Програм хангамж" total={results.totals.softwares} viewAllUrl={`/softwares?q=${encodeURIComponent(query)}`}>
          {results.softwares.map((item) => (
            <article key={item.id} className="catalog-card">
              <div className="catalog-card-media">
                {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.name} /> : <div className="catalog-no-image">No image</div>}
              </div>
              <div className="catalog-card-body">
                <h5><Link className="catalog-card-link" to={`/softwares/${item.id}`}>{item.name}</Link></h5>
                <RatingControl average={item.rating_average} count={item.rating_count} userRating={item.user_rating} compact />
                <p><strong>Төрөл:</strong> {item.program_type.name}</p>
                <p><strong>Хөгжүүлэгч:</strong> {item.developer.name}</p>
                <p className="catalog-intro">{stripRichText(item.introduction) || "Товч танилцуулга оруулаагүй."}</p>
              </div>
            </article>
          ))}
        </SearchSection>

        <SearchSection title="Зөвлөх үйлчилгээ" total={results.totals.advisories} viewAllUrl={`/advisories?q=${encodeURIComponent(query)}`}>
          {results.advisories.map((item) => (
            <article key={item.id} className="catalog-card advisory-card-listing">
              <div className="catalog-card-media">
                {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} /> : <div className="catalog-no-image">No image</div>}
              </div>
              <div className="catalog-card-body">
                <h5><Link className="catalog-card-link" to={`/advisories/${item.id}`}>{item.title}</Link></h5>
                <RatingControl average={item.rating_average} count={item.rating_count} userRating={item.user_rating} compact />
                <p><strong>Төрөл:</strong> {item.service_type}</p>
                <p><strong>Байгууллага:</strong> {item.company.name}</p>
                <p className="catalog-intro">{stripRichText(item.introduction) || "Товч танилцуулга оруулаагүй."}</p>
              </div>
            </article>
          ))}
        </SearchSection>

        <SearchSection title="Нийтлэл" total={results.totals.articles} viewAllUrl={`/articles?q=${encodeURIComponent(query)}`}>
          {results.articles.map((item) => (
            <article key={item.id} className="catalog-card article-card-listing">
              <div className="catalog-card-media article-card-media">
                {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} /> : <div className="catalog-no-image">No image</div>}
                <div className="article-date-badge">{formatPublishedDate(item.update_date)}</div>
              </div>
              <div className="catalog-card-body">
                <h5><Link className="catalog-card-link" to={`/articles/${item.id}`}>{item.title}</Link></h5>
                <p><strong>Төрөл:</strong> {item.article_type.name}</p>
                <p><strong>Байгууллага:</strong> {item.organization.name}</p>
                <p className="article-card-excerpt">{stripRichText(item.description) || "Нийтлэлийн товч тайлбар оруулаагүй."}</p>
              </div>
            </article>
          ))}
        </SearchSection>
      </div>
    </section>
  );
}

function SearchSection({
  title,
  total,
  viewAllUrl,
  children,
}: {
  title: string;
  total: number;
  viewAllUrl: string;
  children: React.ReactNode;
}) {
  return (
    <section className="search-section">
      <div className="search-section-head">
        <h3>{title}</h3>
        <div>
          <span>{total}</span>
          {total > 6 ? <Link to={viewAllUrl}>Бүгдийг харах</Link> : null}
        </div>
      </div>
      {total ? <div className="catalog-grid search-grid">{children}</div> : <div className="search-empty">Үр дүн олдсонгүй.</div>}
    </section>
  );
}
