export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  cost_price: number;
  stock_qty: number;
  category_id: number | null;
  category_name?: string;
  is_active: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'OTHER';
export type OrderSource = 'DESKTOP' | 'MOBILE';

export interface OrderItem {
  id?: number;
  product_id: number;
  product_name: string;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: number;
  invoice_no: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  source: OrderSource;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export interface DiscoveredServer {
  service: string;
  name: string;
  port: number;
  hostIp: string;
  lastSeen: number;
}

export interface SalesSummary {
  totalRevenue: number;
  orderCount: number;
  cashRevenue: number;
  cardRevenue: number;
  otherRevenue: number;
  desktopOrders: number;
  mobileOrders: number;
  averageOrderValue: number;
}

export interface CartItem {
  product: Product;
  qty: number;
  unitPrice: number;
}
