import { OKXClient } from './okx-client';
import dotenv from 'dotenv';

dotenv.config();

async function runMonitor() {
  const client = new OKXClient();

  console.log(`====================================================`);
  console.log(`📊 OKX Alpha Copilot Revenue & Account Monitor`);
  console.log(`Builder Code: ${client.getBuilderCode()}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`====================================================`);

  try {
    const balRes = await client.getAccountBalance();
    const totalEq = balRes.data[0]?.totalEq || '0';
    console.log(`\n💵 Total Account Equity: $${totalEq} USD`);

    console.log(`\n🪙 Asset Breakdown:`);
    const details = balRes.data[0]?.details || [];
    for (const d of details) {
      if (parseFloat(d.eq) > 0.01) {
        console.log(`  - ${d.ccy.padEnd(6)}: Balance = ${parseFloat(d.eq).toFixed(4)}, Available = ${parseFloat(d.availBal).toFixed(4)}`);
      }
    }

    console.log(`\n📜 Recent Bills / Rebates / Fee Records:`);
    const billsRes = await client.getBills();
    const bills = billsRes.data || [];
    if (bills.length === 0) {
      console.log(`  (No recent bill records found)`);
    } else {
      for (const bill of bills.slice(0, 10)) {
        const time = new Date(parseInt(bill.ts, 10)).toLocaleString();
        console.log(`  [${time}] Type: ${bill.subType || bill.type} | Amount: ${bill.sz} ${bill.ccy} | Fee: ${bill.fee || '0'}`);
      }
    }

    console.log(`\n✅ Monitor check complete. 35%-50% rebates will be distributed directly to funding account hourly.`);
  } catch (err: any) {
    console.error(`❌ Monitor Error: ${err.message}`);
  }
}

if (require.main === module) {
  runMonitor();
}
