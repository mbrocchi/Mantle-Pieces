import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./store/paths";

function loadOrCreateDevSecret(): string {
  const secretFile = path.join(DATA_DIR, ".jwt-secret");
  try {
    return fs.readFileSync(secretFile, "utf-8").trim();
  } catch {
    const secret = randomBytes(32).toString("hex");
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(secretFile, secret, "utf-8");
    return secret;
  }
}

// Set JWT_SECRET in the environment for any real deployment. The dev fallback
// is persisted to data/.jwt-secret so it survives `tsx watch` restarts instead
// of invalidating every session on each file save.
export const JWT_SECRET = process.env.JWT_SECRET ?? loadOrCreateDevSecret();

export const PORT = Number(process.env.PORT ?? 3001);
