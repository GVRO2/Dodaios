# Acceptance record — html-open-in-browser

Date: 2026-11-28. Base: `162478613`. Branch: `claude/html-open-in-browser`.

**Desktop check:** on 2026-11-28 the owner tried this build in the Dev app on Windows and
reported that it worked. The report did not say which criteria were exercised, so none is
marked as verified one by one. Every "test" below is an automated test with the browser
start and the backend answers faked.

| Criterion | Covered by | Not verified |
|---|---|---|
| AC-01 to AC-03 first-click question | `openHtmlLink.test.tsx` | look and placement of the dialog in the desktop window |
| AC-04 nothing opens without a click | by construction: only the click handler calls the opener | no dedicated test that rendering an answer calls nothing |
| AC-05 rendered page | click and launcher tests | a real browser showing a page with pictures and `file:` links |
| AC-06, AC-07 missing and ambiguous files | click and lookup tests | |
| AC-08 only a real HTML file | `test_open_html.py`, `test_agentic_ide_html_routes.py` | the symbolic link case is skipped without the right to create links |
| AC-09, AC-10 other view, line numbers | `htmlPageMenu.test.tsx`, click tests | keyboard access to the menu |
| AC-11 Settings | `HtmlLinkRow.test.tsx`, `test_html_link_preference.py` | |
| AC-12 without Chrome | launcher tests per system, click test | a computer without Chrome |
| AC-13 no browser | launcher and click tests | |
| AC-14, AC-15 remote viewer, static preview | route tests, `HtmlStaticPreview.test.tsx` | a real second device |
| AC-16 network file | launcher and click tests | a real network share |

Other targets: the 1000 ms p95 from click to hand-off was not measured. macOS and Linux
were covered by tests only. On this Windows computer Chrome is found in its standard
install location (read-only check, nothing was opened).

Test runs: selected Python tests 16853 passed, 33 failed; one failure was this change's
(the recorded route order, now updated) and the other 32 also fail on a clean copy of the
base. Frontend 9010 passed, 8 failed; 5 also fail on the untouched main checkout and 3
pass when run alone. Static gates pass except `shell-bash32`, which needs a macOS bash or
Docker.
