import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEventStore } from "@/store/events";
import { useHtmlOpenQuestion } from "@/store/htmlOpenQuestion";
import { useIdeChatStore } from "@/store/ideChat";
import { useSideFileStore } from "@/store/sideFile";
import { isHtmlPath } from "@/components/agentchat/chatPaths";
import { HtmlOpenDialog } from "./HtmlOpenDialog";
import { openHtmlLink } from "./openHtmlLink";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

interface Server { canOpen?: boolean; mode?: string; opened?: string; reason?: string | null; found?: boolean; saves?: boolean }
let saved: string[];
let launched: string[];

function serve({ canOpen = true, mode = "browser", opened = "chrome", reason = null, found = true, saves = true }: Server = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    if (url.includes("/outside-files")) {
      return found ? json({ path: String(body.path).split("\\").pop(), kind: "file" }) : json({ detail: "x" }, 404);
    }
    if (url.includes("/typeahead?")) return json({ trigger: "@", truncated: false, items: [] });
    if (url.includes("/html-page/availability")) return json({ can_open: canOpen });
    if (url.includes("/html-page/open")) { launched.push(body.target); return json({ opened, reason }); }
    if (url.includes("/html-link-open")) {
      if (init?.method !== "PUT") return json({ mode });
      if (!saves) return json({ detail: "x" }, 500);
      saved.push(body.mode);
      return json({ mode: body.mode });
    }
    throw new Error(`unexpected ${url}`);
  }));
}

const shown = () => useSideFileStore.getState().file;
const notices = () => useEventStore.getState().toasts.map((toast) => toast.message).join(" | ");
// Each test names its own file: a repeat of the same file within a second is ignored on purpose.
let count = 0;
const nextPage = () => `page${++count}.html`;

beforeEach(() => {
  saved = [];
  launched = [];
  useSideFileStore.setState({ file: null, nonce: 0 });
  useHtmlOpenQuestion.setState({ question: null });
  useEventStore.setState({ toasts: [] });
  useIdeChatStore.setState({ workspace: { id: "w1", name: "Repo", path: "C:\\Repo" } });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("a click on an HTML link", () => {
  it("is only for files ending in .html or .htm", () => {
    expect([isHtmlPath("a.html"), isHtmlPath("C:\\x\\B.HTM"), isHtmlPath("a.html.bat"), isHtmlPath("html")])
      .toEqual([true, true, false, false]);
  });

  it("opens the browser without showing the source", async () => {
    serve();
    const page = nextPage();
    await openHtmlLink(page, "C:\\Repo");
    expect(launched).toEqual([page]);
    expect(shown()).toBeNull();
    expect(notices()).toBe("");
  });

  it("ignores a repeat of the same file within a second", async () => {
    serve();
    const page = nextPage();
    await openHtmlLink(page, "C:\\Repo");
    await openHtmlLink(page, "C:\\Repo");
    expect(launched).toEqual([page]);
  });

  it("shows the source when that is the remembered choice", async () => {
    serve({ mode: "source" });
    const page = nextPage();
    await openHtmlLink(page, "C:\\Repo");
    expect(launched).toEqual([]);
    expect(shown()).toEqual({ path: page, folder: "C:\\Repo", diff: null });
  });

  it("says a missing file is missing, without asking or opening", async () => {
    serve({ found: false, mode: "ask" });
    const page = nextPage();
    await openHtmlLink(page, "C:\\Repo");
    expect(useHtmlOpenQuestion.getState().question).toBeNull();
    expect(launched).toEqual([]);
    expect(shown()?.path).toBe(page);
  });

  it("shows a static preview where no browser can be opened, without asking", async () => {
    serve({ canOpen: false, mode: "ask" });
    const page = nextPage();
    await openHtmlLink(page, "C:\\Repo");
    expect(useHtmlOpenQuestion.getState().question).toBeNull();
    expect(launched).toEqual([]);
    expect(shown()).toEqual({ path: page, folder: "C:\\Repo", diff: null, preview: true });
  });

  it("says when another browser took the page", async () => {
    serve({ opened: "default" });
    await openHtmlLink(nextPage(), "C:\\Repo");
    expect(notices()).toContain("Google Chrome was not found");
  });

  it("falls back to the preview when no browser takes the page", async () => {
    serve({ opened: "none" });
    await openHtmlLink(nextPage(), "C:\\Repo");
    expect(notices()).toContain("could not be opened");
    expect(shown()?.preview).toBe(true);
  });

  it("shows the source and the reason for a file on another computer", async () => {
    serve({ opened: "none", reason: "network-file" });
    await openHtmlLink(nextPage(), "C:\\Repo");
    expect(notices()).toContain("on the network");
    expect(shown()).not.toBeNull();
    expect(shown()?.preview).toBeUndefined();
  });

  it("opens the other view once without changing the choice", async () => {
    serve({ mode: "browser" });
    const page = nextPage();
    await openHtmlLink(page, "C:\\Repo", "source");
    expect(shown()?.path).toBe(page);
    expect(launched).toEqual([]);
    serve({ mode: "source" });
    const other = nextPage();
    await openHtmlLink(other, "C:\\Repo", "browser");
    expect(launched).toEqual([other]);
    expect(saved).toEqual([]);
  });
});

describe("the first click", () => {
  async function click(server: Server = {}) {
    serve({ mode: "ask", ...server });
    render(<HtmlOpenDialog />);
    const page = nextPage();
    let done!: Promise<void>;
    act(() => { done = openHtmlLink(page, "C:\\Repo"); });
    await screen.findByRole("dialog");
    return { page, done };
  }

  it("names the file and folder, warns about scripts and opens nothing yet", async () => {
    const { page } = await click();
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain(page);
    expect(dialog.textContent).toContain("C:\\Repo");
    expect(dialog.textContent).toContain("scripts");
    expect(launched).toEqual([]);
    expect(shown()).toBeNull();
  });

  it("remembers Chrome and opens it", async () => {
    const { page, done } = await click();
    fireEvent.click(screen.getByRole("button", { name: "Open in Google Chrome" }));
    await act(() => done);
    expect(saved).toEqual(["browser"]);
    expect(launched).toEqual([page]);
  });

  it("remembers the source and shows it", async () => {
    const { page, done } = await click();
    fireEvent.click(screen.getByRole("button", { name: "Show source" }));
    await act(() => done);
    expect(saved).toEqual(["source"]);
    expect(shown()?.path).toBe(page);
    expect(launched).toEqual([]);
  });

  it("does nothing at all when dismissed", async () => {
    const { done } = await click();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await act(() => done);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect([saved, launched, shown()]).toEqual([[], [], null]);
  });

  it("still opens once when the choice cannot be saved, and says so", async () => {
    const { page, done } = await click({ saves: false });
    fireEvent.click(screen.getByRole("button", { name: "Open in Google Chrome" }));
    await act(() => done);
    expect(launched).toEqual([page]);
    expect(notices()).toContain("not saved");
  });
});
