/**
 * Mock Data Provider
 * 
 * Simulates Pi metrics, tool calls, and chat responses so you can
 * develop and demo the dashboard without a running backend or Pi.
 * 
 * Usage: Import and call useMockMode() or check MOCK_MODE flag.
 */

// Set this to true to use mock data, false to use real backend
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || 
  !import.meta.env.VITE_BACKEND_URL

// --- Mock Metrics Generator ---

let _cpuBase = 35
let _memBase = 52
let _tempBase = 48

function wobble(base, range) {
  const delta = (Math.random() - 0.5) * range
  return Math.max(0, Math.min(100, base + delta))
}

export function generateMockMetrics() {
  _cpuBase = wobble(_cpuBase, 8)
  _memBase = wobble(_memBase, 3)
  _tempBase = wobble(_tempBase, 2)

  return {
    timestamp: new Date().toISOString(),
    cpu: {
      percent: Math.round(_cpuBase * 10) / 10,
      percent_per_core: [
        Math.round(wobble(_cpuBase, 15) * 10) / 10,
        Math.round(wobble(_cpuBase, 15) * 10) / 10,
        Math.round(wobble(_cpuBase, 15) * 10) / 10,
        Math.round(wobble(_cpuBase, 15) * 10) / 10,
      ],
      count_physical: 4,
      count_logical: 4,
      frequency_mhz: 1500,
      load_average_1m: Math.round(wobble(1.2, 0.8) * 100) / 100,
      load_average_5m: Math.round(wobble(1.0, 0.5) * 100) / 100,
      load_average_15m: Math.round(wobble(0.8, 0.3) * 100) / 100,
    },
    memory: {
      total_mb: 3792,
      available_mb: Math.round(3792 * (1 - _memBase / 100)),
      used_mb: Math.round(3792 * (_memBase / 100)),
      percent: Math.round(_memBase * 10) / 10,
      swap_total_mb: 2048,
      swap_used_mb: 128,
      swap_percent: 6.3,
    },
    disk: {
      total_gb: 29.7,
      used_gb: 14.2,
      free_gb: 15.5,
      percent: 47.8,
      read_mb: 4521,
      write_mb: 2103,
    },
    temperature: {
      sensors: {
        cpu_thermal: Math.round(_tempBase * 10) / 10,
      },
      unit: 'celsius',
    },
    system: {
      hostname: 'raspberrypi',
      os: 'Linux 6.6.31+rpt-rpi',
      architecture: 'aarch64',
      python_version: '3.11.9',
      boot_time: '2026-03-25T08:12:00',
      uptime_hours: Math.round((Date.now() - new Date('2026-03-25T08:12:00').getTime()) / 3600000 * 10) / 10,
    },
  }
}

// --- Mock Chat Responses ---

const MOCK_RESPONSES = [
  {
    triggers: ['how', 'doing', 'health', 'status', 'check'],
    response: `Your Pi is looking healthy! Here's the rundown:\n\n• **CPU:** Running at 35.2% — well within normal range\n• **Memory:** 52.1% used (1,976 MB / 3,792 MB)\n• **Disk:** 47.8% used (14.2 GB / 29.7 GB)\n• **Temperature:** 48.3°C — nice and cool\n• **Uptime:** 18.5 hours since last boot\n\nEverything looks good. No anomalies detected.`,
    toolCalls: [
      {
        tool: 'get_system_metrics',
        input: { category: 'all' },
        output: { cpu: { percent: 35.2 }, memory: { percent: 52.1 }, temperature: { sensors: { cpu_thermal: 48.3 } } },
        success: true,
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    triggers: ['process', 'memory', 'eating', 'top', 'running'],
    response: `Here are the top memory consumers on your Pi:\n\n1. **chromium** (PID 1842) — 12.3% memory, 8.1% CPU\n2. **node** (PID 2103) — 8.7% memory, 3.2% CPU\n3. **python3** (PID 1956) — 5.1% memory, 1.8% CPU\n4. **dockerd** (PID 892) — 4.2% memory, 0.5% CPU\n5. **Xorg** (PID 743) — 3.8% memory, 2.1% CPU\n\nChromium is the biggest consumer. Want me to kill it or investigate further?`,
    toolCalls: [
      {
        tool: 'manage_process',
        input: { action: 'top' },
        output: {
          top_memory: [
            { pid: 1842, name: 'chromium', memory: 12.3 },
            { pid: 2103, name: 'node', memory: 8.7 },
            { pid: 1956, name: 'python3', memory: 5.1 },
          ],
        },
        success: true,
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    triggers: ['network', 'devices', 'scan', 'wifi', 'ip'],
    response: `I found 5 devices on your local network:\n\n1. **raspberrypi** — 192.168.1.100 (this device)\n2. **desktop-pc** — 192.168.1.10\n3. **iphone** — 192.168.1.23\n4. **smart-tv** — 192.168.1.45\n5. **unknown** — 192.168.1.67\n\nYour Pi is connected via wlan0 with IP 192.168.1.100. Connection speed: 72 Mbps.`,
    toolCalls: [
      {
        tool: 'scan_network',
        input: { action: 'discover' },
        output: { devices_found: 5, devices: [{ hostname: 'raspberrypi', ip: '192.168.1.100' }] },
        success: true,
        timestamp: new Date().toISOString(),
      },
      {
        tool: 'scan_network',
        input: { action: 'interfaces' },
        output: { interfaces: { wlan0: { is_up: true, speed_mbps: 72 } } },
        success: true,
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    triggers: ['temp', 'hot', 'cool', 'thermal', 'temperature'],
    response: `The Pi's CPU is currently at **48.3°C** — that's well within the safe range.\n\nFor reference:\n• Under 60°C — Normal operation\n• 60-80°C — Getting warm, check ventilation\n• Over 80°C — Throttling may occur\n\nYour Pi is running cool. No action needed.`,
    toolCalls: [
      {
        tool: 'get_system_metrics',
        input: { category: 'temperature' },
        output: { temperature: { sensors: { cpu_thermal: 48.3 }, unit: 'celsius' } },
        success: true,
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    triggers: ['gpio', 'pin', 'led', 'turn on', 'turn off'],
    response: `GPIO status (simulation mode):\n\n• Pin 4 — LOW (label: "Status LED")\n• Pin 17 — HIGH (label: "Relay 1")\n• Pin 18 — LOW\n• Pin 22 — LOW\n• Pin 23 — LOW\n\nI'm running in simulation mode since no physical GPIO hardware was detected. The state changes are tracked in memory. Want me to toggle a pin?`,
    toolCalls: [
      {
        tool: 'control_gpio',
        input: { action: 'status' },
        output: { simulation_mode: true, pins: [{ pin: 4, state: 0, label: 'Status LED' }, { pin: 17, state: 1, label: 'Relay 1' }] },
        success: true,
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    triggers: ['disk', 'storage', 'space', 'usage'],
    response: `Here's the disk breakdown:\n\n• **Total:** 29.7 GB\n• **Used:** 14.2 GB (47.8%)\n• **Free:** 15.5 GB\n\nLargest directories:\n• /home/pi — 5.2 GB\n• /var — 3.8 GB\n• /usr — 3.1 GB\n• /opt — 1.4 GB\n\nYou've got plenty of room. No cleanup needed.`,
    toolCalls: [
      {
        tool: 'get_system_metrics',
        input: { category: 'disk' },
        output: { disk: { total_gb: 29.7, used_gb: 14.2, free_gb: 15.5, percent: 47.8 } },
        success: true,
        timestamp: new Date().toISOString(),
      },
      {
        tool: 'run_command',
        input: { command: 'du -sh /home/pi /var /usr /opt' },
        output: { exit_code: 0, stdout: '5.2G\t/home/pi\n3.8G\t/var\n3.1G\t/usr\n1.4G\t/opt' },
        success: true,
        timestamp: new Date().toISOString(),
      },
    ],
  },
]

const FALLBACK_RESPONSE = {
  response: `I ran a quick check on your Pi. Everything looks normal — CPU at 35%, memory at 52%, temperature at 48°C. Is there something specific you'd like me to investigate?`,
  toolCalls: [
    {
      tool: 'get_system_metrics',
      input: { category: 'all' },
      output: { cpu: { percent: 35 }, memory: { percent: 52 } },
      success: true,
      timestamp: new Date().toISOString(),
    },
  ],
}

export function getMockChatResponse(message) {
  const lower = message.toLowerCase()

  for (const mock of MOCK_RESPONSES) {
    if (mock.triggers.some((t) => lower.includes(t))) {
      return {
        response: mock.response,
        tool_calls: mock.toolCalls.map((tc) => ({
          ...tc,
          timestamp: new Date().toISOString(),
        })),
        conversation_id: 'mock',
        model: 'claude-sonnet-4-20250514 (mock)',
        timestamp: new Date().toISOString(),
      }
    }
  }

  return {
    ...FALLBACK_RESPONSE,
    conversation_id: 'mock',
    model: 'claude-sonnet-4-20250514 (mock)',
    timestamp: new Date().toISOString(),
  }
}

// --- Mock API wrapper ---

export const mockApi = {
  health: async () => ({
    status: 'online',
    pi_agent: { status: 'online', agent: 'pi-edge-agent (mock)', version: '1.0.0' },
    tools_loaded: 5,
    timestamp: new Date().toISOString(),
  }),

  tools: async () => ({
    tools: [
      { name: 'get_system_metrics', description: 'Retrieve system metrics from the Pi' },
      { name: 'manage_process', description: 'List, inspect, or kill processes' },
      { name: 'control_gpio', description: 'Control GPIO pins' },
      { name: 'scan_network', description: 'Scan the local network' },
      { name: 'run_command', description: 'Execute safe shell commands' },
    ],
    count: 5,
  }),

  metrics: async () => generateMockMetrics(),

  chat: async (message) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200))
    return getMockChatResponse(message)
  },

  clearChat: async () => ({ cleared: true, conversation_id: 'mock' }),
}
