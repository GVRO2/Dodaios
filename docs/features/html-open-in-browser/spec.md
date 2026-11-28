---
status: Draft
owner: "GVRO"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-11-27"
feature_size: "S"
---

# Spec — html-open-in-browser

> **Glossary:** [CONTEXT](./CONTEXT.md)
> **Reference module / docs / channels used:** the chat link rendering, the side panel's File tab, the code editor's static preview and the existing "open on this computer" action, all read at commit `162478613`; the owner's report with a screenshot.

## 1. Context

When an answer in a thread links an HTML file, often a report or a comparison page the agent has just made for the person to look at, a click opens the file's markup as text in the side panel. The person asked to look at a page and gets its code. To see it, they have to find the file in a folder and open it by hand.

The owner reported this on 2026-11-27 from a real thread: the agent asked them to open a page and compare images with the original documents, and the click showed one long block of markup.

The committed approach: the first time a person clicks an HTML link, Dodaios asks whether to open the rendered page in Google Chrome or show the source, remembers the answer and lets the person change it in Settings. Where Google Chrome is missing, the system's default web browser is used and the person is told.

Today the side panel opens every text file as editable text. Dodaios already has three neighbouring behaviours that this feature does not replace: a static preview inside the code editor, a page drawn inside an answer when the agent explicitly shows it, and a general "open on this computer" action that follows whatever application the system associates with the file, which is not always a web browser.

Decisions taken by the owner: ask on the first click; fall back to the default browser without Chrome. Assumptions taken during specification, open to veto:

- The other view stays reachable from a secondary action on each HTML link.
- A link that names a line number opens the source view, because it points at code.
- A remote viewer gets the static preview and the source view, because Dodaios cannot open a browser on their device through the host.
- Closing the question without answering opens nothing and remembers nothing.
- There is one opening preference per installation, not one per project or thread.
- A choice is remembered even when opening the page then fails.
- "On the computer where it runs" means the same as for the existing "open on this computer" actions.

Decisions taken by the owner during clarification, 2026-11-27: one preference also covers files outside the thread's project folder, with no extra confirmation; the terminal is not covered; the change ships in the owner's fork only.

## 2. Goals

- A person who has chosen the rendered page sees a linked HTML file as a page with a single click.
- The person stays in control: nothing opens in a browser until they choose it, and the source stays reachable.
- The behaviour is honest on every supported operating system and on setups with no local browser: it never fails silently.

## 3. Non-goals

- Changing how the file tree, the code editor, the terminal or the work log open HTML files: those clicks mean inspecting or editing.
- Running a page's scripts inside Dodaios: the web browser is the place where a page runs, apart from the app.
- Changing how other file types or web links open: the report is about local HTML files only.
- Controlling the browser (profile, tabs, windows) or hosting and sharing the page: opening the file is the whole job.

## 4. User stories

### US-01: Choose how HTML links open

**As a** person
**I want** to be asked the first time I click an HTML link
**So that** the app does what I expect from then on

### US-02: See the page in one click

**As a** person
**I want** an HTML link to open the rendered page in Google Chrome
**So that** I can read the page the agent made without looking for the file

### US-03: Still read the source

**As a** person
**I want** to reach the source view of the same link
**So that** I can inspect or edit the markup when I need to

### US-04: Change my mind later

**As a** person
**I want** to change the opening preference in Settings
**So that** a first choice is never permanent

### US-05: Not be stuck without Chrome

**As a** person without Google Chrome
**I want** the page to open in another web browser and to be told
**So that** I still see it and know why it is not Chrome

### US-06: Look at a page from another device

**As a** remote viewer
**I want** to see the linked page without anything opening on the computer running Dodaios
**So that** I can read it from where I am

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** a person who has no opening preference and an answer with an HTML link to an existing file
**When** the person clicks the link and chooses Google Chrome
**Then** the question has named the file and its folder and said that the page's scripts will run in the browser, the rendered page opens in Google Chrome and the choice is remembered

### AC-02 (US-01) — happy path

**Given** a person who has no opening preference
**When** the person clicks an HTML link and chooses the source
**Then** the source view opens in the side panel and the choice is remembered

### AC-03 (US-01) — domain invariant violation

**Given** the rule that nothing opens before the person chooses
**When** the person closes the question without choosing
**Then** no page and no source open, nothing is remembered, and the next click asks again

### AC-04 (US-01) — authorization

**Given** an answer with an HTML link
**When** the answer arrives, the conversation is reopened or the link is only hovered
**Then** nothing opens, because only the person's own click may open a page

### AC-05 (US-02) — happy path

**Given** a person whose opening preference is the rendered page
**When** the person clicks an HTML link
**Then** the page opens in Google Chrome without a question and without showing its source, also when the file is outside the thread's project folder, and the pictures and local links the page refers to work as when the file is opened from its folder

### AC-06 (US-02) — error

**Given** an HTML link whose file does not exist
**When** the person clicks it
**Then** no browser opens, no question is asked, and the person is told the file was not found and where it was looked for

### AC-07 (US-02) — cross-context

**Given** a thread working in a project folder and an HTML link that names the file relative to some folder
**When** the person clicks the link
**Then** the file is found by the same rules as other file links in that thread, and when no single file matches, no guessed file is opened

### AC-08 (US-02) — domain invariant violation

**Given** the rule that only a real HTML file is handed to the web browser
**When** a link's words name an HTML file but its target is a program or any other kind of file
**Then** the target is treated by its real kind, never opened as a page and never run

### AC-09 (US-03) — happy path

**Given** a person with either remembered preference
**When** the person uses the secondary action on an HTML link to open the other view
**Then** that view opens for this click and the remembered preference stays as it was

### AC-10 (US-03) — happy path

**Given** an HTML link that names a line number
**When** the person clicks it
**Then** the source view opens at that line, whatever the preference is

### AC-11 (US-04) — happy path

**Given** a person with a remembered preference
**When** the person sets it in Settings to ask, rendered page or source
**Then** the next click on an HTML link follows the new value, also after Dodaios restarts

### AC-12 (US-05) — cross-context

**Given** a computer where Google Chrome is not installed and another web browser is
**When** the person chooses or has chosen the rendered page and clicks an HTML link
**Then** the page opens in the default web browser, never in a text or code editor, and on each such click a notice that does not block says that Google Chrome was not found; on Linux, Chromium counts as Google Chrome

### AC-13 (US-05) — error

**Given** a computer where no web browser can be opened
**When** the person clicks an HTML link and asks for the rendered page
**Then** the person is told the page could not be opened, is offered the static preview and the source view, and the choice stays remembered

### AC-14 (US-06) — authorization

**Given** a remote viewer of a conversation with an HTML link
**When** the remote viewer clicks it
**Then** nothing opens on the computer running Dodaios, no browser choice is offered, and the remote viewer sees the static preview with access to the source view

### AC-15 (US-06) — error

**Given** a remote viewer looking at a static preview of a page that depends on scripts or on local pictures
**When** the preview is drawn
**Then** the remote viewer is told that the preview is partial, instead of seeing an unexplained blank or broken page

### AC-16 (US-02) — domain invariant violation

**Given** the rule that a file on another machine on the network is never opened as a page
**When** the person clicks an HTML link to such a file
**Then** no browser opens, the source view is shown if the file can be read, and the person is told why the page was not opened

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Time from click to the page being handed to the browser (browser start excluded), p95 | ≤ 1000 ms | timed over 20 clicks on a local file |
| Platform coverage of AC-01 to AC-13 and AC-16 | 3 of 3 (Windows, macOS, Linux with a screen) | automated tests per platform branch, plus one manual run on Windows |
| Server with no screen | 0 crashes and 0 attempts to open a browser on the server | automated test of AC-14 |
| Preference persistence | 100% kept across restarts | automated test |
| Languages | 100% of new texts in every supported locale | locale completeness gate |

Throughput and availability: not applicable, a single local action started by a click.

## 6.1 Security / privacy

- **Data classification:** confidential. A linked page can hold private data of the person; this feature moves nothing off the computer.
- **Personal data touched:** none new. Only the opening preference is stored.
- **AuthZ/AuthN impact:** opening a local file in a browser is allowed only for a person on the computer running Dodaios, and only from their own click.
- **Abuse cases:**
  - A page written by an agent, cloned or downloaded runs its scripts once opened in the browser: the first-click question says so in plain words, and a remembered choice never opens anything without a click.
  - A link disguised with a harmless-looking label: the question and the link's hover text name the real file and folder.
  - A link to a program or script dressed up as a page: refused, never run (AC-08).
  - A link to a file on another machine on the network: not opened in the browser.
  - A remote viewer trying to make the host open pages: denied, and no browser option is shown (AC-14).
  - Repeated clicks: one opening per click, with repeats within 1 second of the same link ignored.
- **Security review:** Required. The feature lets a click in a model-written answer start a web browser on a local file.

## 7. Metrics / KPIs

Dodaios sends no usage telemetry for this, so each KPI is checked by hand or by tests.

- **Actions needed to see a linked page** — baseline: find the file in a folder and open it by hand, several actions; target: 1 click once the preference is set, at release.
- **HTML link clicks that show raw markup to a person who chose the rendered page** — baseline: every click; target: 0 in the acceptance run, at release.
- **Silent failures (a click with no visible result)** — baseline: not measured, to be recorded in the first acceptance run; target: 0 across all acceptance criteria, at release.

## 8. Open questions

None. The four questions raised during specification were resolved on 2026-11-27 and are reflected above.
