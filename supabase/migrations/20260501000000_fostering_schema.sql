-- Foster Care Platform - Simple Schema Migration
-- Creates core fostering tables without foreign key dependencies

-- 1. FOSTER CARERS TABLE
CREATE TABLE IF NOT EXISTS foster_carers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    agency_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    postcode TEXT,
    status TEXT DEFAULT 'pending',
    fostering_types TEXT[] DEFAULT '{}',
    age_groups_supported TEXT[] DEFAULT '{}',
    availability_status TEXT DEFAULT 'unavailable',
    available_from DATE,
    notes TEXT,
    approval_date DATE,
    last_review_date DATE,
    next_review_date DATE,
    weekly_allowance DECIMAL(10,2),
    complexity_allowance DECIMAL(10,2),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. APPLICANTS TABLE
CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    agency_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    email TEXT,
    phone TEXT,
    address TEXT,
    postcode TEXT,
    status TEXT DEFAULT 'enquiry',
    stage TEXT DEFAULT 'enquiry',
    assigned_to TEXT,
    enquiry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    documents JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PLACEMENTS TABLE
CREATE TABLE IF NOT EXISTS placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id TEXT,
    foster_carer_id UUID,
    applicant_id UUID,
    child_first_name TEXT,
    child_age INTEGER,
    child_gender TEXT,
    placement_type TEXT,
    status TEXT DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    actual_end_date DATE,
    reason_for_placement TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TRAINING COURSES TABLE
CREATE TABLE IF NOT EXISTS training_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    duration_hours INTEGER,
    validity_months INTEGER,
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TRAINING RECORDS TABLE
CREATE TABLE IF NOT EXISTS training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foster_carer_id UUID,
    course_id UUID,
    agency_id TEXT,
    status TEXT DEFAULT 'not_started',
    progress INTEGER DEFAULT 0,
    completed_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    trainer_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS foster_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id TEXT,
    foster_carer_id UUID,
    applicant_id UUID,
    document_type TEXT,
    title TEXT NOT NULL,
    file_url TEXT,
    issue_date DATE,
    expiry_date DATE,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS fostering_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id TEXT,
    enquirer_name TEXT NOT NULL,
    enquirer_email TEXT,
    enquirer_phone TEXT,
    source TEXT,
    interest_type TEXT,
    child_age_group TEXT,
    child_gender TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    assigned_to TEXT,
    first_contact_date DATE,
    follow_up_date DATE,
    follow_up_notes TEXT,
    converted_to_applicant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DAILY LOGS TABLE
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foster_carer_id UUID,
    placement_id UUID,
    date DATE NOT NULL,
    mood TEXT,
    activities JSONB DEFAULT '{}',
    meals JSONB DEFAULT '{}',
    medications JSONB DEFAULT '{}',
    school_attendance TEXT,
    health_notes TEXT,
    behavior_notes TEXT,
    other_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. INCIDENT REPORTS TABLE
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foster_carer_id UUID,
    placement_id UUID,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_type TEXT NOT NULL,
    description TEXT NOT NULL,
    children_involved JSONB DEFAULT '{}',
    witnesses JSONB DEFAULT '{}',
    action_taken TEXT,
    reported_to TEXT,
    social_worker_notified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS fostering_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id TEXT,
    sender_id UUID,
    recipient_id UUID,
    subject TEXT,
    body TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foster_carer_id UUID,
    placement_id UUID,
    agency_id TEXT,
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);