import { translate } from "@/i18n";
import { canOpenHtmlPage, fetchHtmlLinkMode, openHtmlPage, saveHtmlLinkMode } from "@/lib/htmlPageApi";
import { useEventStore } from "@/store/events";
import { askHowToOpenHtml } from "@/store/htmlOpenQuestion";
import { absoluteFilePath, useSideFileStore } from "@/store/sideFile";
import { locatePath, openPathBeside } from "./openPathBeside";

/** A repeat of the same file sooner than this is the same click. */
const REPEAT_MS = 1000;
const openedAt = new Map<string, number>();

const notify = (kind: "info" | "warning", key: string) =>
  useEventStore.getState().pushToast(kind, translate(`html_link.${key}`));

/**
 * A click on an HTML file an answer names: the rendered page in a web browser,
 * or its source, as the person chose; a static preview where no browser can be
 * opened. `view` is the link's "other view" action: it applies once and leaves
 * the choice as it was.
 *
 * Only a click calls this.
 */
export async function openHtmlLink(path: string, folder: string, view?: "browser" | "source"): Promise<void> {
  if (view === "source") return openPathBeside(path, folder);
  const found = await locatePath(path, folder);
  // Missing, or a folder with such a name: the side panel says what it is.
  if (found.kind !== "file") return openPathBeside(path, folder);

  const show = (preview = false) => useSideFileStore.getState()
    .show({ path: found.shown, folder, diff: null, ...(preview ? { preview: true } : {}) });
  if (!(await canOpenHtmlPage())) return show(true);

  let choice = view ?? await fetchHtmlLinkMode() ?? "ask";
  if (choice === "ask") {
    const answered = await askHowToOpenHtml(absoluteFilePath(found.shown, folder));
    if (!answered) return;
    if (!(await saveHtmlLinkMode(answered))) notify("warning", "save_failed");
    choice = answered;
  }
  if (choice === "source") return show();

  const key = `${found.workspaceId}:${found.target}`;
  if (Date.now() - (openedAt.get(key) ?? 0) < REPEAT_MS) return;
  openedAt.set(key, Date.now());

  const result = await openHtmlPage(found.workspaceId, found.target);
  if (result?.opened === "chrome") return;
  if (result?.opened === "default") {
    notify("info", "not_chrome");
    return;
  }
  if (result?.reason === "network-file" || result?.reason === "not-html") {
    notify("warning", result.reason === "network-file" ? "network_file" : "not_a_page");
    return show();
  }
  notify("warning", "open_failed");
  show(true);
}
