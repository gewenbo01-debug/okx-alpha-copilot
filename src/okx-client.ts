import crypto from 'crypto';
import axios, { AxiosInstance, Method } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface OKXConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  simulated?: boolean;
  builderCode?: string;
  baseUrl?: string;
}

export interface PlaceOrderParams {
  instId: string;
  tdMode: 'cash' | 'cross' | 'isolated';
  side: 'buy' | 'sell';
  ordType: 'market' | 'limit' | 'post_only' | 'fok' | 'ioc';
  sz: string;
  px?: string;
  posSide?: 'long' | 'short';
  clOrdId?: string;
  tag?: string;
}

export class OKXClient {
  private apiKey: string;
  private secretKey: string;
  private passphrase: string;
  private simulated: boolean;
  private builderCode: string;
  private baseUrl: string;
  private client: AxiosInstance;

  constructor(config?: Partial<OKXConfig>) {
    this.apiKey = config?.apiKey || process.env.OKX_API_KEY || '';
    this.secretKey = config?.secretKey || process.env.OKX_SECRET_KEY || '';
    this.passphrase = config?.passphrase || process.env.OKX_PASSPHRASE || '';
    this.simulated = config?.simulated ?? (process.env.OKX_IS_SIMULATED === 'true');
    this.builderCode = config?.builderCode || process.env.OKX_BUILDER_CODE || 'AlphaCopilot';
    this.baseUrl = config?.baseUrl || 'https://www.okx.com';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  public getBuilderCode(): string {
    return this.builderCode;
  }

  public setBuilderCode(code: string): void {
    this.builderCode = code;
  }

  private generateSign(timestamp: string, method: string, requestPath: string, body: string = ''): string {
    const message = timestamp + method.toUpperCase() + requestPath + body;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('base64');
  }

  private async request<T = any>(method: Method, path: string, params: Record<string, any> = {}): Promise<T> {
    const timestamp = new Date().toISOString();
    let requestPath = path;
    let body = '';

    if (method.toUpperCase() === 'GET') {
      const query = new URLSearchParams(params).toString();
      if (query) {
        requestPath += `?${query}`;
      }
    } else {
      body = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'OK-ACCESS-KEY': this.apiKey,
      'OK-ACCESS-SIGN': this.generateSign(timestamp, method, requestPath, body),
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.passphrase,
    };

    if (this.simulated) {
      headers['x-simulated-trading'] = '1';
    }

    const response = await this.client.request({
      method,
      url: requestPath,
      headers,
      data: body || undefined,
    });

    if (response.data && response.data.code && response.data.code !== '0') {
      throw new Error(`OKX API Error [${response.data.code}]: ${response.data.msg}`);
    }

    return response.data;
  }

  // --- Market Data (Public) ---
  public async getTicker(instId: string) {
    return this.request('GET', '/api/v5/market/ticker', { instId });
  }

  public async getOrderBook(instId: string, sz: number = 20) {
    return this.request('GET', '/api/v5/market/books', { instId, sz: sz.toString() });
  }

  public async getCandles(instId: string, bar: string = '1H', limit: number = 100) {
    return this.request('GET', '/api/v5/market/candles', { instId, bar, limit: limit.toString() });
  }

  // --- Account Data (Private) ---
  public async getAccountBalance(ccy?: string) {
    const params: Record<string, string> = {};
    if (ccy) params.ccy = ccy;
    return this.request('GET', '/api/v5/account/balance', params);
  }

  public async getPositions(instType?: string, instId?: string) {
    const params: Record<string, string> = {};
    if (instType) params.instType = instType;
    if (instId) params.instId = instId;
    return this.request('GET', '/api/v5/account/positions', params);
  }

  public async getBills(instType?: string, ccy?: string, limit: number = 50) {
    const params: Record<string, string> = { limit: limit.toString() };
    if (instType) params.instType = instType;
    if (ccy) params.ccy = ccy;
    return this.request('GET', '/api/v5/account/bills', params);
  }

  // --- Trade Execution (Private - Injects Builder Code) ---
  public async placeOrder(order: PlaceOrderParams) {
    // Crucial: Automatically inject the Builder Code into tag
    const orderWithTag = {
      ...order,
      tag: order.tag || this.builderCode,
    };
    return this.request('POST', '/api/v5/trade/order', orderWithTag);
  }

  public async placeBatchOrders(orders: PlaceOrderParams[]) {
    const ordersWithTag = orders.map((o) => ({
      ...o,
      tag: o.tag || this.builderCode,
    }));
    return this.request('POST', '/api/v5/trade/batch-orders', ordersWithTag);
  }

  public async cancelOrder(instId: string, ordId?: string, clOrdId?: string) {
    const params: Record<string, string> = { instId };
    if (ordId) params.ordId = ordId;
    if (clOrdId) params.clOrdId = clOrdId;
    return this.request('POST', '/api/v5/trade/cancel-order', params);
  }

  public async getPendingOrders(instType?: string, instId?: string) {
    const params: Record<string, string> = {};
    if (instType) params.instType = instType;
    if (instId) params.instId = instId;
    return this.request('GET', '/api/v5/trade/orders-pending', params);
  }

  public async getOrderHistory(instType: string, instId?: string, limit: number = 20) {
    const params: Record<string, string> = { instType, limit: limit.toString() };
    if (instId) params.instId = instId;
    return this.request('GET', '/api/v5/trade/orders-history', params);
  }
}
