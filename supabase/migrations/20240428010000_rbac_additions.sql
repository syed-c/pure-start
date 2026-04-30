-- Add missing RBAC types and tables for UK Foster Care Platform
-- This file adds to the existing schema

-- Add new role values to existing enum (if not exists)
DO $$
BEGIN
  -- Add to app_role if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'agency_admin' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE app_role ADD VALUE 'agency_admin';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'agency_staff' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE app_role ADD VALUE 'agency_staff';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'foster_carer' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE app_role ADD VALUE 'foster_carer';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'applicant' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE app_role ADD VALUE 'applicant';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'trainer' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE app_role ADD VALUE 'trainer';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'local_authority' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE app_role ADD VALUE 'local_authority';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'auditor' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE app_role ADD VALUE 'auditor';
  END IF;
END
$$;

-- Create user_status enum if not exists
DO $$
BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'invited', 'suspended', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END
$$;

-- Create organisation_type enum if not exists  
DO $$
BEGIN
  CREATE TYPE organisation_type AS ENUM ('fostering_agency', 'local_authority', 'training_provider', 'platform');
EXCEPTION
  WHEN duplicate_object THEN null;
END
$$;

-- =====================================================
-- ADD MISSING TABLES (if not exist)
-- =====================================================

-- Organisations table
CREATE TABLE IF NOT EXISTS organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type organisation_type NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,
  latitude FLOAT,
  longitude FLOAT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  role app_role NOT NULL DEFAULT 'applicant',
  status user_status DEFAULT 'invited',
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  job_title TEXT,
  department TEXT,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_slug)
);

-- Foster Carer Profiles table
CREATE TABLE IF NOT EXISTS foster_carer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  postcode TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'pending',
  approval_type TEXT,
  approval_date DATE,
  panel_date DATE,
  qualifications TEXT[],
  languages TEXT[],
  has_car BOOLEAN DEFAULT false,
  has_own_home BOOLEAN DEFAULT false,
  can_accommodate_pets BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applicant Profiles table
CREATE TABLE IF NOT EXISTS applicant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  address TEXT,
  postcode TEXT,
  phone TEXT,
  application_stage TEXT DEFAULT 'enquiry',
  enquiry_date DATE,
  application_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trainer Profiles table
CREATE TABLE IF NOT EXISTS trainer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  specialisms TEXT[],
  qualifications TEXT[],
  bio TEXT,
  hourly_rate DECIMAL(10,2),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agency Profiles table
CREATE TABLE IF NOT EXISTS agency_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE UNIQUE,
  ofsted_urn TEXT,
  ofsted_rating TEXT,
  ofsted_inspection_date DATE,
  company_number TEXT,
  charity_number TEXT,
  established_year INTEGER,
  description TEXT,
  services_offered TEXT[],
  age_groups_supported TEXT[],
  fostering_types_supported TEXT[],
  areas_served TEXT[],
  approved_trainer BOOLEAN DEFAULT false,
  has_therapeutic_team BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Local Authority Profiles table
CREATE TABLE IF NOT EXISTS local_authority_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE UNIQUE,
  la_code TEXT,
  contact_department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activity Logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Status Logs table
CREATE TABLE IF NOT EXISTS user_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_status user_status,
  new_status user_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Helper function to get current user's organisation ID
CREATE OR REPLACE FUNCTION public.get_current_user_organisation_id()
RETURNS UUID AS $$
  SELECT organisation_id FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
  SELECT role FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE;

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_slug TEXT)
RETURNS BOOLEAN AS $$
  DECLARE
    user_role app_role;
  BEGIN
    SELECT role INTO user_role FROM user_profiles WHERE user_id = auth.uid();
    IF user_role IS NULL THEN
      RETURN false;
    END IF;
    
    RETURN EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role = user_role
      AND rp.permission_slug = permission_slug
    );
  END;
$$ LANGUAGE PLPGSQL STABLE;

-- =====================================================
-- SEED PERMISSIONS
-- =====================================================

INSERT INTO permissions (name, slug, category, description) VALUES
-- Agency
('View Agency', 'view_agency', 'agency', 'View agency profile'),
('Edit Agency', 'edit_agency', 'agency', 'Edit agency profile'),
('Manage Agency Staff', 'manage_agency_staff', 'agency', 'Manage staff'),
('View Agency Reports', 'view_agency_reports', 'agency', 'View reports'),

-- Users
('View Users', 'view_users', 'users', 'View users'),
('Invite Users', 'invite_users', 'users', 'Invite users'),
('Edit Users', 'edit_users', 'users', 'Edit users'),
('Suspend Users', 'suspend_users', 'users', 'Suspend users'),

-- Foster Carers
('View Foster Carers', 'view_foster_carers', 'foster_carers', 'View carers'),
('Create Foster Carer', 'create_foster_carer', 'foster_carers', 'Create carers'),
('Edit Foster Carer', 'edit_foster_carer', 'foster_carers', 'Edit carers'),
('View Own Carer', 'view_own_carer', 'foster_carers', 'View own profile'),
('Edit Own Carer', 'edit_own_carer', 'foster_carers', 'Edit own profile'),

-- Applicants
('View Applicants', 'view_applicants', 'applicants', 'View applicants'),
('Create Applicant', 'create_applicant', 'applicants', 'Create applicant'),
('Edit Applicant', 'edit_applicant', 'applicants', 'Edit applicant'),
('Approve Applicant', 'approve_applicant', 'applicants', 'Approve applicant'),
('View Own Application', 'view_own_application', 'applicants', 'View own application'),

-- Training
('View Training', 'view_training', 'training', 'View training'),
('Create Training', 'create_training', 'training', 'Create training'),
('Edit Training', 'edit_training', 'training', 'Edit training'),
('Manage Attendance', 'manage_attendance', 'training', 'Manage attendance'),
('Issue Certificates', 'issue_certificates', 'training', 'Issue certificates'),

-- Placements
('View Placements', 'view_placements', 'placements', 'View placements'),
('Create Placement', 'create_placement', 'placements', 'Create placements'),
('Request Placement', 'request_placement', 'placements', 'Request placement'),
('View Own Placements', 'view_own_placements', 'placements', 'View own placements'),

-- Documents
('View Documents', 'view_documents', 'documents', 'View documents'),
('Upload Documents', 'upload_documents', 'documents', 'Upload documents'),
('View Own Documents', 'view_own_documents', 'documents', 'View own documents'),

-- Messages
('View Messages', 'view_messages', 'messages', 'View messages'),
('Send Messages', 'send_messages', 'messages', 'Send messages'),
('View Own Messages', 'view_own_messages', 'messages', 'View own messages'),

-- Platform
('Manage Platform Settings', 'manage_platform_settings', 'platform', 'Manage settings'),
('View All Organisations', 'view_all_organisations', 'platform', 'View all orgs'),
('Manage Organisations', 'manage_organisations', 'platform', 'Manage orgs'),
('View Audit Logs', 'view_audit_logs', 'reports', 'View audit logs'),
('View Reports', 'view_reports', 'reports', 'View reports')
ON CONFLICT (slug) DO NOTHING;

-- Seed role permissions
INSERT INTO role_permissions (role, permission_slug) VALUES
-- Super Admin
('super_admin', 'view_agency'),
('super_admin', 'edit_agency'),
('super_admin', 'manage_agency_staff'),
('super_admin', 'view_agency_reports'),
('super_admin', 'view_users'),
('super_admin', 'invite_users'),
('super_admin', 'edit_users'),
('super_admin', 'suspend_users'),
('super_admin', 'view_foster_carers'),
('super_admin', 'create_foster_carer'),
('super_admin', 'edit_foster_carer'),
('super_admin', 'view_applicants'),
('super_admin', 'create_applicant'),
('super_admin', 'edit_applicant'),
('super_admin', 'view_training'),
('super_admin', 'create_training'),
('super_admin', 'view_placements'),
('super_admin', 'create_placement'),
('super_admin', 'view_documents'),
('super_admin', 'upload_documents'),
('super_admin', 'view_messages'),
('super_admin', 'send_messages'),
('super_admin', 'manage_platform_settings'),
('super_admin', 'view_all_organisations'),
('super_admin', 'manage_organisations'),
('super_admin', 'view_audit_logs'),
('super_admin', 'view_reports'),

-- Agency Admin
('agency_admin', 'view_agency'),
('agency_admin', 'edit_agency'),
('agency_admin', 'view_users'),
('agency_admin', 'invite_users'),
('agency_admin', 'edit_users'),
('agency_admin', 'view_foster_carers'),
('agency_admin', 'create_foster_carer'),
('agency_admin', 'edit_foster_carer'),
('agency_admin', 'view_applicants'),
('agency_admin', 'edit_applicant'),
('agency_admin', 'view_training'),
('agency_admin', 'create_training'),
('agency_admin', 'view_placements'),
('agency_admin', 'view_documents'),
('agency_admin', 'upload_documents'),
('agency_admin', 'view_messages'),
('agency_admin', 'send_messages'),

-- Agency Staff
('agency_staff', 'view_foster_carers'),
('agency_staff', 'edit_foster_carer'),
('agency_staff', 'view_applicants'),
('agency_staff', 'edit_applicant'),
('agency_staff', 'view_training'),
('agency_staff', 'view_placements'),
('agency_staff', 'view_documents'),
('agency_staff', 'view_messages'),
('agency_staff', 'send_messages'),

-- Foster Carer
('foster_carer', 'view_own_carer'),
('foster_carer', 'edit_own_carer'),
('foster_carer', 'view_own_placements'),
('foster_carer', 'view_own_documents'),
('foster_carer', 'upload_documents'),
('foster_carer', 'view_own_messages'),
('foster_carer', 'send_messages'),
('foster_carer', 'view_training'),

-- Applicant
('applicant', 'view_own_application'),
('applicant', 'view_own_documents'),
('applicant', 'upload_documents'),
('applicant', 'view_own_messages'),
('applicant', 'send_messages'),
('applicant', 'view_training'),

-- Trainer
('trainer', 'view_training'),
('trainer', 'create_training'),
('trainer', 'edit_training'),
('trainer', 'manage_attendance'),
('trainer', 'issue_certificates'),
('trainer', 'view_messages'),
('trainer', 'send_messages'),

-- Local Authority
('local_authority', 'request_placement'),
('local_authority', 'view_placements'),
('local_authority', 'view_messages'),
('local_authority', 'send_messages'),

-- Auditor
('auditor', 'view_agency'),
('auditor', 'view_users'),
('auditor', 'view_foster_carers'),
('auditor', 'view_applicants'),
('auditor', 'view_training'),
('auditor', 'view_placements'),
('auditor', 'view_documents'),
('auditor', 'view_audit_logs'),
('auditor', 'view_reports')
ON CONFLICT (role, permission_slug) DO NOTHING;

-- Seed platform organisation
INSERT INTO organisations (name, slug, type, email, is_verified)
VALUES ('Foster Care Platform', 'foster-care-platform', 'platform', 'admin@fostercareuk.co.uk', true)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles(organisation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON user_activity_logs(user_id);