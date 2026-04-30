import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Shield, Mail, Loader2, Building2, Heart, GraduationCap, UserPlus, Building, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// Create service role client to bypass RLS
const serviceClient = createClient(
  'https://vcvvtklbyvdbysfdbnfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnZ0a2xieXZkYnlzZmRibmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3Mzg3NCwiZXhwIjoyMDc3MTQ5ODc0fQ.KV1k56566JlPRlDHs613vsCqSyibpaLG4oY_hTt39fs',
  { auth: { persistSession: false } }
);

export default function UsersManagementTab() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: async () => {
      let query = serviceClient
        .from('user_profiles')
        .select('id, email, full_name, role, status, organisation_id, created_at')
        .order('created_at', { ascending: false });
      
      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }
      
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      
      const { data } = await query;
      return data || [];
    }
  });

  // Get counts by role
  const { data: roleCounts } = useQuery({
    queryKey: ['admin-users-counts'],
    queryFn: async () => {
      const roles = ['agency_admin', 'agency_staff', 'foster_carer', 'applicant', 'trainer', 'local_authority', 'auditor'];
      const counts: Record<string, number> = {};
      
      for (const role of roles) {
        const { count } = await serviceClient
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', role);
        counts[role] = count || 0;
      }
      
      return counts;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-500',
      agency_admin: 'bg-blue-500',
      agency_staff: 'bg-green-500',
      foster_carer: 'bg-purple-500',
      applicant: 'bg-yellow-500',
      trainer: 'bg-teal-500',
      local_authority: 'bg-orange-500',
      auditor: 'bg-gray-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  const roleFilters = [
    { value: null, label: 'All Users', icon: Users },
    { value: 'agency_admin', label: 'Agency Admins', icon: Building2 },
    { value: 'agency_staff', label: 'Agency Staff', icon: Building },
    { value: 'foster_carer', label: 'Foster Carers', icon: Heart },
    { value: 'applicant', label: 'Applicants', icon: UserPlus },
    { value: 'trainer', label: 'Trainers', icon: GraduationCap },
    { value: 'local_authority', label: 'Local Authorities', icon: Eye },
    { value: 'auditor', label: 'Auditors', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users & Roles</h2>
          <p className="text-muted-foreground">Manage platform users by role</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Role Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {roleFilters.slice(1).map((filter) => {
          const Icon = filter.icon;
          const count = roleCounts?.[filter.value || ''] || 0;
          const isActive = roleFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => setRoleFilter(roleFilter === filter.value ? null : filter.value)}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-xl border transition-all',
                isActive 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-card hover:bg-accent'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-1', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-lg font-bold', isActive ? 'text-primary' : '')}>{count}</span>
              <span className="text-xs text-muted-foreground truncate w-full text-center">{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Role Filter Tabs */}
      <Tabs value={roleFilter || 'all'} onValueChange={(v) => setRoleFilter(v === 'all' ? null : v)}>
        <TabsList className="flex flex-wrap h-auto">
          {roleFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <TabsTrigger key={filter.value || 'all'} value={filter.value || 'all'} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {filter.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {user.full_name || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadge(user.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role?.replace('_', ' ') || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
            {users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}