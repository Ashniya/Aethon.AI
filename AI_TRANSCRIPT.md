# AI Pair Programming Transcript & Development Log

**Project:** Aethon AI - Autonomous Investment Research Agent
**Tech Stack:** React.js (Frontend), Node.js (Backend), LangChain.js / LangGraph.js (AI Orchestration)
**LLM Used:** Gemini 2.5 Flash

*Note: This is a synthesized log highlighting the core technical prompts, architectural decisions, and debugging sessions directed by the developer during the creation of this project.*

---

### Phase 1: Architecture & Core Implementation

**Developer:** 
> We are building an autonomous AI Investment Research Agent. The backend will be in Node.js using `LangGraph.js` to orchestrate a multi-agent committee. The frontend will be React. I need the backend to utilize `StateGraph` to manage data flow between several agents: a Data Gatherer (using FinnHub), a Growth Analyst, a Value Investor, a Risk Officer, a Skeptic, and finally a Judge who delivers a verdict. 

**AI Assistant:** 
> Understood. I will set up the Express server and implement the `StateGraph` with nodes for each agent. The data will be passed through the graph state, and I'll use Server-Sent Events (SSE) to stream the progress back to the React frontend so we can show real-time agent activity.

---

### Phase 2: Performance Optimization & Concurrency

**Developer:** 
> The sequential processing in the LangGraph pipeline is causing high latency. Specifically, the "Judge Deliberating" and "Building Investment Thesis" nodes are running one after the other. Refactor the graph edges to execute these two nodes concurrently after the Analysts Panel completes. We shouldn't block the UI rendering on the Judge's verdict if the Thesis is ready.

**AI Assistant:** 
> Good catch. I have modified the `engine.js` graph configuration. I removed the dependency between the Judge and Thesis nodes. Both will now branch out concurrently from the `analysts_panel` node. 
> 
> ```javascript
> workflow.addEdge("analysts_panel", "judge_verdict");
> workflow.addEdge("analysts_panel", "thesis_builder");
> ```

---

### Phase 3: UI/UX Refinement & Layout Fixes

**Developer:** 
> In the frontend dashboard, the navigation tabs (Verdicts, One Year Rewind, Thesis, etc.) are wrapping to a second line when they shouldn't. Reduce the padding on the buttons and update the CSS flex properties to force them into a single horizontal row (`flex-wrap: nowrap`) with horizontal scrolling enabled.

**AI Assistant:** 
> I have updated `BoxNav.css`. I reduced the padding to `8px 12px`, decreased the font size slightly, and applied `overflow-x: auto` with `flex-wrap: nowrap`. The tabs now form a perfect horizontal line that won't break layout on smaller screens.

---

### Phase 4: State Management & Component Lifecycle Bug

**Developer:** 
> I found a state persistence bug in `AgentWorkflow.tsx`. If a user initiates a search and then navigates away to the landing page, returning to the agent page re-mounts the component with a locked `phase="analyzing"` state from `localStorage`, but the SSE stream is already lost. Add a check during state initialization: if the saved phase is 'analyzing', treat it as an interrupted session and reset the phase to 'idle' with an empty query.

**AI Assistant:** 
> I've refactored the `useState` initializers. On component mount, it now evaluates `const isInterrupted = initialPhase === 'analyzing';`. If true, it gracefully drops the stale state and resets the UI back to the initial search bar, preventing the app from hanging.

---

### Phase 5: Handling API Rate Limits & Dynamic Backoff

**Developer:** 
> Because of our new concurrent node execution, we are occasionally hitting the Gemini Free Tier limits: `429 Too Many Requests (Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests)`. The current retry logic defaults to a 46-second wait, which is too long. Update the `callAgent` retry block to parse the specific `retryDelay` field from the Google RPC `errorDetails` payload and dynamically wait only the required time (e.g., 14 seconds). Also, disable LangChain's internal retries so it drops down to our custom handler immediately.

**AI Assistant:** 
> I have updated the error handling block in `engine.js`. 
> 1. Passed `maxRetries: 0` to `ChatGoogleGenerativeAI` to bypass internal stalling.
> 2. Added logic to parse `type.googleapis.com/google.rpc.RetryInfo`. It now reads the exact `retryDelay` (e.g., "14s") and sets `delayMs` dynamically. The app will now recover from rate limits in ~15 seconds instead of 46 seconds.
