import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../types';

const STORAGE_KEY = 'devnotes_notes';

function loadFromStorage(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

function saveToStorage(notes: Note[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(notes);
  }, [notes]);

  const addNote = useCallback(
    (data: Omit<Note, 'id' | 'createdAt'>) => {
      const newNote: Note = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    },
    []
  );

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateNote = useCallback((id: string, data: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
  }, []);

  return { notes, addNote, deleteNote, updateNote };
}
