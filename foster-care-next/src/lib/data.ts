import { supabase } from './supabase';

export interface FosteringCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
}

export interface State {
  id: string;
  name: string;
  slug: string;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  review_count: number;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published_at: string;
  image_url: string;
}

const fallbackCategories: Record<string, FosteringCategory> = {
  'short-term-fostering': { id: 'short-term', name: 'Short-Term Fostering', slug: 'short-term-fostering', description: 'Short-term fostering provides temporary care for children who need a safe home for a limited period.' },
  'long-term-fostering': { id: 'long-term', name: 'Long-Term Fostering', slug: 'long-term-fostering', description: 'Long-term fostering provides permanent care for children who cannot return to their birth family.' },
  'emergency-fostering': { id: 'emergency', name: 'Emergency Fostering', slug: 'emergency-fostering', description: 'Emergency fostering provides immediate, short-term care for children in crisis situations.' },
  'therapeutic-fostering': { id: 'therapeutic', name: 'Therapeutic Fostering', slug: 'therapeutic-fostering', description: 'Therapeutic fostering provides specialist care for children with complex emotional and behavioral needs.' },
  'respite-fostering': { id: 'respite', name: 'Respite Fostering', slug: 'respite-fostering', description: 'Respite fostering provides short breaks for existing foster families or birth families.' },
  'parent-and-child-fostering': { id: 'parent-child', name: 'Parent & Child Fostering', slug: 'parent-and-child-fostering', description: 'Parent and child fostering allows a parent to live with their child while receiving support.' },
  'disability-fostering': { id: 'disability', name: 'Disability Fostering', slug: 'disability-fostering', description: 'Disability fostering provides care for children with physical or learning disabilities.' },
  'kinship-fostering': { id: 'kinship', name: 'Kinship Fostering', slug: 'kinship-fostering', description: 'Kinship fostering is care provided by family members or close connections.' },
};

export async function getFosteringCategories(): Promise<FosteringCategory[]> {
  const { data, error } = await supabase
    .from('treatments')
    .select('id, name, slug, description')
    .eq('is_active', true)
    .order('display_order');
  
  if (error || !data || data.length === 0) {
    return Object.values(fallbackCategories);
  }
  
  return data;
}

export async function getFosteringCategory(slug: string): Promise<FosteringCategory | null> {
  const { data, error } = await supabase
    .from('treatments')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error || !data) {
    return fallbackCategories[slug] || null;
  }
  
  return data;
}

export async function getCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')
    .limit(50);
  
  if (error || !data || data.length === 0) {
    return [
      { id: '1', name: 'London', slug: 'london' },
      { id: '2', name: 'Birmingham', slug: 'birmingham' },
      { id: '3', name: 'Manchester', slug: 'manchester' },
      { id: '4', name: 'Leeds', slug: 'leeds' },
      { id: '5', name: 'Glasgow', slug: 'glasgow' },
      { id: '6', name: 'Liverpool', slug: 'liverpool' },
      { id: '7', name: 'Sheffield', slug: 'sheffield' },
      { id: '8', name: 'Bristol', slug: 'bristol' },
    ];
  }
  
  return data;
}

export async function getCity(slug: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error || !data) {
    const fallbackCities: Record<string, City> = {
      london: { id: '1', name: 'London', slug: 'london' },
      birmingham: { id: '2', name: 'Birmingham', slug: 'birmingham' },
      manchester: { id: '3', name: 'Manchester', slug: 'manchester' },
      leeds: { id: '4', name: 'Leeds', slug: 'leeds' },
      glasgow: { id: '5', name: 'Glasgow', slug: 'glasgow' },
      liverpool: { id: '6', name: 'Liverpool', slug: 'liverpool' },
    };
    return fallbackCities[slug] || null;
  }
  
  return data;
}

export async function getAgenciesByCity(cityName: string): Promise<Agency[]> {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .ilike('city', `%${cityName}%`)
    .order('rating', { ascending: false })
    .limit(50);
  
  if (error || !data || data.length === 0) {
    return [];
  }
  
  return data;
}

export async function getAgenciesByCategoryAndCity(categorySlug: string, citySlug: string): Promise<Agency[]> {
  const city = await getCity(citySlug);
  if (!city) return [];
  
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .ilike('city', `%${city.name}%`)
    .order('rating', { ascending: false })
    .limit(50);
  
  if (error || !data || data.length === 0) {
    return [];
  }
  
  return data;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(20);
  
  if (error || !data || data.length === 0) {
    return [];
  }
  
  return data;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  
  if (error || !data) {
    return null;
  }
  
  return data;
}