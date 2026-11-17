import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DiscoveredServer, Product, Category, Order, SalesSummary } from '../types';
import { saveServerConfig, loadServerConfig, clearServerConfig } from '../services/storage';
import { udpDiscoveryService } from '../services/udpDiscovery';
import { ApiClient } from '../services/apiClient';
import { mobileWsService } from '../services/websocketService';

interface ServerContextType {
  serverIp: string;
  serverPort: number;
  pairingPin: string;
  serverName: string;
  isConnected: boolean;
  isConnecting: boolean;
  discoveredServers: DiscoveredServer[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  salesSummary: SalesSummary | null;
  error: string | null;
  connectToServer: (ip: string, port: number, pin: string) => Promise<boolean>;
  disconnectServer: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  submitOrder: (orderData: any) => Promise<Order>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState(5000);
  const [pairingPin, setPairingPin] = useState('');
  const [serverName, setServerName] = useState('Desktop POS');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [discoveredServers, setDiscoveredServers] = useState<DiscoveredServer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Auto-discover desktop servers over UDP
  useEffect(() => {
    udpDiscoveryService.startListening();

    const unsubscribe = udpDiscoveryService.subscribe((server) => {
      setDiscoveredServers((prev) => {
        const existing = prev.find((s) => s.hostIp === server.hostIp && s.port === server.port);
        if (existing) {
          return prev.map((s) => (s.hostIp === server.hostIp ? server : s));
        }
        return [...prev, server];
      });
    });

    return () => {
      unsubscribe();
      udpDiscoveryService.stopListening();
    };
  }, []);

  // 2. Load stored credentials and auto-connect
  useEffect(() => {
    async function restore() {
      const saved = await loadServerConfig();
      if (saved && saved.ip && saved.pin) {
        console.log(`[ServerContext] Restoring saved connection to ${saved.ip}:${saved.port}`);
        connectToServer(saved.ip, saved.port, saved.pin);
      }
    }
    restore();
  }, []);

  const refreshProducts = useCallback(async () => {
    if (!serverIp || !pairingPin) return;
    try {
      const data = await ApiClient.getProducts(serverIp, serverPort, pairingPin);
      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch (err: any) {
      console.warn('[ServerContext] Failed to load products:', err);
    }
  }, [serverIp, serverPort, pairingPin]);

  const refreshOrders = useCallback(async () => {
    if (!serverIp || !pairingPin) return;
    try {
      const data = await ApiClient.getOrders(serverIp, serverPort, pairingPin);
      setOrders(data.orders || []);
      setSalesSummary(data.summary || null);
    } catch (err: any) {
      console.warn('[ServerContext] Failed to load orders:', err);
    }
  }, [serverIp, serverPort, pairingPin]);

  // 3. Connect to Desktop Host
  const connectToServer = async (ip: string, port: number, pin: string): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);

    try {
      const pingRes = await ApiClient.ping(ip, port, pin);

      if (!pingRes.authenticated) {
        throw new Error('Invalid Pairing PIN. Check desktop settings.');
      }

      setServerIp(ip);
      setServerPort(port);
      setPairingPin(pin);
      setServerName(pingRes.name || 'Desktop POS');
      setIsConnected(true);

      // Save for auto-reconnect
      await saveServerConfig(ip, port, pin, pingRes.name || 'Desktop POS');

      // Load initial data
      const prodData = await ApiClient.getProducts(ip, port, pin);
      setProducts(prodData.products || []);
      setCategories(prodData.categories || []);

      const ordersData = await ApiClient.getOrders(ip, port, pin);
      setOrders(ordersData.orders || []);
      setSalesSummary(ordersData.summary || null);

      // Connect WebSocket for real-time order & stock feed
      mobileWsService.connect(ip, port);

      return true;
    } catch (err: any) {
      setError(err.message || 'Could not connect to Desktop Host');
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectServer = async () => {
    mobileWsService.disconnect();
    await clearServerConfig();
    setIsConnected(false);
    setProducts([]);
    setOrders([]);
    setSalesSummary(null);
  };

  // 4. WebSocket Event Listener
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = mobileWsService.subscribe((type, payload) => {
      switch (type) {
        case 'NEW_ORDER': {
          setOrders((prev) => [payload, ...prev.filter((o) => o.id !== payload.id)]);
          refreshOrders();
          refreshProducts();
          break;
        }
        case 'STOCK_UPDATED': {
          const { productId, stock_qty } = payload;
          setProducts((prev) =>
            prev.map((p) => (p.id === productId ? { ...p, stock_qty } : p))
          );
          break;
        }
        case 'PRODUCT_UPDATED':
        case 'PRODUCT_ADDED': {
          refreshProducts();
          break;
        }
        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected, refreshOrders, refreshProducts]);

  const submitOrder = async (orderData: any): Promise<Order> => {
    if (!isConnected) throw new Error('Not connected to Desktop POS Host');
    const order = await ApiClient.createOrder(serverIp, serverPort, pairingPin, orderData);
    await refreshProducts();
    await refreshOrders();
    return order;
  };

  return (
    <ServerContext.Provider
      value={{
        serverIp,
        serverPort,
        pairingPin,
        serverName,
        isConnected,
        isConnecting,
        discoveredServers,
        products,
        categories,
        orders,
        salesSummary,
        error,
        connectToServer,
        disconnectServer,
        refreshProducts,
        refreshOrders,
        submitOrder,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) throw new Error('useServer must be used within ServerProvider');
  return context;
};
