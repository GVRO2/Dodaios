---
id: T3
title: "Add the availability and open routes for HTML pages"
layer: "ports"
deps: ["T2"]
blocks: ["T5"]
acs: ["AC-08", "AC-13", "AC-14", "AC-16"]
files_hint: ["dodaios/ui/web/agentic_ide_html_routes.py", "dodaios/ui/web/server_parts/app_setup.py"]
owner: "GVRO"
estimate: "S"
context_budget: "M"
status: "done"
step: ""
---

# T3 — Add the availability and open routes for HTML pages

## Place in the sequence

- **Blocked by:** T2 — Check an HTML file and start a browser on it · **Blocks:** T5 — Route an HTML link click by preference and result.
- **Lane:** own lane.

## Why (user story)

> **As a** person
> **I want** an HTML link to open the rendered page in Google Chrome
> **So that** I can read the page the agent made without looking for the file
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

The only way the interface can ask for a page to be opened.

## Inlined context

> Authorization: loopback client and host, plus native file actions enabled, as for terminal-path opening. Log the outcome and browser, not the full path.
>
> — `sad.md §8, abridged`

> A new action takes a workspace and a path, checks locality, kind and location, and starts a browser program.
>
> — `adr/0002, option 1, abridged`

**Fallback:** insufficient or contradicted by the code → read [spec.md](../spec.md), [sad.md](../sad.md) and [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

`GET /api/agentic-ide/html-page/availability` answers whether this client may open a browser. `POST /api/agentic-ide/html-page/open` takes `workspace_id` and `target`, and answers which browser took it or a reason code.

— `sad.md §5-§6, abridged`; there is no openapi.yaml for this feature.

## Acceptance criteria

### AC-08 (US-02) — domain invariant violation

> **Given** the rule that only a real HTML file is handed to the web browser
> **When** a link's words name an HTML file but its target is a program or any other kind of file
> **Then** the target is treated by its real kind, never opened as a page and never run
>
> — `spec.md §5, AC-08, verbatim`

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

- [x] Create the route module, reusing the workspace folder and launch-target resolution of the terminal routes.
- [x] Register the router (confirm where the IDE router is registered).
- [x] Test local, remote and headless clients.

## Edge cases

| Case | Behaviour |
|---|---|
| Remote client | Refused; nothing starts |
| Path outside any grant | One generic unavailable answer |
| No browser | Reason code none |

## Definition of Done

- [x] Route tests prove a remote or headless client starts nothing and each reason code is returned.
- [x] every Hard Rule inlined above still holds
- [x] lint + type checks clean
