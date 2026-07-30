import { appendJsonlSync } from "./jsonFile";
import { ledgerFilePath } from "./paths";

/**
 * Append-only, server-only research ledger. `actorUserId` is written here and
 * ONLY here for gameplay economy events — never on SiteState, never in a WS
 * broadcast payload, never in a REST response. This file is the sole place an
 * individual's contribution is recorded, satisfying the "no individual score
 * ever visible" research constraint structurally rather than by convention.
 */
export function appendLedgerEntry(
  siteId: string,
  entry: { delta: number; reason: string; actorUserId: string }
): void {
  appendJsonlSync(ledgerFilePath(siteId), { ts: Date.now(), ...entry });
}
