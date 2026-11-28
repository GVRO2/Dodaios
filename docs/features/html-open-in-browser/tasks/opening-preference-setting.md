---
id: T1
title: "Store and expose the HTML opening preference"
layer: "app"
deps: []
blocks: ["T5"]
acs: ["AC-11"]
files_hint: ["dodaios/core/config.py", "dodaios/core/config_writer.py", "dodaios/ui/web/settings_routes.py"]
owner: "GVRO"
estimate: "S"
context_budget: "S"
status: "done"
step: ""
---

# T1 — Store and expose the HTML opening preference

## Place in the sequence

- **Blocked by:** nothing · **Blocks:** T5 — Route an HTML link click by preference and result.
- **Lane:** own lane.

## Why (user story)

> **As a** person
> **I want** to change the opening preference in Settings
> **So that** a first choice is never permanent
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

The stored value that the question writes and Settings changes.

## Inlined context

> The preference lives in the app configuration, like the colour theme. Value `ui.html_link_open`: ask | browser | source, default ask.
>
> — `sad.md §4-§5, abridged`

> Configuration is written only through the config writer; no config field that nothing reads (T5 reads it).
>
> — `sad.md §2, Conventions, abridged`

**Fallback:** insufficient or contradicted by the code → read [spec.md](../spec.md), [sad.md](../sad.md) and [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Read and change the preference in the settings routes, following the colour theme setting.

— `sad.md §5-§6, abridged`; there is no openapi.yaml for this feature.

## Acceptance criteria

### AC-11 (US-04) — happy path

> **Given** a person with a remembered preference
> **When** the person sets it in Settings to ask, rendered page or source
> **Then** the next click on an HTML link follows the new value, also after Dodaios restarts
>
> — `spec.md §5, AC-11, verbatim`

## Checklist

- [x] Add `html_link_open` to `UIConfig`.
- [x] Add its writer next to `set_ui_theme`.
- [x] Add read and change routes; update the in-memory configuration too.

## Edge cases

| Case | Behaviour |
|---|---|
| Unknown value sent | Rejected; the stored value is unchanged |
| Configuration without the key | Reads as ask |

## Definition of Done

- [x] Round-trip tests show the value survives a reload and an unknown value is rejected.
- [x] every Hard Rule inlined above still holds
- [x] lint + type checks clean
