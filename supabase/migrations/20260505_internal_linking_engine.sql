-- Internal Linking Engine for UK Fostering Platform
-- Step 2: Database tables

-- 1. INTERNAL LINK AUDITS
CREATE TABLE IF NOT EXISTS internal_link_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_name TEXT NOT NULL,
    audit_status TEXT DEFAULT 'pending',
    started_by_user_id UUID,
    total_pages_scanned INTEGER DEFAULT 0,
    total_links_found INTEGER DEFAULT 0,
    total_suggestions_created INTEGER DEFAULT 0,
    total_orphan_pages INTEGER DEFAULT 0,
    total_broken_links INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INTERNAL LINK PAGES (fostering-specific page types)
CREATE TABLE IF NOT EXISTS internal_link_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type TEXT NOT NULL,
    page_id TEXT NOT NULL,
    url TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT,
    h1 TEXT,
    meta_title TEXT,
    meta_description TEXT,
    main_keyword TEXT,
    secondary_keywords TEXT[],
    page_topic TEXT,
    content_summary TEXT,
    word_count INTEGER DEFAULT 0,
    index_status TEXT DEFAULT 'index',
    internal_links_count INTEGER DEFAULT 0,
    inbound_links_count INTEGER DEFAULT 0,
    outbound_links_count INTEGER DEFAULT 0,
    orphan_status TEXT DEFAULT 'active',
    last_scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page types for UK fostering
COMMENT ON COLUMN internal_link_pages.page_type IS 'homepage|location|service|location_service|agency_profile|blog|faq|static|resource';

-- 3. INTERNAL LINK SUGGESTIONS
CREATE TABLE IF NOT EXISTS internal_link_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_page_id UUID REFERENCES internal_link_pages(id),
    target_page_id UUID REFERENCES internal_link_pages(id),
    suggested_anchor_text TEXT NOT NULL,
    surrounding_text TEXT,
    link_reason TEXT,
    relevance_score INTEGER DEFAULT 0,
    seo_value_score INTEGER DEFAULT 0,
    risk_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'suggested',
    created_by_ai BOOLEAN DEFAULT true,
    approved_by_user_id UUID,
    applied_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suggestion status
COMMENT ON COLUMN internal_link_suggestions.status IS 'suggested|approved|applied|rejected|needs_review';

-- 4. INTERNAL LINK RULES
CREATE TABLE IF NOT EXISTS internal_link_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL,
    source_page_type TEXT NOT NULL,
    target_page_type TEXT NOT NULL,
    max_links_per_page INTEGER DEFAULT 10,
    max_same_anchor_usage INTEGER DEFAULT 3,
    allow_exact_match BOOLEAN DEFAULT true,
    allow_partial_match BOOLEAN DEFAULT true,
    require_context_match BOOLEAN DEFAULT true,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INTERNAL ANCHOR HISTORY
CREATE TABLE IF NOT EXISTS internal_anchor_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_text TEXT NOT NULL,
    target_url TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    page_ids_used UUID[],
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BROKEN INTERNAL LINKS
CREATE TABLE IF NOT EXISTS broken_internal_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT NOT NULL,
    broken_target_url TEXT NOT NULL,
    status_code INTEGER,
    found_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fix_status TEXT DEFAULT 'pending'
);

-- Insert default linking rules for UK fostering
INSERT INTO internal_link_rules (rule_name, source_page_type, target_page_type, max_links_per_page, allow_exact_match) VALUES
    ('Location to Service', 'location', 'service', 5, true),
    ('Service to Location', 'service', 'location', 5, true),
    ('Location to Agency', 'location', 'agency_profile', 3, false),
    ('Service to Agency', 'service', 'agency_profile', 3, false),
    ('Location Service Combo', 'location_service', 'location', 3, true),
    ('Location Service Combo', 'location_service', 'service', 3, true),
    ('Agency to Location', 'agency_profile', 'location', 2, false),
    ('Blog to Service', 'blog', 'service', 3, true),
    ('Blog to Location', 'blog', 'location', 3, true),
    ('Blog to Resource', 'blog', 'resource', 2, true),
    ('FAQ to Service', 'faq', 'service', 2, true),
    ('FAQ to Become Foster Carer', 'faq', 'homepage', 1, true)
ON CONFLICT DO NOTHING;