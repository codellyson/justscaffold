import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  ThemeToggle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@codellyson/justui/react";
import { useMemo, useState } from "react";

interface Sauce {
  id: string;
  name: string;
  base: string;
  note: string;
  heat: 1 | 2 | 3 | 4 | 5;
  shu: string;
  price: number;
  limited?: boolean;
}

const SAUCES: Sauce[] = [
  { id: "verde", name: "Verde Bruja", base: "Fermented jalapeño · tomatillo · lime", note: "Bright and green. Goes on everything, judges nothing.", heat: 2, shu: "8K", price: 12 },
  { id: "mango", name: "Ghost in the Mango", base: "Ghost pepper · mango · ginger", note: "Tropical on the way in, trouble on the way out.", heat: 4, shu: "1.02M", price: 14 },
  { id: "smoke", name: "Smoked No. 7", base: "Chipotle morita · molasses", note: "Barbecue's best friend. Low and slow heat.", heat: 3, shu: "40K", price: 13 },
  { id: "reaper", name: "Reaper's Confession", base: "Carolina reaper · blood orange", note: "You were warned. A drop is a decision.", heat: 5, shu: "1.9M", price: 16, limited: true },
  { id: "pina", name: "Piña Diablo", base: "Habanero · charred pineapple", note: "Sweet heat for tiki nights and taco Tuesdays.", heat: 3, shu: "120K", price: 13 },
  { id: "fresno", name: "Fresno Fields", base: "Fermented Fresno · roasted garlic", note: "The daily driver. Mild enough to pour with abandon.", heat: 2, shu: "12K", price: 12 },
];

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "mild", label: "Mild" },
  { id: "medium", label: "Medium" },
  { id: "hot", label: "Hot" },
  { id: "ludicrous", label: "Ludicrous" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function matches(sauce: Sauce, filter: FilterId): boolean {
  if (filter === "all") return true;
  if (filter === "mild") return sauce.heat <= 2;
  if (filter === "medium") return sauce.heat === 3;
  if (filter === "hot") return sauce.heat === 4;
  return sauce.heat === 5;
}

function HeatMeter({ level, shu }: { level: number; shu: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" aria-label={`Heat ${level} of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-5 rounded-full ${i <= level ? "bg-danger" : "bg-border"}`}
          />
        ))}
      </div>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-data cursor-help text-xs text-muted">{shu} SHU</span>
          </TooltipTrigger>
          <TooltipContent>Scoville heat units — higher is hotter.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

/** A CSS-rendered bottle silhouette — no image assets, themes with the tokens. */
function Bottle({ big = false }: { big?: boolean }) {
  const body = big ? "h-64 w-40" : "h-28 w-16";
  const label = big ? "inset-x-3 top-20 h-28" : "inset-x-2 top-9 h-11";
  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-t-sm bg-primary/80 ${big ? "h-6 w-8" : "h-4 w-5"}`} />
      <div className={`bg-primary/50 ${big ? "h-3 w-4" : "h-2 w-3"}`} />
      <div className={`relative rounded-lg rounded-t-2xl bg-gradient-to-b from-accent to-accent-hover shadow-xl ${body}`}>
        <div className={`absolute rounded-sm bg-bg/95 ${label}`} />
      </div>
    </div>
  );
}

export function Storefront() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [cart, setCart] = useState<{ sauce: Sauce; qty: number }[]>([]);

  const shown = useMemo(() => SAUCES.filter((s) => matches(s, filter)), [filter]);
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = cart.reduce((n, l) => n + l.qty * l.sauce.price, 0);

  function add(sauce: Sauce) {
    setCart((c) => {
      const found = c.find((l) => l.sauce.id === sauce.id);
      if (found) return c.map((l) => (l.sauce.id === sauce.id ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { sauce, qty: 1 }];
    });
  }
  function remove(id: string) {
    setCart((c) => c.filter((l) => l.sauce.id !== id));
  }

  return (
    <div className="min-h-screen bg-bg text-primary">
      <ThemeToggle />

      {/* announcement */}
      <div className="bg-accent text-bg">
        <p className="font-data mx-auto max-w-6xl px-6 py-2 text-center text-xs tracking-widest">
          SMALL BATCH · LIVE-FERMENTED · NUMBERED BY HAND — FREE SHIPPING OVER $35
        </p>
      </div>

      {/* header */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl font-extrabold tracking-tight">BRUJA</span>
          <nav className="hidden gap-7 text-sm text-secondary sm:flex">
            <a href="#shelf" className="hover:text-primary">The shelf</a>
            <a href="#ferment" className="hover:text-primary">The ferment</a>
            <a href="#club" className="hover:text-primary">Heat club</a>
          </nav>
          <Cart cart={cart} count={count} subtotal={subtotal} onRemove={remove} />
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[1.15fr_1fr] md:py-24">
        <div>
          <span className="font-data text-xs uppercase tracking-[0.2em] text-danger">Est. small · burns big</span>
          <h1 className="font-display mt-4 text-5xl font-extrabold leading-[0.95] tracking-tight text-balance sm:text-7xl">
            Heat that tastes<br />like something.
          </h1>
          <p className="mt-6 max-w-md text-lg text-secondary">
            Live-fermented hot sauce in tiny batches — grown for flavor, not shock value.
            Every bottle numbered, none of it shortcut.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <a href="#shelf">Shop the shelf</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#ferment">Read the ferment</a>
            </Button>
          </div>
        </div>

        {/* one bold move: the flagship on an accent field */}
        <div className="relative">
          <div className="absolute inset-0 -z-0 rounded-3xl bg-accent/10" />
          <div className="relative flex flex-col items-center gap-5 rounded-3xl border border-border p-8">
            <Badge className="self-start">This month's flagship</Badge>
            <Bottle big />
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold">Ghost in the Mango</h2>
              <p className="mt-1 text-sm text-muted">Ghost pepper · mango · ginger</p>
            </div>
            <HeatMeter level={4} shu="1.02M" />
            <div className="flex w-full items-center justify-between border-t border-border pt-4">
              <span className="font-data text-xl font-semibold">$14</span>
              <Button onClick={() => add(SAUCES[1])}>Add to crate</Button>
            </div>
          </div>
        </div>
      </section>

      {/* shelf */}
      <section id="shelf" className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">The shelf</h2>
            <p className="mt-1 text-secondary">Six live at a time. When a batch is gone, it's gone.</p>
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterId)}>
            <TabsList>
              {FILTERS.map((f) => (
                <TabsTrigger key={f.id} value={f.id}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((s) => (
            <article
              key={s.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-secondary"
            >
              <div className="relative flex h-44 items-end justify-center bg-gradient-to-b from-accent/15 to-transparent pt-6">
                {s.limited ? (
                  <Badge variant="destructive" className="absolute left-4 top-4">
                    Limited batch
                  </Badge>
                ) : null}
                <Bottle />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h3 className="font-display text-xl font-bold leading-tight">{s.name}</h3>
                  <p className="font-data mt-1 text-xs text-muted">{s.base}</p>
                </div>
                <HeatMeter level={s.heat} shu={s.shu} />
                <p className="text-sm text-secondary">{s.note}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-data text-lg font-semibold">${s.price}</span>
                  <Button size="sm" onClick={() => add(s)}>
                    Add
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ferment story */}
      <section id="ferment" className="border-y border-border bg-bg-secondary">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
            Salt, chilies, time. That's the whole trick.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-secondary">
            Six to eight weeks in the crock, the way sauce was made before shelf-stable
            everything. No gums, no dyes, no vinegar shortcuts. We number every batch
            because we actually make every batch.
          </p>
          <div className="font-data mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-widest text-muted">
            <span>6–8 wk ferment</span>
            <span className="text-border">/</span>
            <span>0 gums</span>
            <span className="text-border">/</span>
            <span>0 dyes</span>
            <span className="text-border">/</span>
            <span>100% small batch</span>
          </div>
        </div>
      </section>

      {/* heat club */}
      <section id="club" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-8 rounded-3xl border border-border bg-gradient-to-br from-accent/10 to-transparent p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">The Heat Club</h2>
            <p className="mt-3 max-w-md text-secondary">
              Three new bottles at your door every month — including club-only batches that
              never hit the shelf. Set your ceiling; we'll respect it. Mostly.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-data text-xs uppercase tracking-widest text-muted">Your heat ceiling</label>
            <Select defaultValue="hot">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild — keep it friendly</SelectItem>
                <SelectItem value="medium">Medium — some backbone</SelectItem>
                <SelectItem value="hot">Hot — bring it</SelectItem>
                <SelectItem value="ludicrous">Ludicrous — no mercy</SelectItem>
              </SelectContent>
            </Select>
            <Button size="lg">Join the club — $32/mo</Button>
            <p className="text-center text-xs text-muted">Skip or cancel any month.</p>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="max-w-xs">
              <span className="font-display text-2xl font-extrabold tracking-tight">BRUJA</span>
              <p className="mt-3 text-sm text-muted">
                Made in small batches, shipped cold. Handle with respect.
              </p>
            </div>
            <div>
              <p className="font-data mb-3 text-xs uppercase tracking-widest text-muted">
                First dibs on limited batches
              </p>
              <form
                className="flex max-w-sm gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <Input type="email" placeholder="you@email.com" required />
                <Button type="submit">Notify me</Button>
              </form>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="font-data flex flex-wrap justify-between gap-4 text-xs text-muted">
            <span>© BRUJA HOT SAUCE</span>
            <span>Shelf · The ferment · Stockists · Wholesale</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Cart({
  cart,
  count,
  subtotal,
  onRemove,
}: {
  cart: { sauce: Sauce; qty: number }[];
  count: number;
  subtotal: number;
  onRemove: (id: string) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Crate
          {count > 0 ? (
            <span className="font-data ml-1 rounded-full bg-accent px-1.5 text-xs text-bg">{count}</span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Your crate</DialogTitle>
        </DialogHeader>
        {cart.length === 0 ? (
          <p className="py-6 text-center text-muted">Nothing in here yet. Go get burned.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {cart.map((l) => (
              <div key={l.sauce.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-semibold">{l.sauce.name}</p>
                  <p className="font-data text-xs text-muted">
                    {l.qty} × ${l.sauce.price}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-data font-semibold">${l.qty * l.sauce.price}</span>
                  <button
                    onClick={() => onRemove(l.sauce.id)}
                    className="text-xs text-muted hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <Separator className="my-1" />
            <div className="flex items-center justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-data text-lg font-semibold">${subtotal}</span>
            </div>
          </div>
        )}
        <DialogFooter>
          {cart.length > 0 ? (
            <Button className="w-full" size="lg">
              Checkout — ${subtotal}
            </Button>
          ) : (
            <DialogClose asChild>
              <Button variant="outline" className="w-full">
                Keep shopping
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
