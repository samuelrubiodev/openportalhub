import { describe, expect, test } from "bun:test";
import type { BrandProfile } from "./brand";
import { BRANDS } from "./brand";
import {
  renderConfirmPage,
  renderConfirmationEmail,
  renderInvalidTokenPage,
  renderWithdrawalNotice,
  renderWithdrawalPage,
} from "./templates";

const OPENPORTALHUB = BRANDS.openportalhub;
const EVENTIMELINE = BRANDS.eventimeline;
const UNSUBSCRIBE = "https://unsubscribe.example.org/api/waitlist/unsubscribe?token=t0k3n";
const POSTAL = "Test Street 1, 00000 Testville";

function confirmation(brand: BrandProfile, lang: "en" | "es" = "en", source: "beta" | "list" = "beta") {
  return renderConfirmationEmail({
    email: "person@example.org",
    lang,
    source,
    unsubscribeUrl: UNSUBSCRIBE,
    brand,
    postalAddress: POSTAL,
  });
}

describe("confirmation templates per brand", () => {
  test("the openportalhub profile keeps its product name, operator, privacy and unsubscribe links", () => {
    const mail = confirmation(OPENPORTALHUB);
    expect(mail.subject).toBe("You are on the OpenPortalHub list");
    expect(mail.html).toContain("OpenPortalHub is responsible for this message");
    expect(mail.text).toContain("OpenPortalHub is responsible for this message");
    expect(mail.html).toContain(`href="${OPENPORTALHUB.privacyUrls.en}"`);
    expect(mail.text).toContain(`Privacy policy: ${OPENPORTALHUB.privacyUrls.en}`);
    expect(mail.html).toContain(`href="${UNSUBSCRIBE}"`);
    expect(mail.text).toContain(UNSUBSCRIBE);
    expect(mail.html).toContain("&copy; 2026 OpenPortalHub");
    expect(mail.html).toContain(OPENPORTALHUB.siteUrl);
    expect(mail.text).toContain("\u00a9 2026 OpenPortalHub \u00b7 openportalhub.org");
    expect(mail.text).toContain(POSTAL);
  });

  test("the eventimeline profile substitutes the product name in subject, headings and footer", () => {
    const mail = confirmation(EVENTIMELINE);
    expect(mail.subject).toBe("You are on the EventTimeline list");
    expect(mail.html).toContain("is registered for the EventTimeline waitlist");
    expect(mail.html).not.toContain("You are on the OpenPortalHub list");
    expect(mail.html).toContain("&copy; 2026 EventTimeline");
    expect(mail.html).toContain("eventimeline.openportalhub.org");
    expect(mail.html).toContain(`href="${EVENTIMELINE.siteUrl}"`);
    expect(mail.text).toContain("\u00a9 2026 EventTimeline \u00b7 eventimeline.openportalhub.org");
  });

  test("the legal block keeps the operator as the responsible party for both brands", () => {
    expect(confirmation(EVENTIMELINE).html).toContain("OpenPortalHub is responsible for this message");
    expect(confirmation(OPENPORTALHUB).html).toContain("OpenPortalHub is responsible for this message");
  });

  test("the privacy link follows the message language for both brands, never built from an origin", () => {
    for (const brand of [OPENPORTALHUB, EVENTIMELINE]) {
      const en = confirmation(brand, "en");
      const es = confirmation(brand, "es");
      expect(en.html).toContain(`href="${brand.privacyUrls.en}"`);
      expect(en.text).toContain(`Privacy policy: ${brand.privacyUrls.en}`);
      expect(es.html).toContain(`href="${brand.privacyUrls.es}"`);
      expect(es.text).toContain(`Pol\u00edtica de privacidad: ${brand.privacyUrls.es}`);
      // A Spanish message must not point at the English policy page.
      expect(es.html).not.toContain(`href="${brand.privacyUrls.en}"`);
      expect(es.text).not.toContain(brand.privacyUrls.en);
      // The eventimeline origin must not leak into the privacy link.
      expect(en.html).not.toContain('href="https://eventimeline.openportalhub.org/privacy');
      expect(es.html).not.toContain('href="https://eventimeline.openportalhub.org/privacy');
    }
  });

  test("the Spanish copy keeps its wording with the substituted brand", () => {
    const mail = confirmation(OPENPORTALHUB, "es", "list");
    expect(mail.subject).toBe("Est\u00e1s en la lista de OpenPortalHub");
    expect(mail.html).toContain('lang="es"');
    expect(mail.html).toContain("OpenPortalHub es responsable de este mensaje");
    expect(confirmation(EVENTIMELINE, "es").subject).toBe("Est\u00e1s en la lista de EventTimeline");
    expect(confirmation(EVENTIMELINE, "es").html).toContain("est\u00e1 registrada en la lista de espera de EventTimeline");
  });

  test("both sources and the email rendering behave as before", () => {
    const beta = confirmation(OPENPORTALHUB, "en", "beta");
    const list = confirmation(OPENPORTALHUB, "en", "list");
    expect(beta.html).toContain("closed-beta access");
    expect(list.html).toContain("You asked for announcements");
    expect(beta.html).toContain("<strong>person@example.org</strong>");
  });
});

describe("withdrawal pages and operator notice per brand", () => {
  test("the withdrawal page names the brand in the intro and footer", () => {
    const page = renderWithdrawalPage({ lang: "en", email: "person@example.org", brand: EVENTIMELINE, contactAddress: "legal@example.org" });
    expect(page).toContain("has been withdrawn from the EventTimeline waitlist");
    expect(page).toContain("&copy; 2026 EventTimeline");
  });

  test("the confirm page names the brand and keeps the form action", () => {
    const page = renderConfirmPage({
      lang: "es",
      email: "person@example.org",
      brand: EVENTIMELINE,
      contactAddress: "legal@example.org",
      formAction: "/api/waitlist/unsubscribe?token=abc",
    });
    expect(page).toContain("registrada en la lista de espera de EventTimeline");
    expect(page).toContain('action="/api/waitlist/unsubscribe?token=abc"');
  });

  test("the invalid-token page fails closed: contact address only, no decoded data", () => {
    const page = renderInvalidTokenPage({ brand: OPENPORTALHUB, contactAddress: "legal@example.org" });
    expect(page).toContain("THIS LINK IS NOT VALID");
    expect(page).toContain("legal@example.org");
    expect(page).not.toContain("person@example.org");
  });

  test("the operator notice subject carries the product name", () => {
    expect(renderWithdrawalNotice({ email: "person@example.org", lang: "en", iat: 0, brand: OPENPORTALHUB }).subject).toBe(
      "OpenPortalHub waitlist: withdrawal request",
    );
    expect(renderWithdrawalNotice({ email: "person@example.org", lang: "en", iat: 0, brand: EVENTIMELINE }).subject).toBe(
      "EventTimeline waitlist: withdrawal request",
    );
  });
});
