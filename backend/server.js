import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
    runResearchGraph,
    runPersonaAnalysis,
    runScenarioAnalysis,
    runCounterfactualAnalysis,
    runPortfolioFitAnalysis,
    runFollowUpChat,
} from './engine.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Main research (SSE streaming) ─────────────────────────────────────
app.post('/api/research', async (req, res) => {
    const { companyName } = req.body;
    if (!companyName) return res.status(400).json({ error: 'Company name is required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        await runResearchGraph(companyName, (update) => {
            res.write(`data: ${JSON.stringify(update)}\n\n`);
        });
        res.write('data: {"status":"complete"}\n\n');
        res.end();
    } catch (error) {
        console.error('Research error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

// ── Lazy feature endpoints ─────────────────────────────────────────────

app.post('/api/personas', async (req, res) => {
    try {
        const { financialData, persona } = req.body;
        const result = await runPersonaAnalysis(financialData, persona);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/scenarios', async (req, res) => {
    try {
        const result = await runScenarioAnalysis(req.body.financialData);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/counterfactual', async (req, res) => {
    try {
        const { financialData, years = 1 } = req.body;
        const result = await runCounterfactualAnalysis(financialData, years);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/portfolio-fit', async (req, res) => {
    try {
        const { financialData, holdings } = req.body;
        const result = await runPortfolioFitAnalysis(financialData, holdings);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/followup', async (req, res) => {
    try {
        const { context, question } = req.body;
        const result = await runFollowUpChat(context, question);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Start ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Aethon AI Backend running on port ${PORT}`));
