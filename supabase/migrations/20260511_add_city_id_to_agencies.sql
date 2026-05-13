-- Migration: Add city_id to agencies table and improve location relationships
-- Date: 2026-05-11
-- Purpose: Enable proper relational linking between agencies and locations

-- =============================================================================
-- STEP 1: Add city_id column to agencies table (if not exists)
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agencies' AND column_name = 'city_id'
    ) THEN
        ALTER TABLE agencies ADD COLUMN city_id UUID REFERENCES cities(id) ON DELETE SET NULL;
        CREATE INDEX idx_agencies_city_id ON agencies(city_id);
        RAISE NOTICE 'Added city_id column to agencies table';
    ELSE
        RAISE NOTICE 'city_id column already exists on agencies table';
    END IF;
END $$;

-- =============================================================================
-- STEP 2: Ensure agency_locations table has proper columns
-- =============================================================================
DO $$
BEGIN
    -- Add location_type if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agency_locations' AND column_name = 'location_type'
    ) THEN
        ALTER TABLE agency_locations ADD COLUMN location_type TEXT DEFAULT 'city';
    END IF;

    -- Add assignment_source if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agency_locations' AND column_name = 'assignment_source'
    ) THEN
        ALTER TABLE agency_locations ADD COLUMN assignment_source TEXT DEFAULT 'manual';
    END IF;

    -- Add assigned_at if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agency_locations' AND column_name = 'assigned_at'
    ) THEN
        ALTER TABLE agency_locations ADD COLUMN assigned_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =============================================================================
-- STEP 3: Backfill city_id for existing agencies based on city name match
-- =============================================================================
UPDATE agencies a
SET city_id = c.id
FROM cities c
WHERE a.city_id IS NULL
  AND a.city IS NOT NULL
  AND LOWER(TRIM(a.city)) = LOWER(TRIM(c.name))
  AND c.is_active = true;

RAISE NOTICE 'Backfilled city_id for existing agencies';

-- =============================================================================
-- STEP 4: Backfill agency_locations junction table for existing linked agencies
-- =============================================================================
INSERT INTO agency_locations (agency_id, location_id, location_type, assignment_source, assigned_at)
SELECT 
    a.id AS agency_id,
    a.city_id AS location_id,
    'city' AS location_type,
    'backfill' AS assignment_source,
    NOW() AS assigned_at
FROM agencies a
WHERE a.city_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM agency_locations al 
      WHERE al.agency_id = a.id AND al.location_id = a.city_id
  )
ON CONFLICT (agency_id, location_id) DO NOTHING;

RAISE NOTICE 'Backfilled agency_locations junction table';

-- =============================================================================
-- STEP 5: Add indexes for performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_agency_locations_agency_id ON agency_locations(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_locations_location_id ON agency_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_agencies_city ON agencies(city);
CREATE INDEX IF NOT EXISTS idx_agencies_state ON agencies(state);

-- =============================================================================
-- STEP 6: Verify counts
-- =============================================================================
SELECT 
    'agencies with city_id' AS metric,
    COUNT(*) AS count
FROM agencies
WHERE city_id IS NOT NULL
UNION ALL
SELECT 
    'agency_locations records' AS metric,
    COUNT(*) AS count
FROM agency_locations;
