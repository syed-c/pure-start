import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createAuditLog } from '@/lib/audit';
import { toast } from 'sonner';

export interface PageContent {
  id: string;
  page_type: string;
  page_slug: string;
  reference_id: string | null;
  
  // SEO
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  og_image: string | null;
  noindex: boolean;
  
  // Hero
  h1: string | null;
  hero_subtitle: string | null;
  hero_intro: string | null;
  hero_image: string | null;
  hero_stats: Array<{ label: string; value: string }> | null;
  
  // Content sections
  section_1_title: string | null;
  section_1_content: string | null;
  section_2_title: string | null;
  section_2_content: string | null;
  section_3_title: string | null;
  section_3_content: string | null;
  body_content: string | null;
  cta_text: string | null;
  cta_button_text: string | null;
  cta_button_url: string | null;
  
  // FAQ
  faqs: Array<{ question: string; answer: string }> | null;
  
  // Media
  featured_image: string | null;
  gallery_images: string[] | null;
  
  // Status
  is_published: boolean;
  
  created_at: string;
  updated_at: string;
}

export function usePageContent(pageSlug: string) {
  return useQuery({
    queryKey: ['page-content', pageSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .maybeSingle();
      
      if (error) throw error;
      return data as unknown as PageContent | null;
    },
    enabled: !!pageSlug,
  });
}

export function useAllPageContent(filters: { pageType?: string } = {}) {
  return useQuery({
    queryKey: ['all-page-content', filters],
    queryFn: async () => {
      let query = supabase
        .from('page_content')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (filters.pageType) {
        query = query.eq('page_type', filters.pageType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as PageContent[];
    },
  });
}

export function useUpsertPageContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: Partial<PageContent> & { page_slug: string; page_type: string }) => {
      const { data: existing } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', content.page_slug)
        .maybeSingle();
      
      if (existing) {
        const { error } = await supabase
          .from('page_content')
          .update({
            ...content,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', existing.id);
        
        if (error) throw error;
        
        await createAuditLog({
          action: 'UPDATE',
          entityType: 'page_content',
          entityId: existing.id,
          newValues: content,
        });
        
        return existing.id;
      } else {
        const { data, error } = await supabase
          .from('page_content')
          .insert([content as never])
          .select('id')
          .single();
        
        if (error) throw error;
        
        await createAuditLog({
          action: 'CREATE',
          entityType: 'page_content',
          entityId: data.id,
          newValues: content,
        });
        
        return data.id;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['page-content', variables.page_slug] });
      queryClient.invalidateQueries({ queryKey: ['all-page-content'] });
      toast.success('Page content saved successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to save: ' + error.message);
    },
  });
}

export function useDeletePageContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('page_content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await createAuditLog({
        action: 'DELETE',
        entityType: 'page_content',
        entityId: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-page-content'] });
      toast.success('Page content deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });
}

// Get default content for a page type based on its entity data
export function getDefaultPageContent(
  pageType: string,
  entityData: Record<string, unknown> | null,
  pageUrl: string
): Partial<PageContent> {
  switch (pageType) {
    case 'state': {
      const stateName = (entityData?.name as string) || 'This Region';
      return {
        page_slug: pageUrl,
        page_type: 'state',
        h1: `Fostering Agencies in ${stateName}`,
        hero_subtitle: `Discover Ofsted-rated fostering agencies across ${stateName}. Browse by city, compare reviews, and start your fostering journey.`,
        hero_intro: '',
        section_1_title: 'Browse by City',
        section_1_content: `Explore cities in ${stateName} to find fostering agencies near you.`,
        section_2_title: 'Fostering Types',
        section_2_content: `Find agencies offering different types of fostering placements in ${stateName}.`,
        body_content: `${stateName} is home to many trusted fostering agencies offering comprehensive support for foster carers. Whether you're interested in emergency, respite, long-term, or therapeutic fostering, our verified network of agencies is here to help you start your journey.`,
        faqs: [
          { question: `How do I find a fostering agency in ${stateName}?`, answer: `Browse our verified list of agencies across ${stateName}. Select your city, then filter by fostering type and rating to find the perfect match.` },
          { question: `Are agencies in ${stateName} Ofsted registered?`, answer: `All agencies on our platform are Ofsted-registered. Profiles with the "Verified" badge have completed our additional verification process.` },
          { question: `How do I become a foster carer in ${stateName}?`, answer: `Contact agencies in ${stateName} through our directory. They will guide you through the assessment process which typically takes 4-6 months.` },
        ],
        is_published: true,
      };
    }
    
    case 'city': {
      const cityName = (entityData?.name as string) || 'This City';
      const stateName = (entityData as any)?.state?.name || '';
      const stateAbbr = (entityData as any)?.state?.abbreviation || '';
      const locationDisplay = stateAbbr ? `${cityName}, ${stateAbbr}` : cityName;
      
      return {
        page_slug: pageUrl,
        page_type: 'city',
        h1: `Fostering Agencies in ${locationDisplay}`,
        hero_subtitle: `Find trusted fostering agencies in ${cityName}. Compare Ofsted-rated agencies, read carer reviews, and start your fostering journey.`,
        hero_intro: '',
        section_1_title: 'Agencies Available',
        section_1_content: `Fostering agencies in ${cityName}`,
        section_2_title: 'About This Area',
        section_2_content: `Fostering in ${cityName}`,
        body_content: `${cityName} is home to many excellent fostering agencies offering a range of placement types. Whether you're interested in emergency fostering, long-term care, or specialist placements, our verified network of agencies in ${cityName} is here to help you find the right fit for your family.`,
        faqs: [
          { question: `How do I find a fostering agency in ${cityName}?`, answer: `Browse our verified list of agencies in ${cityName}. Look for Ofsted ratings, carer reviews, and fostering types that match your interests.` },
          { question: `Are agencies in ${cityName} Ofsted registered?`, answer: `All agencies on our platform are Ofsted-registered. Profiles with the "Verified" badge have completed our additional verification process.` },
          { question: `What fostering allowance can I expect in ${cityName}?`, answer: `Fostering allowances vary by agency and local authority. The national minimum ranges from £132-£187 per week depending on the child's age. Many independent agencies offer enhanced rates.` },
          { question: `How do I become a foster carer in ${cityName}?`, answer: `Contact agencies in ${cityName} through our directory. The assessment process typically takes 4-6 months and includes training, home visits, and panel review.` },
        ],
        is_published: true,
      };
    }
    
    case 'treatment': {
      const treatmentName = (entityData?.name as string) || 'This Fostering Type';
      return {
        page_slug: pageUrl,
        page_type: 'treatment',
        h1: treatmentName,
        hero_subtitle: `Learn about ${treatmentName.toLowerCase()} and find qualified agencies near you.`,
        section_1_title: 'What is it?',
        section_1_content: (entityData?.description as string) || `Information about ${treatmentName.toLowerCase()}.`,
        section_2_title: 'Find an Agency',
        section_2_content: `Find agencies that specialise in ${treatmentName.toLowerCase()}.`,
        faqs: [
          { question: `What is ${treatmentName}?`, answer: `${treatmentName} is a type of fostering placement designed to provide specific care and support for children with particular needs.` },
          { question: `What support do ${treatmentName} carers receive?`, answer: `Carers receive comprehensive training, 24/7 support, and competitive fostering allowances. Specific support varies by agency.` },
        ],
        is_published: true,
      };
    }
    
    default:
      return {
        page_slug: pageUrl,
        page_type: pageType,
        h1: (entityData?.name as string) || 'Page Title',
        hero_subtitle: '',
        faqs: [],
        is_published: true,
      };
  }
}
