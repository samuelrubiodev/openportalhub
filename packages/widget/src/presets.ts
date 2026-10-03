// Reference sample session (mirrors the shipped application's demo state)
// and the EVTX-style record XML builder.

import { labels } from './labels'
import { parseTime } from './format'
import type { Level, TimelineEvent, TimelineSession } from './types'

const OFF = '+02:00'

const T = (time: string): string => `2026-09-24T${time}${OFF}`

const LANE_SYSTEM = 'SYSTEM'
const LANE_APPS = 'APPLICATIONS'

const events: TimelineEvent[] = [
  {
    id: 'app-01',
    lane: LANE_APPS,
    time: T('19:56:57.120'),
    provider: 'MsiInstaller',
    eventId: 1040,
    level: 'information',
    channel: 'Application',
    category: { label: 'Instalación' },
    computer: 'portatil-samuel',
    origin: 'Application',
    processId: 8016,
    threadId: 3312,
    message: 'Inicio de la instalación de Windows: el producto Microsoft Edge se está configurando.',
    data: { Producto: 'Microsoft Edge', Estado: 'configurando' },
  },
  {
    id: 'app-02',
    lane: LANE_APPS,
    time: T('19:57:32.415'),
    provider: 'igcc',
    eventId: 0,
    level: 'information',
    channel: 'Application',
    category: {
      label: 'Otro',
      id: 'category/other-default v1',
      derived: true,
      note: 'Etiqueta derivada; no es una causa.',
    },
    computer: 'portatil-samuel',
    origin: 'Application',
    processId: 4832,
    threadId: 0,
    data: { Dato01: 'El servicio ha controlado el estado del recurso solicitado.' },
    markNote: 'Nota del marcador',
  },
  {
    id: 'app-03',
    lane: LANE_APPS,
    time: T('19:58:45.210'),
    provider: '.NET Runtime',
    eventId: 1026,
    level: 'error',
    channel: 'Application',
    category: { label: 'Error de aplicación', id: 'category/app-error v1' },
    computer: 'portatil-samuel',
    origin: 'Application',
    processId: 8140,
    threadId: 1,
    message: 'Aplicación: workpad.exe. Excepción no controlada: System.IO.IOException: El disco está lleno.',
    data: { Aplicación: 'workpad.exe', Excepción: 'System.IO.IOException' },
  },
  {
    id: 'app-04',
    lane: LANE_APPS,
    time: T('19:58:45.840'),
    provider: 'Application Error',
    eventId: 1000,
    level: 'error',
    channel: 'Application',
    computer: 'portatil-samuel',
    origin: 'Application',
    processId: 8140,
    threadId: 2140,
    message: 'Nombre de la aplicación con errores: workpad.exe, versión 3.2.1.0, marca de tiempo 0x68f2a1b4.',
    data: { Aplicación: 'workpad.exe', Versión: '3.2.1.0', Excepción: '0xe0434352' },
  },
  {
    id: 'app-05',
    lane: LANE_APPS,
    time: T('19:59:31.400'),
    provider: 'ESENT',
    eventId: 312,
    level: 'verbose',
    channel: 'Application',
    computer: 'portatil-samuel',
    origin: 'Application',
    processId: 1108,
    threadId: 3244,
    message: 'El motor de base de datos creó una copia sombra del almacén de instancias.',
    data: { Instancia: 'lsass' },
  },
  {
    id: 'app-06',
    lane: LANE_APPS,
    time: T('19:59:52.800'),
    provider: 'Microsoft-Windows-Winlogon',
    eventId: 7001,
    level: 'information',
    channel: 'Application',
    computer: 'portatil-samuel',
    origin: 'Application',
    processId: 748,
    threadId: 3120,
    user: 'PORTATIL-SAMUEL\\samuel',
    message: 'Notificación de inicio de sesión de usuario al servicio Client/Server Runtime Subsystem.',
    data: { Sesión: '1' },
  },
  {
    id: 'app-07',
    lane: LANE_APPS,
    time: T('20:01:05.200'),
    provider: 'igcc',
    eventId: 1001,
    level: 'warning',
    channel: 'Application',
    computer: 'portatil-samuel',
    origin: 'Application',
    processId: 4832,
    threadId: 0,
    message: 'El módulo de telemetría no ha podido enviar el informe; se reintentará en 30 s.',
    data: { Reintento: '30' },
  },
  {
    id: 'app-08',
    lane: LANE_APPS,
    time: T('20:01:26.900'),
    provider: 'ESENT',
    eventId: 327,
    level: 'verbose',
    channel: 'Application',
    computer: 'portatil-samuel',
    origin: 'Application',
    processId: 1108,
    threadId: 908,
    message: 'El motor de base de datos liberó espacio no utilizado en el almacén de instancias.',
    data: { Instancia: 'SRU', Espacio: '12 MB' },
  },
  {
    id: 'sys-01',
    lane: LANE_SYSTEM,
    time: T('20:00:02.000'),
    provider: 'Microsoft-Windows-Time-Service',
    eventId: 37,
    level: 'information',
    channel: 'System',
    category: { label: 'Sincronización de hora' },
    computer: 'portatil-samuel',
    origin: 'System',
    processId: 2296,
    threadId: 4804,
    message: 'El proveedor de tiempo NtpClient está recibiendo la hora válida desde time.windows.com.',
    data: { Servidor: 'time.windows.com', Deriva: '+00:00:00.081' },
  },
  {
    id: 'sys-02',
    lane: LANE_SYSTEM,
    time: T('20:00:44.200'),
    provider: 'Service Control Manager',
    eventId: 7036,
    level: 'information',
    channel: 'System',
    category: { label: 'Ciclo de vida del servicio', id: 'category/service-lifecycle v1' },
    computer: 'portatil-samuel',
    origin: 'System',
    processId: 1048,
    threadId: 5160,
    message: 'El servicio Windows Search entró en estado detenido.',
    data: { Servicio: 'WSearch', Estado: 'detenido' },
  },
  {
    id: 'sys-03',
    lane: LANE_SYSTEM,
    time: T('20:00:45.100'),
    provider: 'Service Control Manager',
    eventId: 7036,
    level: 'information',
    channel: 'System',
    category: { label: 'Ciclo de vida del servicio', id: 'category/service-lifecycle v1' },
    computer: 'portatil-samuel',
    origin: 'System',
    processId: 1048,
    threadId: 5160,
    message: 'El servicio BITS entró en estado en ejecución.',
    data: { Servicio: 'BITS', Estado: 'en ejecución' },
  },
  {
    id: 'sys-04',
    lane: LANE_SYSTEM,
    time: T('20:00:45.900'),
    provider: 'Service Control Manager',
    eventId: 7031,
    level: 'warning',
    channel: 'System',
    category: { label: 'Ciclo de vida del servicio', id: 'category/service-lifecycle v1' },
    computer: 'portatil-samuel',
    origin: 'System',
    processId: 1048,
    threadId: 5160,
    message: 'El servicio wuauserv terminó inesperadamente. Esto ha sucedido 1 veces.',
    data: { Servicio: 'wuauserv', Repeticiones: '1' },
  },
  {
    id: 'sys-05',
    lane: LANE_SYSTEM,
    time: T('20:00:46.600'),
    provider: 'Service Control Manager',
    eventId: 7036,
    level: 'information',
    channel: 'System',
    category: { label: 'Ciclo de vida del servicio', id: 'category/service-lifecycle v1' },
    computer: 'portatil-samuel',
    origin: 'System',
    processId: 1048,
    threadId: 5160,
    message: 'El servicio wuauserv entró en estado en ejecución.',
    data: { Servicio: 'wuauserv', Estado: 'en ejecución' },
  },
  {
    id: 'sys-06',
    lane: LANE_SYSTEM,
    time: T('20:00:47.400'),
    provider: 'Microsoft-Windows-DistributedCOM',
    eventId: 10016,
    level: 'error',
    channel: 'System',
    category: { label: 'Permisos COM' },
    computer: 'portatil-samuel',
    origin: 'System',
    processId: 1048,
    threadId: 5160,
    message: 'Los permisos específicos de la aplicación no otorgan la autorización de activación local para la aplicación COM.',
    data: { CLSID: '{D6F77C2B-2B43-4A6C-9A0A-5C1E4A2F81B3}', Usuario: 'SERVICIO LOCAL' },
  },
  {
    id: 'sys-07',
    lane: LANE_SYSTEM,
    time: T('20:00:48.300'),
    provider: 'Microsoft-Windows-Windows Defender',
    eventId: 1000,
    level: 'information',
    channel: 'System',
    category: { label: 'Examen de Windows Defender' },
    computer: 'portatil-samuel',
    origin: 'System',
    processId: 4392,
    threadId: 6608,
    message: 'Examen rápido de Windows Defender iniciado.',
    data: { TipoDeExamen: 'rápido' },
  },
]

/**
 * The demo session rendered by the shipped application: 15 events, corridor
 * 19:56:56 – 20:01:56, visible window 19:56:13 – 20:02:59 (6m 46s), 9 clusters.
 */
export const referenceSession: TimelineSession = {
  title: 'Event Timeline',
  subtitle: '2026-09-24 19:56',
  incident: {
    name: '2026-09-24 19:56',
    computer: 'PORTATIL-SAMUEL',
    description: '',
    start: T('19:56:56'),
    end: T('20:01:56'),
    timezoneOffset: 120,
    timezoneLabel: 'UTC+02:00',
    note: '',
    active: true,
  },
  lanes: [
    { id: 'SYSTEM', label: 'SYSTEM', color: 'var(--et-lane-system)', visible: true },
    { id: 'APPLICATIONS', label: 'APPLICATIONS', color: 'var(--et-lane-applications)', visible: true },
    { id: 'FILES', label: 'FILES', color: 'var(--et-lane-files)', visible: true },
    { id: 'NETWORK', label: 'NETWORK', color: 'var(--et-lane-network)', visible: true },
    { id: 'USER', label: 'USER', color: 'var(--et-lane-user)', visible: true },
  ],
  events,
  marks: [
    { id: 'mark-corridor-start', kind: 'corridor', time: T('19:56:56'), label: '[ 19:56:56', color: 'var(--et-marker)' },
    { id: 'mark-corridor-end', kind: 'corridor', time: T('20:01:56'), label: '20:01 ]', color: 'var(--et-marker)' },
    { id: 'mark-incident', kind: 'incident', time: T('19:56:56'), color: 'var(--et-amber)' },
    { id: 'bm-1', kind: 'bookmark', time: T('19:59:05'), color: 'var(--et-amber)' },
    { id: 'bm-2', kind: 'bookmark', time: T('20:00:51'), color: 'var(--et-amber)' },
  ],
  window: { start: T('19:56:13'), end: T('20:02:59') },
  queryRange: { start: T('19:56:56'), end: T('20:01:56') },
}

const XML_LEVEL_NUMBER: Record<Level, number> = { critical: 1, error: 2, warning: 3, information: 4, verbose: 5 }

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) =>
    ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '"' ? '&quot;' : '&apos;',
  )
}

function attr(text: string): string {
  return escapeXml(text)
}

function recordIdFromId(id: string): number {
  let hash = 7
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return (hash % 99991) + 1
}

/**
 * Builds a Windows-EVTX style record XML for an event. When the event carries
 * its own `xml`, that payload wins. Deterministic output, safe for tests.
 */
export function buildEventXml(event: TimelineEvent, session?: TimelineSession): string {
  if (event.xml !== undefined) return event.xml
  const t = parseTime(event.time)
  const systemTime = Number.isFinite(t) ? new Date(t).toISOString() : event.time
  const sessionIndex = session ? session.events.indexOf(event) : -1
  const recordId = sessionIndex >= 0 ? sessionIndex + 1 : recordIdFromId(event.id)
  const levelName =
    event.level !== undefined
      ? labels.en[`level${event.level[0].toUpperCase()}${event.level.slice(1)}` as keyof typeof labels.en]
      : undefined
  const lines: string[] = []
  lines.push('<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">')
  lines.push('  <System>')
  if (event.provider !== undefined) lines.push(`    <Provider Name="${attr(event.provider)}"/>`)
  if (event.eventId !== undefined) lines.push(`    <EventID>${attr(String(event.eventId))}</EventID>`)
  if (event.level !== undefined) lines.push(`    <Level>${XML_LEVEL_NUMBER[event.level]}</Level>`)
  lines.push(`    <TimeCreated SystemTime="${attr(systemTime)}"/>`)
  lines.push(`    <EventRecordID>${recordId}</EventRecordID>`)
  if (event.channel !== undefined) lines.push(`    <Channel>${attr(event.channel)}</Channel>`)
  if (event.computer !== undefined) lines.push(`    <Computer>${attr(event.computer)}</Computer>`)
  if (event.processId !== undefined || event.threadId !== undefined) {
    lines.push(
      `    <Execution ProcessID="${event.processId ?? 0}" ThreadID="${event.threadId ?? 0}"/>`,
    )
  }
  lines.push('  </System>')
  const dataEntries = Object.entries(event.data ?? {})
  if (dataEntries.length > 0) {
    lines.push('  <EventData>')
    for (const [key, value] of dataEntries) {
      lines.push(`    <Data Name="${attr(key)}">${escapeXml(value)}</Data>`)
    }
    lines.push('  </EventData>')
  }
  if (event.category !== undefined || levelName !== undefined) {
    lines.push('  <RenderingInfo>')
    if (levelName !== undefined) lines.push(`    <Level>${escapeXml(levelName)}</Level>`)
    if (event.category !== undefined) lines.push(`    <Category>${escapeXml(event.category.label)}</Category>`)
    lines.push('  </RenderingInfo>')
  }
  lines.push('</Event>')
  return lines.join('\n')
}
