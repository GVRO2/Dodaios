---
id: T6
title: "Ask how to open HTML on the first click"
layer: "ui"
deps: ["T5"]
blocks: ["T8"]
acs: ["AC-01", "AC-02", "AC-03", "AC-04"]
files_hint: ["dodaios/ui/web/frontend/src/components/agentic/threads/HtmlOpenDialog.tsx", "dodaios/ui/web/frontend/src/components/agentic/threads/openHtmlLink.ts", "dodaios/ui/web/frontend/src/i18n/locales"]
owner: "GVRO"
estimate: "S"
context_budget: "M"
status: "done"
step: ""
---

# T6 — Ask how to open HTML on the first click

## Place in the sequence

- **Blocked by:** T5 — Route an HTML link click by preference and result · **Blocks:** T8 — Run the acceptance checks in the Dev app.
- **Lane:** shares files with T4, T5, T7 — serialized.

## Why (user story)

> **As a** person
> **I want** to be asked the first time I click an HTML link
> **So that** the app does what I expect from then on
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

The question and the saving of its answer.

## Inlined context

> Show the question naming the file and folder and saying that scripts will run. Closing it ends the click; a choice is saved first. A choice is remembered even when opening fails.
>
> — `sad.md §5 step 4 and spec.md §1, abridged`

**Fallback:** insufficient or contradicted by the code → read [spec.md](../spec.md), [sad.md](../sad.md) and [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Calls the preference change route of T1.

— `sad.md §5-§6, abridged`; there is no openapi.yaml for this feature.

## Acceptance criteria

### AC-01 (US-01) — happy path

> **Given** a person who has no opening preference and an answer with an HTML link to an existing file
> **When** the person clicks the link and chooses Google Chrome
> **Then** the question has named the file and its folder and said that the page's scripts will run in the browser, the rendered page opens in Google Chrome and the choice is remembered
>
> — `spec.md §5, AC-01, verbatim`

### AC-02 (US-01) — happy path

> **Given** a person who has no opening preference
> **When** the person clicks an HTML link and chooses the source
> **Then** the source view opens in the side panel and the choice is remembered
>
> — `spec.md §5, AC-02, verbatim`

### AC-03 (US-01) — domain invariant violation

> **Given** the rule that nothing opens before the person chooses
> **When** the person closes the question without choosing
> **Then** no page and no source open, nothing is remembered, and the next click asks again
>
> — `spec.md §5, AC-03, verbatim`

### AC-04 (US-01) — authorization

> **Given** an answer with an HTML link
> **When** the answer arrives, the conversation is reopened or the link is only hovered
> **Then** nothing opens, because only the person's own click may open a page
>
> — `spec.md §5, AC-04, verbatim`

## Checklist

- [x] Add the dialog with the app's existing dialog parts.
- [x] Wire it to the ask value; save, then continue the click.
- [x] Add texts to every catalog.

## Edge cases

| Case | Behaviour |
|---|---|
| Dialog dismissed | Nothing opens, nothing saved |
| Saving fails | Open this once and say the choice was not saved |

## Definition of Done

- [x] Component tests cover both choices, dismissal and that no click means no opening.
- [x] every Hard Rule inlined above still holds
- [x] lint + type checks clean
