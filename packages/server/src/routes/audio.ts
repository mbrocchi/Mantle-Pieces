import { Router } from "express";
import path from "node:path";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { getUserSiteId } from "../store/membershipStore";
import { UPLOADS_DIR } from "../store/paths";

const router = Router();
router.use(requireAuth);

const SAFE_FILENAME = /^[a-f0-9-]+\.webm$/i;

router.get("/:siteId/:filename", (req: AuthedRequest, res) => {
  const mySiteId = getUserSiteId(req.userId!);
  if (!mySiteId || mySiteId !== req.params.siteId) {
    res.status(403).json({ error: "FORBIDDEN", message: "That recording does not belong to your family site" });
    return;
  }
  if (!SAFE_FILENAME.test(req.params.filename)) {
    res.status(400).json({ error: "INVALID_FILENAME" });
    return;
  }

  const filePath = path.join(UPLOADS_DIR, req.params.siteId, req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ error: "NOT_FOUND" });
  });
});

export default router;
