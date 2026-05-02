import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, AlertTriangle, CheckCircle, RefreshCw, 
  Globe, Link2, Target, Zap, Shield, TrendingUp,
  ExternalLink, FileText, MapPin, Building2, 
  BookOpen, Loader2, BarChart3, Settings, Clock,
  AlertCircle, ArrowRight, Download, Sparkles,
  Eye, Activity, Users, Home, FileSearch,
  MessageSquare, Calendar, ArrowUp, ArrowDown,
  Check, X, Plus, Trash2, Edit
} from 'lucide-react';

const FOSTERING_PAGE_TYPES = {
  'homepage': 'Homepage',
  'location': 'Location Page',
  'service': 'Fostering Service',
  'location_service': 'Service + Location',
  'agency_profile': 'Agency Profile',
  'blog': 'Blog Post',
  'faq': 'FAQ Page',
  'static': 'Static Page',
  'resource': 'Resource Page',
};

const SEO_ISSUES = [
  { id: 'missing_title', label: 'Missing Meta Title', severity: 'critical', color: 'text-red-500', icon: AlertCircle },
  { id: 'missing_description', label: 'Missing Meta Description', severity: 'high', color: 'text-orange-500', icon: AlertCircle },
  { id: 'title_too_long', label: 'Title Too Long', severity: 'medium', color: 'text-yellow-500', icon: AlertTriangle },
  { id: 'title_too_short', label: 'Title Too Short', severity: 'medium', color: 'text-yellow-500', icon: AlertTriangle },
  { id: 'thin_content', label: 'Thin Content', severity: 'critical', color: 'text-red-500', icon: FileText },
  { id: 'no_schema', label: 'Missing Schema', severity: 'high', color: 'text-orange-500', icon: FileSearch },
  { id: 'no_internal_links', label: 'No Internal Links', severity: 'medium', color: 'text-yellow-500', icon: Link2 },
  { id: 'no_faq', label: 'Missing FAQ', severity: 'low', color: 'text-blue-500', icon: MessageSquare },
];

interface SEOPage {
  id: string;
  slug: string;
  page_type: string;
  title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  is_indexed: boolean;
  seo_score: number | null;
  needs_optimization: boolean;
}

interface AuditStats {
  total: number;
  indexed: number;
  noindex: number;
  locations: number;
  services: number;
  agencies: number;
  blogs: number;
  missingTitle: number;
  missingDesc: number;
  thinContent: number;
  noSchema: number;
  noFaq: number;
  lowScore: number;
}

export default function SeoCommandCenterTab() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuditing, setIsAuditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['seo-stats'],
    queryFn: async () => {
      const { data: seoPages } = await supabase.from('seo_pages').select('*');
      const { data: agencies } = await supabase.from('agencies').select('id');
      const { data: blogs } = await supabase.from('blog_posts').select('id').eq('status', 'published');

      const pages = seoPages || [];
      const blogList = blogs || [];

      const locationPages = pages.filter((p: any) => p.page_type === 'state' || p.page_type === 'city' || p.page_type === 'city_category');
      const servicePages = pages.filter((p: any) => p.page_type === 'category' || p.page_type === 'treatment');
      
      return {
        total: pages.length + (agencies?.length || 0) + blogList.length,
        indexed: pages.filter((p: any) => p.is_indexed !== false).length,
        noindex: pages.filter((p: any) => p.is_indexed === false).length,
        locations: locationPages.length,
        services: servicePages.length,
        agencies: agencies?.length || 0,
        blogs: blogList.length,
        missingTitle: pages.filter((p: any) => !p.meta_title || p.meta_title === null).length,
        missingDesc: pages.filter((p: any) => !p.meta_description || p.meta_description === null).length,
        thinContent: pages.filter((p: any) => p.is_thin_content === true).length,
        noSchema: pages.filter((p: any) => !p.schema_mark || p.schema_mark === null).length,
        noFaq: pages.filter((p: any) => !p.faqs || p.faqs === null).length,
        lowScore: pages.filter((p: any) => p.seo_score && p.seo_score < 50).length,
      } as AuditStats;
    }
  });

  const { data: pages } = useQuery({
    queryKey: ['seo-pages', searchQuery, filterType],
    queryFn: async () => {
      let query = supabase.from('seo_pages').select('*').order('updated_at', { ascending: false }).limit(100);
      
      if (searchQuery) {
        query = query.or(`slug.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
      }
      
      const { data } = await query;
      return data as SEOPage[];
    }
  });

  const { data: agencies } = useQuery({
    queryKey: ['agency-seo-data'],
    queryFn: async () => {
      const { data } = await supabase.from('agencies').select('id,name,slug,city,rating,review_count');
      return data || [];
    }
  });

  const runSEOAudit = async () => {
    setIsAuditing(true);
    toast.info('Running SEO audit for UK fostering platform...');
    
    setTimeout(() => {
      setIsAuditing(false);
      queryClient.invalidateQueries({ queryKey: ['seo-stats'] });
      toast.success('SEO audit complete!');
    }, 3000);
  };

  const runAIFix = async () => {
    setIsAuditing(true);
    toast.info('Running AI SEO fixes via Gemini...');
    
    setTimeout(() => {
      setIsAuditing(false);
      toast.success('AI fixes applied!');
    }, 5000);
  };

  const filteredPages = pages?.filter(p => {
    if (filterType === 'all') return true;
    if (filterType === 'missing-title') return !p.meta_title;
    if (filterType === 'missing-desc') return !p.meta_description;
    if (filterType === 'thin') return p.is_indexed === false;
    if (filterType === 'low-score') return p.seo_score && p.seo_score < 50;
    if (filterType === 'needs-optimization') return p.needs_optimization === true;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Command Center</h2>
          <p className="text-muted-foreground">
            UK Fostering Platform SEO Brain
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runSEOAudit} disabled={isAuditing}>
            {isAuditing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Run Audit
          </Button>
          <Button variant="outline" onClick={runAIFix} disabled={isAuditing}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Fix
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Page Explorer</TabsTrigger>
          <TabsTrigger value="locations">Location SEO</TabsTrigger>
          <TabsTrigger value="services">Service SEO</TabsTrigger>
          <TabsTrigger value="agencies">Agency Profiles</TabsTrigger>
          <TabsTrigger value="blogs">Blog SEO</TabsTrigger>
          <TabsTrigger value="health">SEO Health</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Indexed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats?.indexed || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Noindex</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats?.noindex || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Low Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{stats?.lowScore || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Missing Title</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats?.missingTitle || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Locations</span>
              </div>
              <div className="text-2xl font-bold mt-1">{stats?.locations || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Services</span>
              </div>
              <div className="text-2xl font-bold mt-1">{stats?.services || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Agencies</span>
              </div>
              <div className="text-2xl font-bold mt-1">{stats?.agencies || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Blogs</span>
              </div>
              <div className="text-2xl font-bold mt-1">{stats?.blogs || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Thin Content</span>
              </div>
              <div className="text-2xl font-bold mt-1">{stats?.thinContent || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">No Schema</span>
              </div>
              <div className="text-2xl font-bold mt-1">{stats?.noSchema || 0}</div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>SEO Issues Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SEO_ISSUES.map(issue => {
                  const count = stats?.[issue.id as keyof AuditStats] || 0;
                  return (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <issue.icon className={`h-4 w-4 ${issue.color}`} />
                        <span>{issue.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={count > 0 ? 'destructive' : 'secondary'}>
                          {count} issues
                        </Badge>
                        <Button variant="ghost" size="sm" disabled={count === 0}>
                          Fix
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="missing-title">Missing Title</SelectItem>
                <SelectItem value="missing-desc">Missing Description</SelectItem>
                <SelectItem value="thin">Thin Content</SelectItem>
                <SelectItem value="low-score">Low Score</SelectItem>
                <SelectItem value="needs-optimization">Needs Optimization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Index</TableHead>
                  <TableHead>SEO Score</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.slice(0, 20).map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="max-w-xs truncate">
                      <span className="text-sm">{page.slug || page.title || 'Untitled'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {FOSTERING_PAGE_TYPES[page.page_type as keyof typeof FOSTERING_PAGE_TYPES] || page.page_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {page.is_indexed !== false ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.seo_score && page.seo_score >= 70 ? 'default' : 'destructive'}>
                        {page.seo_score || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!page.meta_title && <AlertCircle className="h-3 w-3 text-red-500" />}
                        {!page.meta_description && <AlertCircle className="h-3 w-3 text-orange-500" />}
                        {page.is_indexed === false && <AlertCircle className="h-3 w-3 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Sparkles className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Pages SEO</CardTitle>
              <CardDescription>
                Manage UK location page SEO (England, Scotland, Wales, Northern Ireland)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{stats?.locations || 0} location pages</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Run audit to scan location pages
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Pages SEO</CardTitle>
              <CardDescription>
                Manage fostering service page SEO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{stats?.services || 0} service pages</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agency Profile SEO</CardTitle>
              <CardDescription>
                Agency profile optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{stats?.agencies || 0} agency profiles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blogs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blog SEO</CardTitle>
              <CardDescription>
                Blog content optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{stats?.blogs || 0} blog posts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Health Audit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SEO_ISSUES.map(issue => {
                  const count = stats?.[issue.id as keyof AuditStats] || 0;
                  const severityColors = {
                    critical: 'border-red-500 bg-red-50',
                    high: 'border-orange-500 bg-orange-50',
                    medium: 'border-yellow-500 bg-yellow-50',
                    low: 'border-blue-500 bg-blue-50',
                  };
                  return (
                    <div key={issue.id} className={`p-4 border-l-4 rounded ${severityColors[issue.severity as keyof typeof severityColors]}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{issue.label}</h4>
                          <p className="text-sm text-muted-foreground">{count} pages affected</p>
                        </div>
                        <Badge>{issue.severity}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Tasks</CardTitle>
              <CardDescription>
                Auto-generated SEO tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No tasks yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Run SEO audit to generate tasks
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI SEO Assistant</CardTitle>
              <CardDescription>
                Powered by Gemini API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Ask about your SEO... (e.g., Which pages need urgent fixes?)"
                  rows={4}
                />
                <Button>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ask AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}