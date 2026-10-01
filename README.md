# OKX Alpha Copilot 🦅

> **AI-Native Autonomous Trading Copilot & Model Context Protocol (MCP) Server for OKX V5 API**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Protocol](https://img.shields.io/badge/MCP-1.6.0-blue.svg)](https://modelcontextprotocol.io)
[![OKX V5 API](https://img.shields.io/badge/OKX-V5%20API-black.svg)](https://www.okx.com)

**OKX Alpha Copilot** turns modern AI assistants (Claude Desktop, Cursor, Windsurf, Raycast) into autonomous crypto trading copilots. In addition to conversational trading via MCP, it includes built-in high-frequency quant strategies (Spot Grid Bot, EMA Momentum Breakout) and a Telegram direct-trading bot.

---

## ✨ Features

- 🧠 **Native Model Context Protocol (MCP) Server**: Seamlessly plug into Claude Desktop, Cursor, and VS Code. Execute trades, inspect balances, and monitor positions with natural language.
- 🤖 **Automated Spot Grid Trading Bot**: Robust laddered order placement for oscillating markets. Captures spreads and automatically rebalances orders.
- ⚡ **AI Momentum Breakout Strategy**: Multi-timeframe trend following based on EMA crosses with automatic position sizing and risk control.
- 📱 **Telegram Trading Bot**: Check prices, check portfolio balances, and execute instant market orders on the go via Telegram.
- 🛡️ **Builder Tag Native**: Built-in attribution tag support for the OKX AI Builder program, unlocking automated hourly fee rebates.
- 🔒 **Zero Data Leakage**: Runs 100% locally. Your API keys never leave your machine.

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/gewenbo88888/okx-alpha-copilot.git
cd okx-alpha-copilot

# Install dependencies and build
npm install
npm run build
```

### 2. Configuration

Copy `.env.example` to `.env` and fill in your OKX API credentials:

```bash
cp .env.example .env
```

```ini
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_PASSPHRASE=your_passphrase
OKX_IS_SIMULATED=false

# OKX AI Builder Code (applied from OKX Builder Program)
OKX_BUILDER_CODE=AlphaCopilot
```

---

## 🛠️ Usage

### A. Claude Desktop / Cursor MCP Setup

Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "okx-alpha-copilot": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/okx-alpha-copilot/dist/mcp-server.js"]
    }
  }
}
```

Once loaded, you can ask Claude:
- *"What's the current price and 24h volume of BTC-USDT?"*
- *"Show me my total account equity and balance breakdown."*
- *"Buy 200 USDT worth of ETH with a limit order at $2,450."*
- *"List my active open positions and unrealized profit."*

---

### B. Automated Spot Grid Bot

Run high-frequency grid arbitrage in oscillating markets:

```bash
# Start grid on BTC-USDT between 90,000 and 105,000 with 15 grids
npm run bot:grid
# Or via CLI
node dist/index.js grid -p BTC-USDT -l 90000 -u 105000 -c 15 -q 0.001
```

---

### C. Telegram Trading Bot

```bash
# Set TELEGRAM_BOT_TOKEN in .env first, then run:
npm run bot:tg
```

Send commands in Telegram:
- `/p BTC` — View latest price & 24h stats
- `/bal` — View total account equity
- `/buy BTC 50` — Instant market buy 50 USDT of BTC

---

### D. Revenue & Account Monitor

```bash
npm run monitor
```

Checks account balance, active positions, and recent bills/rebates.

---

## 📄 License

MIT License. Free for developers and traders.
