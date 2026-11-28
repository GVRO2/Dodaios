---
status: Accepted
owner: "GVRO"
reviewers: []
updated_at: "2026-11-27"
feature_size: "S"
ticket: "none"
---

# 0001 — Open the linked file from disk in a real browser

- **Status:** Accepted
- **Date:** 2026-11-27
- **Deciders:** the agent, at the "easy" depth the owner chose; open to veto

## Context

An HTML page an agent writes usually refers to pictures and other files next to it, sometimes by `file:` addresses. The person wants to see it rendered in Google Chrome.

## Decision drivers

- Spec AC-05: pictures and local links work as when the file is opened from its folder.
- Spec §6.1: nothing leaves the computer.

## Considered options

1. **Hand the file itself to the browser** — it renders exactly as a double click would.
2. **Serve the page and its folder from the Dodaios web server** — one address for local and remote use, but a browser does not follow `file:` links from a served page, and a folder route exposes neighbouring files and runs page scripts on the app's own origin unless a second origin is added.

## Decision outcome

**Chosen:** option 1. It is the only one that meets AC-05 without new exposure.

## Consequences

**Positive**
- No new route serves file contents; page scripts get no access to the app's origin.

**Negative**
- A remote viewer cannot get the rendered page, only the static preview.

**Neutral**
- Serving pages to remote viewers can be added later on a separate origin.

## Links

- Spec: [spec](../spec.md)
- SAD: [sad](../sad.md) §4
- Related ADR: [0002](./0002-add-a-narrow-action-that-opens-only-html-pages.md)
