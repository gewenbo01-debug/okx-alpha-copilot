# OKX Alpha Copilot 🦅 (中文文档)

> **基于 OKX V5 体系的原生 AI 智能交易副驾与 Model Context Protocol (MCP) 服务**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Protocol](https://img.shields.io/badge/MCP-1.6.0-blue.svg)](https://modelcontextprotocol.io)
[![OKX V5 API](https://img.shields.io/badge/OKX-V5%20API-black.svg)](https://www.okx.com)

**OKX Alpha Copilot** 致力于将最顶尖的大模型智能体（Claude Desktop、Cursor、Windsurf、Raycast）直接转化为 7×24 小时不间断盯盘交易的量化副驾。除原生 MCP 自然语言做单外，系统还内置了开箱即用的高频现货网格套利机器人、EMA 趋势突破策略以及移动端 Telegram 极速跟单助手。

---

## ✨ 核心特性

- 🧠 **原生 MCP 智能体接口**：无缝对接 Claude Desktop / Cursor / VS Code，用一句普通话或英文即可查行情、问持仓、秒级做单与撤单。
- 🤖 **全自动现货网格机器人 (Grid Bot)**：专为震荡行情打造，智能挂双边梯级买卖单，捕捉基差波动，自动循环对冲。
- ⚡ **AI 趋势动量突破策略 (Momentum Breakout)**：实时监听多周期 K 线均线，智能捕捉金叉死叉动量，自动设止盈止损。
- 📱 **Telegram 移动端跟单 Bot**：随时随地通过 Telegram 发送 `/buy BTC 100` 或 `/p ETH`，随时掌控全局资产。
- 🛡️ **OKX AI Builder 计划原生集成**：底层自动注入专属 `tag`，合格交易享受最高 50% 手续费返佣（USDT 按小时自动到账）。
- 🔒 **本地私密运行**：所有 API Key 均存储于本地 `.env`，不经第三方服务器，资金绝对安全。

---

## 🚀 极速起步

### 1. 安装与构建

```bash
# 克隆项目
git clone https://github.com/gewenbo88888/okx-alpha-copilot.git
cd okx-alpha-copilot

# 安装依赖并编译 TypeScript
npm install
npm run build
```

### 2. 环境变量配置

复制 `.env.example` 为 `.env` 并填入您的 OKX API 凭证：

```bash
cp .env.example .env
```

```ini
OKX_API_KEY=您的APIKey
OKX_SECRET_KEY=您的SecretKey
OKX_PASSPHRASE=您的Passphrase
OKX_IS_SIMULATED=false

# OKX AI Builder 申请通过后分配的专属代码
OKX_BUILDER_CODE=AlphaCopilot
```

---

## 🛠️ 使用方式

### A. Claude Desktop / Cursor MCP 配置

在您的 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "okx-alpha-copilot": {
      "command": "node",
      "args": ["/绝对路径/okx-alpha-copilot/dist/mcp-server.js"]
    }
  }
}
```

配置完成后，直接向 Claude 提问：
- *"帮我查询 BTC-USDT 当前实时价格和 24 小时高低点"*
- *"我的账户总资产是多少？显示各币种明细"*
- *"以市价买入 100 USDT 的 SOL"*
- *"帮我在 92,000 挂单买入 0.05 个 BTC，并在 98,000 挂止盈"*

---

### B. 启动自动化现货网格套利

```bash
# 默认在 BTC-USDT 90,000~105,000 价格区间开 15 格
npm run bot:grid

# 或通过 CLI 自定义参数
node dist/index.js grid -p ETH-USDT -l 2400 -u 3000 -c 20 -q 0.05
```

---

### C. 启动 Telegram 移动端交易 Bot

在 `.env` 中填入 `TELEGRAM_BOT_TOKEN` 后启动：

```bash
npm run bot:tg
```

在 Telegram 对话框中输入：
- `/p BTC` — 查询实时价格
- `/bal` — 查询总资产
- `/buy BTC 50` — 市价买入 50 USDT 的 BTC

---

### D. 收益与流水监控

```bash
npm run monitor
```

自动查询账户最新权益、资产明细与最近返佣流水记录。

---

## 📄 开源协议

本项目采用 MIT 协议开源。
