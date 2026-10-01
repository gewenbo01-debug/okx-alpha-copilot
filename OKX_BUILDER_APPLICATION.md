# OKX AI Builder 计划官方申请表单（即填即用）

> **官方申请入口**：[https://www.okx.com/zh-hans/agent-tradekit/builder](https://www.okx.com/zh-hans/agent-tradekit/builder)  
> **过审核心优势**：原型完整、代码已开源、支持标准 MCP 协议与多项自研量化策略（网格/动量突破/Telegram），1 个工作日内即可极速下发专属 `Builder Code`。

---

### 📝 表单字段复制指南

#### 1. 项目名称 (Project Name)
```text
OKX Alpha Copilot - Autonomous AI Trading Agent & MCP Hub
```

#### 2. 项目类型 / 赛道分类 (Project Category)
```text
AI Agent / MCP Server / Automated Quant Trading Bot
```

#### 3. 接入方式 (Integration Method)
- 勾选：`MCP (Model Context Protocol)` 与 `OpenAPI / REST`

#### 4. 项目链接 / 开源仓库 (Repository URL)
```text
https://github.com/gewenbo88888/okx-alpha-copilot
```
*(如上传至您的 GitHub 账号，直接填写该地址即可)*

#### 5. 项目简介 (Project Summary · 500字内)
```text
OKX Alpha Copilot 是专为 OKX V5 交易体系打造的原生 AI 智能交易副驾与自动化量化集群。项目基于 Model Context Protocol (MCP) 深度集成，能够无缝连接 Claude Desktop、Cursor、Windsurf 等主流 AI 客户端，让全球开发者与交易员直接通过自然语言进行行情分析、持仓风控与秒级精准挂单。

同时，项目内置了全自动网格套利（Spot Grid）与 EMA/MACD 多周期动量突破策略引擎，并配备 Telegram 极速跟单助手。底层所有交易模块已无缝封装 OKX 专属订单标识（Tag），确保每一笔通过该开源矩阵执行的现货与合约交易均能被 OKX 智能体结算网络精准识别与对账。
```

#### 6. 核心功能与亮点 (Key Features)
```text
1. 官方级 MCP 协议支持：提供 okx_get_ticker, okx_get_balance, okx_get_positions, okx_place_order, okx_cancel_order 等完整工具链，全本地运行保护用户 API 密钥。
2. 双边高频自动网格策略（Grid Bot）：智能计算价格带与动态补单，专为震荡行情捕捉基差收益。
3. AI 动量突破引擎（Momentum Engine）：实时计算多周期均线死叉/金叉并自动执行止盈止损。
4. 全渠道多端触达：支持 CLI 终端操作、IDE 智能体调用与 Telegram 移动端机器人。
```

#### 7. 目标用户群体与预计月交易量 (Target Audience & Projected Volume)
```text
• 目标用户：Web3 量化交易团队、加密极客、AI Agent 开发者、Telegram 信号社群与高频现货/合约交易员。
• 预期覆盖：首期通过 Twitter (@TrustlessX) 及开源技术社区分发，预计接入 200+ 活跃量化用户。
• 预计月交易量：首月预估 $500,000 - $2,000,000 USD，随着网格策略持续高频运转，后续交易频次将实现复利递增。
```

#### 8. 联系方式 (Contact)
- **邮箱**：`gewenbo888@gmail.com`
- **Telegram**：`@gewenbo888`
- **Twitter / X**：`@TrustlessX`

---

### 🚀 审核通过后的激活步骤
1. 收到 OKX 官方确认邮件并分配到专属 `Builder Code`（如 `ALPHA888` 或专属 Tag）。
2. 在项目根目录 `.env` 文件中将 `OKX_BUILDER_CODE` 更新为您分配的代码：
   ```bash
   OKX_BUILDER_CODE=您的专属Code
   ```
3. 之后任何通过此项目（或分发给其他用户使用此工具）产生的每一笔下单，OKX 都会每小时自动向您的资金账户结算 **35% ~ 50% 净手续费 USDT 返还**！
