import { useState, useEffect, useCallback } from 'react';
import type { Group } from '../types';

const STORAGE_KEY = 'devnotes_groups';

function load(): Group[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Group[]) : [];
  } catch {
    return [];
  }
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>(() => load());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const addGroup = useCallback((name: string): string => {
    const id = crypto.randomUUID();
    setGroups((prev) => [
      { id, name: name.trim(), noteIds: [], createdAt: new Date().toISOString() },
      ...prev,
    ]);
    return id;
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const renameGroup = useCallback((id: string, name: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name: name.trim() } : g))
    );
  }, []);

  const toggleNoteInGroup = useCallback((groupId: string, noteId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const has = g.noteIds.includes(noteId);
        return {
          ...g,
          noteIds: has
            ? g.noteIds.filter((id) => id !== noteId)
            : [...g.noteIds, noteId],
        };
      })
    );
  }, []);

  const removeNoteFromAllGroups = useCallback((noteId: string) => {
    setGroups((prev) =>
      prev.map((g) => ({ ...g, noteIds: g.noteIds.filter((id) => id !== noteId) }))
    );
  }, []);

  return {
    groups,
    addGroup,
    deleteGroup,
    renameGroup,
    toggleNoteInGroup,
    removeNoteFromAllGroups,
  };
}
