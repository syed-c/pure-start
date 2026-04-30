-- Foster Care Platform - RBAC Foundation Migration
-- UK Foster Care Platform with Role-Based Access Control
-- Created: 2024-04-28

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_status AS ENUM ('active', 'invited', 'suspended', 'archived');
CREATE TYPE organisation_type AS ENUM ('fostering_agency', 'local_authority', 'training_provider', 'platform');
CREATE TYPE app_role AS ENUM (
  'super_admin',
  'agency_admin',
  'agency_staff',
  'foster_carer',
  'applicant',
  'trainer',
  'local_authority',
  'auditor'
);

-- =====================================================
-- ORGANISATIONS (Agencies, LAs, Training Providers)
-- =====================================================

CREATE TABLE organisations (
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

CREATE INDEX idx_organisations_type ON organisations(type);
CREATE INDEX idx_organisations_slug ON organisations(slug);
CREATE INDEX idx_organisations_is_active ON organisations(is_active);

-- =====================================================
-- USER PROFILES (extends auth.users)
-- =====================================================

CREATE TABLE user_profiles (
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
  
  -- Audit fields
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_organisation_id ON user_profiles(organisation_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- =====================================================
-- ROLE-SPECIFIC PROFILES
-- =====================================================

-- Agency Profile (for fostering agencies)
CREATE TABLE agency_profiles (
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

-- Foster Carer Profile
CREATE TABLE foster_carer_profiles (
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'suspended', 'deregistered')),
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

CREATE INDEX idx_foster_carer_profiles_user_id ON foster_carer_profiles(user_id);
CREATE INDEX idx_foster_carer_profiles_organisation_id ON foster_carer_profiles(organisation_id);
CREATE INDEX idx_foster_carer_profiles_status ON foster_carer_profiles(status);

-- Applicant / Prospective Foster Carer Profile
CREATE TABLE applicant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  address TEXT,
  postcode TEXT,
  phone TEXT,
  application_stage TEXT DEFAULT 'enquiry' CHECK (application_stage IN ('enquiry', 'initial_check', 'assessment', 'panel', 'approved', 'rejected')),
  enquiry_date DATE,
  application_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applicant_profiles_user_id ON applicant_profiles(user_id);
CREATE INDEX idx_applicant_profiles_organisation_id ON applicant_profiles(organisation_id);
CREATE INDEX idx_applicant_profiles_stage ON applicant_profiles(application_stage);

-- Trainer Profile
CREATE TABLE trainer_profiles (
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

CREATE INDEX idx_trainer_profiles_user_id ON trainer_profiles(user_id);
CREATE INDEX idx_trainer_profiles_organisation_id ON trainer_profiles(organisation_id);

-- Local Authority Profile
CREATE TABLE local_authority_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE UNIQUE,
  la_code TEXT,
  contact_department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PERMISSIONS SYSTEM
-- =====================================================

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default permissions
INSERT INTO permissions (name, slug, category, description) VALUES
-- Agency Management
('View Agency', 'view_agency', 'agency', 'View agency profile and details'),
('Edit Agency', 'edit_agency', 'agency', 'Edit agency profile and settings'),
('Manage Agency Staff', 'manage_agency_staff', 'agency', 'Add/remove agency staff'),
('View Agency Reports', 'view_agency_reports', 'agency', 'View agency analytics and reports'),

-- User Management
('View Users', 'view_users', 'users', 'View users within organisation'),
('Invite Users', 'invite_users', 'users', 'Invite new users'),
('Edit Users', 'edit_users', 'users', 'Edit user details'),
('Suspend Users', 'suspend_users', 'users', 'Suspend user accounts'),
('Delete Users', 'delete_users', 'users', 'Remove users'),

-- Foster Carers
('View Foster Carers', 'view_foster_carers', 'foster_carers', 'View foster carers'),
('Create Foster Carer', 'create_foster_carer', 'foster_carers', 'Create foster carers'),
('Edit Foster Carer', 'edit_foster_carer', 'foster_carers', 'Edit foster carers'),
('Delete Foster Carer', 'delete_foster_carer', 'foster_carers', 'Delete foster carers'),
('View Own Carer Profile', 'view_own_carer', 'foster_carers', 'View own foster carer profile'),
('Edit Own Carer Profile', 'edit_own_carer', 'foster_carers', 'Edit own foster carers'),

-- Applicants
('View Applicants', 'view_applicants', 'applicants', 'View applicants'),
('Create Applicant', 'create_applicant', 'applicants', 'Create applicant'),
('Edit Applicant', 'edit_applicant', 'applicants', 'Edit applicant'),
('Approve Applicant', 'approve_applicant', 'applicants', 'Approve applicant'),
('View Own Application', 'view_own_application', 'applicants', 'View own application'),

-- Training
('View Training', 'view_training', 'training', 'View training sessions'),
('Create Training', 'create_training', 'training', 'Create training sessions'),
('Edit Training', 'edit_training', 'training', 'Edit training sessions'),
('Delete Training', 'delete_training', 'training', 'Delete training sessions'),
('Manage Attendance', 'manage_attendance', 'training', 'Manage training attendance'),
('Issue Certificates', 'issue_certificates', 'training', 'Issue training certificates'),

-- Placements
('View Placements', 'view_placements', 'placements', 'View placements'),
('Create Placement', 'create_placement', 'placements', 'Create placements'),
('Edit Placement', 'edit_placement', 'placements', 'Edit placements'),
('Request Placement', 'request_placement', 'placements', 'Request placement (LA only)'),
('View Own Placements', 'view_own_placements', 'placements', 'View own placements'),

-- Documents
('View Documents', 'view_documents', 'documents', 'View documents'),
('Upload Documents', 'upload_documents', 'documents', 'Upload documents'),
('Delete Documents', 'delete_documents', 'documents', 'Delete documents'),
('View Own Documents', 'view_own_documents', 'documents', 'View own documents'),

-- Messages
('View Messages', 'view_messages', 'messages', 'View messages'),
('Send Messages', 'send_messages', 'messages', 'Send messages'),
('View Own Messages', 'view_own_messages', 'messages', 'View own messages'),

-- Reports & Logs
('View Reports', 'view_reports', 'reports', 'View system reports'),
('View Audit Logs', 'view_audit_logs', 'reports', 'View audit logs'),

-- Platform Settings (Super Admin only)
('Manage Platform Settings', 'manage_platform_settings', 'platform', 'Manage platform settings'),
('Manage Roles', 'manage_roles', 'platform', 'Manage roles and permissions'),
('View All Organisations', 'view_all_organisations', 'platform', 'View all organisations'),
('Manage Organisations', 'manage_organisations', 'platform', 'Create/edit organisations');

-- Role Permissions Mapping
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_slug)
);

-- Default role permissions (upsert to handle existing data)
INSERT INTO role_permissions (role, permission_slug) VALUES
-- Super Admin - Full Access
('super_admin', 'view_agency'),
('super_admin', 'edit_agency'),
('super_admin', 'manage_agency_staff'),
('super_admin', 'view_agency_reports'),
('super_admin', 'view_users'),
('super_admin', 'invite_users'),
('super_admin', 'edit_users'),
('super_admin', 'suspend_users'),
('super_admin', 'delete_users'),
('super_admin', 'view_foster_carers'),
('super_admin', 'create_foster_carer'),
('super_admin', 'edit_foster_carer'),
('super_admin', 'delete_foster_carer'),
('super_admin', 'view_own_carer'),
('super_admin', 'edit_own_carer'),
('super_admin', 'view_applicants'),
('super_admin', 'create_applicant'),
('super_admin', 'edit_applicant'),
('super_admin', 'approve_applicant'),
('super_admin', 'view_own_application'),
('super_admin', 'view_training'),
('super_admin', 'create_training'),
('super_admin', 'edit_training'),
('super_admin', 'delete_training'),
('super_admin', 'manage_attendance'),
('super_admin', 'issue_certificates'),
('super_admin', 'view_placements'),
('super_admin', 'create_placement'),
('super_admin', 'edit_placement'),
('super_admin', 'request_placement'),
('super_admin', 'view_own_placements'),
('super_admin', 'view_documents'),
('super_admin', 'upload_documents'),
('super_admin', 'delete_documents'),
('super_admin', 'view_own_documents'),
('super_admin', 'view_messages'),
('super_admin', 'send_messages'),
('super_admin', 'view_own_messages'),
('super_admin', 'view_reports'),
('super_admin', 'view_audit_logs'),
('super_admin', 'manage_platform_settings'),
('super_admin', 'manage_roles'),
('super_admin', 'view_all_organisations'),
('super_admin', 'manage_organisations'),

-- Agency Admin - Agency-level access
('agency_admin', 'view_agency'),
('agency_admin', 'edit_agency'),
('agency_admin', 'manage_agency_staff'),
('agency_admin', 'view_agency_reports'),
('agency_admin', 'view_users'),
('agency_admin', 'invite_users'),
('agency_admin', 'edit_users'),
('agency_admin', 'view_foster_carers'),
('agency_admin', 'create_foster_carer'),
('agency_admin', 'edit_foster_carer'),
('agency_admin', 'view_applicants'),
('agency_admin', 'create_applicant'),
('agency_admin', 'edit_applicant'),
('agency_admin', 'approve_applicant'),
('agency_admin', 'view_training'),
('agency_admin', 'create_training'),
('agency_admin', 'edit_training'),
('agency_admin', 'manage_attendance'),
('agency_admin', 'issue_certificates'),
('agency_admin', 'view_placements'),
('agency_admin', 'create_placement'),
('agency_admin', 'edit_placement'),
('agency_admin', 'view_documents'),
('agency_admin', 'upload_documents'),
('agency_admin', 'view_messages'),
('agency_admin', 'send_messages'),

-- Agency Staff - Limited to assigned cases
('agency_staff', 'view_foster_carers'),
('agency_staff', 'edit_foster_carer'),
('agency_staff', 'view_applicants'),
('agency_staff', 'edit_applicant'),
('agency_staff', 'view_training'),
('agency_staff', 'view_placements'),
('agency_staff', 'edit_placement'),
('agency_staff', 'view_documents'),
('agency_staff', 'upload_documents'),
('agency_staff', 'view_messages'),
('agency_staff', 'send_messages'),
('agency_staff', 'view_agency_reports'),

-- Foster Carer - Own data only
('foster_carer', 'view_own_carer'),
('foster_carer', 'edit_own_carer'),
('foster_carer', 'view_own_placements'),
('foster_carer', 'view_own_documents'),
('foster_carer', 'upload_documents'),
('foster_carer', 'view_own_messages'),
('foster_carer', 'send_messages'),
('foster_carer', 'view_training'),

-- Applicant - Own application only
('applicant', 'view_own_application'),
('applicant', 'view_own_documents'),
('applicant', 'upload_documents'),
('applicant', 'view_own_messages'),
('applicant', 'send_messages'),
('applicant', 'view_training'),

-- Trainer - Own training content
('trainer', 'view_training'),
('trainer', 'create_training'),
('trainer', 'edit_training'),
('trainer', 'delete_training'),
('trainer', 'manage_attendance'),
('trainer', 'issue_certificates'),
('trainer', 'view_messages'),
('trainer', 'send_messages'),

-- Local Authority - Placement requests only
('local_authority', 'request_placement'),
('local_authority', 'view_placements'),
('local_authority', 'view_messages'),
('local_authority', 'send_messages'),

-- Auditor - Read only
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

-- =====================================================
-- USER STATUS HISTORY
-- =====================================================

CREATE TABLE user_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_status user_status,
  new_status user_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_status_logs_user_id ON user_status_logs(user_id);

-- =====================================================
-- USER ACTIVITY LOGS
-- =====================================================

CREATE TABLE user_activity_logs (
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

CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_entity ON user_activity_logs(entity_type, entity_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- =====================================================
-- DOCUMENTS (unified document storage)
-- =====================================================

CREATE TABLE documents (
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

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_owner ON documents(owner_user_id);
CREATE INDEX idx_documents_organisation ON documents(organisation_id);

-- =====================================================
-- MESSAGES
-- =====================================================

CREATE TABLE messages (
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

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_entity ON messages(entity_type, entity_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
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

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read, user_id);

-- =====================================================
-- SETTINGS (key-value store)
-- =====================================================

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foster_carer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_authority_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

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

-- ORGANISATIONS RLS
CREATE POLICY "Anyone can view active organisations"
  ON organisations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admins can manage organisations"
  ON organisations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

-- USER PROFILES RLS
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view organisation users"
  ON user_profiles FOR SELECT
  USING (
    organisation_id = get_current_user_organisation_id()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'agency_admin')
    )
  );

CREATE POLICY "Super admins can manage all users"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

CREATE POLICY "Agency admins can manage org users"
  ON user_profiles FOR INSERT
  WITH CHECK (
    organisation_id = get_current_user_organisation_id()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

-- AGENCY PROFILES RLS
CREATE POLICY "Anyone can view verified agencies"
  ON agency_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organisations o
      WHERE o.id = organisation_id
      AND o.is_verified = true
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

CREATE POLICY "Agency admins can manage their agency"
  ON agency_profiles FOR ALL
  USING (
    organisation_id = get_current_user_organisation_id()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

-- FOSTER CARER PROFILES RLS
CREATE POLICY "Foster carers can view own profile"
  ON foster_carer_profiles FOR SELECT
  USING (
    user_id = auth.uid()
    OR organisation_id = get_current_user_organisation_id()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'agency_admin', 'agency_staff')
    )
  );

CREATE POLICY "Admins can manage foster carers"
  ON foster_carer_profiles FOR ALL
  USING (
    organisation_id = get_current_user_organisation_id()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'agency_admin')
    )
  );

-- APPLICANT PROFILES RLS
CREATE POLICY "Applicants can view own profile"
  ON applicant_profiles FOR SELECT
  USING (
    user_id = auth.uid()
    OR organisation_id = get_current_user_organisation_id()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'agency_admin', 'agency_staff')
    )
  );

CREATE POLICY "Admins can manage applicants"
  ON applicant_profiles FOR ALL
  USING (
    organisation_id = get_current_user_organisation_id()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'agency_admin')
    )
  );

-- MESSAGES RLS
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR organisation_id = get_current_user_organisation_id()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- NOTIFICATIONS RLS
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  USING (user_id = auth.uid());

-- DOCUMENTS RLS
CREATE POLICY "Users can view accessible documents"
  ON documents FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR organisation_id = get_current_user_organisation_id()
    OR is_public = true
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    owner_user_id = auth.uid()
    OR organisation_id = get_current_user_organisation_id()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'agency_admin')
    )
  );

-- USER ACTIVITY LOGS - Super admins only
CREATE POLICY "Super admins can view all activity logs"
  ON user_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

CREATE POLICY "System can insert activity logs"
  ON user_activity_logs FOR INSERT
  WITH CHECK (true);

-- USER STATUS LOGS - Self and admins
CREATE POLICY "Users can view own status history"
  ON user_status_logs FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'agency_admin')
    )
  );

-- SETTINGS - Public settings readable by all, write by super admin
CREATE POLICY "Anyone can view public settings"
  ON settings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Super admins can manage settings"
  ON settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'super_admin'
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-create user profile on auth.users insert (use OR REPLACE to handle existing)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INITIAL SEED DATA
-- =====================================================

-- Create default platform organisation
INSERT INTO organisations (name, slug, type, email, is_verified)
VALUES ('Foster Care Platform', 'foster-care-platform', 'platform', 'admin@fostercareuk.co.uk', true)
ON CONFLICT (slug) DO NOTHING;

-- Create default Super Admin (you need to manually link this to a real user)
-- The email should match your Supabase admin email