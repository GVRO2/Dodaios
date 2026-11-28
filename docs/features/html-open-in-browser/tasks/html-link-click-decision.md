---
id: T5
title: "Route an HTML link click by preference and result"
layer: "ui"
deps: ["T1", "T3", "T4"]
blocks: ["T6", "T7"]
acs: ["AC-05", "AC-06", "AC-07", "AC-10", "AC-12", "AC-13", "AC-14", "AC-16"]
files_hint: ["dodaios/ui/web/frontend/src/components/agentic/threads/openHtmlLink.ts", "dodaios/ui/web/frontend/src/components/agentic/threads/openPathBeside.ts", "dodaios/ui/web/frontend/src/components/agentic/threads/ThreadTimeline.tsx", "dodaios/ui/web/frontend/src/i18n/locales"]
owner: "GVRO"
estimate: "M"
context_budget: "M"
status: "done"
step: ""
---

# T5 — Route an HTML link click by preference and result

## Place in the sequence

- **Blocked by:** T1 — Store and expose the HTML opening preference, T3 — Add the availability and open routes for HTML pages, T4 — Show a static preview of HTML in the side panel · **Blocks:** T6 — Ask how to open HTML on the first click, T7 — Add the other-view action and the Settings control.
- **Lane:** shares files with T4, T6, T7 — serialized.

## Why (user story)

> **As a** person
> **I want** an HTML link to open the rendered page in Google Chrome
> **So that** I can read the page the agent made without looking for the file
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

The click that shows the page instead of its markup.

## Inlined context

> Line number: source. File not found: side panel says so. Cannot open here: static preview. Preference source: side panel. browser: call open, ignoring a repeat of the same file within 1 second. Not Chrome: notice. None: notice and preview. Network file: source and reason.
>
> — `sad.md §5, What the click does, abridged`

> Time from click to hand-off, p95: ≤ 1000 ms.
>
> — `spec.md §6, abridged`

**Fallback:** insufficient or contradicted by the code → read [spec.md](../spec.md), [sad.md](../sad.md) and [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Calls the two routes of T3 and the preference routes of T1.

— `sad.md §5-§6, abridged`; there is no openapi.yaml for this feature.

## Acceptance criteria

### AC-05 (US-02) — happy path

> **Given** a person whose opening preference is the rendered page
> **When** the person clicks an HTML link
> **Then** the page opens in Google Chrome without a question and without showing its source, also when the file is outside the thread's project folder, and the pictures and local links the page refers to work as when the file is opened from its folder
>
> — `spec.md §5, AC-05, verbatim`

### AC-06 (US-02) — error

> **Given** an HTML link whose file does not exist
> **When** the person clicks it
> **Then** no browser opens, no question is asked, and the person is told the file was not found and where it was looked for
>
> — `spec.md §5, AC-06, verbatim`

### AC-07 (US-02) — cross-context

> **Given** a thread working in a project folder and an HTML link that names the file relative to some folder
> **When** the person clicks the link
> **Then** the file is found by the same rules as other file links in that thread, and when no single file matches, no guessed file is opened
>
> — `spec.md §5, AC-07, verbatim`

### AC-10 (US-03) — happy path

> **Given** an HTML link that names a line number
> **When** the person clicks it
> **Then** the source view opens at that line, whatever the preference is
>
> — `spec.md §5, AC-10, verbatim`

### AC-12 (US-05) — cross-context

> **Given** a computer where Google Chrome is not installed and another web browser is
> **When** the person chooses or has chosen the rendered page and clicks an HTML link
> **Then** the page opens in the default web browser, never in a text or code editor, and on each such click a notice that does not block says that Google Chrome was not found; on Linux, Chromium counts as Google Chrome
>
> — `spec.md §5, AC-12, verbatim`

### AC-13 (US-05) — error

> **Given** a computer where no web browser can be opened
> **When** the person clicks an HTML link and asks for the rendered page
> **Then** the person is told the page could not be opened, is offered the static preview and the source view, and the choice stays remembered
>
> — `spec.md §5, AC-13, verbatim`

### AC-14 (US-06) — authorization

> **Given** a remote viewer of a conversation with an HTML link
> **When** the remote viewer clicks it
> **Then** nothing opens on the computer running Dodaios, no browser choice is offered, and the remote viewer sees the static preview with access to the source view
>
> — `spec.md §5, AC-14, verbatim`

### AC-16 (US-02) — domain invariant violation

> **Given** the rule that a file on another machine on the network is never opened as a page
> **When** the person clicks an HTML link to such a file
> **Then** no browser opens, the source view is shown if the file can be read, and the person is told why the page was not opened
>
> — `spec.md §5, AC-16, verbatim`

## Checklist

- [x] Split the path lookup out of `openPathBeside` so both paths share it.
- [x] Add the decision function; branch to it from the thread's `openPath` for .html and .htm.
- [x] Until T6 lands, treat ask as source. Add notices to every catalog.

## Edge cases

| Case | Behaviour |
|---|---|
| Several files match the name | No guessed file is opened |
| Open call fails | Notice and static preview |

## Definition of Done

- [x] Unit tests cover every branch, including that rendering an answer calls nothing.
- [x] every Hard Rule inlined above still holds
- [x] lint + type checks clean
