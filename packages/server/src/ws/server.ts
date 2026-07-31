import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "node:http";
import { clientMessage } from "shared";
import { verifyUserToken } from "../middleware/auth";
import { getUserSiteId } from "../store/membershipStore";
import { joinRoom, leaveRoom, sendTo } from "./roomManager";
import { buildSyncState } from "./sync";
import { handlePuzzleTokensEarned, handlePuzzleSaveProgress } from "./handlers/puzzle";
import { handleDigClearTile, handleDigNextSector } from "./handlers/dig";
import { handleMantleSwapRelic } from "./handlers/mantle";
import type { ConnMeta } from "./connMeta";

const connMeta = new WeakMap<WebSocket, ConnMeta>();

export function attachWebSocketServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (socket) => {
    socket.on("message", (raw) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw.toString());
      } catch {
        sendTo(socket, { type: "error", code: "INVALID_JSON", message: "Message must be valid JSON" });
        return;
      }

      const meta = connMeta.get(socket);

      if (!meta) {
        if ((parsed as { type?: string })?.type !== "hello") {
          sendTo(socket, { type: "error", code: "HELLO_REQUIRED", message: "Send a hello message first" });
          return;
        }
        const token = (parsed as { token?: unknown }).token;
        const userId = typeof token === "string" ? verifyUserToken(token) : null;
        if (!userId) {
          sendTo(socket, { type: "error", code: "UNAUTHORIZED", message: "Invalid or expired token" });
          socket.close();
          return;
        }
        const siteId = getUserSiteId(userId);
        if (!siteId) {
          sendTo(socket, { type: "error", code: "NOT_IN_SITE", message: "Join a family site first" });
          socket.close();
          return;
        }
        const newMeta: ConnMeta = { userId, siteId };
        connMeta.set(socket, newMeta);
        joinRoom(siteId, socket);
        sendTo(socket, buildSyncState(siteId));
        return;
      }

      const result = clientMessage.safeParse(parsed);
      if (!result.success) {
        sendTo(socket, { type: "error", code: "INVALID_MESSAGE", message: "Malformed or unknown message" });
        return;
      }

      const msg = result.data;
      switch (msg.type) {
        case "sync:request":
          sendTo(socket, buildSyncState(meta.siteId));
          break;
        case "puzzle:tokens_earned":
          handlePuzzleTokensEarned(meta, msg);
          break;
        case "puzzle:save_progress":
          handlePuzzleSaveProgress(meta, msg);
          break;
        case "dig:clear_tile":
          handleDigClearTile(socket, meta, msg);
          break;
        case "dig:next_sector":
          handleDigNextSector(socket, meta, msg);
          break;
        case "mantle:swap_relic":
          handleMantleSwapRelic(socket, meta, msg);
          break;
      }
    });

    socket.on("close", () => {
      const meta = connMeta.get(socket);
      if (meta) leaveRoom(meta.siteId, socket);
    });
  });

  return wss;
}
