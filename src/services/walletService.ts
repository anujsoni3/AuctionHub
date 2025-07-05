import api from './api';

export interface Transaction {
  _id: string;
  username: string;
  type: string;
  amount: number;
  timestamp: string;
  meta?: {
    product_id?: string;
    notes?: string;
  };
}

export const walletService = {
  async getWalletBalance(username: string) {
    // Backend expects POST with JSON body, not GET with query params
    const response = await api.post('/wallet', { username });
    return response.data;
  },

  async topupWallet(amount: number) {
    const response = await api.post('/wallet/topup', { amount });
    return response.data;
  },

  async getTransactions(): Promise<Transaction[]> {
    const response = await api.get('/wallet/transactions');
    return response.data.transactions || [];
  },

  async rollbackBid(data: { bid_id: string; username: string }) {
    const response = await api.post('/rollback-bid', data);
    return response.data;
  }
};