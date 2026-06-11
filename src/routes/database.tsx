import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Database, Server, User, Lock, ArrowRight,
  CheckCircle2, Loader2, AlertCircle, ShieldCheck, Info
} from "lucide-react";

export const Route = createFileRoute("/database")({
  component: DatabaseOnboarding,
});

const DB_TYPES = [
  { label: "MySQL", logo: "🐬" },
  { label: "SQL Server", logo: "🪟" },
  { label: "PostgreSQL", logo: "🐘" },
  { label: "MongoDB", logo: "🍃" },
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
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
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

type TestStatus = "idle" | "testing" | "success" | "error";

function DatabaseOnboarding() {
  const navigate = useNavigate();
  const [dbType, setDbType] = useState("MySQL");
  const [form, setForm] = useState({
    host: "",
    port: "3306",
    username: "",
    password: "",
    database: "",
    apiKey: "",
  });
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState("");

  const update = (key: string, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const isGoFrugal = dbType === "GoFrugal API";

  // Simulate connection test
  const handleTest = async () => {
    setTestStatus("testing");
    setTestMessage("");
    await new Promise(r => setTimeout(r, 2000));
    // Simulate success for demo
    setTestStatus("success");
    setTestMessage("Connection successful! 41 products and 3 years of data found.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("db_config", JSON.stringify({ dbType, ...form }));
    localStorage.setItem("onboarding_complete", "true");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-success/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(22,163,74,0.3)]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Connect your database</h1>
            <p className="text-xs text-muted-foreground">We need read-only access to your stock & sales data</p>
          </div>
        </div>

        <StepIndicator current={1} />

        {/* Security note */}
        <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            CART-EL recommends connecting through a dedicated read-only database user for dashboard access. This ensures the platform can securely analyze and visualize your business data without modifying, deleting, or affecting your billing and operational systems.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* DB Type selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">
              What database do you use?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DB_TYPES.map(({ label, logo }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setDbType(label);
                    setTestStatus("idle");
                    update("port", label === "SQL Server" ? "1433" : label === "PostgreSQL" ? "5432" : "3306");
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all
                    ${dbType === label
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_2px_rgba(22,163,74,0.3)]"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                >
                  <span className="text-xl">{logo}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* GoFrugal API key flow */}
          {isGoFrugal ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 bg-muted/50 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In GoFrugal → Settings → API Integration → Generate Key. Paste the key below. No host or password needed.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">GoFrugal API Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={form.apiKey}
                    onChange={e => update("apiKey", e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Paste your GoFrugal API key"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            /* SQL connection fields */
            <div className="space-y-4">
              {/* Host + Port */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">Host / IP</label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.host}
                      onChange={e => update("host", e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="100.x.x.x or localhost"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">Port</label>
                  <input
                    type="text"
                    value={form.port}
                    onChange={e => update("port", e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="3306"
                    required
                  />
                </div>
              </div>

              {/* Username + Password */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">DB Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => update("username", e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="admin_readonly"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => update("password", e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Database name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold ml-1 text-muted-foreground uppercase tracking-wide">Database Name</label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.database}
                    onChange={e => update("database", e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="e.g. GroceryDB"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test connection */}
          <button
            type="button"
            onClick={handleTest}
            disabled={testStatus === "testing"}
            className="w-full border border-primary/40 text-primary font-medium py-2.5 rounded-xl text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {testStatus === "testing" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Testing connection...</>
            ) : testStatus === "success" ? (
              <><CheckCircle2 className="w-4 h-4 text-success" /> Connection verified — test again</>
            ) : testStatus === "error" ? (
              <><AlertCircle className="w-4 h-4 text-alert" /> Failed — retry</>
            ) : (
              <><Database className="w-4 h-4" /> Test Connection</>
            )}
          </button>

          {/* Test result message */}
          {testStatus === "success" && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <p className="text-xs text-success font-medium">{testMessage}</p>
            </div>
          )}
          {testStatus === "error" && (
            <div className="flex items-center gap-2 bg-alert/10 border border-alert/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-alert shrink-0" />
              <p className="text-xs text-alert font-medium">Could not connect. Check your credentials and ensure Tailscale is running on the billing PC.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(22,163,74,0.25)] hover:shadow-[0_12px_25px_rgba(22,163,74,0.35)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
          >
            Launch My Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-xs text-muted-foreground">
            You can update these settings anytime from the dashboard.
          </p>
        </form>
      </div>
    </div>
  );
}
