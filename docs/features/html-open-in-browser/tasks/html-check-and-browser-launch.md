---
id: T2
title: "Check an HTML file and start a browser on it"
layer: "infra"
deps: []
blocks: ["T3"]
acs: ["AC-08", "AC-12", "AC-16"]
files_hint: ["dodaios/platform/open_path.py"]
owner: "GVRO"
estimate: "M"
context_budget: "M"
status: "done"
step: ""
---

# T2 — Check an HTML file and start a browser on it

## Place in the sequence

- **Blocked by:** nothing · **Blocks:** T3 — Add the availability and open routes for HTML pages.
- **Lane:** own lane.

## Why (user story)

> **As a** person without Google Chrome
> **I want** the page to open in another web browser and to be told
> **So that** I still see it and know why it is not Chrome
>
> — `spec.md §4, US-05, verbatim` · full text: [spec.md](../spec.md)

The safe, per-system hand-off of one local file to a browser.

## Inlined context

> Only a local regular file ending in .html or .htm, after links in the file system are followed, reaches a browser. A network share or a mapped network drive is a network file.
>
> — `sad.md §10 QG-1, abridged`

> Windows: Chrome from its install locations, then the default web browser's program, then other known browsers. macOS: Google Chrome by application name, then others. Linux: Chrome or Chromium on the path, then the desktop's default browser, then others. The system's association for HTML files is never followed.
>
> — `sad.md §5, Browser choice per system, abridged`

> Do not widen `open_url`: it stays limited to web addresses.
>
> — `adr/0002, Decision outcome, abridged`

**Fallback:** insufficient or contradicted by the code → read [spec.md](../spec.md), [sad.md](../sad.md) and [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-08 (US-02) — domain invariant violation

> **Given** the rule that only a real HTML file is handed to the web browser
> **When** a link's words name an HTML file but its target is a program or any other kind of file
> **Then** the target is treated by its real kind, never opened as a page and never run
>
> — `spec.md §5, AC-08, verbatim`

### AC-12 (US-05) — cross-context

> **Given** a computer where Google Chrome is not installed and another web browser is
> **When** the person chooses or has chosen the rendered page and clicks an HTML link
> **Then** the page opens in the default web browser, never in a text or code editor, and on each such click a notice that does not block says that Google Chrome was not found; on Linux, Chromium counts as Google Chrome
>
> — `spec.md §5, AC-12, verbatim`

### AC-16 (US-02) — domain invariant violation

> **Given** the rule that a file on another machine on the network is never opened as a page
> **When** the person clicks an HTML link to such a file
> **Then** no browser opens, the source view is shown if the file can be read, and the person is told why the page was not opened
>
> — `spec.md §5, AC-16, verbatim`

## Checklist

- [x] Add the file check returning a reason code (not found, not HTML, network file).
- [x] Add the launcher returning chrome, default or none; pass the file as a `file:` address, argument list, no shell, no-window flag.
- [x] Cover each system branch with tests that fake the process start.

## Edge cases

| Case | Behaviour |
|---|---|
| Symbolic link named .html pointing at a program | Refused as not HTML |
| No display | Returns none, starts nothing |
| Path with spaces, `#` or `%` | Correctly encoded in the address |

## Definition of Done

- [x] Tests pass for the three system branches, the refusals and the no-display case.
- [x] every Hard Rule inlined above still holds
- [x] lint + type checks clean
