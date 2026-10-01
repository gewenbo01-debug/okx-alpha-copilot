import { OKXClient } from '../okx-client';
import dotenv from 'dotenv';

dotenv.config();

export interface MomentumConfig {
  instId: string;
  bar: string; // '15m', '1H', '4H'
  tradeAmountUSDT: number;
  checkIntervalSec: number;
}

export class MomentumStrategy {
  private client: OKXClient;
  private config: MomentumConfig;
  private isRunning: boolean = false;

  constructor(config: MomentumConfig) {
    this.client = new OKXClient();
    this.config = config;
  }

  public async start() {
    console.log(`====================================================`);
    console.log(`⚡ Starting OKX Momentum Breakout Strategy for ${this.config.instId}`);
    console.log(`Timeframe: ${this.config.bar} | Position Size: $${this.config.tradeAmountUSDT}`);
    console.log(`Builder Code Injected: ${this.client.getBuilderCode()}`);
    console.log(`====================================================`);

    this.isRunning = true;

    while (this.isRunning) {
      try {
        await this.evaluateSignals();
      } catch (err: any) {
        console.error(`[Momentum Error]: ${err.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, this.config.checkIntervalSec * 1000));
    }
  }

  private async evaluateSignals() {
    // 1. Fetch recent candles
    const candlesRes = await this.client.getCandles(this.config.instId, this.config.bar, 50);
    const candles = candlesRes.data || [];
    if (candles.length < 30) return;

    // OKX candle format: [ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]
    // Order is newest first
    const closes = candles.map((c: any) => parseFloat(c[4])).reverse();
    const currentPrice = closes[closes.length - 1];

    // 2. Compute Fast (EMA 9) & Slow (EMA 21)
    const emaFast = this.calculateEMA(closes, 9);
    const emaSlow = this.calculateEMA(closes, 21);

    const prevFast = this.calculateEMA(closes.slice(0, -1), 9);
    const prevSlow = this.calculateEMA(closes.slice(0, -1), 21);

    console.log(
      `[Momentum] Price: ${currentPrice} | Fast EMA: ${emaFast.toFixed(2)} | Slow EMA: ${emaSlow.toFixed(2)}`
    );

    // 3. Golden Cross (Bullish breakout)
    if (prevFast <= prevSlow && emaFast > emaSlow) {
      console.log(`🔥 [SIGNAL BUY] Golden Cross detected on ${this.config.instId}!`);
      const sz = (this.config.tradeAmountUSDT / currentPrice).toFixed(4);
      const res = await this.client.placeOrder({
        instId: this.config.instId,
        tdMode: 'cash',
        side: 'buy',
        ordType: 'market',
        sz,
      });
      console.log(`✅ Buy order executed:`, res.data);
    }
    // 4. Death Cross (Bearish breakdown)
    else if (prevFast >= prevSlow && emaFast < emaSlow) {
      console.log(`❄️ [SIGNAL SELL] Death Cross detected on ${this.config.instId}!`);
      const sz = (this.config.tradeAmountUSDT / currentPrice).toFixed(4);
      const res = await this.client.placeOrder({
        instId: this.config.instId,
        tdMode: 'cash',
        side: 'sell',
        ordType: 'market',
        sz,
      });
      console.log(`✅ Sell order executed:`, res.data);
    }
  }

  private calculateEMA(prices: number[], period: number): number {
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  }
}

if (require.main === module) {
  const strategy = new MomentumStrategy({
    instId: process.env.MOMENTUM_INST_ID || 'ETH-USDT',
    bar: '15m',
    tradeAmountUSDT: 50,
    checkIntervalSec: 60,
  });
  strategy.start().catch(console.error);
}
