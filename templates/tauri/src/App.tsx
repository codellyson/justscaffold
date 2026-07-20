import { useEffect, useState } from "react";
import { type AppInfo, type CommandError, errorHint, getAppInfo, greet, isCommandError } from "@/lib/commands";

export default function App() {
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [name, setName] = useState("world");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<CommandError | null>(null);

  useEffect(() => {
    getAppInfo().then(setInfo).catch(handleError);
  }, []);

  function handleError(e: unknown) {
    setError(isCommandError(e) ? e : { kind: "internal", message: String(e) });
  }

  async function onGreet() {
    setError(null);
    try {
      setReply(await greet(name));
    } catch (e) {
      handleError(e);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">{info?.name ?? "__PRODUCT_NAME__"}</h1>
          <p className="text-sm text-neutral-400">
            {info ? `v${info.version} · ${info.platform}` : "Loading…"}
          </p>
        </header>

        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            placeholder="Your name"
          />
          <button
            onClick={onGreet}
            className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
          >
            Greet
          </button>
        </div>

        {reply && <p className="text-sm text-neutral-300">{reply}</p>}

        {error && (
          <div className="rounded-md border border-red-900 bg-red-950/40 p-3 text-sm">
            <p className="text-red-300">{error.message}</p>
            {errorHint(error) && <p className="mt-1 text-red-400/70">{errorHint(error)}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
