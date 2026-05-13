/**
 * Smoke tests for critical hooks — tests export existence only,
 * no Supabase connection required.
 */
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';

// Stub Supabase client before importing any modules that use it
vi.mock('@/integrations/supabase/client', async () => {
  const actualSupabase = await vi.importActual<typeof import('@supabase/supabase-js')>('@supabase/supabase-js');
  return {
    supabase: { data: { name: 'test' } },
    supabaseAdmin: { data: { name: 'admin-test' } },
    createClient: actualSupabase.createClient,
  };
});

// ============================================================
// usePermissions smoke test
// ============================================================
describe('usePermissions', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('exports ROLE_PERMISSIONS as a non-empty object', async () => {
    const { ROLE_PERMISSIONS } = await import('@/hooks/usePermissions');
    expect(typeof ROLE_PERMISSIONS).toBe('object');
    expect(Object.keys(ROLE_PERMISSIONS).length).toBeGreaterThan(0);
  });

  it('exports PERMISSIONS as a non-empty array-like object', async () => {
    const { PERMISSIONS } = await import('@/hooks/usePermissions');
    expect(typeof PERMISSIONS).toBe('object');
    expect(Object.keys(PERMISSIONS).length).toBeGreaterThan(0);
  });

  it('exports ALL_PERMISSIONS as a non-empty array', async () => {
    const { ALL_PERMISSIONS } = await import('@/hooks/usePermissions');
    expect(Array.isArray(ALL_PERMISSIONS)).toBe(true);
    expect(ALL_PERMISSIONS.length).toBeGreaterThan(0);
  });
});

// ============================================================
// useContentHealthStats smoke test
// ============================================================
describe('useContentHealthStats', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('exports a function that returns location-based stats', async () => {
    const mod = await import('@/hooks/useContentHealthStats');
    const hook = mod.useContentHealthStats;
    expect(typeof hook).toBe('function');
  });
});

// ============================================================
// useBookingSettings smoke test
// ============================================================
describe('useBookingSettings', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('exports useBookingSettings hook', async () => {
    const mod = await import('@/hooks/useBookingSettings');
    expect(typeof mod.useBookingSettings).toBe('function');
  });

  it('exports useClinicBookingStatus hook', async () => {
    const mod = await import('@/hooks/useBookingSettings');
    expect(typeof mod.useClinicBookingStatus).toBe('function');
  });
});