/**
 * Email-safe templates for the waitlist messages and the withdrawal page.
 *
 * ONE shared table-based layout (darkShell) renders the confirmation mail, the
 * withdrawal result page and the operator notice. Copy lives in per-language
 * content records transcribed from the approved design — not improvised here.
 * Every brand string comes from the profile passed to the render functions:
 * {product} is replaced with brand.productName, {operator} with
 * brand.operatorName, and the links carry brand.siteUrl plus the privacy
 * policy link in the message's language (brand.privacyUrls).
 *
 * Constraints carried over from the site (src/styles/hero.css):
 * - the same palette (#131313 ground, #1a1a1a raised, #2c2c2c hairline,
 *   #8a8a8a grey, #d23b2e pencil red, #f5f5f3 ink);
 * - table-based layout, 600 px card, inline styles only, role="presentation",
 *   explicit bgcolor next to every background-color;
 * - no external images and no webfonts: the wordmark is text and the stacks are
 *   the email-safe fallbacks of the site fonts (display: Arial Narrow /
 *   'Helvetica Neue' / Arial; body: Arial / Helvetica; labels: JetBrains Mono /
 *   Consolas / monospace);
 * - a hidden preheader for every message.
 */

import type { WaitlistLang, WaitlistSource } from "./env";
import type { BrandProfile } from "./brand";

const palette = {
  ground: "#131313",
  raised: "#1a1a1a",
  hairline: "#2c2c2c",
  grey: "#8a8a8a",
  red: "#d23b2e",
  ink: "#f5f5f3",
} as const;

const displayFont = "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "https://example.org/privacy.html" -> "example.org/privacy.html" (link label). */
function siteLabel(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

/** Brand substitutions in the approved copy: {product} and {operator}. */
function withBrand(template: string, brand: BrandProfile): string {
  return template.replace("{product}", brand.productName).replace("{operator}", brand.operatorName);
}

function footerHtml(brand: BrandProfile): string {
  return `&copy; 2026 ${escapeHtml(brand.productName)} &middot; <a href="${escapeHtml(brand.siteUrl)}" style="color:${palette.grey};text-decoration:underline;">${escapeHtml(siteLabel(brand.siteUrl))}</a>`;
}

function footerText(brand: BrandProfile): string {
  return `\u00a9 2026 ${brand.productName} \u00b7 ${siteLabel(brand.siteUrl)}`;
}

const bodyFont = "Arial, Helvetica, sans-serif";
const monoFont = "'JetBrains Mono', Consolas, monospace";

interface ShellInput {
  lang: WaitlistLang;
  /** Hidden preview text; rendered only for mail, never for the pages. */
  preheader?: string;
  eyebrow: string;
  title: string;
  /** Ready-made inner HTML (paragraphs, button, legal block...). */
  rows: string[];
  /** The brand whose name and site link the footer carries. */
  brand: BrandProfile;
}

/**
 * The one shared layout: dark ground, 600 px raised card, red rule, mono
 * eyebrow, condensed display title, content rows, small footer.
 */
function darkShell(input: ShellInput): string {
  const preheader = input.preheader
    ? `      <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(input.preheader)}</div>\n`
    : "";
  return `<!DOCTYPE html>
<html lang="${input.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${palette.ground};">
${preheader}  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${palette.ground}" style="background-color:${palette.ground};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" bgcolor="${palette.raised}" style="width:100%;max-width:600px;background-color:${palette.raised};border:1px solid ${palette.hairline};">
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48" height="3" bgcolor="${palette.red}" style="background-color:${palette.red};height:3px;line-height:3px;font-size:1px;">&nbsp;</td>
                </tr>
              </table>
              <p style="margin:16px 0 0 0;font-family:${monoFont};font-size:12px;letter-spacing:2px;color:${palette.grey};">${escapeHtml(input.eyebrow)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 0 40px;">
              <h1 style="margin:0;font-family:${displayFont};font-size:44px;line-height:1.05;letter-spacing:1px;font-weight:700;text-transform:uppercase;color:${palette.ink};">${escapeHtml(input.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <div style="height:1px;line-height:1px;font-size:1px;background-color:${palette.hairline};">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px 40px;">
${input.rows.join("\n")}
            </td>
          </tr>
        </table>
        <div style="max-width:600px;margin:16px auto 0 auto;font-family:${bodyFont};font-size:12px;color:${palette.grey};text-align:center;">${footerHtml(input.brand)}</div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function paragraph(html: string, tone: "ink" | "grey" = "ink", lang?: string): string {
  const langAttr = lang ? ` lang="${lang}"` : "";
  return `            <p${langAttr} style="margin:0 0 16px 0;font-family:${bodyFont};font-size:15px;line-height:1.6;color:${tone === "ink" ? palette.ink : palette.grey};">${html}</p>`;
}

function button(href: string, label: string): string {
  return `            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:8px 0 24px 0;">
              <tr>
                <td bgcolor="${palette.red}" style="background-color:${palette.red};">
                  <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:${monoFont};font-size:13px;letter-spacing:2px;color:${palette.ink};text-decoration:none;">${escapeHtml(label)}</a>
                </td>
              </tr>
            </table>`;
}

/** The red action as a real submit button inside a form (withdrawal confirm page). */
function submitButton(formAction: string, label: string): string {
  return `            <form method="post" action="${escapeHtml(formAction)}" style="margin:8px 0 16px 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="${palette.red}" style="background-color:${palette.red};">
                    <input type="submit" value="${escapeHtml(label)}" style="display:inline-block;padding:14px 28px;font-family:${monoFont};font-size:13px;letter-spacing:2px;color:${palette.ink};background-color:${palette.red};border:0;border-radius:0;cursor:pointer;appearance:none;-webkit-appearance:none;">
                  </td>
                </tr>
              </table>
            </form>`;
}

function legalBlock(lines: string[]): string {
  const rendered = lines
    .map(
      (line) =>
        `              <p style="margin:0 0 8px 0;font-family:${bodyFont};font-size:12px;line-height:1.6;color:${palette.grey};">${line}</p>`,
    )
    .join("\n");
  return `            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid ${palette.hairline};">
              <tr>
                <td style="padding:16px 0 0 0;">
${rendered}
                </td>
              </tr>
            </table>`;
}

/** Simple text link for the grey legal lines. */
function legalLink(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="color:${palette.ink};text-decoration:underline;">${escapeHtml(label)}</a>`;
}

// ---------------------------------------------------------------------------
// Confirmation mail: {en, es} x {beta, list}
// ---------------------------------------------------------------------------

interface LegalCopy {
  /** Contains the {operator} placeholder (the responsible party). */
  responsible: string;
  withdrawLead: string;
  withdrawLink: string;
  privacyLead: string;
  provider: string;
}

interface ConfirmationCopy {
  /** Contains the {product} placeholder. */
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  /** Contains the {email} and {product} placeholders. */
  intro: string;
  /** Per-source paragraph (beta tester build / announcements). */
  variant: string;
  notGet: string;
  button: string;
  legal: LegalCopy;
}

/** Transcribed from the approved design; do not rewrite the copy here. */
const confirmationCopy: Record<WaitlistLang, Record<WaitlistSource, ConfirmationCopy>> = {
  en: {
    beta: {
      subject: "You are on the {product} list",
      preheader: "Your address is registered. Here is what happens next.",
      eyebrow: "OPH \u00b7 WAITLIST",
      title: "YOU ARE ON THE LIST",
      intro:
        "The address {email} is registered for the {product} waitlist. This message confirms it; there is nothing to click to activate.",
      variant:
        "You asked for Event Timeline closed-beta access. When a build is ready for testers, that invitation arrives at this same address.",
      notGet: "What you will not get: a newsletter cadence, tracking pixels, or your address shared with anyone.",
      button: "OPEN THE SITE \u2192",
      legal: {
        responsible:
          "{operator} is responsible for this message. Your address is used only to send the mail you asked for; we do not sell or share it with anyone.",
        withdrawLead: "You can withdraw at any time:",
        withdrawLink: "Unsubscribe",
        privacyLead: "Privacy policy:",
        provider: "Delivered with Oracle Cloud Email Delivery.",
      },
    },
    list: {
      subject: "You are on the {product} list",
      preheader: "Your address is registered. Here is what happens next.",
      eyebrow: "OPH \u00b7 WAITLIST",
      title: "YOU ARE ON THE LIST",
      intro:
        "The address {email} is registered for the {product} waitlist. This message confirms it; there is nothing to click to activate.",
      variant:
        "You asked for announcements. Notes and releases are published on the site first; when a project ships or a release lands, you get one email.",
      notGet: "What you will not get: a newsletter cadence, tracking pixels, or your address shared with anyone.",
      button: "OPEN THE SITE \u2192",
      legal: {
        responsible:
          "{operator} is responsible for this message. Your address is used only to send the mail you asked for; we do not sell or share it with anyone.",
        withdrawLead: "You can withdraw at any time:",
        withdrawLink: "Unsubscribe",
        privacyLead: "Privacy policy:",
        provider: "Delivered with Oracle Cloud Email Delivery.",
      },
    },
  },
  es: {
    beta: {
      subject: "Est\u00e1s en la lista de {product}",
      preheader: "Tu direcci\u00f3n est\u00e1 registrada. Esto es lo que viene despu\u00e9s.",
      eyebrow: "OPH \u00b7 LISTA DE ESPERA",
      title: "EST\u00c1S EN LA LISTA",
      intro:
        "La direcci\u00f3n {email} est\u00e1 registrada en la lista de espera de {product}. Este mensaje lo confirma; no hay que pulsar nada para activarla.",
      variant:
        "Pediste acceso a la beta cerrada de Event Timeline. Cuando haya una build para testers, la invitaci\u00f3n llegar\u00e1 a esta misma direcci\u00f3n.",
      notGet: "Lo que no vas a recibir: cadencia de bolet\u00edn, p\u00edxeles de seguimiento ni tu direcci\u00f3n compartida con terceros.",
      button: "ABRIR LA WEB \u2192",
      legal: {
        responsible:
          "{operator} es responsable de este mensaje. Tu direcci\u00f3n se usa \u00fanicamente para enviarte el correo que pediste; no la vendemos ni la compartimos con nadie.",
        withdrawLead: "Puedes darte de baja en cualquier momento:",
        withdrawLink: "Dar de baja",
        privacyLead: "Pol\u00edtica de privacidad:",
        provider: "Enviado con Oracle Cloud Email Delivery.",
      },
    },
    list: {
      subject: "Est\u00e1s en la lista de {product}",
      preheader: "Tu direcci\u00f3n est\u00e1 registrada. Esto es lo que viene despu\u00e9s.",
      eyebrow: "OPH \u00b7 LISTA DE ESPERA",
      title: "EST\u00c1S EN LA LISTA",
      intro:
        "La direcci\u00f3n {email} est\u00e1 registrada en la lista de espera de {product}. Este mensaje lo confirma; no hay que pulsar nada para activarla.",
      variant:
        "Pediste los anuncios. Las notas y las versiones se publican primero en la web; cuando un proyecto salga o llegue una versi\u00f3n, recibes un solo correo.",
      notGet: "Lo que no vas a recibir: cadencia de bolet\u00edn, p\u00edxeles de seguimiento ni tu direcci\u00f3n compartida con terceros.",
      button: "ABRIR LA WEB \u2192",
      legal: {
        responsible:
          "{operator} es responsable de este mensaje. Tu direcci\u00f3n se usa \u00fanicamente para enviarte el correo que pediste; no la vendemos ni la compartimos con nadie.",
        withdrawLead: "Puedes darte de baja en cualquier momento:",
        withdrawLink: "Dar de baja",
        privacyLead: "Pol\u00edtica de privacidad:",
        provider: "Enviado con Oracle Cloud Email Delivery.",
      },
    },
  },
};

export interface ConfirmationInput {
  email: string;
  lang: WaitlistLang;
  source: WaitlistSource;
  unsubscribeUrl: string;
  /** The brand whose name, links and operator the message carries. */
  brand: BrandProfile;
  postalAddress?: string;
}

export function renderConfirmationEmail(input: ConfirmationInput): { subject: string; html: string; text: string } {
  const content = confirmationCopy[input.lang][input.source];
  const brand = input.brand;
  // The policy page is published per language: link the one in the language
  // the rest of this message already uses.
  const privacy = brand.privacyUrls[input.lang];
  const postal = input.postalAddress?.trim() ? input.postalAddress.trim() : undefined;

  const html = darkShell({
    lang: input.lang,
    preheader: content.preheader,
    eyebrow: content.eyebrow,
    title: content.title,
    rows: [
      paragraph(withBrand(content.intro, brand).replace("{email}", `<strong>${escapeHtml(input.email)}</strong>`)),
      paragraph(content.variant),
      paragraph(content.notGet, "grey"),
      button(brand.siteUrl, content.button),
      legalBlock([
        escapeHtml(withBrand(content.legal.responsible, brand)),
        `${escapeHtml(content.legal.withdrawLead)} ${legalLink(input.unsubscribeUrl, content.legal.withdrawLink)}`,
        `${escapeHtml(content.legal.privacyLead)} ${legalLink(privacy, siteLabel(privacy))}`,
        ...(postal ? [escapeHtml(postal)] : []),
        escapeHtml(content.legal.provider),
      ]),
    ],
    brand,
  });

  const text = [
    content.eyebrow,
    "",
    content.title,
    "",
    withBrand(content.intro, brand).replace("{email}", input.email),
    "",
    content.variant,
    "",
    content.notGet,
    "",
    `${content.button}`,
    brand.siteUrl,
    "",
    "\u2014",
    "",
    withBrand(content.legal.responsible, brand),
    `${content.legal.withdrawLead} ${input.unsubscribeUrl}`,
    `${content.legal.privacyLead} ${privacy}`,
    ...(postal ? [postal] : []),
    content.legal.provider,
    "",
    footerText(brand),
  ].join("\n");

  return { subject: withBrand(content.subject, brand), html, text };
}

// ---------------------------------------------------------------------------
// Withdrawal pages (self-contained, in the token's language)
// ---------------------------------------------------------------------------

interface WithdrawalCopy {
  eyebrow: string;
  title: string;
  /** Contains the {email} and {product} placeholders. */
  intro: string;
  note: string;
  contactLead: string;
}

const withdrawalCopy: Record<WaitlistLang, WithdrawalCopy> = {
  en: {
    eyebrow: "OPH \u00b7 WAITLIST",
    title: "YOU HAVE BEEN REMOVED",
    intro: "The address {email} has been withdrawn from the {product} waitlist.",
    note: "Your request has been recorded and will be processed; there is no automated list.",
    contactLead: "If you did not request this, or you have any question, write to",
  },
  es: {
    eyebrow: "OPH \u00b7 LISTA DE ESPERA",
    title: "TE HAS DADO DE BAJA",
    intro: "La direcci\u00f3n {email} ha sido dada de baja de la lista de espera de {product}.",
    note: "Tu solicitud queda registrada y se procesar\u00e1; no hay una lista automatizada.",
    contactLead: "Si no has solicitado la baja, o tienes cualquier duda, escribe a",
  },
};

/** Copy for the page a valid token shows BEFORE the withdrawal is confirmed. */
const confirmCopy: Record<WaitlistLang, WithdrawalCopy & { button: string }> = {
  en: {
    eyebrow: "OPH \u00b7 WAITLIST",
    title: "WITHDRAW FROM THE LIST",
    intro: "The address {email} is registered for the {product} waitlist. Confirm below and no further messages will be sent.",
    button: "CONFIRM WITHDRAWAL",
    note: "Nothing happens until you confirm. If you did not ask for this, close this page.",
    contactLead: "Any question:",
  },
  es: {
    eyebrow: "OPH \u00b7 LISTA DE ESPERA",
    title: "DARSE DE BAJA DE LA LISTA",
    intro: "La direcci\u00f3n {email} est\u00e1 registrada en la lista de espera de {product}. Confirma abajo y no se enviar\u00e1n m\u00e1s mensajes.",
    button: "CONFIRMAR BAJA",
    note: "No ocurre nada hasta que confirmes. Si no lo has solicitado, cierra esta p\u00e1gina.",
    contactLead: "Cualquier duda:",
  },
};

/**
 * The 400 page for a missing or tampered token. The language is unknown (the
 * token that would carry it could not be verified), so it shows both languages
 * — the EN title plus EN and ES paragraphs, the Spanish ones marked
 * lang="es" — and only the contact address, never data decoded from the token.
 */
const invalidTokenCopy = {
  title: "THIS LINK IS NOT VALID",
  eyebrow: "OPH \u00b7 WAITLIST",
  en: {
    intro: "The withdrawal link is missing or has been modified, so nothing was changed.",
    note: "Every withdrawal link is single-purpose and signed; a modified one is rejected.",
    contactLead: "To withdraw an address, write to",
  },
  es: {
    intro: "El enlace de baja falta o ha sido modificado, as\u00ed que no se ha cambiado nada.",
    note: "Cada enlace de baja es de un solo uso y va firmado; si se modifica, se rechaza.",
    contactLead: "Para darse de baja, escribe a",
  },
};

function contactParagraph(lead: string, contactAddress: string, lang?: string): string {
  return paragraph(
    `${escapeHtml(lead)} <a href="mailto:${escapeHtml(contactAddress)}" style="color:${palette.ink};text-decoration:underline;">${escapeHtml(contactAddress)}</a>.`,
    "ink",
    lang,
  );
}

export function renderConfirmPage(input: {
  lang: WaitlistLang;
  email: string;
  brand: BrandProfile;
  contactAddress: string;
  /** Absolute path + query of the request, so the form POSTs to the same URL. */
  formAction: string;
}): string {
  const copy = confirmCopy[input.lang];
  return darkShell({
    lang: input.lang,
    eyebrow: copy.eyebrow,
    title: copy.title,
    rows: [
      paragraph(withBrand(copy.intro, input.brand).replace("{email}", `<strong>${escapeHtml(input.email)}</strong>`)),
      submitButton(input.formAction, copy.button),
      paragraph(copy.note, "grey"),
      contactParagraph(copy.contactLead, input.contactAddress),
    ],
    brand: input.brand,
  });
}

export function renderWithdrawalPage(input: {
  lang: WaitlistLang;
  email: string;
  brand: BrandProfile;
  contactAddress: string;
}): string {
  const copy = withdrawalCopy[input.lang];
  return darkShell({
    lang: input.lang,
    eyebrow: copy.eyebrow,
    title: copy.title,
    rows: [
      paragraph(withBrand(copy.intro, input.brand).replace("{email}", `<strong>${escapeHtml(input.email)}</strong>`)),
      paragraph(copy.note, "grey"),
      contactParagraph(copy.contactLead, input.contactAddress),
    ],
    brand: input.brand,
  });
}

/** Copy for the page shown when the withdrawal could NOT be recorded (the
 *  operator notice failed): it must not claim completion. */
const withdrawalFailedCopy: Record<WaitlistLang, { eyebrow: string; title: string; intro: string; contactLead: string; contactTail: string }> = {
  en: {
    eyebrow: "OPH \u00b7 WAITLIST",
    title: "WE COULD NOT RECORD IT",
    intro: "The withdrawal for {email} could not be recorded just now, so nothing has been changed.",
    contactLead: "Write to",
    contactTail: "and the address will be removed by hand.",
  },
  es: {
    eyebrow: "OPH \u00b7 LISTA DE ESPERA",
    title: "NO SE HA PODIDO REGISTRAR",
    intro: "La baja de {email} no se ha podido registrar en este momento, as\u00ed que no se ha cambiado nada.",
    contactLead: "Escribe a",
    contactTail: "y la direcci\u00f3n se dar\u00e1 de baja a mano.",
  },
};

export function renderWithdrawalFailedPage(input: {
  lang: WaitlistLang;
  email: string;
  brand: BrandProfile;
  contactAddress: string;
}): string {
  const copy = withdrawalFailedCopy[input.lang];
  return darkShell({
    lang: input.lang,
    eyebrow: copy.eyebrow,
    title: copy.title,
    rows: [
      paragraph(copy.intro.replace("{email}", `<strong>${escapeHtml(input.email)}</strong>`)),
      paragraph(
        `${escapeHtml(copy.contactLead)} <a href="mailto:${escapeHtml(input.contactAddress)}" style="color:${palette.ink};text-decoration:underline;">${escapeHtml(input.contactAddress)}</a> ${escapeHtml(copy.contactTail)}`,
      ),
    ],
    brand: input.brand,
  });
}

export function renderInvalidTokenPage(input: { brand: BrandProfile; contactAddress: string }): string {
  return darkShell({
    lang: "en",
    eyebrow: invalidTokenCopy.eyebrow,
    title: invalidTokenCopy.title,
    rows: [
      paragraph(invalidTokenCopy.en.intro, "grey"),
      paragraph(invalidTokenCopy.es.intro, "grey", "es"),
      paragraph(invalidTokenCopy.en.note, "grey"),
      paragraph(invalidTokenCopy.es.note, "grey", "es"),
      contactParagraph(invalidTokenCopy.en.contactLead, input.contactAddress),
      contactParagraph(invalidTokenCopy.es.contactLead, input.contactAddress, "es"),
    ],
    brand: input.brand,
  });
}

// ---------------------------------------------------------------------------
// Operator notice (withdrawal honoured by hand until storage exists)
// ---------------------------------------------------------------------------

export function renderWithdrawalNotice(input: { email: string; lang: WaitlistLang; iat: number; brand: BrandProfile }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = withBrand("{product} waitlist: withdrawal request", input.brand);
  const issued = new Date(input.iat * 1000).toISOString();
  const lines = [
    `The address ${input.email} (registered in ${input.lang}, token issued ${issued}) asks to be withdrawn from the waitlist.`,
    "Honour the request by hand: with no storage there is no list to update, so this notice is the record until the panel exists.",
    "Reply to this message if the person needs anything else.",
  ];
  const html = darkShell({
    lang: "en",
    preheader: `Withdrawal request for ${input.email}`,
    eyebrow: "OPH \u00b7 WAITLIST",
    title: "WITHDRAWAL REQUEST",
    rows: lines.map((line) => paragraph(line)),
    brand: input.brand,
  });
  const text = [
    "OPH \u00b7 WAITLIST",
    "",
    "WITHDRAWAL REQUEST",
    "",
    ...lines,
    "",
    footerText(input.brand),
  ].join("\n");
  return { subject, html, text };
}
