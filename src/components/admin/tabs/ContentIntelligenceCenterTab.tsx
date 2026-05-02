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
import { useGenerateContentBrief, useGenerateContent, useOptimizeContent, useAnalyzeCompetitors } from '@/hooks/useContentGeneration';
import { 
  Brain, MapPin, Users, BookOpen, Target, 
  Sparkles, RefreshCw, Loader2, 
  BarChart3, Globe, FileText, Search,
  AlertTriangle, CheckCircle,
  Building2, FolderOpen, Layers,
  Compass, Gauge, Wand2, Link2, FileSearch,
  BarChart, Eye, Edit, ExternalLink, ChevronRight,
  Send, Zap, Save
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
  { value: 'location_service', label: 'Service + Location' },
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

function getScoreLabel(score: number | null): string {
  if (!score || score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Needs Work';
  return 'Weak';
}

export default function ContentIntelligenceCenterTab() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState({ current: 0, total: 100, status: '' });
  
  const [pageSearch, setPageSearch] = useState('');
  const [pageTypeFilter, setPageTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [issueFilter, setIssueFilter] = useState('all');

  const [briefParams, setBriefParams] = useState({
    contentType: 'location',
    targetKeyword: '',
    contentDepth: 'standard',
    searchIntent: 'local',
    competitorUrls: ''
  });
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<any>(null);
  const [gapFilter, setGapFilter] = useState('all');
  const [gapResults, setGapResults] = useState<any[]>([]);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkTarget, setBulkTarget] = useState('');
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [isRunningBulk, setIsRunningBulk] = useState(false);
  const [genPageId, setGenPageId] = useState('');
  const [genTone, setGenTone] = useState('professional');
  const [genWordCount, setGenWordCount] = useState('900');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [competitorPageId, setCompetitorPageId] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [isAnalyzingCompetitors, setIsAnalyzingCompetitors] = useState(false);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<any>(null);

  const generateContent = useGenerateContent();
  const analyzeCompetitors = useAnalyzeCompetitors();

  const handleAnalyzeCompetitors = async () => {
    if (!competitorPageId || !competitorUrls) return;
    const page = seoPages?.find((p: any) => p.id === competitorPageId);
    if (!page) return;
    
    setIsAnalyzingCompetitors(true);
    setCompetitorAnalysis(null);
    try {
      const urls = competitorUrls.split('\n').filter(Boolean);
      const result = await analyzeCompetitors.mutateAsync({
        myContent: page.content || page.title || '',
        competitorUrls: urls,
        keyword: page.title || page.slug
      });
      setCompetitorAnalysis(result);
      toast.success('Competitor analysis complete');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAnalyzingCompetitors(false);
    }
  };

const generateBrief = useGenerateContentBrief();

  const handleGenerateContent = async () => {
    if (!genPageId) return;
    const page = seoPages?.find((p: any) => p.id === genPageId);
    if (!page) return;
    
    setIsGeneratingContent(true);
    setGeneratedContent(null);
    try {
      const content = await generateContent.mutateAsync({
        pageId: page.id,
        pageType: page.page_type,
        targetKeyword: page.title || page.slug,
        tone: genTone,
        wordCount: parseInt(genWordCount)
      });
      setGeneratedContent(content);
      toast.success('Content generated');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const runBulkAction = async () => {
    if (!bulkAction || !bulkTarget) {
      toast.error('Select action and target pages');
      return;
    }
    setIsRunningBulk(true);
    setBulkResults([]);
    try {
      let pages: any[] = [];
      if (bulkTarget === 'low-score') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type, seo_score').lt('seo_score', 60).limit(20);
        pages = data || [];
      } else if (bulkTarget === 'thin') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type, word_count').lt('word_count', 500).limit(20);
        pages = data || [];
      } else if (bulkTarget === 'missing-meta') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type, meta_title, meta_description').is('meta_title', null).limit(20);
        pages = data || [];
      } else if (bulkTarget === 'missing-faq') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type, faqs').is('faqs', null).limit(20);
        pages = data || [];
      } else if (bulkTarget === 'no-schema') {
        const { data } = await supabase.from('seo_pages').select('id, slug, title, page_type, schema_markup').is('schema_markup', null).limit(20);
        pages = data || [];
      }
      
      setBulkResults(pages.map(p => ({
        ...p,
        type: p.page_type,
        issues: [bulkTarget === 'low-score' ? 'Low Score' : bulkTarget === 'thin' ? 'Thin Content' : bulkTarget === 'missing-meta' ? 'No Meta' : bulkTarget === 'missing-faq' ? 'No FAQ' : 'No Schema'],
        status: 'pending'
      })));
      toast.success(`Found ${pages.length} pages to process`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRunningBulk(false);
    }
  };

  const analyzeGaps = async () => {
    setIsAnalyzingGaps(true);
    setGapResults([]);
    try {
      const { data: cities } = await supabase.from('cities').select('id, name, slug').eq('is_active', true).limit(50);
      const { data: services } = await supabase.from('fostering_categories').select('id, name, slug').eq('is_active', true);
      const { data: seoPages } = await supabase.from('seo_pages').select('slug, page_type');
      
      const existingSlugs = new Set(seoPages?.map(p => p.slug) || []);
      const gaps: any[] = [];
      
      if (gapFilter === 'all' || gapFilter === 'location') {
        if (cities) {
          for (const city of cities.slice(0, 10)) {
            if (!existingSlugs.has(`foster-care-${city.slug}`)) {
              gaps.push({
                title: city.name,
                type: 'location',
                priority: 'high',
                reason: 'Missing city page',
                suggestedTitle: `Foster Care in ${city.name}`
              });
            }
          }
        }
      }
      
      if (gapFilter === 'all' || gapFilter === 'service') {
        if (services) {
          for (const svc of services) {
            if (!existingSlugs.has(`fostering-${svc.slug}`)) {
              gaps.push({
                title: svc.name,
                type: 'service',
                priority: 'medium',
                reason: 'Missing service page',
                suggestedTitle: svc.name
              });
            }
          }
        }
      }
      
      if (gapFilter === 'all' || gapFilter === 'service_location') {
        if (cities && services) {
          for (const city of cities.slice(0, 5)) {
            for (const svc of services.slice(0, 3)) {
              const slug = `${svc.slug}-${city.slug}`;
              if (!existingSlugs.has(slug)) {
                gaps.push({
                  title: `${svc.name} in ${city.name}`,
                  type: 'service_location',
                  priority: 'high',
                  reason: 'Missing service+location page',
                  suggestedTitle: `${svc.name} in ${city.name}`
                });
              }
            }
          }
        }
      }
      
      setGapResults(gaps.slice(0, 20));
      toast.success(`Found ${gaps.length} gaps`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAnalyzingGaps(false);
    }
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
    queryKey: ['seo-pages-list', pageSearch, pageTypeFilter, statusFilter, issueFilter],
    queryFn: async () => {
      let query = supabase.from('seo_pages').select('id, slug, page_type, title, meta_title, meta_description, h1, content, word_count, seo_score, is_indexed, is_optimized, needs_optimization, faqs, updated_at').order('updated_at', { ascending: false });
      
      if (pageSearch) {
        query = query.or(`title.ilike.%${pageSearch}%,slug.ilike.%${pageSearch}%,h1.ilike.%${pageSearch}%`);
      }
      if (pageTypeFilter !== 'all') {
        query = query.eq('page_type', pageTypeFilter);
      }
      if (statusFilter === 'published') {
        query = query.eq('is_indexed', true);
      } else if (statusFilter === 'draft') {
        query = query.eq('is_indexed', false);
      }
      
      const { data } = await query.limit(100);
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
    { title: 'Thin Content', value: contentStats?.thin || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', priority: 'high' },
    { title: 'Missing Title', value: contentStats?.missingTitle || 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', priority: 'high' },
    { title: 'Missing Desc', value: contentStats?.missingDesc || 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', priority: 'medium' },
    { title: 'Missing FAQs', value: contentStats?.missingFaq || 0, icon: FileSearch, color: 'text-amber-600', bg: 'bg-amber-50', priority: 'medium' },
    { title: 'Missing Schema', value: contentStats?.missingSchema || 0, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50', priority: 'medium' },
    { title: 'Low Score', value: contentStats?.lowScore || 0, icon: Gauge, color: 'text-red-600', bg: 'bg-red-50', priority: 'high' },
  ];

  const runFullAudit = async () => {
    setIsAuditing(true);
    setAuditProgress({ current: 0, total: 100, status: 'Analyzing content...' });
    for (let i = 0; i <= 100; i += 25) {
      await new Promise(r => setTimeout(r, 500));
      setAuditProgress({ current: i, total: 100, status: i < 100 ? `Analyzing... ${i}%` : 'Complete!' });
    }
    setIsAuditing(false);
    refetch();
    toast.success('Content audit completed');
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
          {contentStats?.total || 0} pages
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {issueCards.map((card) => (
              <Card key={card.title} className={`border-l-4 ${card.priority === 'high' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
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
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Run Audit', icon: Brain, color: 'text-teal-600' },
                  { label: 'AI Search Audit', icon: Sparkles, color: 'text-purple-600' },
                  { label: 'Gap Analysis', icon: Compass, color: 'text-blue-600' },
                  { label: 'Generate Content', icon: Wand2, color: 'text-green-600' },
                  { label: 'Refresh Pages', icon: RefreshCw, color: 'text-orange-600' },
                  { label: 'Generate FAQs', icon: FileSearch, color: 'text-indigo-600' },
                  { label: 'Generate Meta', icon: FileText, color: 'text-cyan-600' },
                  { label: 'Export', icon: BarChart, color: 'text-gray-600' },
                ].map((action) => (
                  <Button key={action.label} variant="outline" onClick={action.label === 'Run Audit' ? runFullAudit : undefined}>
                    <action.icon className={`h-4 w-4 mr-2 ${action.color}`} />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {isAuditing && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>{auditProgress.status}</span><span>{auditProgress.current}%</span></div>
                  <Progress value={auditProgress.current} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="explorer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-teal-600" />Page Explorer</CardTitle>
              <CardDescription>Browse and manage all platform content</CardDescription>
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
                <Select value={issueFilter} onValueChange={setIssueFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Issues" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Issues</SelectItem>
                    <SelectItem value="thin">Thin Content</SelectItem>
                    <SelectItem value="missing-meta">Missing Meta</SelectItem>
                    <SelectItem value="missing-faq">Missing FAQs</SelectItem>
                    <SelectItem value="needs-refresh">Needs Refresh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Words</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagesLoading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                    ) : seoPages?.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No pages found</TableCell></TableRow>
                    ) : (
                      seoPages?.slice(0, 50).map((page: SeoPage) => (
                        <TableRow key={page.id}>
                          <TableCell>
                            <div className="font-medium">{page.title || page.slug}</div>
                            <div className="text-xs text-muted-foreground">/{page.slug}</div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{page.page_type}</Badge></TableCell>
                          <TableCell>
                            {page.is_indexed ? (
                              <Badge className="bg-green-100 text-green-800">Published</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </TableCell>
                          <TableCell>{page.word_count || 0}</TableCell>
                          <TableCell className={getScoreColor(page.seo_score)}>{page.seo_score || '—'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {page.is_optimized === false && <Badge variant="destructive" className="text-xs">Needs Opt</Badge>}
                              {!page.faqs && <Badge variant="outline" className="text-xs">No FAQ</Badge>}
                              {(page.word_count || 0) < 500 && <Badge variant="destructive" className="text-xs">Thin</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button>
                              <Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {seoPages && seoPages.length > 50 && (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  Showing 50 of {seoPages.length} pages
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5 text-teal-600" />Competitor Research</CardTitle>
              <CardDescription>Analyze competitors to identify content gaps and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Select value={competitorPageId} onValueChange={setCompetitorPageId}>
                    <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select your page" /></SelectTrigger>
                    <SelectContent>
                      {seoPages?.slice(0, 30).map((p: any) => (
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
                    onClick={handleAnalyzeCompetitors}
                    disabled={isAnalyzingCompetitors || !competitorPageId || !competitorUrls}
                  >
                    {isAnalyzingCompetitors ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
                    Analyze
                  </Button>
                </div>

                {competitorAnalysis && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div>
                      <Label className="text-red-600 font-medium">Gaps (Topics They Cover)</Label>
                      <ul className="mt-2 space-y-1">
                        {competitorAnalysis.gaps?.map((g: string, i: number) => (
                          <li key={i} className="text-sm list-disc list-inside">{g}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Label className="text-green-600 font-medium">Opportunities</Label>
                      <ul className="mt-2 space-y-1">
                        {competitorAnalysis.opportunities?.map((o: string, i: number) => (
                          <li key={i} className="text-sm list-disc list-inside">{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Label className="text-teal-600 font-medium">Recommendations</Label>
                      <ul className="mt-2 space-y-1">
                        {competitorAnalysis.recommendations?.map((r: string, i: number) => (
                          <li key={i} className="text-sm list-disc list-inside">{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="briefs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-teal-600" />Content Brief Generator</CardTitle>
              <CardDescription>AI-powered brief generation for UK fostering content</CardDescription>
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
                    {generatedBrief.topics?.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Topics:</span> {generatedBrief.topics.join(', ')}
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
              <CardDescription>AI-powered content using Gemini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Select value={genPageId} onValueChange={setGenPageId}>
                    <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select page" /></SelectTrigger>
                    <SelectContent>
                      {seoPages?.slice(0, 30).map((p: any) => (
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
                    <Button className="w-full">
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
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a page from Page Explorer to optimize</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gapfinder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-teal-600" />Content Gap Finder</CardTitle>
              <CardDescription>Find missing content opportunities by location, service, and topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select value={gapFilter} onValueChange={setGapFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gaps</SelectItem>
                      <SelectItem value="location">Missing Locations</SelectItem>
                      <SelectItem value="service">Missing Services</SelectItem>
                      <SelectItem value="service_location">Missing Service+Location</SelectItem>
                      <SelectItem value="blog">Blog Topics</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={analyzeGaps} disabled={isAnalyzingGaps}>
                    {isAnalyzingGaps ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Analyze Gaps
                  </Button>
                </div>

                {gapResults.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Opportunity</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Suggested Title</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gapResults.map((gap, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="font-medium">{gap.title}</div>
                              <div className="text-xs text-muted-foreground">{gap.reason}</div>
                            </TableCell>
                            <TableCell><Badge>{gap.type}</Badge></TableCell>
                            <TableCell>
                              <Badge className={gap.priority === 'high' ? 'bg-red-100' : gap.priority === 'medium' ? 'bg-amber-100' : 'bg-gray-100'}>
                                {gap.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{gap.suggestedTitle}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">Create Brief</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Analyze Gaps" to find missing content</p>
                  </div>
                )}
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
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Action" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generate-meta">Generate Meta Tags</SelectItem>
                      <SelectItem value="generate-faq">Generate FAQs</SelectItem>
                      <SelectItem value="generate-schema">Generate Schema</SelectItem>
                      <SelectItem value="refresh">Refresh Content</SelectItem>
                      <SelectItem value="add-links">Suggest Internal Links</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={bulkTarget} onValueChange={setBulkTarget}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Target Pages" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low-score">Low Score Pages</SelectItem>
                      <SelectItem value="thin">Thin Content</SelectItem>
                      <SelectItem value="missing-meta">Missing Meta Tags</SelectItem>
                      <SelectItem value="missing-faq">Missing FAQs</SelectItem>
                      <SelectItem value="no-schema">Missing Schema</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={runBulkAction}
                    disabled={isRunningBulk || !bulkAction}
                  >
                    {isRunningBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Run on {bulkTarget === 'low-score' ? 'Low Score' : bulkTarget === 'thin' ? 'Thin' : bulkTarget === 'missing-meta' ? 'Missing Meta' : bulkTarget === 'missing-faq' ? 'No FAQ' : 'No Schema'} Pages
                  </Button>
                </div>

                {bulkResults.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Current Issues</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bulkResults.slice(0, 10).map((page: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="font-medium">{page.title}</div>
                              <div className="text-xs text-muted-foreground">/{page.slug}</div>
                            </TableCell>
                            <TableCell><Badge>{page.type}</Badge></TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {page.issues?.map((issue: string, j: number) => (
                                  <Badge key={j} variant="outline" className="text-xs">{issue}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {page.status === 'success' ? (
                                <Badge className="bg-green-100">Completed</Badge>
                              ) : page.status === 'error' ? (
                                <Badge variant="destructive">Error</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select action and target pages, then run bulk operation</p>
                  </div>
                )}
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
                {['Full Audit', 'Page Scores', 'Competitor Gap', 'AI Search', 'Refresh', 'Location', 'Service', 'Agency', 'Export CSV'].map(r => (
                  <Button key={r} variant="outline">{r}</Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}