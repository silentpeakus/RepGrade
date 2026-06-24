import AsyncStorage from '@react-native-async-storage/async-storage';

export type SessionRecord = {
  id: string;
  date: string;           // ISO string
  exercise: string;
  exerciseLabel: string;
  grade: string;
  gpa: number | null;
  reps: number;
  cues: string[];
  issues: string[];
};

const STORAGE_KEY = 'repgrade_sessions';

export async function saveSessions(sessions: SessionRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export async function loadSessions(): Promise<SessionRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function addSession(session: Omit<SessionRecord, 'id' | 'date'>): Promise<SessionRecord[]> {
  const existing = await loadSessions();
  const record: SessionRecord = {
    ...session,
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    date: new Date().toISOString(),
  };
  const updated = [record, ...existing];
  await saveSessions(updated);
  return updated;
}

export function lifetimeGpa(sessions: SessionRecord[]): number | null {
  const withGpa = sessions.filter((s) => s.gpa !== null);
  if (withGpa.length === 0) return null;
  return Math.round((withGpa.reduce((sum, s) => sum + s.gpa!, 0) / withGpa.length) * 100) / 100;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
