---
id: T7
title: "Add the other-view action and the Settings control"
layer: "ui"
deps: ["T5"]
blocks: ["T8"]
acs: ["AC-09", "AC-11"]
files_hint: ["dodaios/ui/web/frontend/src/components/EditContextMenu.tsx", "dodaios/ui/web/frontend/src/components/agentchat/FileRefChip.tsx", "dodaios/ui/web/frontend/src/components/agentchat/ChatMarkdown.tsx", "dodaios/ui/web/frontend/src/views", "dodaios/ui/web/frontend/src/i18n/locales"]
owner: "GVRO"
estimate: "M"
context_budget: "S"
status: "done"
step: ""
---

# T7 — Add the other-view action and the Settings control

## Place in the sequence

- **Blocked by:** T5 — Route an HTML link click by preference and result · **Blocks:** T8 — Run the acceptance checks in the Dev app.
- **Lane:** shares files with T4, T5, T6 — serialized.

## Why (user story)

> **As a** person
> **I want** to reach the source view of the same link
> **So that** I can inspect or edit the markup when I need to
>
> — `spec.md §4, US-03, verbatim` · full text: [spec.md](../spec.md)

The way to the other view and the way to change a first choice.

## Inlined context

> The secondary action runs the open or source step with the other view and saves nothing. HTML link elements carry their path so the context menu can offer it.
>
> — `sad.md §5, abridged`

**Fallback:** insufficient or contradicted by the code → read [spec.md](../spec.md), [sad.md](../sad.md) and [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Calls the preference routes of T1 and the open route of T3.

— `sad.md §5-§6, abridged`; there is no openapi.yaml for this feature.

## Acceptance criteria

### AC-09 (US-03) — happy path

> **Given** a person with either remembered preference
> **When** the person uses the secondary action on an HTML link to open the other view
> **Then** that view opens for this click and the remembered preference stays as it was
>
> — `spec.md §5, AC-09, verbatim`

### AC-11 (US-04) — happy path

> **Given** a person with a remembered preference
> **When** the person sets it in Settings to ask, rendered page or source
> **Then** the next click on an HTML link follows the new value, also after Dodaios restarts
>
> — `spec.md §5, AC-11, verbatim`

## Checklist

- [x] Mark HTML links and chips with their path; offer Show source or Open in Chrome in the context menu.
- [x] Add the three-value control to Settings (confirm the section next to appearance).
- [x] Add texts to every catalog.

## Edge cases

| Case | Behaviour |
|---|---|
| Remote viewer | No open-in-browser entry |
| Keyboard use | The action is reachable without a mouse |

## Definition of Done

- [x] Tests show the preference unchanged after the secondary action and changed by Settings.
- [x] every Hard Rule inlined above still holds
- [x] lint + type checks clean
