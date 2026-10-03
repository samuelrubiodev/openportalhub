// One CSS string for the whole widget, scoped by `et-` class names. The root
// selector is `:host, .et-scope` so the same string works inside a shadow
// root and in light-DOM fallback (the host gets the `et-scope` class there).
// Structural lengths are em (reference px / 13.2) so the window scales with
// its container; colors exist only as the custom properties below.

export const widgetStyles = String.raw`
:host,
.et-scope {
  --et-ground: #101a20;
  --et-strip: #152128;
  --et-panel: #202b33;
  --et-center: #172027;
  --et-ruler: #101b22;
  --et-lane-even: #142632;
  --et-lane-odd: #172b38;
  --et-outside: #0e161d;
  --et-footer: #0a1116;
  --et-inset: #131e26;
  --et-line: #34434c;
  --et-line-soft: #24313a;
  --et-ink: #f4f6f6;
  --et-ink-soft: #bec9cc;
  --et-ink-dim: #83919a;
  --et-accent: #0284c7;
  --et-marker: #38bdf8;
  --et-playhead: #ff5722;
  --et-playhead-glow: rgba(255, 87, 34, 0.16);
  --et-amber: #e7a84c;
  --et-teal: #4db8af;
  --et-critical: #ef4444;
  --et-error: #f97316;
  --et-warning: #f59e0b;
  --et-information: #3b82f6;
  --et-verbose: #64748b;
  --et-lane-system: #0ea5e9;
  --et-lane-applications: #a855f7;
  --et-lane-files: #f59e0b;
  --et-lane-network: #3b82f6;
  --et-lane-user: #10b981;
  --et-ctl: #444d53;
  --et-shadow: rgba(0, 0, 0, 0.45);
  --et-font: "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, "Noto Sans", Roboto, Arial, sans-serif;
  --et-font-mono: "Cascadia Mono", Consolas, "SF Mono", ui-monospace, monospace;
  container-type: inline-size;
  display: block;
  font-family: var(--et-font);
  color: var(--et-ink);
  line-height: 1.35;
  text-align: start;
  -webkit-font-smoothing: antialiased;
}

.et-scope *,
.et-scope *::before,
.et-scope *::after {
  box-sizing: border-box;
  min-width: 0;
}

.et-scope button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}

.et-scope input {
  font: inherit;
}

.et-scope :focus-visible {
  outline: 2px solid var(--et-marker);
  outline-offset: 1px;
  border-radius: 0.2em;
}

.et-scope ::-webkit-scrollbar {
  width: 0.5em;
  height: 0.5em;
}

.et-scope ::-webkit-scrollbar-thumb {
  background: var(--et-line);
  border-radius: 0.25em;
}

.et-scope ::-webkit-scrollbar-track {
  background: transparent;
}

.et-scope .et-icon {
  display: inline-flex;
  width: 1em;
  height: 1em;
  flex: none;
}

.et-scope .et-icon svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* ---------- root window ---------- */

.et-scope .et {
  font-size: 13.2px; /* fallback when container query units are unsupported */
  font-size: clamp(8.5px, 0.9586cqi, 15px);
  display: flex;
  flex-direction: column;
  height: 60.3em;
  min-height: 0;
  background: var(--et-ground);
  border: 1px solid var(--et-line-soft);
  border-radius: 0.4em;
  overflow: hidden;
}

.et-scope .et[data-poster="true"] {
  pointer-events: none;
}

/* ---------- title bar ---------- */

.et-scope .et-title {
  display: flex;
  align-items: center;
  gap: 0.5em;
  height: 3.485em;
  padding: 0 0.55em;
  background: var(--et-ground);
  border-bottom: 1px solid var(--et-line-soft);
  flex: none;
}

.et-scope .et-menuBtn {
  width: 2.4em;
  height: 2.4em;
  border-radius: 0.4em;
  display: grid;
  place-items: center;
  color: var(--et-ink);
}

.et-scope .et-menuBtn:hover {
  background: var(--et-inset);
}

.et-scope .et-brand {
  display: flex;
  align-items: baseline;
  gap: 0.45em;
  margin-left: 0.2em;
  white-space: nowrap;
  overflow: hidden;
}

.et-scope .et-brandName {
  font-weight: 700;
  font-size: 1.02em;
}

.et-scope .et-brandDot,
.et-scope .et-brandSub {
  color: var(--et-ink-dim);
  font-size: 0.92em;
  font-variant-numeric: tabular-nums;
}

.et-scope .et-titleActions {
  margin-left: auto;
  display: flex;
  gap: 0.45em;
}

.et-scope .et-tbtn {
  height: 2em;
  padding: 0 0.85em;
  border: 1px solid var(--et-line);
  border-radius: 0.4em;
  font-size: 0.88em;
  color: var(--et-ink);
  white-space: nowrap;
}

.et-scope .et-tbtn:hover {
  background: var(--et-inset);
  border-color: var(--et-ink-dim);
}

.et-scope .et-titleSep {
  width: 1px;
  height: 1.8em;
  background: var(--et-line-soft);
  margin: 0 0.35em;
  flex: none;
}

.et-scope .et-winControls {
  display: flex;
  flex: none;
}

.et-scope .et-winBtn {
  width: 2.4em;
  height: 2.4em;
  display: grid;
  place-items: center;
  color: var(--et-ink-soft);
  border-radius: 0.3em;
}

.et-scope .et-winBtn:hover {
  background: var(--et-inset);
  color: var(--et-ink);
}

/* ---------- time corridor strip ---------- */

.et-scope .et-corridor {
  display: flex;
  align-items: center;
  gap: 0.7em;
  height: 5.152em;
  padding: 0 0.6em;
  background: var(--et-strip);
  border-bottom: 1px solid var(--et-line-soft);
  flex: none;
}

.et-scope .et-corridorInfo {
  display: flex;
  align-items: center;
  gap: 0.6em;
  flex: none;
}

.et-scope .et-corridorBadge {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  border: 1px solid var(--et-line);
  display: grid;
  place-items: center;
  color: var(--et-ink-soft);
}

.et-scope .et-corridorTexts {
  display: flex;
  flex-direction: column;
  gap: 0.1em;
}

.et-scope .et-corridorLabel {
  font-size: 0.8em;
  color: var(--et-ink-dim);
}

.et-scope .et-corridorRange {
  font-size: 0.95em;
  color: var(--et-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.et-scope .et-corridorSep {
  width: 1px;
  align-self: stretch;
  margin: 0.75em 0;
  background: var(--et-line-soft);
  flex: none;
}

.et-scope .et-corridorFields {
  display: flex;
  align-items: center;
  gap: 0.5em;
  min-width: 0;
  flex-wrap: wrap;
}

.et-scope .et-fieldLabel {
  font-size: 0.82em;
  color: var(--et-ink-dim);
  flex: none;
}

.et-scope .et-field {
  width: 11.8em;
  height: 2.05em;
  background: var(--et-ground);
  border: 1px solid var(--et-line);
  border-radius: 0.35em;
  color: var(--et-ink);
  font-size: 0.88em;
  padding: 0 0.55em;
  font-variant-numeric: tabular-nums;
}

.et-scope .et-field:focus-visible {
  outline: none;
  border-color: var(--et-accent);
}

.et-scope .et-calBtn {
  width: 1.85em;
  height: 1.85em;
  border: 1px solid var(--et-line);
  border-radius: 0.3em;
  display: grid;
  place-items: center;
  color: var(--et-ink-dim);
  flex: none;
}

.et-scope .et-calBtn:hover {
  color: var(--et-ink);
  border-color: var(--et-ink-dim);
}

.et-scope .et-calBtn .et-icon {
  font-size: 0.85em;
}

.et-scope .et-colon {
  color: var(--et-ink-dim);
  flex: none;
}

.et-scope .et-applyBtn {
  height: 2.05em;
  padding: 0 1.05em;
  background: var(--et-ctl);
  color: var(--et-ink);
  border-radius: 0.4em;
  font-size: 0.9em;
  font-weight: 600;
  flex: none;
}

.et-scope .et-applyBtn:hover {
  filter: brightness(1.12);
}

/* ---------- main split ---------- */

.et-scope .et-main {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ---------- context panel ---------- */

.et-scope .et-context {
  width: 20.455em;
  flex: none;
  background: var(--et-panel);
  border-right: 1px solid var(--et-line-soft);
  display: flex;
  flex-direction: column;
  padding: 0.65em 0.75em;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  min-height: 0;
}

.et-scope .et-context .et-railBtn,
.et-scope .et-details .et-railBtn {
  display: none;
  width: 2em;
  height: 2em;
  border-radius: 0.35em;
  place-items: center;
  color: var(--et-ink-soft);
}

.et-scope .et-context[data-collapsed="true"],
.et-scope .et-details[data-collapsed="true"] {
  width: 2.7em;
  padding: 0.6em 0.35em;
}

.et-scope .et-context[data-collapsed="true"] .et-railBtn,
.et-scope .et-details[data-collapsed="true"] .et-railBtn {
  display: grid;
}

.et-scope .et-context[data-collapsed="true"] .et-contextBody,
.et-scope .et-details[data-collapsed="true"] .et-detailsBodyWrap {
  display: none;
}

.et-scope .et-contextBody {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.et-scope .et-panelHead {
  font-size: 0.78em;
  letter-spacing: 0.09em;
  color: var(--et-ink-dim);
}

.et-scope .et-incidentHead {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.et-scope .et-incidentIcon {
  color: var(--et-ink);
  font-size: 1.05em;
  display: inline-flex;
}

.et-scope .et-incidentTitle {
  font-weight: 700;
  font-size: 0.95em;
  letter-spacing: 0.02em;
}

.et-scope .et-kv {
  display: flex;
  align-items: baseline;
  gap: 0.6em;
  font-size: 0.87em;
  line-height: 1.5;
}

.et-scope .et-kvLabel {
  flex: 0 0 5.8em;
  color: var(--et-ink-dim);
}

.et-scope .et-kvValue {
  flex: 1;
  color: var(--et-ink);
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}

.et-scope .et-kvActions {
  flex: none;
  display: flex;
}

.et-scope .et-miniCal {
  width: 1.7em;
  height: 1.7em;
  display: grid;
  place-items: center;
  color: var(--et-ink-dim);
  border-radius: 0.25em;
}

.et-scope .et-miniCal:hover {
  color: var(--et-ink);
  background: var(--et-inset);
}

.et-scope .et-tzLine {
  text-align: right;
  font-size: 0.76em;
  color: var(--et-ink-dim);
}

.et-scope .et-noteLabel {
  font-size: 0.82em;
  color: var(--et-ink-dim);
}

.et-scope .et-noteBox {
  background: var(--et-inset);
  border: 1px solid var(--et-line-soft);
  border-radius: 0.45em;
  min-height: 2.8em;
  padding: 0.4em 0.55em;
  font-size: 0.82em;
  color: var(--et-ink-soft);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.et-scope .et-sep {
  border: 0;
  border-top: 1px solid var(--et-line-soft);
  width: 100%;
  margin: 0.25em 0;
  flex: none;
}

.et-scope .et-sectionHead {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 0.88em;
  color: var(--et-ink);
}

.et-scope .et-sectionHead .et-icon {
  color: var(--et-ink-soft);
}

.et-scope .et-pill {
  display: flex;
  align-items: center;
  gap: 0.55em;
  width: 100%;
  background: var(--et-inset);
  border: 1px solid var(--et-line-soft);
  border-radius: 0.5em;
  padding: 0.5em 0.65em;
  font-size: 0.87em;
  color: var(--et-ink);
  text-align: left;
}

.et-scope .et-pill:hover {
  border-color: var(--et-line);
}

.et-scope .et-pill .et-icon {
  color: var(--et-ink-soft);
}

.et-scope .et-pillTime {
  margin-left: auto;
  color: var(--et-amber);
  font-size: 0.9em;
  font-variant-numeric: tabular-nums;
}

.et-scope .et-levelHead {
  font-size: 0.75em;
  letter-spacing: 0.09em;
  color: var(--et-ink-dim);
}

.et-scope .et-chipRow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45em;
}

.et-scope .et-chip {
  border: 1px solid var(--et-line);
  background: var(--et-center);
  border-radius: 0.4em;
  padding: 0.34em 0.7em;
  font-size: 0.82em;
  color: var(--et-ink-soft);
}

.et-scope .et-chip:hover {
  color: var(--et-ink);
}

.et-scope .et-chip[aria-pressed="true"] {
  color: var(--et-ink);
  border-color: var(--et-ink-soft);
}

/* ---------- center column ---------- */

.et-scope .et-center {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--et-center);
}

.et-scope .et-centerHead {
  display: flex;
  align-items: center;
  gap: 0.7em;
  height: 2.879em;
  padding: 0 0.7em;
  flex: none;
}

.et-scope .et-centerTitle {
  font-size: 0.84em;
  letter-spacing: 0.1em;
  color: var(--et-ink-soft);
  white-space: nowrap;
}

.et-scope .et-centerCount {
  font-size: 0.84em;
  color: var(--et-ink-dim);
  white-space: nowrap;
}

.et-scope .et-spanGroup {
  margin-left: auto;
  display: flex;
  align-items: stretch;
  height: 2em;
  border: 1px solid var(--et-line);
  border-radius: 0.45em;
  overflow: hidden;
  flex: none;
}

.et-scope .et-spanBtn {
  padding: 0 0.62em;
  font-size: 0.85em;
  color: var(--et-ink-soft);
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.et-scope .et-spanBtn:hover {
  color: var(--et-ink);
}

.et-scope .et-spanBtn.et-divided {
  border-left: 1px solid var(--et-line-soft);
}

.et-scope .et-spanBtn[aria-pressed="true"] {
  color: var(--et-ink);
  font-weight: 600;
}

.et-scope .et-spanBtn[aria-pressed="true"]::after {
  content: "";
  position: absolute;
  left: 0.4em;
  right: 0.4em;
  bottom: 0.18em;
  height: 0.15em;
  background: var(--et-ink);
  border-radius: 0.07em;
}

.et-scope .et-filtersWrap {
  position: relative;
  flex: none;
}

.et-scope .et-filtersBtn {
  display: flex;
  align-items: center;
  gap: 0.45em;
  height: 2em;
  padding: 0 0.7em;
  border: 1px solid var(--et-line);
  border-radius: 0.45em;
  font-size: 0.85em;
  color: var(--et-ink);
}

.et-scope .et-filtersBtn:hover {
  background: var(--et-inset);
}

.et-scope .et-filtersBtn .et-chevron {
  color: var(--et-ink-dim);
  transition: transform 0.15s ease;
}

.et-scope .et-filtersBtn[aria-expanded="true"] .et-chevron {
  transform: rotate(180deg);
}

.et-scope .et-popover {
  position: absolute;
  top: calc(100% + 0.45em);
  right: 0;
  width: 15.5em;
  background: var(--et-panel);
  border: 1px solid var(--et-line);
  border-radius: 0.5em;
  padding: 0.6em 0.65em;
  display: none;
  flex-direction: column;
  gap: 0.55em;
  z-index: 40;
  box-shadow: 0 0.4em 1.4em var(--et-shadow);
}

.et-scope .et-popover[data-open="true"] {
  display: flex;
}

.et-scope .et-popHead {
  font-size: 0.74em;
  letter-spacing: 0.09em;
  color: var(--et-ink-dim);
}

.et-scope .et-popLane {
  display: flex;
  align-items: center;
  gap: 0.5em;
  width: 100%;
  padding: 0.3em 0.4em;
  border-radius: 0.35em;
  font-size: 0.85em;
  color: var(--et-ink);
  text-align: left;
}

.et-scope .et-popLane:hover {
  background: var(--et-inset);
}

.et-scope .et-popLane[aria-pressed="false"] {
  color: var(--et-ink-dim);
}

.et-scope .et-popLaneDot {
  width: 0.7em;
  height: 0.7em;
  border-radius: 0.15em;
  flex: none;
}

.et-scope .et-popReset {
  align-self: flex-start;
  font-size: 0.82em;
  color: var(--et-ink-soft);
  border: 1px solid var(--et-line);
  border-radius: 0.35em;
  padding: 0.3em 0.7em;
}

.et-scope .et-popReset:hover {
  color: var(--et-ink);
}

/* ---------- search row ---------- */

.et-scope .et-searchRow {
  display: flex;
  align-items: center;
  gap: 0.65em;
  height: 3.333em;
  padding: 0 0.7em;
  flex: none;
}

.et-scope .et-searchLabel {
  font-size: 0.85em;
  color: var(--et-ink-dim);
  flex: none;
}

.et-scope .et-searchInput {
  flex: 1;
  height: 2.2em;
  background: var(--et-ground);
  border: 1px solid var(--et-line);
  border-radius: 0.4em;
  padding: 0 0.6em;
  color: var(--et-ink);
  font-size: 0.87em;
}

.et-scope .et-searchInput::placeholder {
  color: var(--et-ink-dim);
}

.et-scope .et-searchInput:focus-visible {
  outline: none;
  border-color: var(--et-accent);
}

.et-scope .et-loadedToggle {
  flex: none;
  font-size: 0.87em;
  color: var(--et-ink-soft);
  white-space: nowrap;
}

.et-scope .et-loadedToggle:hover {
  color: var(--et-ink);
}

.et-scope .et-loadedToggle[aria-pressed="true"] {
  color: var(--et-ink);
  font-weight: 600;
}

/* ---------- plot ---------- */

.et-scope .et-plot {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 9.091em minmax(0, 1fr);
  grid-template-rows: 4.091em repeat(5, 7.273em) 2.424em;
}

.et-scope .et-plotLabels {
  grid-area: 1 / 1 / 7 / 2;
  background: var(--et-outside);
  border-right: 1px solid var(--et-line-soft);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.et-scope .et-rulerCaption {
  height: 4.091em;
  flex: none;
  display: flex;
  align-items: center;
  padding: 0 0.8em;
  font-size: 0.72em;
  letter-spacing: 0.12em;
  color: var(--et-ink-dim);
}

.et-scope .et-laneLabel {
  position: relative;
  z-index: 2;
  overflow: visible;
  height: 7.273em;
  flex: none;
  padding: 0 0.55em 0 0.8em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.18em;
}

.et-scope .et-laneHead {
  display: flex;
  align-items: center;
  gap: 0.45em;
}

.et-scope .et-laneBar {
  width: 0.22em;
  height: 1.5em;
  border-radius: 0.1em;
  flex: none;
}

.et-scope .et-laneName {
  font-size: 0.85em;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.et-scope .et-laneCount {
  font-size: 0.72em;
  color: var(--et-ink-dim);
  padding-left: 0.68em;
  font-variant-numeric: tabular-nums;
}

.et-scope .et-laneLabel[data-hidden="true"] {
  opacity: 0.45;
}

.et-scope .et-eyeBtn {
  position: absolute;
  right: -0.85em;
  top: 50%;
  transform: translateY(-50%);
  width: 1.6em;
  height: 1.6em;
  border: 1px solid var(--et-line);
  border-radius: 0.5em;
  display: grid;
  place-items: center;
  color: var(--et-ink-soft);
}

.et-scope .et-eyeBtn:hover {
  color: var(--et-ink);
  border-color: var(--et-ink-dim);
}

.et-scope .et-eyeBtn .et-icon {
  font-size: 0.82em;
}

.et-scope .et-canvasScroll {
  grid-area: 1 / 2 / 7 / 3;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  min-width: 0;
  scrollbar-width: thin;
}

.et-scope .et-canvasHost {
  position: relative;
  height: 100%;
  min-width: 46em;
  outline: none;
  user-select: none;
  touch-action: none;
}

.et-scope .et-canvasHost:focus-visible {
  outline: 2px solid var(--et-marker);
  outline-offset: -1px;
}

.et-scope .et-rulerBand {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4.091em;
  background: var(--et-ruler);
  border-bottom: 1px solid var(--et-line-soft);
}

.et-scope .et-laneStrip {
  position: absolute;
  left: 0;
  right: 0;
  height: 7.273em;
}

.et-scope .et-laneStrip[data-even="true"] {
  background: var(--et-lane-even);
}

.et-scope .et-laneStrip[data-even="false"] {
  background: var(--et-lane-odd);
}

.et-scope .et-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.et-scope .et-corridorLine {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px dotted var(--et-marker);
  opacity: 0.8;
}

.et-scope .et-incidentLine {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px dashed var(--et-amber);
  opacity: 0.75;
}

.et-scope .et-bookmarkFlag {
  position: absolute;
  top: 0;
  width: 0.55em;
  height: 1.05em;
  background: var(--et-amber);
  clip-path: polygon(0 0, 100% 0, 100% 62%, 50% 100%, 0 62%);
  transform: translateX(-50%);
  opacity: 0.9;
}

.et-scope .et-playGlow {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1.8em;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, var(--et-playhead-glow) 45%, var(--et-playhead-glow) 55%, transparent);
}

.et-scope .et-playLine {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0.15em;
  background: var(--et-playhead);
  transform: translateX(-50%);
  box-shadow: 0 0 0.5em var(--et-playhead-glow);
}

.et-scope .et-tick {
  position: absolute;
  bottom: 0;
  width: 1px;
  height: 0.45em;
  background: var(--et-line);
}

.et-scope .et-tickMajor {
  height: 0.75em;
}

.et-scope .et-tickLabel {
  position: absolute;
  bottom: 0.95em;
  transform: translateX(-50%);
  font-size: 0.75em;
  color: var(--et-ink-dim);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.et-scope .et-playChip {
  position: absolute;
  top: 0.45em;
  left: clamp(2.4em, var(--px), calc(100% - 2.4em));
  transform: translateX(-50%);
  background: var(--et-playhead);
  color: var(--et-ink);
  font-size: 0.8em;
  font-weight: 700;
  padding: 0.18em 0.5em;
  border-radius: 0.35em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  z-index: 6;
}

.et-scope .et-playChip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 0.32em solid transparent;
  border-top-color: var(--et-playhead);
}

.et-scope .et-bracket {
  position: absolute;
  top: 0.5em;
  background: var(--et-accent);
  color: var(--et-ink);
  font-size: 0.78em;
  font-weight: 600;
  padding: 0.2em 0.5em;
  border-radius: 0.3em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  z-index: 5;
}

.et-scope .et-bracketLeft {
  left: clamp(0em, var(--px), calc(100% - 6.5em));
}

.et-scope .et-bracketRight {
  left: clamp(6.5em, var(--px), 100%);
  transform: translateX(-100%);
}

.et-scope .et-marker {
  position: absolute;
  top: 50%;
  width: 1.55em;
  height: 1.55em;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid transparent;
  padding: 0;
}

.et-scope .et-marker:hover {
  border-color: var(--et-marker);
}

.et-scope .et-marker[data-selected="true"] {
  border-color: var(--et-marker);
  box-shadow: 0 0 0.4em var(--et-playhead-glow);
}

.et-scope .et-markerDiamond {
  grid-area: 1 / 1;
  width: 0.62em;
  height: 0.62em;
  background: var(--et-marker);
  transform: rotate(45deg);
  border-radius: 0.06em;
}

.et-scope .et-clusterPill {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 0.28em;
  background: var(--et-center);
  border: 1px solid var(--et-marker);
  border-radius: 2em;
  padding: 0.18em 0.6em 0.18em 0.5em;
  color: var(--et-marker);
  font-size: 0.8em;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.et-scope .et-clusterPill:hover {
  background: var(--et-inset);
}

.et-scope .et-clusterPill .et-icon {
  font-size: 0.72em;
}

.et-scope .et-plotFoot {
  grid-area: 7 / 1 / 8 / 3;
  background: var(--et-footer);
  border-top: 1px solid var(--et-line-soft);
  display: flex;
  align-items: center;
  gap: 1.1em;
  padding: 0 0.8em;
  font-size: 0.85em;
  min-width: 0;
  overflow: hidden;
}

.et-scope .et-footLabel {
  color: var(--et-ink-dim);
  flex: none;
}

.et-scope .et-footRange {
  color: var(--et-ink);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.et-scope .et-footCounts {
  color: var(--et-teal);
  white-space: nowrap;
  flex: none;
}

.et-scope .et-footMsg {
  margin-left: auto;
  color: var(--et-ink-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- details panel ---------- */

.et-scope .et-details {
  width: 25.53em;
  flex: none;
  background: var(--et-panel);
  border-left: 1px solid var(--et-line-soft);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.et-scope .et-detailsHead {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.55em 0.7em 0.3em;
  flex: none;
}

.et-scope .et-panelTitle {
  font-size: 0.8em;
  letter-spacing: 0.09em;
  color: var(--et-ink-soft);
}

.et-scope .et-collapseBtn {
  margin-left: auto;
  width: 1.9em;
  height: 1.9em;
  display: grid;
  place-items: center;
  border-radius: 0.3em;
  color: var(--et-ink-soft);
}

.et-scope .et-collapseBtn:hover {
  color: var(--et-ink);
  background: var(--et-inset);
}

.et-scope .et-detailsBodyWrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.et-scope .et-tabs {
  display: flex;
  gap: 1.1em;
  padding: 0 0.7em;
  border-bottom: 1px solid var(--et-line-soft);
  flex: none;
}

.et-scope .et-tab {
  position: relative;
  padding: 0.3em 0 0.5em;
  font-size: 0.92em;
  color: var(--et-ink-soft);
}

.et-scope .et-tab::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--et-teal);
  opacity: 0;
}

.et-scope .et-tab[aria-selected="true"] {
  color: var(--et-ink);
}

.et-scope .et-tab[aria-selected="true"]::after {
  opacity: 1;
}

.et-scope .et-detailsBody {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0.55em 0.7em;
  display: flex;
  flex-direction: column;
  gap: 0.45em;
  scrollbar-width: thin;
}

.et-scope .et-drow {
  display: flex;
  gap: 0.6em;
  font-size: 0.87em;
  line-height: 1.45;
}

.et-scope .et-dlabel {
  flex: 0 0 7.4em;
  color: var(--et-ink-dim);
}

.et-scope .et-dvalue {
  flex: 1;
  color: var(--et-ink);
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}

.et-scope .et-dsub {
  display: block;
  font-size: 0.88em;
  color: var(--et-ink-dim);
  overflow-wrap: anywhere;
}

.et-scope .et-levelDot {
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  border-radius: 50%;
  margin-right: 0.45em;
  vertical-align: -0.08em;
}

.et-scope .et-lanePill {
  display: inline-block;
  background: var(--et-lane-color, var(--et-marker));
  color: var(--et-ground);
  font-weight: 700;
  font-size: 0.8em;
  letter-spacing: 0.04em;
  padding: 0.18em 0.65em;
  border-radius: 0.3em;
  text-transform: uppercase;
}

.et-scope .et-hint {
  font-size: 0.87em;
  color: var(--et-ink-dim);
  padding: 0.4em 0;
}

.et-scope .et-xmlPre {
  margin: 0;
  font-family: var(--et-font-mono);
  font-size: 0.8em;
  line-height: 1.5;
  color: var(--et-ink-soft);
  white-space: pre;
  overflow: auto;
  flex: 1;
  min-height: 0;
  user-select: text;
}

.et-scope .et-copyBtn {
  margin: 0.45em 0.7em 0.7em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  border: 1px solid var(--et-line);
  border-radius: 0.4em;
  padding: 0.5em 0.6em;
  font-size: 0.86em;
  color: var(--et-ink);
  flex: none;
}

.et-scope .et-copyBtn:hover {
  background: var(--et-inset);
}

/* ---------- status bar ---------- */

.et-scope .et-status {
  height: 2.576em;
  flex: none;
  display: flex;
  align-items: center;
  gap: 1em;
  padding: 0 0.8em;
  background: var(--et-ground);
  border-top: 1px solid var(--et-line-soft);
  font-size: 0.85em;
  color: var(--et-ink-dim);
  min-width: 0;
}

.et-scope .et-statusMsg {
  white-space: nowrap;
  flex: none;
}

.et-scope .et-statusRange {
  font-family: var(--et-font-mono);
  font-size: 0.9em;
  color: var(--et-ink-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* ---------- responsive ---------- */

@container (max-width: 1099.9px) {
  .et-scope .et:not([data-poster="true"]) .et-context {
    width: 16.8em;
  }

  .et-scope .et:not([data-poster="true"]) .et-details {
    width: 20.5em;
  }
}

@container (max-width: 859.9px) {
  .et-scope .et:not([data-poster="true"]) {
    height: auto;
  }

  .et-scope .et:not([data-poster="true"]) .et-main {
    flex-direction: column;
  }

  .et-scope .et:not([data-poster="true"]) .et-context,
  .et-scope .et:not([data-poster="true"]) .et-details {
    width: auto;
    border-left: 0;
    border-right: 0;
    border-top: 1px solid var(--et-line-soft);
  }

  .et-scope .et:not([data-poster="true"]) .et-center {
    order: 1;
  }

  .et-scope .et:not([data-poster="true"]) .et-context {
    order: 2;
  }

  .et-scope .et:not([data-poster="true"]) .et-details {
    order: 3;
  }

  .et-scope .et:not([data-poster="true"]) .et-title {
    height: auto;
    flex-wrap: wrap;
    padding: 0.4em 0.55em;
    row-gap: 0.3em;
  }

  .et-scope .et:not([data-poster="true"]) .et-corridor {
    height: auto;
    flex-wrap: wrap;
    padding: 0.45em 0.6em;
    row-gap: 0.45em;
  }

  .et-scope .et:not([data-poster="true"]) .et-detailsBody {
    max-height: 26em;
  }

  /* Narrow canvas: let the footer wrap onto its own lines and drop the
     duplicated status message so the visible-window range never runs into it. */
  .et-scope .et:not([data-poster="true"]) .et-plotFrame {
    grid-template-rows: 4.091em repeat(5, 7.273em) auto;
  }

  .et-scope .et:not([data-poster="true"]) .et-plotFoot {
    flex-wrap: wrap;
    row-gap: 0.2em;
    padding: 0.35em 0.8em;
    gap: 0.7em;
  }

  .et-scope .et:not([data-poster="true"]) .et-footMsg {
    display: none;
  }

  .et-scope .et:not([data-poster="true"]) .et-footRange {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* ---------- density ---------- */

.et-scope .et[data-density="compact"] {
  font-size: 11.6px; /* fallback when container query units are unsupported */
  font-size: clamp(8.5px, 0.9586cqi, 13.2px);
}

.et-scope .et[data-density="compact"] .et-context,
.et-scope .et[data-density="compact"] .et-details {
  padding: 0.55em 0.65em;
}

.et-scope .et[data-density="compact"] .et-kv,
.et-scope .et[data-density="compact"] .et-drow {
  line-height: 1.32;
}

.et-scope .et[data-density="compact"] .et-chip {
  padding: 0.26em 0.6em;
}

.et-scope .et[data-density="compact"] .et-pill {
  padding: 0.42em 0.55em;
}

.et-scope .et[data-density="compact"] .et-laneLabel {
  gap: 0.12em;
}

.et-scope .et[data-density="compact"] .et-noteBox {
  min-height: 2.4em;
}

/* poster mode: the desktop window, scaled proportionally to the host */
.et-scope .et[data-poster="true"] {
  font-size: min(0.9586cqi, 13.2px);
  height: 60.3em;
}

/* ---------- motion ---------- */

@media (prefers-reduced-motion: reduce) {
  .et-scope *,
  .et-scope *::before,
  .et-scope *::after {
    transition: none !important;
    animation: none !important;
  }
}
`
