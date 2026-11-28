import * as Dialog from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import { useHtmlOpenQuestion } from "@/store/htmlOpenQuestion";

/** The first click on an HTML link: open it in Chrome, or read its source. */
export function HtmlOpenDialog() {
  const t = useT();
  const question = useHtmlOpenQuestion((state) => state.question);
  if (!question) return null;
  return <Dialog.Root open onOpenChange={(open) => { if (!open) question.answer(null); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 grid w-[28rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 gap-3 rounded-lg border border-border bg-background p-4 text-foreground shadow-xl">
        <Dialog.Title className="text-sm font-medium">{t("html_link.title")}</Dialog.Title>
        <div className="min-w-0 text-sm">
          <p className="break-all font-medium">{question.name}</p>
          <p className="break-all text-xs text-muted-foreground">{question.folder}</p>
        </div>
        <Dialog.Description className="text-xs text-muted-foreground">{t("html_link.warning")}</Dialog.Description>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => question.answer("source")}>{t("html_link.show_source")}</Button>
          <Button size="sm" onClick={() => question.answer("browser")}>{t("html_link.open_chrome")}</Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
