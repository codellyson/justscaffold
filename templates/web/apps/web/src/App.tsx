import { useState } from "react";
import { Account } from "@/Account";
import { Marketplace } from "@/Marketplace";
import { Storefront } from "@/Storefront";
import { Story } from "@/Story";

type View = "market" | "shop" | "story" | "account";

const VIEWS: { id: View; label: string }[] = [
  { id: "market", label: "Marketplace" },
  { id: "shop", label: "Boutique" },
  { id: "story", label: "Story" },
  { id: "account", label: "Account" },
];

export function App() {
  const [view, setView] = useState<View>("market");

  return (
    <>
      {view === "market" ? (
        <Marketplace />
      ) : view === "shop" ? (
        <Storefront />
      ) : view === "story" ? (
        <Story onShop={() => setView("shop")} />
      ) : (
        <Account onBack={() => setView("shop")} />
      )}

      {/* Demo-only view switcher; delete when you keep one surface. */}
      <div className="fixed bottom-4 left-4 z-50 flex gap-1 rounded-full border border-border bg-bg/90 p-1 shadow-lg backdrop-blur">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              view === v.id ? "bg-accent text-bg" : "text-muted hover:text-primary"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </>
  );
}
