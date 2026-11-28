import { create } from "zustand";

/** The pending "Chrome or source?" question about one clicked HTML file. */
export interface HtmlOpenQuestion {
  name: string;
  folder: string;
  answer: (choice: "browser" | "source" | null) => void;
}

export const useHtmlOpenQuestion = create<{ question: HtmlOpenQuestion | null }>(() => ({ question: null }));

/** Ask about `path`; null when the person closes the question. A newer click replaces an open one. */
export function askHowToOpenHtml(path: string): Promise<"browser" | "source" | null> {
  const cut = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  useHtmlOpenQuestion.getState().question?.answer(null);
  return new Promise((resolve) => {
    const question: HtmlOpenQuestion = {
      name: path.slice(cut + 1),
      folder: cut < 0 ? "" : path.slice(0, cut),
      answer: (choice) => {
        if (useHtmlOpenQuestion.getState().question === question) useHtmlOpenQuestion.setState({ question: null });
        resolve(choice);
      },
    };
    useHtmlOpenQuestion.setState({ question });
  });
}
