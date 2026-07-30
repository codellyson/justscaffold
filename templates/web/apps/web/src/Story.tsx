import { Button, ThemeToggle } from "@codellyson/justui/react";

const STEPS = [
  {
    n: "01",
    title: "Source",
    body: "We buy chilies from four farms we've actually stood on. Peak-season, ugly ones welcome — flavor doesn't care what it looks like.",
  },
  {
    n: "02",
    title: "Ferment",
    body: "Salt, chilies, and six to eight weeks in the crock. The bubbles do the work no shortcut can fake — depth, funk, a little wildness.",
  },
  {
    n: "03",
    title: "Blend & bottle",
    body: "Small batches, tasted by mouth, not spec sheet. We bottle the day it's ready, never before, and we ship it cold.",
  },
  {
    n: "04",
    title: "Number",
    body: "Every bottle gets a batch number in our own handwriting. If something's off, we know exactly which crock to blame.",
  },
];

export function Story({ onShop }: { onShop?: () => void }) {
  return (
    <div className="min-h-screen bg-bg text-primary">
      <ThemeToggle />

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl font-extrabold tracking-tight">BRUJA</span>
          <button onClick={onShop} className="text-sm text-secondary hover:text-primary">
            Shop the shelf →
          </button>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <p className="font-data text-xs uppercase tracking-[0.2em] text-danger">Since a very small kitchen</p>
        <h1 className="font-display mt-5 max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-tight text-balance sm:text-7xl">
          We make sauce the slow way, on purpose.
        </h1>
        <p className="mt-7 max-w-xl text-lg text-secondary sm:text-xl">
          Most hot sauce is vinegar, dye, and a race to the bottom shelf. Ours is a live
          ferment that takes two months and can't be rushed — because the flavor is the
          whole point, and the burn is just how it says hello.
        </p>
      </section>

      {/* process — a real sequence, so the numbers earn their place */}
      <section className="border-y border-border bg-bg-secondary">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-display mb-10 text-sm uppercase tracking-[0.18em] text-muted">
            How a bottle happens
          </h2>
          <div className="flex flex-col">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={`grid gap-4 py-8 md:grid-cols-[auto_1fr] md:gap-10 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <span className="font-data text-4xl font-medium text-accent md:text-5xl">{s.n}</span>
                <div className="max-w-xl">
                  <h3 className="font-display text-2xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-lg text-secondary">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* manifesto pull-quote */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="font-display text-4xl font-bold leading-tight tracking-tight text-balance sm:text-6xl">
          "If it needs a dye to<br className="hidden sm:block" /> look alive, it isn't."
        </p>
        <p className="font-data mt-6 text-xs uppercase tracking-[0.2em] text-muted">— the house rule</p>
      </section>

      {/* stats */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            ["1,900+", "batches numbered"],
            ["6–8", "weeks per ferment"],
            ["5", "ingredients, max"],
            ["0", "dyes, gums, shortcuts"],
          ].map(([stat, label]) => (
            <div key={label} className="bg-bg px-6 py-10 text-center">
              <div className="font-display text-4xl font-extrabold tracking-tight text-accent">{stat}</div>
              <div className="font-data mt-2 text-xs uppercase tracking-widest text-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Enough reading. Go get burned.
        </h2>
        <div className="mt-8">
          <Button size="lg" onClick={onShop}>
            Shop the shelf
          </Button>
        </div>
      </section>
    </div>
  );
}
