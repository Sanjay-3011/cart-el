import { createFileRoute } from "@tanstack/react-router";
import { useState, useSyncExternalStore } from "react";
import { ngos, products, donationStore, type NgoCategory } from "@/data/mock";
import { Heart, Filter, Check, Leaf, Users, Package } from "lucide-react";

export const Route = createFileRoute("/ngo")({
  component: NGODonationPage,
});

const allCategories: NgoCategory[] = ["Food Donation", "Children", "Elder Care", "Community Support"];
const categoryEmoji: Record<NgoCategory, string> = {
  "Food Donation": "🍱",
  "Children": "👶",
  "Elder Care": "👴",
  "Community Support": "🤝",
};

type DonationStep = "select-ngo" | "select-product" | "confirm" | "done";

function NGODonationPage() {
  const records = useSyncExternalStore(donationStore.subscribe, donationStore.getAll, donationStore.getAll);
  const [catFilter, setCatFilter] = useState<NgoCategory | "All">("All");
  const [step, setStep] = useState<DonationStep>("select-ngo");
  const [selectedNgo, setSelectedNgo] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const donatable = products.filter((p) => p.expiryDays !== undefined && p.expiryDays <= 14 && p.stock > 0);
  const filteredNgos = catFilter === "All" ? ngos : ngos.filter((n) => n.category === catFilter);

  const ngo = ngos.find((n) => n.id === selectedNgo);
  const product = products.find((p) => p.id === selectedProduct);

  const confirmDonation = () => {
    if (!ngo || !product) return;
    donationStore.add({
      productId: product.id,
      productName: product.name,
      ngoId: ngo.id,
      ngoName: ngo.name,
      quantity,
      weightKg: (product.weightKg ?? 0.5) * quantity,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    });
    setStep("done");
  };

  const reset = () => {
    setStep("select-ngo"); setSelectedNgo(null);
    setSelectedProduct(null); setQuantity(1);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">NGO Donation</h1>
        <p className="text-sm text-muted-foreground mt-1">Donate expiring products to partner NGOs. Reduce waste. Feed families.</p>
      </div>

      {/* Impact banner */}
      <div className="rounded-xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0D4F2E 0%, #1A7A45 100%)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="grid grid-cols-3 gap-4 relative">
          <div className="text-center">
            <div className="text-2xl font-black">{records.reduce((s, r) => s + r.weightKg, 0).toFixed(1)} <span className="text-sm font-medium opacity-80">kg</span></div>
            <div className="text-xs text-white/70 mt-0.5">Food Saved</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-2xl font-black">{records.reduce((s, r) => s + r.quantity, 0)}</div>
            <div className="text-xs text-white/70 mt-0.5">Products Donated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black" style={{ color: "#F6C90E" }}>{records.reduce((s, r) => s + r.carbonSavedKg, 0).toFixed(1)} <span className="text-sm font-medium opacity-80 text-white">kg</span></div>
            <div className="text-xs text-white/70 mt-0.5">CO₂ Prevented</div>
          </div>
        </div>
      </div>

      {step === "done" ? (
        <div className="bg-card rounded-xl shadow-card p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Donation Recorded! 🎉</h2>
          <p className="text-sm text-muted-foreground mb-1">
            <b>{quantity} units</b> of <b>{product?.name}</b> donated to <b>{ngo?.name}</b>
          </p>
          <p className="text-xs text-success flex items-center gap-1 mt-1">
            <Leaf className="w-3 h-3" /> Saved ≈{((product?.weightKg ?? 0.5) * quantity * 2.5).toFixed(1)} kg CO₂
          </p>
          <button onClick={reset} className="mt-6 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90">
            Donate Again
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Step indicator */}
          <div className="lg:col-span-3 flex items-center gap-3 bg-card rounded-xl shadow-card p-4">
            {(["select-ngo", "select-product", "confirm"] as DonationStep[]).map((s, i) => {
              const stepLabels = ["1. Select NGO", "2. Select Product", "3. Confirm"];
              const isActive = step === s;
              const isDone = ["select-ngo", "select-product", "confirm"].indexOf(step) > i;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isDone ? "bg-success text-white" : isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{stepLabels[i]}</span>
                  {i < 2 && <div className="flex-1 h-px bg-border" />}
                </div>
              );
            })}
          </div>

          {/* NGO Selection */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Partner NGOs</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Filter className="w-3.5 h-3.5" /> Filter
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["All", ...allCategories] as const).map((c) => (
                <button key={c} onClick={() => setCatFilter(c as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${catFilter === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                  {c !== "All" ? categoryEmoji[c as NgoCategory] + " " : ""}{c}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredNgos.map((n) => (
                <div key={n.id} onClick={() => { setSelectedNgo(n.id); setStep("select-product"); }}
                  className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${selectedNgo === n.id ? "border-primary bg-accent/30" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-2xl shrink-0">{n.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{n.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.address}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">{n.category}</span>
                        <span className="text-[10px] text-muted-foreground">📞 {n.contact}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-foreground">{n.totalReceived} kg</div>
                      <div className="text-[10px] text-muted-foreground">received total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — product + confirm */}
          <div className="space-y-4">
            {(step === "select-product" || step === "confirm") && (
              <div className="bg-card rounded-xl shadow-card p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Expiring Products</h2>
                <div className="space-y-2">
                  {donatable.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-6">No products eligible right now</div>
                  ) : donatable.map((p) => (
                    <div key={p.id} onClick={() => { setSelectedProduct(p.id); setQuantity(Math.min(10, p.stock)); setStep("confirm"); }}
                      className={`rounded-lg border-2 p-3 cursor-pointer transition-all ${selectedProduct === p.id ? "border-primary bg-accent/30" : "border-border hover:border-primary/40"}`}>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.stock} {p.unit} · Expires in {p.expiryDays}d</div>
                        </div>
                        <span className="text-[10px] font-bold text-alert bg-alert/10 px-1.5 py-0.5 rounded">{p.expiryDays}d</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "confirm" && product && ngo && (
              <div className="bg-card rounded-xl shadow-card p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Confirm Donation</h2>
                <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">NGO</span><span className="font-medium">{ngo.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium">{product.name}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Quantity</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-7 h-7 rounded-full bg-card border flex items-center justify-center text-sm font-bold">−</button>
                      <span className="font-bold w-8 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-7 h-7 rounded-full bg-card border flex items-center justify-center text-sm font-bold">+</button>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Leaf className="w-3 h-3 text-success" />CO₂ saved</span>
                    <span className="font-bold text-success">{((product.weightKg ?? 0.5) * quantity * 2.5).toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3 text-primary" />Families helped</span>
                    <span className="font-bold text-primary">~{Math.max(1, Math.round((product.weightKg ?? 0.5) * quantity / 2))} family</span>
                  </div>
                </div>
                <button onClick={confirmDonation}
                  className="w-full bg-success text-white rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <Heart className="w-4 h-4" /> Confirm Donation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Donation History */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Donation History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-2 font-semibold">Date</th>
                <th className="text-left px-5 py-2 font-semibold">Product</th>
                <th className="text-left px-5 py-2 font-semibold">NGO</th>
                <th className="text-left px-5 py-2 font-semibold">Qty</th>
                <th className="text-left px-5 py-2 font-semibold">CO₂ Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{r.productName}</td>
                  <td className="px-5 py-3 text-foreground">{r.ngoName}</td>
                  <td className="px-5 py-3">{r.quantity}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-success font-semibold">
                      <Leaf className="w-3 h-3" /> {r.carbonSavedKg.toFixed(1)} kg
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
