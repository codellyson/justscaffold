import { Button, ThemeToggle } from "@codellyson/justui/react";
import { useEffect, useState, type SVGProps } from "react";

/* Product "photos" are a curated soft-tint tile system — colorful and varied
   like real product shots, so they stay vivid in any theme. The chrome (header,
   text, buttons) rides justui tokens and themes; the tiles don't, exactly like
   real photography wouldn't. Drop real <img>s in and the layout is unchanged. */
type Tint = { a: string; b: string; ink: string };
const TINTS: Record<string, Tint> = {
  blush: { a: "#F7DAD3", b: "#EFC3BA", ink: "#B0685B" },
  sage: { a: "#DEE7D6", b: "#C9D6BD", ink: "#6C855E" },
  butter: { a: "#F6E7C2", b: "#EFD9A0", ink: "#B2914A" },
  clay: { a: "#ECD6C4", b: "#E0BFA6", ink: "#A66E4B" },
  sky: { a: "#D6E3EC", b: "#BBD0DE", ink: "#5B7C90" },
  lilac: { a: "#E4DBEF", b: "#D2C4E6", ink: "#7B6B98" },
  mint: { a: "#D5EAE2", b: "#BCDDD0", ink: "#5A8E80" },
  rose: { a: "#F3D8E3", b: "#E9BFD1", ink: "#A6597B" },
};

const glyphPaths: Record<string, string> = {
  mug: "M4 8h11v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm11 1h2a2 2 0 0 1 0 4h-2",
  ring: "M12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 0-2-4h4l-2 4Z",
  candle: "M9 10h6v9H9v-9Zm3-4c1.5 1 1.5 3 0 4-1.5-1-1.5-3 0-4Z",
  print: "M5 4h14v16H5V4Zm3 9 3-3 2 2 3-4 3 5",
  plant: "M12 20v-7m0 0c0-3-2-5-5-5 0 3 2 5 5 5Zm0 0c0-3 2-5 5-5 0 3-2 5-5 5Z",
  apron: "M8 4c0 2 1.5 3 4 3s4-1 4-3m-9 3 1 13h8l1-13c-2 1-3 2-5 2s-3-1-5-2Z",
  pin: "M12 3a5 5 0 0 1 5 5c0 4-5 10-5 10S7 12 7 8a5 5 0 0 1 5-5Zm0 3v4",
  gift: "M4 9h16v11H4V9Zm0-3h16v3H4V6Zm8 0v14M12 6c-1-3-5-3-4 0 1 1 4 0 4 0Zm0 0c1-3 5-3 4 0-1 1-4 0-4 0Z",
};

function Glyph({ name, ...props }: { name: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={glyphPaths[name] ?? glyphPaths.gift} />
    </svg>
  );
}

function Tile({ tint, glyph, className = "" }: { tint: keyof typeof TINTS; glyph: string; className?: string }) {
  const t = TINTS[tint];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }}
    >
      <Glyph name={glyph} className="h-1/3 w-1/3" style={{ color: t.ink, opacity: 0.85 }} />
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 -28px 48px -28px rgba(0,0,0,0.16)" }} />
    </div>
  );
}

function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-secondary">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-primary" fill="currentColor">
        <path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.9L12 17l-6 3.6 1.6-6.9L2 9.1l7-.6L12 2Z" />
      </svg>
      <b className="text-primary">{rating.toFixed(1)}</b>
      <span className="text-muted">({count.toLocaleString()})</span>
    </span>
  );
}

const CATEGORIES = ["Gifts", "Home", "Jewelry", "Art", "Vintage", "Wedding", "Kids"];

const FEATURED = [
  { label: "Cottagecore decor", glyph: "plant", tint: "sage" },
  { label: "Custom pet portraits", glyph: "print", tint: "sky" },
  { label: "Hand-poured candles", glyph: "candle", tint: "clay" },
  { label: "Statement rings", glyph: "ring", tint: "butter" },
] as const;

const LOVED = [
  { label: "Wall art", glyph: "print", tint: "rose" },
  { label: "Ceramic mugs", glyph: "mug", tint: "sage" },
  { label: "Statement rings", glyph: "ring", tint: "butter" },
  { label: "Soy candles", glyph: "candle", tint: "clay" },
  { label: "Linen aprons", glyph: "apron", tint: "sky" },
  { label: "Enamel pins", glyph: "pin", tint: "mint" },
] as const;

const DEALS = [
  { id: "mug", title: "Speckled stoneware mug", shop: "KilnworksPDX", rating: 4.9, count: 2104, price: 24, was: 34, off: 30, glyph: "mug", tint: "sage" },
  { id: "ring", title: "Brass wishbone ring", shop: "AuroMetals", rating: 4.8, count: 890, price: 38, was: 52, off: 27, glyph: "ring", tint: "butter" },
  { id: "candle", title: "Beeswax tapers, set of 6", shop: "HearthAndHive", rating: 5.0, count: 3410, price: 18, was: 26, off: 31, glyph: "candle", tint: "clay" },
  { id: "apron", title: "Linen café apron", shop: "FlaxAndFold", rating: 4.7, count: 612, price: 32, was: 45, off: 29, glyph: "apron", tint: "sky" },
  { id: "print", title: "Risograph art print, A3", shop: "PaperPressStudio", rating: 4.9, count: 1208, price: 22, was: 28, off: 21, glyph: "print", tint: "rose" },
] as const;

const SHOPS = [
  { name: "KilnworksPDX", cat: "Ceramics · Portland", sales: "12,400 sales", rating: 4.9, glyph: "mug", tint: "sage" },
  { name: "AuroMetals", cat: "Jewelry · Lisbon", sales: "8,210 sales", rating: 4.8, glyph: "ring", tint: "butter" },
  { name: "PaperPressStudio", cat: "Prints · Berlin", sales: "5,640 sales", rating: 4.9, glyph: "print", tint: "rose" },
] as const;

function Countdown() {
  const [left, setLeft] = useState(5 * 3600 + 42 * 60 + 18);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return <span className="font-data text-secondary">{pad(h)}:{pad(m)}:{pad(s)}</span>;
}

function Heart({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Save"
      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-bg/80 backdrop-blur transition-colors hover:bg-bg"
    >
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${on ? "text-danger" : "text-primary"}`} fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path d="M12 21s-7-4.35-9.5-8.5C.5 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5.5 3.5 3.5 7C19 16.65 12 21 12 21Z" />
      </svg>
    </button>
  );
}

export function Marketplace() {
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setSaved((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="min-h-screen bg-bg text-primary">
      <ThemeToggle />

      {/* header */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <span className="font-serif text-2xl font-black tracking-tight text-accent">Makery</span>
          <div className="flex flex-1 items-center rounded-full border border-border bg-bg-secondary px-4 focus-within:ring-2 focus-within:ring-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input placeholder="Search for anything" className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted" />
          </div>
          <nav className="hidden items-center gap-4 text-sm text-secondary md:flex">
            <a href="#" className="hover:text-primary">Sign in</a>
            <a href="#" className="hover:text-primary">Saved</a>
            <a href="#" className="hover:text-primary">Cart</a>
          </nav>
        </div>
        <div className="mx-auto hidden max-w-6xl gap-6 px-6 pb-2 text-sm text-secondary md:flex">
          {CATEGORIES.map((c) => (
            <a key={c} href="#" className="hover:text-primary">{c}</a>
          ))}
        </div>
      </header>

      <main className="reveal mx-auto max-w-6xl px-6 pb-20">
        {/* hero promos */}
        <section className="grid gap-4 py-6 md:grid-cols-2">
          {[
            { title: "Gifts they'll actually keep", sub: "Hand-picked from independent makers.", cta: "Shop gift guides", glyph: "gift", tint: "butter" as const },
            { title: "Wedding season, sorted", sub: "Favours, décor, the whole aisle.", cta: "Shop weddings", glyph: "ring", tint: "blush" as const },
          ].map((p) => (
            <div key={p.title} className="relative flex overflow-hidden rounded-2xl border border-border">
              <div className="flex flex-1 flex-col justify-center gap-3 p-7">
                <h2 className="font-serif text-2xl font-bold leading-tight text-balance">{p.title}</h2>
                <p className="text-sm text-secondary">{p.sub}</p>
                <Button size="sm" className="self-start rounded-full">{p.cta}</Button>
              </div>
              <Tile tint={p.tint} glyph={p.glyph} className="w-32 shrink-0 sm:w-44" />
            </div>
          ))}
        </section>

        {/* featured interests */}
        <Section title="Jump into featured interests">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {FEATURED.map((f) => (
              <a key={f.label} href="#" className="group">
                <Tile tint={f.tint} glyph={f.glyph} className="aspect-square rounded-2xl transition-transform group-hover:-translate-y-1" />
                <p className="mt-2 text-center text-sm">{f.label}</p>
              </a>
            ))}
          </div>
        </Section>

        {/* most-loved categories */}
        <Section title="Shop our most-loved categories">
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {LOVED.map((c) => (
              <a key={c.label} href="#" className="group">
                <Tile tint={c.tint} glyph={c.glyph} className="aspect-square rounded-full transition-transform group-hover:-translate-y-1" />
                <p className="mt-2 text-center text-xs">{c.label}</p>
              </a>
            ))}
          </div>
        </Section>

        {/* today's big deals */}
        <Section
          title="Today's big deals"
          aside={
            <span className="flex items-center gap-2 text-sm text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-danger" /> Fresh deals in <Countdown />
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {DEALS.map((d) => (
              <article key={d.id} className="group">
                <div className="relative overflow-hidden rounded-xl">
                  <Tile tint={d.tint} glyph={d.glyph} className="aspect-square transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-success px-2 py-0.5 text-xs font-bold text-bg">
                    {d.off}% off
                  </span>
                  <Heart on={!!saved[d.id]} onClick={() => toggle(d.id)} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-snug">{d.title}</p>
                <p className="text-xs text-muted">{d.shop}</p>
                <div className="mt-1"><Stars rating={d.rating} count={d.count} /></div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-data font-bold">${d.price}</span>
                  <span className="font-data text-xs text-muted line-through">${d.was}</span>
                  <span className="text-xs font-semibold text-success">{d.off}% off</span>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* small shops */}
        <Section title="Explore small shops">
          <div className="grid gap-4 sm:grid-cols-3">
            {SHOPS.map((s) => (
              <a key={s.name} href="#" className="flex items-center gap-4 rounded-2xl border border-border p-4 transition-colors hover:bg-bg-secondary">
                <Tile tint={s.tint} glyph={s.glyph} className="h-16 w-16 shrink-0 rounded-xl" />
                <div className="min-w-0">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted">{s.cat}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
                    <Stars rating={s.rating} count={0} /> · {s.sales}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Section>
      </main>

      {/* mission */}
      <footer className="border-t border-border bg-bg-secondary">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            We're on a mission to<br className="hidden sm:block" /> keep commerce human.
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-8 text-sm sm:grid-cols-4">
            {[
              ["Shop", ["Gift cards", "Registry", "Sitemap", "Blog"]],
              ["Sell", ["Sell on Makery", "Teams", "Forums", "Affiliates"]],
              ["About", ["Makery, Inc.", "Policies", "Investors", "Careers"]],
              ["Help", ["Help Centre", "Privacy", "Terms", "Contact"]],
            ].map(([h, links]) => (
              <div key={h as string}>
                <p className="font-data mb-3 text-xs uppercase tracking-widest text-muted">{h as string}</p>
                <ul className="flex flex-col gap-2 text-secondary">
                  {(links as string[]).map((l) => (
                    <li key={l}><a href="#" className="hover:text-primary">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-bold tracking-tight">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
