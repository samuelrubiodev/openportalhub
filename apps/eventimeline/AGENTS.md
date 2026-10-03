# AGENTS.md — Event Timeline

## The project

**EventTimeline** website: the **presentation** site (landing, **Persuade** mode) for the EventTimeline desktop utility (OpenPortalHub) — pre-launch phase; the only conversion is a **waitlist**. Decided stack (2026-09-06): **React + Vite + TypeScript**.

## Mandatory design tool: Google Stitch MCP

**Every visual design (comps, screens, variants, UI explorations) MUST be generated via the Google Stitch MCP tools.** Text mockups, ASCII, or "designing directly in code" are not accepted as a substitute for the visual phase.

### Golden rule: generate from scratch, never reuse

- **Using any existing Stitch project is forbidden** — reading it, copying it, taking it as a base, inspiration or starting point. This includes previous projects with similar names (e.g. an existing "Event Timeline Showcase" is **not** authorized for reading or reuse).
- **Do not use `list_projects` to look for earlier work** and do not attach screenshots of old projects to the context. Every effort starts from scratch.
- Every design effort begins with `mcp__stitch_create_project` (a freshly created project, descriptive title: `"Event Timeline — <surface> <iteration>"`) and a design system **generated from scratch** for that project (see "Design system").
- The design comes from the current brief and the prompt, never from an earlier artifact.

### Mandatory flow

1. `create_project` → a new project for the design effort.
2. `mcp__stitch_generate_screen_from_text` → render each screen/comp.
   - `projectId`: the number **without** the `projects/` prefix.
   - `deviceType: "DESKTOP"` for this website (unless the brief asks for mobile).
   - The prompt must **lead with the surface structure** (regions, hierarchies, density), not with atmosphere: Stitch must return a designed screen, not a poster.
3. Iteration: `mcp__stitch_edit_screens` (on the project's `selectedScreenIds`) and `mcp__stitch_generate_variants` to explore alternatives for a screen.
4. Artifact retrieval: `mcp__stitch_list_screens` / `mcp__stitch_get_screen` return the screenshot (URL) and reference HTML code.

### Design system

- The design system **is generated, not inherited**: create it with `mcp__stitch_create_design_system` (or `create_design_system_from_design_md` / `upload_design_md` when a local `DESIGN.md` exists), inside the effort's new project.
- Once generated within the effort, pin its id (`assets/<id>`, visible via `get_project`) in subsequent `generate_screen_from_text` calls for consistency. **That id is only valid within the same freshly created project.**
- local mirror: the result is materialized in the repo's `DESIGN.md` (tokens, typography, colors, rules). The repo's `DESIGN.md` is the source of truth for the code; Stitch is the source of truth for the visual comps.

### Timeouts (critical)

- `generate_screen_from_text` and `edit_screens` can take several minutes. **Do NOT retry on timeout or connection error**: generation usually keeps running on the server.
- Poll with `get_screen` every ~30 s (up to ~10 times) to collect the result.

### Landing the renders in the repo

- Download each chosen screenshot/comp into the repo, with a stable name per direction/surface.
- After generating with Stitch, record the exact prompt received next to the image.
- The final code is built **against the approved comp**: measure the comp before writing UI, and treat the HTML Stitch returns as reference, not as something to copy blindly into the product.

## Other working rules

- Do not create npm/framework projects without recording the decision here (update "The project" section when the stack is fixed).
- The presentation landing page is **Persuade** mode; decide any other surface's mode when it appears.
