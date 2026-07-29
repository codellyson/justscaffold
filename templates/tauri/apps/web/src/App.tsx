import { Button, ThemeToggle } from "@codellyson/justui/react";
import { useEffect, useState } from "react";
import type { AppInfo } from "@/lib/commands";
import { errorHint, getAppInfo, greet } from "@/lib/commands";
import { isTauri } from "@/lib/runtime";

export function App() {
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [name, setName] = useState("world");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isTauri) return;
    getAppInfo()
      .then(setInfo)
      .catch((e) => setError(errorHint(e)));
  }, []);

  async function onGreet() {
    setError("");
    setMessage("");
    try {
      setMessage(await greet(name));
    } catch (e) {
      setError(errorHint(e));
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg p-8 text-primary">
      <ThemeToggle />

      <div className="flex w-full max-w-md flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold">__PRODUCT_NAME__</h1>
          <p className="text-secondary">
            {isTauri ? "Running as a desktop app." : "Running in the browser."}
            {info ? ` v${info.version}` : ""}
          </p>
        </header>

        <div className="flex flex-col gap-3 rounded-md border border-border bg-bg-secondary p-4">
          <label className="text-xs font-medium text-muted" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-sm border border-border bg-bg px-3 py-2 font-mono text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button onClick={onGreet} disabled={!isTauri}>
            Greet
          </Button>
          {message ? (
            <p className="font-mono text-sm text-success">{message}</p>
          ) : null}
          {error ? (
            <p className="whitespace-pre-wrap font-mono text-sm text-danger">{error}</p>
          ) : null}
        </div>

        {!isTauri ? (
          <p className="text-xs text-muted">
            Native commands only run in the desktop build. Start it with{" "}
            <code className="font-mono text-accent">pnpm tauri:dev</code>.
          </p>
        ) : null}
      </div>
    </main>
  );
}
