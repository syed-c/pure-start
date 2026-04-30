# Google Places Import Audit Report

## Executive Summary

The existing Google Places Import system has basic functionality but is incomplete. It imports basic agency data but fails to capture photos, business hours, reviews, and detailed Google profile information. The database schema is also missing many fields needed for a complete fostering agency profile.

---

## 1. Current System State

### 1.1 Google Places Import Tab (UI)

**Location**: `/src/components/admin/tabs/GooglePlacesImportTab.tsx`

**Existing Features**:
- ✅ State/Region selection dropdown
- ✅ Category selection (fostering agency categories)
- ✅ City search input
- ✅ Max pages selector (1-5)
- ✅ Search button with loading state
- ✅ Results table showing: name, address, rating, contact, status
- ✅ Import selection with checkboxes
- ✅ Import button with progress
- ✅ Import log display
- ✅ Stats cards showing totals

**Missing Features**:
- ❌ Import type selection (new/update/photos-only/hours-only)
- ❌ UK region selector (in addition to nation)
- ❌ County/town filters
- ❌ Postcode area filter
- ❌ Radius filter
- ❌ Minimum rating filter
- ❌ Minimum review count filter
- ❌ API field selection
- ❌ Import preview before confirm
- ❌ Import history view
- ❌ Error logs panel
- ❌ Duplicate detection options
- ❌ Import settings panel
- ❌ Agency type mapping
- ❌ Confidence scoring display

### 1.2 GMB Import Edge Function

**Location**: `/supabase/functions/gmb-import/index.ts`

**Search Action** (`action: 'search'`):
- ✅ Uses Text Search API
- ✅ Pagination with nextPageToken
- ✅ Returns: id, displayName, formattedAddress, rating, userRatingCount, location, types, photos, regularOpeningHours, phone, website
- ✅ Region code set to GB (UK)
- ✅ Language set to English

**Import Action** (`action: 'import'`):
- ⚠️ Checks for existing via `google_place_id` (but column is named `place_id` in DB)
- ✅ Fetches Place Details with field mask: id, displayName, formattedAddress, nationalPhoneNumber, internationalPhoneNumber, websiteUri, googleMapsUri, location, rating, userRatingCount, photos, regularOpeningHours, reviews, shortFormattedAddress, adrFormatAddress, priceLevel, businessStatus, utcOffsetMinutes
- ⚠️ Photo URLs built on-the-fly using API key (not stored properly)
- ❌ Business hours requested but NOT stored
- ❌ Reviews requested but NOT stored
- ❌ Editorial summary not stored
- ❌ Google types/categories not stored
- ❌ Business status not stored
- ❌ Raw Google payload not stored for debugging

### 1.3 Database Tables

**agencies table** (existing):

| Field | Status | Notes |
|-------|--------|-------|
| id | ✅ | UUID primary key |
| name | ✅ | Business name |
| slug | ✅ | URL slug |
| address | ✅ | Full address |
| city | ✅ | City name |
| state | ✅ | State/region |
| postcode | ✅ | Postcode |
| phone | ✅ | Phone number |
| email | ✅ | Email (rarely from Google) |
| website | ✅ | Website URL |
| rating | ✅ | Average rating |
| review_count | ✅ | Total reviews |
| place_id | ✅ | Google Place ID |
| google_maps_url | ✅ | Maps link |
| is_verified | ✅ | Verification status |
| is_featured | ✅ | Featured flag |
| is_claimed | ✅ | Claim status |
| source | ✅ | Import source ('gmb') |
| created_at | ✅ | Creation timestamp |
| updated_at | ✅ | Update timestamp |

**Missing columns that need to be added**:
- ❌ google_place_id (rename from place_id or add as alias)
- ❌ google_resource_name (new Places API resource name)
- ❌ short_description
- ❌ full_description
- ❌ agency_type
- ❌ status (draft, pending, published, rejected)
- ❌ listing_status
- ❌ verification_status
- ❌ claim_status
- ❌ logo_url
- ❌ main_image_url
- ❌ cover_image_url
- ❌ imported_at
- ❌ last_synced_at
- ❌ average_rating (duplicate of rating?)
- ❌ total_reviews (duplicate of review_count?)

**Supporting tables that DO NOT exist**:
- ❌ agency_locations (location data)
- ❌ agency_service_areas (service areas)
- ❌ agency_fostering_services (services offered)
- ❌ agency_google_profiles (Google-specific data)
- ❌ agency_opening_hours (business hours)
- ❌ agency_photos (photo gallery)
- ❌ agency_reviews (Google reviews)
- ❌ import_jobs (import history)
- ❌ import_job_results (per-result tracking)
- ❌ duplicate_matches (duplicate detection)
- ❌ service_types (fostering service types)

---

## 2. Issues Found

### 2.1 Critical Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| Column name mismatch | CRITICAL | Edge function queries `google_place_id` but table has `place_id` |
| Photos not stored | HIGH | Photo references not stored in database, only constructed on-the-fly |
| Hours not stored | HIGH | Opening hours fetched but not saved |
| Reviews not stored | HIGH | Reviews fetched but not saved |
| Missing agency status | MEDIUM | No draft/pending/published workflow |

### 2.2 Data Not Currently Imported

From Google Places API (available but not stored):
- ✅ Place ID (stored as place_id)
- ✅ Business name (stored)
- ✅ Formatted address (stored)
- ✅ Phone number (stored)
- ✅ Website (stored)
- ✅ Rating (stored)
- ✅ Review count (stored)
- ❌ Google resource name
- ❌ Primary category
- ❌ Additional categories/types
- ❌ Editorial summary/description
- ❌ Business status
- ❌ Regular opening hours (weekday text)
- ❌ Current opening hours
- ❌ Special hours
- ❌ Photo references (stored indirectly via constructed URLs)
- ❌ Photo attribution
- ❌ Reviews (author, rating, text, time)
- ❌ Price level
- ❌ UTC offset
- ❌ Plus code
- ❌ Service area

### 2.3 UI Improvements Needed

1. Add import type selector
2. Add UK region/county filters
3. Add API usage warning
4. Add confidence scoring
5. Add category mapping UI
6. Add import preview step
7. Add import history panel
8. Add error log panel
9. Add duplicate detection options

---

## 3. Implementation Plan

### Phase 1: Database Schema Updates

1. Add missing columns to `agencies` table
2. Create new supporting tables:
   - `agency_google_profiles` - Google-specific data
   - `agency_opening_hours` - Business hours
   - `agency_photos` - Photo gallery
   - `agency_reviews` - Google reviews
   - `import_jobs` - Import job tracking
   - `import_job_results` - Per-result tracking

### Phase 2: Edge Function Updates

1. Fix column name (google_place_id → place_id or add column)
2. Store business hours properly
3. Store photo references
4. Store reviews
5. Store Google types/categories
6. Store business status
7. Add update existing agency logic
8. Add duplicate detection logic

### Phase 3: UI Enhancements

1. Add import type selector
2. Add region/county filters
3. Add preview step
4. Add history panel
5. Add error logs
6. Add confidence indicators
7. Add category mapping display

### Phase 4: Agency Profile Updates

1. Display imported photos
2. Display business hours
3. Display reviews
4. Add SEO fields
5. Add manual enrichment fields
6. Add claim flow

---

## 4. Mapping: Existing vs Required

### Tables

| Existing | Status | Action |
|----------|--------|--------|
| agencies | Exists, incomplete | Enhance with missing columns |

### New Tables Needed

| Table | Purpose |
|-------|---------|
| agency_google_profiles | Store Google-specific data |
| agency_opening_hours | Store structured business hours |
| agency_photos | Store photo gallery |
| agency_reviews | Store Google reviews |
| import_jobs | Track import jobs |
| import_job_results | Track per-result outcomes |

### Fields to Add to agencies

```
- google_place_id (or alias to place_id)
- google_resource_name
- short_description
- full_description
- agency_type
- status (default: 'pending')
- listing_status
- verification_status  
- claim_status
- logo_url
- main_image_url
- cover_image_url
- imported_at
- last_synced_at
```

---

## 5. Priority Actions

### P0 - Must Fix Before Testing

1. Fix column name mismatch in edge function
2. Store business hours
3. Store photo references
4. Store reviews

### P1 - High Priority

1. Add agency status field
2. Create agency_photos table
3. Create agency_opening_hours table
4. Create agency_reviews table
5. Add import history tracking

### P2 - Medium Priority

1. Enhance UI with import type selector
2. Add region/county filters
3. Add preview step
4. Add duplicate detection

### P3 - Nice to Have

1. Confidence scoring
2. Category mapping UI
3. Error log panel
4. Import settings

---

## 6. What's Already Working

- ✅ Search functionality with pagination
- ✅ Basic agency data import (name, address, phone, website, rating)
- ✅ Duplicate detection via place_id
- ✅ Category filter for search
- ✅ UK-focused search (region code GB)
- ✅ State selection
- ✅ Max pages selector
- ✅ Import progress display
- ✅ Import log
- ✅ Stats cards
- ✅ API key stored in global_settings