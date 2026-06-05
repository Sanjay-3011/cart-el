import { createFileRoute } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { donationStore, getCarbonMetrics, monthlyDonationTrend } from "@/data/mock";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LineChart, Line } from "recharts";
import { Leaf, Heart, Users, Package, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/sustainability")({
  component: SustainabilityDashboard,
});

function SustainabilityDashboard() {
  const records = useSyncExternalStore(donationStore.subscribe, donationStore.getAll, donationStore.getAll);
  const metrics = getCarbonMetrics();

  const statCards = [
    {
      label: "Total Food Saved",
      value: `${metrics.totalFoodKg.toFixed(1)} kg`,
      icon: Leaf,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-l-success",
      desc: "Weight of food rescued from waste",
    },
    {
      label: "Products Donated",
      value: metrics.totalProducts,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-l-primary",
      desc: "Total units donated to NGOs",
    },
    {
      label: "Families Helped",
      value: `~${metrics.familiesHelped}`,
      icon: Users,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-l-warning",
      desc: "Estimated families fed",
    },
    {
      label: "CO₂ Prevented",
      value: `${metrics.totalCarbon.toFixed(1)} kg`,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-l-success",
      desc: "Carbon emissions avoided",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sustainability Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your store's environmental impact at a glance.</p>
      </div>

      {/* Hero impact banner */}
      <div className="rounded-xl overflow-hidden text-white relative" style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)" }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #10b981, #34d399, #6ee7b7)" }} />
        <div className="p-6 grid md:grid-cols-[1fr_auto] gap-6 items-center relative">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold mb-2">
              <Leaf className="w-4 h-4" /> AADHIRAI MART — GREEN MERCHANT
            </div>
            <div className="text-3xl font-black mb-1">
              {metrics.totalCarbon.toFixed(1)} kg CO₂ prevented
            </div>
            <div className="text-white/80 text-sm">
              by donating {metrics.totalFoodKg.toFixed(1)} kg of food to {records.length} donation drives.
              That's equivalent to planting <b>{Math.round(metrics.totalCarbon / 21)} trees</b>.
            </div>
          </div>
          <div className="text-center hidden md:block">
            <div className="text-7xl">🌱</div>
            <div className="text-xs text-white/60 mt-1">Keep growing</div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-card rounded-xl shadow-card border-l-4 ${s.border} p-5`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs font-semibold text-foreground mt-1">{s.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly food saved */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Monthly Waste Reduction</h2>
            <span className="text-xs text-muted-foreground">Food saved (kg)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyDonationTrend} margin={{ left: -10 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} stroke="oklch(0.55 0.02 255)" />
              <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="oklch(0.55 0.02 255)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.005 250)", fontSize: 12 }} cursor={{ fill: "oklch(0.95 0.02 150 / 0.5)" }} />
              <Bar dataKey="foodKg" name="Food Saved (kg)" radius={[6, 6, 0, 0]}>
                {monthlyDonationTrend.map((d, i) => (
                  <Cell key={i} fill={i === monthlyDonationTrend.length - 1 ? "oklch(0.72 0.15 145)" : "oklch(0.5 0.15 145)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly CO₂ */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Monthly Carbon Savings</h2>
            <span className="text-xs text-muted-foreground">CO₂ prevented (kg)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyDonationTrend} margin={{ left: -10 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} stroke="oklch(0.55 0.02 255)" />
              <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="oklch(0.55 0.02 255)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.005 250)", fontSize: 12 }} />
              <Line type="monotone" dataKey="carbon" name="CO₂ Saved (kg)" stroke="oklch(0.5 0.15 145)" strokeWidth={3} dot={{ fill: "oklch(0.5 0.15 145)", r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly donation trend (products) */}
      <div className="bg-card rounded-xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Monthly Donation Trend</h2>
          <span className="text-xs text-muted-foreground">Products donated</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyDonationTrend} margin={{ left: -10 }}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} stroke="oklch(0.55 0.02 255)" />
            <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="oklch(0.55 0.02 255)" />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.005 250)", fontSize: 12 }} cursor={{ fill: "oklch(0.95 0.02 150 / 0.5)" }} />
            <Bar dataKey="products" name="Products Donated" radius={[6, 6, 0, 0]} fill="oklch(0.38 0.11 150)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent donations */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Heart className="w-4 h-4 text-success" />
          <h2 className="font-semibold text-foreground">Recent Donations</h2>
        </div>
        {records.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <div className="text-sm font-medium text-foreground">No donations yet</div>
            <div className="text-xs text-muted-foreground mt-1">Head to the NGO page to get started</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-2 font-semibold">Date</th>
                  <th className="text-left px-5 py-2 font-semibold">Product</th>
                  <th className="text-left px-5 py-2 font-semibold">NGO</th>
                  <th className="text-left px-5 py-2 font-semibold">Qty</th>
                  <th className="text-left px-5 py-2 font-semibold">Food Saved</th>
                  <th className="text-left px-5 py-2 font-semibold">CO₂ Prevented</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{r.productName}</td>
                    <td className="px-5 py-3 text-foreground">{r.ngoName}</td>
                    <td className="px-5 py-3">{r.quantity}</td>
                    <td className="px-5 py-3 text-success font-medium">{r.weightKg.toFixed(1)} kg</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-success font-semibold">
                        <Leaf className="w-3 h-3" /> {r.carbonSavedKg.toFixed(1)} kg CO₂
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
