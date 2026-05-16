export interface InterlinkRule {
  pageType: string;
  targetTypes: string[];
  maxLinks: number;
  minWordsBetween: number;
  anchorVariants: Record<string, string[]>;
}

export interface InterlinkCandidate {
  phrase: string;
  href: string;
  priority: number;
}

const INTERLINK_RULES: Record<string, InterlinkRule> = {
  city: {
    pageType: 'city',
    targetTypes: ['nearby_city', 'service', 'region'],
    maxLinks: 4,
    minWordsBetween: 150,
    anchorVariants: {
      nearby_city: [
        'fostering agencies in {name}',
        'foster care in {name}',
        '{name} fostering agencies',
        'agencies in {name}',
      ],
      service: [
        '{name} in {location}',
        '{name} placements',
        '{name} fostering',
      ],
      region: [
        'fostering agencies across {name}',
        'foster care in {name}',
      ],
    },
  },
  service_location: {
    pageType: 'service_location',
    targetTypes: ['city', 'service', 'nearby_city'],
    maxLinks: 3,
    minWordsBetween: 120,
    anchorVariants: {
      city: [
        'fostering agencies in {name}',
        'foster carers in {name}',
      ],
      service: [
        'other fostering options like {name}',
        '{name} support',
      ],
      nearby_city: [
        'agencies in nearby {name}',
        'fostering in {name}',
      ],
    },
  },
  agency: {
    pageType: 'agency',
    targetTypes: ['service', 'city'],
    maxLinks: 3,
    minWordsBetween: 100,
    anchorVariants: {
      service: [
        '{name} services',
        '{name} fostering',
      ],
      city: [
        'fostering agencies in {name}',
        'foster care in {name}',
      ],
    },
  },
  blog: {
    pageType: 'blog',
    targetTypes: ['service', 'city', 'region'],
    maxLinks: 5,
    minWordsBetween: 80,
    anchorVariants: {
      service: [
        'learn about {name}',
        '{name} placements',
      ],
      city: [
        'agencies in {name}',
        'fostering in {name}',
      ],
      region: [
        'fostering across {name}',
        'agencies in {name}',
      ],
    },
  },
};

export function getInterlinkRule(pageType: string): InterlinkRule {
  return INTERLINK_RULES[pageType] || INTERLINK_RULES.city;
}

export function buildInterlinkCandidates(
  pageType: string,
  locationName: string,
  nearbyCities: { name: string; slug: string; region: string }[],
  services: { name: string; slug: string }[],
  regionName?: string,
  regionSlug?: string,
): InterlinkCandidate[] {
  const rule = getInterlinkRule(pageType);
  const candidates: InterlinkCandidate[] = [];

  for (const targetType of rule.targetTypes) {
    if (targetType === 'nearby_city' || targetType === 'city') {
      const cities = targetType === 'nearby_city' ? nearbyCities : nearbyCities;
      for (const city of cities.slice(0, 4)) {
        const variants = rule.anchorVariants[targetType] || [];
        for (const variant of variants) {
          const phrase = variant.replace('{name}', city.name).replace('{location}', locationName);
          const href = `/${city.region}/${city.slug}/`;
          const priority = targetType === 'nearby_city' ? 80 : 70;
          candidates.push({ phrase, href, priority });
        }
      }
    }

    if (targetType === 'service') {
      for (const svc of services) {
        const variants = rule.anchorVariants.service || [];
        for (const variant of variants) {
          const phrase = variant.replace('{name}', svc.name).replace('{location}', locationName);
          const href = `/categories/${svc.slug}/`;
          const priority = 60;
          candidates.push({ phrase, href, priority });
        }
      }
    }

    if (targetType === 'region' && regionName && regionSlug) {
      const variants = rule.anchorVariants.region || [];
      for (const variant of variants) {
        const phrase = variant.replace('{name}', regionName);
        const href = `/${regionSlug}/`;
        const priority = 50;
        candidates.push({ phrase, href, priority });
      }
    }
  }

  return candidates.sort((a, b) => b.priority - a.priority);
}

export interface InterlinkResult {
  content: string;
  linksInserted: number;
}

export function injectInterlinksIntoHtml(
  html: string,
  candidates: InterlinkCandidate[],
  maxLinks: number,
): InterlinkResult {
  let linksInserted = 0;

  for (const candidate of candidates) {
    if (linksInserted >= maxLinks) break;

    const regex = new RegExp(
      `(?<!<a[^>]*>)(?<!">)(${escapeRegex(candidate.phrase)})(?!</a>)(?![^<]*>)`,
      'gi',
    );

    html = html.replace(regex, (match) => {
      if (linksInserted >= maxLinks) return match;
      linksInserted++;
      return `<a href="${candidate.href}" class="text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors">${match}</a>`;
    });
  }

  return { content: html, linksInserted };
}

export function injectInterlinksIntoText(
  text: string,
  candidates: InterlinkCandidate[],
  maxLinks: number,
  locationName: string,
  regionSlug: string,
): InterlinkResult {
  let linksInserted = 0;
  const usedPhrases = new Set<string>();

  for (const candidate of candidates) {
    if (linksInserted >= maxLinks) break;
    if (usedPhrases.has(candidate.phrase.toLowerCase())) continue;

    const regex = new RegExp(`\\b${escapeRegex(candidate.phrase)}\\b`, 'gi');
    const match = regex.exec(text);
    if (match) {
      text = text.slice(0, match.index) +
        `[${candidate.phrase}](${candidate.href})` +
        text.slice(match.index + match[0].length);
      usedPhrases.add(candidate.phrase.toLowerCase());
      linksInserted++;
    }
  }

  return { content: text, linksInserted };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
