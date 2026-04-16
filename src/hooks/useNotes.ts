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
    (data: Omit<Note, 'id' | 'createdAt'>): string => {
      const newNote: Note = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      return newNote.id;
    },
    []
  );

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateNote = useCallback((id: string, data: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
  }, []);

  const exportNotes = useCallback(() => {
    const json = JSON.stringify(notes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `saridefter-notlar-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const importNotes = useCallback(
    (file: File, mode: 'merge' | 'replace'): Promise<number> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(e.target?.result as string) as unknown[];
            if (!Array.isArray(parsed)) throw new Error('Geçersiz format');

            const valid = parsed.filter(
              (item): item is Note =>
                typeof item === 'object' &&
                item !== null &&
                typeof (item as Note).id === 'string' &&
                typeof (item as Note).title === 'string' &&
                typeof (item as Note).tag === 'string'
            );

            if (valid.length === 0) throw new Error('Geçerli not bulunamadı');

            setNotes((prev) => {
              if (mode === 'replace') return valid;
              const existingIds = new Set(prev.map((n) => n.id));
              const incoming = valid.filter((n) => !existingIds.has(n.id));
              return [...incoming, ...prev];
            });

            resolve(valid.length);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsText(file);
      });
    },
    []
  );

  const toggleHidden = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, hidden: !n.hidden } : n))
    );
  }, []);

  return { notes, addNote, deleteNote, updateNote, exportNotes, importNotes, toggleHidden };
}
