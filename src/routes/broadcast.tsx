import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { customers, products, offerStore, type Customer } from "@/data/mock";
import { Send, ChevronDown, CheckCircle2, Clock, XCircle, Target, Sparkles, Trophy } from "lucide-react";

export const Route = createFileRoute("/broadcast")({
  component: Broadcast,
});

type DeliveryStatus = "Delivered" | "Pending" | "Failed";
type Tab = "All" | "Credit" | "Regular" | "Business" | "Frequent";

function Broadcast() {
  const offer = useSyncExternalStore(offerStore.subscribe, offerStore.get, offerStore.get);
  const offerProducts = products.filter((p) => offer?.productIds.includes(p.id));
  const summary = offerProducts.map((p) => p.name).join(", ") || "No offer approved yet";

  const [tab, setTab] = useState<Tab>("All");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(customers.filter((c) => c.type === "Credit").map((c) => c.id))
  );
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduleAt, setScheduleAt] = useState("2026-05-27T10:00");
  const [sent, setSent] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [sendStart, setSendStart] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);

  const visible = customers.filter((c) =>
    tab === "All" ? true : c.type === tab
  );

  const selectedList = customers.filter((c) => selected.has(c.id));

  const toggle = (id: string) => setSelected((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleAll = () => {
    const allSelected = visible.every((c) => selected.has(c.id));
    setSelected((s) => {
      const n = new Set(s);
      visible.forEach((c) => allSelected ? n.delete(c.id) : n.add(c.id));
      return n;
    });
  };

  const counts = {
    All: customers.length,
    Credit: customers.filter((c) => c.type === "Credit").length,
    Regular: customers.filter((c) => c.type === "Regular").length,
    Business: customers.filter((c) => c.type === "Business").length,
    Frequent: customers.filter((c) => c.type === "Frequent").length,
  };

  useEffect(() => {
    if (!sent) return;
    setDeliveryProgress(0);
    setSendStart(Date.now());
    const total = selectedList.length;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDeliveryProgress(i);
      setElapsed(Math.round((Date.now() - (sendStart || Date.now())) / 1000));
      if (i >= total) {
        setElapsed(Math.round((Date.now() - sendStart) / 1000) || i * 0.6);
        clearInterval(t);
      }
    }, 600);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sent, selectedList.length]);

  const deliveryFor = (c: Customer, idx: number): DeliveryStatus => {
    if (idx >= deliveryProgress) return "Pending";
    if (c.id === "c4") return "Failed";
    return "Delivered";
  };

  const delivered = selectedList.filter((c, i) => deliveryFor(c, i) === "Delivered").length;
  const allDone = deliveryProgress >= selectedList.length && selectedList.length > 0;

  const score = useMemo(() => {
    if (!allDone) return null;
    const reachPct = (delivered / selectedList.length) || 0;
    const reach = Math.round(reachPct * 25);
    const elapsedSec = Math.max(1, Math.round(selectedList.length * 0.6));
    const speed = elapsedSec <= 15 ? 20 : elapsedSec <= 30 ? 14 : 8;
    const disc = offer?.discountValue ?? 0;
    const discount = offer?.discountType === "percent"
      ? (disc >= 8 && disc <= 15 ? 22 : disc < 8 ? 14 : 12)
      : (disc >= 10 && disc <= 30 ? 22 : 14);
    const hr = new Date().getHours();
    const peak = hr >= 19 && hr <= 21;
    const timing = peak ? 33 : hr >= 17 ? 25 : 20;
    return {
      total: reach + speed + discount + timing,
      parts: [
        { label: "Reach", value: `${delivered}/${selectedList.length} customers`, pts: reach, max: 25, ok: reachPct >= 0.9 },
        { label: "Speed", value: `Sent in ${elapsedSec}s`, pts: speed, max: 20, ok: speed >= 18 },
        { label: "Discount", value: offer ? `${disc}${offer.discountType === "percent" ? "%" : "₹"} (optimal)` : "—", pts: discount, max: 25, ok: discount >= 20 },
        { label: "Timing", value: `${hr}:00 (${peak ? "peak" : "off-peak"})`, pts: timing, max: 30, ok: peak },
      ],
      peak,
    };
  }, [allDone, delivered, selectedList.length, offer]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WhatsApp Broadcast</h1>
        <p className="text-sm text-muted-foreground mt-1">Send the offer to your customers.</p>
      </div>

      {/* Offer summary */}
      <div className="bg-card rounded-xl shadow-card p-5 flex items-center gap-4">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Approved Offer</div>
          <div className="font-semibold text-foreground mt-1">
            {summary} — {offer?.discountType === "percent" ? `${offer?.discountValue}% off` : `₹${offer?.discountValue} off`}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Valid till {offer?.validTo}</div>
        </div>
        <div className="hidden sm:block w-20 h-20 rounded-lg text-white text-[9px] p-2 leading-tight"
          style={{ background: "linear-gradient(135deg, #0D4F2E, #1A7A45)" }}>
          <div className="font-bold">AADHIRAI MART</div>
          <div className="mt-1 text-[8px] opacity-90">Special Offer</div>
        </div>
      </div>

      {!sent ? (
        <>
          {/* Customer list */}
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-3 bg-primary/10 border-b border-border flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-foreground">AI Customer Segmentation</div>
                <div className="text-xs text-foreground/80 mt-0.5">Based on the products in this offer, we recommend targeting <b>Business (B2B)</b> and <b>Frequent Buyers</b>. They have a 92% higher probability of purchasing.</div>
              </div>
            </div>
            <div className="flex border-b border-border bg-background/50 overflow-x-auto hide-scrollbar">
              {(["All", "Credit", "Business", "Frequent", "Regular"] as Tab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`relative px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}>
                  {t === "All" ? "All" : t === "Credit" ? "Credit" : t === "Business" ? "B2B / Business" : t === "Frequent" ? "Frequent Buyers" : "Regular"} ({counts[t]})
                  {(t === "Business" || t === "Frequent") && (
                     <span className="absolute top-2.5 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 border-b border-border flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary"
                  checked={visible.length > 0 && visible.every((c) => selected.has(c.id))}
                  onChange={toggleAll} />
                <span>Select all</span>
              </label>
              <span className="text-muted-foreground">{selected.size} of {customers.length} selected</span>
            </div>
            <div className="divide-y divide-border">
              <div className="hidden md:grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr] gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-background/30">
                <div className="w-4" /><div>Name</div><div>Phone</div><div>Type</div><div>Last Purchase</div><div>Outstanding</div>
              </div>
              {visible.map((c) => (
                <label key={c.id} className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr] gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer items-center">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="w-4 h-4 accent-primary" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{c.name}</div>
                    <div className="md:hidden text-xs text-muted-foreground">{c.phone} · {c.type}</div>
                  </div>
                  <div className="hidden md:block text-sm text-muted-foreground">{c.phone}</div>
                  <div className="hidden md:block">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.type === "Credit" ? "bg-warning/10 text-warning" : 
                      c.type === "Business" ? "bg-indigo-500/10 text-indigo-500" :
                      c.type === "Frequent" ? "bg-primary/10 text-primary" :
                      "bg-success/10 text-success"
                    }`}>{c.type}</span>
                  </div>
                  <div className="hidden md:block text-sm text-muted-foreground">{c.lastPurchase}</div>
                  <div className="hidden md:block text-sm font-medium text-foreground">
                    {c.outstanding > 0 ? `₹${c.outstanding.toLocaleString("en-IN")}` : "—"}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-card rounded-xl shadow-card p-5 space-y-3">
            <h2 className="font-semibold text-foreground">Schedule</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={scheduleMode === "now"} onChange={() => setScheduleMode("now")} className="accent-primary" />
                <span className="text-sm">Send Now</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={scheduleMode === "later"} onChange={() => setScheduleMode("later")} className="accent-primary" />
                <span className="text-sm">Schedule for later</span>
              </label>
              {scheduleMode === "later" && (
                <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)}
                  className="ml-6 px-3 py-2 border border-border rounded-lg text-sm bg-background" />
              )}
            </div>
          </div>

          <button onClick={() => setSent(true)} disabled={selected.size === 0}
            className="w-full bg-primary text-primary-foreground rounded-lg py-4 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 shadow-card">
            <Send className="w-5 h-5" /> Send to {selected.size} Customer{selected.size !== 1 && "s"} via WhatsApp
          </button>
        </>
      ) : (
        <>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-foreground">Delivery Status</h2>
                <button onClick={() => setSent(false)} className="text-xs text-muted-foreground hover:text-foreground">← New broadcast</button>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Sent {deliveryProgress} of {selectedList.length}...
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(deliveryProgress / selectedList.length) * 100}%` }} />
              </div>
            </div>
            <div className="divide-y divide-border">
              {selectedList.map((c, i) => {
                const st = deliveryFor(c, i);
                return (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                    {st === "Delivered" && <CheckCircle2 className="w-5 h-5 text-success" />}
                    {st === "Pending" && <Clock className="w-5 h-5 text-warning" />}
                    {st === "Failed" && <XCircle className="w-5 h-5 text-alert" />}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </div>
                    <div className={`text-xs font-medium ${
                      st === "Delivered" ? "text-success" : st === "Failed" ? "text-alert" : "text-warning"
                    }`}>
                      {st === "Delivered" ? `Delivered ${i + 1} min ago` : st === "Failed" ? "Failed (invalid number)" : "Pending"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campaign score */}
          {score && (
            <div className="rounded-xl shadow-card overflow-hidden text-white animate-in fade-in slide-in-from-bottom-3 duration-500"
              style={{ background: "linear-gradient(135deg, #0D4F2E 0%, #1A7A45 100%)" }}>
              <div className="p-6 flex items-center gap-5 border-b border-white/15">
                <div className="relative w-24 h-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.15)" strokeWidth="10" fill="none" />
                    <circle cx="50" cy="50" r="42" stroke="#F6C90E" strokeWidth="10" fill="none"
                      strokeDasharray={`${(score.total / 100) * 264} 264`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-black" style={{ color: "#F6C90E" }}>{score.total}</div>
                    <div className="text-[9px] uppercase tracking-wide opacity-80">/ 100</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <Target className="w-5 h-5" style={{ color: "#F6C90E" }} />
                    Campaign Score
                  </div>
                  <div className="text-sm text-white/80 mt-1">
                    {score.total >= 85 ? "Excellent broadcast! 🎉" : score.total >= 70 ? "Solid run — small tweaks ahead." : "Room to grow. See tips below."}
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-2 bg-white/5">
                {score.parts.map((p) => (
                  <div key={p.label} className="flex items-center gap-3">
                    <span className="w-5 text-base">{p.ok ? "✅" : "⚠️"}</span>
                    <span className="w-24 font-semibold text-sm">{p.label}:</span>
                    <span className="flex-1 text-sm text-white/85">{p.value}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: "#F6C90E" }}>{p.pts}</span>
                    <span className="text-xs text-white/50 tabular-nums">/ {p.max}</span>
                  </div>
                ))}
              </div>
              {!score.peak && (
                <div className="px-5 py-3 bg-white/10 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: "#F6C90E" }} />
                  💡 Tip: Send between 7–9pm for <b>+15 timing score</b> next time!
                </div>
              )}
              <div className="px-5 py-4 bg-black/20 flex items-center gap-3">
                <Trophy className="w-6 h-6" style={{ color: "#F6C90E" }} />
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wide text-white/70">New badge unlocked</div>
                  <div className="font-bold">First Broadcast 🎊</div>
                </div>
                <div className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: "#F6C90E", color: "#0D4F2E" }}>+50 XP</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* History */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <button onClick={() => setHistoryOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30">
          <h2 className="font-semibold text-foreground">Broadcast History</h2>
          <ChevronDown className={`w-4 h-4 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
        </button>
        {historyOpen && (
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-sm">
              <thead className="bg-background/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-2 font-semibold">Date</th>
                  <th className="text-left px-5 py-2 font-semibold">Offer</th>
                  <th className="text-left px-5 py-2 font-semibold">Recipients</th>
                  <th className="text-left px-5 py-2 font-semibold">Delivered</th>
                  <th className="text-left px-5 py-2 font-semibold">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { d: "26 May", o: "Sunflower Oil 10%", r: 8, dl: 6, f: 1 },
                  { d: "20 May", o: "Toor Dal 8%", r: 10, dl: 9, f: 0 },
                  { d: "15 May", o: "Weekend Bundle", r: 6, dl: 6, f: 0 },
                ].map((row) => (
                  <tr key={row.d}>
                    <td className="px-5 py-3 text-foreground">{row.d}</td>
                    <td className="px-5 py-3 text-foreground">{row.o}</td>
                    <td className="px-5 py-3">{row.r}</td>
                    <td className="px-5 py-3 text-success font-medium">{row.dl}</td>
                    <td className="px-5 py-3 text-alert font-medium">{row.f}</td>
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
