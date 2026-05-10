-- Add missing columns to agencies table for claim functionality

-- Add claim_emails column if it doesn't exist
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS claim_emails text[];

-- Add claim_status column if it doesn't exist  
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS claim_status text DEFAULT 'unclaimed';

-- Add verification_status column if it doesn't exist
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';

-- Add claimed_at timestamp
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS claimed_at timestamp with time zone;

-- Add claimed_by user reference
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS claimed_by uuid references auth.users(id);

-- Add verification_sent_at timestamp
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS verification_sent_at timestamp with time zone;

SELECT 'Columns added to agencies table' AS status;