import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: Analytics,
});

const dailySales = [
  { day: "Mon", value: 122000 },
  { day: "Tue", value: 118000 },
  { day: "Wed", value: 131000 },
  { day: "Thu", value: 109000 },
  { day: "Fri", value: 128000 },
  { day: "Sat", value: 180000 },
  { day: "Sun", value: 122000 },
];

const paymentMix = [
  { name: "Cash", value: 43.5, color: "oklch(0.32 0.09 150)" },
  { name: "Wallet", value: 37.8, color: "oklch(0.5 0.13 150)" },
  { name: "Credit", value: 10.7, color: "oklch(0.72 0.15 75)" },
  { name: "Card", value: 7.8, color: "oklch(0.7 0.13 150)" },
];

const fastMovers = [
  { name: "Aavin Milk", qty: 500 },
  { name: "Parle-G Biscuit", qty: 300 },
  { name: "Sona Masoori", qty: 250 },
  { name: "Sugar", qty: 200 },
  { name: "Eggs (Tray)", qty: 200 },
];

const slowMovers = [
  { name: "Garam Masala", qty: 2 },
  { name: "Coconut Oil", qty: 8 },
  { name: "Bru Coffee", qty: 9 },
  { name: "Tata Tea", qty: 10 },
  { name: "Groundnut Oil", qty: 12 },
];

const promos = [
  { offer: "Toor Dal 8% off", date: "20 May", items: 10, before: 22, after: 31, lift: 41 },
  { offer: "Weekend Bundle", date: "15 May", items: 6, before: 15, after: 18, lift: 20 },
];

function Analytics() {
  const fmt = (n: number) => `₹${(n / 100000).toFixed(2)}L`;
  const maxFast = Math.max(...fastMovers.map((p) => p.qty));
  const maxSlow = Math.max(...slowMovers.map((p) => p.qty));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Your store's pulse, distilled.</p>
      </div>

      {/* Merchant Level card */}
      <div className="rounded-xl shadow-card overflow-hidden text-white relative"
        style={{ background: "linear-gradient(135deg, #0D4F2E 0%, #1A7A45 100%)" }}>
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full" style={{ background: "rgba(246,201,14,0.12)" }} />
        <div className="p-6 grid md:grid-cols-[1.2fr_1fr] gap-6 relative">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-xl">👨‍💼</div>
              <div>
                <div className="text-lg font-bold">Aadhirai Mart</div>
                <div className="text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "#F6C90E", color: "#0D4F2E" }}>LEVEL 3</span>
                  <span className="opacity-90">Growing Merchant 📈</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5 opacity-90">
                <span>XP Progress</span>
                <span className="font-semibold tabular-nums">1,240 / 2,000 XP</span>
              </div>
              <div className="h-3 bg-white/15 rounded-full overflow-hidden">
                <div className="h-full transition-all" style={{ width: "62%", background: "linear-gradient(90deg, #F6C90E, #FCEA9C)" }} />
              </div>
              <div className="text-xs mt-3 opacity-90">
                Next milestone: Send 3 offers this week → unlock <b>"Consistent Merchant"</b> + Level 4
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide opacity-80 font-semibold mb-2">🏅 Badges Earned</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { e: "🎯", n: "First Broadcast", unlocked: true },
                { e: "🔥", n: "7-Day Streak", unlocked: true },
                { e: "💰", n: "Deal Maker", unlocked: true },
                { e: "🏆", n: "Weekend Champion", unlocked: false },
              ].map((b) => (
                <div key={b.n} className={`rounded-lg px-3 py-2 flex items-center gap-2 text-xs ${b.unlocked ? "bg-white/15" : "bg-black/20 opacity-60"}`}>
                  <span className="text-base">{b.unlocked ? b.e : "🔒"}</span>
                  <span className={b.unlocked ? "font-medium" : "italic"}>{b.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Morning Digest */}
      <div className="rounded-xl shadow-card p-5 flex gap-4" style={{ background: "linear-gradient(135deg, oklch(0.95 0.04 150), oklch(0.92 0.05 150))" }}>
        <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-foreground">Good morning! Yesterday: 487 bills · ₹1,38,240 sales</div>
          <div className="text-foreground/80">🔴 Stock up <b>Groundnut Oil</b> — only 8 units left</div>
          <div className="text-foreground/80">💰 ₹18,300 credit due from 4 customers</div>
          <div className="text-foreground/80">📈 Saturday tomorrow — Rice and Oil sell <b>40% more</b></div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Daily Sales</h2>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailySales} margin={{ left: -10 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} stroke="oklch(0.55 0.02 255)" />
              <YAxis tickFormatter={fmt} axisLine={false} tickLine={false} fontSize={11} stroke="oklch(0.55 0.02 255)" />
              <Tooltip formatter={(v: number) => fmt(v)} cursor={{ fill: "oklch(0.95 0.02 150 / 0.5)" }}
                contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.005 250)", fontSize: 12 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {dailySales.map((d) => (
                  <Cell key={d.day} fill={d.day === "Sat" ? "oklch(0.38 0.11 150)" : "oklch(0.5 0.13 150)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Payment Mix</h2>
            <span className="text-xs text-muted-foreground">This month</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMix} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {paymentMix.map((p) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-lg font-bold text-foreground">₹7.12L</div>
                <div className="text-[10px] text-muted-foreground">Total</div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {paymentMix.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-sm" style={{ background: p.color }} />
                  <span className="flex-1 text-foreground">{p.name}</span>
                  <span className="text-muted-foreground font-medium">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <MoverList title="Top 5 Fast Movers 🚀" items={fastMovers} max={maxFast} barClass="bg-success" />
        <MoverList title="Bottom 5 Slow Movers 🐢" items={slowMovers} max={maxSlow} barClass="bg-warning" />
      </div>

      {/* Promo table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground">Promotion Effectiveness</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-2 font-semibold">Offer</th>
                <th className="text-left px-5 py-2 font-semibold">Date</th>
                <th className="text-left px-5 py-2 font-semibold">Items</th>
                <th className="text-left px-5 py-2 font-semibold">Before</th>
                <th className="text-left px-5 py-2 font-semibold">After</th>
                <th className="text-left px-5 py-2 font-semibold">Lift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promos.map((p) => (
                <tr key={p.offer}>
                  <td className="px-5 py-3 text-foreground font-medium">{p.offer}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-3">{p.items} sent</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.before} units/day</td>
                  <td className="px-5 py-3 text-foreground font-medium">{p.after} units/day</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success font-semibold text-xs">
                      +{p.lift}% 🟢
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MoverList({ title, items, max, barClass }: {
  title: string; items: { name: string; qty: number }[]; max: number; barClass: string;
}) {
  return (
    <div className="bg-card rounded-xl shadow-card p-5">
      <h2 className="font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-3">
        {items.map((p, i) => (
          <div key={p.name}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-foreground"><span className="text-muted-foreground mr-2">{i + 1}.</span>{p.name}</span>
              <span className="font-semibold text-foreground">{p.qty} qty</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${barClass}`} style={{ width: `${(p.qty / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
