import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * TrailingSlashRedirect - Enforces URL consistency
 *
 * SEO CRITICAL: Ensures all URLs use the same format (WITH trailing slash)
 * This prevents duplicate content issues where /page and /page/ are indexed separately.
 *
 * Uses navigate() for client-side routing to avoid full-page reloads
 * that would bypass the SPA and cause 404s on direct visits.
 */
export function TrailingSlashRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, search, hash } = location;

    // Skip if it's the root path or already has a trailing slash
    if (pathname === '/' || pathname.endsWith('/')) {
      return;
    }

    // Skip file-like paths (with extensions)
    if (pathname.includes('.')) {
      return;
    }

    // Add trailing slash
    const pathWithSlash = pathname + "/";

    // Client-side redirect to canonical URL (no full page reload)
    navigate(pathWithSlash + search + hash, { replace: true });
  }, [location, navigate]);

  return null;
}
