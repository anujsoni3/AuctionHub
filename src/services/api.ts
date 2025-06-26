/* ------------------- api.ts ------------------- */
const API_BASE_URL = 'https://voiceagent-omnidim.onrender.com';

/* ===== Shared Models ===== */
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
  product_name: string;
  status: string;
}

export interface Auction {
  id: string;
  name: string;
  product_ids: string[];
  valid_until: string;
}

export interface LoginResponse {
  message: string;
  user: { id: string;name: string; username: string };
}

export interface AdminLoginResponse {
  message: string;
  token: string;
  admin: { name: string; username: string };
}

/* =========== ApiService =========== */
class ApiService {
  /* —— generic request wrapper —— */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      mode: 'cors',
      credentials: 'include',           // ← always send & receive cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${txt || res.statusText}`);
    }
    return res.json();
  }

  /* ===== Public APIs ===== */
  getProducts() {
    return this.request<Product[]>('/products');
  }

  placeBid(product_name: string, bid_amount: number, user_id: string) {
    return this.request('/bid', {
      method: 'POST',
      body: JSON.stringify({ product_name, bid_amount, user_id }),
    });
  }

  getHighestBid(k: string) {
    return this.request<{ product: string; highest_bid: number }>(
      `/highest-bid?product_key=${k}`
    );
  }

  getTimeLeft(k: string) {
    return this.request<{ product: string; time_remaining_seconds: number }>(
      `/time-left?product_key=${k}`
    );
  }

  getBids(k: string) {
    return this.request<Bid[]>(`/bids?product_key=${k}`);
  }

  /* ===== Admin APIs ===== */
  getAdminProducts() {
    return this.request<Product[]>('/admin/products');
  }

  createAuction(a: Auction) {
    return this.request('/admin/auction', {
      method: 'POST',
      body: JSON.stringify(a),
    });
  }

  createProduct(p: Omit<Product, 'status' | 'bids'>) {
    return this.request('/admin/product', {
      method: 'POST',
      body: JSON.stringify(p),
    });
  }

  deleteProduct(id: string) {
    return this.request(`/admin/product/${id}`, { method: 'DELETE' });
  }

  deleteAuction(id: string) {
    return this.request(`/admin/auction/${id}`, { method: 'DELETE' });
  }

  getAdminOverview() {
    return this.request<{
      total_products: number;
      total_auctions: number;
      total_bids: number;
      products: Product[];
    }>('/admin/all_products');
  }

  getAllAuctions() {
    return this.request<{
      total_auctions: number;
      auctions: Auction[];
    }>('/admin/all_auctions');
  }

  getAuctionProducts(id: string) {
    return this.request<{
      auction_id: string;
      total_products: number;
      products: Product[];
    }>(`/admin/auction_products/${id}`);
  }

  /* ===== User Auth ===== */
  register(data: {
    name: string;
    username: string;
    password: string;
    mobile_number: string;
  }) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  login(username: string, password: string) {
    return this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  changePassword(username: string, password: string, new_password: string) {
    return this.request('/change-password', {
      method: 'POST',
      body: JSON.stringify({ username, password, new_password }),
    });
  }

  /* ===== Admin Auth ===== */
  adminLogin(username: string, password: string) {
    return this.request<AdminLoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role: 'admin' }),
    });
  }

  adminChangePassword(username: string, password: string, new_password: string) {
    return this.request('/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        new_password,
        role: 'admin',
      }),
    });
  }
  getUserBids(user_id: string) {
  return this.request<Bid[]>(`/user-bids?user_id=${user_id}`);
}

}

export const apiService = new ApiService();
