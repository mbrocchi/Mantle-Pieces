import { Router } from "express";
import fs from "node:fs";
import { DATA_DIR, UPLOADS_DIR } from "../store/paths";
import { resetUserStoreCache } from "../store/userStore";
import { resetSiteCache } from "../store/siteState";
import { resetPuzzleProgressCache } from "../store/puzzleProgressStore";
import { resetMembershipCache } from "../store/membershipStore";
import { closeAllSockets } from "../ws/server";

const router = Router();

// Deliberately unauthenticated: this must be reachable from the signed-out
// title screen too, so it can act as an emergency "start fresh" reset.
router.post("/reset-all-data", (_req, res) => {
  closeAllSockets();
  fs.rmSync(DATA_DIR, { recursive: true, force: true });
  fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
  resetUserStoreCache();
  resetSiteCache();
  resetPuzzleProgressCache();
  resetMembershipCache();
  res.json({ ok: true });
});

export default router;
