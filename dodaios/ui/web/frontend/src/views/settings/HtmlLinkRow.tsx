import { useEffect, useState } from "react";

import { useT } from "@/i18n";
import { fetchHtmlLinkMode, saveHtmlLinkMode, type HtmlLinkMode } from "@/lib/htmlPageApi";
import { useEventStore } from "@/store/events";
import { SettingsRow, SettingsSegmented } from "@/views/settings/SettingsLayout";

const MODES: readonly HtmlLinkMode[] = ["ask", "browser", "source"];

/** How an HTML link in an answer opens; the first click's choice can be changed here. */
export function HtmlLinkRow() {
  const t = useT();
  const [mode, setMode] = useState<HtmlLinkMode | null>(null);
  useEffect(() => {
    let alive = true;
    void fetchHtmlLinkMode().then((saved) => { if (alive) setMode(saved); });
    return () => { alive = false; };
  }, []);

  async function choose(next: HtmlLinkMode) {
    const before = mode;
    setMode(next);
    if (await saveHtmlLinkMode(next)) return;
    setMode(before);
    useEventStore.getState().pushToast("error", t("html_link.save_failed"));
  }

  return (
    <SettingsRow
      title={t("html_link.setting_title")}
      description={t("html_link.setting_description")}
      control={
        <SettingsSegmented
          // No segment is marked until the saved choice is known.
          value={mode ?? ("" as HtmlLinkMode)}
          onChange={(next) => void choose(next)}
          ariaLabel={t("html_link.setting_title")}
          options={MODES.map((value) => ({ value, label: t(`html_link.mode_${value}`) }))}
        />
      }
    />
  );
}
