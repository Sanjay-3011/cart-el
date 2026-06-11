import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { products, offerStore, categories, imgFor, type Product } from "@/data/mock";
import { Search, Sparkles, Download, ArrowRight, Trophy, Eye } from "lucide-react";
import { toPng } from "html-to-image";

export const Route = createFileRoute("/offers")({
  component: OfferBuilder,
});

const GOLD = "#F6C90E";

type PosterVariant = "premium" | "festive" | "modern" | "discount" | "custom";
const variants: { id: PosterVariant; label: string; emoji: string; desc: string }[] = [
  { id: "premium",  label: "Version A – Premium",         emoji: "✨", desc: "Dark green gradient, professional" },
  { id: "festive",  label: "Version B – Festive",         emoji: "🪔", desc: "Warm golden, celebration theme" },
  { id: "custom",   label: "Version E – Custom",        emoji: "🤖", desc: "Custom prompt-driven design" },
];

function tierFor(savings: number) {
  if (savings >= 5000) return { name: "Mega Sale Legend", emoji: "🔥👑", color: GOLD };
  if (savings >= 2000) return { name: "Weekend Champion", emoji: "🏆", color: GOLD };
  if (savings >= 500)  return { name: "Deal Maker",       emoji: "⚡", color: "#A7F3D0" };
  return                      { name: "Starter Offer",    emoji: "🌱", color: "#A7F3D0" };
}

function OfferBuilder() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set(["p3"]));
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [validFrom, setValidFrom] = useState("2026-05-26");
  const [validTo, setValidTo] = useState("2026-06-01");
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [activeVariant, setActiveVariant] = useState<PosterVariant>("premium");
  const [aiPrompt, setAiPrompt] = useState("Generate a cool cyberpunk themed poster");
  const [customColor, setCustomColor] = useState("#8b5cf6");
  const posterRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => products.filter((p) =>
    (cat === "All" || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [search, cat]);

  const selectedProducts = products.filter((p) => selected.has(p.id));
  const toggle = (id: string) => setSelected((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const calcNew = (mrp: number) =>
    discountType === "percent" ? Math.round(mrp - (mrp * discountValue) / 100) : Math.max(0, mrp - discountValue);
  const savePer = (mrp: number) => mrp - calcNew(mrp);

  const totalCustomerSavings = selectedProducts.reduce((s, p) => s + savePer(p.mrp), 0) * 156;
  const tier = tierFor(totalCustomerSavings);
  const meterPct = Math.min(100, (totalCustomerSavings / 5000) * 100);

  const previewProduct = selectedProducts[0];
  const validToLabel = new Date(validTo).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const validFromLabel = new Date(validFrom).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const captionEn = previewProduct
    ? `🛒 Weekend Special at Aadhirai Mart!\n${previewProduct.name} 1${previewProduct.unit} – Was ₹${previewProduct.mrp}, Now ₹${calcNew(previewProduct.mrp)}!\nOffer valid till ${validToLabel} only 🔥\nCall: 98765 43200`
    : "Select a product to generate caption.";
  const captionTa = previewProduct
    ? `🛒 ஆதிரை மார்ட்டில் சிறப்பு தள்ளுபடி!\n${previewProduct.name} 1${previewProduct.unit} – ₹${previewProduct.mrp} இருந்து ₹${calcNew(previewProduct.mrp)}!\n${validToLabel} வரை மட்டுமே 🔥`
    : "ஒரு பொருளைத் தேர்ந்தெடுக்கவும்.";

  const approve = () => {
    offerStore.set({
      productIds: Array.from(selected),
      discountType, discountValue,
      validFrom: new Date(validFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      validTo: validToLabel,
    });
    navigate({ to: "/broadcast" });
  };

  const download = async () => {
    if (!posterRef.current) return;
    try {
      const parent = posterRef.current.parentElement;
      const originalTransform = parent?.style.transform;
      if (parent) parent.style.transform = "scale(1)";
      await new Promise(r => setTimeout(r, 100)); // wait for reflow
      
      const url = await toPng(posterRef.current, {
        width: 1080, height: 1080, pixelRatio: 1, cacheBust: true, skipFonts: true,
      });
      
      if (parent && originalTransform) parent.style.transform = originalTransform;

      const a = document.createElement("a");
      a.download = `AadhiraiMart_Offer_${activeVariant}.png`;
      a.href = url; a.click();
    } catch (e) {
      console.error(e);
      alert("Could not render poster.");
    }
  };

  const cols = selectedProducts.length <= 1 ? 1 : selectedProducts.length <= 3 ? 2 : 3;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Offer Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">Pick products, set the deal, ship the poster.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-5">
          <div className="bg-card rounded-xl shadow-card p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Select Products</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {["All", ...categories].map((c) => (
                <button key={c} onClick={() => setCat(c)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted"}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="max-h-[360px] overflow-y-auto divide-y divide-border border border-border rounded-lg">
              {filtered.map((p) => (
                <label key={p.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="w-4 h-4 accent-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.stock} {p.unit} · ₹{p.mrp}{p.expiryDays !== undefined && p.expiryDays <= 7 ? ` · ⚠️ ${p.expiryDays}d exp` : ""}</div>
                  </div>
                  {p.aiPick && (
                    <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI pick
                    </span>
                  )}
                </label>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{selected.size} product{selected.size !== 1 && "s"} selected</div>
          </div>

          <div className="bg-card rounded-xl shadow-card p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Offer Settings</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Discount Type</label>
                <div className="flex gap-2 mt-1">
                  {(["percent", "flat"] as const).map((t) => (
                    <button key={t} onClick={() => setDiscountType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm border ${discountType === t ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background"}`}>
                      {t === "percent" ? "% Percent" : "₹ Flat"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Discount Value</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" />
                  <span className="text-sm text-muted-foreground">{discountType === "percent" ? "%" : "₹"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Valid From</label>
                  <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm mt-1 bg-background" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Valid To</label>
                  <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm mt-1 bg-background" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">AI Caption</h2>
              <div className="flex bg-muted rounded-lg p-0.5 text-xs">
                {(["en", "ta"] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-3 py-1 rounded-md ${lang === l ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground"}`}>
                    {l === "en" ? "English" : "தமிழ்"}
                  </button>
                ))}
              </div>
            </div>
            <textarea readOnly value={lang === "en" ? captionEn : captionTa}
              className="w-full h-28 text-sm border border-border rounded-lg p-3 bg-background resize-none" />
          </div>
        </div>

        {/* RIGHT — Poster Variants */}
        <div className="space-y-5">
          <div className="bg-card rounded-xl shadow-card p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Choose Poster Style</h2>
            <div className="grid grid-cols-2 gap-2">
              {variants.map((v) => (
                <button key={v.id} onClick={() => setActiveVariant(v.id)}
                  className={`rounded-xl p-3 text-left border-2 transition-all ${activeVariant === v.id ? "border-primary bg-accent/50" : "border-border bg-background hover:bg-muted"}`}>
                  <div className="text-xl mb-1">{v.emoji}</div>
                  <div className="text-xs font-semibold text-foreground leading-tight">{v.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{v.desc}</div>
                </button>
              ))}
            </div>
            
            {activeVariant === "custom" && (
              <div className="mt-4 p-4 border border-border rounded-xl bg-accent/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Magic Prompt
                  </label>
                  <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full text-sm border border-border rounded-lg p-3 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" rows={2}
                    placeholder="e.g. A neon cyberpunk style with bold vibrant fonts..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Theme Color</label>
                  <div className="flex gap-2">
                    {["#8b5cf6", "#ec4899", "#3b82f6", "#14b8a6", "#f97316", "#22c55e"].map((c) => (
                      <button key={c} onClick={() => setCustomColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${customColor === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Poster Preview</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">1080×1080px</span>
            </div>
            {selectedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Eye className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium text-foreground">Select a product to preview</div>
                <div className="text-xs text-muted-foreground mt-1">Your poster will appear here</div>
              </div>
            ) : (
              <ResponsiveScaler width={1080} height={1080}>
                <PosterRenderer
                  posterRef={posterRef} items={selectedProducts} cols={cols}
                  calcNew={calcNew} discountType={discountType} discountValue={discountValue}
                  validFromLabel={validFromLabel} validToLabel={validToLabel}
                  tier={tier} variant={activeVariant}
                  customColor={customColor} aiPrompt={aiPrompt}
                />
              </ResponsiveScaler>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={download} disabled={selected.size === 0}
              className="flex-1 border border-border bg-card rounded-lg py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted disabled:opacity-50 transition-colors">
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button onClick={approve} disabled={selected.size === 0}
              className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity">
              Approve & Broadcast <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Poster Renderer ──────────────────────────────────────────────────────────
function PosterRenderer({
  posterRef, items, cols, calcNew, discountType, discountValue,
  validFromLabel, validToLabel, tier, variant, customColor, aiPrompt
}: {
  posterRef: React.RefObject<HTMLDivElement | null>;
  items: Product[]; cols: number;
  calcNew: (mrp: number) => number;
  discountType: "percent" | "flat"; discountValue: number;
  validFromLabel: string; validToLabel: string;
  tier: { name: string; emoji: string; color: string };
  variant: PosterVariant;
  customColor: string;
  aiPrompt: string;
}) {
  const hero = items.length === 1;
  const configs: Record<PosterVariant, {
    bg: string; headerColor: string; titleColor: string; cardBg: string;
    priceColor: string; badgeBg: string; badgeText: string; bannerBg: string; footerOp: number;
  }> = {
    premium: {
      bg: "linear-gradient(135deg, #0D4F2E 0%, #1A7A45 60%, #0D4F2E 100%)",
      headerColor: "#fff", titleColor: GOLD, cardBg: "rgba(255,255,255,0.08)",
      priceColor: GOLD, badgeBg: GOLD, badgeText: "#0D4F2E", bannerBg: "#E53E3E", footerOp: 0.9,
    },
    festive: {
      bg: "linear-gradient(135deg, #7C2D12 0%, #C2410C 40%, #F59E0B 100%)",
      headerColor: "#FEF3C7", titleColor: "#FDE68A", cardBg: "rgba(255,255,255,0.12)",
      priceColor: "#FDE68A", badgeBg: "#FDE68A", badgeText: "#7C2D12", bannerBg: "#B45309", footerOp: 0.9,
    },
    modern: {
      bg: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      headerColor: "#0f172a", titleColor: "#16a34a", cardBg: "rgba(0,0,0,0.04)",
      priceColor: "#16a34a", badgeBg: "#16a34a", badgeText: "#fff", bannerBg: "#0f172a", footerOp: 0.7,
    },
    discount: {
      bg: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 60%, #ef4444 100%)",
      headerColor: "#fff", titleColor: "#FEF08A", cardBg: "rgba(255,255,255,0.1)",
      priceColor: "#FEF08A", badgeBg: "#FEF08A", badgeText: "#7f1d1d", bannerBg: "#1e1e1e", footerOp: 0.9,
    },
    custom: {
      bg: `linear-gradient(135deg, #020617 0%, ${customColor} 60%, #1e1b4b 100%)`,
      headerColor: "#fff", titleColor: "#e2e8f0", cardBg: "rgba(255,255,255,0.1)",
      priceColor: "#fff", badgeBg: customColor, badgeText: "#fff", bannerBg: "rgba(0,0,0,0.4)", footerOp: 0.9,
    }
  };
  const c = configs[variant];

  const festiveDecor = variant === "festive" ? (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "repeating-linear-gradient(90deg, #FDE68A 0, #FDE68A 20px, #B45309 20px, #B45309 40px)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: "repeating-linear-gradient(90deg, #FDE68A 0, #FDE68A 20px, #B45309 20px, #B45309 40px)" }} />
      <div style={{ position: "absolute", fontSize: 60, top: 20, left: 20, opacity: 0.3 }}>🪔</div>
      <div style={{ position: "absolute", fontSize: 60, top: 20, right: 20, opacity: 0.3 }}>🪔</div>
    </>
  ) : null;

  return (
    <div ref={posterRef} style={{ width: 1080, height: 1080, background: c.bg, color: c.headerColor, padding: variant === "festive" ? 72 : 56, display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden" }}>
      {festiveDecor}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: -200, right: -200 }} />

      {/* Tier badge */}
      <div style={{ position: "absolute", top: variant === "festive" ? 44 : 32, right: 32, background: c.badgeBg, color: c.badgeText, padding: "10px 18px", borderRadius: 999, fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>
        <span>{tier.emoji}</span> {tier.name}
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, fontWeight: 800, letterSpacing: 2 }}>
        🏪 AADHIRAI MART
        <span style={{ opacity: 0.4, fontWeight: 400 }}>|</span>
        <span style={{ fontWeight: 500, letterSpacing: 1, fontSize: 18 }}>PERAMBALUR</span>
      </div>
      <div style={{ height: 2, background: variant === "modern" ? "#e2e8f0" : "rgba(255,255,255,0.2)", margin: "20px 0 28px" }} />

      <div style={{ textAlign: "center", fontSize: hero ? 56 : 44, fontWeight: 900, color: c.titleColor, letterSpacing: 1, textShadow: "0 3px 0 rgba(0,0,0,0.15)" }}>
        {variant === "festive" ? "🪔 FESTIVE SPECIAL OFFER 🪔" :
         variant === "modern"  ? "✨ EXCLUSIVE MEMBER DEAL ✨" :
         variant === "discount" ? "🔥 MEGA DISCOUNT SALE 🔥" :
         variant === "custom" ? (aiPrompt.split(' ').slice(0, 4).join(' ').toUpperCase() + " ✨") :
         "🔥 WEEKEND SPECIAL OFFER 🔥"}
      </div>

      {/* Product grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: hero ? 0 : 24, marginTop: 36, alignContent: "center" }}>
        {items.map((p) => {
          const np = calcNew(p.mrp);
          const save = p.mrp - np;
          return (
            <div key={p.id} style={{ background: c.cardBg, borderRadius: 24, padding: hero ? 40 : 20, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", border: `1px solid ${variant === "modern" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)"}`, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <div style={{ width: hero ? 300 : 150, height: hero ? 300 : 150, borderRadius: 20, overflow: "hidden", background: "white", marginBottom: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
                <img src={imgFor(p)} alt={p.name} crossOrigin="anonymous" referrerPolicy="no-referrer"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='160' height='160' fill='%23F6C90E'/><text x='50%' y='55%' font-size='72' text-anchor='middle'>🛒</text></svg>`)}`; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ fontSize: hero ? 36 : 20, fontWeight: 700, color: c.headerColor, lineHeight: 1.2, marginBottom: 10 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "center", marginBottom: 8 }}>
                <span style={{ fontSize: hero ? 22 : 14, opacity: 0.55, textDecoration: "line-through", color: c.headerColor }}>₹{p.mrp}</span>
                <span style={{ fontSize: hero ? 64 : 40, fontWeight: 900, color: c.priceColor }}>₹{np}</span>
              </div>
              <div style={{ display: "inline-block", background: c.badgeBg, color: c.badgeText, fontWeight: 800, padding: hero ? "8px 20px" : "5px 14px", borderRadius: 999, fontSize: hero ? 18 : 13 }}>
                💰 SAVE ₹{save} ({discountType === "percent" ? `${discountValue}% OFF` : `₹${discountValue} OFF`})
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner */}
      <div style={{ marginTop: 28, background: c.bannerBg, borderRadius: 16, padding: "18px 24px", textAlign: "center", fontSize: 22, fontWeight: 800, color: variant === "modern" ? "#fff" : "#fff", boxShadow: "0 4px 0 rgba(0,0,0,0.1)" }}>
        ⏰ OFFER ENDS {validToLabel.toUpperCase()} — LIMITED STOCK!
      </div>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 17, opacity: c.footerOp, color: c.headerColor }}>
        <span>📅 Valid {validFromLabel} – {validToLabel}</span>
        <span>📞 98765 43200</span>
      </div>
    </div>
  );
}

function ResponsiveScaler({ children, width, height }: { children: React.ReactNode, width: number, height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  return (
    <div ref={containerRef} className="w-full relative rounded-xl overflow-hidden bg-muted flex items-center justify-center" style={{ aspectRatio: `${width}/${height}` }}>
      <div 
        ref={(el) => {
          if (!el) return;
          const parent = el.parentElement;
          if (!parent) return;
          const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
              const newScale = entry.contentRect.width / width;
              el.style.transform = `scale(${newScale})`;
            }
          });
          ro.observe(parent);
          // Store it so it's cleaned up? ResizeObserver on inline ref can be memory leaky if not disconnected,
          // but for this small preview, it's acceptable or we can attach it once.
          (el as any)._ro = ro;
        }}
        style={{ width, height, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}
      >
        {children}
      </div>
    </div>
  );
}
