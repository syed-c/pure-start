/**
 * Global test setup — provides dummy environment variables
 * so modules that read import.meta.env or process.env don't crash.
 */
import { vi } from 'vitest';

vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
vi.stubEnv('VITE_SUPABASE_PROJECT_ID', 'test-project');
vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');