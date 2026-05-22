export type ToneDimension = 'warm_compassionate' | 'professional_authoritative' | 'informative_educational' | 'conversion_focused';

export const TONE_DIMENSION_LABELS: Record<ToneDimension, string> = {
  warm_compassionate: 'Warm & Compassionate',
  professional_authoritative: 'Professional & Authoritative',
  informative_educational: 'Informative & Educational',
  conversion_focused: 'Conversion Focused',
};

export const TONE_DIMENSIONS: ToneDimension[] = [
  'warm_compassionate',
  'professional_authoritative',
  'informative_educational',
  'conversion_focused',
];

export type ToneBlend = Record<ToneDimension, number>;

export type ToneMode = 'auto' | 'custom';

export type TonePageType =
  | 'location'
  | 'city'
  | 'region'
  | 'agency'
  | 'agency_profile'
  | 'service'
  | 'service_location'
  | 'blog'
  | 'homepage'
  | 'faq'
  | 'static'
  | 'resource'
  | 'lead'
  | 'category'
  | 'state';

const DEFAULT_BLEND: ToneBlend = {
  warm_compassionate: 40,
  professional_authoritative: 30,
  informative_educational: 20,
  conversion_focused: 10,
};

const PAGE_TYPE_PRESETS: Record<TonePageType, ToneBlend> = {
  location: { warm_compassionate: 30, professional_authoritative: 25, informative_educational: 25, conversion_focused: 20 },
  city: { warm_compassionate: 30, professional_authoritative: 20, informative_educational: 30, conversion_focused: 20 },
  region: { warm_compassionate: 30, professional_authoritative: 25, informative_educational: 25, conversion_focused: 20 },
  agency: { warm_compassionate: 25, professional_authoritative: 45, informative_educational: 20, conversion_focused: 10 },
  agency_profile: { warm_compassionate: 25, professional_authoritative: 45, informative_educational: 20, conversion_focused: 10 },
  service: { warm_compassionate: 40, professional_authoritative: 25, informative_educational: 15, conversion_focused: 20 },
  service_location: { warm_compassionate: 40, professional_authoritative: 25, informative_educational: 15, conversion_focused: 20 },
  blog: { warm_compassionate: 20, professional_authoritative: 20, informative_educational: 50, conversion_focused: 10 },
  homepage: { warm_compassionate: 40, professional_authoritative: 30, informative_educational: 20, conversion_focused: 10 },
  faq: { warm_compassionate: 20, professional_authoritative: 20, informative_educational: 50, conversion_focused: 10 },
  static: { warm_compassionate: 40, professional_authoritative: 30, informative_educational: 20, conversion_focused: 10 },
  resource: { warm_compassionate: 20, professional_authoritative: 20, informative_educational: 50, conversion_focused: 10 },
  lead: { warm_compassionate: 25, professional_authoritative: 25, informative_educational: 15, conversion_focused: 35 },
  category: { warm_compassionate: 45, professional_authoritative: 25, informative_educational: 20, conversion_focused: 10 },
  state: { warm_compassionate: 35, professional_authoritative: 25, informative_educational: 30, conversion_focused: 10 },
};

export function getToneBlendForPageType(pageType: string, mode: ToneMode, customBlend?: ToneBlend): ToneBlend {
  if (mode === 'custom' && customBlend) {
    return validateAndNormalizeBlend(customBlend);
  }
  const key = PAGE_TYPE_PRESETS[pageType as TonePageType] ? pageType as TonePageType : 'homepage';
  return { ...PAGE_TYPE_PRESETS[key] };
}

export function validateAndNormalizeBlend(blend: ToneBlend): ToneBlend {
  const total = Object.values(blend).reduce((sum, v) => sum + Math.max(0, v), 0);
  if (total === 0) return { ...DEFAULT_BLEND };
  return {
    warm_compassionate: Math.round((blend.warm_compassionate / total) * 100),
    professional_authoritative: Math.round((blend.professional_authoritative / total) * 100),
    informative_educational: Math.round((blend.informative_educational / total) * 100),
    conversion_focused: Math.round((blend.conversion_focused / total) * 100),
  };
}

export function blendTotal(blend: ToneBlend): number {
  return Object.values(blend).reduce((sum, v) => sum + v, 0);
}

export function buildTonePrompt(blend: ToneBlend, pageType: string): string {
  const wc = blend.warm_compassionate;
  const pa = blend.professional_authoritative;
  const ie = blend.informative_educational;
  const cf = blend.conversion_focused;

  return `TONE BLEND (weighted distribution):
- Warm & Compassionate: ${wc}%
- Professional & Authoritative: ${pa}%
- Informative & Educational: ${ie}%
- Conversion Focused: ${cf}%

Apply these writing rules according to the weightings above:

${wc >= 25 ? `WARM & COMPASSIONATE GUIDELINES (${wc}% weight):
- Use conversational but polished language that feels human and supportive
- Write with empathy and emotional awareness — acknowledge the reader's situation
- Use welcoming, reassuring phrasing without emotional manipulation
- Avoid robotic wording, cold business language, and aggressive selling
- Frame information around the reader's needs and feelings` : ''}

${pa >= 25 ? `PROFESSIONAL & AUTHORITATIVE GUIDELINES (${pa}% weight):
- Use confident, expert-level language backed by factual information
- Structure content clearly with logical flow and professional terminology where relevant
- Maintain compliance-aware wording suitable for regulated sectors
- Avoid exaggerated claims, fake authority, or unsupported promises` : ''}

${ie >= 25 ? `INFORMATIVE & EDUCATIONAL GUIDELINES (${ie}% weight):
- Explain concepts clearly with practical guidance and user-first education
- Use FAQ-style clarity and comparison-based explanations where helpful
- Write for real humans first — avoid filler and keyword stuffing` : ''}

${cf >= 15 ? `CONVERSION-FOCUSED GUIDELINES (${cf}% weight):
- Use gentle, trust-based persuasion with benefit-led messaging
- Encourage action through solution positioning, not hard selling
- Preferred CTA style: natural guidance ("Compare agencies in your area", "Find support near you", "Explore available options")
- NEVER use: "Buy now", "Limited time", "Guaranteed best service", "Hurry", fake urgency, manipulative scarcity` : ''}

${pageType === 'agency' || pageType === 'agency_profile' ? `IMPORTANT - DIRECTORY CONTENT RULES:
- Content must feel compassionate, calm, trustworthy, supportive, professional, and emotionally intelligent
- Never sound like lead generation spam
- Position the platform as a trusted fostering guidance and discovery platform, NOT a basic listing website` : ''}`.trim();
}
