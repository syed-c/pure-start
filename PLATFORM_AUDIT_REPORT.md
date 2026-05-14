# Pure Start Platform — Full Audit Report

**Audit Date**: May 14, 2026
**Scope**: Claim Profile flow, Super Agent dashboard, SEO foundation, email/notification automation, data layer

---

## 🔴 CRITICAL — Fix Immediately

### C1. Claim Profile Page Crashes (Runtime Error)
**File**: `src/pages/ClaimProfilePage.tsx:144`
**Bug**: `hasClaimEmails` and `claimEmails` variables are used but **never declared** — no `useState`, `useQuery`, or `useMemo` creates them. Selecting an agency triggers `ReferenceError: hasClaimEmails is not defined`.
**Fix**: Add a query to fetch `claim_emails` from the selected agency's record.

### C2. Edge Functions Only Handle `clinics` Table (Not `agencies`)
**Files**:
- `supabase/functions/send-claim-otp/index.ts:140-144` — queries `clinics` by id
- `supabase/functions/verify-claim-otp/index.ts:117-124` — updates `clinics` table
**Bug**: If the user selects an agency from the `agencies` table (which they can since `ClaimProfilePage.tsx:108-128` searches BOTH tables), the OTP flow fails with "Clinic not found". The verify function adds role `dentist` instead of `agency_admin`.
**Fix**: Edge functions must handle both tables, or restrict search to one table.

### C3. `claim_requests` FK Constraint Violation for Agencies
**Bug**: `claim_requests.clinic_id` has FK to `clinics(id)`. Manual claim submission inserts `selectedAgency.id` as `clinic_id`. If the agency is from `agencies` table (not `clinics`), FK violation → insert fails silently.
**Fix**: Add `agency_id` column to `claim_requests` or merge the tables.

### C4. `/fostering-agencies/*` Routes Not Indexable
**File**: `src/config/pageRegistry.ts`
**Bug**: The pageRegistry does NOT list any route pattern matching `/fostering-agencies/*`. The actual app routes (`/fostering-agencies/:locationSlug`, `/fostering-agencies/:locationSlug/:categorySlug`) are missing from the registry. `classifyPath()` returns `{ indexable: false, renderMode: 'CSR' }` for ALL these pages — meaning **every location and category page is non-indexable**.
**Impact**: All 500+ location pages are invisible to search engines. This is the #1 SEO killer.

### C5. Agency Sitemap is EMPTY
**File**: `public/sitemap-agencies.xml`
**Content**: Only an HTML comment — zero URLs. Every agency profile is absent from the sitemap.
**Impact**: Agency pages never get crawled or indexed.

### C6. 404 Pages Set Broken URL as Canonical
**File**: `src/pages/NotFound.tsx:33`
**Bug**: `<SEOHead canonical={location.pathname}>` passes the broken/non-existent URL as the canonical. A 404 page should either omit canonical or use the 404 page URL, not the broken path.
**Impact**: Search engines may index broken URLs as canonical.

### C7. Enquiries Tab Shows Wrong Data (Labeled "Lead CRM")
**File**: `src/components/admin/tabs/EnquiriesTab.tsx:1`
**Bug**: First line is `// TODO: This tab currently shows agencies instead of leads/enquiries`. Queries `agencies` table instead of `enquiries` table.
**Impact**: Super admins see agency list instead of actual leads. Complete feature failure.

### C8. Appointments Tab Crashes (Undefined Variable)
**File**: `src/components/admin/tabs/AppointmentsTab.tsx:124`
**Bug**: `let filtered = enquiries || [];` — `enquiries` is not defined. The data variable is `appointments`. Will cause `ReferenceError` on filter.
**Impact**: Tab crashes immediately when user tries to filter.

### C9. No Email Notification for New Manual Claims
**Bug**: When a user submits a manual review claim, only a DB insert happens. **No email is sent to admins**, no webhook, no notification. Manual claims sit unseen until an admin happens to check.
**Impact**: Legitimate claim requests are lost.

### C10. Appointment Email Trigger is Dead
**File**: `supabase/migrations/20260110070419_*.sql`
**Bug**: PostgreSQL `NOTIFY 'appointment_email'` fires on appointment changes but **no edge function listens** on this channel. Appointment status changes trigger no email.
**Impact**: Booking confirmation/cancellation emails never send.

### C11. Phase-3 Outreach Queues Messages But Never Sends
**File**: `supabase/functions/phase3-outreach/index.ts:279`
**Bug**: Creates campaigns and queues messages to `outreach_messages` table but the comment says "Actual email sending would be done via send-outreach function" — nothing invokes it. No cron job exists.
**Impact**: Outreach campaigns are created but no emails ever go out.

---

## 🟠 HIGH PRIORITY

### H1. Agency Profile Claim Form is Stubbed
**File**: `src/pages/AgencyProfilePage.tsx:258-270`
**Bug**: `handleClaimSubmit` only shows a toast and resets the form. **No DB insert, no email, no notification**. The claim request is silently discarded.
**Fix**: Wire up to `claim_requests` table insert.

### H2. Claim Profile URL Param Mismatch
**Files**:
- `src/components/clinic/ClaimProfileCTA.tsx:56` — links to `/claim-profile?clinic=${name}`
- `src/pages/ClaimProfilePage.tsx:62` — reads `searchParams.get("agency")`
**Bug**: Parameter names don't match. Pre-fill never works.

### H3. `useAdminClaims` Hook Has Broken Join
**File**: `src/hooks/useAdminClaims.ts:32-33`
**Bug**: `.select('*, agency:agencies(id, name, slug)')` — no FK exists from `claim_requests` to `agencies`. Only `clinic_id` → `clinics`. The agency relation always resolves to `null`.
**Impact**: ClaimsTab shows "Unknown Clinic" for all entries.

### H4. AgencyClaimsTab is Read-Only (No Approve/Reject)
**File**: `src/components/admin/tabs/AgencyClaimsTab.tsx`
**Bug**: Shows agencies with claim status badges but has **no approve/reject functionality**. Admins cannot process claims from this tab.
**Fix**: Add approve/reject workflow.

### H5. RankingControlCenterTab — Hardcoded Dubai Logic
**File**: `src/components/admin/tabs/RankingControlCenterTab.tsx:166-172`
**Bug**: Line 166 comment says `// 4. Local Relevance (Dubai focus)`. References Dubai cities, UAE states. Shows irrelevant Dubai metrics on a UK platform.
**Impact**: Misleading ranking data.

### H6. BookingSystemTab — Dental/Clinic Terminology
**File**: `src/components/admin/tabs/BookingSystemTab.tsx`
**Bug**: References `dentist_settings` table (doesn't exist for fostering), `clinic_id`, `ClinicWithSettings`, `ClinicSettingsForm`. Bulk enable uses `clinic.id` instead of `agency.id` (line 311).
**Impact**: Tab queries nonexistent tables → errors.

### H7. No Server-Side Redirects
**File**: `vercel.json:5` — `"redirects": []`
**Bug**: All redirects (`/services` → `/categories`, `/list-your-practice` → `/list-your-agency`, etc.) use client-side `<Navigate>`. No 301 redirects. Wastes crawl budget.
**Impact**: Lost link equity, potential duplicate content.

### H8. Zero Welcome/Registration Email
**Bug**: Auth signup via Supabase triggers **no welcome email**. New users register and hear nothing.
**Fix**: Add a database trigger on `auth.users` insert to send welcome email.

### H9. No Claim-Approved Email Notification
**Bug**: When admins approve a claim request, no email is sent to the claimant.
**Impact**: User doesn't know their claim was approved.

### H10. Three Separate Sitemap Systems (Inconsistent)
**Systems**:
1. Static files in `public/` — hardcoded
2. Edge function `supabase/functions/sitemap/index.ts` — dynamic
3. Vercel API `api/sitemap.ts` — separate implementation
**Bug**: Each has different content. The static `sitemap.xml` references `sitemap-locations.xml` and `sitemap-service-location.xml` but the edge function doesn't generate those types. The API function has its own bugs.

### H11. Duplicate JSON-LD (StructuredData + SyncStructuredData)
**Files**: Both `src/components/seo/StructuredData.tsx` and `SyncStructuredData.tsx` co-exist
**Bug**: On some pages both inject JSON-LD, causing duplicate structured data. Google's validator flags this.

### H12. pageRegistry Still Uses Dental/USA Terminology
**File**: `src/config/pageRegistry.ts`
**Bug**: Page types include `clinic`, `dentist`, `insurance-index`, `insurance-detail`. `ESTIMATED_PAGE_COUNTS` says `states: 51` (US). Description says `'Service in location (e.g., /california/los-angeles/specialist-fostering)'`.

---

## 🟡 MEDIUM PRIORITY

### M1. RolesTab — Dental Terminology
**File**: `src/components/admin/tabs/RolesTab.tsx`
**Bug**: Role definitions use `dentist`, `patient`, `district_manager`. Not fostering-specific roles like `agency_admin`, `foster_carer`.

### M2. 22+ Files with console.error Debug Output
Found in: `FosteringAgenciesTab.tsx:49,101`, `AppointmentsTab.tsx:55`, `SeoTab.tsx:73,89`, `FosteringCategoriesTab.tsx:84`, `AISearchControlTab.tsx:93`, and many more.
**Risk**: Debug output exposed in production.

### M3. Tab `static-pages` and `tools-management` Unreachable
**Bug**: These tabs are in `renderTab()` switch but NOT in any `adminTabGroups` sidebar definitions. Users can never navigate to them.

### M4. SEOHead Canonical URL Not Lowercased
**File**: `src/components/seo/SEOHead.tsx:37-43`
**Bug**: `window.location.pathname` used directly — URLs with uppercase chars produce non-matching canonicals.

### M5. Missing `og:locale="en_GB"`
**File**: `src/components/seo/SEOHead.tsx`
**Bug**: No `og:locale` tag set. Should be `en_GB` for UK site.

### M6. Hardcoded Fake Testimonials on Homepage
**File**: `src/pages/HomePage.tsx:31-36`
**Bug**: Testimonials like "Sarah M.", "James & Claire T.", "Priya K." are fictional. Trust risk if discovered.

### M7. Algorithmic Content Generation via `simpleHash()`
**File**: `src/components/seo/RichContentSections.tsx:26-59`
**Bug**: Generates semi-random but deterministic city content from templates. Google may detect as algorithmically generated content (potential penalty).

### M8. No Preload/Preconnect for Critical Origins
**Bug**: No `<link rel="preconnect">` for `https://images.unsplash.com` (used for hero images). No `font-display:swap`.

### M9. `send-form-request` SMS is Stubbed
**File**: `supabase/functions/send-form-request/index.ts:227`
**Bug**: `console.log("SMS would be sent to:", patientPhone)` — actual SMS delivery never happens.

### M10. AIControlsTab "Decisions Today" Counter is Wrong
**Bug**: Shows total audit_log count, not filtered to "today".

### M11. Subscription Tab Uses `clinic_id` Internally
**File**: `src/components/admin/tabs/SubscriptionsTab.tsx`
**Bug**: References `clinics` variable, `clinic_id` — fostering agencies use `agencies` table.

---

## 🟢 LOW PRIORITY / COSMETIC

### L1. Function Name Mismatches (default exports)
- `FosteringAgenciesTab.tsx` exports `AgenciesTab`
- `LocationsManagementTab.tsx` exports `LocationsTab`

### L2. hasClaimEmails TypeScript Error (Prevents Compilation)
**File**: `ClaimProfilePage.tsx:144`
**Note**: Already listed as C1, but this will prevent the app from compiling in strict TypeScript mode.

### L3. 6 TODO/FIXME Comments in Production Code
Found in: `EnquiriesTab.tsx` (critical), `SettingsTab.tsx`, `CrmNumbersTab.tsx`, `ClinicsTab.tsx`, `RankingRulesTab.tsx`

### L4. No Welsh (`cy`) Hreflang for Wales Pages
**File**: `src/components/seo/CanonicalUrl.tsx:31-44`
**Bug**: Only `en-gb` and `x-default` emitted. UK site covering Wales should consider `cy`.

### L5. No Service Worker
**Bug**: No service worker for offline caching or PWA support.

---

## Dashboard Tab Health Summary

| Tab | Status | Issue |
|-----|--------|-------|
| EnquiriesTab (Lead CRM) | ❌ BROKEN | Shows agencies instead of enquiries |
| AppointmentsTab | ❌ BROKEN | Undefined variable crash on filter |
| RankingControlCenterTab | ⚠️ BROKEN | Hardcoded Dubai logic |
| BookingSystemTab | ⚠️ BROKEN | References `dentist_settings` table |
| RolesTab | ⚠️ PARTIAL | Dental terminology, wrong roles |
| SubscriptionsTab | ⚠️ PARTIAL | Uses `clinic_id` |
| AIControlsTab | ⚠️ PARTIAL | Decisions counter not filtered |
| Claim Profile Page | ❌ BROKEN | 5+ critical bugs (C1-C3, H1-H4) |
| Sitemap/Agencies | ❌ BROKEN | Empty file |
| pageRegistry | ❌ BROKEN | Missing /fostering-agencies routes |
| Email Automation | ⚠️ PARTIAL | 3 dead automation paths (C10, C11, M9) |
| All other tabs | ✅ WORKS | ~50 tabs functional |

---

## Priority Fix Plan

### Week 1: CRITICAL Fixes
1. Fix pageRegistry — add `/fostering-agencies/:locationSlug` and `/fostering-agencies/:locationSlug/:categorySlug` route patterns
2. Fix `hasClaimEmails` crash in ClaimProfilePage — add `useQuery` for `claim_emails`
3. Fix OTP edge functions to handle `agencies` table (not just `clinics`)
4. Fix `claim_requests` FK — add `agency_id` column or merge approach
5. Populate `sitemap-agencies.xml` with real agency URLs
6. Fix 404 canonical URL
7. Fix EnquiriesTab to query `enquiries` table
8. Fix AppointmentsTab undefined variable

### Week 2: HIGH Fixes
9. Wire up Agency Profile claim form to DB
10. Fix ClaimProfileCTA URL param mismatch
11. Add approve/reject to AgencyClaimsTab
12. Fix RankingControlCenterTab Dubai → UK
13. Fix BookingSystemTab → use `agencies`/`agency_settings`
14. Add server-side 301 redirects in vercel.json
15. Fix email automation: appointment trigger listener, phase-3 outreach cron
16. Add welcome email on signup
17. Add claim-approved email notification
18. Consolidate 3 sitemap systems → 1

### Week 3: MEDIUM Fixes
19. Update RolesTab with fostering-specific roles
20. Remove console.error debug output from 22+ files
21. Add unreachable tabs to sidebar
22. Fix SEOHead canonical lowercasing
23. Add og:locale
24. Replace fake testimonials with real ones
25. Fix algorithmic content generation
26. Add preconnect/preload hints
27. Fix send-form-request SMS
28. Fix AIControlsTab counter
29. Fix SubscriptionsTab references

### Week 4: Enhancements
30. Add claiming promotional email campaign to agencies
31. Google login for claim form
32. Simplify claim flow UX
33. Add missing hreflang variants
34. Consider PWA/service worker
35. General dental→fostering terminology cleanup across all files
