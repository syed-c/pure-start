-- Add AIMLAPI key to global_settings table
-- Run this in Supabase Dashboard → SQL Editor

INSERT INTO global_settings (key, value, description, updated_at) 
VALUES (
  'aimlapi',
  '{"api_key": "a3258c5aa5eea747362d201a083a168f", "model": "gpt-4o-mini", "enabled": true}',
  'AIML API Key for AI content generation',
  NOW()
) 
ON CONFLICT (key) DO UPDATE SET 
  value = '{"api_key": "a3258c5aa5eea747362d201a083a168f", "model": "gpt-4o-mini", "enabled": true}',
  updated_at = NOW();

-- Verify
SELECT * FROM global_settings WHERE key = 'aimlapi';