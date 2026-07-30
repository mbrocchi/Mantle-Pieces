import type { GEM_COLORS, RELIC_TIERS } from "./constants";

export type GemColor = (typeof GEM_COLORS)[number];
export type RelicTier = (typeof RELIC_TIERS)[number];

export interface RelicType {
  id: string;
  vaultThemeIndex: number;
  tier: RelicTier;
  name: string;
  loreText: string;
  artAssetKey: string;
  w: number;
  h: number;
}

export interface RelicPlacement {
  id: string;
  relicTypeId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  unlockedAt: number | null;
}

export interface DigSector {
  index: number;
  width: number;
  height: number;
  tilesClearedBase64: string;
  relicPlacements: RelicPlacement[];
  createdAt: number;
  completedAt: number | null;
}

export interface MantleState {
  slots: (string | null)[]; // length VAULT_SLOTS, values are relicPlacementId
  archive: { relicPlacementId: string; archivedAt: number }[];
  /** FIFO queue, front = the swap currently shown to family members. Queued (not overwritten) so a
   *  burst of unlocks while the vault is full never silently drops an earlier relic's swap prompt. */
  pendingSwapQueue: string[];
}

export interface RelicNote {
  id: string;
  authorUserId: string;
  authorUsername: string;
  type: "text" | "audio";
  textContent: string | null;
  audioPath: string | null;
  createdAt: number;
}

export interface SiteMember {
  userId: string;
  username: string;
  joinedAt: number;
}

export interface SiteState {
  id: string;
  inviteCode: string;
  createdAt: number;
  members: SiteMember[];
  wallet: { balance: number };
  currentVaultThemeIndex: number;
  currentSectorIndex: number;
  sector: DigSector;
  /** Every relic ever unlocked, keyed by relicPlacementId — survives sector replacement so the
   *  Mantlepiece/Archive can always resolve a relic's type/footprint after its origin sector is gone. */
  collectedRelics: Record<string, RelicPlacement>;
  mantle: MantleState;
  relicNotes: Record<string, RelicNote[]>;
}

export interface PublicUser {
  id: string;
  username: string;
}

export interface PuzzleObjective {
  color: GemColor;
  target: number;
  cleared: number;
}
