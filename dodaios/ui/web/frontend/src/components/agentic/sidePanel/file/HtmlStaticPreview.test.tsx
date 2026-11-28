import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIdeChatStore } from "@/store/ideChat";
import { useSideFileStore } from "@/store/sideFile";
import { FileTab } from "./FileTab";
import { staticPreviewDocument } from "./HtmlStaticPreview";

vi.mock("./FileEditor", () => ({
  default: (props: { text: string }) => <pre data-testid="side-file-editor">{props.text}</pre>,
}));

const PAGE = "<!doctype html><title>t</title><script>alert(1)</script><p>hello</p>";
const answer = (body: unknown) => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  useSideFileStore.setState({ file: null, nonce: 0 });
  useIdeChatStore.setState({ workspace: { id: "w1", name: "Repo", path: "C:/Repo" } });
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(answer({ workspace_id: "w1", path: "C:/demo/report.html", kind: "file" }))
    .mockResolvedValueOnce(answer({
      workspace_id: "w1", path: "C:/demo/report.html", text: PAGE, version: "v1", size: 10,
      encoding: "utf-8", eol: "\n", binary: false, too_large: false,
    })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("the static preview of an HTML page", () => {
  it("draws the page without scripts or network, says it is partial and keeps the source a tab away", async () => {
    act(() => useSideFileStore.getState().show({ path: "report.html", folder: "C:\demo", diff: null, preview: true }));
    render(<FileTab />);
    const frame = await screen.findByTestId("side-file-preview-frame");
    expect(frame.getAttribute("sandbox")).toBe("");
    expect(frame.getAttribute("srcdoc")).toContain("default-src 'none'");
    expect(screen.getByText(/Static preview/)).toBeTruthy();
    expect(screen.queryByTestId("side-file-editor")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "Source" }));
    expect((await screen.findByTestId("side-file-editor")).textContent).toBe(PAGE);
  });

  it("opens the source as before when no preview was asked for", async () => {
    act(() => useSideFileStore.getState().show({ path: "report.html", folder: "C:\demo", diff: null }));
    render(<FileTab />);
    await screen.findByTestId("side-file-editor");
    expect(screen.queryByTestId("side-file-preview-frame")).toBeNull();
  });
});

describe("the preview document", () => {
  it("puts the blocking policy before anything the page brings, keeping its doctype first", () => {
    const built = staticPreviewDocument(PAGE);
    expect(built.startsWith("<!doctype html><meta http-equiv=\"Content-Security-Policy\"")).toBe(true);
    expect(built.indexOf("Content-Security-Policy")).toBeLessThan(built.indexOf("<script>"));
    expect(built).toContain("<base target=\"_blank\">");
  });

  it("protects a page that has no doctype too", () => {
    expect(staticPreviewDocument("<img src=https://x/y.png>").indexOf("default-src 'none'")).toBeLessThan(80);
  });
});
