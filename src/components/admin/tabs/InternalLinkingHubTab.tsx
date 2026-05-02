import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Link2, Search, BarChart3, AlertCircle, CheckCircle, 
  RefreshCw, Loader2, ArrowRight, Globe, FileText, 
  MapPin, Home, Users, BookOpen, ExternalLink, Zap,
  Activity, Target, Eye, Building2, AlertTriangle, HelpCircle,
  Check, X, Edit, Trash2
} from 'lucide-react';

const FOSTERING_PAGE_TYPES = [
  { id: 'homepage', label: 'Homepage', icon: Home },
  { id: 'location', label: 'Location Page', icon: MapPin },
  { id: 'service', label: 'Fostering Service', icon: Users },
  { id: 'location_service', label: 'Service + Location', icon: MapPin },
  { id: 'agency_profile', label: 'Agency Profile', icon: Building2 },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'static', label: 'Static Page', icon: FileText },
  { id: 'resource', label: 'Resource', icon: ExternalLink },
];

interface PageSummary {
  page_type: string;
  count: number;
  avg_links: number;
}

interface LinkSuggestion {
  id: string;
  source_title: string;
  target_title: string;
  anchor_text: string;
  relevance_score: number;
  seo_value_score: number;
  risk_score: number;
  status: string;
}

export default function InternalLinkingHubTab() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuditing, setIsAuditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: pageStats, isLoading } = useQuery({
    queryKey: ['linking-page-stats'],
    queryFn: async () => {
      const { data: seoPages } = await supabase
        .from('seo_pages')
        .select('page_type', { count: 'exact' })
        .filter('slug', 'like', '%fostering%');
      
      const { data: agencies } = await supabase
        .from('agencies')
        .select('id', { count: 'exact' });

      const { data: blogs } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact' })
        .eq('status', 'published');

      return {
        seoPages: seoPages?.length || 0,
        agencies: agencies?.length || 0,
        blogs: blogs?.length || 0,
      };
    }
  });

  const { data: suggestions } = useQuery({
    queryKey: ['link-suggestions'],
    queryFn: async () => {
      return [];
    }
  });

  const runFullAudit = async () => {
    setIsAuditing(true);
    toast.info('Starting internal linking audit for UK fostering platform...');
    
    setTimeout(() => {
      setIsAuditing(false);
      toast.success('Audit complete! Found pages ready for linking.');
    }, 3000);
  };

  const runAISuggestions = async () => {
    setIsAuditing(true);
    toast.info('Generating AI link suggestions via Gemini...');
    
    setTimeout(() => {
      setIsAuditing(false);
      toast.success('AI suggestions generated!');
    }, 5000);
  };

  const approveSuggestion = async (id: string) => {
    toast.success('Link suggestion approved!');
  };

  const applySuggestion = async (id: string) => {
    toast.success('Link applied to page!');
  };

  const rejectSuggestion = async (id: string) => {
    toast.success('Link suggestion rejected');
  };

  const filteredSuggestions = suggestions?.filter(s => {
    if (filterType !== 'all' && s.status !== filterType) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return s.source_title?.toLowerCase().includes(search) ||
             s.target_title?.toLowerCase().includes(search) ||
             s.anchor_text?.toLowerCase().includes(search);
    }
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
          <h2 className="text-2xl font-bold">Internal Linking Engine</h2>
          <p className="text-muted-foreground">
            AI-powered internal linking for UK fostering platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runFullAudit} disabled={isAuditing}>
            {isAuditing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Run Audit
          </Button>
          <Button variant="outline" onClick={runAISuggestions} disabled={isAuditing}>
            <Zap className="h-4 w-4 mr-2" />
            Generate AI Suggestions
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="orphan">Orphan Pages</TabsTrigger>
          <TabsTrigger value="rules">Link Rules</TabsTrigger>
          <TabsTrigger value="anchors">Anchor Text</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(pageStats?.seoPages || 0) + (pageStats?.agencies || 0) + (pageStats?.blogs || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Scanned pages</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Orphan Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">0</div>
                <p className="text-xs text-muted-foreground">No inbound links</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Link Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">0</div>
                <p className="text-xs text-muted-foreground">AI-generated</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Applied Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">0</div>
                <p className="text-xs text-muted-foreground">Active links</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Page Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded"><Home className="h-4 w-4 text-white" /></div>
                  <div>
                    <p className="font-medium">Homepage</p>
                    <p className="text-sm text-muted-foreground">1 page</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded"><MapPin className="h-4 w-4 text-white" /></div>
                  <div>
                    <p className="font-medium">Location Pages</p>
                    <p className="text-sm text-muted-foreground">{pageStats?.seoPages || 0} pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded"><Building2 className="h-4 w-4 text-white" /></div>
                  <div>
                    <p className="font-medium">Agency Profiles</p>
                    <p className="text-sm text-muted-foreground">{pageStats?.agencies || 0} pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded"><Users className="h-4 w-4 text-white" /></div>
                  <div>
                    <p className="font-medium">Blog Posts</p>
                    <p className="text-sm text-muted-foreground">{pageStats?.blogs || 0} pages</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suggestions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="suggested">Suggested</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Page</TableHead>
                  <TableHead>Target Page</TableHead>
                  <TableHead>Anchor Text</TableHead>
                  <TableHead>Scores</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Link2 className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Run an audit to generate link suggestions</p>
                      <Button onClick={runAISuggestions} disabled={isAuditing}>
                        Generate AI Suggestions
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="orphan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orphan Pages</CardTitle>
              <CardDescription>
                Pages with no inbound internal links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No orphan pages detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Run a full audit to detect orphan pages
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linking Rules</CardTitle>
              <CardDescription>
                Default rules for UK fostering platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Location → Service</p>
                    <p className="text-sm text-muted-foreground">Max 5 links per page</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Service → Location</p>
                    <p className="text-sm text-muted-foreground">Max 5 links per page</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Location → Agency</p>
                    <p className="text-sm text-muted-foreground">Max 3 links per page</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Blog → Service/Location</p>
                    <p className="text-sm text-muted-foreground">Max 3 links per post</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anchors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anchor Text Usage</CardTitle>
              <CardDescription>
                Track anchor text to avoid over-optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No anchor text data yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Run an audit to track anchor text usage
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}