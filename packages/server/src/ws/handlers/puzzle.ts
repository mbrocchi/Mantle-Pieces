import { mutateSite } from "../../store/siteState";
import { appendLedgerEntry } from "../../store/ledger";
import { broadcast } from "../roomManager";
import type { ConnMeta } from "../connMeta";
import type { z } from "zod";
import type { puzzleTokensEarnedMessage } from "shared";

type PuzzleTokensEarnedMessage = z.infer<typeof puzzleTokensEarnedMessage>;

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
