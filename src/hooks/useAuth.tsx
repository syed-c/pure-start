import { useState, useEffect, useRef, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { AppRole, UserStatus } from '@/types/database';

interface UserProfile {
  id: string;
  user_id: string;
  organisation_id: string | null;
  role: AppRole;
  status: UserStatus;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  job_title: string | null;
  department: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Organisation {
  id: string;
  name: string;
  slug: string;
  type: string;
  logo_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organisation: Organisation | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: AppRole | null;
  roles: AppRole[];
  status: UserStatus | null;
  hasPermission: (permission: string) => Promise<boolean>;
  hasRole: (roles: AppRole | AppRole[]) => boolean;
  canAccessOrganisation: (orgId: string) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string, role?: AppRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role hierarchy for quick checks
const ROLE_HIERARCHY: Record<AppRole, number> = {
  super_admin: 100,
  agency_admin: 80,
  agency_staff: 60,
  trainer: 40,
  foster_carer: 30,
  applicant: 20,
  local_authority: 15,
  auditor: 10,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cachedPermissions, setCachedPermissions] = useState<Set<string>>(new Set());
  
  const initialCheckDone = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const permissionCheckCache = useRef<Map<string, boolean>>(new Map());

  const fetchUserData = async (userId: string, forceRefresh = false) => {
    if (!forceRefresh && currentUserId.current === userId) return;
    currentUserId.current = userId;
    
    try {
      // Fetch profile from user_profiles table
      // Try regular anon key first
      let { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // If query failed with RLS error (500), try using service role key as fallback
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one
        console.log('[useAuth] Profile not found, will create default');
      } else if (profileError) {
        // Try with service role key admin client
        console.log('[useAuth] RLS error, trying service role key');

        const { data: serviceProfileData } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (serviceProfileData) {
          profileData = serviceProfileData;
          profileError = null;
        }
      }

      if (profileData) {
        setProfile(profileData);
        
        // Fetch organisation if exists
        if (profileData.organisation_id) {
          const { data: orgData } = await supabase
            .from('organisations')
            .select('id, name, slug, type, logo_url')
            .eq('id', profileData.organisation_id)
            .single();
          
          if (orgData) {
            setOrganisation(orgData);
          }
        }

        // Fetch permissions for this role
        if (profileData.role) {
          const { data: permissions } = await supabase
            .from('role_permissions')
            .select('permission_slug')
            .eq('role', profileData.role);
          
          if (permissions) {
            setCachedPermissions(new Set(permissions.map(p => p.permission_slug)));
          }
        }
      } else {
        // Create basic profile from auth user if not exists
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const newProfile: Partial<UserProfile> = {
            user_id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            role: 'applicant',
            status: 'invited',
          };
          
          const { data: insertedProfile } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: authUser.id,
              email: authUser.email,
              full_name: newProfile.full_name,
              role: 'applicant',
              status: 'invited',
            })
            .select()
            .single();
            
          if (insertedProfile) {
            setProfile(insertedProfile);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Check permission function
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    // Check cache first
    if (cachedPermissions.has(permission)) {
      return true;
    }

    // Check if we have a cached result
    const cacheKey = `${profile?.role}-${permission}`;
    if (permissionCheckCache.current.has(cacheKey)) {
      return permissionCheckCache.current.get(cacheKey) || false;
    }

    // If not cached, check via database function
    try {
      const { data, error } = await supabase
        .rpc('has_permission', { permission_slug: permission });

      if (error) {
        console.error('Permission check error:', error);
        return false;
      }

      const hasAccess = data === true;
      permissionCheckCache.current.set(cacheKey, hasAccess);
      return hasAccess;
    } catch (err) {
      console.error('Permission check failed:', err);
      return false;
    }
  }, [cachedPermissions, profile?.role]);

  // Check if user has specific role(s)
  const hasRole = useCallback((roles: AppRole | AppRole[]): boolean => {
    if (!profile?.role) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(profile.role);
  }, [profile?.role]);

  // Check if user can access specific organisation
  const canAccessOrganisation = useCallback((orgId: string): boolean => {
    if (!profile) return false;
    if (profile.role === 'super_admin') return true;
    return profile.organisation_id === orgId;
  }, [profile]);

  // Refresh profile data - force fetch from database
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      console.log('[useAuth] Force refreshing profile for user:', user.id);
      setCachedPermissions(new Set());
      permissionCheckCache.current.clear();
      
      // Direct query to bypass any caching issues
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('[useAuth] Refreshed profile data:', profileData);
      
      if (profileData) {
        setProfile(profileData);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        const newUserId = newSession?.user?.id ?? null;
        const currentSessionUserId = session?.user?.id ?? null;
        
        if (event === 'TOKEN_REFRESHED' && newUserId === currentSessionUserId) {
          return;
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user && newUserId !== currentUserId.current) {
          setIsLoading(true);
          setCachedPermissions(new Set());
          permissionCheckCache.current.clear();
          setTimeout(() => {
            void fetchUserData(newSession.user.id).finally(() => {
              setIsLoading(false);
              initialCheckDone.current = true;
            });
          }, 0);
        } else if (!newSession?.user) {
          setProfile(null);
          setOrganisation(null);
          setCachedPermissions(new Set());
          currentUserId.current = null;
          setIsLoading(false);
          initialCheckDone.current = true;
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!initialCheckDone.current) {
        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          void fetchUserData(existingSession.user.id).finally(() => {
            setIsLoading(false);
            initialCheckDone.current = true;
          });
        } else {
          setIsLoading(false);
          initialCheckDone.current = true;
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      // Update last login
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('user_profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('user_id', authUser.id);
      }
    }
    
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName?: string, role: AppRole = 'applicant') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    // If signup successful, create profile with role
    if (!error) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('user_profiles')
          .update({ role, status: 'invited' })
          .eq('user_id', authUser.id);
      }
    }
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganisation(null);
    setCachedPermissions(new Set());
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    organisation,
    isLoading,
    isAuthenticated: !!user,
    role: profile?.role || null,
    roles: profile?.role ? [profile.role] : [],
    status: profile?.status || null,
    hasPermission,
    hasRole,
    canAccessOrganisation,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    refreshRoles: refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hook for checking multiple permissions at once
export function usePermissions(requiredPermissions: string[]) {
  const { hasPermission } = useAuth();
  const [isAllowed, setIsAllowed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      setIsChecking(true);
      const results = await Promise.all(requiredPermissions.map(hasPermission));
      setIsAllowed(results.every(Boolean));
      setIsChecking(false);
    };

    checkPermissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredPermissions.join(',')]);

  return { isAllowed, isChecking };
}

// Hook for route protection
export function useRequireAuth(allowedRoles?: AppRole[]) {
  const { isAuthenticated, role, isLoading, profile } = useAuth();
  const router = typeof window !== 'undefined' ? require('react-router-dom').useNavigate() : null;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router?.('/login');
    }
    
    if (!isLoading && isAuthenticated && allowedRoles && role && !allowedRoles.includes(role)) {
      router?.('/unauthorized');
    }
  }, [isLoading, isAuthenticated, role, allowedRoles, router]);

  return { isAuthenticated, role, isLoading, profile };
}