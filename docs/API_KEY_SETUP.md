# Setting Up Your Claude API Key

This project uses Claude (by Anthropic) as the AI brain that controls  a given system this time it's Raspberry Pi. To use the AI chat feature, you need your own API key. This guide walks you through getting one and configuring it.

> **No API key?** The dashboard, metrics, and mock mode all work without a key. Only the AI chat requires one.

---

## Step 1: Create an Anthropic Account

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Click **Sign Up**
3. Verify your email address

---

## Step 2: Add Credits

Anthropic's API is pay-per-use. You only pay for what you use.

1. In the console, go to **Settings → Billing**
2. Add a payment method
3. Add credits — **$5 is more than enough** to test this project extensively

### How much does it cost?

This project uses `claude-sonnet-4-20250514` by default. Typical costs:

| Action | Estimated Cost |
|--------|---------------|
| One chat message with tool calls | ~$0.003 - $0.01 |
| 100 chat messages | ~$0.30 - $1.00 |
| Running the full demo | ~$0.10 - $0.50 |

You would need to send thousands of messages to spend even $5.

---

## Step 3: Generate an API Key

1. In the console, go to **Settings → API Keys**
2. Click **Create Key**
3. Give it a name like `ai-command-center`
4. Copy the key — it starts with `sk-ant-api03-...`

> **Important:** You will only see the full key once. Copy it immediately and store it safely.

---

## Step 4: Configure the Project

### Option A: Using a .env file (recommended)

Create a `.env` file in the project root:

```bash
# Copy the example
cp .env.example .env
```

Open `.env` in any text editor and paste your key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
PI_HOST=localhost
PI_PORT=8001
```

### Option B: Using environment variables directly

**Windows (Command Prompt):**
```cmd
set ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
cd backend
python main.py
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-api03-your-actual-key-here"
cd backend
python main.py
```

**macOS / Linux:**
```bash
export ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
cd backend
python main.py
```

---

## Step 5: Verify It Works

1. Start the Pi agent: `cd pi-agent && python main.py`
2. Start the backend: `cd backend && python main.py`
3. Start the frontend: `cd frontend && npm run dev`
4. Open `http://localhost:5173`
5. Sign in with `admin` / `admin123`
6. Click the **AI Agent** tab
7. Type: **"How's the Pi doing?"**

If your key is set up correctly, Claude will call `get_system_metrics` and respond with your system's real CPU, memory, disk, and temperature data.

### If it doesn't work:

| Problem | Fix |
|---------|-----|
| Chat says "No Anthropic API key configured" | Your `.env` file is missing or the key isn't set |
| Chat says "Authentication error" | Your key is invalid or expired — generate a new one |
| Chat says "Insufficient credits" | Add more credits at console.anthropic.com |
| Chat says "Cannot reach Pi agent" | Start the Pi agent first: `cd pi-agent && python main.py` |
| Blank page | Check browser console (F12) for errors |

---

## Security Notes

- **Never commit your API key to Git.** The `.env` file is in `.gitignore` by default
- **Never share your key publicly.** If exposed, revoke it immediately at console.anthropic.com
- **The key stays on the backend.** The React frontend never sees or touches your API key — it only talks to your local backend server
- **Set a spending limit.** In Anthropic console → Settings → Limits, set a monthly cap (e.g., $10) to prevent surprises

---

## Choosing a Model

The project defaults to `claude-sonnet-4-20250514` which is the best balance of speed, quality, and cost. You can change this in `.env`:

```env
# Fast + cheap (recommended for development)
CLAUDE_MODEL=claude-sonnet-4-20250514

# Best reasoning (slower, 5x more expensive, use for complex debugging)
CLAUDE_MODEL=claude-opus-4-20250514
```

---

## Using Without an API Key

If you don't want to set up an API key, you can still:

1. **Use mock mode** — Set `VITE_MOCK_MODE=true` in `frontend/.env`. The dashboard shows simulated data and the chat responds with pre-written tool call demos
2. **Use the dashboard** — Real metrics stream from the Pi agent without needing Claude
3. **Call tools directly** — Hit `http://localhost:8001/docs` to use the Pi agent's Swagger UI and execute tools manually

---

## Free Alternatives

If you don't want to pay for API access:

- **Anthropic sometimes offers free trial credits** — check console.anthropic.com
- **Use mock mode** for demos and presentations — it showcases the full architecture without any API calls
- **Fork and adapt** — swap the Claude agent for a local LLM (Ollama, llama.cpp) by modifying `backend/agent/claude_agent.py`
