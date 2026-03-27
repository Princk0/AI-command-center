# AI Command Center — 10-Day Sprint Plan

## Claude Pro Usage Strategy

**Your budget:** ~45 messages per 5-hour window on Claude Pro ($20/month).
**Effective daily budget:** ~200 messages if you spread across the day.
**Strategy:** Batch related work into focused sessions. Each session below is designed to fit within one 5-hour window (~30-40 messages), leaving buffer for debugging.

**Tips to maximize messages:**
- Combine questions into one message ("do X and also Y")
- Paste errors + context together, don't send them in separate messages
- Use "continue" or "keep going" when Claude is mid-task
- Avoid re-uploading files — reference by name
- Code locally between sessions, batch questions for next session

---

## Phase 1: Frontend (Days 1–4)

Build the entire dashboard first so you have something visual and motivating.
Code one component per session. Test locally between sessions.

### Day 1 — Session 1: Project setup + StatusBar
**Messages needed:** ~15-20
**Tasks:**
- [ ] Initialize Vite + React + Tailwind project locally
- [ ] Ask Claude to build: `StatusBar.jsx` (connection indicator, Pi status pill)
- [ ] Verify Tailwind is working, app renders

**Commands to run locally between sessions:**
```bash
cd frontend
npm install
npm run dev
```

### Day 1 — Session 2: MetricCard component
**Messages needed:** ~15-20
**Tasks:**
- [ ] Ask Claude to build: `MetricCard.jsx` (with progress bar, color themes)
- [ ] Create mock data to preview all 4 metric cards
- [ ] Tweak styling, test responsive grid layout

### Day 2 — Session 1: MetricsChart component
**Messages needed:** ~15-20
**Tasks:**
- [ ] Ask Claude to build: `MetricsChart.jsx` (Recharts line chart)
- [ ] Wire up with mock time-series data
- [ ] Test chart responsiveness and tooltip formatting

### Day 2 — Session 2: ChatPanel component
**Messages needed:** ~25-30
**Tasks:**
- [ ] Ask Claude to build: `ChatPanel.jsx` (message list, input, quick actions)
- [ ] Add mock conversation flow for testing
- [ ] Style message bubbles, loading state, scroll behavior

### Day 3 — Session 1: ToolTrace + App layout
**Messages needed:** ~20-25
**Tasks:**
- [ ] Ask Claude to build: `ToolTrace.jsx` (tool call visualization sidebar)
- [ ] Wire all components into `App.jsx` with tab navigation
- [ ] Test full dashboard layout with mock data

### Day 3 — Session 2: useWebSocket hook + API client
**Messages needed:** ~15-20
**Tasks:**
- [ ] Ask Claude to build: `useWebSocket.js` hook
- [ ] Build `api.js` utility for REST calls
- [ ] Add connection state management, reconnection logic

### Day 4: Frontend polish + mock mode
**Messages needed:** ~20-25
**Tasks:**
- [ ] Add loading skeletons and error states
- [ ] Create mock data mode (works without backend)
- [ ] Responsive design pass (mobile + tablet)
- [ ] Final visual polish

---

## Phase 2: Pi Agent (Days 5–6)

### Day 5 — Session 1: Pi agent core
**Messages needed:** ~20-25
**Tasks:**
- [ ] Ask Claude to build: `main.py` (FastAPI server)
- [ ] Build `system_metrics.py` tool
- [ ] Build `process_manager.py` tool
- [ ] Test locally on laptop first (works without a real Pi)

### Day 5 — Session 2: Remaining tools
**Messages needed:** ~20-25
**Tasks:**
- [ ] Build `gpio_controller.py` (with simulation mode)
- [ ] Build `network_scanner.py`
- [ ] Build `command_runner.py` (with safety allowlist)
- [ ] Build `tool_schemas.py` (Claude API format)

### Day 6: Deploy scripts + Pi setup
**Messages needed:** ~15-20
**Tasks:**
- [ ] Ask Claude to build: `setup-ssh.sh` and `deploy.sh`
- [ ] SSH into Pi, test deploy script
- [ ] Verify all tool endpoints respond

---

## Phase 3: Backend + Integration (Days 7–8)

### Day 7 — Session 1: Claude agent core
**Messages needed:** ~25-30
**Tasks:**
- [ ] Ask Claude to build: `claude_agent.py` (tool-use loop)
- [ ] Build `tool_registry.py` (fetches schemas from Pi)
- [ ] Test agent with a simple prompt + one tool call

### Day 7 — Session 2: Backend API
**Messages needed:** ~20-25
**Tasks:**
- [ ] Build `main.py` (FastAPI orchestrator)
- [ ] Wire REST endpoints: /chat, /health, /tools, /metrics
- [ ] Add WebSocket endpoint for real-time streaming

### Day 8: End-to-end integration
**Messages needed:** ~25-30
**Tasks:**
- [ ] Connect frontend to real backend
- [ ] Test full flow: user message → Claude → Pi tool → response
- [ ] Fix WebSocket streaming, error handling
- [ ] Test with 10+ different natural language commands

---

## Phase 4: Polish + Ship (Days 9–10)

### Day 9: Error handling + cases
**Messages needed:** ~20-25
**Tasks:**
- [ ] Handle Pi offline gracefully
- [ ] Handle Claude API errors / rate limits
- [ ] Add toast notifications for alerts
- [ ] Test kill process safety, GPIO simulation

### Day 10: Documentation + demo
**Messages needed:** ~15-20
**Tasks:**
- [ ] Write `ARCHITECTURE.md` with diagrams
- [ ] Record demo video (2-3 minutes)
- [ ] Polish README with screenshots
- [ ] Push to GitHub, write LinkedIn post

---

## Daily Schedule Template

| Time | Activity |
|------|----------|
| 9:00 AM | Start Claude session 1 (coding with Claude) |
| 11:00 AM | Local dev work (test, run, debug independently) |
| 1:00 PM | Start Claude session 2 (next component) |
| 3:00 PM | Local dev work + Git commits |
| 6:00 PM | Optional session 3 (if needed for debugging) |

---

## What to say to Claude each session

**Starting a session:**
> "I'm working on the AI Command Center. Today I'm building [component]. Here's what I have so far: [paste current code if relevant]. Build me [specific thing]."

**Debugging:**
> "Here's the error I'm getting: [paste error]. Here's the relevant code: [paste code]. Fix this."

**Iterating:**
> "This works but I want to: 1) add X, 2) change Y, 3) fix Z. Update the component."

---

## Files to build (in order)

### Frontend (JavaScript/React)
1. `StatusBar.jsx` — connection indicator
2. `MetricCard.jsx` — stat card with progress bar
3. `MetricsChart.jsx` — Recharts time-series
4. `ChatPanel.jsx` — AI chat interface
5. `ToolTrace.jsx` — tool call visualizer
6. `App.jsx` — main layout with tabs
7. `useWebSocket.js` — real-time hook
8. `api.js` — REST client

### Pi Agent (Python)
9. `system_metrics.py` — CPU, RAM, disk, temp
10. `process_manager.py` — ps, kill, top
11. `gpio_controller.py` — pin control + sim
12. `network_scanner.py` — interfaces, ARP, ping
13. `command_runner.py` — safe shell exec
14. `tool_schemas.py` — Claude tool definitions
15. `main.py` — Pi FastAPI server

### Backend (Python)
16. `claude_agent.py` — tool-use orchestration
17. `tool_registry.py` — MCP-style bridge
18. `main.py` — orchestrator server

### DevOps
19. `setup-ssh.sh` — one-time SSH key setup
20. `deploy.sh` — auto-deploy to Pi
21. `start-all.sh` — full stack launcher
