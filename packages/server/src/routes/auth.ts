import { Router } from "express";
import bcrypt from "bcryptjs";
import { createUser, findUserById, findUserByUsername, toPublicUser } from "../store/userStore";
import { requireAuth, signUserToken, type AuthedRequest } from "../middleware/auth";

const router = Router();

function validateCredentials(username: unknown, password: unknown): string | null {
  if (typeof username !== "string" || username.trim().length < 3 || username.trim().length > 24) {
    return "Username must be 3-24 characters.";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    return "Username may only contain letters, numbers, and underscores.";
  }
  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

router.post("/register", (req, res) => {
  const { username, password } = req.body ?? {};
  const validationError = validateCredentials(username, password);
  if (validationError) {
    res.status(400).json({ error: "INVALID_INPUT", message: validationError });
    return;
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = createUser(username.trim(), passwordHash);
    const token = signUserToken(user.id);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    if (err instanceof Error && err.message === "USERNAME_TAKEN") {
      res.status(409).json({ error: "USERNAME_TAKEN", message: "That username is already taken." });
      return;
    }
    throw err;
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "INVALID_INPUT", message: "Username and password are required." });
    return;
  }

  const user = findUserByUsername(username.trim());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Incorrect username or password." });
    return;
  }

  const token = signUserToken(user.id);
  res.json({ token, user: toPublicUser(user) });
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  const user = findUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  res.json({ user: toPublicUser(user) });
});

export default router;
