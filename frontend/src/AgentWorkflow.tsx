import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, Sun, Moon, Building2, BarChart2, TrendingUp,
  DollarSign, Shield, AlertTriangle, Scale, FileText, CheckCircle2,
  ChevronDown, ChevronUp, Users, Zap, Clock, Briefcase, MessageCircle,
  Send, Download, RefreshCw, ArrowRight, ArrowLeftCircle, X, Mic, Volume2, VolumeX,
} from 'lucide-react';
import TextType from './TextType';
import ChatOrb from './ChatOrb';
import BoxNav from './BoxNav';
import CountUp from './CountUp';
import ExportReportView from './ExportReportView';
import ParticleBg from './ParticleBg';

// ── Types ──────────────────────────────────────────────────────────────
interface Step { step: string; status: 'running' | 'complete'; result?: any; }
interface SwotReport {
  recommendation: 'INVEST' | 'PASS' | 'HOLD';
  confidenceScore: number;
  convictionScore: number;
  agreementLevel: 'HIGH' | 'MODERATE' | 'SPLIT';
  reasoning: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[]; };
}
interface Thesis { bullCase: string; bearCase: string; keyDrivers: string[]; }
interface Scenario { name: string; impact: 'HIGH' | 'MEDIUM' | 'LOW'; direction: 'POSITIVE' | 'NEGATIVE'; reasoning: string; }
interface Counterfactual { stock: { currentValue: number; returnPct: number; verdict: string; }; revenue: { currentValue: number; returnPct: number; verdict: string; }; context: string; }
interface PortfolioFit { overlapLevel: 'HIGH' | 'MODERATE' | 'LOW'; recommendation: string; reasoning: string; diversificationBenefit: string; }
interface ChatMessage { role: 'user' | 'assistant'; content: string; }

// ── Constants ──────────────────────────────────────────────────────────
const COMPANY_LIST = [
  'Apple', 'Microsoft', 'Google', 'Alphabet', 'Amazon', 'NVIDIA', 'Tesla',
  'Meta', 'Netflix', 'Spotify', 'Uber', 'Airbnb', 'Palantir', 'Salesforce',
  'Oracle', 'IBM', 'Intel', 'AMD', 'Qualcomm', 'TSMC', 'Samsung', 'Sony',
  'Toyota', 'Volkswagen', 'Ferrari', 'Ford', 'General Motors', 'Boeing',
  'Lockheed Martin', 'Raytheon', 'Johnson & Johnson', 'Pfizer', 'Moderna',
  'Eli Lilly', 'Berkshire Hathaway', 'JPMorgan', 'Goldman Sachs', 'Visa',
  'Mastercard', 'PayPal', 'Coinbase', 'Robinhood', 'Block', 'Shopify',
  'Alibaba', 'Tencent', 'Baidu', 'Infosys', 'TCS', 'Wipro',
  'Reliance Industries', 'HDFC Bank', 'ICICI Bank', 'Adani Enterprises',
  'Tata Motors', 'Zomato', 'Paytm', 'Coca Cola', 'Pepsi', 'McDonalds',
  'Starbucks', 'Nike', 'Adidas', 'LVMH', 'ExxonMobil', 'Chevron',
  'Shell', 'BP', 'Saudi Aramco', 'Walt Disney', 'Warner Bros', 'Comcast',
];

const AGENT_CFG: Record<string, { Icon: any; color: string; bg: string; border: string }> = {
  'Gathering Financial Data':   { Icon: BarChart2,     color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  'Growth Analyst Evaluating':  { Icon: TrendingUp,    color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30' },
  'Value Investor Evaluating':  { Icon: DollarSign,    color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  'Risk Officer Evaluating':    { Icon: Shield,        color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
  'Skeptic Agent Challenging':  { Icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'Judge Deliberating':         { Icon: Scale,         color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  'Building Investment Thesis': { Icon: FileText,      color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
};

const TABS = [
  { id: 0, label: 'Verdict',       Icon: CheckCircle2 },
  { id: 1, label: 'Thesis',        Icon: FileText },
  { id: 2, label: 'Personas',      Icon: Users },
  { id: 3, label: 'Scenarios',     Icon: Zap },
  { id: 4, label: 'Time Machine',     Icon: Clock },
  { id: 5, label: 'Portfolio Fit', Icon: Briefcase },
];

// ── Small components ────────────────────────────────────────────────────
function MeterBar({ label, value, color, isDarkMode = true }: { label: string; value: number; color: string; isDarkMode?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold text-white">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ExpandBtn({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors mt-4"
    >
      {open ? <><ChevronUp size={13} /> Hide Details</> : <><ChevronDown size={13} /> View Details</>}
    </button>
  );
}

function Expandable({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="pt-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function stepSummary(s: Step): string {
  if (s.step === 'Gathering Financial Data') return 'Real-time data fetched from FinnHub & NewsAPI.';
  if (s.step === 'Judge Deliberating') return `Committee verdict: ${(s.result as SwotReport)?.recommendation ?? '…'}`;
  if (s.step === 'Building Investment Thesis') return 'Thesis ready — open the Thesis tab.';
  if (typeof s.result === 'string') return s.result;
  return 'Completed.';
}

function recStyle(rec: string) {
  if (rec === 'INVEST') return { badge: 'bg-green-500/15 text-green-400 border-green-500/30', bar: 'bg-green-500' };
  if (rec === 'PASS')   return { badge: 'bg-red-500/15 text-red-400 border-red-500/30',       bar: 'bg-red-500' };
  return                        { badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-500' };
}

// ── Custom Hooks Removed ────────────────────────────────────────────────────────

// ── Reusable card shell (Extracted to fix focus bug) ────────────────────
const Card = ({ children, className = '', isDarkMode = true, style }: { children: React.ReactNode; className?: string; isDarkMode?: boolean; style?: React.CSSProperties }) => (
  <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-[#0d1a2d]/90 backdrop-blur-md border-white/8' : 'bg-white border-gray-200 shadow-lg text-gray-800'} ${className}`} style={style}>
    {children}
  </div>
);

const Spinner = ({ msg, isDarkMode = true }: { msg: string; isDarkMode?: boolean }) => (
  <Card isDarkMode={isDarkMode} className="flex items-center justify-center gap-3 py-10">
    <Loader2 size={18} className="animate-spin text-blue-400" />
    <span className="text-sm text-gray-400">{msg}</span>
  </Card>
);

const LazyPrompt = ({ Icon: Ic, title, sub, onLoad, loading, isDarkMode = true }: { Icon: any; title: string; sub: string; onLoad: () => void; loading: boolean; isDarkMode?: boolean }) => (
  <Card isDarkMode={isDarkMode} className="text-center py-10">
    <Ic size={30} className="text-blue-400/50 mx-auto mb-3" />
    <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>{title}</h3>
    <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto">{sub}</p>
    <button
      onClick={onLoad} disabled={loading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 ${isDarkMode ? 'bg-blue-500 hover:bg-blue-400' : 'bg-black hover:bg-gray-800'} text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
      {loading ? 'Analyzing…' : 'Run Analysis'}
    </button>
  </Card>
);

// ── Main component ──────────────────────────────────────────────────────
const VoiceVisualizer = () => {
  const [heights, setHeights] = useState([90,40,15,25,55,90,80,55,20,12,10,10]);
  useEffect(() => {
    const base = [90,40,15,25,55,90,80,55,20,12,10,10];
    const int = setInterval(() => {
      setHeights(base.map(b => Math.max(8, b + (Math.random() * 30 - 15))));
    }, 120);
    return () => clearInterval(int);
  }, []);
  return (
    <div className="flex items-center justify-center gap-[3px] h-[20px] px-2 z-10 relative">
      {heights.map((h, i) => (
        <div key={i} style={{ height: `px` }} className="w-[3px] bg-red-500 rounded-full transition-all duration-[120ms] ease-linear" />
      ))}
    </div>
  );
};

const loadState = <T,>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem('aethon_' + key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

export default function AgentWorkflow({ onBack }: { onBack?: () => void }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatIn(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Core
  const initialPhase = loadState<'idle' | 'analyzing' | 'complete'>('phase', 'idle');
  const isInterrupted = initialPhase === 'analyzing';

  const [query, setQuery]             = useState(() => isInterrupted ? '' : loadState('query', ''));
  const [isDarkMode, setIsDarkMode]   = useState(true);
  const [phase, setPhase]             = useState<'idle' | 'analyzing' | 'complete'>(() => isInterrupted ? 'idle' : initialPhase);
  const [steps, setSteps]             = useState<Step[]>(() => isInterrupted ? [] : loadState('steps', []));
  const [report, setReport]           = useState<SwotReport | null>(() => isInterrupted ? null : loadState('report', null));
  const [thesisData, setThesisData]   = useState<Thesis | null>(() => isInterrupted ? null : loadState('thesisData', null));
  const [finCtx, setFinCtx]           = useState(() => isInterrupted ? '' : loadState('finCtx', ''));

  // Autocomplete
  const [suggestions, setSuggestions]         = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState(() => isInterrupted ? 0 : loadState('activeTab', 0));
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({});

  // Lazy features
  const [personas,     setPersonas]     = useState<{ buffett: string; cathieWood: string } | null>(() => isInterrupted ? null : loadState('personas', null));
  const [loadingPers,  setLoadingPers]  = useState(false);
  const [scenarios,    setScenarios]    = useState<Scenario[] | null>(() => isInterrupted ? null : loadState('scenarios', null));
  const [loadingSc,    setLoadingSc]    = useState(false);
  const [cfData,       setCfData]       = useState<Counterfactual | null>(() => isInterrupted ? null : loadState('cfData', null));
  const [cfYears,      setCfYears]      = useState<1 | 2 | 3>(1);
  const [loadingCf,    setLoadingCf]    = useState(false);
  const [holdings,     setHoldings]     = useState('');
  const [pfData,       setPfData]       = useState<PortfolioFit | null>(() => isInterrupted ? null : loadState('pfData', null));
  const [loadingPf,    setLoadingPf]    = useState(false);
  const [chat,         setChat]         = useState<ChatMessage[]>(() => isInterrupted ? [] : loadState('chat', []));

  useEffect(() => {
    localStorage.setItem('aethon_query', JSON.stringify(query));
    localStorage.setItem('aethon_phase', JSON.stringify(phase));
    localStorage.setItem('aethon_steps', JSON.stringify(steps));
    localStorage.setItem('aethon_report', JSON.stringify(report));
    localStorage.setItem('aethon_thesisData', JSON.stringify(thesisData));
    localStorage.setItem('aethon_finCtx', JSON.stringify(finCtx));
    localStorage.setItem('aethon_activeTab', JSON.stringify(activeTab));
    localStorage.setItem('aethon_personas', JSON.stringify(personas));
    localStorage.setItem('aethon_scenarios', JSON.stringify(scenarios));
    localStorage.setItem('aethon_cfData', JSON.stringify(cfData));
    localStorage.setItem('aethon_pfData', JSON.stringify(pfData));
    localStorage.setItem('aethon_chat', JSON.stringify(chat));
  }, [query, phase, steps, report, thesisData, finCtx, activeTab, personas, scenarios, cfData, pfData, chat]);
  const [chatIn,       setChatIn]       = useState('');
  const [loadingChat,  setLoadingChat]  = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  // Helpers
  const toggle = (k: string) => setExpanded(p => ({ ...p, [k]: !p[k] }));

  const handleQueryChange = (v: string) => {
    setQuery(v);
    if (v.trim().length >= 1) {
      const f = COMPANY_LIST.filter(c => c.toLowerCase().startsWith(v.toLowerCase())).slice(0, 7);
      setSuggestions(f);
      setShowSuggestions(f.length > 0);
    } else { setSuggestions([]); setShowSuggestions(false); }
  };

  const resetAll = () => {
    setQuery(''); setSteps([]); setReport(null); setThesisData(null); setFinCtx('');
    setPhase('idle'); setActiveTab(0); setExpanded({});
    setPersonas(null); setScenarios(null); setCfData(null);
    setHoldings(''); setPfData(null); setChat([]); setChatIn('');
  };

  // ── Main analysis ────────────────────────────────────────────────────
  const handleAnalyze = async (overrideQuery?: string | React.MouseEvent) => {
    const q = typeof overrideQuery === 'string' ? overrideQuery : query;
    if (!q || phase === 'analyzing') return;
    resetAll();
    setQuery(q);   // keep query visible
    setPhase('analyzing');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const resp = await fetch(`${API_URL}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: q }),
      });
      if (!resp.body) return;
      const reader  = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n\n').filter(Boolean)) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.status === 'complete' && !data.step) { setPhase('complete'); continue; }
            if (!data.step) continue;

            if (data.step === 'Gathering Financial Data'   && data.status === 'complete') setFinCtx(data.result);
            if (data.step === 'Judge Deliberating'          && data.status === 'complete') setReport(data.result);
            if (data.step === 'Building Investment Thesis'  && data.status === 'complete') { setThesisData(data.result); setPhase('complete'); }

            setSteps(prev => {
              const idx = prev.findIndex(s => s.step === data.step);
              if (idx >= 0) { const n = [...prev]; n[idx] = data; return n; }
              return [...prev, data];
            });
          } catch (_) { /* skip */ }
        }
      }
    } catch (e) { console.error(e); setPhase('idle'); }
  };

  // ── Lazy loaders ──────────────────────────────────────────────────────
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const post = (url: string, body: object) =>
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

  const loadPersonas = async () => {
    if (loadingPers || personas) return;
    setLoadingPers(true);
    try {
      const [b, c] = await Promise.all([
        post(`${API}/api/personas`, { financialData: finCtx, persona: 'buffett' }),
        post(`${API}/api/personas`, { financialData: finCtx, persona: 'cathieWood' }),
      ]);
      setPersonas({ buffett: b.analysis, cathieWood: c.analysis });
    } finally { setLoadingPers(false); }
  };

  const loadScenarios = async () => {
    if (loadingSc || scenarios) return;
    setLoadingSc(true);
    try { const d = await post(`${API}/api/scenarios`, { financialData: finCtx }); setScenarios(Array.isArray(d) ? d : []); }
    finally { setLoadingSc(false); }
  };

  const loadCf = async (y = cfYears, force = false) => {
    if ((loadingCf || cfData) && !force) return;
    setLoadingCf(true);
    try { const d = await post(`${API}/api/counterfactual`, { financialData: finCtx, years: y }); setCfData(d); }
    finally { setLoadingCf(false); }
  };

  const loadPf = async () => {
    if (loadingPf || !holdings.trim()) return;
    setLoadingPf(true);
    try { const d = await post(`${API}/api/portfolio-fit`, { financialData: finCtx, holdings }); setPfData(d); }
    finally { setLoadingPf(false); }
  };

  const sendChat = async () => {
    if (!chatIn.trim() || loadingChat) return;
    const q = chatIn.trim(); setChatIn('');
    setChat(p => [...p, { role: 'user', content: q }]);
    setLoadingChat(true);
    try {
      const ctx = steps.filter(s => s.status === 'complete' && typeof s.result === 'string').map(s => `${s.step}: ${s.result}`).join('\n\n');
      const d = await post(`${API}/api/followup`, { context: ctx, question: q });
      setChat(p => [...p, { role: 'assistant', content: d.answer }]);
    } finally { setLoadingChat(false); }
  };

  const onTabClick = (id: number) => {
    setActiveTab(id);
    if (id === 2 && !personas)  loadPersonas();
    if (id === 3 && !scenarios) loadScenarios();
    if (id === 4 && !cfData)    loadCf();
  };

  // ── Tab panels ─────────────────────────────────────────────────────────

  // TAB 0: Verdict
  const VerdictTab = () => {
    if (!report) return <Spinner isDarkMode={isDarkMode} msg="Judge is deliberating... Please wait." />;
    const { badge, bar } = recStyle(report.recommendation || 'HOLD');
    const agreeLevel = report.agreementLevel || (report.convictionScore >= 70 ? 'HIGH' : report.convictionScore <= 40 ? 'SPLIT' : 'MODERATE');
    const convBar = agreeLevel === 'HIGH' ? 'bg-green-500' : agreeLevel === 'MODERATE' ? 'bg-yellow-500' : 'bg-red-500';
    const confScore = report.confidenceScore || 50;
    const confBar = confScore >= 70 ? 'bg-green-500' : confScore >= 40 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div className="space-y-3">
        <Card isDarkMode={isDarkMode}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-5 py-2 rounded-full border-2 font-black text-xl tracking-widest ${badge}`}>
              {report.recommendation || 'HOLD'}
            </span>
            <button
              onClick={() => window.print()}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${isDarkMode ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5' : 'border-gray-300 text-gray-600 hover:text-black hover:border-black hover:bg-gray-100'}`}
            >
              <Download size={13} /> Export PDF
            </button>
          </div>

          {/* One-line summary */}
          <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {(report.reasoning || '').split('.')[0] + '.'}
          </p>

          {/* Meters */}
          <div className="space-y-3">
            <MeterBar label="Confidence Score" value={confScore} color={confBar} isDarkMode={isDarkMode} />
            <MeterBar label={`Conviction Meter — ${agreeLevel} Agreement`} value={report.convictionScore || 50} color={convBar} />
          </div>

          <ExpandBtn open={!!expanded['v']} onToggle={() => toggle('v')} />
        </Card>

        {/* Expanded: full reasoning + SWOT */}
        <Expandable open={!!expanded['v']}>
          <div className="space-y-3">
            <Card isDarkMode={isDarkMode}>
              <p className={`text-xs uppercase tracking-widest font-bold mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Reasoning</p>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{report.reasoning}</p>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              {([
                { k: 'strengths',     label: 'Strengths',     c: 'border-green-500/25 bg-green-500/5',  tc: 'text-green-400' },
                { k: 'weaknesses',    label: 'Weaknesses',    c: 'border-red-500/25 bg-red-500/5',      tc: 'text-red-400' },
                { k: 'opportunities', label: 'Opportunities', c: 'border-blue-500/25 bg-blue-500/5',    tc: 'text-blue-400' },
                { k: 'threats',       label: 'Threats',       c: 'border-orange-500/25 bg-orange-500/5',tc: 'text-orange-400' },
              ] as any[]).map(({ k, label, c, tc }) => (
                <div key={k} className={`rounded-xl border p-4 ${c}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${tc}`}>{label}</p>
                  <ul className="space-y-1">
                    {(report.swot?.[k as keyof typeof report.swot] || []).map((item: string, i: number) => (
                      <li key={i} className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Expandable>
      </div>
    );
  };

  // TAB 1: Thesis
  const ThesisTab = () => {
    if (!thesisData) return null;
    return (
      <div className="space-y-3">
        <Card isDarkMode={isDarkMode}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { side: 'Bull Case', full: thesisData.bullCase, Icon: TrendingUp, color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/5' },
              { side: 'Bear Case', full: thesisData.bearCase, Icon: AlertTriangle, color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' },
            ].map(({ side, full, Icon: Ic, color, border, bg }) => (
              <div key={side} className={`rounded-xl border p-4 ${border} ${bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Ic size={13} className={color} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{side}</span>
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {full.split('.')[0] + '.'}
                </p>
              </div>
            ))}
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Key Drivers</p>
            <div className="flex flex-wrap gap-2">
              {thesisData.keyDrivers.map((d, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">{d}</span>
              ))}
            </div>
          </div>
          <ExpandBtn open={!!expanded['th']} onToggle={() => toggle('th')} />
        </Card>
        <Expandable open={!!expanded['th']}>
          <div className="space-y-3">
            {[
              { label: 'Full Bull Case', text: thesisData.bullCase, Icon: TrendingUp, c: 'text-green-400' },
              { label: 'Full Bear Case', text: thesisData.bearCase, Icon: AlertTriangle, c: 'text-red-400' },
            ].map(({ label, text, Icon: Ic, c }) => (
              <Card isDarkMode={isDarkMode} key={label}>
                <div className="flex items-center gap-2 mb-3">
                  <Ic size={14} className={c} />
                  <p className={`text-xs font-bold ${c}`}>{label}</p>
                </div>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{text}</p>
              </Card>
            ))}
          </div>
        </Expandable>
      </div>
    );
  };

  // TAB 2: Personas
  const PersonasTab = () => {
    if (loadingPers) return <Spinner isDarkMode={isDarkMode} msg="Consulting Buffett and Cathie Wood…" />;
    if (!personas) return (
      <LazyPrompt isDarkMode={isDarkMode} Icon={Users} title="Famous Investor Personas" sub="Hear what Warren Buffett and Cathie Wood would say about this stock." onLoad={loadPersonas} loading={loadingPers} />
    );
    return (
      <div className="space-y-3">
        {([
          { key: 'buffett',   name: 'Warren Buffett',  tag: 'Value · Berkshire Hathaway', emoji: '🎩', c: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5', text: personas.buffett },
          { key: 'cathieWood',name: 'Cathie Wood',      tag: 'Growth · ARK Invest',         emoji: '🚀', c: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', text: personas.cathieWood },
        ] as any[]).map(({ key, name, tag, emoji, c, border, bg, text }) => (
          <div key={key} className={`rounded-2xl border p-5 ${isDarkMode ? `${bg} ${border}` : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className={`font-bold text-sm ${c}`}>{name}</p>
                <p className="text-xs text-gray-400">{tag}</p>
              </div>
            </div>
            <p className={`text-sm italic ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              "{text.split('.')[0]}."
            </p>
            <ExpandBtn open={!!expanded[key]} onToggle={() => toggle(key)} />
            <Expandable open={!!expanded[key]}>
              <p className={`text-sm italic leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>"{text}"</p>
            </Expandable>
          </div>
        ))}
      </div>
    );
  };

  // TAB 3: Scenarios
  const ScenariosTab = () => {
    if (loadingSc)  return <Spinner isDarkMode={isDarkMode} msg="Simulating market scenarios…" />;
    if (!scenarios) return (
      <LazyPrompt isDarkMode={isDarkMode} Icon={Zap} title="Scenario Simulator" sub="What happens to this stock if interest rates rise, revenue drops, or markets crash?" onLoad={loadScenarios} loading={loadingSc} />
    );
    const impactStyle = {
      HIGH:   'bg-red-500/10 text-red-400 border-red-500/20',
      MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      LOW:    'bg-green-500/10 text-green-400 border-green-500/20',
    };
    return (
      <div className="space-y-3">
        {scenarios.map((s, i) => (
          <Card isDarkMode={isDarkMode} key={i}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{s.direction === 'NEGATIVE' ? '📉' : '📈'}</span>
                <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{s.name}</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${impactStyle[s.impact]}`}>{s.impact} IMPACT</span>
            </div>
            <p className="text-xs text-gray-400">{s.reasoning.split('.')[0] + '.'}</p>
            <ExpandBtn open={!!expanded[`sc${i}`]} onToggle={() => toggle(`sc${i}`)} />
            <Expandable open={!!expanded[`sc${i}`]}>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{s.reasoning}</p>
            </Expandable>
          </Card>
        ))}
      </div>
    );
  };
  const RewindTab = () => {
    if (loadingCf) return <Spinner isDarkMode={isDarkMode} msg="Calculating historical performance..." />;
    if (!cfData || !cfData.stock)   return (
      <LazyPrompt isDarkMode={isDarkMode} Icon={Clock} title="Historical Time Machine" sub="What would an investment 1 year ago be worth today?" onLoad={() => loadCf(cfYears, true)} loading={loadingCf} />
    );

    const handleYearChange = (y: 1 | 2 | 3) => {
      if (y === cfYears) return;
      setCfYears(y);
      loadCf(y, true);
    };

    const sPos = cfData.stock.returnPct >= 0;
    const rPos = cfData.revenue.returnPct >= 0;

    return (
      <div className="space-y-3">
        <Card isDarkMode={isDarkMode}>
          
          {/* Year Toggles */}
          <div className="flex justify-center mb-6">
            <div className={`flex rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-800' : 'border-gray-300'} text-xs font-bold`}>
              {([1, 2, 3] as (1|2|3)[]).map(y => (
                <button 
                  key={y}
                  onClick={() => handleYearChange(y)}
                  className={`px-6 py-2 transition-colors ${cfYears === y ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (isDarkMode ? 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200')}`}
                >
                  {y} YEAR{y > 1 ? 'S' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
            {/* Stock Box */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} text-center`}>
              <p className={`text-xs uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                $10,000 Invested
              </p>
              <p className={`text-4xl font-black mb-1 ${sPos ? 'text-green-400' : 'text-red-400'}`}>
                <CountUp key={`s-${cfYears}`} value={cfData.stock.currentValue ?? 0} isCurrency={true} />
              </p>
              <p className={`text-lg font-bold mb-4 ${sPos ? 'text-green-400' : 'text-red-400'}`}>
                {sPos ? '+' : ''}{cfData.stock.returnPct?.toFixed(1)}%
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{cfData.stock.verdict}</p>
            </div>

            {/* Revenue Box */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} text-center`}>
              <p className={`text-xs uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Revenue Growth
              </p>
              <p className={`text-4xl font-black mb-1 ${rPos ? 'text-green-400' : 'text-red-400'}`}>
                <CountUp key={`r-${cfYears}`} value={cfData.revenue.currentValue ?? 0} suffix="%" />
              </p>
              <p className={`text-lg font-bold mb-4 ${rPos ? 'text-green-400' : 'text-red-400'}`}>
                {rPos ? '+' : ''}{cfData.revenue.returnPct?.toFixed(1)}%
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{cfData.revenue.verdict}</p>
            </div>
          </div>

          <ExpandBtn open={!!expanded['cf']} onToggle={() => toggle('cf')} />
        </Card>
        <Expandable open={!!expanded['cf']}>
          <Card isDarkMode={isDarkMode}>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{cfData.context}</p>
          </Card>
        </Expandable>
      </div>
    );
  };

  // TAB 5: Portfolio Fit
  const PortfolioTab = () => {
    if (!pfData) return (
      <Card isDarkMode={isDarkMode} className="glow-table">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase size={18} className="text-blue-400" />
          <div>
            <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Portfolio Fit Analysis</p>
            <p className="text-xs text-gray-400">Does this stock complement your existing holdings?</p>
          </div>
        </div>
        <input
          type="text" value={holdings}
          onChange={e => setHoldings(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadPf()}
          placeholder="Enter holdings, e.g. AAPL, MSFT, AMZN"
          className={`w-full rounded-xl px-4 py-3 text-sm outline-none border mb-3 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-gray-100 border-gray-200 text-black placeholder:text-gray-400'}`}
        />
        <button
          onClick={loadPf} disabled={loadingPf || !holdings.trim()}
          className={`w-full py-2.5 ${isDarkMode ? 'bg-blue-500 hover:bg-blue-400' : 'bg-black hover:bg-gray-800'} text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
        >
          {loadingPf ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</> : <><ArrowRight size={14} /> Analyze Fit</>}
        </button>
      </Card>
    );

    const recColor = pfData.recommendation === 'GOOD FIT' ? 'text-green-400' : pfData.recommendation === 'POOR FIT' ? 'text-red-400' : 'text-yellow-400';
    const ovColor  = pfData.overlapLevel === 'LOW' ? 'text-green-400' : pfData.overlapLevel === 'HIGH' ? 'text-red-400' : 'text-yellow-400';
    return (
      <div className="space-y-3">
        <Card isDarkMode={isDarkMode} className="glow-table">
          <div className="flex items-center gap-3 mb-3">
            <div><p className="text-xs text-gray-400 mb-0.5">Recommendation</p><p className={`font-black text-base ${recColor}`}>{pfData.recommendation}</p></div>
            <div className="text-right"><p className="text-xs text-gray-400 mb-0.5">Overlap Level</p><p className={`font-bold ${ovColor}`}>{pfData.overlapLevel}</p></div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{pfData.reasoning.split('.')[0] + '.'}</p>
          <ExpandBtn open={!!expanded['pf']} onToggle={() => toggle('pf')} />
        </Card>
        <Expandable open={!!expanded['pf']}>
          <div className="space-y-3">
            <Card isDarkMode={isDarkMode}><p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{pfData.reasoning}</p></Card>
            <Card isDarkMode={isDarkMode}>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Diversification Benefit</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{pfData.diversificationBenefit}</p>
            </Card>
          </div>
        </Expandable>
        <button onClick={() => setPfData(null)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <RefreshCw size={12} /> Analyze different holdings
        </button>
      </div>
    );
  };

  // TAB 6: Chat
  const ChatTab = () => (
    <Card isDarkMode={isDarkMode} className="flex flex-col" style={{ height: '380px' }}>
      {chat.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <MessageCircle size={28} className="text-blue-400/40" />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ask anything about this analysis</p>
          <p className="text-xs text-gray-500">"Why is confidence high?" · "What's the biggest risk?"</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-white/5 text-gray-200 border border-white/10' : 'bg-gray-100 text-gray-800'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loadingChat && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-4 py-2.5 ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-100'}`}>
                <Loader2 size={14} className="animate-spin text-blue-400" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}
      <div className={`flex gap-2 ${chat.length > 0 ? 'border-t pt-3' : ''} ${isDarkMode ? 'border-white/8' : 'border-gray-200'}`}>
        <input
          type="text" value={chatIn}
          onChange={e => setChatIn(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendChat()}
          placeholder="Ask a follow-up question…"
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm outline-none border ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-gray-100 border-gray-200 text-black placeholder:text-gray-400'}`}
        />
        <button
          onClick={sendChat} disabled={!chatIn.trim() || loadingChat}
          className="p-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white transition-all disabled:opacity-50"
        >
          <Send size={15} />
        </button>
      </div>
    </Card>
  );

  const TAB_CONTENT = [VerdictTab, ThesisTab, PersonasTab, ScenariosTab, RewindTab, PortfolioTab];

  return (
    <div className={`relative min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#050B14] text-white' : 'bg-white text-black'}`}>
      <ParticleBg isDarkMode={isDarkMode} />
      

      {/* 
        We render the ExportReportView here for printing. 
        The .print-only class ensures it only shows when window.print() is called.
      */}
      {phase === 'complete' && report && (
        <ExportReportView 
          query={query} 
          report={report} 
          thesis={thesisData} 
          finCtxRaw={finCtx} 
          cfData={cfData} 
        />
      )}

      {/* Wrapping the main UI in .no-print so it hides during printing */}
      <div className="relative no-print z-10">

      {/* Navbar */}
      <header className="bg-black/90 backdrop-blur border-b border-white/8 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={() => onBack()} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                <ArrowLeftCircle size={22} />
              </button>
            )}
            <span
              className="text-3xl font-bold tracking-widest text-white cursor-pointer select-none"
              style={{ fontFamily: "'Jura', sans-serif" }}
              onClick={() => onBack?.()}
            >
              AETHON<span className="text-blue-500">.</span>AI
            </span>
          </div>
          <button onClick={() => setIsDarkMode(d => !d)} className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-gray-300 transition-all">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16 flex gap-8 items-start justify-center transition-all duration-300">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full transition-all duration-300 ${isChatOpen ? 'max-w-2xl' : 'max-w-3xl'}`}
        >

        {/* Hero text (only on idle) */}
        <AnimatePresence>
          {phase === 'idle' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mt-10 mb-10"
            >
              <span className="text-xs font-bold tracking-[0.3em] uppercase mb-2 block text-blue-500" style={{ fontFamily: "'Jura', sans-serif" }}>
                Aethon AI Research Engine
              </span>
              <h1
                className={`text-4xl md:text-5xl font-black tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}
                style={{ fontFamily: "'Jura', sans-serif" }}
              >
                Autonomous Investment Research
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Multi-agent AI committee debates every angle — so you don't have to read everything.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search bar */}
        <div className={`mb-8 ${phase !== 'idle' ? '' : ''}`}>
          <div className="relative" ref={searchRef}>
            <div className={`flex items-stretch rounded-2xl border transition-all duration-300 shadow-2xl ${isDarkMode ? 'bg-[#0d1a2d] border-blue-500/15 focus-within:border-blue-500/50 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.12)]' : 'bg-black border-gray-800 focus-within:border-gray-600'}`}>
              <div className={`pl-5 flex items-center ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`}>
                <Search size={19} />
              </div>
              <div className="flex-1 relative flex items-center">
                {!query && phase !== 'analyzing' && (
                  <div className={`absolute left-4 pointer-events-none flex items-center gap-1 ${isDarkMode ? 'text-blue-300/50' : 'text-gray-400'}`}>
                    <span>Search any company…</span>
                    <TextType
                      text={['Tesla', 'Microsoft', 'Apple', 'NVIDIA', 'Amazon']}
                      typingSpeed={60}
                      deletingSpeed={40}
                      pauseDuration={2000}
                      cursorBlinkDuration={0.5}
                      className="font-bold text-blue-400"
                    />
                  </div>
                )}
                <input
                  type="text" value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setShowSuggestions(false); handleAnalyze(); } if (e.key === 'Escape') setShowSuggestions(false); }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full py-4 px-4 text-sm font-medium outline-none bg-transparent text-white z-10"
                  disabled={phase === 'analyzing'}
                />
              </div>
              {phase === 'complete' ? (
                <button onClick={resetAll} className="m-2 px-4 rounded-xl font-bold text-xs border border-white/10 text-gray-300 hover:bg-white/10 flex items-center gap-1.5 transition-all">
                  <RefreshCw size={13} /> New Research
                </button>
              ) : (
                <button
                  onClick={() => { setShowSuggestions(false); handleAnalyze(); }}
                  disabled={phase === 'analyzing' || !query}
                  className={`m-2 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all ${isDarkMode ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'bg-white hover:bg-gray-100 text-black'}`}
                >
                  {phase === 'analyzing'
                    ? <><Loader2 size={13} className="animate-spin" /> Analyzing</>
                    : <><Building2 size={13} /> Deploy Agents</>}
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className={`absolute left-0 right-0 top-[calc(100%+6px)] rounded-xl overflow-hidden shadow-2xl border z-50 ${isDarkMode ? 'bg-[#0d1a2d] border-blue-500/20' : 'bg-gray-900 border-gray-700'}`}
                >
                  {suggestions.map((s, i) => (
                    <button key={i} onMouseDown={() => { setQuery(s); setShowSuggestions(false); handleAnalyze(s); }} className="w-full flex items-center gap-3 px-5 py-3 text-left text-sm hover:bg-blue-500/10 transition-colors">
                      <Building2 size={13} className="text-blue-400 shrink-0" />
                      <span className="text-gray-200">
                        <span className="text-blue-400 font-bold">{s.slice(0, query.length)}</span>{s.slice(query.length)}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">

          {/* Step cards */}
          {phase === 'analyzing' && (
            <motion.div key="steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }} className="space-y-2.5">
              <AnimatePresence>
                {steps.map((s, i) => {
                  const cfg = AGENT_CFG[s.step] ?? { Icon: BarChart2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
                  return (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className={`rounded-2xl border p-4 flex items-center gap-4 ${isDarkMode ? 'border-white/8' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                        <cfg.Icon size={15} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{s.step}</span>
                          {s.status === 'running'   && <Loader2 size={12} className="animate-spin text-blue-400" />}
                          {s.status === 'complete'  && <CheckCircle2 size={12} className="text-green-400" />}
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {s.status === 'complete' ? stepSummary(s) : 'Processing…'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Report — tab panel */}
          {phase === 'complete' && report && (
            <motion.div key="report" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

              {/* Tab bar */}
              <BoxNav 
                items={TABS} 
                activeId={activeTab} 
                onSelect={setActiveTab} 
                isDarkMode={isDarkMode} 
              />

              {/* Tab content */}
              <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    {TAB_CONTENT[activeTab]()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
        </motion.div>

        {/* AI Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 380 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block shrink-0 relative"
            >
              <div className="sticky top-24 w-[380px]">
                <div className={`rounded-2xl border flex flex-col overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#0d1a2d] border-blue-500/20' : 'bg-gray-50 border-black border-2'}`} style={{ height: 'calc(100vh - 120px)' }}>
                  {/* Chat Header */}
                  <div className={`px-4 py-3 border-b flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} className="text-blue-400" />
                      <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Aethon AI Assistant</span>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  
                  {/* Chat Content */}
                  <div className="flex-1 flex flex-col p-4 overflow-hidden">
                    {chat.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                        <div className="scale-125 mb-4 pointer-events-none">
                          <ChatOrb isDarkMode={isDarkMode} onClick={() => {}} />
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600 font-semibold'}`}>Ask about this analysis...</p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3 scrollbar-hide">
                        {chat.map((m, i) => (
                          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-white/5 text-gray-200 border border-white/10' : 'bg-gray-200 text-gray-800'}`}>
                              {m.content}
                            </div>
                          </div>
                        ))}
                        {loadingChat && (
                          <div className="flex justify-start">
                            <div className={`rounded-2xl px-4 py-3 ${isDarkMode ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                              <div className="typing-dots">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                    
                    {/* Chat Input */}
                    <div className={`flex gap-2 pt-3 border-t mt-auto ${isDarkMode ? 'border-white/10' : 'border-gray-300'}`}>
                      <div className={`flex-1 flex items-center rounded-xl px-2 border transition-colors ${isDarkMode ? 'bg-[#050B14] border-white/10 text-white focus-within:border-white/30' : 'bg-white border-black text-black focus-within:border-gray-800'}`}>
                        <input
                          type="text" value={chatIn}
                          onChange={e => setChatIn(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendChat()}
                          placeholder={isListening ? "Listening..." : "Ask a follow-up…"}
                          className="flex-1 py-2.5 px-2 text-sm outline-none bg-transparent placeholder:text-gray-500"
                        />
                        <button
                          onClick={toggleListen}
                          className={`p-1.5 rounded-full transition-all flex items-center justify-center relative ${isListening ? 'text-white bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'text-gray-400 hover:text-white hover:bg-black/10 dark:hover:bg-white/10'}`}
                        >
                          {isListening ? (
                            <VoiceVisualizer />
                          ) : (
                            <Mic size={16} className="relative z-10" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={sendChat} disabled={!chatIn.trim() || loadingChat}
                        className="p-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white transition-all disabled:opacity-50"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Floating Chat Button (when closed) */}
        <AnimatePresence>
          {!isChatOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <ChatOrb isDarkMode={isDarkMode} onClick={() => setIsChatOpen(true)} />
            </motion.div>
          )}
        </AnimatePresence>
        
      </main>
      </div>
    </div>
  );
}






