const API_BASE_URL ='https://voiceagentomnidim-production.up.railway.app'  ;

export interface Product {
  id: string;
  name: string;
  description: string;
  auction_id?: string;
  status: 'unsold' | 'sold';
  time: string;
  bids?: Bid[];
}

export interface Bid {
  amount: number;
  user_id: string;
  timestamp: string;
  status: string;
}

export interface Auction {
  id: string;
  name: string;
  product_ids: string[];
  valid_until: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Public endpoints
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async placeBid(productName: string, bidAmount: number, userId: string) {
    return this.request('/bid', {
      method: 'POST',
      body: JSON.stringify({
        product_name: productName,
        bid_amount: bidAmount,
        user_id: userId,
      }),
    });
  }

  async getHighestBid(productKey: string): Promise<{ product: string; highest_bid: number }> {
    return this.request<{ product: string; highest_bid: number }>(`/highest-bid?product_key=${productKey}`);
  }

  async getTimeLeft(productKey: string): Promise<{ product: string; time_remaining_seconds: number }> {
    return this.request<{ product: string; time_remaining_seconds: number }>(`/time-left?product_key=${productKey}`);
  }

  async getBids(productKey: string): Promise<Bid[]> {
    return this.request<Bid[]>(`/bids?product_key=${productKey}`);
  }

  // Admin endpoints
  async getAdminProducts(): Promise<Product[]> {
    return this.request<Product[]>('/admin/products');
  }

  async createAuction(auction: Omit<Auction, 'id'> & { id: string }) {
    return this.request('/admin/auction', {
      method: 'POST',
      body: JSON.stringify(auction),
    });
  }

  async createProduct(product: Omit<Product, 'status' | 'bids'>) {
    return this.request('/admin/product', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/admin/product/${productId}`, {
      method: 'DELETE',
    });
  }
 


  async deleteAuction(auctionId: string) {
    return this.request(`/admin/auction/${auctionId}`, {
      method: 'DELETE',
    });
  }
  async getAdminOverview(): Promise<{
  total_products: number;
  total_auctions: number;
  total_bids: number;
  products: Product[];
}> {
  return this.request('/admin/all_products');
}
async getAllAuctions(): Promise<{ total_auctions: number; auctions: Auction[] }> {
  return this.request('/admin/all_auctions');
}

async getAuctionProducts(auctionId: string): Promise<{
  auction_id: string;
  total_products: number;
  products: Product[];
}> {
  return this.request(`/admin/auction_products/${auctionId}`);
}

}

export const apiService = new ApiService();