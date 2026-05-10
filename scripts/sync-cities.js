/**
 * Setup script to populate cities from POPULAR_CITIES config
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vcvvtklbyvdbysfdbnfp.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOizdXBhYmFzZSIsInJlZiI6InZjdnZ0a2xieXZkYnlzZmRibmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3Mzg3NCwiZXhwIjoyMDc3MTQ5ODc0fQ.KV1k56566JlPRlDHs613vsCqSyibpaLG4oY_hTt39fs';

const POPULAR_CITIES = [
  { name: 'London', slug: 'london' },
  { name: 'Birmingham', slug: 'birmingham' },
  { name: 'Manchester', slug: 'manchester' },
  { name: 'Leeds', slug: 'leeds' },
  { name: 'Liverpool', slug: 'liverpool' },
  { name: 'Bristol', slug: 'bristol' },
  { name: 'Sheffield', slug: 'sheffield' },
  { name: 'Newcastle', slug: 'newcastle' },
  { name: 'Nottingham', slug: 'nottingham' },
  { name: 'Southampton', slug: 'southampton' },
  { name: 'Oxford', slug: 'oxford' },
  { name: 'Cambridge', slug: 'cambridge' },
  { name: 'Brighton', slug: 'brighton' },
  { name: 'Leicester', slug: 'leicester' },
  { name: 'Coventry', slug: 'coventry' },
  { name: 'Plymouth', slug: 'plymouth' },
  { name: 'Reading', slug: 'reading' },
  { name: 'Norwich', slug: 'norwich' },
  { name: 'Derby', slug: 'derby' },
  { name: 'Hull', slug: 'hull' },
  { name: 'Portsmouth', slug: 'portsmouth' },
  { name: 'Luton', slug: 'luton' },
  { name: 'Milton Keynes', slug: 'milton-keynes' },
  { name: 'Wolverhampton', slug: 'wolverhampton' },
  { name: 'Sunderland', slug: 'sunderland' },
  { name: 'Walsall', slug: 'walsall' },
  { name: 'Oldham', slug: 'oldham' },
  { name: 'Wigan', slug: 'wigan' },
  { name: 'Stoke-on-Trent', slug: 'stoke-on-trent' },
  { name: 'Warrington', slug: 'warrington' },
  { name: 'Bradford', slug: 'bradford' },
  { name: 'Stoke', slug: 'stoke' },
  { name: 'York', slug: 'york' },
  { name: 'Swansea', slug: 'swansea' },
  { name: 'Bournemouth', slug: 'bournemouth' },
  { name: 'Southend', slug: 'southend' },
  { name: 'Swindon', slug: 'swindon' },
  { name: 'Salford', slug: 'salford' },
  { name: 'Preston', slug: 'preston' },
  { name: 'Royal Leamington Spa', slug: 'royal-leamington-spa' },
  { name: 'Watford', slug: 'watford' },
  { name: 'Edinburgh', slug: 'edinburgh' },
  { name: 'Glasgow', slug: 'glasgow' },
  { name: 'Cardiff', slug: 'cardiff' },
  { name: 'Belfast', slug: 'belfast' },
  { name: 'Exeter', slug: 'exeter' },
  { name: 'Chelmsford', slug: 'chelmsford' },
  { name: 'Maidstone', slug: 'maidstone' },
  { name: 'Colchester', slug: 'colchester' },
  { name: 'Cheltenham', slug: 'cheltenham' },
  { name: 'Guildford', slug: 'guildford' },
  { name: 'Basingstoke', slug: 'basingstoke' },
  { name: 'Maidenhead', slug: 'maidenhead' },
  { name: 'Windsor', slug: 'windsor' },
  { name: 'Bath', slug: 'bath' },
  { name: 'Hatfield', slug: 'hatfield' },
  { name: 'Welwyn Garden City', slug: 'welwyn-garden-city' },
  { name: 'Dartford', slug: 'dartford' },
  { name: 'Gravesend', slug: 'gravesend' },
  { name: 'Tonbridge', slug: 'tonbridge' },
  { name: 'Tunbridge Wells', slug: 'tunbridge-wells' },
  { name: 'Bromley', slug: 'bromley' },
  { name: 'Croydon', slug: 'croydon' },
  { name: 'Sutton', slug: 'sutton' },
  { name: 'Kingston upon Thames', slug: 'kingston-upon-thames' },
  { name: 'Richmond', slug: 'richmond' },
  { name: 'Hounslow', slug: 'hounslow' },
  { name: 'Harrow', slug: 'harrow' },
  { name: 'Enfield', slug: 'enfield' },
  { name: 'Barnet', slug: 'barnet' }
];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setup() {
  console.log('=== Setting up Cities ===\n');

  const ENG_STATE_ID = '389e1c08-af73-438f-98b9-07a6af29068a';

  const { data: existingCities } = await supabase.from('cities').select('slug');
  const existingSlugs = new Set(existingCities?.map(c => c.slug) || []);
  console.log(`Existing cities: ${existingSlugs.size}`);

  const citiesToInsert = POPULAR_CITIES
    .filter(city => !existingSlugs.has(city.slug))
    .map(city => ({
      name: city.name,
      slug: city.slug,
      state_id: ENG_STATE_ID,
      is_active: true,
    }));

  console.log(`New cities to insert: ${citiesToInsert.length}`);
  if (citiesToInsert.length > 0) {
    console.log('Cities:', citiesToInsert.map(c => c.name).join(', '));
    
    const { error } = await supabase.from('cities').insert(citiesToInsert);
    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('✓ Cities inserted');
    }
  }

  const { count } = await supabase.from('cities').select('*', { count: 'exact', head: true });
  console.log(`Total cities: ${count}`);
}

setup().catch(console.error);