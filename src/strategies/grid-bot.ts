import { OKXClient } from '../okx-client';
import dotenv from 'dotenv';

dotenv.config();

export interface GridConfig {
  instId: string;
  lowerPrice: number;
  upperPrice: number;
  gridCount: number;
  quantityPerGrid: string;
  loopIntervalMs?: number;
}

export class GridBot {
  private client: OKXClient;
  private config: GridConfig;
  private isRunning: boolean = false;
  private activeOrders: Map<string, { price: number; side: 'buy' | 'sell' }> = new Map();

  constructor(config: GridConfig) {
    this.client = new OKXClient();
    this.config = {
      loopIntervalMs: 5000,
      ...config,
    };
  }

  public async start() {
    console.log(`====================================================`);
    console.log(`🤖 Starting OKX Alpha Grid Bot for ${this.config.instId}`);
    console.log(`Range: [${this.config.lowerPrice} - ${this.config.upperPrice}] | Grids: ${this.config.gridCount}`);
    console.log(`Qty per Grid: ${this.config.quantityPerGrid} | Tag: ${this.client.getBuilderCode()}`);
    console.log(`====================================================`);

    this.isRunning = true;
    await this.setupInitialGrid();

    while (this.isRunning) {
      try {
        await this.checkGridStatus();
        await new Promise((resolve) => setTimeout(resolve, this.config.loopIntervalMs));
      } catch (err: any) {
        console.error(`[GridBot Error]: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  public stop() {
    this.isRunning = false;
    console.log(`[GridBot] Stopping grid execution...`);
  }

  private async setupInitialGrid() {
    const tickerRes = await this.client.getTicker(this.config.instId);
    const currentPrice = parseFloat(tickerRes.data[0].last);
    console.log(`[GridBot] Current market price for ${this.config.instId}: ${currentPrice}`);

    const step = (this.config.upperPrice - this.config.lowerPrice) / this.config.gridCount;

    for (let i = 0; i <= this.config.gridCount; i++) {
      const price = parseFloat((this.config.lowerPrice + i * step).toFixed(2));

      // Do not place orders too close to the current price
      if (Math.abs(price - currentPrice) / currentPrice < 0.001) continue;

      if (price < currentPrice) {
        // Place buy order below market price
        console.log(`[GridBot] Placing initial BUY order at ${price}`);
        try {
          const res = await this.client.placeOrder({
            instId: this.config.instId,
            tdMode: 'cash',
            side: 'buy',
            ordType: 'limit',
            sz: this.config.quantityPerGrid,
            px: price.toString(),
          });
          const ordId = res.data[0].ordId;
          this.activeOrders.set(ordId, { price, side: 'buy' });
        } catch (e: any) {
          console.warn(`[GridBot] Failed to place buy order at ${price}: ${e.message}`);
        }
      } else {
        // Place sell order above market price
        console.log(`[GridBot] Placing initial SELL order at ${price}`);
        try {
          const res = await this.client.placeOrder({
            instId: this.config.instId,
            tdMode: 'cash',
            side: 'sell',
            ordType: 'limit',
            sz: this.config.quantityPerGrid,
            px: price.toString(),
          });
          const ordId = res.data[0].ordId;
          this.activeOrders.set(ordId, { price, side: 'sell' });
        } catch (e: any) {
          console.warn(`[GridBot] Failed to place sell order at ${price}: ${e.message}`);
        }
      }
    }
  }

  private async checkGridStatus() {
    const pending = await this.client.getPendingOrders('SPOT', this.config.instId);
    const pendingOrdIds = new Set((pending.data || []).map((o: any) => o.ordId));

    // Check which orders have been filled
    for (const [ordId, info] of this.activeOrders.entries()) {
      if (!pendingOrdIds.has(ordId)) {
        console.log(`🎯 [GridBot Fill] Order ${ordId} (${info.side} @ ${info.price}) was filled!`);
        this.activeOrders.delete(ordId);

        // Place counter order to capture the spread
        const step = (this.config.upperPrice - this.config.lowerPrice) / this.config.gridCount;
        if (info.side === 'buy') {
          // If buy was filled, place counter sell one step higher
          const counterPrice = parseFloat((info.price + step).toFixed(2));
          if (counterPrice <= this.config.upperPrice) {
            console.log(`🔄 [GridBot Rebalance] Placing counter SELL at ${counterPrice}`);
            try {
              const res = await this.client.placeOrder({
                instId: this.config.instId,
                tdMode: 'cash',
                side: 'sell',
                ordType: 'limit',
                sz: this.config.quantityPerGrid,
                px: counterPrice.toString(),
              });
              this.activeOrders.set(res.data[0].ordId, { price: counterPrice, side: 'sell' });
            } catch (err: any) {
              console.error(`Counter sell failed: ${err.message}`);
            }
          }
        } else {
          // If sell was filled, place counter buy one step lower
          const counterPrice = parseFloat((info.price - step).toFixed(2));
          if (counterPrice >= this.config.lowerPrice) {
            console.log(`🔄 [GridBot Rebalance] Placing counter BUY at ${counterPrice}`);
            try {
              const res = await this.client.placeOrder({
                instId: this.config.instId,
                tdMode: 'cash',
                side: 'buy',
                ordType: 'limit',
                sz: this.config.quantityPerGrid,
                px: counterPrice.toString(),
              });
              this.activeOrders.set(res.data[0].ordId, { price: counterPrice, side: 'buy' });
            } catch (err: any) {
              console.error(`Counter buy failed: ${err.message}`);
            }
          }
        }
      }
    }
  }
}

// CLI entry point
if (require.main === module) {
  const bot = new GridBot({
    instId: process.env.GRID_INST_ID || 'BTC-USDT',
    lowerPrice: parseFloat(process.env.GRID_LOWER || '90000'),
    upperPrice: parseFloat(process.env.GRID_UPPER || '105000'),
    gridCount: parseInt(process.env.GRID_COUNT || '15', 10),
    quantityPerGrid: process.env.GRID_QTY || '0.001',
  });

  bot.start().catch(console.error);
}
