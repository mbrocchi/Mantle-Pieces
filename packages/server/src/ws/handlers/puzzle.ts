import { mutateSite } from "../../store/siteState";
import { appendLedgerEntry } from "../../store/ledger";
import { savePuzzleProgress } from "../../store/puzzleProgressStore";
import { broadcast } from "../roomManager";
import type { ConnMeta } from "../connMeta";
import type { z } from "zod";
import type { puzzleTokensEarnedMessage, puzzleSaveProgressMessage } from "shared";

type PuzzleTokensEarnedMessage = z.infer<typeof puzzleTokensEarnedMessage>;
type PuzzleSaveProgressMessage = z.infer<typeof puzzleSaveProgressMessage>;

export function handlePuzzleTokensEarned(meta: ConnMeta, msg: PuzzleTokensEarnedMessage): void {
  const site = mutateSite(meta.siteId, (s) => {
    s.wallet.balance += msg.amount;
  });
  if (!site) return;

  appendLedgerEntry(meta.siteId, {
    delta: msg.amount,
    reason: msg.reason,
    actorUserId: meta.userId,
  });

  broadcast(meta.siteId, { type: "wallet:update", balance: site.wallet.balance });
}

export function handlePuzzleSaveProgress(meta: ConnMeta, msg: PuzzleSaveProgressMessage): void {
  savePuzzleProgress(meta.userId, {
    levelNumber: msg.levelNumber,
    movesLimit: msg.movesLimit,
    movesUsed: msg.movesUsed,
    objectives: msg.objectives,
    grid: msg.grid,
  });
}
