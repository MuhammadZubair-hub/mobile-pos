import { DiscoveredServer } from '../types';

let dgram: any;
try {
  dgram = require('react-native-udp');
} catch (e) {
  console.warn('[UDP Discovery] react-native-udp native module not loaded; manual IP entry will be available.');
}

export type ServerDiscoveredCallback = (server: DiscoveredServer) => void;

class UdpDiscoveryService {
  private socket: any = null;
  private isListening = false;
  private listeners: Set<ServerDiscoveredCallback> = new Set();
  private readonly discoveryPort = 5001;

  public startListening(): boolean {
    if (this.isListening) return true;
    if (!dgram || !dgram.createSocket) {
      console.warn('[UDP Discovery] UDP socket library is not available in current environment.');
      return false;
    }

    try {
      this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

      this.socket.on('error', (err: any) => {
        console.warn('[UDP Discovery] Socket error:', err);
      });

      this.socket.on('message', (msg: any, rinfo: any) => {
        try {
          const text = typeof msg === 'string' ? msg : msg.toString('utf8');
          const data = JSON.parse(text);

          if (data && data.service === 'POS_LOCAL_SERVER') {
            const discovered: DiscoveredServer = {
              service: data.service,
              name: data.name || 'Desktop POS Host',
              port: data.port || 5000,
              // Use hostIp reported by beacon or fallback to UDP sender IP
              hostIp: data.hostIp || rinfo?.address || '127.0.0.1',
              lastSeen: Date.now(),
            };

            this.notifyListeners(discovered);
          }
        } catch {
          // Ignore non-POS UDP packets
        }
      });

      this.socket.bind(this.discoveryPort, (err: any) => {
        if (err) {
          console.warn('[UDP Discovery] Failed to bind UDP port 5001:', err);
          return;
        }
        this.isListening = true;
        console.log(`[UDP Discovery] Listening for Desktop POS beacons on UDP port ${this.discoveryPort}`);
      });

      return true;
    } catch (err) {
      console.warn('[UDP Discovery] Error initializing UDP socket:', err);
      return false;
    }
  }

  public stopListening(): void {
    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
      this.socket = null;
    }
    this.isListening = false;
    console.log('[UDP Discovery] Stopped listening.');
  }

  public subscribe(callback: ServerDiscoveredCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(server: DiscoveredServer): void {
    for (const listener of this.listeners) {
      listener(server);
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const udpDiscoveryService = new UdpDiscoveryService();
