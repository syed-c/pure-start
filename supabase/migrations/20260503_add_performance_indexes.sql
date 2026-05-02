-- Performance indexes for scalability
-- Apply this migration to add performance indexes

-- Agencies table indexes
CREATE INDEX IF NOT EXISTS idx_agencies_name_search ON agencies(name);
CREATE INDEX IF NOT EXISTS idx_agencies_city ON agencies(city);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);
CREATE INDEX IF NOT EXISTS idx_agencies_ofsted_rating ON agencies(ofsted_rating);
CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON agencies(created_at);
CREATE INDEX IF NOT EXISTS idx_agencies_seo_visible ON agencies(seo_visible) WHERE seo_visible = true;

-- Fostering enquiries indexes
CREATE INDEX IF NOT EXISTS idx_fostering_enquiries_agency ON fostering_enquiries(agency_id);
CREATE INDEX IF NOT EXISTS idx_fostering_enquiries_status ON fostering_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_fostering_enquiries_created ON fostering_enquiries(created_at);

-- Foster carers indexes
CREATE INDEX IF NOT EXISTS idx_foster_carers_agency ON foster_carers(agency_id);
CREATE INDEX IF NOT EXISTS idx_foster_carers_status ON foster_carers(status);
CREATE INDEX IF NOT EXISTS idx_foster_carers_availability ON foster_carers(availability_status);

-- Applicants indexes
CREATE INDEX IF NOT EXISTS idx_applicants_agency ON applicants(agency_id);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_stage ON applicants(stage);

-- Placements indexes
CREATE INDEX IF NOT EXISTS idx_placements_foster_carer ON placements(foster_carer_id);
CREATE INDEX IF NOT EXISTS idx_placements_status ON placements(status);
CREATE INDEX IF NOT EXISTS idx_placements_start_date ON placements(start_date);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at);

-- SEO pages indexes
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON seo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_type ON seo_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_seo_pages_city ON seo_pages(city);

-- Notes:
-- These indexes will significantly improve query performance
-- especially for large datasets (1000+ records)
-- The partial index on seo_visible filters to only active records