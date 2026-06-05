import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { products, type Status } from "@/data/mock";
import { AlertTriangle, Skull, TrendingDown, Package, Bot, Check, X, Flame, Award, Clock, Heart, Zap, ChevronRight, Leaf, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/")({
  component: StockDashboard,
});

const statusMeta: Record<Status, { dot: string; text: string; bg: string; border: string }> = {
  Healthy:      { dot: "bg-success",           text: "text-success",          bg: "bg-success/10", border: "border-l-success" },
  "Low Stock":  { dot: "bg-warning",           text: "text-warning",          bg: "bg-warning/10", border: "border-l-warning" },
  Critical:     { dot: "bg-alert",             text: "text-alert",            bg: "bg-alert/10",   border: "border-l-alert" },
  "Dead Stock": { dot: "bg-muted-foreground",  text: "text-muted-foreground", bg: "bg-muted",      border: "border-l-muted-foreground" },
};

type Filter = "All" | Status;
const filters: Filter[] = ["All", "Critical", "Low Stock", "Dead Stock", "Healthy"];

function StockDashboard() {
  const [filter, setFilter] = useState<Filter>("All");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const expiringIn7  = products.filter((p) => p.expiryDays !== undefined && p.expiryDays <= 7);
  const expiringIn30 = products.filter((p) => p.expiryDays !== undefined && p.expiryDays <= 30);
  const potentialLoss7 = expiringIn7.reduce((s, p) => s + p.mrp * p.stock, 0);
  const slowMoving = products.filter((p) => (p.daysIdle ?? 0) >= 5);
  const slowMovingValue = slowMoving.reduce((s, p) => s + p.mrp * p.stock, 0);
  const donationEligible = products.filter((p) => p.expiryDays !== undefined && p.expiryDays <= 7 && p.stock > 0);

  const counts = useMemo(() => ({
    total:    products.length,
    critical: products.filter((p) => p.status === "Critical").length,
    dead:     products.filter((p) => p.status === "Dead Stock").length,
    low:      products.filter((p) => p.status === "Low Stock").length,
  }), []);

  const visible = filter === "All" ? products : products.filter((p) => p.status === filter);

  const aiSuggestions = [
    ...expiringIn7.slice(0, 2).map((p) => ({
      id: `exp-${p.id}`, icon: Clock, iconColor: "text-alert", iconBg: "bg-alert/10",
      title: p.name,
      reason: `Expires in ${p.expiryDays} days — ${p.stock} units at risk`,
      action: `Apply ${Math.min(25, Math.ceil((7 - (p.expiryDays ?? 0)) * 4))}% discount to move stock quickly`,
      recoverable: Math.round(p.mrp * p.stock * 0.75),
      primary: "Apply Offer", secondary: "Dismiss", link: "/offers",
    })),
    ...slowMoving.slice(0, 2).map((p) => ({
      id: `slow-${p.id}`, icon: TrendingDown, iconColor: "text-warning", iconBg: "bg-warning/10",
      title: p.name,
      reason: `${p.daysIdle} days without a sale — ₹${(p.mrp * p.stock).toLocaleString("en-IN")} blocked`,
      action: "Bundle with a fast-mover at 8% off to clear stock",
      recoverable: Math.round(p.mrp * p.stock * 0.6),
      primary: "Build Bundle", secondary: "Dismiss", link: "/offers",
    })),
    ...donationEligible.slice(0, 1).map((p) => ({
      id: `don-${p.id}`, icon: Heart, iconColor: "text-success", iconBg: "bg-success/10",
      title: p.name,
      reason: `${p.stock} units expire in ${p.expiryDays} days — donate before waste`,
      action: `Donating saves ≈${((p.weightKg ?? 0.5) * p.stock * 2.5).toFixed(1)} kg CO₂ & feeds families`,
      recoverable: 0, primary: "Donate", secondary: "Dismiss", link: "/ngo",
    })),
    {
      id: "promo-weekend", icon: Zap, iconColor: "text-primary", iconBg: "bg-accent",
      title: "Weekend Promotion",
      reason: "Saturday tomorrow — Rice & Oil sell 40% more on weekends",
      action: "Running a promotion today could recover ₹1,250+ in revenue",
      recoverable: 1250, primary: "Create Offer", link: "/offers",
    },
  ].filter((s) => !dismissed.has(s.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stock Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Live inventory across {counts.total} SKUs</p>
      </div>

      {/* Streak banner */}
      <div className="rounded-xl shadow-card p-5 flex items-center gap-4 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D4F2E 0%, #1A7A45 60%, #F6C90E 140%)" }}>
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
          <Flame className="w-7 h-7" style={{ color: "#F6C90E" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-lg">🔥 7-Day Offer Streak!</span>
            <span className="text-[10px] uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded-full font-semibold">On fire</span>
          </div>
          <div className="text-sm text-white/90 mt-1">
            You've sent offers 7 days in a row. Keep it up to unlock <b>"Consistent Merchant"</b> badge <Award className="inline w-4 h-4 -mt-0.5" style={{ color: "#F6C90E" }} />
          </div>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: "#F6C90E" }} />
            ))}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`e${i}`} className="flex-1 h-1.5 rounded-full bg-white/20" />
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={counts.total}    icon={Package}      borderClass="border-l-primary"          iconClass="text-primary" />
        <StatCard label="Critical"   value={counts.critical} icon={AlertTriangle} borderClass="border-l-alert"           iconClass="text-alert" />
        <StatCard label="Dead Stock" value={counts.dead}     icon={Skull}        borderClass="border-l-muted-foreground" iconClass="text-muted-foreground" />
        <StatCard label="Low Stock"  value={counts.low}      icon={TrendingDown}  borderClass="border-l-warning"         iconClass="text-warning" />
      </div>

      {/* Intelligence Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl shadow-card p-5 border-t-4 border-t-alert">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-alert/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-alert" />
            </div>
            <span className="font-semibold text-sm">Expiry Watch</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Expiring in 7 days</span><span className="font-bold text-alert">{expiringIn7.length} products</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Expiring in 30 days</span><span className="font-bold text-warning">{expiringIn30.length} products</span></div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Potential loss (7d)</span><span className="font-bold">₹{potentialLoss7.toLocaleString("en-IN")}</span></div>
            {expiringIn7.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-xs pt-0.5">
                <span className="w-2 h-2 rounded-full bg-alert shrink-0" />
                <span className="flex-1 truncate text-foreground">{p.name}</span>
                <span className="text-alert font-medium">{p.expiryDays}d</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-5 border-t-4 border-t-warning">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-warning" />
            </div>
            <span className="font-semibold text-sm">Slow Movers</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Products stagnant</span><span className="font-bold text-warning">{slowMoving.length} items</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Inventory blocked</span><span className="font-bold">₹{slowMovingValue.toLocaleString("en-IN")}</span></div>
            <div className="h-px bg-border my-1" />
            <div className="text-xs bg-warning/10 text-warning rounded-lg p-2 font-medium">💡 Bundle slow movers with bestsellers at 8-10% off</div>
            {slowMoving.slice(0, 2).map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                <span className="flex-1 truncate text-foreground">{p.name}</span>
                <span className="text-warning font-medium">{p.daysIdle}d idle</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-5 border-t-4 border-t-success">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-success" />
            </div>
            <span className="font-semibold text-sm">Donation Eligible</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Eligible products</span><span className="font-bold text-success">{donationEligible.length} items</span></div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">CO₂ you can save</span>
              <span className="font-bold flex items-center gap-1"><Leaf className="w-3 h-3 text-success" />{donationEligible.reduce((s, p) => s + (p.weightKg ?? 0.5) * p.stock * 2.5, 0).toFixed(1)} kg</span>
            </div>
            <div className="h-px bg-border my-1" />
            {donationEligible.slice(0, 2).map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                <span className="flex-1 truncate text-foreground">{p.name}</span>
                <span className="text-success font-medium">{p.stock} units</span>
              </div>
            ))}
            <Link to="/ngo" className="flex items-center justify-center gap-1 w-full bg-success/10 hover:bg-success/20 text-success text-xs font-semibold rounded-lg py-2 transition-colors mt-1">
              Donate Now <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {visible.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium text-foreground">No products in this filter</div>
          <div className="text-xs text-muted-foreground mt-1">Try selecting a different status</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visible.map((p) => {
            const m = statusMeta[p.status];
            const showUrgency = p.status === "Critical" || p.status === "Dead Stock";
            const days = p.daysIdle ?? 0;
            const urgency = Math.min(100, (days / 14) * 100);
            const discountSuggest = p.expiryDays !== undefined && p.expiryDays <= 7 ? Math.min(30, Math.ceil((7 - p.expiryDays) * 4) + 10) : 10;
            return (
              <div key={p.id} className={`bg-card rounded-xl shadow-card border-l-4 ${m.border} p-4 flex flex-col gap-2 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${m.bg} ${m.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />{p.status}
                  </span>
                  {p.expiryDays !== undefined && p.expiryDays <= 7 && (
                    <span className="text-[9px] font-bold text-alert bg-alert/10 px-1.5 py-0.5 rounded-full">{p.expiryDays}d exp</span>
                  )}
                </div>
                <div className="font-semibold text-[14px] text-foreground leading-tight">{p.name}</div>
                <span className="inline-block text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit">{p.category}</span>
                <div className="mt-1">
                  <div className={`text-2xl font-bold ${m.text}`}>{p.stock} <span className="text-xs font-medium text-muted-foreground">{p.unit}</span></div>
                  <div className="text-xs text-muted-foreground mt-0.5">MRP ₹{p.mrp}</div>
                </div>
                {showUrgency && days > 0 && (
                  <div className="mt-1 space-y-1">
                    <div className="text-[10px] font-semibold text-alert">⏳ {p.status === "Dead Stock" ? "Dead" : "Idle"} for {days} days — act now!</div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-alert transition-all" style={{ width: `${urgency}%` }} />
                    </div>
                  </div>
                )}
                {showUrgency && (
                  <div className="mt-1 text-[11px] bg-accent text-accent-foreground rounded-md px-2 py-1.5 flex items-center gap-1">
                    <Bot className="w-3 h-3" /> AI suggests {discountSuggest}% off
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Insights Panel */}
      <div className="bg-card rounded-xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground">AI Merchant Insights</h2>
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{aiSuggestions.length} active</span>
        </div>
        {aiSuggestions.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-success" />
            </div>
            <div className="text-sm font-medium">All caught up!</div>
            <div className="text-xs text-muted-foreground mt-1">No urgent actions right now.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiSuggestions.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="border border-border rounded-xl p-4 space-y-3 bg-background hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${s.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{s.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.reason}</div>
                    </div>
                  </div>
                  <div className="text-xs text-foreground bg-accent/60 rounded-lg p-2.5 leading-relaxed">→ {s.action}</div>
                  {s.recoverable > 0 && (
                    <div className="text-[10px] font-semibold text-success flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" /> Recoverable: ₹{s.recoverable.toLocaleString("en-IN")}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link to={s.link as any}
                      className="flex-1 text-xs bg-primary text-primary-foreground rounded-md py-1.5 font-medium flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">
                      <Check className="w-3 h-3" /> {s.primary}
                    </Link>
                    {s.secondary && (
                      <button onClick={() => setDismissed((d) => new Set(d).add(s.id))}
                        className="text-xs border border-border rounded-md py-1.5 px-2 hover:bg-muted transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, borderClass, iconClass }: {
  label: string; value: number; icon: React.ComponentType<{ className?: string }>; borderClass: string; iconClass: string;
}) {
  return (
    <div className={`bg-card rounded-xl shadow-card border-l-4 ${borderClass} p-4 flex items-center justify-between hover:shadow-md transition-shadow`}>
      <div>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
      <Icon className={`w-8 h-8 ${iconClass} opacity-70`} />
    </div>
  );
}
