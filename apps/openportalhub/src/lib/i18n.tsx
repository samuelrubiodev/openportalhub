import { createContext, useContext, type ReactNode } from 'react'
import type { Lang, PageId } from './pages'

export type { Lang }

const dict = {
  en: {
    // nav / chrome
    navCatalog: 'CATALOG',
    navNotes: 'NOTES',
    navStudio: 'STUDIO',
    navMainAria: 'Main',
    langSwitchAria: 'Language',
    crumbsAria: 'Breadcrumb',
    emailLabel: 'Email address',
    heroAria: 'OpenPortalHub introduction',
    // Shown on the English pages to a visitor whose browser asks for Spanish, so
    // it is written in Spanish in both packs on purpose (see LangNotice).
    langNotice: 'Esta web está en español',
    langNoticeLink: 'Ver en español →',
    badge: 'INDEPENDENT SOFTWARE STUDIO',
    eyebrow: 'OPH · INDEPENDENT SOFTWARE STUDIO',
    headlineWhite: 'DESKTOP SOFTWARE,',
    headlineGrey: 'BUILT ONE TOOL AT A TIME.',
    subline: 'OpenPortalHub is an independent software studio. The catalog below lists everything we ship: small Windows tools for working with documents, data, and files. Each project gets a number, its own page, and a public changelog.',
    join: 'JOIN THE LIST',
    joined: 'YOU ARE ON THE LIST',
    sending: 'SENDING…',
    emailPlaceholder: 'Enter your email address',
    license: 'No newsletter · Announcements on this page first',
    caption: 'FIG. 1 — EVENT TIMELINE, CLOSED BETA, MAIN WINDOW',
    formError: 'That did not go through. Check the address and try again.',
    consentPre: 'I agree to receive the confirmation email and accept the',
    consentLink: 'privacy policy',
    consentError: 'Please accept the privacy policy to continue.',
    joinedNotice: 'Check your inbox: the confirmation is on its way to {email}.',
    formErrorBusy: 'Too many requests from this connection. Try again in a little while.',
    formErrorLater: 'The send failed on our side. Try again in a few minutes, or write to legal@openportalhub.org.',
    // catalog table
    catTitle: 'THE CATALOG',
    catSub: '2026 Edition 09 · 1 entry, in closed beta.',
    colProject: 'Project',
    colType: 'Type',
    colPlatform: 'Platform',
    colStatus: 'Status',
    colVersion: 'Version',
    colYear: 'Year',
    p1Name: 'Event Timeline',
    p1Type: 'Desktop application · closed beta',
    p1Featured: 'Featured',
    p1Platform: 'Win 10/11 · x64',
    stActive: 'Active',
    open: 'Open →',
    catFoot: '1 entry, in closed beta. Index updated 2026-09-08.',
    // hero featured card
    cardEyebrow: 'FEATURED PROJECT · OPH-001 · CLOSED BETA',
    cardStatus: 'CLOSED BETA',
    cardDesc: 'Windows desktop app that turns scattered activity records into one readable timeline.',
    cardLink: 'Explore the tool at eventimeline.openportalhub.org',
    ftCardUrl: 'https://eventimeline.openportalhub.org/',
    // notes
    notesTitle: 'NOTES & RELEASES',
    notesSub: 'The public record. Notes appear when there is something to say. Release notes ship with every build.',
    n1: 'Event Timeline enters free closed beta',
    n1Kind: 'Beta',
    // studio
    studioTitle: 'THE STUDIO',
    studioSub: 'Small on purpose.',
    studioBody: 'OpenPortalHub is one developer publishing desktop software under one roof. The studio stays small so the software can stay sharp: few projects, long maintenance windows, no feature races. Everything here is built by hand, from the installer to this website. When a tool stops being useful, it gets archived, not abandoned.',
    s1: 'Native first. Each tool is written for the platform it runs on, using the controls that platform already provides.',
    s2: 'Offline by default. The software works without an account. Nothing phones home.',
    s3: 'Small on purpose. A project ships when it does one job well. It stops growing when more would make it worse.',
    s4: 'Public record. Every release ships with notes, a checksum, and a changelog.',
    footer: '© 2026 OpenPortalHub',
    legalPrivacy: 'Privacy',
    legalTerms: 'Terms',
    statusLink: 'System status',
    sourceLink: 'Source',
    legalPrivacyLink: 'Privacy Policy →',
    legalTermsLink: 'Terms of Service →',
    closeTitle: 'GET THE CATALOG FIRST',
    closeSub: 'One email when a project ships or a release lands. No noise, no newsletter cadence. Event Timeline is currently in a free closed beta — paid licenses arrive with the first stable release.',
    // event timeline page (product page)
    etTitle: 'EVENT TIMELINE · CLOSED BETA',
    etCrumbProjects: 'Projects',
    etIntro: 'Event Timeline is a Windows desktop application for reading activity over time. It takes the records a computer already keeps: event logs, process starts, file changes, network activity. Then it lays them on one timeline you can scroll, search, and scrub. What was happening on this machine at 14:32? Open the session and look.',
    etJoin: 'Join the closed beta ↓',
    etFactPlatform: 'Platform',
    etFactPlatformValue: 'Windows 10/11 · x64',
    etFactAvailability: 'Availability',
    etFactAvailabilityValue: 'Beta testers only',
    etFactStatus: 'Status',
    etFactStatusValue: 'Closed beta',
    etFactLicense: 'License',
    etFactLicenseValue: 'Free in beta · Paid at 1.0',
    etCaption: 'Fig. 1 — Main window with a merged session: five lanes, one clock, incident context on the left, record details on the right. Drag the playhead; the span controls and level filters work.',
    etJobsTitle: 'WHAT IT DOES',
    etJobsSub: 'Six jobs, one window.',
    etJob1Title: 'Sources',
    etJob1Body: 'Open EVTX log files and the event logs the machine itself already keeps. Each source keeps its own clock; the app aligns them before drawing.',
    etJob2Title: 'Canvas',
    etJob2Body: 'One lane per category, one clock across all of them. Zoom runs from a full day down to a single minute.',
    etJob3Title: 'Search',
    etJob3Body: 'Type to filter. The canvas redraws in place and the status bar shows what remains. No query language, no reload.',
    etJob4Title: 'Inspector',
    etJob4Body: 'Click any block to read the full record: source file, channel, record ID, raw fields.',
    etJob5Title: 'Bookmarks',
    etJob5Body: 'Pin a moment, attach a note, export the set as Markdown for incident reports and handovers.',
    etJob6Title: 'Privacy',
    etJob6Body: 'The app runs offline. No account, no telemetry, no background service. Uninstall leaves nothing behind.',
    etBetaTitle: 'CLOSED BETA',
    etBetaSub: 'Event Timeline has not been released yet. There is nothing to download.',
    etBetaBody: 'The app is in a free, closed beta. Builds go only to testers and are not distributed on this page. When the beta ends and the first stable version ships, Event Timeline becomes a paid product under a per-seat license.',
    etBetaSubmit: 'REQUEST BETA ACCESS',
    etReqOs: 'Operating system',
    etReqOsValue: 'Windows 10 1809+',
    etReqArch: 'Architecture',
    etReqArchValue: 'x64',
    etReqMemory: 'Memory',
    etReqMemoryValue: '4 GB RAM',
    etReqDisk: 'Disk',
    etReqDiskValue: '120 MB free',
    etReqRuntime: 'Runtime',
    etReqRuntimeValue: 'None required',
    etBetaNote: 'Beta builds are for testers only. Public downloads, pricing, and license terms arrive with the first stable release.',
  },
  es: {
    // nav / chrome
    navCatalog: 'CATÁLOGO',
    navNotes: 'NOTAS',
    navStudio: 'ESTUDIO',
    navMainAria: 'Principal',
    langSwitchAria: 'Idioma',
    crumbsAria: 'Ruta de navegación',
    emailLabel: 'Dirección de correo',
    heroAria: 'Presentación de OpenPortalHub',
    // Written in Spanish in both packs: this notice addresses a Spanish-speaking
    // visitor on an English page.
    langNotice: 'Esta web está en español',
    langNoticeLink: 'Ver en español →',
    badge: 'ESTUDIO DE SOFTWARE INDEPENDIENTE',
    eyebrow: 'OPH · ESTUDIO DE SOFTWARE INDEPENDIENTE',
    headlineWhite: 'SOFTWARE DE ESCRITORIO,',
    headlineGrey: ' HECHO UNA HERRAMIENTA CADA VEZ.',
    subline: 'OpenPortalHub es un estudio de software independiente. El catálogo lista todo lo que publicamos: pequeñas herramientas para Windows para trabajar con documentos, datos y archivos. Cada proyecto recibe un número, su propia página y un registro público de cambios.',
    join: 'ÚNETE A LA LISTA',
    joined: 'ESTÁS EN LA LISTA',
    sending: 'ENVIANDO…',
    emailPlaceholder: 'Escribe tu dirección de correo',
    license: 'Sin boletín · Los anuncios se publican primero aquí',
    caption: 'FIG. 1 — EVENT TIMELINE, BETA CERRADA, VENTANA PRINCIPAL',
    formError: 'No ha llegado. Revisa la dirección e inténtalo de nuevo.',
    consentPre: 'Acepto recibir el correo de confirmación y la',
    consentLink: 'política de privacidad',
    consentError: 'Acepta la política de privacidad para continuar.',
    joinedNotice: 'Revisa tu bandeja: la confirmación va camino de {email}.',
    formErrorBusy: 'Demasiadas solicitudes desde esta conexión. Inténtalo de nuevo en un rato.',
    formErrorLater: 'El envío falló de nuestro lado. Inténtalo de nuevo en unos minutos o escribe a legal@openportalhub.org.',
    // catalog table
    catTitle: 'EL CATÁLOGO',
    catSub: 'Edición 09 de 2026 · 1 entrada, en beta cerrada.',
    colProject: 'Proyecto',
    colType: 'Tipo',
    colPlatform: 'Plataforma',
    colStatus: 'Estado',
    colVersion: 'Versión',
    colYear: 'Año',
    p1Name: 'Event Timeline',
    p1Featured: 'Destacado',
    p1Type: 'Aplicación de escritorio · beta cerrada',
    p1Platform: 'Win 10/11 · x64',
    stActive: 'Activo',
    open: 'Abrir →',
    catFoot: '1 entrada, en beta cerrada. Índice actualizado el 2026-09-08.',
    // hero featured card
    cardEyebrow: 'PROYECTO DESTACADO · OPH-001 · BETA CERRADA',
    cardStatus: 'BETA CERRADA',
    cardDesc: 'Aplicación de escritorio para Windows que convierte registros de actividad dispersos en una línea de tiempo legible.',
    cardLink: 'Explora la herramienta en eventimeline.openportalhub.org',
    ftCardUrl: 'https://eventimeline.openportalhub.org/',
    // notes
    notesTitle: 'NOTAS Y VERSIONES',
    notesSub: 'El registro público. Las notas aparecen cuando hay algo que decir. Las notas de versión acompañan a cada build.',
    n1: 'Event Timeline entra en beta cerrada gratuita',
    n1Kind: 'Beta',
    // studio
    studioTitle: 'EL ESTUDIO',
    studioSub: 'Pequeño a propósito.',
    studioBody: 'OpenPortalHub es un desarrollador que publica software de escritorio bajo un mismo techo. El estudio se mantiene pequeño para que el software se mantenga afilado: pocos proyectos, ventanas largas de mantenimiento, sin carreras de funcionalidades. Todo aquí está hecho a mano, desde el instalador hasta esta web. Cuando una herramienta deja de ser útil, se archiva, no se abandona.',
    s1: 'Nativo primero. Cada herramienta se escribe para la plataforma en la que corre, usando los controles que la plataforma ya ofrece.',
    s2: 'Sin conexión por defecto. El software funciona sin cuenta. Nada llama a casa.',
    s3: 'Pequeño a propósito. Un proyecto sale cuando hace bien un trabajo. Deja de crecer cuando más lo empeoraría.',
    s4: 'Registro público. Cada versión trae notas, un checksum y un registro de cambios.',
    // close / waitlist
    footer: '© 2026 OpenPortalHub',
    legalPrivacy: 'Privacidad',
    legalTerms: 'Términos',
    statusLink: 'Estado de los servicios',
    sourceLink: 'Código fuente',
    legalPrivacyLink: 'Política de privacidad →',
    legalTermsLink: 'Términos y condiciones →',
    closeTitle: 'RECIBE EL CATÁLOGO PRIMERO',
    closeSub: 'Un correo cuando un proyecto salga o llegue una versión. Sin ruido, sin cadencia de boletín. Event Timeline está ahora en beta cerrada gratuita — las licencias de pago llegarán con la primera versión estable.',
    // event timeline page (product page)
    etTitle: 'EVENT TIMELINE · BETA CERRADA',
    etCrumbProjects: 'Proyectos',
    etIntro: 'Event Timeline es una aplicación de escritorio para Windows que sirve para leer la actividad a lo largo del tiempo. Toma los registros que un equipo ya guarda —eventos, arranques de procesos, cambios en archivos, actividad de red— y los coloca en una sola línea de tiempo que puedes recorrer, buscar y desplazar. ¿Qué estaba pasando en este equipo a las 14:32? Abre la sesión y míralo.',
    etJoin: 'Únete a la beta cerrada ↓',
    etFactPlatform: 'Plataforma',
    etFactPlatformValue: 'Windows 10/11 · x64',
    etFactAvailability: 'Disponibilidad',
    etFactAvailabilityValue: 'Solo testers de la beta',
    etFactStatus: 'Estado',
    etFactStatusValue: 'Beta cerrada',
    etFactLicense: 'Licencia',
    etFactLicenseValue: 'Gratis en beta · De pago en la 1.0',
    etCaption: 'Fig. 1 — Ventana principal con una sesión unificada: cinco carriles, un solo reloj, el contexto del incidente a la izquierda y el detalle del registro a la derecha. Arrastra el cabezal; los controles de tramo y los filtros por nivel funcionan.',
    etJobsTitle: 'QUÉ HACE',
    etJobsSub: 'Seis tareas, una ventana.',
    etJob1Title: 'Fuentes',
    etJob1Body: 'Abre archivos de registro EVTX y los registros de eventos que el propio equipo ya guarda. Cada origen conserva su propio reloj; la aplicación los alinea antes de dibujar.',
    etJob2Title: 'Lienzo',
    etJob2Body: 'Un carril por categoría y un solo reloj para todos. El zoom va desde un día completo hasta un solo minuto.',
    etJob3Title: 'Búsqueda',
    etJob3Body: 'Escribe para filtrar. El lienzo se redibuja en el sitio y la barra de estado muestra lo que queda. Sin lenguaje de consultas y sin recargar.',
    etJob4Title: 'Inspector',
    etJob4Body: 'Haz clic en cualquier bloque para leer el registro completo: archivo de origen, canal, Id. de evento y campos sin procesar.',
    etJob5Title: 'Marcadores',
    etJob5Body: 'Fija un momento, añade una nota y exporta el conjunto como Markdown para informes de incidentes y traspasos.',
    etJob6Title: 'Privacidad',
    etJob6Body: 'La aplicación funciona sin conexión. Sin cuenta, sin telemetría y sin servicio en segundo plano. Al desinstalarla no deja nada.',
    etBetaTitle: 'BETA CERRADA',
    etBetaSub: 'Event Timeline aún no se ha publicado. No hay nada que descargar.',
    etBetaBody: 'La aplicación está en beta cerrada gratuita. Las builds van solo a los testers y no se distribuyen en esta página. Cuando termine la beta y salga la primera versión estable, Event Timeline será un producto de pago con licencia por puesto.',
    etBetaSubmit: 'PEDIR ACCESO A LA BETA',
    etReqOs: 'Sistema operativo',
    etReqOsValue: 'Windows 10 1809+',
    etReqArch: 'Arquitectura',
    etReqArchValue: 'x64',
    etReqMemory: 'Memoria',
    etReqMemoryValue: '4 GB de RAM',
    etReqDisk: 'Disco',
    etReqDiskValue: '120 MB libres',
    etReqRuntime: 'Entorno de ejecución',
    etReqRuntimeValue: 'No requiere ninguno',
    etBetaNote: 'Las builds beta son solo para testers. Las descargas públicas, el precio y los términos de licencia llegarán con la primera versión estable.',
  },
}

export type LegalDict = {
  docTitle: string
  docMeta: string
  updated: string
  docLead: string
  sections: Array<{ h: string; paras: string[]; bullets?: string[] }>
  contact: string
}

const privacyEn: LegalDict = {
  docTitle: 'PRIVACY POLICY',
  docMeta: 'OpenPortalHub · openportalhub.org · eventimeline.openportalhub.org',
  updated: 'Last updated · 2026-10-02',
  docLead: 'This policy applies to the OpenPortalHub site (openportalhub.org) and to the Event Timeline site (eventimeline.openportalhub.org). The same rules govern both, so the text speaks in the singular. It sets no cookies, runs no analytics and tracks nobody. The one exception is the waitlist form, and it is a narrow one: the address you type there goes to our email provider for a single purpose, sending the confirmation you asked for. No list is stored on the site, and every message we send carries a withdrawal link. The only other record is the standard technical logging any host performs, described below.',
  sections: [
    {
      h: 'WHERE THIS POLICY APPLIES',
      paras: [
        'This policy covers two sites run by the same party: OpenPortalHub (openportalhub.org) and EventTimeline (eventimeline.openportalhub.org), the site for our desktop app. The same rules apply to both, and the waitlist form collects the same thing, the same way and for the same reason, whichever site you use.',
      ],
    },
    {
      h: 'WHAT WE COLLECT',
      paras: ['Nothing is collected to profile you. The site sets no cookies, runs no analytics, loads no tracking pixels and uses no fingerprinting. There is no Google Analytics, no social widgets, no advertising, and no data broker of any kind. The only data that leaves your browser is the address you type into the waitlist form, described below. The only thing written to your browser is the language preference described further below: no localStorage, no IndexedDB, no service workers.'],
    },
    {
      h: 'CLOUDFLARE (HOSTING)',
      paras: [
        'The site is served through Cloudflare. Like every server on the internet, Cloudflare\u2019s network receives the technical data a browser sends to request a page (IP address, user agent, requested URL) and keeps security and traffic logs to protect the site from abuse and deliver pages.',
        'We do not use those logs to identify, profile, or track anyone, and we cannot build a browsing history from them. This is delivery infrastructure, not analytics.',
      ],
    },
    {
      h: 'COOKIES AND LOCAL STORAGE',
      paras: ['The site sets no cookies, runs no analytics and tracks nobody. The only thing it keeps in your browser is the language you pick, in sessionStorage: it never leaves your device, nothing else is written, and it disappears when you close the tab.'],
    },
    {
      h: 'EMAIL ADDRESSES',
      paras: [
        'The waitlist form asks for an email address, and nothing else. You send it with an explicit consent checkbox: consent is the legal basis for this processing, and nothing is sent until you tick it.',
        'That address is handed to our email provider, Oracle Cloud Infrastructure Email Delivery, for one purpose only: delivering the confirmation message you asked for. The provider keeps the delivery records any mail service keeps. The site keeps no list: there is no database, and the address is not stored on the web server after the message is sent.',
        'Every message we send carries a withdrawal link. Using that link, or writing to legal@openportalhub.org, withdraws your consent and asks for your data to be deleted. It works without an account.',
        'The address is never sold, never shared for marketing, and never used to track you.',
        'A message sent from the Event Timeline site names EventTimeline as the product you signed up for and OpenPortalHub as the party responsible for it. That site has no privacy page of its own: this policy applies to it too.',
      ],
    },
    {
      h: 'EXTERNAL LINKS',
      paras: ['If you follow a link off the site, the destination has its own policy. We link only to pages we trust, but we are not responsible for what other sites do.'],
    },
    {
      h: 'CHANGES',
      paras: ['If this ever changes — if we ever add an analytics tool, a cookie, or any data collection — this page will say so, in plain words, on top.'],
    },
  ],
  contact: 'Questions about this policy: legal@openportalhub.org',
}

const privacyEs: LegalDict = {
  docTitle: 'POLÍTICA DE PRIVACIDAD',
  docMeta: 'OpenPortalHub · openportalhub.org · eventimeline.openportalhub.org',
  updated: 'Última actualización · 2026-10-02',
  docLead: 'Esta política se aplica al sitio de OpenPortalHub (openportalhub.org) y al de Event Timeline (eventimeline.openportalhub.org). Las mismas reglas rigen en ambos, así que el texto habla en singular. No instala cookies, no usa analítica y no rastrea a nadie. La única excepción es el formulario de la lista de espera, y es una excepción estrecha: la dirección que escribes ahí se entrega a nuestro proveedor de correo con un solo fin, enviarte la confirmación que pediste. En el sitio no se guarda ninguna lista y cada mensaje que enviamos incluye un enlace de baja. Lo único que existe además es el registro técnico que hace cualquier host, descrito abajo.',
  sections: [
    {
      h: 'DÓNDE SE APLICA ESTA POLÍTICA',
      paras: [
        'Esta política cubre dos sitios que lleva la misma parte: OpenPortalHub (openportalhub.org) y EventTimeline (eventimeline.openportalhub.org), la web de nuestra aplicación de escritorio. Las mismas reglas rigen en ambos, y el formulario de la lista de espera recoge lo mismo, de la misma forma y con el mismo fin, uses el sitio que uses.',
      ],
    },
    {
      h: 'QUÉ RECOPILAMOS',
      paras: ['No se recopila nada para perfilarte. El sitio no instala cookies, no carga analítica, no usa píxeles de seguimiento ni fingerprinting. No hay Google Analytics, ni widgets sociales, ni publicidad, ni intermediario de datos de ningún tipo. El único dato que sale de tu navegador es la dirección que escribes en el formulario de la lista de espera, descrito más abajo. Lo único que se escribe en tu navegador es la preferencia de idioma descrita más abajo: sin localStorage, sin IndexedDB, sin service workers.'],
    },
    {
      h: 'CLOUDFLARE (ALOJAMIENTO)',
      paras: [
        'El sitio se sirve a través de Cloudflare. Como cualquier servidor de internet, la red de Cloudflare recibe los datos técnicos que un navegador envía al pedir una página (dirección IP, user agent, URL solicitada) y conserva registros de seguridad y tráfico para proteger el sitio de abusos y entregar las páginas.',
        'No usamos esos registros para identificar, perfilar ni rastrear a nadie, y no podemos construir un historial de navegación con ellos. Esto es infraestructura de entrega, no analítica.',
      ],
    },
    {
      h: 'COOKIES Y ALMACENAMIENTO LOCAL',
      paras: ['El sitio no instala cookies, no analiza y no rastrea a nadie. Lo único que guarda en tu navegador es el idioma que eliges, en sessionStorage: no sale de tu dispositivo, no escribe nada más y desaparece al cerrar la pestaña.'],
    },
    {
      h: 'DIRECCIONES DE CORREO',
      paras: [
        'El formulario de la lista de espera pide una dirección de correo y nada más. La envías con una casilla de consentimiento explícita: el consentimiento es la base legal de este tratamiento y no se envía nada hasta que la marcas.',
        'Esa dirección se entrega a nuestro proveedor de correo, Oracle Cloud Infrastructure Email Delivery, con un solo fin: entregar el mensaje de confirmación que pediste. El proveedor conserva los registros de entrega que conserva cualquier servicio de correo. El sitio no guarda ninguna lista: no hay base de datos y la dirección no se almacena en el servidor web después de enviar el mensaje.',
        'Cada mensaje que enviamos incluye un enlace de baja. Usar ese enlace, o escribir a legal@openportalhub.org, retira tu consentimiento y pide que se borren tus datos. Funciona sin cuenta.',
        'La dirección no se vende, no se comparte con fines de marketing y no se usa para rastrearte.',
        'Los mensajes que envía el sitio de EventTimeline llevan EventTimeline como producto al que te suscribiste y OpenPortalHub como parte responsable del mensaje. Ese sitio no tiene página de privacidad propia: también le aplica esta.',
      ],
    },
    {
      h: 'ENLACES EXTERNOS',
      paras: ['Si sigues un enlace fuera del sitio, el destino tiene su propia política. Solo enlazamos a páginas en las que confiamos, pero no respondemos de lo que hagan otros sitios.'],
    },
    {
      h: 'CAMBIOS',
      paras: ['Si esto cambia alguna vez —si añadimos una herramienta de analítica, una cookie o cualquier recopilación de datos—, esta página lo dirá, con palabras claras, arriba del todo.'],
    },
  ],
  contact: 'Dudas sobre esta política: legal@openportalhub.org',
}

const termsEn: LegalDict = {
  docTitle: 'TERMS OF SERVICE',
  docMeta: 'OpenPortalHub · openportalhub.org · eventimeline.openportalhub.org',
  updated: 'Last updated · 2026-10-02',
  docLead: 'Plain terms for using the OpenPortalHub and Event Timeline websites and the software they advertise. No dense legalese: what is here is what applies.',
  sections: [
    {
      h: 'WHERE THESE TERMS APPLY',
      paras: ['These terms cover two sites run by the same party: OpenPortalHub (openportalhub.org) and EventTimeline (eventimeline.openportalhub.org), the site for our desktop app. The same terms apply to both.'],
    },
    {
      h: 'THE WEBSITE',
      paras: ['The OpenPortalHub site presents the studio and its projects; the Event Timeline site presents the desktop app. Either may be updated, changed, or taken offline at any time without notice.'],
    },
    {
      h: 'THE SOFTWARE',
      paras: [
        'Event Timeline is not yet released. It is currently in a free closed beta: builds go to testers only, are not public downloads, and carry no availability guarantee.',
        'When the first stable version ships, Event Timeline becomes a paid product under a per-seat license. The exact license text, price, and terms will be published on the product page before any sale.',
      ],
    },
    {
      h: 'BETA SOFTWARE',
      paras: ['Beta builds are pre-release software. They are provided as-is, may be unstable, may lose data, and may change without notice. Do not use them with data you cannot afford to lose.'],
    },
    {
      h: 'ACCEPTABLE USE',
      paras: ['Do not attack the site, abuse the forms, or use the content to misrepresent the studio or its products.'],
    },
    {
      h: 'LIABILITY',
      paras: ['The website and all software are provided "as is" without warranties of any kind. To the maximum extent permitted by law, OpenPortalHub is not liable for any damages arising from their use.'],
    },
    {
      h: 'CHANGES',
      paras: ['These terms may change; the date at the top always shows the current version. Continued use of the site after a change means you accept it.'],
    },
  ],
  contact: 'Questions about these terms: legal@openportalhub.org',
}

const termsEs: LegalDict = {
  docTitle: 'TÉRMINOS Y CONDICIONES',
  docMeta: 'OpenPortalHub · openportalhub.org · eventimeline.openportalhub.org',
  updated: 'Última actualización · 2026-10-02',
  docLead: 'Términos sencillos para usar las webs de OpenPortalHub y Event Timeline y el software que anuncian. Sin parrafada legal densa: lo que hay aquí es lo que aplica.',
  sections: [
    {
      h: 'DÓNDE SE APLICAN ESTOS TÉRMINOS',
      paras: ['Estos términos cubren dos sitios que lleva la misma parte: OpenPortalHub (openportalhub.org) y EventTimeline (eventimeline.openportalhub.org), la web de nuestra aplicación de escritorio. Las mismas condiciones rigen en ambos.'],
    },
    {
      h: 'LA WEB',
      paras: ['El sitio de OpenPortalHub presenta el estudio y sus proyectos; el de Event Timeline presenta la aplicación de escritorio. Cualquiera de los dos puede actualizarse, modificarse o desconectarse en cualquier momento y sin previo aviso.'],
    },
    {
      h: 'EL SOFTWARE',
      paras: [
        'Event Timeline aún no ha sido publicado. Está en una beta cerrada gratuita: las builds van solo a testers, no son descargas públicas y no garantizan disponibilidad.',
        'Cuando salga la primera versión estable, Event Timeline será un producto de pago bajo licencia por puesto. El texto exacto de la licencia, el precio y los términos se publicarán en la página del producto antes de cualquier venta.',
      ],
    },
    {
      h: 'SOFTWARE BETA',
      paras: ['Las builds beta son software pre-lanzamiento. Se proporcionan tal cual, pueden ser inestables, pueden perder datos y pueden cambiar sin previo aviso. No las uses con datos que no puedas permitirte perder.'],
    },
    {
      h: 'USO ACEPTABLE',
      paras: ['No ataques el sitio, no abuses de los formularios ni uses el contenido para falsear el estudio o sus productos.'],
    },
    {
      h: 'RESPONSABILIDAD',
      paras: ['La web y todo el software se proporcionan "tal cual", sin garantías de ningún tipo. En la máxima medida que permita la ley, OpenPortalHub no se hace responsable de los daños derivados de su uso.'],
    },
    {
      h: 'CAMBIOS',
      paras: ['Estos términos pueden cambiar; la fecha de arriba indica siempre la versión vigente. Seguir usando el sitio después de un cambio implica aceptarlo.'],
    },
  ],
  contact: 'Dudas sobre estos términos: legal@openportalhub.org',
}

export function getLegalDoc(doc: 'privacy' | 'terms', lang: Lang): LegalDict {
  if (doc === 'privacy') return lang === 'es' ? privacyEs : privacyEn
  return lang === 'es' ? termsEs : termsEn
}

export type Dict = Record<keyof typeof dict.en, string>

/** Language of the current tab: an explicit choice, else the browser's own. */
const LANG_KEY = 'oph.lang'

/** Language the visitor asks for: the choice remembered in this tab, else the
 *  browser's own. The page URL still decides what is rendered; this only feeds
 *  the notice offered on the English pages. */
export function preferredLang(): Lang {
  try {
    const saved = sessionStorage.getItem(LANG_KEY)
    if (saved === 'en' || saved === 'es') return saved
  } catch {
    // Storage unavailable: fall through to the browser's language.
  }
  if (typeof navigator === 'undefined') return 'en'
  const preferred = navigator.languages?.[0] ?? navigator.language ?? ''
  return preferred.toLowerCase().startsWith('es') ? 'es' : 'en'
}

const LangCtx = createContext<{ lang: Lang; page: PageId; set: (l: Lang) => void; t: Dict }>({
  lang: 'en',
  page: 'home',
  set: () => {},
  t: dict.en,
})

/** The language and page come from the URL, not from client state: each page is
 *  a static file per language, which is what makes both markets indexable. */
export function LangProvider({ children, lang, page }: { children: ReactNode; lang: Lang; page: PageId }) {
  // Switching language is a navigation now, so this only remembers the choice
  // inside the tab; the notice on the English pages reads it back.
  const set = (l: Lang) => {
    try {
      sessionStorage.setItem(LANG_KEY, l)
    } catch {
      // Storage can be unavailable (private mode, blocked cookies): the choice
      // simply is not remembered.
    }
  }

  if (typeof document !== 'undefined') document.documentElement.lang = lang
  return (
    <LangCtx.Provider value={{ lang, page, set, t: dict[lang] }}>
      {children}
    </LangCtx.Provider>
  )
}

export function useLang() {
  return useContext(LangCtx)
}
