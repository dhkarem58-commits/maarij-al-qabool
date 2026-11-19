import type { StudyEditionData } from '../types/edition';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PendingSyncEntry {
  uid: string;
  edition: StudyEditionData;
  queuedAtMs: number;
}

const DRAFT_PREFIX = 'maarij_edition_draft_v1:';
const PENDING_QUEUE_KEY = 'maarij_pending_sync_queue_v1';

export function getBrowserStorage(): StorageLike | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function saveLocalDraft(
  storage: StorageLike | null,
  ownerKey: string,
  edition: StudyEditionData
): void {
  if (!storage) return;
  try {
    storage.setItem(`${DRAFT_PREFIX}${ownerKey}`, JSON.stringify(edition));
  } catch {
    // ignore storage quota errors gracefully
  }
}

export function loadLocalDraft(
  storage: StorageLike | null,
  ownerKey: string
): StudyEditionData | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(`${DRAFT_PREFIX}${ownerKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudyEditionData;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      uid: parsed.uid || ownerKey,
      displayName: parsed.displayName || 'طالب علم',
      bio: parsed.bio || '',
      isPublic: Boolean(parsed.isPublic),
      revision: typeof parsed.revision === 'number' ? parsed.revision : 0,
      topicOverrides: parsed.topicOverrides || {},
      questionOverrides: parsed.questionOverrides || {},
      addedQuestions: Array.isArray(parsed.addedQuestions) ? parsed.addedQuestions : [],
      updatedAtMs: parsed.updatedAtMs,
    };
  } catch {
    return null;
  }
}

export function clearLocalDraft(
  storage: StorageLike | null,
  ownerKey: string
): void {
  if (!storage) return;
  try {
    storage.removeItem(`${DRAFT_PREFIX}${ownerKey}`);
  } catch {
    // ignore
  }
}

function readQueueMap(
  storage: StorageLike | null
): Record<string, PendingSyncEntry> {
  if (!storage) return {};
  try {
    const raw = storage.getItem(PENDING_QUEUE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeQueueMap(
  storage: StorageLike | null,
  map: Record<string, PendingSyncEntry>
): void {
  if (!storage) return;
  try {
    if (Object.keys(map).length === 0) {
      storage.removeItem(PENDING_QUEUE_KEY);
    } else {
      storage.setItem(PENDING_QUEUE_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore
  }
}

export function enqueuePendingSync(
  storage: StorageLike | null,
  uid: string,
  edition: StudyEditionData
): PendingSyncEntry {
  const entry: PendingSyncEntry = {
    uid,
    edition: { ...edition, uid },
    queuedAtMs: Date.now(),
  };
  const map = readQueueMap(storage);
  map[uid] = entry;
  writeQueueMap(storage, map);
  saveLocalDraft(storage, uid, entry.edition);
  return entry;
}

export function getPendingSync(
  storage: StorageLike | null,
  uid: string
): PendingSyncEntry | null {
  const map = readQueueMap(storage);
  return map[uid] || null;
}

export function clearPendingSync(
  storage: StorageLike | null,
  uid: string
): void {
  const map = readQueueMap(storage);
  if (map[uid]) {
    delete map[uid];
    writeQueueMap(storage, map);
  }
}

export async function flushPendingSync(
  storage: StorageLike | null,
  uid: string,
  uploader: (edition: StudyEditionData) => Promise<void>
): Promise<{ flushed: boolean; error?: unknown }> {
  const pending = getPendingSync(storage, uid);
  if (!pending) {
    return { flushed: false };
  }
  try {
    await uploader(pending.edition);
    clearPendingSync(storage, uid);
    return { flushed: true };
  } catch (error) {
    return { flushed: false, error };
  }
}
