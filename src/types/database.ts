// Database types for the Foster Care Platform - UK Edition

// User roles for the platform
export type AppRole = 
  | 'super_admin'           // Platform owner - full access
  | 'agency_admin'         // Fostering agency admin
  | 'agency_staff'         // Agency staff / supervising social worker
  | 'foster_carer'         // Registered foster carrier
  | 'applicant'           // Prospective foster carrier / applicant
  | 'trainer'              // Training provider / expert
  | 'local_authority'     // LA user for placement requests
  | 'auditor';             // Read-only auditor

// User status
export type UserStatus = 'active' | 'invited' | 'suspended' | 'archived';

// Organisation types
export type OrganisationType = 
  | 'fostering_agency'     // Independent fostering agency
  | 'local_authority'     // Local authority
  | 'training_provider'   // Training company
  | 'platform';           // Platform itself
export type ClaimStatus = 'unclaimed' | 'pending' | 'claimed';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'expired';
export type AgencySource = 'manual' | 'import' | 'ofsted' | 'gmb';
export type EnquiryStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed' | 'spam';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ReviewSentiment = 'positive' | 'negative';
export type SeoPageType = 'region' | 'city' | 'category' | 'city_category' | 'agency' | 'static' | 'treatment' | 'service' | 'service_location' | 'blog' | 'neighborhood';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type AgencyType = 'independent' | 'local_authority';
export type FosteringTypeEnum = 'emergency' | 'respite' | 'parent_child' | 'therapeutic' | 'long_term' | 'short_term' | 'disability_complex';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// Organisation (agencies, local authorities, training providers)
export interface Organisation {
  id: string;
  name: string;
  slug: string;
  type: OrganisationType;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Agency-specific profile (extends Organisation for fostering agencies)
export interface AgencyProfile {
  id: string;
  organisation_id: string;
  ofsted_urn: string | null;
  ofsted_rating: string | null;
  ofsted_inspection_date: string | null;
  company_number: string | null;
  charity_number: string | null;
  established_year: number | null;
  description: string | null;
  services_offered: string[] | null;
  age_groups_supported: string[] | null;
  fostering_types_supported: FosteringTypeEnum[] | null;
  areas_served: string[] | null;
  approved_trainer: boolean;
  has_therapeutic_team: boolean;
  created_at: string;
  updated_at: string;
  organisation?: Organisation;
}

// Foster Carer profile
export interface FosterCarerProfile {
  id: string;
  user_id: string;
  organisation_id: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  postcode: string | null;
  phone: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'deregistered';
  approval_type: string | null;
  approval_date: string | null;
  panel_date: string | null;
  qualifications: string[] | null;
  languages: string[] | null;
  has_car: boolean;
  has_own_home: boolean;
  can_accommodate_pets: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  organisation?: Organisation;
}

// Applicant / Prospective Foster Carer profile
export interface ApplicantProfile {
  id: string;
  user_id: string;
  organisation_id: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  address: string | null;
  postcode: string | null;
  phone: string | null;
  application_stage: 'enquiry' | 'initial_check' | 'assessment' | 'panel' | 'approved' | 'rejected';
  enquiry_date: string | null;
  application_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Trainer profile
export interface TrainerProfile {
  id: string;
  user_id: string;
  organisation_id: string | null;
  first_name: string | null;
  last_name: string | null;
  specialisms: string[] | null;
  qualifications: string[] | null;
  bio: string | null;
  hourly_rate: number | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Local Authority profile
export interface LocalAuthorityProfile {
  id: string;
  organisation_id: string;
  la_code: string | null;
  contact_department: string | null;
  created_at: string;
  updated_at: string;
  organisation?: Organisation;
}

// Permission definitions
export interface Permission {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  created_at: string;
}

// Role permission assignments
export interface RolePermission {
  id: string;
  role: AppRole;
  permission_slug: string;
  created_at: string;
}

// User status tracking
export interface UserStatusLog {
  id: string;
  user_id: string;
  old_status: UserStatus | null;
  new_status: UserStatus;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

// User activity log
export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface State {
  id: string;
  name: string;
  slug: string;
  abbreviation: string;
  country_code: string;
  image_url: string | null;
  foster_carer_count?: number;
  agency_count?: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state_id: string | null;
  country: string;
  image_url: string | null;
  foster_carer_count?: number;
  agency_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  state?: State;
}

export interface Area {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  foster_carer_count?: number;
  agency_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city?: City;
}

export interface FosteringType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export type AgencyStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
export type AgencyListingStatus = 'unlisted' | 'listed' | 'featured' | 'promoted';

export interface Agency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  main_image_url: string | null;
  cover_image_url: string | null;
  email: string | null;
  phone: string | null;
  international_phone: string | null;
  website: string | null;
  city_id: string | null;
  area_id: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
  google_place_id: string | null;
  google_resource_name: string | null;
  google_maps_url: string | null;
  google_website_url: string | null;
  claim_status: ClaimStatus;
  verification_status: VerificationStatus;
  status: AgencyStatus;
  listing_status: AgencyListingStatus;
  source: AgencySource;
  owner_id: string | null;
  seo_visible: boolean;
  rank_score: number;
  duplicate_group_id: string | null;
  is_duplicate: boolean;
  is_suspended: boolean;
  is_featured: boolean;
  duplicate_of_id: string | null;
  total_reviews: number;
  average_rating: number;
  total_enquiries: number;
  rating: number | null;
  review_count: number | null;
  agency_type: AgencyType | null;
  ofsted_rating: string | null;
  ofsted_urn: string | null;
  age_groups_supported: string[] | null;
  fostering_types: FosteringTypeEnum[] | null;
  areas_served: string[] | null;
  short_description: string | null;
  full_description: string | null;
  editorial_summary: string | null;
  google_primary_type: string | null;
  google_types: string[] | null;
  business_status: string | null;
  price_level: string | null;
  utc_offset_minutes: number | null;
  imported_at: string | null;
  last_synced_at: string | null;
  import_source: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  noindex: boolean;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
  verification_expires_at: string | null;
  city?: City;
  area?: Area;
}

export interface AgencyPhoto {
  id: string;
  agency_id: string;
  photo_type: 'logo' | 'main' | 'gallery' | 'team' | 'facility' | 'other';
  google_photo_name: string | null;
  google_photo_reference: string | null;
  photo_url: string | null;
  local_url: string | null;
  width: number | null;
  height: number | null;
  attribution: string | null;
  is_primary: boolean;
  is_verified: boolean;
  source: string;
  display_order: number;
  imported_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyOpeningHours {
  id: string;
  agency_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  is_24_hours: boolean;
  is_special_hours: boolean;
  special_date: string | null;
  weekday_text: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface AgencyReview {
  id: string;
  agency_id: string;
  source: 'google' | 'trustpilot' | 'facebook' | 'manual';
  source_review_id: string | null;
  reviewer_name: string | null;
  reviewer_profile_url: string | null;
  reviewer_photo_url: string | null;
  rating: number;
  review_text: string | null;
  review_language: string | null;
  review_time: string | null;
  relative_time_description: string | null;
  is_verified: boolean;
  is_displayed: boolean;
  display_order: number;
  imported_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ImportJobType = 'search' | 'import_new' | 'import_update' | 'import_photos' | 'import_hours' | 'import_reviews' | 'sync_all' | 'recheck';
export type ImportJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface ImportJob {
  id: string;
  job_type: ImportJobType;
  status: ImportJobStatus;
  filters_json: Record<string, any>;
  requested_by_user_id: string | null;
  total_queries: number;
  total_results_found: number;
  total_imported: number;
  total_updated: number;
  total_duplicates: number;
  total_failed: number;
  api_calls_used: number;
  started_at: string | null;
  completed_at: string | null;
  error_summary: string | null;
  created_at: string;
  updated_at: string;
}

export type ImportResultStatus = 'imported' | 'updated' | 'duplicate' | 'skipped' | 'failed' | 'needs_review';
export type MatchConfidence = 'high' | 'medium' | 'low';

export interface ImportJobResult {
  id: string;
  import_job_id: string;
  google_place_id: string | null;
  agency_id: string | null;
  business_name: string | null;
  status: ImportResultStatus;
  match_confidence: MatchConfidence | null;
  action_taken: string | null;
  error_message: string | null;
  raw_result: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Carer {
  id: string;
  agency_id: string | null;
  user_id: string | null;
  name: string;
  slug: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  qualifications: string[] | null;
  experience_years: number | null;
  languages: string[] | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  is_featured: boolean;
  total_reviews: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  agency?: Agency;
}

export interface Lead {
  id: string;
  agency_id: string | null;
  category_id: string | null;
  enquirer_name: string;
  enquirer_email: string | null;
  enquirer_phone: string;
  message: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: EnquiryStatus;
  notes: string | null;
  is_spam: boolean;
  fostering_interest: string | null;
  location_preference: string | null;
  experience_level: string | null;
  created_at: string;
  updated_at: string;
  contacted_at: string | null;
  converted_at: string | null;
  agency?: Agency;
  fostering_type?: FosteringType;
}

export interface Enquiry {
  id: string;
  lead_id: string | null;
  agency_id: string | null;
  enquirer_name: string;
  enquirer_email: string | null;
  enquirer_phone: string;
  preferred_date: string | null;
  preferred_time: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  status: string;
  notes: string | null;
  admin_notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  agency?: Agency;
}

export interface Review {
  id: string;
  agency_id: string | null;
  reviewer_id: string | null;
  reviewer_name: string;
  reviewer_email: string | null;
  rating: number | null;
  title: string | null;
  content: string | null;
  initial_sentiment: ReviewSentiment | null;
  status: ReviewStatus;
  rejection_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  is_verified: boolean;
  is_featured: boolean;
  source: string;
  created_at: string;
  updated_at: string;
  agency?: Agency;
}

export interface Subscription {
  id: string;
  agency_id: string;
  plan_name: string;
  price_gbp: number;
  status: SubscriptionStatus;
  starts_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  is_manual_override: boolean;
  override_reason: string | null;
  override_by: string | null;
  created_at: string;
  updated_at: string;
  agency?: Agency;
}

export interface SeoPage {
  id: string;
  page_type: SeoPageType;
  state_id: string | null;
  city_id: string | null;
  fostering_type_id: string | null;
  agency_id: string | null;
  slug: string;
  title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  content: string | null;
  is_indexed: boolean;
  is_published: boolean;
  is_optimized: boolean;
  is_thin_content: boolean;
  is_duplicate: boolean;
  ai_suggestions: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DashboardStats {
  agencies?: {
    total: number;
    unclaimed: number;
    claimed: number;
    verified: number;
    duplicates: number;
  };
  enquiries?: {
    today: number;
    week: number;
    month: number;
  };
  leads?: {
    today: number;
    week: number;
    month: number;
  };
  reviews: {
    pending: number;
    approved: number;
    rejected: number;
  };
  revenue: {
    activeSubscriptions: number;
    monthlyRevenue: number;
  };
}
