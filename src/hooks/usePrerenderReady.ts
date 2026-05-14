import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    prerenderReady: boolean;
  }
}

/**
 * Hook to signal Prerender.io that the page is ready for capture.
 * 
 * CRITICAL FOR SEO: This hook controls when bots can capture the page.
 * Only signal ready when ALL SEO-critical content is rendered:
 * - Page headings and titles
 * - Main content sections
 * - FAQs
 * - Schema markup
 * - Internal links
 * 
 * @param isReady - Boolean indicating if ALL page data is loaded
 * @param options - Optional configuration
 */
interface PrerenderOptions {
  /** Delay in ms before signaling ready (default: 800) */
  delay?: number;
  /** Minimum content length to validate (optional) */
  minContentLength?: number;
}

export function usePrerenderReady(isReady: boolean, options?: PrerenderOptions) {
  const hasSignaled = useRef(false);
  const delay = options?.delay ?? 800;

  useEffect(() => {
    if (isReady && !hasSignaled.current) {
      hasSignaled.current = true;

      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          const hasH1 = !!document.querySelector('h1');
          const hasMain = !!document.querySelector('main, article, [role="main"]');
          const contentLength = document.body?.innerText?.length || 0;
          const minLength = options?.minContentLength ?? 200;

          if (hasH1 && hasMain && contentLength > minLength) {
            window.prerenderReady = true;
          } else {
            setTimeout(() => {
              window.prerenderReady = true;
            }, 1000);
          }
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isReady, delay, options?.minContentLength]);

  useEffect(() => {
    return () => {
      hasSignaled.current = false;
      if (typeof window !== 'undefined') {
        window.prerenderReady = false;
      }
    };
  }, []);
}

export default usePrerenderReady;
