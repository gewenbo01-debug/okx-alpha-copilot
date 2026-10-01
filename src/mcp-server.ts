import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OKXClient } from './okx-client';
import dotenv from 'dotenv';

dotenv.config();

const client = new OKXClient();

const server = new Server(
  {
    name: 'okx-alpha-copilot',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'okx_get_ticker',
        description: 'Get real-time market ticker data for a specific crypto pair on OKX (e.g., BTC-USDT, ETH-USDT, BTC-USDT-SWAP)',
        inputSchema: {
          type: 'object',
          properties: {
            instId: {
              type: 'string',
              description: 'Instrument ID, e.g. BTC-USDT or ETH-USDT-SWAP',
            },
          },
          required: ['instId'],
        },
      },
      {
        name: 'okx_get_balance',
        description: 'Get total equity, available balance, and specific asset balances in the OKX trading account',
        inputSchema: {
          type: 'object',
          properties: {
            ccy: {
              type: 'string',
              description: 'Optional single currency filter, e.g. USDT, BTC, ETH',
            },
          },
        },
      },
      {
        name: 'okx_get_positions',
        description: 'Get all active perpetual swap or futures positions, including unrealized PnL, leverage, and liquidation price',
        inputSchema: {
          type: 'object',
          properties: {
            instType: {
              type: 'string',
              description: 'Instrument type: SWAP, MARGIN, or FUTURES. Defaults to SWAP.',
            },
            instId: {
              type: 'string',
              description: 'Optional specific instrument ID, e.g. BTC-USDT-SWAP',
            },
          },
        },
      },
      {
        name: 'okx_place_order',
        description: 'Place a spot or perpetual contract order on OKX. Automatically applies AI Builder rebate tag.',
        inputSchema: {
          type: 'object',
          properties: {
            instId: {
              type: 'string',
              description: 'Instrument ID, e.g. BTC-USDT or BTC-USDT-SWAP',
            },
            tdMode: {
              type: 'string',
              enum: ['cash', 'cross', 'isolated'],
              description: 'Trade mode: "cash" for spot without margin, "cross" or "isolated" for margin/perpetual contracts',
            },
            side: {
              type: 'string',
              enum: ['buy', 'sell'],
              description: 'Order side: buy or sell',
            },
            ordType: {
              type: 'string',
              enum: ['market', 'limit', 'post_only'],
              description: 'Order type: "market" for instant fill, "limit" for specified price',
            },
            sz: {
              type: 'string',
              description: 'Quantity to trade (e.g. "0.01" for spot BTC, or contract count for SWAP)',
            },
            px: {
              type: 'string',
              description: 'Price for limit orders (required if ordType is "limit")',
            },
            posSide: {
              type: 'string',
              enum: ['long', 'short'],
              description: 'Position side for contract trading in hedge mode: "long" or "short"',
            },
          },
          required: ['instId', 'tdMode', 'side', 'ordType', 'sz'],
        },
      },
      {
        name: 'okx_cancel_order',
        description: 'Cancel an active pending order on OKX',
        inputSchema: {
          type: 'object',
          properties: {
            instId: {
              type: 'string',
              description: 'Instrument ID, e.g. BTC-USDT',
            },
            ordId: {
              type: 'string',
              description: 'Order ID to cancel',
            },
          },
          required: ['instId', 'ordId'],
        },
      },
      {
        name: 'okx_get_pending_orders',
        description: 'Get list of active unfilled or partially filled orders on OKX',
        inputSchema: {
          type: 'object',
          properties: {
            instType: {
              type: 'string',
              description: 'Instrument type: SPOT, SWAP, MARGIN, etc.',
            },
            instId: {
              type: 'string',
              description: 'Optional instrument filter, e.g. BTC-USDT',
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'okx_get_ticker': {
        const res = await client.getTicker(String(args?.instId));
        return {
          content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
        };
      }

      case 'okx_get_balance': {
        const res = await client.getAccountBalance(args?.ccy ? String(args.ccy) : undefined);
        return {
          content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
        };
      }

      case 'okx_get_positions': {
        const res = await client.getPositions(
          args?.instType ? String(args.instType) : 'SWAP',
          args?.instId ? String(args.instId) : undefined
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
        };
      }

      case 'okx_place_order': {
        const res = await client.placeOrder({
          instId: String(args?.instId),
          tdMode: args?.tdMode as any,
          side: args?.side as any,
          ordType: args?.ordType as any,
          sz: String(args?.sz),
          px: args?.px ? String(args.px) : undefined,
          posSide: args?.posSide as any,
        });
        return {
          content: [
            {
              type: 'text',
              text: `Order executed successfully!\nBuilder Code Attached: ${client.getBuilderCode()}\nResponse: ${JSON.stringify(
                res.data,
                null,
                2
              )}`,
            },
          ],
        };
      }

      case 'okx_cancel_order': {
        const res = await client.cancelOrder(String(args?.instId), String(args?.ordId));
        return {
          content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
        };
      }

      case 'okx_get_pending_orders': {
        const res = await client.getPendingOrders(
          args?.instType ? String(args.instType) : undefined,
          args?.instId ? String(args.instId) : undefined
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('OKX Alpha Copilot MCP Server running on stdio (Builder Tag Active)');
}

run().catch((err) => {
  console.error('MCP Fatal error:', err);
  process.exit(1);
});
