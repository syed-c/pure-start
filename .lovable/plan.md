

# Data Recovery Plan

## Current Damage Assessment

| Table | Current Count | Expected Count | Status |
|-------|--------------|----------------|--------|
| Clinics | **0** | ~10,019 | DELETED |
| Dentists | **0** | Unknown (hundreds) | DELETED |
| Google Reviews | **0** | Thousands | DELETED (cascade) |
| Clinic Hours | **0** | Thousands | DELETED (cascade) |
| Clinic Treatments | **0** | Thousands | DELETED (cascade) |
| SEO Pages | 17,162 | 17,162 | Intact |
| Cities | 274 active | 274 | Intact |
| States | Active (CA, CT, MA, NJ + UAE) | Same | Intact |
| Areas | 63 active | Same | Intact |
| Treatments | 35 active | Same | Intact |
| Appointments | 20 | Same | Intact |

The delete happened today (Feb 16, 2026 at ~15:20 UTC). The audit logs confirm a `DELETE_ALL` action on both clinics and dentists. Related tables (reviews, hours, treatments) were likely cascade-deleted.

---

## Recovery Strategy

The good news: your audit logs contain **11,020 unique Google Place IDs** from all previous imports. This is your recovery key. The GMB Import function can re-fetch full clinic details (name, address, phone, hours, reviews, photos) from Google using these Place IDs.

### Step 1: Build a Recovery Edge Function

Create a new `recover-clinics` edge function that:
1. Reads all unique `google_place_id` values from `audit_logs` (GMB_IMPORT records)
2. Re-fetches each clinic's full details from Google Places API using those Place IDs
3. Re-inserts them into the `clinics` table with proper city/area assignments
4. Re-imports opening hours into `clinic_hours`
5. Re-imports reviews into `google_reviews`

This will be processed in batches (50 at a time) to avoid timeouts.

### Step 2: Re-generate Dentist Profiles

Since dentist data was not stored in audit logs with enough detail to reconstruct, dentist profiles will need to be:
- Re-created from any existing `seo_pages` with `page_type = 'dentist'` (3 records exist)
- Re-bootstrapped through the dentist onboarding flow for claimed clinics

### Step 3: Re-link Clinic Treatments

After clinics are restored, run treatment assignment logic to re-populate the `clinic_treatments` table so service-location pages show dentists again.

### Step 4: Verify Data Integrity

- Confirm clinic counts match per city/state
- Verify SEO pages still link to valid clinic IDs
- Check that service-location pages display clinics properly

---

## Technical Details

### Recovery Edge Function Logic

```text
1. Query audit_logs for all unique google_place_id values
   (11,020 records available)

2. For each batch of 50 place IDs:
   a. Call Google Places API (Details) to get current data
   b. Match to nearest city using lat/lng coordinates
   c. Insert into clinics table (upsert on google_place_id)
   d. Insert opening hours into clinic_hours
   e. Insert reviews into google_reviews

3. Track progress and report results
```

### Google API Cost Estimate

- ~11,000 Place Details calls at $0.017 each = ~$187
- This uses your existing `GOOGLE_PLACES_API_KEY` secret

### Alternative: External Supabase Backup

You have `EXTERNAL_SUPABASE_URL` and `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` configured. If your external Supabase project still has the clinic data (from the migration function), we could pull data from there instead of re-fetching from Google, which would be:
- Free (no API costs)
- Faster (direct DB copy)
- More complete (preserves original slugs, descriptions, custom edits)

**Recommendation**: Check the external Supabase first. If it has the data, use that. Otherwise, fall back to Google re-import.

---

## Implementation Order

1. Check external Supabase for existing clinic data backup
2. If backup exists: build a restore function that copies from external DB
3. If no backup: build Google Places re-import using audit log Place IDs
4. Re-link clinic-treatment associations
5. Verify all pages display correctly

