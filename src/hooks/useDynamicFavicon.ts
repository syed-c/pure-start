import { useEffect } from 'react';
import { useSiteSettings } from './useSiteSettings';

/**
 * Hook to dynamically update the favicon based on branding settings
 */
export function useDynamicFavicon() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const faviconUrl = settings?.branding?.favicon_url || '/favicon.svg';
    
    const getContentType = (url: string) => {
      if (url.includes('.svg')) return 'image/svg+xml';
      if (url.includes('.png')) return 'image/png';
      if (url.includes('.ico')) return 'image/x-icon';
      return 'image/png';
    };
    
    const contentType = getContentType(faviconUrl);
    
    const primaryIcons = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']") as NodeListOf<HTMLLinkElement>;
    primaryIcons.forEach(link => {
      link.href = faviconUrl;
      link.type = contentType;
    });
    
    const appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (appleIcon) appleIcon.href = faviconUrl;
    
    const msTile = document.querySelector("meta[name='msapplication-TileImage']") as HTMLMetaElement;
    if (msTile) msTile.content = faviconUrl;
  }, [settings?.branding?.favicon_url]);
}
