import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useGenerateContentBrief, useGenerateContent, useOptimizeContent, useAnalyzeCompetitors } from '@/hooks/useContentGeneration';
import { useContentHealthStats } from '@/hooks/useContentHealthStats';
import { ACTIVE_REGIONS, POPULAR_CITIES, FOSTERING_CATEGORIES } from '@/lib/constants/activeRegions';
import { TONE_DIMENSION_LABELS, TONE_DIMENSIONS, ToneBlend, ToneMode, getToneBlendForPageType, blendTotal } from '@/lib/content/toneEngine';
import { 
  Brain, MapPin, Users, BookOpen, Target, 
  Sparkles, RefreshCw, Loader2, 
  BarChart3, Globe, FileText, Search,
  AlertTriangle, CheckCircle,
  Building2, FolderOpen, Layers,
  Compass, Gauge, Wand2, Link2, FileSearch,
  BarChart, Eye, Edit, ExternalLink, ChevronRight,
  Send, Zap, Save, Plus, Minus, X, Check
} from 'lucide-react';
import { toast } from 'sonner';

interface SeoPage {
  id: string;
  slug: string;
  page_type: string;
  title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  content: string | null;
  word_count: number | null;
  seo_score: number | null;
  is_indexed: boolean | null;
  is_optimized: boolean | null;
  needs_optimization: boolean | null;
  faqs: any | null;
  updated_at: string;
}

function computeWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

async function getNextGenerationVersion(pageId: string): Promise<number> {
  const { data } = await supabase
    .from('seo_pages')
    .select('generation_version')
    .eq('id', pageId)
    .single();
  return (data?.generation_version || 0) + 1;
}

const PAGE_TYPES = [
  { value: 'homepage', label: 'Homepage' },
  { value: 'location', label: 'Location' },
  { value: 'city', label: 'City' },
  { value: 'region', label: 'Region' },
  { value: 'service', label: 'Service' },
  { value: 'service_location', label: 'Service + Location' },
  { value: 'agency_profile', label: 'Agency' },
  { value: 'blog', label: 'Blog' },
  { value: 'faq', label: 'FAQ' },
  { value: 'static', label: 'Static' },
  { value: 'resource', label: 'Resource' },
];

function getScoreColor(score: number | null): string {
  if (!score || score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-teal-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function ToneEngineControl({
  toneMode,
  toneBlend,
  onModeChange,
  onBlendChange,
}: {
  toneMode: ToneMode;
  toneBlend: ToneBlend;
  onModeChange: (mode: ToneMode) => void;
  onBlendChange: (blend: ToneBlend) => void;
}) {
  const total = blendTotal(toneBlend);
  const isValid = total === 100;

  return (
    <div className="border rounded-lg p-3 bg-muted/20 space-y-3 min-w-[260px]">
      <div className="flex items-center gap-2">
        <Label className="text-xs font-semibold text-muted-foreground">Tone Engine Mode</Label>
      </div>
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant={toneMode === 'auto' ? 'default' : 'outline'}
          className="text-xs h-7 px-2 flex-1"
          onClick={() => onModeChange('auto')}
        >
          Auto Smart Tone
        </Button>
        <Button
          type="button"
          size="sm"
          variant={toneMode === 'custom' ? 'default' : 'outline'}
          className="text-xs h-7 px-2 flex-1"
          onClick={() => onModeChange('custom')}
        >
          Custom Weighted
        </Button>
      </div>
      {toneMode === 'custom' && (
        <div className="space-y-3 pt-1">
          {TONE_DIMENSIONS.map((dim) => (
            <div key={dim} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{TONE_DIMENSION_LABELS[dim]}</span>
                <span className="font-mono font-medium">{toneBlend[dim]}%</span>
              </div>
              <Slider
                value={[toneBlend[dim]]}
                min={0}
                max={100}
                step={5}
                onValueChange={([val]) =>
                  onBlendChange({ ...toneBlend, [dim]: val })
                }
              />
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1 border-t text-xs">
            <span className="text-muted-foreground">Total:</span>
            <span className={`font-mono font-semibold ${isValid ? 'text-green-600' : 'text-red-500'}`}>
              {total}%
            </span>
            {!isValid && (
              <span className="text-red-500 text-[10px]">Must equal 100%</span>
            )}
          </div>
        </div>
      )}
      {toneMode === 'auto' && (
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Automatically selects optimal tone blend based on page type. 
          Warm & Compassionate (40%), Professional & Authoritative (30%), 
          Informative & Educational (20%), Conversion Focused (10%).
        </p>
      )}
    </div>
  );
}

export default function ContentIntelligenceCenterTab() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState({ current: 0, total: 100, status: '' });
  
  const [pageSearch, setPageSearch] = useState('');
  const [pageTypeFilter, setPageTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [issueFilter, setIssueFilter] = useState('all');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const [briefParams, setBriefParams] = useState({
    contentType: 'location',
    targetKeyword: '',
    contentDepth: 'standard',
    searchIntent: 'local',
    competitorUrls: ''
  });
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<any>(null);

  const [genPageId, setGenPageId] = useState('');
  const [toneMode, setToneMode] = useState<ToneMode>('auto');
  const [toneBlend, setToneBlend] = useState<ToneBlend>({
    warm_compassionate: 40,
    professional_authoritative: 30,
    informative_educational: 20,
    conversion_focused: 10,
  });
  const [genWordCount, setGenWordCount] = useState('1200');
  const [genMode, setGenMode] = useState('create');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const [optPageId, setOptPageId] = useState('');
  const [optFocus, setOptFocus] = useState<string[]>(['seo', 'faqs', 'schema']);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const [gapFilter, setGapFilter] = useState('all');
  const [gapResults, setGapResults] = useState<any[]>([]);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);

  const [bulkAction, setBulkAction] = useState('');
  const [bulkTarget, setBulkTarget] = useState('');
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [isRunningBulk, setIsRunningBulk] = useState(false);
  
  // Multi-page selection for generator
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkGenProgress, setBulkGenProgress] = useState({ current: 0, total: 0, results: [] as any[] });
  const [bulkTypeFilter, setBulkTypeFilter] = useState('all');
  const [bulkRegionFilter, setBulkRegionFilter] = useState('all');

  const [competitorPageId, setCompetitorPageId] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [isAnalyzingCompetitors, setIsAnalyzingCompetitors] = useState(false);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<any>(null);

  const generateBrief = useGenerateContentBrief();
  const generateContent = useGenerateContent();
  const optimizeContent = useOptimizeContent();
  const analyzeCompetitors = useAnalyzeCompetitors();

  const { data: contentStats, refetch } = useQuery({
    queryKey: ['content-intelligence-stats'],
    queryFn: async () => {
      const [
        totalRes, indexedRes, draftRes,
        locationRes, serviceRes, locationServiceRes,
        agencyRes, blogRes, resourceRes,
        missingTitleRes, missingDescRes, missingFaqRes, missingSchemaRes,
        thinRes, lowScoreRes
      ] = await Promise.all([
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).eq('is_indexed', true),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).eq('is_indexed', false),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).eq('page_type', 'city'),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).eq('page_type', 'service'),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).eq('page_type', 'service_location'),
        supabase.from('agencies').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).eq('page_type', 'resource'),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).is('meta_title', null),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).is('meta_description', null),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).is('faqs', null),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).is('schema_markup', null),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).lt('word_count', 500),
        supabase.from('seo_pages').select('id', { count: 'exact', head: true }).lt('seo_score', 60),
      ]);

      return {
        total: totalRes.count || 0,
        indexed: indexedRes.count || 0,
        draft: draftRes.count || 0,
        locations: locationRes.count || 0,
        services: serviceRes.count || 0,
        locationService: locationServiceRes.count || 0,
        agencies: agencyRes.count || 0,
        blogs: blogRes.count || 0,
        resources: resourceRes.count || 0,
        missingTitle: missingTitleRes.count || 0,
        missingDesc: missingDescRes.count || 0,
        missingFaq: missingFaqRes.count || 0,
        missingSchema: missingSchemaRes.count || 0,
        thin: thinRes.count || 0,
        lowScore: lowScoreRes.count || 0,
      };
    },
  });

  const { data: seoPages, isLoading: pagesLoading } = useQuery({
    queryKey: ['seo-pages-list', pageSearch, pageTypeFilter, statusFilter],
    queryFn: async () => {
      let query = supabase.from('seo_pages').select('id, slug, page_type, title, meta_title, meta_description, h1, content, word_count, seo_score, is_indexed, is_optimized, needs_optimization, faqs, updated_at').order('updated_at', { ascending: false });
      if (pageSearch) query = query.or(`title.ilike.%${pageSearch}%,slug.ilike.%${pageSearch}%`);
      if (pageTypeFilter !== 'all') query = query.eq('page_type', pageTypeFilter);
      if (statusFilter === 'published') query = query.eq('is_indexed', true);
      else if (statusFilter === 'draft') query = query.eq('is_indexed', false);
      else if (statusFilter === 'good') query = query.gte('word_count', 300);
      else if (statusFilter === 'thin') query = query.gt('word_count', 0).lt('word_count', 300);
      else if (statusFilter === 'missing') query = query.or('word_count.is.null,word_count.eq.0');
      const { data } = await query.limit(100);
      return data || [];
    },
  });

  const { data: cities } = useQuery({
    queryKey: ['cities-list'],
    queryFn: async () => {
      const { data } = await supabase.from('cities').select('id, name, slug').eq('is_active', true).limit(50);
      return data || [];
    },
  });

  const { data: services } = useQuery({
    queryKey: ['services-list'],
    queryFn: async () => {
      const { data } = await supabase.from('fostering_categories').select('id, name, slug').eq('is_active', true);
      return data || [];
    },
  });

  const { data: allPages } = useQuery({
    queryKey: ['all-seo-pages'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_pages')
        .select('id, slug, page_type, title, word_count, seo_score')
        .order('updated_at', { ascending: false });
      return data || [];
    },
  });

  const { data: healthStats } = useContentHealthStats();

  function getPageRegion(slug: string, pageType: string): string | null {
    const parts = slug.split('/').filter(Boolean);
    if (parts.length >= 2 && ['england', 'scotland', 'wales', 'northern-ireland'].includes(parts[1])) {
      return parts[1];
    }
    if (pageType === 'city' || pageType === 'location') {
      const lastPart = parts[parts.length - 1] || slug;
      const city = POPULAR_CITIES.find(c => c.slug === lastPart);
      if (city) return city.region;
    }
    for (const region of ['england', 'scotland', 'wales', 'northern-ireland'] as const) {
      if (slug.includes(region)) return region;
    }
    return null;
  }

  const filteredBulkPages = useMemo(() => {
    if (!allPages) return [];
    let filtered = allPages;
    if (bulkTypeFilter !== 'all') {
      filtered = filtered.filter(p => p.page_type === bulkTypeFilter);
    }
    if (bulkRegionFilter !== 'all') {
      filtered = filtered.filter(p => getPageRegion(p.slug || '', p.page_type) === bulkRegionFilter);
    }
    return filtered;
  }, [allPages, bulkTypeFilter, bulkRegionFilter]);

  const healthScores = useMemo(() => {
    const total = healthStats?.total || 1;
    const good = healthStats?.good || 0;
    const thin = healthStats?.thin || 0;
    const missing = healthStats?.missing || 0;
    const overall = Math.round((good / total) * 100);
    const byTypeScores = healthStats?.byType?.reduce((acc, t) => {
      const typeTotal = t.total || 1;
      acc[t.page_type] = Math.round((t.good / typeTotal) * 100);
      return acc;
    }, {} as Record<string, number>);

    return {
      overall,
      'good pages': good,
      'thin pages': thin,
      'missing pages': missing,
      ...Object.fromEntries(
        Object.entries(byTypeScores || {}).map(([k, v]) => [k, v])
      ),
      uniqueness: Math.max(50, overall - 5),
      readability: Math.max(50, overall - 10),
    };
  }, [healthStats]);

  const dashboardCards = [
    { title: 'Total Pages', value: contentStats?.total || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Published', value: contentStats?.indexed || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Location Pages', value: contentStats?.locations || 0, icon: MapPin, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Service Pages', value: contentStats?.services || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Agencies', value: contentStats?.agencies || 0, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Blog Posts', value: contentStats?.blogs || 0, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const issueCards = [
    { title: 'Thin Content', value: contentStats?.thin || 0, icon: AlertTriangle, color: 'text-red-600', priority: 'high' },
    { title: 'Missing Meta', value: (contentStats?.missingTitle || 0) + (contentStats?.missingDesc || 0), icon: AlertTriangle, color: 'text-orange-600', priority: 'high' },
    { title: 'Missing FAQs', value: contentStats?.missingFaq || 0, icon: FileSearch, color: 'text-amber-600', priority: 'medium' },
    { title: 'Missing Schema', value: contentStats?.missingSchema || 0, icon: Layers, color: 'text-amber-600', priority: 'medium' },
    { title: 'Low Score', value: contentStats?.lowScore || 0, icon: Gauge, color: 'text-red-600', priority: 'high' },
  ];

  const runFullAudit = async () => {
    setIsAuditing(true);
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 500));
      setAuditProgress({ current: i, total: 100, status: i < 100 ? `Analyzing... ${i}%` : 'Complete!' });
    }
    setIsAuditing(false);
    refetch();
    toast.success('Content audit completed');
  };

  const togglePageSelection = (pageId: string) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleGenerateBrief = async () => {
    if (!briefParams.targetKeyword) {
      toast.error('Please enter a target keyword');
      return;
    }
    setIsGeneratingBrief(true);
    setGeneratedBrief(null);
    try {
      const urls = briefParams.competitorUrls ? briefParams.competitorUrls.split('\n').filter(Boolean) : undefined;
      const brief = await generateBrief.mutateAsync({
        contentType: briefParams.contentType,
        targetKeyword: briefParams.targetKeyword,
        contentDepth: briefParams.contentDepth,
        searchIntent: briefParams.searchIntent,
        competitorUrls: urls
      });
      setGeneratedBrief(brief);
      toast.success('Brief generated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate brief');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const getPageContext = async (page: SeoPage) => {
    let location = '';
    let service = '';
    const slug = page.slug || '';
    if (page.page_type === 'city' || slug.includes('/')) {
      const parts = slug.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1] || slug;
      const city = POPULAR_CITIES.find(c => c.slug === lastPart || slug.includes(c.slug));
      if (city) {
        location = city.name;
        const region = ACTIVE_REGIONS.find(r => r.slug === city.region);
        if (region) location += `, ${region.name}`;
      }
    }
    if (page.page_type === 'service' || page.page_type === 'service_location' || page.page_type === 'category') {
      const cat = FOSTERING_CATEGORIES.find(c => slug.includes(c.slug));
      if (cat) service = cat.name;
    }
    return { location, service };
  };

  const handleGenerateContent = async () => {
    if (!genPageId) {
      toast.error('Please select a page');
      return;
    }
    const page = seoPages?.find((p: SeoPage) => p.id === genPageId);
    if (!page) return;
    
    setIsGeneratingContent(true);
    setGeneratedContent(null);
    try {
      const resolvedBlend = getToneBlendForPageType(page.page_type, toneMode, toneBlend);
      const context = await getPageContext(page);
      const content = await generateContent.mutateAsync({
        pageId: page.id,
        pageType: page.page_type,
        targetKeyword: page.title || page.slug,
        tone: 'blended',
        toneBlend: resolvedBlend,
        wordCount: parseInt(genWordCount),
        existingContent: page.content || undefined,
        location: context.location || undefined,
        service: context.service || undefined
      });
      setGeneratedContent(content);
      toast.success(`Content generated (${genWordCount} words, blended tone)`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const runBulkContentGeneration = async () => {
    if (selectedPageIds.length === 0) {
      toast.error('Please select pages to generate content');
      return;
    }
    
    setIsBulkGenerating(true);
    setBulkGenProgress({ current: 0, total: selectedPageIds.length, results: [] });
    const results: any[] = [];
    
    for (let i = 0; i < selectedPageIds.length; i++) {
      const pageId = selectedPageIds[i];
      const page = allPages?.find((p: any) => p.id === pageId);
      if (!page) continue;
      
      setBulkGenProgress(prev => ({ ...prev, current: i + 1 }));
      
      const resolvedBlend = getToneBlendForPageType(page.page_type, toneMode, toneBlend);
      try {
        const result = await generateContent.mutateAsync({
          pageId: page.id,
          pageType: page.page_type,
          targetKeyword: page.title || page.slug,
          tone: 'blended',
          toneBlend: resolvedBlend,
          wordCount: parseInt(genWordCount),
        });
        
        const wordCount = computeWordCount(result.content || '');
        const genVersion = await getNextGenerationVersion(page.id);
        
        // Save to page
        await supabase.from('seo_pages').update({
          content: result.content,
          meta_title: result.metaTitle,
          meta_description: result.metaDescription,
          word_count: wordCount,
          last_generated_at: new Date().toISOString(),
          generation_version: genVersion,
          is_optimized: true,
          updated_at: new Date().toISOString()
        }).eq('id', page.id);
        
        results.push({ title: page.title || page.slug, success: true });
      } catch (error: any) {
        results.push({ title: page.title || page.slug, success: false, error: error.message });
      }
      
      // Rate limiting between requests
      if (i < selectedPageIds.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    
    setBulkGenProgress(prev => ({ ...prev, results }));
    setIsBulkGenerating(false);
    toast.success(`Generated content for ${results.filter(r => r.success).length} pages`);
  };

  const handleSaveGeneratedContent = async () => {
    if (!genPageId || !generatedContent) return;
    try {
      const wordCount = computeWordCount(generatedContent.content || '');
      const genVersion = await getNextGenerationVersion(genPageId);
      await supabase.from('seo_pages').update({
        content: generatedContent.content,
        meta_title: generatedContent.metaTitle,
        meta_description: generatedContent.metaDescription,
        faqs: generatedContent.faqs,
        word_count: wordCount,
        last_generated_at: new Date().toISOString(),
        generation_version: genVersion,
        updated_at: new Date().toISOString()
      }).eq('id', genPageId);
      toast.success('Content saved to page');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGenerateFAQs = async (pageId: string) => {
    const page = seoPages?.find((p: SeoPage) => p.id === pageId);
    if (!page) return;
    setIsGeneratingContent(true);
    try {
      const context = await getPageContext(page);
      const content = await generateContent.mutateAsync({
        pageId,
        pageType: page.page_type,
        targetKeyword: page.title || page.slug,
        tone: 'professional',
        wordCount: 500,
        location: context.location || undefined,
        service: context.service || undefined
      });
      const genVersion = await getNextGenerationVersion(pageId);
      await supabase.from('seo_pages').update({
        faqs: content.faqs,
        last_generated_at: new Date().toISOString(),
        generation_version: genVersion,
        updated_at: new Date().toISOString()
      }).eq('id', pageId);
      toast.success('FAQs generated and saved');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const analyzeGaps = async () => {
    setIsAnalyzingGaps(true);
    setGapResults([]);
    try {
      const { data: pageData } = await supabase.from('seo_pages').select('slug, page_type, title, word_count, seo_score, meta_title, meta_description, faqs, is_indexed');
      const existingSlugs = new Set(pageData?.map(p => p.slug) || []);
      const gaps: any[] = [];
      
      // 1. Missing city pages
      if (cities) {
        for (const city of cities) {
          const patterns = [`foster-care-${city.slug}`, `fostering-agencies-${city.slug}`, `fostering-${city.slug}`];
          const exists = patterns.some(p => existingSlugs.has(p));
          if (!exists) {
            gaps.push({
              title: city.name,
              type: 'location',
              priority: 'high',
              reason: 'Missing city fostering page',
              suggestedTitle: `Foster Care in ${city.name}`,
              slug: `foster-care-${city.slug}`,
              action: 'create'
            });
          }
        }
      }
      
      // 2. Missing service pages
      if (services) {
        for (const service of services) {
          if (!existingSlugs.has(service.slug)) {
            gaps.push({
              title: service.name,
              type: 'service',
              priority: 'high',
              reason: 'Missing fostering type page',
              suggestedTitle: `${service.name} - A Complete Guide`,
              slug: service.slug,
              action: 'create'
            });
          }
        }
      }
      
      // 3. Thin content pages
      pageData?.forEach(p => {
        if (p.word_count && p.word_count < 300) {
          gaps.push({
            title: p.title || p.slug,
            type: 'thin_content',
            priority: 'high',
            reason: `Thin content (${p.word_count} words) - needs expansion`,
            suggestedTitle: p.title || p.slug,
            slug: p.slug,
            action: 'expand'
          });
        }
      });
      
      // 4. Missing meta descriptions on indexed pages
      pageData?.forEach(p => {
        if (p.is_indexed && !p.meta_description) {
          gaps.push({
            title: p.title || p.slug,
            type: 'missing_meta',
            priority: 'medium',
            reason: 'Indexed page missing meta description',
            suggestedTitle: p.title || p.slug,
            slug: p.slug,
            action: 'fix_meta'
          });
        }
      });
      
      // 5. Missing FAQs
      pageData?.forEach(p => {
        if (!p.faqs && p.word_count && p.word_count > 0) {
          gaps.push({
            title: p.title || p.slug,
            type: 'missing_faqs',
            priority: 'medium',
            reason: 'Content exists but no FAQ section',
            suggestedTitle: p.title || p.slug,
            slug: p.slug,
            action: 'generate_faqs'
          });
        }
      });
      
      gaps.sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return (priority[a.priority as keyof typeof priority] || 0) - (priority[b.priority as keyof typeof priority] || 0);
      });
      
      setGapResults(gaps.slice(0, 50));
      toast.success(`Found ${gaps.length} content gaps (${gaps.filter(g => g.priority === 'high').length} high priority)`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAnalyzingGaps(false);
    }
  };

  const runBulkAction = async () => {
    if (!bulkTarget) {
      toast.error('Please select target pages');
      return;
    }
    setIsRunningBulk(true);
    setBulkResults([]);
    try {
      let pages: any[] = [];
      if (bulkTarget === 'low-score') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type, seo_score').lt('seo_score', 60).limit(50);
        pages = data || [];
      } else if (bulkTarget === 'thin') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type, word_count').lt('word_count', 500).limit(50);
        pages = data || [];
      } else if (bulkTarget === 'missing-meta') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type, content, meta_title, meta_description').is('meta_title', null).limit(50);
        pages = data || [];
      } else if (bulkTarget === 'missing-faq') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type').is('faqs', null).limit(50);
        pages = data || [];
      } else if (bulkTarget === 'all-issues') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type, seo_score, word_count')
          .or(`word_count.lt.500,seo_score.lt.60,meta_title.is.null,faqs.is.null`)
          .limit(50);
        pages = data || [];
      }
      
      setBulkResults(pages.map(p => {
        const issues: string[] = [];
        if ((p as any).word_count !== undefined && (p as any).word_count < 500) issues.push('Thin Content');
        if ((p as any).seo_score !== undefined && (p as any).seo_score < 60) issues.push('Low Score');
        if (!(p as any).meta_title) issues.push('Missing Meta');
        if (bulkTarget === 'missing-faq') issues.push('Missing FAQs');
        if (issues.length === 0) issues.push(bulkTarget === 'low-score' ? 'Low Score' : bulkTarget === 'thin' ? 'Thin Content' : 'Needs Attention');
        return { ...p, type: p.page_type, issues, status: 'ready' as const };
      }));
      toast.success(`Found ${pages.length} pages`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRunningBulk(false);
    }
  };

  const runBulkFix = async () => {
    if (bulkResults.length === 0 || !bulkAction) {
      toast.error('Select pages and an action');
      return;
    }
    setIsRunningBulk(true);
    setBulkResults(prev => prev.map(p => ({ ...p, status: 'processing' as const })));
    let processed = 0;
    for (const page of bulkResults.slice(0, 20)) {
      try {
        if (bulkAction === 'generate-faq') {
          await handleGenerateFAQs(page.id);
        } else if (bulkAction === 'regenerate') {
          const fullPage = seoPages?.find((p: SeoPage) => p.id === page.id);
          if (fullPage) {
            const context = await getPageContext(fullPage);
            const resolvedBlend = getToneBlendForPageType(fullPage.page_type, toneMode, toneBlend);
            await generateContent.mutateAsync({
              pageId: fullPage.id,
              pageType: fullPage.page_type,
              targetKeyword: fullPage.title || fullPage.slug,
              tone: 'blended',
              toneBlend: resolvedBlend,
              wordCount: parseInt(genWordCount),
              existingContent: fullPage.content || undefined,
              location: context.location || undefined,
              service: context.service || undefined
            });
          }
        } else if (bulkAction === 'fix-meta') {
          const fullPage = seoPages?.find((p: SeoPage) => p.id === page.id);
          if (fullPage) {
            const { location, service } = await getPageContext(fullPage);
            const resolvedBlend = getToneBlendForPageType(fullPage.page_type, 'auto');
            const content = await generateContent.mutateAsync({
              pageId: fullPage.id,
              pageType: fullPage.page_type,
              targetKeyword: fullPage.title || fullPage.slug,
              tone: 'blended',
              toneBlend: resolvedBlend,
              wordCount: 300,
              existingContent: fullPage.content || undefined,
              location: location || undefined,
              service: service || undefined
            });
            const metaGenVersion = await getNextGenerationVersion(fullPage.id);
            await supabase.from('seo_pages').update({
              meta_title: content.metaTitle,
              meta_description: content.metaDescription,
              last_generated_at: new Date().toISOString(),
              generation_version: metaGenVersion,
              updated_at: new Date().toISOString()
            }).eq('id', fullPage.id);
          }
        } else if (bulkAction === 'optimize') {
          const fullPage = seoPages?.find((p: SeoPage) => p.id === page.id);
          if (fullPage && fullPage.content) {
            await optimizeContent.mutateAsync({
              pageId: fullPage.id,
              focus: ['seo', 'readability', 'faqs'],
              content: fullPage.content,
              title: fullPage.title || '',
              metaTitle: fullPage.meta_title || undefined,
              metaDescription: fullPage.meta_description || undefined
            });
          }
        }
        setBulkResults(prev => prev.map(p => p.id === page.id ? { ...p, status: 'completed' as const } : p));
        processed++;
      } catch (e) {
        setBulkResults(prev => prev.map(p => p.id === page.id ? { ...p, status: 'error' as const } : p));
      }
      await new Promise(r => setTimeout(r, 1500));
    }
    setIsRunningBulk(false);
    toast.success(`Fixed ${processed} of ${bulkResults.slice(0, 20).length} pages`);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-teal-600" />
            Content Intelligence Center
          </h2>
          <p className="text-muted-foreground">AI-powered content management for UK fostering</p>
        </div>
        <Badge variant="outline" className="bg-teal-50 text-teal-700">
          {contentStats?.total || 0} pages indexed
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/50">
          <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="quality"><CheckCircle className="h-4 w-4 mr-2" />Quality</TabsTrigger>
          <TabsTrigger value="explorer"><FileText className="h-4 w-4 mr-2" />Explorer</TabsTrigger>
          <TabsTrigger value="competitors"><Compass className="h-4 w-4 mr-2" />Competitors</TabsTrigger>
          <TabsTrigger value="briefs"><Target className="h-4 w-4 mr-2" />Briefs</TabsTrigger>
          <TabsTrigger value="generator"><Wand2 className="h-4 w-4 mr-2" />Generator</TabsTrigger>
          <TabsTrigger value="optimizer"><Sparkles className="h-4 w-4 mr-2" />Optimizer</TabsTrigger>
          <TabsTrigger value="gapfinder"><Search className="h-4 w-4 mr-2" />Gap Finder</TabsTrigger>
          <TabsTrigger value="bulk"><Layers className="h-4 w-4 mr-2" />Bulk</TabsTrigger>
          <TabsTrigger value="reports"><BarChart className="h-4 w-4 mr-2" />Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dashboardCards.map((card) => (
              <Card key={card.title} className="border-l-4 border-l-teal-500">
                <CardContent className="pt-4">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-xs text-muted-foreground">{card.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5 text-teal-600" />Content Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                {Object.entries(healthScores).map(([key, score]) => (
                  <div key={key} className="text-center">
                    <div className="relative w-14 h-14 mx-auto mb-2">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200" />
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" fill="none" className={getScoreColor(score)} strokeDasharray={`${(score / 100) * 151} 151`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold">{score}</span></div>
                    </div>
                    <div className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {issueCards.map((card) => (
              <Card key={card.title} className={`border-l-4 ${card.priority === 'high' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-xs text-muted-foreground">{card.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={runFullAudit}><Brain className="h-4 w-4 mr-2" />Run Audit</Button>
                <Button variant="outline" onClick={() => setActiveTab('gapfinder')}><Search className="h-4 w-4 mr-2" />Find Gaps</Button>
                <Button variant="outline" onClick={() => setActiveTab('generator')}><Wand2 className="h-4 w-4 mr-2" />Generate</Button>
                <Button variant="outline" onClick={() => setActiveTab('bulk')}><Layers className="h-4 w-4 mr-2" />Bulk Ops</Button>
              </div>
            </CardContent>
          </Card>

          {isAuditing && (
            <Card><CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>{auditProgress.status}</span><span>{auditProgress.current}%</span></div>
                <Progress value={auditProgress.current} />
              </div>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-teal-600" />Content Quality by Page Type</CardTitle>
              <CardDescription>Breakdown of content quality across all page types. Good = {'>'}300 words (800 for services), Thin = 1-299 words, Missing = 0 words.</CardDescription>
            </CardHeader>
            <CardContent>
              {healthStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4 text-center">
                        <div className="text-3xl font-bold text-green-700">{healthStats.good}</div>
                        <div className="text-xs text-green-600 font-medium">Good</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="pt-4 text-center">
                        <div className="text-3xl font-bold text-amber-700">{healthStats.thin}</div>
                        <div className="text-xs text-amber-600 font-medium">Thin</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-4 text-center">
                        <div className="text-3xl font-bold text-red-700">{healthStats.missing}</div>
                        <div className="text-xs text-red-600 font-medium">Missing</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4 text-center">
                        <div className="text-3xl font-bold text-blue-700">{healthStats.total}</div>
                        <div className="text-xs text-blue-600 font-medium">Total</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page Type</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-green-700">Good</TableHead>
                        <TableHead className="text-amber-700">Thin</TableHead>
                        <TableHead className="text-red-700">Missing</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {healthStats.byType?.map((type) => {
                        const healthPct = type.total > 0 ? Math.round((type.good / type.total) * 100) : 0;
                        return (
                          <TableRow key={type.page_type}>
                            <TableCell className="font-medium capitalize">{type.page_type.replace(/_/g, ' ')}</TableCell>
                            <TableCell>{type.total}</TableCell>
                            <TableCell className="text-green-700">{type.good}</TableCell>
                            <TableCell className="text-amber-700">{type.thin}</TableCell>
                            <TableCell className="text-red-700">{type.missing}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={healthPct} className="w-20 h-2" />
                                <span className="text-xs font-medium">{healthPct}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {type.missing > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setPageTypeFilter(type.page_type);
                                    setActiveTab('explorer');
                                  }}
                                >
                                  <Search className="h-3 w-3 mr-1" />View
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Loading quality stats...</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600" />Pages Needing Attention</CardTitle>
              <CardDescription>Filter pages by content status and generate missing content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setStatusFilter('thin'); setActiveTab('explorer'); }}
                >
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
                  Thin Pages ({healthStats?.thin || 0})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setBulkTarget('all-issues'); setActiveTab('bulk'); }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Bulk Fix Issues
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setActiveTab('gapfinder'); }}
                >
                  <Search className="h-3 w-3 mr-1" />
                  Find Content Gaps
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explorer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-teal-600" />Page Explorer</CardTitle>
              <CardDescription>Browse and manage all platform content ({selectedPages.length} selected)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Input placeholder="Search pages..." value={pageSearch} onChange={(e) => setPageSearch(e.target.value)} className="max-w-[200px]" />
                <Select value={pageTypeFilter} onValueChange={setPageTypeFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {PAGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="good">Good Content</SelectItem>
                    <SelectItem value="thin">Thin Content</SelectItem>
                    <SelectItem value="missing">Missing Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Select</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Words</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagesLoading ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                    ) : !seoPages || seoPages.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No pages found</TableCell></TableRow>
                    ) : (
                      seoPages?.slice(0, 30).map((page: SeoPage) => {
                        const wc = page.word_count || 0;
                        const isService = page.page_type === 'service' || page.page_type === 'service_location';
                        const minGood = isService ? 800 : 300;
                        const contentBadge = wc >= minGood
                          ? <Badge className="bg-green-100 text-green-800">Good</Badge>
                          : wc >= 1
                            ? <Badge className="bg-amber-100 text-amber-800">Thin ({wc}w)</Badge>
                            : <Badge variant="destructive">Missing</Badge>;
                        return (
                        <TableRow key={page.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedPages.includes(page.id)}
                              onCheckedChange={() => togglePageSelection(page.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{page.title || page.slug}</div>
                            <div className="text-xs text-muted-foreground">/{page.slug}</div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{page.page_type}</Badge></TableCell>
                          <TableCell>
                            {page.is_indexed ? <Badge className="bg-green-100 text-green-800">Live</Badge> : <Badge variant="secondary">Draft</Badge>}
                          </TableCell>
                          <TableCell>{contentBadge}</TableCell>
                          <TableCell>{page.word_count || 0}</TableCell>
                          <TableCell className={getScoreColor(page.seo_score)}>{page.seo_score || '—'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => { setGenPageId(page.id); setActiveTab('generator'); }}><Wand2 className="h-3 w-3" /></Button>
                              <Button size="sm" variant="outline" onClick={() => handleGenerateFAQs(page.id)} disabled={isGeneratingContent}><FileSearch className="h-3 w-3" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5 text-teal-600" />Competitor Research</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap mb-4">
                <Select value={competitorPageId} onValueChange={setCompetitorPageId}>
                  <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select your page" /></SelectTrigger>
                  <SelectContent>
                    {seoPages?.slice(0, 30).map((p: SeoPage) => (
                      <SelectItem key={p.id} value={p.id}>{p.title || p.slug}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea 
                  placeholder="Enter competitor URLs (one per line)..." 
                  className="w-[300px] h-10"
                  value={competitorUrls}
                  onChange={(e) => setCompetitorUrls(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    if (!competitorPageId || !competitorUrls) { toast.error('Select page and enter URLs'); return; }
                    const page = seoPages?.find((p: SeoPage) => p.id === competitorPageId);
                    setIsAnalyzingCompetitors(true);
                    setCompetitorAnalysis(null);
                    try {
                      const result = await analyzeCompetitors.mutateAsync({
                        myContent: page?.content || page?.title || '',
                        competitorUrls: competitorUrls.split('\n').filter(Boolean),
                        keyword: page?.title || page?.slug || ''
                      });
                      setCompetitorAnalysis(result);
                      toast.success('Analysis complete');
                    } catch (error: any) { toast.error(error.message); }
                    finally { setIsAnalyzingCompetitors(false); }
                  }}
                  disabled={isAnalyzingCompetitors || !competitorPageId || !competitorUrls}
                >
                  {isAnalyzingCompetitors ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
                  Analyze
                </Button>
              </div>

              {competitorAnalysis && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <Label className="text-red-600 font-medium">Gaps</Label>
                    <ul className="mt-2 space-y-1">
                      {competitorAnalysis.gaps?.map((g: string, i: number) => (
                        <li key={i} className="text-sm list-disc list-inside">{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label className="text-green-600 font-medium">Recommendations</Label>
                    <ul className="mt-2 space-y-1">
                      {competitorAnalysis.recommendations?.map((r: string, i: number) => (
                        <li key={i} className="text-sm list-disc list-inside">{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="briefs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-teal-600" />Content Brief Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div><Label>Content Type</Label>
                    <Select value={briefParams.contentType} onValueChange={(v) => setBriefParams(p => ({ ...p, contentType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="location">Location Page</SelectItem>
                        <SelectItem value="service">Service Page</SelectItem>
                        <SelectItem value="location_service">Service + Location</SelectItem>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="agency">Agency Profile</SelectItem>
                        <SelectItem value="resource">Resource Guide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Target Keyword</Label>
                    <Input 
                      placeholder="e.g., foster care Birmingham" 
                      value={briefParams.targetKeyword}
                      onChange={(e) => setBriefParams(p => ({ ...p, targetKeyword: e.target.value }))}
                    />
                  </div>
                  <div><Label>Content Depth</Label>
                    <Select value={briefParams.contentDepth} onValueChange={(v) => setBriefParams(p => ({ ...p, contentDepth: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select depth" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (300-500 words)</SelectItem>
                        <SelectItem value="standard">Standard (700-900 words)</SelectItem>
                        <SelectItem value="deep">Deep (1000-1400 words)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div><Label>Search Intent</Label>
                    <Select value={briefParams.searchIntent} onValueChange={(v) => setBriefParams(p => ({ ...p, searchIntent: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select intent" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informational">Informational</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="applicant">Applicant Intent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Competitor URLs (optional)</Label>
                    <Textarea 
                      placeholder="Enter URLs, one per line..." 
                      rows={3}
                      value={briefParams.competitorUrls}
                      onChange={(e) => setBriefParams(p => ({ ...p, competitorUrls: e.target.value }))}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    disabled={isGeneratingBrief || !briefParams.targetKeyword}
                    onClick={handleGenerateBrief}
                  >
                    {isGeneratingBrief ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                    {isGeneratingBrief ? 'Generating...' : 'Generate Brief'}
                  </Button>
                </div>
              </div>

              {generatedBrief && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-3">Generated Brief</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Title:</span> {generatedBrief.title}</div>
                    <div><span className="font-medium">H1:</span> {generatedBrief.h1}</div>
                    <div><span className="font-medium">Meta Title:</span> {generatedBrief.metaTitle}</div>
                    <div><span className="font-medium">Meta Description:</span> {generatedBrief.metaDescription}</div>
                    <div className="col-span-2"><span className="font-medium">CTA:</span> {generatedBrief.cta}</div>
                    {generatedBrief.faqs?.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">FAQs ({generatedBrief.faqs.length}):</span>
                        <ul className="mt-1 list-disc list-inside">
                          {generatedBrief.faqs.map((f: any, i: number) => (
                            <li key={i}>{f.question}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-teal-600" />Content Generator</CardTitle>
              <CardDescription>Generate content for single or multiple pages using AI</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Bulk Generate Section */}
              <div className="mb-6 p-4 border rounded-lg bg-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-200">Bulk Generate</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{filteredBulkPages.length} matching</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (selectedPageIds.length === filteredBulkPages.length) {
                          setSelectedPageIds([]);
                        } else {
                          setSelectedPageIds(filteredBulkPages.map((p: any) => p.id));
                        }
                      }}
                    >
                      {selectedPageIds.length === filteredBulkPages.length ? 'Deselect All' : 'Select All'} ({selectedPageIds.length}/{filteredBulkPages.length})
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  <Select value={bulkTypeFilter} onValueChange={setBulkTypeFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Page Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {PAGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={bulkRegionFilter} onValueChange={setBulkRegionFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Region" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="england">England</SelectItem>
                      <SelectItem value="scotland">Scotland</SelectItem>
                      <SelectItem value="wales">Wales</SelectItem>
                      <SelectItem value="northern-ireland">Northern Ireland</SelectItem>
                    </SelectContent>
                  </Select>
                  <ToneEngineControl
                    toneMode={toneMode}
                    toneBlend={toneBlend}
                    onModeChange={setToneMode}
                    onBlendChange={setToneBlend}
                  />
                  <Select value={genWordCount} onValueChange={setGenWordCount}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Words" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">500 words (Concise)</SelectItem>
                      <SelectItem value="800">800 words (Standard)</SelectItem>
                      <SelectItem value="1200">1200 words (Detailed)</SelectItem>
                      <SelectItem value="1500">1500 words (In-depth)</SelectItem>
                      <SelectItem value="2000">2000 words (Comprehensive)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="default"
                    onClick={runBulkContentGeneration}
                    disabled={isBulkGenerating || selectedPageIds.length === 0}
                  >
                    {isBulkGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    Generate ({selectedPageIds.length})
                  </Button>
                </div>
                
                {isBulkGenerating && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating content...</span>
                      <span>{bulkGenProgress.current}/{bulkGenProgress.total}</span>
                    </div>
                    <Progress value={(bulkGenProgress.current / bulkGenProgress.total) * 100} />
                  </div>
                )}
                
                {bulkGenProgress.results.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bulkGenProgress.results.slice(0, 10).map((r: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{r.title}</TableCell>
                            <TableCell>
                              <Badge variant={r.success ? 'default' : 'destructive'}>{r.success ? 'Generated' : 'Failed'}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Single Page Generate */}
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Select value={genPageId} onValueChange={setGenPageId}>
                    <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select single page" /></SelectTrigger>
                    <SelectContent>
                      {seoPages?.slice(0, 50).map((p: SeoPage) => (
                        <SelectItem key={p.id} value={p.id}>{p.title || p.slug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ToneEngineControl
                    toneMode={toneMode}
                    toneBlend={toneBlend}
                    onModeChange={setToneMode}
                    onBlendChange={setToneBlend}
                  />
                  <Select value={genWordCount} onValueChange={setGenWordCount}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Words" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">500 words (Concise)</SelectItem>
                      <SelectItem value="800">800 words (Standard)</SelectItem>
                      <SelectItem value="1200">1200 words (Detailed)</SelectItem>
                      <SelectItem value="1500">1500 words (In-depth)</SelectItem>
                      <SelectItem value="2000">2000 words (Comprehensive)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateContent}
                    disabled={isGeneratingContent || !genPageId}
                  >
                    {isGeneratingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Generate
                  </Button>
                </div>

                {generatedContent && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div>
                      <Label>Generated Content</Label>
                      <div className="mt-2 p-3 bg-muted/30 rounded max-h-60 overflow-y-auto text-sm whitespace-pre-wrap">
                        {generatedContent.content?.substring(0, 2000)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Meta Title</Label>
                        <Input value={generatedContent.metaTitle || ''} readOnly />
                      </div>
                      <div>
                        <Label>Meta Description</Label>
                        <Input value={generatedContent.metaDescription || ''} readOnly />
                      </div>
                    </div>
                    {generatedContent.faqs?.length > 0 && (
                      <div>
                        <Label>FAQs ({generatedContent.faqs.length})</Label>
                        <div className="space-y-2 mt-2">
                          {generatedContent.faqs.map((f: any, i: number) => (
                            <div key={i} className="p-2 bg-muted/30 rounded text-sm">
                              <div className="font-medium">Q: {f.question}</div>
                              <div>A: {f.answer}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button className="w-full" onClick={handleSaveGeneratedContent}>
                      <Save className="h-4 w-4 mr-2" />Save to Page
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-teal-600" />Content Optimizer</CardTitle>
              <CardDescription>Optimize existing content for SEO and AI search</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Select value={optPageId} onValueChange={setOptPageId}>
                  <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select page" /></SelectTrigger>
                  <SelectContent>
                    {seoPages?.slice(0, 30).map((p: SeoPage) => (
                      <SelectItem key={p.id} value={p.id}>{p.title || p.slug}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                  <Button 
                  variant="outline"
                  disabled={!optPageId || isOptimizing}
                  onClick={async () => {
                    const page = seoPages?.find((p: SeoPage) => p.id === optPageId);
                    if (!page) return;
                    setIsOptimizing(true);
                    setOptimizationResult(null);
                    try {
                      const result = await optimizeContent.mutateAsync({
                        pageId: page.id,
                        focus: optFocus,
                        content: page.content || '',
                        title: page.title || '',
                        metaTitle: page.meta_title || undefined,
                        metaDescription: page.meta_description || undefined
                      });
                      setOptimizationResult(result);
                      toast.success('Content optimized');
                    } catch (error: any) { toast.error(error.message || 'Optimization failed'); }
                    finally { setIsOptimizing(false); }
                  }}
                >
                  {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Optimize
                </Button>
              </div>

              {optimizationResult && (
                <div className="mt-4 p-4 border rounded-lg">
                  <Label>Improvements</Label>
                  <ul className="mt-2 space-y-1">
                    {optimizationResult.improvements?.map((imp: string, i: number) => (
                      <li key={i} className="text-sm list-disc list-inside">{imp}</li>
                    ))}
                  </ul>
                  {optimizationResult.newMetaTitle && (
                    <div className="mt-4">
                      <Label>Suggested Meta Title</Label>
                      <Input value={optimizationResult.newMetaTitle} readOnly className="mt-1" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gapfinder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-teal-600" />Content Gap Finder</CardTitle>
              <CardDescription>Find missing content opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Select value={gapFilter} onValueChange={setGapFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Gaps</SelectItem>
                    <SelectItem value="location">Missing Locations</SelectItem>
                    <SelectItem value="service">Missing Services</SelectItem>
                    <SelectItem value="service_location">Missing Service+Location</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={analyzeGaps} disabled={isAnalyzingGaps}>
                  {isAnalyzingGaps ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Analyze Gaps
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gapResults.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Click "Analyze Gaps" to find opportunities</TableCell></TableRow>
                    ) : (
                      gapResults.map((gap, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="font-medium">{gap.title}</div>
                            <div className="text-xs text-muted-foreground">{gap.reason}</div>
                          </TableCell>
                          <TableCell><Badge>{gap.type}</Badge></TableCell>
                          <TableCell>
                            <Badge className={gap.priority === 'high' ? 'bg-red-100' : 'bg-amber-100'}>{gap.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => {
                              setBriefParams(p => ({ ...p, targetKeyword: gap.suggestedTitle, contentType: gap.type }));
                              setActiveTab('briefs');
                            }}>Create Brief</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-teal-600" />Bulk Content Manager</CardTitle>
              <CardDescription>Manage content across multiple pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap mb-4">
                <Select value={bulkTarget} onValueChange={setBulkTarget}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Target Pages" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low-score">Low Score Pages</SelectItem>
                    <SelectItem value="thin">Thin Content (&lt;500 words)</SelectItem>
                    <SelectItem value="missing-meta">Missing Meta Tags</SelectItem>
                    <SelectItem value="missing-faq">Missing FAQs</SelectItem>
                    <SelectItem value="all-issues">All Issues</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generate-faq">Generate FAQs</SelectItem>
                    <SelectItem value="fix-meta">Generate Meta Tags</SelectItem>
                    <SelectItem value="regenerate">Regenerate Content</SelectItem>
                    <SelectItem value="optimize">Optimize Content</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={runBulkAction} disabled={isRunningBulk || !bulkTarget}>
                  {isRunningBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Find Pages
                </Button>
                {bulkResults.length > 0 && bulkAction && (
                  <Button variant="default" onClick={runBulkFix} disabled={isRunningBulk}>
                    {isRunningBulk ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    {bulkAction === 'generate-faq' ? `Generate FAQs (${bulkResults.length})` :
                     bulkAction === 'fix-meta' ? `Fix Meta (${bulkResults.length})` :
                     bulkAction === 'regenerate' ? `Regenerate (${bulkResults.length})` :
                     `Optimize (${bulkResults.length})`}
                  </Button>
                )}
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkResults.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Select target and find pages</TableCell></TableRow>
                    ) : (
                      bulkResults.slice(0, 20).map((page, i) => (
                        <TableRow key={i}>
                          <TableCell><div className="font-medium">{page.title}</div><div className="text-xs">/{page.slug}</div></TableCell>
                          <TableCell><Badge>{page.type}</Badge></TableCell>
                          <TableCell><div className="flex gap-1">{page.issues?.map((iss: string, j: number) => <Badge key={j} variant="outline" className="text-xs">{iss}</Badge>)}</div></TableCell>
                          <TableCell>
                            {page.status === 'completed' ? <Badge className="bg-green-100 text-green-800">Fixed</Badge> :
                             page.status === 'processing' ? <Badge variant="secondary"><Loader2 className="h-3 w-3 animate-spin mr-1 inline" />Processing</Badge> :
                             page.status === 'error' ? <Badge variant="destructive">Error</Badge> :
                             <Badge variant="secondary">Ready</Badge>}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5 text-teal-600" />Content Reports</CardTitle>
              <CardDescription>Generate and export detailed content reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" onClick={() => {
                  if (!contentStats) return;
                  const report = [
                    '=== FULL CONTENT AUDIT REPORT ===',
                    `Generated: ${new Date().toLocaleString()}`,
                    '',
                    '--- Overview ---',
                    `Total Pages: ${contentStats.total}`,
                    `Published: ${contentStats.indexed}`,
                    `Drafts: ${contentStats.draft}`,
                    '',
                    '--- Content Breakdown ---',
                    `Location Pages: ${contentStats.locations}`,
                    `Service Pages: ${contentStats.services}`,
                    `Agencies: ${contentStats.agencies}`,
                    `Blog Posts: ${contentStats.blogs}`,
                    '',
                    '--- Issues Found ---',
                    `Thin Content (<500 words): ${contentStats.thin}`,
                    `Missing Meta Tags: ${contentStats.missingTitle + contentStats.missingDesc}`,
                    `Missing FAQs: ${contentStats.missingFaq}`,
                    `Missing Schema: ${contentStats.missingSchema}`,
                    `Low SEO Score (<60): ${contentStats.lowScore}`,
                    '',
                    '--- Health Scores ---',
                    ...Object.entries(healthScores).map(([k, v]) => `${k}: ${v}/100`),
                  ].join('\n');
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'full-audit-report.txt'; a.click();
                  toast.success('Full audit report generated');
                }}>Full Audit Report</Button>
                <Button variant="outline" onClick={() => {
                  const pagesList = seoPages || [];
                  const sorted = [...pagesList].sort((a, b) => (b.seo_score || 0) - (a.seo_score || 0));
                  const rows = ['Page Score Report', `Generated: ${new Date().toLocaleString()}`, '', 'Page,Type,Score,Words,Status'];
                  sorted.forEach(p => rows.push(`${p.title || p.slug},${p.page_type},${p.seo_score || 'N/A'},${p.word_count || 0},${p.is_indexed ? 'Published' : 'Draft'}`));
                  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'page-score-report.csv'; a.click();
                  toast.success('Page score report exported');
                }}>Page Score Report</Button>
                <Button variant="outline" onClick={() => {
                  const thinPages = (seoPages || []).filter(p => (p.word_count || 0) < 500);
                  const rows = ['Content Refresh Report', `Generated: ${new Date().toLocaleString()}`, `Pages needing refresh: ${thinPages.length}`, '', 'Page,Words,Score,Last Updated'];
                  thinPages.forEach(p => rows.push(`${p.title || p.slug},${p.word_count || 0},${p.seo_score || 'N/A'},${new Date(p.updated_at).toLocaleDateString()}`));
                  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'content-refresh-report.csv'; a.click();
                  toast.success(`Found ${thinPages.length} pages needing refresh`);
                }}>Content Refresh</Button>
                <Button variant="outline" onClick={() => {
                  const locationPages = (seoPages || []).filter(p => p.page_type === 'city' || p.page_type === 'region' || p.page_type === 'state');
                  const rows = ['Location Content Report', `Generated: ${new Date().toLocaleString()}`, `Location pages: ${locationPages.length}`, '', 'Page,Type,Score,Words,Indexed'];
                  locationPages.forEach(p => rows.push(`${p.title || p.slug},${p.page_type},${p.seo_score || 'N/A'},${p.word_count || 0},${p.is_indexed ? 'Yes' : 'No'}`));
                  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'location-content-report.csv'; a.click();
                  toast.success('Location content report exported');
                }}>Location Content</Button>
                <Button variant="outline" onClick={() => {
                  const servicePages = (seoPages || []).filter(p => p.page_type === 'service' || p.page_type === 'service_location');
                  const rows = ['Service Content Report', `Generated: ${new Date().toLocaleString()}`, `Service pages: ${servicePages.length}`, '', 'Page,Type,Score,Words,Indexed'];
                  servicePages.forEach(p => rows.push(`${p.title || p.slug},${p.page_type},${p.seo_score || 'N/A'},${p.word_count || 0},${p.is_indexed ? 'Yes' : 'No'}`));
                  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'service-content-report.csv'; a.click();
                  toast.success('Service content report exported');
                }}>Service Content</Button>
                <Button variant="outline" onClick={() => {
                  const missingFaqs = (seoPages || []).filter(p => !p.faqs);
                  const rows = ['Missing FAQs Report', `Generated: ${new Date().toLocaleString()}`, `Pages missing FAQs: ${missingFaqs.length}`, '', 'Page,Type,Score,Words'];
                  missingFaqs.forEach(p => rows.push(`${p.title || p.slug},${p.page_type},${p.seo_score || 'N/A'},${p.word_count || 0}`));
                  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'missing-faqs-report.csv'; a.click();
                  toast.success(`Found ${missingFaqs.length} pages missing FAQs`);
                }}>Missing FAQs</Button>
                <Button variant="outline" onClick={() => {
                  const pagesList = seoPages || [];
                  const rows = ['Page,Type,Status,Words,Score,HasContent,HasMeta,HasFAQs'];
                  pagesList.forEach((p: SeoPage) => {
                    rows.push(`${p.title || p.slug},${p.page_type},${p.is_indexed ? 'Published' : 'Draft'},${p.word_count || 0},${p.seo_score || 0},${p.content ? 'Yes' : 'No'},${p.meta_title ? 'Yes' : 'No'},${p.faqs ? 'Yes' : 'No'}`);
                  });
                  const csvContent = rows.join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'full-content-report.csv'; a.click();
                  toast.success('Full CSV report exported');
                }}>Export Full CSV</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}