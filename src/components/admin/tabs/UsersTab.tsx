import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers, useUpdateUserRole, useUpdateUserStatus, AdminUser } from '@/hooks/useAdminUsers';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Mail, Shield, UserCheck, Filter, Calendar, MoreHorizontal, Eye, Plus, Loader2, Check, X, Globe, UserX, Trash2, Power, Building2, Settings2, FileEdit, Megaphone, HeadphonesIcon, KeyRound, ExternalLink } from 'lucide-react';
import { AssignClinicModal } from '@/components/admin/AssignClinicModal';
import TabPermissionsDialog from '@/components/admin/TabPermissionsDialog';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Team roles configuration
const TEAM_ROLES = [
  { value: 'super_admin', label: 'Super Admin', color: 'purple', icon: Shield },
  { value: 'district_manager', label: 'District Manager', color: 'blue-custom', icon: UserCheck },
  { value: 'fosterer', label: 'Fosterer', color: 'primary', icon: Users },
  { value: 'seo_team', label: 'SEO Team', color: 'teal', icon: Search },
  { value: 'content_team', label: 'Content Team', color: 'gold', icon: FileEdit },
  { value: 'marketing_team', label: 'Marketing Team', color: 'coral', icon: Megaphone },
  { value: 'support_team', label: 'Support Team', color: 'emerald', icon: HeadphonesIcon },
  { value: 'foster_family', label: 'Foster Family', color: 'muted', icon: Users },
] as const;

export default function UsersTab() {
  const { data: users, isLoading, error } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Create user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'fosterer' as string,
    agencyId: '',
  });

  const roleBreakdown = {
    admin: users?.filter(u => u.roles?.includes('super_admin')).length || 0,
    agency: users?.filter(u => u.roles?.includes('agency_admin') || u.roles?.includes('agency_staff')).length || 0,
    fosterer: users?.filter(u => u.roles?.includes('fosterer')).length || 0,
    team: users?.filter(u => ['seo_team', 'content_team', 'marketing_team', 'support_team'].some(r => u.roles?.includes(r))).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`card-modern cursor-pointer transition-colors ${roleFilter === 'all' ? 'border-primary' : 'hover:border-primary/50'}`} onClick={() => setRoleFilter('all')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`card-modern cursor-pointer transition-colors ${roleFilter === 'agency_admin' ? 'border-primary' : 'hover:border-primary/50'}`} onClick={() => setRoleFilter('agency_admin')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roleBreakdown.agency}</p>
              <p className="text-sm text-muted-foreground">Agencies</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`card-modern cursor-pointer transition-colors ${roleFilter === 'fosterer' ? 'border-teal' : 'hover:border-teal/50'}`} onClick={() => setRoleFilter('fosterer')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-teal-light flex items-center justify-center">
              <Users className="h-6 w-6 text-teal" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roleBreakdown.fosterer}</p>
              <p className="text-sm text-muted-foreground">Fosterers</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`card-modern cursor-pointer transition-colors hover:border-gold/50`} onClick={() => setRoleFilter('all')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center">
              <FileEdit className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roleBreakdown.team}</p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-modern">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {TEAM_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="gmb">GMB</SelectItem>
                <SelectItem value="admin_created">Admin Created</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Power className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="card-modern">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GMB</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {user.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.roles)}</TableCell>
                  <TableCell>{getSignupMethodBadge(user.signup_method)}</TableCell>
                  <TableCell>{getStatusBadge(user.account_status)}</TableCell>
                  <TableCell>
                    {user.gmb_connected ? (
                      <Badge className="bg-teal/20 text-teal border-0 text-xs gap-1">
                        <Check className="h-3 w-3" />Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Not Connected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => {
                            if (user.clinic_slug) {
                              window.open(`/agency/${user.clinic_slug}`, '_blank');
                            } else {
                              toast({ 
                                title: "No Profile Available", 
                                description: "This user doesn't have a claimed agency profile yet.",
                                variant: "destructive" 
                              });
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" /> View Profile
                          {user.clinic_slug && <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => setAssignClinicUser(user)}
                        >
                          <Building2 className="h-4 w-4" /> Assign Clinic
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => setTabPermissionsUser(user)}
                        >
                          <Settings2 className="h-4 w-4" /> Tab Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => handleSendPasswordReset(user)}
                          disabled={isSendingReset === user.user_id}
                        >
                          {isSendingReset === user.user_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <KeyRound className="h-4 w-4" />
                          )}
                          Send Password Reset
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="gap-2">
                            <Shield className="h-4 w-4" /> Change Role
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {TEAM_ROLES.map((role) => (
                                <DropdownMenuItem
                                  key={role.value}
                                  className="gap-2"
                                  onClick={() => handleRoleChange(user.user_id, user.roles || [], role.value)}
                                >
                                  <role.icon className="h-4 w-4" />
                                  {role.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        {user.account_status === 'suspended' ? (
                          <DropdownMenuItem 
                            className="gap-2 text-teal"
                            onClick={() => handleUserAction(user.user_id, 'activate')}
                          >
                            <Power className="h-4 w-4" /> Activate User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="gap-2 text-amber"
                            onClick={() => handleUserAction(user.user_id, 'suspend')}
                          >
                            <UserX className="h-4 w-4" /> Suspend User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="gap-2 text-coral"
                          onClick={() => setDeleteUserId(user.user_id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No users found</p>
                    {hasActiveFilters && (
                      <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
                        Clear filters to see all users
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-coral hover:bg-coral/90"
              onClick={() => deleteUserId && handleUserAction(deleteUserId, 'delete')}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Clinic Modal */}
      {assignClinicUser && (
        <AssignClinicModal
          open={!!assignClinicUser}
          onOpenChange={(open) => !open && setAssignClinicUser(null)}
          userId={assignClinicUser.user_id}
          userName={assignClinicUser.full_name || ''}
          userEmail={assignClinicUser.email || ''}
        />
      )}

      {/* Tab Permissions Dialog */}
      {tabPermissionsUser && (
        <TabPermissionsDialog
          open={!!tabPermissionsUser}
          onOpenChange={(open) => !open && setTabPermissionsUser(null)}
          userId={tabPermissionsUser.user_id}
          userName={tabPermissionsUser.full_name || tabPermissionsUser.email || 'User'}
          userRole={tabPermissionsUser.roles?.[0] || 'patient'}
        />
      )}
    </div>
  );
}