import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to determine which admin tabs a user can access based on their role
 * and explicitly assigned tab permissions in user_tab_permissions table.
 * 
 * - Admin dashboard roles (super_admin, agency_admin, agency_staff, trainer, auditor, district_manager): Access ALL tabs
 * - Other roles (content_team, seo_team, etc.): Only access tabs explicitly granted
 */
export function useUserTabAccess() {
  const { user, roles } = useAuth();
  
  // Admin dashboard roles have full access by default
  const ADMIN_DASHBOARD_ROLES = ['super_admin', 'agency_admin', 'agency_staff', 'trainer', 'auditor', 'district_manager'];
  const hasFullAccess = roles.some(r => ADMIN_DASHBOARD_ROLES.includes(r));
  
  // Fetch user-specific tab permissions for non-super-admin users
  const { data: userTabPermissions, isLoading } = useQuery({
    queryKey: ['user-tab-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_tab_permissions')
        .select('tab_key, can_access')
        .eq('user_id', user.id)
        .eq('can_access', true);
      
      if (error) throw error;
      return data?.map(p => p.tab_key) || [];
    },
    enabled: !!user?.id && !hasFullAccess,
    staleTime: 30000, // Cache for 30 seconds
  });
  
  /**
   * Check if user can access a specific tab
   * @param tabId - The tab identifier (e.g., 'blog', 'seo', 'clinics')
   * @returns boolean - Whether user can access the tab
   */
const canAccessTab = (tabId: string, isLoading?: boolean, userExists?: boolean): boolean => {
    // Super admins can access everything
    if (hasFullAccess) return true;

    // Allow all tabs while profile is still loading or user not yet resolved
    // This prevents the admin sidebar from going blank during auth initialization
    if (isLoading || !userExists) return true;

    // If permissions haven't been fetched yet (query disabled, loading, or table missing), allow
    if (userTabPermissions === undefined) return true;

    // If permissions were fetched and array is empty, no access granted
    if (userTabPermissions.length === 0) return false;

    return userTabPermissions.includes(tabId);
  };
  
  /**
   * Get list of all accessible tabs for the current user
   */
  const getAccessibleTabs = (): string[] => {
    if (hasFullAccess) return []; // Empty means "all" for super admins
    return userTabPermissions || [];
  };
  
  return {
    canAccessTab,
    getAccessibleTabs,
    hasFullAccess,
    isLoading,
    permissionCount: userTabPermissions?.length || 0,
  };
}
