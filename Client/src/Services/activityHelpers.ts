/**
 * activityHelpers.ts
 * ==================
 * Shared utility functions for formatting and displaying activity/post data.
 * Import these into any component instead of redefining them locally.
 */

// ============================================================================
// ACTIVITY ICONS
// ============================================================================
export const ACTIVITY_ICONS: Record<string, string> = {
  Running: 'fa-running',
  Walking: 'fa-walking',
  Cycling: 'fa-biking',
  Swimming: 'fa-swimmer',
  Weightlifting: 'fa-dumbbell',
  Yoga: 'fa-spa',
  HIIT: 'fa-fire',
  Sports: 'fa-futbol',
  Other: 'fa-heartbeat',
}

/**
 * getActivityIcon - Returns the Font Awesome icon class for an activity type.
 */
export function getActivityIcon(type: string): string {
  return ACTIVITY_ICONS[type] ?? 'fa-heartbeat'
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * formatDate - Formats an ISO date string as a long human-readable date.
 * e.g. "Monday, April 13, 2026"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * formatCommentDate - Formats an ISO date string as a short date.
 * e.g. "Apr 13, 2026"
 */
export function formatCommentDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ============================================================================
// DURATION FORMATTING
// ============================================================================

/**
 * parseDuration - Parses a duration string into total minutes.
 * Handles "90" (plain minutes), "1h 30m", and "1:30" (h:m colon) formats.
 */
export function parseDuration(input: string | number): number {
  if (!input) return 0
  if (typeof input === 'number') return input
  const str = String(input)
  if (str.includes(':')) {
    const [h, m] = str.split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }
  const hm = str.match(/(\d+)h\s*(\d+)m/)
  if (hm) return Number(hm[1]) * 60 + Number(hm[2])
  const ho = str.match(/(\d+)h/)
  if (ho) return Number(ho[1]) * 60
  return parseInt(str) || 0
}

/**
 * formatDuration - Formats total minutes into a human-readable duration string.
 * Accepts either a string of minutes (e.g. "90") or a pre-parsed number.
 * e.g. 90 -> "1h 30min"
 */
export function formatDuration(input: string | number): string {
  const totalMins = typeof input === 'number' ? input : parseDuration(input)
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  if (hours > 0 && mins > 0) return `${hours}h ${mins}min`
  if (hours > 0) return `${hours}h`
  return `${mins}min`
}
