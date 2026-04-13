import React from 'react';
import { Trash2, ChevronDown, Pencil } from 'lucide-react';
import type { Note } from '../types';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
}

function getTagStyle(): { bg: string; color: string } {
  return { bg: 'var(--accent)', color: 'var(--btn-text)' };
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onEdit, onView }) => {
  const tagStyle = getTagStyle();
  const dateStr = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span
            className={styles.tag}
            style={{ background: tagStyle.bg, color: tagStyle.color }}
          >
            {note.tag || 'Genel'}
          </span>
          <span className={styles.date}>{dateStr}</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.actionBtn}
            onClick={() => onEdit(note)}
            aria-label="Notu düzenle"
            title="Notu düzenle"
          >
            <Pencil size={15} />
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(note.id)}
            aria-label="Notu sil"
            title="Notu sil"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h2 className={styles.title}>{note.title}</h2>

      {note.description && (
        <p className={styles.description}>{note.description}</p>
      )}

      {note.codeSnippet && (
        <div className={styles.codeWrapper}>
          <div className={styles.codeHeader}>
            <span className={styles.codeDots}>
              <span />
              <span />
              <span />
            </span>
            <span className={styles.codeLang}>{note.tag || 'kod'}</span>
          </div>
          <pre className={styles.code}>
            <code>{note.codeSnippet}</code>
          </pre>
          {note.codeSnippet.split('\n').length > 8 && (
            <button
              className={`${styles.expandBtn} with-icon`}
              onClick={() => onView(note)}
            >
              <ChevronDown size={16} /> Tamamını Gör
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default NoteCard;
