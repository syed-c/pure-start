/**
 * Compliance Tracker - Track DBS checks, training expiry, statutory visits
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, AlertTriangle, Shield } from 'lucide-react';

export default function ComplianceTrackerTab() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance</h2>
          <p className="text-muted-foreground">Track DBS checks, training expiry and statutory visits</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            <strong>Coming Soon:</strong> Full compliance tracking with database integration.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'DBS Checks', value: 0, color: 'text-blue-500' },
          { label: 'Overdue', value: 0, color: 'text-red-500' },
          { label: 'Expiring Soon', value: 0, color: 'text-amber-500' },
          { label: 'Compliant', value: 0, color: 'text-green-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search compliance records..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="p-12 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Compliance tracker will be available in a future release.</p>
        <p className="text-sm text-muted-foreground mt-2">Planned features: DBS tracking, training expiry alerts, statutory visit scheduling</p>
      </Card>
    </div>
  );
}
