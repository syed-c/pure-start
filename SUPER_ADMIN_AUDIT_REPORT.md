# SUPER ADMIN DASHBOARD AUDIT REPORT
## Foster-Care.co.uk Comprehensive Platform Audit
**Date:** Mon May 11 2026
**Auditor:** AI Audit Team (7 parallel sub-agents)
**Scope:** 75+ Super Admin tabs, sub-tabs, orphan tabs, and Agency Dashboard tabs
**Status:** AUDIT COMPLETE — AWAITING REMEDIATION

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Critical Security Issues](#2-critical-security-issues)
3. [Command Center Tab Group](#3-command-center-tab-group)
4. [Marketplace Tab Group](#4-marketplace-tab-group)
5. [Discovery & SEO Tab Group](#5-discovery--seo-tab-group)
6. [Content Management Tab Group](#6-content-management-tab-group)
7. [Reputation Tab Group](#7-reputation-tab-group)
8. [Enquiries & Bookings Tab Group](#8-enquiries--bookings-tab-group)
9. [Growth & Marketing Tab Group](#9-growth--marketing-tab-group)
10. [Monetization Tab Group](#10-monetization-tab-group)
11. [Integrations Tab Group](#11-integrations-tab-group)
12. [AI & Automation Tab Group](#12-ai--automation-tab-group)
13. [Platform Settings Tab Group](#13-platform-settings-tab-group)
14. [System Diagnostics Tab Group](#14-system-diagnostics-tab-group)
15. [Orphan Tabs](#15-orphan-tabs)
16. [Agency Dashboard Tabs](#16-agency-dashboard-tabs)
17. [Cross-Cutting Issues](#17-cross-cutting-issues)
18. [Issue Summary by Priority](#18-issue-summary-by-priority)
19. [Remediation Roadmap](#19-remediation-roadmap)

---

## 1. EXECUTIVE SUMMARY

### Overall Platform Health: CRITICAL

The foster-care.co.uk Super Admin dashboard contains **extensive dental directory remnants** across **nearly every tab**. The platform was clearly migrated from a dental clinic directory system, but the migration is incomplete. While the public-facing pages and core agency directory are mostly correct, the admin backend still operates on dental logic, queries non-existent dental tables, and exposes critical security vulnerabilities.

### Top-Line Numbers

| Metric | Count |
|--------|-------|
| Total Tabs Audited | 75+ |
| Tabs with Critical Issues | 42 |
| Tabs Completely Non-Functional | 12 |
| Security Vulnerabilities | 2 |
| High Priority Issues | 78 |
| Medium Priority Issues | 64 |
| Low Priority Issues | 38 |
| Dental Table References | 40+ |
| Broken Buttons/Dead UI | 25+ |
| Runtime Crash Risks | 8 |

### Most Critical Findings

1. **SECURITY:** Hardcoded Supabase service_role JWT token in `UsersManagementTab.tsx` (frontend source code)
2. **SECURITY:** Hardcoded Supabase URL + anon key in `ContentAdminTab.tsx`
3. **DATA LAYER:** 40+ queries reference non-existent dental tables (`clinics`, `dentists`, `patients`, `treatments`, `clinic_hours`, `clinic_insurances`, `dentist_settings`, `clinic_oauth_tokens`, `clinic_messages`)
4. **AGENCY DASHBOARD:** 5 of 14 agency tabs are completely wrong components (e.g., "Placements" tab is a dental appointment scheduler)
5. **RUNTIME CRASHES:** 8 components will crash or throw ReferenceErrors under normal use
6. **BROKEN NAVIGATION:** 15+ quick-action buttons navigate to non-existent tabs or use old dental tab IDs
7. **WRONG MARKET:** Multiple tabs reference UAE (AED currency, Dubai, Abu Dhabi) and US (California, Massachusetts) instead of UK
8. **NON-FUNCTIONAL FEATURES:** 25+ buttons have no `onClick` handlers and do nothing

---

## 2. CRITICAL SECURITY ISSUES

### Issue #1: Hardcoded Service Role JWT in Frontend

- **File:** `src/components/admin/tabs/UsersManagementTab.tsx`
- **Severity:** CRITICAL
- **Details:** Lines 14-18 contain a hardcoded Supabase service_role JWT token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Impact:** Anyone with access to the frontend bundle has full database read/write access, bypassing ALL Row Level Security policies.
- **Fix:** Remove immediately. Use environment variables and backend-only access.

### Issue #2: Hardcoded Supabase Credentials in Frontend

- **File:** `src/components/admin/tabs/ContentAdminTab.tsx`
- **Severity:** CRITICAL
- **Details:** Lines 117-118 expose `https://vcvvtklbyvdbysfdbnfp.supabase.co` and the full anon JWT.
- **Impact:** Database can be accessed directly by anyone inspecting the source.
- **Fix:** Use environment variables via Vite's `import.meta.env`.

---

## 3. COMMAND CENTER TAB GROUP

### Tab: `overview` (OverviewTab)

**What it does:** Main dashboard showing platform stats, analytics charts, recent activity, compliance alerts, quick actions, and system metrics.

**Working Features:**
- Stats cards display (if data exists)
- Chart rendering
- Weekly report card
- Compliance alerts section

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Performance Summary Progress Bar | Uses `stats?.clinics?.total` (dental remnant). Denominator always 1 if no `clinics` object. | High |
| Quick Actions Navigation | `navigateTo('leads')`, `navigateTo('appointments')`, `navigateTo('audit')`, `navigateTo('gmb-connections')`, `navigateTo('review-insights')`, `navigateTo('audit-logs')` — tabs don't exist or aren't in this group. Click = nothing. | High |
| Add Agency Button | No `onClick` handler. Dead button. | High |
| Weekly Report Card | Uses `stats?.appointments?.confirmed` instead of enquiry data. | Medium |
| Recent Activity Navigation | All items navigate to `'appointments'` (non-existent). | Medium |
| Compliance Alerts Query | Queries `foster_carer_profiles.panel_date`, `approval_date`, `applicant_profiles.application_stage` — tables may not exist. | Medium |

**Dental Remnants:** `clinics` stats reference, `appointments` concept.

**Data Controls:** Platform overview stats, weekly reports, compliance monitoring.

**Frontend Affected:** Home page stats (indirectly).

---

### Tab: `weekly` (FounderWeeklyTab)

**What it does:** Week-over-week comparison dashboard for founders showing agency growth, claims, verifications, enquiries, and a conversion funnel.

**Working Features:**
- Basic layout and cards render
- Comparison indicators (up/down arrows)

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Top Performing Locations | Queries `cities.dentist_count` (dental remnant). Displays dentist data. | High |
| Revenue Pipeline | Queries `clinic_subscriptions` table (dental remnant). Wrong table. | High |
| Enquiries & Leads Stats | Identical queries for both, so they always show the same numbers. | Medium |
| AI Health Summary | Generic/dental-oriented text. No actual AI analysis. | Low |

**Dental Remnants:** `dentist_count`, `clinic_subscriptions`.

**Data Controls:** Founder metrics, revenue pipeline, location performance.

**Frontend Affected:** None directly.

---

### Tab: `visitor-analytics` (VisitorAnalyticsTab)

**What it does:** Comprehensive visitor analytics with charts, filters, traffic sources, geographic data, and visitor journey tracking.

**Working Features:**
- Chart rendering
- Filter UI
- Visitor journey display

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Page Type Filter | Includes `clinic` and `dentist` options. | Medium |
| Appointment Booking Sources | Section shows "Appointment Booking Sources" with `analytics?.appointmentSources`. Should be "Enquiry Sources". | Medium |
| Visitor Journeys | References `journey.patientName`. | Low |
| Converted Badge | Shows "Booked" / "No". Should be "Enquired". | Medium |
| Export Button | No `onClick` handler. Dead button. | Medium |

**Dental Remnants:** `clinic`, `dentist`, `patientName`, `Booked`, `appointmentSources`.

**Data Controls:** Visitor analytics, traffic sources, geographic data.

**Frontend Affected:** Analytics tracking pages.

---

### Tab: `top-agencies` (TopDentistsTab)

**What it does:** Allows admins to manually pin/select top 10 agencies per city to control search result ordering.

**Working Features:**
- City selector dropdown
- Agency table rendering (from `agencies` table)
- Pin/unpin toggle
- Save to database

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| File Name | `TopDentistsTab.tsx` exports `TopAgenciesTab`. Misleading. | High |
| Internal Interface | Named `PinnedClinic` with `clinic_id` fields. | Medium |
| Settings Key | Uses `pinned_clinics_${selectedCity}`. | Medium |
| Empty State | "Select a city to manage top clinics". | Medium |
| Table Headers | All say "Clinics". | Medium |
| Audit Log | Logs `UPDATE_PINNED_CLINICS`. | Low |

**Dental Remnants:** `clinic`, `clinics`, `pinned_clinics`, `PinnedClinic`.

**Data Controls:** Agency ranking/pinning per city, search result ordering.

**Frontend Affected:** City page top agency listings.

---

### Tab: `reports` (ReportsTab)

**What it does:** Platform-wide reporting hub with summary stats, weekly trends chart, top agencies table, and report category cards.

**Working Features:**
- Stats cards render
- Weekly trends chart
- Top agencies table (partially)

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Report Cards | Have `cursor-pointer` and hover effects but no `onClick`. Purely decorative. | High |
| Export All Button | No `onClick` handler. Dead button. | High |
| Top Agencies Data | Queries `agencies.average_rating`, `total_reviews`, `total_enquiries`. Columns may not exist (other tabs use `rating`, `review_count`). | Medium |
| Missing Fostering Reports | No reports for placements, carer demographics, enquiry outcomes, etc. | Medium |

**Dental Remnants:** None severe.

**Data Controls:** Platform reporting, agency performance metrics.

**Frontend Affected:** None directly.

---

## 4. MARKETPLACE TAB GROUP

### Tab: `agencies` (FosteringAgenciesTab)

**What it does:** Full agency management table with search, pagination, bulk actions, and status management.

**Working Features:**
- Agency list renders from `agencies` table
- Search and pagination
- Bulk status updates (activate/deactivate)
- Delete action

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Missing Edit/View Action | Only Delete available. No way to view or edit agency profile. | High |
| Ofsted Rating Display | Checks `agency.ofsted_rating` which may not exist in schema. | Medium |
| Missing Agency Columns | No claim status, verification status, agency type (LA/Independent/Voluntary), phone, email. | High |
| Bulk Delete | No confirmation dialog. Immediately sets status to 'deleted'. | Medium |

**Dental Remnants:** None.

**Data Controls:** Agency CRUD (partial), status management, search.

**Frontend Affected:** Agency directory, city pages, agency profile pages.

---

### Tab: `users` (UsersManagementTab)

**What it does:** User management with role-based filtering, search, and user counts.

**Working Features:**
- User table renders from `profiles` table
- Search functionality
- Role badge display

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| **HARDCODED SERVICE ROLE JWT** | CRITICAL SECURITY VULNERABILITY. Full DB access in frontend code. | **CRITICAL** |
| Role Filter Tabs | TabsList has triggers for all roles, but only ONE TabsContent with value="all". Clicking any role tab other than "All" shows empty screen. | High |
| Missing User Actions | View-only table. No edit roles, suspend, impersonate, or view details. | High |
| Role Counts Query | 7 separate sequential count queries. Inefficient. | Medium |

**Dental Remnants:** None.

**Data Controls:** User directory, role counts.

**Frontend Affected:** None directly.

---

### Tab: `claims` (AgencyClaimsTab)

**What it does:** View-only table showing agency claim status, verification status, and featured status.

**Working Features:**
- Table renders from `agencies` table
- Basic columns display

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Missing Claim Management | Completely view-only. No approve/reject claims, verify, or feature. | High |
| Inconsistent Schema | Queries `is_claimed`, `is_verified`, `is_featured` booleans. Other tabs use `claim_status` and `verification_status` string enums. May show wrong data. | High |
| No Search or Filter | No search input, filters, or pagination. Only shows latest 100. | Medium |
| Missing Bulk Actions | No bulk-verify, bulk-claim, bulk-feature. | Medium |

**Dental Remnants:** None.

**Data Controls:** Agency claims, verification, featured status.

**Frontend Affected:** Agency profile claim badges, featured listings.

---

### Tab: `fostering-categories` (FosteringCategoriesTab)

**What it does:** Displays fostering category cards from the `seo_pages` table and allows editing meta titles/descriptions.

**Working Features:**
- Category cards render
- Edit dialog opens
- Meta title/description save works

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Category Query Filter | Queries `.ilike('slug', '%fostering%')`. If slugs don't contain "fostering", shows nothing. | High |
| Missing h1 & Intro Editing | `formData` includes `h1` and `intro_content`, but `openEdit` never populates them and `updateMutation` only saves meta fields. | Medium |
| Default Icon | Uses `Stethoscope` as fallback icon. | Low |
| Missing Create/Delete | Only edit. No add or delete category. | Medium |

**Dental Remnants:** `Stethoscope` icon.

**Data Controls:** Fostering category SEO pages, meta data.

**Frontend Affected:** `/fostering-types/[type]/` pages.

---

### Tab: `locations` (LocationsManagementTab)

**What it does:** View-only list of cities and regions/states in the UK.

**Working Features:**
- Cities list renders
- Regions list renders
- Basic info display

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| No Add/Edit Functionality | Completely view-only. No add city, edit, activate/deactivate. | High |
| Missing Agency Count | No column showing how many agencies per city. | Medium |
| No Pagination | All cities loaded at once. Performance issue at scale. | Medium |

**Dental Remnants:** None.

**Data Controls:** City/region directory, location data.

**Frontend Affected:** All location pages (`/locations/england/[city]/`).

---

### Tab: `geo-expansion` (GeoExpansionTab)

**What it does:** Automatic SEO page generation queue for states and cities with content generation, approval workflow, and settings.

**Working Features:**
- Queue display
- Settings UI
- Approval workflow UI

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Wrong Geography (US) | States "Populate all 51 US states and 1,500+ major cities". Button says "Seed All US Locations". Wrong for UK platform. | High |
| SEO Blocked Patterns | Includes `"top ... dentist"`, `"#1 dentist"`. | Medium |
| Hook Dependencies | Relies on `useGeoExpansionStats`, `useGeoExpansionQueue`, `usePublishPage`. If backend functions missing, features fail silently. | Medium |

**Dental Remnants:** `dentist` in blocked patterns.

**Data Controls:** Location SEO page generation, content queue.

**Frontend Affected:** All location pages.

---

### Tab: `ranking-rules` (RankingRulesTab)

**What it does:** Configurable ranking algorithm with base factors, score boosts, penalties, and a live preview.

**Working Features:**
- UI layout renders
- Factor toggles work
- Preview table renders

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Dental Terminology | "How quickly clinic responds to leads", "+50% score for verified clinics", "Control how clinics are ranked", etc. | Medium |
| Recalculate Ranks Button | Mutation returns 0 with comment "Just simulate for now". Shows success toast but does nothing. | High |
| Missing Fostering Factors | No Ofsted rating, placement types offered, training provision in ranking. | Medium |

**Dental Remnants:** `clinic`, `clinics`, `Clinic` table headers.

**Data Controls:** Agency ranking algorithm, search result ordering.

**Frontend Affected:** Search results, city pages, agency listings.

---

### Tab: `pages` (PagesTab)

**What it does:** Full CMS page manager showing all website pages with SEO editing, content management, and FAQ CRUD.

**Working Features:**
- Page list renders
- Edit dialog opens
- SEO editing works
- FAQ CRUD works
- Content editing works

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Edit Dialog Descriptions | "shows clinics in this city", "describes this dental service", "Teeth Whitening in Dubai Marina", "Clinic profile page". | Medium |
| Internal Type System | `PageItem.type` includes `'clinic'`. Uses `useAdminClinics` hook. | Low |
| Static Pages List | Includes `/insurance` as static page. Not relevant for UK fostering. | Low |
| Create Page Dialog Icons | Uses `Stethoscope` for "Fostering Type Page". | Low |
| Missing Page Deletion | No delete functionality. | Medium |

**Dental Remnants:** `clinic`, `dental`, `Dubai`, `Stethoscope`, `useAdminClinics`.

**Data Controls:** All CMS pages, SEO data, FAQs, static content.

**Frontend Affected:** Every page on the site.

---

## 5. DISCOVERY & SEO TAB GROUP

### Tab: `content-intelligence` (ContentIntelligenceCenterTab)

**What it does:** AI-powered content analysis, competitor research, content briefs, and optimization.

**Working Features:**
- Dashboard layout
- Stats cards
- Issue list display

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Optimize Button | `useOptimizeContent()` called inside `onClick` handler. Violates React Hooks rules. **Runtime crash** when clicked. | High |
| Run Full Audit | Fake loop using `setTimeout`. No actual audit. | Medium |
| SEO Issues Fix Buttons | No `onClick` handlers when count > 0. | Medium |

**Dental Remnants:** None severe.

**Data Controls:** Content analysis, competitor data, SEO issues.

**Frontend Affected:** Content quality across all pages.

---

### Tab: `content-studio` (ContentGenerationStudioTab)

**What it does:** AI content generation studio for creating SEO page content.

**Working Features:**
- Page type selection
- Content generation UI
- Settings panel

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Page Type Labels | Maps `clinic` → "Agency Profiles" and `dentist` → "Agency Profiles". Uses `Stethoscope` icon. | Low |
| SEO Page Slug Generation | Creates pages with legacy slugs (`england`, `london`, `short-term-fostering`) matching old routes. New `/fostering-agencies/...` pages not created. | High |

**Dental Remnants:** `clinic`, `dentist`, `Stethoscope`.

**Data Controls:** SEO page content generation, meta data.

**Frontend Affected:** All SEO content pages.

---

### Tab: `ranking-control` (RankingControlCenterTab)

**What it does:** SEO ranking control center with weak page analysis, coverage depth, and entity scoring.

**Working Features:**
- UI skeleton renders

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| **Tab Crashes on Render** | `useRankingData` returns `agencies`/`categories`, but JSX references `data.clinics` and `data.treatments`. **TypeError: Cannot read properties of undefined**. | **High** |
| Location Query Missing States | `locations` query doesn't select `states`, but `computeScores` calls `data.locations.data.states.filter()`. Secondary crash. | High |
| Dubai Focus | Hardcodes Dubai analysis (`dubaiCities`, `dubaiActive`, target 15 Dubai areas). Gauge says "Dubai area coverage depth". | High |
| Insurance Linking | Queries `clinic_insurances` table. | High |
| Terminology | "Clinics", "Clinic Entity Completeness", "Active Dentist Profiles", "Clinic-location-service linking". | Medium |

**Dental Remnants:** `clinics`, `treatments`, `Dentist`, `clinic_insurances`, `Dubai` focus.

**Data Controls:** Ranking data, coverage analysis, entity scoring.

**Frontend Affected:** Search rankings, page performance.

---

### Tab: `seo-command-center` (SeoCommandCenterTab)

**What it does:** Central SEO management hub with page explorer, location SEO, service SEO, agency profiles, blog SEO, health checks, and tasks.

**Working Features:**
- Overview stats render
- Page list renders
- Filter UI works

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Run Audit / AI Fix Buttons | Fake `setTimeout` wrappers. No backend call. | Medium |
| Thin Content Filter | Checks `p.is_indexed === false` (noindex pages) instead of thin content. | Medium |
| Page Table Action Buttons | Edit and Sparkles buttons have no `onClick`. | Medium |
| Location/Service/Agency/Blog Tabs | Empty placeholder cards. Only icon and count. | Low |
| AI Assistant Ask Button | No `onClick` handler. | Low |

**Dental Remnants:** None severe.

**Data Controls:** All SEO pages, indexing status, page health.

**Frontend Affected:** All pages' SEO performance.

---

### Tab: `seo-operations` (SeoOperationsCenterTab)

**What it does:** SEO operations center for bulk actions, page inspection, external linking, and diagnostics.

**Working Features:**
- Page picker renders
- Operations panel UI
- Bulk action forms

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Inspect Page / External Links | `handleInspectPage` concatenates `https://www.foster-care.co.uk${page.slug}` without leading slash. Results in `...co.ukagency/my-agency` (404). Same bug in `SeoPagePicker.tsx`. | High |
| Indexing Diagnostics Tab | Empty placeholder. | Medium |
| Custom Prompt Placeholder | "Focus on emergency dental services". | Low |
| Page Type Filter | Includes `clinic: 'Clinic Profiles'` and `dentist: 'Dentist Profiles'`. | Low |

**Dental Remnants:** `clinic`, `dentist`, `emergency dental services`.

**Data Controls:** SEO operations, bulk edits, page inspection.

**Frontend Affected:** Page URLs, external links.

---

### Tab: `seo-health` (SeoHealthCheckTab)

**What it does:** SEO health checker with quick test links, URL input, and page registry validation.

**Working Features:**
- URL input
- Basic health check UI

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Quick Test Links | Hardcoded `/california`, `/california/los-angeles`, `/clinic/smile-dental`. US and dental examples. | High |
| URL Placeholder | Says `/dubai/jumeirah or https://www.foster-care.co.uk/blog`. Dubai is wrong market. | High |
| Page Registry | Registry contains `/clinic/:clinicSlug`, `/contact/:contactSlug`, US examples, `addressCountry: "US"`, `medical-review-policy`, `find-agency` described as "Find dentist search", `form/:submissionId` as "Patient intake form", 51 US states, 6600 clinics. | High |

**Dental Remnants:** `clinic`, `dentist`, `patient`, `medical-review-policy`, US-centric data.

**Data Controls:** SEO health validation, page registry.

**Frontend Affected:** All pages' technical SEO.

---

### Tab: `meta-optimizer` (MetaOptimizerTab)

**What it does:** Bulk meta title/description optimizer for SEO pages.

**Working Features:**
- Page list renders
- Meta editing works
- Bulk operations UI

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Page Type Filter | Includes `clinic: 'Clinic Profiles'` and `dentist: 'Dentist Profiles'`. | Low |
| Non-Location Prefix Filter | Whitelists `clinic`, `dentist`, `insurance` prefixes. | Low |

**Dental Remnants:** `clinic`, `dentist`, `insurance`.

**Data Controls:** Meta titles, meta descriptions across all pages.

**Frontend Affected:** All pages' meta tags.

---

### Tab: `structured-data` (StructuredDataTab)

**What it does:** Schema markup manager with validation, templates, and page-type detection.

**Working Features:**
- Settings UI
- Validation display
- Template viewer

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Schema Type Mapping | Uses `Dentist`, `MedicalBusiness`, `MedicalProcedure`, `GeoCoordinates`. `clinic` labeled "Clinics". | High |
| URL Route Detection | Returns `clinic` for `/clinic/` and `dentist` for `/contact/`. Live site uses `/agency/`. | High |
| Sample Page Links | `samples.clinic` builds `/clinic/${c.slug}`. `samples.dentist` builds `/dentist/${d.slug}`. | High |
| Schema Country | Hardcoded `addressCountry: "US"`. | High |

**Dental Remnants:** `Dentist`, `MedicalBusiness`, `MedicalProcedure`, `clinic`, `dentist`, `US`.

**Data Controls:** Schema markup across all pages.

**Frontend Affected:** All pages' structured data / rich snippets.

---

### Tab: `internal-linking` (InternalLinkingHubTab)

**What it does:** Internal linking optimizer with AI suggestions, orphan page detection, link rules, and anchor text management.

**Working Features:**
- Overview stats render
- Link rules UI

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| AI Link Suggestions | `suggestions` query hardcodes empty array `[]`. `runAISuggestions` is fake `setTimeout`. Table permanently empty. | Medium |
| Page Stats Filter | Counts `.filter('slug', 'like', '%fostering%')`, excluding pages like `foster-care-london`. | Low |
| Orphan Pages / Anchor Text Tabs | Empty placeholders. | Low |

**Dental Remnants:** None severe.

**Data Controls:** Internal links, anchor text, orphan pages.

**Frontend Affected:** Page interconnectivity, SEO authority flow.

---

## 6. CONTENT MANAGEMENT TAB GROUP

### Tab: `content-audit` (ContentAuditBotTab)

**What it does:** Automated content audit bot for checking SEO page quality.

**Working Features:**
- Page type filter UI
- Audit configuration

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Page Type Filter | Includes `clinic` and `dentist` in `PAGE_TYPES`. | Low |
| Edge Function Dependency | Relies on `content-audit-bot` edge function. Cannot verify existence. | Medium |

**Dental Remnants:** `clinic`, `dentist`.

**Data Controls:** Content quality audits.

**Frontend Affected:** Content quality across pages.

---

### Tab: `faq-studio` (FAQGenerationStudioTab)

**What it does:** FAQ generation studio for creating and managing page-specific FAQs.

**Working Features:**
- Page list renders
- FAQ editing UI
- Selection interface

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Service Filter | `filteredPages` references **undefined variable `treatments`** (line 369). Should reference `categories`. **ReferenceError** when filter used. | High |
| Page Type Labels | Includes `clinic`, `dentist`, `Stethoscope` icon. | Low |

**Dental Remnants:** `clinic`, `dentist`, `Stethoscope`.

**Data Controls:** FAQ content for all pages.

**Frontend Affected:** FAQ sections on all pages.

---

### Tab: `blog` (BlogManagementTab)

**What it does:** Blog post management engine.

**Working Features:**
- Blog post list renders
- Status badges

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Missing CRUD | Read-only table. No Create, Edit, or Delete buttons. | Low |

**Dental Remnants:** None.

**Data Controls:** Blog posts, publishing status.

**Frontend Affected:** `/blog` and `/blog/[slug]` pages.

---

### Tab: `static-pages` (StaticPagesTab)

**What it does:** Static page content manager for non-dynamic pages.

**Working Features:**
- Page list renders
- Content editing works
- Preview works

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Test Bot View Placeholder | `/ca/los-angeles/` (US location). | Medium |
| Page Type Label | `clinic` type labeled "Clinics" in progress card. | Low |

**Dental Remnants:** `clinic`, US location examples.

**Data Controls:** Static page content.

**Frontend Affected:** Static pages (About, Contact, etc.).

---

### Tab: `clinic-enrichment` (ClinicEnrichmentTab / Agency Enrichment)

**What it does:** Agency data enrichment with quick actions, agency editing, location management, services, and image management.

**Working Features:**
- Agency list renders from `agencies` table
- Edit dialog works
- Quick actions work
- Stats cards render

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Component Naming | File `ClinicEnrichmentTab.tsx`, export `ClinicEnrichmentTab`, variables `clinicStats`, `selectedClinic`. | Low |
| Edit Dialog Placeholder | "Enter clinic description...". | Low |

**Dental Remnants:** `clinic` everywhere in naming.

**Data Controls:** Agency data enrichment, descriptions, services, images.

**Frontend Affected:** Agency profile pages.

---

### Tab: `content-strategy` (ContentStrategyTab)

**What it does:** Editorial calendar, topic clusters, and content templates for strategic content planning.

**Working Features:**
- All forms work
- All mutations work
- Tables render correctly
- Editorial calendar
- Topic clusters
- Content templates

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| (None found) | All functionality works correctly. | - |

**Dental Remnants:** None.

**Data Controls:** Editorial calendar, topic clusters, content templates.

**Frontend Affected:** Blog content, SEO pages.

**Status:** ✅ **CLEAN — This tab is fully functional and properly branded.**

---

## 7. REPUTATION TAB GROUP

### Tab: `reputation-hub` (AdminReputationHub)

**What it does:** Platform-wide reputation management with reviews, replies, profiles, and analytics.

**Working Features:**
- Shell component renders
- Sub-tab navigation

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Data Sources | Sub-tabs query `clinics` table instead of `agencies`. | High |
| Terminology | "clinic", "clinics", "dentist view", "dentistLogs", "patient_name" throughout sub-tabs. | Medium |
| Comments | File comments say "Shows platform-wide reputation data across all clinics." | Low |

**Dental Remnants:** `clinic`, `clinics`, `dentist`, `patient_name`.

**Data Controls:** Reviews, replies, reputation profiles.

**Frontend Affected:** Review display on agency profiles, reputation widgets.

---

### Tab: `review-insights` (ReviewInsightsTab)

**What it does:** Review analytics with negative feedback tracking, internal reviews, top performers, and problem identification.

**Working Features:**
- Table renders (partially)
- Sub-tab navigation

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Data Joins | Lines 72, 89, 105 join `clinic:clinics(id, name, slug)` instead of `agencies`. | High |
| Mixed Data Sources | "Top Performers" query correctly uses `agencies`, but every other query uses `clinics` or `review_funnel_events` joined to `clinics`. | High |
| Clinic Filter | `selectedClinic` declared but never passed to queries. Filter does nothing. | Medium |
| Terminology | "Problem Clinics", "Top Performing Clinics", "% of patients redirected", "patients who chose thumbs down". | Medium |

**Dental Remnants:** `clinic`, `clinics`, `patients`.

**Data Controls:** Review analytics, feedback tracking.

**Frontend Affected:** Review funnel, reputation pages.

---

### Tab: `gmb-connections` (GMBConnectionsTab)

**What it does:** Google My Business connection manager for syncing agency profiles with GMB.

**Working Features:**
- Table renders
- Connection status display
- Search works

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| OAuth Tokens Table | Joins `oauth_tokens:clinic_oauth_tokens(...)`. | High |
| Terminology | Header says "across all clinics", search says "Search clinics...", stats say "Total Clinics", table header says "Clinic". | Medium |
| Sync Button | No `onClick` handler. Dead button. | High |
| Sync Settings Button | No `onClick` handler. | Medium |

**Dental Remnants:** `clinic`, `clinics`, `clinic_oauth_tokens`.

**Data Controls:** GMB OAuth tokens, sync status.

**Frontend Affected:** GMB sync, agency profile data.

---

## 8. ENQUIRIES & BOOKINGS TAB GROUP

### Tab: `booking-system` (BookingSystemTab)

**What it does:** Platform-wide booking/enquiry system management with settings, analytics, and recent bookings.

**Working Features:**
- Table renders
- Settings dialog opens
- Stats cards render

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Settings Storage | Joins `dentist_settings` table. Update mutation upserts `dentist_settings`. | High |
| Recent Bookings Join | Joins `clinic:clinics(name)` instead of `agencies`. | High |
| Feature Descriptions | "Inline calendar booking on clinic & dentist profiles", "GMB-synced clinic hours", "Returning patient detection", "Real-time slot locking". | Medium |
| Bulk Enable | Upserts `dentist_settings` with dental options (`allow_same_day_booking`, `min_advance_booking_hours`). | High |
| Settings Dialog | Shows "Allow Same-Day Booking", "Minimum Advance Hours", "Maximum Advance Days", "SMS Reminders" — all appointment concepts. | Medium |
| Stats Semantics | Queries `fostering_enquiries` but applies dental appointment statuses (`confirmed`, `no_show`, `cancelled`) labeled as "Bookings". | Medium |

**Dental Remnants:** `dentist_settings`, `clinic`, `clinics`, `patient`, `booking`, `appointments`.

**Data Controls:** Enquiry settings, booking configuration, recent enquiries.

**Frontend Affected:** Enquiry forms, agency profiles.

---

### Tab: `appointments` (AppointmentsTab)

**What it does:** Appointment/enquiry management table with filters and status workflow.

**Working Features:**
- UI renders
- Filter dropdowns populate

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| **Wrong Data Source** | Uses `useAdminAppointments` hook which queries `appointments` table and joins `clinics`, `dentists`, `treatments`. | **High** |
| Breakdown | Calls `useDentistBookingCounts` grouping by `dentist_id`. | High |
| Filter Consistency | Filters populate from `agencies`, `foster_carers`, `fostering_categories` but are applied to `appointments.clinic_id`, `appointments.dentist_id`, `appointments.treatment_id`. | High |
| Terminology | Hook names `useAdminAppointments`, `useDentistBookingCounts`, tables `appointments`, `dentists`, `treatments`, fields `patient_name`, `patient_phone`. | Medium |
| Self-Service Links | Generates `/appointment/{token}` links for dental appointment management. | Medium |

**Dental Remnants:** `appointments`, `clinics`, `dentists`, `treatments`, `patients`, `dentist`.

**Data Controls:** Appointment/enquiry data (but from wrong tables).

**Frontend Affected:** Enquiry management, agency enquiry lists.

---

### Tab: `leads` (EnquiriesTab)

**What it does:** Lead CRM for managing fostering enquiries.

**Working Features:**
- Table renders
- Status badges display

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| **Wrong Data Source** | Queries `agencies` table instead of `fostering_enquiries` or `leads`. Shows agency directory, not lead pipeline. | **High** |
| Missing CRM Features | No enquiry pipeline, carer contact details, status tracking, notes, or assignment. | High |
| View Button | No `onClick` handler. | Medium |

**Dental Remnants:** None.

**Data Controls:** Should control lead/enquiry data but shows agencies instead.

**Frontend Affected:** Lead management, enquiry pipeline.

---

## 9. GROWTH & MARKETING TAB GROUP

### Tab: `gmb-import` (GooglePlacesImportTab)

**What it does:** Google Places search and auto-import for discovering fostering agencies.

**Working Features:**
- Search UI
- Category list (correctly fostering-focused)
- Duplicate detection (from `agencies` table)
- Manual import

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| City Assignment Map | `Object.fromEntries(cityAssignments)` reads stale React state. Auto-import sends outdated city mapping. | High |
| Progress Counter | `processedCities.length + 1` relies on async state, inaccurate. | Low |

**Dental Remnants:** None — this tab is correctly configured for fostering.

**Data Controls:** Google Places import, agency discovery.

**Frontend Affected:** Agency directory, city pages.

---

### Tab: `email-enrichment` (EmailEnrichmentBotTab)

**What it does:** Email enrichment bot for finding contact emails for unclaimed agencies.

**Working Features:**
- Session management
- Results display
- Review queue

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Results Data Fetch | Joins `clinic:clinics(id, name, ...)` in `email_enrichment_results`. If `clinics` table missing, shows "Unknown" for every agency. | High |
| Stats Labels | "Total Clinics", "Have Email", "Missing Email". Underlying query hits `agencies`, but UI says "Clinics". | Medium |
| Session Log | "Processing X clinics...". | Low |
| Table Headers | "Clinic" column in results and review queue. | Medium |

**Dental Remnants:** `clinic`, `clinics`.

**Data Controls:** Email enrichment results, agency contact data.

**Frontend Affected:** Outreach, agency contact info.

---

### Tab: `outreach` (OutreachTab)

**What it does:** Outreach center for email campaigns, templates, and message logging.

**Working Features:**
- Campaign creation UI
- Template list
- Bulk send UI

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Welcome Email Template | "Your dental practice is now visible to thousands of patients searching for quality fostering care in your area." Mixed terminology. | High |
| All Templates | Use `{{clinic_name}}`, `{{patient_name}}`, `{{claim_link}}`, `{{review_link}}`, `{{booking_link}}`. Subjects: "New Patient Inquiry", "How Was Your Visit?", "Complete Your Profile to Attract More Patients". | High |
| Sample Preview | `clinic_name: 'Bright Futures Fostering'` — inconsistent variable naming. | Medium |
| Campaign Target Filter | UI says "Target Clinics", "Send to X Clinics", "clinic outreach". | Medium |
| Message Log Tab | "Coming Soon" placeholder. Zero functionality. | Medium |

**Dental Remnants:** `clinic`, `clinic_name`, `patient`, `patients`, `booking_link`, `review_link`, `dental practice`, `visit`.

**Data Controls:** Email templates, campaigns, outreach history.

**Frontend Affected:** Agency outreach, email communications.

---

## 10. MONETIZATION TAB GROUP

### Tab: `promotions` (PromotionsTab)

**What it does:** Promotional subscription management for featured agency listings.

**Working Features:**
- Promotions list renders
- Create promotion dialog

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Data Fetch | Joins `clinic:clinics(id, name, slug)` in `clinic_subscriptions`. Shows "Unknown" if no `clinics` table. | High |
| Clinic Selection Dialog | Says "Select Clinic", "Search by clinic name...", "Selected Clinic", "Partner clinic". | Medium |

**Dental Remnants:** `clinic`, `clinics`, `clinic_subscriptions`.

**Data Controls:** Promotional subscriptions, featured listings.

**Frontend Affected:** Featured agency badges, promotions.

---

### Tab: `plans` (PlansTab)

**What it does:** Subscription plan management with plan features, pricing, and agency assignments.

**Working Features:**
- Plan cards render
- Feature toggles work
- Assignment dialog opens

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Clinic Subscriptions Query | Joins `clinic:clinics(...)` in `clinic_subscriptions`. | High |
| Default Plan Features | Includes `appointment_booking`, `booking_url`, `sms_reminders`, `expected_patients: 2/6/11`. Dental features. | High |
| Custom Plan Request | Submits to `fostering_enquiries` using `patient_name`, `patient_email`, `patient_phone`. Form asks for "Practice/Clinic Name" with placeholder "e.g., Smile Dental Center". | High |
| Value Proposition | "~$99/booking" and "Expected Patient Numbers Disclaimer". | Medium |
| Clinic Assignments Tab | Tab label, headers, empty state all say "Clinic". | Medium |
| Assign Plan Dialog | "Assign Plan to Clinic", "X clinics", "Selected Clinic". | Medium |

**Dental Remnants:** `clinic`, `clinics`, `appointment_booking`, `patients`, `patient_name`, `booking`, `Smile Dental Center`.

**Data Controls:** Subscription plans, plan features, agency assignments.

**Frontend Affected:** Plan display, agency subscription management.

---

### Tab: `subscriptions` (SubscriptionsTab)

**What it does:** Revenue and subscription analytics with overview and detailed analytics.

**Working Features:**
- Stats cards render
- Subscription list renders
- Add subscription dialog

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Subscriptions Data Fetch | Joins `clinic:clinics(id, name, slug, verification_status)`. | High |
| Add Subscription Dialog | Underlying `clinicsData` variable and `useAdminClinics` hook. | Medium |
| Export Button | No `onClick` handler. Dead button. | Medium |

**Dental Remnants:** `clinic`, `clinics`, `clinic_subscriptions`, `useAdminClinics`.

**Data Controls:** Subscription revenue, analytics.

**Frontend Affected:** Revenue reporting.

---

### Tab: `marketplace-control` (MarketplaceControlTab)

**What it does:** Marketplace control with ranking overrides, booking control, and manual overrides.

**Working Features:**
- Ranking controls render
- Agency list renders

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Booking Control Query | Queries `dentist_settings (booking_enabled)` from `agencies` table. References `dentist_settings` table. | High |
| Force Booking Mutation | Inserts/updates `dentist_settings` table. | High |
| Audit Log | Logs `admin_force_booking_on` / `admin_force_booking_off`. | Medium |
| Tab Labels | "Booking Enabled", "Verified Clinics", "Total Clinics", "Booking Control", "Manual Overrides". | Medium |

**Dental Remnants:** `dentist_settings`, `clinic`, `clinics`, `booking`.

**Data Controls:** Ranking overrides, booking settings.

**Frontend Affected:** Search results, agency profiles.

---

## 11. INTEGRATIONS TAB GROUP

### Tab: `api-control` (ApiControlTab)

**What it does:** API control center for managing third-party integrations (AIMLAPI, WhatsApp, Stripe, Google OAuth).

**Working Features:**
- Settings form renders
- Toggle switches work
- API key inputs

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| AIMLAPI Save Button | Calls `refetchSettings()` which is **never defined or imported**. **Runtime ReferenceError**. | High |
| WhatsApp Verify Token | Default token is `'DUBAI_DENTAL_WHATSAPP_VERIFY'`. | Low |
| Google OAuth Description | Mentions GMB sync (acceptable). | Low |
| API Status Dashboard | AIMLAPI defaults to `'connected'` regardless of real status. Stripe defaults to `'connected'` if `uses_secrets` flag set. False positives. | Medium |

**Dental Remnants:** `DUBAI_DENTAL_WHATSAPP_VERIFY`.

**Data Controls:** API integrations, third-party connections.

**Frontend Affected:** AI features, messaging, payments.

---

### Tab: `crm-numbers` (CrmNumbersTab)

**What it does:** CRM phone number management for agency SMS/WhatsApp communication.

**Working Features:**
- Number list renders
- Assignment dialog

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| CRM Data Fetch | Joins `clinic:clinics(id, name)` in `crm_numbers`. | High |
| Assignment Query | Query key is `'clinics-for-assignment'`, interface is `Clinic`. | Medium |
| Table Headers | "Clinic" column. | Medium |

**Dental Remnants:** `clinic`, `clinics`.

**Data Controls:** CRM numbers, agency messaging.

**Frontend Affected:** SMS/WhatsApp communication.

---

### Tab: `messaging-control` (MessagingControlTab)

**What it does:** Messaging control center for SMS/WhatsApp templates, automation, and message logs.

**Working Features:**
- Template list renders
- Automation settings UI
- Message log table

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Message Log Fetch | Joins `clinic:clinics(id, name)` in `clinic_messages`. | High |
| Automation Settings Fetch | Joins `clinic:clinics(id, name)` in `clinic_automation_settings`. | High |
| Message Templates | `appointment_reminder`: "appointment at {{clinic_name}} on {{date}} at {{time}}". `booking_confirmation`: "Your appointment is confirmed! ... {{treatment}}". `welcome_message`: "Thank you for choosing us for your fostering care. We're here to help you maintain a healthy smile." (mixed). `followup`: "Post-Treatment Follow-up". | High |
| Sample Preview | `treatment: 'Fostering Enquiry'`. Variable still named `treatment`. | Medium |
| Clinic Controls Tab | Tab says "Clinic Controls". Headers say "Clinic". Rows reference `setting.clinic?.name`. | Medium |

**Dental Remnants:** `clinic`, `clinics`, `appointment`, `treatment`, `patient`, `booking`, `clinic_messages`, `clinic_automation_settings`.

**Data Controls:** Messaging templates, automation rules, message logs.

**Frontend Affected:** SMS/WhatsApp communications.

---

### Tab: `platform-services` (PlatformServicesTab)

**What it does:** Platform service registry for enabling/disabling core features.

**Working Features:**
- Service toggles work
- Settings persist to `global_settings`

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Service Names | `clinic_profiles` → "Clinic Profiles", `dentist_profiles` → "Dentist Profiles", `appointment_booking` → "Appointment Booking", `clinic_claiming` → "Clinic Claiming", `sms_notifications` → "Send SMS to patients", `appointment_reminders` → "Automated reminders before appointments". | High |

**Dental Remnants:** `clinic_profiles`, `dentist_profiles`, `appointment_booking`, `clinic_claiming`, `patients`, `appointment_reminders`.

**Data Controls:** Feature flags, platform services.

**Frontend Affected:** All platform features.

---

## 12. AI & AUTOMATION TAB GROUP

### Tab: `ai-controls` (AIControlsTab)

**What it does:** AI module configuration, safety controls, decision logs, and emergency stop.

**Working Features:**
- Module list renders
- Toggle UI
- Logs table renders

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Module Configuration | `moduleStates` hardcoded from local array, never synced with `aiSettings`. Always resets to defaults. | High |
| Emergency Stop Button | No `onClick` handler. Does nothing. | High |
| Safety Controls | `defaultChecked` with no state binding. Decorative only. | Medium |
| Refresh Button | No `onClick` handler. | Low |
| Decisions Today Stat | Displays `aiLogs.length` (last 100 logs) instead of today's count. | Low |

**Dental Remnants:** "Clinics with reputation score below X% will be flagged."

**Data Controls:** AI module settings, decision logs.

**Frontend Affected:** AI-powered features.

---

### Tab: `ai-search-control` (AISearchControlTab)

**What it does:** AI search control with ranking weights, paid priority, and search intent analysis.

**Working Features:**
- Ranking weights UI
- Search intent display

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Paid Priority Label | "Paid Dentist Priority" instead of "Paid Agency Priority". | High |
| Search Intent | Renders `extracted_intent?.treatments` (dental terminology). | Medium |
| Ranking Weights | Generic marketplace values. No fostering context (`ofsted_rating`, `carer_experience`, `placement_type`). | Medium |

**Dental Remnants:** `Dentist`, `treatments`.

**Data Controls:** AI search ranking, intent extraction.

**Frontend Affected:** AI search page, search results.

---

### Tab: `automation` (AutomationTab)

**What it does:** Automation rules engine with job presets, rule creation, and execution monitoring.

**Working Features:**
- Rule list renders
- Rule creation form
- Execution log

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Job Presets | All presets are dental: "GMB Import Job" (clinics), "Unclaimed Outreach" (GMB listings), "Duplicate Detection" (clinic listings), "SEO Audit Job" (service pages), "Verification Expiry Reminder" (clinics). GMB preset hardcodes US cities (`los-angeles`, `san-francisco`, `boston`). | High |
| Rule Type Options | Includes `gmb_import`, `unclaimed_outreach`, `seo_audit`, `verification_reminder`, `appointment_reminder`. | High |
| Automation Icons | Maps `gmb_import`, `seo_audit`, etc. with dental labels. | Medium |

**Dental Remnants:** `gmb_import`, `clinics`, `appointment_reminder`, `seo_audit`, US cities.

**Data Controls:** Automation rules, job scheduling.

**Frontend Affected:** Automated workflows, background jobs.

---

## 13. PLATFORM SETTINGS TAB GROUP

### Tab: `site-config` (SiteConfigTab)

**What it does:** Header and footer configuration with link management, logo, and legal text.

**Working Features:**
- Header config form
- Footer config form
- Link builder UI

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Footer Default Links | Contains "Teeth Whitening", "Dental Implants", "Invisalign". | High |
| Footer Legal Text | "Licensed Dental Professionals Only." | High |
| Linkable Pages Dropdown | References undefined variable `treatments` (line 358). Component fetches `categories` but iterates over `treatments`. **Runtime ReferenceError** when dropdown opens. | High |

**Dental Remnants:** `Teeth Whitening`, `Dental Implants`, `Invisalign`, `Licensed Dental Professionals Only`, `treatments`.

**Data Controls:** Header, footer, navigation links, legal text.

**Frontend Affected:** Every page's header and footer.

---

### Tab: `contact-details` (ContactDetailsTab)

**What it does:** Platform contact information management with phone, email, address, and department contacts.

**Working Features:**
- Contact form renders
- Save works

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Phone Placeholders | UAE format: "+971 4 123 4567", "+971 50 123 4567". | Medium |
| Address Placeholders | US: "Los Angeles", "CA", "90001". | Medium |
| Booking/Sales Terminology | "Booking Inquiries Email", "Booking Line", "Sales Line". | Low |

**Dental Remnants:** None severe.

**Data Controls:** Contact details, department info.

**Frontend Affected:** Contact page, footer contact info.

---

### Tab: `tab-visibility` (TabVisibilityTab)

**What it does:** Control which tabs are visible to admin and agency users.

**Working Features:**
- Admin tab toggles work
- Agency tab toggles work

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Dentist Dashboard Section | Entire second section labeled "Dentist Dashboard Tabs" with dental tabs: "My Practice", "Appointments", "Availability", "Appointment Types", "Patients", "Intake Forms", "Services", "Insurance", "Reputation Suite". | High |
| Admin Tab Labels | Contains "Treatments" (should be Services/Fostering Types), "Scraper Bot". | Medium |

**Dental Remnants:** `Dentist`, `My Practice`, `Appointments`, `Availability`, `Appointment Types`, `Patients`, `Intake Forms`, `Services`, `Insurance`, `Reputation Suite`, `Treatments`, `Scraper Bot`.

**Data Controls:** Tab visibility, access control.

**Frontend Affected:** Admin and agency dashboards.

---

### Tab: `tools-management` (ToolsManagementTab)

**What it does:** Tools management for cost calculator, insurance checker, and emergency foster care finder.

**Working Features:**
- Tool toggles work
- Settings forms render

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Cost Calculator | Queries `clinic_treatments` table. Displays prices in AED (UAE Dirham). Stats: "Clinics with Prices", "Treatments with Pricing". | High |
| Pricing Table | References undefined variable `treatments` (line 253). Component fetches `categories` but renders `treatments?.filter(...)`. **Runtime ReferenceError**. | High |
| Insurance Manager | Queries `insurances` and `clinic_insurances` tables. "Clinics Accepting" count. | Medium |
| Emergency Foster Care | Queries `clinic_hours` table. Stats: "Clinics with Phone", "Clinics with Hours Set", "Extended Hours (8PM+)". | Medium |

**Dental Remnants:** `clinic_treatments`, `clinic_insurances`, `clinic_hours`, `AED`, `Clinics`, `Treatments`.

**Data Controls:** Tool settings, pricing data, insurance data.

**Frontend Affected:** Calculator, insurance checker, emergency finder pages.

---

### Tab: `settings` (SettingsTab)

**What it does:** Platform settings with general config, integrations, verifications, email/SMTP, Google APIs, and payments.

**Working Features:**
- All settings forms render
- Save works
- Google OAuth callback correct

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Verification Fee | Defaults to 49 USD. Should be GBP for UK. | Medium |
| Legal Placeholder | "Licensed Dental Professionals Only." | High |

**Dental Remnants:** `Licensed Dental Professionals Only`, `USD`.

**Data Controls:** Platform configuration, integrations, payments.

**Frontend Affected:** All pages (verification, payments, integrations).

---

## 14. SYSTEM DIAGNOSTICS TAB GROUP

### Tab: `system-audit` (SystemAuditTab)

**What it does:** System-wide audit showing database stats, module list, user roles, booking behavior, and schema summary.

**Working Features:**
- UI layout renders

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| **Stats Query** | `fosterCarersCount`, `enquiriesCount`, `regionsCount`, `categoriesCount` are **undefined**. `fostering_enquiries` queried twice. `cities` queried twice. Returns `stats.clinics` (undefined). **Runtime crash** (`toLocaleString` on undefined). | **High** |
| Existing Modules | Contains "Dentist Profiles" module (`dentists` table). Duplicate React `key="agencies"`. Includes "Treatments & Services" (`treatments`, `clinic_treatments`), "Insurance" (`clinic_insurances`), "Google Business Profile" (clinic OAuth), "Messaging System" (`clinic_messages`). References `hipaa_audit_log` (US healthcare law, not UK GDPR). | High |
| User Roles | Lists `dentist` ("Claimed clinic owners") and `patient` ("Implicit role"). No fostering roles. | High |
| Booking Behaviour | "Dentist availability rules", "Real-time slot selection", "Appointment types with duration". | Medium |
| Database Schema | Lists `clinics`, `patients`, `treatments`, `clinic_hours`, `clinic_insurances`. Proposes `dentist_settings` and `slot_locks`. | High |
| Integration Status | "Clinic import/scraper", "Booking link sync", "GMB sync and login". | Low |
| Risk Checklist | "Add dentist_settings table", "Booking default ON enforcement", "slot-based booking". | Medium |

**Dental Remnants:** `clinics`, `patients`, `treatments`, `clinic_hours`, `clinic_insurances`, `dentists`, `dentist_settings`, `slot_locks`, `hipaa`, `Dentist`, `Patient`.

**Data Controls:** System health, schema validation, module inventory.

**Frontend Affected:** None directly.

---

### Tab: `feature-flags` (FeatureFlagsTab)

**What it does:** Feature flag management for enabling/disabling platform features.

**Working Features:**
- Flag toggles work
- Descriptions render

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Flag Definitions | `booking_engine_enabled` and `booking_default_on` describe slot-based booking for "clinics". `gbp_appointment_sync_enabled` references Google Business Profiles for clinics. `insurance_filter_enabled` may be irrelevant. Missing `ofsted_sync`, `placement_tracking`. | Medium |
| Flag Descriptions | "New clinics have booking enabled by default", "Sync 'Book Online' button to Google Business Profiles". | Medium |

**Dental Remnants:** `clinics`, `booking`, `Google Business Profiles`, `Book Online`.

**Data Controls:** Feature flags, platform capabilities.

**Frontend Affected:** All feature-gated functionality.

---

### Tab: `roles` (RolesTab)

**What it does:** Access control with role presets, permission matrix, user overrides, admin users, and district assignments.

**Working Features:**
- Permission matrix renders
- Role list renders

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Available Roles | Offers `dentist`, `patient`, `seo_team`, `content_team`, `marketing_team`, `support_team`, `district_manager`. No fostering roles (`agency_admin`, `foster_carer`, `applicant`, `trainer`, `social_worker`). | High |
| Default Permissions | Reference `clinics.view`, `clinics.edit`, `clinics.verify`, `appointments.view`. | High |
| Permission Matrix UI | Columns: Admin, Dist Mgr, **Dentist**, SEO, Content, Marketing, Support, **Patient**. | High |
| Admin User Role Assignment | Dropdown offers Super Admin, District Manager, **Dentist**, **Patient**. | High |
| Add Permission Override | "Save Override" button has no `onClick`. Does nothing. | High |
| District Assignment Placeholders | "e.g., Los Angeles", "e.g., California". | Low |

**Dental Remnants:** `Dentist`, `Patient`, `clinics`, `appointments`, `Los Angeles`, `California`.

**Data Controls:** Role definitions, permissions, access control.

**Frontend Affected:** All user access, tab visibility.

---

### Tab: `audit` (AuditLogsTab)

**What it does:** Audit log viewer with search, filters, and date range.

**Working Features:**
- Log table renders
- Search works
- Action filter works
- Entity filter works
- Role filter works
- Date range works

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| (None found) | Clean UI with no dental terminology. All filters function correctly. | - |

**Dental Remnants:** None.

**Data Controls:** Audit logs, action history.

**Frontend Affected:** None directly.

**Status:** ✅ **CLEAN — This tab is fully functional and properly branded.**

---

### Tab: `migration-control` (MigrationControlTab)

**What it does:** Database migration control with table auditing, migration execution, and schema fix generation.

**Working Features:**
- Migration engine works
- Table auditing works
- Schema script generation works
- Log display works

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Migration Table List | Includes `clinics`, `patients`, `treatments`, `clinic_hours`. If these don't exist, logs errors. | Medium |

**Dental Remnants:** `clinics`, `patients`, `treatments`, `clinic_hours`.

**Data Controls:** Database migrations, schema fixes.

**Frontend Affected:** None directly.

---

### Tab: `data-recovery` (DataRecoveryTab)

**What it does:** Data recovery from backups or external APIs.

**Working Features:**
- UI layout renders

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Recovery Scope | "Recover deleted clinics, reviews, and hours from Google Places API". Built around clinic recovery. | High |
| DB Status Cards | Shows "Clinics", "Hours", "Reviews", "Agencies". Agencies card uses **tooth emoji (🦷)**. | High |
| Recovery Engine | Invokes `recover-clinics` edge function using Google Places API. Completely irrelevant for foster care. | High |

**Dental Remnants:** `clinics`, `hours`, `reviews`, `Google Places API`, `recover-clinics`, `🦷`.

**Data Controls:** Data recovery, backup restoration.

**Frontend Affected:** None directly.

---

### Tab: `admin-revert` (AdminRevertTab)

**What it does:** Revert admin actions like deletions.

**Working Features:**
- Revert list renders
- Filter works

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Revertable Entity Types | `canRevert()` only permits `clinic` and `dentist`. All other deletions show "N/A". | High |
| Revert Logic | Reverting clinic triggers `recover-clinics` from Google Places API. Reverting dentist shows manual re-creation message. | High |
| Confirmation Dialog | "This will call Google Places API for each clinic". | Medium |

**Dental Remnants:** `clinic`, `dentist`, `recover-clinics`, `Google Places API`.

**Data Controls:** Action reversion, deletion recovery.

**Frontend Affected:** None directly.

---

### Tab: `support-admin` (SupportTicketsAdminTab)

**What it does:** Support ticket management for admin users.

**Working Features:**
- Ticket list renders
- Sub-tab navigation
- Reply form renders

**Broken / Non-Working:**
| Feature | Issue | Priority |
|---------|-------|----------|
| Page Subtitle | "Manage dentist support requests". | High |
| Ticket Data Connection | Joins `clinics(id, name)`. Table header says "Clinic". | High |
| Reply Schema Mismatch | `TicketReply` interface defines `message` and `is_internal`. `addReply` mutation inserts `content` and `is_admin_reply`. UI may render undefined. | High |
| Internal Note Checkbox | `isInternal` state set by checkbox but **never passed to mutation**. Hardcodes `is_admin_reply: true`. Checkbox non-functional. | Medium |
| Reply Display Text | "Internal note (not visible to dentist)". | Medium |

**Dental Remnants:** `dentist`, `clinic`, `clinics`.

**Data Controls:** Support tickets, replies, internal notes.

**Frontend Affected:** Support system.

---

## 15. ORPHAN TABS

### Tab: `gmb-bridge` (GmbBridgeTab)

**Status:** ✅ **CLEAN**
- Correctly configured for fostering
- Categories: "fostering agency", "foster care agency", etc.
- Imports into `agencies` table

### Tab: `gmb-scraper` (GmbScraperBotTab)

**Status:** ✅ **CLEAN**
- Uses fostering categories
- Fetches from `states` and `cities` tables
- Imports to `agencies`
- No dental terminology

### Tab: `pinned-profiles` (PinnedProfilesTab)

**Issues:**
- Interface `PinnedClinic`, state `pinnedClinics`, function `fetchAllPinnableClinics`
- UI says "Pinned Clinics", "Available Clinics", "Search clinics..."
- Functionally queries `agencies` table correctly
- Priority: Medium

### Tab: `seo` (SeoTab)

**Issues:**
- Schema list includes "Person (Dentist)" and "MedicalDisclaimer"
- Technical checklist includes "Medical disclaimers added"
- Stats variable `totalClinicPages` but renders agency data
- Priority: Medium/Low

### Tab: `content-admin` (ContentAdminTab)

**Issues:**
- **HARDCODED SUPABASE URL + ANON KEY** (CRITICAL SECURITY)
- Content generation itself works correctly
- Priority: High (security)

### Tab: `seo-expert` (SeoExpertTab)

**Issues:**
- `PAGE_TYPE_LABELS` includes `dentist: 'Dentist Profiles'`
- AI placeholder: "Include specific dental services mentioned"
- Priority: Medium/Low

### Tab: `seo-bot` (SeoBotTab)

**Status:** ✅ **CLEAN**
- Fully generic implementation
- No dental remnants
- Proper settings hooks and rollback

### Tab: `seo-copilot` (SeoCopilotTab)

**Status:** ✅ **CLEAN**
- Correctly queries `seo_tasks`, `seo_pages`, `agencies`, `fostering_categories`, `cities`, `blog_posts`
- No dental terminology

### Tab: `seo-content-optimizer` (SeoContentOptimizerTab)

**Issues:**
- Filter includes `clinic` page type label
- Functionality is generic
- Priority: Low

### Tab: `phase2-sprint-hub` (Phase2SprintHubTab)

**Issues:**
- Priority services: `teeth-whitening`, `invisalign`, `root-canal`, `dental-crowns`, `veneers`, `specialist-fosteringry`, `emergency-dental-care`, `dentures`, `dental-bridges`
- Priority cities: `los-angeles`, `san-francisco`, `san-diego`, `boston`, `san-jose`, `newark`, `hartford`, `sacramento`, `oakland`, `fresno`
- Priority: High

### Tab: `phase3-sprint-hub` (Phase3SprintHubTab)

**Issues:**
- Blog templates: "Toothache Relief", "Crown Falls Off", "Root Canal Signs", "Bleeding After Extraction", "Wisdom Tooth Pain", etc.
- Insurance templates: "Cigna Coverage", "Aetna Coverage", "Delta Dental Coverage", "MetLife Coverage", etc.
- Neighborhood targets: `dubai`, `abu-dhabi`, `sharjah`, `ajman`, `ras-al-khaimah`
- Tool SEO titles: "Verify Dental Coverage", "24/7 Dental Care"
- Outreach: "Dentist Partnership", "Unclaimed Clinics with Email"
- Priority: High

### Tab: `phase4-sprint-hub` (Phase4SprintHubTab)

**Status:** ✅ **CLEAN**
- Uses `fostering_enquiries` for KPIs
- Generic scaling milestones
- No dental remnants

### Tab: `quality-identity` (QualityIdentityTab)

**Status:** ✅ **CLEAN**
- Simple wrapper, lazy-loads sub-tabs
- No dental terminology in shell

### Tab: `price-comparison` (PriceComparisonControlTab)

**Issues:**
- Queries `service_price_ranges` linked to `treatments` table
- Prices in AED (UAE Dirham)
- Filter: "All Emirates"
- Stats: "Avg Min Price: AED X"
- Insurance: `insurance_service_coverage`, `insurances` tables. "for patients"
- Budget slider: "AED 0 – ∞"
- Priority: High

### Tab: `micro-location` (MicroLocationCoverageTab)

**Issues:**
- Correctly defines UK areas (central-london, birmingham, manchester, etc.)
- Queries `cities` using `dentist_count` column
- Summary cards: "Total Clinics"
- Uses "Emirate" instead of "State/Region"
- Priority: Medium

### Tab: `smoke-test` (SmokeTestTab)

**Issues:**
- Route type includes `clinic` and `dentist`
- Variables: `clinics` for agencies, `dentist` for foster_carers
- City routes hardcoded to `/massachusetts/${city.slug}`
- Priority: High

---

## 16. AGENCY DASHBOARD TABS

### Summary

The Agency Dashboard contains **extensive dental clinic remnants** across almost every tab. Multiple components still query `clinics`, `dentists`, `appointments`, and `patients` tables. Several tabs are completely misnamed/misbuilt.

| Agency Tab | Actual Component | What It Should Be | What It Actually Is |
|------------|------------------|-------------------|---------------------|
| `fc-placements` | AvailabilityManagementTab | Placement manager | Dental appointment scheduler |
| `fc-training` | OperationsTab | Training tracker | Dental automation (reminders, GMB) |
| `fc-documents` | MessagesTab | Document manager | SMS messaging center |
| `my-messages` | MessagesTab | Internal messaging | Same SMS center as Documents |
| `fc-compliance` | SupportTicketsTab | Compliance tracker | Generic support ticket system |
| `my-support` | SupportTicketsTab | Support/help | Same support tickets as Compliance |
| `fc-enquiries` | DentistAppointmentsTab | Enquiry manager | Dental appointment manager |
| `my-team` | TeamManagementTab | Team manager | Queries `dentists` table |
| `my-profile` | ProfileEditorTab | Agency profile | Queries `clinics` table |
| `my-reputation` | DentistReputationHub | Agency reputation | Dental reputation hub |
| `my-settings` | DentistSettingsTab | Agency settings | Dental practice settings |
| `my-dashboard` | DentistDashboardTab | Agency dashboard | Dental dashboard with wrong nav |

### Critical Agency Issues

| Tab | Issue | Priority |
|-----|-------|----------|
| `my-dashboard` | Navigates to `my-patients`, `my-appointments`, `my-availability`, `my-intake-forms`, `my-operations` instead of `fc-carers`, `fc-enquiries`, `fc-placements`, `fc-applicants`, `fc-training` | High |
| `my-dashboard` | Queries `clinic_subscriptions` table | High |
| `my-dashboard` | "Get Verified - 99 AED/month" (UAE currency) | High |
| `my-team` | Queries `clinics` and `dentists` tables for team members | High |
| `my-team` | Defaults professional type to `'dentist'` | High |
| `fc-enquiries` | Queries `appointments` table with `clinic_id` and joins `treatments` | High |
| `fc-enquiries` | Header says "Appointments", subtitle "Manage your patient bookings" | High |
| `fc-placements` | Is a dental availability scheduler (weekly hours, slot durations) | High |
| `fc-training` | Is dental automation (appointment reminders, GMB sync) | High |
| `fc-documents` | Is SMS messaging center for "patients" | High |
| `fc-compliance` | Is generic support ticket system, not compliance tracking | High |
| `my-profile` | Queries `clinics`, `clinic_hours`, `clinic_images` tables | High |
| `my-reputation` | Queries `clinics` table. Empty state says "dental practice" | High |
| `my-settings` | Queries `clinics` and `clinic_oauth_tokens` tables | High |
| `FosterCarersTab` (fostering) | `handleEdit` references `carers.*` instead of `carer.*` — crashes | High |
| `FosterCarersTab` (admin) | Says "foster carrier" instead of "foster carer" | Low |

---

## 17. CROSS-CUTTING ISSUES

### Issue: Database Table Mismatch

**Problem:** 40+ queries reference tables that likely don't exist in the fostering schema:
- `clinics` → should be `agencies`
- `dentists` → should be `foster_carers` or `users`
- `patients` → should be `applicants` or `foster_carers`
- `treatments` → should be `fostering_categories`
- `clinic_hours` → not applicable to fostering
- `clinic_insurances` → not applicable
- `clinic_treatments` → not applicable
- `dentist_settings` → should be `agency_settings`
- `clinic_oauth_tokens` → should be `agency_oauth_tokens`
- `clinic_messages` → should be `messages` or `agency_messages`
- `clinic_automation_settings` → should be `agency_automation_settings`
- `appointments` → should be `fostering_enquiries`

**Impact:** These queries return null/empty data, causing broken UI, empty tables, and "Unknown" labels.

### Issue: Wrong Market Geography

**Problem:** Multiple tabs reference wrong markets:
- **UAE:** AED currency, Dubai, Abu Dhabi, Sharjah, "Emirates"
- **US:** California, Los Angeles, Massachusetts, Boston, 51 states
- **Missing UK:** Few tabs actually reference UK cities/regions

**Impact:** Confusing admin experience, wrong data in examples, incorrect placeholder text.

### Issue: Wrong URL Structure

**Problem:** SEO tools operate on legacy slugs (`england`, `london`, `short-term-fostering`) matching old `/:stateSlug` routes. New `/fostering-agencies/england/` pages are not created or manageable.

**Impact:** Content generation tools target wrong URL structure. Admin SEO work doesn't affect live pages.

### Issue: Duplicate Tabs

**Problem:** `content-intelligence` and `content-studio` appear in BOTH "Discovery & SEO" and "Content Management" groups with identical IDs.

**Impact:** Confusing navigation, potential state conflicts.

### Issue: Dead Buttons

**Problem:** 25+ buttons have no `onClick` handlers:
- Overview: Add Agency, multiple quick actions
- Reports: Export All, report cards
- Visitor Analytics: Export
- GMB Connections: Sync, Sync Settings
- Plans: various actions
- Subscriptions: Export
- SEO Command Center: Edit, Sparkles, AI Assistant
- Content Intelligence: Fix buttons
- API Control: Save API Key (causes crash)
- Support Admin: various actions
- And many more...

**Impact:** Users click buttons and nothing happens. Creates impression of a broken platform.

### Issue: Runtime Crashes

**Problem:** 8 components will crash or throw errors:
1. `RankingControlCenterTab` — undefined `data.clinics`/`data.treatments`
2. `RankingControlCenterTab` — undefined `data.locations.data.states`
3. `ContentIntelligenceCenterTab` — hook inside `onClick` (React rules violation)
4. `ApiControlTab` — undefined `refetchSettings()`
5. `SiteConfigTab` — undefined `treatments` variable
6. `ToolsManagementTab` — undefined `treatments` variable
7. `FAQGenerationStudioTab` — undefined `treatments` variable
8. `SystemAuditTab` — undefined `stats.clinics` (toLocaleString on undefined)

**Impact:** White screens, broken tabs, admin cannot use features.

---

## 18. ISSUE SUMMARY BY PRIORITY

### CRITICAL (2 issues)

1. **SECURITY:** Hardcoded Supabase service_role JWT in `UsersManagementTab.tsx`
2. **SECURITY:** Hardcoded Supabase URL + anon key in `ContentAdminTab.tsx`

### HIGH PRIORITY (78 issues)

#### Data Layer (26)
- Queries to non-existent `clinics` table (20+ tabs)
- Queries to non-existent `dentists` table (5+ tabs)
- Queries to non-existent `patients` table (3+ tabs)
- Queries to non-existent `treatments` table (4+ tabs)
- Queries to non-existent `clinic_hours` table (3 tabs)
- Queries to non-existent `clinic_insurances` table (2 tabs)
- Queries to non-existent `dentist_settings` table (3 tabs)
- Queries to non-existent `clinic_oauth_tokens` table (2 tabs)
- Queries to non-existent `clinic_messages` table (1 tab)
- Queries to non-existent `clinic_automation_settings` table (1 tab)
- Queries to non-existent `clinic_subscriptions` table (3 tabs)

#### Broken Features (18)
- Overview quick actions navigate to non-existent tabs
- Overview Add Agency button has no handler
- Reports report cards have no handler
- Reports Export All has no handler
- Visitor Analytics Export has no handler
- Ranking Rules Recalculate does nothing
- GMB Connections Sync button has no handler
- GMB Connections Sync Settings has no handler
- Leads View button has no handler
- Plans Export has no handler
- Subscriptions Export has no handler
- SEO Command Center Edit/Sparkles have no handler
- SEO Command Center AI Assistant has no handler
- Content Intelligence Fix buttons have no handler
- API Control Save API Key crashes (undefined function)
- Roles Add Permission Override has no handler
- Support Admin various actions broken

#### Runtime Crashes (8)
- RankingControlCenterTab crashes on render (undefined properties)
- ContentIntelligenceCenterTab crashes on Optimize click (hook violation)
- ApiControlTab crashes on Save (undefined function)
- SiteConfigTab crashes on dropdown (undefined variable)
- ToolsManagementTab crashes on render (undefined variable)
- FAQGenerationStudioTab crashes on filter (undefined variable)
- SystemAuditTab crashes on stats load (undefined property)
- FosterCarersTab crashes on edit (wrong variable reference)

#### Wrong Data (14)
- Weekly report queries `clinic_subscriptions`
- Weekly report queries `cities.dentist_count`
- Geo-expansion targets US states/cities
- SEO Health uses US examples
- Page registry has US data
- Structured data uses US country code
- Ranking Control focuses on Dubai
- Price comparison uses AED currency
- Smoke test uses Massachusetts
- Phase 2 sprint uses US cities
- Phase 3 sprint uses UAE cities
- Contact details uses UAE phone format
- Contact details uses US addresses
- Dashboard verification pricing in AED

#### Missing Features (12)
- Agencies tab: no Edit/View action
- Agencies tab: missing critical columns
- Claims tab: no approve/reject/manage
- Locations tab: no add/edit functionality
- Blog tab: no CRUD
- Users tab: no edit/suspend/impersonate
- Content Intelligence: fake audits
- Outreach: Message Log is "Coming Soon"
- SEO Command Center: empty placeholder tabs
- Internal Linking: empty placeholder tabs
- Reports: missing fostering-specific reports
- Ranking Rules: missing fostering factors

### MEDIUM PRIORITY (64 issues)

- Dental terminology remnants across 40+ tabs (clinic, dentist, patient, treatment, booking, etc.)
- Wrong tab labels and descriptions
- Missing confirmation dialogs
- Inefficient queries (sequential counts)
- Outdated examples and placeholders
- Missing pagination
- Incorrect filters
- Stale state bugs
- False positive API statuses
- Schema mismatches
- And many more...

### LOW PRIORITY (38 issues)

- Cosmetic dental terminology
- Wrong icons (Stethoscope)
- Outdated comments
- Misleading variable names
- File naming inconsistencies
- Placeholder text issues
- Minor label mismatches

---

## 19. REMEDIATION ROADMAP

### Phase 1: Critical Security & Crashes (Week 1)

**Goal:** Fix security vulnerabilities and runtime crashes so the platform is safe and usable.

1. **Remove hardcoded credentials**
   - `UsersManagementTab.tsx`: Remove hardcoded service_role JWT
   - `ContentAdminTab.tsx`: Remove hardcoded Supabase URL + key
   - Use environment variables (`import.meta.env.VITE_SUPABASE_URL`, etc.)

2. **Fix runtime crashes**
   - `RankingControlCenterTab`: Fix `data.clinics` → `data.agencies`, add null checks
   - `ContentIntelligenceCenterTab`: Move hook call outside `onClick`
   - `ApiControlTab`: Define or remove `refetchSettings()` call
   - `SiteConfigTab`: Fix undefined `treatments` → `categories`
   - `ToolsManagementTab`: Fix undefined `treatments` → `categories`
   - `FAQGenerationStudioTab`: Fix undefined `treatments` → `categories`
   - `SystemAuditTab`: Fix variable names and null checks
   - `FosterCarersTab`: Fix `carers.*` → `carer.*`

3. **Fix dead buttons**
   - Add `onClick` handlers or remove `cursor-pointer` from decorative elements
   - Overview: Add Agency, quick actions
   - Reports: Export All, report cards
   - GMB Connections: Sync, Sync Settings
   - SEO Command Center: Edit, Sparkles, AI Assistant
   - And all other dead buttons

### Phase 2: Data Layer Migration (Week 1-2)

**Goal:** Update all database queries to use correct fostering tables.

1. **Create migration mapping**
   - `clinics` → `agencies`
   - `dentists` → `foster_carers` / `users`
   - `patients` → `applicants` / `foster_carers`
   - `treatments` → `fostering_categories`
   - `clinic_hours` → remove or create `agency_hours`
   - `clinic_insurances` → remove
   - `clinic_treatments` → remove
   - `dentist_settings` → `agency_settings`
   - `clinic_oauth_tokens` → `agency_oauth_tokens`
   - `clinic_messages` → `messages` / `agency_messages`
   - `clinic_automation_settings` → `agency_automation_settings`
   - `clinic_subscriptions` → `agency_subscriptions`
   - `appointments` → `fostering_enquiries`

2. **Update all affected tabs**
   - Reputation hub sub-tabs
   - Review insights
   - GMB connections
   - Booking system
   - Appointments
   - Email enrichment
   - Promotions
   - Plans
   - Subscriptions
   - Marketplace control
   - CRM numbers
   - Messaging control
   - Platform services
   - Agency dashboard tabs
   - And more...

3. **Verify schema compatibility**
   - Check if target columns exist in fostering tables
   - Add missing columns if needed
   - Update TypeScript types

### Phase 3: Agency Dashboard Rebuild (Week 2-3)

**Goal:** Replace dental components with fostering-appropriate ones.

1. **Replace wrong components**
   - `fc-placements`: Build placement management (not appointment scheduler)
   - `fc-training`: Build training tracker (not dental automation)
   - `fc-documents`: Build document manager (not SMS center)
   - `fc-compliance`: Build compliance tracker (not support tickets)
   - `fc-enquiries`: Build enquiry manager (not appointment manager)
   - `my-team`: Update to query `users` table, not `dentists`
   - `my-profile`: Update to query `agencies` table, not `clinics`
   - `my-reputation`: Update to query `agencies` table
   - `my-settings`: Update to query `agencies` table
   - `my-dashboard`: Fix navigation targets

2. **Fix navigation**
   - Update all `navigateTo()` calls to use fostering tab IDs
   - Update `AgencySidebar.tsx` labels
   - Update `DentistDashboardLayout.tsx` labels

3. **Fix terminology**
   - "Appointments" → "Enquiries"
   - "Patients" → "Foster Carers" / "Applicants"
   - "Bookings" → "Enquiries"
   - "Treatments" → "Fostering Types"
   - "Clinic" → "Agency"
   - "Dentist" → "Foster Carer" / "Social Worker"

### Phase 4: Content & SEO Alignment (Week 3)

**Goal:** Ensure SEO tools manage the correct URL structure and content.

1. **Fix URL structure**
   - Update `seo_pages` table to include `/fostering-agencies/...` slugs
   - Update content generation to create new route pages
   - Update page registry with UK routes
   - Fix `pageRegistry.ts` with UK data

2. **Fix geography**
   - Replace US/UAE examples with UK examples
   - Update geo-expansion to seed UK regions and cities
   - Update smoke test to use UK state slugs
   - Update sprint hubs with UK cities and fostering services

3. **Fix schema markup**
   - Replace `Dentist`/`MedicalBusiness` with `Organization`/`LocalBusiness`
   - Update `addressCountry` to `"GB"`
   - Fix route detection for `/agency/` paths

4. **Fix dental content**
   - Replace all dental service names in sprint definitions
   - Replace dental blog templates with fostering templates
   - Replace dental insurance templates with UK fostering templates
   - Update outreach templates with fostering language

### Phase 5: Polish & Features (Week 4)

**Goal:** Add missing features and polish the admin experience.

1. **Add missing features**
   - Agencies tab: Edit/View action
   - Claims tab: Approve/reject/manage actions
   - Locations tab: Add/edit functionality
   - Blog tab: Create/Edit/Delete
   - Users tab: Edit roles, suspend, impersonate
   - Reports: Fostering-specific reports
   - Ranking rules: Fostering-specific factors

2. **Fix feature flags**
   - Remove `booking_engine_enabled`, `booking_default_on` (or rename)
   - Add `ofsted_sync`, `placement_tracking`
   - Update descriptions

3. **Fix roles**
   - Remove `dentist`, `patient` roles
   - Add `agency_admin`, `foster_carer`, `applicant`, `trainer`, `social_worker`
   - Update permission matrix

4. **Fix tools**
   - Cost calculator: GBP, fostering categories
   - Insurance manager: Remove or repurpose
   - Emergency finder: Remove or repurpose

5. **Final terminology sweep**
   - Systematic find-and-replace of all dental terms
   - Update file names (e.g., `TopDentistsTab.tsx` → `TopAgenciesTab.tsx`)
   - Update component names
   - Update variable names

---

## APPENDIX: COMPLETE FILE INVENTORY

### Files with Critical Issues

| File | Issue Type | Priority |
|------|-----------|----------|
| `src/components/admin/tabs/UsersManagementTab.tsx` | Hardcoded JWT | CRITICAL |
| `src/components/admin/tabs/ContentAdminTab.tsx` | Hardcoded API key | CRITICAL |
| `src/components/admin/tabs/RankingControlCenterTab.tsx` | Runtime crash | High |
| `src/components/admin/tabs/ContentIntelligenceCenterTab.tsx` | Hook violation | High |
| `src/components/admin/tabs/ApiControlTab.tsx` | Undefined function | High |
| `src/components/admin/tabs/SiteConfigTab.tsx` | Undefined variable | High |
| `src/components/admin/tabs/ToolsManagementTab.tsx` | Undefined variable | High |
| `src/components/admin/tabs/FAQGenerationStudioTab.tsx` | Undefined variable | High |
| `src/components/admin/tabs/SystemAuditTab.tsx` | Undefined properties | High |
| `src/components/fostering/FosterCarersTab.tsx` | Wrong variable | High |

### Files with Dental Table References

| File | Dental Table | Correct Table |
|------|-------------|---------------|
| `src/components/reputation/AdminReputationHub.tsx` | `clinics` | `agencies` |
| `src/components/admin/tabs/ReviewInsightsTab.tsx` | `clinics` | `agencies` |
| `src/components/admin/tabs/GMBConnectionsTab.tsx` | `clinic_oauth_tokens` | `agency_oauth_tokens` |
| `src/components/admin/tabs/BookingSystemTab.tsx` | `dentist_settings`, `clinics` | `agency_settings`, `agencies` |
| `src/components/admin/tabs/AppointmentsTab.tsx` | `appointments`, `clinics`, `dentists`, `treatments` | `fostering_enquiries`, `agencies` |
| `src/components/admin/tabs/EnquiriesTab.tsx` | Shows `agencies` instead of enquiries | `fostering_enquiries` |
| `src/components/admin/tabs/EmailEnrichmentBotTab.tsx` | `clinics` | `agencies` |
| `src/components/admin/tabs/PromotionsTab.tsx` | `clinics`, `clinic_subscriptions` | `agencies`, `agency_subscriptions` |
| `src/components/admin/tabs/PlansTab.tsx` | `clinics`, `clinic_subscriptions` | `agencies`, `agency_subscriptions` |
| `src/components/admin/tabs/SubscriptionsTab.tsx` | `clinics`, `clinic_subscriptions` | `agencies`, `agency_subscriptions` |
| `src/components/admin/tabs/MarketplaceControlTab.tsx` | `dentist_settings` | `agency_settings` |
| `src/components/admin/tabs/CrmNumbersTab.tsx` | `clinics` | `agencies` |
| `src/components/admin/tabs/MessagingControlTab.tsx` | `clinics`, `clinic_messages`, `clinic_automation_settings` | `agencies`, `messages` |
| `src/components/agency/TeamManagementTab.tsx` | `clinics`, `dentists` | `agencies`, `users` |
| `src/components/agency/DentistAppointmentsTab.tsx` | `appointments`, `clinics`, `treatments` | `fostering_enquiries`, `agencies` |
| `src/components/agency/AvailabilityManagementTab.tsx` | `dentist_availability_rules`, `availability_blocks` | `placements` |
| `src/components/agency/OperationsTab.tsx` | `clinics`, `clinic_automation_settings` | `training_records` |
| `src/components/agency/MessagesTab.tsx` | `clinic_messages`, `patients` | `documents`, `files` |
| `src/components/agency/SupportTicketsTab.tsx` | `support_tickets` (generic) | `compliance_records` |
| `src/components/agency/ProfileEditorTab.tsx` | `clinics`, `clinic_hours`, `clinic_images` | `agencies` |
| `src/components/agency/DentistSettingsTab.tsx` | `clinics`, `clinic_oauth_tokens` | `agencies` |
| `src/components/reputation/DentistReputationHub.tsx` | `clinics` | `agencies` |

---

## FINAL SUMMARY

The foster-care.co.uk Super Admin dashboard is **functionally a dental clinic directory admin panel with fostering labels pasted on top**. While the public-facing pages and core agency data flow are mostly correct, the administrative backend:

1. **Queries the wrong database tables** — 40+ references to non-existent dental tables
2. **Has critical security vulnerabilities** — 2 hardcoded Supabase credentials in frontend code
3. **Crashes on normal use** — 8 components will throw runtime errors
4. **Has 25+ dead buttons** — UI elements that look clickable but do nothing
5. **Uses wrong geography** — UAE and US examples instead of UK
6. **Has completely wrong agency tabs** — 5 of 14 agency tabs are dental components masquerading as fostering tools
7. **Targets wrong URL structure** — SEO tools manage legacy routes, not live `/fostering-agencies/` pages
8. **Uses wrong schema markup** — Dental/medical schema types instead of fostering-appropriate types

**Estimated remediation effort:** 3-4 weeks of focused development work across all phases.

**Immediate next steps:**
1. Fix the 2 critical security vulnerabilities TODAY
2. Fix the 8 runtime crashes THIS WEEK
3. Begin systematic data layer migration (Phase 2)
4. Rebuild agency dashboard components (Phase 3)
5. Align SEO tools with live URL structure (Phase 4)
6. Add missing features and polish (Phase 5)

---

*Report generated by AI Audit Team*
*Total tabs audited: 75+*
*Total issues documented: 180+*
*Audit date: Mon May 11 2026*
