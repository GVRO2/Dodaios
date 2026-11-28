# Tracker — html-open-in-browser

> Status: `todo` · `in_progress` · `blocked` · `review` · `done`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status | Step |
|---|---|---|---|---|---|---|---|
| T1 | Store and expose the HTML opening preference | app | GVRO | S | — | done | — |
| T2 | Check an HTML file and start a browser on it | infra | GVRO | M | — | done | — |
| T3 | Add the availability and open routes for HTML pages | ports | GVRO | S | T2 | done | — |
| T4 | Show a static preview of HTML in the side panel | ui | GVRO | M | — | done | — |
| T5 | Route an HTML link click by preference and result | ui | GVRO | M | T1, T3, T4 | done | — |
| T6 | Ask how to open HTML on the first click | ui | GVRO | S | T5 | done | — |
| T7 | Add the other-view action and the Settings control | ui | GVRO | M | T5 | done | — |
| T8 | Run the acceptance checks in the Dev app | tests | GVRO | S | T6, T7 | review | GATE — click timing not measured, criteria not checked one by one |

**Total:** 8 tasks.
