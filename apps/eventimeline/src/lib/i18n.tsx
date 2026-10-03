import { createContext, useContext, type ReactNode } from 'react'
import type { Lang } from './pages'

export type { Lang }

const dict = {
  en: {
    navHow: 'HOW IT WORKS',
    navPricing: 'PRICING',
    navFaq: 'FAQ',
    topbarBadge: 'WINDOWS DESKTOP APP',
    navMainAria: 'Main',
    langSwitchAria: 'Language',
    heroAria: 'EventTimeline introduction',
    eyebrow: 'FOR SYSADMINS · INCIDENT RESEARCH',
    headlineWhite: 'BRACKET THE MOMENT.',
    headlineGrey: 'THE LOGS FALL INTO ORDER.',
    subline: 'A Windows desktop app that turns Event Logs into one chronological Time Corridor around the hour you remember.',
    emailPlaceholder: 'Enter your email address',
    emailLabel: 'Email address',
    join: 'JOIN WAITLIST',
    joined: 'YOU ARE ON THE LIST',
    sending: 'SENDING…',
    mechTitle: 'HOW IT WORKS',
    mech1Title: 'Pick the hour',
    mech1Body: 'You remember roughly when it happened. That moment is the anchor.',
    mech2Title: 'Open the corridor',
    mech2Body: 'EventTimeline opens a Time Corridor around the anchor — minutes or hours, you decide the width.',
    mech3Title: 'Read the sequence',
    mech3Body: 'Every relevant event from System, Security and Application logs, unified in one chronological timeline. The sequence and the correlation become visible.',
    srcTitle: 'WHAT IT READS',
    srcSub: 'The data comes from Windows itself. EventTimeline reads the event sources a sysadmin already trusts:',
    srcSystem: 'Drivers, services, reboots, kernel events',
    srcSecurity: 'Logons, privilege use, audit events',
    srcApplication: 'Application crashes, warnings, errors',
    licTitle: 'HONEST PRICING',
    licLine1: 'EventTimeline is a paid product. One license, one year of free updates included.',
    licLine2: 'When the update period ends, you can renew it with a new purchase. Your license keeps working either way.',
    licNote: 'Pre-release: the waitlist is the only thing you can join today.',
    faqTitle: 'QUESTIONS',
    faq1Q: 'Is it free?',
    faq1A: 'No. EventTimeline is a paid product with a one-year update window. We will not pretend otherwise.',
    faq2Q: 'When can I download it?',
    faq2A: 'It is in pre-release. Join the waitlist and you will be told when it ships — nothing else is available yet.',
    faq3Q: 'Does it change my logs?',
    faq3A: 'It reads the Windows Event Logs — the same sources you already open in Event Viewer.',
    closeTitle: 'GET THE RELEASE FIRST',
    closeSub: 'Join the waitlist. One email when the pre-release opens, no noise.',
    license: 'Paid license · 1 year free updates · Pre-release',
    caption: 'PRE-RELEASE',
    formError: 'That did not go through. Check the address and try again.',
    consentPre: 'I agree to receive the confirmation email and accept the',
    consentLink: 'privacy policy',
    consentError: 'Accept the privacy policy to continue.',
    joinedNotice: 'Check your inbox: the confirmation is on its way to {email}.',
    formErrorBusy: 'Too many requests from this connection. Try again in a little while.',
    formErrorLater: 'The send failed on our side. Try again in a few minutes, or write to legal@openportalhub.org.',
    logWindows: 'WINDOWS 10 / 11 / SERVER',
    logSources: 'SYSTEM · SECURITY · APPLICATION LOGS',
    preRelease: 'PRE-RELEASE',
    statusLink: 'System status',
    sourceLink: 'Source',
    // The notice is only offered on the English page, so its copy is Spanish in
    // both packs on purpose (see LangNotice).
    langNotice: 'Esta página también está en español.',
    langNoticeLink: 'Ver en español',
  },
  es: {
    navHow: 'CÓMO FUNCIONA',
    navPricing: 'PRECIO',
    navFaq: 'PREGUNTAS',
    topbarBadge: 'APP DE ESCRITORIO WINDOWS',
    navMainAria: 'Principal',
    langSwitchAria: 'Idioma',
    faqTitle: 'PREGUNTAS',
    faq1Q: '¿Es gratis?',
    faq1A: 'No. EventTimeline es un producto de pago con un año de actualizaciones incluidas. No vamos a decir lo contrario.',
    faq2Q: '¿Cuándo puedo descargarlo?',
    faq2A: 'Está en pre-lanzamiento. Únete a la lista de espera y te avisaremos cuando esté disponible; por ahora no hay nada más.',
    faq3Q: '¿Qué hace con mis registros?',
    faq3A: 'Lee los registros de eventos de Windows: las mismas fuentes que ya abres en el Visor de eventos.',
    closeTitle: 'ENTRA EL PRIMERO',
    closeSub: 'Únete a la lista de espera. Un correo cuando abra el pre-lanzamiento, sin ruido.',
    srcTitle: 'QUÉ LEE',
    srcSub: 'Los datos salen del propio Windows. EventTimeline lee las fuentes en las que un sysadmin ya confía:',
    srcSystem: 'Controladores, servicios, reinicios, eventos del kernel',
    srcSecurity: 'Inicios de sesión, uso de privilegios, eventos de auditoría',
    srcApplication: 'Fallos de aplicaciones, advertencias, errores',
    licTitle: 'PRECIO HONESTO',
    licLine1: 'EventTimeline es un producto de pago. Una licencia, un año de actualizaciones incluidas.',
    licLine2: 'Cuando termina el periodo de actualizaciones, se renueva con una nueva compra. Tu licencia sigue funcionando.',
    licNote: 'Pre-lanzamiento: por ahora lo único a lo que puedes unirte es a la lista de espera.',
    mechTitle: 'CÓMO FUNCIONA',
    mech1Title: 'Elige la hora',
    mech1Body: 'Recuerdas más o menos cuándo ocurrió. Ese instante es el ancla.',
    mech2Title: 'Abre el corredor',
    mech2Body: 'EventTimeline abre un Time Corridor alrededor del ancla: minutos u horas, tú decides la anchura.',
    mech3Title: 'Lee la secuencia',
    mech3Body: 'Todos los eventos relevantes de los registros System, Security y Application, unificados en una única línea temporal cronológica. La secuencia y la correlación se hacen visibles.',
    license: 'Licencia de pago · 1 año de actualizaciones · Pre-lanzamiento',
    heroAria: 'Presentación de EventTimeline',
    eyebrow: 'PARA SYSADMINS · INVESTIGACIÓN DE INCIDENTES',
    headlineWhite: 'ACOTA EL MOMENTO.',
    headlineGrey: ' LOS REGISTROS SE ORDENAN SOLOS.',
    subline: 'Una aplicación de escritorio para Windows que convierte los registros de eventos en un único corredor temporal cronológico en torno a la hora que recuerdas.',
    emailPlaceholder: 'Escribe tu dirección de correo',
    emailLabel: 'Dirección de correo',
    join: 'ÚNETE A LA LISTA',
    joined: 'ESTÁS EN LA LISTA',
    sending: 'ENVIANDO…',
    caption: 'PRE-LANZAMIENTO',
    formError: 'No ha llegado. Revisa la dirección e inténtalo de nuevo.',
    consentPre: 'Acepto recibir el correo de confirmación y la',
    consentLink: 'política de privacidad',
    consentError: 'Acepta la política de privacidad para continuar.',
    joinedNotice: 'Revisa tu bandeja: la confirmación va camino de {email}.',
    formErrorBusy: 'Demasiadas solicitudes desde esta conexión. Inténtalo de nuevo en un rato.',
    formErrorLater: 'El envío falló de nuestro lado. Inténtalo de nuevo en unos minutos o escribe a legal@openportalhub.org.',
    logWindows: 'WINDOWS 10 / 11 / SERVER',
    logSources: 'REGISTROS SYSTEM · SECURITY · APPLICATION',
    preRelease: 'PRE-LANZAMIENTO',
    statusLink: 'Estado de los servicios',
    sourceLink: 'Código fuente',
    // The notice is only offered on the English page, so its copy is Spanish in
    // both packs on purpose (see LangNotice).
    langNotice: 'Esta página también está en español.',
    langNoticeLink: 'Ver en español',
  },
}

export type Dict = Record<keyof typeof dict.en, string>
export type LangKey = keyof typeof dict.en

const LangCtx = createContext<{ lang: Lang; t: Dict }>({ lang: 'en', t: dict.en })

/** The language is an input: the URL owns it, so the provider holds no state.
 *  The served document carries the matching `lang` attribute on `<html>`; nothing here
 *  touches `document` during render, which is what lets the prerender run under bun. */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangCtx.Provider value={{ lang, t: dict[lang] }}>{children}</LangCtx.Provider>
}

export function useLang() {
  return useContext(LangCtx)
}

const STORAGE_KEY = 'eventtimeline.lang'

/** Records an explicit language choice. The URL owns the language; this is only a
 *  record of the visitor's preference, and it never leaves the device. */
export function rememberLang(lang: Lang): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* private mode: the preference is simply not recorded */
  }
}

/** Language the visitor asks for: the choice remembered in this tab, else the
 *  browser's own. The page URL still decides what is rendered; this only feeds
 *  the notice offered on the English page. */
export function preferredLang(): Lang {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'es') return saved
  } catch {
    // Storage unavailable: fall through to the browser's language.
  }
  if (typeof navigator === 'undefined') return 'en'
  const preferred = navigator.languages?.[0] ?? navigator.language ?? ''
  return preferred.toLowerCase().startsWith('es') ? 'es' : 'en'
}
