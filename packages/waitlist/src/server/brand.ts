/**
 * Brand profiles: the per-site data the waitlist API serves.
 *
 * One entry per site. Everything brand-specific (sender display name, subjects,
 * headings, footer, legal block, links) comes from the profile selected for the
 * request, so the same service can answer for several sites.
 *
 * The routing hint order for each request — never failing the request because
 * of a hint — is:
 *   1. the X-Site header, when it names a known profile id;
 *   2. else an exact host match (the port is ignored);
 *   3. else WAITLIST_DEFAULT_BRAND from the environment (validated at load);
 *   4. else the openportalhub profile.
 */

import type { WaitlistLang } from "./env";

export type BrandId = "openportalhub" | "eventimeline";

export interface BrandProfile {
  id: BrandId;
  /** Shown in the mail subject, headings and footer. */
  productName: string;
  /** Responsible party named in the legal block. */
  operatorName: string;
  /** Public origin of the site; no trailing slash. */
  siteUrl: string;
  /** Absolute privacy policy link per waitlist language (the policy page is
   *  published per language); not built from the origin. */
  privacyUrls: Record<WaitlistLang, string>;
  /** Hosts whose Host header selects this profile. */
  hosts: readonly string[];
}

export const BRANDS: Record<BrandId, BrandProfile> = {
  openportalhub: {
    id: "openportalhub",
    productName: "OpenPortalHub",
    operatorName: "OpenPortalHub",
    siteUrl: "https://openportalhub.org",
    privacyUrls: {
      en: "https://openportalhub.org/privacy.html",
      es: "https://openportalhub.org/es/privacy.html",
    },
    hosts: ["openportalhub.org", "www.openportalhub.org"],
  },
  eventimeline: {
    id: "eventimeline",
    productName: "EventTimeline",
    operatorName: "OpenPortalHub",
    siteUrl: "https://eventimeline.openportalhub.org",
    // No policy page of its own: both languages point at the OpenPortalHub one.
    privacyUrls: {
      en: "https://openportalhub.org/privacy.html",
      es: "https://openportalhub.org/es/privacy.html",
    },
    hosts: ["eventimeline.openportalhub.org", "www.eventimeline.openportalhub.org"],
  },
};

/** Used when no header, host or configured default selects a profile. */
export const DEFAULT_BRAND_ID: BrandId = "openportalhub";

export function isBrandId(value: string): value is BrandId {
  return Object.prototype.hasOwnProperty.call(BRANDS, value);
}

export type BrandSource = "x-site" | "host" | "default";

export interface BrandResolution {
  brand: BrandProfile;
  /** How the profile was selected. */
  via: BrandSource;
  /** Set when an X-Site header was present but named no known profile; the
   *  caller logs it, the request still proceeds. */
  unknownXSite?: string;
}

/** Lower-cases and drops the port ("OPENPORTHUB.ORG:8443" -> "openportalhub.org";
 *  an IPv6 literal keeps its brackets stripped). */
function normalizeHost(host: string): string {
  const trimmed = host.trim().toLowerCase();
  if (trimmed.startsWith("[")) {
    const close = trimmed.indexOf("]");
    return close === -1 ? trimmed : trimmed.slice(1, close);
  }
  return trimmed.split(":")[0] ?? trimmed;
}

function brandForHost(host: string | null | undefined): BrandProfile | null {
  if (host === null || host === undefined) return null;
  const normalized = normalizeHost(host);
  if (normalized === "") return null;
  for (const profile of Object.values(BRANDS)) {
    if (profile.hosts.includes(normalized)) return profile;
  }
  return null;
}

/**
 * Resolves the brand profile for one request. Never throws and never fails
 * the request: an unknown routing hint falls through to the next source.
 */
export function resolveBrand(input: {
  xSite?: string | null;
  host?: string | null;
  defaultBrand?: BrandId;
}): BrandResolution {
  const header = input.xSite?.trim().toLowerCase() ?? "";
  if (header !== "") {
    if (isBrandId(header)) {
      return { brand: BRANDS[header], via: "x-site" };
    }
    const unknownXSite = input.xSite!.trim();
    const byHost = brandForHost(input.host);
    if (byHost !== null) return { brand: byHost, via: "host", unknownXSite };
    return { brand: BRANDS[input.defaultBrand ?? DEFAULT_BRAND_ID], via: "default", unknownXSite };
  }
  const byHost = brandForHost(input.host);
  if (byHost !== null) return { brand: byHost, via: "host" };
  return { brand: BRANDS[input.defaultBrand ?? DEFAULT_BRAND_ID], via: "default" };
}
