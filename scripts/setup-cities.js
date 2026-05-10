/**
 * Setup script to populate cities and services from activeRegions config
 * Run this once to sync all cities into the database
 */
import { createClient } from '@supabase/supabase-js';
import { POPULAR_CITIES, FOSTERING_CATEGORIES } from '../src/lib/constants/activeRegions';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fpqncgqmhbbnjhnirg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log('=== Setting up Cities and Services ===\n');

  // 1. Get England state ID
  const { data: englandState } = await supabase
    .from('states')
    .select('id, slug')
    .eq('slug', 'england')
    .single();

  if (!englandState) {
    console.log('Creating England state...');
    const { data: newState } = await supabase
      .from('states')
      .insert({ name: 'England', slug: 'england', abbreviation: 'ENG', is_active: true })
      .select()
      .single();
    englandState.id = newState?.id;
  }

  const stateId = englandState?.id;
  console.log(`England state ID: ${stateId}`);

  // 2. Get existing cities
  const { data: existingCities } = await supabase
    .from('cities')
    .select('slug, name');

  const existingSlugs = new Set(existingCities?.map(c => c.slug) || []);
  console.log(`Existing cities: ${existingSlugs.size}`);

  // 3. Prepare cities to insert
  const citiesToInsert = [];

  for (const city of POPULAR_CITIES) {
    if (!existingSlugs.has(city.slug)) {
      citiesToInsert.push({
        name: city.name,
        slug: city.slug,
        state_id: stateId,
        is_active: true,
      });
    }
  }

  console.log(`New cities to insert: ${citiesToInsert.length}`);

  if (citiesToInsert.length > 0) {
    const { error } = await supabase
      .from('cities')
      .insert(citiesToInsert);

    if (error) {
      console.error('Error inserting cities:', error.message);
    } else {
      console.log('✓ Cities inserted successfully');
    }
  }

  // 4. Check services/categories
  const { data: existingCats } = await supabase
    .from('fostering_categories')
    .select('slug');

  const existingCatSlugs = new Set(existingCats?.map(c => c.slug) || []);
  console.log(`\nExisting categories: ${existingCatSlugs.size}`);

  // 5. Prepare categories to insert
  const catsToInsert = FOSTERING_CATEGORIES
    .filter(c => !existingCatSlugs.has(c.slug))
    .map(c => ({
      name: c.name,
      slug: c.slug,
      description: c.description || null,
      is_active: true,
    }));

  console.log(`New categories to insert: ${catsToInsert.length}`);

  if (catsToInsert.length > 0) {
    const { error } = await supabase
      .from('fostering_categories')
      .insert(catsToInsert);

    if (error) {
      console.error('Error inserting categories:', error.message);
    } else {
      console.log('✓ Categories inserted successfully');
    }
  }

  // 6. Verify counts
  const { count: cityCount } = await supabase
    .from('cities')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: catCount } = await supabase
    .from('fostering_categories')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log(`\n=== Final Stats ===`);
  console.log(`Active cities: ${cityCount}`);
  console.log(`Active categories: ${catCount}`);

  console.log('\n✓ Setup complete!');
}

setup().catch(console.error);