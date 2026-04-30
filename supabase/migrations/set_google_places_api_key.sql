-- Set Google Places API Key
-- This key is used by the gmb-import edge function to fetch agency data from Google Places

INSERT INTO global_settings (key, value, description, created_at, updated_at)
VALUES (
  'google_places_api_key',
  '{"api_key": "AIzaSyACysLbv8k6e-IJNl5VnZzyX6oZhLAlVKI"}',
  'Google Places API Key for GMB import functionality',
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  value = '{"api_key": "AIzaSyACysLbv8k6e-IJNl5VnZzyX6oZhLAlVKI"}',
  updated_at = NOW();