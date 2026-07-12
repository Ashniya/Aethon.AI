import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Search, Sun, Moon, AlertCircle } from "lucide-react";
import AgentWorkflow from "./AgentWorkflow";
import HeroDotCanvas from "./HeroDotCanvas";
import BlurText from "./BlurText";
import MagicBento from "./MagicBento";
import InteractiveExperience from "./InteractiveExperience";
import LoadingScreen from "./LoadingScreen";
// @ts-ignore
import AutoSplash from "./AutoSplash";

const SESSION_PAGE_KEY = "aethon_current_page";

// Hero section: Normal layout, lines exit right as user scrolls down
function HeroSection({ isDarkMode, onStart }: { isDarkMode: boolean; onStart: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const animate = () => {
      const rect = section.getBoundingClientRect();
      
      // rect.top is 80px when the hero is fully visible at the top (due to main's pt-20)
      // As the user scrolls down, rect.top goes negative.
      let scrolled = 80 - rect.top;
      
      // Finish the exit animation over the first 500px of scrolling
      const totalScrollable = 500;
      let progress = scrolled / totalScrollable;
      
      progress = Math.max(0, Math.min(progress, 1));

      lineRefs.current.forEach((line, i) => {
        if (!line) return;
        
        // Stagger the lines slightly
        const start = i * 0.12;
        const end = Math.min(start + 0.6, 1);
        
        let local = (progress - start) / (end - start);
        local = Math.max(0, Math.min(local, 1));
        
        // Smooth ease-in-out
        const e = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
        
        line.style.transform = `translate3d(${e * 100}vw, 0, 0)`;
        line.style.opacity = String(1 - e);
        line.style.filter = `blur(${e * 20}px)`;
      });
    };

    window.addEventListener("scroll", animate, { passive: true });
    animate();
    return () => window.removeEventListener("scroll", animate);
  }, []);

  const lines = ["ILLUMINATING", "MARKETS THROUGH", "EXPLAINABLE", "INTELLIGENCE."];

  return (
    <section 
      ref={sectionRef} 
      className={`relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between ${isDarkMode ? "bg-[#050B14]" : "bg-white"}`}
      style={{ overflow: "hidden" }}
    >
      <HeroDotCanvas isDarkMode={isDarkMode} />
      
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[calc(100vh-80px)] px-8 md:px-16 pt-12 pb-10">
        {/* Lines */}
        <div style={{ maxWidth: "60%" }}>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: i * 0.18, ease: "easeOut" }}
            >
              <div
                ref={el => { lineRefs.current[i] = el; }}
                style={{ willChange: "transform, opacity, filter" }}
              >
                <h1
                  className={`text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight uppercase ${isDarkMode ? "text-white" : "text-black"}`}
                  style={{ fontFamily: "Jura, sans-serif" }}
                >
                  {line}
                </h1>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div>
          <p className={`text-sm md:text-base mb-5 max-w-[280px] leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Autonomous intelligence. Multi-agent debate.<br />
            AI research that adapts, reasons, and explains.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs tracking-widest transition-all shadow-[0_0_25px_rgba(59,130,246,0.4)] uppercase"
            >
              <Search size={14} />
              Start Research
            </button>
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className={`flex items-center gap-2 px-5 py-2.5 border font-bold text-xs tracking-widest transition-all uppercase ${isDarkMode ? "border-white/30 hover:bg-white/10 text-white" : "border-black/30 hover:bg-black/10 text-black"}`}
            >
              Explore Features
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CountUp({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.floor(e * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return <>{count}{suffix}</>;
}

function TimelineStep({ title, num, delay }: { title: string; num: string; delay: number }) {
  return (
    <motion.div
      id={"timeline-step-" + num}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col items-center flex-1 min-w-[120px] relative"
    >
      <div
        id={"timeline-circle-" + num}
        className="h-12 w-12 rounded-full border-2 border-[#1B432A] dark:border-gray-600 bg-[#0D0E0D] dark:bg-gray-800 flex items-center justify-center text-[#4ADE80] dark:text-gray-300 font-black text-xl mb-4 z-10 shadow-[0_0_15px_rgba(74,222,128,0.2)] transition-all duration-300"
      >
        {num}
      </div>
      <p className="text-white dark:text-gray-200 text-center text-sm font-semibold">{title}</p>
    </motion.div>
  );
}

export default function App() {
  const storedPage = sessionStorage.getItem(SESSION_PAGE_KEY);
  const isAgentPage = storedPage === "agent";
  const [showApp, setShowApp] = useState(isAgentPage);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showLoading, setShowLoading] = useState(!isAgentPage);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const navigateToAgent = () => { sessionStorage.setItem(SESSION_PAGE_KEY, "agent"); setShowApp(true); };
  const navigateToLanding = () => { sessionStorage.setItem(SESSION_PAGE_KEY, "landing"); setShowApp(false); };

  if (showLoading) return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  if (showApp) return <AgentWorkflow onBack={navigateToLanding} />;

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#050B14] text-white" : "bg-[#EAEAEA] text-[#111111]"} font-sans transition-colors duration-500`}>
      <AutoSplash isDarkMode={isDarkMode} />

      {/* Header */}
      <header className={`fixed top-0 w-full z-50 ${isDarkMode ? "backdrop-blur-sm border-white/5" : "bg-black border-white/10"} border-b transition-colors`}>
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={navigateToLanding}>
            <span className="text-3xl md:text-4xl font-bold tracking-widest text-white flex items-center gap-2" style={{ fontFamily: "Jura, sans-serif" }}>
              AETHON<span className="text-blue-500 font-sans font-black">.</span>AI
            </span>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide" style={{ fontFamily: "Jura, sans-serif" }}>
              {[["#about","About Us"],["#how-it-works","How It Works"],["#features","Features"]].map(([href,label]) => (
                <a key={href} href={href} className={`relative group transition-colors ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-400 hover:text-white"}`}>
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>
            <button onClick={() => setIsDarkMode(d => !d)} className={`p-2 rounded-full border ${isDarkMode ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-white/10 hover:bg-white/10 text-gray-400"} transition-all`} aria-label="Toggle Theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-20">

        {/* Hero — 300vh sticky scroll */}
        <HeroSection isDarkMode={isDarkMode} onStart={navigateToAgent} />

        {/* About */}
        <section id="about" className={`py-24 transition-colors duration-500 ${isDarkMode ? "bg-[#040912]" : "bg-white"}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-16">
              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}>
                <span className={`text-xs font-bold tracking-[0.3em] uppercase mb-3 block ${isDarkMode ? "text-blue-500" : "text-blue-600"}`}>Why Choose Us</span>
                <h2 className={`text-4xl font-black ${isDarkMode ? "text-white" : "text-black"}`} style={{ fontFamily:"Jura, sans-serif" }}>Why Aethon AI?</h2>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }} whileHover={{ scale:1.02, y:-4 }} className={`group p-6 border-l-4 border-rose-500 cursor-default transition-all duration-300 ${isDarkMode ? "bg-white/3 hover:bg-rose-500/8 border border-white/5 hover:border-rose-500/30" : "bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-300"} rounded-xl`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-rose-500/10"><AlertCircle size={18} className="text-rose-500" /></div>
                    <h3 className={`font-bold text-base ${isDarkMode ? "text-rose-400" : "text-rose-600"}`}>Traditional Research is Broken</h3>
                  </div>
                  <BlurText text="Fragmented data, impenetrable statements, scattered news. By the time you form an opinion, the market has already moved on." delay={60} direction="bottom" threshold={0.3} className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} stepDuration={0.3} />
                </motion.div>
                <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.2 }} whileHover={{ scale:1.02, y:-4 }} className={`group p-6 border-l-4 border-blue-500 cursor-default transition-all duration-300 ${isDarkMode ? "bg-white/3 hover:bg-blue-500/8 border border-white/5 hover:border-blue-500/30" : "bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300"} rounded-xl`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10"><CheckCircle2 size={18} className="text-blue-500" /></div>
                    <h3 className={`font-bold text-base ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>The Aethon Advantage</h3>
                  </div>
                  <BlurText text="An AI Board Meeting for every ticker. Multi-agent debate pulls live data, runs Bull vs Bear analysis, and returns a fully explainable verdict with confidence scores in 15 seconds." delay={50} direction="bottom" threshold={0.3} className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`} stepDuration={0.3} />
                </motion.div>
                <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.35 }} className="grid grid-cols-3 gap-3 pt-2">
                  {[[15,"s","Analysis Time"],[5,"","AI Agents"],[100,"%","Explainable"]].map(([val,suffix,label]) => (
                    <div key={label as string} className={`text-center p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${isDarkMode ? "border-white/10 bg-white/3 hover:border-blue-500/40" : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:shadow-md"}`}>
                      <div className={`text-2xl font-black mb-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}><CountUp end={val as number} suffix={suffix as string} /></div>
                      <div className="text-xs font-medium text-gray-500">{label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
              <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.2 }} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-blue-600/20 to-blue-900/10" : "from-blue-200 to-gray-200"} rounded-2xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`relative rounded-2xl overflow-hidden border ${isDarkMode ? "border-white/10 hover:border-blue-500/40" : "border-gray-200 hover:border-blue-400"} shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(59,130,246,0.2)]`}>
                  <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop" alt="Trading Dashboard" className={`w-full transition-all duration-700 ${isDarkMode ? "opacity-75 group-hover:opacity-100" : "opacity-90 group-hover:opacity-100"}`} />
                  <div className={`absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t ${isDarkMode ? "from-[#040912]" : "from-white"} to-transparent`} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`} style={{ fontFamily:"Jura, sans-serif" }}>How the Committee Works</h2>
              <p className={`max-w-2xl mx-auto ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>A fully transparent, autonomous workflow.</p>
            </div>
            <div className="relative flex flex-col md:flex-row justify-between items-start gap-8">
              <div className={`hidden md:block absolute top-6 left-[60px] right-[60px] h-[2px] bg-gradient-to-r ${isDarkMode ? "from-[#0A192F] via-blue-500/50 to-[#0A192F]" : "from-gray-200 via-blue-400 to-gray-200"} z-0`} />
              <TimelineStep num="1" title="Data Collection" delay={0.1} />
              <TimelineStep num="2" title="Growth Analysis" delay={0.2} />
              <TimelineStep num="3" title="Risk Assessment" delay={0.3} />
              <TimelineStep num="4" title="Board Debate" delay={0.4} />
              <TimelineStep num="5" title="Judge Verdict" delay={0.5} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className={`py-24 px-6 ${isDarkMode ? "bg-[#050B14]" : "bg-[#0d1117]"}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}>
                <span className="text-xs font-bold tracking-[0.3em] uppercase mb-3 block text-blue-500">What We Offer</span>
                <h2 className="text-3xl font-black mb-4 text-white" style={{ fontFamily:"Jura, sans-serif" }}>Platform Features</h2>
                <p className="max-w-2xl mx-auto text-gray-400">Advanced tools designed to make you stop and think.</p>
              </motion.div>
            </div>
            <MagicBento isDarkMode={isDarkMode} />
          </div>
        </section>

        {/* Interactive Experience */}
        <InteractiveExperience isDarkMode={isDarkMode} />

        {/* CTA */}
        <section className={`relative overflow-hidden py-32 px-6 border-t ${isDarkMode ? "border-white/5 bg-gradient-to-b from-[#050B14] to-[#0A192F]/50" : "border-black/5 bg-gradient-to-b from-[#EAEAEA] to-gray-300"} transition-colors duration-500`}>
          <HeroDotCanvas isDarkMode={isDarkMode} focusXPercent={0.15} focusYPercent={0.85} />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className={`text-4xl font-black mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`} style={{ fontFamily:"Jura, sans-serif" }}>Ready to Illuminate the Market?</h2>
            <p className={`mb-10 text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Stop relying on fragmented data. Deploy the Aethon AI committee today.</p>
            <button onClick={navigateToAgent} className={`px-10 py-5 ${isDarkMode ? "bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.4)]" : "bg-gray-800 text-white hover:bg-gray-700 shadow-[0_0_40px_rgba(0,0,0,0.2)]"} font-bold text-lg rounded-2xl transition-all`}>
              Deploy Aethon AI Now
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`py-8 text-center border-t ${isDarkMode ? "bg-[#050B14] border-white/5 text-gray-500" : "bg-[#EAEAEA] border-black/5 text-gray-500"} transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold tracking-widest flex items-center gap-1" style={{ fontFamily:"Jura, sans-serif" }}>
            AETHON<span className="text-blue-500 font-sans font-black">.</span>AI
          </span>
          <p className="text-xs">© {new Date().getFullYear()} Aethon AI. All rights reserved.</p>
          <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
