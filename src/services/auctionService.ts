import api from './api';

export interface Auction {
  id: string;
  name: string;
  valid_until: string;
  product_ids?: string[];
  registrations?: string[];
  created_by?: string;
  settled?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  status?: string;
  auction_id?: string;
  sold_to?: string;
  admin_id?: string;
  bids?: Array<{
    amount: number;
    timestamp: string;
    user_id: string;
  }>;
}

export interface Bid {
  bid_id?: string;
  product_id: string;
  product_name: string;
  auction_id?: string;
  amount: number;
  timestamp?: string;
  status?: string;
  user_id?: string;
}

export const auctionService = {
  // User endpoints
  async getAuctions(): Promise<Auction[]> {
    const response = await api.get('/auctions');
    return response.data;
  },

  async getAuctionProducts(auctionId: string): Promise<Product[]> {
    const response = await api.get(`/auctions/${auctionId}/products`);
    return response.data;
  },

  async registerForAuction(auctionId: string) {
    const response = await api.post('/auctions/register', { auction_id: auctionId });
    return response.data;
  },

  async placeBid(data: { product_name: string; bid_amount: number; user_id: string }) {
    const response = await api.post('/bid', data);
    return response.data;
  },

  async getUserBids(): Promise<Bid[]> {
    const response = await api.get('/user-bids');
    return response.data;
  },

  async getUserBidsForAuction(auctionId: string): Promise<Bid[]> {
    const response = await api.get(`/user-bids/auction/${auctionId}`);
    return response.data;
  },

  async getAllBids(productKey: string): Promise<Bid[]> {
    const response = await api.get(`/bids?product_key=${productKey}`);
    return response.data;
  },

  async getHighestBid(productKey: string) {
    const response = await api.get(`/highest-bid?product_key=${productKey}`);
    return response.data;
  },

  async getTimeLeft(productKey: string) {
    const response = await api.get(`/time-left?product_key=${productKey}`);
    return response.data;
  },

  // Admin endpoints
  async createAuction(data: { id: string; name: string; product_ids: string[]; valid_until: string }) {
    const response = await api.post('/admin/auction', data);
    return response.data;
  },

  async updateAuction(auctionId: string, data: Partial<{ name: string; product_ids: string[]; valid_until: string }>) {
    const response = await api.put(`/admin/auction/${auctionId}`, data);
    return response.data;
  },

  async deleteAuction(auctionId: string) {
    const response = await api.delete(`/admin/auction/${auctionId}`);
    return response.data;
  },

  async addProduct(data: { id: string; name: string; description: string }) {
    const response = await api.post('/admin/product', data);
    return response.data;
  },

  async updateProduct(productId: string, data: Partial<{ name: string; description: string; auction_id: string }>) {
    const response = await api.put(`/admin/product/${productId}`, data);
    return response.data;
  },

  async deleteProduct(productId: string) {
    const response = await api.delete(`/admin/product/${productId}`);
    return response.data;
  },

  async getAllAuctions() {
    const response = await api.get('/admin/all_auctions');
    return response.data.auctions || [];
  },

  async getAuctionProductsAdmin(auctionId: string) {
    const response = await api.get(`/admin/auction_products/${auctionId}`);
    return response.data.products || [];
  },

  async getUnassignedProducts(): Promise<Product[]> {
    const response = await api.get('/admin/products/unassigned');
    return response.data;
  },

  async getMyAuctions(): Promise<Auction[]> {
    const response = await api.get('/admin/auctions/my');
    return response.data;
  },

  async getMyAuctionProducts(auctionId: string): Promise<Product[]> {
    const response = await api.get(`/admin/auction/${auctionId}/products`);
    return response.data;
  },

  async settleAuction(auctionId: string) {
    const response = await api.post(`/admin/auction/${auctionId}/settle`);
    return response.data;
  },
  // auctionService.ts
async getAuction(auctionId: string): Promise<Auction> {
  const res = await api.get(`/admin/auction/${auctionId}`);
  return res.data;
}

};