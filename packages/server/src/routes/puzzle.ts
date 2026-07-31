import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { getPuzzleProgress } from "../store/puzzleProgressStore";

const router = Router();

router.use(requireAuth);

router.get("/progress", (req: AuthedRequest, res) => {
  res.json({ progress: getPuzzleProgress(req.userId!) });
});

export default router;
