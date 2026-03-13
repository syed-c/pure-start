/**
 * Normalize UK region slugs.
 *
 * The database uses full-name slugs (england, scotland, wales, etc.)
 * This function normalizes abbreviations to the DB slug.
 */
const ABBREV_TO_FULL: Record<string, string> = {
  eng: "england",
  sct: "scotland",
  wls: "wales",
  nir: "northern-ireland",
  lon: "greater-london",
  wmd: "west-midlands",
  gmr: "greater-manchester",
  wyk: "west-yorkshire",
  syk: "south-yorkshire",
  msy: "merseyside",
};

export function normalizeStateSlug(input?: string | null): string {
  const s = (input || "").trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  // If it's an abbreviation, convert to full slug; otherwise keep as-is
  return ABBREV_TO_FULL[lower] ?? lower;
}
