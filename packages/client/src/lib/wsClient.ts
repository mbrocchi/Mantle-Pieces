import type { ClientMessage, ServerMessage } from "shared";

type Listener = (msg: ServerMessage) => void;

class WsClient {
  private socket: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private token: string | null = null;
  private reconnectDelay = 1000;
  private manualClose = false;

  connect(token: string): void {
    this.token = token;
    this.manualClose = false;
    this.open();
  }

  disconnect(): void {
    this.manualClose = true;
    this.socket?.close();
    this.socket = null;
  }

  send(msg: ClientMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    }
  }

  on(type: ServerMessage["type"], listener: Listener): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  private open(): void {
    if (!this.token) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws`);
    this.socket = ws;

    ws.onopen = () => {
      this.reconnectDelay = 1000;
      this.send({ type: "hello", token: this.token! });
    };

    ws.onmessage = (event) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      this.listeners.get(msg.type)?.forEach((l) => l(msg));
    };

    ws.onclose = () => {
      if (this.manualClose) return;
      setTimeout(() => this.open(), this.reconnectDelay);
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 15000);
    };
  }
}

export const wsClient = new WsClient();
