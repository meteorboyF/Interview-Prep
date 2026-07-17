import { writable } from 'svelte/store';

export interface NavState {
  view: 'home' | 'explorer' | 'playground' | 'lesson';
  lessonId?: string;
  tableName?: string;
}

export const nav = writable<NavState>({ view: 'home' });

/** SQL that the playground editor should adopt (set by explorer / lessons). */
export const playgroundSql = writable<string>('');

export function openInPlayground(sql: string) {
  playgroundSql.set(sql);
  nav.set({ view: 'playground' });
}

export function openTable(tableName: string) {
  nav.set({ view: 'explorer', tableName });
}
