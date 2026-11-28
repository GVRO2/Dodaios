---
id: T8
title: "Run the acceptance checks in the Dev app"
layer: "tests"
deps: ["T6", "T7"]
blocks: []
acs: ["AC-05", "AC-12"]
files_hint: ["docs/features/html-open-in-browser"]
owner: "GVRO"
estimate: "S"
context_budget: "S"
status: "review"
step: "GATE — click timing not measured, criteria not checked one by one"
---

# T8 — Run the acceptance checks in the Dev app

## Place in the sequence

- **Blocked by:** T6 — Ask how to open HTML on the first click, T7 — Add the other-view action and the Settings control · **Blocks:** nothing.
- **Lane:** own lane.

## Why (user story)

> **As a** person
> **I want** an HTML link to open the rendered page in Google Chrome
> **So that** I can read the page the agent made without looking for the file
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

Proof on a real Windows desktop.

## Inlined context

> Never run a branch in the person's own app; use the Dodaios Dev app. A frontend change is done only when visible in the running desktop app.
>
> — `AGENTS.md, abridged`

> Time 20 clicks on a local file: p95 ≤ 1000 ms.
>
> — `spec.md §6, abridged`

**Fallback:** insufficient or contradicted by the code → read [spec.md](../spec.md), [sad.md](../sad.md) and [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-05 (US-02) — happy path

> **Given** a person whose opening preference is the rendered page
> **When** the person clicks an HTML link
> **Then** the page opens in Google Chrome without a question and without showing its source, also when the file is outside the thread's project folder, and the pictures and local links the page refers to work as when the file is opened from its folder
>
> — `spec.md §5, AC-05, verbatim`

### AC-12 (US-05) — cross-context

> **Given** a computer where Google Chrome is not installed and another web browser is
> **When** the person chooses or has chosen the rendered page and clicks an HTML link
> **Then** the page opens in the default web browser, never in a text or code editor, and on each such click a notice that does not block says that Google Chrome was not found; on Linux, Chromium counts as Google Chrome
>
> — `spec.md §5, AC-12, verbatim`

## Checklist

- [ ] Build the frontend and run the repository gates.
- [ ] Click through a page with pictures and `file:` links; time 20 clicks.
- [ ] Record results and the baseline of silent failures next to the spec.

## Edge cases

| Case | Behaviour |
|---|---|
| Chrome missing cannot be reproduced | Say it was covered by tests only |

## Definition of Done

- [ ] A written result per acceptance criterion, stating what was not verified.
- [ ] every Hard Rule inlined above still holds
- [ ] lint + type checks clean
