import { randomUUID } from "node:crypto";
import { readJsonSync, writeJsonAtomicSync } from "./jsonFile";
import { USERS_FILE, INVITE_INDEX_FILE } from "./paths";
import type { PublicUser } from "shared";

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
}

interface UsersFile {
  byId: Record<string, StoredUser>;
  usernameIndex: Record<string, string>;
}

let usersCache: UsersFile | null = null;
let inviteIndexCache: Record<string, string> | null = null;

function loadUsers(): UsersFile {
  if (!usersCache) {
    usersCache = readJsonSync<UsersFile>(USERS_FILE, { byId: {}, usernameIndex: {} });
  }
  return usersCache;
}

function persistUsers(): void {
  if (usersCache) writeJsonAtomicSync(USERS_FILE, usersCache);
}

export function resetUserStoreCache(): void {
  usersCache = null;
  inviteIndexCache = null;
}

export function findUserByUsername(username: string): StoredUser | null {
  const users = loadUsers();
  const id = users.usernameIndex[username.toLowerCase()];
  return id ? users.byId[id] ?? null : null;
}

export function findUserById(id: string): StoredUser | null {
  return loadUsers().byId[id] ?? null;
}

export function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, username: user.username };
}

export function createUser(username: string, passwordHash: string): StoredUser {
  const users = loadUsers();
  const key = username.toLowerCase();
  if (users.usernameIndex[key]) {
    throw new Error("USERNAME_TAKEN");
  }
  const user: StoredUser = {
    id: randomUUID(),
    username,
    passwordHash,
    createdAt: Date.now(),
  };
  users.byId[user.id] = user;
  users.usernameIndex[key] = user.id;
  persistUsers();
  return user;
}

function loadInviteIndex(): Record<string, string> {
  if (!inviteIndexCache) {
    inviteIndexCache = readJsonSync<Record<string, string>>(INVITE_INDEX_FILE, {});
  }
  return inviteIndexCache;
}

export function resolveInviteCode(code: string): string | null {
  return loadInviteIndex()[code.toUpperCase()] ?? null;
}

export function registerInviteCode(code: string, siteId: string): void {
  const index = loadInviteIndex();
  index[code.toUpperCase()] = siteId;
  writeJsonAtomicSync(INVITE_INDEX_FILE, index);
}
