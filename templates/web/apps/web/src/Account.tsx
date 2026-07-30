import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
  Switch,
  ThemeToggle,
  useTheme,
} from "@codellyson/justui/react";

const ORDERS = [
  { id: "BRJ-1042", date: "Jul 24, 2026", items: "Ghost in the Mango · Smoked No. 7", total: 27, status: "Delivered" },
  { id: "BRJ-1019", date: "Jul 03, 2026", items: "Heat Club — July crate", total: 32, status: "Delivered" },
  { id: "BRJ-0998", date: "Jun 12, 2026", items: "Reaper's Confession", total: 16, status: "Delivered" },
];

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="font-data text-xs uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
      <h2 className="font-display mt-1 text-2xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

export function Account({ onBack }: { onBack?: () => void }) {
  const { themeId, mode, themes, setThemeId, setMode } = useTheme();

  return (
    <div className="min-h-screen bg-bg text-primary">
      <ThemeToggle />

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl font-extrabold tracking-tight">BRUJA</span>
          <button onClick={onBack} className="text-sm text-secondary hover:text-primary">
            ← Back to the shop
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">Hey, Ada.</h1>
            <p className="mt-1 text-secondary">Member since 2024 · 14 bottles survived.</p>
          </div>
          <Badge>Heat Club member</Badge>
        </div>

        {/* Heat Club — the centerpiece */}
        <section className="mb-12 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/10 to-transparent">
          <div className="flex flex-wrap items-start justify-between gap-6 p-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold">Heat Club</h2>
                <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
                </span>
              </div>
              <p className="mt-2 text-secondary">
                Next crate ships <span className="font-data text-primary">Aug 01</span>. Three bottles,
                including one club-only batch.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Verde Bruja", "Piña Diablo", "Club No. 12"].map((n) => (
                  <span key={n} className="rounded-full border border-border px-3 py-1 text-xs">
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex w-56 flex-col gap-3">
              <label className="font-data text-xs uppercase tracking-widest text-muted">Heat ceiling</label>
              <Select defaultValue="hot">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="ludicrous">Ludicrous</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Skip next
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex-1 text-danger">
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl">Leave the Heat Club?</DialogTitle>
                      <DialogDescription>
                        You'll get your August crate, then that's it. Club-only batches will carry on
                        without you.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Stay in</Button>
                      </DialogClose>
                      <Button variant="destructive">Cancel membership</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>

        {/* Orders */}
        <section className="mb-12">
          <SectionHead eyebrow="History" title="Your orders" />
          <div className="overflow-hidden rounded-2xl border border-border">
            {ORDERS.map((o, i) => (
              <div
                key={o.id}
                className={`flex flex-wrap items-center justify-between gap-3 p-4 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-data text-sm text-muted">{o.id}</span>
                  <div>
                    <p className="font-medium">{o.items}</p>
                    <p className="font-data text-xs text-muted">{o.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{o.status}</Badge>
                  <span className="font-data font-semibold">${o.total}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Profile + address */}
        <section className="mb-12 grid gap-8 md:grid-cols-2">
          <div>
            <SectionHead eyebrow="You" title="Profile" />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-data text-xs uppercase tracking-widest text-muted">Name</label>
                <Input defaultValue="Ada Lovelace" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-data text-xs uppercase tracking-widest text-muted">Email</label>
                <Input type="email" defaultValue="ada@example.com" />
              </div>
              <Button className="self-start">Save</Button>
            </div>
          </div>
          <div>
            <SectionHead eyebrow="Ships to" title="Address" />
            <div className="rounded-2xl border border-border p-5">
              <p className="font-medium">Ada Lovelace</p>
              <p className="mt-1 text-secondary">
                12 Ferment Lane<br />
                Portland, OR 97201
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Edit address
              </Button>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <SectionHead eyebrow="Preferences" title="How it looks & lands" />
          <div className="flex flex-col gap-5 rounded-2xl border border-border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted">Pick a look. It re-skins the whole shop.</p>
              </div>
              <Select value={themeId} onValueChange={setThemeId}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <label className="flex items-center justify-between">
              <span>
                <span className="font-medium">Dark mode</span>
                <span className="block text-sm text-muted">Easier on late-night sauce runs.</span>
              </span>
              <Switch checked={mode === "dark"} onCheckedChange={(c) => setMode(c ? "dark" : "light")} />
            </label>
            <Separator />
            <label className="flex items-center justify-between">
              <span>
                <span className="font-medium">Limited-batch alerts</span>
                <span className="block text-sm text-muted">Email me the second a small batch drops.</span>
              </span>
              <Switch defaultChecked />
            </label>
          </div>
        </section>
      </main>
    </div>
  );
}
