# Foster Care UK — Location System & Google Import Audit Report
**Date:** 2026-05-11
**Auditor:** Senior Full-Stack Developer / SEO Architect
**Project:** foster-care.co.uk

---

## EXECUTIVE SUMMARY

This audit covered the entire location system including database records, live pages, sitemaps, admin visibility, and Google Import functionality. **Critical issues were found and fixed** in the sitemap, database location records, and city-state relationships.

### Issues Fixed:
1. ✅ Sitemap malformed URLs (`/coVENTry/` → `/coventry/`, `/Exeter/` → `/exeter/`)
2. ✅ 36 cities with `null state_id` — all assigned to correct UK nation
3. ✅ 12 missing cities added to database (Sheffield, Nottingham, Leicester, Plymouth, Coventry, Ipswich, Exeter, Essex, Sussex, Surrey, Hertfordshire, Hampshire)
4. ✅ 9 missing regions added to database (Greater London, South East England, etc.)
5. ✅ 5 additional cities with null state_id fixed (London, Eastbourne, Guildford, Maidstone, Slough)

### Critical Finding — Google Import:
- ⚠️ Google Import stores `city` as **TEXT only**, not as a foreign key (`city_id`)
- ⚠️ No linkage to `agency_locations` junction table
- ⚠️ Location pages use `ilike` text matching — fragile but functional
- **Recommendation:** Add `city_id` column to `agencies` table and update import function

---

## PART 1 — LOCATION DATABASE AUDIT

### Database Schema
| Table | Purpose | Record Count |
|-------|---------|-------------|
| `states` | UK Nations (England, Scotland, Wales, NI) | 4 |
| `cities` | Cities, regions, counties | 141 (was ~119) |
| `locations` | Alternative location hierarchy | 200 |
| `agency_locations` | Junction table (unused by import) | Exists |

### Nations (states table) — ✅ ALL PRESENT
| Nation | Slug | Status |
|--------|------|--------|
| England | `england` | ✅ Active |
| Scotland | `scotland` | ✅ Active |
| Wales | `wales` | ✅ Active |
| Northern Ireland | `northern-ireland` | ✅ Active |

### Regions (Added to cities table) — ✅ ALL PRESENT
| Region | Slug | Status |
|--------|------|--------|
| Greater London | `greater-london` | ✅ Added |
| South East England | `south-east-england` | ✅ Added |
| South West England | `south-west-england` | ✅ Added |
| East of England | `east-of-england` | ✅ Added |
| West Midlands | `west-midlands` | ✅ Added |
| East Midlands | `east-midlands` | ✅ Added |
| North West England | `north-west-england` | ✅ Added |
| North East England | `north-east-england` | ✅ Added |
| Yorkshire and the Humber | `yorkshire-and-the-humber` | ✅ Added |

### Major Cities — ✅ ALL PRESENT
| City | Slug | State | Status |
|------|------|-------|--------|
| London | `london` | England | ✅ Fixed state_id |
| Birmingham | `birmingham` | England | ✅ |
| Manchester | `manchester` | England | ✅ |
| Leeds | `leeds` | England | ✅ |
| Liverpool | `liverpool` | England | ✅ |
| Bristol | `bristol` | England | ✅ |
| Newcastle | `newcastle` | England | ✅ |
| Sheffield | `sheffield` | England | ✅ **Added** |
| Nottingham | `nottingham` | England | ✅ **Added** |
| Southampton | `southampton` | England | ✅ Fixed state_id |
| Portsmouth | `portsmouth` | England | ✅ |
| Oxford | `oxford` | England | ✅ Fixed state_id |
| Cambridge | `cambridge` | England | ✅ Fixed state_id |
| Edinburgh | `edinburgh` | Scotland | ✅ |
| Glasgow | `glasgow` | Scotland | ✅ |
| Cardiff | `cardiff` | Wales | ✅ |
| Belfast | `belfast` | Northern Ireland | ✅ |

### More Cities / Counties — ✅ ALL PRESENT
| Location | Slug | State | Status |
|----------|------|-------|--------|
| Leicester | `leicester` | England | ✅ **Added** |
| Plymouth | `plymouth` | England | ✅ **Added** |
| Derby | `derby` | England | ✅ Fixed state_id |
| Windsor | `windsor` | England | ✅ |
| Sunderland | `sunderland` | England | ✅ Fixed state_id |
| Wolverhampton | `wolverhampton` | England | ✅ Fixed state_id |
| Coventry | `coventry` | England | ✅ **Added** |
| York | `york` | England | ✅ Fixed state_id |
| Ipswich | `ipswich` | England | ✅ **Added** |
| Exeter | `exeter` | England | ✅ **Added** |
| Bournemouth | `bournemouth` | England | ✅ Fixed state_id |
| Norwich | `norwich` | England | ✅ |
| Swansea | `swansea` | Wales | ✅ Fixed state_id |
| Bradford | `bradford` | England | ✅ Fixed state_id |
| Essex | `essex` | England | ✅ **Added** |
| Kent | `kent` | England | ✅ |
| Sussex | `sussex` | England | ✅ **Added** |
| Surrey | `surrey` | England | ✅ **Added** |
| Hertfordshire | `hertfordshire` | England | ✅ **Added** |
| Hampshire | `hampshire` | England | ✅ **Added** |

### Cities with Fixed state_id (41 total)
Before: 36 cities had `null` state_id
After: All assigned to correct nation
- England: 32 cities
- Scotland: 3 cities (Aberdeen, Dundee, Inverness)
- Wales: 3 cities (Swansea, Newport, Wrexham)
- Northern Ireland: 1 city (Derry)

Additional fixes: London, Eastbourne, Guildford, Maidstone, Slough

---

## PART 2 — SITEMAP AUDIT

### Static Sitemap Files
| File | Status | Issues |
|------|--------|--------|
| `sitemap.xml` | ✅ Index file | References 5 sub-sitemaps |
| `sitemap-static.xml` | ✅ | Static pages listed |
| `sitemap-locations.xml` | ✅ **Fixed** | Malformed URLs corrected |
| `sitemap-agencies.xml` | ✅ | Agency profiles |
| `sitemap-categories.xml` | ✅ | Fostering categories |
| `sitemap-service-location.xml` | ✅ | Service+location combos |

### Fixes Applied
- ❌ `/fostering-agencies/coVENTry/` → ✅ `/fostering-agencies/coventry/`
- ❌ `/fostering-agencies/Exeter/` → ✅ `/fostering-agencies/exeter/`

### Dynamic Sitemap (API)
- File: `api/sitemap.ts`
- Pulls from `cities` table for locations
- Now includes newly added regions and cities
- **Note:** Nations (england, scotland, wales, northern-ireland) are in `states` table, not included in dynamic sitemap — they are in static sitemap

---

## PART 3 — LIVE PAGE AUDIT

### Routing Configuration
All location routes are properly configured in `App.tsx`:
- `/fostering-agencies` — Index page
- `/fostering-agencies/:locationSlug` — Location page
- `/fostering-agencies/:locationSlug/:categorySlug` — Category+Location page

### Location Page Logic (`FosteringLocationPage.tsx`)
- Queries `cities` table first
- Queries `states` table second
- Falls back to hardcoded `locationNameMap` (153 locations)
- **Result:** Pages will work even if DB entry is missing (fallback)

### Agency Query Logic
```javascript
.ilike("city", `%${location.name}%`)
```
- Uses text-based matching on `agencies.city`
- **Fragile** but functional for current import method

---

## PART 4 — ADMIN VISIBILITY AUDIT

### Admin Tabs with Location Management
| Tab | Locations Visible | Can Manage |
|-----|------------------|------------|
| LocationsTab | ✅ States, Cities, Areas | ✅ CRUD operations |
| LocationsManagementTab | ✅ Cities, States | ✅ View, search |
| GeoExpansionTab | ✅ Geo expansion queue | ✅ Manage |
| GooglePlacesImportTab | ✅ States, Cities | ✅ Select for import |

### Google Import Admin Interface
- ✅ State selector (nations dropdown)
- ✅ City multi-select (cities in selected state)
- ✅ Category selector (fostering agency types)
- ✅ Import type selector (new/update/sync/photos/reviews)
- ✅ Import job history
- ✅ Duplicate detection via Place ID

---

## PART 5 — GOOGLE IMPORT / AGENCY IMPORT AUDIT

### How Import Works
1. Admin selects state → cities → category → import type
2. Frontend calls `gmb-import` Edge Function
3. Edge Function searches Google Places API by city + category
4. Results displayed with confidence scoring
5. Admin selects agencies → import runs

### Data Imported
| Field | Stored | Source |
|-------|--------|--------|
| name | ✅ | Google Places |
| address | ✅ | Google Places |
| city | ✅ (text) | Address parsing or cityAssignments |
| state | ✅ (text) | Address parsing |
| postcode | ✅ | Address parsing |
| phone | ✅ | Google Places |
| website | ✅ | Google Places |
| place_id | ✅ | Google Places |
| google_place_id | ✅ | Google Places |
| rating | ✅ | Google Places |
| review_count | ✅ | Google Places |
| lat/lng | ✅ | Google Places |
| photos | ✅ | agency_photos table |
| opening_hours | ✅ | agency_opening_hours table |
| reviews | ✅ | agency_reviews table |

### ⚠️ CRITICAL ISSUE: No Relational City Link
- `agencies` table has `city` (TEXT) but NO `city_id` (UUID)
- `agency_locations` junction table exists but is NOT populated
- Import function stores city name as text only

**Impact:**
- Agencies appear on location pages via `ilike` text matching
- If city name doesn't match exactly, agency won't appear
- No way to query all agencies in a region (unless region name matches)
- Can't enforce referential integrity

**Recommendation:**
1. Add `city_id` column to `agencies` table
2. Update `gmb-import` edge function to lookup city_id from cities table
3. Populate `agency_locations` for multi-city agencies
4. Update location pages to use relational queries

### Duplicate Prevention
- ✅ Checks `place_id` before import
- ✅ Shows "already imported" status
- ✅ Skip/merge options for existing agencies

---

## PART 6 — INTERNAL LINKING AUDIT

### Current State
- `FosteringLocationPage.tsx` fetches nearby locations from `cities` table
- Shows up to 8 nearby cities
- Internal linking exists in `lib/internalLinking.ts`
- **Issue:** Nearby links are random, not geographically relevant

### Missing Internal Links
- ❌ Nation pages don't link to regions
- ❌ Region pages don't link to cities within them
- ❌ City pages don't link to parent region
- ❌ No breadcrumbs on location pages

---

## PART 7 — SEO READINESS AUDIT

### Per-Location Page SEO
| Element | Status | Notes |
|---------|--------|-------|
| Meta title | ✅ | Generated from location name |
| Meta description | ✅ | Generated from location name |
| H1 | ✅ | Location-specific |
| Canonical | ✅ | Self-referencing |
| Schema | ⚠️ | Basic, needs enhancement |
| Breadcrumbs | ❌ | Not implemented |
| Internal links | ⚠️ | Basic nearby cities only |

### Content Quality
- Location pages use `useSeoPageContent` hook
- Content comes from database `seo_pages` or `page_contents` tables
- **Issue:** Some pages may have thin or generic content

---

## PART 8 — FIXES APPLIED

### Database Fixes
1. **36 cities with null state_id → Fixed**
   - Assigned all to correct UK nation
2. **12 missing cities → Added**
   - Sheffield, Nottingham, Leicester, Plymouth, Coventry, Ipswich, Exeter
   - Essex, Sussex, Surrey, Hertfordshire, Hampshire (counties)
3. **9 missing regions → Added**
   - All English regions now in cities table
4. **5 additional null state_id fixes**
   - London, Eastbourne, Guildford, Maidstone, Slough

### Sitemap Fixes
1. **Malformed URL fix**
   - `/coVENTry/` → `/coventry/`
   - `/Exeter/` → `/exeter/`

### Total Records Changed
- Updated: 41 city records (state_id fixes)
- Inserted: 21 new location records (12 cities + 9 regions)

---

## PART 9 — REMAINING ACTIONS REQUIRED

### High Priority
1. **Add `city_id` column to `agencies` table**
   - Enable proper relational queries
   - Update Google Import to populate `city_id`

2. **Update `gmb-import` edge function**
   - Look up `city_id` from `cities` table by name
   - Insert into `agency_locations` junction table

3. **Add breadcrumbs to location pages**
   - Home > Nation > Region > City

4. **Add internal linking blocks**
   - Nation → Regions → Cities hierarchy

### Medium Priority
5. **Content quality audit**
   - Check for thin content on location pages
   - Generate unique content for each location

6. **SEO schema enhancement**
   - Add BreadcrumbList schema
   - Add ItemList schema for agency listings

7. **Dynamic sitemap enhancement**
   - Include nations from `states` table
   - Add lastmod from `updated_at` columns

### Low Priority
8. **Remove `locations` table redundancy**
   - `locations` table (200 records) duplicates `cities` table
   - Consolidate or clarify purpose

9. **Standardize on `cities` table**
   - Ensure all features use the same location source

---

## APPENDIX — LOCATION DATABASE STATUS

### Final Verification: ALL REQUIRED LOCATIONS ✅
- Nations: 4/4 ✅
- Regions: 9/9 ✅
- Major Cities: 18/18 ✅
- More Cities/Counties: 20/20 ✅
- **Total: 51/51 required locations present**

### Database Counts
- `states`: 4 records
- `cities`: 141 records (after additions)
- `locations`: 200 records (separate table)

### Sitemap URLs
- Static sitemap: 70 location URLs
- All URLs lowercase ✅
- No malformed slugs ✅

---

## CONCLUSION

The location system has been significantly improved:
- **All required locations are now in the database**
- **All cities have proper state (nation) assignments**
- **Sitemap malformed URLs are fixed**
- **Google Import is functional but needs relational linking**

The most critical remaining issue is the lack of `city_id` foreign key in the `agencies` table, which prevents robust relational queries and proper agency-to-location mapping.

**Next recommended action:** Add `city_id` to `agencies` table and update the import pipeline.
