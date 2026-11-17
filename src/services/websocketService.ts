export type WsEventListener = (type: string, payload: any) => void;

class MobileWebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Set<WsEventListener> = new Set();
  private isExplicitlyClosed = false;
  private currentIp: string = '';
  private currentPort: number = 5000;
  private reconnectTimer: any = null;

  public connect(ip: string, port = 5000): void {
    this.currentIp = ip;
    this.currentPort = port;
    this.isExplicitlyClosed = false;

    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
    }

    try {
      const wsUrl = `ws://${ip}:${port}/ws`;
      console.log(`[Mobile WS] Connecting to ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Mobile WS] Connected to Desktop Host');
        this.notify('CONNECTED', { ip, port });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type) {
            this.notify(data.type, data.payload);
          }
        } catch {}
      };

      this.ws.onclose = () => {
        console.log('[Mobile WS] Connection closed');
        this.notify('DISCONNECTED', null);
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[Mobile WS] Error:', err);
      };
    } catch (err) {
      console.warn('[Mobile WS] Init error:', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (!this.isExplicitlyClosed && this.currentIp) {
        console.log('[Mobile WS] Reconnecting...');
        this.connect(this.currentIp, this.currentPort);
      }
    }, 4000);
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }

  public subscribe(listener: WsEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(type: string, payload: any): void {
    for (const listener of this.listeners) {
      listener(type, payload);
    }
  }
}

export const mobileWsService = new MobileWebSocketService();
