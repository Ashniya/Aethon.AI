import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, END, START } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import dotenv from 'dotenv';
dotenv.config();

// ── State ─────────────────────────────────────────────────────────────
const graphState = {
    companyName:    { value: (x, y) => y ?? x, default: () => "" },
    financialData:  { value: (x, y) => y ?? x, default: () => null },
    growthAnalysis: { value: (x, y) => y ?? x, default: () => "" },
    riskAnalysis:   { value: (x, y) => y ?? x, default: () => "" },
    valueAnalysis:  { value: (x, y) => y ?? x, default: () => "" },
    skepticAnalysis:{ value: (x, y) => y ?? x, default: () => "" },
    finalReport:    { value: (x, y) => y ?? x, default: () => null },
    thesisData:     { value: (x, y) => y ?? x, default: () => null },
};

const TICKER_MAP = {
    'google': 'GOOGL', 'alphabet': 'GOOGL', 'meta': 'META', 'facebook': 'META',
    'apple': 'AAPL', 'microsoft': 'MSFT', 'amazon': 'AMZN', 'nvidia': 'NVDA',
    'tesla': 'TSLA', 'netflix': 'NFLX', 'spotify': 'SPOT', 'uber': 'UBER',
    'twitter': 'X', 'x': 'X', 'snapchat': 'SNAP', 'snap': 'SNAP',
    'samsung': '005930.KS', 'infosys': 'INFY', 'tcs': 'TCS.NS', 'wipro': 'WIT',
    'reliance': 'RELIANCE.NS', 'hdfc': 'HDFCBANK.NS', 'adani': 'ADANIENT.NS',
    'intel': 'INTC', 'amd': 'AMD', 'qualcomm': 'QCOM', 'palantir': 'PLTR',
    'shopify': 'SHOP', 'salesforce': 'CRM', 'oracle': 'ORCL', 'ibm': 'IBM',
    'jpmorgan': 'JPM', 'jp morgan': 'JPM', 'goldman': 'GS', 'berkshire': 'BRK-B',
    'coca cola': 'KO', 'cocacola': 'KO', 'pepsi': 'PEP', 'mcdonalds': 'MCD',
    'nike': 'NKE', 'boeing': 'BA', 'ford': 'F', 'gm': 'GM',
    'zomato': 'ZOMATO.NS', 'tata motors': 'TATAMOTORS.NS', 'paytm': 'PAYTM.NS',
    'mahindra': 'M&M.NS', 'mahendra': 'M&M.NS', 'mahindra & mahindra': 'M&M.NS',
};

// ── LLM helpers ───────────────────────────────────────────────────────
function createLLM() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key not set in backend/.env");
    return new ChatGoogleGenerativeAI({ model: "gemini-2.5-flash", temperature: 0.3, apiKey, maxRetries: 0 });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function callAgent(system, user, retries = 3) {
    const llm = createLLM();
    try {
        const r = await llm.invoke([new SystemMessage(system), new HumanMessage(user)]);
        return r.content;
    } catch (e) {
        if (e.status === 429 && retries > 0) {
            let delayMs = 46000;
            if (e.errorDetails) {
                const retryInfo = e.errorDetails.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                if (retryInfo && retryInfo.retryDelay) {
                    delayMs = (parseFloat(retryInfo.retryDelay) + 1) * 1000;
                }
            }
            console.warn(`Hit Gemini 429 Rate Limit. Waiting ${delayMs/1000}s before retrying...`);
            await sleep(delayMs); // Wait the required time
            return callAgent(system, user, retries - 1);
        }
        throw e;
    }
}

async function callAgentJSON(system, user) {
    const raw = await callAgent(system, user);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    try { return JSON.parse(cleaned); } catch { return null; }
}

// ── Data Gatherer ─────────────────────────────────────────────────────
async function dataGatherer(state) {
    const { companyName } = state;
    try {
        const norm = companyName.toLowerCase().trim();
        let ticker = TICKER_MAP[norm];

        if (!ticker) {
            const llmRes = await callAgent(
                `Return ONLY the official stock ticker symbol for the company: "${companyName}". No explanation, just the ticker (e.g. AAPL, or M&M.NS for Indian stocks). If unknown, return UNKNOWN.`,
                "What is the ticker?"
            );
            let cleaned = llmRes.trim().toUpperCase();
            if (cleaned.includes(' ')) {
                const words = cleaned.split(/\s+/);
                cleaned = words.find(w => /^[A-Z0-9.&-]+$/.test(w)) || words[0];
            }
            cleaned = cleaned.replace(/[^A-Z0-9.&-]/g, '');
            if (cleaned.endsWith('.')) cleaned = cleaned.slice(0, -1);
            
            ticker = cleaned;
            if (!ticker || ticker === 'UNKNOWN') ticker = companyName.toUpperCase().replace(/[^A-Z]/g, '');
        }

        console.log(`Resolved "${companyName}" → ${ticker}`);

        const key = process.env.FINNHUB_API_KEY;
        const encodedTicker = encodeURIComponent(ticker);
        const [profileRes, quoteRes, metricsRes] = await Promise.all([
            fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodedTicker}&token=${key}`),
            fetch(`https://finnhub.io/api/v1/quote?symbol=${encodedTicker}&token=${key}`),
            fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodedTicker}&metric=all&token=${key}`)
        ]);
        const [profile, quote, metrics] = await Promise.all([profileRes.json(), quoteRes.json(), metricsRes.json()]);

        let recentNews = [];
        try {
            const nRes = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName)}&language=en&sortBy=publishedAt&pageSize=3&apiKey=${process.env.NEWS_API_KEY}`);
            const nData = await nRes.json();
            if (nData.articles) recentNews = nData.articles.map(a => a.title).slice(0, 3);
        } catch (_) { /* silent */ }

        const dataStr = JSON.stringify({
            companyName: profile.name || companyName,
            symbol: ticker,
            industry: profile.finnhubIndustry,
            price: quote.c,
            dayHigh: quote.h,
            dayLow: quote.l,
            previousClose: quote.pc,
            marketCap: profile.marketCapitalization,
            fiftyTwoWeekHigh: metrics.metric?.['52WeekHigh'],
            fiftyTwoWeekLow: metrics.metric?.['52WeekLow'],
            peRatio: metrics.metric?.peBasicExclExtraTTM,
            returnOnEquity: metrics.metric?.roeTTM,
            revenueGrowth: metrics.metric?.revenueGrowthTTMYoy,
            recentNews,
        });

        return { financialData: dataStr };
    } catch (e) {
        console.error("dataGatherer error:", e.message);
        return { financialData: JSON.stringify({ error: `Could not fetch data for ${companyName}: ${e.message}` }) };
    }
}

// ── Analysis Agents ───────────────────────────────────────────────────
async function allAnalystsAgent(state) {
    const result = await callAgentJSON(
        `You are the Aethon AI Investment Committee. You have four specialized analysts:
1. Growth Analyst: Evaluates growth potential, revenue trends, market expansion, catalysts.
2. Value Investor: Analyzes valuation metrics, PE ratio, profitability, margins.
3. Risk Officer: Identifies top dangers, debt levels, competition, macro/regulatory threats.
4. Skeptic: Challenges the investment case ruthlessly, finding reasons it could fail.

Based on the financial data below, provide 2-3 sentences for each analyst's perspective.
Financial Data: ${state.financialData}

Return ONLY valid JSON (no markdown):
{
  "growthAnalysis": "<2-3 sentences>",
  "valueAnalysis": "<2-3 sentences>",
  "riskAnalysis": "<2-3 sentences>",
  "skepticAnalysis": "<2-3 sentences>"
}`,
        "Provide the analysts' evaluations JSON."
    );
    return result || {
        growthAnalysis: "Analysis unavailable.",
        valueAnalysis: "Analysis unavailable.",
        riskAnalysis: "Analysis unavailable.",
        skepticAnalysis: "Analysis unavailable."
    };
}

async function judgeAgent(state) {
    const result = await callAgentJSON(
        `You are the CEO and Final Judge of the Aethon AI Investment Committee. Synthesize all inputs below into a final verdict.

Financial Data: ${state.financialData}
Growth Analyst: ${state.growthAnalysis}
Value Investor: ${state.valueAnalysis}
Risk Officer:   ${state.riskAnalysis}
Skeptic Agent:  ${state.skepticAnalysis}

Return ONLY valid JSON (no markdown):
{
  "recommendation": "INVEST" | "PASS" | "HOLD",
  "confidenceScore": <0-100, your confidence in this recommendation>,
  "convictionScore": <0-100, how strongly ALL agents AGREE — 100=unanimous, 0=totally split>,
  "agreementLevel": "HIGH" | "MODERATE" | "SPLIT",
  "reasoning": "<2-3 sentence executive verdict>",
  "swot": {
    "strengths":     ["<1 line>", "<1 line>"],
    "weaknesses":    ["<1 line>", "<1 line>"],
    "opportunities": ["<1 line>", "<1 line>"],
    "threats":       ["<1 line>", "<1 line>"]
  }
}`,
        "Provide the final verdict JSON."
    );
    return {
        finalReport: result || {
            recommendation: "HOLD", confidenceScore: 50, convictionScore: 50,
            agreementLevel: "MODERATE", reasoning: "Analysis inconclusive.",
            swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] }
        }
    };
}

async function thesisAgent(state) {
    const result = await callAgentJSON(
        `You are the Investment Thesis Writer for the Aethon AI Committee. Write a formal, structured investment thesis based on all inputs below.

Summary context:
- Growth: ${state.growthAnalysis}
- Value:  ${state.valueAnalysis}
- Risk:   ${state.riskAnalysis}
- Skeptic: ${state.skepticAnalysis}

Return ONLY valid JSON:
{
  "bullCase": "<3-4 sentences making the strongest possible case FOR investing>",
  "bearCase": "<3-4 sentences making the strongest possible case AGAINST investing>",
  "keyDrivers": ["<short driver phrase>", "<short driver phrase>", "<short driver phrase>"]
}`,
        "Write the thesis JSON."
    );
    return {
        thesisData: result || { bullCase: "Insufficient data.", bearCase: "Insufficient data.", keyDrivers: [] }
    };
}

// ── Standalone exports for lazy features ─────────────────────────────

export async function runPersonaAnalysis(financialData, persona) {
    const prompts = {
        buffett: `You are Warren Buffett. Analyze this stock with your legendary value investor lens — look for durable competitive moats, strong management, predictable earnings, and reasonable valuation. You are skeptical of hype. Speak in Buffett's voice: folksy, wise, long-term focused. 3-4 sentences. Start with "I would..." or "This reminds me of..."`,
        cathieWood: `You are Cathie Wood, CEO of ARK Invest. Analyze this stock with your disruptive innovation lens — exponential growth, technological disruption, 5-year horizon. Be bold and visionary. 3-4 sentences. Start with "We believe..." or "This company..."`
    };
    const analysis = await callAgent(prompts[persona] || prompts.buffett, `Financial data: ${financialData}`);
    return { analysis };
}

export async function runScenarioAnalysis(financialData) {
    const result = await callAgentJSON(
        `Analyze the impact of 3 macro scenarios on this specific stock. Be specific to the company's business model. Return ONLY valid JSON array:
[
  { "name": "Interest Rates Rise +2%",  "impact": "HIGH"|"MEDIUM"|"LOW", "direction": "POSITIVE"|"NEGATIVE", "reasoning": "<1-2 sentences>" },
  { "name": "Revenue Drops 20%",         "impact": "HIGH"|"MEDIUM"|"LOW", "direction": "POSITIVE"|"NEGATIVE", "reasoning": "<1-2 sentences>" },
  { "name": "Market Crash -30%",         "impact": "HIGH"|"MEDIUM"|"LOW", "direction": "POSITIVE"|"NEGATIVE", "reasoning": "<1-2 sentences>" }
]`,
        `Financial data: ${financialData}`
    );
    return Array.isArray(result) ? result : [];
}

export async function runCounterfactualAnalysis(financialData, years = 1) {
    let promptText = `Based on this data, estimate two things for the past ${years} years:
1) What $10,000 invested ${years} years ago would be worth today.
2) The Revenue growth over the last ${years} years (treat base as 100%).

Return ONLY valid JSON:
{
  "stock": {
    "currentValue": <estimated number for $10,000 invested>,
    "returnPct": <number - positive or negative percentage>,
    "verdict": "<one clean sentence like: Your $10,000 would be worth $14,230 today.>"
  },
  "revenue": {
    "currentValue": <estimated percentage vs base 100, e.g. 145>,
    "returnPct": <number - positive or negative percentage growth>,
    "verdict": "<one clean sentence like: Over the past ${years} years, Revenue grew by 45%.>"
  },
  "context": "<2 sentences explaining what drove this performance in market context>"
}`;

    const result = await callAgentJSON(
        promptText,
        `Financial data: ${financialData}`
    );
    return result;
}

export async function runPortfolioFitAnalysis(financialData, holdings) {
    const result = await callAgentJSON(
        `The user currently holds: ${holdings}. Analyze whether this new stock is a good FIT for their portfolio. Consider sector overlap, correlation, diversification benefit. Return ONLY valid JSON:
{
  "overlapLevel": "HIGH"|"MODERATE"|"LOW",
  "recommendation": "GOOD FIT"|"CONSIDER"|"POOR FIT",
  "reasoning": "<2-3 sentences on portfolio fit>",
  "diversificationBenefit": "<1 sentence on what this adds or doesn't add>"
}`,
        `New stock data: ${financialData}`
    );
    return result;
}

export async function runFollowUpChat(context, question) {
    const answer = await callAgent(
        `You are Aethon AI's research assistant. The user just completed a stock analysis session. Using the research context below, answer the follow-up question directly and concisely. Reference specific data from the analysis when relevant. Keep your answer to 2-4 sentences.\n\nResearch Context:\n${context}`,
        question
    );
    return { answer };
}

// ── Main research graph ───────────────────────────────────────────────
export async function runResearchGraph(companyName, onUpdate) {
    const workflow = new StateGraph({ channels: graphState })
        .addNode("gather_data", async (state) => {
            onUpdate({ step: "Gathering Financial Data", status: "running" });
            const r = await dataGatherer(state);
            onUpdate({ step: "Gathering Financial Data", status: "complete", result: r.financialData });
            return r;
        })
        .addNode("analysts_panel", async (state) => {
            // Signal UI that multiple agents are running
            onUpdate({ step: "Growth Analyst Evaluating", status: "running" });
            onUpdate({ step: "Value Investor Evaluating", status: "running" });
            onUpdate({ step: "Risk Officer Evaluating", status: "running" });
            onUpdate({ step: "Skeptic Agent Challenging", status: "running" });

            // Consolidate 4 analyst calls into 1 to respect Gemini 15 RPM Free Tier limits
            // and dramatically improve overall performance
            const res = await allAnalystsAgent(state);
            
            onUpdate({ step: "Growth Analyst Evaluating", status: "complete", result: res.growthAnalysis });
            onUpdate({ step: "Value Investor Evaluating", status: "complete", result: res.valueAnalysis });
            onUpdate({ step: "Risk Officer Evaluating", status: "complete", result: res.riskAnalysis });
            onUpdate({ step: "Skeptic Agent Challenging", status: "complete", result: res.skepticAnalysis });

            return {
                growthAnalysis: res.growthAnalysis,
                valueAnalysis: res.valueAnalysis,
                riskAnalysis: res.riskAnalysis,
                skepticAnalysis: res.skepticAnalysis
            };
        })
        .addNode("judge_verdict", async (state) => {
            onUpdate({ step: "Judge Deliberating", status: "running" });
            const r = await judgeAgent(state);
            onUpdate({ step: "Judge Deliberating", status: "complete", result: r.finalReport });
            return r;
        })
        .addNode("thesis_builder", async (state) => {
            onUpdate({ step: "Building Investment Thesis", status: "running" });
            const r = await thesisAgent(state);
            onUpdate({ step: "Building Investment Thesis", status: "complete", result: r.thesisData });
            return r;
        });

    workflow.addEdge(START, "gather_data");
    workflow.addEdge("gather_data", "analysts_panel");
    workflow.addEdge("analysts_panel", "judge_verdict");
    workflow.addEdge("analysts_panel", "thesis_builder");
    workflow.addEdge("judge_verdict", END);
    workflow.addEdge("thesis_builder", END);

    const app = workflow.compile();
    return await app.invoke({ companyName });
}
