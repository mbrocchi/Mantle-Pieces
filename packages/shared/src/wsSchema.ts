import { z } from "zod";
import { GEM_COLORS } from "./constants";

// ---- Client -> Server ----

export const helloMessage = z.object({
  type: z.literal("hello"),
  token: z.string(),
});

export const syncRequestMessage = z.object({
  type: z.literal("sync:request"),
});

/** Sent once per closed-loop clear (or level clear) so the shared wallet updates live across every connected family member. */
export const puzzleTokensEarnedMessage = z.object({
  type: z.literal("puzzle:tokens_earned"),
  amount: z.number().int().positive(),
  reason: z.enum(["loop_bonus", "level_clear"]),
});

export const digClearTileMessage = z.object({
  type: z.literal("dig:clear_tile"),
  sectorIndex: z.number().int().nonnegative(),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
});

export const digNextSectorMessage = z.object({
  type: z.literal("dig:next_sector"),
});

export const mantleSwapRelicMessage = z.object({
  type: z.literal("mantle:swap_relic"),
  slotIndex: z.number().int().min(0),
  incomingRelicPlacementId: z.string(),
});

/** Sent after every puzzle move/retry/advance so the player's board survives a refresh. */
export const puzzleSaveProgressMessage = z.object({
  type: z.literal("puzzle:save_progress"),
  levelNumber: z.number().int().positive(),
  movesLimit: z.number().int().positive(),
  movesUsed: z.number().int().nonnegative(),
  objectives: z.array(
    z.object({
      color: z.enum(GEM_COLORS),
      target: z.number().int(),
      cleared: z.number().int(),
    })
  ),
  grid: z.array(z.array(z.object({ id: z.string(), color: z.enum(GEM_COLORS) }))),
});

export const clientMessage = z.discriminatedUnion("type", [
  helloMessage,
  syncRequestMessage,
  puzzleTokensEarnedMessage,
  digClearTileMessage,
  digNextSectorMessage,
  mantleSwapRelicMessage,
  puzzleSaveProgressMessage,
]);

export type ClientMessage = z.infer<typeof clientMessage>;

// ---- Server -> Client ----
// Note: none of these payloads carry a userId/actor field, by design.

export interface WalletUpdateEvent {
  type: "wallet:update";
  balance: number;
}

export interface DigTileClearedEvent {
  type: "dig:tile_cleared";
  sectorIndex: number;
  x: number;
  y: number;
}

export interface RelicUnlockedEvent {
  type: "relic:unlocked";
  relicPlacementId: string;
  relicTypeId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SectorCompletedEvent {
  type: "sector:completed";
  sectorIndex: number;
}

export interface SectorNewEvent {
  type: "sector:new";
  sector: unknown; // DigSector, kept loose here to avoid a circular import
}

export interface MantleSwapRequiredEvent {
  type: "mantle:swap_required";
  pendingRelicPlacementId: string;
}

export interface MantleUpdatedEvent {
  type: "mantle:updated";
  slots: (string | null)[];
  archive: { relicPlacementId: string; archivedAt: number }[];
}

export interface NoteAddedEvent {
  type: "note:added";
  relicPlacementId: string;
  noteId: string;
  noteType: "text" | "audio";
}

export interface SyncStateEvent {
  type: "sync:state";
  state: unknown; // SiteState (public projection), kept loose to avoid circular import
}

export interface ErrorEvent {
  type: "error";
  code: string;
  message: string;
}

export type ServerMessage =
  | WalletUpdateEvent
  | DigTileClearedEvent
  | RelicUnlockedEvent
  | SectorCompletedEvent
  | SectorNewEvent
  | MantleSwapRequiredEvent
  | MantleUpdatedEvent
  | NoteAddedEvent
  | SyncStateEvent
  | ErrorEvent;
