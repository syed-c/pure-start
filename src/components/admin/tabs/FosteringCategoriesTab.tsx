import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Stethoscope, Loader2, Heart, Home, Clock, Shield, Users } from 'lucide-react';

export default function FosteringCategoriesTab() {
  // Get all fostering types from agencies
  const { data: agencies, isLoading } = useQuery({
    queryKey: ['all-agencies-fostering-types'],
    queryFn: async () => {
      const { data } = await supabase
        .from('agencies')
        .select('fostering_types')
        .not('fostering_types', 'is', null);
      return data || [];
    }
  });

  // Extract unique fostering types
  const allTypes = agencies?.flatMap(a => a.fostering_types || []) || [];
  const uniqueTypes = [...new Set(allTypes)];
  
  const typeDescriptions: Record<string, string> = {
    'short-term': 'Care for children for a few days to several months',
    'long-term': 'Provide a permanent home for children who cannot return to birth family',
    'emergency': 'Provide immediate, short-notice care for children in crisis',
    'therapeutic': 'Specialist care for children with complex needs',
    'respite': 'Provide temporary breaks for other foster families',
    'parent-child': 'Support birth parents while caring for their child',
    'remand': 'Care for young people on remand',
    'solo': 'Care for single children or sibling groups',
    'shared-care': 'Share care with other foster carers',
    'hosting': 'Emergency hosting for unaccompanied asylum seekers',
  };

  const typeIcons: Record<string, any> = {
    'short-term': Clock,
    'long-term': Home,
    'emergency': Shield,
    'therapeutic': Heart,
    'respite': Users,
    'parent-child': Users,
    'remand': Shield,
    'solo': Heart,
    'shared-care': Users,
    'hosting': Home,
  };

  // Count agencies per type
  const typeCounts = allTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Fostering Categories</h2>
        <p className="text-muted-foreground">
          All types of fostering available across UK agencies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueTypes.map((type) => {
          const Icon = typeIcons[type] || Stethoscope;
          return (
            <Card key={type} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold capitalize">{type.replace(/-/g, ' ')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {typeDescriptions[type] || 'Fostering type'}
                  </p>
                  <Badge variant="secondary" className="mt-3">
                    {typeCounts[type]} agencies
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {uniqueTypes.length === 0 && (
        <Card className="p-8 text-center">
          <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No fostering categories found</p>
        </Card>
      )}
    </div>
  );
}