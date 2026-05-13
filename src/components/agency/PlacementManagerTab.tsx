/**
 * Placement Manager - Track foster placements
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, AlertTriangle } from 'lucide-react';

export default function PlacementManagerTab() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Placements</h2>
          <p className="text-muted-foreground">Track and manage foster placements</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          New Placement
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            <strong>Coming Soon:</strong> Full placement tracking with database integration.
          </p>
        </CardContent>
      </Card>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search placements..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Placement tracking will be available in a future release.</p>
        <p className="text-sm text-muted-foreground mt-2">Planned features: child matching, placement history, review scheduling</p>
      </Card>
    </div>
  );
}
