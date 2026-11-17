import { Product, Category, Order, SalesSummary } from '../types';

export class ApiClient {
  private static makeUrl(ip: string, port: number, endpoint: string): string {
    return `http://${ip}:${port}${endpoint}`;
  }

  private static getHeaders(pin: string) {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': pin,
    };
  }

  public static async ping(
    ip: string,
    port: number,
    pin: string
  ): Promise<{ status: string; name: string; port: number; authenticated: boolean }> {
    const url = this.makeUrl(ip, port, '/api/ping');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(pin),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      return await res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public static async getProducts(
    ip: string,
    port: number,
    pin: string
  ): Promise<{ categories: Category[]; products: Product[] }> {
    const url = this.makeUrl(ip, port, '/api/products');
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(pin),
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error('Invalid Pairing PIN');
      throw new Error(`Failed to load products: HTTP ${res.status}`);
    }

    return await res.json();
  }

  public static async createOrder(
    ip: string,
    port: number,
    pin: string,
    orderData: {
      items: Array<{ productId: number; productName: string; qty: number; unitPrice: number }>;
      paymentMethod: string;
      discount?: number;
      tax?: number;
    }
  ): Promise<Order> {
    const url = this.makeUrl(ip, port, '/api/orders');
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(pin),
      body: JSON.stringify({
        ...orderData,
        source: 'MOBILE',
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to submit order (HTTP ${res.status})`);
    }

    return await res.json();
  }

  public static async getOrders(
    ip: string,
    port: number,
    pin: string
  ): Promise<{ summary: SalesSummary; orders: Order[] }> {
    const url = this.makeUrl(ip, port, '/api/orders?limit=40');
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(pin),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch orders: HTTP ${res.status}`);
    }

    return await res.json();
  }
}
