import { Router } from "express";
import { randomUUID } from "node:crypto";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { getUserSiteId } from "../store/membershipStore";
import { getSite, mutateSite } from "../store/siteState";
import { findUserById } from "../store/userStore";
import { broadcast } from "../ws/roomManager";
import type { RelicNote } from "shared";

const router = Router();
router.use(requireAuth);

router.post("/:relicPlacementId/notes", (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const siteId = getUserSiteId(userId);
  if (!siteId) {
    res.status(404).json({ error: "NOT_IN_SITE", message: "Join a family site first" });
    return;
  }
  const site = getSite(siteId);
  if (!site) {
    res.status(404).json({ error: "NOT_IN_SITE", message: "Your family site could not be found" });
    return;
  }

  const { relicPlacementId } = req.params;
  if (!site.collectedRelics[relicPlacementId]) {
    res.status(404).json({ error: "UNKNOWN_RELIC", message: "That relic hasn't been discovered by your family yet" });
    return;
  }

  const textContent = typeof req.body?.textContent === "string" ? req.body.textContent.trim() : "";
  if (!textContent) {
    res.status(400).json({ error: "EMPTY_NOTE", message: "Write something" });
    return;
  }

  const user = findUserById(userId)!;
  const note: RelicNote = {
    id: randomUUID(),
    authorUserId: userId,
    authorUsername: user.username,
    type: "text",
    textContent,
    createdAt: Date.now(),
  };

  const updated = mutateSite(siteId, (s) => {
    if (!s.relicNotes[relicPlacementId]) s.relicNotes[relicPlacementId] = [];
    s.relicNotes[relicPlacementId].push(note);
  });
  if (!updated) {
    res.status(500).json({ error: "SITE_UPDATE_FAILED" });
    return;
  }

  broadcast(siteId, { type: "note:added", relicPlacementId, noteId: note.id, noteType: note.type });
  res.status(201).json({ note });
});

export default router;
