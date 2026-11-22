/**
 * Addresses of pages that live OUTSIDE this app.
 *
 * They aren't decided yet. While a value is null, the footer hides that link
 * (and hides a whole column if all its links are null). Fill in a URL and the
 * link appears, nothing else to change.
 */
export const SITE_LINKS = {
  helpCenter: null,
  contactSupport: null,
  terms: null,
  privacy: null,
} satisfies Record<string, string | null>;
