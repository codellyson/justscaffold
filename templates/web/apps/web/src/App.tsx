import { Button, ThemeToggle } from "@codellyson/justui/react";
import { useState } from "react";

const FEATURES = [
  { icon: "⚡", title: "Set up in minutes", body: "No install, no learning curve. Open it and go." },
  { icon: "🔒", title: "Safe and private", body: "Your details are encrypted and never sold. Cancel anytime." },
  { icon: "✨", title: "Made to be loved", body: "Fast, considered, and a little delightful — every screen." },
];

const TIERS = [
  { name: "Free", price: "$0", cadence: "", features: ["The essentials", "1 project", "Community support"], cta: "Get started", featured: false },
  { name: "Pro", price: "$12", cadence: "/mo", features: ["Everything in Free", "Unlimited projects", "Priority support", "Advanced insights"], cta: "Start 14-day trial", featured: true },
  { name: "Team", price: "$29", cadence: "/mo", features: ["Everything in Pro", "Up to 10 seats", "Shared workspace"], cta: "Choose Team", featured: false },
];

export function App() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  function onJoin(e: React.FormEvent) {
    e.preventDefault();
    if (email.includes("@")) setJoined(true);
  }

  return (
    <div className="bg-bg text-primary">
      <ThemeToggle />

      <div className="mx-auto max-w-6xl px-6">
        <nav className="flex items-center justify-between py-5">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-sm text-bg">✦</span>
            __PRODUCT_NAME__
          </div>
          <div className="flex items-center gap-2">
            <a href="#pricing" className="hidden px-3 py-2 text-sm text-secondary hover:text-primary sm:block">Pricing</a>
            <Button variant="ghost" size="sm">Sign in</Button>
            <Button size="sm">Get started</Button>
          </div>
        </nav>

        <header className="py-16 text-center sm:py-24">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
            ✦ Now in early access
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-balance sm:text-6xl">
            The simplest way to get it done.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-secondary text-balance sm:text-xl">
            __PKG_DESCRIPTION__ Try it free — no card, no clutter, cancel anytime.
          </p>

          <form onSubmit={onJoin} className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 rounded-xl border border-border bg-bg-secondary px-4 py-3 text-primary outline-none focus:ring-2 focus:ring-accent"
            />
            <Button type="submit">{joined ? "You're in ✓" : "Get early access"}</Button>
          </form>
          <p className="mt-3 text-sm text-muted">Join 3,000+ people already on the list.</p>
        </header>

        <section className="grid gap-5 py-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-bg-secondary p-6">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-xl text-accent">{f.icon}</div>
              <h3 className="mb-1 text-lg font-semibold">{f.title}</h3>
              <p className="text-secondary">{f.body}</p>
            </div>
          ))}
        </section>

        <section id="pricing" className="py-20">
          <div className="mx-auto mb-10 max-w-lg text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, honest pricing</h2>
            <p className="mt-2 text-secondary">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid items-stretch gap-5 sm:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col gap-4 rounded-2xl border bg-bg p-7 ${
                  t.featured ? "border-accent shadow-lg" : "border-border"
                }`}
              >
                <div className="font-semibold">{t.name}</div>
                <div className="text-4xl font-extrabold tracking-tight">
                  {t.price}
                  <span className="text-base font-medium text-muted">{t.cadence}</span>
                </div>
                <ul className="flex flex-1 flex-col gap-2 text-secondary">
                  {t.features.map((li) => (
                    <li key={li} className="flex gap-2">
                      <span className="font-bold text-success">✓</span> {li}
                    </li>
                  ))}
                </ul>
                <Button variant={t.featured ? "primary" : "secondary"}>{t.cta}</Button>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="rounded-3xl border border-border bg-bg-secondary px-6 py-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready when you are</h2>
            <p className="mx-auto mt-2 max-w-md text-secondary">Set up in minutes. No card needed to start.</p>
            <div className="mt-6">
              <Button>Get started free</Button>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap justify-between gap-4 border-t border-border py-8 text-sm text-muted">
          <div>© __PRODUCT_NAME__</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
