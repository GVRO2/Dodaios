import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HtmlLinkRow } from "./HtmlLinkRow";

const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("the HTML links setting", () => {
  it("shows the remembered choice and saves another one", async () => {
    const saved: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method !== "PUT") return json({ mode: "browser" });
      const mode = JSON.parse(String(init.body)).mode as string;
      saved.push(mode);
      return json({ mode });
    }));
    render(<HtmlLinkRow />);
    const chosen = (name: string) => screen.getByRole("radio", { name }).getAttribute("aria-checked");
    await waitFor(() => expect(chosen("Browser")).toBe("true"));
    fireEvent.click(screen.getByRole("radio", { name: "Ask" }));
    await waitFor(() => expect(saved).toEqual(["ask"]));
    expect(chosen("Ask")).toBe("true");
  });
});
