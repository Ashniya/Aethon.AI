import { useEffect, useRef } from 'react';
import './InteractiveExperience.css';

export default function InteractiveExperience({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <section className={`interactive-experience py-24 px-6 ${isDarkMode ? "bg-[#050B14]" : "bg-[#EAEAEA]"}`}>
      <div className="container max-w-6xl mx-auto relative z-10">
        
        <div className="section-header text-center mb-[70px]">
          <span className="badge inline-block px-[18px] py-[10px] border border-blue-500/40 rounded-full text-blue-400 text-xs tracking-widest uppercase mb-3">
            ADVANCED TOOLKIT
          </span>
          <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`} style={{ fontFamily:"Jura, sans-serif" }}>
            Interactive Experience
          </h2>
          <p className={`max-w-2xl mx-auto ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Go beyond static research. Interact with AI, explore portfolio fit,
            generate executive reports, and travel through market history.
          </p>
        </div>

        <div className="features-grid">

          {/* AI ORB */}
          <div className={`feature-card ${isDarkMode ? "bg-[#0d1626]/75 border-blue-500/20 text-white" : "bg-white/80 border-gray-300 text-black"} backdrop-blur-md border rounded-3xl p-8 transition-all duration-400 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(79,141,255,0.15)] min-h-[340px]`}>
            <div className="orb-wrapper h-[180px] flex justify-center items-center relative">
              <div className="orb w-[90px] h-[90px] rounded-full bg-gradient-to-r from-[#74a8ff] to-[#1f5cff] shadow-[0_0_60px_#2f6fff]"></div>
              <div className="ring ring1 absolute border border-blue-500/30 rounded-full w-[140px] h-[140px]"></div>
              <div className="ring ring2 absolute border border-blue-500/30 rounded-full w-[190px] h-[190px]"></div>
            </div>
            <h3 className="text-2xl mt-[30px] font-bold">Interactive AI Assistant</h3>
            <p className={`mt-2 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Ask follow-up questions, challenge assumptions, and explore investment ideas in real time.
            </p>
          </div>

          {/* VOICE */}
          <div className={`feature-card ${isDarkMode ? "bg-[#0d1626]/75 border-blue-500/20 text-white" : "bg-white/80 border-gray-300 text-black"} backdrop-blur-md border rounded-3xl p-8 transition-all duration-400 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(79,141,255,0.15)] min-h-[340px]`}>
            <div className="waveform h-[180px] flex justify-center items-center gap-[10px]">
              <span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span>
            </div>
            <h3 className="text-2xl mt-[30px] font-bold">Voice Powered Prompts</h3>
            <p className={`mt-2 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Speak naturally with the AI instead of typing.
            </p>
          </div>

          {/* PORTFOLIO */}
          <div className={`feature-card ${isDarkMode ? "bg-[#0d1626]/75 border-blue-500/20 text-white" : "bg-white/80 border-gray-300 text-black"} backdrop-blur-md border rounded-3xl p-8 transition-all duration-400 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(79,141,255,0.15)] min-h-[340px]`}>
            <div className="network h-[180px] relative">
              <div className="node center w-[18px] h-[18px] rounded-full bg-[#5f9cff] absolute shadow-[0_0_15px_#4f8dff] top-[80px] left-[145px]"></div>
              <div className="node n1 w-[18px] h-[18px] rounded-full bg-[#5f9cff] absolute shadow-[0_0_15px_#4f8dff] top-[25px] left-[60px]"></div>
              <div className="node n2 w-[18px] h-[18px] rounded-full bg-[#5f9cff] absolute shadow-[0_0_15px_#4f8dff] top-[35px] right-[45px]"></div>
              <div className="node n3 w-[18px] h-[18px] rounded-full bg-[#5f9cff] absolute shadow-[0_0_15px_#4f8dff] bottom-[25px] left-[70px]"></div>
              <div className="node n4 w-[18px] h-[18px] rounded-full bg-[#5f9cff] absolute shadow-[0_0_15px_#4f8dff] bottom-[30px] right-[55px]"></div>

              <svg viewBox="0 0 300 300" className="w-full h-full">
                <line x1="150" y1="150" x2="70" y2="80" stroke="#4f8dff" strokeWidth="2" opacity="0.4"/>
                <line x1="150" y1="150" x2="240" y2="90" stroke="#4f8dff" strokeWidth="2" opacity="0.4"/>
                <line x1="150" y1="150" x2="80" y2="230" stroke="#4f8dff" strokeWidth="2" opacity="0.4"/>
                <line x1="150" y1="150" x2="230" y2="220" stroke="#4f8dff" strokeWidth="2" opacity="0.4"/>
              </svg>
            </div>
            <h3 className="text-2xl mt-[30px] font-bold">Portfolio Fit Analysis</h3>
            <p className={`mt-2 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Understand diversification, overlap, concentration risk, and sector exposure.
            </p>
          </div>

          {/* PDF */}
          <div className={`feature-card ${isDarkMode ? "bg-[#0d1626]/75 border-blue-500/20 text-white" : "bg-white/80 border-gray-300 text-black"} backdrop-blur-md border rounded-3xl p-8 transition-all duration-400 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(79,141,255,0.15)] min-h-[340px]`}>
            <div className="pdf-box h-[180px] flex justify-center items-center">
              <div className="pdf-paper w-[130px] h-[160px] bg-white rounded-xl p-[20px] shadow-lg">
                <div className="line h-[10px] bg-[#d0d7e5] mb-[15px] rounded-full"></div>
                <div className="line short w-[60%] h-[10px] bg-[#d0d7e5] mb-[15px] rounded-full"></div>
                <div className="line h-[10px] bg-[#d0d7e5] mb-[15px] rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl mt-[30px] font-bold">Professional PDF Exports</h3>
            <p className={`mt-2 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Instantly convert AI analysis into executive-ready reports.
            </p>
          </div>

          {/* TIMELINE */}
          <div className={`feature-card timeline-card ${isDarkMode ? "bg-[#0d1626]/75 border-blue-500/20 text-white" : "bg-white/80 border-gray-300 text-black"} backdrop-blur-md border rounded-3xl p-8 transition-all duration-400 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(79,141,255,0.15)] min-h-[340px]`}>
            <div className="timeline h-[180px] flex items-center justify-between relative">
              <div className="absolute left-0 right-0 h-[3px] bg-[#1e3765]"></div>
              <div className="year z-10 text-[#c5d4f0] bg-[#0d1626] p-2 text-sm font-semibold rounded">2021</div>
              <div className="year z-10 text-[#c5d4f0] bg-[#0d1626] p-2 text-sm font-semibold rounded">2022</div>
              <div className="year z-10 text-[#c5d4f0] bg-[#0d1626] p-2 text-sm font-semibold rounded">2023</div>
              <div className="year z-10 text-[#c5d4f0] bg-[#0d1626] p-2 text-sm font-semibold rounded">2024</div>
              <div className="year z-10 text-[#c5d4f0] bg-[#0d1626] p-2 text-sm font-semibold rounded">2025</div>
              <div className="scanner absolute w-[80px] h-[6px] bg-[#5a96ff] shadow-[0_0_20px_#5a96ff]"></div>
            </div>
            <h3 className="text-2xl mt-[30px] font-bold">Historical Time Machine</h3>
            <p className={`mt-2 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Replay market events, earnings reports, and stock movements year by year.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
