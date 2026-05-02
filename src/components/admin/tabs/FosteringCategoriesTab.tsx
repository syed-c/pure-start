import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Stethoscope, Loader2, Plus, Edit, Search,
  Clock, Heart, Home, Shield, Users, Baby, Activity, CheckCircle,
  Globe, Building2
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  'short-term': Clock,
  'long-term': Home,
  'emergency': Shield,
  'respite': Users,
  'parent-child': Baby,
  'therapeutic': Heart,
  'specialist': Activity,
  'sibling': Users,
  'teenage': Users,
  'disability': CheckCircle,
  'remand': Shield,
  'kinship': Home,
  'uasc': Globe,
  'local-authority': Building2,
  'independent': Building2,
};

const CATEGORY_COLORS: Record<string, string> = {
  'short-term': 'bg-blue-500',
  'long-term': 'bg-green-500',
  'emergency': 'bg-red-500',
  'respite': 'bg-teal-500',
  'parent-child': 'bg-pink-500',
  'therapeutic': 'bg-purple-500',
  'specialist': 'bg-indigo-500',
  'sibling': 'bg-orange-500',
  'teenage': 'bg-indigo-500',
  'disability': 'bg-amber-500',
  'remand': 'bg-slate-500',
  'kinship': 'bg-amber-600',
  'uasc': 'bg-cyan-500',
  'local-authority': 'bg-blue-600',
  'independent': 'bg-emerald-600',
};

interface CategoryData {
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  page_type: string | null;
}

export default function FosteringCategoriesTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    meta_title: '',
    meta_description: '',
    h1: '',
    intro_content: '',
  });

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['fostering-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('slug, meta_title, meta_description, page_type')
        .filter('page_type', 'eq', 'category')
        .ilike('slug', '%fostering%')
        .order('meta_title', { ascending: true });
      
      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      return data as CategoryData[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { slug: string; meta_title: string; meta_description: string }) => {
      const { error } = await supabase
        .from('seo_pages')
        .update({
          meta_title: data.meta_title,
          meta_description: data.meta_description,
        })
        .eq('slug', data.slug);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fostering-categories'] });
      toast.success('Category updated');
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSave = () => {
    if (!formData.meta_title || !formData.slug) {
      toast.error('Please fill in required fields');
      return;
    }
    updateMutation.mutate({
      slug: formData.slug,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
    });
  };

  const openEdit = (category: CategoryData) => {
    setFormData({
      slug: category.slug,
      meta_title: category.meta_title || '',
      meta_description: category.meta_description || '',
      h1: '',
      intro_content: '',
    });
    setShowDialog(true);
  };

  const filteredCategories = categories?.filter(cat => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return cat.meta_title?.toLowerCase().includes(search) || cat.slug.includes(search);
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-500">
          <p className="text-red-500">Error loading categories: {(error as Error).message}</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['fostering-categories'] })} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fostering Categories</h2>
          <p className="text-muted-foreground">
            {categories?.length || 0} categories in the system
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No categories found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Categories will appear here when added'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => {
            const key = category.slug.replace('-fostering', '').replace('fostering-agency', 'independent');
            const Icon = CATEGORY_ICONS[key] || Stethoscope;
            const color = CATEGORY_COLORS[key] || 'bg-gray-500';
            
            return (
              <Card key={category.slug} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {category.meta_title || category.slug}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {category.meta_description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => openEdit(category)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input value={formData.slug} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Category Name *</Label>
              <Input
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={formData.meta_description || ''}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}