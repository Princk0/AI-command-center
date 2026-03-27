# Initial Commit Message

## Short form (for `git commit -m`):

```
feat: initial scaffold — AI Command Center

Full-stack IoT command center with Claude-powered agent orchestration.
Pi node exposes system tools via REST, backend orchestrates via
Claude tool-use API, React dashboard with real-time metrics and chat.

Tech: React + Vite + Tailwind | FastAPI + Anthropic SDK | Raspberry Pi
```

## Long form (for `git commit` with editor):

```
feat: initial scaffold — AI Command Center

An intelligent IoT command center that turns a Raspberry Pi into an
AI-powered node. A Claude agent orchestrates device tools through
natural language — query system metrics, manage processes, control GPIO
pins, and monitor the network by talking to it.

Architecture:
- Frontend: React 18 + Vite + Tailwind CSS + Recharts
  - Real-time dashboard with live-updating metric cards and charts
  - AI chat interface with tool call visualization sidebar
  - Mock data mode for development without backend
  - WebSocket hook for streaming Pi metrics

- Backend: FastAPI + Anthropic SDK + SQLite
  - Claude tool-use agent with full tool call loop
  - MCP-style tool registry bridging Claude API to Pi endpoints
  - REST + WebSocket API for frontend consumption
  - Conversation history management

- Pi Agent: FastAPI lightweight server
  - 5 tools: system_metrics, process_manager, gpio_controller,
    network_scanner, command_runner
  - JSON schemas matching Claude tool-use format
  - Safety: command allowlist, GPIO pin restrictions, process kill guards
  - Simulation mode for GPIO when no hardware detected

- DevOps: Automated SSH deployment pipeline
  - One-time SSH key setup script
  - Auto-deploy: sync code, install deps, start server, health check
  - Full-stack launcher (Pi + backend + frontend in one command)
  - Remote status check and stop scripts

Project structure:
 ai-command-center/
  ├── frontend/          React dashboard (Vite + Tailwind)
  ├── backend/           FastAPI orchestrator (Claude agent)
  ├── pi-agent/          Runs on Raspberry Pi (tools + REST)
  ├── scripts/           SSH setup, deploy, start-all
  └── docs/              Architecture, sprint plan, deep dive

Skills demonstrated:
  - AI Engineering: Claude tool use, agent orchestration, MCP pattern
  - Full-Stack: React, FastAPI, WebSockets, SQLite, REST
  - Systems/IoT: Raspberry Pi, SSH automation, system monitoring
  - Project Management: Clean architecture, documentation, sprint plan
```

## Git Setup Commands

Run these in the project root:

```bash
# Initialize repo
git init
git branch -M main

# Stage everything
git add .

# Commit
git commit -m "feat: initial scaffold — AI Command Center

Full-stack IoT command center with Claude-powered agent orchestration.
Pi node exposes system tools via REST, backend orchestrates via
Claude tool-use API, React dashboard with real-time metrics and chat.

Architecture:
- Frontend: React 18 + Vite + Tailwind + Recharts (mock mode included)
- Backend: FastAPI + Anthropic SDK + WebSocket streaming
- Pi Agent: 5 tools with safety guards + GPIO simulation
- DevOps: Automated SSH deploy pipeline

Tech: React + Vite + Tailwind | FastAPI + Anthropic SDK | Raspberry Pi"

# Connect to GitHub (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME ai-command-center.git
git push -u origin main
```

## Suggested Branch Strategy for Sprint

```bash
# After initial commit, create a dev branch
git checkout -b dev

# For each feature, branch off dev:
git checkout -b feat/frontend-dashboard    # Days 1-4
git checkout -b feat/pi-agent             # Days 5-6
git checkout -b feat/backend-orchestrator  # Days 7-8
git checkout -b feat/polish-and-docs       # Days 9-10

# Merge back to dev when feature is complete:
git checkout dev
git merge feat/frontend-dashboard

# When sprint is done, merge dev to main:
git checkout main
git merge dev
git tag v1.0.0
git push --tags
```

## Future Commit Message Convention

Use conventional commits for a clean history:

```
feat: add real-time CPU chart to dashboard
fix: WebSocket reconnection loop on Pi disconnect
refactor: extract MessageBubble as reusable component
docs: add architecture diagram to README
style: polish metric card hover states
test: add mock data unit tests
chore: update dependencies
```
