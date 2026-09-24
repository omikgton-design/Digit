export type AccountType = "org" | "person";
export type CustomerType = "gold" | "silver" | "bronze";

export interface UserInfo {
  id: number;
  email: string;
  username: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  contact_person_name: string;
  contact_person_phone: string;
  account_type: AccountType;
  type: CustomerType;
  logo_url: string;
}

export interface AuthResponse {
  authenticated?: boolean;
  user: UserInfo | null;
  customer: Customer | null;
}

export interface Category {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
}

export interface PublicStats {
  users: number;
  softwares: number;
  advisories: number;
  articles: number;
}

export interface PartnerLogo {
  id: number;
  name: string;
  link_url: string;
  logo_url: string;
}

export interface HomeSlide {
  id: number;
  partner_label: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  sort_order: number;
}

export interface AboutSection {
  id: number;
  kicker: string;
  title: string;
  description: string;
  feature_title: string;
  feature_text: string;
  button_text: string;
  button_url: string;
  circle_right_text: string;
  circle_left_text: string;
  top_image_url: string;
  bottom_image_url: string;
  sort_order: number;
}

export interface FooterMenuContent {
  key: string;
  title: string;
  content: string;
  image_url: string;
  update_date: string;
}

export interface RatingSummary {
  rating_average: number;
  rating_count: number;
  user_rating: number | null;
}

export type RatingResponse = RatingSummary;

export interface FeaturedSoftware extends RatingSummary {
  id: number;
  name: string;
  program_type: string;
  advisory_sectors: string[];
  developer: string;
  price: string;
  price_type: "rent" | "sale";
  introduction: string;
  thumbnail_url: string;
}

export interface SoftwareListItem extends RatingSummary {
  id: number;
  name: string;
  program_type: { id: number; name: string };
  advisory_sectors: { id: number; name: string }[];
  developer: { id: number; name: string };
  price: string;
  price_type: "rent" | "sale";
  is_approved: boolean;
  is_featured: boolean;
  introduction: string;
  thumbnail_url: string;
}

export interface SoftwareDetail extends RatingSummary {
  id: number;
  name: string;
  program_type: { id: number; name: string };
  advisory_sectors: { id: number; name: string }[];
  developer: { id: number; name: string };
  price: string;
  price_type: "rent" | "sale";
  is_approved: boolean;
  is_featured: boolean;
  development_start_year: number;
  introduction: string;
  description: string;
  thumbnail_url: string;
  images: string[];
  related?: SoftwareListItem[];
}

export interface FacetCategory {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface SoftwareFacets {
  program_types: FacetCategory[];
  advisory_sectors: FacetCategory[];
  developers: { id: number; name: string }[];
  price_types: { id: string; name: string }[];
}

export interface SoftwareListResponse {
  results: SoftwareListItem[];
  facets: SoftwareFacets;
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
  };
}

export interface SoftwareQuery {
  q?: string;
  programTypeIds?: number[];
  advisorySectorIds?: number[];
  developerIds?: number[];
  priceTypes?: ("rent" | "sale")[];
  featured?: boolean;
  mine?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateSoftwarePayload {
  name: string;
  development_start_year: number;
  program_type_id: number;
  advisory_sector_ids: number[];
  price: string;
  price_type: "rent" | "sale";
  introduction: string;
  description: string;
}

export interface FeaturedAdvisory extends RatingSummary {
  id: number;
  title: string;
  service_type: string;
  advisory_sectors: string[];
  company: string;
  introduction: string;
  price_terms: string;
  price: string;
  like_count: number;
  liked: boolean;
  thumbnail_url: string;
}

export interface FeaturedArticle {
  id: number;
  title: string;
  article_type_id: number;
  article_type: string;
  organization: string;
  published_date: string;
  update_date: string;
  description: string;
  thumbnail_url: string;
}

export interface AdvisoryListItem extends RatingSummary {
  id: number;
  title: string;
  service_type: string;
  service_type_value: string;
  advisory_sectors: { id: number; name: string }[];
  company: { id: number; name: string };
  introduction: string;
  price_terms: string;
  price: string;
  like_count: number;
  liked: boolean;
  thumbnail_url: string;
  is_approved: boolean;
  is_featured: boolean;
}

export interface AdvisoryDetail extends RatingSummary {
  id: number;
  title: string;
  service_type: string;
  service_type_value: string;
  advisory_sectors: { id: number; name: string }[];
  service_start_year: number;
  company: { id: number; name: string };
  introduction: string;
  description: string;
  price_terms: string;
  price_terms_value: string;
  price: string;
  client_organizations: string;
  like_count: number;
  liked: boolean;
  thumbnail_url: string;
  images: string[];
  is_approved: boolean;
  is_featured: boolean;
  related?: AdvisoryListItem[];
}

export interface AdvisoryLikeResponse {
  liked: boolean;
  like_count: number;
}

export interface AdvisoryFacets {
  service_types: { id: string; name: string }[];
  advisory_sectors: FacetCategory[];
  companies: { id: number; name: string }[];
  price_terms: { id: string; name: string }[];
}

export interface AdvisoryListResponse {
  results: AdvisoryListItem[];
  facets: AdvisoryFacets;
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
  };
}

export interface AdvisoryQuery {
  q?: string;
  serviceTypes?: string[];
  advisorySectorIds?: number[];
  companyIds?: number[];
  featured?: boolean;
  mine?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateAdvisoryPayload {
  title: string;
  service_type: string;
  advisory_sector_ids: number[];
  service_start_year: number;
  introduction: string;
  description: string;
  price_terms: string;
  price: string;
  client_organizations: string;
}

export interface ArticleListItem {
  id: number;
  title: string;
  article_type: { id: number; name: string };
  organization: { id: number; name: string };
  published_date: string;
  update_date: string;
  description: string;
  thumbnail_url: string;
  is_approved: boolean;
  is_featured: boolean;
}

export interface ArticleDetail {
  id: number;
  title: string;
  article_type: { id: number; name: string };
  organization: { id: number; name: string };
  published_date: string;
  update_date: string;
  description: string;
  thumbnail_url: string;
  image_url: string;
  is_approved: boolean;
  is_featured: boolean;
  related?: ArticleListItem[];
}

export interface CreateArticlePayload {
  title: string;
  article_type_id: number;
  published_date: string;
  description: string;
}

export interface ArticleFacets {
  article_types: FacetCategory[];
  organizations: { id: number; name: string }[];
}

export interface ArticleListResponse {
  results: ArticleListItem[];
  facets: ArticleFacets;
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
  };
}

export interface ArticleQuery {
  q?: string;
  articleTypeIds?: number[];
  organizationIds?: number[];
  featured?: boolean;
  mine?: boolean;
  page?: number;
  pageSize?: number;
}
