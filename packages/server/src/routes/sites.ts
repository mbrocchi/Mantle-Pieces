import { Router } from "express";
import { customAlphabet } from "nanoid";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { createEmptySiteState, getSite, putSite, mutateSite } from "../store/siteState";
import { getUserSiteId, setUserSiteId } from "../store/membershipStore";
import { resolveInviteCode, registerInviteCode, findUserById } from "../store/userStore";

const router = Router();

// Excludes visually ambiguous characters (0/O, 1/I) so codes are easy to read aloud/type.
const codeAlphabet = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);

function generateUniqueInviteCode(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = `MANTLE-${codeAlphabet()}`;
    if (!resolveInviteCode(code)) return code;
  }
  throw new Error("Failed to generate a unique invite code");
}

router.use(requireAuth);

router.post("/", (req: AuthedRequest, res) => {
  const userId = req.userId!;
  if (getUserSiteId(userId)) {
    res.status(409).json({ error: "ALREADY_IN_SITE", message: "You're already part of a family site." });
    return;
  }

  const user = findUserById(userId)!;
  const inviteCode = generateUniqueInviteCode();
  const site = createEmptySiteState(inviteCode);
  site.members.push({ userId, username: user.username, joinedAt: Date.now() });

  putSite(site);
  registerInviteCode(inviteCode, site.id);
  setUserSiteId(userId, site.id);

  res.status(201).json({ site });
});

router.post("/join", (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const { code } = req.body ?? {};

  if (getUserSiteId(userId)) {
    res.status(409).json({ error: "ALREADY_IN_SITE", message: "You're already part of a family site." });
    return;
  }
  if (typeof code !== "string" || !code.trim()) {
    res.status(400).json({ error: "INVALID_INPUT", message: "Invite code is required." });
    return;
  }

  const siteId = resolveInviteCode(code.trim());
  if (!siteId) {
    res.status(404).json({ error: "INVALID_CODE", message: "No family site found for that invite code." });
    return;
  }

  const user = findUserById(userId)!;
  const site = mutateSite(siteId, (s) => {
    if (!s.members.some((m) => m.userId === userId)) {
      s.members.push({ userId, username: user.username, joinedAt: Date.now() });
    }
  });
  setUserSiteId(userId, siteId);

  res.json({ site });
});

router.get("/mine", (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const siteId = getUserSiteId(userId);
  if (!siteId) {
    res.status(404).json({ error: "NOT_IN_SITE", message: "You haven't joined a family site yet." });
    return;
  }
  const site = getSite(siteId);
  if (!site) {
    res.status(404).json({ error: "NOT_IN_SITE", message: "Your family site could not be found." });
    return;
  }
  res.json({ site });
});

export default router;
