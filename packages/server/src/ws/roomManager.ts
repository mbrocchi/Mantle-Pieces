import type { WebSocket } from "ws";
import type { ServerMessage } from "shared";

const rooms = new Map<string, Set<WebSocket>>();

export function joinRoom(siteId: string, socket: WebSocket): void {
  let room = rooms.get(siteId);
  if (!room) {
    room = new Set();
    rooms.set(siteId, room);
  }
  room.add(socket);
}

export function leaveRoom(siteId: string, socket: WebSocket): void {
  const room = rooms.get(siteId);
  if (!room) return;
  room.delete(socket);
  if (room.size === 0) rooms.delete(siteId);
}

export function broadcast(siteId: string, message: ServerMessage): void {
  const room = rooms.get(siteId);
  if (!room) return;
  const payload = JSON.stringify(message);
  for (const socket of room) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}

export function sendTo(socket: WebSocket, message: ServerMessage): void {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message));
}
