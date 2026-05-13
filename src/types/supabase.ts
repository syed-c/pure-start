/**
 * Database Type Definitions
 *
 * NOTE: This file is a re-export of the auto-generated Supabase types.
 * The canonical source is: src/integrations/supabase/types.ts
 * (generated from the Supabase project schema)
 *
 * Manual additions for fostering-specific types that may not be
 * auto-generated should go in src/types/database.ts
 */

// Re-export everything from the auto-generated types
export type { Database } from '@/integrations/supabase/types';

// Custom/enhanced type overrides for the UK fostering platform
// These extend the auto-generated types with additional fostering-specific fields
export interface Agency extends Database['public']['Tables']['agencies']['Row'] {
  // Extended fostering-specific fields (may exist in DB but aren't auto-detected)
  agency_type?: string | null;
  ofsted_rating?: string | null;
  ofsted_urn?: string | null;
  fostering_types?: string[] | null;
  areas_served?: string[] | null;
  has_therapeutic_team?: boolean | null;
  approved_trainer?: boolean | null;
}

export interface AgencyPhoto {
  id: string;
  agency_id: string;
  photo_type: 'logo' | 'main' | 'gallery' | 'team' | 'facility' | 'other';
  google_photo_name: string | null;
  google_photo_reference: string | null;
  photo_url: string | null;
  local_url: string | null;
  width: number | null;
  height: number | null;
  attribution: string | null;
  is_primary: boolean;
  is_verified: boolean;
  source: string;
  display_order: number;
  imported_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyOpeningHours {
  id: string;
  agency_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  is_24_hours: boolean;
  is_special_hours: boolean;
  special_date: string | null;
  weekday_text: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}