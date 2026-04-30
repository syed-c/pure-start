-- Add image_url column to agencies table if not exists
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Also ensure cover_image_url exists
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agencies' 
AND column_name IN ('image_url', 'cover_image_url');