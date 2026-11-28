import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditContextMenu } from "@/components/EditContextMenu";
import { ChatMarkdown } from "./ChatMarkdown";
import { ChatPathOpener } from "./chatPaths";

const openHtmlLink = vi.fn();
vi.mock("@/components/agentic/threads/openHtmlLink", () => ({ openHtmlLink: (...args: unknown[]) => openHtmlLink(...args) }));

afterEach(() => {
  cleanup();
  openHtmlLink.mockClear();
});

const answer = (text: string) => render(<>
  <div data-thread-folder={"C:\\Repo"}>
    <ChatPathOpener.Provider value={vi.fn()}><ChatMarkdown text={text} /></ChatPathOpener.Provider>
  </div>
  <EditContextMenu />
</>);

describe("the other view of an HTML link", () => {
  it.each([
    ["a file named in code", "Open `docs/report.html` to compare."],
    ["a link", "Open [the report](docs/report.html) to compare."],
  ])("is offered on %s, for the thread's folder", async (_label, text) => {
    const { container } = answer(text);
    const link = container.querySelector("a")!;
    fireEvent.contextMenu(link, { clientX: 5, clientY: 5 });
    expect(screen.queryByRole("menuitem", { name: "Open link" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Open in Google Chrome" })).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Show source" }));
    await waitFor(() => expect(openHtmlLink).toHaveBeenCalledWith("docs/report.html", "C:\\Repo", "source"));
  });

  it("is not offered on other files", () => {
    const { container } = answer("See `docs/notes.md`.");
    expect(container.querySelector("[data-html-page]")).toBeNull();
  });
});
