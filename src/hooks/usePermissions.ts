import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { createAuditLog } from '@/lib/audit';
import { AppRole } from '@/types/database';

// ============================================
// PRIMARY RBAC SYSTEM FOR UK FOSTERING PLATFORM
// ============================================
// This is the canonical permission system. useAuth().hasPermission() delegates here.

// Permission keys for the fostering platform
export const PERMISSIONS = {
  // Agency
  VIEW_AGENCY: 'view_agency',
  EDIT_AGENCY: 'edit_agency',
  MANAGE_AGENCY_STAFF: 'manage_agency_staff',
  VIEW_AGENCY_REPORTS: 'view_agency_reports',

  // Users
  VIEW_USERS: 'view_users',
  INVITE_USERS: 'invite_users',
  EDIT_USERS: 'edit_users',
  SUSPEND_USERS: 'suspend_users',
  DELETE_USERS: 'delete_users',

  // Foster Carers
  VIEW_FOSTER_CARERS: 'view_foster_carers',
  CREATE_FOSTER_CARER: 'create_foster_carer',
  EDIT_FOSTER_CARER: 'edit_foster_carer',
  DELETE_FOSTER_CARER: 'delete_foster_carer',
  VIEW_OWN_CARER: 'view_own_carer',
  EDIT_OWN_CARER: 'edit_own_carer',

  // Applicants
  VIEW_APPLICANTS: 'view_applicants',
  CREATE_APPLICANT: 'create_applicant',
  EDIT_APPLICANT: 'edit_applicant',
  APPROVE_APPLICANT: 'approve_applicant',
  VIEW_OWN_APPLICATION: 'view_own_application',

  // Training
  VIEW_TRAINING: 'view_training',
  CREATE_TRAINING: 'create_training',
  EDIT_TRAINING: 'edit_training',
  DELETE_TRAINING: 'delete_training',
  MANAGE_ATTENDANCE: 'manage_attendance',
  ISSUE_CERTIFICATES: 'issue_certificates',

  // Placements
  VIEW_PLACEMENTS: 'view_placements',
  CREATE_PLACEMENT: 'create_placement',
  EDIT_PLACEMENT: 'edit_placement',
  REQUEST_PLACEMENT: 'request_placement',
  VIEW_OWN_PLACEMENTS: 'view_own_placements',

  // Documents
  VIEW_DOCUMENTS: 'view_documents',
  UPLOAD_DOCUMENTS: 'upload_documents',
  DELETE_DOCUMENTS: 'delete_documents',
  VIEW_OWN_DOCUMENTS: 'view_own_documents',

  // Messages
  VIEW_MESSAGES: 'view_messages',
  SEND_MESSAGES: 'send_messages',
  VIEW_OWN_MESSAGES: 'view_own_messages',

  // Reports
  VIEW_REPORTS: 'view_reports',
  VIEW_AUDIT_LOGS: 'view_audit_logs',

  // Platform (Super Admin only)
  MANAGE_PLATFORM_SETTINGS: 'manage_platform_settings',
  MANAGE_ROLES: 'manage_roles',
  VIEW_ALL_ORGANISATIONS: 'view_all_organisations',
  MANAGE_ORGANISATIONS: 'manage_organisations',
} as const;

// Flat array of all permission keys — used for role definition screens and audit log filters
export const ALL_PERMISSIONS: string[] = Object.values(PERMISSIONS);

// Single source of truth: role → permissions mapping
// Used by both usePermissions hook and useAuth().hasPermission()
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: Object.values(PERMISSIONS),

  agency_admin: [
    PERMISSIONS.VIEW_AGENCY,
    PERMISSIONS.EDIT_AGENCY,
    PERMISSIONS.MANAGE_AGENCY_STAFF,
    PERMISSIONS.VIEW_AGENCY_REPORTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_FOSTER_CARERS,
    PERMISSIONS.CREATE_FOSTER_CARER,
    PERMISSIONS.EDIT_FOSTER_CARER,
    PERMISSIONS.VIEW_APPLICANTS,
    PERMISSIONS.CREATE_APPLICANT,
    PERMISSIONS.EDIT_APPLICANT,
    PERMISSIONS.APPROVE_APPLICANT,
    PERMISSIONS.VIEW_TRAINING,
    PERMISSIONS.CREATE_TRAINING,
    PERMISSIONS.EDIT_TRAINING,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.ISSUE_CERTIFICATES,
    PERMISSIONS.VIEW_PLACEMENTS,
    PERMISSIONS.CREATE_PLACEMENT,
    PERMISSIONS.EDIT_PLACEMENT,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.VIEW_MESSAGES,
    PERMISSIONS.SEND_MESSAGES,
  ],

  agency_staff: [
    PERMISSIONS.VIEW_FOSTER_CARERS,
    PERMISSIONS.EDIT_FOSTER_CARER,
    PERMISSIONS.VIEW_APPLICANTS,
    PERMISSIONS.EDIT_APPLICANT,
    PERMISSIONS.VIEW_TRAINING,
    PERMISSIONS.VIEW_PLACEMENTS,
    PERMISSIONS.EDIT_PLACEMENT,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.VIEW_MESSAGES,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_AGENCY_REPORTS,
  ],

  foster_carer: [
    PERMISSIONS.VIEW_OWN_CARER,
    PERMISSIONS.EDIT_OWN_CARER,
    PERMISSIONS.VIEW_OWN_PLACEMENTS,
    PERMISSIONS.VIEW_OWN_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.VIEW_OWN_MESSAGES,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_TRAINING,
  ],

  applicant: [
    PERMISSIONS.VIEW_OWN_APPLICATION,
    PERMISSIONS.VIEW_OWN_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.VIEW_OWN_MESSAGES,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_TRAINING,
  ],

  trainer: [
    PERMISSIONS.VIEW_TRAINING,
    PERMISSIONS.CREATE_TRAINING,
    PERMISSIONS.EDIT_TRAINING,
    PERMISSIONS.DELETE_TRAINING,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.ISSUE_CERTIFICATES,
    PERMISSIONS.VIEW_MESSAGES,
    PERMISSIONS.SEND_MESSAGES,
  ],

  local_authority: [
    PERMISSIONS.REQUEST_PLACEMENT,
    PERMISSIONS.VIEW_PLACEMENTS,
    PERMISSIONS.VIEW_MESSAGES,
    PERMISSIONS.SEND_MESSAGES,
  ],

  auditor: [
    PERMISSIONS.VIEW_AGENCY,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_FOSTER_CARERS,
    PERMISSIONS.VIEW_APPLICANTS,
    PERMISSIONS.VIEW_TRAINING,
    PERMISSIONS.VIEW_PLACEMENTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_REPORTS,
  ],
};

export interface RolePreset {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionOverride {
  id: string;
  user_id: string;
  permission_key: string;
  is_granted: boolean;
  expires_at: string | null;
  granted_by: string | null;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch role presets
export function useRolePresets() {
  return useQuery({
    queryKey: ['role-presets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_presets')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');
      if (error) throw error;
      return data as RolePreset[];
    },
  });
}

// Create/update role preset
export function useSaveRolePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preset: Partial<RolePreset> & { name: string; permissions: string[] }) => {
      if (preset.id) {
        const { error } = await supabase
          .from('role_presets')
          .update({
            name: preset.name,
            description: preset.description,
            permissions: preset.permissions,
            updated_at: new Date().toISOString(),
          })
          .eq('id', preset.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('role_presets') as any)
          .insert([{
            name: preset.name,
            role: 'custom',
            description: preset.description,
            permissions: preset.permissions,
          }]);
        if (error) throw error;
      }
      await createAuditLog({
        action: preset.id ? 'UPDATE' : 'CREATE',
        entityType: 'role_preset',
        entityId: preset.id || preset.name,
        newValues: preset,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-presets'] });
      toast.success('Role preset saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Delete role preset
export function useDeleteRolePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('role_presets')
        .delete()
        .eq('id', id)
        .eq('is_system', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-presets'] });
      toast.success('Role preset deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Fetch permission overrides for a user
export function usePermissionOverrides(userId?: string) {
  return useQuery({
    queryKey: ['permission-overrides', userId],
    queryFn: async () => {
      let query = supabase
        .from('user_permission_overrides')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as PermissionOverride[];
    },
    enabled: !!userId || userId === undefined,
  });
}

// Add/update permission override
export function useSavePermissionOverride() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (override: {
      user_id: string;
      permission_key: string;
      is_granted: boolean;
      expires_at?: string | null;
      reason?: string;
    }) => {
      const { error } = await (supabase
        .from('user_permission_overrides') as any)
        .upsert({
          user_id: override.user_id,
          permission_key: override.permission_key,
          is_granted: override.is_granted,
          expires_at: override.expires_at || null,
          reason: override.reason || null,
          granted_by: user?.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,permission_key',
        });
      if (error) throw error;
      
      await createAuditLog({
        action: 'PERMISSION_OVERRIDE',
        entityType: 'user_permission',
        entityId: override.user_id,
        newValues: override,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-overrides'] });
      toast.success('Permission override saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Delete permission override
export function useDeletePermissionOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_permission_overrides')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-overrides'] });
      toast.success('Override removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Hook to check if current user has a permission (legacy support)
export function useHasPermission(permission: string) {
  const { user, profile } = useAuth();
  const role = profile?.role;
  
  // Check permission overrides (legacy)
  const { data: overrides } = usePermissionOverrides(user?.id);
  const { data: rolePermissions } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .eq('key', 'role_permissions')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value as Record<string, string[]> | null;
    },
  });
  
  // Super admin always has permission
  if (role === 'super_admin') return true;
  
  // Check user-specific override
  const override = overrides?.find(o => 
    o.permission_key === permission &&
    (!o.expires_at || new Date(o.expires_at) > new Date())
  );
  if (override) return override.is_granted;
  
  // Check role permissions
  if (rolePermissions && role) {
    const perms = rolePermissions[role];
    if (perms?.includes('*') || perms?.includes(permission)) {
      return true;
    }
  }

  // Fallback to new permission system
  if (role && ROLE_DEFAULT_PERMISSIONS[role]) {
    return ROLE_DEFAULT_PERMISSIONS[role].includes(permission);
  }
  
  return false;
}

// Get permissions grouped by category
export function getPermissionsByCategory() {
  return ALL_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS>);
}
