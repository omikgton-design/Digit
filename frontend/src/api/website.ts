import { api } from "./client";
import type {
  ArticleDetail,
  ArticleListResponse,
  ArticleQuery,
  AboutSection,
  CreateArticlePayload,
  AdvisoryDetail,
  AdvisoryLikeResponse,
  AdvisoryListResponse,
  AdvisoryQuery,
  Category,
  CreateAdvisoryPayload,
  CreateSoftwarePayload,
  Customer,
  FeaturedArticle,
  FeaturedAdvisory,
  FeaturedSoftware,
  FooterMenuContent,
  HomeSlide,
  PartnerLogo,
  PublicStats,
  RatingResponse,
  SoftwareDetail,
  SoftwareListItem,
  AdvisoryListItem,
  ArticleListItem,
  SoftwareListResponse,
  SoftwareQuery,
} from "../types";

export function getCategories(type?: string) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  return api<{ results: Category[] }>(`/api/categories/${query}`);
}

export function getPublicStats() {
  return api<PublicStats>("/api/stats/");
}

export function getPartners() {
  return api<{ results: PartnerLogo[] }>("/api/partners/");
}

export function getSlides() {
  return api<{ results: HomeSlide[] }>("/api/slides/");
}

export function getAboutSection() {
  return api<AboutSection>("/api/about-section/");
}

export function getFooterContent(key: string) {
  return api<FooterMenuContent>(`/api/footer-contents/${encodeURIComponent(key)}/`);
}

export function getProfile() {
  return api<{ customer: Customer }>("/api/profile/");
}

export function updateProfile(payload: Partial<Customer>) {
  return api<{ customer: Customer }>("/api/profile/", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function uploadProfileLogo(file: File) {
  const body = new FormData();
  body.append("logo", file);
  return api<{ customer: Customer }>("/api/profile/logo/", {
    method: "POST",
    body,
  });
}

export function getFeaturedSoftwares() {
  return api<{ results: FeaturedSoftware[] }>("/api/softwares/featured/");
}

export function getFeaturedAdvisories() {
  return api<{ results: FeaturedAdvisory[] }>("/api/advisories/featured/");
}

export function getFeaturedArticles() {
  return api<{ results: FeaturedArticle[] }>("/api/articles/featured/");
}

export function getSoftwares(query: SoftwareQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  (query.programTypeIds || []).forEach((id) => params.append("program_type", String(id)));
  (query.advisorySectorIds || []).forEach((id) => params.append("advisory_sector", String(id)));
  (query.developerIds || []).forEach((id) => params.append("developer", String(id)));
  (query.priceTypes || []).forEach((value) => params.append("price_type", value));
  if (query.featured) params.set("featured", "1");
  if (query.mine) params.set("mine", "1");
  if (query.page && query.page > 0) params.set("page", String(query.page));
  if (query.pageSize && query.pageSize > 0) params.set("page_size", String(query.pageSize));

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return api<SoftwareListResponse>(`/api/softwares/${suffix}`);
}

export function getSoftwareDetail(id: number) {
  return api<SoftwareDetail>(`/api/softwares/${id}/`);
}

export function rateSoftware(id: number, score: number, comment = "") {
  return api<RatingResponse>(`/api/softwares/${id}/rating/`, {
    method: "POST",
    body: JSON.stringify({ score, comment }),
  });
}

export function createSoftware(payload: CreateSoftwarePayload, images: File[] = []) {
  const body = new FormData();
  body.append("name", payload.name);
  body.append("development_start_year", String(payload.development_start_year));
  body.append("program_type_id", String(payload.program_type_id));
  body.append("price", payload.price);
  body.append("price_type", payload.price_type);
  body.append("introduction", payload.introduction);
  body.append("description", payload.description);
  body.append("advisory_sector_ids", JSON.stringify(payload.advisory_sector_ids));
  images.forEach((image) => body.append("images", image));

  return api<{ software: SoftwareDetail }>("/api/softwares/", {
    method: "POST",
    body,
  });
}

export function updateSoftware(id: number, payload: CreateSoftwarePayload, images: File[] = []) {
  const body = new FormData();
  body.append("name", payload.name);
  body.append("development_start_year", String(payload.development_start_year));
  body.append("program_type_id", String(payload.program_type_id));
  body.append("price", payload.price);
  body.append("price_type", payload.price_type);
  body.append("introduction", payload.introduction);
  body.append("description", payload.description);
  body.append("advisory_sector_ids", JSON.stringify(payload.advisory_sector_ids));
  images.forEach((image) => body.append("images", image));

  return api<{ software: SoftwareDetail }>(`/api/softwares/${id}/`, {
    method: "POST",
    body,
  });
}

export function deleteSoftware(id: number) {
  return api(`/api/softwares/${id}/`, {
    method: "DELETE",
  });
}

export function getAdvisories(query: AdvisoryQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  (query.serviceTypes || []).forEach((value) => params.append("service_type", value));
  (query.advisorySectorIds || []).forEach((id) => params.append("advisory_sector", String(id)));
  (query.companyIds || []).forEach((id) => params.append("company", String(id)));
  if (query.featured) params.set("featured", "1");
  if (query.mine) params.set("mine", "1");
  if (query.page && query.page > 0) params.set("page", String(query.page));
  if (query.pageSize && query.pageSize > 0) params.set("page_size", String(query.pageSize));

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return api<AdvisoryListResponse>(`/api/advisories/${suffix}`);
}

export function getAdvisoryDetail(id: number) {
  return api<AdvisoryDetail>(`/api/advisories/${id}/`);
}

export function rateAdvisory(
  id: number,
  score: number,
  comment = ""
) {
  return api<RatingResponse>(`/api/advisories/${id}/rating/`, {
    method: "POST",
    body: JSON.stringify({ score, comment }),
  });
}

export function createAdvisory(payload: CreateAdvisoryPayload, images: File[] = []) {
  const body = new FormData();
  body.append("title", payload.title);
  body.append("service_type", payload.service_type);
  body.append("service_start_year", String(payload.service_start_year));
  body.append("introduction", payload.introduction);
  body.append("description", payload.description);
  body.append("price_terms", payload.price_terms);
  body.append("price", payload.price);
  body.append("client_organizations", payload.client_organizations);
  body.append("advisory_sector_ids", JSON.stringify(payload.advisory_sector_ids));
  images.forEach((image) => body.append("images", image));

  return api<{ advisory: AdvisoryDetail }>("/api/advisories/", {
    method: "POST",
    body,
  });
}

export function updateAdvisory(id: number, payload: CreateAdvisoryPayload, images: File[] = []) {
  const body = new FormData();
  body.append("title", payload.title);
  body.append("service_type", payload.service_type);
  body.append("service_start_year", String(payload.service_start_year));
  body.append("introduction", payload.introduction);
  body.append("description", payload.description);
  body.append("price_terms", payload.price_terms);
  body.append("price", payload.price);
  body.append("client_organizations", payload.client_organizations);
  body.append("advisory_sector_ids", JSON.stringify(payload.advisory_sector_ids));
  images.forEach((image) => body.append("images", image));

  return api<{ advisory: AdvisoryDetail }>(`/api/advisories/${id}/`, {
    method: "POST",
    body,
  });
}

export function deleteAdvisory(id: number) {
  return api(`/api/advisories/${id}/`, {
    method: "DELETE",
  });
}

export function toggleAdvisoryLike(id: number) {
  return api<AdvisoryLikeResponse>(`/api/advisories/${id}/like/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getArticles(query: ArticleQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  (query.articleTypeIds || []).forEach((id) => params.append("article_type", String(id)));
  (query.organizationIds || []).forEach((id) => params.append("organization", String(id)));
  if (query.featured) params.set("featured", "1");
  if (query.mine) params.set("mine", "1");
  if (query.page && query.page > 0) params.set("page", String(query.page));
  if (query.pageSize && query.pageSize > 0) params.set("page_size", String(query.pageSize));

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return api<ArticleListResponse>(`/api/articles/${suffix}`);
}

export function getArticleDetail(id: number) {
  return api<ArticleDetail>(`/api/articles/${id}/`);
}

export function createArticle(payload: CreateArticlePayload, image?: File | null) {
  const body = new FormData();
  body.append("title", payload.title);
  body.append("article_type_id", String(payload.article_type_id));
  body.append("published_date", payload.published_date);
  body.append("description", payload.description);
  if (image) body.append("image", image);

  return api<{ article: ArticleDetail }>("/api/articles/", {
    method: "POST",
    body,
  });
}

export function updateArticle(id: number, payload: CreateArticlePayload, image?: File | null) {
  const body = new FormData();
  body.append("title", payload.title);
  body.append("article_type_id", String(payload.article_type_id));
  body.append("published_date", payload.published_date);
  body.append("description", payload.description);
  if (image) body.append("image", image);

  return api<{ article: ArticleDetail }>(`/api/articles/${id}/`, {
    method: "POST",
    body,
  });
}

export function deleteArticle(id: number) {
  return api(`/api/articles/${id}/`, {
    method: "DELETE",
  });
}

export type MyRatingItem = {
  id: number;
  type: "software" | "advisory";
  item_id: number;
  name: string;
  logo: string;
  score: number;
  comment: string;
  created_date: string;
  update_date: string;
};

export function getMyRatings() {
  return api<{ results: MyRatingItem[] }>("/api/profile/ratings/");
}

export function deleteSoftwareRating(id: number) {
  return api<{ message: string }>(`/api/softwares/${id}/rating/`, {
    method: "DELETE",
  });
}

export function deleteAdvisoryRating(id: number) {
  return api<{ message: string }>(`/api/advisories/${id}/rating/`, {
    method: "DELETE",
  });
}

export function getMySavedSoftwares() { return api<{ results: SoftwareListItem[] }>("/api/profile/saved-softwares/"); }
export function getMySavedAdvisories() { return api<{ results: AdvisoryListItem[] }>("/api/profile/saved-advisories/"); }
export function getMySavedArticles() { return api<{ results: ArticleListItem[] }>("/api/profile/saved-articles/"); }
export function saveSoftware(id: number) { return api<{saved:boolean}>(`/api/softwares/${id}/save/`, {method:"POST"}); }
export function unsaveSoftware(id: number) { return api<{saved:boolean}>(`/api/softwares/${id}/save/`, {method:"DELETE"}); }
export function saveAdvisory(id: number) { return api<{saved:boolean}>(`/api/advisories/${id}/save/`, {method:"POST"}); }
export function unsaveAdvisory(id: number) { return api<{saved:boolean}>(`/api/advisories/${id}/save/`, {method:"DELETE"}); }
export function saveArticle(id: number) { return api<{saved:boolean}>(`/api/articles/${id}/save/`, {method:"POST"}); }
export function unsaveArticle(id: number) { return api<{saved:boolean}>(`/api/articles/${id}/save/`, {method:"DELETE"}); }
