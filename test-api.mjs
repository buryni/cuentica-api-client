import { CuenticaAPI } from './dist/api.js';

const api = new CuenticaAPI({ apiToken: process.env.CUENTICA_API_TOKEN });

async function test() {
  try {
    // Get an invoice to see structure
    const invoices = await api.invoices.list({ page_size: 1 });
    if (invoices.data.length > 0) {
      const invoice = await api.invoices.get(invoices.data[0].id);
      console.log('=== INVOICE STRUCTURE ===');
      console.log(JSON.stringify(invoice, null, 2));
    }

    // Get a transfer to see structure
    const transfers = await api.transfers.list({ page_size: 1 });
    if (transfers.data.length > 0) {
      console.log('=== TRANSFER STRUCTURE ===');
      console.log(JSON.stringify(transfers.data[0], null, 2));
    }

    // Get an income to see structure
    const incomes = await api.incomes.list({ page_size: 1 });
    if (incomes.data.length > 0) {
      console.log('=== INCOME STRUCTURE ===');
      console.log(JSON.stringify(incomes.data[0], null, 2));
    }

    // Get accounts
    const accounts = await api.accounts.list();
    console.log('=== ACCOUNTS ===');
    console.log(JSON.stringify(accounts.data, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

test();
