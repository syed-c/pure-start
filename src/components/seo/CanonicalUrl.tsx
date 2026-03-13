import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface CanonicalUrlProps {
  href?: string;
  baseDomain?: string;
}

const BASE_URL = 'https://www.fosterconnect.co.uk';

export function CanonicalUrl({ href, baseDomain }: CanonicalUrlProps) {
  const location = useLocation();

  const buildCanonical = () => {
    if (href) return href;
    const base = baseDomain || BASE_URL;
    let path = location.pathname;
    if (path !== '/' && !path.endsWith('/')) {
      path += '/';
    }
    return `${base}${path}`;
  };

  return (
    <Helmet>
      <link rel="canonical" href={buildCanonical()} />
    </Helmet>
  );
}

export function HreflangTags({ path }: { path?: string }) {
  const location = useLocation();
  const currentPath = path || location.pathname;
  const normalizedPath = currentPath.endsWith('/') || currentPath === '/' 
    ? currentPath 
    : `${currentPath}/`;

  return (
    <Helmet>
      <link rel="alternate" hrefLang="en-gb" href={`${BASE_URL}${normalizedPath}`} />
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${normalizedPath}`} />
    </Helmet>
  );
}

export default CanonicalUrl;
