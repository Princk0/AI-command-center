# AI Command Center — Frontend Technical Deep Dive

A complete explanation of every frontend file: what it does, why it exists,
and how the code achieves it line by line.

---

## Table of Contents

1. Configuration Files (project setup)
2. Entry Points (app bootstrap)
3. Utility Layer (data + communication)
4. Hook Layer (state management)
5. Component Layer (UI)
6. Data Flow Summary

---

## 1. Configuration Files

### package.json — Project manifest

**Purpose:** Tells Node.js what this project is, what scripts it can run,
and what libraries it depends on.

**Key sections explained:**

```
"type": "module"
```
This enables ES Module syntax (`import/export`) instead of the older
CommonJS (`require/module.exports`). Vite requires this.

**Dependencies (ship with the app):**
- `react` + `react-dom` — The UI framework. React lets us build the
  dashboard as composable components instead of one giant HTML file.
- `recharts` — Chart library built specifically for React. We use it for
  the real-time CPU/memory line charts. It wraps D3.js but gives us
  React components like `<LineChart>` and `<Line>`.
- `lucide-react` — Icon library. Every icon (Wifi, Cpu, Send, etc.) is
  a tiny React component. Tree-shakeable, so only icons we import end
  up in the final bundle.

**Dev dependencies (only used during development):**
- `vite` — Build tool and dev server. Way faster than Webpack because
  it uses native ES modules in the browser during development instead
  of bundling everything on every change.
- `@vitejs/plugin-react` — Tells Vite how to handle JSX syntax.
- `tailwindcss` + `postcss` + `autoprefixer` — CSS toolchain.
  Tailwind generates utility classes, PostCSS processes them,
  Autoprefixer adds vendor prefixes for browser compatibility.

---

### vite.config.js — Build tool configuration

**Purpose:** Configures the Vite dev server and build process.

```javascript
plugins: [react()]
```
Enables React support — transforms JSX into JavaScript function calls
and enables React Fast Refresh (instant updates when you save a file).

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
    '/ws': {
      target: 'ws://localhost:8000',
      ws: true,
    },
  },
},
```
**The proxy is critical.** Without it, the browser would block requests
from localhost:5173 (frontend) to localhost:8000 (backend) due to CORS
(Cross-Origin Resource Sharing) security rules.

The proxy tells Vite: "When the frontend makes a request to `/api/health`,
secretly forward it to `http://localhost:8000/health`." The browser thinks
it is talking to the same server, so no CORS errors.

The `ws: true` flag does the same for WebSocket connections.

---

### tailwind.config.js — CSS framework configuration

**Purpose:** Tells Tailwind which files to scan for class names and
defines custom design tokens.

```javascript
content: ['./index.html', './src/**/*.{js,jsx}']
```
Tailwind scans these files for class names like `bg-gray-900` or
`text-green-400`. Any class NOT found in these files gets removed from
the final CSS (called "purging"). This keeps the CSS bundle tiny.

```javascript
extend: {
  colors: {
    brand: { 50: '#f0fdf4', 500: '#22c55e', ... }
  }
}
```
Adds custom color tokens we can use as `bg-brand-500` etc. The
numbers follow Tailwind's convention: 50 = lightest, 900 = darkest.

---

### postcss.config.js — CSS processing pipeline

**Purpose:** PostCSS is a tool that transforms CSS with plugins.

```javascript
plugins: {
  tailwindcss: {},
  autoprefixer: {},
}
```
This runs two plugins in order:
1. `tailwindcss` — Reads `@tailwind base/components/utilities` directives
   in our CSS and replaces them with actual CSS rules.
2. `autoprefixer` — Adds vendor prefixes like `-webkit-` so CSS works
   in older browsers.

---

### .env — Environment variables

**Purpose:** Configuration that changes between development and production.

```
VITE_MOCK_MODE=true
```
The `VITE_` prefix is required. Vite only exposes environment variables
that start with `VITE_` to the frontend code (security measure — you
don't want secret API keys leaking to the browser).

In code, we read it as `import.meta.env.VITE_MOCK_MODE`. When set to
`true`, the app uses simulated data instead of connecting to the real
backend. Flip to `false` when your backend is running.

---

## 2. Entry Points

### index.html — The single HTML page

**Purpose:** This is the ONLY HTML file in the entire app. React takes
over the `<div id="root">` and renders everything dynamically.

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono
  :wght@400;500&family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet">
```
Loads two Google Fonts:
- **Inter** — Clean sans-serif for all body text. Designed specifically
  for screens with great readability at small sizes.
- **JetBrains Mono** — Monospace font for code/data display (PIDs,
  JSON payloads, IP addresses). Makes numbers align vertically.

```html
<body class="bg-gray-950 text-white">
```
Sets the dark theme globally. Tailwind's `gray-950` is almost black
(`#030712`).

```html
<script type="module" src="/src/main.jsx"></script>
```
`type="module"` enables ES module imports in the browser. Vite
intercepts this and serves the file with hot-reload support during
development.

---

### main.jsx — React bootstrap

**Purpose:** The bridge between the HTML page and React.

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
```
Four imports:
1. `React` — The library itself.
2. `ReactDOM` — The renderer that connects React to the browser DOM.
3. `App` — Our root component (the entire dashboard).
4. `index.css` — Global styles including Tailwind directives.

```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```
`createRoot` is React 18's API for mounting the app. It:
1. Finds the `<div id="root">` in index.html.
2. Creates a React root there.
3. Renders `<App />` inside `<StrictMode>`.

`StrictMode` is a development-only wrapper that:
- Runs components twice to detect impure renders.
- Warns about deprecated APIs.
- Does NOT appear in production builds.

---

### index.css — Global styles

**Purpose:** Sets up Tailwind and defines custom CSS.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
These directives get replaced by PostCSS/Tailwind:
- `base` — CSS reset (normalizes browser defaults like margins, fonts).
- `components` — Tailwind's component classes (if any).
- `utilities` — All the utility classes like `flex`, `p-4`, `text-sm`.

```css
:root {
  font-family: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```
`:root` targets the `<html>` element. Sets Inter as default font with
system-ui as fallback. The CSS custom property `--font-mono` lets us
reference the mono font anywhere.

```css
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
```
Custom animation for the live status dot. CSS `@keyframes` defines
how the opacity changes over time:
- Start at full opacity (1).
- Fade to 40% opacity at the halfway point.
- Return to full opacity.
- `2s` duration, `ease-in-out` for smooth acceleration/deceleration,
  `infinite` to loop forever.

---

## 3. Utility Layer

### utils/mockData.js — Simulated data engine

**Purpose:** Lets you run and demo the dashboard without a backend.
Generates realistic-looking metrics that change over time, and provides
canned chat responses that simulate Claude using tools.

**The MOCK_MODE flag:**
```javascript
export const MOCK_MODE =
  import.meta.env.VITE_MOCK_MODE === 'true' ||
  !import.meta.env.VITE_BACKEND_URL
```
Mock mode activates if either:
- The env var is explicitly `'true'`, OR
- No backend URL is configured (safe default for first-time devs).

**The wobble function (realistic random data):**
```javascript
let _cpuBase = 35

function wobble(base, range) {
  const delta = (Math.random() - 0.5) * range
  return Math.max(0, Math.min(100, base + delta))
}
```
This is how we make mock data look realistic instead of random.

`Math.random()` returns 0 to 1. Subtracting 0.5 gives -0.5 to +0.5.
Multiplying by `range` (say 8) gives -4 to +4.

We add this delta to `_cpuBase` (starts at 35). So CPU usage
"wanders" between ~31% and ~39% — never jumping from 10% to 90%.
`Math.max(0, Math.min(100, ...))` clamps it between 0-100.

The `_cpuBase` variable persists between calls (module-level scope),
so each new reading starts from where the last one ended. This creates
the realistic drift you see in the charts.

**generateMockMetrics():**
Returns a complete metrics object matching the exact shape the Pi
agent returns. Every field (cpu.percent, memory.total_mb, etc.) is
populated so components never crash from missing data.

**MOCK_RESPONSES array:**
```javascript
const MOCK_RESPONSES = [
  {
    triggers: ['how', 'doing', 'health', 'status', 'check'],
    response: '...',
    toolCalls: [{ tool: 'get_system_metrics', input: {...}, output: {...} }],
  },
  ...
]
```
Each mock response has:
- `triggers` — keywords to match against the user's message.
- `response` — what "Claude" says back.
- `toolCalls` — simulated tool call traces, so the ToolTrace panel
  fills up during demos.

**getMockChatResponse():**
```javascript
const lower = message.toLowerCase()
for (const mock of MOCK_RESPONSES) {
  if (mock.triggers.some((t) => lower.includes(t))) {
    return { response: mock.response, tool_calls: mock.toolCalls, ... }
  }
}
return FALLBACK_RESPONSE
```
Simple keyword matching. Lowercases the message, checks each mock's
triggers, returns the first match. If nothing matches, returns a
generic health check response. Not AI — just pattern matching for demos.

**mockApi object:**
```javascript
export const mockApi = {
  health: async () => ({...}),
  chat: async (message) => {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200))
    return getMockChatResponse(message)
  },
  ...
}
```
Mirrors the real API's interface exactly (same method names, same
return shapes). The `chat` method adds a random 0.8-2 second delay
with `setTimeout` wrapped in a Promise to simulate network latency.
This makes the loading spinner appear naturally.

---

### utils/api.js — Backend communication

**Purpose:** Single point of contact for all HTTP requests to the backend.
Automatically switches between mock and real mode.

**The request helper:**
```javascript
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`API error ${res.status}: ${error}`)
  }
  return res.json()
}
```
This wraps the browser's `fetch()` API:
1. Prepends `BASE_URL` so we don't repeat `http://localhost:8000`
   everywhere.
2. Always sets `Content-Type: application/json` header.
3. Spreads `...options` so callers can add method, body, etc.
4. Checks `res.ok` — true for 200-299 status codes. If the server
   returns 400, 500, etc., we throw an error that components can catch.
5. Parses JSON response automatically.

**The switching pattern:**
```javascript
export const api = MOCK_MODE ? mockApi : realApi
```
Components import `api` and call `api.chat(message)`. They never know
or care whether they're talking to mock data or the real backend. This
is the **Strategy Pattern** — swapping implementations behind the same
interface.

---

## 4. Hook Layer

### hooks/useWebSocket.js — Real-time data stream

**Purpose:** Manages the WebSocket connection for live metric updates.
In mock mode, simulates the same behavior with `setInterval`.

**Why a custom hook?**
React hooks let us encapsulate stateful logic and reuse it. Any
component that calls `useWebSocket()` gets live metrics without
managing connection logic itself.

**The state variables:**
```javascript
const [metrics, setMetrics] = useState(null)
const [metricsHistory, setMetricsHistory] = useState([])
const [isConnected, setIsConnected] = useState(false)
```
- `metrics` — latest snapshot (one object).
- `metricsHistory` — array of past snapshots for charts (last 60).
- `isConnected` — boolean for UI indicators.

**The pushMetrics callback:**
```javascript
const pushMetrics = useCallback((data) => {
  setMetrics(data)
  setMetricsHistory((prev) => {
    const updated = [...prev, { ...data, _receivedAt: Date.now() }]
    return updated.slice(-60)
  })
}, [])
```
`useCallback` memoizes this function so it doesn't get recreated on
every render (important for performance since it's used in useEffect
dependencies).

The history update:
1. Spreads the old array `...prev`.
2. Adds the new data point with a `_receivedAt` timestamp.
3. `.slice(-60)` keeps only the last 60 entries (5 minutes of data
   at 5-second intervals). Without this, the array would grow forever
   and eventually crash the browser.

**Mock mode path:**
```javascript
useEffect(() => {
  if (!MOCK_MODE) return
  setIsConnected(true)
  pushMetrics(generateMockMetrics())
  mockTimer.current = setInterval(() => {
    pushMetrics(generateMockMetrics())
  }, 5000)
  return () => clearInterval(mockTimer.current)
}, [pushMetrics])
```
When `MOCK_MODE` is true:
1. Immediately set connected (fake it).
2. Generate one data point right away (so dashboard isn't empty).
3. Start a 5-second interval generating new data points.
4. The `return` cleanup function runs when the component unmounts,
   clearing the interval to prevent memory leaks.

**Real WebSocket path:**
```javascript
const ws = new WebSocket(WS_URL)

ws.onopen = () => setIsConnected(true)

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.type === 'metrics') pushMetrics(msg.data)
  if (msg.type === 'chat_response') setChatResponse(msg.data)
}

ws.onclose = () => {
  setIsConnected(false)
  reconnectTimer.current = setTimeout(connect, 3000)
}
```
WebSocket is a persistent two-way connection (unlike HTTP which is
request-response). The backend pushes metrics every 5 seconds without
the frontend asking.

`onclose` triggers automatic reconnection after 3 seconds. This
handles network hiccups gracefully — the dashboard recovers
automatically when the backend comes back.

**The useRef pattern:**
```javascript
const wsRef = useRef(null)
const reconnectTimer = useRef(null)
```
`useRef` creates a mutable box that persists across renders but
doesn't trigger re-renders when changed. Perfect for:
- `wsRef` — the WebSocket instance (we need to close it on cleanup).
- `reconnectTimer` — the timeout ID (we need to cancel it on cleanup).

If we used `useState` for these, every reassignment would cause a
re-render, which is wasteful since the UI doesn't depend on these
values.

---

## 5. Component Layer

### components/StatusBar.jsx — Connection indicator

**Purpose:** Shows at-a-glance Pi status in the header bar.

**Props:**
```javascript
export default function StatusBar({ isConnected, metrics })
```
React components receive data via props. This component needs:
- `isConnected` — boolean from useWebSocket.
- `metrics` — latest metrics object (can be null initially).

**Safe data access:**
```javascript
const temp = metrics?.temperature?.sensors
  ? Object.values(metrics.temperature.sensors)[0]
  : null
```
The `?.` operator (optional chaining) prevents crashes when `metrics`
is null. Without it, `metrics.temperature` would throw
"Cannot read property of null".

`Object.values(...)` converts `{ cpu_thermal: 48.3 }` into `[48.3]`.
We take `[0]` to get the first sensor's value regardless of its name.

**Conditional rendering:**
```javascript
{metrics && (
  <div className="hidden sm:flex ...">
    {cpuPercent !== null && <span>CPU {Math.round(cpuPercent)}%</span>}
  </div>
)}
```
`{metrics && (...)}` — only render this block if metrics exists.
This is a React pattern called "short-circuit evaluation."

`hidden sm:flex` — Tailwind responsive class. Hidden by default,
becomes `display: flex` at the `sm` breakpoint (640px+). This hides
the quick stats on mobile where space is tight.

**Status pill:**
```javascript
className={`... ${
  isConnected
    ? 'bg-green-500/10 text-green-400 border-green-500/20'
    : 'bg-red-500/10 text-red-400 border-red-500/20'
}`}
```
Template literal with ternary. Applies green styles when connected,
red when not. The `/10` and `/20` suffixes are Tailwind opacity
modifiers — `bg-green-500/10` means green with 10% opacity, creating
a subtle tinted background.

---

### components/MetricCard.jsx — Stat display cards

**Purpose:** Displays one metric (CPU, Memory, Disk, or Temperature)
as a card with an icon, value, detail text, and progress bar.

**The color map pattern:**
```javascript
const colorMap = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', bar: 'bg-purple-500' },
  ...
}
```
Instead of passing 3 separate color props, we pass one `color` string
and look up all related classes. This is a common pattern for
component theming — define a "palette" object and index into it.

**Dynamic icon rendering:**
```javascript
export default function MetricCard({ icon: Icon, ... }) {
  return <Icon className="w-3.5 h-3.5 ..." />
}
```
The `icon: Icon` destructuring renames the prop to `Icon` (capitalized).
In React, component names MUST be capitalized — lowercase tags are
treated as HTML elements (`<div>`, `<span>`), uppercase tags as
React components (`<Icon>`, `<MetricCard>`).

**Animated progress bar:**
```javascript
<div
  className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
  style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
/>
```
`transition-all duration-500` — CSS transition that smoothly animates
any property change over 500ms. When `percent` updates (say from 35%
to 38%), the bar glides to its new width instead of jumping.

`Math.min(100, Math.max(0, percent))` — double clamp. Ensures width
never goes below 0% or above 100%, even if the data is weird.

---

### components/MetricsChart.jsx — Real-time line charts

**Purpose:** Renders a time-series line chart from metric history data.

**Nested property access:**
```javascript
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}
```
The parent passes `dataKey="cpu.percent"` as a string. We need to
access `obj.cpu.percent` dynamically. This function:
1. Splits `"cpu.percent"` into `["cpu", "percent"]`.
2. Uses `reduce` to walk the object: start with `obj`, access `obj.cpu`,
   then `obj.cpu.percent`.
3. `?.` prevents crashes if any intermediate key is missing.

**Data transformation:**
```javascript
const chartData = data.map((d, i) => ({
  index: i,
  value: getNestedValue(d, dataKey) ?? 0,
  time: new Date(d._receivedAt).toLocaleTimeString([], {
    minute: '2-digit', second: '2-digit'
  }),
}))
```
Recharts expects a flat array of objects. We transform our nested
metrics into `{ index, value, time }`. The `?? 0` nullish coalescing
operator provides a default of 0 if the value is null/undefined.

**Recharts components:**
```javascript
<ResponsiveContainer width="100%" height={192}>
  <LineChart data={chartData}>
    <XAxis dataKey="time" ... />
    <YAxis domain={[0, 100]} ... />
    <Tooltip ... />
    <Line type="monotone" dataKey="value" ... />
  </LineChart>
</ResponsiveContainer>
```
- `ResponsiveContainer` — makes the chart fill its parent's width.
- `LineChart` — the chart type, receives the data array.
- `XAxis`/`YAxis` — configure axes. `domain={[0, 100]}` locks the
  Y axis to 0-100% so the scale doesn't jump around.
- `Tooltip` — hover popup showing exact values.
- `Line` — the actual line. `type="monotone"` creates smooth curves.
  `dot={false}` hides individual data points (too noisy for real-time).

---

### components/ChatPanel.jsx — AI conversation interface

**Purpose:** The main chat interface where users talk to Claude and
see responses with tool call information.

**State management:**
```javascript
const [messages, setMessages] = useState([{
  role: 'assistant',
  content: 'Hey! I\'m your AI command center agent...',
  toolCalls: [],
}])
const [input, setInput] = useState('')
const [isLoading, setIsLoading] = useState(false)
```
Three pieces of state:
- `messages` — the conversation history array. Initialized with a
  welcome message so the chat isn't empty on first load.
- `input` — the current text in the input field (controlled input).
- `isLoading` — true while waiting for Claude's response.

**Refs for DOM access:**
```javascript
const messagesEndRef = useRef(null)
const inputRef = useRef(null)
```
- `messagesEndRef` — an invisible div at the bottom of the message
  list. We call `scrollIntoView()` on it to auto-scroll.
- `inputRef` — the input element, so we can programmatically focus
  it after sending a message.

**Auto-scroll effect:**
```javascript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])
```
`useEffect` runs after every render where `messages` changes. It
smoothly scrolls the message container to show the newest message.

**The sendMessage function:**
```javascript
const sendMessage = async () => {
  const text = input.trim()
  if (!text || isLoading) return

  setInput('')
  setMessages(prev => [...prev, { role: 'user', content: text }])
  setIsLoading(true)

  try {
    const result = await api.chat(text)
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: result.response,
      toolCalls: result.tool_calls || [],
    }])
    
    if (result.tool_calls?.length) {
      window.dispatchEvent(
        new CustomEvent('tool-calls', { detail: result.tool_calls })
      )
    }
  } catch (err) {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Error: ${err.message}`,
    }])
  } finally {
    setIsLoading(false)
  }
}
```
Step by step:
1. Trim whitespace. Guard against empty messages or double-sends.
2. Clear the input immediately (optimistic UI — feels snappy).
3. Add user message to the array.
4. Set loading true (shows the spinner).
5. Call `api.chat()` — this goes to the real backend or mock.
6. On success: add Claude's response to the array.
7. **Dispatch tool calls** via `CustomEvent` — this is how ChatPanel
   communicates with ToolTrace without a shared parent state. It's a
   lightweight pub/sub pattern using the browser's built-in event
   system.
8. On error: show the error as a chat message (user-friendly).
9. `finally` always runs — resets loading and re-focuses the input.

**Quick action buttons:**
```javascript
{['How is the Pi doing?', 'Top processes by memory', ...].map(q => (
  <button
    onClick={() => { setInput(q); inputRef.current?.focus() }}
    ...
  >
    {q}
  </button>
))}
```
Maps an array of example queries into clickable pills. Clicking one
fills the input field and focuses it, so the user just has to press
Enter. Great for demos and discoverability.

---

### components/ToolTrace.jsx — Agent observability panel

**Purpose:** Shows exactly what tools Claude called, what data it sent,
and what the Pi returned. This is the "developer tools" of the AI agent.

**Event listener pattern:**
```javascript
useEffect(() => {
  const handler = (e) => {
    const newCalls = e.detail
    if (Array.isArray(newCalls) && newCalls.length > 0) {
      setTraces((prev) => [...newCalls.map(addId), ...prev].slice(0, 50))
    }
  }
  window.addEventListener('tool-calls', handler)
  return () => window.removeEventListener('tool-calls', handler)
}, [])
```
This listens for the `tool-calls` custom events that ChatPanel
dispatches. When new tool calls arrive:
1. Each call gets a unique `_id` via `addId()` (React needs unique
   keys for list rendering).
2. New calls go at the START of the array (`...newCalls, ...prev`)
   so the most recent appear at top.
3. `.slice(0, 50)` caps at 50 traces to prevent memory issues.
4. The cleanup function removes the listener when the component
   unmounts (prevents memory leaks).

**The TraceCard sub-component:**
```javascript
function TraceCard({ trace }) {
  const [expanded, setExpanded] = useState(false)
```
Each trace card has its own `expanded` state — clicking one card
doesn't affect the others. This is a key React pattern: state is
local to each component instance.

**Conditional styling for success/failure:**
```javascript
className={`... ${
  isSuccess
    ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
    : 'bg-red-950/20 border-red-900/30 hover:border-red-800/40'
}`}
```
Failed tool calls get a subtle red tint so they stand out immediately.

**The JsonBlock sub-component:**
```javascript
function JsonBlock({ data }) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const lines = text.split('\n')
  const isLong = lines.length > 8
  const [showAll, setShowAll] = useState(false)
  const displayText = isLong && !showAll
    ? lines.slice(0, 8).join('\n') + '\n...'
    : text
```
Handles JSON display:
1. If data is already a string, use it. Otherwise, pretty-print with
   2-space indentation via `JSON.stringify(data, null, 2)`.
2. Count lines. If more than 8, collapse by default.
3. The toggle lets users expand to see the full payload.
4. `<pre>` tag preserves whitespace and formatting.

**The helper functions:**
```javascript
let _idCounter = 0
function addId(trace) {
  return { ...trace, _id: `trace-${Date.now()}-${_idCounter++}` }
}
```
Combines a timestamp with an incrementing counter for guaranteed
unique IDs, even if multiple traces arrive in the same millisecond.

```javascript
function formatToolName(name) {
  const labels = {
    get_system_metrics: 'System metrics',
    manage_process: 'Process manager',
    ...
  }
  return labels[name] || name
}
```
Maps machine-readable tool names to human-readable labels. The
fallback `|| name` ensures we still show something if a new tool
is added that we haven't mapped yet.

---

### App.jsx — Root component and layout

**Purpose:** The top-level component that assembles everything into
a complete dashboard with tabbed navigation.

**The useWebSocket integration:**
```javascript
const { metrics, metricsHistory, isConnected } = useWebSocket()
```
Destructures only the values we need from the hook. This single
line gives us live-updating metrics, connection status, and 5
minutes of history — all managed by the hook internally.

**Tab navigation state:**
```javascript
const [activeTab, setActiveTab] = useState('dashboard')
```
Simple string state. `'dashboard'` or `'chat'`. The content area
conditionally renders based on this value.

**Conditional tab rendering:**
```javascript
{activeTab === 'dashboard' && (
  <DashboardView metrics={metrics} metricsHistory={metricsHistory} />
)}
{activeTab === 'chat' && (
  <ChatView />
)}
```
Only the active tab's component renders. The inactive one unmounts
completely, freeing its resources.

**The DashboardView sub-component:**
```javascript
function DashboardView({ metrics, metricsHistory }) {
  if (!metrics) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Cpu className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Waiting for Pi metrics...</p>
      </div>
    )
  }
```
**Loading state handling.** Before the first metrics arrive, we show
a helpful empty state instead of a broken layout. This is a UX best
practice — always tell users what's happening.

**Safe destructuring with defaults:**
```javascript
const cpu = metrics.cpu || {}
const memory = metrics.memory || {}
```
Even though metrics exists, individual categories might be missing
(e.g., if the Pi agent only returned partial data). The `|| {}`
fallback prevents "cannot read property of undefined" errors.

**Grid layout:**
```javascript
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
```
- Mobile: 2 columns (2 cards per row).
- Desktop (`md:` = 768px+): 4 columns (all cards in one row).
- `gap-4` adds 16px spacing between cards.

**ChatView layout:**
```javascript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
  <div className="lg:col-span-2"><ChatPanel /></div>
  <div><ToolTrace /></div>
</div>
```
- Mobile: stacked (chat on top, traces below).
- Desktop (`lg:` = 1024px+): 3-column grid where chat takes 2
  columns and ToolTrace takes 1 column.

---

## 6. Data Flow Summary

Here is how data flows through the frontend:

```
useWebSocket hook
  │
  ├─ (mock mode) setInterval generates fake metrics every 5s
  │
  └─ (real mode) WebSocket receives metrics from backend
         │
         ▼
  metrics + metricsHistory state
         │
         ├──► App.jsx passes to DashboardView
         │      │
         │      ├──► MetricCard (CPU, Memory, Disk, Temp)
         │      └──► MetricsChart (line charts)
         │
         └──► StatusBar (quick stats in header)


User types in ChatPanel
         │
         ▼
  api.chat(message)
         │
         ├─ (mock mode) mockData matches keywords, returns canned response
         │
         └─ (real mode) POST /chat to backend
                │
                ▼
         ChatPanel displays response
                │
                ├──► tool_calls dispatched via CustomEvent
                │
                └──► ToolTrace listens, displays tool call traces
```

Each layer has a single responsibility:
- **Hooks** manage connections and state.
- **Utils** handle data fetching and mock simulation.
- **Components** only render UI based on props/state.

This separation means you can swap any layer independently — replace
the mock with real data, swap Recharts for Chart.js, or redesign
components without touching the data layer.
