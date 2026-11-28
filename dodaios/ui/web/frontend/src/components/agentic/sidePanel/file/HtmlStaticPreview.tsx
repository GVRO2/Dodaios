import { useT } from "@/i18n";

/**
 * The rules a previewed page runs under: no script, no request of any kind.
 * Inline styles and pictures carried inside the page are all it may use.
 */
const GUARD = "<meta http-equiv=\"Content-Security-Policy\" "
  + "content=\"default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:\">"
  // The frame may open no window, so this also keeps a link from leaving the preview.
  + "<base target=\"_blank\">";

/**
 * The page with the guard ahead of everything it brings. A doctype stays first,
 * or the browser would draw the page in its old compatibility mode.
 */
export function staticPreviewDocument(html: string): string {
  const doctype = /^﻿?\s*<!doctype[^>]*>/i.exec(html)?.[0] ?? "";
  return `${doctype}${GUARD}${html.slice(doctype.length)}`;
}

/** An HTML file drawn inside the app when no web browser can show it. */
export function HtmlStaticPreview({ name, text }: { name: string; text: string }) {
  const t = useT();
  return <div className="flex h-full min-h-0 flex-col">
    <p className="border-b border-border px-3 py-2 text-xs text-muted-foreground">{t("ide_side_panel.file.preview_partial")}</p>
    <iframe data-testid="side-file-preview-frame" title={name} sandbox="" referrerPolicy="no-referrer"
      srcDoc={staticPreviewDocument(text)} className="min-h-0 w-full flex-1 border-0 bg-white" />
  </div>;
}
