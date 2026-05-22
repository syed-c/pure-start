import { useState, useEffect, useMemo, type ClipboardEvent } from 'react';
import { useAdminBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, getPostContentAsString } from '@/hooks/useAdminBlog';
import { useCheckBlogSimilarity, useSuggestInternalLinks, useAutoAssignCluster, useBlogTopicClusters, useCreateTopicCluster, useDeleteTopicCluster } from '@/hooks/useBlogAntiCannibalization';
import { useBlogCategories, useAllBlogCategories, useCreateBlogCategory, useUpdateBlogCategory, useDeleteBlogCategory, useBlogAuthors, useAllBlogAuthors, useCreateBlogAuthor, useUpdateBlogAuthor, useDeleteBlogAuthor, useBlogAIAssistant, useGenerateFeaturedImage, generateSlug } from '@/hooks/useBlogManagement';
import { validateMetadata } from '@/hooks/useSeoValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { BookOpen, Search, Plus, Edit, Trash2, Eye, EyeOff, AlertTriangle, Link2, Loader2, Sparkles, FileText, Users, Tags, Settings, ChevronDown, ChevronRight, ChevronUp, ChevronLeft, Wand2, ExternalLink, RefreshCw, FolderTree, ImageIcon, Lightbulb, ArrowUpDown, CheckCheck, Copy, BarChart3, FileWarning, Columns3, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import BlogContentBlockEditor, { type ContentBlock, blocksToMarkdown, markdownToBlocks } from '@/components/admin/blog/BlogContentBlockEditor';
import AgencyListInserter from '@/components/admin/blog/AgencyListInserter';
import FAQGeneratorInserter from '@/components/admin/blog/FAQGeneratorInserter';
import BlogTopicsLibrary from '@/components/admin/blog/BlogTopicsLibrary';

type MainTab = 'posts' | 'categories' | 'authors' | 'clusters' | 'topics';

export default function BlogTab() {
  const [mainTab, setMainTab] = useState<MainTab>('posts');
  const [filters, setFilters] = useState({ status: '', search: '', category: '', author: '', cluster: '', missingMeta: false, dateFrom: '', dateTo: '', sortBy: 'created_at' as string, sortDir: 'desc' as 'asc' | 'desc' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewPost, setPreviewPost] = useState<any>(null);
  const { data: posts, isLoading } = useAdminBlogPosts();
  const { data: topicClusters } = useBlogTopicClusters();
  const { data: categories } = useBlogCategories();
  const { data: allCategories } = useAllBlogCategories();
  const { data: authors } = useBlogAuthors();
  const { data: allAuthors } = useAllBlogAuthors();
  
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const checkSimilarity = useCheckBlogSimilarity();
  const suggestLinks = useSuggestInternalLinks();
  const autoAssignCluster = useAutoAssignCluster();
  const createCategory = useCreateBlogCategory();
  const updateCategory = useUpdateBlogCategory();
  const deleteCategory = useDeleteBlogCategory();
  const createAuthor = useCreateBlogAuthor();
  const updateAuthor = useUpdateBlogAuthor();
  const deleteAuthor = useDeleteBlogAuthor();
  const createCluster = useCreateTopicCluster();
  const deleteCluster = useDeleteTopicCluster();
  const aiAssistant = useBlogAIAssistant();
  const generateImage = useGenerateFeaturedImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [similarityWarning, setSimilarityWarning] = useState<any>(null);
  const [internalLinkSuggestions, setInternalLinkSuggestions] = useState<any[]>([]);
  const [insertedLinks, setInsertedLinks] = useState<Set<number>>(new Set());
  const [seoValidation, setSeoValidation] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  // Category/Author/Cluster management dialogs
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [authorDialog, setAuthorDialog] = useState(false);
  const [clusterDialog, setClusterDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [editingCluster, setEditingCluster] = useState<any>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    author_id: '',
    author_name: '',
    seo_title: '',
    seo_description: '',
    featured_image_url: '',
    status: 'draft' as 'draft' | 'published',
    is_featured: false,
    topic_cluster_id: '',
  });

  // Block-based content editor state
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [useBlockEditor, setUseBlockEditor] = useState(true);

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', color: '#6366f1', is_active: true });
  const [authorForm, setAuthorForm] = useState({ name: '', email: '', bio: '', role: 'Author', is_active: true });
  const [clusterForm, setClusterForm] = useState({ cluster_name: '', primary_keyword: '', related_keywords: '', intent_type: 'informational' });

  // Auto-generate slug when title changes
  useEffect(() => {
    if (form.title && !editing) {
      setForm(prev => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [form.title, editing]);

  // Validate SEO on form change
  useEffect(() => {
    if (form.seo_title || form.seo_description) {
      const validation = validateMetadata(form.seo_title, form.seo_description, form.title);
      setSeoValidation(validation);
    }
  }, [form.seo_title, form.seo_description, form.title]);

  // Get content for AI operations - check blocks first, then form.content
  const getContentForAI = () => {
    if (useBlockEditor && contentBlocks.length > 0) {
      return blocksToMarkdown(contentBlocks);
    }
    return form.content;
  };

  // AI Generation handlers
  const handleGenerateExcerpt = async () => {
    const content = getContentForAI();
    if (!form.title || !content) {
      toast.error('Title and content required - add some content blocks first');
      return;
    }
    try {
      const result = await aiAssistant.mutateAsync({ action: 'generate_excerpt', title: form.title, content });
      if (result.raw) {
        setForm(prev => ({ ...prev, excerpt: result.raw.replace(/^["']|["']$/g, '') }));
        toast.success('Excerpt generated');
      }
    } catch (e) {
      toast.error('Failed to generate excerpt');
    }
  };

  const handleGenerateSEO = async () => {
    const content = getContentForAI();
    if (!form.title || !content) {
      toast.error('Title and content required - add some content blocks first');
      return;
    }
    try {
      const result = await aiAssistant.mutateAsync({ action: 'generate_seo', title: form.title, content });
      if (result.seo_title && result.seo_description) {
        setForm(prev => ({ ...prev, seo_title: result.seo_title, seo_description: result.seo_description }));
        toast.success('SEO metadata generated');
      }
    } catch (e) {
      toast.error('Failed to generate SEO');
    }
  };

  const handleDetectCluster = async () => {
    const content = getContentForAI();
    if (!form.title || !content) {
      toast.error('Title and content required - add some content blocks first');
      return;
    }
    try {
      const result = await aiAssistant.mutateAsync({ action: 'detect_topic_cluster', title: form.title, content });
      setAiSuggestions(prev => ({ ...prev, cluster: result }));
      
      // Also try to match with existing clusters
      const clusterResult = await autoAssignCluster.mutateAsync({ title: form.title, content });
      if (clusterResult.cluster) {
        setForm(prev => ({ ...prev, topic_cluster_id: clusterResult.cluster.id }));
        toast.success(`Matched to cluster: ${clusterResult.cluster.cluster_name}`);
      } else if (result.cluster_name) {
        toast.info(`Suggested new cluster: ${result.cluster_name}`);
      }
    } catch (e) {
      toast.error('Failed to detect cluster');
    }
  };

  const handleGetLinkSuggestions = async () => {
    // Get content from blocks if using block editor
    const contentToAnalyze = useBlockEditor ? blocksToMarkdown(contentBlocks) : form.content;
    
    if (!contentToAnalyze || contentToAnalyze.trim().length < 50) {
      toast.error('Add more content before analyzing for links');
      return;
    }
    
    try {
      toast.info('Analyzing content for internal linking opportunities...');
      
      // Use both local keyword matching and AI analysis
      const [localResult, aiResult] = await Promise.all([
        suggestLinks.mutateAsync({ content: contentToAnalyze, category: form.category }),
        aiAssistant.mutateAsync({ action: 'suggest_internal_links', content: contentToAnalyze }),
      ]);
      
      const combined: any[] = [];
      
      // Add local suggestions
      if (localResult.suggestions) {
        combined.push(...localResult.suggestions.map((s: any) => ({
          text: s.text,
          anchor_text: s.text,
          url: s.url,
          type: s.type,
          reason: `Found "${s.text}" mentioned in content`,
        })));
      }
      
      // Add AI suggestions (avoiding duplicates)
      if (aiResult.links) {
        for (const link of aiResult.links) {
          const exists = combined.some(c => c.url === link.url || c.url === link.suggested_url);
          if (!exists) {
            combined.push({
              text: link.anchor_text,
              anchor_text: link.anchor_text,
              url: link.url || link.suggested_url,
              type: link.type,
              reason: link.reason,
            });
          }
        }
      }
      
      setInternalLinkSuggestions(combined.slice(0, 20));
      setInsertedLinks(new Set()); // Reset inserted state when new suggestions are fetched
      
      if (combined.length > 0) {
        toast.success(`Found ${combined.length} internal linking opportunities`);
      } else {
        toast.info('No internal linking opportunities found. Try adding more relevant content.');
      }
    } catch (e) {
      console.error('Link suggestion error:', e);
      toast.error('Failed to analyze content for links');
    }
  };

  // Auto-insert internal link into content
  const handleInsertLink = (link: any, index: number) => {
    const anchorText = link.text || link.anchor_text;
    const url = link.url;
    
    if (!anchorText || !url) {
      toast.error('Invalid link data');
      return;
    }
    
    // Create markdown link
    const markdownLink = `[${anchorText}](${url})`;
    
    if (useBlockEditor) {
      // For block editor, update blocks - content is in the 'content' property for both heading and image blocks
      const updatedBlocks = contentBlocks.map(block => {
        // Check if block has content property and it contains the anchor text
        if (block.content) {
          const regex = new RegExp(`\\b${escapeRegex(anchorText)}\\b`, 'i');
          if (regex.test(block.content)) {
            return {
              ...block,
              content: block.content.replace(regex, markdownLink)
            };
          }
        }
        // Also check headingText for heading blocks
        if (block.type === 'heading' && block.headingText) {
          const regex = new RegExp(`\\b${escapeRegex(anchorText)}\\b`, 'i');
          if (regex.test(block.headingText)) {
            return {
              ...block,
              headingText: block.headingText.replace(regex, markdownLink)
            };
          }
        }
        return block;
      });
      
      // Check if any block was updated
      const wasUpdated = updatedBlocks.some((block, i) => {
        const original = contentBlocks[i];
        return block.content !== original?.content || block.headingText !== original?.headingText;
      });
      
      if (wasUpdated) {
        setContentBlocks(updatedBlocks);
        setInsertedLinks(prev => new Set([...prev, index]));
        toast.success(`Linked "${anchorText}" → ${url}`);
      } else {
        toast.error(`Could not find "${anchorText}" in content`);
      }
    } else {
      // For raw markdown editor
      const regex = new RegExp(`\\b${escapeRegex(anchorText)}\\b`, 'i');
      
      if (regex.test(form.content)) {
        const newContent = form.content.replace(regex, markdownLink);
        setForm(prev => ({ ...prev, content: newContent }));
        setInsertedLinks(prev => new Set([...prev, index]));
        toast.success(`Linked "${anchorText}" → ${url}`);
      } else {
        toast.error(`Could not find "${anchorText}" in content`);
      }
    }
  };
  
  // Insert all suggested links at once
  const handleInsertAllLinks = () => {
    let successCount = 0;
    let content = useBlockEditor ? blocksToMarkdown(contentBlocks) : form.content;
    const newInserted = new Set(insertedLinks);
    
    internalLinkSuggestions.forEach((link, index) => {
      if (insertedLinks.has(index)) return; // Skip already inserted
      
      const anchorText = link.text || link.anchor_text;
      const url = link.url;
      if (!anchorText || !url) return;
      
      const markdownLink = `[${anchorText}](${url})`;
      const regex = new RegExp(`\\b${escapeRegex(anchorText)}\\b`, 'i');
      
      if (regex.test(content)) {
        content = content.replace(regex, markdownLink);
        newInserted.add(index);
        successCount++;
      }
    });
    
    if (successCount > 0) {
      if (useBlockEditor) {
        setContentBlocks(markdownToBlocks(content));
      } else {
        setForm(prev => ({ ...prev, content }));
      }
      setInsertedLinks(newInserted);
      toast.success(`Inserted ${successCount} internal links`);
    } else {
      toast.info('No matching text found for remaining links');
    }
  };
  
  // Helper to escape regex special characters
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const handleGenerateFeaturedImage = async () => {
    if (!form.title) {
      toast.error('Title required to generate image');
      return;
    }
    try {
      toast.info('Generating featured image...');
      const result = await generateImage.mutateAsync({ title: form.title });
      if (result.imageUrl) {
        setForm(prev => ({ ...prev, featured_image_url: result.imageUrl }));
        toast.success('Featured image generated');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (e: any) {
      toast.error(e?.message ? String(e.message) : 'Failed to generate image');
    }
  };

  const handlePasteWithLinks = (e: ClipboardEvent<HTMLTextAreaElement>, field: 'content' | 'excerpt') => {
    const html = e.clipboardData?.getData('text/html');
    if (!html || !html.includes('<a')) return;

    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href')?.trim();
      if (!href) return;
      const text = (a.textContent || href).trim();
      a.replaceWith(doc.createTextNode(`[${text}](${href})`));
    });

    const pasted = (doc.body as any).innerText || doc.body.textContent || '';
    if (!pasted.trim()) return;

    e.preventDefault();

    const target = e.currentTarget;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? start;

    setForm((prev) => {
      const current = (prev[field] || '') as string;
      const next = current.slice(0, start) + pasted + current.slice(end);
      return { ...prev, [field]: next } as any;
    });

    requestAnimationFrame(() => {
      try {
        target.selectionStart = target.selectionEnd = start + pasted.length;
      } catch {
        // ignore
      }
    });
  };

  const handleCheckSimilarity = async () => {
    if (form.title && form.content) {
      const result = await checkSimilarity.mutateAsync({
        title: form.title,
        content: form.content,
        excludeId: editing?.id,
      });
      setSimilarityWarning(result.hasSimilarPosts ? result : null);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast.error('Title and slug are required');
      return;
    }
    
    if (form.status === 'published' && similarityWarning?.highestSimilarity > 60) {
      toast.error('Cannot publish: too similar to existing content');
      return;
    }

    // Get author name from selected author if author_id is set
    let authorName = form.author_name;
    if (form.author_id) {
      const selectedAuthor = authors?.find(a => a.id === form.author_id);
      if (selectedAuthor) authorName = selectedAuthor.name;
    }

    // Convert blocks to markdown if using block editor
    const finalContent = useBlockEditor ? blocksToMarkdown(contentBlocks) : form.content;
    
    const saveData = {
      ...form,
      content: finalContent,
      author_name: authorName,
      author_id: form.author_id || null,
      topic_cluster_id: form.topic_cluster_id || null,
    };
    
    if (editing) {
      await updatePost.mutateAsync({ id: editing.id, updates: saveData });
    } else {
      await createPost.mutateAsync(saveData);
    }
    
    resetForm();
    setDialogOpen(false);
  };

  const resetForm = () => {
    setEditing(null);
    setSimilarityWarning(null);
    setInternalLinkSuggestions([]);
    setAiSuggestions(null);
    setShowAIPanel(false);
    setContentBlocks([]);
    setForm({
      title: '', slug: '', excerpt: '', content: '', category: '',
      author_id: '', author_name: '', seo_title: '', seo_description: '',
      featured_image_url: '', status: 'draft', is_featured: false, topic_cluster_id: '',
    });
  };

  const openEdit = (post: any) => {
    setEditing(post);
    const existingContent = getPostContentAsString(post);
    setContentBlocks(markdownToBlocks(existingContent));
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: existingContent,
      category: post.category || '',
      author_id: post.author_id || '',
      author_name: post.author_name || '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      featured_image_url: post.featured_image_url || '',
      status: post.status || 'draft',
      is_featured: post.is_featured,
      topic_cluster_id: post.topic_cluster_id || '',
    });
    setSimilarityWarning(null);
    setInternalLinkSuggestions([]);
    setDialogOpen(true);
  };

  const enrichedPosts = useMemo(() => (posts || []).map(p => {
    const contentStr = getPostContentAsString(p);
    const wordCount = contentStr ? contentStr.split(/\s+/).filter(Boolean).length : 0;
    const hasMeta = !!(p.seo_title && p.seo_description);
    return { ...p, _wordCount: wordCount, _hasMeta: hasMeta };
  }), [posts]);

  const filteredPosts = useMemo(() => enrichedPosts.filter(p => {
    if (filters.search && !p.title?.toLowerCase().includes(filters.search.toLowerCase()) && !p.slug?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.author && filters.author !== 'all' && p.author_name !== filters.author) return false;
    if (filters.cluster && filters.cluster !== 'all' && p.topic_cluster_id !== filters.cluster) return false;
    if (filters.missingMeta && p._hasMeta) return false;
    if (filters.dateFrom && p.created_at && new Date(p.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && p.created_at && new Date(p.created_at) > new Date(filters.dateTo + 'T23:59:59')) return false;
    return true;
  }).sort((a, b) => {
    const dir = filters.sortDir === 'asc' ? 1 : -1;
    if (filters.sortBy === 'title') return dir * (a.title || '').localeCompare(b.title || '');
    if (filters.sortBy === 'word_count') return dir * ((a as any)._wordCount - (b as any)._wordCount);
    if (filters.sortBy === 'status') return dir * ((a.status || '').localeCompare(b.status || ''));
    return dir * (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
  }), [enrichedPosts, filters]);

  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const pagedPosts = filteredPosts.slice(page * pageSize, (page + 1) * pageSize);

  const publishedCount = posts?.filter(p => p.status === 'published').length || 0;
  const draftCount = posts?.filter(p => p.status === 'draft').length || 0;
  const featuredCount = posts?.filter(p => p.is_featured).length || 0;
  const missingMetaCount = enrichedPosts.filter(p => !p._hasMeta).length;
  const thinContentCount = enrichedPosts.filter(p => p._wordCount > 0 && p._wordCount < 300).length;
  const avgWordCount = enrichedPosts.length ? Math.round(enrichedPosts.reduce((s, p) => s + (p as any)._wordCount, 0) / enrichedPosts.length) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Blog Management</h1>
          <p className="text-muted-foreground mt-1">Create, manage, and optimize blog content</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Topics Library
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="authors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Authors
          </TabsTrigger>
          <TabsTrigger value="clusters" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            Clusters
          </TabsTrigger>
        </TabsList>

        {/* Topics Library Tab */}
        <TabsContent value="topics" className="space-y-6">
          <BlogTopicsLibrary />
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="card-modern">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold">{enrichedPosts.length}</p>
                  <p className="text-xs text-muted-foreground truncate">Total Posts</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold">{publishedCount}</p>
                  <p className="text-xs text-muted-foreground truncate">Published</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <EyeOff className="h-5 w-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold">{draftCount}</p>
                  <p className="text-xs text-muted-foreground truncate">Drafts</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold">{featuredCount}</p>
                  <p className="text-xs text-muted-foreground truncate">Featured</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <FileWarning className="h-5 w-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold">{missingMetaCount}</p>
                  <p className="text-xs text-muted-foreground truncate">Missing Meta</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold">{avgWordCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground truncate">Avg Words</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Actions */}
          <Card className="card-modern">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={filters.search}
                    onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(0); }}
                    className="pl-10"
                  />
                </div>
                <Select value={filters.status || 'all'} onValueChange={(v) => { setFilters({ ...filters, status: v === 'all' ? '' : v }); setPage(0); }}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.category || 'all'} onValueChange={(v) => { setFilters({ ...filters, category: v }); setPage(0); }}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.author || 'all'} onValueChange={(v) => { setFilters({ ...filters, author: v }); setPage(0); }}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {authors?.map(author => (
                      <SelectItem key={author.id} value={author.name}>{author.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.cluster || 'all'} onValueChange={(v) => { setFilters({ ...filters, cluster: v }); setPage(0); }}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clusters</SelectItem>
                    {topicClusters?.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.cluster_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10">
                      <Calendar className="h-4 w-4 mr-2" />
                      {filters.dateFrom || filters.dateTo ? 'Date Range' : 'Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">From</Label>
                        <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">To</Label>
                        <Input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
                      </div>
                      {(filters.dateFrom || filters.dateTo) && (
                        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setFilters({ ...filters, dateFrom: '', dateTo: '' })}>Clear</Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant={filters.missingMeta ? 'default' : 'outline'} size="sm" className="h-10" onClick={() => { setFilters({ ...filters, missingMeta: !filters.missingMeta }); setPage(0); }}>
                        <FileWarning className="h-4 w-4 mr-1" />
                        Missing SEO
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Show only posts missing SEO title/description</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex-1" />
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetForm()}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {editing ? 'Edit Post' : 'New Post'}
                        <Button variant="ghost" size="sm" onClick={() => setShowAIPanel(!showAIPanel)} className="ml-auto">
                          <Wand2 className="h-4 w-4 mr-1" />
                          AI Tools
                        </Button>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
                      {/* Main Form */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input 
                            value={form.title} 
                            onChange={(e) => setForm({ ...form, title: e.target.value })} 
                            placeholder="Enter post title" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Slug *</Label>
                            <div className="flex gap-2">
                              <Input 
                                value={form.slug} 
                                onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                                placeholder="post-slug" 
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={() => setForm({ ...form, slug: generateSlug(form.title) })}
                                title="Regenerate slug"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={form.category || 'none'} onValueChange={(v) => setForm({ ...form, category: v === 'none' ? '' : v })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {categories?.map(cat => (
                                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Author</Label>
                            <Select value={form.author_id || 'none'} onValueChange={(v) => setForm({ ...form, author_id: v === 'none' ? '' : v })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select author" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {authors?.map(author => (
                                  <SelectItem key={author.id} value={author.id}>{author.name} ({author.role})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Featured Image</Label>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleGenerateFeaturedImage}
                                disabled={generateImage.isPending || !form.title}
                                title="Generate AI image based on title"
                              >
                                {generateImage.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                                Generate
                              </Button>
                            </div>
                            <Input 
                              value={form.featured_image_url} 
                              onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })} 
                              placeholder="https://... or generate with AI" 
                            />
                            {form.featured_image_url && (
                              <div className="mt-2 relative w-full h-24 rounded-md overflow-hidden border">
                                <img 
                                  src={form.featured_image_url} 
                                  alt="Featured preview" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Excerpt</Label>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={handleGenerateExcerpt}
                              disabled={aiAssistant.isPending}
                            >
                              {aiAssistant.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                              Generate
                            </Button>
                          </div>
                          <Textarea 
                            value={form.excerpt} 
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })} 
                            placeholder="Brief summary..." 
                            rows={2} 
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Content</Label>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">Block Editor</Label>
                              <Switch
                                checked={useBlockEditor}
                                onCheckedChange={(checked) => {
                                  if (!checked) {
                                    // Switching to raw: convert blocks to markdown
                                    setForm(prev => ({ ...prev, content: blocksToMarkdown(contentBlocks) }));
                                  } else {
                                    // Switching to blocks: parse markdown
                                    setContentBlocks(markdownToBlocks(form.content));
                                  }
                                  setUseBlockEditor(checked);
                                }}
                              />
                            </div>
                          </div>
                          
                          {useBlockEditor ? (
                            <BlogContentBlockEditor
                              blocks={contentBlocks}
                              onChange={setContentBlocks}
                              blogTitle={form.title}
                            />
                          ) : (
                            <Textarea 
                              value={form.content} 
                              onChange={(e) => setForm({ ...form, content: e.target.value })}
                              onPaste={(e) => handlePasteWithLinks(e, 'content')}
                              placeholder="Write your post content here (Markdown supported)..." 
                              rows={12}
                              className="font-mono text-sm"
                            />
                          )}
                        </div>

                        {/* Similarity Warning */}
                        {similarityWarning && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Similar content detected!</strong> {similarityWarning.highestSimilarity}% similar to existing posts.
                              {similarityWarning.highestSimilarity > 60 && (
                                <p className="mt-1 font-medium">Cannot publish until similarity is reduced.</p>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Agency List Inserter */}
                        <AgencyListInserter
                          blocks={contentBlocks}
                          onInsert={(newBlocks, insertAfterIndex) => {
                            if (useBlockEditor) {
                              if (insertAfterIndex === null) {
                                // Insert at end
                                setContentBlocks(prev => [...prev, ...newBlocks]);
                              } else if (insertAfterIndex === -1) {
                                // Insert at beginning
                                setContentBlocks(prev => [...newBlocks, ...prev]);
                              } else {
                                // Insert after specific index
                                setContentBlocks(prev => [
                                  ...prev.slice(0, insertAfterIndex + 1),
                                  ...newBlocks,
                                  ...prev.slice(insertAfterIndex + 1),
                                ]);
                              }
                            } else {
                              // Convert blocks to markdown and append
                              const markdown = blocksToMarkdown(newBlocks);
                              setForm(prev => ({ ...prev, content: prev.content + '\n\n' + markdown }));
                            }
                          }}
                        />

                        {/* FAQ Generator Inserter */}
                        <FAQGeneratorInserter
                          blocks={contentBlocks}
                          blogTitle={form.title}
                          blogContent={useBlockEditor ? blocksToMarkdown(contentBlocks) : form.content}
                          onInsert={(newBlocks, insertAfterIndex) => {
                            if (useBlockEditor) {
                              if (insertAfterIndex === null) {
                                setContentBlocks(prev => [...prev, ...newBlocks]);
                              } else if (insertAfterIndex === -1) {
                                setContentBlocks(prev => [...newBlocks, ...prev]);
                              } else {
                                setContentBlocks(prev => [
                                  ...prev.slice(0, insertAfterIndex + 1),
                                  ...newBlocks,
                                  ...prev.slice(insertAfterIndex + 1),
                                ]);
                              }
                            } else {
                              const markdown = blocksToMarkdown(newBlocks);
                              setForm(prev => ({ ...prev, content: prev.content + '\n\n' + markdown }));
                            }
                          }}
                        />

                        {/* AI Internal Linking Section */}
                        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-primary" />
                                AI Internal Linking
                              </CardTitle>
                              <div className="flex gap-1">
                                {internalLinkSuggestions.length > 0 && insertedLinks.size < internalLinkSuggestions.length && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleInsertAllLinks}
                                    title="Insert all links into content"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Insert All
                                  </Button>
                                )}
                                <Button 
                                  type="button" 
                                  variant="default" 
                                  size="sm" 
                                  onClick={handleGetLinkSuggestions}
                                  disabled={suggestLinks.isPending || aiAssistant.isPending || (!form.content && contentBlocks.length === 0)}
                                >
                                  {(suggestLinks.isPending || aiAssistant.isPending) ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Sparkles className="h-3 w-3 mr-1" />
                                  )}
                                  Analyze
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              AI scans your content and suggests links to services, locations, blogs, and agencies
                            </p>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            {internalLinkSuggestions.length > 0 ? (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {internalLinkSuggestions.map((link, i) => {
                                  const isInserted = insertedLinks.has(i);
                                  return (
                                    <div 
                                      key={i} 
                                      className={`p-2 rounded-md border text-xs transition-colors ${
                                        isInserted 
                                          ? 'bg-teal/10 border-teal/30' 
                                          : 'bg-background hover:border-primary/50'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-foreground truncate">
                                            "{link.text || link.anchor_text}"
                                          </p>
                                          <a 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                                          >
                                            <span className="truncate">{link.url}</span>
                                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                          </a>
                                          {link.reason && (
                                            <p className="text-muted-foreground mt-0.5 line-clamp-2">{link.reason}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          {link.type && (
                                            <Badge variant="secondary" className="text-[10px]">
                                              {link.type}
                                            </Badge>
                                          )}
                                          {isInserted ? (
                                            <Badge className="bg-teal text-white text-[10px]">
                                              ✓ Inserted
                                            </Badge>
                                          ) : (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 px-2 text-[10px]"
                                              onClick={() => handleInsertLink(link, i)}
                                              title="Insert this link into content"
                                            >
                                              <Plus className="h-3 w-3 mr-0.5" />
                                              Insert
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground text-xs">
                                <Link2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p>Click "Analyze" to find internal linking opportunities</p>
                                <p className="mt-1">AI will scan your content and match it with existing pages</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Sidebar */}
                      <div className="space-y-4">
                        {/* Publish Settings */}
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm">Publish</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 space-y-4">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select value={form.status} onValueChange={(v: 'draft' | 'published') => setForm({ ...form, status: v })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between">
                              <Label>Featured</Label>
                              <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                            </div>
                          </CardContent>
                        </Card>

                        {/* SEO Settings */}
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">SEO</CardTitle>
                              <Button type="button" variant="ghost" size="sm" onClick={handleGenerateSEO} disabled={aiAssistant.isPending}>
                                {aiAssistant.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">SEO Title</Label>
                              <Input 
                                value={form.seo_title} 
                                onChange={(e) => setForm({ ...form, seo_title: e.target.value })} 
                                placeholder="SEO title" 
                                className="text-sm"
                              />
                              {seoValidation?.title && (
                                <p className={`text-xs ${seoValidation.title.isValid ? 'text-teal' : 'text-coral'}`}>
                                  {seoValidation.title.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Meta Description</Label>
                              <Textarea 
                                value={form.seo_description} 
                                onChange={(e) => setForm({ ...form, seo_description: e.target.value })} 
                                placeholder="SEO description" 
                                rows={2}
                                className="text-sm"
                              />
                              {seoValidation?.description && (
                                <p className={`text-xs ${seoValidation.description.isValid ? 'text-teal' : 'text-coral'}`}>
                                  {seoValidation.description.message}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Topic Cluster */}
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">Topic Cluster</CardTitle>
                              <Button type="button" variant="ghost" size="sm" onClick={handleDetectCluster} disabled={aiAssistant.isPending || autoAssignCluster.isPending}>
                                {(aiAssistant.isPending || autoAssignCluster.isPending) ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <Select value={form.topic_cluster_id || 'none'} onValueChange={(v) => setForm({ ...form, topic_cluster_id: v === 'none' ? '' : v })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select cluster" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {topicClusters?.map(cluster => (
                                  <SelectItem key={cluster.id} value={cluster.id}>
                                    {cluster.cluster_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {aiSuggestions?.cluster && (
                              <p className="text-xs text-muted-foreground mt-2">
                                AI suggests: {aiSuggestions.cluster.cluster_name || 'Unknown'}
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        {/* AI Tools Panel */}
                        {showAIPanel && (
                          <Card className="border-primary/30 bg-primary/5">
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Wand2 className="h-4 w-4 text-primary" />
                                AI Tools
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="w-full justify-start"
                                onClick={handleCheckSimilarity}
                                disabled={checkSimilarity.isPending}
                              >
                                {checkSimilarity.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <AlertTriangle className="h-3 w-3 mr-2" />}
                                Check Similarity
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="w-full justify-start"
                                onClick={handleGetLinkSuggestions}
                                disabled={suggestLinks.isPending || aiAssistant.isPending}
                              >
                                {(suggestLinks.isPending || aiAssistant.isPending) ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Link2 className="h-3 w-3 mr-2" />}
                                Suggest Links
                              </Button>
                            </CardContent>
                          </Card>
                        )}

                        <Button 
                          onClick={handleSave} 
                          className="w-full" 
                          disabled={createPost.isPending || updatePost.isPending || (form.status === 'published' && similarityWarning?.highestSimilarity > 60)}
                        >
                          {(createPost.isPending || updatePost.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          {editing ? 'Update' : 'Create'} Post
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <div className="h-4 w-px bg-border" />
              <Button size="sm" variant="outline" onClick={() => {
                const ids = Array.from(selectedIds);
                ids.forEach(id => {
                  const post = enrichedPosts.find(p => p.id === id);
                  if (post && post.status !== 'published') {
                    updatePost.mutate({ id, status: 'published' as const, published_at: new Date().toISOString() });
                  }
                });
                setSelectedIds(new Set());
                toast.success(`Publishing ${ids.length} posts...`);
              }}>
                <Eye className="h-3 w-3 mr-1" />Publish All
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                const ids = Array.from(selectedIds);
                ids.forEach(id => updatePost.mutate({ id, status: 'draft' as const }));
                setSelectedIds(new Set());
                toast.success(`Drafting ${ids.length} posts...`);
              }}>
                <EyeOff className="h-3 w-3 mr-1" />Draft All
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30">
                    <Trash2 className="h-3 w-3 mr-1" />Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.size} posts?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedIds(new Set())}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      selectedIds.forEach(id => deletePost.mutate(id));
                      setSelectedIds(new Set());
                    }} className="bg-destructive text-destructive-foreground">Delete All</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelectedIds(new Set())}>
                Clear Selection
              </Button>
            </div>
          )}

          {/* Posts Table */}
          <Card className="card-modern">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={pagedPosts.length > 0 && pagedPosts.every(p => selectedIds.has(p.id))}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedIds(new Set(pagedPosts.map(p => p.id)));
                          else setSelectedIds(new Set());
                        }}
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => setFilters(f => ({ ...f, sortBy: 'title', sortDir: f.sortDir === 'asc' ? 'desc' : 'asc' }))}>
                      <div className="flex items-center gap-1">Title <ArrowUpDown className="h-3 w-3" /></div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Cluster</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => setFilters(f => ({ ...f, sortBy: 'status', sortDir: f.sortDir === 'asc' ? 'desc' : 'asc' }))}>
                      <div className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => setFilters(f => ({ ...f, sortBy: 'created_at', sortDir: f.sortDir === 'asc' ? 'desc' : 'asc' }))}>
                      <div className="flex items-center gap-1">Created <ArrowUpDown className="h-3 w-3" /></div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedPosts.map((post) => {
                    const postWordCount = (post as any)._wordCount;
                    const postHasMeta = (post as any)._hasMeta;
                    const clusterName = topicClusters?.find(c => c.id === post.topic_cluster_id)?.cluster_name;
                    return (
                      <TableRow key={post.id} className={selectedIds.has(post.id) ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(post.id)}
                            onCheckedChange={(checked) => {
                              const next = new Set(selectedIds);
                              if (checked) next.add(post.id);
                              else next.delete(post.id);
                              setSelectedIds(next);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="min-w-0">
                              <button className="font-medium text-left hover:text-primary transition-colors" onClick={() => setPreviewPost(post)}>
                                {post.title || 'Untitled'}
                              </button>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>/blog/{post.slug}</span>
                                {!postHasMeta && <FileWarning className="h-3 w-3 text-red-500" title="Missing SEO meta" />}
                                {post.is_featured && <Sparkles className="h-3 w-3 text-purple-500" title="Featured" />}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.category ? <Badge variant="outline" className="text-xs">{post.category}</Badge> : <span className="text-muted-foreground text-xs">-</span>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{post.author_name || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{clusterName || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{postWordCount > 0 ? postWordCount.toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {post.status === 'published' ? (
                              <Badge className="bg-green-500 text-white text-xs"><Eye className="h-3 w-3 mr-1" />Published</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs"><EyeOff className="h-3 w-3 mr-1" />Draft</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() => updatePost.mutate({ id: post.id, is_featured: !post.is_featured })}
                            >
                              <Sparkles className={`h-3 w-3 ${post.is_featured ? 'text-purple-500 fill-purple-500' : 'text-muted-foreground'}`} />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {post.created_at ? format(new Date(post.created_at), 'd MMM yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setPreviewPost(post)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Preview</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {post.status === 'published' && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openEdit(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete "{post.title}".</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePost.mutate(post.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pagedPosts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No posts found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or create a new post</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filteredPosts.length)} of {filteredPosts.length}</span>
                  <select className="text-xs border rounded px-1 py-0.5" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}>
                    <option value={10}>10/page</option>
                    <option value={20}>20/page</option>
                    <option value={50}>50/page</option>
                    <option value={100}>100/page</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i;
                    } else if (page < 3) {
                      pageNum = i;
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 7 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0 text-xs" onClick={() => setPage(pageNum)}>
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Preview Dialog */}
          <Dialog open={!!previewPost} onOpenChange={(open) => { if (!open) setPreviewPost(null); }}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {previewPost?.title}
                  {previewPost?.status === 'published' && (
                    <Badge className="bg-green-500 text-white text-xs">Published</Badge>
                  )}
                  {previewPost?.is_featured && (
                    <Badge className="bg-purple-500 text-white text-xs">Featured</Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {previewPost?.featured_image_url && (
                  <img src={previewPost.featured_image_url} alt={previewPost.title} className="w-full h-48 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {previewPost?.category && <Badge variant="outline">{previewPost.category}</Badge>}
                  {previewPost?.author_name && <span>By {previewPost.author_name}</span>}
                  {previewPost?.created_at && <span>{format(new Date(previewPost.created_at), 'MMMM d, yyyy')}</span>}
                  {previewPost?.topic_cluster_id && (
                    <span>Cluster: {topicClusters?.find(c => c.id === previewPost.topic_cluster_id)?.cluster_name}</span>
                  )}
                </div>
                {previewPost?.seo_title && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <span className="font-medium text-blue-700">SEO Title:</span>{' '}
                    <span className="text-blue-600">{previewPost.seo_title}</span>
                  </div>
                )}
                {previewPost?.excerpt && (
                  <div className="p-3 bg-muted/30 rounded">
                    <p className="text-sm text-muted-foreground italic">{previewPost.excerpt}</p>
                  </div>
                )}
                {previewPost?.content && (
                  <div className="prose prose-sm max-w-none">
                    {typeof previewPost.content === 'string'
                      ? previewPost.content.substring(0, 3000)
                      : getPostContentAsString(previewPost).substring(0, 3000)}
                    {(getPostContentAsString(previewPost)?.length || 0) > 3000 && (
                      <p className="text-xs text-muted-foreground mt-2">Content truncated — open editor to view full post</p>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => setPreviewPost(null)}>Close</Button>
                  <Button onClick={() => { setPreviewPost(null); openEdit(previewPost); }}>Edit Post</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Categories</h2>
              <p className="text-sm text-muted-foreground">Manage blog categories</p>
            </div>
            <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '', color: '#6366f1', is_active: true }); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Description" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Input type="color" value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} />
                    </div>
                    <div className="flex items-center justify-between pt-6">
                      <Label>Active</Label>
                      <Switch checked={categoryForm.is_active} onCheckedChange={(v) => setCategoryForm({ ...categoryForm, is_active: v })} />
                    </div>
                  </div>
                  <Button 
                    onClick={async () => {
                      if (editingCategory) {
                        await updateCategory.mutateAsync({ id: editingCategory.id, updates: categoryForm });
                      } else {
                        await createCategory.mutateAsync(categoryForm);
                      }
                      setCategoryDialog(false);
                    }} 
                    className="w-full"
                    disabled={createCategory.isPending || updateCategory.isPending}
                  >
                    {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCategories?.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{cat.description || '-'}</TableCell>
                      <TableCell>{cat.post_count}</TableCell>
                      <TableCell>
                        <Badge variant={cat.is_active ? 'default' : 'secondary'}>
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingCategory(cat);
                          setCategoryForm({ name: cat.name, description: cat.description || '', color: cat.color, is_active: cat.is_active });
                          setCategoryDialog(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>This will delete "{cat.name}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCategory.mutate(cat.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!allCategories || allCategories.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Tags className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No categories found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authors Tab */}
        <TabsContent value="authors" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Authors</h2>
              <p className="text-sm text-muted-foreground">Manage blog authors</p>
            </div>
            <Dialog open={authorDialog} onOpenChange={setAuthorDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingAuthor(null); setAuthorForm({ name: '', email: '', bio: '', role: 'Author', is_active: true }); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Author
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAuthor ? 'Edit Author' : 'New Author'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={authorForm.name} onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })} placeholder="Author name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={authorForm.email} onChange={(e) => setAuthorForm({ ...authorForm, email: e.target.value })} placeholder="author@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={authorForm.role} onValueChange={(v) => setAuthorForm({ ...authorForm, role: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Author">Author</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Guest">Guest Writer</SelectItem>
                        <SelectItem value="Expert">Foster Care Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea value={authorForm.bio} onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })} placeholder="Short bio..." rows={3} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch checked={authorForm.is_active} onCheckedChange={(v) => setAuthorForm({ ...authorForm, is_active: v })} />
                  </div>
                  <Button 
                    onClick={async () => {
                      if (editingAuthor) {
                        await updateAuthor.mutateAsync({ id: editingAuthor.id, updates: authorForm });
                      } else {
                        await createAuthor.mutateAsync(authorForm);
                      }
                      setAuthorDialog(false);
                    }} 
                    className="w-full"
                    disabled={createAuthor.isPending || updateAuthor.isPending}
                  >
                    {(createAuthor.isPending || updateAuthor.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editingAuthor ? 'Update' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAuthors?.map((author) => (
                    <TableRow key={author.id}>
                      <TableCell className="font-medium">{author.name}</TableCell>
                      <TableCell className="text-muted-foreground">{author.email || '-'}</TableCell>
                      <TableCell><Badge variant="outline">{author.role}</Badge></TableCell>
                      <TableCell>{author.post_count}</TableCell>
                      <TableCell>
                        <Badge variant={author.is_active ? 'default' : 'secondary'}>
                          {author.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingAuthor(author);
                          setAuthorForm({ name: author.name, email: author.email || '', bio: author.bio || '', role: author.role, is_active: author.is_active });
                          setAuthorDialog(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Author?</AlertDialogTitle>
                              <AlertDialogDescription>This will delete "{author.name}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAuthor.mutate(author.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!allAuthors || allAuthors.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No authors found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topic Clusters Tab */}
        <TabsContent value="clusters" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Topic Clusters</h2>
              <p className="text-sm text-muted-foreground">Organize content into SEO topic clusters</p>
            </div>
            <Dialog open={clusterDialog} onOpenChange={setClusterDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingCluster(null); setClusterForm({ cluster_name: '', primary_keyword: '', related_keywords: '', intent_type: 'informational' }); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cluster
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCluster ? 'Edit Cluster' : 'New Topic Cluster'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Cluster Name</Label>
                    <Input value={clusterForm.cluster_name} onChange={(e) => setClusterForm({ ...clusterForm, cluster_name: e.target.value })} placeholder="e.g., Foster Care Types Guide" />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Keyword</Label>
                    <Input value={clusterForm.primary_keyword} onChange={(e) => setClusterForm({ ...clusterForm, primary_keyword: e.target.value })} placeholder="e.g., fostering placements" />
                  </div>
                  <div className="space-y-2">
                    <Label>Related Keywords (comma-separated)</Label>
                    <Textarea value={clusterForm.related_keywords} onChange={(e) => setClusterForm({ ...clusterForm, related_keywords: e.target.value })} placeholder="implant cost, implant procedure, implant recovery" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Intent Type</Label>
                    <Select value={clusterForm.intent_type} onValueChange={(v) => setClusterForm({ ...clusterForm, intent_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informational">Informational</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="navigational">Navigational</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={async () => {
                      const data = {
                        cluster_name: clusterForm.cluster_name,
                        primary_keyword: clusterForm.primary_keyword,
                        related_keywords: clusterForm.related_keywords.split(',').map(k => k.trim()).filter(Boolean),
                        intent_type: clusterForm.intent_type,
                      };
                      await createCluster.mutateAsync(data);
                      setClusterDialog(false);
                    }} 
                    className="w-full"
                    disabled={createCluster.isPending}
                  >
                    {createCluster.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Create Cluster
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cluster Name</TableHead>
                    <TableHead>Primary Keyword</TableHead>
                    <TableHead>Related Keywords</TableHead>
                    <TableHead>Intent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topicClusters?.map((cluster) => (
                    <TableRow key={cluster.id}>
                      <TableCell className="font-medium">{cluster.cluster_name}</TableCell>
                      <TableCell><Badge variant="outline">{cluster.primary_keyword}</Badge></TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {cluster.related_keywords?.slice(0, 3).map((kw, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                          ))}
                          {(cluster.related_keywords?.length || 0) > 3 && (
                            <Badge variant="secondary" className="text-xs">+{(cluster.related_keywords?.length || 0) - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><Badge>{cluster.intent_type || 'informational'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Cluster?</AlertDialogTitle>
                              <AlertDialogDescription>This will delete "{cluster.cluster_name}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCluster.mutate(cluster.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!topicClusters || topicClusters.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No topic clusters found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
