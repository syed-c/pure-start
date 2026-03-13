/**
 * Active Regions Configuration (UK Market)
 * 
 * COMPATIBILITY LAYER: This file re-exports from activeRegions.ts
 * using the old names for backward compatibility during migration.
 * Components should gradually migrate to import from activeRegions.ts directly.
 */

import { 
  ACTIVE_REGIONS, 
  ACTIVE_REGION_SLUGS, 
  isActiveRegion, 
  getFullSlug as getFullSlugNew, 
  filterActiveRegions, 
  getActiveRegionBySlug,
  isPageInActiveRegion,
  type ActiveRegion,
  type ActiveRegionSlug,
} from './activeRegions';

// Re-export with old names for compatibility
export const ACTIVE_STATE_SLUGS = ACTIVE_REGION_SLUGS;
export type ActiveStateSlug = ActiveRegionSlug;

export const ACTIVE_STATES = ACTIVE_REGIONS;
export type ActiveState = ActiveRegion;

export const isActiveState = isActiveRegion;
export const getFullSlug = getFullSlugNew;
export const filterActiveStates = filterActiveRegions;
export const getActiveStateBySlug = getActiveRegionBySlug;
export const isPageInActiveState = isPageInActiveRegion;
