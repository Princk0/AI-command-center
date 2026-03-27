# Using a Local LLM (No API Key Needed)

You can run this project with a completely free, local AI model instead of Claude. This guide covers every option.

---

## Quick Comparison

| Provider | Cost | Setup Time | Tool Use Support | Quality |
|----------|------|------------|-----------------|---------|
| **Claude** (Anthropic) | ~$0.01/msg | 2 min | Excellent (native) | Best |
| **Ollama** | Free | 5 min | Good (llama3.1+) | Very good |
| **LM Studio** | Free | 5 min | Good | Very good |
| **vLLM** | Free | 10 min | Varies by model | Very good |
| **LocalAI** | Free | 10 min | Good | Good |

> **Recommendation:** If you want the best experience, use Claude ($5 lasts hundreds of messages). If you want 100% free, use Ollama with `llama3.1` or `qwen2.5`.

---

## Option 1: Ollama (Recommended for Local)

Ollama runs LLMs locally with one command. No Python, no config files, no GPU setup.

### Install Ollama

**Windows:**
Download from [ollama.com/download](https://ollama.com/download)

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Pull a Model

```bash
# Best for tool use (8B, needs ~5GB RAM)
ollama pull llama3.1

# Smaller alternative (3.8B, needs ~3GB RAM)
ollama pull phi3

# Best quality for tool use (needs ~16GB RAM)
ollama pull qwen2.5:14b

# Coding-focused
ollama pull deepseek-coder-v2:16b
```

### Configure the Project

Edit your `.env` file in the project root:

```env
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1
LLM_BASE_URL=http://localhost:11434

# No API key needed — leave blank or remove
ANTHROPIC_API_KEY=

# Pi agent (same as before)
PI_HOST=localhost
PI_PORT=8001
```

### Start Everything

```bash
# Terminal 1: Ollama runs automatically after install, but you can verify:
ollama serve

# Terminal 2: Pi agent
cd pi-agent && python main.py

# Terminal 3: Backend
cd backend && python main.py

# Terminal 4: Frontend
cd frontend && npm run dev
```

### Verify Ollama Is Running

```bash
# Should list your models
ollama list

# Quick test
curl http://localhost:11434/api/tags
```

### Which Ollama Model Should I Use?

| Model | Size | RAM Needed | Tool Use | Best For |
|-------|------|------------|----------|----------|
| `llama3.1` | 8B | 5 GB | Good | General use, best balance |
| `llama3.1:70b` | 70B | 40 GB | Excellent | Best quality (needs beefy machine) |
| `qwen2.5` | 7B | 5 GB | Very good | Tool use + reasoning |
| `qwen2.5:14b` | 14B | 10 GB | Excellent | Best local tool use |
| `mistral` | 7B | 5 GB | Good | Fast responses |
| `command-r` | 35B | 20 GB | Excellent | Built for tool use |
| `phi3` | 3.8B | 3 GB | Basic | Low-RAM machines |
| `deepseek-coder-v2` | 16B | 10 GB | Good | Code/system tasks |

**For your 16GB RAM laptop:** Use `llama3.1` or `qwen2.5`
**For your 32GB RAM laptop:** Use `qwen2.5:14b` or `command-r`
**For Raspberry Pi:** Models are too large — run Ollama on your laptop and point the backend at it

---

## Option 2: LM Studio

LM Studio gives you a GUI to download and run models. Great if you prefer clicking over command lines.

### Install

Download from [lmstudio.ai](https://lmstudio.ai/) (Windows, macOS, Linux)

### Setup

1. Open LM Studio
2. Search for a model in the **Discover** tab:
   - Search: `llama 3.1` or `qwen 2.5`
   - Click **Download** on a quantized version (Q4_K_M is a good balance)
3. Go to the **Local Server** tab (left sidebar, looks like `<->`)
4. Select your downloaded model
5. Click **Start Server**
6. It runs on `http://localhost:1234`

### Configure

```env
LLM_PROVIDER=lmstudio
LLM_MODEL=local-model
LLM_BASE_URL=http://localhost:1234/v1
ANTHROPIC_API_KEY=
```

### Important LM Studio Settings

In the server tab, make sure:
- **Enable CORS** is checked (so the backend can reach it)
- **Function Calling** is enabled (for tool use)

---

## Option 3: vLLM (Advanced)

vLLM is a high-performance inference server. Use this if you have a dedicated GPU and want maximum speed.

### Install

```bash
pip install vllm
```

### Run

```bash
vllm serve meta-llama/Llama-3.1-8B-Instruct \
  --port 8080 \
  --enable-auto-tool-choice \
  --tool-call-parser llama3_json
```

### Configure

```env
LLM_PROVIDER=openai-compatible
LLM_MODEL=meta-llama/Llama-3.1-8B-Instruct
LLM_BASE_URL=http://localhost:8080/v1
ANTHROPIC_API_KEY=
```

---

## Option 4: LocalAI

LocalAI is a drop-in replacement for the OpenAI API that runs locally.

### Install & Run

```bash
docker run -p 8080:8080 --name localai -ti localai/localai:latest-cpu llama-3.1-8b-instruct
```

### Configure

```env
LLM_PROVIDER=openai-compatible
LLM_MODEL=llama-3.1-8b-instruct
LLM_BASE_URL=http://localhost:8080/v1
ANTHROPIC_API_KEY=
```

---

## Option 5: Cloud Alternatives (OpenAI-Compatible)

If you want to use a different cloud provider instead of Anthropic:

### Together AI

```env
LLM_PROVIDER=openai-compatible
LLM_MODEL=meta-llama/Llama-3.1-8B-Instruct-Turbo
LLM_BASE_URL=https://api.together.xyz/v1
ANTHROPIC_API_KEY=your-together-api-key
```

### Groq (Free Tier Available)

```env
LLM_PROVIDER=openai-compatible
LLM_MODEL=llama-3.1-8b-instant
LLM_BASE_URL=https://api.groq.com/openai/v1
ANTHROPIC_API_KEY=your-groq-api-key
```

### OpenRouter

```env
LLM_PROVIDER=openai-compatible
LLM_MODEL=meta-llama/llama-3.1-8b-instruct
LLM_BASE_URL=https://openrouter.ai/api/v1
ANTHROPIC_API_KEY=your-openrouter-api-key
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot reach LLM server" | Make sure Ollama/LM Studio is running before starting the backend |
| "Model not found" | Run `ollama pull llama3.1` or check model name in LM Studio |
| Very slow responses | Use a smaller model, or check if your RAM is maxed out |
| Tool calls not working | Some models don't support function calling — try `llama3.1` or `qwen2.5` |
| Garbled output | The model is too small — upgrade to a 7B+ parameter model |
| Out of memory | Use a quantized model (Q4_K_M) or smaller model (phi3, 3.8B) |
| "Connection refused" on port 11434 | Run `ollama serve` to start the Ollama server |
| LM Studio CORS error | Enable CORS in LM Studio's server settings |

## Tool Use Quality by Provider

The AI chat works by giving the LLM a set of tools and asking it to decide which ones to call. Not all models handle this equally well:

- **Claude** — designed for tool use, almost never makes mistakes
- **llama3.1 / qwen2.5** — good tool use, occasionally picks wrong tool
- **mistral** — decent, may need more specific prompts
- **phi3 / small models** — basic tool use, may ignore tools and just answer from knowledge

If a local model isn't calling tools reliably, try being more explicit in your prompts: instead of "How's the Pi?" say "Use the system metrics tool to check my Pi's CPU and memory."

---

## Hardware Recommendations

| Your Machine | Recommended Model | Expected Speed |
|-------------|-------------------|----------------|
| 8 GB RAM, no GPU | `phi3` (3.8B) | ~5 tokens/sec |
| 16 GB RAM, no GPU | `llama3.1` (8B) | ~8 tokens/sec |
| 16 GB RAM + GPU | `llama3.1` (8B) | ~30 tokens/sec |
| 32 GB RAM, no GPU | `qwen2.5:14b` | ~5 tokens/sec |
| 32 GB RAM + GPU | `qwen2.5:14b` | ~25 tokens/sec |

Your Ultra 7 laptop (32GB) can comfortably run 14B models. Your i7 (16GB) handles 8B models well.
