import { Command } from 'commander';
import { GridBot } from './strategies/grid-bot';
import { MomentumStrategy } from './strategies/momentum-breakout';
import { OKXClient } from './okx-client';

const program = new Command();
const client = new OKXClient();

program
  .name('okx-alpha-copilot')
  .description('AI-Native Autonomous Trading Copilot & MCP Server for OKX')
  .version('1.0.0');

program
  .command('mcp')
  .description('Start Model Context Protocol (MCP) server for Claude Desktop / Cursor')
  .action(() => {
    require('./mcp-server');
  });

program
  .command('grid')
  .description('Start autonomous Spot Grid Trading Bot')
  .option('-p, --pair <pair>', 'Trading pair', 'BTC-USDT')
  .option('-l, --lower <lower>', 'Lower grid price', '90000')
  .option('-u, --upper <upper>', 'Upper grid price', '105000')
  .option('-c, --count <count>', 'Number of grids', '15')
  .option('-q, --qty <qty>', 'Quantity per grid', '0.001')
  .action((opts) => {
    const bot = new GridBot({
      instId: opts.pair,
      lowerPrice: parseFloat(opts.lower),
      upperPrice: parseFloat(opts.upper),
      gridCount: parseInt(opts.count, 10),
      quantityPerGrid: opts.qty,
    });
    bot.start().catch(console.error);
  });

program
  .command('momentum')
  .description('Start AI Momentum Breakout Strategy Bot')
  .option('-p, --pair <pair>', 'Trading pair', 'ETH-USDT')
  .option('-b, --bar <bar>', 'Candle timeframe (15m, 1H, 4H)', '15m')
  .option('-a, --amount <amount>', 'USDT position size', '50')
  .action((opts) => {
    const strat = new MomentumStrategy({
      instId: opts.pair,
      bar: opts.bar,
      tradeAmountUSDT: parseFloat(opts.amount),
      checkIntervalSec: 60,
    });
    strat.start().catch(console.error);
  });

program
  .command('status')
  .description('Check OKX account balance, positions, and active builder tag')
  .action(async () => {
    require('./monitor');
  });

program.parse(process.argv);
