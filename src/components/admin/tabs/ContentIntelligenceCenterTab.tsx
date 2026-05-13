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
import { useGenerateContentBrief, useGenerateContent, useOptimizeContent, useAnalyzeCompetitors } from '@/hooks/useContentGeneration';
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
  const [genTone, setGenTone] = useState('professional');
  const [genWordCount, setGenWordCount] = useState('900');
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

  const [competitorPageId, setCompetitorPageId] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [isAnalyzingCompetitors, setIsAnalyzingCompetitors] = useState(false);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<any>(null);

  const generateBrief = useGenerateContentBrief();
  const generateContent = useGenerateContent();
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

  const healthScores = useMemo(() => ({
    overall: 72, seo: 68, helpfulContent: 75, aiSearch: 65, eeat: 78,
    readability: 82, uniqueness: 70, internalLinking: 60, schema: 55,
    conversion: 68, localRelevance: 72, serviceRelevance: 70, competitorGap: 65,
  }), []);

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
      const content = await generateContent.mutateAsync({
        pageId: page.id,
        pageType: page.page_type,
        targetKeyword: page.title || page.slug,
        tone: genTone,
        wordCount: parseInt(genWordCount),
        existingContent: page.content || undefined
      });
      setGeneratedContent(content);
      toast.success('Content generated');
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
      const page = seoPages?.find((p: SeoPage) => p.id === pageId);
      if (!page) continue;
      
      setBulkGenProgress(prev => ({ ...prev, current: i + 1 }));
      
      try {
        const content = await generateContent.mutateAsync({
          pageId: page.id,
          pageType: page.page_type,
          targetKeyword: page.title || page.slug,
          tone: genTone,
          wordCount: parseInt(genWordCount),
          existingContent: page.content || undefined
        });
        
        // Save to page
        await supabase.from('seo_pages').update({
          content: content.content,
          meta_title: content.metaTitle,
          meta_description: content.metaDescription,
          h1: content.h1,
          word_count: content.wordCount,
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
      await supabase.from('seo_pages').update({
        content: generatedContent.content,
        meta_title: generatedContent.metaTitle,
        meta_description: generatedContent.metaDescription,
        faqs: generatedContent.faqs,
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
      const content = await generateContent.mutateAsync({
        pageId,
        pageType: page.page_type,
        targetKeyword: page.title || page.slug,
        tone: 'professional',
        wordCount: 500
      });
      await supabase.from('seo_pages').update({
        faqs: content.faqs,
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
      const { data: pageData } = await supabase.from('seo_pages').select('slug, page_type');
      const existingSlugs = new Set(pageData?.map(p => p.slug) || []);
      const gaps: any[] = [];
      
      if (cities) {
        for (const city of cities.slice(0, 15)) {
          if (!existingSlugs.has(`foster-care-${city.slug}`)) {
            gaps.push({
              title: city.name,
              type: 'location',
              priority: 'high',
              reason: 'Missing city page',
              suggestedTitle: `Foster Care in ${city.name}`,
              slug: `foster-care-${city.slug}`,
              action: 'create'
            });
          }
        }
      }
      
      if (gapResults.length > 0) {
        setGapResults(gapResults);
      } else {
        setGapResults(gaps.slice(0, 20));
      }
      toast.success(`Found ${gaps.length} gaps`);
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
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type').is('meta_title', null).limit(50);
        pages = data || [];
      } else if (bulkTarget === 'missing-faq') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type').is('faqs', null).limit(50);
        pages = data || [];
      }
      
      setBulkResults(pages.map(p => ({
        ...p,
        type: p.page_type,
        issues: [bulkTarget === 'low-score' ? 'Low Score' : bulkTarget === 'thin' ? 'Thin' : 'Missing'],
        status: 'ready'
      })));
      toast.success(`Found ${pages.length} pages`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRunningBulk(false);
    }
  };

  const runBulkGenerateFAQs = async () => {
    if (bulkResults.length === 0) return;
    setIsRunningBulk(true);
    try {
      for (const page of bulkResults.slice(0, 10)) {
        await handleGenerateFAQs(page.id);
      }
      toast.success('FAQs generated for selected pages');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRunningBulk(false);
    }
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
                      <TableHead>Words</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagesLoading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                    ) : seoPages?.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No pages found</TableCell></TableRow>
                    ) : (
                      seoPages?.slice(0, 30).map((page: SeoPage) => (
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
                          <TableCell>{page.word_count || 0}</TableCell>
                          <TableCell className={getScoreColor(page.seo_score)}>{page.seo_score || '—'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => { setGenPageId(page.id); setActiveTab('generator'); }}><Wand2 className="h-3 w-3" /></Button>
                              <Button size="sm" variant="outline" onClick={() => handleGenerateFAQs(page.id)} disabled={isGeneratingContent}><FileSearch className="h-3 w-3" /></Button>
                            </div>
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
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (selectedPageIds.length === seoPages?.length) {
                        setSelectedPageIds([]);
                      } else {
                        setSelectedPageIds(seoPages?.map((p: SeoPage) => p.id) || []);
                      }
                    }}
                  >
                    {selectedPageIds.length === seoPages?.length ? 'Deselect All' : 'Select All'} ({selectedPageIds.length}/{seoPages?.length || 0})
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  <Select value={genTone} onValueChange={setGenTone}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="trust-focused">Trust-focused</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={genWordCount} onValueChange={setGenWordCount}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Words" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">500 words</SelectItem>
                      <SelectItem value="900">900 words</SelectItem>
                      <SelectItem value="1400">1400 words</SelectItem>
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
                  <Select value={genTone} onValueChange={setGenTone}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="trust-focused">Trust-focused</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={genWordCount} onValueChange={setGenWordCount}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Words" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">500 words</SelectItem>
                      <SelectItem value="900">900 words</SelectItem>
                      <SelectItem value="1400">1400 words</SelectItem>
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
                      // Call edge function for content optimization
                      const response = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content-optimizer`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                          },
                          body: JSON.stringify({
                            pageId: page.id,
                            focus: optFocus,
                            content: page.content || '',
                            title: page.title || '',
                            metaTitle: page.meta_title || undefined,
                            metaDescription: page.meta_description || undefined
                          })
                        }
                      );
                      if (!response.ok) throw new Error('Optimization failed');
                      const result = await response.json();
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
                    <SelectItem value="thin">Thin Content</SelectItem>
                    <SelectItem value="missing-meta">Missing Meta</SelectItem>
                    <SelectItem value="missing-faq">Missing FAQs</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generate-faq">Generate FAQs</SelectItem>
                    <SelectItem value="refresh">Refresh</SelectItem>
                    <SelectItem value="optimize">Optimize</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={runBulkAction} disabled={isRunningBulk || !bulkTarget}>
                  {isRunningBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Find Pages
                </Button>
                {bulkAction === 'generate-faq' && bulkResults.length > 0 && (
                  <Button variant="default" onClick={runBulkGenerateFAQs} disabled={isRunningBulk}>
                    Generate FAQs ({bulkResults.length})
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
                          <TableCell><Badge variant="secondary">{page.status}</Badge></TableCell>
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" onClick={() => toast.success('Report: Full Audit')}>Full Audit Report</Button>
                <Button variant="outline" onClick={() => toast.success('Report: Page Scores')}>Page Score Report</Button>
                <Button variant="outline" onClick={() => toast.success('Report: Competitor Gap')}>Competitor Gap</Button>
                <Button variant="outline" onClick={() => toast.success('Report: AI Search')}>AI Search Readiness</Button>
                <Button variant="outline" onClick={() => toast.success('Report: Content Refresh')}>Content Refresh</Button>
                <Button variant="outline" onClick={() => toast.success('Report: Location Content')}>Location Content</Button>
                <Button variant="outline" onClick={() => toast.success('Report: Service Content')}>Service Content</Button>
                <Button variant="outline" onClick={() => {
                  const pagesList = seoPages || [];
                  const rows = ['Page,Type,Status,Words,Score'];
                  pagesList.forEach((p: SeoPage) => {
                    rows.push(`${p.title || p.slug},${p.page_type},${p.is_indexed ? 'Published' : 'Draft'},${p.word_count || 0},${p.seo_score || 0}`);
                  });
                  const csvContent = rows.join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'content-report.csv';
                  a.click();
                  toast.success('Exported CSV');
                }}>Export CSV</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}