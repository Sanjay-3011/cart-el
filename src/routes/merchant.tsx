import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Store, MapPin, Phone, Users, ArrowRight,
  ShoppingBag, Coffee, Pill, Wrench, Scissors, MoreHorizontal
} from "lucide-react";

export const Route = createFileRoute("/onboarding/merchant")({
  component: MerchantOnboarding,
});

const BUSINESS_TYPES = [
  { label: "Grocery / Kirana", icon: ShoppingBag },
  { label: "Café / Restaurant", icon: Coffee },
  { label: "Pharmacy", icon: Pill },
  { label: "Spare Parts", icon: Wrench },
  { label: "Textile / Clothing", icon: Scissors },
  { label: "Other", icon: MoreHorizontal },
];

const STEPS = ["Business Info", "Connect Database"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i === current
                  ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(22,163,74,0.4)]"
                  : i < current
                  ? "bg-primary/30 text-primary"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === current ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-px ${i < current ? "bg-primary" : "bg-border"} transition-all`} />
          )}
        </div>
      ))}
    </div>
  );
}

function MerchantOnboarding() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    city: "",
    state: "",
    businessType: "",
    employeeCount: "",
  });
  const [error, setError] = useState("");

  const update = (key: string, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.businessType) {
      setError("Please select a business type.");
      return;
    }
    localStorage.setItem("merchant_profile", JSON.stringify(form));
    navigate({ to: "/database" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-success/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(22,163,74,0.3)]">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tell us about your business</h1>
            <p className="text-xs text-muted-foreground">We'll personalise CART-EL for your store</p>
          </div>
        </div>

        <StepIndicator current={0} />

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Shop Name + Owner Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">Shop Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.shopName}
                  onChange={e => update("shopName", e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="e.g. Aadhirai Mart"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">Owner Name</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={e => update("ownerName", e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="e.g. Rajkumar"
                  required
                />
              </div>
            </div>
          </div>

          {/* Phone + City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update("phone", e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="e.g. 9876543200"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.city}
                  onChange={e => update("city", e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="e.g. Perambalur"
                  required
                />
              </div>
            </div>
          </div>

          {/* Employees */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">Number of Employees</label>
            <select
              value={form.employeeCount}
              onChange={e => update("employeeCount", e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              required
            >
              <option value="">Select range</option>
              <option value="1-3">1 – 3</option>
              <option value="4-10">4 – 10</option>
              <option value="11-25">11 – 25</option>
              <option value="25+">25+</option>
            </select>
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">Business Type</label>
            <div className="grid grid-cols-3 gap-2">
              {BUSINESS_TYPES.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => update("businessType", label)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all
                    ${form.businessType === label
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_2px_rgba(22,163,74,0.3)]"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-alert font-medium bg-alert/10 px-3 py-2 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(22,163,74,0.25)] hover:shadow-[0_12px_25px_rgba(22,163,74,0.35)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-2"
          >
            Next: Connect Your Database
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
