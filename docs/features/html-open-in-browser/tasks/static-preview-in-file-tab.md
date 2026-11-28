---
id: T4
title: "Show a static preview of HTML in the side panel"
layer: "ui"
deps: []
blocks: ["T5"]
acs: ["AC-13", "AC-15"]
files_hint: ["dodaios/ui/web/frontend/src/components/agentic/sidePanel/file/FileTab.tsx", "dodaios/ui/web/frontend/src/components/agentic/editor/FileViewers.tsx", "dodaios/ui/web/frontend/src/store/sideFile.ts", "dodaios/ui/web/frontend/src/i18n/locales"]
owner: "GVRO"
estimate: "M"
context_budget: "S"
status: "done"
step: ""
---

# T4 — Show a static preview of HTML in the side panel

## Place in the sequence

- **Blocked by:** nothing · **Blocks:** T5 — Route an HTML link click by preference and result.
- **Lane:** shares files with T5, T6, T7 — serialized.

## Why (user story)

> **As a** remote viewer
> **I want** to see the linked page without anything opening on the computer running Dodaios
> **So that** I can read it from where I am
>
> — `spec.md §4, US-06, verbatim` · full text: [spec.md](../spec.md)

What a person sees when the rendered page cannot be opened.

## Inlined context

> The frame runs no scripts and gets a content policy that blocks every network request; a banner says the preview is partial.
>
> — `sad.md §5, Static preview, abridged`

> Reuse the existing script-less frame of the code editor preview; the source stays one tab away. Every new text goes into all five locale catalogs.
>
> — `sad.md §5 and §8, abridged`

**Fallback:** insufficient or contradicted by the code → read [spec.md](../spec.md), [sad.md](../sad.md) and [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-13 (US-05) — error

> **Given** a computer where no web browser can be opened
> **When** the person clicks an HTML link and asks for the rendered page
> **Then** the person is told the page could not be opened, is offered the static preview and the source view, and the choice stays remembered
>
> — `spec.md §5, AC-13, verbatim`

### AC-15 (US-06) — error

> **Given** a remote viewer looking at a static preview of a page that depends on scripts or on local pictures
> **When** the preview is drawn
> **Then** the remote viewer is told that the preview is partial, instead of seeing an unexplained blank or broken page
>
> — `spec.md §5, AC-15, verbatim`

## Checklist

- [x] Let the side file request ask for the preview view.
- [x] Add Preview and Source tabs for HTML opened that way, with the banner.
- [x] Add the content policy to the preview document; add texts to every catalog.

## Edge cases

| Case | Behaviour |
|---|---|
| Page that needs scripts or local pictures | Banner explains; source reachable |
| File too large or unreadable | Existing notice |

## Definition of Done

- [x] Component tests show no scripts, the blocking policy, the banner and the source tab.
- [x] every Hard Rule inlined above still holds
- [x] lint + type checks clean
