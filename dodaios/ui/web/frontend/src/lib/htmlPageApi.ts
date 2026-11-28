/** How HTML links in answers open, and the backend door to a web browser. */

export type HtmlLinkMode = "ask" | "browser" | "source";

export interface HtmlPageOpened {
  opened: "chrome" | "default" | "none";
  reason: "not-found" | "not-html" | "network-file" | null;
}

const MODE_URL = "/api/settings/html-link-open";

/** The answer of one call, or null when it failed: every caller has a visible fallback. */
async function call<T>(url: string, method = "GET", body?: unknown): Promise<T | null> {
  try {
    // A plain read is a plain fetch, with no request options.
    const answer = body === undefined
      ? await fetch(url)
      : await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return answer.ok ? ((await answer.json()) as T) : null;
  } catch {
    return null;
  }
}

/** False for another device, a server with no screen, or when the question cannot be answered. */
export async function canOpenHtmlPage(): Promise<boolean> {
  return (await call<{ can_open: boolean }>("/api/agentic-ide/html-page/availability"))?.can_open === true;
}

export async function fetchHtmlLinkMode(): Promise<HtmlLinkMode | null> {
  return (await call<{ mode: HtmlLinkMode }>(MODE_URL))?.mode ?? null;
}

export async function saveHtmlLinkMode(mode: HtmlLinkMode): Promise<boolean> {
  return (await call(MODE_URL, "PUT", { mode })) !== null;
}

export function openHtmlPage(workspaceId: string, target: string): Promise<HtmlPageOpened | null> {
  return call<HtmlPageOpened>("/api/agentic-ide/html-page/open", "POST", { workspace_id: workspaceId, target });
}
