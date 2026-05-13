/**
 * Component smoke tests — verify critical UI components and configs export correctly
 */
import { describe, it, expect, vi } from 'vitest';

// Mock Supabase client at module level (Vitest hoists this)
vi.mock('@/integrations/supabase/client', async () => {
  const { createClient } = await vi.importActual<typeof import('@supabase/supabase-js')>('@supabase/supabase-js');
  const mockClient = createClient('https://fake.supabase.co', 'fake-key', {
    auth: { storage: undefined, persistSession: false },
  });
  return {
    supabase: mockClient,
    supabaseAdmin: mockClient,
    createClient,
  };
});

// ============================================================
// Navigation configs export smoke tests
// ============================================================
describe('Navigation configs', () => {
  it('exports page registry entries', async () => {
    const mod = await import('@/config/pageRegistry');
    expect(mod.INDEXABLE_PAGES).toBeDefined();
    expect(Array.isArray(mod.INDEXABLE_PAGES)).toBe(true);
    expect(mod.INDEXABLE_PAGES.length).toBeGreaterThan(0);
    expect(mod.PRIVATE_PAGES).toBeDefined();
    expect(mod.ALL_PAGES).toBeDefined();
  });

  it('exports role-based navigation from navigation config', async () => {
    const mod = await import('@/config/navigation');
    expect(mod.ROLE_NAVIGATION).toBeDefined();
    expect(typeof mod.flattenNavigation).toBe('function');
    expect(typeof mod.getNavigationForRole).toBe('function');
  });
});

// ============================================================
// useAuth hook smoke test
// ============================================================
describe('useAuth', () => {
  it('exports useAuth hook function', async () => {
    const mod = await import('@/hooks/useAuth');
    expect(typeof mod.useAuth).toBe('function');
  });
});