// Database types for the Foster Connect Platform - UK Edition

export type AppRole = 'super_admin' | 'regional_manager' | 'agency_admin' | 'user' | 'district_manager' | 'dentist' | 'patient';
export type ClaimStatus = 'unclaimed' | 'pending' | 'claimed';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'expired';
export type AgencySource = 'manual' | 'import' | 'ofsted';
export type ClinicSource = AgencySource; // backward compat
export type EnquiryStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed' | 'spam';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ReviewSentiment = 'positive' | 'negative';
export type SeoPageType = 'region' | 'city' | 'category' | 'city_category' | 'agency';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type AgencyType = 'independent' | 'local_authority';
export type FosteringType = 'emergency' | 'respite' | 'parent_child' | 'therapeutic' | 'long_term' | 'short_term' | 'disability_complex';

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

export interface State {
  id: string;
  name: string;
  slug: string;
  abbreviation: string;
  country_code: string;
  image_url: string | null;
  dentist_count?: number;
  clinic_count?: number;
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
  dentist_count?: number;
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
  dentist_count?: number;
  agency_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city?: City;
}

export interface Treatment {
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

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  city_id: string | null;
  area_id: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
  claim_status: ClaimStatus;
  verification_status: VerificationStatus;
  source: AgencySource;
  owner_id: string | null;
  seo_visible: boolean;
  rank_score: number;
  duplicate_group_id: string | null;
  is_duplicate: boolean;
  is_suspended: boolean;
  is_featured: boolean;
  total_reviews: number;
  average_rating: number;
  total_enquiries: number;
  agency_type: AgencyType | null;
  ofsted_rating: string | null;
  ofsted_urn: string | null;
  age_groups_supported: string[] | null;
  fostering_types: FosteringType[] | null;
  areas_served: string[] | null;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
  verification_expires_at: string | null;
  city?: City;
  area?: Area;
}

export interface Dentist {
  id: string;
  clinic_id: string | null;
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
  clinic?: Clinic;
}

export interface Lead {
  id: string;
  clinic_id: string | null;
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
  clinic?: Clinic;
  treatment?: Treatment;
}

export interface Appointment {
  id: string;
  lead_id: string | null;
  clinic_id: string | null;
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
  clinic?: Clinic;
}

export interface Review {
  id: string;
  clinic_id: string | null;
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
  clinic?: Clinic;
}

export interface Subscription {
  id: string;
  clinic_id: string;
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
  clinic?: Clinic;
}

export interface SeoPage {
  id: string;
  page_type: SeoPageType;
  state_id: string | null;
  city_id: string | null;
  treatment_id: string | null;
  clinic_id: string | null;
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

// Dashboard statistics types
export interface DashboardStats {
  // New naming
  agencies?: {
    total: number;
    unclaimed: number;
    claimed: number;
    verified: number;
    duplicates: number;
  };
  // Legacy naming (backward compat)
  clinics?: {
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
  introCalls?: {
    pending: number;
    confirmed: number;
    noShow: number;
  };
  appointments?: {
    pending: number;
    confirmed: number;
    noShow: number;
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
