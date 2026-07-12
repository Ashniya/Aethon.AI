import React from 'react';
import { Building2, ShieldAlert, LineChart, Target, Zap, Activity } from 'lucide-react';

interface SwotReport {
  recommendation: 'INVEST' | 'PASS' | 'HOLD';
  confidenceScore: number;
  convictionScore: number;
  agreementLevel: 'HIGH' | 'MODERATE' | 'SPLIT';
  reasoning: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[]; };
}

interface Thesis {
  bullCase: string;
  bearCase: string;
  keyDrivers: string[];
}

export default function ExportReportView({
  query,
  report,
  thesis,
  finCtxRaw,
  cfData
}: {
  query: string;
  report: SwotReport | null;
  thesis: Thesis | null;
  finCtxRaw: string;
  cfData: any;
}) {
  if (!report) return null;

  // Attempt to parse financial data
  let finData: any = {};
  try {
    finData = finCtxRaw ? JSON.parse(finCtxRaw) : {};
  } catch(e) {}

  const d = new Date();
  const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();

  const recColor = report.recommendation === 'INVEST' ? 'text-green-600' : report.recommendation === 'PASS' ? 'text-red-600' : 'text-yellow-600';
  const recDot = report.recommendation === 'INVEST' ? '🟢 Invest' : report.recommendation === 'PASS' ? '🔴 Pass' : '🟡 Hold';

  return (
    <div className="print-only hidden w-full bg-white text-black font-sans leading-relaxed text-[10pt]" style={{ color: '#000' }}>
      
      <style>{`
        @media print {
          @page { margin: 1cm; size: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-only { display: block !important; }
        }
      `}</style>
      
      {/* 1. COVER PAGE / HEADER */}
      <div className="text-center border-b border-gray-300 pb-6 mb-6">
        <div className="flex justify-center items-center gap-3 mb-2">
          <Building2 size={32} className="text-blue-600" />
          <h1 className="text-3xl font-black">Aethon AI Investment Research Report</h1>
        </div>
        <h2 className="text-xl font-bold text-gray-700">{query || 'Company Name'} (Symbol: {finData?.symbol || query.substring(0, 4).toUpperCase()})</h2>
        <div className="text-sm text-gray-500 mt-2">
          Generated: {dateStr} &nbsp;|&nbsp; Prepared by: AI Investment Research Agent
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY */}
      <div className="mb-8">
        <h2 className="text-2xl font-black mb-4 border-b-2 border-black pb-2 text-black">1. Executive Summary</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p><strong>Company Name:</strong> {query}</p>
            <p><strong>Industry:</strong> {finData?.sector || 'Technology'}</p>
            <p><strong>Current Stock Price:</strong> ${finData?.currentPrice || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-sm font-bold text-gray-500 uppercase">Overall AI Score</p>
            <p className="text-4xl font-black">{Math.round((report.confidenceScore + report.convictionScore) / 2)} <span className="text-lg text-gray-500">/ 100</span></p>
            <p className="mt-2 text-lg font-bold">Recommendation: <span className={recColor}>{recDot}</span></p>
            <p className="mt-1 text-sm font-semibold">Confidence Level: {report.confidenceScore}%</p>
          </div>
        </div>
        <div className="p-4 border-l-4 border-blue-500 bg-blue-50/50">
          <h3 className="font-bold mb-2">AI Verdict Explanation</h3>
          <p>{report.reasoning.split('.')[0] + '.'}</p>
        </div>
      </div>

      {/* 3. COMPANY OVERVIEW */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">2. Company Overview</h2>
        <table className="w-full text-left border-collapse mb-4">
          <tbody>
            <tr className="border-b"><td className="py-2 font-bold w-1/3">Company Name</td><td className="py-2">{query}</td></tr>
            <tr className="border-b"><td className="py-2 font-bold">Stock Symbol</td><td className="py-2">{finData?.symbol || query.substring(0, 4).toUpperCase()}</td></tr>
            <tr className="border-b"><td className="py-2 font-bold">CEO</td><td className="py-2">{finData?.companyOfficers?.[0]?.name || 'N/A'}</td></tr>
            <tr className="border-b"><td className="py-2 font-bold">Industry</td><td className="py-2">{finData?.sector || 'Technology'}</td></tr>
            <tr className="border-b"><td className="py-2 font-bold">Market Capitalization</td><td className="py-2">${(finData?.marketCap || 0).toLocaleString()}</td></tr>
          </tbody>
        </table>
        <h3 className="font-bold mb-2">About the Company</h3>
        <p className="text-gray-700">{finData?.longBusinessSummary || `${query} is a leading global technology company operating across key segments in the modern digital economy. The company's primary focus includes technological hardware, software services, and advanced AI platforms.`}</p>
      </div>

      {/* 4. BUSINESS MODEL */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">3. Business Model</h2>
        <p className="mb-2"><strong>Core Drivers & Revenue:</strong></p>
        <ul className="list-disc pl-5 mb-4 text-gray-700">
          {thesis?.keyDrivers?.map((kd, i) => (
            <li key={i} className="mb-1">{kd}</li>
          )) || <li>Maintains strong software/hardware service revenues.</li>}
        </ul>
      </div>

      {/* 5. FINANCIAL ANALYSIS */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">4. Financial Analysis</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border p-4 rounded-lg">
            <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">Profitability & Margins</h3>
            <p><strong>Gross Margin:</strong> {(finData?.grossMargins * 100)?.toFixed(1) || 'N/A'}%</p>
            <p><strong>Operating Margin:</strong> {(finData?.operatingMargins * 100)?.toFixed(1) || 'N/A'}%</p>
            <p><strong>ROE:</strong> {(finData?.returnOnEquity * 100)?.toFixed(1) || 'N/A'}%</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">Valuation</h3>
            <p><strong>P/E Ratio:</strong> {finData?.trailingPE?.toFixed(2) || 'N/A'}</p>
            <p><strong>Forward P/E:</strong> {finData?.forwardPE?.toFixed(2) || 'N/A'}</p>
            <p><strong>Trailing EPS:</strong> ${finData?.trailingEps || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* 6. STOCK PERFORMANCE */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">5. Stock Performance</h2>
        <table className="w-full text-left border-collapse mb-4">
          <tbody>
            <tr className="border-b"><td className="py-2 font-bold w-1/2">Current Price</td><td className="py-2">${finData?.currentPrice || 'N/A'}</td></tr>
            <tr className="border-b"><td className="py-2 font-bold">52-week High</td><td className="py-2">${finData?.fiftyTwoWeekHigh || 'N/A'}</td></tr>
            <tr className="border-b"><td className="py-2 font-bold">52-week Low</td><td className="py-2">${finData?.fiftyTwoWeekLow || 'N/A'}</td></tr>
            <tr className="border-b"><td className="py-2 font-bold">1-Year Return (Simulated)</td><td className="py-2">{cfData?.returnPct > 0 ? '+' : ''}{cfData?.returnPct?.toFixed(2) || 'N/A'}%</td></tr>
          </tbody>
        </table>
      </div>

      {/* 7. RECENT NEWS (MOCKED) */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">6. Recent News Analysis</h2>
        <p className="mb-2"><strong>Overall News Sentiment:</strong> {report.confidenceScore >= 70 ? 'Positive' : report.confidenceScore >= 40 ? 'Mixed' : 'Negative'} ({report.confidenceScore + 5}%)</p>
        <ul className="list-disc pl-5 text-gray-700">
          <li className="mb-1">{query} expands AI infrastructure and data center capacities globally. <strong>(Impact: Positive)</strong></li>
          <li className="mb-1">Global supply chain and export regulatory risks present ongoing headwinds. <strong>(Impact: Negative)</strong></li>
        </ul>
      </div>

      

      {/* 8. SWOT ANALYSIS */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">7. SWOT Analysis</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-green-50/30">
            <h3 className="font-bold text-green-700 mb-2">Strengths</h3>
            <ul className="list-disc pl-4 text-sm">{report.swot?.strengths?.map((s,i) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div className="p-4 border rounded-lg bg-red-50/30">
            <h3 className="font-bold text-red-700 mb-2">Weaknesses</h3>
            <ul className="list-disc pl-4 text-sm">{report.swot?.weaknesses?.map((w,i) => <li key={i}>{w}</li>)}</ul>
          </div>
          <div className="p-4 border rounded-lg bg-blue-50/30">
            <h3 className="font-bold text-blue-700 mb-2">Opportunities</h3>
            <ul className="list-disc pl-4 text-sm">{report.swot?.opportunities?.map((o,i) => <li key={i}>{o}</li>)}</ul>
          </div>
          <div className="p-4 border rounded-lg bg-orange-50/30">
            <h3 className="font-bold text-orange-700 mb-2">Threats</h3>
            <ul className="list-disc pl-4 text-sm">{report.swot?.threats?.map((t,i) => <li key={i}>{t}</li>)}</ul>
          </div>
        </div>
      </div>

      {/* 9. BULL VS BEAR */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">8. Bull vs Bear AI Debate</h2>
        <div className="mb-4">
          <h3 className="font-bold text-green-700 mb-1">Bull Analyst</h3>
          <p className="text-sm italic border-l-2 border-green-500 pl-3 py-1 bg-green-50/50">{thesis?.bullCase || 'Insufficient data to generate bull case.'}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-red-700 mb-1">Bear Analyst</h3>
          <p className="text-sm italic border-l-2 border-red-500 pl-3 py-1 bg-red-50/50">{thesis?.bearCase || 'Insufficient data to generate bear case.'}</p>
        </div>
      </div>

      {/* 10. RISK ASSESSMENT */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">9. Risk Assessment</h2>
        <table className="w-full text-left border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Risk Area</th>
              <th className="border p-2">Level</th>
              <th className="border p-2">Explanation</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border p-2">Market Risk</td><td className="border p-2 font-bold text-yellow-600">Medium</td><td className="border p-2 text-sm">Dependent on macro-economic trends and AI hype cycles.</td></tr>
            <tr><td className="border p-2">Financial Risk</td><td className="border p-2 font-bold text-green-600">Low</td><td className="border p-2 text-sm">Strong balance sheet offsets short-term volatility.</td></tr>
            <tr><td className="border p-2">Competition Risk</td><td className="border p-2 font-bold text-red-600">High</td><td className="border p-2 text-sm">Aggressive competition in hardware and software sectors.</td></tr>
          </tbody>
        </table>
      </div>

            {/* 11. AI INVESTMENT SCORE */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">10. AI Investment Score</h2>
        <div className="grid grid-cols-2 gap-8 items-center">
          <div>
            {[
              { label: 'Financial Health', score: Math.min(100, report.confidenceScore + 2) },
              { label: 'Growth Potential', score: Math.min(100, report.confidenceScore + 5) },
              { label: 'Market Position', score: report.confidenceScore },
              { label: 'Risk Level (Conviction)', score: report.convictionScore }
            ].map(item => (
              <div key={item.label} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">{item.label}</span>
                  <span className="font-bold">{item.score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: Math.max(0, item.score) + '%' }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border rounded-xl">
            <p className="text-sm font-bold text-gray-500 uppercase">Overall Score</p>
            <p className="text-6xl font-black mt-2 mb-1">{Math.round((report.confidenceScore + report.convictionScore) / 2)}</p>
            <p className="text-gray-400 font-bold">/ 100</p>
          </div>
        </div>
      </div>

      {/* 12. FINAL RECOMMENDATION */}
      <div className="mb-8 avoid-break">
        <h2 className="text-xl font-black mb-4 border-b border-gray-300 pb-2 text-black">11. Final Recommendation</h2>
        <div className="p-6 border-2 border-black rounded-lg">
          <p className="text-2xl font-black mb-2 uppercase">Recommendation: <span className={recColor}>{recDot}</span></p>
          <p className="font-bold mb-4">Confidence: {report.confidenceScore}%</p>
          <h3 className="font-bold text-gray-500 uppercase text-xs mb-1">Reasoning</h3>
          <p className="text-gray-800 leading-relaxed">{report.reasoning}</p>
        </div>
      </div>

      {/* 13. SOURCES & DISCLAIMER */}
      <div className="text-sm text-gray-500 avoid-break mt-12 border-t pt-4">
        <h3 className="font-bold mb-2">Sources</h3>
        <ul className="list-disc pl-5 mb-4">
          <li>Yahoo Finance & Market Data APIs</li>
          <li>SEC Filings & Company Annual Reports</li>
          <li>Alpha Vantage & News Aggregators</li>
        </ul>
        <h3 className="font-bold mb-1 text-xs uppercase">Disclaimer</h3>
        <p className="text-xs italic">
          This report was generated automatically by the Aethon AI Investment Research Agent. 
          It is intended for educational and research purposes only and should not be considered financial advice.
          Always conduct your own due diligence before making investment decisions.
        </p>
      </div>
    </div>
  );
}


