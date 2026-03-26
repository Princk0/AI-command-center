# AI-command-cenetre

An intelligent IoT command center that turns a Raspberry Pi into an AI-managed edge node. A Claude-powered agent orchestrates device monitoring, process management, and system control through natural language — demonstrating MCP-style tool-use architecture on real hardware.

##  What This Demonstrates

| Skill | Implementation |
|-------|---------------|
| **AI Engineering** | Claude tool-use agent with 5+ custom tools, MCP-style architecture, structured reasoning |
| **Full-Stack Development** | React dashboard + FastAPI backend + Pi edge server, WebSocket real-time streaming |
| **Systems / IoT** | Raspberry Pi integration, SSH tunneling, system metrics collection, GPIO control |
| **Project Management** | Clean architecture, comprehensive docs, Git workflow, 10-day sprint delivery |

##  Architecture

```
┌─────────────────────────────────────────────┐
│          React Dashboard (Frontend)          │
│  Live metrics │ Chat UI │ Device controls    │
└──────────────────┬──────────────────────────┘
                   │ WebSocket + REST
┌──────────────────▼──────────────────────────┐
│         FastAPI Orchestrator (Backend)        │
│  Claude Agent │ Tool Registry │ Data Layer   │
└───────┬─────────────────────────┬───────────┘
        │ Anthropic API           │ SSH / REST
┌───────▼───────┐   ┌────────────▼────────────┐
│  Claude API   │   │   Raspberry Pi (Edge)    │
│  Tool Use     │   │  Metrics │ GPIO │ Procs  │
└───────────────┘   └─────────────────────────┘
```

## Project Structure

```
ai-command-center/
├── pi-agent/                # Runs ON the Raspberry Pi
│   ├── main.py              # FastAPI server exposing tools
│   ├── config.py            # Pi configuration
│   ├── requirements.txt
│   └── tools/               # Tool implementations
├── backend/                 # Runs on your laptop
│   ├── main.py              # FastAPI orchestrator server
│   ├── config.py            # Backend configuration
│   ├── requirements.txt
│   ├── agent/               # Claude tool-use agent
│   ├── api/                 # REST + WebSocket routes
│   ├── db/                  # SQLite data layer
│   └── tools/               # MCP-style tool registry
├── frontend/                # React dashboard
│   ├── src/components/      # UI components
│   ├── src/hooks/           # Custom React hooks
│   └── src/lib/             # API client
└── docs/                    # Project documentation
```

### Prerequisites
- Raspberry Pi (any model) with Raspbian OS and SSH enabled
- Python 3.11+ on both Pi and laptop
- Node.js 18+ (for frontend)
- Anthropic API key — get one at https://console.anthropic.com

### 1. Set Up the Pi Agent

```bash
ssh pi@<your-pi-ip>
cd edge-ai-command-center/pi-agent
pip install -r requirements.txt
python main.py
# → Running on http://0.0.0.0:8001
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env  # Add your API key + Pi IP
python main.py
# → Running on http://localhost:8000
```

### 3. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
# → Dashboard at http://localhost:5173
```

### 4. Try It Out

Open the dashboard and ask Claude:
- *"What's the CPU temperature on the Pi?"*
- *"Show me top 5 processes by memory usage"*
- *"Scan the local network for devices"*
- *"Turn on GPIO pin 17"*
- *"Give me a full system health report"*

##  Tech Stack

- **Edge (Pi):** Python 3.11, FastAPI, psutil, RPi.GPIO
- **Backend:** Python 3.11, FastAPI, Anthropic SDK, SQLite, WebSockets
- **Frontend:** React 18, Vite, Tailwind CSS, Recharts
- **DevOps:** Docker (optional), Makefile, GitHub Actions

##  Sprint Timeline

| Day | Milestone |
|-----|-----------|
| 1–2 | Pi agent server with all 5 tools |
| 3–4 | Backend orchestrator + Claude agent |
| 5–6 | React dashboard + real-time charts |
| 7–8 | End-to-end integration + WebSockets |
| 9–10 | Documentation, demo video, polish |


Built by Kelly Prince Rwanyange— Computer Science @ Toronto Metropolitan University
