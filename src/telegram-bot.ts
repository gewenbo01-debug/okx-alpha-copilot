import { OKXClient } from './okx-client';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const client = new OKXClient();
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const allowedChatId = process.env.TELEGRAM_CHAT_ID;

if (!botToken) {
  console.log('[Telegram Bot] No TELEGRAM_BOT_TOKEN provided. Telegram interface disabled.');
} else {
  console.log('[Telegram Bot] Starting Telegram Long Polling Service...');
  let lastUpdateId = 0;

  async function pollTelegram() {
    try {
      const res = await axios.get(`https://api.telegram.org/bot${botToken}/getUpdates`, {
        params: {
          offset: lastUpdateId + 1,
          timeout: 20,
        },
      });

      const updates = res.data.result || [];
      for (const update of updates) {
        lastUpdateId = update.update_id;
        if (update.message && update.message.text) {
          const chatId = String(update.message.chat.id);
          const text = update.message.text.trim();

          // Optional authorization filter
          if (allowedChatId && chatId !== allowedChatId) {
            console.warn(`Unauthorized access attempt from chat ${chatId}`);
            continue;
          }

          await handleMessage(chatId, text);
        }
      }
    } catch (e: any) {
      console.error('[Telegram Polling Error]:', e.message);
    }

    setTimeout(pollTelegram, 1000);
  }

  async function sendMessage(chatId: string, text: string) {
    try {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      });
    } catch (err: any) {
      console.error('Send TG message failed:', err.message);
    }
  }

  async function handleMessage(chatId: string, text: string) {
    const parts = text.split(' ');
    const cmd = parts[0].toLowerCase();

    if (cmd === '/start' || cmd === '/help') {
      const msg = `🚀 *OKX Alpha Copilot Bot*\n\n` +
        `Available Commands:\n` +
        `• \`/p <coin>\` - Check ticker (e.g. \`/p BTC\`)\n` +
        `• \`/bal\` - View account balances\n` +
        `• \`/buy <coin> <usdt_amount>\` - Quick market buy (e.g. \`/buy BTC 50\`)\n` +
        `• \`/sell <coin> <usdt_amount>\` - Quick market sell\n` +
        `• \`/pos\` - View active positions & PnL\n\n` +
        `🛡️ _Rebates active via Builder Code: \`${client.getBuilderCode()}\`_`;
      await sendMessage(chatId, msg);
    } else if (cmd === '/p') {
      const symbol = (parts[1] || 'BTC').toUpperCase();
      const instId = symbol.includes('-') ? symbol : `${symbol}-USDT`;
      try {
        const res = await client.getTicker(instId);
        const data = res.data[0];
        await sendMessage(
          chatId,
          `📊 *${instId}*\nPrice: \`$${data.last}\`\n24h High: \`$${data.high24h}\`\n24h Low: \`$${data.low24h}\``
        );
      } catch (err: any) {
        await sendMessage(chatId, `❌ Failed to fetch ticker: ${err.message}`);
      }
    } else if (cmd === '/bal') {
      try {
        const res = await client.getAccountBalance();
        const details = res.data[0]?.details || [];
        let textOut = `💰 *Account Balances*\nTotal Equity: \`$${res.data[0]?.totalEq || '0'}\`\n\n`;
        for (const coin of details) {
          if (parseFloat(coin.eq) > 0.1) {
            textOut += `• *${coin.ccy}*: \`${coin.eq}\` (Avail: \`${coin.availBal}\`)\n`;
          }
        }
        await sendMessage(chatId, textOut);
      } catch (err: any) {
        await sendMessage(chatId, `❌ Failed to fetch balance: ${err.message}`);
      }
    } else if (cmd === '/buy') {
      const coin = (parts[1] || 'BTC').toUpperCase();
      const instId = `${coin}-USDT`;
      const amountUSDT = parseFloat(parts[2] || '10');

      try {
        const ticker = await client.getTicker(instId);
        const price = parseFloat(ticker.data[0].last);
        const sz = (amountUSDT / price).toFixed(5);

        const res = await client.placeOrder({
          instId,
          tdMode: 'cash',
          side: 'buy',
          ordType: 'market',
          sz,
        });

        await sendMessage(
          chatId,
          `✅ *Market Buy Executed!*\nPair: \`${instId}\`\nSize: \`${sz} ${coin}\` (~$${amountUSDT})\nOrder ID: \`${res.data[0].ordId}\``
        );
      } catch (err: any) {
        await sendMessage(chatId, `❌ Buy failed: ${err.message}`);
      }
    }
  }

  pollTelegram();
}
