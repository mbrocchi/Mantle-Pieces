import { getSite } from "../store/siteState";
import type { SyncStateEvent } from "shared";

export function buildSyncState(siteId: string): SyncStateEvent {
  return { type: "sync:state", state: getSite(siteId) };
}
