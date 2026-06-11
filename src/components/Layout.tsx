import { Link, Outlet, useRouterState, useNavigate, Navigate } from "@tanstack/react-router";
import { BarChart2, Sparkles, MessageCircle, TrendingUp, Bell, Store, Heart, Leaf, ShoppingCart, Mic, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { ComponentType } from "react";

const nav: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: "/",              label: "Stock",         icon: BarChart2 },
  { to: "/offers",        label: "AI Offers",     icon: Sparkles },
  { to: "/broadcast",     label: "Broadcast",     icon: MessageCircle },
  { to: "/analytics",     label: "Analytics",     icon: TrendingUp },
];

export function Layout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("Click the mic to speak...");
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    setIsAuth(localStorage.getItem("merchant_auth") === "true");
  }, [pathname]);


  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const processAIQuery = (query: string) => {
    let response = "Please ask a valid question related to Aadhirai Mart's stock, orders, or campaigns.";
    let path = null;

    if (query.includes("expire") || query.includes("expiring") || query.includes("stock") || query.includes("inventory")) {
      response = "Here are the items expiring soon. I have opened the stock dashboard for you.";
      path = "/";
    } else if (query.includes("revenue") || query.includes("order") || query.includes("sales") || query.includes("payment")) {
      response = "Opening your online orders. Today's revenue is 6,640 rupees with 2 pending actions.";
      path = "/orders";
    } else if (query.includes("broadcast") || query.includes("message") || query.includes("customer") || query.includes("segment")) {
      response = "Taking you to the broadcast page. I've highlighted the B2B and Frequent buyers for your current offer.";
      path = "/broadcast";
    } else if (query.includes("sustainab") || query.includes("carbon") || query.includes("donate") || query.includes("ngo") || query.includes("green")) {
      response = "Here is your Green Impact. You have saved over 116 kilograms of carbon emissions!";
      path = "/sustainability";
    } else if (query.includes("offer") || query.includes("poster") || query.includes("discount")) {
      response = "Let's build an AI offer poster. You can use the AI magic feature to generate a custom design.";
      path = "/offers";
    }

    setAiResponse(response);
    speak(response);
    if (path) {
      setTimeout(() => navigate({ to: path as any }), 1500);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiResponse("Speech recognition is not supported in this browser. Please try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Listening...");
      setAiResponse("");
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript.toLowerCase();
      setTranscript(`"${speechResult}"`);
      processAIQuery(speechResult);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setTranscript("Microphone access denied.");
      } else {
        setTranscript("I didn't quite catch that.");
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    if (voiceOpen) {
      startListening();
    } else {
      window.speechSynthesis.cancel();
      setIsListening(false);
    }
  }, [voiceOpen]);

  if (pathname === "/login") {
    return <Outlet />;
  }

  if (isAuth === null) {
    return <div className="min-h-screen bg-background" />; // loading state
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-6 py-6 flex items-center gap-2 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base leading-none">CART-EL</div>
            <div className="text-xs text-white/60 mt-1">Aadhirai Mart</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? "bg-white/15 font-medium" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{n.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-xs text-white/50 border-t border-white/10">
          Perambalur, Tamil Nadu
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:px-8 shadow-card sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="md:hidden w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base text-foreground leading-tight">Aadhirai Mart</div>
              <div className="text-xs text-muted-foreground">Merchant Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-alert rounded-full" />
            </button>
            <div 
              title="Logout"
              onClick={() => {
                localStorage.removeItem("merchant_auth");
                navigate({ to: "/login" });
              }}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-card"
            >
              AM
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Bottom nav mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar text-sidebar-foreground border-t border-white/10 flex justify-around z-50">
          {nav.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] ${
                  active ? "text-white" : "text-white/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Voice AI Floating Button */}
      <button 
        onClick={() => setVoiceOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center hover:scale-105 hover:shadow-[0_8px_40px_rgb(0,0,0,0.2)] transition-all z-50 group"
      >
        <Mic className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-card text-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-card opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Voice AI
        </span>
      </button>

      {/* Voice AI Modal */}
      {voiceOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col slide-in-from-bottom-8">
            <div className="p-4 flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Merchant Assistant AI</span>
              </div>
              <button onClick={() => setVoiceOpen(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
              <button 
                onClick={() => !isListening && startListening()}
                disabled={isListening}
                className="relative mb-6 group outline-none"
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-700 ${isListening ? 'bg-primary shadow-[0_0_40px_rgba(34,197,94,0.4)] scale-110' : 'bg-primary/80 hover:bg-primary hover:scale-105'}`}>
                  <Mic className="w-10 h-10" />
                </div>
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute inset-[-10px] rounded-full border border-primary animate-ping opacity-20" style={{ animationDuration: '2s' }} />
                  </>
                )}
              </button>
              <div className="text-sm text-muted-foreground mb-3 text-center min-h-[20px] italic">
                {transcript}
              </div>
              <div className="text-lg font-medium text-center text-foreground min-h-[60px] flex items-center justify-center px-4">
                {aiResponse}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
