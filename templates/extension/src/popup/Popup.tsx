import { Badge, Switch, ThemeToggle } from "@codellyson/justui/react";
import { useEffect, useState } from "react";
import { sendToBackground, type Stats } from "@/lib/messages";

type Load = { state: "loading" } | { state: "ready"; stats: Stats } | { state: "unreachable" };

export function Popup() {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [highlight, setHighlight] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void (async () => {
      const stored = await chrome.storage.sync.get("highlight");
      setHighlight(stored.highlight === true);
      try {
        setLoad({ state: "ready", stats: await sendToBackground({ kind: "get-stats" }) });
      } catch {
        setLoad({ state: "unreachable" });
      }
    })();
  }, []);

  async function toggle(on: boolean) {
    setHighlight(on);
    setPending(true);
    try {
      await sendToBackground({ kind: "highlight", on });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icons/icon-32.png" alt="" className="h-6 w-6 rounded" />
          <h1 className="text-sm font-semibold">__PRODUCT_NAME__</h1>
        </div>
        <ThemeToggle />
      </header>

      {load.state === "unreachable" ? (
        <p className="rounded-lg border border-border bg-bg-secondary p-3 text-xs text-secondary">
          Nothing to read on this tab. Chrome blocks content scripts on its own
          pages and the Web Store — open an ordinary site and reopen this popup.
        </p>
      ) : (
        <section className="rounded-lg border border-border bg-bg-secondary p-3">
          <p className="truncate text-xs text-muted" title={title(load)}>
            {title(load)}
          </p>
          <div className="mt-2 flex gap-2">
            <Badge>{count(load, "links")} links</Badge>
            <Badge>{count(load, "images")} images</Badge>
          </div>
        </section>
      )}

      {/* Not a <label>: Radix renders a <button role="switch">, and a label
          does not forward its clicks to one. */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          Outline links
          <span className="block text-xs text-muted">Persists across tabs and reloads.</span>
        </div>
        <Switch
          checked={highlight}
          disabled={pending}
          onChange={toggle}
          aria-label="Outline links"
        />
      </div>
    </div>
  );
}

function title(load: Load): string {
  return load.state === "ready" ? load.stats.title || load.stats.url : "Reading page…";
}

function count(load: Load, key: "links" | "images"): number | string {
  return load.state === "ready" ? load.stats[key] : "—";
}
