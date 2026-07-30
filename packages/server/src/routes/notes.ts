import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { getUserSiteId } from "../store/membershipStore";
import { getSite, mutateSite } from "../store/siteState";
import { findUserById } from "../store/userStore";
import { UPLOADS_DIR } from "../store/paths";
import { broadcast } from "../ws/roomManager";
import type { RelicNote } from "shared";

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const siteId = getUserSiteId((req as AuthedRequest).userId!);
      const dir = path.join(UPLOADS_DIR, siteId ?? "unknown");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, _file, cb) => cb(null, `${randomUUID()}.webm`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB cap on family voice notes
});

router.post("/:relicPlacementId/notes", upload.single("audio"), (req: AuthedRequest, res) => {
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

  const user = findUserById(userId)!;
  const isAudio = !!req.file;
  const textContent = typeof req.body?.textContent === "string" ? req.body.textContent.trim() : "";

  if (!isAudio && !textContent) {
    res.status(400).json({ error: "EMPTY_NOTE", message: "Write something or record a message" });
    return;
  }

  const note: RelicNote = {
    id: randomUUID(),
    authorUserId: userId,
    authorUsername: user.username,
    type: isAudio ? "audio" : "text",
    textContent: isAudio ? null : textContent,
    audioPath: isAudio ? `${siteId}/${req.file!.filename}` : null,
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
