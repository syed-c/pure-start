-- ============================================================
-- AppointPanda Complete Schema - Generated 2026-02-28
-- Fully idempotent: creates what's missing, skips what exists.
-- Pattern: CREATE TABLE (id only) + ALTER TABLE ADD COLUMN IF NOT EXISTS
-- ============================================================

-- =====================
-- 1. ENUM TYPES
-- =====================
DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('super_admin','district_manager','dentist','patient'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','completed','cancelled','no_show'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.claim_status AS ENUM ('unclaimed','pending','claimed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.clinic_source AS ENUM ('manual','gmb','import'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.lead_status AS ENUM ('new','contacted','qualified','converted','lost','spam'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.review_sentiment AS ENUM ('positive','negative'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.review_status AS ENUM ('pending','approved','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.seo_page_type AS ENUM ('state','city','treatment','city_treatment','clinic','blog','neighborhood','service','service_location'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.subscription_status AS ENUM ('active','expired','cancelled','pending'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.verification_status AS ENUM ('unverified','pending','verified','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================
-- 2. TABLES (create minimal + add columns)
-- =====================

-- countries
CREATE TABLE IF NOT EXISTS public.countries (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS code text NOT NULL DEFAULT '';
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- states
CREATE TABLE IF NOT EXISTS public.states (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS abbreviation text NOT NULL DEFAULT '';
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'US';
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS dentist_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS clinic_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS seo_status text;
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS page_exists boolean DEFAULT false;
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.states ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- cities
CREATE TABLE IF NOT EXISTS public.cities (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS state_id uuid;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'US';
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS dentist_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS seo_status text DEFAULT 'draft';
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS country_id uuid;
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- areas
CREATE TABLE IF NOT EXISTS public.areas (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS city_id uuid;
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS dentist_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- treatments
CREATE TABLE IF NOT EXISTS public.treatments (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- insurances
CREATE TABLE IF NOT EXISTS public.insurances (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS insurance_type text DEFAULT 'local';
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS coverage_notes text;
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS verification_required boolean DEFAULT false;
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.insurances ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS price_gbp numeric DEFAULT 0;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS price_aed numeric DEFAULT 0;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'monthly';
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS features jsonb;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS price_monthly numeric DEFAULT 0;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS price_yearly numeric;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- clinics
CREATE TABLE IF NOT EXISTS public.clinics (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS city_id uuid;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS area_id uuid;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS google_place_id text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS claim_status claim_status NOT NULL DEFAULT 'unclaimed';
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS claimed_by uuid;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS claimed_at timestamptz;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS verification_status verification_status NOT NULL DEFAULT 'unverified';
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS source clinic_source NOT NULL DEFAULT 'manual';
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS seo_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS rank_score integer NOT NULL DEFAULT 0;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS duplicate_group_id text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS is_duplicate boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS gmb_data jsonb;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS total_reviews integer NOT NULL DEFAULT 0;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS average_rating numeric NOT NULL DEFAULT 0;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 0;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS total_leads integer NOT NULL DEFAULT 0;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS opening_hours jsonb;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS photos jsonb;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS location_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS location_pending_approval boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS gmb_connected boolean DEFAULT false;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS is_active_listing boolean DEFAULT true;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- dentists
CREATE TABLE IF NOT EXISTS public.dentists (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS qualifications text[];
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS experience_years integer;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS languages text[];
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS total_reviews integer NOT NULL DEFAULT 0;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS average_rating numeric NOT NULL DEFAULT 0;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS professional_type text DEFAULT 'dentist';
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS years_experience integer;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS specializations text[];
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.dentists ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- patients
CREATE TABLE IF NOT EXISTS public.patients (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_opted_in_sms boolean DEFAULT false;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS last_visit_at timestamptz;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS first_visit_at timestamptz;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS total_visits integer DEFAULT 0;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_opted_in_whatsapp boolean DEFAULT false;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS insurance_provider text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS insurance_member_id text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS medical_notes text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS preferred_contact text DEFAULT 'phone';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_deleted_by_dentist boolean DEFAULT false;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- leads
CREATE TABLE IF NOT EXISTS public.leads (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS dentist_id uuid;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS treatment_id uuid;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS patient_name text NOT NULL DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS patient_email text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS patient_phone text NOT NULL DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status lead_status NOT NULL DEFAULT 'new';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_spam boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contacted_at timestamptz;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS converted_at timestamptz;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- appointments
CREATE TABLE IF NOT EXISTS public.appointments (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS lead_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS dentist_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS treatment_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_name text NOT NULL DEFAULT '';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_email text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_phone text NOT NULL DEFAULT '';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS preferred_date text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS preferred_time text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS confirmed_date text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS confirmed_time text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status appointment_status NOT NULL DEFAULT 'pending';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS is_disputed boolean NOT NULL DEFAULT false;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS is_assigned boolean DEFAULT true;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS manage_token text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS booking_page_path text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS booking_session_id text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS start_datetime timestamptz;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS end_datetime timestamptz;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS role app_role NOT NULL DEFAULT 'applicant';
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- user_onboarding
CREATE TABLE IF NOT EXISTS public.user_onboarding (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'pending';
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS step_completed integer DEFAULT 0;
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}';
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- user_permission_overrides
CREATE TABLE IF NOT EXISTS public.user_permission_overrides (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS permission text NOT NULL DEFAULT '';
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS granted boolean NOT NULL DEFAULT true;
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS granted_by uuid;
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS permission_key text;
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS is_granted boolean DEFAULT true;
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- user_tab_permissions
CREATE TABLE IF NOT EXISTS public.user_tab_permissions (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.user_tab_permissions ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.user_tab_permissions ADD COLUMN IF NOT EXISTS tab_key text NOT NULL DEFAULT '';
ALTER TABLE public.user_tab_permissions ADD COLUMN IF NOT EXISTS is_enabled boolean DEFAULT true;
ALTER TABLE public.user_tab_permissions ADD COLUMN IF NOT EXISTS can_access boolean DEFAULT true;
ALTER TABLE public.user_tab_permissions ADD COLUMN IF NOT EXISTS granted_by uuid;
ALTER TABLE public.user_tab_permissions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.user_tab_permissions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- district_assignments
CREATE TABLE IF NOT EXISTS public.district_assignments (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.district_assignments ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.district_assignments ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.district_assignments ADD COLUMN IF NOT EXISTS area text;
ALTER TABLE public.district_assignments ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- global_settings
CREATE TABLE IF NOT EXISTS public.global_settings (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS key text NOT NULL DEFAULT '';
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS value jsonb;
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_role text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action text NOT NULL DEFAULT '';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_type text NOT NULL DEFAULT '';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_id text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS old_values jsonb;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS new_values jsonb;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- ai_events
CREATE TABLE IF NOT EXISTS public.ai_events (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT '';
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT '';
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS triggered_by text NOT NULL DEFAULT 'system';
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS confidence_score numeric;
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- ai_errors
CREATE TABLE IF NOT EXISTS public.ai_errors (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.ai_errors ADD COLUMN IF NOT EXISTS event_id uuid;
ALTER TABLE public.ai_errors ADD COLUMN IF NOT EXISTS error_code text;
ALTER TABLE public.ai_errors ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.ai_errors ADD COLUMN IF NOT EXISTS context_data jsonb;
ALTER TABLE public.ai_errors ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.ai_errors ADD COLUMN IF NOT EXISTS resolved boolean NOT NULL DEFAULT false;
ALTER TABLE public.ai_errors ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- ai_feedback
CREATE TABLE IF NOT EXISTS public.ai_feedback (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.ai_feedback ADD COLUMN IF NOT EXISTS event_id uuid;
ALTER TABLE public.ai_feedback ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.ai_feedback ADD COLUMN IF NOT EXISTS action text NOT NULL DEFAULT '';
ALTER TABLE public.ai_feedback ADD COLUMN IF NOT EXISTS feedback_notes text;
ALTER TABLE public.ai_feedback ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- ai_inputs
CREATE TABLE IF NOT EXISTS public.ai_inputs (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.ai_inputs ADD COLUMN IF NOT EXISTS event_id uuid;
ALTER TABLE public.ai_inputs ADD COLUMN IF NOT EXISTS input_type text NOT NULL DEFAULT '';
ALTER TABLE public.ai_inputs ADD COLUMN IF NOT EXISTS input_data jsonb DEFAULT '{}';
ALTER TABLE public.ai_inputs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- ai_outputs
CREATE TABLE IF NOT EXISTS public.ai_outputs (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.ai_outputs ADD COLUMN IF NOT EXISTS event_id uuid;
ALTER TABLE public.ai_outputs ADD COLUMN IF NOT EXISTS output_type text NOT NULL DEFAULT '';
ALTER TABLE public.ai_outputs ADD COLUMN IF NOT EXISTS output_data jsonb DEFAULT '{}';
ALTER TABLE public.ai_outputs ADD COLUMN IF NOT EXISTS explanation text;
ALTER TABLE public.ai_outputs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- ai_module_settings
CREATE TABLE IF NOT EXISTS public.ai_module_settings (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.ai_module_settings ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT '';
ALTER TABLE public.ai_module_settings ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.ai_module_settings ADD COLUMN IF NOT EXISTS config jsonb DEFAULT '{}';
ALTER TABLE public.ai_module_settings ADD COLUMN IF NOT EXISTS thresholds jsonb DEFAULT '{}';
ALTER TABLE public.ai_module_settings ADD COLUMN IF NOT EXISTS last_run_at timestamptz;
ALTER TABLE public.ai_module_settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.ai_module_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ai_prompt_templates
CREATE TABLE IF NOT EXISTS public.ai_prompt_templates (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT '';
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS prompt_template text NOT NULL DEFAULT '';
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS input_schema jsonb;
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS output_schema jsonb;
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.ai_prompt_templates ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ai_search_logs
CREATE TABLE IF NOT EXISTS public.ai_search_logs (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.ai_search_logs ADD COLUMN IF NOT EXISTS original_query text;
ALTER TABLE public.ai_search_logs ADD COLUMN IF NOT EXISTS extracted_intent jsonb;
ALTER TABLE public.ai_search_logs ADD COLUMN IF NOT EXISTS results_count integer DEFAULT 0;
ALTER TABLE public.ai_search_logs ADD COLUMN IF NOT EXISTS search_duration_ms integer DEFAULT 0;
ALTER TABLE public.ai_search_logs ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.ai_search_logs ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE public.ai_search_logs ADD COLUMN IF NOT EXISTS fallback_used boolean DEFAULT false;
ALTER TABLE public.ai_search_logs ADD COLUMN IF NOT EXISTS clicked_result_id text;
ALTER TABLE public.ai_search_logs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- ai_search_settings
CREATE TABLE IF NOT EXISTS public.ai_search_settings (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.ai_search_settings ADD COLUMN IF NOT EXISTS setting_key text NOT NULL DEFAULT '';
ALTER TABLE public.ai_search_settings ADD COLUMN IF NOT EXISTS setting_value jsonb;
ALTER TABLE public.ai_search_settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.ai_search_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- appointment_types
CREATE TABLE IF NOT EXISTS public.appointment_types (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 30;
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS price_from numeric;
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS price_to numeric;
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B82F6';
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.appointment_types ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- automation_rules
CREATE TABLE IF NOT EXISTS public.automation_rules (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS trigger_type text NOT NULL DEFAULT '';
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS trigger_config jsonb;
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS action_type text NOT NULL DEFAULT '';
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS action_config jsonb;
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS run_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS last_run_at timestamptz;
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS rule_type text;
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS is_enabled boolean DEFAULT true;
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- automation_logs
CREATE TABLE IF NOT EXISTS public.automation_logs (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS rule_id uuid;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'success';
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS details jsonb;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS executed_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- availability_blocks
CREATE TABLE IF NOT EXISTS public.availability_blocks (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.availability_blocks ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.availability_blocks ADD COLUMN IF NOT EXISTS start_datetime timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.availability_blocks ADD COLUMN IF NOT EXISTS end_datetime timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.availability_blocks ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE public.availability_blocks ADD COLUMN IF NOT EXISTS block_type text DEFAULT 'manual';
ALTER TABLE public.availability_blocks ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- blog_authors
CREATE TABLE IF NOT EXISTS public.blog_authors (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS post_count integer DEFAULT 0;
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS role text DEFAULT 'author';
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.blog_authors ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- blog_categories
CREATE TABLE IF NOT EXISTS public.blog_categories (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS color text DEFAULT '#6366f1';
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS post_count integer DEFAULT 0;
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- blog_content_templates
CREATE TABLE IF NOT EXISTS public.blog_content_templates (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS content_structure jsonb NOT NULL DEFAULT '[]';
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS target_word_count integer DEFAULT 1500;
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS seo_guidelines text;
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS example_titles text[];
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0;
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.blog_content_templates ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- blog_topic_clusters
CREATE TABLE IF NOT EXISTS public.blog_topic_clusters (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.blog_topic_clusters ADD COLUMN IF NOT EXISTS cluster_name text NOT NULL DEFAULT '';
ALTER TABLE public.blog_topic_clusters ADD COLUMN IF NOT EXISTS primary_keyword text NOT NULL DEFAULT '';
ALTER TABLE public.blog_topic_clusters ADD COLUMN IF NOT EXISTS related_keywords text[] DEFAULT '{}';
ALTER TABLE public.blog_topic_clusters ADD COLUMN IF NOT EXISTS pillar_page_slug text;
ALTER TABLE public.blog_topic_clusters ADD COLUMN IF NOT EXISTS intent_type text;
ALTER TABLE public.blog_topic_clusters ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.blog_topic_clusters ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS excerpt text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_id uuid;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- booking_notifications
CREATE TABLE IF NOT EXISTS public.booking_notifications (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.booking_notifications ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.booking_notifications ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.booking_notifications ADD COLUMN IF NOT EXISTS appointment_id uuid;
ALTER TABLE public.booking_notifications ADD COLUMN IF NOT EXISTS notification_type text NOT NULL DEFAULT 'booking';
ALTER TABLE public.booking_notifications ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.booking_notifications ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.booking_notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE public.booking_notifications ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- budget_ranges
CREATE TABLE IF NOT EXISTS public.budget_ranges (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.budget_ranges ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT '';
ALTER TABLE public.budget_ranges ADD COLUMN IF NOT EXISTS min_value numeric;
ALTER TABLE public.budget_ranges ADD COLUMN IF NOT EXISTS max_value numeric;
ALTER TABLE public.budget_ranges ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AED';
ALTER TABLE public.budget_ranges ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.budget_ranges ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.budget_ranges ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.budget_ranges ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- claim_requests
CREATE TABLE IF NOT EXISTS public.claim_requests (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS verification_method text;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS verification_code text;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS verification_sent_at timestamptz;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS business_email text;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS business_phone text;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS documents jsonb;
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.claim_requests ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- clinic_automation_settings
CREATE TABLE IF NOT EXISTS public.clinic_automation_settings (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS is_messaging_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS reminder_1_day boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS reminder_7_day boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS auto_review_request boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS welcome_message_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS daily_message_limit integer DEFAULT 50;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS reminder_2_days boolean DEFAULT false;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS reminder_3_hours boolean DEFAULT false;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS reminder_channel text DEFAULT 'sms';
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS followup_enabled boolean DEFAULT false;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS review_request_enabled boolean DEFAULT false;
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.clinic_automation_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- clinic_hours
CREATE TABLE IF NOT EXISTS public.clinic_hours (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.clinic_hours ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_hours ADD COLUMN IF NOT EXISTS day_of_week integer NOT NULL DEFAULT 0;
ALTER TABLE public.clinic_hours ADD COLUMN IF NOT EXISTS open_time text;
ALTER TABLE public.clinic_hours ADD COLUMN IF NOT EXISTS close_time text;
ALTER TABLE public.clinic_hours ADD COLUMN IF NOT EXISTS is_closed boolean DEFAULT false;
ALTER TABLE public.clinic_hours ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- clinic_images
CREATE TABLE IF NOT EXISTS public.clinic_images (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.clinic_images ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_images ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '';
ALTER TABLE public.clinic_images ADD COLUMN IF NOT EXISTS alt_text text;
ALTER TABLE public.clinic_images ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.clinic_images ADD COLUMN IF NOT EXISTS is_cover boolean DEFAULT false;
ALTER TABLE public.clinic_images ADD COLUMN IF NOT EXISTS caption text;
ALTER TABLE public.clinic_images ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- clinic_insurances
CREATE TABLE IF NOT EXISTS public.clinic_insurances (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.clinic_insurances ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_insurances ADD COLUMN IF NOT EXISTS insurance_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_insurances ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- clinic_messages
CREATE TABLE IF NOT EXISTS public.clinic_messages (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT 'outbound';
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'sms';
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS recipient_phone text;
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS message_content text;
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS template_type text;
ALTER TABLE public.clinic_messages ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- clinic_oauth_tokens
CREATE TABLE IF NOT EXISTS public.clinic_oauth_tokens (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'google';
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS access_token text;
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS refresh_token text;
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS token_expires_at timestamptz;
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS gmb_data jsonb;
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS gmb_connected boolean DEFAULT false;
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS gmb_last_sync_at timestamptz;
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS gmb_booking_link_enabled boolean DEFAULT false;
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS gmb_booking_link_id text;
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS gmb_booking_link_set_at timestamptz;
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.clinic_oauth_tokens ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- clinic_subscriptions
CREATE TABLE IF NOT EXISTS public.clinic_subscriptions (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS plan_id uuid;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS status subscription_status NOT NULL DEFAULT 'pending';
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS starts_at timestamptz;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS is_manual_override boolean NOT NULL DEFAULT false;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS override_reason text;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS override_by uuid;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle text;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS amount_paid numeric;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS next_billing_date timestamptz;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.clinic_subscriptions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- clinic_treatments
CREATE TABLE IF NOT EXISTS public.clinic_treatments (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.clinic_treatments ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_treatments ADD COLUMN IF NOT EXISTS treatment_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_treatments ADD COLUMN IF NOT EXISTS price_aed numeric;
ALTER TABLE public.clinic_treatments ADD COLUMN IF NOT EXISTS price_from numeric;
ALTER TABLE public.clinic_treatments ADD COLUMN IF NOT EXISTS price_to numeric;
ALTER TABLE public.clinic_treatments ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- comparison_pages
CREATE TABLE IF NOT EXISTS public.comparison_pages (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS page_type text NOT NULL DEFAULT '';
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS h1 text;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS treatment_id uuid;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS state_id_1 uuid;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS state_id_2 uuid;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS city_id_1 uuid;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS city_id_2 uuid;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS is_indexed boolean DEFAULT true;
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.comparison_pages ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- contact_submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- crm_numbers
CREATE TABLE IF NOT EXISTS public.crm_numbers (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.crm_numbers ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.crm_numbers ADD COLUMN IF NOT EXISTS phone_number text NOT NULL DEFAULT '';
ALTER TABLE public.crm_numbers ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'twilio';
ALTER TABLE public.crm_numbers ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.crm_numbers ADD COLUMN IF NOT EXISTS is_whatsapp_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.crm_numbers ADD COLUMN IF NOT EXISTS assigned_at timestamptz;
ALTER TABLE public.crm_numbers ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.crm_numbers ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- dentist_availability_rules
CREATE TABLE IF NOT EXISTS public.dentist_availability_rules (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS day_of_week integer NOT NULL DEFAULT 0;
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS start_time text NOT NULL DEFAULT '09:00';
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS end_time text NOT NULL DEFAULT '17:00';
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS break_start text;
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS break_end text;
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS slot_duration_minutes integer DEFAULT 30;
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS buffer_minutes integer DEFAULT 0;
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.dentist_availability_rules ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- dentist_settings
CREATE TABLE IF NOT EXISTS public.dentist_settings (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS booking_enabled boolean DEFAULT false;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS auto_confirm boolean DEFAULT false;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_email text;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_phone text;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS working_hours jsonb;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS settings jsonb;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS allow_same_day_booking boolean DEFAULT false;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS min_advance_booking_hours integer DEFAULT 24;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS max_advance_booking_days integer DEFAULT 30;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS confirmation_email_enabled boolean DEFAULT true;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS reminder_sms_enabled boolean DEFAULT false;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_new_appointment boolean DEFAULT true;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_form_submission boolean DEFAULT true;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_cancellation boolean DEFAULT true;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_message boolean DEFAULT true;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_channel_email boolean DEFAULT true;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_channel_whatsapp boolean DEFAULT false;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_channel_dashboard boolean DEFAULT true;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_email_secondary text;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS notification_whatsapp_number text;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS booking_require_approval boolean;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS allow_guest_booking boolean;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS reminder_hours_before integer;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS cancellation_policy text;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS booking_notes text;
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.dentist_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- editorial_calendar
CREATE TABLE IF NOT EXISTS public.editorial_calendar (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'idea';
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS assigned_to text;
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS topic_cluster_id uuid;
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS target_keyword text;
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS secondary_keywords text[];
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'blog_post';
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS target_word_count integer DEFAULT 1500;
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS scheduled_date date;
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS published_date date;
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS template_id uuid;
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.editorial_calendar ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- email_enrichment_sessions
CREATE TABLE IF NOT EXISTS public.email_enrichment_sessions (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS state_id uuid;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS city_id uuid;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS total_to_process integer DEFAULT 0;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS processed integer DEFAULT 0;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS found_emails integer DEFAULT 0;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS errors integer DEFAULT 0;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS needs_review_count integer DEFAULT 0;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS processed_count integer DEFAULT 0;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS success_count integer DEFAULT 0;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS skipped_count integer DEFAULT 0;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS failed_count integer DEFAULT 0;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.email_enrichment_sessions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- email_enrichment_results
CREATE TABLE IF NOT EXISTS public.email_enrichment_results (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS session_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS found_email text;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS match_confidence numeric;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS needs_review boolean DEFAULT false;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS applied_at timestamptz;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS emails_found text[];
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS email_selected text;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS match_method text;
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.email_enrichment_results ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- email_templates
CREATE TABLE IF NOT EXISTS public.email_templates (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT '';
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS html_content text NOT NULL DEFAULT '';
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS text_content text;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS variables jsonb;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS plain_content text;
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- feature_registry
CREATE TABLE IF NOT EXISTS public.feature_registry (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.feature_registry ADD COLUMN IF NOT EXISTS feature_key text NOT NULL DEFAULT '';
ALTER TABLE public.feature_registry ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.feature_registry ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.feature_registry ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.feature_registry ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.feature_registry ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- form_workflow_settings
CREATE TABLE IF NOT EXISTS public.form_workflow_settings (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS trigger_event text DEFAULT 'booking_confirmed';
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS form_sequence jsonb DEFAULT '[]';
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS delivery_destinations jsonb DEFAULT '{"email": true, "dashboard": true, "google_drive": false}';
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS require_otp_verification boolean DEFAULT false;
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS capture_ip_address boolean DEFAULT false;
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.form_workflow_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- gmb_link_requests
CREATE TABLE IF NOT EXISTS public.gmb_link_requests (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.gmb_link_requests ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.gmb_link_requests ADD COLUMN IF NOT EXISTS initiated_by uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.gmb_link_requests ADD COLUMN IF NOT EXISTS token text NOT NULL DEFAULT gen_random_uuid()::text;
ALTER TABLE public.gmb_link_requests ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.gmb_link_requests ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '1 hour');
ALTER TABLE public.gmb_link_requests ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- gmb_scraper_sessions
CREATE TABLE IF NOT EXISTS public.gmb_scraper_sessions (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'running';
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS state_id uuid;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS city_ids uuid[];
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS total_results integer DEFAULT 0;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS imported integer DEFAULT 0;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS duplicates integer DEFAULT 0;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS errors integer DEFAULT 0;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS state_name text;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS total_found integer DEFAULT 0;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS imported_count integer DEFAULT 0;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS duplicate_count integer DEFAULT 0;
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.gmb_scraper_sessions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- gmb_scraper_results
CREATE TABLE IF NOT EXISTS public.gmb_scraper_results (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS session_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS place_id text;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS rating numeric;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS raw_data jsonb;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS import_status text DEFAULT 'pending';
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.gmb_scraper_results ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- google_oauth_accounts
CREATE TABLE IF NOT EXISTS public.google_oauth_accounts (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.google_oauth_accounts ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.google_oauth_accounts ADD COLUMN IF NOT EXISTS google_email text;
ALTER TABLE public.google_oauth_accounts ADD COLUMN IF NOT EXISTS access_token text;
ALTER TABLE public.google_oauth_accounts ADD COLUMN IF NOT EXISTS refresh_token text;
ALTER TABLE public.google_oauth_accounts ADD COLUMN IF NOT EXISTS token_expires_at timestamptz;
ALTER TABLE public.google_oauth_accounts ADD COLUMN IF NOT EXISTS gmb_connected boolean DEFAULT false;
ALTER TABLE public.google_oauth_accounts ADD COLUMN IF NOT EXISTS scopes text[];
ALTER TABLE public.google_oauth_accounts ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.google_oauth_accounts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- google_reviews
CREATE TABLE IF NOT EXISTS public.google_reviews (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS google_review_id text;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS reviewer_name text;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS reviewer_photo_url text;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS rating integer;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS comment text;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS reply text;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS reply_status text DEFAULT 'none';
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS review_time timestamptz;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS text_content text;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS author_photo_url text;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS reply_text text;
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS synced_at timestamptz DEFAULT now();
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- insurance_service_coverage
CREATE TABLE IF NOT EXISTS public.insurance_service_coverage (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS insurance_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS treatment_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS coverage_percentage integer;
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS coverage_notes text;
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS is_covered boolean DEFAULT true;
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS max_claim_aed numeric;
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS waiting_period_days integer DEFAULT 0;
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.insurance_service_coverage ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- intake_form_templates
CREATE TABLE IF NOT EXISTS public.intake_form_templates (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.intake_form_templates ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.intake_form_templates ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.intake_form_templates ADD COLUMN IF NOT EXISTS form_type text NOT NULL DEFAULT 'general';
ALTER TABLE public.intake_form_templates ADD COLUMN IF NOT EXISTS fields jsonb DEFAULT '[]';
ALTER TABLE public.intake_form_templates ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.intake_form_templates ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.intake_form_templates ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.intake_form_templates ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- internal_reviews
CREATE TABLE IF NOT EXISTS public.internal_reviews (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS dentist_id uuid;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS patient_name text NOT NULL DEFAULT '';
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS patient_email text;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS rating numeric;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS initial_sentiment review_sentiment;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS status review_status NOT NULL DEFAULT 'pending';
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS moderated_by uuid;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS is_verified_patient boolean NOT NULL DEFAULT false;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website';
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS comment text;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS is_fake_suspected boolean DEFAULT false;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS fake_review_reason text;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS hipaa_flagged boolean DEFAULT false;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS ai_suggested_reply text;
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.internal_reviews ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- lead_quotas
CREATE TABLE IF NOT EXISTS public.lead_quotas (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.lead_quotas ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.lead_quotas ADD COLUMN IF NOT EXISTS plan_id uuid;
ALTER TABLE public.lead_quotas ADD COLUMN IF NOT EXISTS quota_limit integer NOT NULL DEFAULT 50;
ALTER TABLE public.lead_quotas ADD COLUMN IF NOT EXISTS leads_used integer NOT NULL DEFAULT 0;
ALTER TABLE public.lead_quotas ADD COLUMN IF NOT EXISTS period_start timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.lead_quotas ADD COLUMN IF NOT EXISTS period_end timestamptz NOT NULL DEFAULT (now() + interval '30 days');
ALTER TABLE public.lead_quotas ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.lead_quotas ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- messaging_templates
CREATE TABLE IF NOT EXISTS public.messaging_templates (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.messaging_templates ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.messaging_templates ADD COLUMN IF NOT EXISTS template_type text NOT NULL DEFAULT '';
ALTER TABLE public.messaging_templates ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'sms';
ALTER TABLE public.messaging_templates ADD COLUMN IF NOT EXISTS content text NOT NULL DEFAULT '';
ALTER TABLE public.messaging_templates ADD COLUMN IF NOT EXISTS variables jsonb;
ALTER TABLE public.messaging_templates ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.messaging_templates ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.messaging_templates ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- outreach_campaigns
CREATE TABLE IF NOT EXISTS public.outreach_campaigns (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS template_id uuid;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS target_filter jsonb;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS schedule_config jsonb;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS max_sends_per_day integer DEFAULT 50;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS max_sends_per_clinic integer DEFAULT 3;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS total_sent integer DEFAULT 0;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS total_opened integer DEFAULT 0;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS total_clicked integer DEFAULT 0;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS total_replied integer DEFAULT 0;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS last_run_at timestamptz;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.outreach_campaigns ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- outreach_sends
CREATE TABLE IF NOT EXISTS public.outreach_sends (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS campaign_id uuid;
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS opened_at timestamptz;
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS clicked_at timestamptz;
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS replied_at timestamptz;
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.outreach_sends ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- page_content
CREATE TABLE IF NOT EXISTS public.page_content (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS page_slug text NOT NULL DEFAULT '';
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS page_type text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS content jsonb;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS reference_id text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS keywords text[];
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS og_image text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS noindex boolean DEFAULT false;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS h1 text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS hero_subtitle text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS hero_intro text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS hero_image text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS hero_stats jsonb;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS section_1_title text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS section_1_content text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS section_2_title text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS section_2_content text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS section_3_title text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS section_3_content text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS body_content text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS cta_text text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS cta_button_text text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS cta_button_url text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS faqs jsonb;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS featured_image text;
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS gallery_images text[];
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- page_translations
CREATE TABLE IF NOT EXISTS public.page_translations (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS seo_page_id uuid;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS language_code text NOT NULL DEFAULT '';
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS h1 text;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS faq jsonb;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS translation_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS quality_score numeric;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS quality_notes text;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS translated_at timestamptz;
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.page_translations ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- page_views
CREATE TABLE IF NOT EXISTS public.page_views (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS page_url text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS page_type text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS entity_id uuid;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS visitor_id text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS viewed_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS page_path text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS visitor_session_id uuid;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS page_title text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS city_slug text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS state_slug text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS treatment_slug text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS dentist_id uuid;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS time_on_page_seconds integer;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS scroll_depth_percent integer;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS exit_page boolean DEFAULT false;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- patient_form_submissions
CREATE TABLE IF NOT EXISTS public.patient_form_submissions (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS template_id uuid;
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS patient_name text;
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS patient_email text;
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS patient_phone text;
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS form_data jsonb DEFAULT '{}';
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS access_token text;
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.patient_form_submissions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- pending_areas
CREATE TABLE IF NOT EXISTS public.pending_areas (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS city_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS area_name text NOT NULL DEFAULT '';
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS suggested_name text;
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS suggested_slug text;
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS submitted_by uuid;
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS clinic_id_ref uuid;
ALTER TABLE public.pending_areas ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- pinned_clinics
CREATE TABLE IF NOT EXISTS public.pinned_clinics (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.pinned_clinics ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.pinned_clinics ADD COLUMN IF NOT EXISTS city_id uuid;
ALTER TABLE public.pinned_clinics ADD COLUMN IF NOT EXISTS area_id uuid;
ALTER TABLE public.pinned_clinics ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.pinned_clinics ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.pinned_clinics ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- plan_features
CREATE TABLE IF NOT EXISTS public.plan_features (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.plan_features ADD COLUMN IF NOT EXISTS plan_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.plan_features ADD COLUMN IF NOT EXISTS feature_key text NOT NULL DEFAULT '';
ALTER TABLE public.plan_features ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.plan_features ADD COLUMN IF NOT EXISTS usage_limit integer;
ALTER TABLE public.plan_features ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- platform_alerts
CREATE TABLE IF NOT EXISTS public.platform_alerts (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.platform_alerts ADD COLUMN IF NOT EXISTS alert_type text NOT NULL DEFAULT '';
ALTER TABLE public.platform_alerts ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.platform_alerts ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.platform_alerts ADD COLUMN IF NOT EXISTS severity text NOT NULL DEFAULT 'info';
ALTER TABLE public.platform_alerts ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;
ALTER TABLE public.platform_alerts ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.platform_alerts ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- platform_notifications
CREATE TABLE IF NOT EXISTS public.platform_notifications (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS message text NOT NULL DEFAULT '';
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'system';
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS severity text NOT NULL DEFAULT 'info';
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS action_type text;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS action_url text;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS action_data jsonb;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS entity_type text;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS entity_id text;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS is_dismissed boolean DEFAULT false;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.platform_notifications ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- profile_analytics
CREATE TABLE IF NOT EXISTS public.profile_analytics (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.profile_analytics ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.profile_analytics ADD COLUMN IF NOT EXISTS metric_type text NOT NULL DEFAULT '';
ALTER TABLE public.profile_analytics ADD COLUMN IF NOT EXISTS metric_value integer DEFAULT 0;
ALTER TABLE public.profile_analytics ADD COLUMN IF NOT EXISTS period_start timestamptz;
ALTER TABLE public.profile_analytics ADD COLUMN IF NOT EXISTS period_end timestamptz;
ALTER TABLE public.profile_analytics ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.profile_analytics ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.profile_analytics ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- provider_verifications
CREATE TABLE IF NOT EXISTS public.provider_verifications (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS verification_type text NOT NULL DEFAULT 'email';
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS verification_code text;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS contact_info text;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS dentist_id uuid;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS verified_by uuid;
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]';
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.provider_verifications ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- reputation_kpis
CREATE TABLE IF NOT EXISTS public.reputation_kpis (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.reputation_kpis ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.reputation_kpis ADD COLUMN IF NOT EXISTS date date NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.reputation_kpis ADD COLUMN IF NOT EXISTS metric_name text NOT NULL DEFAULT '';
ALTER TABLE public.reputation_kpis ADD COLUMN IF NOT EXISTS metric_value numeric DEFAULT 0;
ALTER TABLE public.reputation_kpis ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.reputation_kpis ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- review_clicks
CREATE TABLE IF NOT EXISTS public.review_clicks (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.review_clicks ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.review_clicks ADD COLUMN IF NOT EXISTS action text NOT NULL DEFAULT '';
ALTER TABLE public.review_clicks ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.review_clicks ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.review_clicks ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- review_funnel_events
CREATE TABLE IF NOT EXISTS public.review_funnel_events (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.review_funnel_events ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.review_funnel_events ADD COLUMN IF NOT EXISTS review_request_id uuid;
ALTER TABLE public.review_funnel_events ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT '';
ALTER TABLE public.review_funnel_events ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.review_funnel_events ADD COLUMN IF NOT EXISTS rating integer;
ALTER TABLE public.review_funnel_events ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.review_funnel_events ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- review_requests
CREATE TABLE IF NOT EXISTS public.review_requests (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS clinic_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS patient_name text;
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS patient_phone text;
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS patient_email text;
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS channel text DEFAULT 'sms';
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS recipient_name text;
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.review_requests ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- role_presets
CREATE TABLE IF NOT EXISTS public.role_presets (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.role_presets ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.role_presets ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT '';
ALTER TABLE public.role_presets ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]';
ALTER TABLE public.role_presets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.role_presets ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
ALTER TABLE public.role_presets ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;
ALTER TABLE public.role_presets ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.role_presets ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- schema_settings
CREATE TABLE IF NOT EXISTS public.schema_settings (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.schema_settings ADD COLUMN IF NOT EXISTS setting_key text NOT NULL DEFAULT '';
ALTER TABLE public.schema_settings ADD COLUMN IF NOT EXISTS setting_value jsonb;
ALTER TABLE public.schema_settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.schema_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- seo_content_versions
CREATE TABLE IF NOT EXISTS public.seo_content_versions (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS seo_page_id uuid;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS version_number integer DEFAULT 1;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS quality_score numeric;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS word_count integer;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS generated_by text;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS h1 text;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS seo_score numeric;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS faq jsonb;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS change_source text;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS change_reason text;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS is_current boolean DEFAULT false;
ALTER TABLE public.seo_content_versions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- seo_fix_jobs
CREATE TABLE IF NOT EXISTS public.seo_fix_jobs (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS job_type text NOT NULL DEFAULT '';
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS filters jsonb;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS regeneration_config jsonb;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS target_word_count integer DEFAULT 0;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS apply_mode text DEFAULT 'draft';
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS quality_threshold numeric DEFAULT 0;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS total_pages integer DEFAULT 0;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS processed_pages integer DEFAULT 0;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS successful_pages integer DEFAULT 0;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS failed_pages integer DEFAULT 0;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.seo_fix_jobs ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- seo_fix_job_items
CREATE TABLE IF NOT EXISTS public.seo_fix_job_items (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS job_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS seo_page_id uuid;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS old_content text;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS new_content text;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS quality_score numeric;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS page_slug text;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS page_type text;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS before_snapshot jsonb;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS after_snapshot jsonb;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS word_count_before integer;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS word_count_after integer;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS changes_summary text;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS applied_at timestamptz;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS before_score numeric;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS after_score numeric;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS is_applied boolean DEFAULT false;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS is_rolled_back boolean DEFAULT false;
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.seo_fix_job_items ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- seo_metadata_history
CREATE TABLE IF NOT EXISTS public.seo_metadata_history (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS seo_page_id uuid;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS field_name text NOT NULL DEFAULT '';
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS old_value text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS new_value text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS changed_by uuid;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS change_source text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS page_id uuid;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS previous_title text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS previous_meta_description text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS new_title text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS new_meta_description text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS batch_id text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS status text DEFAULT 'applied';
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS reverted_at timestamptz;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS reverted_by text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS previous_h1 text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS new_h1 text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS change_reason text;
ALTER TABLE public.seo_metadata_history ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- seo_pages
CREATE TABLE IF NOT EXISTS public.seo_pages (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS page_type seo_page_type NOT NULL DEFAULT 'city';
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS state_id uuid;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS city_id uuid;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS treatment_id uuid;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS h1 text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS is_indexed boolean NOT NULL DEFAULT true;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS is_thin_content boolean NOT NULL DEFAULT false;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS is_duplicate boolean NOT NULL DEFAULT false;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS ai_suggestions jsonb;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS word_count integer;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS seo_score numeric;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS og_title text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS og_description text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS page_intro text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS h2_sections jsonb;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS internal_links_intro text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS faqs jsonb;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS is_optimized boolean DEFAULT false;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS needs_optimization boolean DEFAULT false;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS last_audited_at timestamptz;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS optimized_at timestamptz;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS last_generated_at timestamptz;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS last_crawled_at timestamptz;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS noindex_reason text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS similarity_score numeric;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS similar_to_slug text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS metadata_hash text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS generation_version integer;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS page_intent_type text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS structure_template integer DEFAULT 1;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS identity_score integer DEFAULT 0;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS local_authenticity_score integer DEFAULT 0;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS page_value_score integer DEFAULT 0;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS ai_sounding_score integer DEFAULT 0;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS is_index_worthy boolean DEFAULT true;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS index_block_reason text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS last_identity_scan_at timestamptz;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS content_fingerprint text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS meta_fingerprint text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS structure_fingerprint text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS boilerplate_cluster_id text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS rewrite_priority text DEFAULT 'none';
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS editorial_status text DEFAULT 'pending';
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS last_content_edit_source text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS last_meta_edit_source text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS last_faq_edit_source text;
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.seo_pages ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- seo_tasks
CREATE TABLE IF NOT EXISTS public.seo_tasks (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS task_type text NOT NULL DEFAULT '';
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS entity_type text;
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS entity_id uuid;
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS dismissed_at timestamptz;
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.seo_tasks ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- service_price_ranges
CREATE TABLE IF NOT EXISTS public.service_price_ranges (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS treatment_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS state_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS price_min numeric NOT NULL DEFAULT 0;
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS price_max numeric NOT NULL DEFAULT 0;
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'AED';
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS avg_price numeric;
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS source text DEFAULT 'market_research';
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.service_price_ranges ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- slot_locks
CREATE TABLE IF NOT EXISTS public.slot_locks (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.slot_locks ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.slot_locks ADD COLUMN IF NOT EXISTS start_datetime timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.slot_locks ADD COLUMN IF NOT EXISTS end_datetime timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.slot_locks ADD COLUMN IF NOT EXISTS locked_by_user_id uuid;
ALTER TABLE public.slot_locks ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.slot_locks ADD COLUMN IF NOT EXISTS converted_to_appointment_id uuid;
ALTER TABLE public.slot_locks ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- static_page_cache
CREATE TABLE IF NOT EXISTS public.static_page_cache (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.static_page_cache ADD COLUMN IF NOT EXISTS path text NOT NULL DEFAULT '';
ALTER TABLE public.static_page_cache ADD COLUMN IF NOT EXISTS page_type text;
ALTER TABLE public.static_page_cache ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.static_page_cache ADD COLUMN IF NOT EXISTS generated_at timestamptz DEFAULT now();
ALTER TABLE public.static_page_cache ADD COLUMN IF NOT EXISTS is_stale boolean DEFAULT false;
ALTER TABLE public.static_page_cache ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT '';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS assigned_to uuid;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- support_ticket_replies
CREATE TABLE IF NOT EXISTS public.support_ticket_replies (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.support_ticket_replies ADD COLUMN IF NOT EXISTS ticket_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.support_ticket_replies ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.support_ticket_replies ADD COLUMN IF NOT EXISTS content text NOT NULL DEFAULT '';
ALTER TABLE public.support_ticket_replies ADD COLUMN IF NOT EXISTS is_admin_reply boolean DEFAULT false;
ALTER TABLE public.support_ticket_replies ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.support_ticket_replies ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false;
ALTER TABLE public.support_ticket_replies ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- supported_languages
CREATE TABLE IF NOT EXISTS public.supported_languages (code text NOT NULL DEFAULT '');
ALTER TABLE public.supported_languages ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.supported_languages ADD COLUMN IF NOT EXISTS native_name text NOT NULL DEFAULT '';
ALTER TABLE public.supported_languages ADD COLUMN IF NOT EXISTS is_rtl boolean NOT NULL DEFAULT false;
ALTER TABLE public.supported_languages ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.supported_languages ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.supported_languages ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- translation_queue
CREATE TABLE IF NOT EXISTS public.translation_queue (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.translation_queue ADD COLUMN IF NOT EXISTS seo_page_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.translation_queue ADD COLUMN IF NOT EXISTS language_code text NOT NULL DEFAULT '';
ALTER TABLE public.translation_queue ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 5;
ALTER TABLE public.translation_queue ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'queued';
ALTER TABLE public.translation_queue ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.translation_queue ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 3;
ALTER TABLE public.translation_queue ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.translation_queue ADD COLUMN IF NOT EXISTS processed_at timestamptz;
ALTER TABLE public.translation_queue ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- visitor_events
CREATE TABLE IF NOT EXISTS public.visitor_events (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.visitor_events ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.visitor_events ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT '';
ALTER TABLE public.visitor_events ADD COLUMN IF NOT EXISTS visitor_id text;
ALTER TABLE public.visitor_events ADD COLUMN IF NOT EXISTS page_url text;
ALTER TABLE public.visitor_events ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE public.visitor_events ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.visitor_events ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- visitor_sessions
CREATE TABLE IF NOT EXISTS public.visitor_sessions (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS visitor_id text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS session_start timestamptz DEFAULT now();
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS session_end timestamptz;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS pages_viewed integer DEFAULT 0;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS ip_hash text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS session_duration_seconds integer DEFAULT 0;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS linked_at timestamptz;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS patient_name text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS os text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS visitor_fingerprint text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS landing_page text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS total_pageviews integer DEFAULT 0;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS total_events integer DEFAULT 0;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS patient_email text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS patient_phone text;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE public.visitor_sessions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- visitor_journeys
CREATE TABLE IF NOT EXISTS public.visitor_journeys (id uuid NOT NULL DEFAULT gen_random_uuid());
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS session_id text NOT NULL DEFAULT '';
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS visitor_session_id uuid;
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS journey_stage text NOT NULL DEFAULT '';
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS page_path text NOT NULL DEFAULT '';
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS dentist_id uuid;
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS step_number integer DEFAULT 1;
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS converted boolean DEFAULT false;
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS appointment_id uuid;
ALTER TABLE public.visitor_journeys ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- =====================
-- 3. FUNCTIONS
-- =====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','district_manager'))
$$;

CREATE OR REPLACE FUNCTION public.owns_clinic(_user_id uuid, _clinic_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.clinics WHERE id = _clinic_id AND claimed_by = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _override RECORD; _role_perms TEXT[];
BEGIN
  SELECT * INTO _override FROM public.user_permission_overrides
  WHERE user_id = _user_id AND permission_key = _permission AND (expires_at IS NULL OR expires_at > now());
  IF FOUND THEN RETURN _override.is_granted; END IF;
  IF has_role(_user_id, 'super_admin') THEN RETURN true; END IF;
  SELECT (value->>ur.role::TEXT)::TEXT[] INTO _role_perms
  FROM public.global_settings gs, public.user_roles ur
  WHERE gs.key = 'role_permissions' AND ur.user_id = _user_id LIMIT 1;
  IF _role_perms IS NOT NULL AND ('*' = ANY(_role_perms) OR _permission = ANY(_role_perms)) THEN RETURN true; END IF;
  RETURN false;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.booking_notifications (appointment_id, title, message, notification_type, user_id)
  VALUES (NEW.id, 'New Booking Request', 'New appointment request from ' || NEW.patient_name, 'new_booking', COALESCE((SELECT claimed_by FROM clinics WHERE id = NEW.clinic_id), gen_random_uuid()));
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.set_audit_log_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.user_role IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT ur.role::text INTO NEW.user_role FROM public.user_roles ur WHERE ur.user_id = NEW.user_id LIMIT 1;
  END IF;
  RETURN NEW;
END; $$;

-- =====================
-- 4. PRIMARY KEYS
-- =====================
DO $$ BEGIN ALTER TABLE ONLY public.countries ADD CONSTRAINT countries_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.states ADD CONSTRAINT states_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.cities ADD CONSTRAINT cities_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.areas ADD CONSTRAINT areas_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.treatments ADD CONSTRAINT treatments_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.insurances ADD CONSTRAINT insurances_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.subscription_plans ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinics ADD CONSTRAINT clinics_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.dentists ADD CONSTRAINT dentists_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.patients ADD CONSTRAINT patients_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.leads ADD CONSTRAINT leads_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.appointments ADD CONSTRAINT appointments_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.user_onboarding ADD CONSTRAINT user_onboarding_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.user_permission_overrides ADD CONSTRAINT user_permission_overrides_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.user_tab_permissions ADD CONSTRAINT user_tab_permissions_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.district_assignments ADD CONSTRAINT district_assignments_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.global_settings ADD CONSTRAINT global_settings_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_events ADD CONSTRAINT ai_events_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_errors ADD CONSTRAINT ai_errors_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_feedback ADD CONSTRAINT ai_feedback_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_inputs ADD CONSTRAINT ai_inputs_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_outputs ADD CONSTRAINT ai_outputs_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_module_settings ADD CONSTRAINT ai_module_settings_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_prompt_templates ADD CONSTRAINT ai_prompt_templates_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_search_logs ADD CONSTRAINT ai_search_logs_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_search_settings ADD CONSTRAINT ai_search_settings_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.appointment_types ADD CONSTRAINT appointment_types_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.automation_rules ADD CONSTRAINT automation_rules_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.automation_logs ADD CONSTRAINT automation_logs_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.availability_blocks ADD CONSTRAINT availability_blocks_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.blog_authors ADD CONSTRAINT blog_authors_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.blog_categories ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.blog_content_templates ADD CONSTRAINT blog_content_templates_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.blog_topic_clusters ADD CONSTRAINT blog_topic_clusters_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.blog_posts ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.booking_notifications ADD CONSTRAINT booking_notifications_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.budget_ranges ADD CONSTRAINT budget_ranges_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.claim_requests ADD CONSTRAINT claim_requests_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_automation_settings ADD CONSTRAINT clinic_automation_settings_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_hours ADD CONSTRAINT clinic_hours_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_images ADD CONSTRAINT clinic_images_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_insurances ADD CONSTRAINT clinic_insurances_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_messages ADD CONSTRAINT clinic_messages_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_oauth_tokens ADD CONSTRAINT clinic_oauth_tokens_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_subscriptions ADD CONSTRAINT clinic_subscriptions_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_treatments ADD CONSTRAINT clinic_treatments_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.comparison_pages ADD CONSTRAINT comparison_pages_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.contact_submissions ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.crm_numbers ADD CONSTRAINT crm_numbers_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.dentist_availability_rules ADD CONSTRAINT dentist_availability_rules_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.dentist_settings ADD CONSTRAINT dentist_settings_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.editorial_calendar ADD CONSTRAINT editorial_calendar_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.email_enrichment_sessions ADD CONSTRAINT email_enrichment_sessions_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.email_enrichment_results ADD CONSTRAINT email_enrichment_results_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.email_templates ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.feature_registry ADD CONSTRAINT feature_registry_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.form_workflow_settings ADD CONSTRAINT form_workflow_settings_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.gmb_link_requests ADD CONSTRAINT gmb_link_requests_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.gmb_scraper_sessions ADD CONSTRAINT gmb_scraper_sessions_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.gmb_scraper_results ADD CONSTRAINT gmb_scraper_results_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.google_oauth_accounts ADD CONSTRAINT google_oauth_accounts_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.google_reviews ADD CONSTRAINT google_reviews_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.insurance_service_coverage ADD CONSTRAINT insurance_service_coverage_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.intake_form_templates ADD CONSTRAINT intake_form_templates_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.internal_reviews ADD CONSTRAINT internal_reviews_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.lead_quotas ADD CONSTRAINT lead_quotas_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.messaging_templates ADD CONSTRAINT messaging_templates_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.outreach_campaigns ADD CONSTRAINT outreach_campaigns_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.outreach_sends ADD CONSTRAINT outreach_sends_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.page_content ADD CONSTRAINT page_content_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.page_translations ADD CONSTRAINT page_translations_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.page_views ADD CONSTRAINT page_views_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.patient_form_submissions ADD CONSTRAINT patient_form_submissions_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.pending_areas ADD CONSTRAINT pending_areas_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.pinned_clinics ADD CONSTRAINT pinned_clinics_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.plan_features ADD CONSTRAINT plan_features_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.platform_alerts ADD CONSTRAINT platform_alerts_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.platform_notifications ADD CONSTRAINT platform_notifications_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.profile_analytics ADD CONSTRAINT profile_analytics_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.provider_verifications ADD CONSTRAINT provider_verifications_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.reputation_kpis ADD CONSTRAINT reputation_kpis_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.review_clicks ADD CONSTRAINT review_clicks_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.review_funnel_events ADD CONSTRAINT review_funnel_events_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.review_requests ADD CONSTRAINT review_requests_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.role_presets ADD CONSTRAINT role_presets_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.schema_settings ADD CONSTRAINT schema_settings_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.seo_content_versions ADD CONSTRAINT seo_content_versions_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.seo_fix_jobs ADD CONSTRAINT seo_fix_jobs_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.seo_fix_job_items ADD CONSTRAINT seo_fix_job_items_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.seo_metadata_history ADD CONSTRAINT seo_metadata_history_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.seo_pages ADD CONSTRAINT seo_pages_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.seo_tasks ADD CONSTRAINT seo_tasks_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.service_price_ranges ADD CONSTRAINT service_price_ranges_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.slot_locks ADD CONSTRAINT slot_locks_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.static_page_cache ADD CONSTRAINT static_page_cache_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.support_tickets ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.support_ticket_replies ADD CONSTRAINT support_ticket_replies_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.supported_languages ADD CONSTRAINT supported_languages_pkey PRIMARY KEY (code); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.translation_queue ADD CONSTRAINT translation_queue_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.visitor_events ADD CONSTRAINT visitor_events_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.visitor_sessions ADD CONSTRAINT visitor_sessions_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.visitor_journeys ADD CONSTRAINT visitor_journeys_pkey PRIMARY KEY (id); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================
-- 5. UNIQUE CONSTRAINTS
-- =====================
DO $$ BEGIN ALTER TABLE ONLY public.states ADD CONSTRAINT states_slug_key UNIQUE (slug); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.treatments ADD CONSTRAINT treatments_slug_key UNIQUE (slug); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.countries ADD CONSTRAINT countries_code_key UNIQUE (code); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.blog_authors ADD CONSTRAINT blog_authors_slug_key UNIQUE (slug); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.blog_categories ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.blog_posts ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.subscription_plans ADD CONSTRAINT subscription_plans_slug_key UNIQUE (slug); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.comparison_pages ADD CONSTRAINT comparison_pages_slug_key UNIQUE (slug); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_module_settings ADD CONSTRAINT ai_module_settings_module_key UNIQUE (module); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_search_settings ADD CONSTRAINT ai_search_settings_setting_key_key UNIQUE (setting_key); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_automation_settings ADD CONSTRAINT clinic_automation_settings_clinic_id_key UNIQUE (clinic_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_insurances ADD CONSTRAINT clinic_insurances_clinic_id_insurance_id_key UNIQUE (clinic_id, insurance_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.global_settings ADD CONSTRAINT global_settings_key_key UNIQUE (key); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.feature_registry ADD CONSTRAINT feature_registry_feature_key_key UNIQUE (feature_key); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.seo_pages ADD CONSTRAINT seo_pages_slug_key UNIQUE (slug); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.static_page_cache ADD CONSTRAINT static_page_cache_path_key UNIQUE (path); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================
-- 6. FOREIGN KEYS
-- =====================
DO $$ BEGIN ALTER TABLE ONLY public.cities ADD CONSTRAINT cities_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.areas ADD CONSTRAINT areas_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinics ADD CONSTRAINT clinics_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinics ADD CONSTRAINT clinics_area_id_fkey FOREIGN KEY (area_id) REFERENCES areas(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.dentists ADD CONSTRAINT dentists_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.leads ADD CONSTRAINT leads_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.leads ADD CONSTRAINT leads_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES treatments(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.appointments ADD CONSTRAINT appointments_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.appointments ADD CONSTRAINT appointments_dentist_id_fkey FOREIGN KEY (dentist_id) REFERENCES dentists(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.appointments ADD CONSTRAINT appointments_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.appointments ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.appointments ADD CONSTRAINT appointments_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES treatments(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_errors ADD CONSTRAINT ai_errors_event_id_fkey FOREIGN KEY (event_id) REFERENCES ai_events(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_events ADD CONSTRAINT ai_events_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_feedback ADD CONSTRAINT ai_feedback_event_id_fkey FOREIGN KEY (event_id) REFERENCES ai_events(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_inputs ADD CONSTRAINT ai_inputs_event_id_fkey FOREIGN KEY (event_id) REFERENCES ai_events(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.ai_outputs ADD CONSTRAINT ai_outputs_event_id_fkey FOREIGN KEY (event_id) REFERENCES ai_events(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.appointment_types ADD CONSTRAINT appointment_types_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.automation_logs ADD CONSTRAINT automation_logs_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES automation_rules(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.availability_blocks ADD CONSTRAINT availability_blocks_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.booking_notifications ADD CONSTRAINT booking_notifications_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.booking_notifications ADD CONSTRAINT booking_notifications_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.claim_requests ADD CONSTRAINT claim_requests_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_automation_settings ADD CONSTRAINT clinic_automation_settings_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_hours ADD CONSTRAINT clinic_hours_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_images ADD CONSTRAINT clinic_images_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_insurances ADD CONSTRAINT clinic_insurances_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_insurances ADD CONSTRAINT clinic_insurances_insurance_id_fkey FOREIGN KEY (insurance_id) REFERENCES insurances(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_messages ADD CONSTRAINT clinic_messages_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_messages ADD CONSTRAINT clinic_messages_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_oauth_tokens ADD CONSTRAINT clinic_oauth_tokens_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_subscriptions ADD CONSTRAINT clinic_subscriptions_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_subscriptions ADD CONSTRAINT clinic_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_treatments ADD CONSTRAINT clinic_treatments_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.clinic_treatments ADD CONSTRAINT clinic_treatments_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES treatments(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.comparison_pages ADD CONSTRAINT comparison_pages_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES treatments(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.comparison_pages ADD CONSTRAINT comparison_pages_state_id_1_fkey FOREIGN KEY (state_id_1) REFERENCES states(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.comparison_pages ADD CONSTRAINT comparison_pages_state_id_2_fkey FOREIGN KEY (state_id_2) REFERENCES states(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.comparison_pages ADD CONSTRAINT comparison_pages_city_id_1_fkey FOREIGN KEY (city_id_1) REFERENCES cities(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.comparison_pages ADD CONSTRAINT comparison_pages_city_id_2_fkey FOREIGN KEY (city_id_2) REFERENCES cities(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.contact_submissions ADD CONSTRAINT contact_submissions_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.crm_numbers ADD CONSTRAINT crm_numbers_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.dentist_availability_rules ADD CONSTRAINT dentist_availability_rules_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.dentist_settings ADD CONSTRAINT dentist_settings_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.editorial_calendar ADD CONSTRAINT editorial_calendar_template_id_fkey FOREIGN KEY (template_id) REFERENCES blog_content_templates(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.editorial_calendar ADD CONSTRAINT editorial_calendar_topic_cluster_id_fkey FOREIGN KEY (topic_cluster_id) REFERENCES blog_topic_clusters(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.email_enrichment_results ADD CONSTRAINT email_enrichment_results_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.email_enrichment_results ADD CONSTRAINT email_enrichment_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES email_enrichment_sessions(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.gmb_link_requests ADD CONSTRAINT gmb_link_requests_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.gmb_scraper_results ADD CONSTRAINT gmb_scraper_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES gmb_scraper_sessions(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.gmb_scraper_sessions ADD CONSTRAINT gmb_scraper_sessions_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.google_reviews ADD CONSTRAINT google_reviews_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.insurance_service_coverage ADD CONSTRAINT insurance_service_coverage_insurance_id_fkey FOREIGN KEY (insurance_id) REFERENCES insurances(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.insurance_service_coverage ADD CONSTRAINT insurance_service_coverage_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.lead_quotas ADD CONSTRAINT lead_quotas_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.lead_quotas ADD CONSTRAINT lead_quotas_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.pinned_clinics ADD CONSTRAINT pinned_clinics_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.plan_features ADD CONSTRAINT plan_features_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.review_requests ADD CONSTRAINT review_requests_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.seo_fix_job_items ADD CONSTRAINT seo_fix_job_items_job_id_fkey FOREIGN KEY (job_id) REFERENCES seo_fix_jobs(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.service_price_ranges ADD CONSTRAINT service_price_ranges_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.service_price_ranges ADD CONSTRAINT service_price_ranges_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.support_ticket_replies ADD CONSTRAINT support_ticket_replies_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.support_tickets ADD CONSTRAINT support_tickets_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.translation_queue ADD CONSTRAINT translation_queue_seo_page_id_fkey FOREIGN KEY (seo_page_id) REFERENCES seo_pages(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================
-- 7. INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_clinic_insurances_clinic_id ON public.clinic_insurances(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_insurances_insurance_id ON public.clinic_insurances(insurance_id);
CREATE INDEX IF NOT EXISTS idx_insurances_slug ON public.insurances(slug);
CREATE INDEX IF NOT EXISTS idx_insurances_type ON public.insurances(insurance_type);
CREATE INDEX IF NOT EXISTS idx_page_translations_seo_page_lang ON public.page_translations(seo_page_id, language_code);
CREATE INDEX IF NOT EXISTS idx_page_translations_slug_lang ON public.page_translations(slug, language_code);
CREATE INDEX IF NOT EXISTS idx_page_translations_status ON public.page_translations(translation_status);
CREATE INDEX IF NOT EXISTS idx_seo_pages_boilerplate_cluster ON public.seo_pages(boilerplate_cluster_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_editorial_status ON public.seo_pages(editorial_status);
CREATE INDEX IF NOT EXISTS idx_seo_pages_identity_score ON public.seo_pages(identity_score);
CREATE INDEX IF NOT EXISTS idx_seo_pages_is_index_worthy ON public.seo_pages(is_index_worthy);
CREATE INDEX IF NOT EXISTS idx_seo_pages_page_value_score ON public.seo_pages(page_value_score);
CREATE INDEX IF NOT EXISTS idx_seo_pages_rewrite_priority ON public.seo_pages(rewrite_priority);

-- =====================
-- 8. ENABLE RLS ON ALL TABLES
-- =====================
ALTER TABLE public.ai_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_search_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_topic_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dentist_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dentist_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dentists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_enrichment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_enrichment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_workflow_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_link_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_scraper_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_scraper_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_oauth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_service_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_fix_job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_fix_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metadata_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_price_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_page_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tab_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

-- =====================
-- 9. RLS POLICIES (DROP IF EXISTS + CREATE)
-- =====================

-- ai_errors
DROP POLICY IF EXISTS "Admins manage ai errors" ON public.ai_errors;
CREATE POLICY "Admins manage ai errors" ON public.ai_errors FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- ai_events
DROP POLICY IF EXISTS "ai_events_insert" ON public.ai_events;
CREATE POLICY "ai_events_insert" ON public.ai_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ai_events_read" ON public.ai_events;
CREATE POLICY "ai_events_read" ON public.ai_events FOR SELECT USING (true);

-- ai_feedback
DROP POLICY IF EXISTS "ai_feedback_insert" ON public.ai_feedback;
CREATE POLICY "ai_feedback_insert" ON public.ai_feedback FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ai_feedback_read" ON public.ai_feedback;
CREATE POLICY "ai_feedback_read" ON public.ai_feedback FOR SELECT USING (true);

-- ai_inputs
DROP POLICY IF EXISTS "ai_inputs_insert" ON public.ai_inputs;
CREATE POLICY "ai_inputs_insert" ON public.ai_inputs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ai_inputs_read" ON public.ai_inputs;
CREATE POLICY "ai_inputs_read" ON public.ai_inputs FOR SELECT USING (true);

-- ai_module_settings
DROP POLICY IF EXISTS "ai_module_settings_admin" ON public.ai_module_settings;
CREATE POLICY "ai_module_settings_admin" ON public.ai_module_settings FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "ai_module_settings_read" ON public.ai_module_settings;
CREATE POLICY "ai_module_settings_read" ON public.ai_module_settings FOR SELECT USING (true);

-- ai_outputs
DROP POLICY IF EXISTS "ai_outputs_insert" ON public.ai_outputs;
CREATE POLICY "ai_outputs_insert" ON public.ai_outputs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ai_outputs_read" ON public.ai_outputs;
CREATE POLICY "ai_outputs_read" ON public.ai_outputs FOR SELECT USING (true);

-- ai_prompt_templates
DROP POLICY IF EXISTS "ai_prompt_templates_admin" ON public.ai_prompt_templates;
CREATE POLICY "ai_prompt_templates_admin" ON public.ai_prompt_templates FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "ai_prompt_templates_read" ON public.ai_prompt_templates;
CREATE POLICY "ai_prompt_templates_read" ON public.ai_prompt_templates FOR SELECT USING (true);

-- ai_search_logs
DROP POLICY IF EXISTS "Admins manage ai search logs" ON public.ai_search_logs;
CREATE POLICY "Admins manage ai search logs" ON public.ai_search_logs FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Anyone can insert search logs" ON public.ai_search_logs;
CREATE POLICY "Anyone can insert search logs" ON public.ai_search_logs FOR INSERT WITH CHECK (true);

-- ai_search_settings
DROP POLICY IF EXISTS "AI search settings readable by all" ON public.ai_search_settings;
CREATE POLICY "AI search settings readable by all" ON public.ai_search_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage ai search settings" ON public.ai_search_settings;
CREATE POLICY "Admins manage ai search settings" ON public.ai_search_settings FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- appointment_types
DROP POLICY IF EXISTS "Public read appointment_types" ON public.appointment_types;
CREATE POLICY "Public read appointment_types" ON public.appointment_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Clinic owners manage appointment_types" ON public.appointment_types;
CREATE POLICY "Clinic owners manage appointment_types" ON public.appointment_types FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = appointment_types.clinic_id AND clinics.claimed_by = auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- appointments
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
CREATE POLICY "Anyone can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins manage appointments" ON public.appointments;
CREATE POLICY "Admins manage appointments" ON public.appointments FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Appointments readable by clinic owners/admins" ON public.appointments;
CREATE POLICY "Appointments readable by clinic owners/admins" ON public.appointments FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = appointments.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- areas
DROP POLICY IF EXISTS "Admins manage areas" ON public.areas;
CREATE POLICY "Admins manage areas" ON public.areas FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Areas readable by all" ON public.areas;
CREATE POLICY "Areas readable by all" ON public.areas FOR SELECT USING (true);

-- audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Auth users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Auth users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- automation_logs
DROP POLICY IF EXISTS "Admins manage automation logs" ON public.automation_logs;
CREATE POLICY "Admins manage automation logs" ON public.automation_logs FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- automation_rules
DROP POLICY IF EXISTS "Admins manage automation rules" ON public.automation_rules;
CREATE POLICY "Admins manage automation rules" ON public.automation_rules FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- availability_blocks
DROP POLICY IF EXISTS "Public read availability blocks" ON public.availability_blocks;
CREATE POLICY "Public read availability blocks" ON public.availability_blocks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Clinic owners manage availability blocks" ON public.availability_blocks;
CREATE POLICY "Clinic owners manage availability blocks" ON public.availability_blocks FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = availability_blocks.clinic_id AND clinics.claimed_by = auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- blog_authors
DROP POLICY IF EXISTS "blog_authors_admin" ON public.blog_authors;
CREATE POLICY "blog_authors_admin" ON public.blog_authors FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "blog_authors_read" ON public.blog_authors;
CREATE POLICY "blog_authors_read" ON public.blog_authors FOR SELECT USING (true);

-- blog_categories
DROP POLICY IF EXISTS "blog_categories_admin" ON public.blog_categories;
CREATE POLICY "blog_categories_admin" ON public.blog_categories FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "blog_categories_read" ON public.blog_categories;
CREATE POLICY "blog_categories_read" ON public.blog_categories FOR SELECT USING (true);

-- blog_content_templates
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.blog_content_templates;
CREATE POLICY "Allow all for authenticated users" ON public.blog_content_templates FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Public can view active templates" ON public.blog_content_templates;
CREATE POLICY "Public can view active templates" ON public.blog_content_templates FOR SELECT USING (is_active = true);

-- blog_posts
DROP POLICY IF EXISTS "Admins manage posts" ON public.blog_posts;
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Published posts readable by all" ON public.blog_posts;
CREATE POLICY "Published posts readable by all" ON public.blog_posts FOR SELECT USING (status = 'published' OR has_role(auth.uid(), 'super_admin'));

-- blog_topic_clusters
DROP POLICY IF EXISTS "blog_topic_clusters_admin" ON public.blog_topic_clusters;
CREATE POLICY "blog_topic_clusters_admin" ON public.blog_topic_clusters FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "blog_topic_clusters_read" ON public.blog_topic_clusters;
CREATE POLICY "blog_topic_clusters_read" ON public.blog_topic_clusters FOR SELECT USING (true);

-- booking_notifications
DROP POLICY IF EXISTS "Service insert notifications" ON public.booking_notifications;
CREATE POLICY "Service insert notifications" ON public.booking_notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users read own notifications" ON public.booking_notifications;
CREATE POLICY "Users read own notifications" ON public.booking_notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own notifications" ON public.booking_notifications;
CREATE POLICY "Users update own notifications" ON public.booking_notifications FOR UPDATE USING (auth.uid() = user_id);

-- budget_ranges
DROP POLICY IF EXISTS "Public read budget_ranges" ON public.budget_ranges;
CREATE POLICY "Public read budget_ranges" ON public.budget_ranges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Super admin manage budget_ranges" ON public.budget_ranges;
CREATE POLICY "Super admin manage budget_ranges" ON public.budget_ranges FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- cities
DROP POLICY IF EXISTS "Admins manage cities" ON public.cities;
CREATE POLICY "Admins manage cities" ON public.cities FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Cities readable by all" ON public.cities;
CREATE POLICY "Cities readable by all" ON public.cities FOR SELECT USING (true);

-- claim_requests
DROP POLICY IF EXISTS "Admins manage claims" ON public.claim_requests;
CREATE POLICY "Admins manage claims" ON public.claim_requests FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Auth users can create claims" ON public.claim_requests;
CREATE POLICY "Auth users can create claims" ON public.claim_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own claims" ON public.claim_requests;
CREATE POLICY "Users can view own claims" ON public.claim_requests FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- clinic_automation_settings
DROP POLICY IF EXISTS "Clinic owners can manage automation" ON public.clinic_automation_settings;
CREATE POLICY "Clinic owners can manage automation" ON public.clinic_automation_settings FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_automation_settings.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Clinic owners can view automation" ON public.clinic_automation_settings;
CREATE POLICY "Clinic owners can view automation" ON public.clinic_automation_settings FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_automation_settings.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- clinic_hours
DROP POLICY IF EXISTS "Clinic hours readable by all" ON public.clinic_hours;
CREATE POLICY "Clinic hours readable by all" ON public.clinic_hours FOR SELECT USING (true);
DROP POLICY IF EXISTS "Clinic owners manage hours" ON public.clinic_hours;
CREATE POLICY "Clinic owners manage hours" ON public.clinic_hours FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_hours.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- clinic_images
DROP POLICY IF EXISTS "Clinic images readable by all" ON public.clinic_images;
CREATE POLICY "Clinic images readable by all" ON public.clinic_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Clinic owners manage images" ON public.clinic_images;
CREATE POLICY "Clinic owners manage images" ON public.clinic_images FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_images.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- clinic_insurances
DROP POLICY IF EXISTS "Admins manage" ON public.clinic_insurances;
CREATE POLICY "Admins manage" ON public.clinic_insurances FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Readable by all" ON public.clinic_insurances;
CREATE POLICY "Readable by all" ON public.clinic_insurances FOR SELECT USING (true);

-- clinic_messages
DROP POLICY IF EXISTS "Clinic owners can manage messages" ON public.clinic_messages;
CREATE POLICY "Clinic owners can manage messages" ON public.clinic_messages FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_messages.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Clinic owners can view messages" ON public.clinic_messages;
CREATE POLICY "Clinic owners can view messages" ON public.clinic_messages FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_messages.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- clinic_oauth_tokens
DROP POLICY IF EXISTS "Admins manage oauth tokens" ON public.clinic_oauth_tokens;
CREATE POLICY "Admins manage oauth tokens" ON public.clinic_oauth_tokens FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Clinic owners can view oauth tokens" ON public.clinic_oauth_tokens;
CREATE POLICY "Clinic owners can view oauth tokens" ON public.clinic_oauth_tokens FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_oauth_tokens.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- clinic_subscriptions
DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.clinic_subscriptions;
CREATE POLICY "Admins manage subscriptions" ON public.clinic_subscriptions FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Clinic owners can view own subs" ON public.clinic_subscriptions;
CREATE POLICY "Clinic owners can view own subs" ON public.clinic_subscriptions FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = clinic_subscriptions.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- clinic_treatments
DROP POLICY IF EXISTS "Admins manage" ON public.clinic_treatments;
CREATE POLICY "Admins manage" ON public.clinic_treatments FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Readable by all" ON public.clinic_treatments;
CREATE POLICY "Readable by all" ON public.clinic_treatments FOR SELECT USING (true);

-- clinics
DROP POLICY IF EXISTS "Clinics readable by all" ON public.clinics;
CREATE POLICY "Clinics readable by all" ON public.clinics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert clinics" ON public.clinics;
CREATE POLICY "Admins can insert clinics" ON public.clinics FOR INSERT WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'district_manager'));
DROP POLICY IF EXISTS "Clinic owners can update" ON public.clinics;
CREATE POLICY "Clinic owners can update" ON public.clinics FOR UPDATE USING (auth.uid() = claimed_by OR auth.uid() = owner_id OR has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Admins can delete clinics" ON public.clinics;
CREATE POLICY "Admins can delete clinics" ON public.clinics FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- comparison_pages
DROP POLICY IF EXISTS "Anyone can view comparison pages" ON public.comparison_pages;
CREATE POLICY "Anyone can view comparison pages" ON public.comparison_pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Super admins can manage comparison pages" ON public.comparison_pages;
CREATE POLICY "Super admins can manage comparison pages" ON public.comparison_pages FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'));

-- contact_submissions
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins manage submissions" ON public.contact_submissions;
CREATE POLICY "Admins manage submissions" ON public.contact_submissions FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- countries
DROP POLICY IF EXISTS "Countries readable by all" ON public.countries;
CREATE POLICY "Countries readable by all" ON public.countries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage countries" ON public.countries;
CREATE POLICY "Admins manage countries" ON public.countries FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- crm_numbers
DROP POLICY IF EXISTS "Admins manage crm numbers" ON public.crm_numbers;
CREATE POLICY "Admins manage crm numbers" ON public.crm_numbers FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- dentist_availability_rules
DROP POLICY IF EXISTS "Public read availability rules" ON public.dentist_availability_rules;
CREATE POLICY "Public read availability rules" ON public.dentist_availability_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Clinic owners manage availability rules" ON public.dentist_availability_rules;
CREATE POLICY "Clinic owners manage availability rules" ON public.dentist_availability_rules FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = dentist_availability_rules.clinic_id AND clinics.claimed_by = auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- dentist_settings
DROP POLICY IF EXISTS "Dentist settings manageable by owners/admins" ON public.dentist_settings;
CREATE POLICY "Dentist settings manageable by owners/admins" ON public.dentist_settings FOR ALL USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Dentist settings readable by owners/admins" ON public.dentist_settings;
CREATE POLICY "Dentist settings readable by owners/admins" ON public.dentist_settings FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- dentists
DROP POLICY IF EXISTS "Dentists readable by all" ON public.dentists;
CREATE POLICY "Dentists readable by all" ON public.dentists FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage dentists" ON public.dentists;
CREATE POLICY "Admins manage dentists" ON public.dentists FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Dentists can update own" ON public.dentists;
CREATE POLICY "Dentists can update own" ON public.dentists FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- district_assignments
DROP POLICY IF EXISTS "Admins manage district assignments" ON public.district_assignments;
CREATE POLICY "Admins manage district assignments" ON public.district_assignments FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- editorial_calendar
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.editorial_calendar;
CREATE POLICY "Allow all for authenticated users" ON public.editorial_calendar FOR ALL USING (auth.role() = 'authenticated');

-- email_enrichment_results
DROP POLICY IF EXISTS "Admins manage enrichment results" ON public.email_enrichment_results;
CREATE POLICY "Admins manage enrichment results" ON public.email_enrichment_results FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- email_enrichment_sessions
DROP POLICY IF EXISTS "Admins manage enrichment sessions" ON public.email_enrichment_sessions;
CREATE POLICY "Admins manage enrichment sessions" ON public.email_enrichment_sessions FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- email_templates
DROP POLICY IF EXISTS "Admins manage email templates" ON public.email_templates;
CREATE POLICY "Admins manage email templates" ON public.email_templates FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- feature_registry
DROP POLICY IF EXISTS "Admins manage features" ON public.feature_registry;
CREATE POLICY "Admins manage features" ON public.feature_registry FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Feature registry readable by all" ON public.feature_registry;
CREATE POLICY "Feature registry readable by all" ON public.feature_registry FOR SELECT USING (true);

-- form_workflow_settings
DROP POLICY IF EXISTS "Clinic owners manage form_workflow_settings" ON public.form_workflow_settings;
CREATE POLICY "Clinic owners manage form_workflow_settings" ON public.form_workflow_settings FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = form_workflow_settings.clinic_id AND clinics.claimed_by = auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- global_settings
DROP POLICY IF EXISTS "Admins manage settings" ON public.global_settings;
CREATE POLICY "Admins manage settings" ON public.global_settings FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Settings readable by all" ON public.global_settings;
CREATE POLICY "Settings readable by all" ON public.global_settings FOR SELECT USING (true);

-- gmb_link_requests
DROP POLICY IF EXISTS "Users manage own gmb_link_requests" ON public.gmb_link_requests;
CREATE POLICY "Users manage own gmb_link_requests" ON public.gmb_link_requests FOR ALL USING (auth.uid() = initiated_by OR has_role(auth.uid(), 'super_admin'));

-- gmb_scraper_results
DROP POLICY IF EXISTS "Admins manage scraper results" ON public.gmb_scraper_results;
CREATE POLICY "Admins manage scraper results" ON public.gmb_scraper_results FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- gmb_scraper_sessions
DROP POLICY IF EXISTS "Admins manage scraper sessions" ON public.gmb_scraper_sessions;
CREATE POLICY "Admins manage scraper sessions" ON public.gmb_scraper_sessions FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- google_oauth_accounts
DROP POLICY IF EXISTS "Users manage own google_oauth_accounts" ON public.google_oauth_accounts;
CREATE POLICY "Users manage own google_oauth_accounts" ON public.google_oauth_accounts FOR ALL USING (auth.uid() = user_id);

-- google_reviews
DROP POLICY IF EXISTS "Admins manage google reviews" ON public.google_reviews;
CREATE POLICY "Admins manage google reviews" ON public.google_reviews FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Google reviews readable by all" ON public.google_reviews;
CREATE POLICY "Google reviews readable by all" ON public.google_reviews FOR SELECT USING (true);

-- insurance_service_coverage
DROP POLICY IF EXISTS "Anyone can view insurance coverage" ON public.insurance_service_coverage;
CREATE POLICY "Anyone can view insurance coverage" ON public.insurance_service_coverage FOR SELECT USING (true);
DROP POLICY IF EXISTS "Super admins can manage insurance coverage" ON public.insurance_service_coverage;
CREATE POLICY "Super admins can manage insurance coverage" ON public.insurance_service_coverage FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'));

-- insurances
DROP POLICY IF EXISTS "Admins manage insurances" ON public.insurances;
CREATE POLICY "Admins manage insurances" ON public.insurances FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Insurances readable by all" ON public.insurances;
CREATE POLICY "Insurances readable by all" ON public.insurances FOR SELECT USING (true);

-- intake_form_templates
DROP POLICY IF EXISTS "Clinic owners manage intake_form_templates" ON public.intake_form_templates;
CREATE POLICY "Clinic owners manage intake_form_templates" ON public.intake_form_templates FOR ALL USING (clinic_id IS NULL OR (EXISTS (SELECT 1 FROM clinics WHERE clinics.id = intake_form_templates.clinic_id AND clinics.claimed_by = auth.uid())) OR has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Public read intake_form_templates" ON public.intake_form_templates;
CREATE POLICY "Public read intake_form_templates" ON public.intake_form_templates FOR SELECT USING (true);

-- internal_reviews
DROP POLICY IF EXISTS "Admins manage reviews" ON public.internal_reviews;
CREATE POLICY "Admins manage reviews" ON public.internal_reviews FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.internal_reviews;
CREATE POLICY "Anyone can create reviews" ON public.internal_reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Reviews readable by all" ON public.internal_reviews;
CREATE POLICY "Reviews readable by all" ON public.internal_reviews FOR SELECT USING (true);

-- lead_quotas
DROP POLICY IF EXISTS "lead_quotas_admin" ON public.lead_quotas;
CREATE POLICY "lead_quotas_admin" ON public.lead_quotas FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "lead_quotas_read" ON public.lead_quotas;
CREATE POLICY "lead_quotas_read" ON public.lead_quotas FOR SELECT USING (true);

-- leads
DROP POLICY IF EXISTS "Admins manage leads" ON public.leads;
CREATE POLICY "Admins manage leads" ON public.leads FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
CREATE POLICY "Anyone can create leads" ON public.leads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leads readable by clinic owners/admins" ON public.leads;
CREATE POLICY "Leads readable by clinic owners/admins" ON public.leads FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = leads.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- messaging_templates
DROP POLICY IF EXISTS "Admins manage templates" ON public.messaging_templates;
CREATE POLICY "Admins manage templates" ON public.messaging_templates FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- outreach_campaigns
DROP POLICY IF EXISTS "Admins manage campaigns" ON public.outreach_campaigns;
CREATE POLICY "Admins manage campaigns" ON public.outreach_campaigns FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- outreach_sends
DROP POLICY IF EXISTS "Admins manage sends" ON public.outreach_sends;
CREATE POLICY "Admins manage sends" ON public.outreach_sends FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- page_content
DROP POLICY IF EXISTS "Admins manage page content" ON public.page_content;
CREATE POLICY "Admins manage page content" ON public.page_content FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Page content readable by all" ON public.page_content;
CREATE POLICY "Page content readable by all" ON public.page_content FOR SELECT USING (true);

-- page_translations
DROP POLICY IF EXISTS "Admin write access" ON public.page_translations;
CREATE POLICY "Admin write access" ON public.page_translations FOR ALL USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Public read access" ON public.page_translations;
CREATE POLICY "Public read access" ON public.page_translations FOR SELECT USING (true);

-- page_views
DROP POLICY IF EXISTS "Anyone insert page_views" ON public.page_views;
CREATE POLICY "Anyone insert page_views" ON public.page_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins view page_views" ON public.page_views;
CREATE POLICY "Admins view page_views" ON public.page_views FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

-- patient_form_submissions
DROP POLICY IF EXISTS "Public insert submissions" ON public.patient_form_submissions;
CREATE POLICY "Public insert submissions" ON public.patient_form_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Clinic owners read submissions" ON public.patient_form_submissions;
CREATE POLICY "Clinic owners read submissions" ON public.patient_form_submissions FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = patient_form_submissions.clinic_id AND clinics.claimed_by = auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- patients
DROP POLICY IF EXISTS "Clinic owners can manage patients" ON public.patients;
CREATE POLICY "Clinic owners can manage patients" ON public.patients FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = patients.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Clinic owners can view patients" ON public.patients;
CREATE POLICY "Clinic owners can view patients" ON public.patients FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = patients.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- pending_areas
DROP POLICY IF EXISTS "Admins manage pending areas" ON public.pending_areas;
CREATE POLICY "Admins manage pending areas" ON public.pending_areas FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Auth users can create pending areas" ON public.pending_areas;
CREATE POLICY "Auth users can create pending areas" ON public.pending_areas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Pending areas readable by owners/admins" ON public.pending_areas;
CREATE POLICY "Pending areas readable by owners/admins" ON public.pending_areas FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = pending_areas.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- pinned_clinics
DROP POLICY IF EXISTS "Admins manage pinned clinics" ON public.pinned_clinics;
CREATE POLICY "Admins manage pinned clinics" ON public.pinned_clinics FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Pinned clinics readable by all" ON public.pinned_clinics;
CREATE POLICY "Pinned clinics readable by all" ON public.pinned_clinics FOR SELECT USING (true);

-- plan_features
DROP POLICY IF EXISTS "Admins manage plan features" ON public.plan_features;
CREATE POLICY "Admins manage plan features" ON public.plan_features FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Plan features readable by all" ON public.plan_features;
CREATE POLICY "Plan features readable by all" ON public.plan_features FOR SELECT USING (true);

-- platform_alerts
DROP POLICY IF EXISTS "Admins manage alerts" ON public.platform_alerts;
CREATE POLICY "Admins manage alerts" ON public.platform_alerts FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Admins can view alerts" ON public.platform_alerts;
CREATE POLICY "Admins can view alerts" ON public.platform_alerts FOR SELECT USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'district_manager'));

-- platform_notifications
DROP POLICY IF EXISTS "platform_notifications_read" ON public.platform_notifications;
CREATE POLICY "platform_notifications_read" ON public.platform_notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "platform_notifications_write" ON public.platform_notifications;
CREATE POLICY "platform_notifications_write" ON public.platform_notifications FOR ALL USING (true) WITH CHECK (true);

-- profile_analytics
DROP POLICY IF EXISTS "Admins manage profile analytics" ON public.profile_analytics;
CREATE POLICY "Admins manage profile analytics" ON public.profile_analytics FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Profile analytics readable by clinic owners/admins" ON public.profile_analytics;
CREATE POLICY "Profile analytics readable by clinic owners/admins" ON public.profile_analytics FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = profile_analytics.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- provider_verifications
DROP POLICY IF EXISTS "provider_verifications_read" ON public.provider_verifications;
CREATE POLICY "provider_verifications_read" ON public.provider_verifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "provider_verifications_write" ON public.provider_verifications;
CREATE POLICY "provider_verifications_write" ON public.provider_verifications FOR ALL USING (true) WITH CHECK (true);

-- reputation_kpis
DROP POLICY IF EXISTS "reputation_kpis_read" ON public.reputation_kpis;
CREATE POLICY "reputation_kpis_read" ON public.reputation_kpis FOR SELECT USING (true);
DROP POLICY IF EXISTS "reputation_kpis_write" ON public.reputation_kpis;
CREATE POLICY "reputation_kpis_write" ON public.reputation_kpis FOR INSERT WITH CHECK (true);

-- review_clicks
DROP POLICY IF EXISTS "Anyone can insert review clicks" ON public.review_clicks;
CREATE POLICY "Anyone can insert review clicks" ON public.review_clicks FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Review clicks readable by clinic owners" ON public.review_clicks;
CREATE POLICY "Review clicks readable by clinic owners" ON public.review_clicks FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = review_clicks.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- review_funnel_events
DROP POLICY IF EXISTS "Anyone can insert funnel events" ON public.review_funnel_events;
CREATE POLICY "Anyone can insert funnel events" ON public.review_funnel_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Clinic owners can view funnel events" ON public.review_funnel_events;
CREATE POLICY "Clinic owners can view funnel events" ON public.review_funnel_events FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = review_funnel_events.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- review_requests
DROP POLICY IF EXISTS "Clinic owners can manage review requests" ON public.review_requests;
CREATE POLICY "Clinic owners can manage review requests" ON public.review_requests FOR ALL USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = review_requests.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Clinic owners can view review requests" ON public.review_requests;
CREATE POLICY "Clinic owners can view review requests" ON public.review_requests FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = review_requests.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- role_presets
DROP POLICY IF EXISTS "role_presets_admin" ON public.role_presets;
CREATE POLICY "role_presets_admin" ON public.role_presets FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "role_presets_read" ON public.role_presets;
CREATE POLICY "role_presets_read" ON public.role_presets FOR SELECT USING (true);

-- schema_settings
DROP POLICY IF EXISTS "Admins manage schema settings" ON public.schema_settings;
CREATE POLICY "Admins manage schema settings" ON public.schema_settings FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Schema settings readable by all" ON public.schema_settings;
CREATE POLICY "Schema settings readable by all" ON public.schema_settings FOR SELECT USING (true);

-- seo_content_versions
DROP POLICY IF EXISTS "Admins manage seo content versions" ON public.seo_content_versions;
CREATE POLICY "Admins manage seo content versions" ON public.seo_content_versions FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- seo_fix_job_items
DROP POLICY IF EXISTS "Admins manage SEO job items" ON public.seo_fix_job_items;
CREATE POLICY "Admins manage SEO job items" ON public.seo_fix_job_items FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- seo_fix_jobs
DROP POLICY IF EXISTS "Admins manage SEO jobs" ON public.seo_fix_jobs;
CREATE POLICY "Admins manage SEO jobs" ON public.seo_fix_jobs FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- seo_metadata_history
DROP POLICY IF EXISTS "Admins manage seo metadata history" ON public.seo_metadata_history;
CREATE POLICY "Admins manage seo metadata history" ON public.seo_metadata_history FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- seo_pages
DROP POLICY IF EXISTS "Admins manage SEO pages" ON public.seo_pages;
CREATE POLICY "Admins manage SEO pages" ON public.seo_pages FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "SEO pages readable by all" ON public.seo_pages;
CREATE POLICY "SEO pages readable by all" ON public.seo_pages FOR SELECT USING (true);

-- seo_tasks
DROP POLICY IF EXISTS "Admins manage seo tasks" ON public.seo_tasks;
CREATE POLICY "Admins manage seo tasks" ON public.seo_tasks FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- service_price_ranges
DROP POLICY IF EXISTS "Anyone can view service price ranges" ON public.service_price_ranges;
CREATE POLICY "Anyone can view service price ranges" ON public.service_price_ranges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Super admins can manage price ranges" ON public.service_price_ranges;
CREATE POLICY "Super admins can manage price ranges" ON public.service_price_ranges FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'));

-- slot_locks
DROP POLICY IF EXISTS "slot_locks_read" ON public.slot_locks;
CREATE POLICY "slot_locks_read" ON public.slot_locks FOR SELECT USING (true);
DROP POLICY IF EXISTS "slot_locks_write" ON public.slot_locks;
CREATE POLICY "slot_locks_write" ON public.slot_locks FOR ALL USING (true) WITH CHECK (true);

-- states
DROP POLICY IF EXISTS "States readable by all" ON public.states;
CREATE POLICY "States readable by all" ON public.states FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage states" ON public.states;
CREATE POLICY "Admins manage states" ON public.states FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- static_page_cache
DROP POLICY IF EXISTS "Admins manage static cache" ON public.static_page_cache;
CREATE POLICY "Admins manage static cache" ON public.static_page_cache FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- subscription_plans
DROP POLICY IF EXISTS "Admins manage plans" ON public.subscription_plans;
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Plans readable by all" ON public.subscription_plans;
CREATE POLICY "Plans readable by all" ON public.subscription_plans FOR SELECT USING (true);

-- support_ticket_replies
DROP POLICY IF EXISTS "Admins manage replies" ON public.support_ticket_replies;
CREATE POLICY "Admins manage replies" ON public.support_ticket_replies FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Users create replies" ON public.support_ticket_replies;
CREATE POLICY "Users create replies" ON public.support_ticket_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own ticket replies" ON public.support_ticket_replies;
CREATE POLICY "Users view own ticket replies" ON public.support_ticket_replies FOR SELECT USING (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = support_ticket_replies.ticket_id AND (support_tickets.user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'))));

-- support_tickets
DROP POLICY IF EXISTS "Admins manage tickets" ON public.support_tickets;
CREATE POLICY "Admins manage tickets" ON public.support_tickets FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Users create tickets" ON public.support_tickets;
CREATE POLICY "Users create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own tickets" ON public.support_tickets;
CREATE POLICY "Users view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- supported_languages
DROP POLICY IF EXISTS "Public read access" ON public.supported_languages;
CREATE POLICY "Public read access" ON public.supported_languages FOR SELECT USING (true);

-- translation_queue
DROP POLICY IF EXISTS "Admin access" ON public.translation_queue;
CREATE POLICY "Admin access" ON public.translation_queue FOR ALL USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- treatments
DROP POLICY IF EXISTS "Admins manage treatments" ON public.treatments;
CREATE POLICY "Admins manage treatments" ON public.treatments FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Treatments readable by all" ON public.treatments;
CREATE POLICY "Treatments readable by all" ON public.treatments FOR SELECT USING (true);

-- user_onboarding
DROP POLICY IF EXISTS "user_onboarding_own" ON public.user_onboarding;
CREATE POLICY "user_onboarding_own" ON public.user_onboarding FOR ALL USING (auth.uid() = user_id);

-- user_permission_overrides
DROP POLICY IF EXISTS "user_permission_overrides_admin" ON public.user_permission_overrides;
CREATE POLICY "user_permission_overrides_admin" ON public.user_permission_overrides FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "user_permission_overrides_read" ON public.user_permission_overrides;
CREATE POLICY "user_permission_overrides_read" ON public.user_permission_overrides FOR SELECT USING (true);

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- user_tab_permissions
DROP POLICY IF EXISTS "user_tab_permissions_admin" ON public.user_tab_permissions;
CREATE POLICY "user_tab_permissions_admin" ON public.user_tab_permissions FOR ALL USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "user_tab_permissions_read" ON public.user_tab_permissions;
CREATE POLICY "user_tab_permissions_read" ON public.user_tab_permissions FOR SELECT USING (true);

-- visitor_events
DROP POLICY IF EXISTS "Anyone can insert visitor events" ON public.visitor_events;
CREATE POLICY "Anyone can insert visitor events" ON public.visitor_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Visitor events readable by clinic owners/admins" ON public.visitor_events;
CREATE POLICY "Visitor events readable by clinic owners/admins" ON public.visitor_events FOR SELECT USING ((EXISTS (SELECT 1 FROM clinics WHERE clinics.id = visitor_events.clinic_id AND (clinics.claimed_by = auth.uid() OR clinics.owner_id = auth.uid()))) OR has_role(auth.uid(), 'super_admin'));

-- visitor_journeys
DROP POLICY IF EXISTS "Allow service role full access on visitor_journeys" ON public.visitor_journeys;
CREATE POLICY "Allow service role full access on visitor_journeys" ON public.visitor_journeys FOR ALL USING (true) WITH CHECK (true);

-- visitor_sessions
DROP POLICY IF EXISTS "Admins view sessions" ON public.visitor_sessions;
CREATE POLICY "Admins view sessions" ON public.visitor_sessions FOR SELECT USING (has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Anyone insert sessions" ON public.visitor_sessions;
CREATE POLICY "Anyone insert sessions" ON public.visitor_sessions FOR INSERT WITH CHECK (true);

-- =====================
-- 9. INDEXES (performance)
-- =====================
-- FK indexes for joins and lookups
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON public.cities (state_id);
CREATE INDEX IF NOT EXISTS idx_areas_city_id ON public.areas (city_id);
CREATE INDEX IF NOT EXISTS idx_clinics_city_id ON public.clinics (city_id);
CREATE INDEX IF NOT EXISTS idx_clinics_area_id ON public.clinics (area_id);
CREATE INDEX IF NOT EXISTS idx_leads_clinic_id ON public.leads (clinic_id);
CREATE INDEX IF NOT EXISTS idx_leads_category_id ON public.leads (category_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON public.appointments (clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON public.appointments (lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dentist_id ON public.appointments (dentist_id);
CREATE INDEX IF NOT EXISTS idx_dentists_clinic_id ON public.dentists (clinic_id);
CREATE INDEX IF NOT EXISTS idx_dentists_user_id ON public.dentists (user_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON public.patients (clinic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_clinic_id ON public.reviews (clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_treatments_clinic_id ON public.clinic_treatments (clinic_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_clinic_id ON public.support_tickets (clinic_id);
CREATE INDEX IF NOT EXISTS idx_foster_carers_organisation_id ON public.foster_carers (organisation_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_organisation_id ON public.user_profiles (organisation_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles (role);
CREATE INDEX IF NOT EXISTS idx_permissions_role ON public.role_permissions (role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON public.seo_pages (slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_page_type ON public.seo_pages (page_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_session_id ON public.visitor_events (session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON public.visitor_sessions (visitor_id);

-- =====================
-- 10. TRIGGERS
-- =====================
DROP TRIGGER IF EXISTS on_new_booking ON public.appointments;
CREATE TRIGGER on_new_booking AFTER INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.notify_new_booking();

DROP TRIGGER IF EXISTS set_audit_log_user_role ON public.audit_logs;
CREATE TRIGGER set_audit_log_user_role BEFORE INSERT ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION public.set_audit_log_user_role();

-- =====================
-- DONE
-- =====================
