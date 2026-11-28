---
status: Accepted
owner: "GVRO"
reviewers: []
updated_at: "2026-11-27"
feature_size: "S"
ticket: "none"
---

# 0002 — Add a narrow action that opens only HTML pages

- **Status:** Accepted
- **Date:** 2026-11-27
- **Deciders:** the agent, at the "easy" depth the owner chose; open to veto

## Context

The web opener refuses everything but web addresses, so that a crafted address can never launch a local file. The general "open on this computer" action follows the system's file association, which for HTML may be an editor.

## Decision drivers

- Spec AC-08 and AC-16: only a real local HTML file reaches a browser.
- Spec AC-12: never a text or code editor.
- Spec AC-14: a remote viewer opens nothing on the host.

## Considered options

1. **A new action that takes a workspace and a path**, checks locality, kind and location, and starts a browser program.
2. **Let the web opener accept `file:` addresses** — less code, but every caller of that opener gains the ability to open local files.

## Decision outcome

**Chosen:** option 1. The existing protection stays as it is, and the checks live next to the one caller that needs them.

## Consequences

**Positive**
- The locality and path rules of terminal-path opening are reused.

**Negative**
- One more route and one more per-system launch function to maintain.

**Neutral**
- The terminal can use the same action later.

## Links

- Spec: [spec](../spec.md)
- SAD: [sad](../sad.md) §4
- Related ADR: [0001](./0001-open-the-linked-file-from-disk-in-a-real-browser.md)
