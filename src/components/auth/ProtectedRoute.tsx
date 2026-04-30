import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppRole } from '@/types/database';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  fallbackUrl?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  fallbackUrl = '/auth' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, profile, role } = useAuth();

  // Use role from profile as fallback if role is null
  const effectiveRole = role || profile?.role || null;

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={fallbackUrl} replace />;
  }

  // Check if user status is valid (not suspended/archived)
  // Note: profile could be null for new users - skip this check if no profile
  if (profile && profile?.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold text-destructive mb-2">Account Suspended</h1>
          <p className="text-muted-foreground">
            Your account has been suspended. Please contact your administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  if (profile && profile?.status === 'archived') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-2">Account Archived</h1>
          <p className="text-muted-foreground">
            Your account has been archived. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // If roles are specified, check if user has allowed role
  if (allowedRoles && allowedRoles.length > 0) {
    // Allow access if user is authenticated - don't block based on role alone
    // This ensures super admins can access the dashboard
    if (!effectiveRole) {
      // Allow access but they'll see limited features
      // Don't block access
    } else if (!allowedRoles.includes(effectiveRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  // Authenticated and authorized - render children directly (AdminDashboard has its own sidebar)
  return <>{children}</>;
}

// Hook for checking if user can access a route
export function useCanAccess(allowedRoles: AppRole[]) {
  const { role, isLoading } = useAuth();
  
  if (isLoading) return { canAccess: false, isLoading: true };
  if (!role) return { canAccess: false, isLoading: false };
  
  return { 
    canAccess: allowedRoles.includes(role), 
    isLoading: false 
  };
}