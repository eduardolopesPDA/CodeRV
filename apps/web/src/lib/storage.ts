export interface DraftState {
  code: string;
  language: string;
  depth: string;
  categories: string[];
  filePath?: string;
}

export interface LocalAnalysisEntry {
  id: string;
  createdAt: string;
  language: string;
  depth: string;
}

export const draftKey = (projectId: string) => `coderv:draft:${projectId}`;
export const historyKey = (projectId: string) => `coderv:history:${projectId}`;
export const lastAnalysisKey = (projectId: string) =>
  `coderv:last-analysis:${projectId}`;

export function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota ou modo privado — degrada silenciosamente */
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export function readDraft(projectId: string): DraftState | null {
  return readJson<DraftState>(draftKey(projectId));
}

export function writeDraft(projectId: string, draft: DraftState): void {
  writeJson(draftKey(projectId), draft);
}

export function clearDraft(projectId: string): void {
  removeKey(draftKey(projectId));
}

const HISTORY_LIMIT = 25;

export function readHistory(projectId: string): LocalAnalysisEntry[] {
  return readJson<LocalAnalysisEntry[]>(historyKey(projectId)) ?? [];
}

export function pushHistory(
  projectId: string,
  entry: LocalAnalysisEntry,
): LocalAnalysisEntry[] {
  const current = readHistory(projectId).filter((item) => item.id !== entry.id);
  const next = [entry, ...current].slice(0, HISTORY_LIMIT);
  writeJson(historyKey(projectId), next);
  return next;
}
