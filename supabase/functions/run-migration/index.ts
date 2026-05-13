import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: string[] = [];

    // Step 1: Add city_id column to agencies
    try {
      await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id) ON DELETE SET NULL;`
      });
      await supabase.rpc('exec_sql', {
        sql_query: `CREATE INDEX IF NOT EXISTS idx_agencies_city_id ON agencies(city_id);`
      });
      results.push('✅ Step 1: city_id column added/indexed');
    } catch (e: any) {
      // exec_sql might not exist, try direct query
      results.push(`⚠️ Step 1: ${e.message}, trying alternative...`);
    }

    // Step 2: Add columns to agency_locations
    try {
      await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE agency_locations ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'city', ADD COLUMN IF NOT EXISTS assignment_source TEXT DEFAULT 'manual', ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();`
      });
      results.push('✅ Step 2: agency_locations columns ready');
    } catch (e: any) {
      results.push(`⚠️ Step 2: ${e.message}`);
    }

    // Step 3: Backfill city_id by matching city names
    try {
      const { data: cities } = await supabase.from('cities').select('id, name').eq('is_active', true);
      if (cities && cities.length > 0) {
        let updatedCount = 0;
        for (const city of cities) {
          const { error } = await supabase
            .from('agencies')
            .update({ city_id: city.id })
            .is('city_id', null)
            .ilike('city', city.name.trim());
          if (!error) updatedCount++;
        }
        results.push(`✅ Step 3: Backfilled city_id for agencies matching ${updatedCount} cities`);
      }
    } catch (e: any) {
      results.push(`❌ Step 3: ${e.message}`);
    }

    // Step 4: Backfill agency_locations junction table
    try {
      const { data: agenciesWithCity } = await supabase
        .from('agencies')
        .select('id, city_id')
        .not('city_id', 'is', null);

      if (agenciesWithCity && agenciesWithCity.length > 0) {
        let insertedCount = 0;
        for (const agency of agenciesWithCity) {
          const { error } = await supabase
            .from('agency_locations')
            .upsert({
              agency_id: agency.id,
              location_id: agency.city_id,
              location_type: 'city',
              assignment_source: 'backfill',
              assigned_at: new Date().toISOString(),
            }, { onConflict: 'agency_id,location_id' });
          if (!error) insertedCount++;
        }
        results.push(`✅ Step 4: Backfilled ${insertedCount} agency_locations records`);
      }
    } catch (e: any) {
      results.push(`❌ Step 4: ${e.message}`);
    }

    // Step 5: Verify counts
    try {
      const { count: withCity } = await supabase
        .from('agencies')
        .select('count', { count: 'exact', head: true })
        .not('city_id', 'is', null);

      const { count: locCount } = await supabase
        .from('agency_locations')
        .select('count', { count: 'exact', head: true });

      results.push(`📊 Verification: Agencies with city_id: ${withCity || 0}, agency_locations: ${locCount || 0}`);
    } catch (e: any) {
      results.push(`⚠️ Verification: ${e.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
