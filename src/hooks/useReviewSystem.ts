import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types - using extended types that match both old and new schema
export interface ReviewRequest {
  id: string;
  clinic_id: string;
  dentist_id?: string | null;
  patient_id: string | null;
  patient_name?: string | null;
  patient_email?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  channel: string;
  status: string;
  short_code?: string | null;
  sent_at: string | null;
  opened_at?: string | null;
  completed_at?: string | null;
  expires_at?: string | null;
  outcome?: string | null;
  google_redirect_clicked?: boolean;
  created_at: string;
  updated_at?: string;
  clinic?: { id: string; name: string; slug: string; google_place_id?: string; cover_image_url?: string };
}

export interface ReviewClick {
  id: string;
  request_id: string | null;
  clinic_id: string;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface InternalReview {
  id: string;
  clinic_id: string;
  dentist_id: string | null;
  patient_id: string | null;
  request_id: string | null;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  rating: number;
  comment: string | null;
  status: 'new' | 'acknowledged' | 'follow_up' | 'resolved' | 'flagged_fake';
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  is_fake_suspected: boolean;
  fake_review_reason: string | null;
  ai_suggested_response: string | null;
  created_at: string;
  updated_at: string;
  clinic?: { id: string; name: string };
}

export interface GoogleReview {
  id: string;
  clinic_id: string;
  request_id: string | null;
  google_review_id: string | null;
  author_name: string;
  author_photo_url: string | null;
  rating: number;
  text_content: string | null;
  review_time: string | null;
  reply_text: string | null;
  reply_time: string | null;
  is_matched_to_request: boolean;
  matched_at: string | null;
  ai_suggested_reply: string | null;
  reply_status: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
  clinic?: { id: string; name: string };
}

export interface ReputationKPI {
  id: string;
  clinic_id: string;
  date: string;
  requests_sent: number;
  links_opened: number;
  positive_intents: number;
  negative_intents: number;
  google_redirects: number;
  google_reviews_received: number;
  internal_feedbacks: number;
  avg_google_rating: number | null;
  total_google_reviews: number;
  response_rate: number;
  avg_resolution_time_hours: number | null;
  created_at: string;
}

// Hooks for Review Requests
export function useReviewRequests(agencyId?: string) {
  return useQuery({
    queryKey: ['review-requests', agencyId],
    queryFn: async () => {
      let query = supabase
        .from('review_requests')
        .select(`
          *,
          agency:agencies(id, name, slug)
        `)
        .order('created_at', { ascending: false });
      
      if (agencyId) {
        query = query.eq('agency_id', agencyId);
      }
      
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return (data || []) as unknown as ReviewRequest[];
    },
  });
}

export function useReviewRequestByCode(shortCode: string) {
  return useQuery({
    queryKey: ['review-request-code', shortCode],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('review_requests')
        .select(`
          *,
          agency:agencies(id, name, slug, google_place_id, cover_image_url)
        `)
        .eq('short_code', shortCode)
        .single();
      
      if (error) throw error;
      return data as unknown as ReviewRequest;
    },
    enabled: !!shortCode,
  });
}

export function useCreateReviewRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: {
      clinic_id: string;
      dentist_id?: string;
      patient_id?: string;
      patient_name?: string;
      patient_email?: string;
      recipient_phone?: string;
      channel: string;
    }) => {
      const { data, error } = await supabase
        .from('review_requests')
        .insert({
          ...request,
          recipient_name: request.patient_name,
          recipient_phone: request.recipient_phone || '',
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-requests'] });
      toast.success('Review request created');
    },
    onError: (error) => {
      toast.error('Failed to create request: ' + error.message);
    },
  });
}

export function useUpdateReviewRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('review_requests')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-requests'] });
    },
  });
}

// Hooks for Review Clicks (Tracking)
export function useReviewClicks(agencyId?: string) {
  return useQuery({
    queryKey: ['review-clicks', agencyId],
    queryFn: async () => {
      let query = supabase
        .from('review_clicks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (agencyId) {
        query = query.eq('agency_id', agencyId);
      }
      
      const { data, error } = await query.limit(500);
      if (error) throw error;
      return (data || []) as unknown as ReviewClick[];
    },
  });
}

export function useRecordClick() {
  return useMutation({
    mutationFn: async (click: {
      request_id?: string;
      clinic_id: string;
      action: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('review_clicks')
        .insert({
          ...click,
          user_agent: navigator.userAgent,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
}

// Hooks for Internal Reviews
export function useInternalReviews(agencyId?: string, status?: string) {
  return useQuery({
    queryKey: ['internal-reviews', agencyId, status],
    queryFn: async () => {
      let query = supabase
        .from('internal_reviews')
        .select('*, clinic:clinics!inner(id, name, slug)')
        .order('created_at', { ascending: false });
      
      if (agencyId) {
        query = query.eq('agency_id', agencyId);
      }
      if (status) {
        query = query.eq('status', status as any);
      }
      
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return (data || []) as unknown as InternalReview[];
    },
  });
}

export function useCreateInternalReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: {
      clinic_id: string;
      dentist_id?: string;
      patient_id?: string;
      request_id?: string;
      patient_name: string;
      patient_email?: string;
      patient_phone?: string;
      rating: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from('internal_reviews')
        .insert(review as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-reviews'] });
    },
  });
}

export function useUpdateInternalReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InternalReview>) => {
      const { data, error } = await supabase
        .from('internal_reviews')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-reviews'] });
      toast.success('Review updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });
}

// Hooks for Google Reviews
export function useGoogleReviews(agencyId?: string) {
  return useQuery({
    queryKey: ['google-reviews', agencyId],
    queryFn: async () => {
      let query = supabase
        .from('google_reviews')
        .select('*')
        .order('review_time', { ascending: false });
      
      if (agencyId) {
        query = query.eq('agency_id', agencyId);
      }
      
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return (data || []) as unknown as GoogleReview[];
    },
  });
}

// Hooks for Reputation KPIs
export function useReputationKPIs(agencyId: string, days: number = 30) {
  return useQuery({
    queryKey: ['reputation-kpis', agencyId, days],
    queryFn: async () => {
      const startDate = subDays(new Date(), days).toISOString();
      
      const { data, error } = await supabase
        .from('profile_analytics')
        .select('event_type, created_at')
        .eq('agency_id', agencyId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!agencyId,
  });
}

export function useAggregatedKPIs(agencyId: string) {
  const { data: requests } = useReviewRequests(agencyId);
  const { data: clicks } = useReviewClicks(agencyId);
  const { data: internalReviews } = useInternalReviews(agencyId);
  const { data: googleReviews } = useGoogleReviews(agencyId);
  
  const kpis = {
    // Request metrics
    totalRequestsSent: requests?.filter(r => r.status !== 'pending').length || 0,
    requestsOpened: requests?.filter(r => r.opened_at).length || 0,
    requestsCompleted: requests?.filter(r => r.completed_at).length || 0,
    
    // Click metrics
    totalClicks: clicks?.length || 0,
    linkOpens: clicks?.filter(c => c.action === 'link_opened').length || 0,
    thumbsUpClicks: clicks?.filter(c => c.action === 'thumbs_up').length || 0,
    thumbsDownClicks: clicks?.filter(c => c.action === 'thumbs_down').length || 0,
    googleRedirects: clicks?.filter(c => c.action === 'google_redirect').length || 0,
    
    // Review metrics
    totalInternalReviews: internalReviews?.length || 0,
    newInternalReviews: internalReviews?.filter(r => r.status === 'new').length || 0,
    resolvedInternalReviews: internalReviews?.filter(r => r.status === 'resolved').length || 0,
    avgInternalRating: internalReviews?.length 
      ? internalReviews.reduce((sum, r) => sum + r.rating, 0) / internalReviews.length 
      : 0,
    
    // Google metrics
    totalGoogleReviews: googleReviews?.length || 0,
    avgGoogleRating: googleReviews?.length 
      ? googleReviews.reduce((sum, r) => sum + r.rating, 0) / googleReviews.length 
      : 0,
    pendingReplies: googleReviews?.filter(r => r.reply_status === 'pending').length || 0,
    
    // Calculated rates
    openRate: requests?.length 
      ? ((requests.filter(r => r.opened_at).length / requests.length) * 100).toFixed(1) 
      : '0',
    positiveRate: clicks?.filter(c => ['thumbs_up', 'thumbs_down'].includes(c.action)).length
      ? ((clicks.filter(c => c.action === 'thumbs_up').length / 
          clicks.filter(c => ['thumbs_up', 'thumbs_down'].includes(c.action)).length) * 100).toFixed(1)
      : '0',
    googleConversionRate: clicks?.filter(c => c.action === 'thumbs_up').length
      ? ((clicks.filter(c => c.action === 'google_redirect').length / 
          clicks.filter(c => c.action === 'thumbs_up').length) * 100).toFixed(1)
      : '0',
  };
  
  return kpis;
}

// Admin-level hooks for platform-wide visibility
export function useAllReviewRequests() {
  return useQuery({
    queryKey: ['all-review-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_requests')
        .select(`
          *,
          agency:agencies(id, name, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return (data || []) as unknown as ReviewRequest[];
    },
  });
}

export function useAllInternalReviews() {
  return useQuery({
    queryKey: ['all-internal-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_reviews')
        .select(`
          *,
          agency:agencies(id, name, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return (data || []) as unknown as InternalReview[];
    },
  });
}

export function useAllReviewClicks() {
  return useQuery({
    queryKey: ['all-review-clicks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_clicks')
        .select(`
          *,
          agency:agencies(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(50000);
      
      if (error) throw error;
      return (data || []) as unknown as ReviewClick[];
    },
  });
}
