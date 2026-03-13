/**
 * Visitor tracking hook — disabled until edge function is deployed.
 * Returns no-op functions to prevent runtime errors.
 */

export function useVisitorTracking() {
  return {
    trackEvent: async (_name: string, _data?: Record<string, unknown>) => {},
    trackJourney: async (_step: string, _data?: Record<string, unknown>) => {},
    trackConversion: async (_leadId: string, _clinicId: string) => {},
  };
}
